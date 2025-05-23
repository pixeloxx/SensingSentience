
let font;

function preload() {
    // Load the font
    font = loadFont('/assets/RobotoMono.otf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(100, 100, 100);
    textFont(font);
    //frontendFunctions["start_party"]();
}

function draw() {
    // Display the message on the canvas
    background(255,0,0); // Clear the canvas
    push()
    stroke(255);
    noFill();
    circle((width / 2), (height / 2), max(width, height)+5);
    pop();
   // backgroundFill();
    fill(0);
    textSize(36);
    textAlign(CENTER, CENTER);
    /*
    if (window.userComplete) {
        fill(255,2);
    } else {
        fill(150, 150, 150);
    }
    //
    text(window.user, width / 2, height / 2 - 50)
    fill(255);
    text(window.assistant, width / 2, height / 2 + 50)
    */
}


function backgroundFill() {
    // diagonal limes at 45 degrees   
    background(255, 255, 0);
    for (let i = 0; i < width + height; i += 25) {
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

