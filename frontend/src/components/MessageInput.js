//frontend/src/components/MessageInput.js

import { useState } from "react";
import { useChat } from "../context/ChatContext";

export default function MessageInput() {
  const [input, setInput] = useState("");
  const { sendMessage } = useChat();

  const handleSend = () => {
    if (input.trim()) {
      sendMessage({ content: input.trim() });
      setInput("");
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-5 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-8 rounded-full hover:bg-indigo-700 transition font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}
