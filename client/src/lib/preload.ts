export const PRELOAD_KEYS = {
  users: 'users',
  stats: 'stats',
  archive: 'archive',
  leaderboard: 'leaderboard',
  headToHead: 'headToHead',
} as const

export type PreloadKey = typeof PRELOAD_KEYS[keyof typeof PRELOAD_KEYS]

const cache = new Map<string, { promise: Promise<any>, timestamp: number }>()
const TTL = 30_000 // 30s — preloaded data is fresh enough for navigation

export function preload(key: PreloadKey, fetcher: () => Promise<any>) {
  const existing = cache.get(key)
  if (existing && Date.now() - existing.timestamp < TTL)
    return
  cache.set(key, { promise: fetcher(), timestamp: Date.now() })
}

export async function consumePreload<T>(
  key: PreloadKey,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < TTL) {
    cache.delete(key)
    return cached.promise as Promise<T>
  }
  cache.delete(key)
  return fetcher()
}
