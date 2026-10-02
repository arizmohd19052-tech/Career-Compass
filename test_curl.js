const { spawn } = require('child_process');
const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
setTimeout(() => {
  const { execSync } = require('child_process');
  try {
    const html = execSync('curl -s http://localhost:3000').toString();
    console.log("HTML:", html.substring(html.indexOf('<main'), html.indexOf('</main>') + 7));
  } catch(e) { console.log("CURL failed"); }
  server.kill();
  process.exit(0);
}, 6000);
