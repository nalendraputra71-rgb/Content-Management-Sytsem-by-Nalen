const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const oldBadge = `  const renderSectionCommentBadge = (sectionKey: string) => {
    const commentsList = d.comments || [];
    const count = commentsList.filter((c: any) => c.sectionId === sectionKey && !c.resolved).length;
    if (count === 0) return null;`;

const newBadge = `  const renderSectionCommentBadge = (sectionKey: string) => {
    const commentsList = d.comments || [];
    const count = commentsList.filter((c: any) => c.sectionId === sectionKey && !c.resolved).length;
    if (count === 0 && !canComment) return null;`;

content = content.replace(oldBadge, newBadge);
fs.writeFileSync('src/ContentModal.tsx', content);
