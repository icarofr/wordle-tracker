package wordles

import (
	"context"
	"errors"
	"testing"
	"time"
)

type stubRepository struct {
	statsSnapshotFn     func(context.Context, int64) (*StatsSnapshot, error)
	headToHeadMatchesFn func(context.Context, int64, int64) ([]HeadToHeadMatch, error)
	archivePageFn       func(context.Context, int64, int32, int32) (*ArchiveListSnapshot, error)
	archiveEntriesFn    func(context.Context, int32) ([]ArchiveEntrySnapshot, error)
	submitEntryFn       func(context.Context, int64, ParsedEntry) (*Entry, error)
	leaderboardFn       func(context.Context, []int64) (*LeaderboardSnapshot, error)
}

func (s stubRepository) StatsSnapshot(ctx context.Context, userID int64) (*StatsSnapshot, error) {
	return s.statsSnapshotFn(ctx, userID)
}
func (s stubRepository) HeadToHeadMatches(ctx context.Context, userID, opponentID int64) ([]HeadToHeadMatch, error) {
	return s.headToHeadMatchesFn(ctx, userID, opponentID)
}
func (s stubRepository) ArchivePage(ctx context.Context, viewerID int64, beforeID int32, limit int32) (*ArchiveListSnapshot, error) {
	return s.archivePageFn(ctx, viewerID, beforeID, limit)
}
func (s stubRepository) ArchiveEntries(ctx context.Context, wordleID int32) ([]ArchiveEntrySnapshot, error) {
	return s.archiveEntriesFn(ctx, wordleID)
}
func (s stubRepository) SubmitEntry(ctx context.Context, userID int64, entry ParsedEntry) (*Entry, error) {
	return s.submitEntryFn(ctx, userID, entry)
}
func (s stubRepository) LeaderboardSnapshot(ctx context.Context, playerIDs []int64) (*LeaderboardSnapshot, error) {
	if s.leaderboardFn == nil {
		return &LeaderboardSnapshot{StatsByUser: map[int64]StatsSnapshot{}}, nil
	}
	return s.leaderboardFn(ctx, playerIDs)
}

func TestServiceStats(t *testing.T) {
	t.Parallel()

	svc := New(stubRepository{
		statsSnapshotFn: func(context.Context, int64) (*StatsSnapshot, error) {
			return &StatsSnapshot{
				Distribution:     []ScoreCount{{Score: "3", Count: 5}, {Score: "X", Count: 1}},
				WinningWordleIDs: []int32{10, 9, 8, 6, 5},
			}, nil
		},
	})

	stats, err := svc.Stats(context.Background(), 1)
	if err != nil {
		t.Fatalf("Stats: %v", err)
	}
	if stats.Games != 6 {
		t.Errorf("Games = %d, want 6", stats.Games)
	}
	if stats.Wins != 5 {
		t.Errorf("Wins = %d, want 5", stats.Wins)
	}
}

func TestServiceHeadToHead(t *testing.T) {
	t.Parallel()

	now := time.Now()
	svc := New(stubRepository{
		headToHeadMatchesFn: func(context.Context, int64, int64) ([]HeadToHeadMatch, error) {
			return []HeadToHeadMatch{
				{WordleID: 3, UserScore: "3", OpponentScore: "4", CreatedAt: now},
				{WordleID: 2, UserScore: "X", OpponentScore: "3", CreatedAt: now},
				{WordleID: 1, UserScore: "2", OpponentScore: "2", CreatedAt: now},
			}, nil
		},
	})

	h2h, err := svc.HeadToHead(context.Background(), 1, 2)
	if err != nil {
		t.Fatalf("HeadToHead: %v", err)
	}
	if h2h.Record.Wins != 1 {
		t.Errorf("Wins = %d, want 1", h2h.Record.Wins)
	}
	if h2h.Record.Losses != 1 {
		t.Errorf("Losses = %d, want 1", h2h.Record.Losses)
	}
	if h2h.Record.Ties != 1 {
		t.Errorf("Ties = %d, want 1", h2h.Record.Ties)
	}
	if len(h2h.RecentMatches) != 3 {
		t.Errorf("RecentMatches = %d, want 3", len(h2h.RecentMatches))
	}
	if h2h.RecentMatches[0].SelfScore != "3" {
		t.Errorf("RecentMatches[0].SelfScore = %q, want %q", h2h.RecentMatches[0].SelfScore, "3")
	}
	if h2h.RecentMatches[0].Result != "WIN" {
		t.Errorf("RecentMatches[0].Result = %q, want %q", h2h.RecentMatches[0].Result, "WIN")
	}
	if h2h.OverallStats.Self.Games != 3 {
		t.Errorf("OverallStats.Self.Games = %d, want 3", h2h.OverallStats.Self.Games)
	}
}

func TestServiceSubmit(t *testing.T) {
	t.Parallel()

	svc := New(stubRepository{
		submitEntryFn: func(_ context.Context, userID int64, entry ParsedEntry) (*Entry, error) {
			return &Entry{ID: 1, WordleID: entry.WordleID, Score: entry.Score, RawInput: entry.RawInput}, nil
		},
	})

	entry, err := svc.Submit(context.Background(), 1, "Wordle 1,397 3/6")
	if err != nil {
		t.Fatalf("Submit: %v", err)
	}
	if entry.WordleID != 1397 {
		t.Errorf("WordleID = %d, want 1397", entry.WordleID)
	}
	if entry.Score != "3" {
		t.Errorf("Score = %q, want %q", entry.Score, "3")
	}
}

func TestServiceSubmitInvalidFormat(t *testing.T) {
	t.Parallel()

	svc := New(stubRepository{})

	_, err := svc.Submit(context.Background(), 1, "not a wordle")
	if !errors.Is(err, ErrInvalidFormat) {
		t.Fatalf("Submit error = %v, want %v", err, ErrInvalidFormat)
	}
}

func TestServiceSubmitDuplicate(t *testing.T) {
	t.Parallel()

	svc := New(stubRepository{
		submitEntryFn: func(context.Context, int64, ParsedEntry) (*Entry, error) {
			return nil, ErrDuplicateEntry
		},
	})

	_, err := svc.Submit(context.Background(), 1, "Wordle 100 3/6")
	if !errors.Is(err, ErrDuplicateEntry) {
		t.Fatalf("Submit error = %v, want %v", err, ErrDuplicateEntry)
	}
}

func TestServiceArchiveListPaginated(t *testing.T) {
	t.Parallel()

	allRows := []ArchiveListSnapshotItem{
		{WordleID: 100, ParticipantCount: 2},
		{WordleID: 99, ParticipantCount: 2},
		{WordleID: 98, ParticipantCount: 2},
	}

	svc := New(stubRepository{
		archivePageFn: func(_ context.Context, _ int64, beforeID int32, limit int32) (*ArchiveListSnapshot, error) {
			var filtered []ArchiveListSnapshotItem
			for _, r := range allRows {
				if beforeID > 0 && r.WordleID >= beforeID {
					continue
				}
				filtered = append(filtered, r)
				if len(filtered) == int(limit) {
					break
				}
			}
			return &ArchiveListSnapshot{Items: filtered, HasMore: true}, nil
		},
	})

	items, hasMore, err := svc.ArchiveList(context.Background(), 1, 0, 2)
	if err != nil {
		t.Fatalf("ArchiveList: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("len(items) = %d, want 2", len(items))
	}
	if !hasMore {
		t.Error("hasMore = false, want true")
	}
	if items[0].WordleID != 100 {
		t.Errorf("items[0].WordleID = %d, want 100", items[0].WordleID)
	}
}

func TestServiceArchiveListIncludesBestCount(t *testing.T) {
	t.Parallel()

	viewerScore := "4"
	playedAt := time.Date(2026, 4, 13, 12, 0, 0, 0, time.UTC)

	svc := New(stubRepository{
		archivePageFn: func(context.Context, int64, int32, int32) (*ArchiveListSnapshot, error) {
			return &ArchiveListSnapshot{Items: []ArchiveListSnapshotItem{{
				WordleID:         100,
				ParticipantCount: 2,
				ViewerHasPlayed:  true,
				ViewerScore:      viewerScore,
				ViewerCreatedAt:  &playedAt,
				BestScore:        4,
				BestCount:        2,
				SolvedCount:      2,
				FailedCount:      0,
			}}, HasMore: false}, nil
		},
	})

	items, hasMore, err := svc.ArchiveList(context.Background(), 1, 0, 10)
	if err != nil {
		t.Fatalf("ArchiveList: %v", err)
	}
	if hasMore {
		t.Error("hasMore = true, want false")
	}
	if len(items) != 1 {
		t.Fatalf("len(items) = %d, want 1", len(items))
	}
	if items[0].Summary == nil {
		t.Fatal("items[0].Summary = nil, want summary")
	}
	if items[0].Summary.BestCount != 2 {
		t.Errorf("items[0].Summary.BestCount = %d, want 2", items[0].Summary.BestCount)
	}
}

func TestSortLeaderboardUsesDisplayedPrecision(t *testing.T) {
	t.Parallel()

	entries := []LeaderboardEntry{
		{
			Player:        Player{Name: "Alpha"},
			TotalGames:    10,
			AverageScore:  4.300000000000001,
			WinPercentage: 80.0,
		},
		{
			Player:        Player{Name: "Zulu"},
			TotalGames:    10,
			AverageScore:  4.3,
			WinPercentage: 80.0,
		},
	}

	sortLeaderboard(entries)

	if entries[0].Player.Name != "Alpha" {
		t.Errorf("entries[0].Player.Name = %q, want %q", entries[0].Player.Name, "Alpha")
	}
}
