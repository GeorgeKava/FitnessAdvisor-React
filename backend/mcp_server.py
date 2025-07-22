import asyncio
import json
from typing import Any, Sequence
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
    LoggingLevel
)
import mcp.types as types
from pydantic import AnyUrl
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fitness-mcp-server")

# Create the MCP server instance
server = Server("fitness-advisor")

# Sample fitness data that could come from a database
FITNESS_EXERCISES = {
    "push_ups": {
        "name": "Push-ups",
        "category": "Upper Body",
        "muscle_groups": ["chest", "shoulders", "triceps"],
        "difficulty": "beginner",
        "equipment": "none",
        "instructions": "Start in plank position, lower chest to ground, push back up",
        "reps": "3 sets of 10-15"
    },
    "squats": {
        "name": "Squats",
        "category": "Lower Body", 
        "muscle_groups": ["quadriceps", "glutes", "hamstrings"],
        "difficulty": "beginner",
        "equipment": "none",
        "instructions": "Stand with feet shoulder-width apart, lower hips back and down, return to standing",
        "reps": "3 sets of 12-20"
    },
    "deadlifts": {
        "name": "Deadlifts",
        "category": "Full Body",
        "muscle_groups": ["hamstrings", "glutes", "back", "traps"],
        "difficulty": "intermediate",
        "equipment": "barbell",
        "instructions": "Stand with feet hip-width apart, bend at hips and knees to lower bar, return to standing",
        "reps": "3 sets of 5-8"
    }
}

NUTRITION_PLANS = {
    "weight_loss": {
        "name": "Weight Loss Plan",
        "daily_calories": 1800,
        "macros": {"protein": "30%", "carbs": "40%", "fat": "30%"},
        "meals": {
            "breakfast": "Greek yogurt with berries and nuts",
            "lunch": "Grilled chicken salad with olive oil",
            "dinner": "Baked salmon with quinoa and vegetables",
            "snacks": "Apple with almond butter"
        }
    },
    "muscle_gain": {
        "name": "Muscle Building Plan",
        "daily_calories": 2500,
        "macros": {"protein": "35%", "carbs": "45%", "fat": "20%"},
        "meals": {
            "breakfast": "Protein smoothie with banana and oats",
            "lunch": "Chicken and rice bowl with vegetables",
            "dinner": "Lean beef with sweet potato and broccoli",
            "snacks": "Protein bar and mixed nuts"
        }
    }
}

@server.list_resources()
async def handle_list_resources() -> list[Resource]:
    """List available fitness resources"""
    resources = []
    
    # Add exercise resources
    for exercise_id, exercise_data in FITNESS_EXERCISES.items():
        resources.append(Resource(
            uri=AnyUrl(f"fitness://exercises/{exercise_id}"),
            name=f"Exercise: {exercise_data['name']}",
            description=f"{exercise_data['category']} exercise targeting {', '.join(exercise_data['muscle_groups'])}",
            mimeType="application/json"
        ))
    
    # Add nutrition plan resources
    for plan_id, plan_data in NUTRITION_PLANS.items():
        resources.append(Resource(
            uri=AnyUrl(f"fitness://nutrition/{plan_id}"),
            name=f"Nutrition: {plan_data['name']}",
            description=f"Nutrition plan with {plan_data['daily_calories']} daily calories",
            mimeType="application/json"
        ))
    
    return resources

@server.read_resource()
async def handle_read_resource(uri: AnyUrl) -> str:
    """Read a specific fitness resource"""
    uri_str = str(uri)
    
    if uri_str.startswith("fitness://exercises/"):
        exercise_id = uri_str.split("/")[-1]
        if exercise_id in FITNESS_EXERCISES:
            return json.dumps(FITNESS_EXERCISES[exercise_id], indent=2)
    
    elif uri_str.startswith("fitness://nutrition/"):
        plan_id = uri_str.split("/")[-1]
        if plan_id in NUTRITION_PLANS:
            return json.dumps(NUTRITION_PLANS[plan_id], indent=2)
    
    raise ValueError(f"Resource not found: {uri}")

@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    """List available fitness tools"""
    return [
        Tool(
            name="create_workout_plan",
            description="Create a personalized workout plan based on user goals and preferences",
            inputSchema={
                "type": "object",
                "properties": {
                    "goal": {
                        "type": "string",
                        "enum": ["weight_loss", "muscle_gain", "endurance", "flexibility"],
                        "description": "Primary fitness goal"
                    },
                    "fitness_level": {
                        "type": "string",
                        "enum": ["beginner", "intermediate", "advanced"],
                        "description": "Current fitness level"
                    },
                    "available_equipment": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of available equipment"
                    },
                    "days_per_week": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 7,
                        "description": "Number of workout days per week"
                    }
                },
                "required": ["goal", "fitness_level", "days_per_week"]
            }
        ),
        Tool(
            name="calculate_nutrition_needs",
            description="Calculate daily nutrition needs based on user profile",
            inputSchema={
                "type": "object",
                "properties": {
                    "age": {"type": "integer", "minimum": 10, "maximum": 100},
                    "gender": {"type": "string", "enum": ["male", "female"]},
                    "weight": {"type": "number", "minimum": 30},
                    "height": {"type": "number", "minimum": 100},
                    "activity_level": {
                        "type": "string", 
                        "enum": ["sedentary", "light", "moderate", "active", "very_active"]
                    },
                    "goal": {"type": "string", "enum": ["weight_loss", "maintenance", "muscle_gain"]}
                },
                "required": ["age", "gender", "weight", "height", "activity_level", "goal"]
            }
        ),
        Tool(
            name="get_exercise_recommendations",
            description="Get exercise recommendations based on muscle groups and equipment",
            inputSchema={
                "type": "object",
                "properties": {
                    "target_muscles": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Target muscle groups"
                    },
                    "equipment": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Available equipment"
                    },
                    "difficulty": {
                        "type": "string",
                        "enum": ["beginner", "intermediate", "advanced"],
                        "description": "Exercise difficulty level"
                    }
                },
                "required": ["target_muscles"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict[str, Any] | None) -> list[types.TextContent]:
    """Handle tool calls"""
    if not arguments:
        arguments = {}
    
    if name == "create_workout_plan":
        return await create_workout_plan(arguments)
    elif name == "calculate_nutrition_needs":
        return await calculate_nutrition_needs(arguments)
    elif name == "get_exercise_recommendations":
        return await get_exercise_recommendations(arguments)
    else:
        raise ValueError(f"Unknown tool: {name}")

async def create_workout_plan(args: dict[str, Any]) -> list[TextContent]:
    """Create a personalized workout plan"""
    goal = args.get("goal")
    fitness_level = args.get("fitness_level")
    days_per_week = args.get("days_per_week", 3)
    equipment = args.get("available_equipment", [])
    
    # Simple workout plan generation logic
    plan = {
        "goal": goal,
        "fitness_level": fitness_level,
        "schedule": f"{days_per_week} days per week",
        "exercises": []
    }
    
    # Add exercises based on goal and equipment
    suitable_exercises = []
    for exercise_id, exercise_data in FITNESS_EXERCISES.items():
        if exercise_data["difficulty"] == fitness_level or fitness_level == "intermediate":
            if not equipment or exercise_data["equipment"] in equipment or exercise_data["equipment"] == "none":
                suitable_exercises.append(exercise_data)
    
    plan["exercises"] = suitable_exercises[:6]  # Limit to 6 exercises
    plan["recommendations"] = f"Focus on {goal.replace('_', ' ')} with {fitness_level} level exercises"
    
    return [TextContent(
        type="text",
        text=json.dumps(plan, indent=2)
    )]

async def calculate_nutrition_needs(args: dict[str, Any]) -> list[TextContent]:
    """Calculate daily nutrition needs"""
    age = args.get("age")
    gender = args.get("gender")
    weight = args.get("weight")  # in kg
    height = args.get("height")  # in cm
    activity_level = args.get("activity_level")
    goal = args.get("goal")
    
    # Basic BMR calculation (Harris-Benedict)
    if gender == "male":
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    
    # Activity multipliers
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }
    
    tdee = bmr * activity_multipliers.get(activity_level, 1.55)
    
    # Adjust for goal
    if goal == "weight_loss":
        daily_calories = tdee - 500  # 500 calorie deficit
    elif goal == "muscle_gain":
        daily_calories = tdee + 300  # 300 calorie surplus
    else:
        daily_calories = tdee  # maintenance
    
    nutrition_plan = {
        "bmr": round(bmr),
        "tdee": round(tdee),
        "daily_calories": round(daily_calories),
        "goal": goal,
        "macros": {
            "protein": f"{round(daily_calories * 0.3 / 4)}g (30%)",
            "carbohydrates": f"{round(daily_calories * 0.4 / 4)}g (40%)",
            "fat": f"{round(daily_calories * 0.3 / 9)}g (30%)"
        },
        "water_intake": f"{round(weight * 35)}ml per day"
    }
    
    return [TextContent(
        type="text",
        text=json.dumps(nutrition_plan, indent=2)
    )]

async def get_exercise_recommendations(args: dict[str, Any]) -> list[TextContent]:
    """Get exercise recommendations"""
    target_muscles = args.get("target_muscles", [])
    equipment = args.get("equipment", [])
    difficulty = args.get("difficulty", "beginner")
    
    recommendations = []
    for exercise_id, exercise_data in FITNESS_EXERCISES.items():
        # Check if exercise targets any of the requested muscles
        if any(muscle in exercise_data["muscle_groups"] for muscle in target_muscles):
            # Check equipment requirements
            if not equipment or exercise_data["equipment"] in equipment or exercise_data["equipment"] == "none":
                # Check difficulty
                if exercise_data["difficulty"] == difficulty or difficulty == "intermediate":
                    recommendations.append(exercise_data)
    
    result = {
        "target_muscles": target_muscles,
        "difficulty": difficulty,
        "recommended_exercises": recommendations
    }
    
    return [TextContent(
        type="text",
        text=json.dumps(result, indent=2)
    )]

async def main():
    # Import here to avoid issues if mcp package isn't available
    from mcp.server.stdio import stdio_server
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="fitness-advisor",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(main())
