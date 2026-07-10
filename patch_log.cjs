const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `  const redirectUri = \`\${protocol}://\${host}/api/meta/callback\`;

  try {
    if (platform === "instagram") {`,
  `  const redirectUri = \`\${protocol}://\${host}/api/meta/callback\`;
  console.log('Callback Redirect URI:', redirectUri, 'code:', code);

  try {
    if (platform === "instagram") {`
);

fs.writeFileSync('server.ts', code);
