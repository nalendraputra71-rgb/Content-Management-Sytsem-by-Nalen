import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
initializeApp({ projectId: "ai-studio-5bedb408-30a3-4e2a-885f-effd203a7138" });
const db = getFirestore();
db.collection('plans').get().then(snap => {
  const plans = snap.docs.map(d => d.id);
  console.log("PLANS:", plans);
});
