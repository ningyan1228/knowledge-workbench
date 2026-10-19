/** Bound clipboard permission waits and support browsers without the async API. */
export async function copyPlainText(text: string, signal?: AbortSignal): Promise<boolean> {
  if (signal?.aborted) return false
  if (navigator.clipboard?.writeText) {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Clipboard timeout')), 2000) }),
      ])
      return true
    } catch {
      // A denied permission or expired user gesture can still allow a selected-text copy.
    } finally { clearTimeout(timer) }
  }
  if (signal?.aborted) return false
  const previousFocus = document.activeElement as HTMLElement | null
  const selection = document.getSelection()
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : []
  const field = document.createElement('textarea')
  field.value = text
  field.readOnly = true
  field.setAttribute('aria-label', '待复制的开发信')
  field.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none'
  document.body.appendChild(field)
  try {
    field.focus({ preventScroll: true })
    field.select()
    return document.execCommand('copy')
  } catch { return false } finally {
    field.remove()
    previousFocus?.focus({ preventScroll: true })
    if (selection) {
      selection.removeAllRanges()
      ranges.forEach((range) => selection.addRange(range))
    }
  }
}
