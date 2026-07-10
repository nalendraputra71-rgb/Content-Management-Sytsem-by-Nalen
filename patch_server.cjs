const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoute = `
apiRoutes.post("/meta/manual-token", async (req, res) => {
  const { workspaceId, platform, token } = req.body;
  if (!workspaceId || !token) {
    return res.status(400).send("workspaceId and token are required");
  }

  try {
    const userPlatform = platform === 'instagram' ? 'instagram' : 'meta';
    // Validate token by fetching a basic profile
    const profileRes = await axios.get(\`https://graph.facebook.com/v19.0/me?access_token=\${token}\`);
    const profileId = profileRes.data.id;
    
    // Store in firestore
    await db.collection("workspaces").doc(workspaceId).collection("integrations").doc(userPlatform).set({
      accessToken: token,
      platform: userPlatform,
      profileId: profileId,
      status: "active",
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({ success: true, profileId });
  } catch (err: any) {
    console.error("Manual Token Error:", err.response?.data || err.message);
    res.status(500).send(err.response?.data?.error?.message || err.message);
  }
});
`;

// Insert the new route right before apiRoutes.get("/meta/auth"...
const regex = /apiRoutes\.get\("\/meta\/auth"/;
code = code.replace(regex, newRoute + '\napiRoutes.get("/meta/auth"');

fs.writeFileSync('server.ts', code);
