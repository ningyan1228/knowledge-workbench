import { describe, expect, it } from 'vitest'
import { leadViewStorageKey, marketTabForRoute, readLeadView, rememberLeadView } from '../src/lib/leadViewPreference'

describe('customer display preference', () => {
  it('defaults to the compact list and remembers explicit mode choices', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
    expect(readLeadView(storage)).toBe('leads')
    rememberLeadView('map', storage)
    expect(readLeadView(storage)).toBe('map')
    rememberLeadView('leads', storage)
    expect(values.get(leadViewStorageKey)).toBe('leads')
    values.set(leadViewStorageKey, 'invalid')
    expect(readLeadView(storage)).toBe('leads')
  })

  it('restores the last mode at the main entry while respecting explicit links and overview', () => {
    expect(marketTabForRoute(undefined, 'map')).toBe('map')
    expect(marketTabForRoute(undefined, 'leads')).toBe('leads')
    expect(marketTabForRoute('leads', 'map')).toBe('leads')
    expect(marketTabForRoute('map', 'leads')).toBe('map')
    for (const tab of ['overview', 'products', 'sources'] as const) expect(marketTabForRoute(tab, 'map')).toBe(tab)
    expect(marketTabForRoute('invalid', 'map')).toBe('map')
  })

  it('keeps browsing usable if browser storage is blocked', () => {
    const storage = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
    expect(readLeadView(storage)).toBe('leads')
    expect(() => rememberLeadView('map', storage)).not.toThrow()
  })
})
