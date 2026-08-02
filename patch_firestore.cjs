const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
admin.initializeApp({
  projectId: "ai-studio-5bedb408-30a3-4e2a-885f-effd203a7138"
});
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('workspaces').get();
  for (const doc of snapshot.docs) {
    const ws = doc.data();
    if (ws.content && Array.isArray(ws.content)) {
      let changed = false;
      const newContent = ws.content.map(c => {
        if (c.year === 2025 || c.year === 2024) {
          c.year = 2026;
          changed = true;
        }
        return c;
      });
      if (changed) {
        await doc.ref.update({ content: newContent });
        console.log("Updated workspace:", doc.id);
      }
    }
  }
}
run().then(() => console.log("Done")).catch(console.error);
