const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace(
  /const itemData = { \.\.\.cleanData, id: itemId, workspaceId: workspace\.id, userId: user\?\.uid \|\| "" };/,
  `const targetWorkspaceId = data.workspaceId || workspace.id;\n    const targetUserId = data.userId || user?.uid || "";\n    const itemData = { ...cleanData, id: itemId, workspaceId: targetWorkspaceId, userId: targetUserId };`
);

content = content.replace(
  /await setDoc\(doc\(db, "workspaces", workspace\.id, "content", itemId\), itemData, { merge: true }\);/,
  `await setDoc(doc(db, "workspaces", targetWorkspaceId, "content", itemId), itemData, { merge: true });`
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
