import { assign, formatDate, formatCurrency } from './filters.js'

describe('filters', () => {
  describe('assign (lodash assign re-export)', () => {
    test('merges source properties into target', () => {
      expect(assign({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
    })

    test('overwrites existing properties', () => {
      expect(assign({ a: 1 }, { a: 99 })).toEqual({ a: 99 })
    })

    test('returns the target object', () => {
      const target = {}
      const result = assign(target, { x: 1 })
      expect(result).toBe(target)
    })
  })

  describe('formatDate re-export', () => {
    test('is a function', () => {
      expect(typeof formatDate).toBe('function')
    })

    test('formats a valid ISO date string', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('2024')
    })
  })

  describe('formatCurrency re-export', () => {
    test('is a function', () => {
      expect(typeof formatCurrency).toBe('function')
    })

    test('formats a number as currency', () => {
      const result = formatCurrency(1000)
      expect(result).toMatch(/1,000|1000/)
    })
  })
})
