const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
// API Route to fetch data from Meta platforms (Facebook/Instagram)
apiRoutes.get("/meta/data", async (req, res) => {
  const { workspaceId, platform, type } = req.query; // type can be 'posts', 'insights', 'comments'
  
  if (!workspaceId || !platform) {
    return res.status(400).json({ error: "workspaceId and platform are required" });
  }

  try {
    initFirebase();
    const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
    const docRef = db.collection("workspaces").doc(workspaceId as string).collection("connectedAccounts").doc(platform as string);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Account not connected" });
    }

    const accountData = docSnap.data();
    const { accessToken, accountId } = accountData as any;

    if (!accessToken) {
      return res.status(400).json({ error: "Missing access token" });
    }

    if (type === 'posts') {
      let url = "";
      if (platform === "instagram") {
        url = \`https://graph.facebook.com/\${META_API_VERSION}/\${accountId}/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count,permalink&access_token=\${accessToken}\`;
      } else {
        url = \`https://graph.facebook.com/\${META_API_VERSION}/\${accountId}/published_posts?fields=id,message,created_time,attachments{media,url,title},permalink_url,likes.summary(true),comments.summary(true)&access_token=\${accessToken}\`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      return res.json(data);
    } else if (type === 'insights') {
      let url = "";
      if (platform === "instagram") {
        url = \`https://graph.facebook.com/\${META_API_VERSION}/\${accountId}/insights?metric=follower_count,impressions,reach&period=day&access_token=\${accessToken}\`;
      } else {
        url = \`https://graph.facebook.com/\${META_API_VERSION}/\${accountId}/insights?metric=page_impressions,page_post_engagements,page_fans&period=day&access_token=\${accessToken}\`;
      }
      const response = await fetch(url);
      const data = await response.json();
      return res.json(data);
    }

    res.status(400).json({ error: "Invalid type parameter" });
  } catch (err: any) {
    console.error("Meta Data API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

apiRoutes.post("/meta/data-deletion"`;

code = code.replace(`apiRoutes.post("/meta/data-deletion"`, newEndpoint);
fs.writeFileSync('server.ts', code);
