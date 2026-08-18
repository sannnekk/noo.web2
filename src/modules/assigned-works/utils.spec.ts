import { describe, expect, test } from 'vitest'
import { workIsChecked, workIsSolved } from './utils'

describe('assigned work statuses', () => {
  describe('workIsSolved', () => {
    test('should count both solved statuses as handed in', () => {
      expect(workIsSolved('not-solved')).toBe(false)
      expect(workIsSolved('in-progress')).toBe(false)
      expect(workIsSolved('solved-in-deadline')).toBe(true)
      expect(workIsSolved('solved-after-deadline')).toBe(true)
      expect(workIsSolved(undefined)).toBe(false)
    })
  })

  describe('workIsChecked', () => {
    test('should count every checked status, automatic included, as checked', () => {
      expect(workIsChecked('not-checked')).toBe(false)
      expect(workIsChecked('in-progress')).toBe(false)
      expect(workIsChecked('checked-in-deadline')).toBe(true)
      expect(workIsChecked('checked-after-deadline')).toBe(true)
      expect(workIsChecked('checked-automatically')).toBe(true)
      expect(workIsChecked(undefined)).toBe(false)
    })
  })
})
