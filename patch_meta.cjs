const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldTarget = `apiRoutes.get("/meta/data", async (req, res) => {
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
    }`;

const newTarget = `apiRoutes.get("/meta/data", async (req, res) => {
  const { workspaceId, platform, type, clientAccessToken, clientAccountId } = req.query;
  
  if (!workspaceId || !platform) {
    return res.status(400).json({ error: "workspaceId and platform are required" });
  }

  try {
    let accessToken = clientAccessToken as string | undefined;
    let accountId = clientAccountId as string | undefined;

    if (!accessToken || !accountId) {
      initFirebase();
      const db = getFirestore(getApp(), firestoreDatabaseId || "(default)");
      const docRef = db.collection("workspaces").doc(workspaceId as string).collection("connectedAccounts").doc(platform as string);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Account not connected" });
      }
      const accountData = docSnap.data();
      accessToken = accountData?.accessToken;
      accountId = accountData?.accountId;
    }

    if (!accessToken || !accountId) {
      return res.status(400).json({ error: "Missing access token" });
    }`;

code = code.replace(oldTarget, newTarget);
fs.writeFileSync('server.ts', code);
