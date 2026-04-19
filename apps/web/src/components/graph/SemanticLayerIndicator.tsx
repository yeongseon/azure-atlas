const LAYERS = [
  { label: 'Principles & Patterns', y: 0 },
  { label: 'Domains & Services', y: 500 },
  { label: 'Operations & Evidence', y: 1000 },
]

const s: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    left: 12,
    top: 80,
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    pointerEvents: 'none',
  },
  label: {
    fontSize: '0.68rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    opacity: 0.7,
    padding: '2px 8px',
    background: 'var(--surface-1)',
    borderRadius: 6,
    border: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  },
}

interface Props {
  visible: boolean
}

export function SemanticLayerIndicator({ visible }: Props) {
  if (!visible) return null

  return (
    <div style={s.container}>
      {LAYERS.map(({ label }) => (
        <div key={label} style={s.label}>
          {label}
        </div>
      ))}
    </div>
  )
}
