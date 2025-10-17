const fs = require('fs');
const puppeteer = require('puppeteer');
(async () => {
  try {
    const outDir = '.output';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    const url = 'https://grock0706.github.io/cd-kindred-echo-latest/';
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  // wait a bit for any client-side rendering
  await new Promise((res) => setTimeout(res, 800));
    const outPath = `${outDir}/site-screenshot.png`;
    await page.screenshot({ path: outPath, fullPage: false });
    console.log('Saved screenshot to', outPath);
    await browser.close();
  } catch (err) {
    console.error('Screenshot failed:', err);
    process.exit(2);
  }
})();
