package wordles

import (
	"regexp"
	"strconv"
	"strings"
)

var (
	_wordleRegex       = regexp.MustCompile(`(?i)Wordle\s+(\d[\d,]*\d|\d)\s+([X1-6])/6`)
	_wordleReplayRegex = regexp.MustCompile(`(?i)Wordle:\s+#(\d+)\s+[\d\-]+\s+Guesses:\s+(\d+)`)
)

func parseWordleInput(input string) (wordleID int, score string, err error) {
	input = strings.TrimSpace(input)

	if m := _wordleRegex.FindStringSubmatch(input); m != nil {
		numStr := strings.ReplaceAll(m[1], ",", "")
		wordleID, err = strconv.Atoi(numStr)
		if err != nil {
			return 0, "", ErrInvalidFormat
		}
		score = strings.ToUpper(m[2])
		return wordleID, score, nil
	}

	if m := _wordleReplayRegex.FindStringSubmatch(input); m != nil {
		wordleID, err = strconv.Atoi(m[1])
		if err != nil {
			return 0, "", ErrInvalidFormat
		}
		guessCount, err := strconv.Atoi(m[2])
		if err != nil {
			return 0, "", ErrInvalidFormat
		}
		if guessCount >= 1 && guessCount <= 6 {
			score = strconv.Itoa(guessCount)
		} else {
			score = "X"
		}
		return wordleID, score, nil
	}

	return 0, "", ErrInvalidFormat
}
