# 🎭 Performative Male App

> 🏆 **Winner — Best Application of Google Gemini API** at [UofT Hacks: Hack or Treat](https://devpost.com/software/performative-male-r7xflw)

**[Watch the demo on YouTube](https://www.youtube.com/watch?v=iCuC8lhZV8s)** · **[View on Devpost](https://devpost.com/software/performative-male-r7xflw)**

---

A performative aesthetic detection app that combines real-time computer vision, AI image transformation, and retro arcade games. Prove your performativity through your possessions (matcha, wired earphones, plushies, cameras, and feminist literature), then enjoy games featuring your AI-transformed persona.

![Performative Male](https://img.shields.io/badge/Aesthetic-Performative-pink?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Hackathon Winner](https://img.shields.io/badge/UofT%20Hacks-Best%20Gemini%20API-gold?style=for-the-badge)

## ✨ Features

- **Real-time Object Detection**: Uses YOLOv8 to detect performative items (matcha, cameras, plushies, books) and custom vision algorithms for wired earphones
- **AI-Powered Transformation**: Google Gemini API transforms your photo into the ultimate performative aesthetic
- **Interactive Games**:
  - **Matcha Man**: Craft the perfect matcha latte with precision
  - **Performative Pac**: Classic Pac-Man with your performative image as the main character
- **Music Integration**: Automatic music playback on detection and game completion
- **Modern UI**: Beautiful React + TypeScript frontend with Tailwind CSS

## 🎯 The Performative Password

To sign in, you need at least one of these performative items:
- 🍵 **Matcha** (detected via cups)
- 📸 **Camera**
- 🧸 **Plushie** (teddy bears)
- 📚 **Books** (feminist literature preferred)
- 🎧 **Wired Earphones** (custom strict detector)

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ 
- Node.js 16+ and npm
- Webcam access
- Google Gemini API key (optional but recommended) - Get one at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "performative fr"
   ```

2. **Backend Setup**
   ```bash
   # Create virtual environment
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure Gemini API** (Optional)
   
   Edit `run.sh` and add your API key:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```
   
   Or set it as an environment variable:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```

5. **Add Music File**
   
   Place your music file at `static/perfectpair.mp3` (any MP3 file)

### Running the App

**Option 1: Using the run script (Recommended)**
```bash
chmod +x run.sh
./run.sh
```

**Option 2: Manual setup**

For development with hot reload:
```bash
# Terminal 1: Backend
source .venv/bin/activate
python app.py

# Terminal 2: Frontend
cd frontend
npm run dev
```
Then visit `http://localhost:5173`

For production:
```bash
# Build frontend
cd frontend
npm run build
cd ..

# Run Flask
source .venv/bin/activate
python app.py
```
Then visit `http://127.0.0.1:5000`

## 🎮 How It Works

1. **Detection Phase**: 
   - Open the camera modal and show your performative items
   - YOLOv8 detects objects (matcha cups, cameras, plushies, books)
   - Custom vision algorithm detects wired earphones with strict criteria
   - A persistent checklist tracks detected items

2. **Sign In**:
   - Once at least one item is detected, the "Sign In" button becomes active
   - Your photo is captured and sent to Gemini API
   - Gemini transforms you into the ultimate performative aesthetic

3. **Congratulations Page**:
   - View your transformed performative image
   - See your detected items
   - Access the games arcade

4. **Games**:
   - **Matcha Man**: Interactive matcha-making simulator
   - **Performative Pac**: Arcade game where your performative image is Pac-Man and bodybuilders are ghosts

## 🏗️ Project Structure

```
performative fr/
├── app.py                 # Flask backend server
├── run.sh                # Run script with API key setup
├── requirements.txt      # Python dependencies
├── templates/            # HTML templates
│   ├── matcha.html       # Matcha Man game
│   ├── pacman.html       # Performative Pac game
│   └── play.html         # GIF display page
├── static/               # Static assets
│   ├── games/            # Game assets
│   │   ├── matcha/       # Matcha game files
│   │   └── pacman/       # Pac-Man game files
│   └── perfectpair.mp3   # Background music
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── sections/     # Homepage sections
│   │   └── services/     # API services
│   └── package.json
└── output/               # Generated performative images (gitignored)
```

## 🔧 Technology Stack

### Backend
- **Flask** - Web framework
- **YOLOv8** (Ultralytics) - Object detection
- **OpenCV** - Computer vision for wired earphones detection
- **Google Gemini API** - AI image transformation
- **Pillow (PIL)** - Image processing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling

## 📝 API Endpoints

- `POST /detect` - Detect performative items in an image
- `POST /gemini_convert` - Transform image using Gemini AI
- `GET /outputs/latest` - Get the latest performative image
- `GET /outputs/<filename>` - Get a specific performative image
- `GET /games/matcha` - Matcha Man game
- `GET /games/pacman` - Performative Pac game

## 🎨 Customization

### Detection Thresholds

Edit `MIN_CONFIDENCE` in `app.py` to adjust detection sensitivity:
```python
MIN_CONFIDENCE: Dict[str, float] = {
    "Books": 0.6,
    "Matcha": 0.7,
    "Camera": 0.55,
    "Plushie": 0.5,
    "Wired Earphones": 0.7,
}
```

### Music

Replace `static/perfectpair.mp3` with your own music file (any MP3).

### Styling

The frontend uses Tailwind CSS. Edit component files in `frontend/src/` to customize the aesthetic.

## 🐛 Troubleshooting

**Camera not working?**
- Check browser permissions for camera access
- Make sure you're using HTTPS or localhost

**Detection not working?**
- Ensure YOLOv8 model downloads successfully (check console)
- Lower confidence thresholds if needed
- Check that items are well-lit and in frame

**Gemini API errors?**
- Verify your API key is set correctly
- Check quota limits at Google AI Studio
- The app will fallback to local image processing if Gemini fails

**Music not playing?**
- Browser autoplay policies may block music
- Try clicking anywhere on the page to enable playback
- Ensure `static/perfectpair.mp3` exists

## 📄 License

This project is open source and available for personal/educational use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 🙏 Acknowledgments

- YOLOv8 by Ultralytics
- Google Gemini API
- React and Vite communities
- All the performative males who inspired this project

---

**Made with 💖 and matcha**

For questions or issues, please open an issue on GitHub.
