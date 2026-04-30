import os
from pathlib import Path
from google.adk.agents.llm_agent import LlmAgent
from google.genai.types import GenerateContentConfig, SafetySetting, HarmCategory, HarmBlockThreshold

GEMINI_MODEL = os.environ["GEMINI_2_5_FLASH"]

_PROMPT_PATH = Path(__file__).parents[2] / "prompts" / "intent_agent_system_prompt.md"
_SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")

intent_agent = LlmAgent(
    name="IntentAgent",
    description="Parses the traveller's natural-language request into a structured intent: destination, number of days, and trip preferences.",
    model=GEMINI_MODEL,
    instruction=_SYSTEM_PROMPT,
    output_key="intent",
    generate_content_config=GenerateContentConfig(
        temperature=0.2,
        max_output_tokens=512,
        safety_settings=[
            SafetySetting(
                category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            )
        ],
    ),
)
