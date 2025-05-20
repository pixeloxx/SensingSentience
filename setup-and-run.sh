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
# Add npm start to rc.local
RC_LOCAL_FILE="/etc/rc.local"
if ! grep -q "npm start" "$RC_LOCAL_FILE"; then
    sudo sed -i "/^exit 0/i cd $(pwd) && npm start &" "$RC_LOCAL_FILE"
fi

echo "Starting the project..."
# Start the project
npm start