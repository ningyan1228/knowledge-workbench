import { describe, expect, it } from 'vitest'
import { isSiteGateHash, matchesSiteGatePassword, siteGateSessionKey } from '../src/lib/siteGate'

const exampleHash = '9b3a2d245a8f2f1a04c43c89a73d7816a53f7b499cd8ea70f40804d924151b69'

describe('temporary site password gate', () => {
  it('requires a complete SHA-256 hex digest', () => {
    expect(isSiteGateHash(exampleHash)).toBe(true)
    expect(isSiteGateHash('short')).toBe(false)
    expect(isSiteGateHash('z'.repeat(64))).toBe(false)
  })

  it('only accepts the matching password', async () => {
    const knownHash = '2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b'
    expect(await matchesSiteGatePassword('secret', knownHash)).toBe(true)
    expect(await matchesSiteGatePassword('wrong', knownHash)).toBe(false)
    expect(await matchesSiteGatePassword('', knownHash)).toBe(false)
  })

  it('invalidates a previous browser session when the configured hash changes', () => {
    expect(siteGateSessionKey(exampleHash)).not.toBe(siteGateSessionKey('a'.repeat(64)))
  })
})
