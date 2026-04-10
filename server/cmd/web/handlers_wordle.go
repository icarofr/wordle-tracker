package main

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"

	"github.com/icarofr/wordle-tracker/api"
	"github.com/icarofr/wordle-tracker/internal/users"
	"github.com/icarofr/wordle-tracker/internal/wordles"
)

const defaultArchiveLimit = 50

func (app *application) SubmitWordle(ctx context.Context, request api.SubmitWordleRequestObject) (api.SubmitWordleResponseObject, error) {
	user := contextGetUser(ctx)
	entry, err := app.wordles.Submit(ctx, user.ID, request.Body.RawInput)
	if err != nil {
		switch {
		case errors.Is(err, wordles.ErrInvalidFormat):
			return nil, badRequest("invalid-format", "Unrecognizable wordle share text")
		case errors.Is(err, wordles.ErrDuplicateEntry):
			return nil, conflict("duplicate-entry", "You have already submitted this wordle")
		default:
			return nil, err
		}
	}
	return api.SubmitWordle201JSONResponse(*entry), nil
}

func (app *application) GetArchive(ctx context.Context, request api.GetArchiveRequestObject) (api.GetArchiveResponseObject, error) {
	user := contextGetUser(ctx)

	limit := defaultArchiveLimit
	if request.Params.Limit != nil {
		if *request.Params.Limit < 1 {
			return nil, badRequest("invalid-limit", "invalid limit")
		}
		limit = min(*request.Params.Limit, 100)
	}

	beforeID := 0
	if request.Params.Cursor != nil {
		decoded, err := decodeCursor(*request.Params.Cursor)
		if err != nil {
			return nil, badRequest("invalid-cursor", "invalid cursor")
		}
		beforeID = decoded
	}

	items, hasMore, err := app.wordles.ArchiveList(ctx, user.ID, beforeID, limit)
	if err != nil {
		return nil, err
	}

	selfLink := fmt.Sprintf("/wordles?limit=%d", limit)
	if request.Params.Cursor != nil {
		selfLink += "&cursor=" + encodeCursor(beforeID)
	}
	page := wordles.ArchiveListPage{Self: app.absoluteLink(selfLink), Items: items}
	if hasMore && len(items) > 0 {
		lastID := items[len(items)-1].WordleID
		page.Next = app.absoluteLink(fmt.Sprintf("/wordles?limit=%d&cursor=%s", limit, encodeCursor(lastID)))
	}
	return api.GetArchive200JSONResponse(page), nil
}

func (app *application) GetArchiveWordle(ctx context.Context, request api.GetArchiveWordleRequestObject) (api.GetArchiveWordleResponseObject, error) {
	user := contextGetUser(ctx)
	allUsers, err := app.users.List(ctx)
	if err != nil {
		return nil, err
	}
	detail, err := app.wordles.ArchiveDetail(ctx, user.ID, request.WordleID, toPlayers(allUsers))
	if err != nil {
		return nil, err
	}
	return api.GetArchiveWordle200JSONResponse(*detail), nil
}

func (app *application) GetHeadToHead(ctx context.Context, request api.GetHeadToHeadRequestObject) (api.GetHeadToHeadResponseObject, error) {
	user := contextGetUser(ctx)
	opponent, err := app.users.GetOpponent(ctx, user.ID, request.UserID)
	if err != nil {
		switch {
		case errors.Is(err, users.ErrInvalidOpponent):
			return nil, badRequest("invalid-opponent", "Cannot compare with yourself")
		case errors.Is(err, users.ErrOpponentNotFound):
			return nil, notFound("Opponent not found")
		default:
			return nil, err
		}
	}
	h2h, err := app.wordles.HeadToHead(ctx, user.ID, request.UserID)
	if err != nil {
		return nil, err
	}

	resp := api.GetHeadToHead200JSONResponse{
		Opponent:      users.User{ID: opponent.ID, Name: opponent.Name, Avatar: opponent.Avatar},
		Record:        h2h.Record,
		RecentMatches: h2h.RecentMatches,
	}
	resp.Stats.Self = *h2h.OverallStats.Self
	resp.Stats.Opponent = *h2h.OverallStats.Opponent
	return resp, nil
}

func (app *application) GetLeaderboard(ctx context.Context, request api.GetLeaderboardRequestObject) (api.GetLeaderboardResponseObject, error) {
	allUsers, err := app.users.List(ctx)
	if err != nil {
		return nil, err
	}
	data, err := app.wordles.Leaderboard(ctx, toPlayers(allUsers))
	if err != nil {
		return nil, err
	}
	return api.GetLeaderboard200JSONResponse(*data), nil
}

func (app *application) absoluteLink(path string) string {
	return app.config.baseURL + path
}

func encodeCursor(wordleID int) string {
	return base64.RawURLEncoding.EncodeToString([]byte(strconv.Itoa(wordleID)))
}

func decodeCursor(cursor string) (int, error) {
	b, err := base64.RawURLEncoding.DecodeString(cursor)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(string(b))
}

func toPlayers(allUsers []users.User) []wordles.Player {
	players := make([]wordles.Player, len(allUsers))
	for i, u := range allUsers {
		players[i] = wordles.Player{ID: u.ID, Name: u.Name, Avatar: u.Avatar}
	}
	return players
}
