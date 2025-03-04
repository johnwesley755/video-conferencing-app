import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

const Chat = () => {
  const socket = useSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("message", (message: string) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket.off("message");
    };
  }, [socket]);

  const handleSend = () => {
    if (input.trim()) {
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <div className="w-1/3 h-64 bg-white border border-gray-300 p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, idx) => (
          <p key={idx} className="text-sm">
            {msg}
          </p>
        ))}
      </div>
      <div className="mt-2 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="border p-1 flex-1"
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-2">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
