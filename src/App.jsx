/**
 * App.jsx — Main application component
 *
 * Recursion Visualizer - A tool to visualize how recursive functions execute,
 * showing the call tree, call stack, and execution flow step by step.
 *
 * Entirely offline — no external API keys or dependencies required.
 */

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
