import handbook from '../content/core-products-handbook.md?raw'

export const productHandbook = handbook.replace(/\r\n/g, '\n')
export const handbookChapters = productHandbook.split(/^## /m).slice(1).map((chapter) => {
  const newline = chapter.indexOf('\n')
  return { title: chapter.slice(0, newline), body: chapter.slice(newline + 1).trim() }
})

const productChapters: Record<string, string> = { 'nl-w1201': '二、', elo: '三、', 'fertilizer-coating': '四、' }
export function getProductChapter(id: string) {
  return handbookChapters.find((chapter) => chapter.title.startsWith(productChapters[id] ?? '__'))
}

export function getHandbookSpecs(id: string) {
  const body = getProductChapter(id)?.body ?? ''
  const parameterSection = body.split(/^### /m).find((section) => /^(2\.3|3\.4|4\.3) /.test(section)) ?? ''
  return parameterSection.split('\n').filter((line) => line.startsWith('|') && !line.includes('|---') && !line.startsWith('| 项目')).map((line) => {
    const [name, originalValue, meaning, caution] = line.split('|').slice(1, -1).map((cell) => cell.trim())
    return { name, originalValue, note: [meaning, caution].filter(Boolean).join('；'), reviewStatus: 'needs_review' as const }
  })
}

export function getFactoryTasks(id: string) {
  const chapter = handbookChapters.find((item) => item.title.startsWith('七、'))?.body ?? ''
  const heading = { 'nl-w1201': 'W1201', elo: 'ELO', 'fertilizer-coating': '肥料包膜原料' }[id]
  return chapter.split(/^### /m).find((section) => section.startsWith(`${heading}\n`))?.split('\n').filter((line) => line.startsWith('- [ ] ')).map((line) => line.slice(6)) ?? []
}
