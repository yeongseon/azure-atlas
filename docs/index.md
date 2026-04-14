# Azure Atlas

**Explore Azure as a knowledge map — ontology-based navigation for MS Learn.**

Azure Atlas transforms fragmented documentation into a structured, interconnected graph. It allows users to navigate the Azure ecosystem through conceptual relationships, moving from high-level domains down to specific service mechanisms and features.

---

<div class="grid cards" markdown>

-   :material-graph: __Ontology-Driven__
    
    Built on a robust ontology mapping Azure services, concepts, and relationships derived from official MS Learn documentation.

-   :material-map-search: __Interactive Exploration__
    
    Visualize complex service dependencies and architectural patterns through dynamic graph visualizations powered by React Flow.

-   :material-database-eye: __Evidence-Backed__
    
    Every node and relationship in the map is backed by excerpts and direct links to official Microsoft documentation.

-   :material-map-marker-path: __Curated Journeys__
    
    Follow step-by-step learning paths for common scenarios, from basic networking to complex VM deployments.

</div>

---

## Quick Navigation

<div class="grid cards" markdown>

-   [:material-rocket-launch: **Getting Started**](getting-started/quickstart.md)
    
    Set up Azure Atlas locally in minutes using our bootstrap scripts and containerized environment.

-   [:material-office-building: **Architecture**](architecture/overview.md)
    
    Deep dive into the FastAPI backend, PostgreSQL schema, and React frontend architecture.

-   [:material-account-group: **Contributing**](contributing.md)
    
    Learn how to add new domains, improve the ontology, or contribute to the codebase.

</div>

!!! tip "FastAPI Powered"
    Azure Atlas uses a high-performance FastAPI backend with an asynchronous PostgreSQL driver for lightning-fast graph traversals.
