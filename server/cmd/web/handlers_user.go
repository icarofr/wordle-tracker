package main

import (
	"context"
	"errors"

	"github.com/icarofr/wordle-tracker/api"
	"github.com/icarofr/wordle-tracker/internal/users"
	"github.com/icarofr/wordle-tracker/internal/validator"
)

var _validAvatars = map[string]struct{}{
	"01": {}, "02": {}, "03": {}, "04": {}, "05": {},
	"06": {}, "07": {}, "08": {}, "09": {}, "10": {},
	"11": {}, "12": {}, "13": {}, "14": {}, "15": {},
	"16": {}, "17": {}, "18": {}, "19": {}, "20": {},
	"21": {}, "22": {}, "23": {}, "24": {}, "25": {},
}

func (app *application) ListUsers(ctx context.Context, request api.ListUsersRequestObject) (api.ListUsersResponseObject, error) {
	all, err := app.users.List(ctx)
	if err != nil {
		return nil, err
	}
	return api.ListUsers200JSONResponse{Items: all}, nil
}

func (app *application) GetUser(ctx context.Context, request api.GetUserRequestObject) (api.GetUserResponseObject, error) {
	u, err := app.users.Get(ctx, request.UserID)
	if err != nil {
		if errors.Is(err, users.ErrUserNotFound) {
			return nil, notFound("User not found")
		}
		return nil, err
	}
	return api.GetUser200JSONResponse(*u), nil
}

func (app *application) GetCurrentUser(ctx context.Context, request api.GetCurrentUserRequestObject) (api.GetCurrentUserResponseObject, error) {
	return api.GetCurrentUser200JSONResponse(*contextGetUser(ctx)), nil
}

func (app *application) UpdateAvatar(ctx context.Context, request api.UpdateAvatarRequestObject) (api.UpdateAvatarResponseObject, error) {
	v := validator.New()
	if _, ok := _validAvatars[request.Body.Avatar]; !ok {
		v.AddError("avatar", "must be a valid avatar ID (01-25)")
	}
	if !v.Valid() {
		return nil, validationError(v)
	}
	user := contextGetUser(ctx)
	updated, err := app.auth.UpdateAvatar(ctx, user.ID, request.Body.Avatar)
	if err != nil {
		return nil, err
	}
	return api.UpdateAvatar200JSONResponse(*updated), nil
}

func (app *application) GetMyStats(ctx context.Context, request api.GetMyStatsRequestObject) (api.GetMyStatsResponseObject, error) {
	user := contextGetUser(ctx)
	stats, err := app.wordles.Stats(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	return api.GetMyStats200JSONResponse(*stats), nil
}

func (app *application) GetUserStats(ctx context.Context, request api.GetUserStatsRequestObject) (api.GetUserStatsResponseObject, error) {
	if _, err := app.users.Get(ctx, request.UserID); err != nil {
		if errors.Is(err, users.ErrUserNotFound) {
			return nil, notFound("User not found")
		}
		return nil, err
	}
	stats, err := app.wordles.Stats(ctx, request.UserID)
	if err != nil {
		return nil, err
	}
	return api.GetUserStats200JSONResponse(*stats), nil
}
