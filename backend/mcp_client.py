import asyncio
import json
from typing import Optional, Dict, Any, List
import logging
from contextlib import asynccontextmanager

try:
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False
    logging.warning("MCP not available - install with: pip install mcp")

logger = logging.getLogger(__name__)

class FitnessMCPClient:
    """Client to interact with the Fitness MCP server"""
    
    def __init__(self):
        self.session: Optional[ClientSession] = None
        self.available_tools: List[Dict] = []
        self.available_resources: List[Dict] = []
        
    @asynccontextmanager
    async def connect(self):
        """Connect to the MCP server"""
        if not MCP_AVAILABLE:
            raise ImportError("MCP package not available")
            
        server_params = StdioServerParameters(
            command="python",
            args=["mcp_server.py"],
            env=None,
        )
        
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                self.session = session
                await self._initialize()
                try:
                    yield self
                finally:
                    self.session = None
    
    async def _initialize(self):
        """Initialize the MCP session and fetch capabilities"""
        if not self.session:
            return
            
        # List available tools
        try:
            tools_response = await self.session.list_tools()
            self.available_tools = [tool.model_dump() for tool in tools_response.tools]
            logger.info(f"Available MCP tools: {[tool['name'] for tool in self.available_tools]}")
        except Exception as e:
            logger.error(f"Failed to list MCP tools: {e}")
            
        # List available resources
        try:
            resources_response = await self.session.list_resources()
            self.available_resources = [resource.model_dump() for resource in resources_response.resources]
            logger.info(f"Available MCP resources: {len(self.available_resources)} resources")
        except Exception as e:
            logger.error(f"Failed to list MCP resources: {e}")
    
    async def create_workout_plan(self, goal: str, fitness_level: str, days_per_week: int, equipment: List[str] = None) -> Dict[str, Any]:
        """Create a workout plan using MCP"""
        if not self.session:
            raise RuntimeError("Not connected to MCP server")
            
        try:
            response = await self.session.call_tool(
                name="create_workout_plan",
                arguments={
                    "goal": goal,
                    "fitness_level": fitness_level,
                    "days_per_week": days_per_week,
                    "available_equipment": equipment or []
                }
            )
            
            if response.content and len(response.content) > 0:
                content = response.content[0]
                if hasattr(content, 'text'):
                    return json.loads(content.text)
            
            return {}
        except Exception as e:
            logger.error(f"Failed to create workout plan: {e}")
            return {}
    
    async def calculate_nutrition_needs(self, age: int, gender: str, weight: float, height: float, activity_level: str, goal: str) -> Dict[str, Any]:
        """Calculate nutrition needs using MCP"""
        if not self.session:
            raise RuntimeError("Not connected to MCP server")
            
        try:
            response = await self.session.call_tool(
                name="calculate_nutrition_needs",
                arguments={
                    "age": age,
                    "gender": gender,
                    "weight": weight,
                    "height": height,
                    "activity_level": activity_level,
                    "goal": goal
                }
            )
            
            if response.content and len(response.content) > 0:
                content = response.content[0]
                if hasattr(content, 'text'):
                    return json.loads(content.text)
            
            return {}
        except Exception as e:
            logger.error(f"Failed to calculate nutrition needs: {e}")
            return {}
    
    async def get_exercise_recommendations(self, target_muscles: List[str], equipment: List[str] = None, difficulty: str = "beginner") -> Dict[str, Any]:
        """Get exercise recommendations using MCP"""
        if not self.session:
            raise RuntimeError("Not connected to MCP server")
            
        try:
            response = await self.session.call_tool(
                name="get_exercise_recommendations",
                arguments={
                    "target_muscles": target_muscles,
                    "equipment": equipment or [],
                    "difficulty": difficulty
                }
            )
            
            if response.content and len(response.content) > 0:
                content = response.content[0]
                if hasattr(content, 'text'):
                    return json.loads(content.text)
            
            return {}
        except Exception as e:
            logger.error(f"Failed to get exercise recommendations: {e}")
            return {}
    
    async def get_resource(self, uri: str) -> Optional[str]:
        """Get a specific resource from MCP server"""
        if not self.session:
            raise RuntimeError("Not connected to MCP server")
            
        try:
            response = await self.session.read_resource(uri)
            return response.contents[0].text if response.contents else None
        except Exception as e:
            logger.error(f"Failed to get resource {uri}: {e}")
            return None

# Convenience functions for synchronous use
def run_async_mcp_function(coro):
    """Helper to run async MCP functions in sync contexts"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    return loop.run_until_complete(coro)

async def get_enhanced_fitness_recommendation(age: int, gender: str, weight: float, height: float, goal: str = "general") -> Dict[str, Any]:
    """Get enhanced fitness recommendations using MCP tools"""
    
    # Map fitness goals
    goal_mapping = {
        "weight_loss": "weight_loss",
        "muscle_gain": "muscle_gain", 
        "general": "weight_loss",  # Default
        "cardio": "endurance",
        "strength": "muscle_gain"
    }
    
    mcp_goal = goal_mapping.get(goal.lower(), "weight_loss")
    
    # Determine activity level based on goal (simplified)
    activity_level = "moderate"
    fitness_level = "beginner"
    
    result = {
        "workout_plan": None,
        "nutrition_plan": None,
        "exercise_recommendations": None,
        "error": None
    }
    
    try:
        client = FitnessMCPClient()
        async with client.connect():
            # Create workout plan
            workout_plan = await client.create_workout_plan(
                goal=mcp_goal,
                fitness_level=fitness_level,
                days_per_week=3
            )
            result["workout_plan"] = workout_plan
            
            # Calculate nutrition needs
            nutrition_plan = await client.calculate_nutrition_needs(
                age=age,
                gender=gender.lower(),
                weight=weight * 0.453592,  # Convert lbs to kg
                height=height * 30.48 if height < 10 else height,  # Assume feet if < 10, convert to cm
                activity_level=activity_level,
                goal=mcp_goal
            )
            result["nutrition_plan"] = nutrition_plan
            
            # Get exercise recommendations based on goal
            target_muscles = []
            if mcp_goal == "weight_loss":
                target_muscles = ["quadriceps", "chest", "back"]
            elif mcp_goal == "muscle_gain":
                target_muscles = ["chest", "back", "quadriceps", "hamstrings"]
            else:
                target_muscles = ["chest", "quadriceps"]
                
            exercise_recs = await client.get_exercise_recommendations(
                target_muscles=target_muscles,
                difficulty=fitness_level
            )
            result["exercise_recommendations"] = exercise_recs
            
    except Exception as e:
        logger.error(f"MCP enhanced recommendation failed: {e}")
        result["error"] = str(e)
        
    return result

# Sync wrapper for use in Flask
def get_enhanced_fitness_recommendation_sync(age: int, gender: str, weight: float, height: float = 170, goal: str = "general") -> Dict[str, Any]:
    """Synchronous wrapper for enhanced fitness recommendations"""
    if not MCP_AVAILABLE:
        return {
            "error": "MCP not available - install with: pip install mcp",
            "workout_plan": None,
            "nutrition_plan": None,
            "exercise_recommendations": None
        }
    
    return run_async_mcp_function(
        get_enhanced_fitness_recommendation(age, gender, weight, height, goal)
    )
