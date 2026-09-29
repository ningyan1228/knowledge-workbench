import { describe, expect, it } from 'vitest'
import { marketExtendedApplications, publicLeads, targetCompanyTypes, tdsVerifiedApplications } from '../src/lib/productMarketMap'
import { normalizeCompanyName, screenDiscoveryBatch, type DiscoveryInput, type DiscoveryQueueEntry } from '../src/lib/leadDiscoveryScreening'

const refs = {
  leads: publicLeads,
  queue: [] as DiscoveryQueueEntry[],
  tdsApplications: tdsVerifiedApplications,
  marketExtensions: marketExtendedApplications,
  targetTypes: targetCompanyTypes,
}

const complete: DiscoveryInput = {
  companyName: 'Example Coated Fertilizer Works Ltd.',
  country: 'Vietnam',
  productId: 'fertilizer-coating',
  website: 'https://example.org/',
  discoveredAt: '2026-09-29',
  discoverySource: { name: 'Official product page', url: 'https://example.org/products' },
  application: { layer: 'tds-verified', id: 'controlled-release-fertilizer' },
  targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer',
  companyEvidence: {
    summary: 'Example-only fixture: the source would need to prove in-house coated fertilizer manufacturing.',
    sourceName: 'Official product page', sourceUrl: 'https://example.org/products', verifiedAt: '2026-09-29',
  },
  demandSideReason: 'Example-only fixture: downstream coated fertilizer manufacturing would need verification.',
  supplierCheck: {
    sellsSimilarRawMaterial: false, note: 'Example-only fixture: official catalog review would be required.',
    sourceUrl: 'https://example.org/catalog', checkedAt: '2026-09-29',
  },
  contact: { contactPage: 'https://example.org/contact' },
}

describe('private discovery pre-screen', () => {
  it('normalizes legal suffixes and detects a duplicate already on the map', () => {
    expect(normalizeCompanyName('Haifa Group Ltd.')).toBe(normalizeCompanyName('Haifa Group'))
    const result = screenDiscoveryBatch([{
      ...complete, companyName: 'Haifa Group Ltd.', country: 'Israel', website: 'https://www.haifa-group.com',
    }], refs)[0]
    expect(result.status).toBe('duplicate')
    expect(result.matchedCompany).toBe('Haifa Group')
  })

  it('excludes mainland China and sourced same-material suppliers without creating leads', () => {
    const mainland = screenDiscoveryBatch([{ ...complete, country: 'China' }], refs)[0]
    const supplier = screenDiscoveryBatch([{ ...complete, supplierCheck: {
      sellsSimilarRawMaterial: true, note: 'Official catalog shows same coating raw material.',
      sourceUrl: 'https://example.org/catalog', checkedAt: '2026-09-29',
    } }], refs)[0]
    expect(mainland.status).toBe('excluded')
    expect(supplier.status).toBe('excluded')
    expect(publicLeads).toHaveLength(83)
  })

  it('does not mechanically exclude Hong Kong, but still requires evidence', () => {
    expect(screenDiscoveryBatch([{ ...complete, country: 'Hong Kong', companyEvidence: undefined }], refs)[0].status).toBe('needs_evidence')
  })

  it('keeps new ELO discovery focused on coating companies, not PVC compounds', () => {
    const result = screenDiscoveryBatch([{
      ...complete, productId: 'elo', application: { layer: 'market-extended', id: 'elo-pvc-plasticizer' },
      targetCompanyTypeId: 'pvc-compound-manufacturer',
    }], refs)[0]
    expect(result.status).toBe('excluded')
  })

  it('does not fast-track a generic coating company without anticorrosion evidence', () => {
    const result = screenDiscoveryBatch([{
      ...complete, productId: 'elo', application: { layer: 'tds-verified', id: 'coatings' },
      targetCompanyTypeId: 'elo-coating-manufacturer',
      companyEvidence: { ...complete.companyEvidence!, summary: 'The company formulates decorative wall paint.' },
    }], refs)[0]
    expect(result.status).toBe('needs_evidence')
    expect(result.reasons).toContain('当前 ELO 方向缺少该公司研发或生产重防腐涂料的明确证据')
  })

  it('flags a shared website domain for human duplicate review', () => {
    const result = screenDiscoveryBatch([{ ...complete, website: 'https://www.haifa-group.com/' }], refs)[0]
    expect(result.status).toBe('possible_duplicate')
    expect(result.matchedCompany).toBe('Haifa Group')
  })

  it('never treats an unsupported application or unverified supplier check as ready', () => {
    const missingApplication = screenDiscoveryBatch([{ ...complete, application: { layer: 'market-extended', id: 'imagined-use' } }], refs)[0]
    const noExclusionSource = screenDiscoveryBatch([{ ...complete, supplierCheck: undefined }], refs)[0]
    expect(missingApplication.status).toBe('needs_evidence')
    expect(noExclusionSource.status).toBe('needs_evidence')
    expect(noExclusionSource.reasons).toContain('同类原料供应商/竞争对手排除检查尚未附公开来源')
  })

  it('keeps fully documented discoveries at human review, never automatic eligibility', () => {
    const result = screenDiscoveryBatch([complete], refs)[0]
    expect(result.status).toBe('ready_for_review')
    expect(result.reasons).toEqual([])
    expect(result).not.toHaveProperty('leadEligible')
    expect(result).not.toHaveProperty('commercialRole')
  })

  it('deduplicates within the same batch and against the saved research queue', () => {
    const batch = screenDiscoveryBatch([complete, { ...complete }], refs)
    expect(batch.map((item) => item.status)).toEqual(['ready_for_review', 'duplicate'])
    const queued: DiscoveryQueueEntry = { ...batch[0], screenedAt: '2026-09-29T00:00:00Z' }
    expect(screenDiscoveryBatch([complete], { ...refs, queue: [queued] })[0].status).toBe('duplicate')
  })

  it('rejects missing source URLs and impossible dates', () => {
    const noSource = screenDiscoveryBatch([{ ...complete, discoverySource: { name: 'Search', url: '' } }], refs)[0]
    const impossibleDate = screenDiscoveryBatch([{ ...complete, discoveredAt: '2026-02-30' }], refs)[0]
    expect(noSource.status).toBe('invalid')
    expect(impossibleDate.status).toBe('invalid')
  })
})
