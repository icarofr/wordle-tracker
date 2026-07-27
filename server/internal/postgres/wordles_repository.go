package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/icarofr/wordle-tracker/internal/postgres/dbgen"
	"github.com/icarofr/wordle-tracker/internal/wordles"
	"github.com/jackc/pgx/v5"
)

type WordlesRepository struct {
	store *Store
}

var _ wordles.Repository = (*WordlesRepository)(nil)

func NewWordlesRepository(store *Store) *WordlesRepository {
	return &WordlesRepository{store: store}
}

func (repository *WordlesRepository) StatsSnapshot(ctx context.Context, userID int64) (*wordles.StatsSnapshot, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	distributionRows, err := repository.store.queries.GetScoreDistribution(ctx, userID)
	if err != nil {
		return nil, err
	}

	winningWordleIDs, err := repository.store.queries.GetWinningWordleIDs(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &wordles.StatsSnapshot{
		Distribution:     scoreCounts(distributionRows),
		WinningWordleIDs: winningWordleIDs,
	}, nil
}

func (repository *WordlesRepository) HeadToHeadMatches(ctx context.Context, userID, opponentID int64) ([]wordles.HeadToHeadMatch, error) {
	ctx, cancel := withTimeout(ctx, 10*time.Second)
	defer cancel()

	rows, err := repository.store.queries.GetHeadToHeadMatches(ctx, dbgen.GetHeadToHeadMatchesParams{
		UserID:     userID,
		OpponentID: opponentID,
	})
	if err != nil {
		return nil, err
	}

	result := make([]wordles.HeadToHeadMatch, len(rows))
	for i, row := range rows {
		result[i] = wordles.HeadToHeadMatch{
			WordleID:      row.WordleID,
			UserScore:     row.UserScore,
			OpponentScore: row.OpponentScore,
			CreatedAt:     timeValue(row.CreatedAt),
		}
	}

	return result, nil
}

func (repository *WordlesRepository) ArchivePage(ctx context.Context, viewerID int64, beforeID int32, limit int32) (*wordles.ArchiveListSnapshot, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	rows, err := repository.store.queries.GetArchiveList(ctx, dbgen.GetArchiveListParams{
		PageLimit: limit + 1,
		UserID:    viewerID,
		BeforeID:  beforeID,
	})
	if err != nil {
		return nil, err
	}

	hasMore := int32(len(rows)) > limit
	if hasMore {
		rows = rows[:int(limit)]
	}

	items := make([]wordles.ArchiveListSnapshotItem, len(rows))
	for i, row := range rows {
		viewerCreatedAt := timePtr(row.ViewerCreatedAt)
		items[i] = wordles.ArchiveListSnapshotItem{
			WordleID:         row.WordleID,
			ParticipantCount: row.ParticipantCount,
			ViewerHasPlayed:  row.ViewerHasPlayed,
			ViewerScore:      row.ViewerScore,
			ViewerCreatedAt:  viewerCreatedAt,
			BestScore:        row.BestScore,
			BestCount:        row.BestCount,
			SolvedCount:      row.SolvedCount,
			FailedCount:      row.FailedCount,
		}
		if !row.ViewerHasPlayed {
			items[i].ViewerScore = ""
			items[i].ViewerCreatedAt = nil
		}
	}

	return &wordles.ArchiveListSnapshot{HasMore: hasMore, Items: items}, nil
}

func (repository *WordlesRepository) ArchiveEntries(ctx context.Context, wordleID int32) ([]wordles.ArchiveEntrySnapshot, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	rows, err := repository.store.queries.GetArchiveEntries(ctx, wordleID)
	if err != nil {
		return nil, err
	}

	result := make([]wordles.ArchiveEntrySnapshot, len(rows))
	for i, row := range rows {
		result[i] = wordles.ArchiveEntrySnapshot{
			UserID:    row.UserID,
			Score:     row.Score,
			RawInput:  textPtr(row.RawInput),
			CreatedAt: timeValue(row.CreatedAt),
		}
	}

	return result, nil
}

func (repository *WordlesRepository) SubmitEntry(ctx context.Context, userID int64, entry wordles.ParsedEntry) (*wordles.Entry, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	tx, err := repository.store.beginTx(ctx)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	queries := repository.store.queries.WithTx(tx)
	now := time.Now()

	if err := queries.EnsureWordle(ctx, dbgen.EnsureWordleParams{
		Number:    entry.WordleID,
		CreatedAt: timestampValue(now),
		UpdatedAt: timestampValue(now),
	}); err != nil {
		return nil, err
	}

	row, err := queries.CreateWordleEntry(ctx, dbgen.CreateWordleEntryParams{
		UserID:    userID,
		WordleID:  entry.WordleID,
		Score:     entry.Score,
		RawInput:  textValue(entry.RawInput),
		CreatedAt: timestampValue(now),
		UpdatedAt: timestampValue(now),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, wordles.ErrDuplicateEntry
		}
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &wordles.Entry{
		ID:        row.ID,
		WordleID:  row.WordleID,
		Score:     row.Score,
		RawInput:  textString(row.RawInput),
		CreatedAt: timeValue(row.CreatedAt),
	}, nil
}

func (repository *WordlesRepository) LeaderboardSnapshot(ctx context.Context, playerIDs []int64) (*wordles.LeaderboardSnapshot, error) {
	statsByUser := make(map[int64]wordles.StatsSnapshot, len(playerIDs))
	for _, playerID := range playerIDs {
		statsByUser[playerID] = wordles.StatsSnapshot{}
	}

	if len(playerIDs) == 0 {
		return &wordles.LeaderboardSnapshot{StatsByUser: statsByUser}, nil
	}

	ctx, cancel := withTimeout(ctx, 10*time.Second)
	defer cancel()

	sharedWordleIDs, err := repository.store.queries.GetSharedWordleIDsForUsers(ctx, dbgen.GetSharedWordleIDsForUsersParams{
		UserIds:   playerIDs,
		UserCount: int64(len(playerIDs)),
	})
	if err != nil {
		return nil, err
	}

	if len(sharedWordleIDs) == 0 {
		return &wordles.LeaderboardSnapshot{SharedWordles: 0, StatsByUser: statsByUser}, nil
	}

	scoreRows, err := repository.store.queries.GetUserScoreDistributionForUsers(ctx, dbgen.GetUserScoreDistributionForUsersParams{
		UserIds:   playerIDs,
		WordleIds: sharedWordleIDs,
	})
	if err != nil {
		return nil, err
	}

	winningRows, err := repository.store.queries.GetUserWinningWordleIDsForUsers(ctx, dbgen.GetUserWinningWordleIDsForUsersParams{
		UserIds:   playerIDs,
		WordleIds: sharedWordleIDs,
	})
	if err != nil {
		return nil, err
	}

	for _, row := range scoreRows {
		stats := statsByUser[row.UserID]
		stats.Distribution = append(stats.Distribution, wordles.ScoreCount{
			Score: row.Score,
			Count: row.Count,
		})
		statsByUser[row.UserID] = stats
	}

	for _, row := range winningRows {
		stats := statsByUser[row.UserID]
		stats.WinningWordleIDs = append(stats.WinningWordleIDs, row.WordleID)
		statsByUser[row.UserID] = stats
	}

	return &wordles.LeaderboardSnapshot{
		SharedWordles: int64(len(sharedWordleIDs)),
		StatsByUser:   statsByUser,
	}, nil
}

func scoreCounts(rows []dbgen.GetScoreDistributionRow) []wordles.ScoreCount {
	result := make([]wordles.ScoreCount, len(rows))
	for i, row := range rows {
		result[i] = wordles.ScoreCount{Score: row.Score, Count: row.Count}
	}
	return result
}
