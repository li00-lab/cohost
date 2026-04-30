import os
from pathlib import Path
from google.adk.agents.llm_agent import LlmAgent
from google.genai.types import GenerateContentConfig, SafetySetting, HarmCategory, HarmBlockThreshold

GEMINI_MODEL = os.environ["GEMINI_2_5_FLASH"]

_PROMPT_PATH = Path(__file__).parents[2] / "prompts" / "state_agent_system_prompt.md"
_SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")

state_agent = LlmAgent(
    name="StateBuilderAgent",
    description="Validates and normalises the raw itinerary JSON — fixes field names, time formats, and day numbering — without changing any activity content.",
    model=GEMINI_MODEL,
    instruction=_SYSTEM_PROMPT + "\n\nItinerary to validate:\n{itinerary}",
    output_key="final_itinerary",
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
