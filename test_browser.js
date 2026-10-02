const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
  const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
  await new Promise(r => setTimeout(r, 6000));
  
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    const body = await page.evaluate(() => document.body.innerHTML);
    console.log("HTML length:", body.length);
  } catch(e) { console.error(e); }
  
  server.kill();
  await browser.close();
  process.exit(0);
})();
