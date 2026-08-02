const fs = require('fs');

let dashboard = fs.readFileSync('src/DashboardTab.tsx', 'utf8');
dashboard = dashboard.replace('import { CustomDropdown } from "./data";\n', '');
dashboard = dashboard.replace("'MobileStepper'", "'MobileStepper',\n    'CustomDropdown'");
fs.writeFileSync('src/DashboardTab.tsx', dashboard);

let social = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');
social = social.replace('diagnosticResult, MobileStepper', 'diagnosticResult, MobileStepper, CustomDropdown');
fs.writeFileSync('src/SocialStudioView.tsx', social);
