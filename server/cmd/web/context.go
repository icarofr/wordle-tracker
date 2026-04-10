package main

import (
	"context"

	"github.com/icarofr/wordle-tracker/internal/auth"
)

type contextKey string

const (
	userContextKey          contextKey = "user"
	authorizationContextKey contextKey = "authorization"
	requestIDContextKey     contextKey = "request_id"
)

// contextGetUser extracts the authenticated user from a context.
func contextGetUser(ctx context.Context) *auth.SessionUser {
	user, _ := ctx.Value(userContextKey).(*auth.SessionUser)
	return user
}

// contextGetAuthorization extracts the raw Authorization header value from a context.
func contextGetAuthorization(ctx context.Context) string {
	s, _ := ctx.Value(authorizationContextKey).(string)
	return s
}

// contextGetRequestID extracts the request ID from a context.
func contextGetRequestID(ctx context.Context) string {
	id, _ := ctx.Value(requestIDContextKey).(string)
	return id
}
