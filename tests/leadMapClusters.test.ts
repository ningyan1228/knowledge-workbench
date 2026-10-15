import { describe, expect, it } from 'vitest'
import { leadMapGroups, mapCompanyCount, mapCountryGroups } from '../src/lib/leadMapClusters'
import { publicLeads, type PublicLead } from '../src/lib/productMarketMap'

const base = publicLeads[0]
function lead(id: string, country: string, latitude: number, longitude: number): PublicLead {
  return { ...base, id, company: id, country, countryZh: country, latitude, longitude }
}

describe('progressive customer map clusters', () => {
  it('summarizes the world by continent without losing any current records', () => {
    const groups = leadMapGroups(publicLeads, 2)
    expect(groups.every((group) => group.kind === 'continent')).toBe(true)
    expect(groups.length).toBeLessThanOrEqual(8)
    expect(groups.flatMap((group) => group.leads).map((item) => item.id).sort()).toEqual(publicLeads.map((item) => item.id).sort())
  })

  it('unfolds a selected continent into countries, and separates distant countries', () => {
    const leads = [lead('ca', 'Canada', 50, -120), lead('mx', 'Mexico', 19, -99)]
    expect(leadMapGroups(leads, 2).every((group) => group.kind === 'country')).toBe(true)
    expect(leadMapGroups(leads, 4).map((group) => group.id).sort()).toEqual(['Canada', 'Mexico'])
  })

  it('combines nearby country labels to prevent European badges from overlapping', () => {
    const groups = leadMapGroups([lead('fr', 'France', 49, 2), lead('be', 'Belgium', 51, 4)], 4)
    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('欧洲 · 2 国')
    expect(groups[0].leads).toHaveLength(2)
  })

  it('reveals individual companies as zoom separates their screen positions', () => {
    const leads = [lead('a', 'France', 48, 2), lead('b', 'France', 48, 2.1)]
    expect(leadMapGroups(leads, 6)).toHaveLength(1)
    expect(leadMapGroups(leads, 12)).toHaveLength(2)
    expect(leadMapGroups([...leads].reverse(), 6)).toEqual(leadMapGroups(leads, 6))
  })

  it('retains colocated companies for the city-level fan-out and counts a company once across products', () => {
    const a = lead('same-place-a', 'France', 48, 2)
    const b = lead('same-place-b', 'France', 48, 2)
    const duplicate = { ...a, id: 'same-company-other-product', productId: 'elo' as const }
    const groups = leadMapGroups([a, b, duplicate], 18)
    expect(groups).toHaveLength(1)
    expect(groups[0].leads).toHaveLength(3)
    expect(groups[0].count).toBe(2)
    expect(mapCompanyCount([a, duplicate])).toBe(1)
    expect(mapCountryGroups([a, b, duplicate])[0].count).toBe(2)
  })

  it('uses only filtered records and handles empty input', () => {
    const selected = publicLeads.slice(0, 3)
    expect(leadMapGroups(selected, 2).reduce((sum, group) => sum + group.leads.length, 0)).toBe(3)
    expect(leadMapGroups([], 2)).toEqual([])
  })
})
