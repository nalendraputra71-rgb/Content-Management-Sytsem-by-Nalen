const admin = require("firebase-admin");
const serviceAccount = require("./firebase-applet-config.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
async function run() {
  const plans = await db.collection("plans").get();
  for (const p of plans.docs) {
    const data = p.data();
    if (data.capabilities) {
      data.capabilities.autoPublishing = true;
      data.capabilities.publicLink = true;
      await db.collection("plans").doc(p.id).update({ capabilities: data.capabilities });
      console.log(`Updated ${p.id}`);
    }
  }
}
run();
