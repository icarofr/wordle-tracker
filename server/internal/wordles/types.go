package wordles

import "time"

// Store-facing types (no json tags) — returned by Store interface methods.

type ScoreCount struct {
	Score string
	Count int
}

type Match struct {
	WordleID      int
	UserScore     string
	OpponentScore string
	CreatedAt     time.Time
}

type ArchiveListRow struct {
	WordleID         int
	ParticipantCount int
	ViewerScore      *string
	ViewerCreatedAt  *time.Time
	BestScore        int
	SolvedCount      int
	FailedCount      int
}

type ArchiveEntryRow struct {
	UserID    int64
	Score     string
	RawInput  *string
	CreatedAt time.Time
}

type UserScoreCount struct {
	UserID int64
	Score  string
	Count  int
}

type UserWordleID struct {
	UserID   int64
	WordleID int
}

// API-facing types (json tags) — service outputs.

type Player struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

type Entry struct {
	ID        int64     `json:"id"`
	WordleID  int       `json:"wordle_id"`
	Score     string    `json:"score"`
	RawInput  string    `json:"raw_input"`
	CreatedAt time.Time `json:"created_at"`
}

type Stats struct {
	Games         int            `json:"games"`
	Wins          int            `json:"wins"`
	Fails         int            `json:"fails"`
	AverageScore  float64        `json:"average_score"`
	WinPercentage float64        `json:"win_percentage"`
	Distribution  map[string]int `json:"distribution"`
	CurrentStreak int            `json:"current_streak"`
	MaxStreak     int            `json:"max_streak"`
}

type HeadToHeadResult struct {
	Record        HeadToHeadRecord `json:"record"`
	OverallStats  OverallStats     `json:"stats"`
	RecentMatches []RecentMatch    `json:"recent_matches"`
}

type HeadToHeadRecord struct {
	TotalGames    int     `json:"total_games"`
	Wins          int     `json:"wins"`
	Losses        int     `json:"losses"`
	Ties          int     `json:"ties"`
	WinPercentage float64 `json:"win_percentage"`
}

type OverallStats struct {
	Self     *Stats `json:"self"`
	Opponent *Stats `json:"opponent"`
}

type RecentMatch struct {
	WordleID      int       `json:"wordle_id"`
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
	WordleID         int             `json:"wordle_id"`
	ParticipantCount int             `json:"participant_count"`
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
	SolvedCount int    `json:"solved_count"`
	FailedCount int    `json:"failed_count"`
}

type ArchiveDetail struct {
	WordleID        int               `json:"wordle_id"`
	TotalUsers      int               `json:"total_users"`
	PlayedCount     int               `json:"played_count"`
	PendingCount    int               `json:"pending_count"`
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
	SharedWordles int                `json:"shared_wordles"`
	Items         []LeaderboardEntry `json:"items"`
}

type LeaderboardEntry struct {
	Player        Player  `json:"player"`
	TotalGames    int     `json:"total_games"`
	AverageScore  float64 `json:"average_score"`
	WinPercentage float64 `json:"win_percentage"`
	CurrentStreak int     `json:"current_streak"`
	MaxStreak     int     `json:"max_streak"`
}
