import type { LeaderboardEntry } from '~/types'
import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { LeaderboardItem } from './LeaderboardItem'

vi.mock('~/hooks/useUserAvatar', () => ({
  useUserAvatar: () => ({
    currentAvatar: () => '01',
  }),
}))

function createEntry(): LeaderboardEntry {
  return {
    player: {
      id: 7,
      name: 'Delta',
      avatar: '07',
    },
    total_games: 42,
    average_score: 3.6,
    win_percentage: 82.1,
    current_streak: 4,
    max_streak: 9,
  }
}

describe('leaderboardItem', () => {
  it('shows medal ranks for the podium', () => {
    render(() => (
      <LeaderboardItem
        entry={createEntry()}
        rank={2}
        isCurrentUser={false}
      />
    ))

    expect(screen.getByText('🥈')).toBeInTheDocument()
  })

  it('uses keycap emoji for ranks after the podium', () => {
    render(() => (
      <LeaderboardItem
        entry={createEntry()}
        rank={4}
        isCurrentUser={false}
      />
    ))

    expect(screen.getByText('4️⃣')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Delta' })).toBeInTheDocument()
  })
})
