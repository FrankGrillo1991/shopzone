const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function htmlToPdf(htmlPath, pdfPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const html = fs.readFileSync(htmlPath, 'utf8');
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();
  console.log(`PDF saved to ${pdfPath}`);
}

if (process.argv.length < 4) {
  console.error('Usage: node html-to-pdf.js <input.html> <output.pdf>');
  process.exit(1);
}

const inputHtml = process.argv[2];
const outputPdf = process.argv[3];

htmlToPdf(inputHtml, outputPdf).catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
