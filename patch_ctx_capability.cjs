const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

code = code.replace(/const ctx = \{/, `const ctx = {\nhasCapability,`);
fs.writeFileSync('src/ContentModal.tsx', code);
