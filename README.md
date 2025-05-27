#  ChatGPT_arduinoV2 

This project makes it easy to connect physical devies to a large language model, for prototyping so called "Large Language Objects". The project is essentially a voice assistant optimised for running on a raspberry pi with an attached arduino. The code has been on Linux and Mac OS. 


---

## 🚀 Quick Start: Setting Up on a New Raspberry Pi

### 1. **Prepare the SD Card**
- Flash the latest Raspberry Pi OS (Desktop) to your SD card using [Raspberry Pi Imager](https://www.raspberrypi.com/software/).
- **Enable SSH in imager**  

### 2. **First Boot**
- Insert the SD card into the Raspberry Pi and power it on.
- Connect via SSH:  
  ```bash
  ssh <username>@<devicename>.local
  ```
  sudo raspi-config
  
In config select "Interfacing Options" > "Serial". 

"Would you like a login shell to be accessible over serial?" > NO
"Would you like the serial port hardware to be enabled?" > Yes



### 3. **Install Dependencies**
- Update the system and install Node.js, npm, and Chromium etc:
  ```bash

  sudo apt update && sudo apt upgrade -y
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs chromium-browser git

### 4. **Clone the Repository**
```bash
git clone https://github.com/pixeloxx/SentientSenses.git
cd SentientSenses
```   

### 5. **Install Project Dependencies**
```bash
npm install
```

### 6 Create and activate a Python virtual environment and install packages

python3 -m venv python/venv
source python/venv/bin/activate

pip3 install pyaudio vosk sounddevice numpy piper
pip3 install --no-deps -r requirements.txt
pip3 install onnxruntime


### 7. **Start the Application**

- Make sure python virtual environment is started:

```bash
  source python/venv/bin/activate
```
- To start both backend and frontend together:
```bash
  npm start
```
or for development:

```bash
  npm run dev
```

- The backend will run on port 3000, and the frontend (Vite dev server) on port 5173.

### 8. **Set Up Kiosk Mode and autostart**

```bash
chmod +x runPi.sh
./runPi.sh
```

###  Debuging with terminal 

- Install wscat for terminal websocket connections
```bash
  npm install -g wscat
```
- Open a websocket connection
```bash
  wscat -c ws://localhost:3000
```

- Type a command to pause speech detection, or send text directly to the LLM
```bash
{"command":"pause"}
{"command":"sendMessage","message":"Hello from the terminal!"}
```

###  AutoStart

Add the .desktop file to home/pi/.config/autostart/


