DEPLOY_DEST ?= dist
VITE_API_URL ?= /

.PHONY: build deploy

build:
	pnpm install --frozen-lockfile
	VITE_API_URL=$(VITE_API_URL) pnpm run build

deploy: build
	@test -n "$(DEPLOY_DEST)" || { echo "DEPLOY_DEST is required"; exit 1; }
	rm -rf $(DEPLOY_DEST) && cp -r dist $(DEPLOY_DEST)
