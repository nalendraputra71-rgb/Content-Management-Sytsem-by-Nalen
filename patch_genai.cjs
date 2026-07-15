const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const patchedContent = content.replace(/require\(['"]fs\/promises['"]\)/g, "require('fs').promises");
    if (content !== patchedContent) {
      fs.writeFileSync(filePath, patchedContent, 'utf8');
      console.log(`Patched ${filePath}`);
    }
  }
}

const filesToPatch = [
  path.join(__dirname, 'node_modules/@google/genai/dist/node/index.cjs'),
  path.join(__dirname, 'node_modules/@tailwindcss/node/dist/index.js'),
  path.join(__dirname, 'node_modules/@tailwindcss/node/dist/require.js')
];

filesToPatch.forEach(patchFile);
