from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import cv2
import os
import uuid
import logging
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from ai import get_fitness_recommendation, identify_food_from_image, get_food_recommendations
from ai_fast import get_fast_fitness_recommendation
from mcp_client import (get_fitness_recommendation_mcp, get_fitness_recommendation_with_rag, 
                       get_fitness_recommendation_hybrid, get_fallback_fitness_recommendation)
from voice_chat import voice_chat_bp, store_user_data_in_azure_search, store_weekly_plan_in_azure_search, store_food_recommendations_in_azure_search

app = Flask(__name__)
CORS(app)
# Initialize camera instance if needed for other parts, but not for frontend capture processing
# camera = cv2.VideoCapture(0) 
capture_folder = 'captured_images'

# Register the voice chat blueprint
app.register_blueprint(voice_chat_bp, url_prefix='/api')

load_dotenv()

# Configure basic logging if you don't have it set up elsewhere
# For Flask debug mode, output usually goes to console anyway.
# logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

if not os.path.exists(capture_folder):
    os.makedirs(capture_folder)
    logging.info(f"Created capture_folder: {capture_folder}")

@app.route('/api/fitness_recommendation', methods=['POST'])
def fitness_recommendation():
    logging.info("--- Fitness Recommendation Endpoint Hit ---")
    logging.debug(f"Request.method: {request.method}")
    logging.debug(f"Request.headers: {request.headers}")
    logging.debug(f"Request.files: {request.files}")
    logging.debug(f"Request.form: {request.form}")

    gender = request.form.get('gender')
    age = request.form.get('age')
    weight = request.form.get('weight')
    height = request.form.get('height')
    health_conditions = request.form.get('health_conditions', '')  # Optional field
    agent_type = request.form.get('agent_type', 'general')  # Default to 'general' if not provided
    user_email = request.form.get('user_email', '')  # User email for storing in Azure Search
    fast_mode = request.form.get('fast_mode', 'false').lower() == 'true'  # Check for fast mode
    use_rag = request.form.get('use_rag', 'false').lower() == 'true'  # Check for RAG mode
    use_mcp = request.form.get('use_mcp', 'false').lower() == 'true'  # Check for MCP mode
    use_hybrid = request.form.get('use_hybrid', 'false').lower() == 'true'  # Check for Hybrid mode
    
    # Debug height value
    logging.info(f"Height value received: '{height}' (type: {type(height)}, length: {len(height) if height else 'None'})")
    
    logging.info(f"Received user data: Gender={gender}, Age={age}, Weight={weight}, Height={height}, HealthConditions={health_conditions}, Agent={agent_type}, FastMode={fast_mode}, UseRAG={use_rag}, UseMCP={use_mcp}, UseHybrid={use_hybrid}")

    images = []
    
    if 'images' in request.files:
        files = request.files.getlist('images')
        
        if not files or all(not f.filename for f in files): # Check if files list is empty or all files are empty
            logging.warning("Key 'images' in request.files but getlist('images') is empty or files have no names.")
            return jsonify({'error': 'No image files found or files are invalid.'}), 400

        logging.info(f"Found {len(files)} file(s) in request.files['images']")

        for i, file_storage in enumerate(files):
            if file_storage and file_storage.filename:
                original_filename = file_storage.filename
                # Sanitize filename and create a unique path
                # Using a simple UUID for the main part of the filename for simplicity and uniqueness
                safe_filename_base = str(uuid.uuid4())
                _, extension = os.path.splitext(original_filename)
                if not extension: # Ensure there's an extension, default to .jpg if not
                    extension = '.jpg'
                
                safe_filename = f"{safe_filename_base}{extension}"
                img_path = os.path.join(capture_folder, safe_filename)
                
                try:
                    file_storage.save(img_path)
                    logging.info(f"Successfully saved image {i+1} ('{original_filename}') to {img_path}")
                    images.append(img_path)
                except Exception as e:
                    logging.error(f"Failed to save image '{original_filename}' to {img_path}: {e}")
                    return jsonify({'error': f'Failed to save image: {original_filename}. Error: {str(e)}'}), 500
            else:
                logging.warning(f"File {i+1} in request.files['images'] is invalid (no file_storage or no filename). Skipping.")
    
    # This elif block for server-side camera capture is likely not what's being used by your frontend's capture.
    # The frontend sends the captured image as a file upload.
    # elif request.args.get('capture') == 'true':
    #     logging.info("Attempting server-side camera capture based on 'capture=true' arg.")
    #     # ... (your existing server-side cv2 capture logic) ...
    #     # This part would need its own error handling and appending to `images`
    #     pass # Placeholder for brevity

    if not images:
        logging.error("No images were successfully processed and saved from the request. 'images' key might be missing or all files failed processing.")
        return jsonify({'error': 'No valid image files were provided or an error occurred while saving images.'}), 400

    logging.info(f"Processing {len(images)} image(s): {images}")
    
    # Check if MCP is disabled in environment
    disable_mcp = os.getenv("DISABLE_MCP", "false").lower() == "true"
    
    try:
        # Determine which AI processing mode to use
        if disable_mcp:
            # MCP is disabled, use enhanced fallback with Agentic RAG
            logging.info("MCP disabled, using enhanced fallback with Agentic RAG")
            user_data = {
                'gender': gender,
                'age': age,
                'weight': weight,
                'height': height,
                'health_conditions': health_conditions,
                'agent_type': agent_type
            }
            result = get_fallback_fitness_recommendation(user_data, images)
        elif use_hybrid or (use_rag and use_mcp):
            # Use Hybrid RAG + MCP for ultimate recommendations
            logging.info("Using Hybrid RAG + MCP mode for comprehensive recommendation")
            user_data = {
                'gender': gender,
                'age': age,
                'weight': weight,
                'height': height,
                'health_conditions': health_conditions,
                'agent_type': agent_type
            }
            result = asyncio.run(get_fitness_recommendation_hybrid(images, user_data))
        elif use_rag:
            # Use Azure AI Search RAG for enhanced recommendations
            logging.info("Using Azure AI Search RAG mode for recommendation")
            user_data = {
                'gender': gender,
                'age': age,
                'weight': weight,
                'height': height,
                'health_conditions': health_conditions,
                'agent_type': agent_type
            }
            result = asyncio.run(get_fitness_recommendation_with_rag(images, user_data))
        elif use_mcp:
            # Use MCP (Model Context Protocol) for structured recommendations
            logging.info("Using MCP mode for recommendation")
            result = asyncio.run(get_fitness_recommendation_mcp(images, gender, age, weight, height, agent_type, health_conditions))
        elif fast_mode:
            # Use fast mode for quicker responses
            result = get_fast_fitness_recommendation(images, gender, age, weight, height, agent_type, health_conditions)
            logging.info("Using fast mode for recommendation")
            
            # Check if fast mode failed and fallback to enhanced RAG
            if isinstance(result, str) and ("Quick analysis complete!" in result or "error" in result.lower()):
                logging.info("Fast mode failed, falling back to enhanced RAG system")
                user_data = {
                    'gender': gender,
                    'age': age,
                    'weight': weight,
                    'height': height,
                    'health_conditions': health_conditions,
                    'agent_type': agent_type
                }
                result = get_fallback_fitness_recommendation(user_data, images)
        else:
            # Use standard enhanced mode
            result = get_fitness_recommendation(images, gender, age, weight, height, agent_type, health_conditions)
            logging.info("Using enhanced mode for recommendation")
            
            # Check if enhanced mode failed and fallback to enhanced RAG
            if isinstance(result, str) and "An error occurred" in result:
                logging.info("Enhanced mode failed, falling back to enhanced RAG system")
                user_data = {
                    'gender': gender,
                    'age': age,
                    'weight': weight,
                    'height': height,
                    'health_conditions': health_conditions,
                    'agent_type': agent_type
                }
                result = get_fallback_fitness_recommendation(user_data, images)
            
        # ai.py's get_fitness_recommendation returns a string "An error occurred..." on its internal errors.
        # This is currently returned as part of a 200 OK.
        
        # Handle different result types from various processing modes
        recommendation_text = result
        
        # Extract string recommendation from complex objects (RAG/MCP/Hybrid modes)
        if isinstance(result, dict):
            if 'recommendation' in result:
                recommendation_text = result['recommendation']
            elif 'error' in result:
                recommendation_text = result.get('error', 'An error occurred during processing')
            else:
                # Convert complex object to readable string
                recommendation_text = f"Processed your request successfully. Here are your results:\n\n{str(result)}"
        
        # Ensure we always have a string for the frontend
        if not isinstance(recommendation_text, str):
            recommendation_text = str(recommendation_text)
        
        if isinstance(recommendation_text, str) and "An error occurred" in recommendation_text:
            logging.warning(f"AI processing indicated an error: {recommendation_text}")
            # If you want this to be a server error that triggers frontend's catch:
            # return jsonify({'error': recommendation_text, 'source': 'ai_processing'}), 500
        
        # Store user profile and recommendations in Azure Search if user_email is provided
        if user_email and user_email.strip():
            try:
                user_profile = {
                    'email': user_email,
                    'name': user_email.split('@')[0],  # Use email prefix as name if no name provided
                    'age': int(age) if age else None,
                    'weight': int(weight) if weight else None,
                    'height': int(height) if height else None,
                    'gender': gender,
                    'fitnessLevel': 'beginner',  # Default value
                    'agentType': agent_type,
                    'medicalConditions': [health_conditions] if health_conditions else [],
                    'createdAt': datetime.now().isoformat() + 'Z',
                    'isActive': True,
                    'lastLoginAt': datetime.now().isoformat() + 'Z'
                }
                
                # Store the profile and recommendation in Azure Search
                success = store_user_data_in_azure_search(
                    user_email=user_email,
                    user_profile=user_profile,
                    progress_data=[],  # No progress data from web interface
                    recommendations=[{
                        'content': recommendation_text,
                        'timestamp': datetime.now().isoformat() + 'Z',
                        'agent_type': agent_type
                    }]
                )
                
                if success:
                    logging.info(f"Successfully stored user data in Azure Search for {user_email}")
                else:
                    logging.warning(f"Failed to store user data in Azure Search for {user_email}")
                    
            except Exception as e:
                logging.error(f"Error storing user data in Azure Search: {e}")
        
        logging.info(f"Recommendation result: {recommendation_text}")
        return jsonify({'recommendation': recommendation_text})
    except Exception as e:
        logging.error(f"Unexpected error during recommendation generation: {e}", exc_info=True)
        return jsonify({'error': 'An internal server error occurred while generating recommendations.'}), 500

@app.route('/api/get-weekly-plan', methods=['GET'])
def get_weekly_plan():
    """Get the latest weekly plan for a user from Azure Search"""
    logging.info("--- Get Weekly Plan Endpoint Hit ---")
    
    try:
        user_email = request.args.get('user_email')
        if not user_email:
            return jsonify({"error": "User email is required"}), 400
        
        # Import the function to get latest weekly plan from storage
        from voice_chat import get_latest_weekly_plan_from_storage
        
        weekly_plan = get_latest_weekly_plan_from_storage(user_email)
        
        if weekly_plan:
            logging.info(f"Found weekly plan for user: {user_email}")
            return jsonify({
                "success": True,
                "weekly_plan": weekly_plan
            })
        else:
            logging.info(f"No weekly plan found for user: {user_email}")
            return jsonify({
                "success": False,
                "message": "No weekly plan found. Create a weekly plan first."
            })
        
    except Exception as e:
        logging.error(f"Error getting weekly plan: {e}")
        return jsonify({
            "error": f"Failed to get weekly plan: {str(e)}"
        }), 500

@app.route('/api/generate-weekly-plan', methods=['POST'])
def generate_weekly_plan():
    logging.info("--- Weekly Plan Generation Endpoint Hit ---")
    
    try:
        data = request.get_json()
        user_profile = data.get('userProfile')
        base_recommendation = data.get('baseRecommendation')
        
        if not user_profile or not base_recommendation:
            return jsonify({'error': 'User profile and base recommendation are required'}), 400
        
        logging.info(f"Generating weekly plan for user: {user_profile.get('agentType', 'general')}")
        
        # Import the weekly plan generation function
        from ai import generate_weekly_fitness_plan
        
        weekly_plan = generate_weekly_fitness_plan(user_profile, base_recommendation)
        
        # Store weekly plan in Azure Search if user email is provided
        user_email = user_profile.get('email')
        if user_email and user_email.strip():
            try:
                success = store_weekly_plan_in_azure_search(user_email, weekly_plan)
                
                if success:
                    logging.info(f"Successfully stored weekly plan in Azure Search for {user_email}")
                else:
                    logging.warning(f"Failed to store weekly plan in Azure Search for {user_email}")
                    
            except Exception as e:
                logging.error(f"Error storing weekly plan in Azure Search: {e}")
        
        return jsonify(weekly_plan)
        
    except Exception as e:
        logging.error(f"Error generating weekly plan: {e}", exc_info=True)
        return jsonify({'error': 'Failed to generate weekly plan'}), 500

@app.route('/api/food_recommendations', methods=['POST'])
def food_recommendations():
    """Get personalized food recommendations based on user's fitness goals and current recommendations"""
    logging.info("--- Food Recommendations Endpoint Hit ---")
    
    try:
        user_email = request.form.get('user_email', '')
        gender = request.form.get('gender')
        age = request.form.get('age')
        weight = request.form.get('weight')
        height = request.form.get('height')
        fitness_goal = request.form.get('fitness_goal', 'general')  # weight_loss, muscle_gain, maintenance
        dietary_restrictions = request.form.get('dietary_restrictions', '')
        meal_preferences = request.form.get('meal_preferences', '')  # vegetarian, vegan, keto, etc.
        
        if not all([gender, age, weight, height]):
            return jsonify({
                "error": "Missing required parameters. Need gender, age, weight, and height."
            }), 400
        
        # Get food recommendations
        food_recommendations = get_food_recommendations(
            gender=gender,
            age=int(age),
            weight=float(weight),
            height=float(height),
            fitness_goal=fitness_goal,
            dietary_restrictions=dietary_restrictions,
            meal_preferences=meal_preferences,
            user_email=user_email
        )
        
        # Store food recommendations in Azure Search if user email provided
        if user_email and food_recommendations:
            try:
                store_food_recommendations_in_azure_search(
                    user_email=user_email,
                    recommendations_data={
                        "gender": gender,
                        "age": int(age),
                        "weight": float(weight),
                        "height": float(height),
                        "fitness_goal": fitness_goal,
                        "dietary_restrictions": dietary_restrictions,
                        "meal_preferences": meal_preferences,
                        "recommendations": food_recommendations,
                        "created_at": datetime.now().isoformat()
                    }
                )
                logging.info(f"Stored food recommendations for user: {user_email}")
            except Exception as storage_error:
                logging.error(f"Failed to store food recommendations: {storage_error}")
        
        return jsonify({
            "success": True,
            "food_recommendations": food_recommendations
        })
        
    except Exception as e:
        logging.error(f"Error in food recommendations: {e}")
        return jsonify({
            "error": f"Failed to generate food recommendations: {str(e)}"
        }), 500

@app.route('/api/identify_food', methods=['POST'])
def identify_food():
    """Identify food/ingredient from uploaded image and provide analysis or recipes"""
    logging.info("--- Food Identification Endpoint Hit ---")
    
    try:
        # Handle image upload
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image file selected"}), 400
        
        # Get user context for personalized advice
        user_email = request.form.get('user_email', '')
        fitness_goal = request.form.get('fitness_goal', 'general')
        dietary_restrictions = request.form.get('dietary_restrictions', '')
        analysis_type = request.form.get('analysis_type', 'food')  # 'food' or 'ingredient'
        
        # Save the uploaded image temporarily
        image_filename = f"food_identification_{uuid.uuid4()}.jpg"
        image_path = os.path.join(capture_folder, image_filename)
        image_file.save(image_path)
        
        # Identify the food/ingredient and get analysis or recipes
        food_analysis = identify_food_from_image(
            image_path=image_path,
            analysis_type=analysis_type,
            fitness_goal=fitness_goal,
            dietary_restrictions=dietary_restrictions,
            user_email=user_email
        )
        
        # Clean up the temporary image file
        try:
            os.remove(image_path)
        except Exception as cleanup_error:
            logging.warning(f"Failed to cleanup temporary image: {cleanup_error}")
        
        return jsonify({
            "success": True,
            "analysis_type": analysis_type,
            "food_analysis": food_analysis
        })
        
    except Exception as e:
        logging.error(f"Error in food identification: {e}")
        return jsonify({
            "error": f"Failed to identify food: {str(e)}"
        }), 500

@app.route('/video_feed')
def video_feed():
    # This is for streaming server's camera, not directly related to frontend capture processing
    camera_device = cv2.VideoCapture(0) # Ensure camera is initialized here if used
    def gen_frames():
        while True:
            success, frame = camera_device.read() # Use the local camera_device
            if not success:
                logging.warning("Failed to read frame from server camera for video_feed.")
                break
            else:
                ret, buffer = cv2.imencode('.jpg', frame)
                if not ret:
                    logging.warning("Failed to encode frame for video_feed.")
                    continue
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        camera_device.release() # Release camera when done
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # For more detailed Flask logs, especially if not using app.debug=True in production
    # handler = logging.StreamHandler()
    # handler.setLevel(logging.DEBUG)
    # app.logger.addHandler(handler)
    # app.logger.setLevel(logging.DEBUG)
    app.run(debug=True)
