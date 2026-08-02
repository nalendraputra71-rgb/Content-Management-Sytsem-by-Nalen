const fs = require('fs');
let code = fs.readFileSync('src/DashboardTab.tsx', 'utf8');

code = code.replace(/<MobileStepper,\n    CustomDropdown/g, '<MobileStepper');
fs.writeFileSync('src/DashboardTab.tsx', code);
