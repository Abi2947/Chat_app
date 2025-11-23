// frontend/src/pages/ChatPage.js
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect } from "react";
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
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handlelogout=()=>{
    logout();
    navigate("/",{replace: true});
  }

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

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
  const onlineUsersList = onlineUsers
    .filter((id) => id !== user._id)
    .map((id) => allUsers.find((u) => u._id === id))
    .filter(Boolean);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      } flex flex-col md:flex-row`}
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
                  return (
                    <div
                      key={u._id}
                      onClick={() => {
                        const existingChat = chats.find((c) =>
                          c.participants.some((p) => p._id === u._id)
                        );
                        if (existingChat) {
                          selectChat(existingChat);
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
                        <p
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {u.username}
                        </p>
                        <p
                          className={`text-xs ${
                            isOnline ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div
              className={`bg-white dark:bg-gray-800 shadow-md p-5 border-b dark:border-gray-700 flex justify-between items-center`}
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
                      <p className="text-lg font-medium">{msg.content}</p>
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
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.target.message.value.trim();
                if (input) {
                  sendMessage(input);
                  e.target.message.value = "";
                }
              }}
              className="bg-white dark:bg-gray-800 p-6 border-t dark:border-gray-700"
            >
              <div className="flex gap-4">
                <input
                  name="message"
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-6 py-4 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-400 transition"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-full font-bold transition shadow-xl"
                >
                  Send
                </button>
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
