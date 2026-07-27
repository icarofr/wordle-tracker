package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/icarofr/wordle-tracker/assets"
	"github.com/icarofr/wordle-tracker/internal/postgres/dbgen"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

const defaultTimeout = 3 * time.Second

// Query timeouts:
// - 3s (defaultTimeout): Single-table queries (users, auth, simple wordle lookups)
// - 10s: Multi-table joins and multi-query snapshots
// - 30s: Full-table scans and streaming scans (WhatsApp word cloud)

type Store struct {
	pool    *pgxpool.Pool
	queries *dbgen.Queries
	dsn     string
}

func withTimeout(ctx context.Context, timeout time.Duration) (context.Context, context.CancelFunc) {
	if ctx == nil {
		ctx = context.Background()
	}
	return context.WithTimeout(ctx, timeout)
}

func NewStore(dsn string) (*Store, error) {
	ctx, cancel := withTimeout(context.Background(), defaultTimeout)
	defer cancel()

	config, err := pgxpool.ParseConfig("postgres://" + dsn)
	if err != nil {
		return nil, err
	}

	config.MaxConns = 25
	config.MaxConnIdleTime = 5 * time.Minute
	config.MaxConnLifetime = 2 * time.Hour

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}

	return &Store{
		pool:    pool,
		queries: dbgen.New(pool),
		dsn:     dsn,
	}, nil
}

func (store *Store) Close() {
	store.pool.Close()
}

func (store *Store) PingContext(ctx context.Context) error {
	ctx, cancel := withTimeout(ctx, defaultTimeout)
	defer cancel()

	return store.pool.Ping(ctx)
}

func (store *Store) MigrateUp() error {
	iofsDriver, err := iofs.New(assets.EmbeddedFiles, "migrations")
	if err != nil {
		return err
	}

	migrator, err := migrate.NewWithSourceInstance("iofs", iofsDriver, "pgx5://"+store.dsn)
	if err != nil {
		return err
	}

	err = migrator.Up()
	switch {
	case errors.Is(err, migrate.ErrNoChange):
		return nil
	default:
		return err
	}
}

func (store *Store) beginTx(ctx context.Context) (pgx.Tx, error) {
	return store.pool.Begin(ctx)
}

func timestampValue(value time.Time) pgtype.Timestamp {
	return pgtype.Timestamp{Time: value, Valid: true}
}

func textValue(value string) pgtype.Text {
	return pgtype.Text{String: value, Valid: true}
}

func timePtr(value pgtype.Timestamp) *time.Time {
	if !value.Valid {
		return nil
	}

	resolved := value.Time
	return &resolved
}

func timeValue(value pgtype.Timestamp) time.Time {
	return value.Time
}

func textPtr(value pgtype.Text) *string {
	if !value.Valid {
		return nil
	}

	resolved := value.String
	return &resolved
}

func textString(value pgtype.Text) string {
	return value.String
}
