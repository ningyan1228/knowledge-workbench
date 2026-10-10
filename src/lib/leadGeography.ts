import type { PublicLead } from './productMarketMap'

export const continents = ['亚洲', '欧洲', '北美洲', '南美洲', '非洲', '大洋洲', '南极洲', '未分类'] as const
export type Continent = typeof continents[number]
type LocatedLead = Pick<PublicLead, 'country' | 'countryZh'>

const countriesByContinent: Partial<Record<Continent, string[]>> = {
  亚洲: ['China', 'India', 'Indonesia', 'Israel', 'Japan', 'Malaysia', 'South Korea', 'Taiwan', 'Thailand', 'Vietnam'],
  欧洲: ['Belgium', 'Germany', 'Italy', 'Luxembourg', 'Netherlands', 'Sweden', 'Switzerland', 'Turkey', 'United Kingdom'],
  北美洲: ['Canada', 'Mexico', 'United States'],
  南美洲: ['Argentina', 'Brazil', 'Colombia'],
  非洲: ['South Africa'],
  大洋洲: ['Australia', 'New Zealand'],
}

export function continentOf(country: string): Continent {
  return continents.find((continent) => countriesByContinent[continent]?.includes(country)) ?? '未分类'
}

export function filterLeadGeography<T extends LocatedLead>(leads: T[], continent = 'all', country = 'all'): T[] {
  return leads.filter((lead) => (continent === 'all' || continentOf(lead.country) === continent) && (country === 'all' || lead.country === country))
}

export function geographyOptions(leads: LocatedLead[], continent = 'all') {
  const continentCounts = new Map<Continent, number>()
  const countries = new Map<string, { value: string; label: string; count: number }>()
  for (const lead of leads) {
    const region = continentOf(lead.country)
    continentCounts.set(region, (continentCounts.get(region) ?? 0) + 1)
    if (continent !== 'all' && continent !== region) continue
    const previous = countries.get(lead.country)
    countries.set(lead.country, { value: lead.country, label: lead.countryZh, count: (previous?.count ?? 0) + 1 })
  }
  return {
    continents: continents.filter((region) => continentCounts.has(region)).map((value) => ({ value, count: continentCounts.get(value)! })),
    countries: [...countries.values()].sort((a, b) => a.label.localeCompare(b.label, 'zh-CN')),
  }
}
