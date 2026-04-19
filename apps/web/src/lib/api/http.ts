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

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    public readonly body?: string,
  ) {
    super(`API error ${status}: ${path}`)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`)
  } catch (err) {
    throw new ApiError(0, path, err instanceof Error ? err.message : 'Network error')
  }
  if (!res.ok) {
    let body: string | undefined
    try {
      body = await res.text()
    } catch {
      // ignore body read failure
    }
    throw new ApiError(res.status, path, body)
  }
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
