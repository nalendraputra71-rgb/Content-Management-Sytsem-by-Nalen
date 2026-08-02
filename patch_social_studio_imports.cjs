const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

if (!code.includes('import { CustomDropdown }')) {
    code = code.replace(
        'import { SimulatedStreamMarkdown } from "./components/SimulatedStreamMarkdown";',
        'import { SimulatedStreamMarkdown } from "./components/SimulatedStreamMarkdown";\nimport { CustomDropdown } from "./components/CustomDropdown";\nimport { MobileStepper } from "./components/MobileStepper";'
    );
}
fs.writeFileSync('src/SocialStudioView.tsx', code, 'utf8');
