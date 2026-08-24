import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import RecursionVisualizer from './pages/RecursionVisualizer'
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecursionVisualizer />} />
        <Route path="*" element={<RecursionVisualizer />} />
      </Routes>
      <Toaster />
      <Analytics />
    </Router>
  )
}

export default App
