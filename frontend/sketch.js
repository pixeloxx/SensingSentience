let backendMessage = '';

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(100, 100, 100);

    // Fetch the message initially
    fetchMessage();

    // Fetch the message every 2 seconds
    setInterval(fetchMessage, 2000);
}

function draw() {
    // Display the message on the canvas
    background(100, 100, 100); // Clear the canvas
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(backendMessage, width / 2, height / 2);
}

function fetchMessage() {
    fetch('http://localhost:3000/api/random')
        .then(response => response.json())
        .then(data => {
            backendMessage = data.message;
        })
        .catch(err => console.error('Error fetching message:', err));
}