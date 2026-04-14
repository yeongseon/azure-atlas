import type { LoadedAtlasDataset } from './dataset'
import type { EdgeSummary, SubgraphResponse } from './types'

function clampDepth(depth: number): number {
  return Math.max(1, Math.min(3, depth))
}

function isAllowedEdge(edge: EdgeSummary, relationTypes?: Set<string>): boolean {
  return !relationTypes || relationTypes.has(edge.relation_type)
}

export function computeSubgraph(
  dataset: LoadedAtlasDataset,
  nodeId: string,
  depth: number,
  relationTypes?: string[],
): SubgraphResponse {
  const centerNode = dataset.nodesById.get(nodeId)
  if (!centerNode) throw new Error(`API error 404: /nodes/${nodeId}/subgraph`)

  const discoveredNodeIds = new Set<string>([nodeId])
  const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId, depth: 0 }]
  const maxDepth = clampDepth(depth)
  const allowedRelationTypes = relationTypes?.length ? new Set(relationTypes) : undefined

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || current.depth >= maxDepth) continue

    const adjacentEdges = dataset.edgesByNodeId.get(current.nodeId) ?? []
    adjacentEdges.forEach(edge => {
      if (!isAllowedEdge(edge, allowedRelationTypes)) return

      const nextNodeId = edge.source_id === current.nodeId ? edge.target_id : edge.source_id
      if (discoveredNodeIds.has(nextNodeId)) return

      discoveredNodeIds.add(nextNodeId)
      queue.push({ nodeId: nextNodeId, depth: current.depth + 1 })
    })
  }

  const nodes = dataset.nodes
    .filter(node => discoveredNodeIds.has(node.node_id))
    .map(node => ({
      node_id: node.node_id,
      label: node.label,
      node_type: node.node_type,
      summary: node.summary,
      evidence_count: dataset.evidenceCountByNodeId.get(node.node_id) ?? 0,
    }))

  const edges = dataset.edges.filter(
    edge =>
      discoveredNodeIds.has(edge.source_id) &&
      discoveredNodeIds.has(edge.target_id) &&
      isAllowedEdge(edge, allowedRelationTypes),
  )

  return {
    center_node_id: centerNode.node_id,
    nodes,
    edges,
  }
}
