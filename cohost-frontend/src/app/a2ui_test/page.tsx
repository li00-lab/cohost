"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

export default function A2UITestPage() {
  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      <header className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-base font-semibold">A2UI + CopilotKit Test</h2>
      </header>
      <div className="flex-1 overflow-hidden">
        <CopilotChat
          labels={{
            chatInputPlaceholder: "Ask me to plan a trip…",
            modalHeaderTitle: "Cohost Agent",
          }}
        />
      </div>
    </div>
  );
}
