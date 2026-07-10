const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    if (platform === "instagram") {
      const tokenUrl = 'https://api.instagram.com/oauth/access_token';
      const body = new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      });`;

const replacement = `    if (platform === "instagram") {
      // Instagram often appends #_ to the code
      let cleanCode = typeof code === 'string' ? code : '';
      if (cleanCode.endsWith('#_')) {
        cleanCode = cleanCode.slice(0, -2);
      }
      
      const tokenUrl = 'https://api.instagram.com/oauth/access_token';
      const body = new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: cleanCode
      });`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
