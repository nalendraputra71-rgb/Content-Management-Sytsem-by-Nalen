const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = \`    let accessToken = clientAccessToken as string;
    let accountId = clientAccountId as string;

    if (!accessToken || !accountId) {\`;

const replacement = \`    let accessToken = clientAccessToken as string;
    let accountId = clientAccountId as string;

    if (accessToken === "undefined" || accessToken === "null") accessToken = "";
    if (accountId === "undefined" || accountId === "null") accountId = "";

    if (!accessToken || !accountId) {\`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
