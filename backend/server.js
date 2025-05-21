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


app.use(cors());
app.use(express.json());


// Example: broadcast to all clients
function broadcastUpdate(data) {
 //   const data = JSON.stringify({ variable: textIn, messageINComplete: complete,  messageOut: textOut });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Example: update messages and broadcast
function updateMessages(newIn, newInComplete, newOut) {
    // create object literal to store three variables 
    // and send to all clients
    const data = JSON.stringify({ messageIn: newIn, messageInComplete: newInComplete,  messageOut: newOut });
    broadcastUpdate(data);
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
const py = spawn('python3', ['script.py'], {
    cwd: path.join(__dirname, '../python') // Set working directory to 'python'
});
  
  // Listen for any message from Python
py.stdout.on('data', (data) => {
    data.toString().split('\n').filter(Boolean).forEach(line => {
        try {
            const msg = JSON.parse(line); // Attempt to parse JSON
            let complete = false;
            if (msg.confirmedText) {
                console.log('Python speech to text:', msg.confirmedText);
                complete = true;
                msg.speech = msg.confirmedText
            } else if (msg.interimResult) {
                console.log('Python speech to text:', msg.interimResult);
                complete = false;
                msg.speech = msg.interimResult
            } else {
                msg.speech = "";
            }

            if (msg.synth) {
                console.log('Python synth speech:', msg.synth);
            } else {
                msg.synth = "";
            }

            updateMessages(msg.speech, complete, msg.synth);
        } catch (e) {
            // Log and ignore non-JSON messages
            console.error('Failed to parse Python message (non-JSON):', line);
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
    console.error('Python:', data.toString());
  });
  py.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });