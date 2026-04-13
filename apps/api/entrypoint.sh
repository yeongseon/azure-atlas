#!/usr/bin/env bash
set -euo pipefail

echo "Running schema migrations…"
python -m app.migrate --schema-only
echo "Migrations complete."

exec "$@"
