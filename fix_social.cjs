const fs = require('fs');
let content = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

// Remove the old ctx block
const badCtxStart = content.indexOf('const ctx = {');
if (badCtxStart !== -1) {
    const badCtxEnd = content.indexOf('};', badCtxStart) + 2;
    content = content.substring(0, badCtxStart) + content.substring(badCtxEnd);
}

// Find line 3107 roughly (we'll just search for `  return (` that starts the main render)
const lines = content.split('\n');
let mainReturnIdx = -1;
for (let i = 2500; i < 4000; i++) {
    if (lines[i] && lines[i].startsWith('  return (')) {
        mainReturnIdx = i;
        break;
    }
}

const ctxDecl = `
  const ctx = {
    isMobileHubAi, dashboardPlatform, PLATFORMS, setDashboardPlatform, 
    dashTimeRange, DASHBOARD_TIME_RANGES, setDashTimeRange,
    setShowCreatePostPopup, metaApiError, lang, connectedPlatforms,
    toggleConnection, connectedAccountsData, isDiagnosing, runDiagnostic,
    diagnosticResult, MobileStepper, CustomDropdown
  };
`;

if (mainReturnIdx !== -1) {
    lines.splice(mainReturnIdx, 0, ctxDecl);
}

fs.writeFileSync('src/SocialStudioView.tsx', lines.join('\n'));
