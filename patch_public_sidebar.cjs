const fs = require('fs');
let content = fs.readFileSync('src/PublicBriefView.tsx', 'utf8');

const target = `{/* Comment Thread Card Section */}
          {brief.allowComments !== false && (`;
const replacement = `{/* Comment Thread Card Section */}
          {brief.allowComments !== false && canComment && showCommentUI && (`;

content = content.replace(target, replacement);

fs.writeFileSync('src/PublicBriefView.tsx', content);
