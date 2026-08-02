const fs = require('fs');
let code = fs.readFileSync('src/PricingPage.tsx', 'utf8');
code = code.replace(/  const compareRows = \[\s+([\s\S]*?)\];\n/g, '');
fs.writeFileSync('src/PricingPage.tsx', code);
