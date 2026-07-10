const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /apiRoutes\.get\("\/meta\/auth", \(req, res\) => \{[\s\S]*?res\.redirect\(authUrl\);\n\}\);/;
const newAuth = `apiRoutes.get("/meta/auth", (req, res) => {
  const { workspaceId, platform } = req.query;
  if (!workspaceId) {
    return res.status(400).send("workspaceId is required");
  }

  let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || '';
  if (host.includes('.run.app') || host.includes('.com') || process.env.VERCEL) {
    protocol = 'https';
  }
  const redirectUri = \`\${protocol}://\${host}/api/meta/callback\`;
  const stateStr = \`\${workspaceId}|\${platform || 'meta'}\`;

  if (platform === "instagram") {
    if (!INSTAGRAM_APP_ID) {
      return res.status(500).send("INSTAGRAM_APP_ID is not configured on the server. Please add it in AI Studio Secrets.");
    }
    const scope = "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_messages";
    const authUrl = \`https://api.instagram.com/oauth/authorize?client_id=\${INSTAGRAM_APP_ID}&redirect_uri=\${encodeURIComponent(redirectUri)}&scope=\${scope}&response_type=code&state=\${encodeURIComponent(stateStr)}\`;
    return res.redirect(authUrl);
  } else {
    if (!META_APP_ID) {
      return res.status(500).send("META_APP_ID is not configured on the server.");
    }
    const scope = "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish";
    const authUrl = \`https://www.facebook.com/\${META_API_VERSION}/dialog/oauth?client_id=\${META_APP_ID}&redirect_uri=\${encodeURIComponent(redirectUri)}&state=\${encodeURIComponent(stateStr)}&scope=\${scope}\`;
    return res.redirect(authUrl);
  }
});`;

code = code.replace(regex, newAuth);

fs.writeFileSync('server.ts', code);
