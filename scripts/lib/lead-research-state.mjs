export const rotation = [
  { productId: 'fertilizer-coating', countries: ['Vietnam', 'Malaysia', 'Indonesia', 'Thailand', 'Philippines', 'South Korea', 'Japan', 'India', 'Brazil', 'Turkey'], terms: ['"controlled release fertilizer" "production line"', '"coated urea" factory expansion', '"fertilizer coating" commissioning', '"controlled release fertilizer" research recruitment'] },
  { productId: 'nl-w1201', countries: ['Turkey', 'India', 'Vietnam', 'Thailand', 'Poland', 'Mexico', 'Brazil', 'Indonesia'], terms: ['"water based" "plastic primer" manufacturer', '"PP primer" coatings manufacturer', '"waterborne" "adhesion" formulator'] },
  { productId: 'elo', countries: ['India', 'Turkey', 'Malaysia', 'Vietnam', 'Indonesia', 'Brazil', 'Mexico', 'South Africa'], terms: ['"protective coatings" manufacturer', '"marine coatings" manufacturer', '"industrial anti corrosion coatings" factory'] },
]
const languages = { Vietnam: '越南语', Malaysia: '马来语／英语', Thailand: '泰语', Philippines: '英语', 'South Korea': '韩语', Japan: '日语', India: '英语', Brazil: '葡萄牙语', Mexico: '西班牙语', Turkey: '土耳其语', 'South Africa': '英语', Poland: '波兰语', Indonesia: '印尼语' }
const channels = ['本地语言与生产活动搜索', '行业协会及会员名录', '展会参展商目录', '设备安装及工厂案例']
const slots = [0, 0, 0, 0, 1, 2]
const localTerms = { Vietnam: '"phân bón" "bọc" "nhà máy"', Malaysia: '"baja pelepasan terkawal" kilang', Indonesia: '"pupuk" "berlapis" pabrik', Thailand: '"ปุ๋ยเคลือบ" โรงงาน', Japan: '"被覆肥料" 製造 工場', 'South Korea': '"코팅 비료" 공장' }
const southeastAsia = new Set(['Vietnam', 'Malaysia', 'Indonesia', 'Thailand', 'Philippines', 'Singapore', 'Cambodia', 'Laos', 'Myanmar', 'Brunei', 'Timor-Leste'])

export function jobFor(cursor) {
  if (!Number.isInteger(cursor) || cursor < 0) throw new Error('Cursor must be a non-negative integer')
  const slot = cursor % slots.length
  const index = slots[slot]
  const product = rotation[index]
  const cycle = Math.floor(cursor / slots.length) * slots.filter((value) => value === index).length + slots.slice(0, slot).filter((value) => value === index).length
  const country = product.countries[cycle % product.countries.length]
  const channel = channels[cycle % channels.length]
  const queries = product.terms.map((term) => `${term} ${country}`)
  if (product.productId === 'fertilizer-coating' && localTerms[country]) queries.push(localTerms[country])
  return { productId: product.productId, country, language: languages[country], channel, queries,
    verificationChannels: ['公司官网／工厂公告／年报', '公开 LinkedIn 职责与招聘', '官方 Facebook／YouTube 产线资料', '设备商案例交叉核实'],
    instruction: '主发现渠道用于拓展名单；交叉核验不限单一渠道。投产、规划和研发须分开，不能据此推定采购。' }
}

export function contactBacklog(leads, previous = []) {
  const old = new Map(previous.filter((item) => item.taskKey).map((item) => [item.taskKey, item]))
  return leads.filter((lead) => lead.productId === 'fertilizer-coating' && lead.leadEligible && lead.commercialRole === 'demand_side')
    .flatMap((lead) => {
      const contacts = lead.profile.contacts.filter((item) => item.name && item.title && /^https:\/\//.test(item.source?.url ?? '') && /^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt ?? '') && (item.email || item.phone || item.linkedIn))
      const gaps = []
      if (!contacts.some((item) => /procurement|purchas|sourcing/i.test(`${item.department ?? ''} ${item.title}`))) gaps.push('procurement')
      if (!contacts.some((item) => /technical|r&d|research|研发/i.test(`${item.department ?? ''} ${item.title}`))) gaps.push('technical')
      if (![lead.profile.generalEmail, ...lead.profile.departmentEmails.map((item) => item.email), ...contacts.map((item) => item.email)].some((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? ''))) gaps.unshift('business-email')
      return gaps.map((gap) => {
        const taskKey = `${lead.id}:${gap}`
        // Old company-wide statuses cannot safely suppress newly separated role tasks.
        return { ...old.get(taskKey), taskKey, gap, leadId: lead.id, company: lead.company, country: lead.country, productId: lead.productId, website: lead.profile.website, contactPage: lead.profile.contactPage, status: old.get(taskKey)?.status ?? 'pending', attempts: old.get(taskKey)?.attempts ?? 0 }
      })
    })
}

export function nextContacts(backlog, now, count = 2) {
  if (count <= 0) return []
  const sorted = backlog.filter((item) => item.status === 'pending' && (!item.nextRetryAt || Date.parse(item.nextRetryAt) <= Date.parse(now)))
    .sort((a, b) => a.attempts - b.attempts || Number(southeastAsia.has(b.country)) - Number(southeastAsia.has(a.country)) || Number(b.gap === 'business-email') - Number(a.gap === 'business-email'))
  const selected = [], companies = new Set()
  for (const item of sorted) if (!companies.has(item.leadId)) { selected.push(item); companies.add(item.leadId); if (selected.length >= count) break }
  return selected
}

export function validateContactFinding(item, knownIds) {
  if (!knownIds.has(item.leadId)) throw new Error('Contact result must reference an existing qualified company')
  if (!['found', 'business_email', 'fallback_only', 'blocked'].includes(item.outcome)) throw new Error('Invalid contact outcome')
  if (!Array.isArray(item.sources) || !item.sources.length || item.sources.some((source) => !source.name || !/^https:\/\//.test(source.url) || !source.summary)) throw new Error('Contact result requires public source URLs and evidence summaries')
  if (item.outcome === 'found' && (!item.name || !item.title || !item.verifiedAt || !/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt))) throw new Error('Named contact requires name, title and verification date')
  if (item.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) throw new Error('Invalid disclosed email')
  if (item.outcome === 'business_email' && (!item.email || !/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt ?? ''))) throw new Error('Business email requires a disclosed email and verification date')
  return { ...item, reviewStatus: 'needs_review' }
}

export function roundCounts(results, findings, projects = []) {
  return { discovered: results.length, duplicate: results.filter((item) => item.status === 'duplicate').length, excluded: results.filter((item) => item.status === 'excluded').length, invalid: results.filter((item) => item.status === 'invalid').length, needsEvidence: results.filter((item) => ['needs_evidence', 'possible_duplicate'].includes(item.status)).length, readyForReview: results.filter((item) => item.status === 'ready_for_review').length, newQualified: 0, contactsChecked: findings.length, contactsFound: findings.filter((item) => item.outcome === 'found').length, businessEmailsFound: findings.filter((item) => item.outcome === 'business_email').length, contactsFallback: findings.filter((item) => item.outcome === 'fallback_only').length, contactsBlocked: findings.filter((item) => item.outcome === 'blocked').length, projectsFound: projects.length, verifiedProjects: 0 }
}

export function validateProjectFinding(item, knownIds) {
  if (!knownIds.has(item.leadId)) throw new Error('Project must reference a qualified company')
  if (!['coating-line', 'expansion', 'commissioning', 'research', 'recruitment'].includes(item.type)) throw new Error('Invalid project type')
  if (!['planned', 'operational', 'reported-research', 'recruitment'].includes(item.stage)) throw new Error('Separate planned, operational and research stages')
  if (!item.summary || !/^\d{4}(-\d{2})?(-\d{2})?$/.test(item.eventDate ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt ?? '') || !item.source?.name || !/^https:\/\//.test(item.source?.url ?? '') || !item.source?.summary) throw new Error('Project requires dated public evidence; keep the source date precision')
  return { ...item, reviewStatus: 'needs_review', key: `${item.leadId}|${item.type}|${item.source.url}` }
}
