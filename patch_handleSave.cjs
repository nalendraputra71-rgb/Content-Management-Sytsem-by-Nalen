const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// The history logic is around lines 1180-1230.
// Let's replace the whole block starting from `if (changedFields.length > 0 || isNew) {`
// up to `// Convert any empty inputs`

const targetRegex = /if \(changedFields\.length > 0 \|\| isNew\) \{\s*const existingHistory =[\s\S]*?\} else \{\s*if \(prevData && prevData\.history\) \{\s*cleanData\.history = prevData\.history;\s*\}\s*\}/;

const replacement = `let newHistoryEntry = null;
    if (changedFields.length > 0 || isNew) {
      const now = new Date();
      newHistoryEntry = {
        id: gid(),
        timestamp: now.toISOString(),
        editorId: user?.uid || "",
        editorName: profile?.fullName || profile?.nickname || user?.displayName || "User",
        editorAvatar: profile?.avatar || "",
        changes: changedFields,
        action: isNew ? "created" : "edited"
      };
      
      cleanData.lastEditedBy = newHistoryEntry.editorId;
      cleanData.lastEditedAt = now.getTime();
      cleanData.lastEditorName = newHistoryEntry.editorName;
      cleanData.lastEditorAvatar = newHistoryEntry.editorAvatar;
    }
    
    // Remove history array from main document to keep it small (migration to sub-collection)
    if (cleanData.history) {
      delete cleanData.history;
    }`;

if (code.match(targetRegex)) {
  code = code.replace(targetRegex, replacement);
  
  // Also we need to save the newHistoryEntry to subcollection
  const saveRegex = /await setDoc\(doc\(db, "workspaces", targetWorkspaceId, "content", itemId\), itemData, \{ merge: true \}\);/;
  const saveReplacement = `await setDoc(doc(db, "workspaces", targetWorkspaceId, "content", itemId), itemData, { merge: true });
      if (newHistoryEntry) {
        await setDoc(doc(db, "workspaces", targetWorkspaceId, "content", itemId, "history", newHistoryEntry.id), newHistoryEntry);
      }`;
  
  code = code.replace(saveRegex, saveReplacement);
  
  fs.writeFileSync('src/layouts/MainLayout.tsx', code);
  console.log("Patched successfully!");
} else {
  console.log("Could not find target regex.");
}
