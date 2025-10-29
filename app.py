from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# This is a placeholder for actual object detection
# In a real implementation, you would use a pre-trained model
def detect_objects(image):
    """
    Placeholder function for object detection.
    In a real implementation, this would use a model like YOLO, SSD, etc.
    """
    # For demonstration, we'll return random results
    import random
    
    objects_to_detect = ['matcha', 'earphones', 'plushie', 'camera', 'books']
    detected_objects = []
    
    for obj in objects_to_detect:
        # 60% chance of detecting each object
        if random.random() < 0.6:
            detected_objects.append(obj)
    
    return detected_objects

@app.route('/detect-objects', methods=['POST'])
def detect_objects_endpoint():
    """
    Endpoint to receive image and return detected objects
    """
    try:
        # Get image data from request
        data = request.get_json()
        image_data = data.get('image')
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Perform object detection
        detected_objects = detect_objects(image)
        
        # Return results
        return jsonify({
            'success': True,
            'detected_objects': detected_objects,
            'count': len(detected_objects),
            'can_sign_in': len(detected_objects) >= 2
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/')
def index():
    return "Performative App Backend is running!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)

