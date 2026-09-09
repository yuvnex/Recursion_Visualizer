import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import RecursionVisualizer from './pages/RecursionVisualizer'
import SeoPageWrapper from './pages/SeoPageWrapper'
import { seoRoutes } from './lib/seoConfig'
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Shareable Visualization Routes */}
          <Route path="/visualize/:slug" element={<RecursionVisualizer />} />
          <Route path="/visualize" element={<RecursionVisualizer />} />

          {/* SEO Landing Page Routes */}
          {seoRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={<SeoPageWrapper route={route} />} 
            />
          ))}

          {/* Fallback */}
          <Route path="*" element={<RecursionVisualizer />} />
        </Routes>
        <Toaster />
        <Analytics />
      </Router>
    </HelmetProvider>
  )
}

export default App
