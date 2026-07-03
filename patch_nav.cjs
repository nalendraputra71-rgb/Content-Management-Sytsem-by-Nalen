const fs = require('fs');

let code = fs.readFileSync('src/Nav.tsx', 'utf8');

// Ensure Flame is imported
if (!code.includes('Flame')) {
    code = code.replace("import {", "import { Flame,");
}

const logoRegex = /<img[\s\S]*?alt="Hubify"[\s\S]*?onError=\{[\s\S]*?\}\s*\/>/;
code = code.replace(logoRegex, '<Flame size={open ? 22 : 18} className="text-white" />');

// also remove the fallback div 'H'
const fallbackRegex = /<div[\s\S]*?display: "none"[\s\S]*?H\s*<\/div>/;
code = code.replace(fallbackRegex, '');

fs.writeFileSync('src/Nav.tsx', code);
