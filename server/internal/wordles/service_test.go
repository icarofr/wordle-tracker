package wordles

import (
	"context"
	"errors"
	"testing"
	"time"
)

type stubStore struct {
	scoreDistributionFn     func(context.Context, int64) ([]ScoreCount, error)
	winningWordleIDsFn      func(context.Context, int64) ([]int, error)
	headToHeadMatchesFn     func(context.Context, int64, int64) ([]Match, error)
	archiveListFn           func(context.Context, int64, int, int) ([]ArchiveListRow, error)
	archiveEntriesFn        func(context.Context, int) ([]ArchiveEntryRow, error)
	createEntryFn           func(context.Context, int64, int, string, string) (*Entry, error)
	sharedWordleIDsFn       func(context.Context, int) ([]int, error)
	userScoreDistributionFn func(context.Context, []int) ([]UserScoreCount, error)
	userWinningWordleIDsFn  func(context.Context, []int) ([]UserWordleID, error)
}

func (s stubStore) ScoreDistribution(ctx context.Context, userID int64) ([]ScoreCount, error) {
	return s.scoreDistributionFn(ctx, userID)
}
func (s stubStore) WinningWordleIDs(ctx context.Context, userID int64) ([]int, error) {
	return s.winningWordleIDsFn(ctx, userID)
}
func (s stubStore) HeadToHeadMatches(ctx context.Context, userID, opponentID int64) ([]Match, error) {
	return s.headToHeadMatchesFn(ctx, userID, opponentID)
}
func (s stubStore) ArchiveList(ctx context.Context, userID int64, beforeID int, limit int) ([]ArchiveListRow, error) {
	return s.archiveListFn(ctx, userID, beforeID, limit)
}
func (s stubStore) ArchiveEntries(ctx context.Context, wordleID int) ([]ArchiveEntryRow, error) {
	return s.archiveEntriesFn(ctx, wordleID)
}
func (s stubStore) CreateEntry(ctx context.Context, userID int64, wordleID int, score, rawInput string) (*Entry, error) {
	return s.createEntryFn(ctx, userID, wordleID, score, rawInput)
}
func (s stubStore) SharedWordleIDs(ctx context.Context, userCount int) ([]int, error) {
	return s.sharedWordleIDsFn(ctx, userCount)
}
func (s stubStore) UserScoreDistribution(ctx context.Context, wordleIDs []int) ([]UserScoreCount, error) {
	return s.userScoreDistributionFn(ctx, wordleIDs)
}
func (s stubStore) UserWinningWordleIDs(ctx context.Context, wordleIDs []int) ([]UserWordleID, error) {
	return s.userWinningWordleIDsFn(ctx, wordleIDs)
}

func TestServiceStats(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{
		scoreDistributionFn: func(context.Context, int64) ([]ScoreCount, error) {
			return []ScoreCount{{Score: "3", Count: 5}, {Score: "X", Count: 1}}, nil
		},
		winningWordleIDsFn: func(context.Context, int64) ([]int, error) {
			return []int{10, 9, 8, 6, 5}, nil
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
	svc := New(stubStore{
		headToHeadMatchesFn: func(context.Context, int64, int64) ([]Match, error) {
			return []Match{
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

	svc := New(stubStore{
		createEntryFn: func(_ context.Context, userID int64, wordleID int, score, rawInput string) (*Entry, error) {
			return &Entry{ID: 1, WordleID: wordleID, Score: score, RawInput: rawInput}, nil
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

	svc := New(stubStore{})

	_, err := svc.Submit(context.Background(), 1, "not a wordle")
	if !errors.Is(err, ErrInvalidFormat) {
		t.Fatalf("Submit error = %v, want %v", err, ErrInvalidFormat)
	}
}

func TestServiceSubmitDuplicate(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{
		createEntryFn: func(context.Context, int64, int, string, string) (*Entry, error) {
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

	allRows := []ArchiveListRow{
		{WordleID: 100, ParticipantCount: 2},
		{WordleID: 99, ParticipantCount: 2},
		{WordleID: 98, ParticipantCount: 2},
	}

	svc := New(stubStore{
		archiveListFn: func(_ context.Context, _ int64, beforeID int, limit int) ([]ArchiveListRow, error) {
			var filtered []ArchiveListRow
			for _, r := range allRows {
				if beforeID > 0 && r.WordleID >= beforeID {
					continue
				}
				filtered = append(filtered, r)
				if len(filtered) == limit {
					break
				}
			}
			return filtered, nil
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
