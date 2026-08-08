const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(/maxTeamMembers: planData\.limits\?\.teamMembers \?\? 0,/g, 'maxTeamMembers: planData.limits?.teamMembers ?? 0,\n              maxStorageMB: planData.limits?.storageMB ?? 100,');
appCode = appCode.replace(/maxTeamMembers: 3,/g, 'maxTeamMembers: 3,\n           maxStorageMB: 5000,');
appCode = appCode.replace(/maxTeamMembers: freeData\.limits\?\.teamMembers \?\? 0,/g, 'maxTeamMembers: freeData.limits?.teamMembers ?? 0,\n               maxStorageMB: freeData.limits?.storageMB ?? 100,');
appCode = appCode.replace(/maxTeamMembers: 0,/g, 'maxTeamMembers: 0,\n               maxStorageMB: 100,');

fs.writeFileSync('src/App.tsx', appCode);
console.log('App.tsx patched!');
