import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getMe, changePassword as apiChangePassword } from "../services/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    // On mount: if token exists, validate with /auth/me
    const savedToken = localStorage.getItem("token") || localStorage.getItem("userToken");

    if (savedToken && savedToken !== "null" && savedToken !== "undefined" && savedToken.trim() !== "") {
      setToken(savedToken);
      fetchCurrentUser(savedToken);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentUser = async (authToken) => {
    try {
      // Temporarily set token so apiClient interceptor can use it
      if (authToken) {
        localStorage.setItem("token", authToken);
      }
      const data = await getMe();
      const userData = data.user || data.data || data;
      setUser(userData);
      setToken(authToken || localStorage.getItem("token"));
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to fetch user profile from /auth/me", err);
      // Token is invalid — load from localStorage fallback
      const savedUser = localStorage.getItem("loggedInUser");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (parseErr) {
          console.error("Failed to parse saved user", parseErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await registerUser(name, email, password);

      // Save token and user details if returned
      const userToken = data.token;
      const userData = data.user || { name, email };

      if (userToken) {
        setToken(userToken);
        localStorage.setItem("token", userToken);
        localStorage.setItem("userToken", userToken);
      }

      setUser(userData);
      localStorage.setItem("loggedInUser", JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Registration failed";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      
      // Save token and user details
      const userToken = data.token;
      const userData = data.user || { email };

      setToken(userToken);
      setUser(userData);

      localStorage.setItem("token", userToken);
      localStorage.setItem("userToken", userToken);
      localStorage.setItem("loggedInUser", JSON.stringify(userData));

      return { success: true, user: userData, isFirstLogin: data.isFirstLogin || userData.isFirstLogin };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Login failed";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("adminToken");
  };

  const updatePassword = async (newPassword) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiChangePassword(newPassword);
      return response;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Failed to update password";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, register, updatePassword, fetchCurrentUser, certificates, setCertificates }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
