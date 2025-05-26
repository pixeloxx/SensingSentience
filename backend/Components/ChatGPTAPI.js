import fetch from 'node-fetch';
import 'dotenv/config';

/**
 * ChatGPTAPI class
 * Handles communication with OpenAI's API and function call routing.
 */
class ChatGPTAPI {
  constructor(config, functionHandler) {
    // Configuration and communication object
    this.config = config;
    this.functionHandler = functionHandler;
    // OpenAI API settings
    this.Url = config.chatGPTSettings.url;
    this.Model = config.chatGPTSettings.model;
    this.MaxTokens = config.chatGPTSettings.max_tokens;
    this.UserId = config.chatGPTSettings.user_id;
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
    console.log("send to llm:"+role+" "+sQuestion+" "+funtionName)
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
          functions: this.functionHandler.getAllFunctions(),
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
         
         // console.log(oJson.choices[0].message,);

          // Handle API errors
          if (oJson.error && oJson.error.message) {
            console.log("Error from OpenAI API:", oJson.error.message);
            throw new Error("Error: " + oJson.error.message);
          } else if (oJson.choices[0].finish_reason === "function_call") {
            // Handle function call
             console.log("function_call");
            // Add function call to conversation history
            let message = oJson.choices[0].message;
            console.log("function_call with function name:", message.function_call.name);
            // Await the function call handler and resolve with its result
            let result = await this.functionHandler.handleCall(
              message,
              returnObject
            );

            console.log("result from function call:", result);

            this.config.conversationProtocol.push({
              role: "function",
              name: message.function_call.name,
              content: message.function_call.arguments
            });
            // console.log(result);
            resolve(result);
          } else {
            console.log("normal response");
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



}



export default ChatGPTAPI;