const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  const redirectUri = \`\${protocol}://\${host}/api/meta/callback\`;
  const stateStr = \`\${workspaceId}|\${platform || 'meta'}\`;`;

const replacement = `  const redirectUri = \`\${protocol}://\${host}/api/meta/callback\`;
  const stateStr = \`\${workspaceId}|\${platform || 'meta'}\`;
  console.log('Initiating OAuth with Redirect URI:', redirectUri, 'for platform:', platform);`;

if(code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Patched");
} else {
  console.log("Target not found");
}
