import { useCallback, useEffect, useRef, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'azure-atlas-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const isExplicitChoice = useRef(localStorage.getItem(STORAGE_KEY) !== null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (isExplicitChoice.current) {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (!isExplicitChoice.current) {
        setTheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = useCallback(() => {
    isExplicitChoice.current = true
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme } as const
}
