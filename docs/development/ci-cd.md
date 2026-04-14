# CI/CD

Azure Atlas uses **GitHub Actions** for its continuous integration (CI) and continuous delivery (CD) pipeline. This ensures that every change is thoroughly tested and documented before being merged into the main branch.

## CI Pipeline Overview

The CI pipeline is triggered on every push to the `main` branch and on every pull request. It consists of several parallel jobs:

| Job | Description |
| --- | ----------- |
| `lint-api` | Runs **Ruff** for Python code style and formatting. |
| `test-api` | Runs the **pytest** suite for the FastAPI backend. |
| `lint-web` | Runs **ESLint** for React and TypeScript code style. |
| `typecheck-web` | Runs **TypeScript** type-checking for the frontend application. |
| `build-web` | Verifies that the React application can be built successfully. |

## Deployment Pipeline

The CD pipeline is responsible for deploying the latest version of Azure Atlas and its documentation.

### GitHub Pages Deployment

The documentation site is automatically built and deployed to **GitHub Pages** whenever changes are merged into the `main` branch.

-   **Workflow File:** `.github/workflows/docs.yml`
-   **Tool:** **MkDocs Material**
-   **URL:** [https://yeongseon.github.io/azure-atlas](https://yeongseon.github.io/azure-atlas)

### Application Deployment

The application itself is deployed as a set of containerized services.

-   **Development Branch:** Pushes to the `dev` branch are automatically deployed to our staging environment.
-   **Main Branch:** Pushes to the `main` branch trigger a production deployment after a manual approval step.

!!! tip "Release Tags"
    Significant versions of Azure Atlas are tagged using semantic versioning (e.g., `v1.2.0`). This triggers an automated release process on GitHub.
