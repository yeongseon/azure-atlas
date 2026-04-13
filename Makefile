COMPOSE      := podman-compose
COMPOSE_PROD := podman-compose -f docker-compose.yml -f docker-compose.prod.yml
COMPOSE_DEV  := podman-compose -f docker-compose.yml -f docker-compose.dev.yml

.PHONY: up up-dev down down-dev logs logs-dev \
        migrate schema seed bootstrap reset-db demo smoke \
        test-api test-web lint typecheck help

# ── Core ────────────────────────────────────────────────────
up:
	$(COMPOSE_PROD) up --build -d

up-dev:
	$(COMPOSE_DEV) up --build -d

down:
	$(COMPOSE_PROD) down

down-dev:
	$(COMPOSE_DEV) down

logs:
	$(COMPOSE_PROD) logs -f

logs-dev:
	$(COMPOSE_DEV) logs -f

# ── Database ────────────────────────────────────────────────
migrate:
	$(COMPOSE_DEV) run --rm api python -m app.migrate

schema:
	$(COMPOSE_DEV) run --rm api python -m app.migrate --schema-only

seed:
	$(COMPOSE_DEV) run --rm api python -m app.migrate --seed-only

reset-db:
	$(COMPOSE_DEV) down -v
	$(COMPOSE_DEV) up -d db
	@echo "Waiting for Postgres…"
	@sleep 3
	$(COMPOSE_DEV) run --rm api python -m app.migrate
	@echo "Database reset complete."

# ── DX Shortcuts ────────────────────────────────────────────
bootstrap: ## One-command project setup
	@echo "==> Copying .env (if missing)…"
	@test -f .env || cp .env.example .env
	@echo "==> Building and starting dev stack…"
	$(COMPOSE_DEV) up --build -d
	@echo "==> Waiting for services…"
	@sleep 5
	@echo "==> Running migrations…"
	$(COMPOSE_DEV) run --rm api python -m app.migrate
	@echo ""
	@echo "Bootstrap complete."
	@echo "  Web:  http://localhost:5173"
	@echo "  API:  http://localhost:8001"

demo: up-dev ## Start dev stack and print URLs
	@echo ""
	@echo "Azure Atlas is running:"
	@echo "  Web:  http://localhost:5173"
	@echo "  API:  http://localhost:8001/health"
	@echo "  Docs: http://localhost:8001/docs"

smoke: ## Quick health check against running services
	@echo "Checking API health…"
	@curl -sf http://localhost:8001/health > /dev/null && echo "  API /health: ok" || (echo "  API /health: FAIL" && exit 1)
	@echo "Checking API readiness…"
	@curl -sf http://localhost:8001/readyz > /dev/null && echo "  API /readyz: ok" || (echo "  API /readyz: FAIL" && exit 1)
	@echo "Checking Web…"
	@curl -sf http://localhost:5173 > /dev/null 2>&1 \
	  || curl -sf http://localhost:8088 > /dev/null 2>&1 \
	  && echo "  Web: ok" || (echo "  Web: FAIL (neither :5173 nor :8088 responded)" && exit 1)
	@echo "All services healthy."

# ── Quality ─────────────────────────────────────────────────
test-api:
	docker build --target test -t azure-atlas-api-test apps/api && \
	docker run --rm \
	  -e DATABASE_URL=postgresql://test:test@db:5432/test \
	  -e REDIS_URL=redis://redis:6379 \
	  -e ENVIRONMENT=test \
	  azure-atlas-api-test

test-web:
	cd apps/web && pnpm typecheck && pnpm lint

typecheck:
	cd apps/web && pnpm typecheck

lint:
	$(COMPOSE_DEV) run --rm api ruff check . && cd apps/web && pnpm lint

# ── Help ────────────────────────────────────────────────────
help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
