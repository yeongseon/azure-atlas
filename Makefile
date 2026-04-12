COMPOSE := docker compose

.PHONY: up down logs migrate seed test-api test-web lint

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

migrate:
	$(COMPOSE) run --rm api python -m app.migrate

seed:
	$(COMPOSE) run --rm api python -m app.seed

test-api:
	$(COMPOSE) run --rm api pytest

test-web:
	$(COMPOSE) run --rm web pnpm test

lint:
	$(COMPOSE) run --rm api ruff check . && $(COMPOSE) run --rm web pnpm exec eslint .
