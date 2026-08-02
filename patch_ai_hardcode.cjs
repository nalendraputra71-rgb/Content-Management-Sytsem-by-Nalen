const fs = require('fs');

function patchFile(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  let newCode = code.replace(/\{ prompt, model: "gemini-3\.5-flash" \}/g, `{ prompt, model: planDetails?.capabilities?.allowedModels?.[0] || "gemini-3.5-flash" }`);
  if (code !== newCode) {
    fs.writeFileSync(filename, newCode);
    console.log(`Patched ${filename}`);
  }
}

patchFile('src/AnalyticsView.tsx');
patchFile('src/ContentModal.tsx');
