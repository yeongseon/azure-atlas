import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactFlowGraph from './ReactFlowGraph'
import type { GraphEdge, GraphNode } from './ReactFlowGraph'
import { type AtlasFlowNode } from './graph'
import { Position } from '@xyflow/react'

interface JourneyStep {
  step_order: number
  node_id: string
  label: string
  narrative: string | null
}

interface Props {
  steps: JourneyStep[]
  onNodeClick?: (nodeId: string) => void
}

const STEP_SPACING_X = 340
const BASE_Y = 200

/**
 * Renders journey steps as a 2.5D perspective graph
 * with CSS perspective transforms for depth effect.
 */
export function JourneyGraphView({ steps, onNodeClick }: Props) {
  const [activeStepId, setActiveStepId] = useState<string | null>(null)

  // Build graph nodes positioned linearly with slight Y wave for depth
  const { nodes, edges, preLayouted } = useMemo(() => {
    const gNodes: GraphNode[] = steps.map((step) => ({
      node_id: step.node_id,
      label: step.label,
      node_type: 'step',
      summary: step.narrative,
      evidence_count: 0,
    }))

    const gEdges: GraphEdge[] = steps.slice(0, -1).map((step, i) => ({
      edge_id: `journey-${step.node_id}-${steps[i + 1].node_id}`,
      source_id: step.node_id,
      target_id: steps[i + 1].node_id,
      relation_type: 'precedes',
    }))

    // Pre-layout: linear with sine wave for depth
    const laid: AtlasFlowNode[] = steps.map((step, i) => {
      const x = i * STEP_SPACING_X
      const y = BASE_Y + Math.sin(i * 0.6) * 80

      return {
        id: step.node_id,
        type: 'atlasNode' as const,
        position: { x, y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: step.label,
          nodeType: 'step',
          evidenceCount: 0,
          color: '#3b82f6',
          isDimmed: false,
          isNeighbor: false,
          isSelected: false,
        },
      }
    })

    return { nodes: gNodes, edges: gEdges, preLayouted: laid }
  }, [steps])

  const handleClick = useCallback(
    (id: string) => {
      setActiveStepId(id)
      onNodeClick?.(id)
    },
    [onNodeClick],
  )

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          perspective: '1200px',
          perspectiveOrigin: '50% 40%',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotateX(8deg) rotateY(-2deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <ReactFlowGraph
            nodes={nodes}
            edges={edges}
            preLayoutedNodes={preLayouted}
            onNodeClick={handleClick}
            centerNodeId={activeStepId ?? undefined}
          />
        </div>
      </div>

      {/* Step indicator overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          background: 'var(--surface-1)',
          padding: '8px 16px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {steps.map((step) => (
          <div
            key={step.node_id}
            title={`Step ${step.step_order}: ${step.label}`}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: step.node_id === activeStepId ? 'var(--brand)' : 'var(--border)',
              transition: 'background 200ms ease',
              cursor: 'pointer',
            }}
            onClick={() => handleClick(step.node_id)}
            onKeyDown={() => {}}
            role="button"
            tabIndex={0}
          />
        ))}
        {activeStepId && (
          <Link
            to={`/explore/${activeStepId}`}
            style={{
              fontSize: '0.72rem',
              color: 'var(--brand)',
              textDecoration: 'none',
              fontWeight: 600,
              marginLeft: 8,
            }}
          >
            Explore →
          </Link>
        )}
      </div>
    </div>
  )
}
