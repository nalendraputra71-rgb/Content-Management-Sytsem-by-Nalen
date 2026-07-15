const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /const\s+\{\s*createServer:\s*createViteServer\s*\}\s*=\s*await\s+import\("vite"\);/,
  'const vitePkg = "vite";\n      const { createServer: createViteServer } = await import(vitePkg /* @vite-ignore */);'
);
fs.writeFileSync('server.ts', code);
