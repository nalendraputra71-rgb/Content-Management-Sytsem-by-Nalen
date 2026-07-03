const fs = require('fs');
let code = fs.readFileSync('src/Nav.tsx', 'utf8');

code = code.replace(/Home,\s*, Flame }/g, 'Home, Flame }');

fs.writeFileSync('src/Nav.tsx', code);
