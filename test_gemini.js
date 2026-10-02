const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Hello",
    });
    console.log("SUCCESS:", response.text);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
run();
