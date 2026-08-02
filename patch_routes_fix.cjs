const fs = require('fs');
let content = fs.readFileSync('src/AppRoutes.tsx', 'utf8');
content = content.replace(') {\n  return <>{children}</>;\n}', '');
fs.writeFileSync('src/AppRoutes.tsx', content);
