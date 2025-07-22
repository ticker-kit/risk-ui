import { useState, useEffect, useRef } from 'react'



/**
 * @typedef {{
 *  ticker: str,
 *  info: dict | null,
 *  prices: dict | null,
 *  mean_return: float | null,
 *  volatility: float | null,
 *  sharpe_ratio: float | null,
 *  max_drawdown: float | null,
 *  error_msg: str | None
 * }} TickerMetricsResponse
 */


const API_BASE = import.meta.env.VITE_API_URL

function TickerMetrics() {
    const [ticker, setTicker] = useState('')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)


    // Search dropdown states
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const debounceRef = useRef(null)
    const dropdownRef = useRef(null)

    const fetchTickerMetrics = async () => {
        setLoading(true)
        setData(null)
        setError(null)

        try {

            const res = await fetch(`${API_BASE}/ticker/${ticker}`);

            if (!res.ok) {
                throw new Error(`Request failed with '${res.status}' '${res.statusText}' at '${res.url}'`)
            }

            /** @type {TickerMetricsResponse} */
            const result = await res.json()

            if (result.error_msg) {
                setError(result.error_msg)
                setData(null)
            } else {
                setError(null)
                setData(result)
            }

        }
        catch (err) {
            setError(err.message)
        }

        setLoading(false)
    }

    // Search functionality
    const searchTickers = async (query) => {
        if (!query || query.trim().length < 1) {
            setSearchResults([])
            setShowDropdown(false)
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(`${API_BASE}/search_ticker?q=${encodeURIComponent(query)}`)
            if (response.ok) {
                const results = await response.json()
                setSearchResults(results)
                setShowDropdown(results.length > 0)
            } else {
                setSearchResults([])
                setShowDropdown(false)
            }
        } catch (err) {
            console.error('Search failed:', err)
            setSearchResults([])
            setShowDropdown(false)
        } finally {
            setIsSearching(false)
        }
    }

    const handleSearchChange = (value) => {
        setSearchQuery(value)
        setTicker(value)
        setSelectedIndex(-1)

        // Clear existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // Set new debounce
        debounceRef.current = setTimeout(() => {
            searchTickers(value)
        }, 300)
    }

    const handleKeyDown = (e) => {
        if (!showDropdown) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                    selectTicker(searchResults[selectedIndex])
                }
                break
            case 'Escape':
                setShowDropdown(false)
                setSelectedIndex(-1)
                break
        }
    }

    const selectTicker = (tickerItem) => {
        setTicker(tickerItem.symbol)
        setSearchQuery(tickerItem.symbol)
        setShowDropdown(false)
        setSelectedIndex(-1)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
                setSelectedIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [])



    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!ticker || ticker.trim().length === 0) return

        await fetchTickerMetrics()

    }

    return (
        <div className='max-w-xl mx-auto p-4'>
            <h2 className='text-2xl font-bold mb-4'>Ticker Metrics</h2>

            <form
                onSubmit={handleSubmit}
                className='flex gap-2 mb-4'>

                {/* Search Input with Dropdown */}
                <div className="relative flex-1" ref={dropdownRef}>
                    <input
                        type='text'
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='Search for ticker (e.g., Apple, AAPL)'
                        className='border px-3 py-2 rounded w-full'
                        autoComplete="off"
                    />

                    {/* Loading indicator for search */}
                    {isSearching && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.map((item, index) => (
                                <div
                                    key={item.symbol}
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${index === selectedIndex ? 'bg-blue-100' : ''
                                        }`}
                                    onClick={() => selectTicker(item)}
                                >
                                    <div className="font-medium">{item.symbol}</div>
                                    <div className="text-sm text-gray-600 truncate">{item.shortname}</div>
                                    <div className="text-xs text-gray-500">{item.typeDisp} - {item.exchDisp}</div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !ticker}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Fetch Metrics'}
                </button>

            </form>

            {error && <p className="text-red-600 mb-4">{error}</p>}



            {data && (
                <div className="bg-gray-100 p-4 rounded shadow">
                    <h4 className="font-bold mb-2">Ticker Metrics for {data.ticker}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="text-sm text-gray-600">Mean Return</div>
                            <div className="text-lg font-semibold">{data.mean_return}</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="text-sm text-gray-600">Volatility</div>
                            <div className="text-lg font-semibold">{data.volatility}</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="text-sm text-gray-600">Sharpe Ratio</div>
                            <div className="text-lg font-semibold">{data.sharpe_ratio}</div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <div className="text-sm text-gray-600">Max Drawdown</div>
                            <div className="text-lg font-semibold">{data.max_drawdown}</div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default TickerMetrics
