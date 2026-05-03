package postgres

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"time"

	"github.com/icarofr/wordle-tracker/internal/auth"
	"github.com/icarofr/wordle-tracker/internal/postgres/dbgen"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type AuthRepository struct {
	store *Store
}

var _ auth.Repository = (*AuthRepository)(nil)

func NewAuthRepository(store *Store) *AuthRepository {
	return &AuthRepository{store: store}
}

func (repository *AuthRepository) GetCredentialsByEmail(ctx context.Context, email string) (*auth.Credentials, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	row, err := repository.store.queries.GetCredentialsByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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

func (repository *AuthRepository) GetSessionByToken(ctx context.Context, encodedToken string) (*auth.SessionUser, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	rawToken, err := base64.RawURLEncoding.DecodeString(encodedToken)
	if err != nil {
		return nil, auth.ErrSessionNotFound
	}

	hash := sha256.Sum256(rawToken)
	row, err := repository.store.queries.GetSessionByToken(ctx, dbgen.GetSessionByTokenParams{
		Token:       hash[:],
		ShortCutoff: timestampValue(time.Now().AddDate(0, 0, -7)),
		LongCutoff:  timestampValue(time.Now().AddDate(0, 0, -365)),
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
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

func (repository *AuthRepository) CreateUser(ctx context.Context, name, email, passwordHash string) (*auth.SessionUser, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	now := time.Now()
	row, err := repository.store.queries.CreateUser(ctx, dbgen.CreateUserParams{
		Name:         name,
		Email:        email,
		PasswordHash: passwordHash,
		CreatedAt:    timestampValue(now),
		UpdatedAt:    timestampValue(now),
	})
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

func (repository *AuthRepository) CreateToken(ctx context.Context, userID int64, email, tokenContext string) (string, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	rawToken := make([]byte, 32)
	if _, err := rand.Read(rawToken); err != nil {
		return "", err
	}

	hash := sha256.Sum256(rawToken)
	err := repository.store.queries.CreateToken(ctx, dbgen.CreateTokenParams{
		UserID:       userID,
		Token:        hash[:],
		TokenContext: tokenContext,
		SentTo:       textValue(email),
		CreatedAt:    timestampValue(time.Now()),
	})
	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(rawToken), nil
}

func (repository *AuthRepository) DeleteToken(ctx context.Context, encodedToken string) error {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	rawToken, err := base64.RawURLEncoding.DecodeString(encodedToken)
	if err != nil {
		return nil
	}

	hash := sha256.Sum256(rawToken)
	return repository.store.queries.DeleteToken(ctx, hash[:])
}

func (repository *AuthRepository) UpdateAvatar(ctx context.Context, userID int64, avatar string) (*auth.SessionUser, error) {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	row, err := repository.store.queries.UpdateAvatar(ctx, dbgen.UpdateAvatarParams{
		Avatar:    avatar,
		UpdatedAt: timestampValue(time.Now()),
		UserID:    userID,
	})
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
