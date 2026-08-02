const fs = require('fs');
let content = fs.readFileSync('src/PublicBriefView.tsx', 'utf8');

const target1 = `  const canComment = userRole === "owner" || userRole === "editor" || userRole === "commenter";`;
const replacement1 = `  const canComment = userRole === "owner" || userRole === "editor" || userRole === "commenter";

  const isSharedWithCommentAccess = brief ? 
    (brief.isPublic && (brief.publicRole === "editor" || brief.publicRole === "commenter")) || 
    (brief.sharedUsers && brief.sharedUsers.some((u: any) => u.role === "editor" || u.role === "commenter")) : false;
  
  const showCommentUI = isSharedWithCommentAccess || (comments && comments.length > 0) || userRole === "editor" || userRole === "commenter";`;

content = content.replace(target1, replacement1);

const target2 = `  const renderSectionCommentBadge = (sectionKey: string) => {
    if (!canComment) return null;`;
const replacement2 = `  const renderSectionCommentBadge = (sectionKey: string) => {
    if (!canComment || !showCommentUI) return null;`;

content = content.replace(target2, replacement2);

const target3 = `  const renderInlineCommentThread = (sectionKey: string) => {
    if (!canComment) return null;`;
const replacement3 = `  const renderInlineCommentThread = (sectionKey: string) => {
    if (!canComment || !showCommentUI) return null;`;

content = content.replace(target3, replacement3);

const target4 = `              {/* Comments/Feedback Sidebar */}
              {brief.allowComments !== false && (`;
const replacement4 = `              {/* Comments/Feedback Sidebar */}
              {brief.allowComments !== false && canComment && showCommentUI && (`;

content = content.replace(target4, replacement4);

fs.writeFileSync('src/PublicBriefView.tsx', content);
