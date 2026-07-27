import type { LookupSearch } from '~/types'
import { createFileRoute } from '@tanstack/solid-router'
import { LookupPage } from '~/features/lookup/LookupPage'
import { wordleApi } from '~/lib/api'
import { preload, PRELOAD_KEYS } from '~/lib/preload'

export const Route = createFileRoute('/__auth/lookup')({
  validateSearch: (search: Record<string, unknown>): LookupSearch => {
    const parsed
      = typeof search.wordleId === 'string' || typeof search.wordleId === 'number'
        ? Number(search.wordleId)
        : undefined
    const view = search.view === 'list' ? 'list' : undefined

    return {
      wordleId:
        parsed && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined,
      view,
    }
  },
  component: LookupPage,
  loader: () => {
    preload(PRELOAD_KEYS.archive, wordleApi.getArchive)
  },
})
