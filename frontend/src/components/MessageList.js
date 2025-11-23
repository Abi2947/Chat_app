// frontend/src/components/MessageList.js

import { useChat } from "../context/ChatContext";
import { useEffect, useRef } from "react";

export default function MessageList() {
  const { messages, selectedChat } = useChat();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedChat) return null;

  const otherUser =
    selectedChat.participants.find(
      (p) => p._id !== selectedChat.participants[0]._id
    ) || selectedChat.participants[1];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
      <div className="text-center text-gray-500 text-sm mb-4 font-medium">
        Chatting with{" "}
        <span className="font-bold text-indigo-600">{otherUser?.username}</span>
      </div>

      {messages.map((msg, i) => {
        const isMe = msg.sender._id === selectedChat.participants[0]._id;
        return (
          <div
            key={i}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm ${
                isMe
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-800 border"
              }`}
            >
              <p>{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
