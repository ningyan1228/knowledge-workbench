import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// Use repository history, never a review date or today's build date, as evidence.
const repo = path.resolve(process.argv[2] || '.')
const destination = 'src/lib/leadFirstRecorded.json'
const records = fs.existsSync(destination) ? JSON.parse(fs.readFileSync(destination, 'utf8')) : {}
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${repo.replaceAll('\\', '/')}`, '-C', repo, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] })
try {
  const shallow = git('rev-parse', '--is-shallow-repository').trim() === 'true'
  if (shallow) throw new Error('Full repository history is required; existing dates preserved')
  const commits = git('log', '--reverse', '--format=%H|%cI', '--', 'src/lib/productMarketMap.ts').trim().split('\n').filter(Boolean)
  for (const commit of commits) {
    const [sha, recordedAt] = commit.split('|')
    const source = git('show', `${sha}:src/lib/productMarketMap.ts`)
    const pattern = /\bid:\s*['"]([^'"]+)['"]\s*,\s*productId:\s*['"](?:fertilizer-coating|nl-w1201|elo)['"]\s*,\s*company:/g
    for (const match of source.matchAll(pattern)) {
      if (!records[match[1]]) records[match[1]] = { recordedAt, commit: sha }
    }
  }
  if (!commits.length) console.log('No repository history available; preserving recorded dates.')
} catch (error) {
  console.warn(`Lead timeline: ${error.message.split('\n')[0]}; dates without evidence remain unknown.`)
}
fs.writeFileSync(destination, JSON.stringify(Object.fromEntries(Object.entries(records).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n')
console.log(`Lead timeline: ${Object.keys(records).length} historical records.`)
