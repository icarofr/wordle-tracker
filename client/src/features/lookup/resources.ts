import type { Accessor } from 'solid-js'
import type { PreloadKey } from '~/lib/preload'
import { createResource } from 'solid-js'
import { wordleApi } from '~/lib/api'
import { consumePreload, PRELOAD_KEYS } from '~/lib/preload'

export function createArchiveResource() {
  const [data, { refetch }] = createResource(async () =>
    consumePreload(PRELOAD_KEYS.archive, wordleApi.getArchive),
  )
  return { data, refetch }
}

export function createArchiveWordleResource(
  wordleId: Accessor<number | undefined>,
) {
  const [data, { refetch }] = createResource(
    () => wordleId(),
    async id => consumePreload(`archive:${id}` as PreloadKey, async () => wordleApi.getArchiveWordle(id)),
  )
  return { data, refetch }
}
