import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for stored token on app load
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }

        setLoading(false)
    }, [])

    const login = async (username, password) => {
        try {
            const formData = new FormData()
            formData.append('username', username)
            formData.append('password', password)

            const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Login failed')
            }

            const data = await response.json()

            // Store token and user info
            localStorage.setItem('token', data.access_token)
            localStorage.setItem('user', JSON.stringify({ username }))

            setToken(data.access_token)
            setUser({ username })

            return { success: true }
        } catch (error) {
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
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!token,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
