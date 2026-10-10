export const rotation = [
  { productId: 'fertilizer-coating', countries: ['Vietnam', 'Malaysia', 'Thailand', 'India', 'Brazil', 'Mexico', 'Turkey', 'South Africa'], terms: ['"polymer coated fertilizer" manufacturer', '"controlled release fertilizer" factory', '"coated urea" production'] },
  { productId: 'nl-w1201', countries: ['Turkey', 'India', 'Vietnam', 'Thailand', 'Poland', 'Mexico', 'Brazil', 'Indonesia'], terms: ['"water based" "plastic primer" manufacturer', '"PP primer" coatings manufacturer', '"waterborne" "adhesion" formulator'] },
  { productId: 'elo', countries: ['India', 'Turkey', 'Malaysia', 'Vietnam', 'Indonesia', 'Brazil', 'Mexico', 'South Africa'], terms: ['"protective coatings" manufacturer', '"marine coatings" manufacturer', '"industrial anti corrosion coatings" factory'] },
]
const languages = { Vietnam: '越南语', Malaysia: '马来语／英语', Thailand: '泰语', India: '英语', Brazil: '葡萄牙语', Mexico: '西班牙语', Turkey: '土耳其语', 'South Africa': '英语', Poland: '波兰语', Indonesia: '印尼语' }
const channels = ['本地语言与官网搜索', '行业协会及会员名录', '展会参展商目录']

export function jobFor(cursor) {
  const product = rotation[cursor % rotation.length]
  const cycle = Math.floor(cursor / rotation.length)
  const country = product.countries[cycle % product.countries.length]
  const channel = channels[Math.floor(cycle / product.countries.length) % channels.length]
  return { productId: product.productId, country, language: languages[country], channel, queries: product.terms.map((term) => `${term} ${country}`) }
}

export function contactBacklog(leads, previous = []) {
  const old = new Map(previous.map((item) => [item.leadId, item]))
  return leads.filter((lead) => lead.productId === 'fertilizer-coating' && !lead.profile.contacts.length && (lead.profile.generalEmail || lead.profile.departmentEmails.length))
    .sort((a, b) => Number(b.fit === '优先核验') - Number(a.fit === '优先核验') || a.company.localeCompare(b.company))
    .map((lead) => ({ leadId: lead.id, company: lead.company, country: lead.country, productId: lead.productId, website: lead.profile.website, contactPage: lead.profile.contactPage, status: 'pending', attempts: 0, ...old.get(lead.id) }))
}

export function nextContacts(backlog, now, count = 2) {
  return backlog.filter((item) => item.status === 'pending' && (!item.nextRetryAt || Date.parse(item.nextRetryAt) <= Date.parse(now)))
    .sort((a, b) => a.attempts - b.attempts).slice(0, count)
}

export function validateContactFinding(item, knownIds) {
  if (!knownIds.has(item.leadId)) throw new Error('Contact result must reference an existing qualified company')
  if (!['found', 'fallback_only', 'blocked'].includes(item.outcome)) throw new Error('Invalid contact outcome')
  if (!Array.isArray(item.sources) || !item.sources.length || item.sources.some((source) => !source.name || !/^https:\/\//.test(source.url) || !source.summary)) throw new Error('Contact result requires public source URLs and evidence summaries')
  if (item.outcome === 'found' && (!item.name || !item.title || !item.verifiedAt || !/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt))) throw new Error('Named contact requires name, title and verification date')
  if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) throw new Error('Invalid disclosed email')
  return { ...item, reviewStatus: 'needs_review' }
}

export function roundCounts(results, findings) {
  return { discovered: results.length, duplicate: results.filter((item) => item.status === 'duplicate').length, excluded: results.filter((item) => item.status === 'excluded').length, invalid: results.filter((item) => item.status === 'invalid').length, needsEvidence: results.filter((item) => ['needs_evidence', 'possible_duplicate'].includes(item.status)).length, readyForReview: results.filter((item) => item.status === 'ready_for_review').length, newQualified: 0, contactsChecked: findings.length, contactsFound: findings.filter((item) => item.outcome === 'found').length, contactsFallback: findings.filter((item) => item.outcome === 'fallback_only').length, contactsBlocked: findings.filter((item) => item.outcome === 'blocked').length }
}
