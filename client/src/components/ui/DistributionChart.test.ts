import { describe, expect, it } from 'vitest'
import { transformDistribution } from './DistributionChart'

describe('transformDistribution', () => {
  it('maps "fail" key to "X" label', () => {
    const result = transformDistribution({ fail: 5 })
    expect(result).toEqual([{ label: 'X', count: 5 }])
  })

  it('passes through numeric keys unchanged', () => {
    const result = transformDistribution({ 1: 3, 2: 7 })
    expect(result).toEqual([
      { label: '1', count: 3 },
      { label: '2', count: 7 },
    ])
  })

  it('returns empty array for empty object', () => {
    expect(transformDistribution({})).toEqual([])
  })
})
