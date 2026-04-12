import { useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSearch } from '../hooks/useAtlas'

const s: Record<string, React.CSSProperties> = {
  page: { padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: 'calc(100vh - 54px)' },
  heading: { fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center', letterSpacing: '-0.02em' },
  form: { display: 'flex', gap: '0.75rem', marginBottom: '3rem', position: 'relative' },
  input: {
    flex: 1,
    padding: '1rem 1.5rem',
    background: 'var(--surface-1)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--text-primary)',
    fontSize: '1.1rem',
    outline: 'none',
    transition: 'all var(--transition)',
  },
  searchBtn: {
    padding: '0 2rem',
    background: 'var(--brand)',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1.05rem',
    transition: 'all var(--transition)',
    cursor: 'pointer',
  },
  results: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: {
    display: 'block',
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem 1.5rem',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all var(--transition)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' },
  label: { fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' },
  summary: { fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 },
  meta: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' },
  heroContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 0',
    color: 'var(--text-muted)',
  },
  heroIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  heroText: {
    fontSize: '1.25rem',
    fontWeight: 500,
  }
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const [input, setInput] = useState(initialQ)
  const [isFocused, setIsFocused] = useState(false)

  const { data, isLoading, error } = useSearch(initialQ)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (trimmed) {
        setSearchParams({ q: trimmed })
      } else {
        setSearchParams({})
      }
    },
    [input, setSearchParams],
  )

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'service': return 'var(--brand)'
      case 'concept': return 'var(--accent-purple)'
      case 'feature': return 'var(--accent-green)'
      case 'pattern': return 'var(--accent-amber)'
      default: return 'var(--border-strong)'
    }
  }

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Search Azure Atlas</h1>

      <form style={s.form} onSubmit={handleSubmit}>
        <input
          style={{
            ...s.input,
            borderColor: isFocused ? 'var(--brand)' : 'var(--border)',
            boxShadow: isFocused ? '0 0 0 3px rgba(59,130,246,0.3)' : 'none',
          }}
          type="search"
          placeholder="e.g. Virtual Network, ExpressRoute, Scale out…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button 
          type="submit" 
          style={s.searchBtn}
          className="btn--primary"
        >
          Search
        </button>
      </form>

      {!initialQ && !isLoading && (
        <div style={s.heroContainer}>
          <div style={s.heroIcon}>🧭</div>
          <div style={s.heroText}>What Azure concept are you looking for?</div>
        </div>
      )}

      {initialQ && (
        <div style={s.meta}>
          {isLoading
            ? 'Searching…'
            : error
            ? 'Search failed'
            : `${data?.total ?? 0} results for "${initialQ}"`}
        </div>
      )}

      {error && <div className="error">Search failed. Please try again.</div>}

      {!isLoading && !error && initialQ && (
        <div style={s.results}>
          {(data?.results ?? []).length === 0 && (
            <div className="state-view">
              <div className="state-view__icon">🔍</div>
              <div className="state-view__title">No results found</div>
              <div className="state-view__desc">We couldn't find anything matching "{initialQ}". Try adjusting your search terms.</div>
            </div>
          )}
          {(data?.results ?? []).map((node) => (
            <Link
              key={node.node_id}
              to={`/nodes/${node.node_id}`}
              style={{
                ...s.card,
                borderLeft: `4px solid ${getBorderColor(node.node_type)}`,
              }}
              className="card"
            >
              <div style={s.cardTop}>
                <span style={s.label}>{node.label}</span>
                <span className={`badge badge--${node.node_type}`}>{node.node_type}</span>
              </div>
              {node.summary && <p style={s.summary}>{node.summary}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
