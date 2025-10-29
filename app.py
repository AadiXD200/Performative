from __future__ import annotations

import base64
import io
import os
from typing import Dict, List, Set, Tuple

import cv2
import numpy as np
from flask import Flask, jsonify, render_template, request, send_from_directory
import time
import pathlib
from flask_cors import CORS
from PIL import Image, ImageDraw
import requests

try:
    from ultralytics import YOLO
except Exception:  # pragma: no cover
    YOLO = None  # type: ignore

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except Exception:  # pragma: no cover
    GEMINI_AVAILABLE = False  # type: ignore


# Serve static files from both locations
app = Flask(__name__, static_folder='frontend/dist', static_url_path='', template_folder='templates')
CORS(app)  # Enable CORS for React frontend


# Load YOLO model once at startup. Falls back gracefully if ultralytics missing.
MODEL: YOLO | None = None
DETECTION_READY: bool = False

# Initialize Gemini API - function to reload config
# FALLBACK API KEY (hardcoded as backup if env var fails)
FALLBACK_GEMINI_API_KEY = "AIzaSyDVxOFl3EZwBpWPxtwSvhfz8G_3A5U3Tf0"

def init_gemini():
    """Initialize or reinitialize Gemini API configuration."""
    global GEMINI_API_KEY, GEMINI_MODEL, GEMINI_READY
    
    # Try to get API key from environment first
    env_key = os.environ.get("GEMINI_API_KEY", "")
    
    # Use environment key if set, otherwise use fallback
    GEMINI_API_KEY = env_key if env_key else FALLBACK_GEMINI_API_KEY
    
    print(f"[DEBUG] GEMINI_API_KEY from env: {'SET' if env_key else 'NOT SET (using fallback)'}")
    print(f"[DEBUG] GEMINI_API_KEY value (first 10 chars): {GEMINI_API_KEY[:10]}...")
    
    if not GEMINI_AVAILABLE:
        print("[DEBUG] ❌ GEMINI_AVAILABLE is False - google.generativeai not installed")
        print("[DEBUG] Please install google-generativeai: pip install google-generativeai")
        GEMINI_MODEL = None
        GEMINI_READY = False
        return
    
    if GEMINI_AVAILABLE and GEMINI_API_KEY:
        try:
            print("[DEBUG] Configuring Gemini API...")
            genai.configure(api_key=GEMINI_API_KEY)
            GEMINI_MODEL = genai.GenerativeModel('gemini-1.5-flash')
            GEMINI_READY = True
            print(f"[DEBUG] ✅ Gemini API configured successfully! GEMINI_READY={GEMINI_READY}")
        except Exception as e:
            print(f"[DEBUG] ❌ Error configuring Gemini: {e}")
            import traceback
            traceback.print_exc()
            GEMINI_MODEL = None
            GEMINI_READY = False
    else:
        if not GEMINI_AVAILABLE:
            print("[DEBUG] ❌ GEMINI_AVAILABLE is False - google.generativeai not installed")
        if not GEMINI_API_KEY:
            print("[DEBUG] ❌ GEMINI_API_KEY is not set!")
        GEMINI_MODEL = None
        GEMINI_READY = False

# Initialize on import
GEMINI_API_KEY = ""
GEMINI_MODEL = None
GEMINI_READY = False
init_gemini()


def load_model() -> None:
    global MODEL, DETECTION_READY
    if YOLO is None:
        print("WARNING: YOLO not available - ultralytics not installed")
        DETECTION_READY = False
        return
    try:
        print("Loading YOLO model...")
        MODEL = YOLO("yolov8n.pt")  # small, fast model (auto-downloads if missing)
        DETECTION_READY = True
        print(f"✓ YOLO model loaded successfully (DETECTION_READY={DETECTION_READY})")
    except Exception as e:
        print(f"ERROR: Failed to load YOLO model: {e}")
        import traceback
        traceback.print_exc()
        MODEL = None
        DETECTION_READY = False


# Map COCO class names to our "performative" items
# COCO supports: book, cup (matcha proxy), camera, teddy bear (plushie proxy)
# STRICT: We require higher confidence and additional validation to prevent false positives
TARGET_CLASS_TO_LABEL: Dict[str, str] = {
    "book": "Books",
    "cup": "Matcha",
    "camera": "Camera",
    "teddy bear": "Plushie",
}

# Minimum confidence thresholds for each class (stricter than default)
MIN_CONFIDENCE: Dict[str, float] = {
    "Books": 0.6,      # High threshold - books are common false positives
    "Matcha": 0.7,     # Very high - cups are too generic
    "Camera": 0.55,    # Medium-high
    "Plushie": 0.5,    # Medium - teddy bears are reasonably specific
    "Wired Earphones": 0.7,  # STRICT: High threshold, requires both earbuds + wire
}


def detect_wired_earphones(bgr: np.ndarray) -> Tuple[bool, float]:
    """Detect wired earphones using classical vision techniques - STRICT MODE.
    
    STRICT REQUIREMENTS:
    - Two circular/oval shapes (earbuds) positioned symmetrically at ear height
    - Clear visible wire/cable connecting them
    - Both must be in upper 30% of frame (head region)
    - Must have proper size ratio (not too small, not too large)
    - Must have dark/contrasting appearance (typical earphone color)
    
    Returns:
        Tuple of (detected: bool, confidence: float in 0-1)
    """
    try:
        h, w = bgr.shape[:2]
        
        # Convert to grayscale
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        
        # Apply stronger Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        
        # More strict edge detection (higher thresholds to reduce noise)
        edges = cv2.Canny(blurred, 80, 200)
        
        # Less aggressive dilation
        kernel = np.ones((2, 2), np.uint8)
        edges = cv2.dilate(edges, kernel, iterations=1)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if len(contours) < 3:  # Need at least 3 contours (2 earbuds + wire)
            return False, 0.0
        
        # STRICT: Focus only on upper 30% of frame (head/ear region)
        upper_region_y = int(h * 0.3)
        
        # Find potential earbud candidates (roughly circular/oval shapes)
        earbud_candidates = []
        wire_candidates = []
        
        for contour in contours:
            if len(contour) < 8:  # Need more points for reliable shape
                continue
            
            x, y, w_rect, h_rect = cv2.boundingRect(contour)
            center_y = y + h_rect // 2
            
            # STRICT: Only consider contours in upper 30% region
            if center_y > upper_region_y:
                continue
            
            area = cv2.contourArea(contour)
            min_area = 100  # Larger minimum area
            max_area = int(w * h * 0.05)  # Smaller max (5% instead of 10%)
            
            if area < min_area or area > max_area:
                continue
            
            aspect_ratio = w_rect / max(h_rect, 1)
            if aspect_ratio < 0.1 or aspect_ratio > 10:
                continue
            
            # STRICT: Check if contour is dark (typical of earphones/wires)
            roi = gray[max(0, y):min(h, y+h_rect), max(0, x):min(w, x+w_rect)]
            if roi.size > 0:
                mean_brightness = np.mean(roi)
                # Wired earphones are typically dark (black/dark gray)
                if mean_brightness > 150:  # Too bright, likely not an earphone
                    continue
            
            # Earbuds: STRICT circular/oval criteria
            if 0.6 <= aspect_ratio <= 1.8:  # Tighter range
                perimeter = cv2.arcLength(contour, True)
                if perimeter > 0:
                    circularity = 4 * np.pi * area / (perimeter * perimeter)
                    # STRICT: Higher circularity requirement
                    if circularity > 0.4:  # More circular
                        M = cv2.moments(contour)
                        if M["m00"] != 0:
                            cx = int(M["m10"] / M["m00"])
                            cy = int(M["m01"] / M["m00"])
                            # STRICT: Size check - earbuds should be reasonable size
                            radius_estimate = np.sqrt(area / np.pi)
                            if 8 <= radius_estimate <= 30:  # Reasonable earbud size
                                earbud_candidates.append({
                                    "center": (cx, cy),
                                    "area": area,
                                    "circularity": circularity,
                                    "aspect": aspect_ratio,
                                    "brightness": mean_brightness
                                })
            
            # Wires: STRICT thin, elongated criteria
            elif aspect_ratio > 4.0 or (1.0 / max(aspect_ratio, 0.001)) > 4.0:
                # STRICT: Must be very thin and reasonably long
                if min(w_rect, h_rect) < 8 and max(w_rect, h_rect) > 40:
                    # STRICT: Wire should be in upper region and connect between ear positions
                    wire_candidates.append({
                        "center": (x + w_rect // 2, y + h_rect // 2),
                        "length": max(w_rect, h_rect),
                        "start": (x, y),
                        "end": (x + w_rect, y + h_rect),
                        "brightness": mean_brightness
                    })
        
        # STRICT: Require both earbuds AND a connecting wire
        if len(earbud_candidates) >= 2 and len(wire_candidates) >= 1:
            frame_center_x = w // 2
            
            left_earbuds = [e for e in earbud_candidates if e["center"][0] < frame_center_x]
            right_earbuds = [e for e in earbud_candidates if e["center"][0] >= frame_center_x]
            
            # STRICT: Check for symmetric pairs with very tight criteria
            for left in left_earbuds:
                for right in right_earbuds:
                    # STRICT: Must be at nearly the same height (within 8% of frame)
                    y_diff = abs(left["center"][1] - right["center"][1])
                    if y_diff > h * 0.08:  # Very strict height alignment
                        continue
                    
                    # STRICT: Horizontal distance must match typical ear separation
                    x_distance = abs(left["center"][0] - right["center"][0])
                    if not (w * 0.25 < x_distance < w * 0.65):  # Tighter range
                        continue
                    
                    # STRICT: Both should be dark (typical of black earphones)
                    if left["brightness"] > 120 or right["brightness"] > 120:
                        continue
                    
                    # STRICT: Check if wire connects the earbuds
                    wire_connects = False
                    for wire in wire_candidates:
                        wire_x, wire_y = wire["center"]
                        # Wire should be between the two earbuds
                        if (left["center"][0] < wire_x < right["center"][0] or 
                            right["center"][0] < wire_x < left["center"][0]):
                            # Wire should be near the earbuds vertically
                            if abs(wire_y - (left["center"][1] + right["center"][1]) / 2) < h * 0.1:
                                # Wire should be dark
                                if wire["brightness"] < 100:
                                    wire_connects = True
                                    break
                    
                    if not wire_connects:
                        continue
                    
                    # Compute confidence - STRICT scoring
                    avg_circularity = (left["circularity"] + right["circularity"]) / 2.0
                    symmetry_score = 1.0 - (y_diff / (h * 0.08))
                    size_match = 1.0 - abs(left["area"] - right["area"]) / max(left["area"], right["area"], 1)
                    
                    # Only high confidence detections
                    base_confidence = (avg_circularity * 0.4 + symmetry_score * 0.4 + size_match * 0.2)
                    
                    # STRICT: Only return if confidence is high enough
                    if base_confidence >= 0.7:  # High threshold
                        return True, min(0.95, base_confidence)
        
        # NO FALLBACKS - require strict criteria or return false
        return False, 0.0
        
    except Exception:
        return False, 0.0


def parse_data_url_to_bgr(data_url: str) -> np.ndarray:
    """Convert a data URL (data:image/jpeg;base64,...) to an OpenCV BGR image."""
    if "," in data_url:
        base64_part = data_url.split(",", 1)[1]
    else:
        base64_part = data_url
    binary = base64.b64decode(base64_part)
    image = np.frombuffer(binary, dtype=np.uint8)
    bgr = cv2.imdecode(image, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("Failed to decode image")
    return bgr


def performative_detect(bgr: np.ndarray) -> Tuple[List[Dict], Set[str]]:
    """Run YOLO on the frame and extract performative detections.
    Also runs custom earphone detection.

    Returns a tuple of:
      - list of dicts {label, name, confidence}
      - set of canonical labels detected (e.g., {"Matcha", "Books", "Wired Earphones"})
    """
    detections: List[Dict] = []
    labels_found: Set[str] = set()
    
    # Run YOLO detection if available
    if DETECTION_READY and MODEL is not None:
        try:
            # Run inference
            results = MODEL.predict(bgr, imgsz=640, verbose=False)
            if results:
                r = results[0]
                names = r.names  # id -> class name

                if r.boxes is not None and len(r.boxes) > 0:
                    for box in r.boxes:
                        cls_id = int(box.cls.item()) if hasattr(box.cls, "item") else int(box.cls)
                        conf = float(box.conf.item()) if hasattr(box.conf, "item") else float(box.conf)
                        class_name = names.get(cls_id, str(cls_id))
                        
                        if class_name in TARGET_CLASS_TO_LABEL:
                            friendly = TARGET_CLASS_TO_LABEL[class_name]
                            min_conf = MIN_CONFIDENCE.get(friendly, 0.5)
                            
                            # STRICT: Only accept if confidence exceeds threshold
                            if conf >= min_conf:
                                # Additional validation for Matcha (cup) - check color/brightness
                                if friendly == "Matcha" and conf >= min_conf:
                                    # Extract ROI and check if it looks greenish (matcha color)
                                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                                    roi = bgr[max(0, y1):min(bgr.shape[0], y2), max(0, x1):min(bgr.shape[1], x2)]
                                    if roi.size > 0:
                                        # Convert to HSV and check green channel
                                        hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
                                        # Matcha is typically green (H: 60-120 in HSV)
                                        green_pixels = np.sum((hsv_roi[:, :, 0] >= 40) & (hsv_roi[:, :, 0] <= 80))
                                        green_ratio = green_pixels / (roi.shape[0] * roi.shape[1]) if roi.size > 0 else 0
                                        # Require at least 15% green pixels to be matcha
                                        if green_ratio < 0.15:
                                            app.logger.debug(f"Rejected cup as matcha (green ratio: {green_ratio:.2f})")
                                            continue
                                
                                # Additional validation for Books - check aspect ratio
                                if friendly == "Books" and conf >= min_conf:
                                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                                    width = abs(x2 - x1)
                                    height = abs(y2 - y1)
                                    aspect_ratio = width / height if height > 0 else 0
                                    # Books should be rectangular, not too square (avoid false positives)
                                    if aspect_ratio < 0.3 or aspect_ratio > 3.0:
                                        app.logger.debug(f"Rejected book (aspect ratio: {aspect_ratio:.2f})")
                                        continue
                                
                                detections.append({
                                    "name": class_name,
                                    "label": friendly,
                                    "confidence": round(conf, 3),
                                })
                                labels_found.add(friendly)
        except Exception as e:
            app.logger.warning(f"YOLO detection failed: {e}", exc_info=True)
            # Continue with earphone detection even if YOLO fails
    
    # Run custom wired earphone detection (STRICT - only if confidence is high enough)
    earphones_detected, earphones_conf = detect_wired_earphones(bgr)
    min_conf_earphones = MIN_CONFIDENCE.get("Wired Earphones", 0.7)  # Raised from 0.5 to 0.7
    if earphones_detected and earphones_conf >= min_conf_earphones:
        detections.append({
            "name": "wired earphones",
            "label": "Wired Earphones",
            "confidence": round(earphones_conf, 3),
        })
        labels_found.add("Wired Earphones")

    return detections, labels_found


@app.route("/")
def index():
    """Serve React app index.html"""
    try:
        return send_from_directory('frontend/dist', 'index.html')
    except FileNotFoundError:
        # Fallback to original template if React build doesn't exist
        return render_template("index.html")

@app.route("/static/<path:filename>")
def serve_static(filename):
    """Serve static files from the static/ directory (music, etc.)"""
    return send_from_directory('static', filename)


@app.route("/detect", methods=["POST"])
def detect():
    try:
        payload = request.get_json(force=True, silent=False)
        data_url = payload.get("image") if isinstance(payload, dict) else None
        if not data_url:
            return jsonify({"ok": False, "error": "Missing image", "detected": [], "labels": [], "score": 0, "suggestions": [], "ready": DETECTION_READY}), 400

        bgr = parse_data_url_to_bgr(data_url)
        detections, labels = performative_detect(bgr)

        # Compute a simple score: sum of confidences for unique labels, scaled to 0-100
        unique_scores: Dict[str, float] = {}
        for d in detections:
            label = d["label"]
            unique_scores[label] = max(unique_scores.get(label, 0.0), float(d["confidence"]))
        raw_score = sum(unique_scores.values())  # 0..~N
        # Score is now: each detected item contributes its confidence (0-1), scaled to 0-100
        # This means if you detect 1 item at 0.5 confidence, score = 50%
        # If you detect 2 items at 0.8 confidence each, score = 80%
        score = int(min(100, max(0, round(raw_score * 100))))

        suggestions: List[str] = []
        all_target_labels = set(TARGET_CLASS_TO_LABEL.values()) | {"Wired Earphones"}
        missing = all_target_labels - set(unique_scores.keys())
        for m in sorted(missing):
            if m == "Matcha":
                suggestions.append("Hold a green drink (matcha) in frame")
            elif m == "Books":
                suggestions.append("Show a book (feminist lit even better)")
            elif m == "Plushie":
                suggestions.append("Bring a plushie into view")
            elif m == "Camera":
                suggestions.append("Show a camera")
            elif m == "Wired Earphones":
                suggestions.append("Wear wired earphones (visible in the upper frame)")

        
        return jsonify({
            "ok": True,
            "detected": detections,
            "labels": sorted(list(labels)),
            "score": score,
            "suggestions": suggestions,
            "ready": DETECTION_READY,
        })
    except Exception as e:
        app.logger.error(f"Detection error: {e}", exc_info=True)
        return jsonify({
            "ok": False,
            "error": str(e),
            "detected": [],
            "labels": [],
            "score": 0,
            "suggestions": [],
            "ready": DETECTION_READY,
        }), 500


@app.route("/gemini", methods=["POST"])
def gemini_transform():
    """Send captured image to Gemini for performative transformation analysis."""
    try:
        payload = request.get_json(force=True, silent=False)
        data_url = payload.get("image") if isinstance(payload, dict) else None
        if not data_url:
            return jsonify({"ok": False, "error": "Missing image"}), 400

        # Re-check if not ready
        if not GEMINI_READY:
            init_gemini()
        
        if not GEMINI_READY or GEMINI_MODEL is None:
            return jsonify({
                "ok": False,
                "error": f"Gemini API not configured. GEMINI_READY={GEMINI_READY}, MODEL={GEMINI_MODEL is not None}"
            }), 503

        # Parse image
        if "," in data_url:
            base64_part = data_url.split(",", 1)[1]
        else:
            base64_part = data_url
        binary = base64.b64decode(base64_part)
        
        # Convert to PIL Image for Gemini
        img_bytes = io.BytesIO(binary)
        pil_img = Image.open(img_bytes)
        pil_img = pil_img.convert("RGB")

        # Reference prompt based on the "Performative male final boss" aesthetic
        prompt = """You are analyzing an image for a performative transformation. Based on the aesthetic of "performative male" culture which includes:
- Vintage indie aesthetics (vinyl records, Laufey, beabadoobee, Mitski vibes)
- Soft boy/sad boy styling (wired earphones, matcha, vintage cameras)
- Thoughtful fashion (canvas totes, denim, minimalist accessories)
- Literary interests (feminist literature, Joan Didion, bell hooks)
- Curated, intentional, nostalgic items

Analyze this person's photo and describe how to make them look as performatively aesthetic as possible. Focus on:
1. Their pose and energy - suggest a performative dance movement (gentle, flowing, indie-dance style)
2. Visual elements - what aesthetic items complement them
3. Mood - nostalgic, soft, thoughtful

Return a JSON object with:
{
  "dance_style": "description of the performative dance movement",
  "aesthetic_items": ["list", "of", "items"],
  "mood": "description of the mood",
  "transformation_prompt": "vivid description for visualization"
}"""

        # Generate response
        response = GEMINI_MODEL.generate_content([prompt, pil_img])
        response_text = response.text.strip()

        # Try to extract JSON if wrapped in markdown
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        return jsonify({
            "ok": True,
            "response": response_text,
            "ready": True
        })
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


PERFORMATIVE_IMAGE_STYLIST_PROMPT = """You are PerformativeImageStylist.

Goal: Given a single person photo, output a new image that keeps the subject's identity and pose,
but restyles them into a "performative male final boss" aesthetic.

Hard constraints:
- Preserve the same face, skin tone, hair texture, body proportions, and camera perspective.
- No warping or melting of hands/face. Keep expression natural.
- Respect original background depth; do not add extra people or text overlays unless asked.
- Make tasteful additions; avoid giant logos or unreadable text.

Aesthetic direction:
- Pastel / coquette Tumblr-core color grade (blush #F9DDE5, lilac #E6D8FF, sage #D9F0E3),
  soft film grain, slight matte curve, gentle vignette.
- Lighting: soft daylight feel.

Wardrobe (choose a coherent set; adapt to pose/season):
- Top: simple tee or light knit; optional dark denim jacket or blue overalls.
- Bottom: dark raw denim with wide cuff or relaxed chinos.
- Shoes: gray New Balance 990/993 vibe OR black loafers with socks.
- Headwear (optional): mustard/yellow beanie.
- Accessories: wired Apple-style earphones (cable visible, one bud dangling).

Props (pick 2–4 that fit composition and hands):
- Iced matcha in clear cup.
- Canvas tote (indie/A24-ish artwork) hanging off shoulder or placed next to subject.
- Feminist/lit books with readable spines: "All About Love (bell hooks)", "The White Album (Joan Didion)",
  "Women, Race & Class (Angela Y. Davis)", "The Catcher in the Rye".
- Mirrorless/film camera (Sony A7 / point-and-shoot) on strap or in hand.
- Small plushie (bunny/"lababus" vibe) tucked in tote or on table.
- Vinyls/CD-R used as set dressing on table.
- Optional picnic blanket gingham if scene allows.

Scene treatment (if background is plain):
- Subtle cafe/library hints (table edge, cup shadow, book stack) without clutter.

Output quality:
- Keep composition believable (correct shadows/reflections, natural scale props, respect hand grips).
- 3:4 or original aspect ratio; minimum 1024px on the long side.
- No watermarks or UI chrome.

If clothing occludes, adapt (e.g., tote in foreground, earbud wire across chest).
Return only the edited image."""


OUTPUT_DIR = pathlib.Path("output")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


@app.route("/outputs/<path:filename>")
def serve_output_file(filename: str):
    return send_from_directory(OUTPUT_DIR.as_posix(), filename)


@app.route("/outputs/latest")
def latest_output():
    try:
        files = sorted(OUTPUT_DIR.glob("performative_*.png"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not files:
            return jsonify({"ok": False, "error": "No outputs yet"}), 404
        latest = files[0].name
        return jsonify({"ok": True, "filename": latest, "url": f"/outputs/{latest}"})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/gemini_convert", methods=["POST"])
def gemini_convert():
    """Ask Gemini to return an edited image: 'performative male final boss' conversion.

    Input JSON:
      { image: <data-url>, task_hint: <optional specific instructions> }

    Returns:
      { ok: true, image: <data-url PNG> } or falls back to performative_convert.
    """
    try:
        payload = request.get_json(force=True, silent=False)
        data_url = payload.get("image") if isinstance(payload, dict) else None
        task_hint = payload.get("task_hint", "")
        if not data_url:
            return jsonify({"ok": False, "error": "Missing image"}), 400

        # Use the module-level API key (includes fallback)
        api_key_to_use = GEMINI_API_KEY
        
        # Re-check at request time - if still not ready, try to reinitialize
        if not GEMINI_READY:
            app.logger.info("Gemini not ready, attempting to reinitialize...")
            init_gemini()
        
        if not GEMINI_READY or not api_key_to_use:
            app.logger.error(f"Gemini not ready - GEMINI_READY={GEMINI_READY}, API_KEY_SET={bool(api_key_to_use)}")
            return jsonify({
                "ok": False,
                "error": f"Gemini API not configured. GEMINI_READY={GEMINI_READY}, KEY_SET={bool(api_key_to_use)}"
            }), 503

        # Parse image
        if "," in data_url:
            base64_part = data_url.split(",", 1)[1]
        else:
            base64_part = data_url
        binary = base64.b64decode(base64_part)
        
        # Build prompt with optional task hint
        prompt = PERFORMATIVE_IMAGE_STYLIST_PROMPT
        if task_hint:
            prompt += f"\n\nTask: {task_hint}"
        else:
            # Default task if none provided
            prompt += "\n\nTask: Keep the face and hair; add wired earphones (one bud dangling), iced matcha in right hand, A24-style tote on left shoulder, dark cuffed denim + loafers, bell hooks 'All About Love' visible."

        # Build REST payload for v1beta gemini-2.5-flash-image
        parts = [
            {"text": prompt},
            {"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(binary).decode("ascii")}},
        ]

        req_body = {"contents": [{"parts": parts}]}
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent"
        headers = {"x-goog-api-key": api_key_to_use, "Content-Type": "application/json"}
        app.logger.info(f"Using API key: {api_key_to_use[:10]}...")

        app.logger.info("Sending image to Gemini for conversion...")
        resp = requests.post(url, headers=headers, json=req_body, timeout=120)
        app.logger.info(f"Gemini API response status: {resp.status_code}")
        
        if resp.ok:
            data = resp.json()
            # Navigate the structure to find inline image data
            candidates = data.get("candidates") or []
            app.logger.info(f"Found {len(candidates)} candidates in response")
            
            for cand in candidates:
                content = cand.get("content") or {}
                parts = content.get("parts", []) or []
                app.logger.info(f"Processing {len(parts)} parts")
                
                for part in parts:
                    inline = part.get("inline_data") or part.get("inlineData")
                    if inline and str(inline.get("mime_type") or inline.get("mimeType", "")).startswith("image/"):
                        image_b64 = inline.get("data")
                        if image_b64:
                            app.logger.info("✅ Gemini image conversion successful - returning transformed image")
                            # Save to outputs folder
                            binary_out = base64.b64decode(image_b64)
                            ts = int(time.time())
                            filename = f"performative_{ts}.png"
                            (OUTPUT_DIR / filename).write_bytes(binary_out)
                            saved_url = f"/outputs/{filename}"
                            return jsonify({
                                "ok": True,
                                "image": f"data:image/png;base64,{image_b64}",
                                "saved_url": saved_url,
                            })
            
            app.logger.warning("Gemini response OK but no image found in candidates")
        else:
            app.logger.error(f"Gemini API error: {resp.status_code} - {resp.text[:200]}")

        # Fallback to local overlay conversion if REST call fails or no image returned
        app.logger.warning("Gemini didn't return image, falling back to local conversion")
        base64_part = data_url.split(",", 1)[1] if "," in data_url else data_url
        binary = base64.b64decode(base64_part)
        img_bytes = io.BytesIO(binary)
        pil_img = Image.open(img_bytes).convert("RGBA")
        out = _draw_performative_overlay(pil_img)
        buf = io.BytesIO()
        out.convert("RGBA").save(buf, format="PNG")
        png_bytes = buf.getvalue()
        # Save fallback to outputs as well
        ts = int(time.time())
        filename = f"performative_{ts}.png"
        (OUTPUT_DIR / filename).write_bytes(png_bytes)
        saved_url = f"/outputs/{filename}"
        b64 = base64.b64encode(png_bytes).decode("ascii")
        return jsonify({"ok": True, "image": f"data:image/png;base64,{b64}", "saved_url": saved_url})

    except Exception as e:
        app.logger.error(f"Gemini conversion failed: {e}", exc_info=True)
        # Fallback to local overlay on error
        try:
            if 'data_url' in locals() and data_url:
                base64_part = data_url.split(",", 1)[1] if "," in data_url else data_url
                binary = base64.b64decode(base64_part)
                img_bytes = io.BytesIO(binary)
                pil_img = Image.open(img_bytes).convert("RGBA")
                out = _draw_performative_overlay(pil_img)
                buf = io.BytesIO()
                out.convert("RGB").save(buf, format="JPEG", quality=90)
                b64 = base64.b64encode(buf.getvalue()).decode("ascii")
                return jsonify({"ok": True, "image": f"data:image/jpeg;base64,{b64}"})
        except Exception as fallback_err:
            app.logger.error(f"Fallback conversion also failed: {fallback_err}")
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/generate_gif", methods=["POST"])
def generate_gif():
    """Create a short animated GIF based on the captured image.

    This simulates a performative dance by gently translating/rotating the image and
    overlaying a few aesthetic emojis. Returns a data URL for the GIF.
    """
    try:
        payload = request.get_json(force=True, silent=False)
        data_url = payload.get("image") if isinstance(payload, dict) else None
        if not data_url:
            return jsonify({"ok": False, "error": "Missing image"}), 400

        # Decode image
        base64_part = data_url.split(",", 1)[1] if "," in data_url else data_url
        binary = base64.b64decode(base64_part)
        pil_img = Image.open(io.BytesIO(binary)).convert("RGBA")

        # Prepare canvas
        target_size = (400, 400)
        bg = Image.new("RGBA", target_size, (16, 18, 32, 255))
        img = pil_img.copy()
        img.thumbnail((320, 320))

        # Precompute positions
        center_x = target_size[0] // 2
        center_y = target_size[1] // 2

        # Simple keyframe animation
        num_frames = 24
        frames = []
        emojis = ["🎵", "📷", "📚", "🍵", "🎧"]

        for i in range(num_frames):
            t = i / num_frames
            # Gentle sway
            dx = int(12 * np.cos(t * 2 * np.pi))
            dy = int(6 * np.sin(t * 2 * np.pi))
            angle = 4 * np.sin(t * 2 * np.pi)

            frame = bg.copy()
            # Rotate and paste subject
            subj = img.rotate(angle, resample=Image.BICUBIC, expand=True)
            sx, sy = subj.size
            paste_xy = (center_x - sx // 2 + dx, center_y - sy // 2 + dy)
            frame.alpha_composite(subj, paste_xy)

            # Draw floating emojis
            overlay = Image.new("RGBA", target_size, (0, 0, 0, 0))
            from PIL import ImageDraw, ImageFont
            draw = ImageDraw.Draw(overlay)
            for ei, e in enumerate(emojis):
                ang = (t * 2 * np.pi) + ei * 1.2
                radius = 140 + 10 * np.sin(t * 2 * np.pi)
                ex = int(center_x + np.cos(ang) * radius)
                ey = int(center_y + np.sin(ang) * radius)
                # Pillow default font supports basic emoji on mac; fallback is fine if missing
                draw.text((ex - 12, ey - 12), e, fill=(255, 255, 255, 230))
            frame = Image.alpha_composite(frame, overlay)

            # Slight vignette
            vignette = Image.new("RGBA", target_size, (0, 0, 0, 0))
            vdraw = ImageDraw.Draw(vignette)
            vdraw.ellipse((-50, -50, target_size[0] + 50, target_size[1] + 50), outline=None, width=0, fill=None)
            frame = frame.convert("P", palette=Image.ADAPTIVE)
            frames.append(frame)

        # Save to GIF bytes
        out_buf = io.BytesIO()
        frames[0].save(out_buf, format="GIF", save_all=True, append_images=frames[1:], duration=60, loop=0, disposal=2)
        gif_b64 = base64.b64encode(out_buf.getvalue()).decode("ascii")
        data_url_out = f"data:image/gif;base64,{gif_b64}"

        return jsonify({"ok": True, "gif": data_url_out})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/test", methods=["GET"])
def test():
    """Test endpoint to verify model is loaded"""
    return jsonify({
        "model_loaded": MODEL is not None,
        "detection_ready": DETECTION_READY,
        "yolo_available": YOLO is not None,
    })


@app.route("/play")
def play():
    """Minimal page that loads the generated GIF from localStorage and displays it."""
    return render_template("play.html")


@app.route("/games/matcha")
def games_matcha():
    """Serve the standalone Matcha Man game page."""
    return render_template("matcha.html")


@app.route("/games/pacman")
def games_pacman():
    """Serve the Performative Pac game page."""
    return render_template("pacman.html")


@app.route("/<path:path>")
def serve_react(path):
    """Serve React app static files - must be last route"""
    # Skip API routes
    api_routes = ['detect', 'gemini', 'gemini_convert', 'generate_gif', 'performative_convert', 'test', 'play', 'games/matcha', 'games/pacman']
    if path in api_routes:
        return jsonify({"error": "Route already handled"}), 404
    # Skip static files (handled by /static/ route)
    if path.startswith('static/'):
        return jsonify({"error": "Use /static/ path for static files"}), 404
    try:
        return send_from_directory('frontend/dist', path)
    except FileNotFoundError:
        # If file doesn't exist, serve index.html for client-side routing
        try:
            return send_from_directory('frontend/dist', 'index.html')
        except FileNotFoundError:
            return jsonify({"error": "React build not found. Run 'npm run build' in frontend/"}), 404


def _draw_performative_overlay(pil_img: Image.Image) -> Image.Image:
    """Overlay performative items using simple geometry relative to detected face.

    Uses OpenCV Haar cascade to find a face box, then draws:
    - Glasses across upper face
    - Wired earphones near ears with thin wires
    - Tote strap across shoulder
    - Matcha cup near lower-right of face
    - Overalls bib and straps on chest
    """
    # Convert to BGR for detection
    rgb = pil_img.convert("RGB")
    bgr = cv2.cvtColor(np.array(rgb), cv2.COLOR_RGB2BGR)

    # Load default frontal face cascade
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))

    draw = ImageDraw.Draw(rgb, 'RGBA')
    W, H = rgb.size

    # If no face, assume center region
    if len(faces) == 0:
        fx, fy, fw, fh = int(W*0.35), int(H*0.25), int(W*0.3), int(H*0.3)
    else:
        # Choose the largest face
        fx, fy, fw, fh = max(list(faces), key=lambda r: r[2] * r[3])

    # Glasses
    glasses_y = fy + int(fh * 0.35)
    glasses_h = max(6, int(fh * 0.08))
    glasses_pad = int(fw * 0.05)
    draw.rounded_rectangle(
        [(fx - glasses_pad, glasses_y), (fx + fw + glasses_pad, glasses_y + glasses_h)],
        radius=glasses_h//2,
        fill=(255, 255, 255, 140)
    )
    # Bridge
    bridge_x = fx + fw // 2 - 6
    draw.rectangle([(bridge_x, glasses_y), (bridge_x + 12, glasses_y + glasses_h)], fill=(220, 220, 220, 180))

    # Wired earphones (left/right buds + thin wire)
    ear_r = max(3, int(fh * 0.06))
    left_ear = (fx - int(ear_r*1.2), fy + int(fh*0.45))
    right_ear = (fx + fw + int(ear_r*1.2), fy + int(fh*0.45))
    for ex, ey in (left_ear, right_ear):
        draw.ellipse([(ex-ear_r, ey-ear_r), (ex+ear_r, ey+ear_r)], fill=(255,255,255,230))
        # wire downward
        draw.line([(ex, ey+ear_r), (ex+int((W/2-ex)*0.1), ey + ear_r + int(H*0.15))], fill=(240,240,240,220), width=2)

    # Tote strap (diagonal across left shoulder)
    shoulder_y = fy + fh + int(fh*0.2)
    draw.line([(fx + int(fw*0.15), shoulder_y - 10), (fx + int(fw*0.45), shoulder_y + int(H*0.18))], fill=(245,245,245,220), width=6)

    # Matcha cup (simple rounded rect with straw) near right lower area
    cup_w = max(30, int(fw*0.28))
    cup_h = int(cup_w*1.3)
    cx = min(W - cup_w - 10, fx + fw + int(fw*0.1))
    cy = min(H - cup_h - 10, fy + fh + int(fh*0.2))
    draw.rounded_rectangle([(cx, cy), (cx+cup_w, cy+cup_h)], radius=10, fill=(122, 201, 138, 220), outline=(200,255,210,240))
    # lid
    draw.rectangle([(cx-4, cy-8), (cx+cup_w+4, cy)], fill=(235, 235, 235, 230))
    # straw
    draw.rectangle([(cx+cup_w//2-3, cy-24), (cx+cup_w//2+3, cy)], fill=(40, 120, 40, 230))

    # Overalls bib & straps
    chest_top = fy + fh + int(fh*0.05)
    bib_w = int(fw*0.9)
    bib_h = int(fh*0.6)
    bib_x = fx + fw//2 - bib_w//2
    bib_y = chest_top
    draw.rounded_rectangle([(bib_x, bib_y), (bib_x+bib_w, bib_y+bib_h)], radius=12, fill=(30, 60, 110, 180))
    # straps
    draw.line([(bib_x+10, bib_y), (fx, fy+int(fh*0.5))], fill=(30,60,110,200), width=10)
    draw.line([(bib_x+bib_w-10, bib_y), (fx+fw, fy+int(fh*0.5))], fill=(30,60,110,200), width=10)

    return rgb


@app.route("/performative_convert", methods=["POST"])
def performative_convert():
    """Heuristic image-to-image conversion to add performative accessories."""
    try:
        payload = request.get_json(force=True, silent=False)
        data_url = payload.get("image") if isinstance(payload, dict) else None
        if not data_url:
            return jsonify({"ok": False, "error": "Missing image"}), 400

        base64_part = data_url.split(",", 1)[1] if "," in data_url else data_url
        binary = base64.b64decode(base64_part)
        pil_img = Image.open(io.BytesIO(binary)).convert("RGBA")

        out = _draw_performative_overlay(pil_img)

        buf = io.BytesIO()
        out.convert("RGB").save(buf, format="JPEG", quality=90)
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        return jsonify({"ok": True, "image": f"data:image/jpeg;base64,{b64}"})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# Load model immediately when module is imported
load_model()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


