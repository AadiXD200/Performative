// Webcam and object detection simulation
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const startCameraButton = document.getElementById('start-camera');
const captureButton = document.getElementById('capture');
const resultsSection = document.getElementById('results');
const verificationText = document.getElementById('verification-text');
const signInButton = document.getElementById('sign-in');

let stream = null;

// Start webcam
startCameraButton.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        captureButton.disabled = false;
        startCameraButton.disabled = true;
    } catch (err) {
        console.error('Error accessing webcam:', err);
        alert('Error accessing webcam. Please make sure you have given permission.');
    }
});

// Capture and analyze image
captureButton.addEventListener('click', () => {
    // Draw current video frame to canvas
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simulate object detection (in a real app, this would be sent to a backend)
    simulateObjectDetection();
    
    // Show results section
    resultsSection.style.display = 'block';
});

// Simulate object detection (this would be done by a backend in a real app)
function simulateObjectDetection() {
    // Generate random detection results for demonstration
    const objects = ['matcha', 'earphones', 'plushie', 'camera', 'books'];
    const detectedObjects = [];
    
    objects.forEach(object => {
        // 60% chance of detecting each object for demo purposes
        const isDetected = Math.random() < 0.6;
        
        const objectElement = document.querySelector(`.object-item[data-object="${object}"] .object-status`);
        if (isDetected) {
            objectElement.textContent = 'Detected';
            objectElement.className = 'object-status detected';
            detectedObjects.push(object);
        } else {
            objectElement.textContent = 'Not detected';
            objectElement.className = 'object-status not-detected';
        }
    });
    
    // Check if user has at least 2 objects
    if (detectedObjects.length >= 2) {
        verificationText.textContent = `Success! You have ${detectedObjects.length} performative objects. You can sign in.`;
        verificationText.className = 'success';
        signInButton.disabled = false;
    } else {
        verificationText.textContent = `You only have ${detectedObjects.length} performative objects. You need at least 2 to sign in.`;
        verificationText.className = 'failure';
        signInButton.disabled = true;
    }
}

// Sign in button
signInButton.addEventListener('click', () => {
    alert('Successfully signed in! Welcome to Performative App.');
    // In a real app, you would redirect to the main app page
});
