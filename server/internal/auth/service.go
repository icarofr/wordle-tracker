package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailTaken         = errors.New("email already in use")
	ErrSessionNotFound    = errors.New("session not found")
)

const (
	TokenContextShort = "api-token-short"
	TokenContextLong  = "api-token-long"
)

type Credentials struct {
	ID           int64
	Name         string
	Email        string
	PasswordHash string
	Avatar       string
}

type SessionUser struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Avatar string `json:"avatar"`
}

type LoginInput struct {
	Email      string
	Password   string
	RememberMe bool
}

type RegisterInput struct {
	Name     string
	Email    string
	Password string
}

type Repository interface {
	GetCredentialsByEmail(ctx context.Context, email string) (*Credentials, error)
	GetSessionByToken(ctx context.Context, token string) (*SessionUser, error)
	CreateUser(ctx context.Context, name, email, hash string) (*SessionUser, error)
	CreateToken(ctx context.Context, userID int64, email, tokenContext string) (string, error)
	DeleteToken(ctx context.Context, token string) error
	UpdateAvatar(ctx context.Context, userID int64, avatar string) (*SessionUser, error)
}

type Service struct {
	repository Repository
}

func New(repository Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) Login(ctx context.Context, input LoginInput) (*SessionUser, string, error) {
	creds, err := s.repository.GetCredentialsByEmail(ctx, input.Email)
	if err != nil {
		if errors.Is(err, ErrSessionNotFound) {
			return nil, "", ErrInvalidCredentials
		}
		return nil, "", fmt.Errorf("get credentials: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(creds.PasswordHash), []byte(input.Password)); err != nil {
		return nil, "", ErrInvalidCredentials
	}

	tokenContext := TokenContextShort
	if input.RememberMe {
		tokenContext = TokenContextLong
	}

	token, err := s.repository.CreateToken(ctx, creds.ID, creds.Email, tokenContext)
	if err != nil {
		return nil, "", fmt.Errorf("create token: %w", err)
	}

	return &SessionUser{
		ID:     creds.ID,
		Name:   creds.Name,
		Email:  creds.Email,
		Avatar: creds.Avatar,
	}, token, nil
}

func (s *Service) Register(ctx context.Context, input RegisterInput) (*SessionUser, string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", fmt.Errorf("hash password: %w", err)
	}

	user, err := s.repository.CreateUser(ctx, input.Name, input.Email, string(hash))
	if err != nil {
		return nil, "", err
	}

	token, err := s.repository.CreateToken(ctx, user.ID, user.Email, TokenContextShort)
	if err != nil {
		return nil, "", fmt.Errorf("create token: %w", err)
	}

	return user, token, nil
}

func (s *Service) Logout(ctx context.Context, authorization string) error {
	token, ok := bearerTokenFromHeader(authorization)
	if !ok {
		return nil
	}

	if err := s.repository.DeleteToken(ctx, token); err != nil {
		return fmt.Errorf("delete token: %w", err)
	}

	return nil
}

func (s *Service) UpdateAvatar(ctx context.Context, userID int64, avatar string) (*SessionUser, error) {
	user, err := s.repository.UpdateAvatar(ctx, userID, avatar)
	if err != nil {
		return nil, fmt.Errorf("update avatar: %w", err)
	}

	return user, nil
}

func (s *Service) UserByAuthorization(ctx context.Context, authorization string) (*SessionUser, error) {
	token, ok := bearerTokenFromHeader(authorization)
	if !ok {
		return nil, nil
	}

	user, err := s.repository.GetSessionByToken(ctx, token)
	if err != nil {
		if errors.Is(err, ErrSessionNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("get session: %w", err)
	}

	return user, nil
}

func bearerTokenFromHeader(authorization string) (string, bool) {
	if !strings.HasPrefix(authorization, "Bearer ") {
		return "", false
	}

	token := strings.TrimPrefix(authorization, "Bearer ")
	if token == "" {
		return "", false
	}

	return token, true
}
