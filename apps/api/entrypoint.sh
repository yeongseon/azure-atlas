#!/usr/bin/env bash
set -euo pipefail

echo "Running migrations (schema + seeds)…"
python -m app.migrate
echo "Migrations complete."

exec "$@"
