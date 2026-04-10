package main

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"github.com/icarofr/wordle-tracker/internal/auth"
	"github.com/icarofr/wordle-tracker/internal/users"
	"github.com/icarofr/wordle-tracker/internal/wordles"
)

func TestHandleUsers_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).ListFunc = func(context.Context) ([]users.User, error) {
		return []users.User{
			{ID: 1, Name: "Alice", Avatar: "01"},
			{ID: 2, Name: "Bob", Avatar: "02"},
		}, nil
	}

	res := mustSend(t, handler, "GET", "/users", nil)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var body struct {
		Items []userSummary `json:"items"`
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(body.Items) != 2 {
		t.Fatalf("items count: got %d, want 2", len(body.Items))
	}
	if body.Items[0].Name != "Alice" {
		t.Errorf("first user: got %q, want %q", body.Items[0].Name, "Alice")
	}
}

func TestHandleUsers_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).ListFunc = func(context.Context) ([]users.User, error) {
		return nil, errors.New("db down")
	}

	res := mustSend(t, handler, "GET", "/users", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleUser_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetFunc = func(_ context.Context, id int64) (*users.User, error) {
		return &users.User{ID: id, Name: "Bob", Avatar: "02"}, nil
	}

	res := mustSend(t, handler, "GET", "/users/2", nil)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var got userSummary
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.ID != 2 {
		t.Errorf("id: got %d, want 2", got.ID)
	}
}

func TestHandleUser_InvalidID(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSend(t, handler, "GET", "/users/abc", nil)

	assertProblem(t, res, 400, "Bad Request")
}

func TestHandleUser_NotFound(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetFunc = func(context.Context, int64) (*users.User, error) {
		return nil, users.ErrUserNotFound
	}

	res := mustSend(t, handler, "GET", "/users/999", nil)

	assertProblem(t, res, 404, "Not Found")
}

func TestHandleUser_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetFunc = func(context.Context, int64) (*users.User, error) {
		return nil, errors.New("db timeout")
	}

	res := mustSend(t, handler, "GET", "/users/2", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleSelf_OK(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSend(t, handler, "GET", "/users/self", nil)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var got auth.SessionUser
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.ID != testUser.ID {
		t.Errorf("id: got %d, want %d", got.ID, testUser.ID)
	}
	if got.Email != testUser.Email {
		t.Errorf("email: got %q, want %q", got.Email, testUser.Email)
	}
}

func TestHandleUpdateProfile_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.auth.(*authServiceMock).UpdateAvatarFunc = func(_ context.Context, userID int64, avatar string) (*auth.SessionUser, error) {
		return &auth.SessionUser{ID: userID, Name: "Alice", Email: "alice@test.com", Avatar: avatar}, nil
	}

	body := strings.NewReader(`{"avatar":"05"}`)
	res := mustSend(t, handler, "PATCH", "/users/self", body)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var got auth.SessionUser
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.Avatar != "05" {
		t.Errorf("avatar: got %q, want %q", got.Avatar, "05")
	}
}

func TestHandleUpdateProfile_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.auth.(*authServiceMock).UpdateAvatarFunc = func(context.Context, int64, string) (*auth.SessionUser, error) {
		return nil, errors.New("db timeout")
	}

	body := strings.NewReader(`{"avatar":"05"}`)
	res := mustSend(t, handler, "PATCH", "/users/self", body)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleUpdateProfile_InvalidAvatar(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	body := strings.NewReader(`{"avatar":"99"}`)
	res := mustSend(t, handler, "PATCH", "/users/self", body)

	p := assertProblem(t, res, 400, "Bad Request")
	if len(p.Errors) == 0 {
		t.Error("expected field errors, got none")
	}
	if p.Errors[0].Field != "avatar" {
		t.Errorf("error field: got %q, want %q", p.Errors[0].Field, "avatar")
	}
}

func TestHandleUpdateProfile_MalformedJSON(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	body := strings.NewReader(`{broken}`)
	res := mustSend(t, handler, "PATCH", "/users/self", body)

	assertProblem(t, res, 400, "Bad Request")
}

func TestHandleSelfStats_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.wordles.(*wordlesServiceMock).StatsFunc = func(_ context.Context, userID int64) (*wordles.Stats, error) {
		return &wordles.Stats{Games: 10, Wins: 8, AverageScore: 3.5}, nil
	}

	res := mustSend(t, handler, "GET", "/users/self/stats", nil)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	var got wordles.Stats
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.Games != 10 {
		t.Errorf("games: got %d, want 10", got.Games)
	}
}

func TestHandleSelfStats_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.wordles.(*wordlesServiceMock).StatsFunc = func(context.Context, int64) (*wordles.Stats, error) {
		return nil, errors.New("db error")
	}

	res := mustSend(t, handler, "GET", "/users/self/stats", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleUserStats_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetFunc = func(_ context.Context, id int64) (*users.User, error) {
		return &users.User{ID: id, Name: "Bob", Avatar: "02"}, nil
	}
	app.wordles.(*wordlesServiceMock).StatsFunc = func(_ context.Context, userID int64) (*wordles.Stats, error) {
		return &wordles.Stats{Games: 5, Wins: 3}, nil
	}

	res := mustSend(t, handler, "GET", "/users/2/stats", nil)

	assertStatus(t, res.StatusCode, 200)

	var got wordles.Stats
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.Games != 5 {
		t.Errorf("games: got %d, want 5", got.Games)
	}
}

func TestHandleUserStats_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetFunc = func(_ context.Context, id int64) (*users.User, error) {
		return &users.User{ID: id, Name: "Bob", Avatar: "02"}, nil
	}
	app.wordles.(*wordlesServiceMock).StatsFunc = func(context.Context, int64) (*wordles.Stats, error) {
		return nil, errors.New("db timeout")
	}

	res := mustSend(t, handler, "GET", "/users/2/stats", nil)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleUserStats_UserNotFound(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.users.(*usersServiceMock).GetFunc = func(context.Context, int64) (*users.User, error) {
		return nil, users.ErrUserNotFound
	}

	res := mustSend(t, handler, "GET", "/users/999/stats", nil)

	assertProblem(t, res, 404, "Not Found")
}

func TestHandleUserStats_InvalidID(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSend(t, handler, "GET", "/users/abc/stats", nil)

	assertProblem(t, res, 400, "Bad Request")
}
