package postgres

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"errors"
	"time"

	"github.com/icarofr/wordle-tracker/internal/auth"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgconn"
)

func (db *DB) GetCredentialsByEmail(ctx context.Context, email string) (*auth.Credentials, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var row struct {
		ID           int64  `db:"id"`
		Name         string `db:"name"`
		Email        string `db:"email"`
		PasswordHash string `db:"password_hash"`
		Avatar       string `db:"avatar"`
	}
	err := db.GetContext(ctx, &row,
		`SELECT id, name, email, password_hash, avatar FROM users WHERE email = $1`, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, auth.ErrSessionNotFound
		}
		return nil, err
	}
	return &auth.Credentials{
		ID:           row.ID,
		Name:         row.Name,
		Email:        row.Email,
		PasswordHash: row.PasswordHash,
		Avatar:       row.Avatar,
	}, nil
}

func (db *DB) GetSessionByToken(ctx context.Context, encodedToken string) (*auth.SessionUser, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	rawToken, err := base64.RawURLEncoding.DecodeString(encodedToken)
	if err != nil {
		return nil, auth.ErrSessionNotFound
	}

	hash := sha256.Sum256(rawToken)
	hashedToken := hash[:]

	var row struct {
		ID     int64  `db:"id"`
		Name   string `db:"name"`
		Email  string `db:"email"`
		Avatar string `db:"avatar"`
	}
	err = db.GetContext(ctx, &row,
		`SELECT u.id, u.name, u.email, u.avatar FROM users u
		 JOIN user_tokens t ON t.user_id = u.id
		 WHERE t.token = $1
		   AND t.sent_to = u.email
		   AND (
		     (t.context = 'api-token-short' AND t.created_at > $2)
		     OR (t.context = 'api-token-long' AND t.created_at > $3)
		   )`,
		hashedToken,
		time.Now().AddDate(0, 0, -7),
		time.Now().AddDate(0, 0, -365))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, auth.ErrSessionNotFound
		}
		return nil, err
	}
	return &auth.SessionUser{
		ID:     row.ID,
		Name:   row.Name,
		Email:  row.Email,
		Avatar: row.Avatar,
	}, nil
}

func (db *DB) CreateUser(ctx context.Context, name, email, passwordHash string) (*auth.SessionUser, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	now := time.Now()
	var row struct {
		ID     int64  `db:"id"`
		Name   string `db:"name"`
		Email  string `db:"email"`
		Avatar string `db:"avatar"`
	}
	err := db.GetContext(ctx, &row,
		`INSERT INTO users (name, email, password_hash, avatar, created_at, updated_at)
		 VALUES ($1, $2, $3, '01', $4, $5) RETURNING id, name, email, avatar`,
		name, email, passwordHash, now, now)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			return nil, auth.ErrEmailTaken
		}
		return nil, err
	}
	return &auth.SessionUser{
		ID:     row.ID,
		Name:   row.Name,
		Email:  row.Email,
		Avatar: row.Avatar,
	}, nil
}

func (db *DB) CreateToken(ctx context.Context, userID int64, email, tokenContext string) (string, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	rawToken := make([]byte, 32)
	if _, err := rand.Read(rawToken); err != nil {
		return "", err
	}

	hash := sha256.Sum256(rawToken)
	hashedToken := hash[:]

	_, err := db.ExecContext(ctx,
		`INSERT INTO user_tokens (user_id, token, context, sent_to, created_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		userID, hashedToken, tokenContext, email, time.Now())
	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(rawToken), nil
}

func (db *DB) DeleteToken(ctx context.Context, encodedToken string) error {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	rawToken, err := base64.RawURLEncoding.DecodeString(encodedToken)
	if err != nil {
		return nil
	}

	hash := sha256.Sum256(rawToken)
	hashedToken := hash[:]

	_, err = db.ExecContext(ctx,
		`DELETE FROM user_tokens WHERE token = $1 AND context IN ('api-token-long', 'api-token-short', 'api-token')`,
		hashedToken)
	return err
}

func (db *DB) UpdateAvatar(ctx context.Context, userID int64, avatar string) (*auth.SessionUser, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	var row struct {
		ID     int64  `db:"id"`
		Name   string `db:"name"`
		Email  string `db:"email"`
		Avatar string `db:"avatar"`
	}
	err := db.GetContext(ctx, &row,
		`UPDATE users SET avatar = $1, updated_at = $2 WHERE id = $3
		 RETURNING id, name, email, avatar`,
		avatar, time.Now(), userID)
	if err != nil {
		return nil, err
	}
	return &auth.SessionUser{
		ID:     row.ID,
		Name:   row.Name,
		Email:  row.Email,
		Avatar: row.Avatar,
	}, nil
}
