import { db } from "./src/firebase";
import { collection, getDocs } from "firebase/firestore";
import * as fs from "fs";

async function run() {
  const promosSnap = await getDocs(collection(db, "promos"));
  const promos = promosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  fs.writeFileSync("promos_backup.json", JSON.stringify(promos, null, 2));

  const configSnap = await getDocs(collection(db, "config"));
  const config = configSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  fs.writeFileSync("config_backup.json", JSON.stringify(config, null, 2));
}

run().catch(console.error);
