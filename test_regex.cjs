const fs = require('fs');
let code = fs.readFileSync('src/Nav.tsx', 'utf8');
const logoRegex = /<img[\s\S]*?alt="Hubify"[\s\S]*?onError=\{[\s\S]*?\}\s*\/>/;
const match = code.match(logoRegex);
console.log(match ? "MATCHED " + match[0].length + " bytes" : "NO MATCH");
