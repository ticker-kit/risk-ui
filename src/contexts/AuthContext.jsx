import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext.js'


/**
 * @typedef {
 * { success: true, access_token: string, token_type: string } | 
 * { success: false, error: string }} LoginResponse
 */

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // Function to clear auth state
    const clearAuth = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    // Function to validate token with backend
    const validateToken = useCallback(async (tokenToValidate) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${tokenToValidate}`,
                },
            })

            if (!response.ok) {
                if (response.status !== 401) {
                    console.error('Token validation failed with status:', response.status)
                }
                // Token is invalid, clear auth state
                clearAuth()
                return false
            }

            const userData = await response.json()
            setUser({ username: userData.username })
            return true
        } catch (error) {
            console.error('Token validation failed:', error)
            clearAuth()
            return false
        }
    }, [])

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token')

            if (storedToken) {
                setToken(storedToken)

                // Validate the token with the backend
                const isValid = await validateToken(storedToken)

                if (!isValid) {
                    // Token was invalid, auth state already cleared by validateToken
                    setLoading(false)
                    return
                }
            }

            setLoading(false)
        }

        initializeAuth()
    }, [validateToken])

    const login = async (username, password) => {
        try {
            const formData = new FormData()
            formData.append('username', username)
            formData.append('password', password)


            /** @type {LoginResponse} */
            const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Login service unavailable.')
            }

            const data = await response.json()

            if (!data.success) {
                return { success: false, error: data.error }
            }

            // Store token and user info
            localStorage.setItem('token', data.access_token)
            localStorage.setItem('user', JSON.stringify({ username }))

            setToken(data.access_token)
            setUser({ username })

            return { success: true }
        } catch (error) {
            console.error('Login failed:', error)
            return { success: false, error: error.message }
        }
    }

    const register = async (username, password) => {
        try {
            const formData = new FormData()
            formData.append('username', username)
            formData.append('password', password)

            const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Registration failed')
            }

            const data = await response.json()

            // For register, we need to login after successful registration
            // since your API doesn't return a token on registration
            if (data.message === "User registered successfully") {
                return await login(username, password)
            }

            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const logout = () => {
        clearAuth()
    }

    // Function to handle expired/invalid tokens and auto-logout on 401
    const handleTokenExpired = (response) => {
        if (response && response.status === 401) {
            console.log('Token expired or invalid, logging out...')
            clearAuth()
        }
    }

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!token && !!user,
        validateToken,
        handleTokenExpired,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
