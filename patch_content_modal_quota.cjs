const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

if (!code.includes("import { usePlanLimits }")) {
    code = code.replace(
        'import { auth, callAiWithQuota, db } from "./firebase";',
        'import { auth, callAiWithQuota, db } from "./firebase";\nimport { usePlanLimits } from "./hooks/usePlanLimits";'
    );
}

const findQuotaCall = /const data = await callAiWithQuota\(auth\.currentUser\?\.uid \|\| 'anon', userProfile\?\.plan, \{ prompt, model: "gemini-3\.5-flash" \}, planDetails\?\.aiTokenLimit \|\| 50\);/g;

if (code.match(findQuotaCall)) {
    // Inject hook at top of component
    code = code.replace(
        /export function ContentModal\([\s\S]*?\{/m,
        '$&\n  const { aiTokenLimit } = usePlanLimits();'
    );
    
    code = code.replace(
        /const data = await callAiWithQuota\(auth\.currentUser\?\.uid \|\| 'anon', userProfile\?\.plan, \{ prompt, model: "gemini-3\.5-flash" \}, planDetails\?\.aiTokenLimit \|\| 50\);/g,
        'const data = await callAiWithQuota(auth.currentUser?.uid || \'anon\', userProfile?.plan, { prompt, model: "gemini-3.5-flash" }, aiTokenLimit);'
    );
}

fs.writeFileSync('src/ContentModal.tsx', code, 'utf8');
