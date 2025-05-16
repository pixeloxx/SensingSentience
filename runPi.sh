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

# Start a minimal X session and launch Chromium in kiosk mode
echo "Launching Chromium in kiosk mode using xinit..."
xinit /usr/bin/chromium-browser -- --kiosk --disable-infobars --disable-restore-session-state http://localhost:5173