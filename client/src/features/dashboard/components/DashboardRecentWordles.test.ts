import type { ArchiveListItem } from '~/types'
import { describe, expect, it } from 'vitest'
import { recentResultTone } from './DashboardRecentWordles'

function makeItem(overrides: Partial<ArchiveListItem> = {}): ArchiveListItem {
  return {
    wordle_id: 1234,
    participant_count: 4,
    viewer_has_played: true,
    viewer_entry: { score: '3', created_at: '2026-01-15T10:30:00Z' },
    summary: { best_score: '3', solved_count: 3, failed_count: 1 },
    ...overrides,
  }
}

describe('recentResultTone', () => {
  it('returns default when no viewer entry score', () => {
    expect(recentResultTone(makeItem({ viewer_entry: undefined }))).toBe('default')
    expect(recentResultTone(makeItem({ viewer_entry: { score: '', created_at: '' } }))).toBe('default')
  })

  describe('solo play (participant_count <= 1 or no best_score)', () => {
    it('returns win for score <= 3', () => {
      expect(recentResultTone(makeItem({ participant_count: 1, viewer_entry: { score: '3', created_at: '' } }))).toBe('win')
      expect(recentResultTone(makeItem({ participant_count: 1, viewer_entry: { score: '1', created_at: '' } }))).toBe('win')
    })

    it('returns tie for score 4', () => {
      expect(recentResultTone(makeItem({ participant_count: 1, viewer_entry: { score: '4', created_at: '' } }))).toBe('tie')
    })

    it('returns loss for score > 4', () => {
      expect(recentResultTone(makeItem({ participant_count: 1, viewer_entry: { score: '5', created_at: '' } }))).toBe('loss')
      expect(recentResultTone(makeItem({ participant_count: 1, viewer_entry: { score: 'X', created_at: '' } }))).toBe('loss')
    })
  })

  describe('multiplayer', () => {
    it('returns win when matching best score', () => {
      expect(recentResultTone(makeItem())).toBe('win') // score 3, best 3
    })

    it('returns loss for X (score 7)', () => {
      expect(recentResultTone(makeItem({
        viewer_entry: { score: 'X', created_at: '' },
        summary: { best_score: '3', solved_count: 3, failed_count: 1 },
      }))).toBe('loss')
    })

    it('returns tie when within 1 of best', () => {
      expect(recentResultTone(makeItem({
        viewer_entry: { score: '4', created_at: '' },
        summary: { best_score: '3', solved_count: 3, failed_count: 0 },
      }))).toBe('tie')
    })

    it('returns loss when more than 1 away from best', () => {
      expect(recentResultTone(makeItem({
        viewer_entry: { score: '5', created_at: '' },
        summary: { best_score: '3', solved_count: 3, failed_count: 0 },
      }))).toBe('loss')
    })
  })
})
