const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'ai-studio-5bedb408-30a3-4e2a-885f-effd203a7138'
});
const db = getFirestore();

async function test() {
  try {
    const ws = await db.collection('workspaces').limit(1).get();
    ws.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  } catch (err) {
    console.error(err);
  }
}
test();
