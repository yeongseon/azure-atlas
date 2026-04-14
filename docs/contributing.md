# Contributing

Thank you for your interest in contributing to Azure Atlas. We welcome contributions of all types, from code improvements to ontology enhancements and documentation updates.

## Getting Started

1.  **Fork the Repository:** Start by forking the `yeongseon/azure-atlas` repository on GitHub.
2.  **Clone Locally:** Clone your fork to your development machine.
3.  **Setup Environment:** Follow the [Development Setup](development/setup.md) guide to get the project running locally.

## Code Style

Consistency is key to maintaining a high-quality codebase. We use several tools to enforce code style:

### Python (API)
-   **Ruff:** Used for linting and formatting.
-   **Strict Typing:** All new functions and classes should have complete type hints.

### TypeScript (Web)
-   **ESLint:** Standard React and TypeScript linting rules.
-   **Prettier:** Code formatting for all `.ts`, `.tsx`, and `.css` files.

## Commit Convention

We follow the **Conventional Commits** specification for all commit messages. This helps automate our release process and changelog generation.

-   `feat:` A new feature.
-   `fix:` A bug fix.
-   `docs:` Documentation changes.
-   `style:` Changes that do not affect the meaning of the code (white-space, formatting, etc).
-   `refactor:` A code change that neither fixes a bug nor adds a feature.
-   `test:` Adding missing tests or correcting existing tests.
-   `chore:` Changes to the build process or auxiliary tools.

## Pull Request Process

1.  **Branch Naming:** Use descriptive branch names like `feat/add-new-domain` or `fix/graph-rendering`.
2.  **Self-Review:** Before submitting, run `make lint` and `make test` locally to ensure everything is in order.
3.  **Open PR:** Submit your pull request against the `main` branch of the original repository.
4.  **Review:** Provide a clear description of your changes and wait for a maintainer to review your work.

## Extending the Ontology

Contributing to the ontology is one of the most impactful ways to help Azure Atlas.

-   **Add Nodes:** Expand our coverage of Azure services and features.
-   **Improve Evidence:** Add more accurate or recent documentation excerpts from MS Learn.
-   **Curate Journeys:** Create new learning paths for complex architectural scenarios.

!!! tip "Small PRs"
    We prefer small, focused pull requests that are easy to review and merge quickly.
