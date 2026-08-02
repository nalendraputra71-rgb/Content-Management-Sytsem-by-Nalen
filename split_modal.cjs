const fs = require('fs');
const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const helpersEndIndex = code.indexOf('export function ContentModal');
const helpersCode = code.substring(0, helpersEndIndex);

const lines = helpersCode.split('\n');
const topLevelDecl = lines.filter(l => l.startsWith('const ') || l.startsWith('function ')).map(l => l.substring(0, 50));
console.log(topLevelDecl);

