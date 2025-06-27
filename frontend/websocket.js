window.user = '';
window.assistant = '';
window.error = '';
window.system = '';
window.userComplete = false;

// run connectToWebSocket on page load
window.addEventListener('load', () => {
    connectToWebSocket();
});

function updateDialogContent(querySelectorID, text, complete) {
    // upate div class user and assistant
    const div = document.querySelector(querySelectorID);

    div.innerHTML = text;
    if (complete) {
        div.classList.add('complete');
    } else {
        div.classList.remove('complete');
    }

    clearTimeout(parseInt(div.dataset.fadeTimeout));
    div.classList.remove('fade-out');

    // Set new timeout for fade-out
    const timeoutId = setTimeout(() => {
        div.classList.add('fade-out');
    }, 5000);

    div.dataset.fadeTimeout = timeoutId;

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
                if (data.backEnd.messageType == "assistant") {
                    window.assistant = data.backEnd.message;
                    updateDialogContent(".assistant", window.assistant);
                }

                if (data.backEnd.messageType == "system") {
                    window.assistant = data.backEnd.message;
                    updateDialogContent(".system", window.system);
                }
                if (data.backEnd.messageType == "error") {
                    window.assistant = data.backEnd.message;
                    updateDialogContent(".error", window.error);
                }

                if (data.backEnd.messageType == "user") {
                    window.user = data.backEnd.message;
                    if (typeof data.backEnd.complete === "boolean") {
                        console.log('messageInComplete:', data.backEnd.complete);
                        window.userComplete = data.backEnd.complete;
                    }
                    updateDialogContent(".user", window.user, window.userComplete);
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
        console.warn("WebSocket connection closed. Retrying in .5 second...");
        setTimeout(connectToWebSocket, 500);
    };

    // Handle connection errors
    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close(); // Close the connection to trigger retry
    };



};