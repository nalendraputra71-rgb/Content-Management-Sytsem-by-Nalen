import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, writeBatch, collection } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  try {
    const email = "testadmin"+Date.now()+"@gmail.com";
    const res = await createUserWithEmailAndPassword(auth, email, "Hubify123!!");
    const user = res.user;
    console.log("Created:", user.uid);
    const userRef = doc(db, "users", user.uid);

    const batch = writeBatch(db);
    batch.set(userRef, {
      uid: user.uid,
      email: email,
      fullName: "Test Admin",
      username: "testadmin" + Date.now(),
      plan: "trial",
      activeUntil: new Date().toISOString(),
      role: "user"
    });
    const wsRef = doc(collection(db, "workspaces"));
    batch.set(wsRef, {
      name: "Test Workspace",
      ownerId: user.uid,
      settings: {}
    });
    batch.set(doc(db, "workspaces", wsRef.id, "members", user.uid), {
      userId: user.uid,
      workspaceId: wsRef.id,
      role: "owner"
    });
    console.log("Committing workspace creation batch...");
    await batch.commit();
    console.log("Success");
  } catch(e) {
    console.error("Error:", e);
  }
  process.exit();
}
run();
