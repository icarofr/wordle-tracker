import type { Resource } from 'solid-js'
import type { ArchiveWordle } from '~/types'
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { mockArchiveWordle } from '~/test/fixtures'
import { WordleDetails } from './WordleDetails'

function mockResource<T>(
  state: 'pending' | 'ready' | 'refreshing' | 'errored',
  data?: T,
  error?: Error,
): Resource<T> {
  const fn = (() => data) as Resource<T>
  Object.defineProperty(fn, 'state', { get: () => state })
  Object.defineProperty(fn, 'loading', {
    get: () => state === 'pending' || state === 'refreshing',
  })
  Object.defineProperty(fn, 'error', {
    get: () => state === 'errored' ? (error ?? new Error('Test error')) : undefined,
  })
  Object.defineProperty(fn, 'latest', {
    get: () => state === 'ready' || state === 'refreshing' ? data : undefined,
  })
  return fn
}

describe('wordleDetails', () => {
  it('keeps the current details visible while a new wordle loads', () => {
    const data = mockResource<ArchiveWordle>('refreshing', mockArchiveWordle)

    render(() => (
      <WordleDetails
        wordleId={1339}
        data={data}
        onRetry={vi.fn()}
      />
    ))

    expect(screen.getByText('Loading Wordle #1339...')).toBeInTheDocument()
    expect(screen.getByText('Wordle #1340')).toBeInTheDocument()
    expect(screen.getByText('Your Entry')).toBeInTheDocument()
  })

  it('uses the mobile back action callback', () => {
    const onBackToArchive = vi.fn()
    const data = mockResource<ArchiveWordle>('ready', mockArchiveWordle)

    render(() => (
      <WordleDetails
        wordleId={1340}
        data={data}
        onRetry={vi.fn()}
        onBackToArchive={onBackToArchive}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Back to Archive' }))

    expect(onBackToArchive).toHaveBeenCalledTimes(1)
  })
})
