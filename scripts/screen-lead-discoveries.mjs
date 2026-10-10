import { appendFile, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { screenDiscoveryBatch, recheckDiscoveryBatch } from '../src/lib/leadDiscoveryScreening.ts'
import { marketExtendedApplications, publicLeads, targetCompanyTypes, tdsVerifiedApplications } from '../src/lib/productMarketMap.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const queuePath = resolve(root, 'research/lead-discovery-queue.ndjson')
const args = process.argv.slice(2)
if (args.includes('--help') || args.length === 0) {
  console.log('Usage: pnpm leads:screen --input <batch.json> [--recheck] [--save]')
  console.log('Dry-run by default. --save appends only non-excluded, non-duplicate discoveries to the private research queue; it never writes to the customer map or CRM.')
  process.exit(0)
}

const inputFlag = args.indexOf('--input')
if (inputFlag < 0 || !args[inputFlag + 1]) throw new Error('Provide --input <batch.json>.')
if (args.some((arg) => arg.startsWith('--') && !['--input', '--save', '--recheck'].includes(arg))) throw new Error('Unknown option.')
const inputPath = resolve(process.cwd(), args[inputFlag + 1])
const incoming = JSON.parse(await readFile(inputPath, 'utf8'))
if (!Array.isArray(incoming)) throw new Error('Input must be a JSON array of discovery records.')

let queue = []
try {
  const lines = (await readFile(queuePath, 'utf8')).split(/\r?\n/).filter(Boolean)
  queue = lines.map((line) => JSON.parse(line))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const references = {
  leads: publicLeads,
  queue,
  tdsApplications: tdsVerifiedApplications,
  marketExtensions: marketExtendedApplications,
  targetTypes: targetCompanyTypes,
}
const rechecked = args.includes('--recheck') ? recheckDiscoveryBatch(incoming, references) : null
const results = rechecked ? rechecked.results : screenDiscoveryBatch(incoming, references)
const counts = Object.fromEntries([...new Set(results.map((item) => item.status))].map((status) =>
  [status, results.filter((item) => item.status === status).length]))
console.log(JSON.stringify({ input: inputPath, counts, results: results.map((item) => ({
  company: item.candidate?.companyName, productId: item.candidate?.productId,
  status: item.status, reasons: item.reasons, matchedCompany: item.matchedCompany,
})) }, null, 2))

if (args.includes('--save')) {
  if (rechecked) {
    await writeFile(queuePath, rechecked.queue.map((item) => JSON.stringify(item)).join('\n') + (rechecked.queue.length ? '\n' : ''), 'utf8')
    console.log(`Rechecked ${results.length} discoveries; research queue now has ${rechecked.queue.length} records. No public customer record was created.`)
    process.exit(0)
  }
  const retained = results.filter((item) => ['needs_evidence', 'possible_duplicate', 'ready_for_review'].includes(item.status))
  if (retained.length) {
    const screenedAt = new Date().toISOString()
    await appendFile(queuePath, retained.map((item) => JSON.stringify({ ...item, screenedAt })).join('\n') + '\n', 'utf8')
  }
  console.log(`Saved ${retained.length} discoveries to research queue. No customer, Lead, CRM, or public-map record was created.`)
}
