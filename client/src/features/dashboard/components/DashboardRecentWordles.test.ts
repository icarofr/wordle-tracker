import type { ArchiveListItem } from '~/types'
import { describe, expect, it } from 'vitest'
import { recentResultTone } from './DashboardRecentWordles'

function makeItem(overrides: Partial<ArchiveListItem> = {}): ArchiveListItem {
  return {
    wordle_id: 1234,
    participant_count: 4,
    viewer_has_played: true,
    viewer_entry: { score: '3', created_at: '2026-01-15T10:30:00Z' },
    summary: { best_score: '3', best_count: 1, solved_count: 3, failed_count: 1 },
    ...overrides,
  }
}

describe('recentResultTone', () => {
  it('returns default when no viewer entry score', () => {
    expect(recentResultTone(makeItem({ viewer_entry: undefined }))).toBe('default')
    expect(recentResultTone(makeItem({ viewer_entry: { score: '', created_at: '' } }))).toBe('default')
  })

  describe('solo play', () => {
    it('returns waiting when no one else has played yet', () => {
      expect(recentResultTone(makeItem({ participant_count: 1, viewer_entry: { score: '3', created_at: '' } }))).toBe('waiting')
      expect(recentResultTone(makeItem({ participant_count: 1, viewer_entry: { score: '5', created_at: '' } }))).toBe('waiting')
      expect(recentResultTone(makeItem({ participant_count: 1, viewer_entry: { score: 'X', created_at: '' } }))).toBe('waiting')
    })
  })

  it('returns default when summary data is unavailable for a multiplayer game', () => {
    expect(recentResultTone(makeItem({ summary: undefined }))).toBe('default')
    expect(recentResultTone(makeItem({ summary: { best_score: '3', best_count: 0, solved_count: 3, failed_count: 1 } }))).toBe('default')
  })

  describe('multiplayer', () => {
    it('returns win when uniquely best', () => {
      expect(recentResultTone(makeItem())).toBe('win')
    })

    it('returns tie when sharing the best score', () => {
      expect(recentResultTone(makeItem({
        summary: { best_score: '3', best_count: 2, solved_count: 3, failed_count: 1 },
      }))).toBe('tie')
    })

    it('returns tie when everyone fails with X', () => {
      expect(recentResultTone(makeItem({
        viewer_entry: { score: 'X', created_at: '' },
        summary: { best_score: 'X', best_count: 2, solved_count: 0, failed_count: 2 },
      }))).toBe('tie')
    })

    it('returns loss for X when someone solved it', () => {
      expect(recentResultTone(makeItem({
        viewer_entry: { score: 'X', created_at: '' },
        summary: { best_score: '3', best_count: 1, solved_count: 3, failed_count: 1 },
      }))).toBe('loss')
    })

    it('returns loss when not matching the best score', () => {
      expect(recentResultTone(makeItem({
        viewer_entry: { score: '4', created_at: '' },
        summary: { best_score: '3', best_count: 1, solved_count: 3, failed_count: 0 },
      }))).toBe('loss')
    })
  })
})
