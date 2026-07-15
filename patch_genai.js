const fs = require('fs');
const file = 'node_modules/@google/genai/dist/tokenizer/node.mjs';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\s+(?:\*\s+as\s+)?fs\s+from\s+['"]fs\/promises['"];/g, 'import { promises as fs } from "fs";');
  fs.writeFileSync(file, content);
  console.log("Patched node.mjs");
}
