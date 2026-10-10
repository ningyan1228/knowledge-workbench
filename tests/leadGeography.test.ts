import { describe, expect, it } from 'vitest'
import { continentOf, filterLeadGeography, geographyOptions } from '../src/lib/leadGeography'
import { publicLeads } from '../src/lib/productMarketMap'

describe('customer map geography', () => {
  it('classifies every current customer location and handles new countries explicitly', () => {
    for (const lead of publicLeads) expect(continentOf(lead.country)).not.toBe('未分类')
    expect(continentOf('Mexico')).toBe('北美洲')
    expect(continentOf('Israel')).toBe('亚洲')
    expect(continentOf('Unknown')).toBe('未分类')
  })

  it('keeps product, continent and country filters as an intersection', () => {
    const productLeads = publicLeads.filter((lead) => lead.productId === 'fertilizer-coating')
    const result = filterLeadGeography(productLeads, '亚洲', 'Japan')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((lead) => lead.country === 'Japan' && lead.productId === 'fertilizer-coating')).toBe(true)
    expect(filterLeadGeography(productLeads, '欧洲', 'Japan')).toEqual([])
  })

  it('offers only countries within the selected continent, with accurate counts', () => {
    const options = geographyOptions(publicLeads, '南美洲')
    expect(options.countries.map((item) => item.value).sort()).toEqual(['Argentina', 'Brazil', 'Colombia'])
    expect(options.countries.reduce((sum, item) => sum + item.count, 0)).toBe(filterLeadGeography(publicLeads, '南美洲').length)
    expect(options.continents.reduce((sum, item) => sum + item.count, 0)).toBe(publicLeads.length)
  })

  it('restores all current product leads when geography is reset', () => {
    expect(filterLeadGeography(publicLeads)).toEqual(publicLeads)
    expect(filterLeadGeography(publicLeads, 'all', 'Canada').every((lead) => lead.country === 'Canada')).toBe(true)
  })

  it('handles an empty product collection without inventing options or results', () => {
    expect(geographyOptions([])).toEqual({ continents: [], countries: [] })
    expect(filterLeadGeography([], '亚洲', 'Japan')).toEqual([])
  })
})
