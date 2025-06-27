
let font;
let spacing = 40; // Spacing between arcs
function preload() {
    // Load the font
    font = loadFont('/assets/RobotoMono.otf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(100, 100, 100);
    textFont(font);
    //frontendFunctions["start_party"]();
    setupsimpleTruchetPatern();
    frontendFunctions["showLayout"](1);
        // Display the message on the canvas
    background(0, 0, 0);
    stroke(255);
    noFill();
 
}

function draw() {
    circle((width / 2), (height / 2), max(width, height) -8);
      // Create a mask.
  //  fill(0,0,100);
   // clip(mask);
  // Draw a backing shape.
 
   // rect(0, 0, width, height);
   //noLoop();
    // Display the message on the canvas
    /*
    background(0, 0, 0, 10);
    simpleTruchetPatern();
    push()
    stroke(255);
    noFill();
    //circle((width / 2), (height / 2), max(width, height) + 5);
    pop();
    // backgroundFill();
    fill(0);
    textSize(36);
    textAlign(CENTER, CENTER);
    */
}

let backgroundArray = [];

function setupsimpleTruchetPatern() {
    backgroundArray = [];
    for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
            backgroundArray.push(random(1) > 0.5 ? 1 : 0);
        }
    }
    console.log(backgroundArray)
}

function mask() {
    circle((width / 2), (height / 2), max(width, height) -8);
}

function simpleTruchetPatern() {
   
    push();
    noFill();
    stroke(100, 100, 100);
    strokeWeight(1);
    //
    backgroundArray[floor(random(backgroundArray.length))] = !backgroundArray[floor(random(backgroundArray.length))]; // Ensure at least one arc is drawn
    for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
            let index = floor((x / spacing) + (y / spacing) * (width / spacing));
            let angle = backgroundArray[index]
            if (angle) {
                arc(x + spacing, y, spacing, spacing, HALF_PI, PI);
                arc(x, y + spacing, spacing, spacing, -HALF_PI, 0);
            } else {
                arc(x + spacing, y + spacing, spacing, spacing, PI, -HALF_PI);
                arc(x, y, spacing, spacing, 0, HALF_PI);
            }
        }
    }
    pop();
}

function windowResized() {

    setupsimpleTruchetPatern();
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
        frontendFunctions["showLayout"](floor(random(3)));
}
