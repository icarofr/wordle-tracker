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

type application struct {
	health   pinger
	auth     authService
	users    usersService
	wordles  wordlesService
	logger   *slog.Logger
	wg       sync.WaitGroup
	config   config
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

	db, err := postgres.New(cfg.db.dsn)
	if err != nil {
		return err
	}
	defer db.Close()

	if cfg.db.automigrate {
		err = db.MigrateUp()
		if err != nil {
			return err
		}
	}

	app := &application{
		health:   db,
		auth:     auth.New(db),
		users:    users.New(db),
		wordles:  wordles.New(db),
		logger:   logger,
		config:   cfg,
	}

	return app.serveHTTP()
}
