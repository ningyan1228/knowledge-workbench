import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react'
import './CompanyDetailSections.css'

const sections = [
  { id: 'overview', label: '概览与联系' },
  { id: 'outreach', label: '开发信与跟进' },
  { id: 'evidence', label: '核验资料' },
] as const
export type CompanyDetailSectionId = typeof sections[number]['id']
export type CompanyDetailOpenTarget = 'overview' | 'outreach' | 'contacts' | 'send-record'

export function CompanyDetailSections({ overview, outreach, evidence, bodyRef, note, dirty, active, onSectionChange }: {
  overview: ReactNode; outreach: ReactNode; evidence: ReactNode;
  bodyRef: RefObject<HTMLDivElement | null>; note: ReactNode; dirty: boolean;
  active: CompanyDetailSectionId; onSectionChange: (section: CompanyDetailSectionId) => void;
}) {
  const positions = useRef<Record<CompanyDetailSectionId, number>>({ overview: 0, outreach: 0, evidence: 0 })
  const tabs = useRef<HTMLDivElement>(null)
  const select = (next: CompanyDetailSectionId) => {
    if (next === active) return
    positions.current[active] = bodyRef.current?.scrollTop ?? 0
    onSectionChange(next)
  }
  useLayoutEffect(() => { bodyRef.current?.scrollTo({ top: positions.current[active], behavior: 'instant' }) }, [active, bodyRef])
  const disclose = (open: boolean) => {
    bodyRef.current?.querySelectorAll<HTMLDetailsElement>(`#company-panel-${active} details`).forEach((details) => { details.open = open })
  }
  const panels = { overview, outreach, evidence }
  return <>
    <div className="company-detail-tabs" ref={tabs} role="tablist" aria-label="客户详情内容">
      {sections.map((section, index) => <button key={section.id} id={`company-tab-${section.id}`} type="button" role="tab" aria-selected={active === section.id} aria-controls={`company-panel-${section.id}`} tabIndex={active === section.id ? 0 : -1}
        onClick={() => select(section.id)} onKeyDown={(event) => {
          const next = event.key === 'ArrowRight' ? (index + 1) % sections.length : event.key === 'ArrowLeft' ? (index + sections.length - 1) % sections.length : event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : null
          if (next === null) return
          event.preventDefault()
          select(sections[next].id)
          tabs.current?.querySelector<HTMLButtonElement>(`#company-tab-${sections[next].id}`)?.focus()
        }}>{section.label}{section.id === 'outreach' && dirty && <span className="company-unsaved-indicator">未保存</span>}</button>)}
    </div>
    <div className="company-detail-body" ref={bodyRef}>
      {sections.map((section) => <section key={section.id} id={`company-panel-${section.id}`} role="tabpanel" aria-labelledby={`company-tab-${section.id}`} hidden={active !== section.id} tabIndex={0} className="company-detail-tabpanel">
        {section.id === 'evidence' && <div className="company-disclosure-tools"><span>完整核验内容均保留，可按需展开。</span><button type="button" onClick={() => disclose(true)}>展开全部</button><button type="button" onClick={() => disclose(false)}>收起全部</button></div>}
        {panels[section.id]}
      </section>)}
      <p className="company-detail-note">{note}</p>
    </div>
  </>
}
