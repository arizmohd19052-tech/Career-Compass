const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  console.log('Starting dev server...');
  const { spawn } = require('child_process');
  const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd(), stdio: 'ignore' });
  
  await new Promise(r => setTimeout(r, 5000)); // wait for server to start
  
  console.log('Navigating to http://localhost:3000...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    const content = await page.content();
    console.log('PAGE CONTENT LENGTH:', content.length);
  } catch(e) {
    console.log('Navigation failed', e);
  }
  
  server.kill();
  await browser.close();
  process.exit(0);
})();
