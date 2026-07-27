package main

import (
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"os"
	"runtime/debug"
	"strings"
	"sync"

	"github.com/icarofr/wordle-tracker/internal/auth"
	"github.com/icarofr/wordle-tracker/internal/env"
	"github.com/icarofr/wordle-tracker/internal/postgres"
	"github.com/icarofr/wordle-tracker/internal/users"
	"github.com/icarofr/wordle-tracker/internal/version"
	"github.com/icarofr/wordle-tracker/internal/wordles"
	"github.com/lmittmann/tint"
)

func main() {
	logger := slog.New(tint.NewHandler(os.Stdout, &tint.Options{Level: slog.LevelDebug}))

	err := run(logger)
	if err != nil {
		trace := string(debug.Stack())
		logger.Error(err.Error(), "trace", trace)
		os.Exit(1)
	}
}

type config struct {
	httpPort    int
	baseURL     string
	corsOrigins []string
	db          struct {
		dsn         string
		automigrate bool
	}
}

// application implements api.StrictServerInterface. All handlers are methods on this type.
// Handler dependencies:
//   - Auth handlers (Login, Register, Logout): auth
//   - User handlers (ListUsers, GetUser, GetCurrentUser, UpdateAvatar, GetMyStats, GetUserStats): auth, users, wordles
//   - Wordle handlers (SubmitWordle, GetArchive, GetArchiveWordle, GetHeadToHead, GetLeaderboard): users, wordles
//   - Health (GetHealth): health
type application struct {
	health   pinger          // health check only
	auth     authService     // auth + user handlers
	users    usersService    // user + wordle handlers
	wordles  wordlesService  // user + wordle handlers
	logger   *slog.Logger    // all handlers
	wg       sync.WaitGroup  // graceful shutdown
	config   config          // all handlers (baseURL, cors)
}

func run(logger *slog.Logger) error {
	showVersion := flag.Bool("version", false, "display version and exit")
	flag.Parse()

	if *showVersion {
		fmt.Printf("version: %s\n", version.Get())
		return nil
	}

	var cfg config
	var err error

	cfg.httpPort, err = env.GetInt("HTTP_PORT", 9999)
	if err != nil {
		return err
	}
	cfg.baseURL = env.GetString("BASE_URL", "")
	cfg.corsOrigins = strings.Split(
		env.GetString("CORS_ORIGINS", "http://localhost:3000,http://localhost:3002,http://localhost:5173"),
		",",
	)
	cfg.db.dsn = env.GetString("DB_DSN", "")
	cfg.db.automigrate, err = env.GetBool("DB_AUTOMIGRATE", false)
	if err != nil {
		return err
	}

	if cfg.db.dsn == "" {
		return errors.New("DB_DSN environment variable is required")
	}

	store, err := postgres.NewStore(cfg.db.dsn)
	if err != nil {
		return err
	}
	defer store.Close()

	if cfg.db.automigrate {
		err = store.MigrateUp()
		if err != nil {
			return err
		}
	}

	authRepository := postgres.NewAuthRepository(store)
	usersRepository := postgres.NewUsersRepository(store)
	wordlesRepository := postgres.NewWordlesRepository(store)

	app := &application{
		health:   store,
		auth:     auth.New(authRepository),
		users:    users.New(usersRepository),
		wordles:  wordles.New(wordlesRepository),
		logger:   logger,
		config:   cfg,
	}

	return app.serveHTTP()
}
