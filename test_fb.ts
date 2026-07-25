import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, collectionGroup } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config.firebaseConfig);
const db = getFirestore(app);

async function run() {
  const c = await getDocs(collectionGroup(db, "content"));
  console.log("Total content size:", c.size);
  const n = await getDocs(collection(db, "global_notifications"));
  console.log("Total global_notifications size:", n.size);
  const t = await getDocs(collectionGroup(db, "todos"));
  console.log("Total todos size:", t.size);
  const u = await getDocs(collection(db, "users"));
  console.log("Total users size:", u.size);
}
run().catch(console.error);
