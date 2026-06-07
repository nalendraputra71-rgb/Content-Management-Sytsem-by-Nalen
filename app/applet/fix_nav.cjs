const fs = require('fs');

let content = fs.readFileSync('src/Nav.tsx', 'utf8');

content = content.replace(/padding: open \? "20px 16px" : "20px 8px"/g, 'padding: open ? "20px 16px" : "20px 8px"');

content = content.replace(/padding: open \? "8px 12px" : "8px"/g, 'padding: open ? "8px 12px" : "10px 0",\n                              justifyContent: open ? "flex-start" : "center"');

fs.writeFileSync('src/Nav.tsx', content);
