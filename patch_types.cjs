const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('maxStorageMB: number;')) {
  code = code.replace(/maxTeamMembers: number;/g, 'maxTeamMembers: number;\n  maxStorageMB: number;');
}
if (!code.includes('storageUsed?: number;')) {
  code = code.replace(/aiTokensUsed\?: number;/g, 'aiTokensUsed?: number;\n  storageUsed?: number;');
}

fs.writeFileSync('src/types.ts', code);
console.log('types.ts patched!');
