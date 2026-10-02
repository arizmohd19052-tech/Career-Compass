const { spawn } = require('child_process');
const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
let ready = false;

server.stdout.on('data', d => {
  const s = d.toString();
  console.log('SERVER STDOUT:', s);
  if (s.includes('Ready in') || s.includes('compiled client and server successfully')) {
    ready = true;
  }
});
server.stderr.on('data', d => console.log('SERVER STDERR:', d.toString()));

const check = setInterval(() => {
  if (ready) {
    clearInterval(check);
    const fetch = require('node-fetch');
    const profile = {
      academic: { degree: 'CS', year: 'Senior', coursework: [] },
      skills: ['JS'],
      interests: [],
      careerOptions: [],
      constraints: { time: '', location: '', budget: '', timeline: '' }
    };
    fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, language: 'en', englishLevel: 'Fluent' })
    })
    .then(r => r.json().then(j => console.log("RES:", r.status, j)))
    .catch(e => console.error("FETCH ERR:", e))
    .finally(() => { server.kill(); process.exit(0); });
  }
}, 1000);
