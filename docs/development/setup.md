# Development Setup

Azure Atlas provides a flexible development environment that supports both bare-metal and containerized development.

## Container-Based Development

The recommended way to develop Azure Atlas is through **Podman**. This ensures that all developers are using the same versions of PostgreSQL, Redis, and other dependencies.

1.  **Start Services:** Use the following command to spin up the full stack in the background:
    ```bash
    make up-dev
    ```
2.  **View Logs:** To see the logs from all running containers:
    ```bash
    make logs-dev
    ```
3.  **Stop Services:** To shut down the containers and free up resources:
    ```bash
    make down-dev
    ```

## Bare-Metal Development

If you prefer to run the services directly on your host machine, follow these steps:

### API Backend

The backend is a FastAPI application that requires a running PostgreSQL instance.

1.  Navigate to the API directory and install dependencies:
    ```bash
    cd apps/api
    pip install -r requirements.txt
    ```
2.  Start the development server with live-reloading:
    ```bash
    uvicorn main:app --reload --port 8001
    ```

### Web Frontend

The frontend is a Vite-based React application.

1.  Navigate to the web directory and install dependencies:
    ```bash
    cd apps/web
    pnpm install
    ```
2.  Start the Vite development server:
    ```bash
    pnpm dev
    ```

## Database Management

Common database operations can be performed using the `make` utility:

-   **Apply Migrations:** `make migrate`
-   **Reset and Seed Database:** `make reset-db`
-   **Schema Only:** `make schema`
-   **Seed Only:** `make seed`

## Workspace Scripts

Azure Atlas uses a centralized workspace for common tasks:

-   `pnpm build`: Build the web application for production.
-   `pnpm lint`: Run linting for the web application.
-   `pnpm typecheck`: Run TypeScript type-checking for the web application.

!!! tip "Hybrid Mode"
    You can run the database and Redis in containers (`make up-db`) while running the API and Web services locally for faster development cycles.
