package users

import (
	"context"
	"errors"
	"fmt"
)

var (
	ErrInvalidOpponent  = errors.New("opponent_id must refer to another user")
	ErrOpponentNotFound = errors.New("opponent not found")
	ErrUserNotFound     = errors.New("user not found")
)

type User struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

type Store interface {
	All(ctx context.Context) ([]User, error)
	ByID(ctx context.Context, id int64) (*User, error)
}

type Service struct {
	store Store
}

func New(store Store) *Service {
	return &Service{store: store}
}

func (s *Service) List(ctx context.Context) ([]User, error) {
	return s.store.All(ctx)
}

func (s *Service) Get(ctx context.Context, id int64) (*User, error) {
	return s.store.ByID(ctx, id)
}

func (s *Service) GetOpponent(ctx context.Context, userID, opponentID int64) (*User, error) {
	if opponentID == userID {
		return nil, ErrInvalidOpponent
	}

	opponent, err := s.store.ByID(ctx, opponentID)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return nil, ErrOpponentNotFound
		}
		return nil, fmt.Errorf("get user %d: %w", opponentID, err)
	}

	return opponent, nil
}
