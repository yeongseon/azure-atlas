COMPOSE      := docker compose
COMPOSE_PROD := docker compose -f docker-compose.yml -f docker-compose.prod.yml
COMPOSE_DEV  := docker compose -f docker-compose.yml -f docker-compose.dev.yml

.PHONY: up up-dev down logs migrate seed test-api test-web lint typecheck

up:
	$(COMPOSE_PROD) up --build -d

up-dev:
	$(COMPOSE_DEV) up --build -d

down:
	$(COMPOSE_PROD) down

logs:
	$(COMPOSE_PROD) logs -f

migrate:
	$(COMPOSE_PROD) run --rm api python -m app.migrate

seed:
	$(COMPOSE_PROD) run --rm api python -m app.migrate --seed-only

test-api:
	docker build --target test -t azure-atlas-api-test apps/api && \
	docker run --rm \
	  -e DATABASE_URL=postgresql://atlas:atlas@localhost:5432/atlas \
	  -e REDIS_URL=redis://localhost:6379 \
	  -e ENVIRONMENT=development \
	  azure-atlas-api-test pytest tests/ -v

test-web:
	cd apps/web && pnpm typecheck && pnpm lint

typecheck:
	cd apps/web && pnpm typecheck

lint:
	$(COMPOSE_PROD) run --rm api ruff check . && cd apps/web && pnpm lint
