const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

if (!code.includes("import { usePlanLimits }")) {
    code = code.replace(
        'import { HubyTutorial } from "../components/HubyTutorial";',
        'import { HubyTutorial } from "../components/HubyTutorial";\nimport { usePlanLimits } from "../hooks/usePlanLimits";'
    );
}

fs.writeFileSync('src/layouts/MainLayout.tsx', code, 'utf8');
