const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const targetStr = `    const todayStr = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toISOString().substring(0, 7);
    if (lastAiRequestMonth !== currentMonth) {`;

const newCode = `    const now = new Date();
    const year = now.getFullYear();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getDate()).padStart(2, '0');
    const todayStr = \`\${year}-\${monthStr}-\${dayStr}\`;

    let resetDay = 1;
    if (data?.activeUntil) {
        resetDay = new Date(data.activeUntil).getDate();
    } else if (data?.createdAt) {
        resetDay = new Date(data.createdAt).getDate();
    }
    
    let cycleStartMonth = now.getMonth();
    let cycleStartYear = now.getFullYear();
    if (now.getDate() < resetDay) {
        cycleStartMonth -= 1;
        if (cycleStartMonth < 0) {
            cycleStartMonth = 11;
            cycleStartYear -= 1;
        }
    }
    const maxDaysInCycleStartMonth = new Date(cycleStartYear, cycleStartMonth + 1, 0).getDate();
    const actualResetDay = Math.min(resetDay, maxDaysInCycleStartMonth);
    const currentMonth = \`\${cycleStartYear}-\${String(cycleStartMonth + 1).padStart(2, '0')}-\${String(actualResetDay).padStart(2, '0')}\`;

    if (lastAiRequestMonth !== currentMonth) {`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newCode);
    fs.writeFileSync('src/firebase.ts', code);
    console.log('src/firebase.ts updated');
} else {
    console.log('Target string not found in src/firebase.ts');
}
