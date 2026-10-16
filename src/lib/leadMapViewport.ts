import type { PublicLead } from './productMarketMap'

/** Fit the retained customer locations, without adding the poles to a world view. */
export function leadMapViewport(leads: Pick<PublicLead, 'latitude' | 'longitude'>[], closeUp = false) {
  const locations = leads.filter((lead) => Number.isFinite(lead.latitude) && Number.isFinite(lead.longitude) && Math.abs(lead.latitude) <= 85 && Math.abs(lead.longitude) <= 180)
  const south = locations.length ? Math.min(...locations.map((lead) => lead.latitude)) : -48
  const north = locations.length ? Math.max(...locations.map((lead) => lead.latitude)) : 64
  const west = locations.length ? Math.min(...locations.map((lead) => lead.longitude)) : -130
  const east = locations.length ? Math.max(...locations.map((lead) => lead.longitude)) : 175
  return {
    bounds: [[south, west], [north, east]] as [[number, number], [number, number]],
    wide: east - west > 120,
    maxZoom: closeUp ? 12 : 9,
  }
}
