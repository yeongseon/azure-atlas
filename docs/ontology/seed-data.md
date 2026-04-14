# Seed Data

Azure Atlas uses a declarative approach to populate the ontology. The content is stored in SQL seed files that can be applied to a fresh database or updated incrementally.

## Seed File Location

All seed data for the ontology is located in the `packages/ontology/` directory.

-   `seed_domains.sql`: Definitions for the high-level domains (Network, Storage, Compute).
-   `seed_nodes.sql`: Primary node definitions for each domain.
-   `seed_edges.sql`: Relationship mapping between nodes.
-   `seed_evidence.sql`: Links and excerpts from official MS Learn documentation.
-   `seed_journeys.sql`: Curated learning paths and steps.

## Applying Seeds

Seeds are applied using the `migrate.py` script provided in the backend. You can apply seeds directly from the root directory:

```bash
# Run migrations and apply all seeds
make migrate

# Apply only the ontology seeds (skip migrations)
python apps/api/scripts/migrate.py --seed-only
```

## Idempotency and Integrity

The seeding process is designed to be safe to run multiple times:

-   **Checksum-Based Skip:** The migration script calculates a checksum for each seed file. If the file has not changed, the script skips the seeding process for that file to save time.
-   **Upsert Operations:** SQL `INSERT ... ON CONFLICT DO UPDATE` statements are used to ensure that existing nodes and relationships are updated with the latest information rather than duplicated.

## Extending the Ontology

To add a new domain or extend an existing one:

1.  **Modify Seeds:** Add the new data to the appropriate `seed_*.sql` file in `packages/ontology/`.
2.  **Verify Relationships:** Ensure that any new edges point to existing node IDs to maintain referential integrity.
3.  **Run Seeding:** Execute `make reset-db` (for a fresh start) or `make migrate` (for an incremental update).

!!! tip "ID Naming Convention"
    Always use lower-case, hyphen-separated slugs for domain and node IDs (e.g., `virtual-network`, `blob-storage`) to ensure consistent URLs and query parameters.
