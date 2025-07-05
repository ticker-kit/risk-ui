import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL

function TickerMetrics() {
    const [ticker, setTicker] = useState('')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

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

    return (
        <div className='max-w-xl mx-auto p-4'>
            <h2 className='text-2xl font-bold mb-4'>Risk Metrics</h2>

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    fetchRiskMetrics()
                }}
                className='flex gap-2 mb-4'>
                <input
                    type='text'
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder='Enter ticker (e.g., AAPL)'
                    className='border px-3 py-2 rounded w-full'
                />
                <button
                    onClick={fetchRiskMetrics}
                    disabled={loading || !ticker}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Fetch Metrics'}
                </button>

            </form>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {data && (
                <div className="bg-gray-100 p-4 rounded shadow">
                    <h4 className="font-bold mb-2">Results for {data.ticker}</h4>
                    <ul className="space-y-1">
                        <li><strong>Mean Return:</strong> {data.mean_return}</li>
                        <li><strong>Volatility:</strong> {data.volatility}</li>
                        <li><strong>Sharpe Ratio:</strong> {data.sharpe_ratio}</li>
                        <li><strong>Max Drawdown:</strong> {data.max_drawdown}</li>
                    </ul>
                </div>
            )}

        </div>
    )
}

export default TickerMetrics
