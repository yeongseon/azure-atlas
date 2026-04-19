-- Azure Atlas — ontology expansion
-- Expand node types, relation types, add semantic layer metadata

BEGIN;

-- ─── Expand relation_type_enum ───────────────────────────────────────────────
-- Add new relation types for ontology strategy
ALTER TYPE relation_type_enum ADD VALUE IF NOT EXISTS 'is_a';
ALTER TYPE relation_type_enum ADD VALUE IF NOT EXISTS 'part_of';
ALTER TYPE relation_type_enum ADD VALUE IF NOT EXISTS 'implements';
ALTER TYPE relation_type_enum ADD VALUE IF NOT EXISTS 'used_in';
ALTER TYPE relation_type_enum ADD VALUE IF NOT EXISTS 'precedes';
ALTER TYPE relation_type_enum ADD VALUE IF NOT EXISTS 'explained_by';

COMMIT;

-- NOTE: ALTER TYPE ADD VALUE cannot run inside a transaction in some PG versions.
-- If the above fails, run each ALTER TYPE outside a transaction block.

BEGIN;

-- ─── Add semantic layer and view hints to nodes ─────────────────────────────
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS semantic_layer TEXT
    CHECK (semantic_layer IN ('upper', 'middle', 'lower'));

ALTER TABLE nodes ADD COLUMN IF NOT EXISTS view_hints JSONB NOT NULL DEFAULT '{}';

-- ─── Create node_type reference table ────────────────────────────────────────
-- Using a reference table instead of enum for flexibility
CREATE TABLE IF NOT EXISTS node_types (
    node_type    TEXT PRIMARY KEY,
    label        TEXT NOT NULL,
    semantic_layer TEXT NOT NULL CHECK (semantic_layer IN ('upper', 'middle', 'lower')),
    description  TEXT,
    icon         TEXT,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- Seed the 11 ontology node types
INSERT INTO node_types (node_type, label, semantic_layer, description, display_order) VALUES
    ('domain',     'Domain',     'middle', 'Top-level Azure domain (e.g. Network, Storage, Compute)', 1),
    ('subdomain',  'Subdomain',  'middle', 'Logical grouping within a domain', 2),
    ('service',    'Service',    'middle', 'Azure service or product', 3),
    ('resource',   'Resource',   'middle', 'Azure resource type managed by a service', 4),
    ('concept',    'Concept',    'middle', 'Abstract concept or technology pattern', 5),
    ('principle',  'Principle',  'upper',  'Design principle or best practice guideline', 6),
    ('pattern',    'Pattern',    'upper',  'Architecture or implementation pattern', 7),
    ('decision',   'Decision',   'upper',  'Architecture decision record or design choice', 8),
    ('journey',    'Journey',    'lower',  'Curated learning or implementation journey', 9),
    ('step',       'Step',       'lower',  'Individual step within a journey', 10),
    ('evidence',   'Evidence',   'lower',  'Supporting evidence from documentation', 11)
ON CONFLICT (node_type) DO NOTHING;

-- ─── Backfill semantic_layer based on existing node_type values ──────────────
UPDATE nodes SET semantic_layer = 'middle'
    WHERE semantic_layer IS NULL AND node_type IN ('service', 'concept', 'feature');
UPDATE nodes SET semantic_layer = 'upper'
    WHERE semantic_layer IS NULL AND node_type = 'pattern';
-- Default any remaining to 'middle'
UPDATE nodes SET semantic_layer = 'middle'
    WHERE semantic_layer IS NULL;

-- ─── Index for semantic layer queries ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS nodes_semantic_layer_idx ON nodes(semantic_layer);
CREATE INDEX IF NOT EXISTS nodes_node_type_idx ON nodes(node_type);
CREATE INDEX IF NOT EXISTS nodes_view_hints_idx ON nodes USING GIN(view_hints);

COMMIT;
