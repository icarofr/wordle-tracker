import type { User } from '~/types'
import { createEffect, createMemo, createRoot, createSignal } from 'solid-js'
import { useAuth } from '~/lib/auth'
import { createUsersResource } from '~/lib/resources'

function createOpponentStore() {
  const [selectedOpponentId, setSelectedOpponentId] = createSignal<
    number | undefined
  >()
  const [selectedOpponentOwnerId, setSelectedOpponentOwnerId] = createSignal<
    number | undefined
  >()

  return {
    selectedOpponentId,
    setSelectedOpponentId,
    selectedOpponentOwnerId,
    setSelectedOpponentOwnerId,
  }
}

const opponentStore = createRoot(createOpponentStore)

export const selectedOpponentId = opponentStore.selectedOpponentId

const storageKey = (userId: number) => `selected_opponent:${userId}`

function readStoredOpponent(userId: number | undefined): number | undefined {
  if (!userId || typeof localStorage === 'undefined') {
    return undefined
  }

  const raw = localStorage.getItem(storageKey(userId))
  if (!raw) {
    return undefined
  }

  const parsed = Number.parseInt(raw, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

function writeStoredOpponent(
  userId: number | undefined,
  opponentId: number | undefined,
) {
  if (!userId || typeof localStorage === 'undefined') {
    return
  }

  if (opponentId === undefined) {
    localStorage.removeItem(storageKey(userId))
    return
  }

  localStorage.setItem(storageKey(userId), String(opponentId))
}

export function selectOpponent(
  opponentId: number | undefined,
  userId: number | undefined,
) {
  opponentStore.setSelectedOpponentId(opponentId)
  opponentStore.setSelectedOpponentOwnerId(userId)
  writeStoredOpponent(userId, opponentId)
}

export function syncSelectedOpponent(
  opponents: User[],
  userId: number | undefined,
) {
  if (opponentStore.selectedOpponentOwnerId() !== userId) {
    opponentStore.setSelectedOpponentOwnerId(userId)
    opponentStore.setSelectedOpponentId(readStoredOpponent(userId))
  }

  const currentSelectedOpponentId = opponentStore.selectedOpponentId()
  const hasSelectedOpponent = opponents.some(
    opponent => opponent.id === currentSelectedOpponentId,
  )
  if (hasSelectedOpponent) {
    return
  }

  const storedOpponentId = readStoredOpponent(userId)
  if (
    storedOpponentId
    && opponents.some(opponent => opponent.id === storedOpponentId)
  ) {
    selectOpponent(storedOpponentId, userId)
    return
  }

  if (opponents.length === 1) {
    selectOpponent(opponents[0].id, userId)
    return
  }

  selectOpponent(undefined, userId)
}

export function useOpponentSelector() {
  const { user: authUser } = useAuth()
  const users = createUsersResource()

  const opponents = createMemo(() => {
    const currentUser = authUser()
    if (!currentUser) {
      return []
    }

    return users.data()?.filter((u: User) => u.id !== currentUser.id) ?? []
  })

  createEffect(() => {
    const currentUser = authUser()
    const usersData = users.data()
    if (!currentUser || !usersData) {
      return
    }

    syncSelectedOpponent(
      usersData.filter((u: User) => u.id !== currentUser.id),
      currentUser.id,
    )
  })

  const selectedOpponent = createMemo(() =>
    opponents().find((u: User) => u.id === selectedOpponentId()),
  )

  return {
    opponents,
    selectedOpponentId,
    setSelectedOpponentId: (opponentId: number | undefined) =>
      selectOpponent(opponentId, authUser()?.id),
    selectedOpponent,
    showSelector: createMemo(() => opponents().length > 1),
  }
}
