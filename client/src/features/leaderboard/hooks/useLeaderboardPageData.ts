import { createMemo, createResource } from 'solid-js'
import { wordleApi } from '~/lib/api'
import { useAuth } from '~/lib/auth'
import { consumePreload, PRELOAD_KEYS } from '~/lib/preload'

export function useLeaderboardPageData() {
  const { user: authUser } = useAuth()

  const [data, { refetch }] = createResource(async () =>
    consumePreload(PRELOAD_KEYS.leaderboard, wordleApi.getLeaderboard),
  )

  return {
    data,
    refetch,
    currentUser: authUser,
    isPending: createMemo(() => data.loading),
    isError: createMemo(() => !!data.error),
    leaderboardData: createMemo(() => data()?.items ?? []),
    sharedWordles: createMemo(() => data()?.shared_wordles ?? 0),
  }
}
