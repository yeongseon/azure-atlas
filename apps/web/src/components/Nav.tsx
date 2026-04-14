import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    height: '54px',
    padding: '0 2rem',
    background: 'var(--nav-bg)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 700,
    fontSize: '1.1rem',
    color: 'var(--nav-text)',
    textDecoration: 'none',
    marginRight: '3rem',
  },
  logoSvg: {
    width: '20px',
    height: '20px',
    color: 'var(--brand)',
  },
  links: {
    display: 'flex',
    gap: '2rem',
    height: '100%',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    borderBottom: '2px solid transparent',
    transition: 'color var(--transition)',
    fontWeight: 500,
  },
  activeLink: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: 'var(--brand)',
    textDecoration: 'none',
    borderBottom: '2px solid var(--brand)',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    marginLeft: 'auto',
    alignItems: 'center',
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
    marginRight: '0.5rem',
  },
  searchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
}

export default function Nav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  
  const isHome = pathname === '/' || pathname.startsWith('/domains') || pathname.startsWith('/nodes')
  const isGraph = pathname === '/graph'
  const isSearch = pathname.startsWith('/search')
  const isJourneys = pathname.startsWith('/journeys')

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <svg style={styles.logoSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="19" r="3"></circle>
          <line x1="8.12" y1="16.88" x2="15.88" y2="7.12"></line>
        </svg>
        Azure Atlas
      </Link>
      
      <div style={styles.links}>
        <Link to="/" style={isHome ? styles.activeLink : styles.link} aria-current={isHome ? 'page' : undefined}>Domains</Link>
        <Link to="/graph" style={isGraph ? styles.activeLink : styles.link} aria-current={isGraph ? 'page' : undefined}>Graph</Link>
        <Link to="/search" style={isSearch ? styles.activeLink : styles.link} aria-current={isSearch ? 'page' : undefined}>Search</Link>
        <Link to="/journeys" style={isJourneys ? styles.activeLink : styles.link} aria-current={isJourneys ? 'page' : undefined}>Journeys</Link>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.themeBtn}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <button 
          type="button" 
          style={styles.searchBtn} 
          onClick={() => navigate('/search')}
          aria-label="Search"
          className="search-nav-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </nav>
  )
}
