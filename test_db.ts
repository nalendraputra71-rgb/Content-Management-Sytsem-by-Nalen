import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";

async function run() {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
  const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
  
  if (getApps().length === 0) {
    initializeApp({
      projectId: config.projectId,
      credential: cert(sa)
    });
  }
  const db = getFirestore(config.firestoreDatabaseId || "(default)");
  try {
    const snap = await db.collection("workspaces").limit(1).get();
    console.log("Success, docs:", snap.docs.length);
  } catch (e: any) {
    console.error("Error:", e);
  }
}
run().catch(console.error);
