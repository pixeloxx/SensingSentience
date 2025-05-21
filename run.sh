#!/bin/bash

# Activate Python virtual environment
source "$(dirname "$0")/python/venv/bin/activate"

# Kill any process using port 3000 or 5173
echo "Killing processes on ports 3000 and 5173..."
lsof -ti tcp:3000 | xargs kill -9 2>/dev/null
lsof -ti tcp:5173 | xargs kill -9 2>/dev/null
# small delay to allow the kill command to take effect
sleep 2

if lsof -ti tcp:3000 >/dev/null || lsof -ti tcp:5173 >/dev/null; then
  echo "Ports 3000 or 5173 are still in use. Exiting..."
  exit 1
fi

# Start backend and frontend servers in the background on port :3000
echo "Starting backend and frontend servers..."
npm start &

# Wait for the frontend server to be ready
echo "Waiting for frontend server to be ready on http://localhost:5173 ..."
until curl -s http://localhost:5173 > /dev/null; do
  sleep 2
done

# Launch Chromium in kiosk mode on the attached display

# Open the default browser on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Launching default browser on macOS..." &
  open http://localhost:5173 &
else
  # Launch Chromium on Linux (e.g., Raspberry Pi)
  echo "Launching Chromium in kiosk mode..."
  DISPLAY=:0 chromium-browser --no-sandbox --kiosk --disable-infobars --disable-restore-session-state http://localhost:5173 &
fi