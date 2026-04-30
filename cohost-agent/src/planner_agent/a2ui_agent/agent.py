import os
from pathlib import Path
from google.adk.agents.llm_agent import LlmAgent
from google.genai.types import GenerateContentConfig, SafetySetting, HarmCategory, HarmBlockThreshold

GEMINI_MODEL = os.environ["GEMINI_2_5_FLASH"]

_PROMPT_PATH = Path(__file__).parents[2] / "prompts" / "a2ui_agent_system_prompt.md"
_SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")

a2ui_agent = LlmAgent(
    name="A2UIGenerator",
    description="Converts the validated itinerary into an A2UI JSON schema ready for direct rendering by the React frontend timeline component.",
    model=GEMINI_MODEL,
    instruction=_SYSTEM_PROMPT + "\n\nInput itinerary:\n{final_itinerary}",
    output_key="ui_schema",
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
