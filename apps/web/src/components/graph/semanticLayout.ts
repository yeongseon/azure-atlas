import dagre from '@dagrejs/dagre'
import { Position } from '@xyflow/react'

import type { AtlasFlowNode } from './AtlasNode'
import { NODE_COLORS, NODE_HEIGHT, NODE_WIDTH } from './graphTheme'
import type { ViewType } from './ViewSwitcher'

export interface SemanticGraphNode {
  node_id: string
  label: string
  node_type: string
  evidence_count?: number
  domain_id?: string
  semantic_layer?: string | null
}

interface GraphEdgeLike {
  edge_id?: string
  source_id: string
  target_id: string
  relation_type: string
  weight?: number
}

export interface SemanticLayoutOptions {
  view: ViewType
  semanticLayerEnabled: boolean
}

export interface SemanticLayoutResult {
  nodes: AtlasFlowNode[]
  filteredEdges: GraphEdgeLike[]
}

const VIEW_DAGRE_CONFIG: Record<ViewType, { rankdir: string; ranksep: number; nodesep: number }> = {
  taxonomy: { rankdir: 'TB', ranksep: 200, nodesep: 80 },
  topology: { rankdir: 'LR', ranksep: 180, nodesep: 72 },
  dependency: { rankdir: 'TB', ranksep: 140, nodesep: 60 },
  journey: { rankdir: 'LR', ranksep: 300, nodesep: 50 },
}

const VIEW_EDGE_FILTER: Record<ViewType, Set<string> | null> = {
  taxonomy: new Set(['is_a', 'part_of', 'contains']),
  topology: null, // all edges
  dependency: new Set(['implements', 'used_in', 'depends_on', 'requires']),
  journey: new Set(['precedes']),
}

const LAYER_Y_OFFSETS: Record<string, number> = {
  upper: 0,
  middle: 500,
  lower: 1000,
}

export function getSemanticLayoutedNodes(
  nodes: SemanticGraphNode[],
  edges: GraphEdgeLike[],
  options: SemanticLayoutOptions,
  domainColors?: Record<string, string>,
): SemanticLayoutResult {
  const { view, semanticLayerEnabled } = options

  // Filter edges by view type
  const allowedTypes = VIEW_EDGE_FILTER[view]
  const filteredEdges = allowedTypes
    ? edges.filter((e) => allowedTypes.has(e.relation_type))
    : edges

  // Build node ID set for edge filtering
  const nodeIds = new Set(nodes.map((n) => n.node_id))
  const validEdges = filteredEdges.filter((e) => nodeIds.has(e.source_id) && nodeIds.has(e.target_id))

  // Dagre layout
  const config = VIEW_DAGRE_CONFIG[view]
  const graph = new dagre.graphlib.Graph()
  graph.setGraph({ rankdir: config.rankdir, ranksep: config.ranksep, nodesep: config.nodesep, marginx: 48, marginy: 48 })
  graph.setDefaultEdgeLabel(() => ({}))

  for (const node of nodes) {
    graph.setNode(node.node_id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }
  for (const edge of validEdges) {
    graph.setEdge(edge.source_id, edge.target_id)
  }

  dagre.layout(graph)

  // Map to flow nodes with optional semantic layer adjustment
  const isVertical = config.rankdir === 'TB'
  const flowNodes: AtlasFlowNode[] = nodes.map((node) => {
    const position = graph.node(node.node_id)
    const x = position.x - NODE_WIDTH / 2
    let y = position.y - NODE_HEIGHT / 2

    if (semanticLayerEnabled && node.semantic_layer) {
      const layerOffset = LAYER_Y_OFFSETS[node.semantic_layer] ?? LAYER_Y_OFFSETS.middle
      if (isVertical) {
        // TB layout: shift Y
        y = y * 0.6 + layerOffset
      } else {
        // LR layout: shift Y while keeping X from dagre
        y = y * 0.5 + layerOffset
      }
    }

    const color =
      domainColors && node.domain_id
        ? (domainColors[node.domain_id] ?? NODE_COLORS.default)
        : (NODE_COLORS[node.node_type] ?? NODE_COLORS.default)

    return {
      id: node.node_id,
      type: 'atlasNode' as const,
      position: { x, y },
      sourcePosition: isVertical ? Position.Bottom : Position.Right,
      targetPosition: isVertical ? Position.Top : Position.Left,
      data: {
        label: node.label,
        nodeType: node.node_type,
        evidenceCount: node.evidence_count ?? 0,
        color,
        isDimmed: false,
        isNeighbor: false,
        isSelected: false,
      },
    }
  })

  return { nodes: flowNodes, filteredEdges: validEdges }
}
