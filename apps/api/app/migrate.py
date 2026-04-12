import asyncio
import os
import pathlib

import asyncpg


async def run_migrations() -> None:
    db_url = os.environ["DATABASE_URL"]
    conn = await asyncpg.connect(db_url)
    migrations_dir = pathlib.Path(__file__).parent.parent / "migrations"
    sql_files = sorted(migrations_dir.glob("*.sql"))
    for sql_file in sql_files:
        sql = sql_file.read_text()
        await conn.execute(sql)
        print(f"applied {sql_file.name}")
    await conn.close()


if __name__ == "__main__":
    asyncio.run(run_migrations())
