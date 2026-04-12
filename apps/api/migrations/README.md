# Migrations

SQL migration files applied in numeric order via `make migrate`.

Files are named `001_initial.sql`, `002_...sql`, etc.
Apply with: `psql $DATABASE_URL -f migrations/NNN_name.sql`
