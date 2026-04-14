from fastapi import APIRouter

from app.db import get_pool
from app.models.graph import UnifiedGraphNode, UnifiedGraphResponse
from app.models.nodes import GraphEdgeSummary

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("")
async def get_graph() -> UnifiedGraphResponse:
    pool = await get_pool()
    async with pool.acquire() as conn:
        nodes = await conn.fetch(
            """
            SELECT n.node_id, n.domain_id, n.label, n.node_type, n.summary,
                   COUNT(ev.evidence_id)::int AS evidence_count
            FROM nodes n
            LEFT JOIN evidence ev ON ev.node_id = n.node_id AND ev.status = 'approved'
            WHERE n.status = 'approved'
            GROUP BY n.node_id, n.domain_id, n.label, n.node_type, n.summary
            ORDER BY n.domain_id, n.label
            """
        )
        edges = await conn.fetch(
            """
            SELECT e.edge_id::text, e.source_id, e.target_id,
                   e.relation_type::text, e.weight
            FROM edges e
            JOIN nodes src ON src.node_id = e.source_id AND src.status = 'approved'
            JOIN nodes tgt ON tgt.node_id = e.target_id AND tgt.status = 'approved'
            WHERE e.status = 'approved'
            """
        )
        domain_count = await conn.fetchval(
            "SELECT COUNT(*)::int FROM domains WHERE status = 'approved'"
        )

    node_list_typed = [UnifiedGraphNode(**dict(node)) for node in nodes]
    edge_list_typed = [GraphEdgeSummary(**dict(edge)) for edge in edges]
    return UnifiedGraphResponse(
        nodes=node_list_typed,
        edges=edge_list_typed,
        domain_count=domain_count,
        node_count=len(node_list_typed),
    )
