import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import RecursionVisualizer from './pages/RecursionVisualizer'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecursionVisualizer />} />
        <Route path="*" element={<RecursionVisualizer />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
