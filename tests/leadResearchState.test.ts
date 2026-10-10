import { describe, expect, it } from 'vitest'
import { contactBacklog, jobFor, nextContacts, roundCounts, validateContactFinding, validateProjectFinding } from '../scripts/lib/lead-research-state.mjs'
import { publicLeads } from '../src/lib/productMarketMap'

describe('multichannel coating customer research', () => {
  it('allocates four of six rounds to coating, covers SEA, and rotates discovery channels', () => {
    const jobs = Array.from({ length: 60 }, (_, cursor) => jobFor(cursor))
    expect(jobs.filter((job) => job.productId === 'fertilizer-coating')).toHaveLength(40)
    expect(new Set(jobs.slice(0, 6).map((job) => job.productId)).size).toBe(3)
    for (const country of ['Vietnam', 'Malaysia', 'Indonesia', 'Thailand', 'Philippines']) expect(jobs.some((job) => job.productId === 'fertilizer-coating' && job.country === country)).toBe(true)
    expect(new Set(jobs.map((job) => job.channel)).size).toBe(4)
    expect(jobFor(0).queries.some((query) => query.includes('production line'))).toBe(true)
    expect(jobFor(0).queries.some((query) => query.includes('phân bón'))).toBe(true)
    expect(jobFor(0).verificationChannels).toHaveLength(4)
  })
  it('retains procurement gaps despite a researcher and includes phone-only email tasks', () => {
    const base = publicLeads.find((lead) => lead.id === 'chobi-ulsan')!
    expect(base).toBeDefined()
    const researcher = { ...base, id: 'fixture', profile: { ...base.profile, generalEmail: undefined, departmentEmails: [], contacts: [{ name: 'Fixture Person', title: 'R&D manager', department: 'Technical', linkedIn: 'https://www.linkedin.com/in/fixture', source: { label: 'Public profile', url: 'https://www.linkedin.com/in/fixture' }, verifiedAt: '2026-10-10' }] } }
    const tasks = contactBacklog([researcher])
    expect(tasks.map((item) => item.gap)).toEqual(['business-email', 'procurement'])
    expect(contactBacklog([base]).some((item) => item.gap === 'business-email')).toBe(true)
    const previous = tasks.map((item) => ({ ...item, status: item.gap === 'procurement' ? 'awaiting_review' : 'pending', attempts: 2 }))
    expect(contactBacklog([researcher], previous).find((item) => item.gap === 'procurement').status).toBe('awaiting_review')
    expect(contactBacklog([researcher], [{ leadId: 'fixture', status: 'awaiting_review' }]).every((item) => item.status === 'pending')).toBe(true)
  })
  it('selects different companies and respects retry dates and awaiting review', () => {
    const backlog = [{ leadId: 'a', gap: 'procurement', status: 'pending', attempts: 0 }, { leadId: 'a', gap: 'technical', status: 'pending', attempts: 0 }, { leadId: 'b', status: 'pending', attempts: 1, nextRetryAt: '2026-10-17T00:00:00Z' }, { leadId: 'c', status: 'awaiting_review', attempts: 0 }]
    expect(nextContacts(backlog, '2026-10-10T00:00:00Z', 10).map((item) => item.leadId)).toEqual(['a'])
    expect(nextContacts(backlog, '2026-10-18T00:00:00Z', 10).map((item) => item.leadId)).toEqual(['a', 'b'])
  })
  it('separates a named person from a sourced general inbox', () => {
    const known = new Set(['company'])
    const valid = { leadId: 'company', outcome: 'found', name: 'Fixture Person', title: 'R&D manager', verifiedAt: '2026-10-10', sources: [{ name: 'Official team', url: 'https://example.org/team', summary: 'Fixture evidence only' }] }
    expect(validateContactFinding(valid, known).reviewStatus).toBe('needs_review')
    expect(() => validateContactFinding({ ...valid, title: undefined }, known)).toThrow()
    expect(() => validateContactFinding({ ...valid, sources: [] }, known)).toThrow()
    expect(validateContactFinding({ ...valid, outcome: 'business_email', name: undefined, title: undefined, email: 'contact@example.org' }, known).reviewStatus).toBe('needs_review')
  })
  it('requires project dates, public evidence and a planning/operation stage', () => {
    const project = { leadId: 'company', type: 'coating-line', stage: 'planned', eventDate: '2024', verifiedAt: '2026-10-10', summary: 'Reported plan, not commissioned', source: { name: 'Official report', url: 'https://example.org/report', summary: 'Announces a proposed line' } }
    expect(validateProjectFinding(project, new Set(['company'])).stage).toBe('planned')
    expect(() => validateProjectFinding({ ...project, stage: undefined }, new Set(['company']))).toThrow()
    expect(() => validateProjectFinding(project, new Set())).toThrow()
    expect(roundCounts([{ status: 'ready_for_review' }], [{ outcome: 'business_email' }], [project])).toMatchObject({ newQualified: 0, readyForReview: 1, businessEmailsFound: 1, projectsFound: 1, verifiedProjects: 0 })
  })
})
