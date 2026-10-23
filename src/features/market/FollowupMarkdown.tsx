import { markdownBlocks, markdownText } from '../../lib/customerFollowup'

/** React escapes all uploaded strings, including HTML, URLs and script-like content. */
export function FollowupMarkdown({ markdown }: { markdown: string }) {
  return <div className="followup-markdown">{markdownBlocks(markdown).map((block, i) => {
    if (block.kind === 'heading') return block.level < 3 ? <h2 key={i}>{block.text}</h2> : <h3 key={i}>{block.text}</h3>
    if (block.kind === 'table') return <div className="followup-document-table" key={i} role="region" aria-label={markdownText(block.headers.join(' / '))} tabIndex={0}><table><thead><tr>{block.headers.map((cell, j) => <th key={j} scope="col">{markdownText(cell)}</th>)}</tr></thead><tbody>{block.rows.map((row, j) => <tr key={j}>{row.map((cell, k) => <td key={k}>{markdownText(cell)}</td>)}</tr>)}</tbody></table></div>
    return <p key={i}>{block.text}</p>
  })}</div>
}
