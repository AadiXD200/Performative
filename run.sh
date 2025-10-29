#!/bin/zsh
set -euo pipefail

# Set your Gemini API key here or export GEMINI_API_KEY in your shell before running
# Get your API key from: https://makersuite.google.com/app/apikey
export GEMINI_API_KEY="${GEMINI_API_KEY:-AIzaSyDVxOFl3EZwBpWPxtwSvhfz8G_3A5U3Tf0}"

# Create/activate venv
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

# Install deps (no-op if already installed)
pip install -U pip >/dev/null 2>&1 || true
pip install -r requirements.txt

# Start the app
python app.py

