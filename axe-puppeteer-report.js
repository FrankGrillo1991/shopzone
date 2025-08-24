const puppeteer = require('puppeteer');
const AxePuppeteer = require('axe-puppeteer').default;
const fs = require('fs');

if (process.argv.length < 4) {
  console.error('Usage: node axe-puppeteer-report.js <url> <output.json>');
  process.exit(1);
}

const url = process.argv[2];
const output = process.argv[3];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const results = await new AxePuppeteer(page).analyze();

  fs.mkdirSync(require('path').dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(results, null, 2));
  console.log(`Accessibility report saved to ${output}`);

  await browser.close();
})();
