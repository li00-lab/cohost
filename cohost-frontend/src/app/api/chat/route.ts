import { NextRequest } from "next/server";

const AGENT_URL = process.env.AGENT_URL ?? "http://localhost:8000";
const APP_NAME = "planner_agent";
const USER_ID = "user_1";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const encoder = new TextEncoder();
  const send = (obj: object, ctrl: ReadableStreamDefaultController) =>
    ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── 1. Create session ──────────────────────────────────────────
        const sessionUrl = `${AGENT_URL}/apps/${APP_NAME}/users/${USER_ID}/sessions`;
        console.log(`[chat] POST ${sessionUrl}`);

        const sessionRes = await fetch(sessionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!sessionRes.ok) {
          const body = await sessionRes.text();
          throw new Error(`Session creation failed ${sessionRes.status}: ${body}`);
        }

        const session = await sessionRes.json();
        const sessionId: string = session.id;
        console.log(`[chat] Session created: ${sessionId}`);

        // ── 2. Thinking indicator ──────────────────────────────────────
        send({ type: "status", value: "thinking" }, controller);

        // ── 3. Run agent via SSE ───────────────────────────────────────
        const runUrl = `${AGENT_URL}/run_sse`;
        console.log(`[chat] POST ${runUrl} session=${sessionId} message="${message}"`);

        const runRes = await fetch(runUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appName: APP_NAME,
            userId: USER_ID,
            sessionId,
            newMessage: { role: "user", parts: [{ text: message }] },
            streaming: true,
          }),
        });

        if (!runRes.ok || !runRes.body) {
          const body = await runRes.text().catch(() => "");
          throw new Error(`run_sse failed ${runRes.status}: ${body}`);
        }

        // Drain the SSE stream — raw agent JSON not shown to user
        const reader = runRes.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
        }
        console.log("[chat] SSE stream drained");

        // ── 4. Fetch completed session state ───────────────────────────
        const stateUrl = `${AGENT_URL}/apps/${APP_NAME}/users/${USER_ID}/sessions/${sessionId}`;
        console.log(`[chat] GET ${stateUrl}`);

        const stateRes = await fetch(stateUrl);
        if (!stateRes.ok) {
          throw new Error(`State fetch failed ${stateRes.status}`);
        }
        const completed = await stateRes.json();
        const state: Record<string, unknown> = completed.state ?? {};
        console.log("[chat] State keys:", Object.keys(state).join(", "));

        const itinerary = parseJson(state.final_itinerary);
        const ui = parseJson(state.ui_schema);

        // ── 5. Compose reply ───────────────────────────────────────────
        const name = (itinerary as any)?.tripName ?? "your trip";
        const days = (itinerary as any)?.days?.length ?? "";
        const reply = itinerary
          ? `Here's your ${days}-day itinerary for ${name}! I've mapped out each day with timings so you can make the most of your trip. Check the panel on the right to explore the full schedule.`
          : "I wasn't able to plan the itinerary. Could you try again with a destination and number of days?";

        // ── 6. Stream reply word by word ───────────────────────────────
        send({ type: "status", value: "generating" }, controller);
        const words = reply.match(/\S+\s*/g) ?? [];
        for (const word of words) {
          send({ type: "text", value: word }, controller);
          await sleep(55);
        }

        send({ type: "done", itinerary, ui }, controller);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[chat] Error:", message);
        send({ type: "error", message }, controller);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function parseJson(raw: unknown): object | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as object;
  const text = String(raw)
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```$/m, "")
    .trim();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
