const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Add INSTAGRAM_APP env vars
code = code.replace(
  /const META_APP_SECRET = process\.env\.META_APP_SECRET \|\| "";\nconst META_API_VERSION = "v19\.0";/,
  `const META_APP_SECRET = process.env.META_APP_SECRET || "";
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || "";
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || "";
const META_API_VERSION = "v19.0";`
);

// 2. Replace /meta/auth
const oldAuth = `apiRoutes.get("/meta/auth", (req, res) => {
  const { workspaceId, platform } = req.query;
  if (!workspaceId) {
    return res.status(400).send("workspaceId is required");
  }
  
  if (!META_APP_ID) {
    return res.status(500).send("META_APP_ID is not configured on the server.");
  }

  // Determine redirect URI dynamically
  let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || '';
  if (host.includes('.run.app') || host.includes('.com') || process.env.VERCEL) {
    protocol = 'https';
  }
  const redirectUri = \`\${protocol}://\${host}/api/meta/callback\`;

  // Required permissions for publishing and engagement
  const scope = "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish";
  
  const stateStr = \`\${workspaceId}|\${platform || 'meta'}\`;

  // If platform is instagram, we could potentially use the Instagram Basic Display API for read-only,
  // but for publishing we MUST use Facebook Graph API. We'll add a 'config_id' for Facebook Login for Business if available,
  // but standard OAuth works too.
  const authUrl = \`https://www.facebook.com/\${META_API_VERSION}/dialog/oauth?client_id=\${META_APP_ID}&redirect_uri=\${encodeURIComponent(redirectUri)}&state=\${encodeURIComponent(stateStr)}&scope=\${scope}\`;
  
  res.redirect(authUrl);
});`;

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

code = code.replace(oldAuth, newAuth);

// 3. Update callback
code = code.replace(
  `  const redirectUri = \`\${protocol}://\${host}/api/meta/callback\`;

  try {
    // 1. Exchange code for short-lived access token
    const tokenUrl = \`https://graph.facebook.com/\${META_API_VERSION}/oauth/access_token?client_id=\${META_APP_ID}&redirect_uri=\${encodeURIComponent(redirectUri)}&client_secret=\${META_APP_SECRET}&code=\${code}\`;`,
  `  const redirectUri = \`\${protocol}://\${host}/api/meta/callback\`;

  try {
    if (platform === "instagram") {
      const tokenUrl = 'https://api.instagram.com/oauth/access_token';
      const body = new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      });
      
      const tokenRes = await fetch(tokenUrl, { method: 'POST', body });
      const tokenData = await tokenRes.json();
      
      if (tokenData.error_message || tokenData.error) throw new Error(tokenData.error_message || tokenData.error_type);
      
      const accessToken = tokenData.access_token;
      const userId = tokenData.user_id;

      let accountName = "Instagram Account";
      
      // Get user profile
      try {
        const profileUrl = \`https://graph.instagram.com/v19.0/\${userId}?fields=id,username&access_token=\${accessToken}\`;
        const profileRes = await fetch(profileUrl);
        const profileData = await profileRes.json();
        if (profileData.username) {
           accountName = \`@\${profileData.username}\`;
        }
      } catch (e) {
        console.error("Failed to fetch IG profile", e);
      }

      initFirebase();
      const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
      const docRef = db.collection("workspaces").doc(workspaceId as string).collection("connectedAccounts").doc("instagram");
          
      await docRef.set({
        platform: "instagram",
        accountId: userId.toString(),
        accountName,
        accessToken,
        pageAccessToken: accessToken,
        connectedAt: new Date().toISOString()
      });

      return res.send(\`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: 'instagram' }, '*');
                window.close();
              } else {
                window.location.href = '/#/social-studio?integration=success';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      \`);
    }

    // 1. Exchange code for short-lived access token
    const tokenUrl = \`https://graph.facebook.com/\${META_API_VERSION}/oauth/access_token?client_id=\${META_APP_ID}&redirect_uri=\${encodeURIComponent(redirectUri)}&client_secret=\${META_APP_SECRET}&code=\${code}\`;`
);

// 4. Update data routes for Instagram API
code = code.replace(
  /if \(platform === "instagram"\) \{\n\s*url = \`https:\/\/graph\.facebook\.com\/\$\{META_API_VERSION\}\/\$\{accountId\}\/media\?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count,permalink&access_token=\$\{accessToken\}\`;/g,
  `if (platform === "instagram") {
        url = \`https://graph.instagram.com/v19.0/\${accountId}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count,permalink&access_token=\${accessToken}\`;`
);

code = code.replace(
  /if \(platform === "instagram"\) \{\n\s*url = \`https:\/\/graph\.facebook\.com\/\$\{META_API_VERSION\}\/\$\{accountId\}\/insights\?metric=follower_count,impressions,reach&period=day&access_token=\$\{accessToken\}\`;/g,
  `if (platform === "instagram") {
        url = \`https://graph.instagram.com/v19.0/\${accountId}/insights?metric=follower_count,impressions,reach&period=day&access_token=\${accessToken}\`;`
);

code = code.replace(
  /if \(platform === "instagram"\) \{\n\s*\/\/ Need to fetch media first, then comments, but for simplicity let's just use conversations if possible or return empty\n\s*\/\/ Actually, Instagram graph API comments require media ID. It's complex to get all comments across all media.\n\s*\/\/ Let's just return an empty array for now or try fetching the latest media's comments.\n\s*url = \`https:\/\/graph\.facebook\.com\/\$\{META_API_VERSION\}\/\$\{accountId\}\/media\?fields=comments\{id,text,timestamp,from,username\}&access_token=\$\{accessToken\}&limit=5\`;/g,
  `if (platform === "instagram") {
        url = \`https://graph.instagram.com/v19.0/\${accountId}/media?fields=comments{id,text,timestamp,from,username}&access_token=\${accessToken}&limit=5\`;`
);


// 5. Update publishing route for Instagram API
code = code.replace(
  /const postUrl = \`https:\/\/graph\.facebook\.com\/\$\{META_API_VERSION\}\/\$\{accountId\}\/media\`;/g,
  `const postUrl = platform === "instagram" ? \`https://graph.instagram.com/v19.0/\${accountId}/media\` : \`https://graph.facebook.com/\${META_API_VERSION}/\${accountId}/media\`;`
);

code = code.replace(
  /const publishUrl = \`https:\/\/graph\.facebook\.com\/\$\{META_API_VERSION\}\/\$\{accountId\}\/media_publish\`;/g,
  `const publishUrl = platform === "instagram" ? \`https://graph.instagram.com/v19.0/\${accountId}/media_publish\` : \`https://graph.facebook.com/\${META_API_VERSION}/\${accountId}/media_publish\`;`
);

fs.writeFileSync('server.ts', code);
console.log('patched');
