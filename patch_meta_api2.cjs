const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newType = `    } else if (type === 'comments') {
      let url = "";
      if (platform === "instagram") {
        // Need to fetch media first, then comments, but for simplicity let's just use conversations if possible or return empty
        // Actually, Instagram graph API comments require media ID. It's complex to get all comments across all media.
        // Let's just return an empty array for now or try fetching the latest media's comments.
        url = \`https://graph.facebook.com/\${META_API_VERSION}/\${accountId}/media?fields=comments{id,text,timestamp,from,username}&access_token=\${accessToken}&limit=5\`;
      } else {
        url = \`https://graph.facebook.com/\${META_API_VERSION}/\${accountId}/feed?fields=comments{id,message,created_time,from}&access_token=\${accessToken}&limit=5\`;
      }
      const response = await fetch(url);
      const data = await response.json();
      return res.json(data);
    }

    res.status(400).json({ error: "Invalid type parameter" });`;

code = code.replace(`    res.status(400).json({ error: "Invalid type parameter" });`, newType);
fs.writeFileSync('server.ts', code);
