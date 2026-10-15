import { continentOf } from './leadGeography'
import { outreachCompanyKey } from './outreachLedger'
import type { PublicLead } from './productMarketMap'

export type LeadMapGroup = {
  id: string
  kind: 'continent' | 'country' | 'nearby'
  label: string
  leads: PublicLead[]
  latitude: number
  longitude: number
  count: number
}

export function mapCompanyCount(leads: PublicLead[]) {
  return new Set(leads.map(outreachCompanyKey)).size
}

function summarize(id: string, kind: LeadMapGroup['kind'], label: string, leads: PublicLead[]): LeadMapGroup {
  return {
    id, kind, label, leads,
    latitude: leads.reduce((sum, lead) => sum + lead.latitude, 0) / leads.length,
    longitude: leads.reduce((sum, lead) => sum + lead.longitude, 0) / leads.length,
    count: mapCompanyCount(leads),
  }
}

export function mapCountryGroups(leads: PublicLead[]): LeadMapGroup[] {
  const groups = new Map<string, PublicLead[]>()
  for (const lead of leads) groups.set(lead.country, [...(groups.get(lead.country) ?? []), lead])
  return [...groups].map(([country, members]) => summarize(country, 'country', members[0].countryZh, members))
}

// Match Leaflet's Web Mercator projection so nearby points cluster by screen distance.
function project(lead: Pick<PublicLead, 'latitude' | 'longitude'>, zoom: number) {
  const size = 256 * 2 ** zoom
  const sin = Math.sin(Math.max(-85.05112878, Math.min(85.05112878, lead.latitude)) * Math.PI / 180)
  return { x: (lead.longitude + 180) / 360 * size, y: (.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size }
}

export function leadMapGroups(leads: PublicLead[], zoom: number): LeadMapGroup[] {
  if (!leads.length) return []
  const regions = new Map<string, PublicLead[]>()
  for (const lead of leads) {
    const region = continentOf(lead.country)
    regions.set(region, [...(regions.get(region) ?? []), lead])
  }
  if (zoom < 3.5 && regions.size > 1) {
    return [...regions].map(([region, members]) => summarize(region, 'continent', region, members))
  }
  const countries = mapCountryGroups(leads)
  if (zoom < 5.5 && countries.length > 1) {
    const clusters: Array<{ x: number; y: number; countries: LeadMapGroup[] }> = []
    for (const country of countries.sort((a, b) => a.id.localeCompare(b.id))) {
      const point = project(country, zoom)
      const cluster = clusters.find((item) => Math.abs(item.x - point.x) < 108 && Math.abs(item.y - point.y) < 68)
      if (cluster) cluster.countries.push(country)
      else clusters.push({ ...point, countries: [country] })
    }
    return clusters.map(({ countries: members }) => {
      if (members.length === 1) return members[0]
      const regions = new Set(members.map((country) => continentOf(country.id)))
      return summarize(`countries:${members.map((country) => country.id).join('|')}`, 'nearby', `${regions.size === 1 ? [...regions][0] : '附近'} · ${members.length} 国`, members.flatMap((country) => country.leads))
    })
  }

  const nearby: Array<{ x: number; y: number; members: PublicLead[] }> = []
  // Stable ordering keeps groups from moving when the sidebar sort order changes.
  for (const lead of [...leads].sort((a, b) => a.id.localeCompare(b.id))) {
    const point = project(lead, zoom)
    const group = nearby.find((item) => Math.hypot(item.x - point.x, item.y - point.y) < 48)
    if (group) group.members.push(lead)
    else nearby.push({ ...point, members: [lead] })
  }
  return nearby.map(({ members }) => summarize(`nearby:${members[0].id}`, 'nearby', members.length === 1 ? members[0].company : '附近客户', members))
}
