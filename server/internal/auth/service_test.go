package auth

import (
	"context"
	"errors"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

type stubStore struct {
	getCredentialsByEmailFn func(context.Context, string) (*Credentials, error)
	getSessionByTokenFn     func(context.Context, string) (*SessionUser, error)
	createUserFn            func(context.Context, string, string, string) (*SessionUser, error)
	createTokenFn           func(context.Context, int64, string, string) (string, error)
	deleteTokenFn           func(context.Context, string) error
	updateAvatarFn          func(context.Context, int64, string) (*SessionUser, error)
}

func (s stubStore) GetCredentialsByEmail(ctx context.Context, email string) (*Credentials, error) {
	return s.getCredentialsByEmailFn(ctx, email)
}
func (s stubStore) GetSessionByToken(ctx context.Context, token string) (*SessionUser, error) {
	return s.getSessionByTokenFn(ctx, token)
}
func (s stubStore) CreateUser(ctx context.Context, name, email, hash string) (*SessionUser, error) {
	return s.createUserFn(ctx, name, email, hash)
}
func (s stubStore) CreateToken(ctx context.Context, userID int64, email, tokenCtx string) (string, error) {
	return s.createTokenFn(ctx, userID, email, tokenCtx)
}
func (s stubStore) DeleteToken(ctx context.Context, token string) error {
	return s.deleteTokenFn(ctx, token)
}
func (s stubStore) UpdateAvatar(ctx context.Context, userID int64, avatar string) (*SessionUser, error) {
	return s.updateAvatarFn(ctx, userID, avatar)
}

func TestServiceLogin(t *testing.T) {
	t.Parallel()

	hash, err := bcrypt.GenerateFromPassword([]byte("hunter2-password"), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("GenerateFromPassword: %v", err)
	}

	svc := New(stubStore{
		getCredentialsByEmailFn: func(_ context.Context, email string) (*Credentials, error) {
			return &Credentials{
				ID:           7,
				Name:         "Icaro",
				Email:        email,
				PasswordHash: string(hash),
				Avatar:       "01",
			}, nil
		},
		createTokenFn: func(_ context.Context, _ int64, _ string, tokenCtx string) (string, error) {
			if tokenCtx != TokenContextLong {
				t.Errorf("token context = %q, want %q", tokenCtx, TokenContextLong)
			}
			return "token-123", nil
		},
	})

	user, token, err := svc.Login(context.Background(), LoginInput{
		Email:      "icaro@example.com",
		Password:   "hunter2-password",
		RememberMe: true,
	})
	if err != nil {
		t.Fatalf("Login: %v", err)
	}
	if user.ID != 7 || user.Name != "Icaro" {
		t.Fatalf("Login user = %+v, want ID 7, Name Icaro", user)
	}
	if token != "token-123" {
		t.Fatalf("Login token = %q, want %q", token, "token-123")
	}
}

func TestServiceLoginInvalidCredentials(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{
		getCredentialsByEmailFn: func(context.Context, string) (*Credentials, error) {
			return nil, ErrSessionNotFound
		},
	})

	_, _, err := svc.Login(context.Background(), LoginInput{
		Email:    "missing@example.com",
		Password: "hunter2-password",
	})
	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("Login error = %v, want %v", err, ErrInvalidCredentials)
	}
}

func TestServiceRegisterEmailTaken(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{
		createUserFn: func(context.Context, string, string, string) (*SessionUser, error) {
			return nil, ErrEmailTaken
		},
	})

	_, _, err := svc.Register(context.Background(), RegisterInput{
		Name:     "Icaro",
		Email:    "icaro@example.com",
		Password: "hunter2-password",
	})
	if !errors.Is(err, ErrEmailTaken) {
		t.Fatalf("Register error = %v, want %v", err, ErrEmailTaken)
	}
}

func TestServiceUserByAuthorization(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{
		getSessionByTokenFn: func(_ context.Context, token string) (*SessionUser, error) {
			if token != "good-token" {
				t.Fatalf("token = %q, want %q", token, "good-token")
			}
			return &SessionUser{ID: 11, Email: "icaro@example.com"}, nil
		},
	})

	user, err := svc.UserByAuthorization(context.Background(), "Bearer good-token")
	if err != nil {
		t.Fatalf("UserByAuthorization: %v", err)
	}
	if user == nil || user.ID != 11 {
		t.Fatalf("user = %+v, want ID 11", user)
	}
}

func TestServiceUserByAuthorizationExpiredToken(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{
		getSessionByTokenFn: func(context.Context, string) (*SessionUser, error) {
			return nil, ErrSessionNotFound
		},
	})

	user, err := svc.UserByAuthorization(context.Background(), "Bearer expired-token")
	if err != nil {
		t.Fatalf("UserByAuthorization: %v", err)
	}
	if user != nil {
		t.Fatalf("user = %+v, want nil", user)
	}
}

func TestServiceUserByAuthorizationNoHeader(t *testing.T) {
	t.Parallel()

	svc := New(stubStore{})

	user, err := svc.UserByAuthorization(context.Background(), "")
	if err != nil {
		t.Fatalf("UserByAuthorization: %v", err)
	}
	if user != nil {
		t.Fatalf("user = %+v, want nil", user)
	}
}
