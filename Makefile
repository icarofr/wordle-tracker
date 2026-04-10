# ==================================================================================== #
# HELPERS
# ==================================================================================== #

## all: generate, lint, test — the full local check
.PHONY: all
all: check

## help: print this help message
.PHONY: help
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'

# ==================================================================================== #
# DEVELOPMENT
# ==================================================================================== #

## dev/server: start the Go API server (requires DB_DSN)
.PHONY: dev/server
dev/server:
	$(MAKE) -C server run

## dev/client: start the Vite dev server (proxies /api to Go server)
.PHONY: dev/client
dev/client:
	cd client && pnpm dev

## dev/mock: start the Vite dev server with MSW mock API (no backend needed)
.PHONY: dev/mock
dev/mock:
	cd client && VITE_MOCK_API=true pnpm dev

# ==================================================================================== #
# CODE GENERATION
# ==================================================================================== #

## generate: run all code generators (oapi-codegen, moq, openapi-typescript)
.PHONY: generate
generate:
	$(MAKE) -C server generate
	cd client && npx openapi-typescript ../server/api/openapi.yaml -o src/types/generated.ts

## generate/check: verify generated code matches source (fails if out of date)
.PHONY: generate/check
generate/check: generate
	git diff --exit-code -- server/api/gen.go server/cmd/web/mocks_test.go client/src/types/generated.ts

# ==================================================================================== #
# QUALITY CONTROL
# ==================================================================================== #

## test: run all tests (server + client)
.PHONY: test
test:
	$(MAKE) -C server test
	cd client && pnpm test

## lint: run all linters
.PHONY: lint
lint:
	$(MAKE) -C server vet
	cd client && pnpm lint

## check: full pre-push validation (generate + lint + test — mirrors CI)
.PHONY: check
check: generate/check lint test

# ==================================================================================== #
# INTEGRATION TESTS
# ==================================================================================== #

## test/integration: run Venom API tests via Docker Compose
.PHONY: test/integration
test/integration:
	docker compose -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from venom

## test/integration/down: tear down integration test containers
.PHONY: test/integration/down
test/integration/down:
	docker compose -f docker-compose.test.yml down -v

# ==================================================================================== #
# BUILD & DEPLOY
# ==================================================================================== #

## build: build server binary and client static files
.PHONY: build
build:
	$(MAKE) -C server build
	$(MAKE) -C client build

## up: start production stack via Docker Compose
.PHONY: up
up:
	docker compose up -d --build

## deploy: build client and restart production stack
.PHONY: deploy
deploy:
	$(MAKE) -C client deploy
	docker compose up -d --build --force-recreate

# ==================================================================================== #
# SHOWCASE
# ==================================================================================== #

## build/showcase: build client with MSW mock data (no backend needed)
.PHONY: build/showcase
build/showcase:
	cd client && pnpm install --frozen-lockfile && VITE_MOCK_API=true pnpm run build

