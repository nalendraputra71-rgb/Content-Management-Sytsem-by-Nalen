const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');
code = code.replace(/import { import { import { /g, 'import { ');
fs.writeFileSync('src/ContentModal.tsx', code);
