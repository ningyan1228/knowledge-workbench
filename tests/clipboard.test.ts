import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyPlainText } from '../src/lib/clipboard'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

function browser(writeText?: (text: string) => Promise<void>, fallback = true) {
  const field = { value: '', readOnly: false, style: { cssText: '' }, setAttribute: vi.fn(), focus: vi.fn(), select: vi.fn(), remove: vi.fn() }
  const focus = vi.fn()
  const command = vi.fn(() => fallback)
  vi.stubGlobal('navigator', { clipboard: writeText ? { writeText } : undefined })
  vi.stubGlobal('document', {
    activeElement: { focus }, getSelection: () => null,
    createElement: () => field, body: { appendChild: vi.fn() }, execCommand: command,
  })
  return { field, focus, command }
}

describe('plain-text clipboard recovery', () => {
  it('copies the exact subject and body with the modern API', async () => {
    const write = vi.fn(async () => {})
    const { command } = browser(write)
    const text = 'Subject: Hello\n\nHi Team,\n中文与 English'
    expect(await copyPlainText(text)).toBe(true)
    expect(write).toHaveBeenCalledWith(text)
    expect(command).not.toHaveBeenCalled()
  })

  it.each(['absent', 'denied', 'throws'])('uses a selected-text fallback when the modern API is %s', async (mode) => {
    const write = mode === 'absent' ? undefined : mode === 'denied'
      ? vi.fn(async () => { throw new Error('NotAllowedError') })
      : vi.fn(() => { throw new Error('Unavailable') })
    const { field, focus, command } = browser(write)
    expect(await copyPlainText('Subject: Hello\n\nBody')).toBe(true)
    expect(field.value).toBe('Subject: Hello\n\nBody')
    expect(field.select).toHaveBeenCalled()
    expect(command).toHaveBeenCalledWith('copy')
    expect(field.remove).toHaveBeenCalled()
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('returns failure instead of claiming success when the browser denies both methods', async () => {
    const { field } = browser(async () => { throw new Error('Denied') }, false)
    expect(await copyPlainText('Body')).toBe(false)
    expect(field.remove).toHaveBeenCalled()
  })

  it('bounds a clipboard permission prompt that never resolves', async () => {
    vi.useFakeTimers()
    const { command } = browser(() => new Promise(() => {}))
    const result = copyPlainText('Body')
    await vi.advanceTimersByTimeAsync(2000)
    expect(await result).toBe(true)
    expect(command).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not launch a fallback for a drawer closed during a pending clipboard attempt', async () => {
    let reject!: (error: Error) => void
    const { command } = browser(() => new Promise((_, failure) => { reject = failure }))
    const controller = new AbortController()
    const result = copyPlainText('Body', controller.signal)
    controller.abort()
    reject(new Error('Denied'))
    expect(await result).toBe(false)
    expect(command).not.toHaveBeenCalled()
  })
})
