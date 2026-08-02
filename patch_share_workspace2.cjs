const fs = require('fs');
let code = fs.readFileSync('src/ShareWorkspaceModal.tsx', 'utf8');

const regexOldHandle = /    const { checkCanAddTeamMember, maxTeamMembers } = usePlanLimits\(\);\n    \/\/ Members array includes the owner\. So we check if we can add to \(members\.length - 1\)\n    if \(\!checkCanAddTeamMember\(members\.length - 1\)\) \{/g;

const newHandle = `    if (!checkCanAddTeamMember(members.length - 1)) {`;

if (code.match(regexOldHandle)) {
   code = code.replace(regexOldHandle, newHandle);
   
   const targetFuncStart = `  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();`;
    
   const newFuncStart = `  const { checkCanAddTeamMember, maxTeamMembers } = usePlanLimits();
   
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();`;
    
   code = code.replace(targetFuncStart, newFuncStart);
   fs.writeFileSync('src/ShareWorkspaceModal.tsx', code, 'utf8');
}
