const fs = require('fs');

let content = fs.readFileSync('src/DashboardTab.tsx', 'utf8');

// Fix imports
content = content.replace(/import \{ CustomDropdown, MobileStepper \} from "\.\/SocialStudioView";/, 'import { CustomDropdown } from "./data";\nimport { Plus } from "lucide-react";');

// Update ctx destructuring
const vars = [
  'isMobileHubAi', 'dashboardPlatform', 'PLATFORMS', 'setDashboardPlatform', 
  'dashTimeRange', 'DASHBOARD_TIME_RANGES', 'setDashTimeRange',
  'setShowCreatePostPopup', 'metaApiError', 'lang', 'connectedPlatforms',
  'toggleConnection', 'connectedAccountsData', 'isDiagnosing', 'runDiagnostic',
  'diagnosticResult', 'MobileStepper'
];

content = content.replace('// WE WILL FILL THIS LATER', vars.join(',\n    '));

fs.writeFileSync('src/DashboardTab.tsx', content);
