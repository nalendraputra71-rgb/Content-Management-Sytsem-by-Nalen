const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');
code = code.replace(
  'const fakeToken = `${id.toUpperCase()}_MOCK_TOKEN_` + Date.now();',
  '// MOCK: only used for non-meta platforms\n    const fakeToken = `${id.toUpperCase()}_MOCK_TOKEN_` + Date.now();'
);
fs.writeFileSync('src/SocialStudioView.tsx', code);
