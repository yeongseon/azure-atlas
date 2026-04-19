import { Link } from 'react-router-dom'

export interface BreadcrumbEntry {
  nodeId: string
  label: string
}

interface Props {
  history: BreadcrumbEntry[]
  currentNodeId: string
  currentLabel: string
}

const s: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.85rem',
    gap: '0.25rem',
    flexWrap: 'wrap',
    minWidth: 0,
  },
  separator: {
    color: 'var(--text-muted)',
    margin: '0 0.25rem',
    fontSize: '0.75rem',
  },
  link: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    maxWidth: 140,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  current: {
    color: 'var(--text-primary)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  homeLink: {
    color: 'var(--text-muted)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
}

export function ExplorationBreadcrumb({ history, currentNodeId, currentLabel }: Props) {
  // Show at most last 4 entries to avoid overflow
  const visibleHistory = history.length > 4 ? history.slice(-4) : history
  const truncated = history.length > 4

  return (
    <nav aria-label="Exploration path" style={s.nav}>
      <Link to="/" style={s.homeLink}>Domains</Link>
      <span style={s.separator}>›</span>

      {truncated && (
        <>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>…</span>
          <span style={s.separator}>›</span>
        </>
      )}

      {visibleHistory
        .filter((entry) => entry.nodeId !== currentNodeId)
        .map((entry) => (
          <span key={entry.nodeId} style={{ display: 'contents' }}>
            <Link to={`/explore/${entry.nodeId}`} style={s.link} title={entry.label}>
              {entry.label}
            </Link>
            <span style={s.separator}>›</span>
          </span>
        ))}

      <span style={s.current} title={currentLabel}>
        {currentLabel}
      </span>
    </nav>
  )
}
