import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useJourney } from '../hooks/useAtlas'
import EvidencePanel from '../components/EvidencePanel'

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', height: 'calc(100vh - 54px)', overflow: 'hidden' },
  main: { flex: 1, overflowY: 'auto', padding: '3rem 4rem' },
  breadcrumb: { fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' },
  breadcrumbLink: { color: 'var(--text-secondary)', textDecoration: 'none' },
  title: { fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' },
  desc: { color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '3rem', lineHeight: 1.6, maxWidth: '800px' },
  stepList: { display: 'flex', flexDirection: 'column', gap: 0, maxWidth: '800px' },
  stepRow: {
    display: 'flex',
    gap: '1.5rem',
    position: 'relative',
  },
  stepNumber: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--surface-1)',
    border: '2px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    flexShrink: 0,
    zIndex: 1,
    transition: 'all var(--transition)',
  },
  circleActive: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--surface-1)',
    border: '2px solid var(--brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: 'var(--brand)',
    flexShrink: 0,
    zIndex: 1,
    boxShadow: '0 0 0 3px rgba(59,130,246,0.3)',
    transition: 'all var(--transition)',
  },
  circlePassed: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--brand)',
    border: '2px solid var(--brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#fff',
    flexShrink: 0,
    zIndex: 1,
    transition: 'all var(--transition)',
  },
  line: {
    width: 2,
    flex: 1,
    background: 'var(--border)',
    margin: '4px 0',
    transition: 'background var(--transition)',
  },
  lineActive: {
    width: 2,
    flex: 1,
    background: 'var(--brand)',
    margin: '4px 0',
    transition: 'background var(--transition)',
  },
  stepContent: {
    paddingBottom: '2.5rem',
    flex: 1,
  },
  nodeCard: {
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem 1.5rem',
    marginBottom: '0.75rem',
    cursor: 'pointer',
    transition: 'all var(--transition)',
    textAlign: 'left',
    width: '100%',
    display: 'block',
  },
  nodeCardActive: {
    background: 'var(--surface-1)',
    border: '1px solid var(--brand)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem 1.5rem',
    marginBottom: '0.75rem',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    display: 'block',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  nodeLabel: { fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' },
  narrative: { fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 },
  exploreLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: 'var(--brand)',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(59,130,246,0.2)',
    background: 'rgba(59,130,246,0.05)',
    fontWeight: 500,
    transition: 'all var(--transition)',
  },
}

export default function JourneyPage() {
  const { journeyId } = useParams<{ journeyId: string }>()
  const { data, isLoading, error } = useJourney(journeyId ?? '')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  if (isLoading) return <div className="loading">Loading journey…</div>
  if (error || !data) return <div className="error">Journey not found</div>

  const { journey, steps } = data
  
  const activeStepIndex = selectedNodeId 
    ? steps.findIndex(s => s.node_id === selectedNodeId)
    : -1

  return (
    <div style={s.page}>
      <div style={s.main}>
        <div style={s.breadcrumb}>
          <Link to="/" style={s.breadcrumbLink}>Domains</Link>
          {journey.domain_id && (
            <>
              <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>/</span>
              <Link to={`/domains/${journey.domain_id}`} style={s.breadcrumbLink}>{journey.domain_id}</Link>
            </>
          )}
          <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-primary)' }}>Journeys</span>
        </div>

        <h1 style={s.title}>{journey.title}</h1>
        {journey.description && <p style={s.desc}>{journey.description}</p>}

        <div style={s.stepList}>
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1
            const isActive = selectedNodeId === step.node_id
            const isPassed = activeStepIndex > -1 && idx < activeStepIndex
            
            return (
              <div key={step.node_id} style={s.stepRow}>
                <div style={s.stepNumber}>
                  <div style={isActive ? s.circleActive : isPassed ? s.circlePassed : s.circle}>
                    {step.step_order}
                  </div>
                  {!isLast && <div style={isActive || isPassed ? s.lineActive : s.line} />}
                </div>
                  <div style={s.stepContent}>
                    <button
                      type="button"
                      style={isActive ? s.nodeCardActive : s.nodeCard}
                      onClick={() => setSelectedNodeId(isActive ? null : step.node_id)}
                      className={isActive ? "" : "card"}
                    >
                      <div style={s.nodeLabel}>{step.label}</div>
                      {step.narrative && <p style={s.narrative}>{step.narrative}</p>}
                    </button>
                    <Link 
                      to={`/nodes/${step.node_id}`} 
                      style={s.exploreLink}
                      className="btn--ghost"
                    >
                      Explore in graph →
                    </Link>
                  </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedNodeId && (
        <EvidencePanel
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  )
}
