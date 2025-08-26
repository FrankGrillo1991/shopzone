const fs = require('fs');
const puppeteer = require('puppeteer');

if (process.argv.length < 4) {
  console.error('Usage: node html-to-pdf.js <input.html> <output.pdf>');
  process.exit(1);
}

const inputHtml = process.argv[2];
const outputPdf = process.argv[3];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://' + require('path').resolve(inputHtml), { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputPdf, format: 'A4', printBackground: true });
  await browser.close();
  console.log(`PDF saved to ${outputPdf}`);
})();
