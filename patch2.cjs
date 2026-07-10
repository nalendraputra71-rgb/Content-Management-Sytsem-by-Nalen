const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `const { workspaceId, platform, type } = req.query; // type can be 'posts', 'insights', 'comments'`,
  `const { workspaceId, platform, type, clientAccessToken, clientAccountId } = req.query;`
);

code = code.replace(
  `    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Account not connected" });
    }
    const accountData = docSnap.data();
    const { accessToken, accountId } = accountData as any;
    if (!accessToken) {`,
  `    let accessToken = clientAccessToken as string;
    let accountId = clientAccountId as string;
    if (!accessToken || !accountId) {
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(404).json({ error: "Account not connected" });
      }
      const accountData = docSnap.data();
      accessToken = accountData?.accessToken;
      accountId = accountData?.accountId;
    }
    if (!accessToken) {`
);

fs.writeFileSync('server.ts', code);
