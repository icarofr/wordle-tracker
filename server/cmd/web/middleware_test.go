package main

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/icarofr/wordle-tracker/internal/auth"
)

func TestFetchUser_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.auth.(*authServiceMock).UserByAuthorizationFunc = func(context.Context, string) (*auth.SessionUser, error) {
		return nil, errors.New("db timeout")
	}

	req := httptest.NewRequest("GET", "/users/self", nil)
	req.Header.Set("Authorization", "Bearer test-token")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	// fetchUser logs the error but continues; authMiddleware then rejects
	assertProblem(t, w.Result(), 401, "Unauthorized")
}

func TestRequireAuth_NoToken(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSendNoAuth(t, handler, "GET", "/users", nil)

	assertProblem(t, res, 401, "Unauthorized")
}

func TestRequireAuth_InvalidToken(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.auth.(*authServiceMock).UserByAuthorizationFunc = func(context.Context, string) (*auth.SessionUser, error) {
		return nil, nil
	}

	req := httptest.NewRequest("GET", "/users", nil)
	req.Header.Set("Authorization", "Bearer bad-token")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	assertProblem(t, w.Result(), 401, "Unauthorized")
}

func TestRequireAuth_ValidToken(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSend(t, handler, "GET", "/users/self", nil)

	assertStatus(t, res.StatusCode, 200)
}

func TestCORS_Preflight(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	req := httptest.NewRequest("OPTIONS", "/users", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	res := w.Result()
	assertStatus(t, res.StatusCode, 204)

	if got := res.Header.Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Errorf("Allow-Origin: got %q, want %q", got, "http://localhost:3000")
	}
	if got := res.Header.Get("Access-Control-Allow-Methods"); got == "" {
		t.Error("Allow-Methods header missing")
	}
	if got := res.Header.Get("Access-Control-Max-Age"); got != "86400" {
		t.Errorf("Max-Age: got %q, want %q", got, "86400")
	}
}

func TestCORS_UntrustedOrigin(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	req := httptest.NewRequest("GET", "/health", nil)
	req.Header.Set("Origin", "http://evil.com")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	res := w.Result()
	if got := res.Header.Get("Access-Control-Allow-Origin"); got != "" {
		t.Errorf("Allow-Origin should be empty for untrusted origin, got %q", got)
	}
}

func TestSecurityHeaders(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSendNoAuth(t, handler, "GET", "/health", nil)

	if got := res.Header.Get("X-Content-Type-Options"); got != "nosniff" {
		t.Errorf("X-Content-Type-Options: got %q, want %q", got, "nosniff")
	}
	if got := res.Header.Get("X-Frame-Options"); got != "deny" {
		t.Errorf("X-Frame-Options: got %q, want %q", got, "deny")
	}
	if got := res.Header.Get("Referrer-Policy"); got != "origin-when-cross-origin" {
		t.Errorf("Referrer-Policy: got %q, want %q", got, "origin-when-cross-origin")
	}
}

func TestPanicRecovery(t *testing.T) {
	t.Parallel()
	app, _ := newTestApp(t)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /panic", func(w http.ResponseWriter, r *http.Request) {
		panic("test panic")
	})
	handler := app.recoverPanic(app.securityHeaders(mux))

	req := httptest.NewRequest("GET", "/panic", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	res := w.Result()
	assertProblem(t, res, 500, "Internal Server Error")
}

func TestRequestID_Generated(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)
	res := mustSendNoAuth(t, handler, http.MethodGet, "/health", nil)
	id := res.Header.Get("X-Request-ID")
	if id == "" {
		t.Fatal("expected X-Request-ID header")
	}
	if len(id) != 36 {
		t.Fatalf("expected UUID format (36 chars), got %q (len %d)", id, len(id))
	}
}

func TestRequestID_Forwarded(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req.Header.Set("X-Request-ID", "upstream-request-id-123")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	if got := w.Header().Get("X-Request-ID"); got != "upstream-request-id-123" {
		t.Fatalf("expected forwarded ID, got %q", got)
	}
}

func TestPublicEndpointsNoAuth(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	endpoints := []struct {
		method string
		path   string
	}{
		{"GET", "/health"},
		{"POST", "/sessions"},
		{"POST", "/users"},
	}

	for _, ep := range endpoints {
		t.Run(ep.method+" "+ep.path, func(t *testing.T) {
			req := httptest.NewRequest(ep.method, ep.path, nil)
			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)

			if w.Result().StatusCode == 401 {
				t.Errorf("%s %s should not require auth, got 401", ep.method, ep.path)
			}
		})
	}
}

func TestProtectedEndpointsRequireAuth(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	// GET/DELETE endpoints reject unauthenticated requests with 401.
	// POST/PATCH endpoints with required JSON bodies return 400 (body
	// parse error) before the auth middleware runs — this is expected
	// oapi-codegen strict handler behaviour.
	endpoints := []struct {
		method string
		path   string
		want   int
	}{
		{"GET", "/users", 401},
		{"GET", "/users/self", 401},
		{"PATCH", "/users/self", 400},
		{"GET", "/users/self/stats", 401},
		{"GET", "/users/self/head-to-heads/2", 401},
		{"GET", "/users/99", 401},
		{"GET", "/users/99/stats", 401},
		{"DELETE", "/sessions/current", 401},
		{"POST", "/wordle-submissions", 400},
		{"GET", "/wordles", 401},
		{"GET", "/wordles/1", 401},
		{"GET", "/leaderboards/current", 401},
	}

	for _, ep := range endpoints {
		t.Run(ep.method+" "+ep.path, func(t *testing.T) {
			res := mustSendNoAuth(t, handler, ep.method, ep.path, nil)

			if res.StatusCode != ep.want {
				t.Errorf("%s %s: got status %d, want %d", ep.method, ep.path, res.StatusCode, ep.want)
			}
		})
	}
}
