import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Dashboard from './pages/Dashboard'
import TickerMetrics from './pages/TickerMetrics'
import Portfolio from './pages/Portfolio'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Users from './pages/Users'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user, logout, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 font-sans">
      <nav className="mb-6 flex justify-between items-center">
        <div className="space-x-4">
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
          )}
          <Link to="/metrics" className="text-blue-600 hover:underline">Ticker Metrics</Link>
          {isAuthenticated && (
            <Link to="/portfolio" className="text-blue-600 hover:underline">Portfolio</Link>
          )}
          {isAuthenticated && user?.username === 'gooneraki' && (
            <Link to="/users" className="text-blue-600 hover:underline">Users</Link>
          )}
        </div>

        <div className="space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
              <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/metrics" element={<TickerMetrics />} />
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}

export default App
