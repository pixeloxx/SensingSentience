#!/bin/bash
set -m

# Set log file location
LOG_FILE="$(dirname "$0")/logs/kiosk.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Function for logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Redirect all stdout and stderr to log file while still showing on console
exec > >(tee -a "$LOG_FILE") 2>&1

log "Starting Sentient Senses application"

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
    sleep 2
    # Try again in case something respawned
    lsof -ti tcp:3000 | xargs kill -9 2>/dev/null
    lsof -ti tcp:5173 | xargs kill -9 2>/dev/null
    sleep 1

  # Optionally kill Chromium if running in kiosk mode
  pkill -f chromium-browser 2>/dev/null
  pkill -f "Google Chrome" 2>/dev/null

  if [[ -n "$CHROMIUM_PID" ]]; then
    kill "$CHROMIUM_PID" 2>/dev/null
    wait "$CHROMIUM_PID" 2>/dev/null
  fi
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
  sleep 10
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Launching default browser on macOS..." &
  open http://localhost:5173 &
else

  echo "Launching Chromium in kiosk mode..."
  # Wait for X to be available
  while ! pgrep -x "Xorg" > /dev/null; do
    sleep 2
  done
  sleep 5  # Extra wait for desktop to finish loading

export DISPLAY=:0
export XAUTHORITY=$(find /home/*/.Xauthority | head -1)
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$(id -u)/bus"

 DISPLAY=:0 chromium-browser --no-sandbox --kiosk --disable-infobars --disable-restore-session-state http://localhost:5173 &
CHROMIUM_PID=$!
fi

# Wait for background jobs (so trap works)
wait
echo "All processes exited. Goodbye!"