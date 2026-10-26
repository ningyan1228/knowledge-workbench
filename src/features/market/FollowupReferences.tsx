import { createContext, useContext, type ReactNode } from 'react'
import { followupDisplayLabel, visibleFollowupText } from '../../lib/followupIdentity'
import type { FollowupDocument } from '../../lib/customerFollowup'

export const FollowupReferenceContext = createContext<{ document: FollowupDocument; onOpen: (id: string, label: string) => void } | null>(null)

export function FollowupClientLink({ id, context = '', explicit = '' }: { id: string; context?: string; explicit?: string }) {
  const state = useContext(FollowupReferenceContext)
  const identity = state?.document.identities.find(i => i.id === id)
  if (!identity || !state) return <>{id}</>
  const label = followupDisplayLabel(identity, context, explicit)
  return <button type="button" className="followup-client-link" data-customer-ref={id} onClick={event => { event.stopPropagation(); state.onOpen(id, label) }}>{label}</button>
}

/** Substitute only known internal keys; the source string and database IDs stay untouched. */
export function FollowupText({ text, context = '' }: { text: string; context?: string }) {
  const state = useContext(FollowupReferenceContext), visible = visibleFollowupText(text)
  if (!state) return <>{visible}</>
  const parts: ReactNode[] = []
  const pattern = /\b([CD]\d+)(-(?:T\d+|E[\w-]+|history-L\d+|suggested-L\d+))?\b/g
  let cursor = 0
  const matches: { index: number; length: number; id: string; suffix?: string; explicit?: string }[] = []
  for (const match of visible.matchAll(pattern)) {
    if (!state.document.identities.some(i => i.id === match[1])) continue
    matches.push({ index: match.index, length: match[0].length, id: match[1], suffix: match[2] })
  }
  for (const identity of state.document.identities) for (const label of [identity.displayName, ...identity.projects.map(p => p.displayName)]) {
    let from = 0, index = visible.indexOf(label, from)
    while (index >= 0) { matches.push({ index, length: label.length, id: identity.id, explicit: label }); from = index + label.length; index = visible.indexOf(label, from) }
  }
  for (const match of matches.sort((a, b) => a.index - b.index || b.length - a.length)) {
    if (match.index < cursor) continue
    parts.push(visible.slice(cursor, match.index), <FollowupClientLink key={`${match.index}-${match.id}`} id={match.id} context={context || visible} explicit={match.explicit} />)
    if (match.suffix?.startsWith('-T')) parts.push(` · 任务${match.suffix.slice(2)}`)
    else if (match.suffix?.startsWith('-E')) parts.push(` · 事件${match.suffix.slice(2)}`)
    cursor = match.index + match.length
  }
  parts.push(visible.slice(cursor))
  return <>{parts}</>
}
