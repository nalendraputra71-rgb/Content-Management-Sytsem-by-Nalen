const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.cjs') || full.endsWith('.mjs') || full.endsWith('.js')) {
      let content = fs.readFileSync(full, 'utf8');
      let changed = false;
      
      // Patch require('fs/promises')
      if (content.includes("require('fs/promises')")) {
        content = content.replace(/require\('fs\/promises'\)/g, "require('fs').promises");
        changed = true;
      }
      if (content.includes('require("fs/promises")')) {
        content = content.replace(/require\("fs\/promises"\)/g, 'require("fs").promises');
        changed = true;
      }
      
      // Patch import from 'fs/promises'
      if (content.match(/import\s+(?:\*\s+as\s+)?([a-zA-Z0-9_$]+)\s+from\s+['"]fs\/promises['"]/)) {
        content = content.replace(/import\s+(?:\*\s+as\s+)?([a-zA-Z0-9_$]+)\s+from\s+['"]fs\/promises['"]/g, 'import { promises as $1 } from "fs"');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(full, content);
        console.log("Patched", full);
      }
    }
  }
}

if (fs.existsSync('node_modules/@google/genai/dist')) {
  walk('node_modules/@google/genai/dist');
}
if (fs.existsSync('node_modules/@tailwindcss')) {
  walk('node_modules/@tailwindcss');
}
