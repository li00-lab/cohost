"use client";

import { useCohostStore } from "@/lib/store";
import Renderer from "@/components/Renderer";

export default function PreviewPage() {
  const ui = useCohostStore((s) => s.ui);

  return (
    <div>
      <h2 className="text-xl mb-4">Live Itinerary UI</h2>

      {ui ? <Renderer schema={ui} /> : <p>No UI yet. Go generate one.</p>}
    </div>
  );
}
