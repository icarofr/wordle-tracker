import { describe, expect, it } from 'vitest'
import { getWordlePlayUrl, scoreLabel, scoreToNumber, wordleIdToDate } from './wordle'

describe('wordleIdToDate', () => {
  it('maps Wordle #1 to 2021-06-20', () => {
    const date = wordleIdToDate(1)
    expect(date.getFullYear()).toBe(2021)
    expect(date.getMonth()).toBe(5) // June is 5 (0-indexed)
    expect(date.getDate()).toBe(20)
  })

  it('maps Wordle #500 to 2022-11-01', () => {
    const date = wordleIdToDate(500)
    expect(date.getFullYear()).toBe(2022)
    expect(date.getMonth()).toBe(10) // November is 10 (0-indexed)
    expect(date.getDate()).toBe(1)
  })

  it('maps Wordle #1000 to 2024-03-15', () => {
    const date = wordleIdToDate(1000)
    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(2) // March is 2 (0-indexed)
    expect(date.getDate()).toBe(15)
  })
})

describe('getWordlePlayUrl', () => {
  it('returns NYT URL for today\'s puzzle', () => {
    const now = new Date()
    // Calculate today's wordle ID from epoch
    const epoch = new Date('2021-06-19T00:00:00')
    const diffDays = Math.floor((now.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24))

    const url = getWordlePlayUrl(diffDays)
    expect(url).toBe('https://www.nytimes.com/games/wordle/index.html')
  })

  it('returns wordlereplay URL for past puzzles', () => {
    const url = getWordlePlayUrl(1)
    expect(url).toBe('https://wordlereplay.com/?date=2021-06-20')
  })

  it('formats date with zero-padded month and day', () => {
    // Wordle #1 = 2021-06-20 (month 06, day 20)
    const url = getWordlePlayUrl(1)
    expect(url).toContain('2021-06-20')
  })
})

describe('scoreToNumber', () => {
  it('converts "X" to 7', () => {
    expect(scoreToNumber('X')).toBe(7)
  })

  it('converts numeric scores', () => {
    expect(scoreToNumber('1')).toBe(1)
    expect(scoreToNumber('3')).toBe(3)
    expect(scoreToNumber('6')).toBe(6)
  })

  it('returns 0 for garbage input', () => {
    expect(scoreToNumber('')).toBe(0)
    expect(scoreToNumber('abc')).toBe(0)
  })
})

describe('scoreLabel', () => {
  it('formats X as X/6', () => {
    expect(scoreLabel('X')).toBe('X/6')
  })

  it('formats numeric scores as N/6', () => {
    expect(scoreLabel('3')).toBe('3/6')
    expect(scoreLabel('1')).toBe('1/6')
  })
})
