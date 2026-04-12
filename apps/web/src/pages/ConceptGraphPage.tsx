import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import CytoscapeGraph from '../components/CytoscapeGraph'
import EvidencePanel from '../components/EvidencePanel'
import { useDomain, useSubgraph } from '../hooks/useAtlas'

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 53px)' },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.6rem 1.5rem',
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    flexShrink: 0,
  },
  breadcrumb: { fontSize: '0.85rem', color: '#94a3b8' },
  depthLabel: { fontSize: '0.82rem', color: '#64748b', marginLeft: 'auto' },
  depthBtn: {
    background: '#334155',
    border: 'none',
    borderRadius: 6,
    color: '#e2e8f0',
    padding: '3px 10px',
    fontSize: '0.82rem',
  },
  depthBtnActive: {
    background: '#3b82f6',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    padding: '3px 10px',
    fontSize: '0.82rem',
    fontWeight: 600,
  },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  graphContainer: { flex: 1, position: 'relative' },
  legend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    background: 'rgba(15,23,42,0.85)',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '0.6rem 0.9rem',
    fontSize: '0.76rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  legendDot: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    marginRight: 6,
  },
}

const LEGEND = [
  { type: 'service', color: '#3b82f6' },
  { type: 'concept', color: '#8b5cf6' },
  { type: 'feature', color: '#10b981' },
  { type: 'pattern', color: '#f59e0b' },
]

export default function ConceptGraphPage() {
  const { domainId, nodeId } = useParams<{ domainId?: string; nodeId?: string }>()
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [depth, setDepth] = useState(1)

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
  } = useSubgraph(nodeId ?? '', depth)

  const handleNodeNavigate = (id: string) => {
    navigate(`/nodes/${id}`)
    setSelectedNodeId(id)
  }

  if (domainLoading || subgraphLoading) {
    return <div className="loading">Loading graph…</div>
  }
  if (domainError || subgraphError) {
    return <div className="error">Failed to load graph data</div>
  }

  const graphNodes = isDomainView
    ? (domainData?.nodes ?? []).map((n) => ({
        node_id: n.node_id,
        label: n.label,
        node_type: n.node_type,
        summary: n.summary,
        evidence_count: n.evidence_count,
      }))
    : (subgraphData?.nodes ?? [])

  const graphEdges = isDomainView
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

  const centerId = isNodeView ? nodeId : undefined
  const domainLabel = domainData?.domain?.label ?? domainId

  return (
    <div style={s.page}>
      <div style={s.toolbar}>
        <span style={s.breadcrumb}>
          <Link to="/">Domains</Link>
          {domainId && (
            <>
              {' / '}
              <Link to={`/domains/${domainId}`}>{domainLabel}</Link>
            </>
          )}
          {nodeId && (
            <>
              {' / '}
              <span style={{ color: '#e2e8f0' }}>{nodeId}</span>
            </>
          )}
        </span>

        {isNodeView && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
            <span style={s.depthLabel}>Depth:</span>
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
        )}
      </div>

      <div style={s.body}>
        <div style={s.graphContainer}>
          {graphNodes.length === 0 ? (
            <div className="loading">No graph data available</div>
          ) : (
            <CytoscapeGraph
              nodes={graphNodes}
              edges={graphEdges}
              centerNodeId={centerId}
              onNodeClick={(id) => {
                setSelectedNodeId(id)
                handleNodeNavigate(id)
              }}
            />
          )}
          <div style={s.legend}>
            {LEGEND.map(({ type, color }) => (
              <span key={type}>
                <span style={{ ...s.legendDot, background: color }} />
                {type}
              </span>
            ))}
          </div>
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
