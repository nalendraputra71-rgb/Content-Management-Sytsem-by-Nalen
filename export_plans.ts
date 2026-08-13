import { db } from "./src/firebase";
import { collection, getDocs } from "firebase/firestore";
import * as fs from "fs";

async function run() {
  const snap = await getDocs(collection(db, "plans"));
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  fs.writeFileSync("plans_backup.json", JSON.stringify(data, null, 2));
  console.log("Exported " + data.length + " plans.");
}

run().catch(console.error);
