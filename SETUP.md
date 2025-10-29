# Setup Guide

This guide provides detailed setup instructions for the Performative Male app.

## System Requirements

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **npm**: 8 or higher (comes with Node.js)
- **Operating System**: macOS, Linux, or Windows

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "performative fr"
```

### 2. Backend Setup

#### Create Virtual Environment

```bash
python3 -m venv .venv
```

#### Activate Virtual Environment

- **macOS/Linux**:
  ```bash
  source .venv/bin/activate
  ```

- **Windows**:
  ```bash
  .venv\Scripts\activate
  ```

#### Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install:
- Flask (web server)
- OpenCV (computer vision)
- Ultralytics (YOLOv8)
- Google Generative AI (Gemini API)
- And other dependencies

### 3. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

This installs React, TypeScript, Vite, Tailwind CSS, and other frontend dependencies.

### 4. Gemini API Key Setup

1. **Get an API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key

2. **Configure the Key**:

   **Option A: Edit run.sh (Recommended)**
   ```bash
   # Open run.sh and update line 6:
   export GEMINI_API_KEY="${GEMINI_API_KEY:-YOUR_KEY_HERE}"
   ```

   **Option B: Environment Variable**
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```

   **Option C: Set in app.py (fallback)**
   The app includes a hardcoded fallback key that can be updated.

### 5. Add Music File

Place your background music file at:
```
static/perfectpair.mp3
```

You can use any MP3 file. The app will automatically play this when performative items are detected.

### 6. Download YOLO Model

The YOLOv8 model (`yolov8n.pt`) will automatically download on first run. Make sure you have an internet connection.

## Running the Application

### Development Mode (Hot Reload)

**Terminal 1 - Backend:**
```bash
source .venv/bin/activate  # Activate venv
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` (Vite dev server)

### Production Mode

**Step 1: Build Frontend**
```bash
cd frontend
npm run build
cd ..
```

**Step 2: Run Flask**
```bash
source .venv/bin/activate
python app.py
```

Visit `http://127.0.0.1:5000`

### Using the Run Script (Easiest)

```bash
chmod +x run.sh
./run.sh
```

This script:
- Sets up the virtual environment
- Installs dependencies
- Configures the API key
- Runs the Flask server

## Verification

1. **Check Backend**: Visit `http://127.0.0.1:5000/test`
   - Should return JSON with model status

2. **Check Frontend**: Open the app in browser
   - Should see the homepage
   - Camera modal should request permissions

3. **Test Detection**: 
   - Open camera
   - Show a performative item
   - Should see detection feedback

## Common Issues

### Python Import Errors

If you get import errors:
```bash
pip install --force-reinstall -r requirements.txt
```

### Node Modules Issues

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### YOLO Model Not Loading

The model downloads automatically. If it fails:
- Check internet connection
- Manually download from: https://github.com/ultralytics/assets/releases
- Place `yolov8n.pt` in the project root

### Camera Access Denied

- Use `localhost` or `127.0.0.1` (not `192.168.x.x`)
- Use HTTPS in production
- Check browser permissions

### Gemini API Quota Exceeded

- Free tier has limits
- Wait for quota reset
- Create a new API key
- Upgrade to paid tier if needed

## Next Steps

Once setup is complete:
1. Test object detection with various items
2. Try signing in with performative items
3. Check the congratulations page for Gemini transformation
4. Play the games!

For more information, see the main [README.md](README.md).
