import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { user, token } = useAuth()
    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                setError('')

                // Check if current user is gooneraki
                if (user?.username !== 'gooneraki') {
                    setError('Access denied. This page is only available for gooneraki.')
                    setLoading(false)
                    return
                }

                const response = await fetch(`${API_URL}/users`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.detail || 'Failed to fetch users')
                }

                const usersData = await response.json()
                setUsers(usersData)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchUsers()
        }
    }, [user, token, API_URL])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="max-w-md w-full">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <strong className="font-bold">Error: </strong>
                        <span>{error}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Users Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Development tool - List of all registered users
                        </p>
                    </div>

                    <div className="px-6 py-4">
                        {users.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Username
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.username}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Total users: {users.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Users
