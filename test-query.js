import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", "random_uid"),
      where("type", "==", "shared_brief")
    );
    await getDocs(q);
    console.log("Query succeeded!");
    process.exit(0);
  } catch (e) {
    console.error("Query failed:", e.message);
    process.exit(1);
  }
}
test();
