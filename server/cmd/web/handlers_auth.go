package main

import (
	"context"
	"errors"
	"net/http"

	"github.com/icarofr/wordle-tracker/api"
	"github.com/icarofr/wordle-tracker/internal/auth"
	"github.com/icarofr/wordle-tracker/internal/validator"
)

const (
	cookieName         = "auth_token"
	cookieMaxAgeShort  = 86400 * 7   // 7 days (matches short-lived token)
	cookieMaxAgeLong   = 86400 * 365 // 1 year (matches long-lived token)
)

// setAuthCookie sets an httpOnly cookie with the auth token.
// MaxAge is set to match the token's TTL: 7 days for short-lived, 1 year for long-lived.
func setAuthCookie(w http.ResponseWriter, token string, rememberMe bool) {
	maxAge := cookieMaxAgeShort
	if rememberMe {
		maxAge = cookieMaxAgeLong
	}
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    token,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}

// clearAuthCookie clears the auth cookie.
func clearAuthCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}

func (app *application) Login(ctx context.Context, request api.LoginRequestObject) (api.LoginResponseObject, error) {
	rememberMe := derefBool(request.Body.RememberMe)
	user, token, err := app.auth.Login(ctx, auth.LoginInput{
		Email:      request.Body.Email,
		Password:   request.Body.Password,
		RememberMe: rememberMe,
	})
	if err != nil {
		if errors.Is(err, auth.ErrInvalidCredentials) {
			return nil, &httpError{problem: ProblemDetail{
				Type:   problemInvalidCredentials,
				Title:  "Unauthorized",
				Status: 401,
				Detail: "Email or password is incorrect",
			}}
		}
		return nil, err
	}
	return cookieLoginResponse{user: *user, token: token, rememberMe: rememberMe}, nil
}

func (app *application) Register(ctx context.Context, request api.RegisterRequestObject) (api.RegisterResponseObject, error) {
	v := validator.New()
	v.CheckRequired(request.Body.Name, "name", "is required")
	v.CheckRequired(request.Body.Email, "email", "is required")
	v.CheckEmail(request.Body.Email, "email", "must be a valid email address")
	v.CheckRequired(request.Body.Password, "password", "is required")
	v.CheckMinLength(request.Body.Password, 8, "password", "must be at least 8 characters")

	if !v.Valid() {
		return nil, validationError(v)
	}

	user, token, err := app.auth.Register(ctx, auth.RegisterInput{
		Name:     request.Body.Name,
		Email:    request.Body.Email,
		Password: request.Body.Password,
	})
	if err != nil {
		if errors.Is(err, auth.ErrEmailTaken) {
			return nil, conflict(problemEmailTaken, "Email already in use")
		}
		return nil, err
	}
	return cookieRegisterResponse{user: *user, token: token}, nil
}

func (app *application) Logout(ctx context.Context, request api.LogoutRequestObject) (api.LogoutResponseObject, error) {
	authorization := contextGetAuthorization(ctx)
	if err := app.auth.Logout(ctx, authorization); err != nil {
		return nil, err
	}
	return cookieLogoutResponse{}, nil
}

func derefBool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}

// cookieLoginResponse wraps the oapi-codegen response to set the auth cookie.
type cookieLoginResponse struct {
	user       auth.SessionUser
	token      string
	rememberMe bool
}

func (r cookieLoginResponse) VisitLoginResponse(w http.ResponseWriter) error {
	setAuthCookie(w, r.token, r.rememberMe)
	return api.Login200JSONResponse{User: r.user, Token: r.token}.VisitLoginResponse(w)
}

// cookieRegisterResponse wraps the oapi-codegen response to set the auth cookie.
// Registration always creates a short-lived token (no "remember me" option).
type cookieRegisterResponse struct {
	user  auth.SessionUser
	token string
}

func (r cookieRegisterResponse) VisitRegisterResponse(w http.ResponseWriter) error {
	setAuthCookie(w, r.token, false)
	return api.Register201JSONResponse{User: r.user, Token: r.token}.VisitRegisterResponse(w)
}

// cookieLogoutResponse wraps the oapi-codegen response to clear the auth cookie.
type cookieLogoutResponse struct{}

func (r cookieLogoutResponse) VisitLogoutResponse(w http.ResponseWriter) error {
	clearAuthCookie(w)
	return api.Logout204Response{}.VisitLogoutResponse(w)
}
