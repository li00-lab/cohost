import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Multi-Agent Pipeline",
    description:
      "Four specialist AI agents collaborate — intent parsing, itinerary planning, validation, and UI generation — all powered by Google ADK.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10h14M3 5h14M3 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Day-by-Day Itineraries",
    description:
      "Get realistic, timed schedules with real place names, meal breaks, and travel gaps built in — not generic bullet points.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 13l3 3 9-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Click to Edit",
    description:
      "Every activity and time slot is editable inline. Swap a restaurant, shift a time, or rename a day — your plan, your way.",
  },
];

const examples = [
  "3-day food trip to Tokyo",
  "5-day Paris highlights with my partner",
  "Week-long family holiday in Bali",
  "Weekend in Barcelona, love architecture",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-900">
        <span className="text-sm font-semibold tracking-tight">Cohost</span>
        <Link
          href="/plan"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Open app →
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight max-w-2xl">
          Your AI{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            travel concierge
          </span>
        </h1>

        <p className="mt-5 text-lg text-zinc-400 max-w-md leading-relaxed">
          Describe your trip in plain English. Cohost plans every day, down to the hour.
        </p>

        {/* CTA */}
        <Link
          href="/plan"
          className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium px-6 py-3 rounded-xl text-sm"
        >
          Try it free
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Example prompts */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 max-w-lg">
          {examples.map((ex) => (
            <Link
              key={ex}
              href={`/plan`}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-full"
            >
              "{ex}"
            </Link>
          ))}
        </div>
      </main>

      {/* Features */}
      <section className="px-6 pb-20 pt-8">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="text-blue-400 mb-3">{f.icon}</div>
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-8 py-4 flex items-center justify-between text-xs text-zinc-600">
        <span>Cohost · AI Travel Planner</span>
        <span>Google ADK</span>
      </footer>
    </div>
  );
}
