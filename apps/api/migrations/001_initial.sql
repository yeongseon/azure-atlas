-- Azure Atlas — initial schema
-- PostgreSQL 16, extensions: pg_trgm

BEGIN;

-- ─── extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── enums ────────────────────────────────────────────────────────────────────
CREATE TYPE content_status_enum AS ENUM (
    'draft',
    'reviewed',
    'approved',
    'rejected',
    'needs_refresh'
);

CREATE TYPE relation_type_enum AS ENUM (
    'belongs_to',
    'contains',
    'attached_to',
    'depends_on',
    'prerequisite_for',
    'connects_to',
    'routes_to',
    'resolves_via',
    'secures',
    'monitors',
    'alternative_to',
    'related_to'
);

-- ─── domains ──────────────────────────────────────────────────────────────────
CREATE TABLE domains (
    domain_id        TEXT PRIMARY KEY,
    label            TEXT NOT NULL,
    description      TEXT,
    icon_url         TEXT,
    display_order    INTEGER NOT NULL DEFAULT 0,
    status           content_status_enum NOT NULL DEFAULT 'draft',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── nodes ────────────────────────────────────────────────────────────────────
CREATE TABLE nodes (
    node_id          TEXT PRIMARY KEY,
    domain_id        TEXT NOT NULL REFERENCES domains(domain_id) ON DELETE RESTRICT,
    label            TEXT NOT NULL,
    node_type        TEXT NOT NULL,
    summary          TEXT,
    detail_md        TEXT,
    status           content_status_enum NOT NULL DEFAULT 'draft',
    search_tsv       TSVECTOR GENERATED ALWAYS AS (
                         to_tsvector('english', coalesce(label, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(detail_md, ''))
                     ) STORED,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX nodes_domain_id_idx ON nodes(domain_id);
CREATE INDEX nodes_status_idx    ON nodes(status);
CREATE INDEX nodes_search_tsv_idx ON nodes USING GIN(search_tsv);
CREATE INDEX nodes_label_trgm_idx ON nodes USING GIN(label gin_trgm_ops);

-- ─── edges ────────────────────────────────────────────────────────────────────
CREATE TABLE edges (
    edge_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id        TEXT NOT NULL REFERENCES nodes(node_id) ON DELETE CASCADE,
    target_id        TEXT NOT NULL REFERENCES nodes(node_id) ON DELETE CASCADE,
    relation_type    relation_type_enum NOT NULL,
    weight           NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    status           content_status_enum NOT NULL DEFAULT 'draft',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT edges_no_self_loop CHECK (source_id <> target_id)
);

CREATE INDEX edges_source_idx ON edges(source_id);
CREATE INDEX edges_target_idx ON edges(target_id);
CREATE UNIQUE INDEX edges_unique_pair_idx ON edges(source_id, target_id, relation_type);

-- ─── cycle prevention for DAG relation types ──────────────────────────────────
CREATE OR REPLACE FUNCTION prevent_edge_cycles()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    dag_types relation_type_enum[] := ARRAY[
        'contains', 'belongs_to', 'depends_on', 'prerequisite_for'
    ]::relation_type_enum[];
BEGIN
    IF NEW.relation_type = ANY(dag_types) THEN
        IF EXISTS (
            WITH RECURSIVE ancestry(nid) AS (
                SELECT NEW.target_id
                UNION ALL
                SELECT e.target_id
                FROM edges e
                JOIN ancestry a ON e.source_id = a.nid
                WHERE e.relation_type = ANY(dag_types)
            )
            SELECT 1 FROM ancestry WHERE nid = NEW.source_id
        ) THEN
            RAISE EXCEPTION 'edge would create a cycle (source=%, target=%, type=%)',
                NEW.source_id, NEW.target_id, NEW.relation_type;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_edge_cycles
BEFORE INSERT OR UPDATE ON edges
FOR EACH ROW EXECUTE FUNCTION prevent_edge_cycles();

-- ─── evidence ─────────────────────────────────────────────────────────────────
CREATE TABLE evidence (
    evidence_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id           TEXT NOT NULL REFERENCES nodes(node_id) ON DELETE CASCADE,
    excerpt           TEXT NOT NULL,
    source_url        TEXT,
    source_title      TEXT,
    confidence_score  NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    status            content_status_enum NOT NULL DEFAULT 'draft',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX evidence_node_id_idx ON evidence(node_id);
CREATE INDEX evidence_status_idx  ON evidence(status);

-- ─── provenance ───────────────────────────────────────────────────────────────
CREATE TABLE provenance (
    provenance_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_id      UUID NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    pipeline_run_id  TEXT,
    fetched_at       TIMESTAMPTZ,
    parsed_at        TIMESTAMPTZ,
    published_at     TIMESTAMPTZ,
    raw_chunk_hash   TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX provenance_evidence_id_idx ON provenance(evidence_id);

-- ─── journeys ─────────────────────────────────────────────────────────────────
CREATE TABLE journeys (
    journey_id       TEXT PRIMARY KEY,
    domain_id        TEXT REFERENCES domains(domain_id) ON DELETE SET NULL,
    title            TEXT NOT NULL,
    description      TEXT,
    status           content_status_enum NOT NULL DEFAULT 'draft',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX journeys_domain_id_idx ON journeys(domain_id);

-- ─── journey_steps ────────────────────────────────────────────────────────────
CREATE TABLE journey_steps (
    step_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id       TEXT NOT NULL REFERENCES journeys(journey_id) ON DELETE CASCADE,
    node_id          TEXT NOT NULL REFERENCES nodes(node_id) ON DELETE CASCADE,
    step_order       INTEGER NOT NULL,
    narrative        TEXT,
    CONSTRAINT journey_steps_unique_order UNIQUE (journey_id, step_order)
);

CREATE INDEX journey_steps_journey_id_idx ON journey_steps(journey_id);

-- ─── events ───────────────────────────────────────────────────────────────────
CREATE TABLE events (
    event_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type       TEXT NOT NULL,
    payload          JSONB,
    session_id       TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX events_event_type_idx ON events(event_type);
CREATE INDEX events_created_at_idx ON events(created_at DESC);

COMMIT;
