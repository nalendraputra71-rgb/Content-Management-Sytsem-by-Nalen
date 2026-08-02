import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  initializeFirestore, 
  enableMultiTabIndexedDbPersistence,
  enableIndexedDbPersistence,
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  collection, 
  collectionGroup,
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  getDocFromServer,
  getCountFromServer,
  where,
  limit,
  orderBy,
  runTransaction,
  serverTimestamp,
  increment,
  documentId
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { 
  experimentalForceLongPolling: true,
  useFetchStreams: false
} as any, firebaseConfig.firestoreDatabaseId);

// Enable Firestore Local Cache Persistence
if (typeof window !== "undefined") {
  enableMultiTabIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn("Firestore multi-tab persistence failed-precondition, falling back.");
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn("Firestore persistence is unimplemented in this browser.");
      } else {
        // Try falling back to single-tab persistence if supported
        enableIndexedDbPersistence(db).catch((singleErr) => {
          console.warn("Firestore single-tab persistence fallback failed:", singleErr);
        });
      }
    });
}

export const googleProvider = new GoogleAuthProvider();

export { 
  initializeApp,
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
  EmailAuthProvider,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  collectionGroup,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocFromServer,
  getCountFromServer,
  where,
  limit,
  orderBy,
  runTransaction,
  serverTimestamp,
  increment,
  documentId
};

// Error handler helper
export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, op: FirestoreErrorInfo['operationType'], path: string | null = null): void {
  const user = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || String(error),
    operationType: op,
    path: path,
    authInfo: {
      userId: user?.uid || 'anonymous',
      email: user?.email || '',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous || false,
      providerInfo: user?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };
  console.error("Firestore Error:", errorInfo);
  throw new Error(JSON.stringify(errorInfo));
}

// Test connection strictly as required
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error.message.includes('the client is offline') || error.message.includes('PERMISSION_DENIED')) {
      // PERMISSION_DENIED is actually a good sign that we are talking to the server
      if (error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }
}

// Request AI processing, incrementing quota usage in Firestore
export async function callAiWithQuota(uid: string, plan: string | undefined, payload: any, maxAiTokens: number = 100000): Promise<any> {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    let aiTokensUsed = 0;
    let lastAiRequestMonth = "";
    
    const currentUser = auth.currentUser;
    let isAdmin = currentUser?.email?.toLowerCase() === "nalendraputra71@gmail.com";

    if (userSnap.exists()) {
        const data = userSnap.data();
        aiTokensUsed = data?.aiTokensUsed || 0;
        lastAiRequestMonth = data?.lastAiRequestMonth || "";
        if (data?.role === "admin" || data?.email?.toLowerCase() === "nalendraputra71@gmail.com") {
            isAdmin = true;
        }
    }

    const currentMonth = new Date().toISOString().substring(0, 7); // e.g., "2026-08"
    if (lastAiRequestMonth !== currentMonth) {
        aiTokensUsed = 0;
    }

    const MAX_TOKENS = isAdmin ? 999999999 : (maxAiTokens === -1 ? 999999999 : (maxAiTokens || 100000));
    
    if (!isAdmin && aiTokensUsed >= MAX_TOKENS) {
        throw new Error(`Credit AI Anda bulan ini habis (${aiTokensUsed.toLocaleString()}/${MAX_TOKENS.toLocaleString()} credits). Silakan upgrade plan Anda.`);
    }

    let token = "";
    if (currentUser) {
        token = await currentUser.getIdToken();
    }

    const req = await fetch("/api/gemini", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!req.ok) {
        let errorMsg = `Server error (${req.status})`;
        try {
            const err = await req.json();
            errorMsg = err.error || errorMsg;
        } catch(e) {
            errorMsg = `Server error (${req.status}): respon tidak sesuai format.`;
        }
        throw new Error(errorMsg);
    }
    
    const data = await req.json();
    
    // Hitung Multiplier berdasarkan model
    const model = payload.model || "gemini-3.6-flash";
    let multiplier = 10; // default gemini-3.6-flash
    if (model.includes("gemini-3.1-flash-lite")) multiplier = 1;
    else if (model.includes("gemini-3.6-flash")) multiplier = 10;
    else if (model.includes("gemini-3.1-pro")) multiplier = 25;

    const rawTokens = data.usage?.totalTokenCount || 0;
    const billedTokens = rawTokens * multiplier;

    try {
        await updateDoc(userDocRef, {
            aiTokensUsed: lastAiRequestMonth !== currentMonth ? billedTokens : increment(billedTokens),
            lastAiRequestMonth: currentMonth
        });
    } catch (e) {
        console.error("Gagal update token stat user", e);
    }

    return data;
}