import type { PreloadKey } from '~/lib/preload'
import { createFileRoute } from '@tanstack/solid-router'
import { HeadToHeadPage } from '~/features/head-to-head/HeadToHeadPage'
import { selectedOpponentId } from '~/features/head-to-head/opponent'
import { userApi, wordleApi } from '~/lib/api'
import { consumePreload, preload, PRELOAD_KEYS } from '~/lib/preload'

export const Route = createFileRoute('/__auth/head-to-head')({
  component: HeadToHeadPage,
  loader: async () => {
    try {
      const users = await consumePreload(PRELOAD_KEYS.users, userApi.getUsers)
      preload(PRELOAD_KEYS.users, async () => Promise.resolve(users))
      const partnerId = selectedOpponentId()
      if (partnerId) {
        preload(`h2h:${partnerId}` as PreloadKey, async () =>
          wordleApi.getHeadToHeadConsolidated(partnerId))
      }
    }
    catch {
      // Preload failed — resources will fetch on mount
    }
  },
})
