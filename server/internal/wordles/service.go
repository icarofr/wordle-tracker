package wordles

import (
	"context"
	"fmt"
	"math"
	"sort"
)

type Store interface {
	ScoreDistribution(ctx context.Context, userID int64) ([]ScoreCount, error)
	WinningWordleIDs(ctx context.Context, userID int64) ([]int, error)
	HeadToHeadMatches(ctx context.Context, userID, opponentID int64) ([]Match, error)
	ArchiveList(ctx context.Context, userID int64, beforeID int, limit int) ([]ArchiveListRow, error)
	ArchiveEntries(ctx context.Context, wordleID int) ([]ArchiveEntryRow, error)
	CreateEntry(ctx context.Context, userID int64, wordleID int, score, rawInput string) (*Entry, error)
	SharedWordleIDs(ctx context.Context, userCount int) ([]int, error)
	UserScoreDistribution(ctx context.Context, wordleIDs []int) ([]UserScoreCount, error)
	UserWinningWordleIDs(ctx context.Context, wordleIDs []int) ([]UserWordleID, error)
}

type Service struct {
	store Store
}

func New(store Store) *Service {
	return &Service{store: store}
}

func (s *Service) Stats(ctx context.Context, userID int64) (*Stats, error) {
	dist, err := s.store.ScoreDistribution(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("score distribution: %w", err)
	}

	wordleIDs, err := s.store.WinningWordleIDs(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("winning wordle IDs: %w", err)
	}

	return statsFromDist(dist, wordleIDs), nil
}

func (s *Service) HeadToHead(ctx context.Context, userID, opponentID int64) (*HeadToHeadResult, error) {
	matches, err := s.store.HeadToHeadMatches(ctx, userID, opponentID)
	if err != nil {
		return nil, fmt.Errorf("head to head matches: %w", err)
	}

	wins, losses, ties := 0, 0, 0
	for _, m := range matches {
		switch compareResult(m.UserScore, m.OpponentScore) {
		case "WIN":
			wins++
		case "LOSS":
			losses++
		case "TIE":
			ties++
		}
	}

	totalGames := len(matches)
	winPct := 0.0
	if totalGames > 0 {
		winPct = math.Round(float64(wins)/float64(totalGames)*1000) / 10
	}

	recentLimit := min(10, len(matches))
	recentMatches := make([]RecentMatch, 0, recentLimit)
	for i := range recentLimit {
		m := matches[i]
		recentMatches = append(recentMatches, RecentMatch{
			WordleID:      m.WordleID,
			SelfScore:     m.UserScore,
			OpponentScore: m.OpponentScore,
			PlayedAt:      m.CreatedAt,
			Result:        compareResult(m.UserScore, m.OpponentScore),
		})
	}

	userScores := make([]string, 0, len(matches))
	opponentScores := make([]string, 0, len(matches))
	for _, m := range matches {
		userScores = append(userScores, m.UserScore)
		opponentScores = append(opponentScores, m.OpponentScore)
	}

	return &HeadToHeadResult{
		Record: HeadToHeadRecord{
			TotalGames:    totalGames,
			Wins:          wins,
			Losses:        losses,
			Ties:          ties,
			WinPercentage: winPct,
		},
		OverallStats: OverallStats{
			Self:     statsFromScores(userScores),
			Opponent: statsFromScores(opponentScores),
		},
		RecentMatches: recentMatches,
	}, nil
}

func (s *Service) ArchiveList(ctx context.Context, viewerID int64, beforeID int, limit int) ([]ArchiveListItem, bool, error) {
	rows, err := s.store.ArchiveList(ctx, viewerID, beforeID, limit+1)
	if err != nil {
		return nil, false, fmt.Errorf("archive list: %w", err)
	}

	hasMore := len(rows) > limit
	if hasMore {
		rows = rows[:limit]
	}

	items := make([]ArchiveListItem, 0, len(rows))
	for _, row := range rows {
		item := ArchiveListItem{
			WordleID:         row.WordleID,
			ParticipantCount: row.ParticipantCount,
			ViewerHasPlayed:  row.ViewerScore != nil,
		}

		if row.ViewerScore != nil && row.ViewerCreatedAt != nil {
			item.ViewerEntry = &ArchiveEntry{
				Score:     *row.ViewerScore,
				CreatedAt: *row.ViewerCreatedAt,
			}
			item.Summary = &ArchiveSummary{
				BestScore:   scoreFromInt(row.BestScore),
				SolvedCount: row.SolvedCount,
				FailedCount: row.FailedCount,
			}
		}

		items = append(items, item)
	}

	return items, hasMore, nil
}

func (s *Service) ArchiveDetail(ctx context.Context, viewerID int64, wordleID int, players []Player) (*ArchiveDetail, error) {
	entries, err := s.store.ArchiveEntries(ctx, wordleID)
	if err != nil {
		return nil, fmt.Errorf("archive entries: %w", err)
	}

	entriesByUserID := make(map[int64]ArchiveEntryRow, len(entries))
	for _, row := range entries {
		entriesByUserID[row.UserID] = row
	}

	viewerPlayed := false
	result := &ArchiveDetail{
		WordleID:        wordleID,
		TotalUsers:      len(players),
		PlayedCount:     len(entries),
		PendingCount:    max(len(players)-len(entries), 0),
		ViewerHasPlayed: false,
		Standings:       make([]ArchiveStanding, 0, len(entries)),
		WaitingPlayers:  make([]Player, 0, max(len(players)-len(entries), 0)),
	}

	if _, ok := entriesByUserID[viewerID]; ok {
		viewerPlayed = true
		result.ViewerHasPlayed = true
		row := entriesByUserID[viewerID]
		result.ViewerEntry = archiveEntryFromRow(row)
	}

	if viewerPlayed {
		result.Standings = buildStandings(players, entriesByUserID)
		result.WaitingPlayers = buildWaitingPlayers(players, entriesByUserID)
	}

	return result, nil
}

func (s *Service) Submit(ctx context.Context, userID int64, rawInput string) (*Entry, error) {
	wordleID, score, err := parseWordleInput(rawInput)
	if err != nil {
		return nil, err
	}

	entry, err := s.store.CreateEntry(ctx, userID, wordleID, score, rawInput)
	if err != nil {
		return nil, err
	}

	return entry, nil
}

func (s *Service) Leaderboard(ctx context.Context, players []Player) (*LeaderboardData, error) {
	if len(players) == 0 {
		return &LeaderboardData{Items: []LeaderboardEntry{}}, nil
	}

	sharedIDs, err := s.store.SharedWordleIDs(ctx, len(players))
	if err != nil {
		return nil, fmt.Errorf("shared wordle IDs: %w", err)
	}

	if len(sharedIDs) == 0 {
		entries := make([]LeaderboardEntry, 0, len(players))
		for _, p := range players {
			entries = append(entries, leaderboardEntryFromStats(p, statsFromDist(nil, nil)))
		}
		sortLeaderboard(entries)
		return &LeaderboardData{SharedWordles: 0, Items: entries}, nil
	}

	scoreCounts, err := s.store.UserScoreDistribution(ctx, sharedIDs)
	if err != nil {
		return nil, fmt.Errorf("user score distribution: %w", err)
	}

	streakRows, err := s.store.UserWinningWordleIDs(ctx, sharedIDs)
	if err != nil {
		return nil, fmt.Errorf("user winning wordle IDs: %w", err)
	}

	userDists := groupScoresByUser(scoreCounts)
	userStreakIDs := groupStreaksByUser(streakRows)

	entries := make([]LeaderboardEntry, 0, len(players))
	for _, p := range players {
		entries = append(entries, leaderboardEntryFromStats(p, statsFromDist(userDists[p.ID], userStreakIDs[p.ID])))
	}

	sortLeaderboard(entries)
	return &LeaderboardData{SharedWordles: len(sharedIDs), Items: entries}, nil
}

func buildStandings(players []Player, entriesByUserID map[int64]ArchiveEntryRow) []ArchiveStanding {
	standings := make([]ArchiveStanding, 0, len(entriesByUserID))
	for _, player := range players {
		row, ok := entriesByUserID[player.ID]
		if !ok {
			continue
		}
		standings = append(standings, ArchiveStanding{
			User:  player,
			Entry: *archiveEntryFromRow(row),
		})
	}
	sort.Slice(standings, func(i, j int) bool {
		li := scoreToInt(standings[i].Entry.Score)
		lj := scoreToInt(standings[j].Entry.Score)
		if li != lj {
			return li < lj
		}
		if standings[i].Entry.CreatedAt != standings[j].Entry.CreatedAt {
			return standings[i].Entry.CreatedAt.Before(standings[j].Entry.CreatedAt)
		}
		return standings[i].User.Name < standings[j].User.Name
	})
	return standings
}

func buildWaitingPlayers(players []Player, entriesByUserID map[int64]ArchiveEntryRow) []Player {
	waiting := make([]Player, 0, max(len(players)-len(entriesByUserID), 0))
	for _, player := range players {
		if _, ok := entriesByUserID[player.ID]; !ok {
			waiting = append(waiting, player)
		}
	}
	sort.Slice(waiting, func(i, j int) bool {
		return waiting[i].Name < waiting[j].Name
	})
	return waiting
}

func groupScoresByUser(rows []UserScoreCount) map[int64][]ScoreCount {
	m := make(map[int64][]ScoreCount, len(rows))
	for _, r := range rows {
		m[r.UserID] = append(m[r.UserID], ScoreCount{Score: r.Score, Count: r.Count})
	}
	return m
}

func groupStreaksByUser(rows []UserWordleID) map[int64][]int {
	m := make(map[int64][]int, len(rows))
	for _, r := range rows {
		m[r.UserID] = append(m[r.UserID], r.WordleID)
	}
	return m
}

func archiveEntryFromRow(row ArchiveEntryRow) *ArchiveEntry {
	entry := &ArchiveEntry{
		Score:     row.Score,
		CreatedAt: row.CreatedAt,
	}
	if row.RawInput != nil {
		entry.RawInput = *row.RawInput
	}
	return entry
}

func leaderboardEntryFromStats(player Player, stats *Stats) LeaderboardEntry {
	return LeaderboardEntry{
		Player:        player,
		TotalGames:    stats.Games,
		AverageScore:  stats.AverageScore,
		WinPercentage: stats.WinPercentage,
		CurrentStreak: stats.CurrentStreak,
		MaxStreak:     stats.MaxStreak,
	}
}

func sortLeaderboard(entries []LeaderboardEntry) {
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].TotalGames != entries[j].TotalGames {
			return entries[i].TotalGames > entries[j].TotalGames
		}
		if entries[i].AverageScore != entries[j].AverageScore {
			return entries[i].AverageScore < entries[j].AverageScore
		}
		if entries[i].WinPercentage != entries[j].WinPercentage {
			return entries[i].WinPercentage > entries[j].WinPercentage
		}
		return entries[i].Player.Name < entries[j].Player.Name
	})
}
