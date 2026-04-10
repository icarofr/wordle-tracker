package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/icarofr/wordle-tracker/internal/wordles"
)

func (db *DB) ScoreDistribution(ctx context.Context, userID int64) ([]wordles.ScoreCount, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var rows []struct {
		Score string `db:"score"`
		Count int    `db:"count"`
	}
	err := db.SelectContext(ctx, &rows,
		`SELECT score, COUNT(*) AS count FROM wordle_entries
		 WHERE user_id = $1 GROUP BY score ORDER BY score`, userID)
	if err != nil {
		return nil, err
	}

	result := make([]wordles.ScoreCount, len(rows))
	for i, r := range rows {
		result[i] = wordles.ScoreCount{Score: r.Score, Count: r.Count}
	}
	return result, nil
}

func (db *DB) WinningWordleIDs(ctx context.Context, userID int64) ([]int, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var ids []int
	err := db.SelectContext(ctx, &ids,
		`SELECT wordle_id FROM wordle_entries
		 WHERE user_id = $1 AND score != 'X'
		 ORDER BY wordle_id DESC`, userID)
	return ids, err
}

func (db *DB) HeadToHeadMatches(ctx context.Context, userID, opponentID int64) ([]wordles.Match, error) {
	ctx, cancel := withTimeout(ctx, 10*time.Second)
	defer cancel()

	var rows []struct {
		WordleID      int       `db:"wordle_id"`
		UserScore     string    `db:"user_score"`
		OpponentScore string    `db:"opponent_score"`
		CreatedAt     time.Time `db:"created_at"`
	}
	err := db.SelectContext(ctx, &rows,
		`SELECT we1.wordle_id, we1.score AS user_score, we2.score AS opponent_score, we1.created_at
		 FROM wordle_entries we1
		 JOIN wordle_entries we2 ON we1.wordle_id = we2.wordle_id
		 WHERE we1.user_id = $1 AND we2.user_id = $2
		 ORDER BY we1.wordle_id DESC`, userID, opponentID)
	if err != nil {
		return nil, err
	}

	result := make([]wordles.Match, len(rows))
	for i, r := range rows {
		result[i] = wordles.Match{
			WordleID:      r.WordleID,
			UserScore:     r.UserScore,
			OpponentScore: r.OpponentScore,
			CreatedAt:     r.CreatedAt,
		}
	}
	return result, nil
}

func (db *DB) ArchiveList(ctx context.Context, userID int64, beforeID int, limit int) ([]wordles.ArchiveListRow, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var rows []struct {
		WordleID         int        `db:"wordle_id"`
		ParticipantCount int        `db:"participant_count"`
		ViewerScore      *string    `db:"viewer_score"`
		ViewerCreatedAt  *time.Time `db:"viewer_created_at"`
		BestScore        int        `db:"best_score"`
		SolvedCount      int        `db:"solved_count"`
		FailedCount      int        `db:"failed_count"`
	}

	query := `SELECT
		we.wordle_id,
		COUNT(*) AS participant_count,
		MAX(CASE WHEN we.user_id = $1 THEN we.score END) AS viewer_score,
		MAX(CASE WHEN we.user_id = $2 THEN we.created_at END) AS viewer_created_at,
		MIN(CASE WHEN we.score = 'X' THEN 7 ELSE CAST(we.score AS INTEGER) END) AS best_score,
		COUNT(*) FILTER (WHERE we.score != 'X') AS solved_count,
		COUNT(*) FILTER (WHERE we.score = 'X') AS failed_count
	 FROM wordle_entries we`

	args := []any{userID, userID}
	nextParam := 3

	if beforeID > 0 {
		query += fmt.Sprintf(` WHERE we.wordle_id < $%d`, nextParam)
		args = append(args, beforeID)
		nextParam++
	}

	query += fmt.Sprintf(` GROUP BY we.wordle_id ORDER BY we.wordle_id DESC LIMIT $%d`, nextParam)
	args = append(args, limit)

	err := db.SelectContext(ctx, &rows, query, args...)
	if err != nil {
		return nil, err
	}

	result := make([]wordles.ArchiveListRow, len(rows))
	for i, r := range rows {
		result[i] = wordles.ArchiveListRow{
			WordleID:         r.WordleID,
			ParticipantCount: r.ParticipantCount,
			ViewerScore:      r.ViewerScore,
			ViewerCreatedAt:  r.ViewerCreatedAt,
			BestScore:        r.BestScore,
			SolvedCount:      r.SolvedCount,
			FailedCount:      r.FailedCount,
		}
	}
	return result, nil
}

func (db *DB) ArchiveEntries(ctx context.Context, wordleID int) ([]wordles.ArchiveEntryRow, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var rows []struct {
		UserID    int64     `db:"user_id"`
		Score     string    `db:"score"`
		RawInput  *string   `db:"raw_input"`
		CreatedAt time.Time `db:"created_at"`
	}
	err := db.SelectContext(ctx, &rows,
		`SELECT user_id, score, raw_input, created_at FROM wordle_entries WHERE wordle_id = $1`, wordleID)
	if err != nil {
		return nil, err
	}

	result := make([]wordles.ArchiveEntryRow, len(rows))
	for i, r := range rows {
		result[i] = wordles.ArchiveEntryRow{
			UserID:    r.UserID,
			Score:     r.Score,
			RawInput:  r.RawInput,
			CreatedAt: r.CreatedAt,
		}
	}
	return result, nil
}

func (db *DB) CreateEntry(ctx context.Context, userID int64, wordleID int, score, rawInput string) (*wordles.Entry, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	now := time.Now()

	_, err = tx.ExecContext(ctx,
		`INSERT INTO wordles (number, created_at, updated_at)
		 VALUES ($1, $2, $3) ON CONFLICT (number) DO NOTHING`,
		wordleID, now, now)
	if err != nil {
		return nil, err
	}

	var row struct {
		ID        int64     `db:"id"`
		WordleID  int       `db:"wordle_id"`
		Score     string    `db:"score"`
		RawInput  string    `db:"raw_input"`
		CreatedAt time.Time `db:"created_at"`
	}
	err = tx.GetContext(ctx, &row,
		`INSERT INTO wordle_entries (user_id, wordle_id, score, raw_input, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (user_id, wordle_id) DO NOTHING
		 RETURNING id, wordle_id, score, raw_input, created_at`,
		userID, wordleID, score, rawInput, now, now)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, wordles.ErrDuplicateEntry
		}
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &wordles.Entry{
		ID:        row.ID,
		WordleID:  row.WordleID,
		Score:     row.Score,
		RawInput:  row.RawInput,
		CreatedAt: row.CreatedAt,
	}, nil
}

func (db *DB) SharedWordleIDs(ctx context.Context, userCount int) ([]int, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var ids []int
	err := db.SelectContext(ctx, &ids,
		`SELECT wordle_id FROM wordle_entries
		 GROUP BY wordle_id HAVING COUNT(DISTINCT user_id) = $1
		 ORDER BY wordle_id DESC`, userCount)
	return ids, err
}

func (db *DB) UserScoreDistribution(ctx context.Context, wordleIDs []int) ([]wordles.UserScoreCount, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var rows []struct {
		UserID int64  `db:"user_id"`
		Score  string `db:"score"`
		Count  int    `db:"count"`
	}
	err := db.SelectContext(ctx, &rows,
		`SELECT user_id, score, COUNT(*) AS count FROM wordle_entries
		 WHERE wordle_id = ANY($1) GROUP BY user_id, score`, wordleIDs)
	if err != nil {
		return nil, err
	}

	result := make([]wordles.UserScoreCount, len(rows))
	for i, r := range rows {
		result[i] = wordles.UserScoreCount{UserID: r.UserID, Score: r.Score, Count: r.Count}
	}
	return result, nil
}

func (db *DB) UserWinningWordleIDs(ctx context.Context, wordleIDs []int) ([]wordles.UserWordleID, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var rows []struct {
		UserID   int64 `db:"user_id"`
		WordleID int   `db:"wordle_id"`
	}
	err := db.SelectContext(ctx, &rows,
		`SELECT user_id, wordle_id FROM wordle_entries
		 WHERE wordle_id = ANY($1) AND score != 'X'
		 ORDER BY user_id, wordle_id DESC`, wordleIDs)
	if err != nil {
		return nil, err
	}

	result := make([]wordles.UserWordleID, len(rows))
	for i, r := range rows {
		result[i] = wordles.UserWordleID{UserID: r.UserID, WordleID: r.WordleID}
	}
	return result, nil
}
