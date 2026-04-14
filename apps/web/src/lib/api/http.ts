import type {
  ApiClient,
  DomainDetail,
  DomainSummary,
  EvidenceItem,
  JourneyDetail,
  JourneySummary,
  NodeDetail,
  SearchResponse,
  SubgraphResponse,
  UnifiedGraphResponse,
} from './types'

const BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export function createHttpClient(): ApiClient {
  return {
    listDomains: () => apiFetch<{ domains: DomainSummary[] }>('/domains'),
    getDomain: (id: string) => apiFetch<DomainDetail>(`/domains/${id}`),
    getAllGraph: () => apiFetch<UnifiedGraphResponse>('/graph'),
    getNode: (id: string) => apiFetch<NodeDetail>(`/nodes/${id}`),
    getSubgraph: (id: string, depth = 1, relationTypes?: string[]) => {
      const params = new URLSearchParams({ depth: String(depth) })
      if (relationTypes?.length) {
        relationTypes.forEach(type => {
          params.append('relation_types', type)
        })
      }
      return apiFetch<SubgraphResponse>(`/nodes/${id}/subgraph?${params}`)
    },
    getEvidence: (id: string) =>
      apiFetch<{ node_id: string; evidence: EvidenceItem[] }>(`/nodes/${id}/evidence`),
    search: (q: string, limit = 20, nodeType?: string) => {
      const params = new URLSearchParams({ q, limit: String(limit) })
      if (nodeType) params.set('node_type', nodeType)
      return apiFetch<SearchResponse>(`/search?${params}`)
    },
    listJourneys: () => apiFetch<{ journeys: JourneySummary[] }>('/journeys'),
    getJourney: (id: string) => apiFetch<JourneyDetail>(`/journeys/${id}`),
  }
}
