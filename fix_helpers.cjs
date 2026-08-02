const fs = require('fs');
let code = fs.readFileSync('src/utils/contentModalHelpers.tsx', 'utf8');
code = code.replace(/import \{ import \{ import \{ /g, 'import { ');
fs.writeFileSync('src/utils/contentModalHelpers.tsx', code);
