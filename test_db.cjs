const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const app = initializeApp({ projectId: 'ai-studio-5bedb408-30a3-4e2a-885f-effd203a7138' });
const db = getFirestore(app);

async function test() {
  const plansSnap = await db.collection('plans').get();
  console.log("--- PLANS ---");
  plansSnap.forEach(doc => {
    console.log(doc.id, doc.data());
  });

  const promosSnap = await db.collection('promos').get();
  console.log("--- PROMOS ---");
  promosSnap.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}
test().catch(console.error);
