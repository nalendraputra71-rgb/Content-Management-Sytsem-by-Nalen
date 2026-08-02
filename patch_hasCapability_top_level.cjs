const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Find where usePlanLimits is called and ensure it has hasCapability
code = code.replace(/const \{ checkCanAddWorkspace, maxWorkspaces \} = usePlanLimits\(planDetails\);/, `const { checkCanAddWorkspace, maxWorkspaces, hasCapability } = usePlanLimits(planDetails);`);

// Remove the inline hook calls
code = code.replace(/    const \{ hasCapability \} = usePlanLimits\(planDetails\);\n/g, '');

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
