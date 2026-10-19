import { describe, expect, it } from 'vitest'
import { leadMapFocusAnchor } from '../src/lib/leadMapFocus'

const map = { left: 368, top: 460, width: 824, height: 700 }
const viewport = { width: 1705, height: 1230 }
describe('selected company remains visible beside its detail drawer', () => {
  it('keeps an unobstructed map centered', () => {
    expect(leadMapFocusAnchor(map, viewport)).toEqual([.5, .5])
  })
  it('uses the visible left part when the detail drawer covers the right part', () => {
    const anchor = leadMapFocusAnchor(map, viewport, { left: 780, top: 0, width: 925, height: 1230 })
    expect(anchor).toEqual([.25, .5])
    expect(map.left + map.width * anchor[0]).toBe(574)
  })
  it('accounts for viewport clipping and scaled screen rectangles', () => {
    const anchor = leadMapFocusAnchor({ left: 100, top: 300, width: 1000, height: 1000 }, { width: 1600, height: 900 }, { left: 600, top: 0, width: 1000, height: 900 })
    expect(anchor).toEqual([.25, .3])
  })
  it('does not offset for a drawer outside the map or for full phone coverage', () => {
    expect(leadMapFocusAnchor(map, viewport, { left: 1250, top: 0, width: 455, height: 1230 })).toEqual([.5, .5])
    expect(leadMapFocusAnchor(map, viewport, { left: 780, top: 1200, width: 925, height: 30 })).toEqual([.5, .5])
    expect(leadMapFocusAnchor(map, viewport, { left: 0, top: 0, width: 1705, height: 1230 })).toEqual([.5, .5])
  })
})
