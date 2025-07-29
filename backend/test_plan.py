from ai import generate_weekly_fitness_plan, validate_weekly_plan
import json

# Test with a simple user profile
user_profile = {
    'gender': 'male', 
    'age': '25', 
    'weight': '170', 
    'agentType': 'general', 
    'healthConditions': ''
}

base_recommendation = 'Based on your fitness goals, I recommend a balanced approach with 3-4 workout days per week focusing on bodyweight exercises, cardio, and flexibility work.'

print('Generating weekly plan...')
plan = generate_weekly_fitness_plan(user_profile, base_recommendation)

print('\n=== PLAN ANALYSIS ===')
print(f'Daily plans count: {len(plan.get("dailyPlans", {}))}')
print(f'Weekly goals count: {len(plan.get("weeklyGoals", []))}')
print(f'Has overview: {"Yes" if plan.get("weeklyOverview") else "No"}')

total_exercises = 0
rest_days = 0
workout_days = 0

print('\n=== DAILY BREAKDOWN ===')
for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']:
    data = plan.get('dailyPlans', {}).get(day)
    if data:
        exercises = data.get('exercises', []) or []
        activities = data.get('activities', []) or []
        is_rest = data.get('isRestDay', False)
        
        if is_rest:
            rest_days += 1
            print(f'{day}: REST DAY - {len(activities)} activities')
        else:
            workout_days += 1
            total_exercises += len(exercises)
            print(f'{day}: WORKOUT - {len(exercises)} exercises')
            # Show first exercise as example
            if exercises:
                print(f'  Example: {exercises[0]}')
    else:
        print(f'{day}: NO DATA')

print(f'\n=== SUMMARY ===')
print(f'Workout days: {workout_days}')
print(f'Rest days: {rest_days}')
print(f'Total exercises: {total_exercises}')

# Test validation
is_valid = validate_weekly_plan(plan)
print(f'Validation result: {"✅ PASSED" if is_valid else "❌ FAILED"}')

if not is_valid:
    print('\n=== VALIDATION DETAILS ===')
    # Let's see what might be failing
    if len(plan.get('dailyPlans', {})) != 7:
        print('❌ Not 7 days')
    
    days_with_content = 0
    workout_days_with_content = 0
    for day, data in plan.get('dailyPlans', {}).items():
        if data:
            exercises = data.get('exercises', []) or []
            activities = data.get('activities', []) or []
            if data.get('isRestDay'):
                if len(activities) >= 1:
                    days_with_content += 1
            else:
                if len(exercises) >= 2:
                    days_with_content += 1
                    workout_days_with_content += 1
    
    if days_with_content < 4:
        print(f'❌ Only {days_with_content} days with adequate content (need 4+)')
    
    if workout_days_with_content < 3:
        print(f'❌ Only {workout_days_with_content} workout days with content (need 3+)')
    
    if rest_days < 1 or rest_days > 3:
        print(f'❌ Wrong number of rest days: {rest_days} (need 1-3)')
    
    if total_exercises < 10 or total_exercises > 40:
        print(f'❌ Total exercises out of range: {total_exercises} (need 10-40)')
    
    # Check for exercise dumping
    for day, data in plan.get('dailyPlans', {}).items():
        if data and not data.get('isRestDay'):
            exercises = data.get('exercises', []) or []
            if len(exercises) > 10:
                print(f'❌ {day} has too many exercises: {len(exercises)} (max 10)')
else:
    print('\n🎉 Plan generated successfully and passed validation!')
    print('\n=== WEEKLY OVERVIEW ANALYSIS ===')
    overview = plan.get('weeklyOverview', '')
    print(f"Length: {len(overview)} characters")
    print(f"Content: {overview}")
    print(f"Readability: {'✅ Good' if len(overview) <= 250 else '⚠️ Too long'}")
    
    print('\n=== SAMPLE DAY (Monday) ===')
    monday_data = plan.get('dailyPlans', {}).get('Monday', {})
    if monday_data:
        print(f"Focus: {monday_data.get('focus', 'N/A')}")
        print(f"Exercises: {len(monday_data.get('exercises', []))}")
        for i, exercise in enumerate(monday_data.get('exercises', [])[:3], 1):
            print(f"  {i}. {exercise}")
        print(f"Goals: {monday_data.get('goals', [])}")
        print(f"Notes: {monday_data.get('notes', 'N/A')}")
