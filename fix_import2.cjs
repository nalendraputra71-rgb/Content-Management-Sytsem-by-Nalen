const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');
code = code.replace(/import \{ import \{ import \{ /g, 'import { ');
// Also clean up any loose "import {" on their own lines
code = code.replace(/^import \{\s*$/gm, '');
fs.writeFileSync('src/ContentModal.tsx', code);
