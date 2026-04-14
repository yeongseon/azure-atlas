import { useCallback, useState } from 'react'
import EvidencePanel from '../components/EvidencePanel'
import ReactFlowGraph from '../components/ReactFlowGraph'
import { useAllGraph, useDomains } from '../hooks/useAtlas'

const DOMAIN_COLORS: Record<string, string> = {
  network: '#3b82f6',
  storage: '#10b981',
  compute: '#f59e0b',
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
  body: { flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' },
  graphContainer: { flex: 1, position: 'relative' },
}

export default function UnifiedGraphPage() {
  const { data, isLoading, error } = useAllGraph()
  const { data: domainsData } = useDomains()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

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
          <span style={s.title}>Unified Graph</span>
          <span style={s.stats}>
            {nodes.length} nodes · {edges.length} edges · {data?.domain_count ?? 0} domains
          </span>

          <div style={s.toolbarRight}>
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
          {nodes.length === 0 ? (
            <div className="loading">No graph data available</div>
          ) : (
            <ReactFlowGraph
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              domainColors={DOMAIN_COLORS}
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
