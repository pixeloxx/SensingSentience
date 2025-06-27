class FunctionHandler {
  constructor(config, comObject) {

    // Configuration and communication object
    this.config = config;
    this.comObject = comObject;

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
      // if commtype is define, add to objection
      commType: list[key]?.commType || "read",
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

  getAllFunctions() {
    return this.allFunctions;
  }
  /**
   * Attempt to call a function based on LLM response
   */
  /**
    * Handle function calls from the OpenAI API response.
    * Returns a Promise that resolves to a returnObject.
    */

  async handleCall(message, returnObject) {

    const functionName = message.function_call.name;
    console.log("function_call with function name:", functionName);

    let functionArguments = {};
    try {
      // get matching function from list
      functionArguments = JSON.parse(message.function_call.arguments);
    } catch (e) {
      returnObject.message = "Error: Invalid function arguments";
      returnObject.role = "error";
      return returnObject;
    }

    returnObject.arguments = functionArguments;
    //functionArguments.defaultValue = "nothing";
    console.log("arguments:", functionArguments);

    // Check if function exists in communication method or local functions
    const comMethod = this.comObject.getMethod(functionName);
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
        console.log("function call with basic comm method ");
        console.log("comMethod:", functionName);
        const method = this.comObject.getMethod(functionName);
        // this line is incorect
        functionReturnPromise = method.call(this.comObject);
      } else {
        // Standard function
         console.log("standard function call with name:", functionName);
        const funcDef = this.allFunctions.find(f => f.name === functionName);
        /// ignore uuid if not defined
        if (funcDef.uuid != undefined) {
            functionArguments.uuid = funcDef.uuid;
        }
        console.log("function definition:", funcDef);
        
        functionArguments.dataType = funcDef.parameters.type;
        functionArguments.name = functionName;
        console.log("arguments:", functionArguments);

        if (funcDef.commType === "readWrite" || funcDef.commType === "write") {
          const method = this.comObject.getMethod("write");
          console.log("calling write method with arguments:", functionArguments);
          functionReturnPromise = method.call(this.comObject, functionArguments);
        } else if (funcDef.commType === "writeRaw") {
          // Write raw data to output method
         console.log("calling write raw", functionArguments);
          const method = this.comObject.getMethod("writeRaw");
          const newArgument = String(functionArguments.value);
          functionReturnPromise = method.call(this.comObject, newArgument);
        } else {
          // Read only
          console.log("calling read", functionArguments);
          const method = this.comObject.getMethod("read");
          functionReturnPromise = method.call(this.comObject, functionArguments);
        }
      }
      // Wait for the function to complete and handle the result
      try {
    
        const functionReturnObject = await functionReturnPromise;
        console.log("functionReturnPromise:");  
        console.log(functionReturnPromise);
        let formattedValue = JSON.stringify({
          [functionReturnObject.description]: functionReturnObject.value
        });
        console.log(functionReturnObject);
        console.log(formattedValue);
        console.log(functionName);

        // TODO Send the result back to ChatGPT
       // returnObject.promise = this.send(formattedValue, "function", functionName);

        if (functionReturnObject.description === "Error") {
          returnObject.message = "function_call with error: " + functionReturnObject.value;
          returnObject.role = "error";
        } else {
          returnObject.message = "function_call complete: " + functionName;
          returnObject.role = "functionReturnValue";
          returnObject.value = formattedValue;
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
export default FunctionHandler;