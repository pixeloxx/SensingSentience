#!/bin/bash

# filepath: /Users/lfranzke/Documents/ZHdK/15_PhD/06_Prototypes/11_SentientSenses/setup-and-run.sh

# Exit on error
set -e

echo "Updating system..."
sudo apt update && sudo apt upgrade -y

echo "Installing required software..."
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Chromium and node
  sudo apt update && sudo apt upgrade -y
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs chromium-browser git

# Navigate to the project directory
cd "$(dirname "$0")"

echo "Installing project dependencies..."
# Install dependencies for the entire workspace
npm install

echo "Setting up autostart for kiosk mode..."
# Add Chromium kiosk mode to autostart
AUTOSTART_FILE="/etc/xdg/lxsession/LXDE-pi/autostart"
if ! grep -q "chromium-browser" "$AUTOSTART_FILE"; then
    echo "@chromium-browser --kiosk --disable-infobars --disable-restore-session-state http://localhost:5173" | sudo tee -a "$AUTOSTART_FILE"
fi

echo "Setting up backend and frontend to start on boot..."
# setup ./run.sh to start on boot on raspberry pi
RUN_FILE="/etc/xdg/lxsession/LXDE-pi/run.sh"
if ! grep -q "run.sh" "$RUN_FILE"; then
    echo "@bash $(realpath ./run.sh)" | sudo tee -a "$RUN_FILE"
fi

echo "Making runPi.sh executable..."
chmod +x ./run.sh

echo "Starting the project..."
# Start the project
./run.sh &