import type { LoadedAtlasDataset } from './dataset'
import { loadAtlasDataset } from './dataset'
import { searchNodes } from './search'
import { computeSubgraph } from './subgraph'
import type {
  ApiClient,
  DomainDetail,
  JourneyDetail,
  NodeDetail,
  NodePreview,
  SearchResponse,
} from './types'

function toNodePreview(dataset: LoadedAtlasDataset, nodeId: string): NodePreview & { evidence_count: number }
function toNodePreview(dataset: LoadedAtlasDataset, nodeId: string, includeEvidenceCount: false): NodePreview
function toNodePreview(
  dataset: LoadedAtlasDataset,
  nodeId: string,
  includeEvidenceCount = true,
): NodePreview | (NodePreview & { evidence_count: number }) {
  const node = dataset.nodesById.get(nodeId)
  if (!node) throw new Error(`API error 404: /nodes/${nodeId}`)

  const preview: NodePreview = {
    node_id: node.node_id,
    label: node.label,
    node_type: node.node_type,
    summary: node.summary,
  }

  if (!includeEvidenceCount) {
    return preview
  }

  return {
    ...preview,
    evidence_count: dataset.evidenceCountByNodeId.get(node.node_id) ?? 0,
  }
}

function requireDomain(dataset: LoadedAtlasDataset, domainId: string) {
  const domain = dataset.domains.find(item => item.domain_id === domainId)
  if (!domain) throw new Error(`API error 404: /domains/${domainId}`)
  return domain
}

function requireJourney(dataset: LoadedAtlasDataset, journeyId: string) {
  const journey = dataset.journeys.find(item => item.journey_id === journeyId)
  if (!journey) throw new Error(`API error 404: /journeys/${journeyId}`)
  return journey
}

function buildDomainDetail(dataset: LoadedAtlasDataset, domainId: string): DomainDetail {
  const domain = requireDomain(dataset, domainId)
  const nodes = dataset.nodes
    .filter(node => node.domain_id === domainId)
    .map(node => toNodePreview(dataset, node.node_id))
  const nodeIds = new Set(nodes.map(node => node.node_id))
  const edges = dataset.edges.filter(
    edge => nodeIds.has(edge.source_id) && nodeIds.has(edge.target_id),
  )

  return {
    domain,
    nodes,
    edges,
    node_count: nodes.length,
  }
}

function buildNodeDetail(dataset: LoadedAtlasDataset, nodeId: string): NodeDetail {
  const node = dataset.nodesById.get(nodeId)
  if (!node) throw new Error(`API error 404: /nodes/${nodeId}`)

  return {
    node: {
      node_id: node.node_id,
      domain_id: node.domain_id,
      label: node.label,
      node_type: node.node_type,
      summary: node.summary,
      detail_md: node.detail_md,
    },
  }
}

function buildJourneyDetail(dataset: LoadedAtlasDataset, journeyId: string): JourneyDetail {
  const journey = requireJourney(dataset, journeyId)
  return {
    journey,
    steps: dataset.journeyStepsById.get(journeyId) ?? [],
  }
}

async function buildSearchResponse(
  dataset: LoadedAtlasDataset,
  q: string,
  limit: number,
  nodeType?: string,
): Promise<SearchResponse> {
  return {
    query: q,
    results: searchNodes(dataset, q, limit, nodeType),
    total: searchNodes(dataset, q, Number.MAX_SAFE_INTEGER, nodeType).length,
  }
}

export function createStaticClient(): ApiClient {
  return {
    async listDomains() {
      const dataset = await loadAtlasDataset()
      return { domains: dataset.domains }
    },
    async getDomain(id: string) {
      const dataset = await loadAtlasDataset()
      return buildDomainDetail(dataset, id)
    },
    async getNode(id: string) {
      const dataset = await loadAtlasDataset()
      return buildNodeDetail(dataset, id)
    },
    async getSubgraph(id: string, depth = 1, relationTypes?: string[]) {
      const dataset = await loadAtlasDataset()
      return computeSubgraph(dataset, id, depth, relationTypes)
    },
    async getEvidence(id: string) {
      const dataset = await loadAtlasDataset()
      if (!dataset.nodesById.has(id)) throw new Error(`API error 404: /nodes/${id}/evidence`)
      return {
        node_id: id,
        evidence: dataset.evidenceByNodeId.get(id) ?? [],
      }
    },
    async search(q: string, limit = 20, nodeType?: string) {
      const dataset = await loadAtlasDataset()
      return buildSearchResponse(dataset, q, limit, nodeType)
    },
    async listJourneys() {
      const dataset = await loadAtlasDataset()
      return { journeys: dataset.journeys }
    },
    async getJourney(id: string) {
      const dataset = await loadAtlasDataset()
      return buildJourneyDetail(dataset, id)
    },
  }
}
