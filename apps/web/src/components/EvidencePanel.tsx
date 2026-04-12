import { useEffect, useState } from 'react'
import { useEvidence, useNode } from '../hooks/useAtlas'

interface Props {
  nodeId: string
  onClose: () => void
}

const s: Record<string, React.CSSProperties> = {
  panelDesktop: {
    width: 380,
    background: 'var(--surface-1)',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
  },
  panelMobile: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '50vh',
    background: 'var(--surface-1)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 50,
    boxShadow: '0 -4px 12px rgba(0,0,0,0.2)',
  },
  header: {
    padding: '1.25rem 1.25rem 1rem',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  label: { 
    fontWeight: 700, 
    fontSize: '1.1rem', 
    lineHeight: 1.3,
    marginBottom: '0.5rem',
    color: 'var(--text-primary)'
  },
  closeBtn: {
    background: 'var(--surface-2)',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1.2rem',
    lineHeight: 1,
    padding: '0.25rem',
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-sm)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition)',
  },
  summary: {
    padding: '1rem 1.25rem',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    borderBottom: '1px solid var(--surface-0)',
    background: 'var(--surface-1)',
  },
  evidenceSection: { 
    flex: 1, 
    overflowY: 'auto', 
    padding: '1rem 1.25rem',
    background: 'var(--surface-0)'
  },
  evidenceTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
  },
  evidenceCard: {
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
    marginBottom: '1rem',
    fontSize: '0.85rem',
  },
  excerptContainer: { 
    color: 'var(--text-primary)', 
    lineHeight: 1.6, 
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.4rem',
  },
  quoteIcon: {
    color: 'var(--brand)',
    fontSize: '1.2rem',
    lineHeight: 1,
    fontFamily: 'serif',
  },
  excerptText: {
    flex: 1,
  },
  sourceLink: {
    display: 'block',
    color: 'var(--brand)',
    fontSize: '0.8rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: '0.75rem',
    textDecoration: 'none',
  },
  scoreContainer: {
    marginTop: '0.5rem',
  },
  scoreLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    marginBottom: '0.25rem',
  },
  scoreTrack: {
    height: '4px',
    background: 'var(--surface-2)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  empty: { color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' },
}

export default function EvidencePanel({ nodeId, onClose }: Props) {
  const { data: nodeData, isLoading: nodeLoading } = useNode(nodeId)
  const { data: evidenceData, isLoading: evLoading } = useEvidence(nodeId)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const node = nodeData?.node
  const evidence = evidenceData?.evidence ?? []

  return (
    <aside style={isMobile ? s.panelMobile : s.panelDesktop}>
      <div style={s.header}>
        <div>
          {nodeLoading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
          ) : (
            <>
              <div style={s.label}>{node?.label}</div>
              <span className={`badge badge--${node?.node_type}`}>{node?.node_type}</span>
            </>
          )}
        </div>
        <button 
          type="button" 
          style={s.closeBtn} 
          onClick={onClose} 
          aria-label="Close panel"
          className="evidence-close-btn"
        >
          ✕
        </button>
      </div>

      {node?.summary && <p style={s.summary}>{node.summary}</p>}

      <div style={s.evidenceSection}>
        <div style={s.evidenceTitle}>Evidence ({evidence.length})</div>
        {evLoading && <div className="loading">Loading evidence…</div>}
        {!evLoading && evidence.length === 0 && (
          <div style={s.empty}>No evidence available for this node.</div>
        )}
        {evidence.map((ev) => {
          const score = ev.confidence_score !== null ? Math.round((ev.confidence_score ?? 0) * 100) : null
          const scoreColor = score !== null ? (score > 80 ? 'var(--accent-green)' : score > 50 ? 'var(--accent-amber)' : 'var(--text-muted)') : 'var(--text-muted)'
          
          return (
            <div key={ev.evidence_id} style={s.evidenceCard}>
              <div style={s.excerptContainer}>
                <span style={s.quoteIcon}>❝</span>
                <span style={s.excerptText}>{ev.excerpt}</span>
              </div>
              
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
              
              {score !== null && (
                <div style={s.scoreContainer}>
                  <div style={s.scoreLabel}>
                    <span>Confidence</span>
                    <span>{score}%</span>
                  </div>
                  <div style={s.scoreTrack}>
                    <div 
                      style={{ 
                        width: `${score}%`, 
                        height: '100%', 
                        background: scoreColor,
                        borderRadius: '2px'
                      }} 
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
