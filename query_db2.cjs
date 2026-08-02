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
    console.log(doc.id);
  });
});
