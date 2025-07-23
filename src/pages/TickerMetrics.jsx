import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * @typedef {{
 *  symbol: str,
 *  shortname: str | null,
 *  exchange: str | null,
 *  quoteType: str | null,
 *  longname: str | null,
 *  index: str | null,
 *  score: float | null,
 *  typeDisp: str | null,
 *  exchDisp: str | null,
 *  isYahooFinance: boolean | null
 * }} TickerSearchReference
 */

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

const cleanTicker = (ticker) => {
    if (!ticker) return ''
    return ticker.toString().replace(/\s+/g, '').toUpperCase()
}


function TickerMetrics() {
    const [searchParams, setSearchParams] = useSearchParams()

    // Search dropdown states
    const [searchQuery, setSearchQuery] = useState('')
    /** @type {[TickerSearchReference[], React.Dispatch<React.SetStateAction<TickerSearchReference[]>>]} */
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const debounceRef = useRef(null)
    const dropdownRef = useRef(null)


    // State to hold ticker and metrics data
    const [ticker, setTicker] = useState('')
    /** @type {[TickerMetricsResponse | null, React.Dispatch<React.SetStateAction<TickerMetricsResponse | null>>]} */
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const tickerUrl = searchParams.get('ticker');

    const fetchTickerMetrics = async (tickerSymbol) => {


        const cleanedTicker = cleanTicker(tickerSymbol)
        if (!cleanedTicker) return

        setLoading(true)
        setData(null)
        setError(null)

        try {
            const res = await fetch(`${API_BASE}/ticker/${cleanedTicker}`);

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
                setTicker(cleanedTicker)
            }

        }
        catch (err) {
            setError(err.message)
        }

        setLoading(false)
    }


    useEffect(() => {

        if (tickerUrl) {
            fetchTickerMetrics(tickerUrl);
        }
    }, [tickerUrl]);

    // Search functionality
    const searchTickers = async (query) => {


        setIsSearching(true)

        try {
            const response = await fetch(`${API_BASE}/search_ticker?q=${encodeURIComponent(query)}`)
            if (response.ok) {

                /** @type {TickerSearchReference[]} */
                const results = await response.json()

                setSearchResults(results)
                setShowDropdown(true) // Always show dropdown for both results and "no results"
                setSelectedIndex(results.length > 0 ? 0 : -1)
            } else {
                setSearchResults([])
                setShowDropdown(false)
                setSelectedIndex(-1)
            }
        } catch (err) {
            console.error('Search failed:', err)
            setSearchResults([])
            setShowDropdown(false)
            setSelectedIndex(-1)
        } finally {
            setIsSearching(false)
        }
    }

    const handleSearchChange = (searchValue) => {

        setSearchQuery(searchValue)

        // Clear existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // Set new debounce
        if (searchValue.trim())
            debounceRef.current = setTimeout(() => {
                searchTickers(searchValue)
            }, 300)
    }

    const handleFocus = () => {
        if (searchResults.length > 0) {
            setShowDropdown(true)
            setSelectedIndex(0)
        }
        else {
            setShowDropdown(false)
            setSelectedIndex(-1)
        }
    }

    const handleKeyDown = (e) => {

        if (e.key === 'Escape') {
            e.preventDefault()
            setShowDropdown(!showDropdown)
            setSelectedIndex(showDropdown ? 0 : -1)
        } else if (e.key === 'ArrowDown' && selectedIndex < searchResults.length - 1) {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1))
        } else if (e.key === 'ArrowUp' && selectedIndex > 0) {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault()
            selectTicker(searchResults[selectedIndex])
        }
    }

    const selectTicker = useCallback((tickerItem) => {


        const selectedTicker = tickerItem.symbol

        if (!selectedTicker) return

        setTicker(selectedTicker)
        setShowDropdown(false)
        setSelectedIndex(-1)
        setSearchParams({ ticker: selectedTicker })

    }, [setSearchParams])

    // Effect to handle clicks outside the dropdown
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
                debounceRef.current = null
            }
        }
    }, [])

    return (
        <div className='max-w-xl mx-auto p-4'>
            <h2 className='text-2xl font-bold mb-4'>Ticker Metrics</h2>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* Search Input with Dropdown */}
            <div className="mb-4">
                <div className="relative" ref={dropdownRef}>
                    <input
                        id="ticker-search"
                        type='text'
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => handleFocus()}
                        onKeyDown={(e) => { handleKeyDown(e) }}
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

                    {/* No results message - styled like dropdown */}
                    {showDropdown && searchResults.length === 0 && !isSearching && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            <div className="px-3 py-2 text-gray-500 text-center">
                                No results found
                            </div>
                        </div>
                    )}

                    {/* Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.map((searchItem, index) => (
                                <div
                                    key={`${searchItem.symbol}${searchItem.exchDisp}`}
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${index === selectedIndex ? 'bg-blue-100' : ''}`}
                                    onClick={() => selectTicker(searchItem)}
                                >
                                    <div className="font-medium">{searchItem.symbol}</div>
                                    <div className="text-sm text-gray-600 truncate">{searchItem.shortname}</div>
                                    <div className="text-xs text-gray-500">{searchItem.typeDisp} - {searchItem.exchDisp}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>



            {/* Current Ticker Display */}
            {ticker && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm text-blue-600">Selected Ticker:</span>
                            <span className="ml-2 text-lg font-semibold text-blue-800">{ticker}</span>
                        </div>
                        <button
                            onClick={() => {
                                setTicker('')
                                setData(null)
                                setError(null)
                                setSearchParams({ ticker: '' })
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}


            {data && !loading && (
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
