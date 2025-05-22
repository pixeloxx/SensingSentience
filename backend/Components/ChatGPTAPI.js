import fetch from 'node-fetch';
import 'dotenv/config';

/**
 * ChatGPTAPI class
 * Handles communication with OpenAI's API and function call routing.
 */
class ChatGPTAPI {
  constructor(config, comObject) {
    // Configuration and communication object
    this.config = config;
    this.comObject = comObject;

    // OpenAI API settings
    this.Url = config.chatGPTSettings.url;
    this.Model = config.chatGPTSettings.model;
    this.MaxTokens = config.chatGPTSettings.max_tokens;
    this.UserId = config.chatGPTSettings.user_id;

    // Function lists
    this.ignoreSerial = false;
    this.frontEndFunctions = [];
    this.allFunctions = [
      // built-in communication functions
      {
        name: "checkConection",
        description: "check if the connection to external device is established",
        parameters: {
          type: "object",
          properties: {
            value: {
              type: "integer",
              description: "no paramaters are needed",
            },
          },
        },
      },
      {
        name: "connect",
        description: "connect to external device",
        parameters: {
          type: "object",
          properties: {
            value: {
              type: "boolean",
              description: "mandatory property, has no impact on return value",
            },
          },
        },
      },
    ];

    // Add functions from config
    this.formatAndAddFunctions(config.functions.actions, this.allFunctions);
    this.formatAndAddFunctions(config.functions.notifications, this.allFunctions);
    this.formatAndAddFunctions(config.functions.frontEnd, this.allFunctions);

    this.formatAndAddFunctions(config.functions.frontEnd, this.frontEndFunctions);

    // Debug: print function lists
    console.log("frontend functions:", this.frontEndFunctions);
    console.log("external functions:", this.allFunctions);
  }

  /**
   * Helper to add formatted functions to allFunctions
   */
  formatAndAddFunctions(oldList, newList) {
    for (const key in oldList) {
      let newFunction = this.formatFunctions(oldList, key);
      newList.push(newFunction);
    }
  }

  /**
   * Format a function definition for OpenAI API
   */
  formatFunctions(list, key) {
    let newFunction = {
      name: key,
      description: list[key]?.description || "",
      parameters: {
        type: "object",
        properties: {
          value: {
            type: list[key]?.dataType || "",
            description: list[key]?.description || "",
          },
        },
      },
    };
    return newFunction;
  }

  /**
   * Get the current model name
   */
  getModel() {
    return this.Model;
  }

  /**
   * Send a message to the OpenAI API and handle the response.
   * Optionally, handle function calls.
   */
  async send(sQuestion, role, funtionName) {
    return new Promise((resolve, reject) => {
      (async () => {
        // Prepare API request data
        let data = {
          model: this.Model,
          max_tokens: this.MaxTokens,
          user: this.UserId,
          temperature: this.config.chatGPTSettings.temperature,
          frequency_penalty: this.config.chatGPTSettings.frequency_penalty,
          presence_penalty: this.config.chatGPTSettings.presence_penalty,
          stop: ["#", ";"],
          functions: this.allFunctions,
          messages: this.config.conversationProtocol,
        };

        // Add message to conversation protocol
        if (funtionName) {
          this.config.conversationProtocol.push({
            role: role,
            name: funtionName,
            content: sQuestion,
          });
        } else {
          this.config.conversationProtocol.push({
            role: role,
            content: sQuestion,
          });
        }

        // Prepare return object
        let returnObject = {
          message: null,
          promise: null,
          role: "assistant",
        };

        if (!sQuestion) {
          console.log("message content is empty!");
          return resolve(returnObject);
        }
        console.log(`role: ${role} is sending message: ${sQuestion}`);

        try {
          // Send request to OpenAI API
          const response = await fetch(this.Url, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify(data),
          });

          const oJson = await response.json();
          console.log(oJson);

          // Handle API errors
          if (oJson.error && oJson.error.message) {
            throw new Error("Error: " + oJson.error.message);
          } else if (oJson.choices[0].finish_reason === "function_call") {
            // Handle function call

              console.log(oJson.choices[0].message.function_call);
              // Await the function call handler and resolve with its result
              let result = await this.handleFunctionCall(
                oJson.choices[0].message,
                this.comObject,
                returnObject
              );
              console.log(result);
              resolve(result);
            } else {
                      // Handle normal response
              let sMessage = "";
              if (oJson.choices[0].text) {
                sMessage = oJson.choices[0].text;
              } else if (oJson.choices[0].message) {
                //GPT-4
                sMessage = oJson.choices[0].message.content;
              }
      
              if (!sMessage) {
                console.log("no response from OpenAI");
                sMessage = "No response";
              }
              
              returnObject.message = sMessage;
              this.config.conversationProtocol.push({
                role: "assistant",
                content: sMessage,
              });
              resolve(returnObject);
          }
        } catch (e) {
          // Handle fetch or parsing errors
          returnObject.message = `Error fetching ${this.Url}: ${e.message}`;
          returnObject.role = "error";
          resolve(returnObject);
        }
      })();
    });
  }

  /**
   * Handle function calls from the OpenAI API response.
   * Returns a Promise that resolves to a returnObject.
   */
  async handleFunctionCall(message, sComObject, returnObject) {
    // Add function call to conversation history
    this.config.conversationProtocol.push({
      role: "function",
      name: message.function_call.name,
      content: message.function_call.arguments
    });

    const functionName = message.function_call.name;
    console.log("function_call with function name:", functionName);

    let functionArguments = {};
    try {
      functionArguments = JSON.parse(message.function_call.arguments);
    } catch (e) {
      returnObject.message = "Error: Invalid function arguments";
      returnObject.role = "error";
      return returnObject;
    }
    functionArguments.defaultValue = "nothing";
    console.log("arguments:", functionArguments);

    // Check if function exists in communication method or local functions
    const comMethod = sComObject.getMethod(functionName);
    let functionReturnPromise;
    // Handle communication method or local function
    if (comMethod || this.allFunctions.some(obj => obj.name === functionName)) {
      console.log(functionName, "exists in functionList");

      // Ignore serial connection if requested
      /*
      if (this.ignoreSerial && functionName === "connect") {
        console.log("Ignoring Serial connection attempt.");
        returnObject.message = "Serial connection ignored as requested.";
        returnObject.role = "function";
        return returnObject;
      }
*/
      // Call the appropriate method
      if (this.frontEndFunctions.some(obj => obj.name === functionName)) {
        console.log("front end function with name:", functionName);
        // frontend function
        returnObject.message = functionName;
        returnObject.role = "function";
        return returnObject;
      } else if (comMethod) {
        functionReturnPromise = comMethod.call(sComObject, functionArguments);
      } else {
        // Standard function
        const funcDef = allFunctionLists[functionName];
        functionArguments.uuid = funcDef.uuid;
        functionArguments.dataType = funcDef.dataType;
        functionArguments.name = functionName;

        console.log("arguments:", functionArguments);

        if (funcDef.commType === "readWrite" || funcDef.commType === "write") {
          const method = sComObject.getMethod("write");
          functionReturnPromise = method.call(sComObject, functionArguments);
        } else if (funcDef.commType === "writeRaw") {
          const method = sComObject.getMethod("writeRaw");
          const newArgument = String(functionArguments.value);
          functionReturnPromise = method.call(sComObject, newArgument);
        } else {
          // Read only
          const method = sComObject.getMethod("read");
          functionReturnPromise = method.call(sComObject, functionArguments);
        }
      }

      // Wait for the function to complete and handle the result
      try {
        const functionReturnObject = await functionReturnPromise;
        let formattedValue = JSON.stringify({
          [functionReturnObject.description]: functionReturnObject.value
        });
        console.log(functionReturnObject);
        console.log(formattedValue);
        console.log(functionName);

        // Send the result back to ChatGPT
        returnObject.promise = this.send(formattedValue, "function", functionName);

        if (functionReturnObject.description === "Error") {
          returnObject.message = "function_call with error: " + functionReturnObject.value;
          returnObject.role = "error";
        } else {
          returnObject.message = "function_call " + functionName;
          returnObject.role = "function";
        }
        return returnObject;
      } catch (err) {
        returnObject.message = "Error in function execution: " + err.message;
        returnObject.role = "error";
        return returnObject;
      }
    } else {
      // Function does not exist
      returnObject.message = "Error: function does not exist";
      returnObject.role = "error";
      return returnObject;
    }
  }

}



export default ChatGPTAPI;