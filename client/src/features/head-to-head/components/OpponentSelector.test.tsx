import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { OpponentSelector } from './OpponentSelector'

interface MockOpponent {
  id: number
  name: string
}

interface MockOpponentSelectorState {
  opponents: () => MockOpponent[]
  selectedOpponent: () => MockOpponent | undefined
  selectedOpponentId: () => number | undefined
  setSelectedOpponentId: (opponentId: number | undefined) => void
  showSelector: () => boolean
}

const { useOpponentSelectorMock } = vi.hoisted(() => ({
  useOpponentSelectorMock: vi.fn<() => MockOpponentSelectorState>(),
}))

vi.mock('../opponent', () => ({
  useOpponentSelector: useOpponentSelectorMock,
}))

describe('opponentSelector', () => {
  it('renders the selector as an in-page control', () => {
    useOpponentSelectorMock.mockReturnValue({
      opponents: () => [
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ],
      selectedOpponent: () => ({ id: 2, name: 'Bob' }),
      selectedOpponentId: () => 2,
      setSelectedOpponentId: vi.fn(),
      showSelector: () => true,
    })

    render(() => <OpponentSelector />)

    expect(screen.getByText('Choose your rival')).toBeInTheDocument()
    expect(screen.getByLabelText('Opponent')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Bob' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Charlie' })).toBeInTheDocument()
  })

  it('shows a locked message when there is only one available opponent', () => {
    useOpponentSelectorMock.mockReturnValue({
      opponents: () => [{ id: 2, name: 'Bob' }],
      selectedOpponent: () => ({ id: 2, name: 'Bob' }),
      selectedOpponentId: () => 2,
      setSelectedOpponentId: vi.fn(),
      showSelector: () => false,
    })

    render(() => <OpponentSelector />)

    expect(screen.getByText('Only one rival is available right now: Bob.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Opponent')).not.toBeInTheDocument()
  })
})
