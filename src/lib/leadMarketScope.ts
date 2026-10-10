// User-selected business market scope applies to every product and research route.
export function isTaiwanMarket(country: string) {
  return /taiwan|台[湾灣]|chinese\s+taipei/i.test(country)
}
