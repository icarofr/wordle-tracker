package main

import (
	"context"

	"github.com/icarofr/wordle-tracker/internal/auth"
	"github.com/icarofr/wordle-tracker/internal/users"
	"github.com/icarofr/wordle-tracker/internal/wordles"
)

type authService interface {
	Login(ctx context.Context, input auth.LoginInput) (*auth.SessionUser, string, error)
	Register(ctx context.Context, input auth.RegisterInput) (*auth.SessionUser, string, error)
	Logout(ctx context.Context, authorization string) error
	UpdateAvatar(ctx context.Context, userID int64, avatar string) (*auth.SessionUser, error)
	UserByAuthorization(ctx context.Context, authorization string) (*auth.SessionUser, error)
}

type usersService interface {
	List(ctx context.Context) ([]users.User, error)
	Get(ctx context.Context, id int64) (*users.User, error)
	GetOpponent(ctx context.Context, userID, opponentID int64) (*users.User, error)
}

type wordlesService interface {
	Stats(ctx context.Context, userID int64) (*wordles.Stats, error)
	HeadToHead(ctx context.Context, userID, opponentID int64) (*wordles.HeadToHeadResult, error)
	ArchiveList(ctx context.Context, viewerID int64, beforeID int32, limit int32) ([]wordles.ArchiveListItem, bool, error)
	ArchiveDetail(ctx context.Context, viewerID int64, wordleID int32, players []wordles.Player) (*wordles.ArchiveDetail, error)
	Submit(ctx context.Context, userID int64, rawInput string) (*wordles.Entry, error)
	Leaderboard(ctx context.Context, players []wordles.Player) (*wordles.LeaderboardData, error)
}


type pinger interface {
	PingContext(ctx context.Context) error
}
