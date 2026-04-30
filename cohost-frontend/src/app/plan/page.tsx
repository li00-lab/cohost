"use client";

import { useState, useRef, useEffect } from "react";
import { useCohostStore, TripTab } from "@/lib/store";
import Renderer from "@/components/Renderer";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      className={`transition-transform duration-300 ${open ? "" : "rotate-180"}`}
    >
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Message = { role: "user" | "assistant"; content: string };
type StreamStatus = "thinking" | "generating" | null;

export default function PlanPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<StreamStatus>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [chatOpen, setChatOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const tabs = useCohostStore((s) => s.tabs);
  const activeTabId = useCohostStore((s) => s.activeTabId);
  const addOrUpdateTab = useCohostStore((s) => s.addOrUpdateTab);
  const setActiveTab = useCohostStore((s) => s.setActiveTab);
  const closeTab = useCohostStore((s) => s.closeTab);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;
  const ui = activeTab?.ui ?? null;

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

    let accumulated = "";
    let finalItinerary: object | null = null;
    let finalUi: object | null = null;
    let finalDestination = "Trip";

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
                finalDestination = event.destination ?? "Trip";
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
        addOrUpdateTab({
          id: finalDestination.toLowerCase(),
          label: finalDestination,
          itinerary: finalItinerary,
          ui: finalUi,
        });
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
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* ── Chat panel ── */}
      <div
        className={`flex flex-col border-r border-zinc-800 transition-all duration-300 shrink-0 ${
          chatOpen ? "w-[420px]" : "w-0 border-r-0 overflow-hidden"
        }`}
      >
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
                    {streamingContent && <p className="mb-2">{streamingContent}</p>}
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
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar: collapse toggle + tab strip */}
        <div className="flex items-stretch border-b border-zinc-800 shrink-0 bg-zinc-950">
          {/* Collapse toggle */}
          <button
            onClick={() => setChatOpen((o) => !o)}
            title={chatOpen ? "Collapse chat" : "Expand chat"}
            className="flex items-center justify-center w-10 border-r border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors shrink-0"
          >
            <ChevronIcon open={chatOpen} />
          </button>

          {/* Tabs */}
          <div className="flex items-stretch overflow-x-auto flex-1 min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 px-4 py-3 text-sm border-r border-zinc-800 whitespace-nowrap shrink-0 transition-colors relative ${
                  tab.id === activeTabId
                    ? "text-white bg-zinc-900"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                }`}
              >
                {tab.id === activeTabId && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
                <span>{tab.label}</span>
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className="w-4 h-4 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all text-xs leading-none"
                >
                  ✕
                </span>
              </button>
            ))}

            {tabs.length === 0 && (
              <div className="flex items-center px-4 py-3 text-xs text-zinc-600 select-none">
                Itineraries will appear as tabs
              </div>
            )}
          </div>

          {/* Edit hint */}
          {ui && (
            <div className="flex items-center px-4 shrink-0 border-l border-zinc-800">
              <span className="text-xs text-zinc-600">Click any item to edit</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {ui ? (
            <Renderer schema={ui} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 select-none">
              <span className="text-4xl mb-3">🗺️</span>
              <p className="font-medium text-zinc-400">Your itineraries will appear here</p>
              <p className="text-sm mt-1">Each destination gets its own tab</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
