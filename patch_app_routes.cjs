const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the return block of App
const match = content.match(/return \(\s*<BrowserRouter>[\s\S]*?<\/BrowserRouter>\s*\);/);
if (match) {
    content = content.replace(match[0], 'return (\n    <BrowserRouter>\n      <AppRoutes planDetails={planDetails} updateProfileSettings={updateProfileSettings} currentTheme={currentTheme} />\n      <AnimatePresence>\n        {showOnboarding && user && (\n          <OnboardingOverlay \n            user={user}\n            profile={profile}\n            onUpdate={updateProfileSettings}\n          />\n        )}\n      </AnimatePresence>\n    </BrowserRouter>\n  );');
}

if (!content.includes('import { AppRoutes }')) {
    content = content.replace('import { useAuth }', 'import { AppRoutes } from "./AppRoutes";\nimport { useAuth }');
}

fs.writeFileSync('src/App.tsx', content);
