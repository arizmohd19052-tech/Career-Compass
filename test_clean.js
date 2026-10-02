const { spawn } = require('child_process');
const http = require('http');

const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
let isReady = false;

server.stdout.on('data', (d) => {
  const output = d.toString();
  if (output.includes('Ready in') || output.includes('compiled client and server successfully')) {
    isReady = true;
  }
});

const checkServer = setInterval(() => {
  if (isReady) {
    http.get('http://localhost:3000', (res) => {
      console.log('STATUS:', res.statusCode);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('CONTENT MATCH:', data.includes('Career Compass'));
        clearInterval(checkServer);
        server.kill();
        process.exit(0);
      });
    }).on('error', (err) => {
      console.error('HTTP GET ERROR:', err.message);
    });
  }
}, 2000);

setTimeout(() => {
  console.log('TIMEOUT');
  server.kill();
  process.exit(1);
}, 30000);
