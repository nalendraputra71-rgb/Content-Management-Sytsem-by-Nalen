const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

code = code.replace(
  /defaultChecked=\{editingPlan\.capabilities\?\.allowedModels\?\.includes\("gemini-3\.6-flash"\) \?\? false\}/g,
  'defaultChecked={editingPlan.capabilities?.allowedModels?.some(m => m === "gemini-3.6-flash" || m === "gemini-3.5-flash") ?? false}'
);

code = code.replace(
  /defaultChecked=\{editingPlan\.capabilities\?\.allowedModels\?\.includes\("gemini-3\.1-pro-preview"\) \?\? false\}/g,
  'defaultChecked={editingPlan.capabilities?.allowedModels?.some(m => m === "gemini-3.1-pro-preview" || m === "gemini-3.1-pro") ?? false}'
);

fs.writeFileSync('src/AdminPanel.tsx', code);
