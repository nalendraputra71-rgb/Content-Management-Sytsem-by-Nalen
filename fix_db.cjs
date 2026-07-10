const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
initializeApp({ credential: cert(serviceAccount) });

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const db = getFirestore(config.firestoreDatabaseId || '(default)');

async function run() {
    console.log("Fetching workspaces...");
    const wsSnap = await db.collection("workspaces").get();
    console.log(`Found ${wsSnap.size} workspaces`);
    
    for (const doc of wsSnap.docs) {
       const workspaceId = doc.id;
       console.log("Workspace ID:", workspaceId);
       
       const connectedAccountsRef = db.collection("workspaces").doc(workspaceId).collection("connectedAccounts");
       if (process.env.INSTAGRAM_MANUAL_TOKEN) {
           console.log("Setting instagram token for", workspaceId);
           let accountId = "ig_manual_id";
           let accountName = "Instagram Account";
           
           try {
              const profileRes = await fetch(`https://graph.instagram.com/v19.0/me?fields=id,username&access_token=${process.env.INSTAGRAM_MANUAL_TOKEN}`);
              if (profileRes.ok) {
                 const data = await profileRes.json();
                 accountId = data.id || accountId;
                 accountName = data.username ? `@${data.username}` : accountName;
              }
           } catch(e) {}
           
           await connectedAccountsRef.doc("instagram").set({
               workspaceId,
               platform: "instagram",
               accountId,
               accountName,
               accessToken: process.env.INSTAGRAM_MANUAL_TOKEN,
               status: "active",
               createdAt: FieldValue.serverTimestamp()
           });
       }
       if (process.env.META_MANUAL_TOKEN) {
           console.log("Setting meta token for", workspaceId);
           let accountId = "meta_manual_id";
           let accountName = "Facebook Account";
           try {
              const profileRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${process.env.META_MANUAL_TOKEN}`);
              if (profileRes.ok) {
                 const data = await profileRes.json();
                 accountId = data.id || accountId;
                 accountName = data.name || accountName;
              }
           } catch(e) {}
           
           await connectedAccountsRef.doc("meta").set({
               workspaceId,
               platform: "meta",
               accountId,
               accountName,
               accessToken: process.env.META_MANUAL_TOKEN,
               status: "active",
               createdAt: FieldValue.serverTimestamp()
           });
       }
    }
    console.log("Done");
    process.exit(0);
}
run();
