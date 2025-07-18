import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

function Dashboard() {
    const { token, handleTokenExpired } = useAuth()
    const [portfolioSummary, setPortfolioSummary] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [refreshing, setRefreshing] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch portfolio summary
            const portfolioResponse = await fetch(`${API_URL}/portfolio/summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (portfolioResponse.ok) {
                const portfolioData = await portfolioResponse.json()
                setPortfolioSummary(portfolioData)
            } else if (portfolioResponse.status === 401) {
                handleTokenExpired(portfolioResponse)
                return
            }

            // Fetch recent activity (price updates, etc.)
            const activityResponse = await fetch(`${API_URL}/recent-activity`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (activityResponse.ok) {
                const activityData = await activityResponse.json()
                setRecentActivity(activityData)
            }

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [API_URL, token, handleTokenExpired])

    const triggerFullRefresh = async () => {
        try {
            setRefreshing(true)

            const response = await fetch(`${API_URL}/trigger-portfolio-refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                if (response.status === 401) {
                    handleTokenExpired(response)
                }
                throw new Error('Failed to trigger portfolio refresh')
            }

            // Wait for processing then fetch updated data
            setTimeout(async () => {
                await fetchDashboardData()
            }, 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Portfolio Dashboard</h2>
                <button
                    onClick={triggerFullRefresh}
                    disabled={refreshing}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                    {refreshing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Refreshing...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Refresh All Data</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Portfolio Value</h3>
                    <div className="text-3xl font-bold text-green-600">
                        ${portfolioSummary?.total_value?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        {portfolioSummary?.total_positions || 0} positions
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Today's Change</h3>
                    <div className={`text-3xl font-bold ${(portfolioSummary?.daily_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {(portfolioSummary?.daily_change || 0) >= 0 ? '+' : ''}
                        ${portfolioSummary?.daily_change?.toFixed(2) || '0.00'}
                    </div>
                    <div className={`text-sm mt-1 ${(portfolioSummary?.daily_change_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {(portfolioSummary?.daily_change_percent || 0) >= 0 ? '+' : ''}
                        {portfolioSummary?.daily_change_percent?.toFixed(2) || '0.00'}%
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Last Updated</h3>
                    <div className="text-lg font-medium text-gray-700">
                        {portfolioSummary?.last_updated
                            ? new Date(portfolioSummary.last_updated).toLocaleString()
                            : 'Never'
                        }
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Real-time pricing
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link
                            to="/portfolio"
                            className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
                        >
                            Manage Portfolio
                        </Link>
                        <Link
                            to="/metrics"
                            className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded hover:bg-green-700"
                        >
                            Analyze Risk Metrics
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
                    {portfolioSummary?.top_performers?.length > 0 ? (
                        <div className="space-y-2">
                            {portfolioSummary.top_performers.slice(0, 3).map((performer) => (
                                <div key={performer.ticker} className="flex justify-between items-center">
                                    <span className="font-medium">{performer.ticker}</span>
                                    <span className={`text-sm font-medium ${performer.change >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {performer.change >= 0 ? '+' : ''}{performer.change.toFixed(2)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No performance data available</p>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                </div>
                <div className="px-6 py-4">
                    {recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {recentActivity.slice(0, 5).map((activity, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <div className="font-medium">{activity.description}</div>
                                        <div className="text-sm text-gray-500">{activity.ticker}</div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
