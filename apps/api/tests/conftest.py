import sys
from unittest.mock import MagicMock

for _mod in ("asyncpg", "arq", "arq.connections", "redis", "redis.asyncio"):
    sys.modules.setdefault(_mod, MagicMock())
