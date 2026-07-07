const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/}\s*}\s*else if \(type === 'comments'\)/g, "} else if (type === 'comments')");
fs.writeFileSync('server.ts', code);
