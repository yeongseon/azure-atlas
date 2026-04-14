# Prerequisites

Before you begin setting up Azure Atlas, ensure your development environment meets the following requirements.

## Core Dependencies

Ensure these core tools are installed on your machine:

-   **Podman** 4.5+ with **podman-compose** for containerized services.
-   **Node.js** 20.x or later with **pnpm** for the React frontend.
-   **Python** 3.12 or later for the FastAPI backend and management scripts.

## Installation by Platform

Follow the specific steps for your operating system to set up these dependencies.

=== "macOS"

    1.  Install **Homebrew** if not already present.
    2.  Install Podman and Python:
        ```bash
        brew install podman podman-compose python@3.12
        ```
    3.  Initialize and start the Podman machine:
        ```bash
        podman machine init
        podman machine start
        ```
    4.  Install Node.js and pnpm:
        ```bash
        brew install node
        npm install -g pnpm
        ```

=== "Ubuntu"

    1.  Update your package list and install Podman and Python:
        ```bash
        sudo apt update
        sudo apt install podman podman-compose python3.12 python3.12-venv
        ```
    2.  Ensure Python 3.12 is the default or create a virtual environment:
        ```bash
        python3.12 -m venv .venv
        source .venv/bin/activate
        ```
    3.  Install Node.js and pnpm:
        ```bash
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
        sudo npm install -g pnpm
        ```

=== "Windows WSL"

    1.  Ensure you have **WSL 2** installed and configured (Ubuntu 22.04+ recommended).
    2.  Within the WSL terminal, install Podman and Python:
        ```bash
        sudo apt update
        sudo apt install podman podman-compose python3.12
        ```
    3.  Configure Podman to run in rootless mode.
    4.  Install Node.js and pnpm:
        ```bash
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
        sudo npm install -g pnpm
        ```

!!! tip
    On Windows, it is highly recommended to clone the repository within the WSL filesystem (e.g., `/home/username/repo`) rather than the Windows filesystem (`/mnt/c/...`) to avoid permission and performance issues.
