#!/bin/bash
# filepath: /Users/lfranzke/Documents/ZHdK/15_PhD/06_Prototypes/11_SentientSenses/runPi.sh

# Start backend and frontend servers in the background
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