const fs = require('fs');

let content = fs.readFileSync('./src/Nav.tsx', 'utf8');

content = content.replace(/gap: 12,/g, 'gap: open ? 12 : 0,');

fs.writeFileSync('./src/Nav.tsx', content);
