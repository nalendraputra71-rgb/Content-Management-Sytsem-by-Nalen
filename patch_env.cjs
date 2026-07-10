const fs = require('fs');
let env = fs.readFileSync('.env.example', 'utf8');

env += `
# Instagram Direct API Credentials (Instagram Login)
# Used if you want to connect Instagram without a Facebook Page
INSTAGRAM_APP_ID=""
INSTAGRAM_APP_SECRET=""
`;

fs.writeFileSync('.env.example', env);
