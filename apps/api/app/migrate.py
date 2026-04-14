# pyright: reportMissingImports=false

import asyncio
import hashlib
import os
import pathlib
import sys

import asyncpg

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent.parent.parent
MIGRATIONS_DIR = REPO_ROOT / "apps" / "api" / "migrations"
ONTOLOGY_DIR = REPO_ROOT / "packages" / "ontology"

MIGRATIONS_TABLE = """\
CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    kind TEXT NOT NULL DEFAULT 'schema',
    checksum TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""

MIGRATIONS_TABLE_UPGRADE = """\
ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'schema';
ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum TEXT;
"""


def _file_checksum(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


async def _ensure_table(conn: asyncpg.Connection) -> None:
    await conn.execute(MIGRATIONS_TABLE)
    await conn.execute(MIGRATIONS_TABLE_UPGRADE)


async def _run_schema(
    conn: asyncpg.Connection, *, dry_run: bool = False, strict: bool = False
) -> None:
    sql_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not sql_files:
        print("No schema migrations found.")
        return

    for sql_file in sql_files:
        checksum = _file_checksum(sql_file)
        row = await conn.fetchrow(
            "SELECT checksum FROM schema_migrations WHERE filename = $1",
            sql_file.name,
        )

        if row is not None:
            if row["checksum"] and row["checksum"] != checksum:
                msg = f"CHECKSUM MISMATCH: {sql_file.name} has changed since last applied"
                if strict:
                    raise RuntimeError(msg)
                print(f"WARNING: {msg}")
            print(f"skip {sql_file.name} (already applied)")
            continue

        if dry_run:
            print(f"[dry-run] would apply schema: {sql_file.name}")
            continue

        sql = sql_file.read_text()
        await conn.execute(sql)
        await conn.execute(
            "INSERT INTO schema_migrations (filename, kind, checksum) VALUES ($1, 'schema', $2)",
            sql_file.name,
            checksum,
        )
        print(f"applied {sql_file.name}")


async def _run_seeds(
    conn: asyncpg.Connection, *, dry_run: bool = False, strict: bool = False
) -> None:
    seed_files = sorted(ONTOLOGY_DIR.glob("seed_*.sql"))
    if not seed_files:
        print("No seed files found.")
        return

    for seed_file in seed_files:
        checksum = _file_checksum(seed_file)
        row = await conn.fetchrow(
            "SELECT checksum FROM schema_migrations WHERE filename = $1",
            seed_file.name,
        )

        if row is not None:
            if row["checksum"] and row["checksum"] != checksum:
                msg = f"CHECKSUM MISMATCH: {seed_file.name} has changed since last applied"
                if strict:
                    raise RuntimeError(msg)
                print(f"WARNING: {msg}")
            print(f"skip {seed_file.name} (already applied)")
            continue

        if dry_run:
            print(f"[dry-run] would apply seed: {seed_file.name}")
            continue

        sql = seed_file.read_text()
        await conn.execute(sql)
        await conn.execute(
            "INSERT INTO schema_migrations (filename, kind, checksum) VALUES ($1, 'seed', $2)",
            seed_file.name,
            checksum,
        )
        print(f"applied seed {seed_file.name}")


async def run_migrations(
    *,
    schema_only: bool = False,
    seed_only: bool = False,
    dry_run: bool = False,
    strict: bool = False,
) -> None:
    db_url = os.environ["DATABASE_URL"]
    conn = await asyncpg.connect(db_url)
    try:
        await _ensure_table(conn)

        if seed_only:
            await _run_seeds(conn, dry_run=dry_run, strict=strict)
        elif schema_only:
            await _run_schema(conn, dry_run=dry_run, strict=strict)
        else:
            await _run_schema(conn, dry_run=dry_run, strict=strict)
            await _run_seeds(conn, dry_run=dry_run, strict=strict)
    finally:
        await conn.close()


if __name__ == "__main__":
    schema_only = "--schema-only" in sys.argv
    seed_only = "--seed-only" in sys.argv
    dry_run = "--dry-run" in sys.argv
    strict = "--strict" in sys.argv
    asyncio.run(
        run_migrations(
            schema_only=schema_only,
            seed_only=seed_only,
            dry_run=dry_run,
            strict=strict,
        )
    )
