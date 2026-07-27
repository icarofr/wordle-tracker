import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { mockArchivePage } from '~/test/fixtures'
import { LookupSidebar } from './LookupSidebar'

describe('lookupSidebar', () => {
  it('calls onSelectWordle when an archive row is clicked', () => {
    const onSelectWordle = vi.fn()

    render(() => (
      <LookupSidebar
        wordles={mockArchivePage.items}
        isLoaded={true}
        selectedWordleId={1340}
        onSelectWordle={onSelectWordle}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: /#1339/ }))

    expect(onSelectWordle).toHaveBeenCalledWith(1339)
  })

  it('submits manual search through the selection callback', () => {
    const onSelectWordle = vi.fn()

    render(() => (
      <LookupSidebar
        wordles={mockArchivePage.items}
        isLoaded={true}
        onSelectWordle={onSelectWordle}
      />
    ))

    fireEvent.input(screen.getByLabelText('Search by Wordle number'), {
      target: { value: '1337' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Jump to Wordle' }))

    expect(onSelectWordle).toHaveBeenCalledWith(1337)
  })
})
