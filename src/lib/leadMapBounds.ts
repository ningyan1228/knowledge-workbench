import type { PublicLead } from './productMarketMap'

export type LeadMapBounds = { south: number; west: number; north: number; east: number }

/** Use geographic anchors, including wrapped bounds at the date line. */
export function leadsInMapBounds<T extends Pick<PublicLead, 'latitude' | 'longitude'>>(leads: T[], bounds: LeadMapBounds | null): T[] {
  if (!bounds) return leads
  const { south, west, north, east } = bounds
  const span = east >= west ? east - west : (east - west) % 360 + 360
  return leads.filter(({ latitude, longitude }) => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < south || latitude > north) return false
    const offset = ((longitude - west) % 360 + 360) % 360
    return span >= 360 || offset <= span
  })
}
