import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { publicLeads } from '../src/lib/productMarketMap.ts'

// Use repository history, never a review date or today's build date, as evidence.
const repo = path.resolve(process.argv[2] || '.')
const destination = 'src/lib/leadFirstRecorded.json'
const records = fs.existsSync(destination) ? JSON.parse(fs.readFileSync(destination, 'utf8')) : {}
const currentIds = new Set(publicLeads.map((lead) => lead.id))
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${repo.replaceAll('\\', '/')}`, '-C', repo, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })
try {
  const shallow = git('rev-parse', '--is-shallow-repository').trim() === 'true'
  if (shallow) throw new Error('Full repository history is required; existing dates preserved')
  const commits = git('log', '--reverse', '--format=%H|%cI', '--', 'src/lib/productMarketMap.ts').trim().split('\n').filter(Boolean)
  for (const commit of commits) {
    const [sha, recordedAt] = commit.split('|')
    const source = git('show', `${sha}:src/lib/productMarketMap.ts`)
    // Accept both hand-written TS and JSON-formatted raw lead records.
    // Current public IDs prevent unrelated application IDs or removed companies
    // from becoming public timeline entries.
    const pattern = /(?:\bid|['"]id['"])\s*:\s*['"]([^'"]+)['"]/g
    for (const match of source.matchAll(pattern)) {
      if (currentIds.has(match[1]) && (!records[match[1]] || !records[match[1]].commit)) records[match[1]] = { recordedAt, commit: sha }
    }
  }
  if (!commits.length) console.log('No repository history available; preserving recorded dates.')
} catch (error) {
  console.warn(`Lead timeline: ${error.message.split('\n')[0]}; dates without evidence remain unknown.`)
}
// Historical commits can contain companies since removed from public scope.
// Preserve first-appearance dates only for currently eligible public customers.
const currentRecords = Object.fromEntries(Object.entries(records).filter(([id]) => currentIds.has(id)).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(destination, JSON.stringify(currentRecords, null, 2) + '\n')
console.log(`Lead timeline: ${Object.keys(currentRecords).length} records for current public customers.`)
