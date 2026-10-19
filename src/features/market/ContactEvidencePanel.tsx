import type { MouseEvent } from 'react'
import { Copy, ExternalLink, Linkedin, Mail, Phone, UserRound } from 'lucide-react'
import type { PublicLead } from '../../lib/productMarketMap'
import { contactAssessment, contactEmailVerified, contactPhoneVerified, contactRolePriority, isGenericInbox, publicContactUrl, validBusinessEmail, type ContactSource } from '../../lib/contactEvidence'
import './contactEvidence.css'

type Props = { lead: PublicLead; onEmail: (event: MouseEvent<HTMLAnchorElement>, email: string) => void; compactEvidence?: boolean }
function CopyContact({ value, label }: { value: string; label: string }) {
  return <button type="button" className="copy-value" title={`复制${label}`} onClick={() => void navigator.clipboard.writeText(value)}><Copy size={14} /></button>
}
function EvidenceSources({ label, sources, verifiedAt, verified, collapsed = false }: { label: string; sources?: Array<Pick<ContactSource, 'label' | 'url'> & { summary?: string }>; verifiedAt?: string; verified: boolean; collapsed?: boolean }) {
  const status = verified ? `${verifiedAt ?? '分项日期待补'} · ${verifiedAt ? '已核验' : '旧公开来源'}` : '待分项核验'
  const content = sources?.length ? sources.map((source, index) => <div key={`${source.url}-${index}`}>{publicContactUrl(source.url) ? <a href={source.url} target="_blank" rel="noreferrer">{source.label} <ExternalLink size={12} /></a> : <span>{source.label}</span>}{source.summary && <p>{source.summary}</p>}</div>) : <p>尚无对应来源</p>
  return collapsed ? <details className="contact-evidence-row"><summary>{label}<small>{status}</small></summary>{content}</details>
    : <div className="contact-evidence-row"><b>{label}</b><small>{status}</small>{content}</div>
}
export function CompanyBusinessContact({ lead, onEmail, compactEvidence = false }: Props) {
  const profile = lead.profile, sourceUrl = profile.contactPage ?? profile.website
  const email = profile.generalEmailEvidence ? contactEmailVerified(lead.company, profile.generalEmail, profile.generalEmailEvidence) && profile.generalEmailEvidence.kind !== 'named-business' : validBusinessEmail(profile.generalEmail) && publicContactUrl(sourceUrl)
  const phone = profile.generalPhoneEvidence ? contactPhoneVerified(lead.company, profile.generalPhone, profile.generalPhoneEvidence) && profile.generalPhoneEvidence.kind !== 'named-business' : publicContactUrl(sourceUrl)
  return <><p className="contact-evidence-note">公司公共入口 · 不归属于具体负责人</p>
    {profile.generalEmail && <><div className="detail-value"><Mail size={15} />{email ? <a href={`mailto:${profile.generalEmail}`} onClick={(event) => onEmail(event, profile.generalEmail!)}>{profile.generalEmail}</a> : <span>{profile.generalEmail} · 待核验</span>}{email && <CopyContact label="公司邮箱" value={profile.generalEmail} />}</div><EvidenceSources collapsed={compactEvidence} label="公共邮箱来源" verified={Boolean(email)} sources={profile.generalEmailEvidence?.sources ?? (sourceUrl ? [{ label: '公司公开业务入口（旧记录）', url: sourceUrl }] : [])} verifiedAt={profile.generalEmailEvidence?.verifiedAt} /></>}
    {profile.generalPhone && <><div className="detail-value"><Phone size={15} />{phone ? <a href={`tel:${profile.generalPhone.replace(/\s/g, '')}`}>{profile.generalPhone}</a> : <span>{profile.generalPhone} · 待核验</span>}{phone && <CopyContact label="公司业务电话" value={profile.generalPhone} />}</div><EvidenceSources collapsed={compactEvidence} label="公共电话来源" verified={Boolean(phone)} sources={profile.generalPhoneEvidence?.sources ?? (sourceUrl ? [{ label: '公司公开业务入口（旧记录）', url: sourceUrl }] : [])} verifiedAt={profile.generalPhoneEvidence?.verifiedAt} /></>}
    {!profile.generalEmail && !profile.generalPhone && <p className="detail-empty">待补公开公司邮箱或业务电话，可先查看官网联系页。</p>}
  </>
}
export function ContactEvidencePanel({ lead, onEmail, compactEvidence = false }: Props) {
  const contacts = [...lead.profile.contacts].sort((a, b) => contactRolePriority(`${a.department ?? ''} ${a.title ?? ''}`) - contactRolePriority(`${b.department ?? ''} ${b.title ?? ''}`))
  return <>
    <section className="company-detail-section contact-evidence-panel" aria-label="联系人分项核验"><h3><UserRound size={17} />负责人及联系证据</h3><p className="contact-evidence-note">采购／供应链、研发／技术优先。身份来源与联系方式来源分别核验；仅有领英入口不计入可发邮件名单。</p>
      {contacts.length ? <div className="contact-detail-grid">{contacts.map((contact, index) => {
        const status = contactAssessment(lead.company, contact)
        const companyInbox = status.email && (contact.emailEvidence?.kind !== 'named-business' || isGenericInbox(contact.email!))
        return <article key={`${contact.name}-${index}`}><strong>{contact.name}</strong><p>{lead.company} · {contact.title ?? '职位待核验'}</p>
          <div className="contact-evidence-badges">{status.labels.map((label) => <span key={label} className={label.includes('待') ? 'pending' : ''}>{label}</span>)}</div>
          <EvidenceSources collapsed={compactEvidence} label="当前任职与职责" sources={contact.identityEvidence?.sources} verifiedAt={contact.identityEvidence?.verifiedAt} verified={status.identity} />
          {status.identity && <p className="contact-responsibilities">职责：{contact.identityEvidence!.responsibilities}</p>}
          {contact.email && <div className="detail-value"><Mail size={14} />{status.namedEmail || companyInbox ? <a href={`mailto:${contact.email}`} onClick={(event) => onEmail(event, contact.email!)}>{contact.email}</a> : <span>{contact.email} · 归属待核验</span>}{(status.namedEmail || companyInbox) && <CopyContact label="业务邮箱" value={contact.email} />}</div>}
          <EvidenceSources collapsed={compactEvidence} label={companyInbox ? '公司／部门邮箱来源（非个人邮箱）' : '具名业务邮箱来源'} sources={contact.emailEvidence?.sources} verifiedAt={contact.emailEvidence?.verifiedAt} verified={status.namedEmail || Boolean(companyInbox)} />
          {contact.phone && <><div className="detail-value"><Phone size={14} />{status.phone ? <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a> : <span>{contact.phone} · 待核验</span>}{status.phone && <CopyContact label="业务电话" value={contact.phone} />}</div><EvidenceSources collapsed={compactEvidence} label="公开业务电话来源" sources={contact.phoneEvidence?.sources} verifiedAt={contact.phoneEvidence?.verifiedAt} verified={status.phone} /></>}
          {status.linkedIn && <a className="detail-inline-link" href={contact.linkedIn} target="_blank" rel="noreferrer"><Linkedin size={14} />个人领英入口</a>}
          {contact.source && <EvidenceSources collapsed={compactEvidence} label={`历史合并来源${contact.verifiedAt ? ` · ${contact.verifiedAt}` : ''}`} sources={[contact.source]} verified={false} />}
          {status.missing.length > 0 && <p className="contact-evidence-missing">待补：{status.missing.join('；')}</p>}
        </article>
      })}</div> : <p className="detail-empty">待找采购／供应链及研发／技术负责人。老板或总经理作为补充入口。</p>}
    </section>
    <section className="company-detail-section contact-evidence-panel"><h3><Mail size={17} />部门业务邮箱</h3>{lead.profile.departmentEmails.length ? <div className="contact-detail-grid">{lead.profile.departmentEmails.map((item) => {
      const verified = item.emailEvidence ? contactEmailVerified(lead.company, item.email, item.emailEvidence) && item.emailEvidence.kind !== 'named-business' : validBusinessEmail(item.email) && Boolean(item.source?.label && publicContactUrl(item.source.url))
      return <article key={`${item.department}-${item.email}`}><strong>{item.department} · 部门入口</strong><div className="detail-value">{verified ? <a href={`mailto:${item.email}`} onClick={(event) => onEmail(event, item.email)}>{item.email}</a> : <span>{item.email} · 待核验</span>}{verified && <CopyContact label="部门邮箱" value={item.email} />}</div><EvidenceSources collapsed={compactEvidence} label="部门邮箱来源" verified={verified} sources={item.emailEvidence?.sources ?? (item.source ? [item.source] : [])} verifiedAt={item.emailEvidence?.verifiedAt} /></article>
    })}</div> : <p className="detail-empty">待补采购、技术等公开部门邮箱。</p>}</section>
  </>
}
