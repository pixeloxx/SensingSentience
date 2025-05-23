#!/bin/bash
set -m

# Change to the directory where this script is located
cd "$(dirname "$0")"

# Activate Python virtual environment
source python/venv/bin/activate

# Function to clean up on exit
cleanup() {
  echo "Shutting down servers and cleaning up..."

  # Kill backend/frontend (npm) and python scripts
  if [[ -n "$NPM_PID" ]]; then
    kill "$NPM_PID" 2>/dev/null
    wait "$NPM_PID" 2>/dev/null
  fi
  if [[ -n "$PY_PID" ]]; then
    kill "$PY_PID" 2>/dev/null
    wait "$PY_PID" 2>/dev/null
  fi

  # Kill any process using port 3000 or 5173
  lsof -ti tcp:3000 | xargs kill -9 2>/dev/null
  lsof -ti tcp:5173 | xargs kill -9 2>/dev/null

  # Optionally kill Chromium if running in kiosk mode
  pkill -f chromium-browser 2>/dev/null
  pkill -f "Google Chrome" 2>/dev/null

  echo "Cleanup complete."
}

# Trap EXIT and INT (Ctrl+C)
trap cleanup EXIT INT

# Kill any process using port 3000 or 5173
echo "Killing processes on ports 3000 and 5173..."
lsof -ti tcp:3000 | xargs kill -9 2>/dev/null
lsof -ti tcp:5173 | xargs kill -9 2>/dev/null
sleep 2

if lsof -ti tcp:3000 >/dev/null || lsof -ti tcp:5173 >/dev/null; then
  echo "Ports 3000 or 5173 are still in use. Exiting..."
  exit 1
fi

# Start backend/frontend servers in the background
echo "Starting backend and frontend servers..."
npm start &
NPM_PID=$!

# Start your Python script(s) in the background (example)
python python/scriptTTS.py &
PY_PID=$!

# Wait for the frontend server to be ready
echo "Waiting for frontend server to be ready on http://localhost:5173 ..."
until curl -s http://localhost:5173 > /dev/null; do
  sleep 2
done

# Launch Chromium in kiosk mode on the attached display
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Launching default browser on macOS..." &
  open http://localhost:5173 &
else
  echo "Launching Chromium in kiosk mode..."
  DISPLAY=:0 chromium-browser --no-sandbox --kiosk --disable-infobars --disable-restore-session-state http://localhost:5173 &
fi

# Wait for background jobs (so trap works)
wait
echo "All processes exited. Goodbye!"