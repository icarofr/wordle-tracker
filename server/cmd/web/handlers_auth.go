package main

import (
	"context"
	"errors"

	"github.com/icarofr/wordle-tracker/api"
	"github.com/icarofr/wordle-tracker/internal/auth"
	"github.com/icarofr/wordle-tracker/internal/validator"
)

func (app *application) Login(ctx context.Context, request api.LoginRequestObject) (api.LoginResponseObject, error) {
	user, token, err := app.auth.Login(ctx, auth.LoginInput{
		Email:      request.Body.Email,
		Password:   request.Body.Password,
		RememberMe: derefBool(request.Body.RememberMe),
	})
	if err != nil {
		if errors.Is(err, auth.ErrInvalidCredentials) {
			return nil, &httpError{problem: ProblemDetail{
				Type:   "/problems/invalid-credentials",
				Title:  "Unauthorized",
				Status: 401,
				Detail: "Email or password is incorrect",
			}}
		}
		return nil, err
	}
	return api.Login200JSONResponse{User: *user, Token: token}, nil
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
			return nil, conflict("email-taken", "Email already in use")
		}
		return nil, err
	}
	return api.Register201JSONResponse{User: *user, Token: token}, nil
}

func (app *application) Logout(ctx context.Context, request api.LogoutRequestObject) (api.LogoutResponseObject, error) {
	authorization := contextGetAuthorization(ctx)
	if err := app.auth.Logout(ctx, authorization); err != nil {
		return nil, err
	}
	return api.Logout204Response{}, nil
}

func derefBool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}
