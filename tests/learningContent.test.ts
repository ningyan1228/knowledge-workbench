import { describe, expect, it } from 'vitest'
import { lessonById, lessons, stages, usdPerKg } from '../src/lib/learningContent'

describe('learning route content', () => {
  it('ships eight stages, forty direct lessons, and the four required teaching exercises', () => {
    expect(stages).toHaveLength(8)
    expect(lessons).toHaveLength(40)
    expect(lessons.map((lesson) => lesson.id)).toEqual(Array.from({ length: 40 }, (_, index) => `L${String(index + 1).padStart(2, '0')}`))
    for (const id of ['L03', 'L08', 'L11', 'L39']) expect(lessonById[id].exercise.reference).not.toHaveLength(0)
  })

  it('keeps the L11 teaching unit conversion decimal-safe and never implies volume-to-weight conversion', () => {
    expect(usdPerKg('3065')).toBe('3.065')
    expect(lessonById.L11.exercise.reference).toContain('未知密度时不能将 mL 转 kg')
  })
})
