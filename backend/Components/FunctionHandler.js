import fetch from 'node-fetch';
import 'dotenv/config';

// TODO: unffinished stub

class FunctionHandler {
  constructor(config, comObject) {
  
    // Configuration and communication object
    this.config = config;
    this.comObject = comObject;

    // Function lists
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
  }
export default FunctionHandler;