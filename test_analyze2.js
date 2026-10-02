const { GoogleGenAI } = require('@google/genai');
async function run() {
  try {
    const ai = new GoogleGenAI({});
    const profile = {
      academic: { degree: 'Computer Science', year: 'Senior', coursework: ['Algorithms'] },
      skills: ['Python', 'JavaScript'],
      interests: ['AI', 'Web Dev'],
      careerOptions: [],
      constraints: { time: '', location: '', budget: '', timeline: '' }
    };
    const sysPrompt = `You are Career Compass, a structured career-advisory reasoning engine for students.
Rules you must always follow:
1. Base every recommendation ONLY on the profile data provided in the user message.
2. Always return between 2 and 4 career directions.
3. Never state or imply that any single option is "guaranteed," "best," or "the right choice" in absolute terms.
4. For each direction, provide:
   (a) a one-line description
   (b) a 2-3 sentence fit rationale referencing specific profile inputs
   (c) a feasibility assessment (Emerging Fit, Good Fit, or Strong Fit) with a percentage range and explanation.
   (d) a skill-gap list split into "already has" and "needs to build", each tagged priority high/medium/low.
   (e) for every skill needed, 1-3 learning resources with platform, type (free/paid), and approx_price (as an indicative estimate, e.g. "$50", "₹1,500–₹3,000", "Free").
   (f) a 5-stage sequential roadmap (e.g. Foundation, Core Skills, Applied Projects, Portfolio, Job-Ready) with 2-4 actions per stage.
5. Always include an explicit "assumptions_and_caveats" array listing what you assumed and what could change the recommendation.
6. Respond ONLY in strict JSON matching the required schema. No prose outside the JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: JSON.stringify(profile),
      config: {
        systemInstruction: sysPrompt,
        responseMimeType: "application/json",
      }
    });
    console.log("RAW TEXT:");
    console.log(response.text);
    
    // try to parse
    try {
      const data = JSON.parse(response.text || '{}');
      console.log("PARSE SUCCESS!");
    } catch(e) {
      console.error("JSON PARSE ERROR:", e);
    }
  } catch (err) {
    console.error("API ERROR:", err.message);
  }
}
run();
