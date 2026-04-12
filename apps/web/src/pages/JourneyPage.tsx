import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useJourney } from '../hooks/useAtlas'
import EvidencePanel from '../components/EvidencePanel'

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', height: 'calc(100vh - 53px)', overflow: 'hidden' },
  main: { flex: 1, overflowY: 'auto', padding: '2rem' },
  breadcrumb: { fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' },
  desc: { color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 },
  stepList: { display: 'flex', flexDirection: 'column', gap: 0 },
  stepRow: {
    display: 'flex',
    gap: '1.25rem',
    position: 'relative',
  },
  stepNumber: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#1e293b',
    border: '2px solid #3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
    color: '#60a5fa',
    flexShrink: 0,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    background: '#334155',
    margin: '4px 0',
  },
  stepContent: {
    paddingBottom: '1.75rem',
    flex: 1,
  },
  nodeCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  nodeCardActive: {
    background: '#1e293b',
    border: '1px solid #3b82f6',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    marginBottom: '0.5rem',
    cursor: 'pointer',
  },
  nodeLabel: { fontWeight: 600, marginBottom: '0.25rem' },
  narrative: { fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 },
  exploreLink: {
    display: 'inline-block',
    marginTop: '0.5rem',
    fontSize: '0.8rem',
    color: '#60a5fa',
  },
}

export default function JourneyPage() {
  const { journeyId } = useParams<{ journeyId: string }>()
  const { data, isLoading, error } = useJourney(journeyId ?? '')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  if (isLoading) return <div className="loading">Loading journey…</div>
  if (error || !data) return <div className="error">Journey not found</div>

  const { journey, steps } = data

  return (
    <div style={s.page}>
      <div style={s.main}>
        <div style={s.breadcrumb}>
          <Link to="/">Domains</Link>
          {journey.domain_id && (
            <>
              {' / '}
              <Link to={`/domains/${journey.domain_id}`}>{journey.domain_id}</Link>
            </>
          )}
          {' / Journeys'}
        </div>

        <h1 style={s.title}>{journey.title}</h1>
        {journey.description && <p style={s.desc}>{journey.description}</p>}

        <div style={s.stepList}>
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1
            const isActive = selectedNodeId === step.node_id
            return (
              <div key={step.node_id} style={s.stepRow}>
                <div style={s.stepNumber}>
                  <div style={s.circle}>{step.step_order}</div>
                  {!isLast && <div style={s.line} />}
                </div>
                <div style={s.stepContent}>
                  <button
                    type="button"
                    style={isActive ? s.nodeCardActive : s.nodeCard}
                    onClick={() =>
                      setSelectedNodeId(isActive ? null : step.node_id)
                    }
                  >
                    <div style={s.nodeLabel}>{step.label}</div>
                    {step.narrative && <p style={s.narrative}>{step.narrative}</p>}
                    <Link
                      to={`/nodes/${step.node_id}`}
                      style={s.exploreLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Explore in graph →
                    </Link>
                  </button>
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
