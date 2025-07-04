import { useState } from 'react'

function App() {
  const [ticker, setTicker] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchRiskMetrics = async () => {
    setLoading(true)
    setData(null)

    try {
      const res = await fetch('https://risk-api-7m3a.onrender.com/risk_metrics_from_ticker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticker })
      })

      const result = await res.json()
      setData(result)
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong');
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Risk Metrics API</h2>
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Enter ticker (e.g., AAPL)"
      />
      <button onClick={fetchRiskMetrics} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Risk Metrics'}
      </button>

      {data && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Risk Metrics for {ticker}</h4>
          <ul>
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

export default App;