const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(\!accessToken \|\| \!accountId\) \{[\s\S]*?const accountData = docSnap\.data\(\);\n      accessToken = accountData\?\.accessToken;\n      accountId = accountData\?\.accountId;\n    \}/;

const replacement = `if (!accessToken || !accountId) {
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        // --- MANUAL TOKEN BACKDOOR FALLBACK ---
        if (platform === 'instagram' && process.env.INSTAGRAM_MANUAL_TOKEN) {
           accessToken = process.env.INSTAGRAM_MANUAL_TOKEN;
           accountId = "ig_manual_id";
           try {
             const profileRes = await fetch(\`https://graph.instagram.com/v19.0/me?fields=id&access_token=\${accessToken}\`);
             if (profileRes.ok) {
               const data = await profileRes.json();
               accountId = data.id || accountId;
             }
           } catch(e) {}
        } else if (platform === 'meta' && process.env.META_MANUAL_TOKEN) {
           accessToken = process.env.META_MANUAL_TOKEN;
           accountId = "meta_manual_id";
           try {
             const profileRes = await fetch(\`https://graph.facebook.com/v19.0/me?fields=id&access_token=\${accessToken}\`);
             if (profileRes.ok) {
               const data = await profileRes.json();
               accountId = data.id || accountId;
             }
           } catch(e) {}
        } else {
           return res.status(404).json({ error: "Account not connected" });
        }
      } else {
        const accountData = docSnap.data();
        accessToken = accountData?.accessToken;
        accountId = accountData?.accountId;
      }
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
