#!/usr/bin/env bash
set -euo pipefail

echo "Running database migrations…"
python -m app.migrate
echo "Migrations complete."

exec "$@"
