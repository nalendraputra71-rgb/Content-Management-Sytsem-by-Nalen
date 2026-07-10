const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const syncAllRoute = `
apiRoutes.post("/meta/sync-all", async (req, res) => {
  try {
    initFirebase();
    const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
    
    // Get all workspaces
    const wsSnap = await db.collection("workspaces").get();
    
    let synced = [];
    
    for (const ws of wsSnap.docs) {
      const workspaceId = ws.id;
      const connectedAccountsRef = db.collection("workspaces").doc(workspaceId).collection("connectedAccounts");
      
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
        synced.push({ workspaceId, platform: "instagram" });
      }
    }
    
    res.json({ success: true, synced });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
`;

const regex = /apiRoutes\.post\("\/meta\/sync-secrets"/;
code = code.replace(regex, syncAllRoute + '\napiRoutes.post("/meta/sync-secrets"');
fs.writeFileSync('server.ts', code);
