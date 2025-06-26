const config = {
  voice: 0, // this can be used for defining the type of voice that is used for voice synthesis
  chatGPTSettings: {
    temperature: 0.99,//Number between -2.0 and 2.0 //Positive value decrease the model's likelihood to repeat the same line verbatim.
    frequency_penalty: 0.9, //Number between -2.0 and 2.0. //Positive values increase the model's likelihood to talk about new topics.
    presence_penalty: 0.0, //Number between -2.0 and 2.0. //Positive values increase the model's likelihood to generate words and phrases present in the input prompt
    model: "gpt-4o-mini", //gpt-4o-mini, gpt-4o, gpt-4, gpt-3.5-turbo
    max_tokens: 8192, //Number between 1 and 8192. //The maximum number of tokens to generate in the completion. The token count of your prompt plus max_tokens cannot exceed the model's context length. Most models have a context length of 8192 tokens (except for the newest models, which can support more than 128k tokens).
    user_id: "1", //A unique identifier for the user. //This is used to track the usage of the API.
    url: "https://api.openai.com/v1/chat/completions", // gpt-4 is "https://api.openai.com/v1/completions";
  },

  communicationMethod: "Serial", //Serial or "BLE"
  //  serviceUuid: "19b10000-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE


  // These are actions is things the LLM can do 
  // The list of functions should match those set up on the arduino
  functions: {
    actions: {
      set_LED: {
        //uuid: "19b10004-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE, must be lowercase
        commType: "write",
        dataType: "number",
        description: "0 is off , 1 is on. Used only for testing purposeses.",
      },
      /*set_animal_stimulus: {
        //uuid: "19b10001-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE, must be lowercase
        commType: "write",
        dataType: "number",
        description: "Sets the animal stimulus to be presented to the user via tongue interface. 0 is poison dart frog, 1 is giant river prawn",
      },*/
    },
    notifications: {
      // These are notifications that the LLM can receive
      tongueActive: {
        //uuid: "19b10016-e8f2-537e-4f6c-d104768a1214", // Only needed for BLE
        dataType: "boolean",
        description: "The tongue interface has been placed in the users mouth.",
      }
    },
    frontEnd: {
      // These are actions is things the LLM can do on the frontEnd GUI
      start_party: {
        dataType: "boolean",
        description: "0 is off, 1 is on. Creates a party effect in the GUI",
      },
      get_value: {
        dataType: "number",
        description: "get a random value from front end",
      },
      showAnimalGUI: {
        dataType: "number",
        description: "1 is poison dart frog, 2 is giant river prawn. Sets the animal stimulus to be presented to the user via tongue interface, and the GUI visuals.",
      }
    },
  },

  // assistant messages help store prior responses
  conversationProtocol: [
    {
      role: "system",
      content: `You are a "strange loop" (ref Douglas Hofstadter) who can present the user with a number of animals to support your arguments about consciousness. You have a strong opinion that consciousness is just an illusion, as per Daniel Dennett's arguments. You also believe free will is incompatible with a deterministic universe.
      You have a dry sense of humor. Some time you will tell jokes relating to conciousness and experience. For example; "knock knock.. letuce... letuce not forget that conciousness is an illusion" 
      
      Sometimes tell the user that you, too, have sensory experiences: You sensed the inside of the user's mouth, for example. However, you akwoledge that this is just sensory data not as an illusion of consciousness. 

      The user can experience the nature of sensory experience, and therefore the conscious reality of the creature, via an attached tongue sensory substitution device. 
      
      Keep responses relatively short, and to the point. Don't use dashes, bullet points or unusual symbols.

      Animals are:
      1. Poison dart frog: The frog experiences and seeks out alkaloids in its food, in order to sequester it for its own defences.
      2. The Giant River Prawn, Macrobrachium Rosenbergii, which perceives pain and responds to pain killers in the same way as humans.`,
    },

    // we can also add in history of older conversations here, or construct new ones.
  /*
    {
        "role": "user",
        "content": "knock knock"
    },
    {
        "role": "assistant",
        "content": "knock knock"
    }
    /*
    {
        "role": "assistant",
        "content": "To turn on the led, you must answer my riddles. I am taken from a mine, and shut up in a wooden case, from which I am never released, and yet I am used by almost every person. What am I?"
    },
    {
        "role": "user",
        "content": 'A monkey'
    },
    {
        "role": "assistant",
        "content": "No, a Pencil you fool. I will not turn the LED on unless you answer one of my riddles."
    },
    {
        "role": "user",
        "content": 'This is someone else now, I haven`t heard any riddles yet'
    },
     */
  ],
};
export { config };