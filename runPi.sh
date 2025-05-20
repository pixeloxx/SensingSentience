#!/bin/bash

# Activate Python virtual environment
source "$(dirname "$0")/python-scripts/venv/bin/activate"

# Kill any process using port 3000 or 5173
fuser -k 3000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null

# Start backend and frontend servers in the background on port :3000
echo "Starting backend and frontend servers..."
npm start &

# Wait for the frontend server to be ready
echo "Waiting for frontend server to be ready on http://localhost:5173 ..."
until curl -s http://localhost:5173 > /dev/null; do
  sleep 2
done

# Launch Chromium in kiosk mode on the attached display
echo "Launching Chromium in kiosk mode..."
DISPLAY=:0 chromium-browser --no-sandbox --kiosk --disable-infobars --disable-restore-session-state http://localhost:5173 &