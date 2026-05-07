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
  getFirestore, 
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
  runTransaction
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
  runTransaction
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
  
  // Asynchronous Audit Logging of Security Events
  if (user && errorInfo.error.includes("Missing or insufficient permissions")) {
     addDoc(collection(db, "auditLogs"), {
        event: "SECURITY_VIOLATION",
        details: errorInfo,
        timestamp: new Date().toISOString()
     }).catch(e => console.error("Audit log failed to write:", e));
  }
  
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
