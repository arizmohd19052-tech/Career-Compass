const { GoogleGenAI } = require('@google/genai');
async function run() {
  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: "Hello",
      config: {
        systemInstruction: "You are a helpful assistant",
        responseMimeType: "application/json"
      }
    });
    console.log("SUCCESS:", response.text);
  } catch (err) {
    console.error("ERROR JSON:", err.message);
  }
}
run();
