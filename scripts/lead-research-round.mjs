import { mkdir, readFile, writeFile, rename, open, unlink, appendFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { publicLeads, marketExtendedApplications, targetCompanyTypes, tdsVerifiedApplications } from '../src/lib/productMarketMap.ts'
import { recheckDiscoveryBatch } from '../src/lib/leadDiscoveryScreening.ts'
import { jobFor, contactBacklog, nextContacts, validateContactFinding, roundCounts } from './lib/lead-research-state.mjs'

const root = resolve(import.meta.dirname, '..')
const research = resolve(root, 'research')
const privateRoot = resolve(research, 'private')
const statePath = resolve(privateRoot, 'state.json')
const queuePath = resolve(research, 'lead-discovery-queue.ndjson')
const lockPath = resolve(privateRoot, 'state.lock')
const refs = { leads: publicLeads, tdsApplications: tdsVerifiedApplications, marketExtensions: marketExtendedApplications, targetTypes: targetCompanyTypes }
const command = process.argv[2]
const readJson = async (path, fallback) => { try { return JSON.parse(await readFile(path, 'utf8')) } catch (error) { if (error.code === 'ENOENT') return fallback; throw error } }
const readQueue = async () => { try { return (await readFile(queuePath, 'utf8')).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)) } catch (error) { if (error.code === 'ENOENT') return []; throw error } }
const atomic = async (path, value) => { const temp = `${path}.${process.pid}.tmp`; await writeFile(temp, JSON.stringify(value, null, 2) + '\n'); await rename(temp, path) }
await mkdir(privateRoot, { recursive: true })
await mkdir(resolve(privateRoot, 'runs'), { recursive: true })

if (!['begin', 'finish', 'status'].includes(command)) throw new Error('Usage: node --experimental-strip-types scripts/lead-research-round.mjs begin | status | finish <round-results.json>')
if (command === 'status') { console.log(JSON.stringify(await readJson(statePath, { cursor: 0, activeRun: null, contacts: [] }), null, 2)); process.exit(0) }
let lock
try { lock = await open(lockPath, 'wx') } catch (error) { if (error.code === 'EEXIST') throw new Error('Research state is being updated; retry later.'); throw error }
try {
  const state = await readJson(statePath, { version: 1, cursor: 0, activeRun: null, contacts: [] })
  const now = new Date().toISOString()
  state.contacts = contactBacklog(publicLeads, state.contacts)
  if (command === 'begin') {
    if (state.activeRun && Date.parse(state.activeRun.leaseUntil) > Date.parse(now)) {
      console.log(JSON.stringify({ resumed: true, ...state.activeRun, instruction: '已有未完成轮次，请继续该轮，禁止另起重复搜索。' }, null, 2))
      process.exitCode = 0
    } else {
      if (state.activeRun) await atomic(resolve(privateRoot, 'runs', `${state.activeRun.runId}.json`), { ...state.activeRun, status: 'interrupted', endedAt: now })
      const runId = now.replace(/[^\d]/g, '')
      const queue = await readQueue()
      state.activeRun = { runId, startedAt: now, leaseUntil: new Date(Date.parse(now) + 20 * 60 * 1000).toISOString(), job: jobFor(state.cursor), contactTargets: nextContacts(state.contacts, now, 2), evidenceTargets: queue.filter((item) => item.status === 'needs_evidence').sort((a, b) => a.screenedAt.localeCompare(b.screenedAt)).slice(0, 2).map((item) => ({ company: item.candidate.companyName, country: item.candidate.country, candidate: item.candidate, missing: item.reasons })) }
      state.cursor++
      await atomic(statePath, state)
      console.log(JSON.stringify({ resumed: false, ...state.activeRun }, null, 2))
    }
  } else {
    const inputPath = process.argv[3]
    if (!inputPath) throw new Error('finish requires a results JSON file')
    const input = await readJson(resolve(inputPath), null)
    if (!state.activeRun || input?.runId !== state.activeRun.runId) throw new Error('Result runId does not match the active research round')
    if (!Array.isArray(input.queries) || !input.queries.length || input.queries.some((item) => !item.query || !item.channel || !item.outcome)) throw new Error('Record actual searches and their outcomes')
    if (!Array.isArray(input.discoveries) || !Array.isArray(input.contactFindings)) throw new Error('Provide discoveries and contactFindings arrays; empty arrays are valid')
    const findings = input.contactFindings.map((item) => validateContactFinding(item, new Set(publicLeads.map((lead) => lead.id))))
    const originalQueue = await readQueue()
    const screened = recheckDiscoveryBatch(input.discoveries, { ...refs, queue: originalQueue })
    const counts = roundCounts(screened.results, findings)
    for (const finding of findings) {
      const item = state.contacts.find((entry) => entry.leadId === finding.leadId)
      if (item) { item.attempts++; item.lastAttemptAt = now; item.status = finding.outcome === 'found' ? 'awaiting_review' : 'pending'; item.nextRetryAt = new Date(Date.parse(now) + 7 * 86400000).toISOString() }
    }
    const report = { ...state.activeRun, endedAt: now, status: 'completed', queries: input.queries, counts, discoveries: screened.results, contactFindings: findings, blockers: input.blockers ?? [] }
    // The run file is also a recovery journal if a subsequent state write fails.
    await atomic(resolve(privateRoot, 'runs', `${input.runId}.json`), report)
    await writeFile(queuePath, screened.queue.map((item) => JSON.stringify(item)).join('\n') + (screened.queue.length ? '\n' : ''))
    if (findings.length) await appendFile(resolve(privateRoot, 'contact-findings.ndjson'), findings.map((item) => JSON.stringify({ ...item, runId: input.runId, savedAt: now })).join('\n') + '\n')
    state.latestRun = { runId: input.runId, endedAt: now, job: state.activeRun.job, counts }
    state.activeRun = null
    await atomic(statePath, state)
    await atomic(resolve(privateRoot, 'latest-summary.json'), { ...state.latestRun, blockers: report.blockers })
    console.log(JSON.stringify({ runId: input.runId, counts, queueSize: screened.queue.length, contactBacklog: state.contacts.filter((item) => item.status === 'pending').length, report: resolve(privateRoot, 'runs', `${input.runId}.json`) }, null, 2))
  }
} finally { await lock.close(); await unlink(lockPath) }
