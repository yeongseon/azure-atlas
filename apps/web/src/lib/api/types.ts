export interface NodePreview {
  node_id: string
  label: string
  node_type: string
  summary: string | null
  evidence_count?: number
}

export interface DomainSummary {
  domain_id: string
  label: string
  description: string | null
  icon_url: string | null
  display_order: number
}

export interface EdgeSummary {
  edge_id: string
  source_id: string
  target_id: string
  relation_type: string
  weight: number
}

export interface DomainDetail {
  domain: DomainSummary
  nodes: (NodePreview & { evidence_count: number })[]
  edges: EdgeSummary[]
  node_count: number
}

export interface NodeDetail {
  node: NodePreview & { domain_id: string; detail_md: string | null }
}

export interface SubgraphResponse {
  center_node_id: string
  nodes: (NodePreview & { evidence_count: number })[]
  edges: EdgeSummary[]
}

export interface EvidenceItem {
  evidence_id: string
  node_id: string
  excerpt: string
  source_url: string | null
  source_title: string | null
  confidence_score: number | null
}

export interface SearchResponse {
  query: string
  results: NodePreview[]
  total: number
}

export interface JourneySummary {
  journey_id: string
  domain_id: string | null
  title: string
  description: string | null
}

export interface JourneyStep {
  step_order: number
  node_id: string
  label: string
  narrative: string | null
}

export interface JourneyDetail {
  journey: JourneySummary
  steps: JourneyStep[]
}

export interface ApiClient {
  listDomains(): Promise<{ domains: DomainSummary[] }>
  getDomain(id: string): Promise<DomainDetail>
  getNode(id: string): Promise<NodeDetail>
  getSubgraph(id: string, depth?: number, relationTypes?: string[]): Promise<SubgraphResponse>
  getEvidence(id: string): Promise<{ node_id: string; evidence: EvidenceItem[] }>
  search(q: string, limit?: number, nodeType?: string): Promise<SearchResponse>
  listJourneys(): Promise<{ journeys: JourneySummary[] }>
  getJourney(id: string): Promise<JourneyDetail>
}
