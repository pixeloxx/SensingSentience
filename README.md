# Sentient Senses 

An art project running application on a headless Raspberry Pi, utilizing a Node.js backend and a p5.js frontend. The application will serve as a kiosk interface, providing an interactive experience through a web browser.


## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd headless-raspberry-pi-project
   ```

2. **Backend Setup:**
   - Navigate to the `backend` directory:
     ```
     cd backend
     ```
   - Install the required dependencies:
     ```
     npm install
     ```
   - Start the Node.js server:
     ```
     node server.js
     ```

3. **Frontend Setup:**
   - Open `frontend/index.html` in a Chromium browser on your Raspberry Pi to access the web application.


## Usage Guidelines

- The web application will run in a kiosk mode, providing a full-screen experience.
- Interactions with the p5.js sketch will be handled through the frontend, while the backend will manage data and requests.
- Future enhancements may include additional Python scripts for backend processing.

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

### 3. **Install Dependencies**
- Update the system and install Node.js, npm, and Chromium etc:
  ```bash
  sudo apt install wtype
  sudo apt update && sudo apt upgrade -y
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs chromium-browser git
  openbox chromium-browser

# Now install Python packages inside the venv
pip install SpeechRecognition pyaudio git+https://github.com/openai/whisper.git

### 4. **Clone the Repository**
```bash
git clone https://github.com/pixeloxx/SentientSenses.git
cd SentientSenses
```   

### 5. **Install Project Dependencies**
```bash
npm install
```

# Create and activate a Python virtual environment and install packages
python3 -m venv python/venv
source python/venv/bin/activate
pip3 install pyaudio vosk sounddevice


### 6. **Start the Application**
- To start both backend and frontend together:
```bash
  npm start
```
- The backend will run on port 3000, and the frontend (Vite dev server) on port 5173.

### 7. **Set Up Kiosk Mode and autostart
```bash
chmod +x runPi.sh
./runPi.sh
```