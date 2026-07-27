import { describe, expect, it } from 'vitest'
import { labelForTone, normalizeTone } from './ResultBadge'

describe('normalizeTone', () => {
  it('normalizes known tones', () => {
    expect(normalizeTone('win')).toBe('win')
    expect(normalizeTone('loss')).toBe('loss')
    expect(normalizeTone('tie')).toBe('tie')
    expect(normalizeTone('waiting')).toBe('waiting')
  })

  it('is case-insensitive', () => {
    expect(normalizeTone('WIN')).toBe('win')
    expect(normalizeTone('Loss')).toBe('loss')
  })

  it('returns default for unknown tones', () => {
    expect(normalizeTone('unknown')).toBe('default')
    expect(normalizeTone('')).toBe('default')
  })
})

describe('labelForTone', () => {
  it('maps tones to correct labels', () => {
    expect(labelForTone('win')).toBe('W')
    expect(labelForTone('loss')).toBe('L')
    expect(labelForTone('tie')).toBe('D')
    expect(labelForTone('waiting')).toBe('?')
    expect(labelForTone('default')).toBe('#')
  })
})
