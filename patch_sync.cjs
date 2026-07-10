const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const syncRoute = `
apiRoutes.post("/meta/sync-secrets", async (req, res) => {
  const { workspaceId } = req.body;
  if (!workspaceId) return res.status(400).send("workspaceId required");
  
  try {
    initFirebase();
    const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
    const connectedAccountsRef = db.collection("workspaces").doc(workspaceId).collection("connectedAccounts");
    
    let synced = [];
    
    // Sync IG
    if (process.env.INSTAGRAM_MANUAL_TOKEN) {
      let accountId = "ig_manual_id";
      let accountName = "Instagram Account";
      try {
         const profileRes = await fetch(\`https://graph.instagram.com/v19.0/me?fields=id,username&access_token=\${process.env.INSTAGRAM_MANUAL_TOKEN}\`);
         if (profileRes.ok) {
            const data = await profileRes.json();
            accountId = data.id || accountId;
            accountName = data.username ? \`@\${data.username}\` : accountName;
         }
      } catch(e) {}
      
      await connectedAccountsRef.doc("instagram").set({
        workspaceId,
        platform: "instagram",
        accountId,
        accountName,
        accessToken: process.env.INSTAGRAM_MANUAL_TOKEN,
        status: "active",
        createdAt: FieldValue.serverTimestamp()
      });
      synced.push("instagram");
    }
    
    // Sync FB/Meta
    if (process.env.META_MANUAL_TOKEN) {
      let accountId = "meta_manual_id";
      let accountName = "Facebook Account";
      try {
         const profileRes = await fetch(\`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=\${process.env.META_MANUAL_TOKEN}\`);
         if (profileRes.ok) {
            const data = await profileRes.json();
            accountId = data.id || accountId;
            accountName = data.name || accountName;
         }
      } catch(e) {}
      
      await connectedAccountsRef.doc("meta").set({
        workspaceId,
        platform: "meta",
        accountId,
        accountName,
        accessToken: process.env.META_MANUAL_TOKEN,
        status: "active",
        createdAt: FieldValue.serverTimestamp()
      });
      synced.push("meta");
    }
    
    res.json({ success: true, synced });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
`;

const regex = /apiRoutes\.get\("\/meta\/auth"/;
code = code.replace(regex, syncRoute + '\napiRoutes.get("/meta/auth"');
fs.writeFileSync('server.ts', code);
