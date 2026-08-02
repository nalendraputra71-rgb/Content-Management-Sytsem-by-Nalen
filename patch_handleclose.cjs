const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

content = content.replace(
  /const handleClose = async \(e\?\: any\) => {\n    if \(e && e\.stopPropagation\) e\.stopPropagation\(\);\n    if \(d\.isHubAiDraft && !d\.manuallySaved\) {\n       setShowExitConfirm\(true\);\n       return;\n    }\n        if \(isDirty\.current\) {/g,
  `const handleClose = async (e?: any) => {\n    if (e && e.stopPropagation) e.stopPropagation();\n    if (d.isHubAiDraft && !d.manuallySaved && canEdit) {\n       setShowExitConfirm(true);\n       return;\n    }\n        if (isDirty.current && canEdit) {`
);

fs.writeFileSync('src/ContentModal.tsx', content);
