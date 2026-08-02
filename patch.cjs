const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');
code = code.replace(/\{id: d\.id, \.\.\.d\.data\(\)\}/g, "{id: d.id, ...(d.data() as any)}");
fs.writeFileSync('src/AdminPanel.tsx', code);
