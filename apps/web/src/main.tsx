import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const Router = import.meta.env.VITE_ATLAS_MODE === 'static' ? HashRouter : BrowserRouter

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

// Initialize theme before render to prevent flash
;(function initTheme() {
  const stored = localStorage.getItem('azure-atlas-theme')
  const theme = stored === 'light' || stored === 'dark'
    ? stored
    : 'light'
  document.documentElement.setAttribute('data-theme', theme)
})()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  </StrictMode>,
)
