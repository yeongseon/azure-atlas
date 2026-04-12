import { useEvidence, useNode } from '../hooks/useAtlas'

interface Props {
  nodeId: string
  onClose: () => void
}

const s: Record<string, React.CSSProperties> = {
  panel: {
    width: 340,
    background: '#1e293b',
    borderLeft: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem 1.25rem 0.75rem',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  label: { fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 },
  nodeType: {
    fontSize: '0.75rem',
    background: '#334155',
    color: '#94a3b8',
    padding: '2px 8px',
    borderRadius: 4,
    marginTop: 4,
    display: 'inline-block',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.2rem',
    lineHeight: 1,
    padding: 4,
    flexShrink: 0,
  },
  summary: {
    padding: '0.75rem 1.25rem',
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: 1.5,
    borderBottom: '1px solid #1e293b',
  },
  evidenceSection: { flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem' },
  evidenceTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  evidenceCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '0.75rem',
    marginBottom: '0.75rem',
    fontSize: '0.82rem',
  },
  excerpt: { color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.5rem' },
  sourceLink: {
    display: 'block',
    color: '#60a5fa',
    fontSize: '0.78rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  score: { color: '#64748b', fontSize: '0.75rem', marginTop: 4 },
  empty: { color: '#64748b', fontSize: '0.85rem' },
}

export default function EvidencePanel({ nodeId, onClose }: Props) {
  const { data: nodeData, isLoading: nodeLoading } = useNode(nodeId)
  const { data: evidenceData, isLoading: evLoading } = useEvidence(nodeId)

  const node = nodeData?.node
  const evidence = evidenceData?.evidence ?? []

  return (
    <aside style={s.panel}>
      <div style={s.header}>
        <div>
          {nodeLoading ? (
            <div style={{ color: '#64748b' }}>Loading…</div>
          ) : (
            <>
              <div style={s.label}>{node?.label}</div>
              <span style={s.nodeType}>{node?.node_type}</span>
            </>
          )}
        </div>
        <button type="button" style={s.closeBtn} onClick={onClose} aria-label="Close panel">✕</button>
      </div>

      {node?.summary && <p style={s.summary}>{node.summary}</p>}

      <div style={s.evidenceSection}>
        <div style={s.evidenceTitle}>Evidence ({evidence.length})</div>
        {evLoading && <div className="loading">Loading evidence…</div>}
        {!evLoading && evidence.length === 0 && (
          <div style={s.empty}>No evidence available for this node.</div>
        )}
        {evidence.map((ev) => (
          <div key={ev.evidence_id} style={s.evidenceCard}>
            <p style={s.excerpt}>"{ev.excerpt}"</p>
            {ev.source_url && (
              <a
                href={ev.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={s.sourceLink}
                title={ev.source_title ?? ev.source_url}
              >
                ↗ {ev.source_title ?? ev.source_url}
              </a>
            )}
            {ev.confidence_score !== null && (
              <div style={s.score}>
                Confidence: {Math.round((ev.confidence_score ?? 0) * 100)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
