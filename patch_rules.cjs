const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(/resource\.data\.get\('userId', ''\)/g, 'resource.data.userId');
code = code.replace(/resource\.data\.get\('ownerId', ''\)/g, 'resource.data.ownerId');

fs.writeFileSync('firestore.rules', code);
