const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

content = content.replace(
  /if \(\(!d\.isHubAiDraft \|\| d\.manuallySaved\) && isDirty\.current\) {/g,
  `if ((!d.isHubAiDraft || d.manuallySaved) && isDirty.current && canEdit) {`
);

fs.writeFileSync('src/ContentModal.tsx', content);
