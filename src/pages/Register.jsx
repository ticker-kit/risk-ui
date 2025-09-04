import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * @typedef {{
 *  success: boolean,
 *  message: string
 * }} AuthResult
 */

const validateUsername = (username) => {
    // Allow only letters and numbers
    const usernameRegex = /^[a-zA-Z0-9]+$/
    if (!usernameRegex.test(username)) {
        return 'Username can only contain letters and numbers'
    }

    // Minimum 3 characters
    if (username.length < 3) {
        return 'Username must be at least 3 characters long'
    }

    // Maximum 15 characters
    if (username.length > 15) {
        return 'Username must be at most 15 characters long'
    }

    return null
}

const Register = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [usernameError, setUsernameError] = useState('')
    const [loading, setLoading] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleUsernameChange = (e) => {
        const value = e.target.value
        setUsername(value)

        // Validate in real-time
        const error = validateUsername(value)
        setUsernameError(error || '')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const usernameValidationError = validateUsername(username)
        if (usernameValidationError) {
            setUsernameError(usernameValidationError)
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            return
        }

        setLoading(true)

        /** @type {AuthResult} */
        const result = await register(username, password)

        if (result.success) {
            navigate('/')
        } else {
            setError(result.message)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-theme-primary focus:border-theme-primary focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={handleUsernameChange}
                            />
                            {usernameError && (
                                <div className="text-red-600 text-sm mt-1">
                                    {usernameError}
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-theme-primary focus:border-theme-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-theme-primary focus:border-theme-primary focus:z-10 sm:text-sm"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-theme-primary hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link to="/login" className="text-theme-secondary hover:text-theme-primary">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register
