const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace('function Dashboard({', 'export function Dashboard({');
fs.writeFileSync('src/App.tsx', content);
