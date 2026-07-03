const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    await page.goto('http://localhost:3000/#/pricing', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    const content = await page.content();
    console.log("HTML length:", content.length);
    console.log("HTML:", content.substring(0, 500));
    await browser.close();
  } catch (err) {
    console.error("SCRIPT ERROR:", err);
  }
})();
