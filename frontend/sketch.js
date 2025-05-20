let textIn = '';
let textOut = '';
let font;
function preload() {
    // Load the font
    font = loadFont('/assets/RobotoMono.otf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(100, 100, 100);
    textFont(font);
    // Fetch the message initially
   // fetchMessage();

    // Fetch the message every .05 seconds
    //setInterval(fetchMessage, 50);
    // use monotype font 
     // Connect to WebSocket server
     ws = new WebSocket('ws://localhost:3000');
     ws.onmessage = (event) => {
         try {
             const data = JSON.parse(event.data);
             textIn = data.messageIN;
             textOut = data.messageOut;
         } catch (e) {
             console.error('WebSocket parse error:', e);
         }
     };
}

function draw() {
    // Display the message on the canvas
    background(20, 20, 20); // Clear the canvas
    backgroundFill();
    fill(255);
    textSize(36);
    textAlign(CENTER, CENTER);
    fill(0, 255, 0);
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