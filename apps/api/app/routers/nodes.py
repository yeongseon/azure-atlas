from fastapi import APIRouter, HTTPException, Query

from app.db import get_pool

router = APIRouter(prefix="/nodes", tags=["nodes"])


@router.get("/{node_id}")
async def get_node(node_id: str) -> dict:
    pool = await get_pool()
    async with pool.acquire() as conn:
        node = await conn.fetchrow(
            """
            SELECT n.node_id, n.domain_id, n.label, n.node_type, n.summary, n.detail_md
            FROM nodes n
            WHERE n.node_id = $1 AND n.status = 'approved'
            """,
            node_id,
        )
        if not node:
            raise HTTPException(status_code=404, detail="Node not found")
    return {"node": dict(node)}


@router.get("/{node_id}/subgraph")
async def get_node_subgraph(
    node_id: str,
    depth: int = Query(default=1, ge=1, le=3),
    relation_types: list[str] | None = Query(default=None),
) -> dict:
    pool = await get_pool()
    async with pool.acquire() as conn:
        exists = await conn.fetchval(
            "SELECT 1 FROM nodes WHERE node_id = $1 AND status = 'approved'", node_id
        )
        if not exists:
            raise HTTPException(status_code=404, detail="Node not found")

        visited_nodes: set[str] = {node_id}
        frontier: set[str] = {node_id}

        for _ in range(depth):
            if not frontier:
                break
            frontier_list = list(frontier)
            if relation_types:
                neighbor_rows = await conn.fetch(
                    """
                    SELECT DISTINCT
                        CASE WHEN e.source_id = ANY($1::text[]) THEN e.target_id
                             ELSE e.source_id END AS neighbor_id
                    FROM edges e
                    JOIN nodes n ON n.node_id = (
                        CASE WHEN e.source_id = ANY($1::text[]) THEN e.target_id
                             ELSE e.source_id END
                    ) AND n.status = 'approved'
                    WHERE (e.source_id = ANY($1::text[]) OR e.target_id = ANY($1::text[]))
                      AND e.status = 'approved'
                      AND e.relation_type::text = ANY($2::text[])
                    """,
                    frontier_list,
                    relation_types,
                )
            else:
                neighbor_rows = await conn.fetch(
                    """
                    SELECT DISTINCT
                        CASE WHEN e.source_id = ANY($1::text[]) THEN e.target_id
                             ELSE e.source_id END AS neighbor_id
                    FROM edges e
                    JOIN nodes n ON n.node_id = (
                        CASE WHEN e.source_id = ANY($1::text[]) THEN e.target_id
                             ELSE e.source_id END
                    ) AND n.status = 'approved'
                    WHERE (e.source_id = ANY($1::text[]) OR e.target_id = ANY($1::text[]))
                      AND e.status = 'approved'
                    """,
                    frontier_list,
                )
            new_neighbors = {r["neighbor_id"] for r in neighbor_rows} - visited_nodes
            visited_nodes |= new_neighbors
            frontier = new_neighbors

        all_node_ids = list(visited_nodes)
        nodes = await conn.fetch(
            """
            SELECT node_id, label, node_type, summary,
                   (SELECT COUNT(*) FROM evidence ev
                    WHERE ev.node_id = n.node_id AND ev.status = 'approved')::int AS evidence_count
            FROM nodes n
            WHERE node_id = ANY($1::text[]) AND status = 'approved'
            """,
            all_node_ids,
        )
        edge_query = """
            SELECT edge_id::text, source_id, target_id, relation_type::text, weight
            FROM edges
            WHERE source_id = ANY($1::text[]) AND target_id = ANY($1::text[])
              AND status = 'approved'
        """
        if relation_types:
            edges = await conn.fetch(
                edge_query + " AND relation_type::text = ANY($2::text[])",
                all_node_ids,
                relation_types,
            )
        else:
            edges = await conn.fetch(edge_query, all_node_ids)

    return {
        "center_node_id": node_id,
        "nodes": [dict(n) for n in nodes],
        "edges": [dict(e) for e in edges],
    }


@router.get("/{node_id}/evidence")
async def get_node_evidence(node_id: str) -> dict:
    pool = await get_pool()
    async with pool.acquire() as conn:
        exists = await conn.fetchval(
            "SELECT 1 FROM nodes WHERE node_id = $1 AND status = 'approved'", node_id
        )
        if not exists:
            raise HTTPException(status_code=404, detail="Node not found")

        rows = await conn.fetch(
            """
            SELECT evidence_id::text, node_id, excerpt, source_url,
                   source_title, confidence_score
            FROM evidence
            WHERE node_id = $1 AND status = 'approved'
            ORDER BY confidence_score DESC NULLS LAST
            """,
            node_id,
        )
    return {"node_id": node_id, "evidence": [dict(r) for r in rows]}
