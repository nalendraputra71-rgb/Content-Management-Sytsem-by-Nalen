const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const target1 = `  const canComment = userRole === "owner" || userRole === "editor" || userRole === "commenter";`;
const replacement1 = `  const canComment = userRole === "owner" || userRole === "editor" || userRole === "commenter";
  const isShared = (d.sharedUsers && d.sharedUsers.length > 0) || d.isPublic;
  const showCommentUI = isShared || (d.comments && d.comments.length > 0) || userRole === "editor" || userRole === "commenter";`;

content = content.replace(target1, replacement1);

const target2 = `  const renderSectionCommentBadge = (sectionKey: string) => {
    const commentsList = d.comments || [];`;
const replacement2 = `  const renderSectionCommentBadge = (sectionKey: string) => {
    if (!showCommentUI) return null;
    const commentsList = d.comments || [];`;

content = content.replace(target2, replacement2);

const target3 = `  const renderInlineCommentThread = (sectionKey: string) => {
    const commentsList = d.comments || [];`;
const replacement3 = `  const renderInlineCommentThread = (sectionKey: string) => {
    if (!showCommentUI) return null;
    const commentsList = d.comments || [];`;

content = content.replace(target3, replacement3);

fs.writeFileSync('src/ContentModal.tsx', content);
