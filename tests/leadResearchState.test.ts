import { describe, expect, it } from 'vitest'
import { contactBacklog, jobFor, nextContacts, roundCounts, validateContactFinding } from '../scripts/lib/lead-research-state.mjs'
import { publicLeads } from '../src/lib/productMarketMap'

describe('two-track customer research', () => {
  it('rotates products, countries and channels instead of restarting at the first company', () => {
    expect([0, 1, 2].map((cursor) => jobFor(cursor).productId)).toEqual(['fertilizer-coating', 'nl-w1201', 'elo'])
    expect(jobFor(3).country).not.toBe(jobFor(0).country)
    expect(jobFor(24).channel).not.toBe(jobFor(0).channel)
    expect(jobFor(48).channel).not.toBe(jobFor(24).channel)
  })

  it('keeps fertilizer companies with real business contact routes and missing names in a separate backlog', () => {
    const backlog = contactBacklog(publicLeads)
    expect(backlog.length).toBeGreaterThanOrEqual(10)
    for (const item of backlog) {
      const lead = publicLeads.find((lead) => lead.id === item.leadId)!
      expect(lead.productId).toBe('fertilizer-coating')
      expect(lead.profile.contacts).toEqual([])
      expect(Boolean(lead.profile.generalEmail || lead.profile.departmentEmails.length)).toBe(true)
    }
  })

  it('does not repeat found contacts or retry blocked companies before their retry date', () => {
    const backlog = [{ leadId: 'found', status: 'awaiting_review', attempts: 1 }, { leadId: 'blocked', status: 'pending', attempts: 1, nextRetryAt: '2026-10-17T00:00:00Z' }, { leadId: 'new', status: 'pending', attempts: 0 }]
    expect(nextContacts(backlog, '2026-10-10T00:00:00Z', 10).map((item) => item.leadId)).toEqual(['new'])
    expect(nextContacts(backlog, '2026-10-18T00:00:00Z', 10).map((item) => item.leadId)).toEqual(['new', 'blocked'])
  })

  it('requires a disclosed name, role and public evidence before recording a named contact', () => {
    const known = new Set(['company'])
    const valid = { leadId: 'company', outcome: 'found', name: 'Fixture Person', title: 'R&D manager', verifiedAt: '2026-10-10', sources: [{ name: 'Official team page', url: 'https://example.org/team', summary: 'Fixture evidence only' }] }
    expect(validateContactFinding(valid, known).reviewStatus).toBe('needs_review')
    expect(() => validateContactFinding({ ...valid, title: undefined }, known)).toThrow()
    expect(() => validateContactFinding({ ...valid, sources: [] }, known)).toThrow()
    expect(() => validateContactFinding(valid, new Set())).toThrow()
  })

  it('keeps ready-for-review discoveries separate from real qualified additions', () => {
    const counts = roundCounts([{ status: 'ready_for_review' }, { status: 'duplicate' }, { status: 'needs_evidence' }], [{ outcome: 'found' }, { outcome: 'fallback_only' }, { outcome: 'blocked' }])
    expect(counts).toMatchObject({ discovered: 3, readyForReview: 1, newQualified: 0, duplicate: 1, needsEvidence: 1, contactsChecked: 3, contactsFound: 1, contactsFallback: 1, contactsBlocked: 1 })
  })
})
