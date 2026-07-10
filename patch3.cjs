const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const docSnap = await docRef\.get\(\);\s*if \(\!docSnap\.exists\) \{\s*return res\.status\(404\)\.json\(\{ error: "Account not connected" \}\);\s*\}\s*const accountData = docSnap\.data\(\);\s*const \{ accessToken, accountId \} = accountData as any;\s*if \(\!accessToken\) \{/g,
  `let accessToken = clientAccessToken as string;
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
