const fetch = require('node-fetch');
async function run() {
  try {
    const profile = {
      academic: { degree: 'Computer Science', year: 'Senior', coursework: [] },
      skills: ['Python'],
      interests: ['AI'],
      careerOptions: [],
      constraints: { time: '', location: '', budget: '', timeline: '' }
    };
    console.log("SENDING REQUEST...");
    const res = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, language: 'en', englishLevel: 'Fluent' })
    });
    console.log("STATUS:", res.status);
    const data = await res.text();
    console.log("DATA:", data.substring(0, 500));
  } catch (err) {
    console.error("ERROR:", err);
  }
}
run();
