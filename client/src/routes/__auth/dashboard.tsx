import { createFileRoute } from '@tanstack/solid-router'
import { DashboardPage } from '~/features/dashboard/DashboardPage'
import { wordleApi } from '~/lib/api'
import { preload, PRELOAD_KEYS } from '~/lib/preload'

export const Route = createFileRoute('/__auth/dashboard')({
  component: DashboardPage,
  loader: () => {
    preload(PRELOAD_KEYS.stats, wordleApi.getStats)
    preload(PRELOAD_KEYS.archive, wordleApi.getArchive)
  },
})
