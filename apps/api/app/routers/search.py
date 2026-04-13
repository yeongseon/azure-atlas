from fastapi import APIRouter, Query

from app.db import get_pool
from app.models.nodes import NodePreview
from app.models.search import SearchResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
async def search(
    q: str = Query(default="", min_length=1),
    node_type: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
) -> SearchResponse:
    pool = await get_pool()
    q = q.strip()
    if not q:
        return SearchResponse(query=q, results=[], total=0)

    async with pool.acquire() as conn:
        base_filter = "n.status = 'approved'"
        params: list = [q, limit]

        type_clause = ""
        if node_type:
            type_clause = " AND n.node_type = $3"
            params.append(node_type)

        rows = await conn.fetch(
            f"""
            SELECT
                n.node_id,
                n.label,
                n.node_type,
                n.summary,
                ts_rank(n.search_tsv, websearch_to_tsquery('english', $1)) AS fts_rank,
                similarity(n.label, $1) AS trgm_rank
            FROM nodes n
            WHERE {base_filter}{type_clause}
              AND (
                  n.search_tsv @@ websearch_to_tsquery('english', $1)
                  OR n.label % $1
              )
            ORDER BY fts_rank DESC, trgm_rank DESC
            LIMIT $2
            """,
            *params,
        )

    results = [
        NodePreview(
            node_id=row["node_id"],
            label=row["label"],
            node_type=row["node_type"],
            summary=row["summary"],
        )
        for row in rows
    ]
    return SearchResponse(query=q, results=results, total=len(results))
