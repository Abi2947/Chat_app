// src/context/ChatContext.js
import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../services/api";
import { getSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Use ref to always have current selectedChat value in socket handlers
  const selectedChatRef = useRef(selectedChat);
  
  // Keep ref in sync with state
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // FETCH ALL USERS
  useEffect(() => {
    if (!user) return;

    api
      .get("/users")
      .then((res) => setAllUsers(res.data.users || res.data))
      .catch((err) => console.error("Failed to load users:", err));
  }, [user]);

  // SOCKET LOGIC — SAFE & CLEAN
  useEffect(() => {
    if (!user) {
      // User logged out → clean up socket
      disconnectSocket();
      setOnlineUsers([]);
      return;
    }

    const socket = getSocket();

    // SAFETY: If socket not ready yet (token missing), wait
    if (!socket) {
      console.log("Socket not ready yet...");
      return;
    }

    // Wait for socket to connect before setting up listeners
    const setupSocketListeners = () => {
      console.log(" Setting up socket listeners for user:", user.username);
      
      // Tell server: I'm online (user already joined room on connection, but emit for consistency)
      socket.emit("user-online", user._id);
      console.log("Emitted user-online with userId:", user._id);

      // Listen for online users list
      socket.on("online-users", (users) => {
        console.log(" Online users updated:", users);
        setOnlineUsers(users);
      });

      // Listen for incoming messages
      socket.on("receive-message", (msg) => {
        console.log(" Received message:", {
          chatId: msg.chatId,
          sender: msg.sender?.username,
          content: msg.content?.substring(0, 50),
          currentChatId: selectedChatRef.current?._id,
        });
        
        // If message is for currently open chat → add to messages
        if (selectedChatRef.current?._id === msg.chatId) {
          console.log(" Message is for current chat, adding to messages");
          setMessages((prev) => {
            // Check for duplicates by _id (real MongoDB _id)
            if (prev.some((m) => m._id === msg._id && typeof m._id === 'string')) {
              console.log(" Duplicate message detected, skipping");
              return prev;
            }
            
            // Replace optimistic update (temporary message with number _id) with real message
            // If this message was sent by current user and has same content, replace the optimistic one
            const currentUserId = user._id.toString();
            const msgSenderId = msg.sender?._id?.toString();
            const isOwnMessage = msgSenderId === currentUserId;
            
            if (isOwnMessage) {
              // Find and remove the optimistic message (has number _id and same content)
              const optimisticIndex = prev.findIndex(
                (m) => typeof m._id === 'number' && m.content === msg.content
              );
              
              if (optimisticIndex !== -1) {
                // Replace optimistic message with real one
                const updated = [...prev];
                updated[optimisticIndex] = msg;
                return updated;
              }
            }
            
            // Otherwise, just add the message
            return [...prev, msg];
          });
        } else {
          console.log("    Message is for different chat, updating chat list only");
        }

        // Update latest message in sidebar for all chats
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === msg.chatId
              ? { ...chat, latestMessage: { ...msg, content: msg.content } }
              : chat
          )
        );
      });
      
      console.log(" Socket listeners set up successfully");
    };

    // If already connected, set up listeners immediately
    if (socket.connected) {
      setupSocketListeners();
    } else {
      // Wait for connection
      socket.once("connect", setupSocketListeners);
    }

    // Fetch chats on login
    const loadChats = async () => {
      try {
        const res = await api.get("/chat/");
        setChats(res.data);
      } catch (err) {
        console.error("Failed to load chats:", err);
      }
    };
    loadChats();

    // Cleanup on unmount or logout
    return () => {
      if (socket) {
        socket.emit("user-offline", user._id);
        socket.off("online-users");
        socket.off("receive-message");
        socket.off("connect");
      }
    };
  }, [user]); // ← ONLY DEPEND ON USER, NOT selectedChat

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const res = await api.get(`/chat/${chat._id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const createChat = async (recipientId) => {
    try {
      console.log("Creating chat with user ID:", { recipientId }); // ← THIS WILL SHOW IN CONSOLE
      const res = await api.post("/chat/create", { recipientId });
      console.log("Chat created successfully:", res.data);
      const newChat = res.data;
      setChats((prev) => [
        newChat,
        ...prev.filter((c) => c._id !== newChat._id),
      ]);
      selectChat(newChat);
    } catch (err) {
      console.error("CREATE CHAT FAILED:", err.response?.data || err.message);
      alert("Could not start chat. Please try again.");
    }
  };

  const sendMessage = (content) => {
    if (!selectedChat || !content.trim() || !user) {
      console.warn("Cannot send message: missing chat, content, or user");
      return;
    }

    const socket = getSocket();
    if (!socket) {
      console.error("Socket not available for sending message");
      return;
    }

    // Ensure socket is connected before sending
    if (!socket.connected) {
      console.warn("Socket not connected. Attempting to connect...");
      socket.connect();
      // Wait a bit for connection, but still try to send
      setTimeout(() => {
        if (socket.connected) {
          sendMessage(content);
        } else {
          console.error("Socket still not connected. Message not sent.");
          alert("Connection lost. Please refresh the page.");
        }
      }, 1000);
      return;
    }

    const msg = {
      content: content.trim(),
      sender: user._id,
      chatId: selectedChat._id,
    };

    console.log(" Sending message:", msg);
    
    // Set a timeout to handle cases where callback doesn't fire
    let callbackFired = false;
    const timeout = setTimeout(() => {
      if (!callbackFired) {
        console.warn(" Message send callback timeout - assuming success (message may have been sent)");
        callbackFired = true;
      }
    }, 5000); // 5 second timeout
    
    socket.emit("send-message", msg, (error) => {
      callbackFired = true;
      clearTimeout(timeout);
      
      if (error) {
        console.error(" Error sending message:", error);
        // Remove the optimistic update if there was an error
        setMessages((prev) => {
          // Remove the temporary message (the one with Date.now() as _id)
          return prev.filter((m) => m._id !== msg._id || typeof m._id === 'string');
        });
        alert("Failed to send message. Please try again.");
      } else {
        console.log(" Message sent successfully");
      }
    });

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        _id: Date.now(), // temporary ID
        sender: { _id: user._id, username: user.username },
        createdAt: new Date(),
      },
    ]);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        allUsers,
        onlineUsers,
        selectedChat,
        messages,
        selectChat,
        createChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
