package wordles

import "testing"

func TestScoreToInt(t *testing.T) {
	tests := []struct {
		score string
		want  int
	}{
		{"X", 7}, {"1", 1}, {"2", 2}, {"3", 3}, {"4", 4}, {"5", 5}, {"6", 6},
	}
	for _, tt := range tests {
		t.Run(tt.score, func(t *testing.T) {
			if got := scoreToInt(tt.score); got != tt.want {
				t.Errorf("scoreToInt(%q) = %d, want %d", tt.score, got, tt.want)
			}
		})
	}
}

func TestCompareResult(t *testing.T) {
	tests := []struct {
		name      string
		user, opp string
		want      string
	}{
		{"lower score wins", "3", "4", "WIN"},
		{"higher score loses", "4", "3", "LOSS"},
		{"same score ties", "3", "3", "TIE"},
		{"X loses to 6", "X", "6", "LOSS"},
		{"1 beats X", "1", "X", "WIN"},
		{"X ties X", "X", "X", "TIE"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := compareResult(tt.user, tt.opp); got != tt.want {
				t.Errorf("compareResult(%q, %q) = %q, want %q", tt.user, tt.opp, got, tt.want)
			}
		})
	}
}

func TestStatsFromDist(t *testing.T) {
	dist := []ScoreCount{
		{Score: "3", Count: 5},
		{Score: "4", Count: 3},
		{Score: "X", Count: 2},
	}
	wordleIDs := []int{10, 9, 8, 5, 4}

	stats := statsFromDist(dist, wordleIDs)

	if stats.Games != 10 {
		t.Errorf("Games = %d, want 10", stats.Games)
	}
	if stats.Wins != 8 {
		t.Errorf("Wins = %d, want 8", stats.Wins)
	}
	if stats.Fails != 2 {
		t.Errorf("Fails = %d, want 2", stats.Fails)
	}
	if stats.CurrentStreak != 3 {
		t.Errorf("CurrentStreak = %d, want 3", stats.CurrentStreak)
	}
	if stats.MaxStreak != 3 {
		t.Errorf("MaxStreak = %d, want 3", stats.MaxStreak)
	}
}

func TestStatsFromScores(t *testing.T) {
	scores := []string{"3", "4", "X", "2", "3"}

	stats := statsFromScores(scores)

	if stats.Games != 5 {
		t.Errorf("Games = %d, want 5", stats.Games)
	}
	if stats.CurrentStreak != 2 {
		t.Errorf("CurrentStreak = %d, want 2", stats.CurrentStreak)
	}
	if stats.MaxStreak != 2 {
		t.Errorf("MaxStreak = %d, want 2", stats.MaxStreak)
	}
}

func TestStatsFromDistEmpty(t *testing.T) {
	stats := statsFromDist(nil, nil)

	if stats.Games != 0 {
		t.Errorf("Games = %d, want 0", stats.Games)
	}
	if stats.CurrentStreak != 0 {
		t.Errorf("CurrentStreak = %d, want 0", stats.CurrentStreak)
	}
}

func TestCalculateStreak(t *testing.T) {
	tests := []struct {
		name        string
		wordleIDs   []int
		wantCurrent int
		wantMax     int
	}{
		{"empty", nil, 0, 0},
		{"single", []int{100}, 1, 1},
		{"consecutive desc", []int{105, 104, 103, 102, 101}, 5, 5},
		{"broken streak", []int{105, 104, 103, 100, 99}, 3, 3},
		{"current broken max longer", []int{110, 105, 104, 103, 102, 101}, 1, 5},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			current, max := calculateStreak(tt.wordleIDs)
			if current != tt.wantCurrent {
				t.Errorf("current = %d, want %d", current, tt.wantCurrent)
			}
			if max != tt.wantMax {
				t.Errorf("max = %d, want %d", max, tt.wantMax)
			}
		})
	}
}

func TestCalculateScoreStreak(t *testing.T) {
	tests := []struct {
		name        string
		scores      []string
		wantCurrent int
		wantMax     int
	}{
		{"empty", nil, 0, 0},
		{"all wins", []string{"3", "4", "2"}, 3, 3},
		{"current broken", []string{"X", "3", "4", "2"}, 0, 3},
		{"mixed", []string{"3", "4", "X", "2", "1", "3"}, 2, 3},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			current, max := calculateScoreStreak(tt.scores)
			if current != tt.wantCurrent {
				t.Errorf("current = %d, want %d", current, tt.wantCurrent)
			}
			if max != tt.wantMax {
				t.Errorf("max = %d, want %d", max, tt.wantMax)
			}
		})
	}
}
