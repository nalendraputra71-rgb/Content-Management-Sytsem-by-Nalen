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
  EmailAuthProvider
} from 'firebase/auth';
import { 
  initializeFirestore, 
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
  where,
  limit,
  orderBy,
  runTransaction,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);
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
  where,
  limit,
  orderBy,
  runTransaction,
  serverTimestamp
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
export async function callAiWithQuota(uid: string, plan: string | undefined, payload: any): Promise<any> {
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    let aiTokensUsed = 0;
    let aiRequestsToday = 0;
    let lastAiRequestDate = "";
    
    const currentUser = auth.currentUser;
    let isAdmin = currentUser?.email?.toLowerCase() === "nalendraputra71@gmail.com";

    if (userSnap.exists()) {
        const data = userSnap.data();
        aiTokensUsed = data?.aiTokensUsed || 0;
        aiRequestsToday = data?.aiRequestsToday || 0;
        lastAiRequestDate = data?.lastAiRequestDate || "";
        if (data?.role === "admin" || data?.email?.toLowerCase() === "nalendraputra71@gmail.com") {
            isAdmin = true;
        }
    }

    const todayDate = new Date().toISOString().split('T')[0];
    if (lastAiRequestDate !== todayDate) {
        aiRequestsToday = 0;
    }

    const MAX_REQUESTS = (plan === 'vip' || plan === 'pro') ? 100 : 50; // Increased for testing
    
    if (!isAdmin && aiRequestsToday >= MAX_REQUESTS) {
        throw new Error(`Limit AI harian habis (${aiRequestsToday}/${MAX_REQUESTS} request). Silakan coba lagi besok hari atau upgrade plan Anda.`);
    }

    // Dapatkan ID Token untuk verifikasi di sisi server
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
        let errorMsg = "Gagal menghubungi server AI";
        try {
            const err = await req.json();
            errorMsg = err.error || errorMsg;
        } catch(e) {
            errorMsg = `Server error (${req.status}): respon tidak sesuai format.`;
        }
        throw new Error(errorMsg);
    }
    
    const data = await req.json();
    
    try {
        await updateDoc(userDocRef, {
            aiTokensUsed: increment(data.usage?.totalTokenCount || 0),
            aiRequestsCount: increment(1),
            aiRequestsToday: increment(1),
            lastAiRequestDate: todayDate
        });
    } catch (e) {
        console.error("Gagal update token stat user", e);
    }

    return data;
}