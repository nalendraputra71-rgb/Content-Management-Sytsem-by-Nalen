const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

code = code.replace(/>><Copy size=\{16\} \/><\/button><\/Tooltip>/g, '><Copy size={16} /></button></Tooltip>');
code = code.replace(/>><RefreshCcw size=\{16\} \/><\/button><\/Tooltip>/g, '><RefreshCcw size={16} /></button></Tooltip>');
code = code.replace(/>><Archive size=\{16\} \/><\/button><\/Tooltip>/g, '><Archive size={16} /></button></Tooltip>');
code = code.replace(/>><Trash size=\{16\} \/><\/button><\/Tooltip>/g, '><Trash size={16} /></button></Tooltip>');

fs.writeFileSync('src/ContentModal.tsx', code);
