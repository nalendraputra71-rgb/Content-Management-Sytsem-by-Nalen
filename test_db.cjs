const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const app = initializeApp({ projectId: 'ai-studio-5bedb408-30a3-4e2a-885f-effd203a7138' });
const db = getFirestore(app);

async function test() {
  const wsDoc = await db.collection('workspaces').doc('ws-1776929737702').collection('connectedAccounts').get();
  wsDoc.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}
test().catch(console.error);
