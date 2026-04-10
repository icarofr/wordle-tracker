package wordles

import (
	"errors"
	"testing"
)

func TestParseWordleInput(t *testing.T) {
	tests := []struct {
		name      string
		input     string
		wantID    int
		wantScore string
		wantErr   error
	}{
		{"official format with comma", "Wordle 1,397 3/6", 1397, "3", nil},
		{"official format no comma", "Wordle 1397 3/6", 1397, "3", nil},
		{"X score", "Wordle 100 X/6", 100, "X", nil},
		{"case insensitive", "wordle 100 3/6", 100, "3", nil},
		{"multiline with emoji", "Wordle 1,397 3/6\n⬛🟨⬛⬛⬛", 1397, "3", nil},
		{"large number with comma", "Wordle 10,000 1/6", 10000, "1", nil},
		{"score 1", "Wordle 500 1/6", 500, "1", nil},
		{"score 6", "Wordle 500 6/6", 500, "6", nil},
		{"replay success", "Wordle: #100 2022-01-01\nGuesses: 4", 100, "4", nil},
		{"replay 6 guesses", "Wordle: #50 2021-08-08\nGuesses: 6", 50, "6", nil},
		{"replay 7 guesses becomes X", "Wordle: #50 2021-08-08\nGuesses: 7", 50, "X", nil},
		{"replay 15 guesses becomes X", "Wordle: #0 2021-06-19\nGuesses: 15", 0, "X", nil},
		{"invalid input", "hello world", 0, "", ErrInvalidFormat},
		{"empty input", "", 0, "", ErrInvalidFormat},
		{"whitespace only", "   ", 0, "", ErrInvalidFormat},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			id, score, err := parseWordleInput(tt.input)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Errorf("parseWordleInput(%q): want error %v, got %v", tt.input, tt.wantErr, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("parseWordleInput(%q): unexpected error: %v", tt.input, err)
			}
			if id != tt.wantID {
				t.Errorf("parseWordleInput(%q): wordleID = %d, want %d", tt.input, id, tt.wantID)
			}
			if score != tt.wantScore {
				t.Errorf("parseWordleInput(%q): score = %q, want %q", tt.input, score, tt.wantScore)
			}
		})
	}
}
