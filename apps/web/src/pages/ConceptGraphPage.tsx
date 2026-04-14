import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EvidencePanel from '../components/EvidencePanel'
import ReactFlowGraph from '../components/ReactFlowGraph'
import { useDomain, useSubgraph } from '../hooks/useAtlas'

const RELATION_TYPES = [
  'belongs_to', 'contains', 'attached_to', 'depends_on',
  'prerequisite_for', 'connects_to', 'routes_to', 'resolves_via',
  'secures', 'monitors', 'alternative_to', 'related_to',
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
    background: 'linear-gradient(90deg, var(--brand) 0%, var(--accent-purple) 50%, var(--accent-green) 100%)',
    width: '100%',
  },
  breadcrumb: { fontSize: '0.9rem', color: 'var(--text-secondary)' },
  breadcrumbLink: { color: 'var(--text-secondary)', textDecoration: 'none' },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
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
  depthControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--surface-0)',
    padding: '4px',
    borderRadius: '100px',
    border: '1px solid var(--border)',
  },
  depthLabel: { fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '8px' },
  depthBtn: {
    background: 'transparent',
    border: 'none',
    borderRadius: '100px',
    color: 'var(--text-secondary)',
    padding: '4px 12px',
    fontSize: '0.8rem',
    transition: 'all var(--transition)',
  },
  depthBtnActive: {
    background: 'var(--surface-2)',
    border: 'none',
    borderRadius: '100px',
    color: 'var(--text-primary)',
    padding: '4px 12px',
    fontSize: '0.8rem',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  filterContainer: { position: 'relative' },
  filterBtn: {
    background: 'var(--surface-0)',
    border: '1px solid var(--border)',
    borderRadius: '100px',
    color: 'var(--text-primary)',
    padding: '6px 16px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background var(--transition)',
  },
  filterDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--surface-0)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    width: '320px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    zIndex: 100,
  },
  filterPill: {
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: '100px',
    padding: '4px 12px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  filterPillActive: {
    background: 'var(--brand)',
    border: '1px solid var(--brand)',
    color: '#fff',
    borderRadius: '100px',
    padding: '4px 12px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  body: { flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' },
  graphContainer: { flex: 1, position: 'relative' },
}

const LEGEND = [
  { type: 'service', color: 'var(--brand)' },
  { type: 'concept', color: 'var(--accent-purple)' },
  { type: 'feature', color: 'var(--accent-green)' },
  { type: 'pattern', color: 'var(--accent-amber)' },
]

export default function ConceptGraphPage() {
  const { domainId, nodeId } = useParams<{ domainId?: string; nodeId?: string }>()
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodeId || null)
  const [depth, setDepth] = useState(1)
  const [relationFilter, setRelationFilter] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    if (!isFilterOpen) return
    const handleClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (!el.closest('.filter-container-ref')) setIsFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isFilterOpen])

  useEffect(() => {
    setSelectedNodeId(nodeId || null)
  }, [nodeId])

  const isDomainView = !!domainId && !nodeId
  const isNodeView = !!nodeId

  const {
    data: domainData,
    isLoading: domainLoading,
    error: domainError,
  } = useDomain(domainId ?? '')

  const {
    data: subgraphData,
    isLoading: subgraphLoading,
    error: subgraphError,
  } = useSubgraph(nodeId ?? '', depth, relationFilter.length > 0 ? relationFilter : undefined)

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNodeId(id)
    navigate(`/nodes/${id}`)
  }, [navigate])

  const graphNodes = useMemo(() => (
    isDomainView
      ? (domainData?.nodes ?? []).map((n) => ({
          node_id: n.node_id,
          label: n.label,
          node_type: n.node_type,
          summary: n.summary,
          evidence_count: n.evidence_count,
        }))
      : (subgraphData?.nodes ?? [])
  ), [isDomainView, domainData, subgraphData])

  const graphEdges = useMemo(() => (
    isDomainView
      ? (domainData?.edges ?? []).map((e) => ({
          edge_id: e.edge_id,
          source_id: e.source_id,
          target_id: e.target_id,
          relation_type: e.relation_type,
          weight: Number(e.weight),
        }))
      : (subgraphData?.edges ?? []).map((e) => ({
          edge_id: e.edge_id,
          source_id: e.source_id,
          target_id: e.target_id,
          relation_type: e.relation_type,
          weight: Number(e.weight),
        }))
  ), [isDomainView, domainData, subgraphData])

  if (domainLoading || subgraphLoading) {
    return <div className="loading">Loading graph…</div>
  }
  if (domainError || subgraphError) {
    return <div className="error">Failed to load graph data</div>
  }

  const centerId = isNodeView ? nodeId : undefined
  const domainLabel = domainData?.domain?.label ?? domainId

  return (
    <div style={s.page}>
      <div style={s.toolbarContainer}>
        <div style={s.toolbar}>
          <nav aria-label="Breadcrumb" style={s.breadcrumb}>
            <Link to="/" style={s.breadcrumbLink}>Domains</Link>
            {domainId && (
              <>
                <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>/</span>
                <Link to={`/domains/${domainId}`} style={s.breadcrumbLink}>{domainLabel}</Link>
              </>
            )}
            {nodeId && (
              <>
                <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>/</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {subgraphData?.nodes?.find(n => n.node_id === nodeId)?.label ?? nodeId}
                </span>
              </>
            )}
          </nav>

          <div style={s.toolbarRight}>
            <div style={s.legendInline}>
              {LEGEND.map(({ type, color }) => (
                <span key={type} style={s.legendItem}>
                  <span style={{ ...s.legendDot, background: color }} />
                  {type}
                </span>
              ))}
            </div>

            {isNodeView && (
              <>
                <div style={s.depthControl}>
                  <span style={s.depthLabel}>Depth</span>
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

                <div style={s.filterContainer} className="filter-container-ref">
                  <button
                    type="button"
                    style={s.filterBtn}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    Relations {relationFilter.length > 0 ? `(${relationFilter.length})` : ''} ▼
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
              </>
            )}
          </div>
        </div>
        <div style={s.toolbarGradient} />
      </div>

      <div style={s.body}>
        <div style={s.graphContainer}>
          {graphNodes.length === 0 ? (
            <div className="loading">No graph data available</div>
          ) : (
            <ReactFlowGraph
              nodes={graphNodes}
              edges={graphEdges}
              centerNodeId={centerId}
              onNodeClick={handleNodeClick}
            />
          )}
        </div>

        {selectedNodeId && (
          <EvidencePanel
            nodeId={selectedNodeId}
            onClose={() => {
              setSelectedNodeId(null)
              if (isNodeView) {
                navigate(domainId ? `/domains/${domainId}` : '/')
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
