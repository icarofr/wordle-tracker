package postgres

import (
	"context"
	"errors"

	"github.com/icarofr/wordle-tracker/internal/users"
	"github.com/jackc/pgx/v5"
)

type UsersRepository struct {
	store *Store
}

var _ users.Repository = (*UsersRepository)(nil)

func NewUsersRepository(store *Store) *UsersRepository {
	return &UsersRepository{store: store}
}

func (repository *UsersRepository) List(ctx context.Context) ([]users.User, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	rows, err := repository.store.queries.ListUsers(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]users.User, len(rows))
	for i, row := range rows {
		result[i] = users.User{ID: row.ID, Name: row.Name, Avatar: row.Avatar}
	}
	return result, nil
}

func (repository *UsersRepository) ByID(ctx context.Context, id int64) (*users.User, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	row, err := repository.store.queries.GetUserByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, users.ErrUserNotFound
		}
		return nil, err
	}

	return &users.User{ID: row.ID, Name: row.Name, Avatar: row.Avatar}, nil
}
