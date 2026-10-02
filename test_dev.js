const { spawn } = require('child_process');
const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
server.stdout.on('data', d => console.log('STDOUT:', d.toString()));
server.stderr.on('data', d => console.log('STDERR:', d.toString()));
setTimeout(() => {
  server.kill();
  process.exit(0);
}, 20000);
