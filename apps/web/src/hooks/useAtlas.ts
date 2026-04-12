import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'

export function useDomains() {
  return useQuery({
    queryKey: queryKeys.domains(),
    queryFn: () => api.listDomains(),
  })
}

export function useDomain(id: string) {
  return useQuery({
    queryKey: queryKeys.domain(id),
    queryFn: () => api.getDomain(id),
    enabled: !!id,
  })
}

export function useNode(id: string) {
  return useQuery({
    queryKey: queryKeys.node(id),
    queryFn: () => api.getNode(id),
    enabled: !!id,
  })
}

export function useSubgraph(id: string, depth = 1) {
  return useQuery({
    queryKey: queryKeys.subgraph(id, depth),
    queryFn: () => api.getSubgraph(id, depth),
    enabled: !!id,
  })
}

export function useEvidence(id: string) {
  return useQuery({
    queryKey: queryKeys.evidence(id),
    queryFn: () => api.getEvidence(id),
    enabled: !!id,
  })
}

export function useSearch(q: string, limit = 20) {
  return useQuery({
    queryKey: queryKeys.search(q, limit),
    queryFn: () => api.search(q, limit),
    enabled: q.trim().length > 0,
  })
}

export function useJourneys() {
  return useQuery({
    queryKey: queryKeys.journeys(),
    queryFn: () => api.listJourneys(),
  })
}

export function useJourney(id: string) {
  return useQuery({
    queryKey: queryKeys.journey(id),
    queryFn: () => api.getJourney(id),
    enabled: !!id,
  })
}
