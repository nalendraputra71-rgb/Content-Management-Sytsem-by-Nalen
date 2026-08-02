const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');
content = content.replace(/from "\.\//g, 'from "../');
fs.writeFileSync('src/layouts/MainLayout.tsx', content);
