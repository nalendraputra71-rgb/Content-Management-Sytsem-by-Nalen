import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const q = query(
      collection(db, "users"),
      where("email", "==", "NalendraPutra71@gmail.com")
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      console.log("UID:", snap.docs[0].id);
    } else {
      console.log("User not found in DB.");
    }
    process.exit(0);
  } catch (e) {
    console.error("Query failed:", e.message);
    process.exit(1);
  }
}
test();
