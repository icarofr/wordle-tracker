import { describe, expect, it } from 'vitest'
import { calculateComparisonBar } from './StatsComparison'

describe('calculateComparisonBar', () => {
  it('returns 50/50 for equal values', () => {
    const { userBar, opponentBar } = calculateComparisonBar(10, 10)
    expect(userBar).toBe(50)
    expect(opponentBar).toBe(50)
  })

  it('returns 50/50 for zero total', () => {
    const { userBar, opponentBar } = calculateComparisonBar(0, 0)
    expect(userBar).toBe(50)
    expect(opponentBar).toBe(50)
  })

  it('calculates correct percentages', () => {
    const { userBar, opponentBar } = calculateComparisonBar(75, 25)
    expect(userBar).toBe(75)
    expect(opponentBar).toBe(25)
  })

  it('flips bars when higherIsWorse', () => {
    // User has 4.0 avg, opponent has 3.0 avg → opponent is better
    // Bars should show opponent as "winning" (larger bar)
    const { userBar, opponentBar } = calculateComparisonBar(4, 3, true)
    // User bar gets opponent value, opponent bar gets user value
    expect(userBar).toBeCloseTo((3 / 7) * 100)
    expect(opponentBar).toBeCloseTo((4 / 7) * 100)
  })

  it('handles one side being zero', () => {
    const { userBar, opponentBar } = calculateComparisonBar(10, 0)
    expect(userBar).toBe(100)
    expect(opponentBar).toBe(0)
  })
})
