const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const regex = /      const maxSocialAccounts = planDetails\?.maxSocialAccounts \|\| 10;\n      if \(\n        maxSocialAccounts !== -1 && connectedPlatforms\.length >= maxSocialAccounts\n      \) \{/g;

if (code.match(regex)) {
    code = code.replace(
        /      const maxSocialAccounts = planDetails\?.maxSocialAccounts \|\| 10;\n      if \(\n        maxSocialAccounts !== -1 && connectedPlatforms\.length >= maxSocialAccounts\n      \) \{/g,
        '      const { checkCanAddSocialAccount, maxSocialAccounts } = usePlanLimits();\n      if (!checkCanAddSocialAccount(connectedPlatforms.length)) {'
    );
}

if (!code.includes("import { usePlanLimits }")) {
    code = code.replace(
        'import { CustomDropdown } from "./components/CustomDropdown";',
        'import { CustomDropdown } from "./components/CustomDropdown";\nimport { usePlanLimits } from "./hooks/usePlanLimits";'
    );
}

fs.writeFileSync('src/SocialStudioView.tsx', code, 'utf8');
