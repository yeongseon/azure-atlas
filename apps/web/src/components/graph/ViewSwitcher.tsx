import { useCallback } from 'react'

export type ViewType = 'taxonomy' | 'topology' | 'dependency' | 'journey'

interface ViewOption {
  value: ViewType
  label: string
  description: string
}

const VIEW_OPTIONS: ViewOption[] = [
  { value: 'taxonomy', label: 'Taxonomy', description: 'Hierarchical classification' },
  { value: 'topology', label: 'Topology', description: 'All relationships' },
  { value: 'dependency', label: 'Dependency', description: 'Implementation links' },
  { value: 'journey', label: 'Journey', description: 'Learning paths' },
]

interface Props {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    background: 'var(--surface-2)',
    borderRadius: 10,
    padding: 3,
    border: '1px solid var(--border)',
  },
  tab: {
    padding: '5px 12px',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 140ms ease',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    padding: '5px 12px',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    borderRadius: 8,
    border: 'none',
    background: 'var(--surface-1)',
    cursor: 'default',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    whiteSpace: 'nowrap',
  },
}

export function ViewSwitcher({ activeView, onViewChange }: Props) {
  const handleClick = useCallback(
    (view: ViewType) => {
      if (view !== activeView) onViewChange(view)
    },
    [activeView, onViewChange],
  )

  return (
    <div style={s.container}>
      {VIEW_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          title={VIEW_OPTIONS.find((o) => o.value === value)?.description}
          style={value === activeView ? s.tabActive : s.tab}
          onClick={() => handleClick(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
