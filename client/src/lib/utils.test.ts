import { describe, expect, it } from 'vitest'
import { classNames, formatDate } from './utils'

describe('formatDate', () => {
  it('returns em dash for null', () => {
    expect(formatDate(null)).toBe('\u2014')
  })

  it('returns em dash for undefined', () => {
    expect(formatDate(undefined)).toBe('\u2014')
  })

  it('returns em dash for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('\u2014')
  })

  it('returns em dash for year before 2000', () => {
    expect(formatDate('1999-12-31')).toBe('\u2014')
  })

  it('formats valid date string', () => {
    const result = formatDate('2026-01-15T10:30:00Z')
    expect(result).toBeTruthy()
    expect(result).not.toBe('\u2014')
  })

  it('formats Date object', () => {
    const result = formatDate(new Date('2026-01-15T10:30:00Z'))
    expect(result).toBeTruthy()
    expect(result).not.toBe('\u2014')
  })

  it('respects custom options', () => {
    const result = formatDate('2026-01-15', { year: 'numeric', month: 'long' })
    expect(result).toContain('2026')
  })
})

describe('classNames', () => {
  it('joins truthy strings', () => {
    expect(classNames('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(classNames('a', false, undefined, 'b', '')).toBe('a b')
  })

  it('returns empty string for no truthy values', () => {
    expect(classNames(false, undefined)).toBe('')
  })
})
