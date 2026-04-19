import { useCallback, useMemo, useState } from 'react'
import EvidencePanel from '../components/EvidencePanel'
import ReactFlowGraph from '../components/ReactFlowGraph'
import {
  getSemanticLayoutedNodes,
  SemanticLayerIndicator,
  ViewSwitcher,
  type ViewType,
} from '../components/graph'
import { useAllGraph, useDomains } from '../hooks/useAtlas'

const DOMAIN_COLORS: Record<string, string> = {
  network: '#3b82f6',
  storage: '#10b981',
  compute: '#f59e0b',
}

const VIEW_LABELS: Record<ViewType, string> = {
  taxonomy: 'Taxonomy View',
  topology: 'Topology View',
  dependency: 'Dependency View',
  journey: 'Journey View',
}

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
    background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 50%, #f59e0b 100%)',
    width: '100%',
  },
  title: { fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' },
  stats: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginLeft: 'auto',
  },
  legendInline: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  legendDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
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
  body: { flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' },
  graphContainer: { flex: 1, position: 'relative' },
}

export default function UnifiedGraphPage() {
  const { data, isLoading, error } = useAllGraph()
  const { data: domainsData } = useDomains()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<ViewType>('taxonomy')
  const [layersEnabled, setLayersEnabled] = useState(true)

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNodeId(id)
  }, [])

  if (isLoading) return <div className="loading">Loading unified graph…</div>
  if (error) return <div className="error">Failed to load graph data</div>

  const nodes = data?.nodes ?? []
  const edges = data?.edges ?? []
  const domains = domainsData?.domains ?? []

  const legend = domains.map((domain) => ({
    label: domain.label,
    color: DOMAIN_COLORS[domain.domain_id] ?? '#64748b',
  }))

  return (
    <div style={s.page}>
      <div style={s.toolbarContainer}>
        <div style={s.toolbar}>
          <span style={s.title}>{VIEW_LABELS[activeView]}</span>
          <ViewSwitcher activeView={activeView} onViewChange={setActiveView} />
          <span style={s.stats}>
            {nodes.length} nodes · {edges.length} edges · {data?.domain_count ?? 0} domains
          </span>

          <div style={s.toolbarRight}>
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
            <div style={s.legendInline}>
              {legend.map(({ label, color }) => (
                <span key={label} style={s.legendItem}>
                  <span style={{ ...s.legendDot, background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={s.toolbarGradient} />
      </div>

      <div style={s.body}>
        <div style={s.graphContainer}>
          <SemanticLayerIndicator visible={layersEnabled} />
          {nodes.length === 0 ? (
            <div className="loading">No graph data available</div>
          ) : (
            <SemanticGraphView
              nodes={nodes}
              edges={edges}
              activeView={activeView}
              layersEnabled={layersEnabled}
              onNodeClick={handleNodeClick}
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

/** Inner component to memoize the semantic layout computation */
function SemanticGraphView({
  nodes,
  edges,
  activeView,
  layersEnabled,
  onNodeClick,
}: {
  nodes: NonNullable<ReturnType<typeof useAllGraph>['data']>['nodes']
  edges: NonNullable<ReturnType<typeof useAllGraph>['data']>['edges']
  activeView: ViewType
  layersEnabled: boolean
  onNodeClick: (id: string) => void
}) {
  const layout = useMemo(
    () =>
      getSemanticLayoutedNodes(nodes, edges, { view: activeView, semanticLayerEnabled: layersEnabled }, DOMAIN_COLORS),
    [nodes, edges, activeView, layersEnabled],
  )

  return (
    <ReactFlowGraph
      nodes={nodes}
      edges={layout.filteredEdges.map((e) => ({
        edge_id: e.edge_id ?? `${e.source_id}-${e.target_id}`,
        source_id: e.source_id,
        target_id: e.target_id,
        relation_type: e.relation_type,
        weight: e.weight,
      }))}
      onNodeClick={onNodeClick}
      domainColors={DOMAIN_COLORS}
      preLayoutedNodes={layout.nodes}
    />
  )
}
