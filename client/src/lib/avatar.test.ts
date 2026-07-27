import { describe, expect, it } from 'vitest'
import { getAvatarUrl } from './avatar'

describe('getAvatarUrl', () => {
  it('returns default avatar 01 when undefined', () => {
    expect(getAvatarUrl()).toBe('/assets/avatars/01.webp')
  })

  it('returns default avatar 01 when empty string', () => {
    expect(getAvatarUrl('')).toBe('/assets/avatars/01.webp')
  })

  it('returns avatar URL for given ID', () => {
    expect(getAvatarUrl('05')).toBe('/assets/avatars/05.webp')
    expect(getAvatarUrl('25')).toBe('/assets/avatars/25.webp')
  })
})
