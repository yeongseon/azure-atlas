# Ontology Overview

The Azure Atlas ontology is a structured knowledge map of Microsoft Azure services, concepts, and relationships. It is derived from official MS Learn documentation and provides a clear mental model for understanding the Azure ecosystem.

## Node Types

Nodes represent the fundamental entities within the ontology. Each node is classified by its role and level of abstraction:

| Node Type | Description | Example |
| --------- | ----------- | ------- |
| **domain** | High-level logical categories. | Network, Storage, Compute. |
| **service** | Discrete Azure service offerings. | Azure VNet, Blob Storage, Azure VM. |
| **concept** | Abstract architectural patterns or principles. | Hub and Spoke, Tiered Storage. |
| **feature** | Specific capabilities within a service. | VNet Peering, Lifecycle Management. |
| **resource** | Fundamental building blocks of services. | Subnet, NIC, NSG. |
| **mechanism** | How a specific task is accomplished. | Default Routing, Soft Delete. |
| **task** | Common user objectives or operations. | Create a VNet, Provision a VM. |
| **problem** | Common architectural challenges. | Network Latency, Data Redundancy. |
| **journey** | Curated step-by-step learning paths. | Zero-Trust Networking. |

## Relation Types

Edges define the relationships between nodes. Azure Atlas uses a rich set of relation types to model dependencies and interactions:

-   `belongs_to`: Part-whole hierarchy (e.g., Subnet belongs to VNet).
-   `contains`: Container-content relationship (e.g., Domain contains Services).
-   `attached_to`: Physical or logical attachment (e.g., NIC attached to VM).
-   `depends_on`: Direct functional dependency.
-   `prerequisite_for`: Ordering in a learning path or deployment.
-   `connects_to`: Network-level connectivity.
-   `routes_to`: Traffic flow direction.
-   `resolves_via`: Service resolution (e.g., DNS).
-   `secures`: Security relationship (e.g., NSG secures Subnet).
-   `monitors`: Observability relationship (e.g., Monitor monitors VM).
-   `alternative_to`: Competitive or alternative service options.
-   `related_to`: General conceptual association.

## Evidence Model

Every node and relationship in Azure Atlas is backed by **evidence**. Evidence consists of:

-   **Source URL:** Direct link to the official MS Learn documentation page.
-   **Excerpt:** A relevant text snippet from the documentation that supports the node's existence or relationship.
-   **Last Verified:** Timestamp indicating when the evidence was last checked for accuracy.

## Journey Model

Journeys provide a guided narrative through the ontology. They consist of ordered steps that lead a user from a high-level objective to a specific set of architectural components and tasks.

!!! tip "Ontology Growth"
    The Azure Atlas ontology is designed to be extensible. New domains and services can be added by contributing SQL seed files and documentation excerpts.
