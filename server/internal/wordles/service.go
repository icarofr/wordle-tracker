package wordles

import (
	"context"
	"fmt"
	"sort"
)

type Repository interface {
	StatsSnapshot(ctx context.Context, userID int64) (*StatsSnapshot, error)
	HeadToHeadMatches(ctx context.Context, userID, opponentID int64) ([]HeadToHeadMatch, error)
	ArchivePage(ctx context.Context, viewerID int64, beforeID int32, limit int32) (*ArchiveListSnapshot, error)
	ArchiveEntries(ctx context.Context, wordleID int32) ([]ArchiveEntrySnapshot, error)
	SubmitEntry(ctx context.Context, userID int64, entry ParsedEntry) (*Entry, error)
	LeaderboardSnapshot(ctx context.Context, playerIDs []int64) (*LeaderboardSnapshot, error)
}

type Service struct {
	repository Repository
}

func New(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) Stats(ctx context.Context, userID int64) (*Stats, error) {
	snapshot, err := s.repository.StatsSnapshot(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("stats snapshot: %w", err)
	}

	if snapshot == nil {
		return statsFromDist(nil, nil), nil
	}

	return statsFromDist(snapshot.Distribution, snapshot.WinningWordleIDs), nil
}

func (s *Service) HeadToHead(ctx context.Context, userID, opponentID int64) (*HeadToHeadResult, error) {
	matches, err := s.repository.HeadToHeadMatches(ctx, userID, opponentID)
	if err != nil {
		return nil, fmt.Errorf("head to head matches: %w", err)
	}

	var wins, losses, ties int64
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

	totalGames := int64(len(matches))
	winPct := roundedWinPercentage(wins, totalGames)

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

func (s *Service) ArchiveList(ctx context.Context, viewerID int64, beforeID int32, limit int32) ([]ArchiveListItem, bool, error) {
	page, err := s.repository.ArchivePage(ctx, viewerID, beforeID, limit)
	if err != nil {
		return nil, false, fmt.Errorf("archive list: %w", err)
	}

	if page == nil {
		return nil, false, nil
	}

	items := make([]ArchiveListItem, 0, len(page.Items))
	for _, row := range page.Items {
		item := ArchiveListItem{
			WordleID:         row.WordleID,
			ParticipantCount: row.ParticipantCount,
			ViewerHasPlayed:  row.ViewerHasPlayed,
		}

		if row.ViewerHasPlayed && row.ViewerCreatedAt != nil {
			item.ViewerEntry = &ArchiveEntry{
				Score:     row.ViewerScore,
				CreatedAt: *row.ViewerCreatedAt,
			}
			item.Summary = &ArchiveSummary{
				BestScore:   scoreFromInt(row.BestScore),
				BestCount:   row.BestCount,
				SolvedCount: row.SolvedCount,
				FailedCount: row.FailedCount,
			}
		}

		items = append(items, item)
	}

	return items, page.HasMore, nil
}

func (s *Service) ArchiveDetail(ctx context.Context, viewerID int64, wordleID int32, players []Player) (*ArchiveDetail, error) {
	entries, err := s.repository.ArchiveEntries(ctx, wordleID)
	if err != nil {
		return nil, fmt.Errorf("archive entries: %w", err)
	}

	entriesByUserID := make(map[int64]ArchiveEntrySnapshot, len(entries))
	for _, row := range entries {
		entriesByUserID[row.UserID] = row
	}

	waitingCapacity := len(players) - len(entries)
	if waitingCapacity < 0 {
		waitingCapacity = 0
	}
	pendingCount := int64(len(players) - len(entries))
	if pendingCount < 0 {
		pendingCount = 0
	}

	viewerPlayed := false
	result := &ArchiveDetail{
		WordleID:        wordleID,
		TotalUsers:      int64(len(players)),
		PlayedCount:     int64(len(entries)),
		PendingCount:    pendingCount,
		ViewerHasPlayed: false,
		Standings:       make([]ArchiveStanding, 0, len(entries)),
		WaitingPlayers:  make([]Player, 0, waitingCapacity),
	}

	if _, ok := entriesByUserID[viewerID]; ok {
		viewerPlayed = true
		result.ViewerHasPlayed = true
		row := entriesByUserID[viewerID]
		result.ViewerEntry = archiveEntryFromSnapshot(row)
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

	entry, err := s.repository.SubmitEntry(ctx, userID, ParsedEntry{
		WordleID: wordleID,
		Score:    score,
		RawInput: rawInput,
	})
	if err != nil {
		return nil, err
	}

	return entry, nil
}

func (s *Service) Leaderboard(ctx context.Context, players []Player) (*LeaderboardData, error) {
	if len(players) == 0 {
		return &LeaderboardData{Items: []LeaderboardEntry{}}, nil
	}

	snapshot, err := s.repository.LeaderboardSnapshot(ctx, playerIDsFromPlayers(players))
	if err != nil {
		return nil, fmt.Errorf("leaderboard snapshot: %w", err)
	}

	entries := make([]LeaderboardEntry, 0, len(players))
	for _, p := range players {
		stats := statsFromDist(nil, nil)
		if snapshot != nil {
			if userStats, ok := snapshot.StatsByUser[p.ID]; ok {
				stats = statsFromDist(userStats.Distribution, userStats.WinningWordleIDs)
			}
		}
		entries = append(entries, leaderboardEntryFromStats(p, stats))
	}

	sortLeaderboard(entries)
	var sharedWordles int64
	if snapshot != nil {
		sharedWordles = snapshot.SharedWordles
	}
	return &LeaderboardData{SharedWordles: sharedWordles, Items: entries}, nil
}

func buildStandings(players []Player, entriesByUserID map[int64]ArchiveEntrySnapshot) []ArchiveStanding {
	standings := make([]ArchiveStanding, 0, len(entriesByUserID))
	for _, player := range players {
		row, ok := entriesByUserID[player.ID]
		if !ok {
			continue
		}
		standings = append(standings, ArchiveStanding{
			User:  player,
			Entry: *archiveEntryFromSnapshot(row),
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

func buildWaitingPlayers(players []Player, entriesByUserID map[int64]ArchiveEntrySnapshot) []Player {
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

func archiveEntryFromSnapshot(row ArchiveEntrySnapshot) *ArchiveEntry {
	entry := &ArchiveEntry{
		Score:     row.Score,
		CreatedAt: row.CreatedAt,
	}
	if row.RawInput != nil {
		entry.RawInput = *row.RawInput
	}
	return entry
}

func playerIDsFromPlayers(players []Player) []int64 {
	ids := make([]int64, 0, len(players))
	for _, player := range players {
		ids = append(ids, player.ID)
	}
	return ids
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
		leftAverage := averageScoreHundredths(entries[i].AverageScore)
		rightAverage := averageScoreHundredths(entries[j].AverageScore)
		if leftAverage != rightAverage {
			return leftAverage < rightAverage
		}
		leftWinPercentage := winPercentageTenths(entries[i].WinPercentage)
		rightWinPercentage := winPercentageTenths(entries[j].WinPercentage)
		if leftWinPercentage != rightWinPercentage {
			return leftWinPercentage > rightWinPercentage
		}
		return entries[i].Player.Name < entries[j].Player.Name
	})
}
