import { markdownBlocks, markdownText } from '../../lib/customerFollowup'

/** React escapes all uploaded strings, including HTML, URLs and script-like content. */
export function FollowupMarkdown({ markdown, sourceAnchors = false }: { markdown: string; sourceAnchors?: boolean }) {
  return <div className="followup-markdown">{markdownBlocks(markdown).map((block, i) => {
    const anchor = sourceAnchors ? `original-L${block.start}` : undefined
    if (block.kind === 'heading') return block.level < 3 ? <h2 id={anchor} key={i}>{block.text}</h2> : <h3 id={anchor} key={i}>{block.text}</h3>
    if (block.kind === 'table') return <div id={anchor} className="followup-document-table" key={i} role="region" aria-label={markdownText(block.headers.join(' / '))} tabIndex={0}><table><thead><tr>{block.headers.map((cell, j) => <th key={j} scope="col">{markdownText(cell)}</th>)}</tr></thead><tbody>{block.rows.map((row, j) => <tr id={sourceAnchors ? `original-L${block.rowLines[j]}` : undefined} key={j}>{row.map((cell, k) => <td key={k}>{markdownText(cell)}</td>)}</tr>)}</tbody></table></div>
    return <p id={anchor} key={i}>{block.text}</p>
  })}</div>
}
