const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const regex = /      if \(scrollContainerRef\?\.current\) \{[\s\S]*?function getPlatformIcon\(/m;

code = code.replace(regex, 'function getPlatformIcon(');

fs.writeFileSync('src/SocialStudioView.tsx', code, 'utf8');
