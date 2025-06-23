from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import cv2
import os
import uuid
import logging
from dotenv import load_dotenv
from ai import get_fitness_recommendation

app = Flask(__name__)
CORS(app)
# Initialize camera instance if needed for other parts, but not for frontend capture processing
# camera = cv2.VideoCapture(0) 
capture_folder = 'captured_images'

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
    
    try:
        result = get_fitness_recommendation(images)
        # ai.py's get_fitness_recommendation returns a string "An error occurred..." on its internal errors.
        # This is currently returned as part of a 200 OK.
        if isinstance(result, str) and "An error occurred" in result:
            logging.warning(f"get_fitness_recommendation (ai.py) indicated an error: {result}")
            # If you want this to be a server error that triggers frontend's catch:
            # return jsonify({'error': result, 'source': 'ai_processing'}), 500
        
        logging.info(f"Recommendation result from ai.py: {result}")
        return jsonify({'recommendation': result})
    except Exception as e:
        logging.error(f"Unexpected error during get_fitness_recommendation call or while creating response: {e}", exc_info=True)
        return jsonify({'error': 'An internal server error occurred while generating recommendations.'}), 500

@app.route('/api/video_feed')
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
