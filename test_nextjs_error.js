const { spawn } = require('child_process');
const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
let ready = false;
let port = 3000;

server.stdout.on('data', d => {
  const s = d.toString();
  console.log('STDOUT:', s);
  if (s.includes('3001')) port = 3001;
  if (s.includes('Ready in') || s.includes('compiled client and server successfully')) {
    if (!ready) {
      ready = true;
      const { exec } = require('child_process');
      exec(`curl -s -X POST http://localhost:${port}/api/analyze -H "Content-Type: application/json" -d '{"profile": {"academic": {"degree": "CS", "year": "Senior", "coursework": []}, "skills": ["Python"], "interests": ["AI"], "careerOptions": [], "constraints": {"time": "", "location": "", "budget": "", "timeline": ""}}, "language": "en", "englishLevel": "Fluent"}'`, (err, stdout, stderr) => {
        console.log("CURL RES:", stdout);
        setTimeout(() => {
          server.kill();
          process.exit(0);
        }, 2000);
      });
    }
  }
});
server.stderr.on('data', d => {
  console.log('STDERR:', d.toString());
});
