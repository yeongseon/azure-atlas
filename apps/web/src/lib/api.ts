const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

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

export const api = {
  listDomains: () => apiFetch<{ domains: DomainSummary[] }>('/domains'),
  getDomain: (id: string) => apiFetch<DomainDetail>(`/domains/${id}`),
  getNode: (id: string) => apiFetch<NodeDetail>(`/nodes/${id}`),
  getSubgraph: (id: string, depth = 1) =>
    apiFetch<SubgraphResponse>(`/nodes/${id}/subgraph?depth=${depth}`),
  getEvidence: (id: string) =>
    apiFetch<{ node_id: string; evidence: EvidenceItem[] }>(`/nodes/${id}/evidence`),
  search: (q: string, limit = 20) =>
    apiFetch<SearchResponse>(`/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  listJourneys: () => apiFetch<{ journeys: JourneySummary[] }>('/journeys'),
  getJourney: (id: string) => apiFetch<JourneyDetail>(`/journeys/${id}`),
}
