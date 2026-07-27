import type { WordleEntry } from '~/types'
import { useNavigate } from '@tanstack/solid-router'
import { createResource, createSignal } from 'solid-js'
import { ApiError, wordleApi } from '~/lib/api'
import { consumePreload, PRELOAD_KEYS } from '~/lib/preload'
import { showToast } from '~/lib/toast'

export function useDashboardPageData() {
  const navigate = useNavigate()
  const [wordleInput, setWordleInput] = createSignal('')

  const [stats, { refetch: refetchStats }] = createResource(async () =>
    consumePreload(PRELOAD_KEYS.stats, wordleApi.getStats),
  )
  const [archive, { refetch: refetchArchive }] = createResource(async () =>
    consumePreload(PRELOAD_KEYS.archive, wordleApi.getArchive),
  )

  const [isPending, setIsPending] = createSignal(false)
  const [error, setError] = createSignal<Error | null>(null)

  const submit = async (data: { raw_input: string }) => {
    setIsPending(true)
    setError(null)
    try {
      const entry: WordleEntry = await wordleApi.submit(data)
      void refetchStats()
      void refetchArchive()
      setWordleInput('')
      showToast('Wordle submitted successfully!', 'success', 5000, {
        label: 'View results',
        onClick: () => {
          void navigate({ to: '/lookup', search: { wordleId: entry.wordle_id } })
        },
      })
    }
    catch (e) {
      const msg
        = e instanceof ApiError
          ? e.fields?.find(f => f.field === 'raw_input')?.detail || e.message
          : 'Failed to submit Wordle'
      showToast(msg, 'error')
      setError(e instanceof Error ? e : new Error(String(e)))
    }
    finally {
      setIsPending(false)
    }
  }

  const handleSubmit = (event: Event) => {
    event.preventDefault()
    if (!wordleInput().trim() || isPending())
      return
    void submit({ raw_input: wordleInput().trim() })
  }

  return {
    stats,
    archive,
    submitAction: {
      isPending,
      error,
      submit,
    },
    wordleInput,
    setWordleInput,
    handleSubmit,
  }
}
