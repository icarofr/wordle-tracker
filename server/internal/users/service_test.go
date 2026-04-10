package users

import (
	"context"
	"errors"
	"testing"
)

type stubStore struct {
	allFn  func(context.Context) ([]User, error)
	byIDFn func(context.Context, int64) (*User, error)
}

func (s stubStore) All(ctx context.Context) ([]User, error) {
	return s.allFn(ctx)
}

func (s stubStore) ByID(ctx context.Context, id int64) (*User, error) {
	return s.byIDFn(ctx, id)
}

func TestGetOpponentSelf(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{
		byIDFn: func(context.Context, int64) (*User, error) {
			t.Fatal("ByID should not be called for self-comparison")
			return nil, nil
		},
	})

	_, err := svc.GetOpponent(context.Background(), 1, 1)
	if !errors.Is(err, ErrInvalidOpponent) {
		t.Fatalf("GetOpponent(1, 1) error = %v, want %v", err, ErrInvalidOpponent)
	}
}

func TestGetOpponentNotFound(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{
		byIDFn: func(context.Context, int64) (*User, error) {
			return nil, ErrUserNotFound
		},
	})

	_, err := svc.GetOpponent(context.Background(), 1, 99)
	if !errors.Is(err, ErrOpponentNotFound) {
		t.Fatalf("GetOpponent(1, 99) error = %v, want %v", err, ErrOpponentNotFound)
	}
}

func TestGetOpponentSuccess(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{
		byIDFn: func(_ context.Context, id int64) (*User, error) {
			return &User{ID: id, Name: "Opponent", Avatar: "02"}, nil
		},
	})

	opponent, err := svc.GetOpponent(context.Background(), 1, 2)
	if err != nil {
		t.Fatalf("GetOpponent: %v", err)
	}
	if opponent.ID != 2 {
		t.Errorf("opponent.ID = %d, want 2", opponent.ID)
	}
}
