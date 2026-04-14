# Testing

Azure Atlas ensures quality through a comprehensive testing strategy that covers both the backend API and the frontend web application.

## API Testing

The FastAPI backend uses **pytest** for both unit and integration testing.

1.  **Shared Fixtures:** Common database and Redis fixtures are shared across all tests to ensure consistency and speed.
2.  **Running Tests:** Execute the following command from the root directory:
    ```bash
    make test-api
    ```
    Alternatively, run pytest directly from the `apps/api/` directory:
    ```bash
    cd apps/api
    pytest tests/
    ```

## Web Testing

The React frontend uses **TypeScript** and **ESLint** for static analysis and type safety.

1.  **Type-Checking:** To ensure all TypeScript definitions are correct and consistent:
    ```bash
    make typecheck
    ```
2.  **Linting:** To verify code style and common patterns:
    ```bash
    make lint
    ```
3.  **Running Web Tests:** Execute the following command from the root directory:
    ```bash
    make test-web
    ```

## Smoke Tests

Azure Atlas includes a specific **smoke test** suite to verify that all core services are running and connected properly.

1.  **Run Smoke Tests:** Execute the following command:
    ```bash
    make smoke
    ```
2.  **Verification:** This command checks for the following:
    -   API `/health` endpoint is reachable.
    -   Database connection is active.
    -   Redis connection is active.
    -   Frontend dev server is running (optional).

!!! tip "Continuous Integration"
    All tests are automatically executed on every pull request via our GitHub Actions CI pipeline.
