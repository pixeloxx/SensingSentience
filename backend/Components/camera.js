import NodeWebcam from "node-webcam";
import ChatGPTAPI from "./ChatGPTAPI.js";
import fs from "fs";

export async function captureAndSendImage(config, functionHandler) {
  console.log("Capturing image from webcam...");
  const opts = {
    width: 640,
    height: 480,
    quality: 100,
    output: "png",
    callbackReturn: "base64", // <-- THIS IS REQUIRED!
  };
  const Webcam = NodeWebcam.create(opts);

  return new Promise((resolve, reject) => {
    Webcam.capture("test_image", async function (err, data) {
      if (err) {
        console.error("Webcam error:", err);
        return reject(err);
      }

          // Remove prefix if present
      let cleanBase64 = data;
      if (data.startsWith("data:image/png;base64,")) {
        cleanBase64 = data.replace(/^data:image\/png;base64,/, "");
      }

      // Save the image to disk for verification
      const imageBuffer = Buffer.from(cleanBase64, "base64");
      fs.writeFileSync("test_image.png", imageBuffer);
      console.log("Image saved as test_image.png");

      // Prepare base64 string for OpenAI API
      const base64Image = `data:image/png;base64,${cleanBase64}`;
      const chatgpt = new ChatGPTAPI(config, functionHandler);
      const result = await chatgpt.sendImage(base64Image, "user");
      console.log("Vision API result:", result);
      resolve(result);
    });
  });
}