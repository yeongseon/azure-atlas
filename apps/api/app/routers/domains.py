from fastapi import APIRouter, HTTPException

from app.db import get_pool
from app.models.domains import DomainDetailResponse, DomainListResponse, DomainSummary
from app.models.nodes import GraphEdgeSummary, GraphNodeSummary

router = APIRouter(prefix="/domains", tags=["domains"])


@router.get("")
async def list_domains() -> DomainListResponse:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT domain_id, label, description, icon_url, display_order
            FROM domains
            WHERE status = 'approved'
            ORDER BY display_order, label
            """
        )
    return DomainListResponse(domains=[DomainSummary(**dict(row)) for row in rows])


@router.get("/{domain_id}")
async def get_domain(domain_id: str) -> DomainDetailResponse:
    pool = await get_pool()
    async with pool.acquire() as conn:
        domain = await conn.fetchrow(
            """
            SELECT domain_id, label, description, icon_url
            FROM domains
            WHERE domain_id = $1 AND status = 'approved'
            """,
            domain_id,
        )
        if not domain:
            raise HTTPException(status_code=404, detail="Domain not found")

        nodes = await conn.fetch(
            """
            SELECT node_id, label, node_type, summary
            FROM nodes
            WHERE domain_id = $1 AND status = 'approved'
            ORDER BY label
            """,
            domain_id,
        )
        edges = await conn.fetch(
            """
            SELECT e.edge_id::text, e.source_id, e.target_id,
                   e.relation_type::text, e.weight
            FROM edges e
            JOIN nodes src ON src.node_id = e.source_id AND src.status = 'approved'
            JOIN nodes tgt ON tgt.node_id = e.target_id AND tgt.status = 'approved'
            WHERE src.domain_id = $1 AND e.status = 'approved'
            """,
            domain_id,
        )
        ev_counts = await conn.fetch(
            """
            SELECT n.node_id, COUNT(ev.evidence_id)::int AS evidence_count
            FROM nodes n
            LEFT JOIN evidence ev ON ev.node_id = n.node_id AND ev.status = 'approved'
            WHERE n.domain_id = $1 AND n.status = 'approved'
            GROUP BY n.node_id
            """,
            domain_id,
        )

    ec_map = {r["node_id"]: r["evidence_count"] for r in ev_counts}
    node_list_typed = [
        GraphNodeSummary(**{**dict(node), "evidence_count": ec_map.get(node["node_id"], 0)})
        for node in nodes
    ]
    edge_list_typed = [GraphEdgeSummary(**dict(edge)) for edge in edges]
    return DomainDetailResponse(
        domain=DomainSummary(**dict(domain)),
        nodes=node_list_typed,
        edges=edge_list_typed,
        node_count=len(node_list_typed),
    )
