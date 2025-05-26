import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import ChatGPTAPI from './Components/ChatGPTAPI.js';
// import config json file
import { config } from '../config.js';
import SerialCommunication from './Components/SerialCommunication.js';
import ICommunicationMethod from './Components/ICommunicationMethod.js';
import FunctionHandler from './Components/FunctionHandler.js';
//import BLECommunication from './Components/BLECommunication.js';
import SpeechToText from './Components/SpeechToText.js';
import TextToSpeech from './Components/TextToSpeech.js';

let communicationMethod = null;
let speechToText = null;



const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


// 1. setup speech to text
speechToText = new SpeechToText(callBackSpeechToText);

function callBackSpeechToText(msg) {
  let complete = false;
  if (msg.confirmedText) {
    console.log('stt:', msg.confirmedText);
    complete = true;
    msg.speech = msg.confirmedText
    // passe message to LLM API
    LLM_API.send(msg.confirmedText, "user").then((response) => {
      LLMresponseHandler(response);
    });
  } else if (msg.interimResult) {
    console.log('interim stt:', msg.interimResult);
    complete = false;
    msg.speech = msg.interimResult
  } else {
    msg.speech = "";
  }
  try {
    updateFrontend(msg.speech, complete, "");
  } catch (e) {
    console.error('Error speech to text response', msg, e);
  }
}


// 2. setup comunication method for arduino

function comCallback(message) {
  console.log("com callback");
  console.log(message);
  // pass message to LLM API
   LLM_API.send(message, "user").then((response) => {
     LLMresponseHandler(response);
  });
}

// test
// let serialTest = new SerialCommunication(comCallback);

if (config.communicationMethod == "BLE") {
  console.log
} else if (config.communicationMethod == "Serial") {
  communicationMethod = new SerialCommunication(comCallback);
} else {
  communicationMethod = new ICommunicationMethod(comCallback);
}

// 3. Start HTTP/WebSocket server
app.use(cors()); // Configure middleware for Express.js server.
app.use(express.json()); // Configure middleware for Express.js server.

server.listen(PORT, () => {
  console.log(`Server and WebSocket running on port ${PORT}`);
});

// handle commands for debuging ect.
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  if (ip !== '127.0.0.1' && ip !== '::1' && ip !== '::ffff:127.0.0.1') {
    ws.close();
    console.log(`Rejected connection from non-local address: ${ip}`);
    return;
  }
  console.log(`Accepted WebSocket connection from ${ip}`);

  ws.on('message', (message) => {
    try {
      // Try to parse as JSON, or treat as plain text
      let cmd;
      try {
        cmd = JSON.parse(message);
      } catch {
        cmd = { text: message.toString().trim() };
      }
      console.log('Received command via WebSocket:', cmd);

      // handle a "pause" command
      if (cmd.command === 'pause') {
        speechToText.pause();
        ws.send('Sent pause command to Python');
      } else if (cmd.command === 'resume') {
        speechToText.resume();
        ws.send('Sent resume command to Python');
      } else if (cmd.text) {
        LLM_API.send(cmd.text, "user").then((response) => {
          LLMresponseHandler(response);
        });
        ws.send('Sent message to LLM API');
      } else {
        // ws.send('Unknown command');
      }
    } catch (err) {
      ws.send('Error handling command: ' + err.message);
    }
  });
});


function broadcastUpdate(data) {
  //   const data = JSON.stringify({ variable: textIn, messageINComplete: complete,  messageOut: textOut });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function updateFrontend(newIn, newInComplete, newOut) {
  const dataObj = {};
  dataObj.backEnd = {};
  if (typeof newIn !== 'undefined') dataObj.backEnd.messageIn = newIn;
  if (typeof newInComplete !== 'undefined') dataObj.backEnd.messageInComplete = newInComplete;
  if (typeof newOut !== 'undefined') dataObj.backEnd.messageOut = newOut;
  const data = JSON.stringify(dataObj);
  console.log(data);
  broadcastUpdate(data);
}

function frontEndFunction(functionName, args) {
  const dataObj = {};
  dataObj.backEnd = {};
  if (typeof functionName !== 'undefined') dataObj.backEnd.functionName = functionName;
  if (typeof args !== 'undefined') dataObj.backEnd.args = args;
  const data = JSON.stringify(dataObj);
  broadcastUpdate(data);
}


// setup function handler

const functionHandler = new FunctionHandler(config, communicationMethod);


// 4. setup LLM API

let LLM_API = new ChatGPTAPI(config, functionHandler);

// test the LLM API
/*
LLM_API.send("Tell me the time", "user").then((response) => {
  LLMresponseHandler(response);
})
*/

function LLMresponseHandler(returnObject) {
  // TODO: protect against endless recursion
  // TODO: add error handling
  console.log(returnObject);
  if (returnObject.role == "assistant") {
    // convert the returnObject.message to string to avoid the class having access to the returnObject
    let message = returnObject.message.toString();
    try {
      updateFrontend("", "", message);
      textToSpeech.say(message, 0);
      // SpeechSynthesiser.say(message, voice);
    } catch (error) {
      console.log(error);
    }
  } else if (returnObject.role == "function") {
    // call the function with the arguments
    const functionName = returnObject.message;
    const args = returnObject.arguments;
    frontEndFunction(functionName, args);
  }
  if (returnObject.promise != null) {
    console.log("there is a promise")
    // there is another nested promise 
    returnObject.promise.then((returnObject) => {
      LLMresponseHandler(returnObject)
    })
  } else {
    endExchange()
  }
}

function endExchange() {
}

// 5. setup Text to Speech

let textToSpeech = new TextToSpeech(callBackTextToSpeech);

function callBackTextToSpeech(msg) {
  if (msg.tts == "started" || msg.tts == "resumed") {
    console.log("pausing speech to text");
    speechToText.pause();
  } else if (msg.tts == "stopped" || msg.tts == "paused") {
     speechToText.resume();
  } else {
    speechToText.resume();
  }
}


// functions 

