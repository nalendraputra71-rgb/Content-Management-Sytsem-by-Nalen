const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const oldDecl = `export function ContentModal({
  const { aiTokenLimit } = usePlanLimits();modal, workspace, userProfile, planDetails, onSave,onClose,onArchive,onRestore,onDelete,onDuplicate,pillars,platforms,contentTypes,pics,statuses,onSettingUpdate}: any) {`;
  
const newDecl = `export function ContentModal({modal, workspace, userProfile, planDetails, onSave,onClose,onArchive,onRestore,onDelete,onDuplicate,pillars,platforms,contentTypes,pics,statuses,onSettingUpdate}: any) {
  const { aiTokenLimit } = usePlanLimits();`;
  
code = code.replace(oldDecl, newDecl);

fs.writeFileSync('src/ContentModal.tsx', code, 'utf8');
