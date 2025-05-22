
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
    fill(0);
    textSize(36);
    textAlign(CENTER, CENTER);
    if (newInComplete) {
        fill(0);
    } else {
        fill(150, 150, 150);
    }
    //
    text(textIn, width / 2, height / 2 - 50)
    fill(0);
    text(textOut.toUpperCase(), width / 2, height / 2 + 50)
}


function backgroundFill() {
    // diagonal limes at 45 degrees   
    background(255, 255, 0);
    for (let i = 0; i < width + height; i += 25) {
        stroke
        stroke(0, 255, 255);
        strokeWeight(8);
        line(i, 0, 0, i);
        noStroke();
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
            if (data.messageIn) {
                textIn = data.messageIn;
            }
            if (data.messageOut) {
                textOut = data.messageOut;
            }
            if (data.messageInComplete) {
                newInComplete = data.messageInComplete;
            }
            if (data.functionName) {
                console.log('Function call received:', data.functionName);
                // Call the function with the provided arguments
                const functionName = data.functionName;
                const args = data.arguments;
                const func = frontendFunctions[functionName];
                console.log('Looking up function:', functionName, frontendFunctions);
                if (typeof func === 'function') {
                    console.log(`Calling function ${functionName} with arguments:`, args);
                    // If args is an array, spread it; if it's an object, pass as is
                    if (Array.isArray(args)) {
                        func(...args);
                    } else {
                        func(args);
                    }
                } else {
                    console.error(`Function ${functionName} is not defined in frontendFunctions.js.`);
                }
            }
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