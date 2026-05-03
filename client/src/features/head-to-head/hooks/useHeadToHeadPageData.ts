import type { PreloadKey } from '~/lib/preload'
import type { User } from '~/types'
import { createMemo, createResource } from 'solid-js'
import { wordleApi } from '~/lib/api'
import { useAuth } from '~/lib/auth'
import { consumePreload } from '~/lib/preload'
import { createUsersResource } from '~/lib/resources'
import { selectedOpponentId } from '../opponent'

export function useHeadToHeadPageData() {
  const { user: authUser } = useAuth()
  const users = createUsersResource()

  const currentUser = createMemo(() =>
    users.data()?.find((u: User) => u.id === authUser()?.id),
  )

  const opponent = createMemo(() =>
    users.data()?.find((u: User) => u.id === selectedOpponentId()),
  )

  const [headToHeadData] = createResource(
    () => selectedOpponentId(),
    async id =>
      consumePreload(`h2h:${id}` as PreloadKey, async () =>
        wordleApi.getHeadToHeadConsolidated(id)),
  )

  return {
    headToHeadData,
    currentUser,
    opponent,
    hasOpponent: createMemo(() => !!opponent()),
  }
}
