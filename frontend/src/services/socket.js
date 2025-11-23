// src/services/socket.js
import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  // If socket exists and is connected, return it
  if (socket?.connected) return socket;

  // If socket exists but not connected, try to reconnect
  if (socket && !socket.connected) {
    socket.connect();
    return socket;
  }

  // Create new socket if it doesn't exist
  try {
    // Decode JWT to get userId
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id || payload._id || payload.sub;

    if (!userId) {
      console.error("No userId found in token. Payload:", payload);
      return null;
    }

    console.log("Creating socket with userId:", userId);

    socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
      auth: { userId },
      transports: ["websocket", "polling"], // Add polling as fallback
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: false, // Reuse existing connection if available
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      console.log("✅ Socket authenticated with userId:", userId);
    });
    
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      console.error("Error details:", err);
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });

    socket.on("reconnect_error", (err) => {
      console.error("❌ Socket reconnection error:", err.message);
    });

    return socket;
  } catch (err) {
    console.error("Socket init failed:", err);
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const connectSocket = () => {
  const s = getSocket();
  if (s && !s.connected) s.connect();
  return s;
};
