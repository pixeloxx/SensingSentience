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

4. **Python Scripts:**
   - The Python scripts can be executed as needed. Ensure you have Python installed on your Raspberry Pi.

## Usage Guidelines

- The web application will run in a kiosk mode, providing a full-screen experience.
- Interactions with the p5.js sketch will be handled through the frontend, while the backend will manage data and requests.
- Future enhancements may include additional Python scripts for backend processing.

## Contributing

Feel free to contribute to this project by submitting issues or pull requests. Your feedback and suggestions are welcome!