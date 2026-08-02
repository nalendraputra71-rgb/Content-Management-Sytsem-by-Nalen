const fs = require('fs');
const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const mobileIdx = code.indexOf('const renderMobileView = () => {');
const desktopIdx = code.indexOf('  if (isMobile) {');

const logicCode = code.substring(0, mobileIdx);

const regex = /^\s*const\s+(?:\[(.*?)\]|([a-zA-Z0-9_]+))\s*=/gm;
let match;
const exportedVars = [];
while ((match = regex.exec(logicCode)) !== null) {
  if (match[1]) {
    const vars = match[1].split(',').map(s => s.trim());
    exportedVars.push(...vars);
  } else if (match[2]) {
    exportedVars.push(match[2]);
  }
}

// Remove duplicates and React imports
const uniqueVars = [...new Set(exportedVars)].filter(v => v !== "React" && v !== "" && !v.includes(" "));

console.log(uniqueVars.join(",\n"));

