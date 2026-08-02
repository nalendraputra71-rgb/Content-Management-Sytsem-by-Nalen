const fs = require('fs');
let code = fs.readFileSync('src/HubAiTab.tsx', 'utf8');

code = code.replace(/const maxReq = planDetails\?\.aiTokenLimit \|\| 50;\s+const todayStr = new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\];\s+const usedReq =\s+profile\?\.lastAiRequestDate === todayStr\s+\? profile\?\.aiRequestsToday \|\| 0\s+: 0;\s+return \`\$\{usedReq\} \/ \$\{maxReq\}\`;/g, 
`const maxReq = planDetails?.aiTokenLimit || 100000;
const currentMonth = new Date().toISOString().substring(0, 7);
const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
if (maxReq === -1) return \`\${usedReq.toLocaleString()} / ∞\`;
return \`\${usedReq.toLocaleString()} / \${maxReq.toLocaleString()}\`;`);

code = code.replace(/const maxReq = planDetails\?\.aiTokenLimit \|\| 50;\s+const todayStr = new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\];\s+const usedReq =\s+profile\?\.lastAiRequestDate === todayStr\s+\? profile\?\.aiRequestsToday \|\| 0\s+: 0;\s+const usedPercent = Math\.min\(\s+\(usedReq \/ maxReq\) \* 100,\s+100,\s+\);/g, 
`const maxReq = planDetails?.aiTokenLimit || 100000;
const currentMonth = new Date().toISOString().substring(0, 7);
const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);`);

fs.writeFileSync('src/HubAiTab.tsx', code);
