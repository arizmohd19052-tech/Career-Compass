const { GoogleGenAI } = require('@google/genai');
async function run() {
  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: "Hello",
    });
    console.log("SUCCESS:", response.text);
  } catch (err) {
    console.error("ERROR 1.5:", err.message);
  }
}
run();
