COMPOSE := docker compose

.PHONY: up down logs migrate seed test-api test-web lint typecheck

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

migrate:
	$(COMPOSE) run --rm api python -m app.migrate

seed:
	$(COMPOSE) run --rm api python -m app.migrate --seed-only

test-api:
	$(COMPOSE) run --rm api pytest

test-web:
	cd apps/web && pnpm typecheck && pnpm lint

typecheck:
	cd apps/web && pnpm typecheck

lint:
	$(COMPOSE) run --rm api ruff check . && cd apps/web && pnpm lint
