import { Link } from 'react-router-dom'
import { useDomains, useJourneys } from '../hooks/useAtlas'

const s: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' },
  hero: { 
    position: 'relative', 
    padding: '3rem 0 2.5rem', 
    marginBottom: '2.5rem', 
    textAlign: 'center',
    overflow: 'hidden'
  },
  heading: { 
    fontSize: '2.75rem', 
    fontWeight: 800, 
    marginBottom: '1rem',
    position: 'relative',
    zIndex: 1,
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)'
  },
  sub: { 
    color: 'var(--text-secondary)', 
    fontSize: '1.15rem',
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    lineHeight: 1.6
  },
  heroBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.6
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
    marginBottom: '4rem',
  },
  cardLabel: { fontWeight: 600, fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-primary)' },
  cardDesc: { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' },
  section: { marginBottom: '4rem' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' },
  journeyList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  journeyTitle: { fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--text-primary)' },
  journeyDesc: { fontSize: '0.9rem', color: 'var(--text-secondary)' },
}

const NodeIcon = ({ style, animation }: { style: React.CSSProperties, animation: string }) => (
  <div style={{ position: 'absolute', animation: `${animation} 4s ease-in-out infinite`, ...style }}>
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="14" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1" />
      <circle cx="20" cy="20" r="4" fill="var(--brand)" />
    </svg>
  </div>
)

export default function WorldMapPage() {
  const { data: domainsData, isLoading: domainsLoading, error: domainsError } = useDomains()
  const { data: journeysData, isLoading: journeysLoading, error: journeysError } = useJourneys()

  if (domainsError) return <div className="error">Failed to load domains</div>

  const domains = domainsData?.domains ?? []
  const journeys = journeysData?.journeys ?? []

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <div style={s.heroBg}>
          <NodeIcon style={{ top: '15%', left: '20%' }} animation="float-a" />
          <NodeIcon style={{ bottom: '25%', right: '15%' }} animation="float-b" />
          <NodeIcon style={{ top: '35%', right: '25%' }} animation="float-c" />
          <NodeIcon style={{ bottom: '15%', left: '30%' }} animation="float-a" />
        </div>
        <h1 style={s.heading}>Azure Knowledge Atlas</h1>
        <p style={s.sub}>Explore Azure concepts as an interconnected knowledge map</p>
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Domains</h2>
        {domainsLoading ? (
          <div className="state-view">
            <div className="state-view__icon">🌐</div>
            <div className="state-view__title">Loading Domains...</div>
            <div className="state-view__desc">Preparing the knowledge map.</div>
          </div>
        ) : domains.length === 0 ? (
          <div className="state-view">
            <div className="state-view__icon">📭</div>
            <div className="state-view__title">No Domains Found</div>
            <div className="state-view__desc">There are no domains available yet.</div>
          </div>
        ) : (
          <div style={s.grid}>
            {domains.map((d, i: number) => {
              const accentColor = i % 3 === 0 ? 'var(--accent-purple)' : i % 3 === 1 ? 'var(--accent-green)' : 'var(--accent-amber)'
              return (
                <Link
                  key={d.domain_id}
                  to={`/domains/${d.domain_id}`}
                  className="card"
                  style={{ borderLeft: `4px solid ${accentColor}`, display: 'flex', flexDirection: 'column' }}
                >
                  <div style={s.cardLabel}>{d.label}</div>
                  {d.description && <div style={s.cardDesc}>{d.description}</div>}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Curated Journeys</h2>
        {journeysLoading ? (
            <div className="state-view">
              <div className="state-view__icon">🗺️</div>
              <div className="state-view__title">Loading Journeys...</div>
            </div>
        ) : journeysError ? (
          <div className="error">Failed to load journeys</div>
        ) : journeys.length === 0 ? (
          <div className="state-view">
            <div className="state-view__icon">🛤️</div>
            <div className="state-view__title">No Journeys Found</div>
            <div className="state-view__desc">Curated learning paths will appear here.</div>
          </div>
        ) : (
          <div style={s.journeyList}>
            {journeys.map((j) => (
              <Link key={j.journey_id} to={`/journeys/${j.journey_id}`} className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={s.journeyTitle}>{j.title}</div>
                  {j.description && <div style={s.journeyDesc}>{j.description}</div>}
                </div>
                <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '1rem' }}>→</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
