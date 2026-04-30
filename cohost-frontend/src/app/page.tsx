"use client";

import { useState, useRef, useEffect } from "react";
import { useCohostStore } from "@/lib/store";
import Renderer from "@/components/Renderer";

type Message = { role: "user" | "assistant"; content: string };
type StreamStatus = "thinking" | "generating" | null;

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<StreamStatus>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const setData = useCohostStore((s) => s.setData);
  const ui = useCohostStore((s) => s.ui);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, streamingStatus]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    setStreamingContent("");
    setStreamingStatus("thinking");

    // Plain closure variable — guaranteed to hold its value for the entire
    // async call, unlike a React ref which can be stale after state batching.
    let accumulated = "";
    let finalItinerary: object | null = null;
    let finalUi: object | null = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            switch (event.type) {
              case "status":
                setStreamingStatus(event.value as StreamStatus);
                break;
              case "text":
                accumulated += event.value;
                setStreamingContent(accumulated);
                break;
              case "done":
                finalItinerary = event.itinerary;
                finalUi = event.ui;
                break;
              case "error":
                throw new Error(event.message);
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "JSON parse error") throw e;
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: accumulated || "Your itinerary has been planned!",
        },
      ]);
      if (finalItinerary || finalUi) {
        setData({ itinerary: finalItinerary, ui: finalUi });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setStreamingStatus(null);
      setStreamingContent("");
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
          {messages.length === 0 && !streamingStatus && (
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

          {/* Live streaming bubble */}
          {streamingStatus && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed max-w-[78%]">
                {streamingStatus === "thinking" && (
                  <span className="flex items-center gap-2 text-yellow-400 text-xs font-medium">
                    <span className="animate-pulse text-base leading-none">●</span>
                    thinking...
                  </span>
                )}

                {streamingStatus === "generating" && (
                  <>
                    {streamingContent && (
                      <p className="mb-2">{streamingContent}</p>
                    )}
                    <span className="flex items-center gap-2 text-green-400 text-xs font-medium">
                      <span className="animate-pulse text-base leading-none">●</span>
                      generating response...
                    </span>
                  </>
                )}
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

      {/* ── Itinerary preview panel ── */}
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
