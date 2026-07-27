# Wordle Tracker

A competitive Wordle tracker I originally built to keep score between me and my girlfriend.
After over a year running in “production”, I figured it was stable enough to open-source, and added support for more players while I was at it (currently up to 6).

**[Live Demo](https://wordle-tracker.icaro.fr)**: runs entirely in the browser with mock data, no backend needed

## Features

- **Dashboard**: paste your Wordle result to submit, view score distribution and recent games
- **Head-to-Head**: compare performance on shared games with win/loss/tie records, streaks, and charts
- **Leaderboard**: rankings by average score, win rate, and streaks
- **Wordle Lookup**: browse all played games with per-game details, play unplayed wordles via WordleReplay links

## Tech Stack

| Layer    | Technology                                                                                 |
| -------- | ------------------------------------------------------------------------------------------ |
| Frontend | SolidJS 1.9, TanStack Router (file-based), TypeScript, Tailwind CSS v4                     |
| Backend  | Go 1.26, `net/http.ServeMux`, oapi-codegen (strict server), pgx/v5 + pgxpool, SQLC, bcrypt |
| Database | PostgreSQL 18                                                                              |
| Testing  | Vitest + MSW (client), moq (server), Venom (integration)                                   |
| Build    | Vite + pnpm (client), Go modules (server)                                                  |
| CI/CD    | GitHub Actions (lint + test + build) |

## Architecture

Monorepo with two services:

```
Client (SolidJS SPA)  -->  Go API  -->  PostgreSQL
  served by Caddy        distroless container
```

### OpenAPI-First Contract

The API is defined by a hand-written OpenAPI 3.0 spec (`server/api/openapi.yaml`). This single source of truth drives three code generators, forming a contract triangle that makes API drift impossible:

```
              openapi.yaml
             (source of truth)
              /           \
   oapi-codegen       openapi-typescript
      |                     |
   Go strict           TypeScript types
   server interface    for client + MSW
      |                     |
   Compile-time        Compile-time
   enforcement         enforcement
              \           /
            Venom tests
            (runtime enforcement
             against real DB)
```

| Layer       | Tool                                                                     | What it catches                                                  |
| ----------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Server      | [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen) strict mode | Handler returns wrong type, missing endpoint, wrong status code  |
| Client      | [openapi-typescript](https://github.com/openapi-ts/openapi-typescript)   | Field renamed/removed, type mismatch in MSW handlers or fixtures |
| Integration | [Venom](https://github.com/ovh/venom)                                    | Wrong SQL, broken calculations, edge cases with real data        |
| CI          | `go generate && git diff --exit-code`                                    | Generated code out of sync with spec                             |

The OpenAPI schemas use `x-go-type` extensions to map directly to internal Go types, so handlers return domain types through generated response wrappers with zero conversion:

```go
func (app *application) GetMyStats(ctx context.Context, request api.GetMyStatsRequestObject) (api.GetMyStatsResponseObject, error) {
    stats, err := app.wordles.Stats(ctx, user.ID)
    return api.GetMyStats200JSONResponse(*stats), nil
}
```

## Development

### Prerequisites

- Go 1.26+
- Node.js 22+ with pnpm
- PostgreSQL 18 (or Docker)

### Make commands

All common workflows are available from the root Makefile (`make help`):

| Command                 | What it does                                                             |
| ----------------------- | ------------------------------------------------------------------------ |
| `make dev/server`       | Start the Go API server (requires `DB_DSN`)                              |
| `make dev/client`       | Start the Vite dev server (proxies `/api` to Go)                         |
| `make dev/mock`         | Start Vite with MSW mock API - no backend needed                         |
| `make generate`         | Run all code generators (oapi-codegen + moq + sqlc + openapi-typescript) |
| `make generate/check`   | Verify generated code matches source (fails if out of date)              |
| `make test`             | Run all tests (server + client)                                          |
| `make lint`             | Run all linters (go vet + eslint)                                        |
| `make check`            | Full pre-push validation - generate + lint + test (mirrors CI)           |
| `make test/integration` | Run Venom API tests via Podman                                           |
| `make build`            | Build server binary + client static files                                |
| `make deploy`           | Build client + restart production stack                                  |
| `make up`               | Start production stack via Quadlet                                       |
| `make build/showcase`   | Build client with MSW mock data (no backend)                             |

### Showcase Mode

The [live demo](https://wordle-tracker.icaro.fr) runs entirely in the browser using [MSW](https://mswjs.io/) (Mock Service Worker). No backend, no database - just a static SPA with intercepted API calls and curated mock data. This is the same MSW infrastructure used for testing, doubling as a zero-cost demo.

```bash
make build/showcase   # builds with VITE_MOCK_API=true
make dev/mock         # local dev with mock data
```

### Environment

Create `.env` in the project root for local development:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=wordle-tracker
```

The Go server reads `DB_DSN`, `HTTP_PORT`, `CORS_ORIGINS`, and `DB_AUTOMIGRATE` from environment variables.

## Testing

Three layers, each catching different classes of bugs:

### Client

Unit tests for pure functions, component tests with `@solidjs/testing-library`, API client tests with MSW. The same MSW handlers and fixtures power both tests and the [live demo](https://wordle-tracker.icaro.fr).

```bash
make test          # run all (server + client)
```

### Server

Handler tests using [moq](https://github.com/matryer/moq)-generated mocks. Tests exercise the full HTTP stack (request parsing, middleware, handler logic, response serialization) without a database.

### Integration

YAML-driven API tests against a real PostgreSQL database:

| Suite             | What it tests                                                   |
| ----------------- | --------------------------------------------------------------- |
| `01_auth`         | Register, login, token access, logout, token rejection          |
| `02_submission`   | Valid submit, duplicate (409), invalid format (400)             |
| `03_stats`        | 10 known scores, exact stat values (avg, streaks, win%)         |
| `05_head_to_head` | Win/loss/tie symmetry from both perspectives                    |
| `06_archive`      | Cursor pagination with exact wordle IDs, detail endpoint        |
| `07_edge_cases`   | Zero games, all failures, validation, duplicate email           |
| `99_leaderboard`  | DB reset, 3 users, exact ranking order and shared_wordles count |

```bash
make test/integration   # Podman: Postgres + server + Venom
```

## Deployment

>⚠️ **Note:** This project runs on Podman + systemd Quadlets in production. A `compose.yaml` is included for convenience and backwards compatibility, but it's **untested** and **unmantained!** It may have quirks.

## CI/CD

GitHub Actions runs on every push/PR to `master`.

1. **Server**: `go build` + `go vet` + `go test` + generation drift check, uploads binary artifact
2. **Client**: `pnpm lint` + `pnpm test` + TS type drift check + `pnpm build`
3. **Integration**: Postgres service container (pre-started), downloads server binary, installs Venom, runs 7 suites
4. **Deploy**: SSH to production after all jobs pass (push to `master` only)

## API

17 endpoints defined in `server/api/openapi.yaml`.

**Public:**

- `GET /health`: health check
- `POST /sessions`: login
- `POST /users`: register

**Protected** (Bearer token):

- `GET /users`, `GET /users/{id}`: list and get users
- `GET /users/self`, `PATCH /users/self`: current user profile and avatar
- `GET /users/self/stats`, `GET /users/{id}/stats`: wordle statistics
- `GET /users/self/head-to-heads/{id}`: head-to-head comparison
- `POST /wordle-submissions`: submit a wordle result
- `GET /wordles`, `GET /wordles/{id}`: archive (paginated) and detail
- `GET /leaderboards/current`: leaderboard
- `DELETE /sessions/current`: logout

All errors follow [RFC 7807 Problem Details](https://tools.ietf.org/html/rfc7807) with `Content-Type: application/problem+json`.

## API Design

The API follows the [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/):

- **OpenAPI-first** - the spec is the source of truth, not an afterthought generated from code
- **RFC 7807 Problem Details** - all errors use the standard `application/problem+json` format with `type` URIs for machine-readable error codes
- **Cursor-based pagination** - archive endpoint uses opaque cursors (base64-encoded IDs) with `self`/`next` links
- **Bearer token auth** - standard `Authorization: Bearer <token>` scheme defined in the OpenAPI security section
- **Consistent resource naming** - plural nouns (`/users`, `/wordles`), nested resources (`/users/self/stats`), action resources (`/wordle-submissions`)

## Project Structure

```
client/src/
  routes/               # File-based routing (TanStack Router)
  features/             # Feature modules (page + hooks + components)
  components/ui/        # Shared UI components
  lib/                  # API client, auth, preload, utilities
  test/                 # MSW handlers, fixtures, Vitest setup
  types/                # Generated TypeScript types from OpenAPI spec

server/
  api/
    openapi.yaml        # OpenAPI 3.0 spec (source of truth)
    cfg.yaml            # oapi-codegen configuration
    gen.go              # Generated strict server interface + types
  cmd/web/              # Handlers, routes, middleware, errors
    mocks_test.go       # Generated test mocks (moq)
  internal/
    auth/               # Authentication (bcrypt, tokens)
    users/              # User service
    wordles/            # Stats, archive, leaderboard, parser
    postgres/           # pgxpool store, SQLC queries/dbgen, feature repositories
      dbgen/            # Generated SQLC query code
      queries/          # SQL source files consumed by SQLC
    response/           # RFC 7807 ProblemJSON + metrics writer
    validator/          # Input validation
    env/                # Environment variable parsing
    version/            # Build version info
  assets/migrations/    # SQL migration files

venom/                  # Integration test suites (YAML)
```
