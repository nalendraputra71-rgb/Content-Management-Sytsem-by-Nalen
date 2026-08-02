const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const target = `  const handleClose = async (e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (d.isHubAiDraft && !d.manuallySaved) {
       setShowExitConfirm(true);
       return;
    }
        if (isDirty.current) {`;

const replacement = `  const handleClose = async (e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (d.isHubAiDraft && !d.manuallySaved && canEdit) {
       setShowExitConfirm(true);
       return;
    }
        if (isDirty.current && canEdit) {`;

content = content.replace(target, replacement);

fs.writeFileSync('src/ContentModal.tsx', content);
