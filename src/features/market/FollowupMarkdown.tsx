import { useContext } from 'react'
import { markdownBlocks, markdownText } from '../../lib/customerFollowup'
import { followupReferenceIds, internalFollowupKey, visibleFollowupText } from '../../lib/followupIdentity'
import { FollowupClientLink, FollowupReferenceContext, FollowupText } from './FollowupReferences'

/** React escapes all uploaded strings, including HTML, URLs and script-like content. */
export function FollowupMarkdown({ markdown, sourceAnchors = false }: { markdown: string; sourceAnchors?: boolean }) {
  const state = useContext(FollowupReferenceContext), identities = state?.document.identities ?? []
  const blocks = markdownBlocks(markdown)
  const head = /^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(markdown)?.[0]
  const headLines = head ? head.trimEnd().split(/\r?\n/).length : 0
  let owner: string | null = null
  return <div className="followup-markdown">{blocks.map((block, i) => {
    const anchor = sourceAnchors ? `original-L${block.start}` : undefined
    if (headLines && block.start <= headLines && state) return i === 0 ? <p id={anchor} key={i}>源文件版本元数据已保留，内部关联映射可在“Markdown源文本”查看。</p> : null
    if (!visibleFollowupText(block.raw)) {
      const id = internalFollowupKey(block.raw)
      if (/master_record:\s*true/.test(block.raw) && id) owner = id
      return sourceAnchors ? <span key={i} id={anchor} aria-hidden="true" /> : null
    }
    if (block.kind === 'heading') {
      const ids = followupReferenceIds(block.text, identities)
      if (block.level === 2) owner = null
      if (block.level === 3 && ids.length === 1) owner = ids[0]
      const known = identities.find(identity => identity.id === owner)
      const content = /^C\d+[｜|]|^D\d+[｜|]/.test(block.text) && known ? <FollowupClientLink id={known.id} context={block.text} explicit={known.displayName} /> : ids.length === 1 && visibleFollowupText(block.text) === identities.find(identity => identity.id === ids[0])?.displayName ? <FollowupClientLink id={ids[0]} explicit={block.text} /> : <FollowupText text={markdownText(block.text)} />
      return block.level < 3 ? <h2 id={anchor} key={i}>{content}</h2> : <h3 id={anchor} key={i}>{content}</h3>
    }
    if (block.kind === 'table') return <div id={anchor} className="followup-document-table" key={i} role="region" aria-label={markdownText(block.headers.join(' / '))} tabIndex={0}><table><thead><tr>{block.headers.map((cell, j) => <th key={j} scope="col">{state && /^(?:编号|客户编号)$/.test(cell) ? '客户公司／联系人 · 对应产品' : markdownText(cell)}</th>)}</tr></thead><tbody>{block.rows.map((row, j) => {
      if (state && /^(?:编号|客户编号|内部客户键)$/.test(row[0]?.trim()) && internalFollowupKey(row[1] ?? '')) return sourceAnchors ? <tr key={j} id={`original-L${block.rowLines[j]}`} aria-hidden="true" /> : null
      const record = row.join(' '), recordOwner = identities.find(identity => identity.id === owner)
      return <tr id={sourceAnchors ? `original-L${block.rowLines[j]}` : undefined} key={j}>{row.map((cell, k) => {
        const ids = followupReferenceIds(cell, identities), header = (block.headers[k] ?? '').replace(/\s/g, '')
        const customerColumn = /^(?:客户|对象|编号|#)$/.test(header) || /^客户(?:公司|显示名称|编号|[\/／]项目)/.test(header)
        const rowProject = k === 0 && recordOwner?.projects.some(p => record.includes(p.product)) && !customerColumn
        const containsLabel = ids.some(id => { const identity = identities.find(i => i.id === id)!; return [identity.displayName, ...identity.projects.map(p => p.displayName)].some(label => cell.includes(label)) })
        const preserveCell = /\b[CD]\d+\b/.test(visibleFollowupText(cell)) || containsLabel
        return <td key={k}>{customerColumn && ids.length && !preserveCell ? ids.map((id, n) => <span key={id}>{n > 0 && ' / '}<FollowupClientLink id={id} context={record} explicit={cell} /></span>) : <>{rowProject && <><FollowupClientLink id={recordOwner!.id} context={record} /><br /></>}<FollowupText text={markdownText(cell)} context={record} /></>}</td>
      })}</tr>
    })}</tbody></table></div>
    return <p id={anchor} key={i}><FollowupText text={markdownText(block.text)} /></p>
  })}</div>
}
