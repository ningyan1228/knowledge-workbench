export type LeadView = 'map' | 'leads'
export type MarketTab = 'overview' | LeadView | 'products' | 'sources' | 'results' | 'follow-up'
export const leadViewStorageKey = 'nl-market-customer-view'

type ViewStorage = Pick<Storage, 'getItem' | 'setItem'>

export function readLeadView(storage?: ViewStorage): LeadView {
  try {
    return (storage ?? window.localStorage).getItem(leadViewStorageKey) === 'map' ? 'map' : 'leads'
  } catch { return 'leads' }
}

export function rememberLeadView(view: LeadView, storage?: ViewStorage) {
  try { (storage ?? window.localStorage).setItem(leadViewStorageKey, view) } catch { /* Browsing still works when storage is unavailable. */ }
}

export function marketTabForRoute(segment: string | undefined, preferred: LeadView): MarketTab {
  // Explicit links and the overview tab take precedence over the saved display mode.
  return segment === 'overview' || segment === 'map' || segment === 'leads' || segment === 'products' || segment === 'sources' || segment === 'results' || segment === 'follow-up' ? segment : preferred
}
