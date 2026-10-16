import { describe, expect, it } from 'vitest'
import { leadMapViewport } from '../src/lib/leadMapViewport'
import { publicLeads } from '../src/lib/productMarketMap'

describe('customer map framing', () => {
  it('uses a landscape world frame while retaining every published customer coordinate', () => {
    const view = leadMapViewport(publicLeads)
    expect(view.wide).toBe(true)
    const [[south, west], [north, east]] = view.bounds
    for (const lead of publicLeads) {
      expect(lead.latitude).toBeGreaterThanOrEqual(south)
      expect(lead.latitude).toBeLessThanOrEqual(north)
      expect(lead.longitude).toBeGreaterThanOrEqual(west)
      expect(lead.longitude).toBeLessThanOrEqual(east)
    }
  })
  it('fits a country to its customer locations and limits automatic zoom for one location', () => {
    const leads = [{ latitude: 48, longitude: 2 }, { latitude: 45, longitude: 5 }]
    expect(leadMapViewport(leads)).toEqual({ bounds: [[45, 2], [48, 5]], wide: false, maxZoom: 9 })
    expect(leadMapViewport(leads.slice(0, 1)).maxZoom).toBe(9)
    expect(leadMapViewport(leads, true).maxZoom).toBe(12)
  })
  it('ignores sort order and keeps an empty result on a useful nonpolar overview', () => {
    expect(leadMapViewport([...publicLeads].reverse())).toEqual(leadMapViewport(publicLeads))
    expect(leadMapViewport([])).toEqual({ bounds: [[-48, -130], [64, 175]], wide: true, maxZoom: 9 })
    expect(leadMapViewport([{ latitude: NaN, longitude: 5 }])).toEqual(leadMapViewport([]))
  })
})
