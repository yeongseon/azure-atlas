from fastapi import APIRouter, Query

from app.db import get_pool
from app.models.graph import UnifiedGraphNode, UnifiedGraphResponse
from app.models.nodes import GraphEdgeSummary

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("")
async def get_graph(
    domain_id: str | None = Query(default=None, description="Filter by domain"),
    limit: int = Query(default=200, ge=1, le=1000, description="Max nodes to return"),
    offset: int = Query(default=0, ge=0, description="Pagination offset"),
) -> UnifiedGraphResponse:
    pool = await get_pool()
    async with pool.acquire() as conn:
        if domain_id:
            nodes = await conn.fetch(
                """
                SELECT n.node_id, n.domain_id, n.label, n.node_type, n.summary,
                       n.semantic_layer,
                       COUNT(ev.evidence_id)::int AS evidence_count
                FROM nodes n
                LEFT JOIN evidence ev ON ev.node_id = n.node_id AND ev.status = 'approved'
                WHERE n.status = 'approved'
                  AND n.domain_id = $1
                GROUP BY n.node_id, n.domain_id, n.label, n.node_type, n.summary, n.semantic_layer
                ORDER BY n.domain_id, n.label
                LIMIT $2 OFFSET $3
                """,
                domain_id,
                limit,
                offset,
            )
            # Edges only for the returned node set
            node_ids = [r["node_id"] for r in nodes]
            edges = await conn.fetch(
                """
                SELECT e.edge_id::text, e.source_id, e.target_id,
                       e.relation_type::text, e.weight
                FROM edges e
                JOIN nodes src ON src.node_id = e.source_id AND src.status = 'approved'
                JOIN nodes tgt ON tgt.node_id = e.target_id AND tgt.status = 'approved'
                WHERE e.status = 'approved'
                  AND e.source_id = ANY($1::text[])
                  AND e.target_id = ANY($1::text[])
                """,
                node_ids,
            )
        else:
            nodes = await conn.fetch(
                """
                SELECT n.node_id, n.domain_id, n.label, n.node_type, n.summary,
                       n.semantic_layer,
                       COUNT(ev.evidence_id)::int AS evidence_count
                FROM nodes n
                LEFT JOIN evidence ev ON ev.node_id = n.node_id AND ev.status = 'approved'
                WHERE n.status = 'approved'
                GROUP BY n.node_id, n.domain_id, n.label, n.node_type, n.summary, n.semantic_layer
                ORDER BY n.domain_id, n.label
                LIMIT $1 OFFSET $2
                """,
                limit,
                offset,
            )
            node_ids = [r["node_id"] for r in nodes]
            edges = await conn.fetch(
                """
                SELECT e.edge_id::text, e.source_id, e.target_id,
                       e.relation_type::text, e.weight
                FROM edges e
                JOIN nodes src ON src.node_id = e.source_id AND src.status = 'approved'
                JOIN nodes tgt ON tgt.node_id = e.target_id AND tgt.status = 'approved'
                WHERE e.status = 'approved'
                  AND e.source_id = ANY($1::text[])
                  AND e.target_id = ANY($1::text[])
                """,
                node_ids,
            )
        domain_count = await conn.fetchval(
            "SELECT COUNT(*)::int FROM domains WHERE status = 'approved'"
        )
        total_nodes = await conn.fetchval(
            "SELECT COUNT(*)::int FROM nodes WHERE status = 'approved'"
        )

    node_list_typed = [UnifiedGraphNode(**dict(node)) for node in nodes]
    edge_list_typed = [GraphEdgeSummary(**dict(edge)) for edge in edges]
    return UnifiedGraphResponse(
        nodes=node_list_typed,
        edges=edge_list_typed,
        domain_count=domain_count,
        node_count=len(node_list_typed),
        total_nodes=total_nodes,
        limit=limit,
        offset=offset,
    )
