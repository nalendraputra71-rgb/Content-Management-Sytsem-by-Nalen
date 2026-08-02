const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const target1 = `    if (sectionComments.length === 0) return null;`;
const replacement1 = `    if (sectionComments.length === 0 && !openSections[sectionKey]) return null;`;
content = content.replace(target1, replacement1);

const target2 = `    return (
      <div style={{ marginTop: "14px", borderTop: "1px dashed rgba(0,0,0,0.06)", paddingTop: "12px" }}>`;
const replacement2 = `    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ marginTop: "14px", borderTop: "1px dashed rgba(0,0,0,0.06)", paddingTop: "12px" }}
      >`;
content = content.replace(target2, replacement2);

fs.writeFileSync('src/ContentModal.tsx', content);
