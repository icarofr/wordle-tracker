DEPLOY_DEST ?= dist
VITE_API_URL ?= /
NODE_IMAGE ?= node:24.10.0-bookworm
PNPM_VERSION ?= 10.15.1
NODE_MODULES_VOLUME ?= wordle-tracker-client-node-modules

.PHONY: build deploy

build:
	podman run --rm \
		-e HOME=/tmp \
		-e COREPACK_HOME=/tmp/corepack \
		-e VITE_API_URL="$(VITE_API_URL)" \
		-v "$$(pwd):/app" \
		-v "$(NODE_MODULES_VOLUME):/app/node_modules" \
		-w /app \
		$(NODE_IMAGE) \
		corepack pnpm@$(PNPM_VERSION) install --frozen-lockfile
	podman run --rm \
		-e HOME=/tmp \
		-e COREPACK_HOME=/tmp/corepack \
		-e VITE_API_URL="$(VITE_API_URL)" \
		-v "$$(pwd):/app" \
		-v "$(NODE_MODULES_VOLUME):/app/node_modules" \
		-w /app \
		$(NODE_IMAGE) \
		corepack pnpm@$(PNPM_VERSION) run build

deploy: build
	@test -n "$(DEPLOY_DEST)" || { echo "DEPLOY_DEST is required"; exit 1; }
	rm -rf $(DEPLOY_DEST) && cp -r dist $(DEPLOY_DEST)
