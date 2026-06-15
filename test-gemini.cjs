const { GoogleGenAI } = require("@google/genai");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{role: "user", parts: [{text: "Hi"}]}],
      config: {}
    });
    console.log(response.text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
