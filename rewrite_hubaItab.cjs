const fs = require('fs');
let code = fs.readFileSync('src/HubAiTab.tsx', 'utf8');

const targetStr = `                        const todayStr = new Date().toISOString().split("T")[0];
                        const currentMonth = new Date().toISOString().substring(0, 7);
                        const usedDaily = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                        const usedMonthly = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;`;

const newCode = `                        const now = new Date();
                        const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')}\`;
                        
                        let resetDay = 1;
                        if (profile?.activeUntil) resetDay = new Date(profile.activeUntil).getDate();
                        else if (profile?.createdAt) resetDay = new Date(profile.createdAt).getDate();
                        let cycleStartMonth = now.getMonth();
                        let cycleStartYear = now.getFullYear();
                        if (now.getDate() < resetDay) {
                            cycleStartMonth -= 1;
                            if (cycleStartMonth < 0) { cycleStartMonth = 11; cycleStartYear -= 1; }
                        }
                        const actualResetDay = Math.min(resetDay, new Date(cycleStartYear, cycleStartMonth + 1, 0).getDate());
                        const currentMonth = \`\${cycleStartYear}-\${String(cycleStartMonth + 1).padStart(2, '0')}-\${String(actualResetDay).padStart(2, '0')}\`;

                        const usedDaily = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                        const usedMonthly = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newCode);
}

const targetStr2 = `                      const todayStr = new Date().toISOString().split("T")[0];
                      const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;`;
const newCode2 = `                      const now = new Date();
                      const todayStr = \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')}\`;
                      const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;`;

if (code.includes(targetStr2)) {
    code = code.replace(targetStr2, newCode2);
}

fs.writeFileSync('src/HubAiTab.tsx', code);
console.log('HubAiTab.tsx updated');
