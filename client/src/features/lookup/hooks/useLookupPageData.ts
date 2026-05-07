import { useNavigate, useSearch } from '@tanstack/solid-router'
import { createEffect, createMemo, on } from 'solid-js'
import { createArchiveResource, createArchiveWordleResource } from '../resources'

export function useLookupPageData() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/__auth/lookup' })
  const archive = createArchiveResource()

  const selectedWordleId = createMemo(() => search().wordleId)
  const isBrowsingArchive = createMemo(() => search().view === 'list')
  const archiveItems = createMemo(() => archive.data()?.items ?? [])

  const wordleDetail = createArchiveWordleResource(() => selectedWordleId())

  const selectWordle = (
    wordleId: number,
    options?: { replace?: boolean },
  ) => {
    if (selectedWordleId() === wordleId && !isBrowsingArchive()) {
      return
    }

    void navigate({
      to: '/lookup',
      search: previous => ({
        ...previous,
        wordleId,
        view: undefined,
      }),
      replace: options?.replace ?? true,
      resetScroll: false,
    })
  }

  const showArchiveList = () => {
    if (isBrowsingArchive()) {
      return
    }

    void navigate({
      to: '/lookup',
      search: previous => ({
        ...previous,
        view: 'list',
      }),
      replace: true,
      resetScroll: false,
    })
  }

  createEffect(
    on(
      () => archive.data(),
      () => {
        const hasNoSelectedWordle = !selectedWordleId()
        const hasWordles = archiveItems().length > 0

        if (!isBrowsingArchive() && hasNoSelectedWordle && hasWordles) {
          const latestId = Math.max(...archiveItems().map(w => w.wordle_id))
          selectWordle(latestId, { replace: true })
        }
      },
      { defer: true },
    ),
  )

  return {
    archive: archive.data,
    archiveItems,
    selectedWordleId,
    isBrowsingArchive,
    isLoaded: createMemo(() => !archive.data.loading && !archive.data.error),
    selectWordle,
    showArchiveList,
    wordleDetail,
  }
}
