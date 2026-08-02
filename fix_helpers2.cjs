const fs = require('fs');

const code = fs.readFileSync('src/utils/contentModalHelpers.tsx', 'utf8');

// Find all the trailing garbage
// wait, I can just rebuild contentModalHelpers manually and properly

