import { Routes, Route, Navigate } from 'react-router-dom'
import WorldMapPage from './pages/WorldMapPage'
import ConceptGraphPage from './pages/ConceptGraphPage'
import SearchPage from './pages/SearchPage'
import JourneyPage from './pages/JourneyPage'
import Nav from './components/Nav'

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<WorldMapPage />} />
          <Route path="/domains/:domainId" element={<ConceptGraphPage />} />
          <Route path="/nodes/:nodeId" element={<ConceptGraphPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/journeys/:journeyId" element={<JourneyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
