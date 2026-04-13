# Contributing to Azure Atlas

Thank you for your interest in contributing to Azure Atlas. This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository and clone it locally.
2. Follow the [Development Setup](#development-setup) to prepare your environment.
3. Create a new branch for your changes: `git checkout -b feat/your-feature-name`.

## Prerequisites

- [Podman](https://podman.io/) + [podman-compose](https://github.com/containers/podman-compose)
- [Node.js 20+](https://nodejs.org/) with [pnpm 9](https://pnpm.io/)
- [Python 3.12+](https://www.python.org/)

## Development Setup

The easiest way to set up the project is using the provided Makefile:

```bash
make bootstrap
```

This command:
- Copies `.env.example` to `.env`
- Builds and starts all containers (PostgreSQL, Redis, API, Web)
- Runs database migrations and seeds initial data

## Code Style

### Python (API)
- Use **ruff** for linting and formatting.
- Run `make lint` to check both API and Web.

### TypeScript (Web)
- Use **ESLint** and **Prettier**.
- Run `pnpm lint` in the `apps/web` directory or `make test-web`.

## Testing

Ensure all tests pass before submitting a pull request:

- **API Tests**: `make test-api` (runs pytest)
- **Web Tests**: `pnpm typecheck` and `pnpm lint` (or `make test-web`)
- **Smoke Check**: `make smoke` to verify running services.

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: A new feature
- `fix`: A bug fix
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `docs`: Documentation only changes
- `chore`: Changes to the build process or auxiliary tools and libraries

Example: `feat: add support for storage account nodes`

## PR Process

1. Ensure your code follows the established style and all tests pass.
2. Update documentation if necessary.
3. Push your changes to your fork.
4. Submit a Pull Request to the `main` branch.
5. Provide a clear summary of changes and reference any related issues.
