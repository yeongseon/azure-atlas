import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import WorldMapPage from './pages/WorldMapPage'

const ConceptGraphPage = lazy(() => import('./pages/ConceptGraphPage'))
const UnifiedGraphPage = lazy(() => import('./pages/UnifiedGraphPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const JourneyPage = lazy(() => import('./pages/JourneyPage'))

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<div className="loading">Loading…</div>}>
          <Routes>
            <Route path="/" element={<WorldMapPage />} />
            <Route path="/journeys" element={<WorldMapPage />} />
            <Route path="/domains/:domainId" element={<ConceptGraphPage />} />
            <Route path="/nodes/:nodeId" element={<ConceptGraphPage />} />
            <Route path="/graph" element={<UnifiedGraphPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/journeys/:journeyId" element={<JourneyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
