# Frontend Architecture

Azure Atlas features a reactive, single-page application (SPA) built with React 18, Vite, and TypeScript. It is designed for interactive exploration of the Azure ontology.

## Tech Stack

The following tools are used to build the frontend:

-   **React 18:** Functional components and hooks for building the UI.
-   **Vite:** A fast, modern build tool and development server.
-   **TypeScript:** Static typing for all components and data structures.
-   **React Flow (@xyflow/react):** The core library for rendering the interactive graph.
-   **TanStack Query:** Server-state management and asynchronous data fetching.

## Route Architecture

The frontend uses a client-side router with the following primary routes:

| Route | Page Component | Description |
| ----- | -------------- | ----------- |
| `/` | `WorldMapPage` | The main landing page listing all domains and learning journeys. |
| `/domains/:domainId` | `ConceptGraphPage` | An interactive graph view for a specific domain. |
| `/nodes/:nodeId` | `ConceptGraphPage` | A focused subgraph view centered on a specific node. |
| `/search` | `SearchPage` | Full-text search interface with filters. |
| `/journeys/:journeyId` | `JourneyPage` | A guided walkthrough of a specific learning journey. |

## Graph Visualization

The graph visualization is the heart of Azure Atlas. It is built using **React Flow** and incorporates several key features:

-   **Dagre Layout:** Automatic hierarchical layout calculation for clear graph presentation.
-   **Custom Nodes:** Specialized React components for rendering domain, service, and concept nodes.
-   **Dark Theme:** A sleek, slate-based dark theme optimized for technical documentation.
-   **Interactive Controls:** Zoom, pan, and mini-map for navigating complex graphs.

## State Management

Azure Atlas uses a clean separation between UI state and server state:

-   **Server State:** Managed by **TanStack Query**. It handles caching, background fetching, and synchronization with the FastAPI backend.
-   **UI State:** Managed by standard React hooks (`useState`, `useContext`). This includes current zoom levels, selected nodes, and search filters.

!!! tip "Performance"
    React Flow is highly optimized for performance, allowing Azure Atlas to render graphs with hundreds of nodes and edges without noticeable lag.
