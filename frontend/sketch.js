let textIn = '';
let textOut = '';
let newInComplete = false;
let font;
function preload() {
    // Load the font
    font = loadFont('/assets/RobotoMono.otf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(100, 100, 100);
    textFont(font);
    connectToWebSocket()
}


function draw() {
    // Display the message on the canvas
    background(20, 20, 20); // Clear the canvas
    backgroundFill();
    fill(255);
    textSize(36);
    textAlign(CENTER, CENTER);
    if (newInComplete) {
          fill(0, 255, 0);
    } else {
          fill(150, 150, 150);
    }
    text(textIn, width / 2, height / 2 - 50)
    fill(255, 0, 255);
    text(textOut, width / 2, height / 2 + 50);
}


function backgroundFill() {
 // diagonal limes at 45 degrees   
 
    for (let i = 0; i < width+height; i += 15) {
        stroke(40, 40, 40);
        strokeWeight(4);
        line(i, 0, 0, i);
        //line(0, i, width, height - i);
    }

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function connectToWebSocket() { 
    // if no connection, try again after 2 seconds
     ws = new WebSocket('ws://localhost:3000');
          // if the server is not runnning, attempt again
     ws.onmessage = (event) => {
         try {
             const data = JSON.parse(event.data);
             textIn = data.messageIn;
             textOut = data.messageOut;
             newInComplete = data.messageInComplete;
         } catch (e) {
             console.error('WebSocket parse error:', e);
         }
     };
        // Handle connection close and retry
    ws.onclose = () => {
        console.warn("WebSocket connection closed. Retrying in 3 seconds...");
        setTimeout(connectToWebSocket, 3000); // Retry connection after 3 seconds
    };

    // Handle connection errors
    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close(); // Close the connection to trigger retry
    };
};