"use client";

import { useState, useRef, useEffect } from "react";
import { useCohostStore } from "@/lib/store";
import Renderer from "@/components/Renderer";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const setData = useCohostStore((s) => s.setData);
  const ui = useCohostStore((s) => s.ui);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Here's your itinerary!" },
      ]);
      if (data.itinerary || data.ui) {
        setData({ itinerary: data.itinerary, ui: data.ui });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* ── Chat panel ── */}
      <div className="flex flex-col w-1/2 border-r border-zinc-800">
        <header className="px-6 py-4 border-b border-zinc-800 shrink-0">
          <h1 className="text-base font-semibold tracking-tight">Cohost</h1>
          <p className="text-xs text-zinc-500 mt-0.5">AI Travel Planner · Google ADK</p>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 select-none">
              <span className="text-4xl mb-3">✈️</span>
              <p className="font-medium text-zinc-400">Ask me to plan a trip</p>
              <p className="text-sm mt-1 text-zinc-600">"3-day food trip to Tokyo"</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-400 rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex gap-1 items-center">
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 pb-4 pt-3 border-t border-zinc-800 shrink-0">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-zinc-800 text-sm rounded-xl px-4 py-2.5 outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Plan a 5-day trip to Paris…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-xl px-4 py-2.5 text-sm font-medium shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* ── A2UI Preview panel ── */}
      <div className="flex flex-col w-1/2">
        <header className="px-6 py-4 border-b border-zinc-800 shrink-0 flex items-center">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Itinerary</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Live A2UI Render</p>
          </div>
          {ui && (
            <span className="ml-auto text-xs bg-green-950 text-green-400 border border-green-900 px-2 py-0.5 rounded-full">
              Live
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {ui ? (
            <Renderer schema={ui} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 select-none">
              <span className="text-4xl mb-3">🗺️</span>
              <p className="font-medium text-zinc-400">Your itinerary will appear here</p>
              <p className="text-sm mt-1">Ask the planner to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
