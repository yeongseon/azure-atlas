import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useEvidence, useNode } from '../hooks/useAtlas'

interface Props {
  nodeId: string
  onClose: () => void
}

const s: Record<string, React.CSSProperties> = {
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
  detailMdStyles: {
    background: 'var(--surface-1)',
    padding: '1rem 1.25rem',
    fontSize: '0.88rem',
    borderBottom: '1px solid var(--surface-0)',
    color: 'var(--text-primary)',
    lineHeight: 1.6,
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

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export default function EvidencePanel({ nodeId, onClose }: Props) {
  const { data: nodeData, isLoading: nodeLoading, error: nodeError } = useNode(nodeId)
  const { data: evidenceData, isLoading: evLoading, error: evError } = useEvidence(nodeId)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    void nodeId
    closeBtnRef.current?.focus()
  }, [nodeId])

  const node = nodeData?.node
  const evidence = evidenceData?.evidence ?? []

  return (
    <aside
      className="evidence-panel"
      aria-labelledby="evidence-panel-title"
    >
      <div style={s.header}>
        <div>
          {nodeLoading ? (
            <div id="evidence-panel-title" style={{ color: 'var(--text-muted)' }}>Loading…</div>
          ) : nodeError ? (
            <div id="evidence-panel-title" style={{ color: 'var(--text-muted)' }}>Failed to load node details</div>
          ) : (
            <>
              <div id="evidence-panel-title" style={s.label}>{node?.label}</div>
              <span className={`badge badge--${node?.node_type}`}>{node?.node_type}</span>
            </>
          )}
        </div>
        <button 
          ref={closeBtnRef}
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

      {node?.detail_md && (
        <div style={s.detailMdStyles} className="markdown-content">
          {/* eslint-disable @typescript-eslint/no-unused-vars */}
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 style={{fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}} {...props} />,
              h2: ({node, ...props}) => <h2 style={{fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}} {...props} />,
              h3: ({node, ...props}) => <h3 style={{fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)'}} {...props} />,
              p: ({node, ...props}) => <p style={{marginBottom: '0.75rem', color: 'var(--text-primary)'}} {...props} />,
              a: ({node, ...props}) => <a style={{color: 'var(--brand)', textDecoration: 'none'}} {...props} />,
              code: ({node, className, children, ...props}) => {
                const isInline = !className
                return isInline 
                  ? <code style={{background: 'var(--surface-2)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.8em', color: 'var(--accent-purple)'}} {...props}>{children}</code>
                  : <code style={{display: 'block', background: 'var(--surface-0)', padding: '0.75rem', borderRadius: '6px', overflowX: 'auto', fontSize: '0.8em', marginBottom: '0.75rem', color: 'var(--text-primary)'}} className={className} {...props}>{children}</code>
              },
              ul: ({node, ...props}) => <ul style={{paddingLeft: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)'}} {...props} />,
              ol: ({node, ...props}) => <ol style={{paddingLeft: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-primary)'}} {...props} />,
              li: ({node, ...props}) => <li style={{marginBottom: '0.25rem'}} {...props} />
            }}
          >
            {node.detail_md}
          </ReactMarkdown>
          {/* eslint-enable @typescript-eslint/no-unused-vars */}
        </div>
      )}

      <div style={s.evidenceSection}>
        <div style={s.evidenceTitle}>Evidence ({evidence.length})</div>
        {evLoading && <div className="loading">Loading evidence…</div>}
        {evError && <div style={s.empty}>Failed to load evidence</div>}
        {!evLoading && !evError && evidence.length === 0 && (
          <div style={s.empty}>No evidence available for this node.</div>
        )}
        {!evError && evidence.map((ev) => {
          const score = ev.confidence_score !== null ? Math.round((ev.confidence_score ?? 0) * 100) : null
          const scoreColor = score !== null ? (score > 80 ? 'var(--accent-green)' : score > 50 ? 'var(--accent-amber)' : 'var(--text-muted)') : 'var(--text-muted)'
          
          return (
            <div key={ev.evidence_id} style={s.evidenceCard}>
              <div style={s.excerptContainer}>
                <span style={s.quoteIcon}>❝</span>
                <span style={s.excerptText}>{ev.excerpt}</span>
              </div>
              
              {ev.source_url && isSafeUrl(ev.source_url) && (
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
