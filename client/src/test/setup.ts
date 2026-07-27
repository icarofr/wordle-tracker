import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './msw/server'
import '@testing-library/jest-dom/vitest'

// Node 25 exposes incompatible storage globals in this test environment, so
// provide a stable in-memory Storage implementation for jsdom-backed tests.
function createStorage(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.get(key) ?? null
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, value)
    },
  }
}

const storages = {
  localStorage: createStorage(),
  sessionStorage: createStorage(),
}

for (const [key, storage] of Object.entries(storages) as [keyof typeof storages, Storage][]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: storage,
  })
  Object.defineProperty(window, key, {
    configurable: true,
    value: storage,
  })
}

// jsdom does not implement window.matchMedia — provide a minimal stub
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
