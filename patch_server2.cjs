const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `    let accessToken = clientAccessToken as string;
    let accountId = clientAccountId as string;

    if (!accessToken || !accountId) {`,
  `    let accessToken = clientAccessToken as string;
    let accountId = clientAccountId as string;

    if (!accessToken || !accountId || accessToken === "undefined" || accountId === "undefined" || accessToken === "null" || accountId === "null") {`
);

fs.writeFileSync('server.ts', code);
