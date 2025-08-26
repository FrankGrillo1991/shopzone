const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node axe-json-to-html.js <input.json> <output.html>');
  process.exit(1);
}

const inputJson = process.argv[2];
const outputHtml = process.argv[3];

const data = JSON.parse(fs.readFileSync(inputJson, 'utf8'));

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(tag) {
    const charsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return charsToReplace[tag] || tag;
  });
}

let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>axe Accessibility Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2em; }
    h1 { color: #232F3E; }
    .violation { border: 1px solid #e74c3c; background: #fff0f0; margin-bottom: 1em; padding: 1em; border-radius: 8px; }
    .violation h2 { color: #e74c3c; margin-top: 0; }
    .impact { font-weight: bold; }
    .nodes { margin-top: 0.5em; }
    .node { margin-bottom: 0.5em; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>axe Accessibility Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <h2>Violations (${data.violations.length})</h2>
`;

data.violations.forEach((v, i) => {
  html += `<div class="violation">
    <h2>${i + 1}. ${escapeHtml(v.help)}</h2>
    <div class="impact">Impact: ${escapeHtml(v.impact || 'N/A')}</div>
    <div>Description: ${escapeHtml(v.description)}</div>
    <div>Help: <a href="${v.helpUrl}" target="_blank">${v.helpUrl}</a></div>
    <div class="nodes">
      <strong>Affected Nodes (${v.nodes.length}):</strong>
      <ul>`;
  v.nodes.forEach(node => {
    html += `<li class="node"><code>${escapeHtml(node.target.join(', '))}</code></li>`;
  });
  html += `</ul>
    </div>
  </div>`;
});

html += `</body>\n</html>`;

fs.writeFileSync(outputHtml, html);
console.log(`HTML report saved to ${outputHtml}`);
