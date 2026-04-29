from google.adk.agents.sequential_agent import SequentialAgent
from google.adk.agents.llm_agent import LlmAgent

GEMINI_MODEL = "gemini-2.5-flash"

# --- 1. Intent Understanding Agent ---
intent_agent = LlmAgent(
    name="IntentAgent",
    model=GEMINI_MODEL,
    instruction="""
    You are a travel planning assistant.

    Extract the user's intent clearly.

    Identify:
    - destination
    - number of days (if mentioned)
    - type of trip (food, sightseeing, etc.)

    Output JSON ONLY:
    {
      "destination": "...",
      "days": number,
      "preferences": "..."
    }
    """,
    output_key="intent"
)

# --- 2. Planner Agent ---
planner_agent = LlmAgent(
    name="PlannerAgent",
    model=GEMINI_MODEL,
    instruction="""
    You are an itinerary planner.

    Based on the extracted intent:
    {intent}

    Create a structured travel plan.

    Output JSON ONLY:
    {
      "tripName": "...",
      "days": [
        {
          "day": 1,
          "activities": [
            {"time": "09:00", "title": "..."}
          ]
        }
      ]
    }
    """,
    output_key="itinerary"
)

# --- 3. State Builder (STRICT FORMAT) ---
state_agent = LlmAgent(
    name="StateBuilderAgent",
    model=GEMINI_MODEL,
    instruction="""
    You are a strict JSON formatter.

    Take this itinerary:
    {itinerary}

    Ensure:
    - valid JSON
    - no missing fields
    - consistent structure

    Output ONLY JSON.
    """,
    output_key="final_itinerary"
)

# --- 4. A2UI Generator ---
ui_agent = LlmAgent(
    name="A2UIGenerator",
    model=GEMINI_MODEL,
    instruction="""
    Convert the itinerary into A2UI schema.

    Input:
    {final_itinerary}

    Output JSON ONLY:
    {
      "components": [
        {
          "type": "timeline",
          "data": [...]
        }
      ]
    }
    """,
    output_key="ui_schema"
)

# --- Sequential Pipeline ---
cohost_agent = SequentialAgent(
    name="CohostPlannerAgent",
    sub_agents=[
        intent_agent,
        planner_agent,
        state_agent,
        ui_agent
    ],
)

root_agent = cohost_agent