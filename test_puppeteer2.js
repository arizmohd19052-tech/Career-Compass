const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
  const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd() });
  await new Promise(r => setTimeout(r, 6000));
  
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    const body = await page.evaluate(() => document.body.innerHTML);
    const fs = require('fs');
    fs.writeFileSync('page_body_true.html', body);
  } catch(e) { console.error(e); }
  
  server.kill();
  await browser.close();
  process.exit(0);
})();
