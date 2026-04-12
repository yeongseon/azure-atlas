import { Link, useLocation } from 'react-router-dom'

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    padding: '0.75rem 2rem',
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#60a5fa',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    marginLeft: 'auto',
  },
  link: {
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  activeLink: {
    fontSize: '0.9rem',
    color: '#e2e8f0',
    fontWeight: 600,
  },
}

export default function Nav() {
  const { pathname } = useLocation()
  const linkStyle = (to: string) =>
    pathname === to || pathname.startsWith(to + '/') ? styles.activeLink : styles.link

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Azure Atlas</Link>
      <div style={styles.links}>
        <Link to="/" style={linkStyle('/__home')}>Domains</Link>
        <Link to="/search" style={linkStyle('/search')}>Search</Link>
      </div>
    </nav>
  )
}
