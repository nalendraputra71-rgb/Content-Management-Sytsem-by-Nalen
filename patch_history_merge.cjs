const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const oldHistoryLogic = `    if (changedFields.length > 0 || isNew) {
      const existingHistory = (prevData && prevData.history) || cleanData.history || [];
      const historyEntry = {
        timestamp: new Date().toISOString(),
        editorId: user?.uid || "",
        editorName: profile?.fullName || profile?.nickname || user?.displayName || "User",
        editorAvatar: profile?.avatar || "",
        changes: changedFields,
        action: isNew ? "created" : "edited"
      };
      cleanData.history = [historyEntry, ...existingHistory].slice(0, 50);
    } else {
      if (prevData && prevData.history) {
        cleanData.history = prevData.history;
      }
    }`;

const newHistoryLogic = `    if (changedFields.length > 0 || isNew) {
      const existingHistory = (prevData && prevData.history) || cleanData.history || [];
      const now = new Date();
      const lastEntry = existingHistory.length > 0 ? existingHistory[0] : null;
      
      let shouldMerge = false;
      if (lastEntry && lastEntry.action === "edited" && lastEntry.editorId === (user?.uid || "")) {
         const lastTime = new Date(lastEntry.timestamp).getTime();
         // Merge edits if within 10 minutes (600,000 ms)
         if (now.getTime() - lastTime < 600000) {
             shouldMerge = true;
         }
      }

      if (shouldMerge && !isNew) {
          const mergedFields = [...(lastEntry.changes || [])];
          changedFields.forEach(newChange => {
             const existing = mergedFields.find(f => f.field === newChange.field);
             if (existing) {
                 existing.to = newChange.to;
             } else {
                 mergedFields.push(newChange);
             }
          });
          
          const filteredMergedFields = mergedFields.filter(f => f.from !== f.to);
          
          if (filteredMergedFields.length > 0) {
              const updatedLastEntry = {
                 ...lastEntry,
                 changes: filteredMergedFields,
                 timestamp: now.toISOString() // Update timestamp to latest edit
              };
              cleanData.history = [updatedLastEntry, ...existingHistory.slice(1)].slice(0, 50);
          } else {
              // All changes were undone, remove the history entry
              cleanData.history = existingHistory.slice(1);
          }
      } else {
          const historyEntry = {
            timestamp: now.toISOString(),
            editorId: user?.uid || "",
            editorName: profile?.fullName || profile?.nickname || user?.displayName || "User",
            editorAvatar: profile?.avatar || "",
            changes: changedFields,
            action: isNew ? "created" : "edited"
          };
          cleanData.history = [historyEntry, ...existingHistory].slice(0, 50);
      }
    } else {
      if (prevData && prevData.history) {
        cleanData.history = prevData.history;
      }
    }`;

if (!content.includes(oldHistoryLogic)) {
    console.log("oldHistoryLogic not found!");
} else {
    content = content.replace(oldHistoryLogic, newHistoryLogic);
    fs.writeFileSync('src/layouts/MainLayout.tsx', content);
    console.log("Updated history merging logic in MainLayout");
}
