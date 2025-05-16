#!/bin/bash
# filepath: /Users/lfranzke/Documents/ZHdK/15_PhD/06_Prototypes/11_SentientSenses/runPi.sh

echo "Setting up backend and frontend to start on boot..."
RC_LOCAL_FILE="/etc/rc.local"
if ! grep -q "npm start" "$RC_LOCAL_FILE"; then
    sudo sed -i "/^exit 0/i cd $(pwd) && npm start &" "$RC_LOCAL_FILE"
fi

echo "Creating kiosk launcher script..."
KIOSK_SCRIPT="/home/pi/start-kiosk.sh"
cat << 'EOF' | sudo tee $KIOSK_SCRIPT > /dev/null
#!/bin/bash
# Wait for the frontend server to be ready
until curl -s http://localhost:5173 > /dev/null; do
  sleep 2
done
chromium-browser --kiosk --disable-infobars --disable-restore-session-state http://localhost:5173
EOF
sudo chmod +x $KIOSK_SCRIPT

echo "Setting up autostart for kiosk mode..."
AUTOSTART_FILE="/etc/xdg/lxsession/LXDE-pi/autostart"
if ! grep -q "start-kiosk.sh" "$AUTOSTART_FILE"; then
    echo "@/home/pi/start-kiosk.sh" | sudo tee -a "$AUTOSTART_FILE"
fi

echo "Starting the project..."
npm start