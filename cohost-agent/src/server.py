import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from google.adk.cli.utils import agent_loader

load_dotenv(override=True)

logger = logging.getLogger(__name__)

orig_agent_dir = agent_loader.AgentLoader.list_agents

def get_agents(self):
    agents = orig_agent_dir(self)
    return [a for a in agents if (os.path.basename(a) == "planner_agent")]

agent_loader.AgentLoader.list_agents = get_agents

os.environ["AGENT_DIR"] = str(Path(__file__).parent)

from fastapi import FastAPI
from google.adk.cli.fast_api import get_fast_api_app

app: FastAPI = get_fast_api_app(
    agents_dir=os.environ["AGENT_DIR"],
    web=True,
    allow_origins="*",
)

app.title = "Cohost Planner Agent API"
app.description = "API for the Cohost Planner Agent, which handles travel planning tasks."
