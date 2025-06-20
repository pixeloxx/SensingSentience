window.user = '';
window.assistant = '';
window.userComplete = false;

// run connectToWebSocket on page load
window.addEventListener('load', () => {
    connectToWebSocket();
});

function updateSubtitle() {
    // upate div class user and assistant
    const userDiv = document.querySelector('.user');
    const assistantDiv = document.querySelector('.assistant');
    if (userDiv) {
        userDiv.innerHTML = window.user;
       console.log('window.userComplete:', window.userComplete);
        if (window.userComplete) {
            userDiv.classList.add('complete');
        } else {
            userDiv.classList.remove('complete');
        }
    }
    if (assistantDiv) {
        assistantDiv.innerHTML = window.assistant;
    }

}
function connectToWebSocket() {
    // if no connection, try again after 2 seconds
    ws = new WebSocket('ws://localhost:3000');
    // if the server is not runnning, attempt again
    ws.onmessage = (event) => {

        try {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.backEnd) {
                if (data.backEnd.messageIn) {
                    window.user = data.backEnd.messageIn;
                    updateSubtitle();
                }
                if (data.backEnd.messageOut) {
                    window.assistant = data.backEnd.messageOut;
                    updateSubtitle();
                }
                if (typeof data.backEnd.messageInComplete === "boolean") { 
                    console.log('messageInComplete:', data.backEnd.messageInComplete);
                    window.userComplete = data.backEnd.messageInComplete;
                    updateSubtitle();
                }
                if (data.backEnd.functionName) {
                    let returnValue = { frontEnd: { name: data.backEnd.functionName, value: undefined } };

                    console.log('Function call received:', data.functionName);
                    // Call the function with the provided arguments
                    const functionName = data.backEnd.functionName;
                    const args = data.backEnd.arguments;
                    const func = frontendFunctions[functionName];
                    console.log('Looking up function:', functionName, frontendFunctions);

                    if (typeof func === 'function') {
                        console.log(`Calling function ${functionName} with arguments:`, args);
                        // If args is an array, spread it; if it's an object, pass as is
                        if (Array.isArray(args)) {
                            try {
                                returnValue.frontEnd.value = func(...args);
                            } catch (error) {
                                returnValue.frontEnd.value = "Error: " + error.message;
                            }
                        } else {
                            try {
                                returnValue.frontEnd.value = func(args);
                            } catch (error) {
                                returnValue.frontEnd.value = "Error: " + error.message;
                            }
                        }
                    } else {
                        console.error(`Function ${functionName} is not defined in frontendFunctions.js.`);
                    }
                    console.log('Sending return value:', returnValue);
                    ws.send(JSON.stringify(returnValue));
                }
            }
        } catch (e) {
            console.error('WebSocket parse error:', e);
        }
        // send return value back to server
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