const fs = require('fs');
let content = fs.readFileSync('src/AppRoutes.tsx', 'utf8');

if (!content.includes('import { OnboardingOverlay }')) {
    content = "import { OnboardingOverlay } from './OnboardingOverlay';\n" + content;
}
fs.writeFileSync('src/AppRoutes.tsx', content);

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('import { LoadingScreen }')) {
    appContent = "import { LoadingScreen } from './LoadingScreen';\n" + appContent;
}
fs.writeFileSync('src/App.tsx', appContent);

