import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'

function Portfolio() {
  const { token, handleTokenExpired } = useAuth()
  const searchTimeoutRef = useRef(null)
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Form state for adding new position
  const [newTicker, setNewTicker] = useState('')
  const [newQuantity, setNewQuantity] = useState('')
  const [addingPosition, setAddingPosition] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  // Edit state
  const [editingPosition, setEditingPosition] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL

  // Fetch portfolio positions
  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/portfolio`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Only auto-logout on 401, let other errors be handled normally
        if (response.status === 401) {
          handleTokenExpired(response)
        }
        throw new Error('Failed to fetch portfolio')
      }

      const data = await response.json()
      setPositions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [API_URL, token, handleTokenExpired])

  // Search tickers with debounce
  const searchTickers = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    try {
      setSearchLoading(true)
      const response = await fetch(`${API_URL}/search_ticker?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleTokenExpired(response)
        }
        throw new Error('Failed to search tickers')
      }

      const data = await response.json()
      setSearchResults(data)
      setShowSearchDropdown(data.length > 0)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
      setShowSearchDropdown(false)
    } finally {
      setSearchLoading(false)
    }
  }

  // Add new position
  const addPosition = async (e) => {
    e.preventDefault()
    if (!newTicker.trim() || !newQuantity) return

    try {
      setAddingPosition(true)
      setError(null)

      const response = await fetch(`${API_URL}/portfolio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: newTicker.trim(),
          quantity: parseFloat(newQuantity),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          handleTokenExpired(response)
        }
        throw new Error(errorData.detail || 'Failed to add position')
      }

      await fetchPositions()
      setNewTicker('')
      setNewQuantity('')
      setSearchQuery('')
      setSearchResults([])
      setShowSearchDropdown(false)
      setSuccess('Position added successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingPosition(false)
    }
  }

  // Update position quantity
  const updatePosition = async (symbol, quantity) => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/portfolio/${symbol}?quantity=${quantity}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          handleTokenExpired(response)
        }
        throw new Error(errorData.detail || 'Failed to update position')
      }

      await fetchPositions()
      setEditingPosition(null)
      setSuccess('Position updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  // Delete position
  const deletePosition = async (symbol) => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/portfolio/${symbol}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          handleTokenExpired(response)
        }
        throw new Error(errorData.detail || 'Failed to delete position')
      }

      await fetchPositions()
      setDeleteConfirm(null)
      setSuccess('Position deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setNewTicker(query)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // If query is empty, immediately hide dropdown
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchTickers(query)
    }, 300) // 300ms debounce delay
  }

  // Handle search result selection
  const handleSearchSelect = (ticker) => {
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    setNewTicker(ticker.symbol)
    setSearchQuery(ticker.symbol)
    setShowSearchDropdown(false)
    setSearchResults([])
  }

  // Handle edit start
  const startEdit = (position) => {
    setEditingPosition(position.ticker)
    setEditQuantity(position.quantity.toString())
  }

  // Handle edit save
  const saveEdit = () => {
    if (editingPosition && editQuantity) {
      updatePosition(editingPosition, parseFloat(editQuantity))
    }
  }

  // Handle keyboard navigation in search
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSearchDropdown(false)
    }
  }

  // Handle edit cancel
  const cancelEdit = () => {
    setEditingPosition(null)
    setEditQuantity('')
  }

  useEffect(() => {
    fetchPositions()

    // Cleanup function to clear search timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [fetchPositions])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.ticker-search-container')) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading portfolio...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Portfolio</h2>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add New Position Form */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add New Position</h3>
        <form onSubmit={addPosition} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ticker Search Input */}
            <div className="relative ticker-search-container">
              <label htmlFor="ticker" className="block text-sm font-medium text-gray-700 mb-1">
                Ticker Symbol
              </label>
              <input
                type="text"
                id="ticker"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search for a ticker (e.g., AAPL, Apple)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((ticker) => (
                    <button
                      key={ticker.symbol}
                      type="button"
                      onClick={() => handleSearchSelect(ticker)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    >
                      <div className="font-medium">{ticker.symbol}</div>
                      <div className="text-sm text-gray-600">{ticker.shortname || ticker.longname || 'No name available'}</div>
                    </button>
                  ))}
                </div>
              )}

              {searchLoading && (
                <div className="absolute right-3 top-9 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Quantity Input */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                placeholder="Enter quantity"
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={addingPosition}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingPosition ? 'Adding...' : 'Add Position'}
          </button>
        </form>
      </div>

      {/* Portfolio Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Your Positions</h3>
        </div>

        {positions.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No positions yet. Add your first position above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((position) => (
                  <tr key={position.ticker} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {position.ticker}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingPosition === position.ticker ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            step="0.01"
                            min="0.01"
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={saveEdit}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {position.quantity}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {editingPosition === position.ticker ? null : (
                          <button
                            onClick={() => startEdit(position)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(position.ticker)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the position for {deleteConfirm}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePosition(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio
