const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

code = code.replace(/>\s*><Copy size=\{16\}/g, '><Copy size={16}');
code = code.replace(/>\s*><RefreshCcw size=\{16\}/g, '><RefreshCcw size={16}');
code = code.replace(/>\s*><Archive size=\{16\}/g, '><Archive size={16}');
code = code.replace(/>\s*><Trash size=\{16\}/g, '><Trash size={16}');

fs.writeFileSync('src/ContentModal.tsx', code);
