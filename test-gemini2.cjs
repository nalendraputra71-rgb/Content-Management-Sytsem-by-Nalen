const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey });
async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      config: { tools: [{ googleSearch: {} }] }
    });
    console.log(response.text);
  } catch(e) {
    console.error("ERROR:");
    console.error(e.status);
    console.error(e.message);
  }
}
run();
