export const queryKeys = {
  domains: () => ['domains'] as const,
  domain: (id: string) => ['domain', id] as const,
  node: (id: string) => ['node', id] as const,
  subgraph: (id: string, depth: number, relationTypes?: string[]) =>
    ['subgraph', id, depth, relationTypes ?? []] as const,
  evidence: (id: string) => ['evidence', id] as const,
  search: (q: string, limit: number) => ['search', q, limit] as const,
  journeys: () => ['journeys'] as const,
  journey: (id: string) => ['journey', id] as const,
}
