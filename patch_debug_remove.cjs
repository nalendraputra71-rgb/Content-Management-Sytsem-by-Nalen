const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const debugBox = /<div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">[\s\S]*?<\/div>\n\s*\{metaApiError && \(/;

code = code.replace(debugBox, '{metaApiError && (');

fs.writeFileSync('src/SocialStudioView.tsx', code);
