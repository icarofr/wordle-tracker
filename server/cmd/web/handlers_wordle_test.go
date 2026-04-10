package main

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/icarofr/wordle-tracker/internal/users"
	"github.com/icarofr/wordle-tracker/internal/wordles"
)

func TestHandleSubmit_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	now := time.Date(2026, 1, 15, 12, 0, 0, 0, time.UTC)
	app.wordles.(*wordlesServiceMock).SubmitFunc = func(_ context.Context, userID int64, rawInput string) (*wordles.Entry, error) {
		return &wordles.Entry{ID: 1, WordleID: 100, Score: "4", RawInput: rawInput, CreatedAt: now}, nil
	}

	body := strings.NewReader(`{"raw_input":"Wordle 100 4/6\n\n⬛🟨⬛⬛⬛\n⬛⬛🟩⬛🟨\n🟩🟩🟩⬛🟩\n🟩🟩🟩🟩🟩"}`)
	res := mustSend(t, handler, "POST", "/wordle-submissions", body)

	assertStatus(t, res.StatusCode, 201)
	assertContentType(t, res.Header, "application/json")

	var got wordles.Entry
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.WordleID != 100 {
		t.Errorf("wordle_id: got %d, want 100", got.WordleID)
	}
}

func TestHandleSubmit_InvalidFormat(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.wordles.(*wordlesServiceMock).SubmitFunc = func(context.Context, int64, string) (*wordles.Entry, error) {
		return nil, wordles.ErrInvalidFormat
	}

	body := strings.NewReader(`{"raw_input":"not a wordle"}`)
	res := mustSend(t, handler, "POST", "/wordle-submissions", body)

	p := assertProblem(t, res, 400, "Bad Request")
	if p.Type != "/problems/invalid-format" {
		t.Errorf("type: got %q, want %q", p.Type, "/problems/invalid-format")
	}
}

func TestHandleSubmit_Duplicate(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.wordles.(*wordlesServiceMock).SubmitFunc = func(context.Context, int64, string) (*wordles.Entry, error) {
		return nil, wordles.ErrDuplicateEntry
	}

	body := strings.NewReader(`{"raw_input":"Wordle 100 4/6"}`)
	res := mustSend(t, handler, "POST", "/wordle-submissions", body)

	p := assertProblem(t, res, 409, "Conflict")
	if p.Type != "/problems/duplicate-entry" {
		t.Errorf("type: got %q, want %q", p.Type, "/problems/duplicate-entry")
	}
}

func TestHandleSubmit_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.wordles.(*wordlesServiceMock).SubmitFunc = func(context.Context, int64, string) (*wordles.Entry, error) {
		return nil, errors.New("db timeout")
	}

	body := strings.NewReader(`{"raw_input":"some input"}`)
	res := mustSend(t, handler, "POST", "/wordle-submissions", body)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleSubmit_MalformedJSON(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	body := strings.NewReader(`{bad}`)
	res := mustSend(t, handler, "POST", "/wordle-submissions", body)

	assertProblem(t, res, 400, "Bad Request")
}

func TestHandleArchive_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.wordles.(*wordlesServiceMock).ArchiveListFunc = func(_ context.Context, viewerID int64, beforeID int, limit int) ([]wordles.ArchiveListItem, bool, error) {
		items := []wordles.ArchiveListItem{
			{WordleID: 200, ParticipantCount: 3, ViewerHasPlayed: true},
			{WordleID: 199, ParticipantCount: 3, ViewerHasPlayed: false},
		}
		return items, true, nil
	}

	res := mustSend(t, handler, "GET", "/wordles", nil)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var got wordles.ArchiveListPage
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(got.Items) != 2 {
		t.Fatalf("items: got %d, want 2", len(got.Items))
	}
	if got.Self != "http://test.local/wordles?limit=50" {
		t.Errorf("self: got %q, want %q", got.Self, "http://test.local/wordles?limit=50")
	}
	if got.Next == "" || got.Next[:len("http://test.local/wordles?")] != "http://test.local/wordles?" {
		t.Errorf("expected next link with absolute URL, got %q", got.Next)
	}
}

func TestHandleArchive_LastPage(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.wordles.(*wordlesServiceMock).ArchiveListFunc = func(context.Context, int64, int, int) ([]wordles.ArchiveListItem, bool, error) {
		return []wordles.ArchiveListItem{{WordleID: 1, ParticipantCount: 2}}, false, nil
	}

	res := mustSend(t, handler, "GET", "/wordles", nil)

	var got wordles.ArchiveListPage
	json.NewDecoder(res.Body).Decode(&got)

	if got.Next != "" {
		t.Errorf("next should be empty on last page, got %q", got.Next)
	}
}

func TestHandleArchive_WithCursorAndLimit(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	var gotBeforeID, gotLimit int
	app.wordles.(*wordlesServiceMock).ArchiveListFunc = func(_ context.Context, _ int64, beforeID int, limit int) ([]wordles.ArchiveListItem, bool, error) {
		gotBeforeID = beforeID
		gotLimit = limit
		return nil, false, nil
	}

	cursor := encodeCursor(150)
	res := mustSend(t, handler, "GET", "/wordles?cursor="+cursor+"&limit=10", nil)

	assertStatus(t, res.StatusCode, 200)
	if gotBeforeID != 150 {
		t.Errorf("beforeID: got %d, want 150", gotBeforeID)
	}
	if gotLimit != 10 {
		t.Errorf("limit: got %d, want 10", gotLimit)
	}
}

func TestHandleArchive_InvalidCursor(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSend(t, handler, "GET", "/wordles?cursor=!!!invalid!!!", nil)

	assertProblem(t, res, 400, "Bad Request")
}

func TestHandleArchive_InvalidLimit(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSend(t, handler, "GET", "/wordles?limit=abc", nil)

	assertProblem(t, res, 400, "Bad Request")
}

func TestHandleArchive_LimitClamped(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	var gotLimit int
	app.wordles.(*wordlesServiceMock).ArchiveListFunc = func(_ context.Context, _ int64, _ int, limit int) ([]wordles.ArchiveListItem, bool, error) {
		gotLimit = limit
		return nil, false, nil
	}

	mustSend(t, handler, "GET", "/wordles?limit=999", nil)

	if gotLimit != 100 {
		t.Errorf("limit should be clamped to 100, got %d", gotLimit)
	}
}

func TestHandleArchiveWordle_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).ListFunc = func(context.Context) ([]users.User, error) {
		return []users.User{{ID: 1, Name: "Alice", Avatar: "01"}}, nil
	}
	app.wordles.(*wordlesServiceMock).ArchiveDetailFunc = func(_ context.Context, viewerID int64, wordleID int, players []wordles.Player) (*wordles.ArchiveDetail, error) {
		return &wordles.ArchiveDetail{
			WordleID:    wordleID,
			TotalUsers:  len(players),
			PlayedCount: 1,
		}, nil
	}

	res := mustSend(t, handler, "GET", "/wordles/42", nil)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var got wordles.ArchiveDetail
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.WordleID != 42 {
		t.Errorf("wordle_id: got %d, want 42", got.WordleID)
	}
}

func TestHandleArchiveWordle_UsersServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).ListFunc = func(context.Context) ([]users.User, error) {
		return nil, errors.New("db timeout")
	}

	res := mustSend(t, handler, "GET", "/wordles/42", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleArchiveWordle_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).ListFunc = func(context.Context) ([]users.User, error) {
		return []users.User{{ID: 1, Name: "Alice", Avatar: "01"}}, nil
	}
	app.wordles.(*wordlesServiceMock).ArchiveDetailFunc = func(context.Context, int64, int, []wordles.Player) (*wordles.ArchiveDetail, error) {
		return nil, errors.New("db timeout")
	}

	res := mustSend(t, handler, "GET", "/wordles/42", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleArchiveWordle_InvalidID(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSend(t, handler, "GET", "/wordles/abc", nil)

	assertProblem(t, res, 400, "Bad Request")
}

func TestHandleHeadToHead_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetOpponentFunc = func(_ context.Context, userID, opponentID int64) (*users.User, error) {
		return &users.User{ID: opponentID, Name: "Bob", Avatar: "02"}, nil
	}
	app.wordles.(*wordlesServiceMock).HeadToHeadFunc = func(_ context.Context, userID, opponentID int64) (*wordles.HeadToHeadResult, error) {
		return &wordles.HeadToHeadResult{
			Record:        wordles.HeadToHeadRecord{TotalGames: 5, Wins: 3, Losses: 1, Ties: 1},
			OverallStats:  wordles.OverallStats{Self: &wordles.Stats{}, Opponent: &wordles.Stats{}},
			RecentMatches: []wordles.RecentMatch{},
		}, nil
	}

	res := mustSend(t, handler, "GET", "/users/self/head-to-heads/2", nil)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var got struct {
		Opponent userSummary              `json:"opponent"`
		Record   wordles.HeadToHeadRecord `json:"record"`
	}
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.Opponent.Name != "Bob" {
		t.Errorf("opponent name: got %q, want %q", got.Opponent.Name, "Bob")
	}
	if got.Record.TotalGames != 5 {
		t.Errorf("total_games: got %d, want 5", got.Record.TotalGames)
	}
}

func TestHandleHeadToHead_InvalidID(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSend(t, handler, "GET", "/users/self/head-to-heads/abc", nil)

	assertProblem(t, res, 400, "Bad Request")
}

func TestHandleHeadToHead_GetOpponentServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetOpponentFunc = func(context.Context, int64, int64) (*users.User, error) {
		return nil, errors.New("db timeout")
	}

	res := mustSend(t, handler, "GET", "/users/self/head-to-heads/2", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleHeadToHead_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetOpponentFunc = func(_ context.Context, userID, opponentID int64) (*users.User, error) {
		return &users.User{ID: opponentID, Name: "Bob", Avatar: "02"}, nil
	}
	app.wordles.(*wordlesServiceMock).HeadToHeadFunc = func(context.Context, int64, int64) (*wordles.HeadToHeadResult, error) {
		return nil, errors.New("db timeout")
	}

	res := mustSend(t, handler, "GET", "/users/self/head-to-heads/2", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleHeadToHead_SelfComparison(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetOpponentFunc = func(context.Context, int64, int64) (*users.User, error) {
		return nil, users.ErrInvalidOpponent
	}

	res := mustSend(t, handler, "GET", "/users/self/head-to-heads/1", nil)

	p := assertProblem(t, res, 400, "Bad Request")
	if p.Type != "/problems/invalid-opponent" {
		t.Errorf("type: got %q, want %q", p.Type, "/problems/invalid-opponent")
	}
}

func TestHandleHeadToHead_OpponentNotFound(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetOpponentFunc = func(context.Context, int64, int64) (*users.User, error) {
		return nil, users.ErrOpponentNotFound
	}

	res := mustSend(t, handler, "GET", "/users/self/head-to-heads/999", nil)

	assertProblem(t, res, 404, "Not Found")
}

func TestHandleLeaderboard_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).ListFunc = func(context.Context) ([]users.User, error) {
		return []users.User{
			{ID: 1, Name: "Alice", Avatar: "01"},
			{ID: 2, Name: "Bob", Avatar: "02"},
		}, nil
	}
	app.wordles.(*wordlesServiceMock).LeaderboardFunc = func(_ context.Context, players []wordles.Player) (*wordles.LeaderboardData, error) {
		return &wordles.LeaderboardData{
			SharedWordles: 10,
			Items: []wordles.LeaderboardEntry{
				{Player: players[0], TotalGames: 10, AverageScore: 3.5},
			},
		}, nil
	}

	res := mustSend(t, handler, "GET", "/leaderboards/current", nil)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var got wordles.LeaderboardData
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.SharedWordles != 10 {
		t.Errorf("shared_wordles: got %d, want 10", got.SharedWordles)
	}
}

func TestHandleLeaderboard_UsersServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).ListFunc = func(context.Context) ([]users.User, error) {
		return nil, errors.New("db timeout")
	}

	res := mustSend(t, handler, "GET", "/leaderboards/current", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleLeaderboard_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).ListFunc = func(context.Context) ([]users.User, error) {
		return []users.User{{ID: 1, Name: "Alice", Avatar: "01"}}, nil
	}
	app.wordles.(*wordlesServiceMock).LeaderboardFunc = func(context.Context, []wordles.Player) (*wordles.LeaderboardData, error) {
		return nil, errors.New("db timeout")
	}

	res := mustSend(t, handler, "GET", "/leaderboards/current", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}
