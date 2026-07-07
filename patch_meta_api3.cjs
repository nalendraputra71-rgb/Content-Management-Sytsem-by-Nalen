const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldAuth = `  const stateStr = \`\${workspaceId}|\${platform || 'meta'}\`;
  const authUrl = \`https://www.facebook.com/\${META_API_VERSION}/dialog/oauth?client_id=\${META_APP_ID}&redirect_uri=\${encodeURIComponent(redirectUri)}&state=\${encodeURIComponent(stateStr)}&scope=\${scope}\`;`;

const newAuth = `  const stateStr = \`\${workspaceId}|\${platform || 'meta'}\`;
  // If platform is instagram, we could potentially use the Instagram Basic Display API for read-only,
  // but for publishing we MUST use Facebook Graph API. We'll add a 'config_id' for Facebook Login for Business if available,
  // but standard OAuth works too.
  const authUrl = \`https://www.facebook.com/\${META_API_VERSION}/dialog/oauth?client_id=\${META_APP_ID}&redirect_uri=\${encodeURIComponent(redirectUri)}&state=\${encodeURIComponent(stateStr)}&scope=\${scope}\`;`;

code = code.replace(oldAuth, newAuth);
fs.writeFileSync('server.ts', code);
