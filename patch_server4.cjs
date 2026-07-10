const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /    let accessToken = clientAccessToken as string;\n    let accountId = clientAccountId as string;\n\n    if \(\!accessToken \|\| \!accountId\) \{/g,
  `    let accessToken = clientAccessToken as string;
    let accountId = clientAccountId as string;

    if (accessToken === "undefined") accessToken = "";
    if (accountId === "undefined") accountId = "";

    if (!accessToken || !accountId) {`
);

fs.writeFileSync('server.ts', code);
