package main

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"testing"

	"github.com/icarofr/wordle-tracker/internal/auth"
)

func TestHandleLogin_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.auth.(*authServiceMock).LoginFunc = func(_ context.Context, input auth.LoginInput) (*auth.SessionUser, string, error) {
		if input.Email != "alice@test.com" || input.Password != "password123" {
			t.Errorf("unexpected input: %+v", input)
		}
		return testUser, "tok_abc", nil
	}

	body := strings.NewReader(`{"email":"alice@test.com","password":"password123"}`)
	res := mustSendNoAuth(t, handler, "POST", "/sessions", body)

	assertStatus(t, res.StatusCode, 200)
	assertContentType(t, res.Header, "application/json")

	// Verify httpOnly cookie is set
	assertAuthCookie(t, res, "tok_abc")

	var got sessionResponse
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.User.ID != testUser.ID {
		t.Errorf("user id: got %d, want %d", got.User.ID, testUser.ID)
	}
}

func TestHandleLogin_InvalidCredentials(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.auth.(*authServiceMock).LoginFunc = func(context.Context, auth.LoginInput) (*auth.SessionUser, string, error) {
		return nil, "", auth.ErrInvalidCredentials
	}

	body := strings.NewReader(`{"email":"wrong@test.com","password":"bad"}`)
	res := mustSendNoAuth(t, handler, "POST", "/sessions", body)

	p := assertProblem(t, res, 401, "Unauthorized")
	if p.Type != "/problems/invalid-credentials" {
		t.Errorf("type: got %q, want %q", p.Type, "/problems/invalid-credentials")
	}
}

func TestHandleLogin_MalformedJSON(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	body := strings.NewReader(`{bad json`)
	res := mustSendNoAuth(t, handler, "POST", "/sessions", body)

	assertProblem(t, res, 400, "Bad Request")
}

func TestHandleRegister_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.auth.(*authServiceMock).RegisterFunc = func(_ context.Context, input auth.RegisterInput) (*auth.SessionUser, string, error) {
		return &auth.SessionUser{ID: 2, Name: input.Name, Email: input.Email, Avatar: "01"}, "tok_new", nil
	}

	body := strings.NewReader(`{"name":"Bob","email":"bob@test.com","password":"password123"}`)
	res := mustSendNoAuth(t, handler, "POST", "/users", body)

	assertStatus(t, res.StatusCode, 201)
	assertContentType(t, res.Header, "application/json")

	// Verify httpOnly cookie is set
	assertAuthCookie(t, res, "tok_new")

	var got sessionResponse
	if err := json.NewDecoder(res.Body).Decode(&got); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if got.User.Name != "Bob" {
		t.Errorf("name: got %q, want %q", got.User.Name, "Bob")
	}
}

func TestHandleRegister_ValidationErrors(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	body := strings.NewReader(`{"name":"","email":"","password":"short"}`)
	res := mustSendNoAuth(t, handler, "POST", "/users", body)

	p := assertProblem(t, res, 400, "Bad Request")
	if len(p.Errors) == 0 {
		t.Error("expected field errors, got none")
	}
}

func TestHandleRegister_EmailTaken(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.auth.(*authServiceMock).RegisterFunc = func(context.Context, auth.RegisterInput) (*auth.SessionUser, string, error) {
		return nil, "", auth.ErrEmailTaken
	}

	body := strings.NewReader(`{"name":"Bob","email":"taken@test.com","password":"password123"}`)
	res := mustSendNoAuth(t, handler, "POST", "/users", body)

	p := assertProblem(t, res, 409, "Conflict")
	if p.Type != "/problems/email-taken" {
		t.Errorf("type: got %q, want %q", p.Type, "/problems/email-taken")
	}
}

func TestHandleRegister_MalformedJSON(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	body := strings.NewReader(`not json`)
	res := mustSendNoAuth(t, handler, "POST", "/users", body)

	assertProblem(t, res, 400, "Bad Request")
}

func TestHandleLogout_OK(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	var calledWith string
	app.auth.(*authServiceMock).LogoutFunc = func(_ context.Context, authorization string) error {
		calledWith = authorization
		return nil
	}

	res := mustSend(t, handler, "DELETE", "/sessions/current", nil)

	assertStatus(t, res.StatusCode, 204)

	// Verify cookie is cleared
	assertClearedCookie(t, res)

	if calledWith != testToken {
		t.Errorf("logout called with %q, want %q", calledWith, testToken)
	}
}

func TestHandleLogin_ServiceError(t *testing.T) {
	t.Parallel()
	app, handler := newTestApp(t)
	app.auth.(*authServiceMock).LoginFunc = func(context.Context, auth.LoginInput) (*auth.SessionUser, string, error) {
		return nil, "", errors.New("db timeout")
	}

	body := strings.NewReader(`{"email":"alice@test.com","password":"pass1234"}`)
	res := mustSendNoAuth(t, handler, "POST", "/sessions", body)

	assertProblem(t, res, 500, "Internal Server Error")
}

func TestHandleLogout_Unauthenticated(t *testing.T) {
	t.Parallel()
	_, handler := newTestApp(t)

	res := mustSendNoAuth(t, handler, "DELETE", "/sessions/current", nil)

	assertProblem(t, res, 401, "Unauthorized")
}
