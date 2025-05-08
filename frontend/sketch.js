function setup() {
    createCanvas(windowWidth, windowHeight);
    background(200);
}

function draw() {
    // Example of drawing a simple shape
    fill(255, 0, 0);
    ellipse(mouseX, mouseY, 50, 50);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}