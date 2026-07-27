package wordles

import (
	"math"
	"strconv"
)

func roundedScaledRatio(numerator, denominator, scale int64) int64 {
	if denominator <= 0 {
		return 0
	}

	return (numerator*scale + denominator/2) / denominator
}

func roundedWinPercentage(wins, games int64) float64 {
	return float64(roundedScaledRatio(wins, games, 1000)) / 10
}

func roundedAverageScore(totalScore, games int64) float64 {
	return float64(roundedScaledRatio(totalScore, games, 100)) / 100
}

func averageScoreHundredths(value float64) int64 {
	return int64(math.Round(value * 100))
}

func winPercentageTenths(value float64) int64 {
	return int64(math.Round(value * 10))
}

func scoreToInt(score string) int {
	if score == "X" {
		return 7
	}
	n, _ := strconv.Atoi(score)
	return n
}

func scoreFromInt(score int32) string {
	if score >= 7 {
		return "X"
	}
	return strconv.Itoa(int(score))
}

func compareResult(userScore, oppScore string) string {
	u := scoreToInt(userScore)
	o := scoreToInt(oppScore)
	if u < o {
		return "WIN"
	}
	if u > o {
		return "LOSS"
	}
	return "TIE"
}

// calculateStreak returns the current and max win streaks from a descending
// ordered slice of wordle IDs where consecutive IDs differ by 1.
func calculateStreak(wordleIDs []int32) (current, max int64) {
	if len(wordleIDs) == 0 {
		return 0, 0
	}
	current = 1
	for i := 1; i < len(wordleIDs); i++ {
		if wordleIDs[i-1]-wordleIDs[i] == 1 {
			current++
		} else {
			break
		}
	}
	var streak int64 = 1
	max = 1
	for i := 1; i < len(wordleIDs); i++ {
		if wordleIDs[i-1]-wordleIDs[i] == 1 {
			streak++
		} else {
			if streak > max {
				max = streak
			}
			streak = 1
		}
	}
	if streak > max {
		max = streak
	}
	return current, max
}

// calculateScoreStreak returns the current and max win streaks from a
// newest-first ordered slice of scores where streaks are consecutive non-"X" values.
func calculateScoreStreak(scores []string) (current, max int64) {
	for _, s := range scores {
		if s != "X" {
			current++
		} else {
			break
		}
	}
	var streak int64
	for _, s := range scores {
		if s != "X" {
			streak++
		} else {
			if streak > max {
				max = streak
			}
			streak = 0
		}
	}
	if streak > max {
		max = streak
	}
	return current, max
}

// statsFromDist computes Stats from pre-aggregated score distribution rows
// and wordle IDs where the user did not fail, ordered descending for streak calculation.
func statsFromDist(dist []ScoreCount, wordleIDs []int32) *Stats {
	distribution := map[string]int64{
		"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "X": 0,
	}
	var games, wins, fails, totalScore int64
	for _, r := range dist {
		distribution[r.Score] = r.Count
		games += r.Count
		if r.Score == "X" {
			fails += r.Count
			totalScore += 7 * r.Count
		} else {
			wins += r.Count
			totalScore += int64(scoreToInt(r.Score)) * r.Count
		}
	}

	currentStreak, maxStreak := calculateStreak(wordleIDs)

	winPct := roundedWinPercentage(wins, games)
	avgScore := roundedAverageScore(totalScore, games)

	return &Stats{
		Games:         games,
		Wins:          wins,
		Fails:         fails,
		AverageScore:  avgScore,
		WinPercentage: winPct,
		Distribution:  distribution,
		CurrentStreak: currentStreak,
		MaxStreak:     maxStreak,
	}
}

// statsFromScores computes Stats from an ordered slice of scores (newest first).
func statsFromScores(scores []string) *Stats {
	distribution := map[string]int64{
		"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "X": 0,
	}
	var games, wins, fails, totalScore int64
	for _, s := range scores {
		distribution[s]++
		games++
		if s == "X" {
			fails++
			totalScore += 7
		} else {
			wins++
			totalScore += int64(scoreToInt(s))
		}
	}

	currentStreak, maxStreak := calculateScoreStreak(scores)

	winPct := roundedWinPercentage(wins, games)
	avgScore := roundedAverageScore(totalScore, games)

	return &Stats{
		Games:         games,
		Wins:          wins,
		Fails:         fails,
		AverageScore:  avgScore,
		WinPercentage: winPct,
		Distribution:  distribution,
		CurrentStreak: currentStreak,
		MaxStreak:     maxStreak,
	}
}
