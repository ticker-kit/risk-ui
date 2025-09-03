import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext.js";

/**
 * @typedef {{
 *  success: boolean,
 *  message: string,
 *  access_token: string | null
 * }} AuthResponse
 */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to clear auth state
  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const setAuth = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  // Function to validate token with backend
  const validateToken = useCallback(async (tokenToValidate) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`,
        },
      });

      if (!response.ok) {
        console.error("Token validation failed, clearing auth state...");
        clearAuth();
        return false;
      }

      const userData = await response.json();
      setUser({ username: userData.username, currency: userData.currency });
      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      clearAuth();
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);

        // Validate the token with the backend
        const isValid = await validateToken(storedToken);

        if (!isValid) {
          // Token was invalid, auth state already cleared by validateToken
          setLoading(false);
          return;
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, [validateToken]);

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Login service unavailable.");
      }

      /** @type {AuthResponse} */
      const data = await response.json();

      if (data.success) {
        setAuth(data.access_token, { username, currency: data.currency });
      }

      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Registration service unavailable.");
      }

      /** @type {AuthResponse} */
      const data = await response.json();

      if (data.success) {
        setAuth(data.access_token, { username, currency: data.currency });
      }

      return data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    clearAuth();
  };

  // Function to handle expired/invalid tokens and auto-logout on 401
  const handleTokenExpired = (response) => {
    if (response && response.status === 401) {
      console.log("Token expired or invalid, logging out...");
      clearAuth();
    }
  };

  // Function to update user currency
  /**
   * Updates the user's currency in both the context state and localStorage
   * @param {string} newCurrency - The new currency code (e.g., "USD", "EUR")
   */
  const updateUserCurrency = (newCurrency) => {
    if (user) {
      const updatedUser = { ...user, currency: newCurrency };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

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
    updateUserCurrency,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
