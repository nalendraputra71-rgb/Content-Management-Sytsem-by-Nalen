import { db } from "./src/firebase";
import { doc, setDoc } from "firebase/firestore";
import * as fs from "fs";

async function run() {
  console.log("Restoring plans...");
  if (fs.existsSync("plans_backup.json")) {
    const plans = JSON.parse(fs.readFileSync("plans_backup.json", "utf-8"));
    for (const p of plans) {
      await setDoc(doc(db, "plans", p.id), p);
      console.log(`Restored plan: ${p.id}`);
    }
  }

  console.log("Restoring promos...");
  if (fs.existsSync("promos_backup.json")) {
    const promos = JSON.parse(fs.readFileSync("promos_backup.json", "utf-8"));
    for (const p of promos) {
      await setDoc(doc(db, "promos", p.id), p);
      console.log(`Restored promo: ${p.id}`);
    }
  }

  console.log("Restoring config...");
  if (fs.existsSync("config_backup.json")) {
    const config = JSON.parse(fs.readFileSync("config_backup.json", "utf-8"));
    for (const c of config) {
      await setDoc(doc(db, "config", c.id), c);
      console.log(`Restored config: ${c.id}`);
    }
  }

  console.log("Data migration complete!");
}

run().catch(console.error);
