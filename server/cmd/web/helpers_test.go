package main

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/icarofr/wordle-tracker/internal/auth"
	"github.com/icarofr/wordle-tracker/internal/users"
	"github.com/icarofr/wordle-tracker/internal/wordles"
)

// --- Fixtures ---

var testUser = &auth.SessionUser{
	ID:     1,
	Name:   "Alice",
	Email:  "alice@test.com",
	Avatar: "01",
}

const testToken = "Bearer test-token"

// --- Test-only response types (removed from handler files during oapi-codegen migration) ---

type sessionResponse struct {
	User *auth.SessionUser `json:"user"`
}

type userSummary struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

// --- Test app builder ---

func newTestApp(t *testing.T) (*application, http.Handler) {
	t.Helper()

	app := &application{
		health: &pingerMock{
			PingContextFunc: func(context.Context) error { return nil },
		},
		auth: &authServiceMock{
			LoginFunc:        func(context.Context, auth.LoginInput) (*auth.SessionUser, string, error) { return nil, "", nil },
			RegisterFunc:     func(context.Context, auth.RegisterInput) (*auth.SessionUser, string, error) { return nil, "", nil },
			LogoutFunc:       func(context.Context, string) error { return nil },
			UpdateAvatarFunc: func(context.Context, int64, string) (*auth.SessionUser, error) { return nil, nil },
			UserByAuthorizationFunc: func(_ context.Context, authz string) (*auth.SessionUser, error) {
				if authz == testToken {
					return testUser, nil
				}
				return nil, nil
			},
		},
		users: &usersServiceMock{
			ListFunc:        func(context.Context) ([]users.User, error) { return nil, nil },
			GetFunc:         func(context.Context, int64) (*users.User, error) { return nil, nil },
			GetOpponentFunc: func(context.Context, int64, int64) (*users.User, error) { return nil, nil },
		},
		wordles: &wordlesServiceMock{
			StatsFunc:      func(context.Context, int64) (*wordles.Stats, error) { return nil, nil },
			HeadToHeadFunc: func(context.Context, int64, int64) (*wordles.HeadToHeadResult, error) { return nil, nil },
			ArchiveListFunc: func(context.Context, int64, int32, int32) ([]wordles.ArchiveListItem, bool, error) {
				return nil, false, nil
			},
			ArchiveDetailFunc: func(context.Context, int64, int32, []wordles.Player) (*wordles.ArchiveDetail, error) { return nil, nil },
			SubmitFunc:        func(context.Context, int64, string) (*wordles.Entry, error) { return nil, nil },
			LeaderboardFunc:   func(context.Context, []wordles.Player) (*wordles.LeaderboardData, error) { return nil, nil },
		},
		logger: slog.New(slog.NewTextHandler(io.Discard, nil)),
		config: config{
			baseURL:     "http://test.local",
			corsOrigins: []string{"http://localhost:3000"},
		},
	}

	return app, app.routes()
}

// --- Assertion helpers ---

func assertStatus(t *testing.T, got, want int) {
	t.Helper()
	if got != want {
		t.Errorf("status: got %d, want %d", got, want)
	}
}

func assertContentType(t *testing.T, h http.Header, want string) {
	t.Helper()
	if got := h.Get("Content-Type"); got != want {
		t.Errorf("Content-Type: got %q, want %q", got, want)
	}
}

func assertProblem(t *testing.T, res *http.Response, wantStatus int, wantTitle string) ProblemDetail {
	t.Helper()
	assertStatus(t, res.StatusCode, wantStatus)
	assertContentType(t, res.Header, "application/problem+json")

	var p ProblemDetail
	if err := json.NewDecoder(res.Body).Decode(&p); err != nil {
		t.Fatalf("decode problem: %v", err)
	}
	if int(p.Status) != wantStatus {
		t.Errorf("problem status: got %d, want %d", p.Status, wantStatus)
	}
	if p.Title != wantTitle {
		t.Errorf("problem title: got %q, want %q", p.Title, wantTitle)
	}
	return p
}

func mustSend(t *testing.T, handler http.Handler, method, path string, body io.Reader) *http.Response {
	t.Helper()
	req := httptest.NewRequest(method, path, body)
	req.Header.Set("Authorization", testToken)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	return w.Result()
}

func mustSendNoAuth(t *testing.T, handler http.Handler, method, path string, body io.Reader) *http.Response {
	t.Helper()
	req := httptest.NewRequest(method, path, body)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	return w.Result()
}

// assertAuthCookie checks that the auth_token cookie is set with the expected value and httpOnly flag.
func assertAuthCookie(t *testing.T, res *http.Response, wantValue string) {
	t.Helper()
	for _, c := range res.Cookies() {
		if c.Name == "auth_token" {
			if c.Value != wantValue {
				t.Errorf("cookie value: got %q, want %q", c.Value, wantValue)
			}
			if !c.HttpOnly {
				t.Error("cookie should be httpOnly")
			}
			if !c.Secure {
				t.Error("cookie should be Secure")
			}
			if c.SameSite != http.SameSiteLaxMode {
				t.Errorf("cookie SameSite: got %v, want Lax", c.SameSite)
			}
			if c.Path != "/" {
				t.Errorf("cookie Path: got %q, want %q", c.Path, "/")
			}
			return
		}
	}
	t.Error("auth_token cookie not found in response")
}

// assertClearedCookie checks that the auth_token cookie is cleared (Max-Age=-1).
func assertClearedCookie(t *testing.T, res *http.Response) {
	t.Helper()
	for _, c := range res.Cookies() {
		if c.Name == "auth_token" {
			if c.MaxAge != -1 {
				t.Errorf("cleared cookie MaxAge: got %d, want -1", c.MaxAge)
			}
			return
		}
	}
	t.Error("auth_token cookie not found in response (should be cleared)")
}
