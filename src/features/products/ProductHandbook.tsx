import { suppliedTds } from '../../lib/waterborneProductCatalog'
import { Fragment } from 'react'
import { getProductChapter, handbookChapters, productHandbook } from '../../lib/productHandbook'

function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g).map((part, index) => {
    if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
    return link ? <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a> : part
  })
}

export function HandbookText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/)
  return <div className="handbook-text">{blocks.map((block, index) => {
    const lines = block.split('\n')
    if (block.startsWith('|')) {
      const rows = lines.filter((line) => !/^\|[\s:|-]+\|$/.test(line)).map((line) => line.split('|').slice(1, -1))
      return <div className="table-wrap" key={index}><table><thead><tr>{rows[0].map((cell, i) => <th key={i}>{inline(cell.trim())}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{inline(cell.trim())}</td>)}</tr>)}</tbody></table></div>
    }
    if (/^#### /.test(block)) return <h4 key={index}>{inline(block.replace(/^#### /, ''))}</h4>
    if (block.startsWith('> ')) return <blockquote key={index}>{lines.map((line, i) => <Fragment key={i}>{inline(line.replace(/^> ?/, ''))}<br /></Fragment>)}</blockquote>
    if (/^- /.test(block)) return <ul key={index}>{lines.map((line, i) => <li key={i}>{inline(line.replace(/^- (?:\[ \] )?/, ''))}</li>)}</ul>
    if (/^\d+\. /.test(block)) return <ol key={index}>{lines.map((line, i) => <li key={i}>{inline(line.replace(/^\d+\. /, ''))}</li>)}</ol>
    if (block === '---') return <hr key={index} />
    return <p key={index}>{lines.map((line, i) => <Fragment key={i}>{inline(line)}{i < lines.length - 1 && <br />}</Fragment>)}</p>
  })}</div>
}

function Sections({ body, compactParameters = false }: { body: string; compactParameters?: boolean }) {
  const [intro, ...sections] = body.split(/^### /m)
  return <>{intro.trim() && <HandbookText text={intro} />}{sections.map((section, index) => {
    const newline = section.indexOf('\n')
    return <details className="handbook-section" key={index} open={index === 0}><summary>{section.slice(0, newline)}</summary><HandbookText text={compactParameters && /^(2\.3|3\.4|4\.3) /.test(section) ? section.slice(newline + 1).replace(/(?:^\|.*\n?)+/gm, '参数数值、含义与核验状态统一见上方技术参数表。') : section.slice(newline + 1)} /></details>
  })}</>
}

function download() {
  const url = URL.createObjectURL(new Blob([productHandbook], { type: 'text/markdown;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = '六类核心产品_外贸入门学习手册.md'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function ProductHandbook({ productId }: { productId: string }) {
  const chapter = getProductChapter(productId)
  const tds = suppliedTds[productId as keyof typeof suppliedTds]
  return <section className="detail-section" key={productId} id="product-handbook"><h3>产品学习手册 <span>2026年11月27日 · 六产品资料整理</span></h3><p className="muted">按章节展开：产品原理、参数含义、应用判断、包装储存、英文介绍和询盘问题。</p>{['cpp-cpo', 'nl-w1201'].includes(productId) && <Sections body={handbookChapters.find((item) => item.title.startsWith('十二、'))?.body ?? ''} />}{chapter && <Sections body={chapter.body} compactParameters />}<details className="handbook-section"><summary>产品总览与共同学习资料</summary>{handbookChapters.filter((item) => !/^(?:二|三|四|十一|十三|十四)、/.test(item.title)).map((item) => <details className="handbook-section" key={item.title}><summary>{item.title}</summary>{item.body.includes('### ') ? <Sections body={item.body} /> : <HandbookText text={item.body} />}</details>)}</details><button className="secondary-button" onClick={download}>下载完整学习手册</button>{tds && <a className="secondary-button" href={`${import.meta.env.BASE_URL}${tds.file}`} download>{tds.label} · 下载原始文件</a>}</section>
}
