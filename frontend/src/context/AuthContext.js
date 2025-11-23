// frontend/context/AuthContext.js

import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { disconnectSocket } from "../services/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ← Now it's available here

  // Check if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchUser = async () => {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
        } catch (err) {
          console.error("Token invalid, logging out...");
          localStorage.removeItem("token");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, user } = res.data;

      localStorage.setItem("token", accessToken);
      setUser(user);
      navigate("/chat", { replace: true }); // Go to chat after login
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  // FINAL FIXED LOGOUT — WORKS 100%
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    disconnectSocket?.();
    // setOnlineUsers?.();
    // setChats?.([]);
    // setMessgaes?.([]);
    // setSelectedChat([]);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
