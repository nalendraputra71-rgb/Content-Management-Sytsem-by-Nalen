const fs = require('fs');
let code = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');

const replacement = "{planDetails?.name ? planDetails.name.replace(/\\s*\\(?(annual|monthly|tahunan|bulanan)\\)?/gi, '').replace(/\\s+plan/gi, '').trim()";
code = code.replace(/\{planDetails\?\.name\s*\?\s*planDetails\.name/g, replacement);

fs.writeFileSync('src/SettingsPanel.tsx', code);
console.log('Patched SettingsPanel.tsx');
