const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const WebSocket = require('ws')

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });



let backendMessage = 'testing ';
app.use(cors());
app.use(express.json());


// Example: broadcast to all clients
function broadcastUpdate() {
    const data = JSON.stringify({ messageIN: textIn, messageOut: textOut });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Example: update messages and broadcast
function updateMessages(newIn, newOut) {
    textIn = newIn;
    textOut = newOut;
    broadcastUpdate();
}


// Additional routes can be defined here

app.get('/api/random', (req, res) => {
    const randomNumber = Math.floor(Math.random() * 100); // Generate a random number
    res.json({ messageIN: `Random number: ${randomNumber}`, messageOut: ` test` });
});

// Example: update messages every 5 seconds for demo
/*
setInterval(() => {
    updateMessages(
        `Random IN: ${Math.floor(Math.random() * 100)}`,
        `Random OUT: ${Math.floor(Math.random() * 100)}`
    );
}, 5000);
*/
server.listen(PORT, () => {
    console.log(`Server and WebSocket running on port ${PORT}`);
});
// python start and communication 
// Start the Python process
const py = spawn('python3', [
    path.join(__dirname, '../python-scripts/script.py')
  ]);
  
  // Listen for any message from Python
  py.stdout.on('data', (data) => {
      data.toString().split('\n').filter(Boolean).forEach(line => {
          try {
              const msg = JSON.parse(line);
              if (msg.speech) {
                  console.log('Python textToSpeech:', msg.speech);
              } else {
                msg.speech = ""
              }
              if (msg.synth) {
                console.log('Python synth speech:', msg.synth);

              } else {
                msg.synth = ""
              }

              updateMessages(
                msg.speech,
                msg.syntheisis
             );

          } catch (e) {
              console.error('Failed to parse Python message:', e, line);
          }
      });
  });
  
  // Function to send a message and wait for a reply (optional, for call-response)
  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      const onData = (data) => {
        data.toString().split('\n').filter(Boolean).forEach(line => {
          try {
            const response = JSON.parse(line);
            if (response.reply) {
              py.stdout.off('data', onData);
              resolve(response);
            }
          } catch (e) {
            reject(e);
          }
        });
      };
      py.stdout.on('data', onData);
      py.stdin.write(JSON.stringify({ msg: message }) + '\n');
    });
  }
  
  // Optional: Handle Python errors and exit
  py.stderr.on('data', (data) => {
    console.error('Python error:', data.toString());
  });
  py.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });