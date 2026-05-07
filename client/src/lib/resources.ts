import { createResource } from 'solid-js'
import { userApi } from '~/lib/api'
import { consumePreload, PRELOAD_KEYS } from '~/lib/preload'

export function createUsersResource() {
  const [data, { refetch }] = createResource(async () =>
    consumePreload(PRELOAD_KEYS.users, userApi.getUsers),
  )
  return { data, refetch }
}
