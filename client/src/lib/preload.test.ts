import type { PreloadKey } from './preload'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { consumePreload, preload } from './preload'

describe('preload', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('caches a fetch promise', async () => {
    const fetcher = vi.fn().mockResolvedValue('data')
    preload('test-key' as PreloadKey, fetcher)
    expect(fetcher).toHaveBeenCalledOnce()

    // Second call within TTL should not re-fetch
    preload('test-key' as PreloadKey, fetcher)
    expect(fetcher).toHaveBeenCalledOnce()
  })

  it('re-fetches after TTL expires', async () => {
    const fetcher = vi.fn().mockResolvedValue('data')
    preload('ttl-key' as PreloadKey, fetcher)
    expect(fetcher).toHaveBeenCalledOnce()

    // Advance past 30s TTL
    vi.advanceTimersByTime(31_000)

    preload('ttl-key' as PreloadKey, fetcher)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
})

describe('consumePreload', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns cached data and deletes entry (single-use)', async () => {
    const fetcher = vi.fn().mockResolvedValue('cached-data')
    preload('consume-key' as PreloadKey, fetcher)

    // First consume returns cached
    const result = await consumePreload('consume-key' as PreloadKey, fetcher)
    expect(result).toBe('cached-data')

    // Second consume should re-fetch (cache was deleted)
    const fetcher2 = vi.fn().mockResolvedValue('fresh-data')
    const result2 = await consumePreload('consume-key' as PreloadKey, fetcher2)
    expect(result2).toBe('fresh-data')
    expect(fetcher2).toHaveBeenCalledOnce()
  })

  it('falls back to fetcher when nothing cached', async () => {
    const fetcher = vi.fn().mockResolvedValue('fallback-data')
    const result = await consumePreload('no-cache-key' as PreloadKey, fetcher)
    expect(result).toBe('fallback-data')
    expect(fetcher).toHaveBeenCalledOnce()
  })

  it('falls back to fetcher when cache is stale', async () => {
    const fetcher = vi.fn().mockResolvedValue('stale')
    preload('stale-key' as PreloadKey, fetcher)

    vi.advanceTimersByTime(31_000)

    const freshFetcher = vi.fn().mockResolvedValue('fresh')
    const result = await consumePreload('stale-key' as PreloadKey, freshFetcher)
    expect(result).toBe('fresh')
    expect(freshFetcher).toHaveBeenCalledOnce()
  })
})
