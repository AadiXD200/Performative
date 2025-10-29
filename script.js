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
captureButton.addEventListener('click', async () => {
    // Draw current video frame to canvas
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data from canvas
    const imageData = canvas.toDataURL('image/jpeg');

    // Send image to backend for detection
    try {
        const response = await fetch('http://127.0.0.1:5000/detect-objects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageData }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        updateUIWithResults(result);

    } catch (error) {
        console.error('Error sending image to backend:', error);
        verificationText.textContent = 'Error communicating with the server. Please try again.';
        verificationText.className = 'failure';
    } finally {
        // Show results section regardless of success or failure
        resultsSection.style.display = 'block';
    }
});

function updateUIWithResults(result) {
    const allObjects = ['matcha', 'earphones', 'plushie', 'camera', 'books'];
    const detectedObjects = result.detected_objects || [];

    allObjects.forEach(object => {
        const objectStatusElement = document.querySelector(`.object-item[data-object="${object}"] .object-status`);
        const isDetected = detectedObjects.includes(object);
        objectStatusElement.textContent = isDetected ? 'Detected' : 'Not Detected';
        objectStatusElement.className = `object-status ${isDetected ? 'detected' : 'not-detected'}`;
    });

    if (result.can_sign_in) {
        verificationText.textContent = `Success! You have ${result.count} performative objects. You can sign in.`;
        verificationText.className = 'success';
        signInButton.disabled = false;
    } else {
        verificationText.textContent = `You only have ${result.count} performative objects. You need at least 2 to sign in.`;
        verificationText.className = 'failure';
        signInButton.disabled = true;
    }
}

// Sign in button
signInButton.addEventListener('click', () => {
    alert('Successfully signed in! Welcome to Performative App.');
    // In a real app, you would redirect to the main app page
});

