package wordles

import (
	"time"

	"github.com/icarofr/wordle-tracker/internal/users"
)

// Store-facing types (no json tags) — returned by Store interface methods.

type ScoreCount struct {
	Score string
	Count int64
}

type StatsSnapshot struct {
	Distribution     []ScoreCount
	WinningWordleIDs []int32
}

type HeadToHeadMatch struct {
	WordleID      int32
	UserScore     string
	OpponentScore string
	CreatedAt     time.Time
}

type ArchiveListSnapshot struct {
	HasMore bool
	Items   []ArchiveListSnapshotItem
}

type ArchiveListSnapshotItem struct {
	WordleID         int32
	ParticipantCount int64
	ViewerHasPlayed  bool
	ViewerScore      string
	ViewerCreatedAt  *time.Time
	BestScore        int32
	BestCount        int64
	SolvedCount      int64
	FailedCount      int64
}

type ArchiveEntrySnapshot struct {
	UserID    int64
	Score     string
	RawInput  *string
	CreatedAt time.Time
}

type ParsedEntry struct {
	WordleID int32
	Score    string
	RawInput string
}

type LeaderboardSnapshot struct {
	SharedWordles int64
	StatsByUser   map[int64]StatsSnapshot
}

// API-facing types (json tags) — service outputs.

type Player struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

type Entry struct {
	ID        int64     `json:"id"`
	WordleID  int32     `json:"wordle_id"`
	Score     string    `json:"score"`
	RawInput  string    `json:"raw_input"`
	CreatedAt time.Time `json:"created_at"`
}

type Stats struct {
	Games         int64            `json:"games"`
	Wins          int64            `json:"wins"`
	Fails         int64            `json:"fails"`
	AverageScore  float64          `json:"average_score"`
	WinPercentage float64          `json:"win_percentage"`
	Distribution  map[string]int64 `json:"distribution"`
	CurrentStreak int64            `json:"current_streak"`
	MaxStreak     int64            `json:"max_streak"`
}

type HeadToHeadResult struct {
	Record        HeadToHeadRecord `json:"record"`
	OverallStats  OverallStats     `json:"stats"`
	RecentMatches []RecentMatch    `json:"recent_matches"`
}

type HeadToHeadRecord struct {
	TotalGames    int64   `json:"total_games"`
	Wins          int64   `json:"wins"`
	Losses        int64   `json:"losses"`
	Ties          int64   `json:"ties"`
	WinPercentage float64 `json:"win_percentage"`
}

type OverallStats struct {
	Self     *Stats `json:"self"`
	Opponent *Stats `json:"opponent"`
}

type RecentMatch struct {
	WordleID      int32     `json:"wordle_id"`
	SelfScore     string    `json:"self_score"`
	OpponentScore string    `json:"opponent_score"`
	PlayedAt      time.Time `json:"played_at"`
	Result        string    `json:"result"`
}

type ArchiveListPage struct {
	Self  string            `json:"self"`
	Next  string            `json:"next,omitempty"`
	Items []ArchiveListItem `json:"items"`
}

type ArchiveListItem struct {
	WordleID         int32           `json:"wordle_id"`
	ParticipantCount int64           `json:"participant_count"`
	ViewerHasPlayed  bool            `json:"viewer_has_played"`
	ViewerEntry      *ArchiveEntry   `json:"viewer_entry,omitempty"`
	Summary          *ArchiveSummary `json:"summary,omitempty"`
}

type ArchiveEntry struct {
	Score     string    `json:"score"`
	CreatedAt time.Time `json:"created_at"`
	RawInput  string    `json:"raw_input,omitempty"`
}

type ArchiveSummary struct {
	BestScore   string `json:"best_score"`
	BestCount   int64  `json:"best_count"`
	SolvedCount int64  `json:"solved_count"`
	FailedCount int64  `json:"failed_count"`
}

type ArchiveDetail struct {
	WordleID        int32             `json:"wordle_id"`
	TotalUsers      int64             `json:"total_users"`
	PlayedCount     int64             `json:"played_count"`
	PendingCount    int64             `json:"pending_count"`
	ViewerHasPlayed bool              `json:"viewer_has_played"`
	ViewerEntry     *ArchiveEntry     `json:"viewer_entry,omitempty"`
	Standings       []ArchiveStanding `json:"standings"`
	WaitingPlayers  []Player          `json:"waiting_players"`
}

type ArchiveStanding struct {
	User  Player       `json:"user"`
	Entry ArchiveEntry `json:"entry"`
}

type LeaderboardData struct {
	SharedWordles int64              `json:"shared_wordles"`
	Items         []LeaderboardEntry `json:"items"`
}

type LeaderboardEntry struct {
	Player        Player  `json:"player"`
	TotalGames    int64   `json:"total_games"`
	AverageScore  float64 `json:"average_score"`
	WinPercentage float64 `json:"win_percentage"`
	CurrentStreak int64   `json:"current_streak"`
	MaxStreak     int64   `json:"max_streak"`
}

// PlayersFromUsers converts a slice of users.User to a slice of Player.
// This adapter function lives in the wordles package since it produces
// wordles.Player types.
func PlayersFromUsers(allUsers []users.User) []Player {
	players := make([]Player, len(allUsers))
	for i, u := range allUsers {
		players[i] = Player{ID: u.ID, Name: u.Name, Avatar: u.Avatar}
	}
	return players
}
