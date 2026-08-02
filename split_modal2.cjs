const fs = require('fs');
const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

// Find the start of ContentModal
const startIdx = code.indexOf('export function ContentModal');
let contentModalCode = code.substring(startIdx);

// Find the start of renderMobileView
const mobileIdx = contentModalCode.indexOf('const renderMobileView = () => {');
const logicCode = contentModalCode.substring(0, mobileIdx);

// Find all const declarations in logicCode that might be state/handlers
const regex = /^\s*const\s+(?:\[(.*?)\]|([a-zA-Z0-9_]+))\s*=/gm;
let match;
const exportedVars = [];
while ((match = regex.exec(logicCode)) !== null) {
  if (match[1]) {
    // Array destructuring: [d, setD]
    const vars = match[1].split(',').map(s => s.trim());
    exportedVars.push(...vars);
  } else if (match[2]) {
    // Simple var: handleClose
    exportedVars.push(match[2]);
  }
}
console.log("Variables to export from hook:", exportedVars.length);
// console.log(exports);

