import { useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSearch } from '../hooks/useAtlas'

const s: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  heading: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' },
  form: { display: 'flex', gap: '0.75rem', marginBottom: '2rem' },
  input: {
    flex: 1,
    padding: '0.65rem 1rem',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: '1rem',
    outline: 'none',
  },
  searchBtn: {
    padding: '0.65rem 1.5rem',
    background: '#3b82f6',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  results: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: {
    display: 'block',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.15s',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' },
  label: { fontWeight: 600, fontSize: '1rem' },
  badge: {
    background: '#334155',
    color: '#94a3b8',
    fontSize: '0.72rem',
    padding: '2px 8px',
    borderRadius: 4,
  },
  summary: { fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 },
  meta: { color: '#64748b', fontSize: '0.82rem', marginBottom: '0.75rem' },
  empty: { color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' },
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const [input, setInput] = useState(initialQ)

  const { data, isLoading, error } = useSearch(initialQ)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (trimmed) {
        setSearchParams({ q: trimmed })
      }
    },
    [input, setSearchParams],
  )

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Search</h1>

      <form style={s.form} onSubmit={handleSubmit}>
        <input
          style={s.input}
          type="search"
          placeholder="Search Azure concepts…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" style={s.searchBtn}>Search</button>
      </form>

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

      {!isLoading && !error && (
        <div style={s.results}>
          {(data?.results ?? []).length === 0 && initialQ && (
            <div style={s.empty}>No results found for "{initialQ}"</div>
          )}
          {(data?.results ?? []).map((node) => (
            <Link
              key={node.node_id}
              to={`/nodes/${node.node_id}`}
              style={s.card}
            >
              <div style={s.cardTop}>
                <span style={s.label}>{node.label}</span>
                <span style={s.badge}>{node.node_type}</span>
              </div>
              {node.summary && <p style={s.summary}>{node.summary}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
