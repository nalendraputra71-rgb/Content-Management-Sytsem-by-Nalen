const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldAuth = `apiRoutes.get("/meta/auth", (req, res) => {
  const { workspaceId } = req.query;
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
  
  const authUrl = \`https://www.facebook.com/\${META_API_VERSION}/dialog/oauth?client_id=\${META_APP_ID}&redirect_uri=\${encodeURIComponent(redirectUri)}&state=\${workspaceId}&scope=\${scope}\`;
  
  res.redirect(authUrl);
});`;

const newAuth = `apiRoutes.get("/meta/auth", (req, res) => {
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
  const authUrl = \`https://www.facebook.com/\${META_API_VERSION}/dialog/oauth?client_id=\${META_APP_ID}&redirect_uri=\${encodeURIComponent(redirectUri)}&state=\${encodeURIComponent(stateStr)}&scope=\${scope}\`;
  
  res.redirect(authUrl);
});`;

code = code.replace(oldAuth, newAuth);

const oldCallbackStart = `  const workspaceId = state as string;`;
const newCallbackStart = `  const [workspaceId, platform] = (state as string).split('|');`;
code = code.replace(oldCallbackStart, newCallbackStart);

const oldPagesReq = `    // 2. Get user's pages (We just pick the first one for simplicity, or save them all)
    const pagesUrl = \`https://graph.facebook.com/\${META_API_VERSION}/me/accounts?access_token=\${accessToken}\`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();
    
    if (pagesData.error) throw new Error(pagesData.error.message);
    
    let accountId = "meta_account_id";
    let accountName = "Meta (Facebook/IG) Account";
    
    if (pagesData.data && pagesData.data.length > 0) {
      // Use the first page's access token for page operations
      const page = pagesData.data[0];
      accountId = page.id;
      accountName = page.name;
    }

    // 3. Save to Firestore
    initFirebase();
    const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
    const docRef = db.collection("workspaces").doc(workspaceId).collection("connectedAccounts").doc("meta");
    
    await docRef.set({
      workspaceId,
      platform: "meta",
      accountId,
      accountName,
      accessToken, // Storing short-lived token (Production apps should exchange for long-lived)
      status: "active",
      createdAt: FieldValue.serverTimestamp()
    });

    // 4. Send success message to parent window and close popup
    res.send(\`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: 'meta' }, '*');
              window.close();
            } else {
              window.location.href = '/#/social-studio?integration=success&platform=meta';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    \`);`;

const newPagesReq = `    // 2. Get user's pages and Instagram business accounts
    const pagesUrl = \`https://graph.facebook.com/\${META_API_VERSION}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=\${accessToken}\`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();
    
    if (pagesData.error) throw new Error(pagesData.error.message);
    
    let accountId = "meta_account_id";
    let accountName = "Meta (Facebook/IG) Account";
    let pageAccessToken = accessToken;
    
    if (pagesData.data && pagesData.data.length > 0) {
      const page = pagesData.data[0];
      
      if (platform === "instagram") {
        if (page.instagram_business_account) {
          accountId = page.instagram_business_account.id;
          pageAccessToken = page.access_token; // Use page token for IG
          // Try to fetch IG username
          const igUrl = \`https://graph.facebook.com/\${META_API_VERSION}/\${accountId}?fields=username&access_token=\${pageAccessToken}\`;
          try {
            const igRes = await fetch(igUrl);
            const igData = await igRes.json();
            if (!igData.error && igData.username) {
              accountName = \`@\${igData.username}\`;
            } else {
              accountName = \`\${page.name} (Instagram)\`;
            }
          } catch (e) {
            accountName = \`\${page.name} (Instagram)\`;
          }
        } else {
          throw new Error("No Instagram Business Account linked to this Facebook Page.");
        }
      } else {
        accountId = page.id;
        accountName = page.name;
        pageAccessToken = page.access_token; // Useful for posting to the page
      }
    }

    // 3. Save to Firestore
    initFirebase();
    const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
    const docRef = db.collection("workspaces").doc(workspaceId).collection("connectedAccounts").doc(platform || "meta");
    
    await docRef.set({
      workspaceId,
      platform: platform || "meta",
      accountId,
      accountName,
      accessToken: pageAccessToken,
      status: "active",
      createdAt: FieldValue.serverTimestamp()
    });

    // 4. Send success message to parent window and close popup
    res.send(\`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: '\${platform || 'meta'}' }, '*');
              window.close();
            } else {
              window.location.href = '/#/social-studio?integration=success&platform=\${platform || 'meta'}';
            }
          </script>
          <p>Successfully authenticated. This window should close automatically.</p>
        </body>
      </html>
    \`);`;

code = code.replace(oldPagesReq, newPagesReq);
fs.writeFileSync('server.ts', code);
