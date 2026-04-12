import { Link } from 'react-router-dom'
import { useDomains, useJourneys } from '../hooks/useAtlas'

const s: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  heading: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' },
  sub: { color: '#94a3b8', marginBottom: '2rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1rem',
    marginBottom: '3rem',
  },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  cardLabel: { fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' },
  cardDesc: { fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 },
  section: { marginBottom: '2rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#cbd5e1' },
  journeyList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  journeyCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  journeyTitle: { fontWeight: 600, marginBottom: '0.25rem' },
  journeyDesc: { fontSize: '0.82rem', color: '#94a3b8' },
}

export default function WorldMapPage() {
  const { data: domainsData, isLoading: domainsLoading, error: domainsError } = useDomains()
  const { data: journeysData, isLoading: journeysLoading } = useJourneys()

  if (domainsError) return <div className="error">Failed to load domains</div>

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Azure Knowledge Atlas</h1>
      <p style={s.sub}>Explore Azure concepts as an interconnected knowledge map</p>

      <div style={s.section}>
        <div style={s.sectionTitle}>Domains</div>
        {domainsLoading ? (
          <div className="loading">Loading domains…</div>
        ) : (
          <div style={s.grid}>
            {(domainsData?.domains ?? []).map((d) => (
              <Link key={d.domain_id} to={`/domains/${d.domain_id}`} style={s.card}>
                <div style={s.cardLabel}>{d.label}</div>
                {d.description && <div style={s.cardDesc}>{d.description}</div>}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Curated Journeys</div>
        {journeysLoading ? (
          <div className="loading">Loading journeys…</div>
        ) : (
          <div style={s.journeyList}>
            {(journeysData?.journeys ?? []).map((j) => (
              <Link key={j.journey_id} to={`/journeys/${j.journey_id}`} style={s.journeyCard}>
                <div style={s.journeyTitle}>{j.title}</div>
                {j.description && <div style={s.journeyDesc}>{j.description}</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
