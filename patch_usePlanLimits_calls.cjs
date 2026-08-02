const fs = require('fs');

function replaceFile(path, search, replace) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(search, replace);
  fs.writeFileSync(path, code);
}

replaceFile('src/SocialStudioView.tsx', /usePlanLimits\(\)/g, 'usePlanLimits(planDetails)');
replaceFile('src/ContentModal.tsx', /usePlanLimits\(\)/g, 'usePlanLimits(planDetails)');
replaceFile('src/layouts/MainLayout.tsx', /usePlanLimits\(\)/g, 'usePlanLimits(planDetails)');

