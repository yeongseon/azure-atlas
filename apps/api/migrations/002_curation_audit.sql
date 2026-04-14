BEGIN;

CREATE TABLE curation_decisions (
    decision_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id          TEXT REFERENCES nodes(node_id) ON DELETE CASCADE,
    edge_id          UUID REFERENCES edges(edge_id) ON DELETE CASCADE,
    evidence_id      UUID REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    decision         TEXT NOT NULL CHECK (decision IN ('approve', 'reject', 'needs_refresh')),
    new_status       content_status_enum NOT NULL,
    reviewer_note    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT curation_decisions_at_least_one CHECK (
        node_id IS NOT NULL OR edge_id IS NOT NULL OR evidence_id IS NOT NULL
    )
);

CREATE INDEX curation_decisions_node_id_idx ON curation_decisions(node_id);
CREATE INDEX curation_decisions_edge_id_idx ON curation_decisions(edge_id);
CREATE INDEX curation_decisions_evidence_id_idx ON curation_decisions(evidence_id);
CREATE INDEX curation_decisions_created_at_idx ON curation_decisions(created_at DESC);

COMMIT;
