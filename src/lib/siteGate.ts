/** A convenience gate for the public static site, not authorization for its bundled data. */
export function isSiteGateHash(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value)
}

export function siteGateSessionKey(hash: string): string {
  return `neon-lion-site-gate:${hash.toLowerCase()}`
}

export async function matchesSiteGatePassword(password: string, expectedHash: string): Promise<boolean> {
  if (!password || !isSiteGateHash(expectedHash)) return false
  const encoded = new TextEncoder().encode(password)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded)
  const actualHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  return actualHash === expectedHash.toLowerCase()
}
