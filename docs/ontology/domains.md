# Domains

Azure Atlas is organized into high-level domains, each representing a core area of the Microsoft Azure ecosystem. Currently, the ontology includes three comprehensive domains.

## Domain Overview

Each domain consists of a structured hierarchy of nodes, ranging from fundamental concepts to specific service features and mechanisms.

### 1. Network Domain (43 nodes)

The Network domain covers the foundational connectivity and security services in Azure. It models the relationships between virtual networks, subnets, and traffic control mechanisms.

-   **Key Services:** Azure Virtual Network, Azure Load Balancer, Azure DNS, NSGs.
-   **Core Concepts:** Hub-and-Spoke topology, VNet Peering, Private Link, Service Endpoints.
-   **Relationships:** Connectivity (`connects_to`), routing (`routes_to`), and security (`secures`).

### 2. Storage Domain (46 nodes)

The Storage domain explores the various data persistence and management services available in Azure. It focuses on scalability, redundancy, and access patterns.

-   **Key Services:** Blob Storage, Azure Files, Queue Storage, Table Storage.
-   **Core Concepts:** Storage Tiers (Hot/Cool/Archive), Redundancy (LRS/GRS/ZRS), Soft Delete, Lifecycle Management.
-   **Relationships:** Data flow (`contains`), replication (`depends_on`), and access control (`secures`).

### 3. Compute Domain (48 nodes)

The Compute domain centers on Virtual Machines and their associated infrastructure. It provides a detailed map of how VMs are provisioned, managed, and connected.

-   **Key Services:** Azure Virtual Machines, VM Scale Sets, Disk Storage, Network Interfaces.
-   **Core Concepts:** Availability Sets, Proximity Placement Groups, VM Extensions, OS Images.
-   **Relationships:** Attachment (`attached_to`), provisioning (`depends_on`), and configuration (`contains`).

## Statistics Table

The following table provides a breakdown of the ontology's current scope:

| Domain | Nodes | Edges | Evidence | Journeys |
| ------ | ----- | ----- | -------- | -------- |
| **Network** | 43 | 94 | 172 | 9 |
| **Storage** | 46 | 81 | 184 | 8 |
| **Compute** | 48 | 84 | 192 | 8 |
| **Total** | **137** | **259** | **548** | **25** |

!!! tip "Dynamic Updates"
    Statistics are updated automatically as new seed files are applied or when the ontology is extended via the curation API.
