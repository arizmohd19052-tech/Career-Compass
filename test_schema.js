const { GoogleGenAI, Type } = require('@google/genai');

async function run() {
  try {
    const ai = new GoogleGenAI({});
    const profile = { academic: { degree: 'CS', year: 'Senior', coursework: [] }, skills: ['Python'], interests: ['AI'], careerOptions: [], constraints: { time: '', location: '', budget: '', timeline: '' } };
    
    console.log("Sending request...");
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: JSON.stringify(profile),
      config: {
        systemInstruction: "You are a helpful assistant.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            directions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  fit_rationale: { type: Type.STRING },
                  feasibility: {
                    type: Type.OBJECT,
                    properties: {
                      band: { type: Type.STRING },
                      approx_range: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                  },
                  skills_have: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: { skill: { type: Type.STRING } },
                    }
                  },
                  skills_needed: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        skill: { type: Type.STRING },
                        priority: { type: Type.STRING },
                        learning_resources: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              platform: { type: Type.STRING },
                              type: { type: Type.STRING },
                              approx_price: { type: Type.STRING }
                            },
                          }
                        }
                      },
                    }
                  },
                  roadmap: {
                    type: Type.OBJECT,
                    properties: {
                      stages: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            stage: { type: Type.STRING },
                            timeframe: { type: Type.STRING },
                            actions: { type: Type.ARRAY, items: { type: Type.STRING } }
                          },
                        }
                      }
                    },
                  }
                },
              }
            },
            assumptions_and_caveats: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
        }
      }
    });
    console.log("SUCCESS");
  } catch (err) {
    console.error("SCHEMA ERROR:", err);
  }
}
run();
