import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL

function TickerMetrics() {
    const [ticker, setTicker] = useState('')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [priceData, setPriceData] = useState(null)
    const [refreshingPrice, setRefreshingPrice] = useState(false)

    const fetchRiskMetrics = async () => {
        setLoading(true)
        setData(null)
        setError(null)

        try {
            const res = await fetch(`${API_BASE}/risk_metrics_from_ticker`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ticker })
            })

            const result = await res.json()
            if (!res.ok) {
                throw new Error(result.error || 'Failed to fetch risk metrics')
            }

            setData(result)

        }
        catch (err) {
            console.error(err);
            setError(err.message)
        }

        setLoading(false)
    }

    const fetchLatestPrice = async (tickerSymbol) => {
        try {
            const response = await fetch(`${API_BASE}/latest-price/${tickerSymbol}`)

            if (response.ok) {
                const data = await response.json()
                setPriceData(data)
            } else {
                setPriceData(null)
            }
        } catch (err) {
            console.error('Failed to fetch price:', err)
            setPriceData(null)
        }
    }

    const triggerPriceRefresh = async () => {
        if (!ticker) return

        try {
            setRefreshingPrice(true)
            const response = await fetch(`${API_BASE}/trigger-price-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticker }),
            })

            if (!response.ok) {
                throw new Error('Failed to trigger price update')
            }

            // Wait a moment for the async worker to process, then fetch updated price
            setTimeout(async () => {
                await fetchLatestPrice(ticker)
            }, 2000)
        } catch (err) {
            setError(err.message)
        } finally {
            setRefreshingPrice(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await fetchRiskMetrics()
        await fetchLatestPrice(ticker)
    }

    return (
        <div className='max-w-xl mx-auto p-4'>
            <h2 className='text-2xl font-bold mb-4'>Risk Metrics</h2>

            <form
                onSubmit={handleSubmit}
                className='flex gap-2 mb-4'>
                <input
                    type='text'
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder='Enter ticker (e.g., AAPL)'
                    className='border px-3 py-2 rounded w-full'
                />
                <button
                    type="submit"
                    disabled={loading || !ticker}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Fetch Metrics'}
                </button>

            </form>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* Latest Price Section */}
            {ticker && (
                <div className="bg-blue-50 p-4 rounded shadow mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold">Latest Price for {ticker.toUpperCase()}</h4>
                        <button
                            onClick={triggerPriceRefresh}
                            disabled={refreshingPrice}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
                        >
                            {refreshingPrice ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    <span>Refreshing...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Refresh</span>
                                </>
                            )}
                        </button>
                    </div>
                    {priceData ? (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Price: </span>
                                <span className="text-lg font-bold text-green-600">
                                    ${priceData.price?.toFixed(2) || 'N/A'}
                                </span>
                            </div>
                            {priceData.timestamp && (
                                <div>
                                    <span className="font-medium">Updated: </span>
                                    <span className="text-gray-600">
                                        {new Date(priceData.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            No price data available. Click refresh to fetch latest price.
                        </p>
                    )}
                </div>
            )}

            {data && (
                <div className="bg-gray-100 p-4 rounded shadow">
                    <h4 className="font-bold mb-2">Risk Metrics for {data.ticker}</h4>
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
