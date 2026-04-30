from google.adk.agents.sequential_agent import SequentialAgent

from .intent_agent.agent import intent_agent
from .trip_planner_agent.agent import trip_planner_agent
from .state_agent.agent import state_agent
from .a2ui_agent.agent import a2ui_agent

root_agent = SequentialAgent(
    name="CohostPlannerAgent",
    description="Orchestrates the full trip-planning pipeline: intent extraction, itinerary planning, validation, and UI schema generation.",
    sub_agents=[
        intent_agent,
        trip_planner_agent,
        state_agent,
        a2ui_agent,
    ],
)
