// frontend/src/components/UserList.js

import { useChat } from "../context/ChatContext";

export default function UserList() {
  const { chats, selectedChat, selectChat, onlineUsers } = useChat();
  // Removed unused: useAuth, createChat

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>No chats yet. Register another user and start messaging!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => {
        // Find the other participant (not current user)
        const other =
          chat.participants.find(
            (p) =>
              p._id !==
              chat.participants.find(
                (u) => u._id === chats[0]?.participants?.[0]?._id
              )?._id
          ) || chat.participants[1];

        const isOnline = onlineUsers.includes(other._id);

        return (
          <div
            key={chat._id}
            onClick={() => selectChat(chat)}
            className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-all ${
              selectedChat?._id === chat._id
                ? "bg-indigo-50 border-l-4 border-indigo-600"
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {other.username[0].toUpperCase()}
                </div>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-3 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {other.username}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {chat.latestMessage?.content || "No messages yet"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
