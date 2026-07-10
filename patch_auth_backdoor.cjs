const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /apiRoutes\.get\("\/meta\/auth", \(req, res\) => \{/;
const replacement = `apiRoutes.get("/meta/auth", async (req, res) => {
  const { workspaceId, platform } = req.query;
  if (!workspaceId) {
    return res.status(400).send("workspaceId is required");
  }

  // --- MANUAL TOKEN BACKDOOR VIA SECRETS ---
  // If user configured INSTAGRAM_MANUAL_TOKEN or META_MANUAL_TOKEN in their environment secrets,
  // we bypass the OAuth popup and just save the token directly to their workspace.
  const envToken = platform === 'instagram' ? process.env.INSTAGRAM_MANUAL_TOKEN : process.env.META_MANUAL_TOKEN;
  
  if (envToken) {
    try {
      initFirebase();
      const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
      const docRef = db.collection("workspaces").doc(workspaceId as string).collection("connectedAccounts").doc(platform as string);
      
      // We can try to fetch the profile info if it's a valid token, but for now we'll just use a generic name
      // or we can attempt a fetch to get the real account ID and username!
      let accountId = "manual_account_id";
      let accountName = platform === "instagram" ? "Manual IG Account" : "Manual FB Account";
      
      try {
         // Attempt to fetch profile info
         const profileUrl = platform === 'instagram' 
            ? \`https://graph.instagram.com/v19.0/me?fields=id,username&access_token=\${envToken}\`
            : \`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=\${envToken}\`;
         const profileRes = await fetch(profileUrl);
         if (profileRes.ok) {
            const profileData = await profileRes.json();
            accountId = profileData.id || accountId;
            accountName = profileData.username || profileData.name || accountName;
         }
      } catch (e) {
         console.warn("Could not fetch profile info for manual token, using fallback names.");
      }

      await docRef.set({
        workspaceId,
        platform: platform as string,
        accountId,
        accountName,
        accessToken: envToken,
        status: "active",
        createdAt: FieldValue.serverTimestamp()
      });
      
      return res.send(\`
        <html><body>
        <p>Successfully connected using manual backend secret!</p>
        <script>
          if (window.opener) {
             window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: '\${platform}' }, '*');
             window.close();
          } else {
             window.location.href = '/';
          }
        </script>
        </body></html>
      \`);
    } catch(e) {
      console.error("Error saving manual token:", e);
      return res.status(500).send("Error saving manual token from secrets.");
    }
  }`;

code = code.replace(regex, replacement);

fs.writeFileSync('server.ts', code);
