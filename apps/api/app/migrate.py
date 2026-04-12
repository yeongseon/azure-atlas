import asyncio
import os
import pathlib
import sys

import asyncpg

MIGRATIONS_TABLE = """
CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""


def _inject_tracking(sql: str, filename: str) -> str:
    escaped = filename.replace("'", "''")
    tracking = (
        f"\nINSERT INTO schema_migrations (filename) VALUES ('{escaped}') ON CONFLICT DO NOTHING;"
    )
    stripped = sql.rstrip()
    if stripped.upper().endswith("COMMIT;"):
        return stripped[: stripped.upper().rfind("COMMIT;")] + tracking + "\nCOMMIT;\n"
    return sql + tracking


async def run_migrations(seed_only: bool = False) -> None:
    db_url = os.environ["DATABASE_URL"]
    conn = await asyncpg.connect(db_url)
    try:
        await conn.execute(MIGRATIONS_TABLE)

        migrations_dir = pathlib.Path(__file__).parent.parent / "migrations"
        sql_files = sorted(migrations_dir.glob("*.sql"))

        for sql_file in sql_files:
            is_schema = sql_file.name.startswith("001")
            is_seed = sql_file.name.startswith("002")

            if seed_only and not is_schema and not is_seed:
                continue

            already_applied = await conn.fetchval(
                "SELECT 1 FROM schema_migrations WHERE filename = $1",
                sql_file.name,
            )
            if already_applied:
                print(f"skip {sql_file.name} (already applied)")
                continue

            sql = _inject_tracking(sql_file.read_text(), sql_file.name)
            await conn.execute(sql)
            print(f"applied {sql_file.name}")
    finally:
        await conn.close()


if __name__ == "__main__":
    seed_only = "--seed-only" in sys.argv
    asyncio.run(run_migrations(seed_only=seed_only))
