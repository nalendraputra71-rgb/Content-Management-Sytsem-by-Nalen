const admin = require("firebase-admin");
const serviceAccount = require("./firebase-applet-config.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
db.collection("plans").get().then((snapshot) => {
  snapshot.forEach(doc => {
    if (doc.id.includes("plus-annual") || doc.id.includes("pro-annual")) {
      console.log(doc.id, doc.data().capabilities);
    }
  });
});
