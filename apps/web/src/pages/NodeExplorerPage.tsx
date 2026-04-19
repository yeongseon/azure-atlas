import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EvidencePanel from '../components/EvidencePanel'
import { ExplorationBreadcrumb, type BreadcrumbEntry } from '../components/ExplorationBreadcrumb'
import ReactFlowGraph from '../components/ReactFlowGraph'
import {
  getSemanticLayoutedNodes,
  SemanticLayerIndicator,
  ViewSwitcher,
  type ViewType,
} from '../components/graph'
import { useNode, useSubgraph } from '../hooks/useAtlas'

const RELATION_TYPES = [
  'belongs_to', 'contains', 'attached_to', 'depends_on',
  'prerequisite_for', 'connects_to', 'routes_to', 'resolves_via',
  'secures', 'monitors', 'alternative_to', 'related_to',
  'is_a', 'part_of', 'implements', 'used_in', 'precedes', 'explained_by',
]

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 54px)' },
  toolbarContainer: {
    flexShrink: 0,
    background: 'var(--surface-1)',
    position: 'relative',
    zIndex: 10,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 2rem',
  },
  toolbarGradient: {
    height: '2px',
    background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #10b981 100%)',
    width: '100%',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginLeft: 'auto',
  },
  depthControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--surface-2)',
    padding: '3px',
    borderRadius: 10,
    border: '1px solid var(--border)',
  },
  depthLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '8px' },
  depthBtn: {
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    color: 'var(--text-secondary)',
    padding: '4px 10px',
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 140ms ease',
  },
  depthBtnActive: {
    background: 'var(--surface-1)',
    border: 'none',
    borderRadius: 8,
    color: 'var(--text-primary)',
    padding: '4px 10px',
    fontSize: '0.78rem',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    cursor: 'default',
  },
  layerToggle: {
    padding: '4px 10px',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: 8,
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 140ms ease',
    whiteSpace: 'nowrap',
  },
  filterContainer: { position: 'relative' },
  filterBtn: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'background 140ms ease',
  },
  filterDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    width: '340px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    zIndex: 100,
  },
  filterPill: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 100,
    padding: '3px 10px',
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 140ms ease',
  },
  filterPillActive: {
    background: 'var(--brand)',
    border: '1px solid var(--brand)',
    color: '#fff',
    borderRadius: 100,
    padding: '3px 10px',
    fontSize: '0.72rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  stats: { fontSize: '0.78rem', color: 'var(--text-muted)' },
  body: { flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' },
  graphContainer: { flex: 1, position: 'relative' },
}

export default function NodeExplorerPage() {
  const { nodeId } = useParams<{ nodeId: string }>()
  const navigate = useNavigate()
  const [depth, setDepth] = useState(1)
  const [activeView, setActiveView] = useState<ViewType>('topology')
  const [layersEnabled, setLayersEnabled] = useState(false)
  const [relationFilter, setRelationFilter] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [history, setHistory] = useState<BreadcrumbEntry[]>([])
  const historyRef = useRef(history)
  historyRef.current = history

  const { data: nodeData } = useNode(nodeId ?? '')
  const { data: subgraphData, isLoading, error } = useSubgraph(
    nodeId ?? '',
    depth,
    relationFilter.length > 0 ? relationFilter : undefined,
  )

  // Update history when nodeId changes
  useEffect(() => {
    if (!nodeId || !nodeData?.node) return
    const label = nodeData.node.label
    const prev = historyRef.current
    // Don't add duplicate consecutive entries
    if (prev.length > 0 && prev[prev.length - 1].nodeId === nodeId) return
    setHistory((h) => [...h, { nodeId, label }])
  }, [nodeId, nodeData?.node])

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!isFilterOpen) return
    const handleClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (!el.closest('.explorer-filter-ref')) setIsFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isFilterOpen])

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNodeId(id)
    // Navigate to the clicked node for exploration
    navigate(`/explore/${id}`)
  }, [navigate])

  const graphNodes = useMemo(() => subgraphData?.nodes ?? [], [subgraphData])
  const graphEdges = useMemo(() => subgraphData?.edges ?? [], [subgraphData])

  const layout = useMemo(() => {
    if (graphNodes.length === 0) return null
    return getSemanticLayoutedNodes(
      graphNodes,
      graphEdges,
      { view: activeView, semanticLayerEnabled: layersEnabled },
    )
  }, [graphNodes, graphEdges, activeView, layersEnabled])

  if (isLoading) return <div className="loading">Loading node graph…</div>
  if (error) return <div className="error">Failed to load node data</div>
  if (!nodeId) return <div className="error">No node selected</div>

  const centerLabel = nodeData?.node?.label ?? nodeId
  const filteredEdges = layout?.filteredEdges ?? []

  return (
    <div style={s.page}>
      <div style={s.toolbarContainer}>
        <div style={s.toolbar}>
          <ExplorationBreadcrumb
            history={history}
            currentNodeId={nodeId}
            currentLabel={centerLabel}
          />

          <span style={s.stats}>
            {graphNodes.length} nodes · {filteredEdges.length} edges
          </span>

          <div style={s.toolbarRight}>
            <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />

            <div style={s.depthControl}>
              <span style={s.depthLabel}>Hops</span>
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  type="button"
                  style={d === depth ? s.depthBtnActive : s.depthBtn}
                  onClick={() => setDepth(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              type="button"
              style={{
                ...s.layerToggle,
                background: layersEnabled ? 'var(--surface-2)' : 'transparent',
                color: layersEnabled ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              onClick={() => setLayersEnabled((prev) => !prev)}
            >
              {layersEnabled ? '◆ Layers' : '◇ Layers'}
            </button>

            <div style={s.filterContainer} className="explorer-filter-ref">
              <button
                type="button"
                style={s.filterBtn}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                Relations {relationFilter.length > 0 ? `(${relationFilter.length})` : ''} ▾
              </button>
              {isFilterOpen && (
                <div style={s.filterDropdown}>
                  {RELATION_TYPES.map((type) => {
                    const isActive = relationFilter.includes(type)
                    return (
                      <button
                        key={type}
                        type="button"
                        style={isActive ? s.filterPillActive : s.filterPill}
                        onClick={() => {
                          if (isActive) {
                            setRelationFilter((prev) => prev.filter((t) => t !== type))
                          } else {
                            setRelationFilter((prev) => [...prev, type])
                          }
                        }}
                      >
                        {type.replace(/_/g, ' ')}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={s.toolbarGradient} />
      </div>

      <div style={s.body}>
        <div style={s.graphContainer}>
          <SemanticLayerIndicator visible={layersEnabled} />
          {graphNodes.length === 0 ? (
            <div className="loading">No connected nodes found</div>
          ) : (
            <ReactFlowGraph
              nodes={graphNodes}
              edges={filteredEdges.map((e) => ({
                edge_id: e.edge_id ?? `${e.source_id}-${e.target_id}`,
                source_id: e.source_id,
                target_id: e.target_id,
                relation_type: e.relation_type,
                weight: e.weight,
              }))}
              centerNodeId={nodeId}
              onNodeClick={handleNodeClick}
              preLayoutedNodes={layout?.nodes}
            />
          )}
        </div>

        {selectedNodeId && (
          <EvidencePanel
            nodeId={selectedNodeId}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  )
}
