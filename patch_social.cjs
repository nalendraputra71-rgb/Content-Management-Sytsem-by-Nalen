const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const target1 = 'const postsRes = await fetch(`/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=posts`);';
const replace1 = 'const accToken = connectedAccountsData[platform].accessToken; const accId = connectedAccountsData[platform].accountId; const postsRes = await fetch(`/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=posts&clientAccessToken=${accToken}&clientAccountId=${accId}`);';
code = code.replace(target1, replace1);

const target2 = 'const commentsRes = await fetch(`/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=comments`);';
const replace2 = 'const accToken2 = connectedAccountsData[platform].accessToken; const accId2 = connectedAccountsData[platform].accountId; const commentsRes = await fetch(`/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=comments&clientAccessToken=${accToken2}&clientAccountId=${accId2}`);';
code = code.replace(target2, replace2);

const target3 = 'const insightsRes = await fetch(`/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=insights`);';
const replace3 = 'const accToken3 = connectedAccountsData[platform].accessToken; const accId3 = connectedAccountsData[platform].accountId; const insightsRes = await fetch(`/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=insights&clientAccessToken=${accToken3}&clientAccountId=${accId3}`);';
code = code.replace(target3, replace3);

fs.writeFileSync('src/SocialStudioView.tsx', code);
