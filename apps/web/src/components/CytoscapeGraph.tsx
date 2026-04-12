import { useEffect, useRef } from 'react'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'

cytoscape.use(fcose)

export interface GraphNode {
  node_id: string
  label: string
  node_type: string
  summary?: string | null
  evidence_count?: number
}

export interface GraphEdge {
  edge_id: string
  source_id: string
  target_id: string
  relation_type: string
  weight?: number
}

interface Props {
  nodes: GraphNode[]
  edges: GraphEdge[]
  centerNodeId?: string
  onNodeClick?: (nodeId: string) => void
}

const NODE_COLORS: Record<string, string> = {
  service: '#3b82f6',
  concept: '#8b5cf6',
  feature: '#10b981',
  pattern: '#f59e0b',
  default: '#64748b',
}

export default function CytoscapeGraph({ nodes, edges, centerNodeId, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const elements: cytoscape.ElementDefinition[] = [
      ...nodes.map((n) => ({
        data: {
          id: n.node_id,
          label: n.label,
          node_type: n.node_type,
          evidence_count: n.evidence_count ?? 0,
          isCenter: n.node_id === centerNodeId,
        },
      })),
      ...edges.map((e) => ({
        data: {
          id: e.edge_id,
          source: e.source_id,
          target: e.target_id,
          relation_type: e.relation_type,
          weight: e.weight ?? 1,
        },
      })),
    ]

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': (ele: cytoscape.NodeSingular) =>
              NODE_COLORS[ele.data('node_type')] ?? NODE_COLORS.default,
            color: '#e2e8f0',
            'font-size': 11,
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 4,
            width: (ele: cytoscape.NodeSingular) => (ele.data('isCenter') ? 50 : 36),
            height: (ele: cytoscape.NodeSingular) => (ele.data('isCenter') ? 50 : 36),
            'border-width': (ele: cytoscape.NodeSingular) => (ele.data('isCenter') ? 3 : 1),
            'border-color': '#60a5fa',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#f59e0b',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(relation_type)',
            'font-size': 9,
            color: '#64748b',
            'text-rotation': 'autorotate',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#60a5fa',
            'target-arrow-color': '#60a5fa',
            color: '#93c5fd',
          },
        },
      ],
      layout: {
        name: 'fcose',
        animate: true,
        animationDuration: 500,
        randomize: false,
        quality: 'default',
        nodeSeparation: 75,
        idealEdgeLength: 120,
      } as cytoscape.LayoutOptions,
    })

    cy.on('tap', 'node', (evt) => {
      const nodeId: string = evt.target.id()
      onNodeClick?.(nodeId)
    })

    cyRef.current = cy
    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, [nodes, edges, centerNodeId, onNodeClick])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#0f172a' }}
    />
  )
}
