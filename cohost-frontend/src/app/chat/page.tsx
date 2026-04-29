"use client";

import { useState } from "react";
import { useCohostStore } from "@/lib/store";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const setData = useCohostStore((s) => s.setData);

  const sendMessage = async () => {
    if (!input) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, "You: " + input, "Agent: " + data.reply]);

    // 🔥 IMPORTANT
    setData({
      itinerary: data.itinerary,
      ui: data.ui,
    });

    setInput("");
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Planner Agent</h2>

      <div className="border p-4 h-[400px] overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button onClick={sendMessage} className="bg-white text-black px-4">
          Send
        </button>
      </div>
    </div>
  );
}
