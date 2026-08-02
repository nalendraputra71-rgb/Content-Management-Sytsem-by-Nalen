const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Fix import("./") to import("../")
content = content.replace(/import\("\.\//g, 'import("../');

// Fix lazy type cast
content = content.replace(/const (\w+): any = lazy/g, 'const $1 = lazy');
content = content.replace(/lazy\(\(\) => import\("([^"]+)"\)\.then\(m => \(\{(?: default:)? m\.\w+ \}\)\)\);/g, match => match.replace(');', ') as React.ComponentType<any>;'));

fs.writeFileSync('src/layouts/MainLayout.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('import { OnboardingOverlay }')) {
    appContent = "import { OnboardingOverlay } from './OnboardingOverlay';\n" + appContent;
}
fs.writeFileSync('src/App.tsx', appContent);
