const fs = require('fs');
let code = fs.readFileSync('src/AnalyticsView.tsx', 'utf8');

if (!code.includes("import { usePlanLimits }")) {
    code = code.replace(
        'import { db, auth, callAiWithQuota } from "./firebase";',
        'import { db, auth, callAiWithQuota } from "./firebase";\nimport { usePlanLimits } from "./hooks/usePlanLimits";'
    );
}

const findQuotaCall = /const data = await callAiWithQuota\(auth\.currentUser\?\.uid \|\| 'anon', userProfile\?\.plan, \{ prompt, model: "gemini-3\.5-flash" \}, planDetails\?\.aiTokenLimit \|\| 50\);/g;

if (code.match(findQuotaCall)) {
    // Need to find where to put the hook call, before it's used
    const functionStart = `  const fetchInsights = async () => {`;
    const newFunctionStart = `  const { aiTokenLimit } = usePlanLimits();\n  const fetchInsights = async () => {`;
    
    code = code.replace(functionStart, newFunctionStart);
    
    code = code.replace(
        /const data = await callAiWithQuota\(auth\.currentUser\?\.uid \|\| 'anon', userProfile\?\.plan, \{ prompt, model: "gemini-3\.5-flash" \}, planDetails\?\.aiTokenLimit \|\| 50\);/g,
        'const data = await callAiWithQuota(auth.currentUser?.uid || \'anon\', userProfile?.plan, { prompt, model: "gemini-3.5-flash" }, aiTokenLimit);'
    );
}

fs.writeFileSync('src/AnalyticsView.tsx', code, 'utf8');
