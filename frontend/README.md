# Performative Male - Frontend

React + TypeScript + Vite frontend for the Performative Male app.

## Development Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start Vite dev server (runs on port 5173):
```bash
npm run dev
```

The Vite dev server proxies API requests to Flask backend (port 5000).

3. Make sure Flask backend is running on port 5000:
```bash
cd ..
source .venv/bin/activate
python app.py
```

## Production Build

To build for production (served by Flask):

```bash
cd frontend
npm run build
```

This creates a `dist/` folder that Flask serves at the root route.

## Integration with Backend

The frontend calls these Flask endpoints:
- `POST /detect` - Real-time item detection from camera
- `POST /gemini_convert` - Convert image to performative style
- `POST /generate_gif` - Generate animated GIF
- `GET /play` - Display the generated GIF

Camera functionality is integrated in `src/components/CameraModal.tsx`.

