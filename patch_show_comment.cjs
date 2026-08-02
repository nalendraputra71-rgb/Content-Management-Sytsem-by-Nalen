const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const target = `  const isShared = (d.sharedUsers && d.sharedUsers.length > 0) || d.isPublic;
  const showCommentUI = isShared || (d.comments && d.comments.length > 0) || userRole === "editor" || userRole === "commenter";`;

const replacement = `  const isSharedWithCommentAccess = 
    (d.isPublic && (d.publicRole === "editor" || d.publicRole === "commenter")) || 
    (d.sharedUsers && d.sharedUsers.some((u: any) => u.role === "editor" || u.role === "commenter"));
  
  const showCommentUI = isSharedWithCommentAccess || (d.comments && d.comments.length > 0) || userRole === "editor" || userRole === "commenter";`;

content = content.replace(target, replacement);

fs.writeFileSync('src/ContentModal.tsx', content);
