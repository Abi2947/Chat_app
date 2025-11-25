// frontend/src/pages/ChatPage.js
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const {
    onlineUsers,
    allUsers,
    chats,
    selectedChat,
    messages,
    sendMessage,
    selectChat,
    createChat,
  } = useChat();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [attachment, setAttachment] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handlelogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-4xl font-bold animate-pulse">
          Loading Friends Chat...
        </div>
      </div>
    );
  }

  // Filter online users (exclude self)
  const onlineUsersList = user
    ? onlineUsers
        .filter((id) => id !== user._id)
        .map((id) => allUsers.find((u) => u._id === id))
        .filter(Boolean)
    : [];

  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const buildFileUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`;
  };

  const renderTextWithLinks = (text = "") => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (/^https?:\/\//.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="text-blue-200 underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderAttachment = (msg) => {
    if (msg.messageType === "image" && msg.fileUrl) {
      return (
        <img
          src={buildFileUrl(msg.fileUrl)}
          alt={msg.fileName || "Shared image"}
          className="rounded-2xl max-h-64 object-cover"
        />
      );
    }

    if (msg.messageType === "video" && msg.fileUrl) {
      return (
        <video
          src={buildFileUrl(msg.fileUrl)}
          controls
          className="rounded-2xl max-h-64"
        />
      );
    }

    if (msg.messageType === "file" && msg.fileUrl) {
      return (
        <a
          href={buildFileUrl(msg.fileUrl)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm underline"
        >
          📎 {msg.fileName || "Download file"}
        </a>
      );
    }

    return null;
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];
    setAttachment(file || null);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const messageInput = event.target.message;
    const text = messageInput.value.trim();

    if (!text && !attachment) {
      return;
    }

    setIsSending(true);
    try {
      await sendMessage({ content: text, attachment });
      messageInput.value = "";
      setAttachment(null);
      if (event.target.attachment) {
        event.target.attachment.value = "";
      }
    } finally {
      setIsSending(false);
    }
  };

  const getUserChat = (userId) =>
    chats.find(
      (chat) =>
        !chat.isGroupChat &&
        chat.participants.some((participant) => participant._id === userId)
    );

  const getLatestPreview = (chat) => {
    if (!chat?.latestMessage) return null;
    if (chat.latestMessage.previewText) return chat.latestMessage.previewText;
    const msg = chat.latestMessage;
    if (msg.messageType === "image") return "📷 Photo";
    if (msg.messageType === "video") return "🎬 Video";
    if (msg.messageType === "file") return msg.fileName || "📎 Attachment";
    return msg.content;
  };

  return (
    <div
      className={`h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      } flex flex-col md:flex-row overflow-hidden`}
    >
      {/* SIDEBAR */}
      <div
        className={`w-full md:w-80 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-2xl border-r ${
          darkMode ? "border-gray-700" : "border-gray-200"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-black">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-sm opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={handlelogout}
              className="logout btn px-4 py-2 bg-red-600 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ALL USERS LIST — ONLINE + OFFLINE */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4">
              ALL USERS ({allUsers.length})
            </h3>
            <div className="space-y-2">
              {allUsers
                .filter((u) => u._id !== user._id) // hide self
                .map((u) => {
                  const isOnline = onlineUsers.includes(u._id);
                  const userChat = getUserChat(u._id);
                  const unreadCount = userChat?.unreadCount || 0;
                  const latestPreview = getLatestPreview(userChat);
                  return (
                    <div
                      key={u._id}
                      onClick={() => {
                        if (userChat) {
                          selectChat(userChat);
                        } else {
                          createChat(u._id);
                        }
                      }}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition cursor-pointer"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {u.username[0].toUpperCase()}
                        </div>
                        {isOnline ? (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
                        ) : (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 rounded-full border-4 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {u.username}
                          </p>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs ${
                            isOnline ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {isOnline ? "Online" : "Offline"}
                        </p>
                        {latestPreview && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {unreadCount > 0 ? "New • " : ""}
                            {latestPreview}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedChat ? (
          <>
            {/* Chat Header - Fixed at top */}
            <div
              className={`flex-shrink-0 bg-white dark:bg-gray-800 shadow-md p-5 border-b dark:border-gray-700 flex justify-between items-center`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedChat.participants
                    .find((p) => p._id !== user._id)
                    ?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p
                    className={`font-bold text-xl ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedChat.participants.find((p) => p._id !== user._id)
                      ?.username || "User"}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {onlineUsers.includes(
                      selectedChat.participants.find((p) => p._id !== user._id)
                        ?._id
                    )
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 space-y-6">
              {messages.map((msg, i) => {
                const isMe = msg.sender._id === user._id;
                return (
                  <div
                    key={i}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-6 py-4 rounded-3xl shadow-lg ${
                        isMe
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border dark:border-gray-700"
                      }`}
                    >
                      {msg.messageType !== "text" && msg.fileUrl && (
                        <div className="mb-3">{renderAttachment(msg)}</div>
                      )}
                      {msg.content && (
                        <div className="text-lg font-medium space-y-1 break-words">
                          {renderTextWithLinks(msg.content)}
                        </div>
                      )}
                      <p className="text-xs opacity-75 mt-2 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {/* Invisible element at the end to scroll to */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form - Fixed at bottom */}
            <form
              onSubmit={handleSend}
              className="flex-shrink-0 bg-white dark:bg-gray-800 p-6 border-t dark:border-gray-700"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {attachment && (
                    <div className="flex items-center gap-2 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 px-3 py-1 rounded-full">
                      <span className="max-w-[160px] truncate">
                        {attachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <label className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-300">
                    <input
                      type="file"
                      name="attachment"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleAttachmentChange}
                    />
                    <span className="px-4 py-2 rounded-full border border-purple-300 dark:border-purple-600">
                      📎 Attach
                    </span>
                  </label>
                  <input
                    name="message"
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-6 py-4 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-400 transition"
                    autoFocus
                  />

                  <button
                    type="submit"
                    disabled={isSending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-10 py-4 rounded-full font-bold transition shadow-xl"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </form>
            
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <p className="text-3xl text-gray-500 dark:text-gray-400 font-light">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
