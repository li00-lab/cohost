import json
import re
import uuid
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

from planner_agent.agent import root_agent

load_dotenv()

app = FastAPI(title="Cohost Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

APP_NAME = "cohost"
USER_ID = "user_1"

session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)


class ChatRequest(BaseModel):
    message: str


def _parse_json(raw: str | None) -> dict | list | None:
    if not raw:
        return None
    text = raw.strip()
    # Strip markdown code fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass
    # Fall back to extracting the first {...} block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except Exception:
            pass
    return None


@app.post("/chat")
async def chat(req: ChatRequest):
    session_id = str(uuid.uuid4())

    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )

    content = Content(role="user", parts=[Part(text=req.message)])

    text_parts: list[str] = []
    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=session_id,
        new_message=content,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            for part in event.content.parts:
                if hasattr(part, "text") and part.text:
                    text_parts.append(part.text)

    session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )

    state: dict = getattr(session, "state", {}) or {}

    itinerary = _parse_json(str(state.get("final_itinerary", "")))
    ui_schema = _parse_json(str(state.get("ui_schema", "")))

    reply = " ".join(text_parts).strip()
    if not reply:
        if itinerary:
            name = itinerary.get("tripName", "your trip")
            days = len(itinerary.get("days", []))
            reply = f"Here's your {days}-day itinerary for {name}!"
        else:
            reply = "Your itinerary has been planned!"

    return {"reply": reply, "itinerary": itinerary, "ui": ui_schema}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
