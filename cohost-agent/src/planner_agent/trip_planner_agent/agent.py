import os
from pathlib import Path
from google.adk.agents.llm_agent import LlmAgent
from google.genai.types import GenerateContentConfig, SafetySetting, HarmCategory, HarmBlockThreshold

GEMINI_MODEL = os.environ["GEMINI_2_5_FLASH"]

_PROMPT_PATH = Path(__file__).parents[2] / "prompts" / "planner_agent_system_prompt.md"
_SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")

trip_planner_agent = LlmAgent(
    name="PlannerAgent",
    description="Builds a realistic day-by-day itinerary with real place names, timed activities, and pacing matched to the traveller's preferences.",
    model=GEMINI_MODEL,
    instruction=_SYSTEM_PROMPT + "\n\nTrip intent:\n{intent}",
    output_key="itinerary",
    generate_content_config=GenerateContentConfig(
        temperature=0.2,
        max_output_tokens=4096,
        safety_settings=[
            SafetySetting(
                category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            )
        ],
    ),
)
