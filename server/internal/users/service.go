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

type Repository interface {
	List(ctx context.Context) ([]User, error)
	ByID(ctx context.Context, id int64) (*User, error)
}

type Service struct {
	repository Repository
}

func New(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) List(ctx context.Context) ([]User, error) {
	return s.repository.List(ctx)
}

func (s *Service) Get(ctx context.Context, id int64) (*User, error) {
	return s.repository.ByID(ctx, id)
}

func (s *Service) GetOpponent(ctx context.Context, userID, opponentID int64) (*User, error) {
	if opponentID == userID {
		return nil, ErrInvalidOpponent
	}

	opponent, err := s.repository.ByID(ctx, opponentID)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return nil, ErrOpponentNotFound
		}
		return nil, fmt.Errorf("get user %d: %w", opponentID, err)
	}

	return opponent, nil
}
