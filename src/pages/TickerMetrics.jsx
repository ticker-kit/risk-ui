import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import PriceChart from '../components/PriceChart'

/**
 * @typedef {{
 *  symbol: string,
 *  shortname: string | null,
 *  exchange: string | null,
 *  quoteType: string | null,
 *  longname: string | null,
 *  index: string | null,
 *  score: number | null,
 *  typeDisp: string | null,
 *  exchDisp: string | null,
 *  isYahooFinance: boolean | null
 * }} TickerSearchReference
 */

/**
 * @typedef {{
 *  ticker: string,
 *  info: {
 *    industryDisp?: string,
 *    sectorDisp?: string,
 *    longBusinessSummary?: string,
 *    currency?: string,
 *    enterpriseValue?: number,
 *    bookValue?: number,
 *    marketCap?: number,
 *    typeDisp?: string,
 *    shortName?: string,
 *    longName?: string,
 *    fullExchangeName?: string,
 *    currentPrice?: number,
 *    previousClose?: number,
 *    regularMarketChangePercent?: number,
 *    fiftyTwoWeekLow?: number,
 *    fiftyTwoWeekHigh?: number,
 *    volume?: number,
 *    averageVolume?: number,
 *    beta?: number,
 *    trailingPE?: number,
 *    dividendYield?: number
 *  } | null,
 *  time_series_data: {
 *    date?: string[],
 *    close?: number[],
 *    close_fitted?: number[],
 *    long_term_deviation_z?: number[],
 *    rolling_return_1w?: number[],
 *    rolling_return_z_score_1w?: number[],
 *    rolling_return_1m?: number[],
 *    rolling_return_z_score_1m?: number[],
 *    rolling_return_1y?: number[],
 *    rolling_return_z_score_1y?: number[]
 *  } | null,
 *  error_msg: string | null,
 *  cagr?: number,
 *  cagr_fitted?: number,
 *  long_term_deviation_rmse?: number,
 *  long_term_deviation_rmse_normalized?: number,
 *  returns_mean_annualized?: number,
 *  returns_std_annualized?: number,
 *  returns_cv?: number,
 *  max_drawdown?: number
 * }} TickerMetricsResponse
 */


const API_BASE = import.meta.env.VITE_API_URL

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

    const fetchTickerMetrics = async (tickerSymbol) => {

        setLoading(true)
        setData(null)
        setError(null)

        try {
            const res = await fetch(`${API_BASE}/ticker/${tickerSymbol}`);

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
                result.time_series_data.date = result.time_series_data.date.map(date => new Date(date));
                setData(result)
                setTicker(tickerSymbol)
            }

        }
        catch (err) {
            setError(err.message)
        }

        setLoading(false)
    }


    useEffect(() => {

        const tickerUrl = searchParams.get('ticker');

        if (tickerUrl) {
            fetchTickerMetrics(tickerUrl);
        }
    }, [searchParams]);

    useEffect(() => {
        // Auto remove selected index if dropdown is closed
        if (!showDropdown) {
            setSelectedIndex(-1)
        }
    }, [showDropdown]);

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
            }
        } catch (err) {
            console.error('Search failed:', err)
            setSearchResults([])
            setShowDropdown(false)
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
            }, 500)
    }

    const handleFocus = () => {
        if (searchResults.length > 0) {
            setShowDropdown(true)
            setSelectedIndex(searchResults.findIndex(item => item.symbol === ticker))
        }
        else {
            setShowDropdown(false)
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
        setSearchParams({ ticker: selectedTicker })

    }, [setSearchParams])

    // Memoize the chart data transformation to avoid recalculating on every render
    const chartData = useMemo(() => {
        if (!data?.time_series_data?.date) {
            return [];
        }

        const result = data.time_series_data.date.map((date, index) => ({
            date: date,
            close: data.time_series_data.close[index],
            closeFitted: data.time_series_data.close_fitted?.[index]
        }));

        return result;
    }, [data]);

    // Memoize chart formatters to avoid creating new functions on every render
    const xAxisFormatter = useCallback((value) => value.toLocaleDateString(), []);

    const yAxisFormatter = useCallback((value) => value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }), []);

    // Effect to handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
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
        <div className='max-w-4xl mx-auto p-4'>
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
                <div className="space-y-6">
                    {/* Company Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{data.info?.longName || data.ticker}</h3>
                                <p className="text-lg text-gray-600">{data.info?.shortName}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{data.info?.typeDisp}</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">{data.info?.sectorDisp}</span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">{data.info?.industryDisp}</span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">{data.info?.fullExchangeName}</span>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 text-right">
                                <div className="text-3xl font-bold text-gray-900">
                                    {data.info?.currentPrice?.toFixed(2)} {data.info?.currency}
                                </div>
                                <div className={`text-sm ${data.info?.regularMarketChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {data.info?.regularMarketChangePercent >= 0 ? '+' : ''}{(data.info?.regularMarketChangePercent * 100)?.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sample Period Information */}
                    {data.time_series_data?.date && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Sample Period</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">First Date</div>
                                    <div className="text-xl font-semibold text-gray-900">
                                        {data.time_series_data.date[0].toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Last Date (Reference)</div>
                                    <div className="text-xl font-semibold text-gray-900">
                                        {data.time_series_data.date[data.time_series_data.date.length - 1].toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-600">Total Years</div>
                                    <div className="text-xl font-semibold text-gray-900">
                                        {(() => {
                                            const firstDate = data.time_series_data.date[0];
                                            const lastDate = data.time_series_data.date[data.time_series_data.date.length - 1];
                                            const diffTime = Math.abs(lastDate - firstDate);
                                            const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
                                            return diffYears.toFixed(1);
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Historical Risk & Return Metrics */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Historical Risk & Return Analysis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-blue-600">CAGR (Actual)</div>
                                <div className="text-xl font-semibold text-blue-900">
                                    {data.cagr ? `${(data.cagr * 100).toFixed(2)}%` : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-blue-600">CAGR (Model Fitted)</div>
                                <div className="text-xl font-semibold text-blue-900">
                                    {data.cagr_fitted ? `${(data.cagr_fitted * 100).toFixed(2)}%` : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-sm text-green-600">Annualized Mean Return</div>
                                <div className="text-xl font-semibold text-green-900">
                                    {data.returns_mean_annualized ? `${(data.returns_mean_annualized * 100).toFixed(2)}%` : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-sm text-yellow-600">Annualized Volatility</div>
                                <div className="text-xl font-semibold text-yellow-900">
                                    {data.returns_std_annualized ? `${(data.returns_std_annualized * 100).toFixed(2)}%` : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="text-sm text-purple-600">Coefficient of Variation</div>
                                <div className="text-xl font-semibold text-purple-900">
                                    {data.returns_cv ? data.returns_cv.toFixed(2) : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-sm text-red-600">Maximum Drawdown</div>
                                <div className="text-xl font-semibold text-red-900">
                                    {data.max_drawdown ? `${(data.max_drawdown * 100).toFixed(2)}%` : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Performance & Z-Scores */}
                    {data.time_series_data && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">Current Performance & Risk Analysis</h4>
                                <div className="text-sm text-gray-500">
                                    As of: {data.time_series_data.date?.[data.time_series_data.date.length - 1]?.toLocaleDateString()}
                                </div>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Z-Score Info:</strong> Z-scores show how many standard deviations away the current value is from the historical average.
                                    Values between -2 and +2 are considered normal, beyond ±2 are unusual, and beyond ±3 are rare.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Current Position */}
                                <div className="space-y-4">
                                    <h5 className="font-semibold text-gray-800">Current Position</h5>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="text-sm text-gray-600">Actual Price</div>
                                            <div className="text-lg font-semibold">
                                                {data.time_series_data.close?.[data.time_series_data.close.length - 1]?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })} {data.info?.currency}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="text-sm text-gray-600">Model Fitted Price</div>
                                            <div className="text-lg font-semibold">
                                                {data.time_series_data.close_fitted?.[data.time_series_data.close_fitted.length - 1]?.toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })} {data.info?.currency}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="text-sm text-gray-600">Long-term Deviation (Z-Score)</div>
                                            <div className={`text-lg font-semibold ${Math.abs(data.time_series_data.long_term_deviation_z?.[data.time_series_data.long_term_deviation_z.length - 1] || 0) > 2
                                                ? 'text-red-600'
                                                : Math.abs(data.time_series_data.long_term_deviation_z?.[data.time_series_data.long_term_deviation_z.length - 1] || 0) > 1
                                                    ? 'text-yellow-600'
                                                    : 'text-green-600'
                                                }`}>
                                                {data.time_series_data.long_term_deviation_z?.[data.time_series_data.long_term_deviation_z.length - 1]?.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rolling Returns */}
                                <div className="space-y-4">
                                    <h5 className="font-semibold text-gray-800">Rolling Returns & Z-Scores</h5>
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-600">1 Week Return</div>
                                                <div className={`text-sm font-medium ${(data.time_series_data.rolling_return_1w?.[data.time_series_data.rolling_return_1w.length - 1] || 0) >= 0
                                                    ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {((data.time_series_data.rolling_return_1w?.[data.time_series_data.rolling_return_1w.length - 1] || 0) * 100).toFixed(2)}%
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Z-Score: {data.time_series_data.rolling_return_z_score_1w?.[data.time_series_data.rolling_return_z_score_1w.length - 1]?.toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-600">1 Month Return</div>
                                                <div className={`text-sm font-medium ${(data.time_series_data.rolling_return_1m?.[data.time_series_data.rolling_return_1m.length - 1] || 0) >= 0
                                                    ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {((data.time_series_data.rolling_return_1m?.[data.time_series_data.rolling_return_1m.length - 1] || 0) * 100).toFixed(2)}%
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Z-Score: {data.time_series_data.rolling_return_z_score_1m?.[data.time_series_data.rolling_return_z_score_1m.length - 1]?.toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="flex justify-between items-center">
                                                <div className="text-sm text-gray-600">1 Year Return</div>
                                                <div className={`text-sm font-medium ${(data.time_series_data.rolling_return_1y?.[data.time_series_data.rolling_return_1y.length - 1] || 0) >= 0
                                                    ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {((data.time_series_data.rolling_return_1y?.[data.time_series_data.rolling_return_1y.length - 1] || 0) * 100).toFixed(2)}%
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Z-Score: {data.time_series_data.rolling_return_z_score_1y?.[data.time_series_data.rolling_return_z_score_1y.length - 1]?.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price Chart */}
                    {chartData.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Price Chart</h4>
                            <div className="h-96">
                                <PriceChart
                                    chartData={chartData}
                                    xAxisFormatter={xAxisFormatter}
                                    yAxisFormatter={yAxisFormatter}
                                />
                            </div>
                        </div>
                    )}

                    {/* Business Summary */}
                    {data.info?.longBusinessSummary && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Business Summary</h4>
                            <p className="text-gray-700 leading-relaxed">{data.info.longBusinessSummary}</p>
                        </div>
                    )}

                    {/* Key Financial Metrics */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Financial Metrics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Market Cap</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {data.info?.marketCap ? `${(data.info.marketCap / 1e9).toFixed(2)}B ${data.info?.currency}` : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Enterprise Value</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {data.info?.enterpriseValue ? `${(data.info.enterpriseValue / 1e9).toFixed(2)}B ${data.info?.currency}` : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Book Value</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {data.info?.bookValue ? `${data.info.bookValue.toFixed(2)} ${data.info?.currency}` : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">P/E Ratio</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {data.info?.trailingPE ? data.info.trailingPE.toFixed(2) : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Beta</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {data.info?.beta ? data.info.beta.toFixed(2) : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Dividend Yield</div>
                                <div className="text-xl font-semibold text-gray-900">
                                    {data.info?.dividendYield ? `${(data.info.dividendYield * 100).toFixed(2)}%` : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Trading Information */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Trading Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-sm text-gray-600">Previous Close</div>
                                <div className="text-lg font-semibold">{data.info?.previousClose?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })} {data.info?.currency}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-sm text-gray-600">52W Range</div>
                                <div className="text-lg font-semibold">
                                    {data.info?.fiftyTwoWeekLow?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })} - {data.info?.fiftyTwoWeekHigh?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-sm text-gray-600">Volume</div>
                                <div className="text-lg font-semibold">
                                    {data.info?.volume ? data.info.volume.toLocaleString() : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="text-sm text-gray-600">Avg Volume</div>
                                <div className="text-lg font-semibold">
                                    {data.info?.averageVolume ? data.info.averageVolume.toLocaleString() : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default TickerMetrics
