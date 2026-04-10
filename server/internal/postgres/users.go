package postgres

import (
	"context"
	"database/sql"
	"errors"

	"github.com/icarofr/wordle-tracker/internal/users"
)

func (db *DB) All(ctx context.Context) ([]users.User, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var rows []struct {
		ID     int64  `db:"id"`
		Name   string `db:"name"`
		Avatar string `db:"avatar"`
	}
	err := db.SelectContext(ctx, &rows, `SELECT id, name, avatar FROM users ORDER BY id`)
	if err != nil {
		return nil, err
	}

	result := make([]users.User, len(rows))
	for i, row := range rows {
		result[i] = users.User{ID: row.ID, Name: row.Name, Avatar: row.Avatar}
	}
	return result, nil
}

func (db *DB) ByID(ctx context.Context, id int64) (*users.User, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var row struct {
		ID     int64  `db:"id"`
		Name   string `db:"name"`
		Avatar string `db:"avatar"`
	}
	err := db.GetContext(ctx, &row, `SELECT id, name, avatar FROM users WHERE id = $1`, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, users.ErrUserNotFound
		}
		return nil, err
	}
	return &users.User{ID: row.ID, Name: row.Name, Avatar: row.Avatar}, nil
}
