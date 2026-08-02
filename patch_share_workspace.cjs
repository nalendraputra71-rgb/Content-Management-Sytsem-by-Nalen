const fs = require('fs');
let code = fs.readFileSync('src/ShareWorkspaceModal.tsx', 'utf8');

const oldCheck = `    const maxTeamMembers = planDetails?.maxTeamMembers || 0;
    // Members array includes the owner. So if maxTeamMembers is 0, they can't invite anyone (length > 1).
    // Or we just check members.length >= maxTeamMembers + 1 (since 1 is the owner)
    if (maxTeamMembers !== -1 && members.length >= (maxTeamMembers + 1)) {`;

const newCheck = `    const { checkCanAddTeamMember, maxTeamMembers } = usePlanLimits();
    // Members array includes the owner. So we check if we can add to (members.length - 1)
    if (!checkCanAddTeamMember(members.length - 1)) {`;

code = code.replace(oldCheck, newCheck);

if (!code.includes("import { usePlanLimits }")) {
    code = code.replace(
        'import { auth, db, doc, updateDoc, onSnapshot, getDoc, collection, query, where, getDocs, addDoc } from "./firebase";',
        'import { auth, db, doc, updateDoc, onSnapshot, getDoc, collection, query, where, getDocs, addDoc } from "./firebase";\nimport { usePlanLimits } from "./hooks/usePlanLimits";'
    );
}

fs.writeFileSync('src/ShareWorkspaceModal.tsx', code, 'utf8');
