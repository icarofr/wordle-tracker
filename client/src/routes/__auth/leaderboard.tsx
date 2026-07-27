import { createFileRoute } from '@tanstack/solid-router'
import { LeaderboardPage } from '~/features/leaderboard/LeaderboardPage'
import { wordleApi } from '~/lib/api'
import { preload, PRELOAD_KEYS } from '~/lib/preload'

export const Route = createFileRoute('/__auth/leaderboard')({
  component: LeaderboardPage,
  loader: () => {
    preload(PRELOAD_KEYS.leaderboard, wordleApi.getLeaderboard)
  },
})
