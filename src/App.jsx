
import { Routes, Route, Link } from 'react-router-dom'
import TickerMetrics from './pages/TickerMetrics'
import Portfolio from './pages/Portfolio'
import Home from './pages/Home'

function App() {
  return (
    <div className="p-6 font-sans">
      <nav className="mb-6 space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        <Link to="/metrics" className="text-blue-600 hover:underline">Ticker Metrics</Link>
        <Link to="/portfolio" className="text-blue-600 hover:underline">Portfolio</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/metrics" element={<TickerMetrics />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </div>
  )
}

export default App

