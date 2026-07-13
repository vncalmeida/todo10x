const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQ_FAIL:', req.url(), req.failure().errorText));

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch(e) {}
  
  const root = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log('ROOT LENGTH:', root.length);
  
  await browser.close();
})();
