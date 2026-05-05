import React, { useState, useEffect, useRef } from "react";
import { 
  auth, db, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail,
  doc, setDoc, getDoc, collection, writeBatch
} from "./firebase";
import { motion, AnimatePresence } from "motion/react";

export function AuthScreen({ onUserCreated, currentUser }: { onUserCreated: (u: any) => void, currentUser?: any }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      checkUserDocument(currentUser).catch((err) => {
        setError("Gagal menyiapkan akun: " + err.message);
        setLoading(false);
      });
      return; // If currentUser exists, we process that first
    }
    getRedirectResult(auth).then(async (result) => {
      if (result && result.user) {
        setLoading(true);
        await checkUserDocument(result.user);
        // Do not setLoading(false) here on success, await App.tsx re-render
      }
    }).catch((e: any) => {
      setLoading(false);
      if (e.code === 'auth/account-exists-with-different-credential') {
        setError("Akun dengan email ini sudah terdaftar. Silakan login menggunakan Email & Password.");
      } else {
        setError("Redirect Login Error: " + e.message);
      }
    });
  }, [currentUser]);

  const checkRef = useRef(false);

  const checkUserDocument = async (user: any) => {
    if (checkRef.current) return;
    checkRef.current = true;
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
         const activeUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-Day Free Trial
         
         const safeEmail = user.email || "";
         const cRole = safeEmail.toLowerCase() === "nalendraputra71@gmail.com" ? "admin" : "user";
         const cPlan = safeEmail.toLowerCase() === "nalendraputra71@gmail.com" ? "pro" : "trial";
         const safeName = user.displayName || safeEmail.split("@")[0] || "User";

         const batch = writeBatch(db);

         batch.set(userRef, {
           uid: user.uid,
           email: safeEmail,
           fullName: safeName,
           username: safeName.replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random()*1000),
           avatar: user.photoURL || `https://ui-avatars.com/api/?name=${safeName}`,
           plan: cPlan,
           activeUntil: activeUntil.toISOString(),
           hasUsedPromo: false,
           role: cRole,
           createdAt: new Date().toISOString()
         });

         const wsRef = doc(collection(db, "workspaces"));
         batch.set(wsRef, {
           name: "Hubify Workspace",
           ownerId: user.uid,
           settings: {
             title: "Hubify",
             tagline: "Sistem Manajemen Konten untuk Kreator"
           }
         });
         batch.set(doc(db, "workspaces", wsRef.id, "members", user.uid), {
           userId: user.uid,
           workspaceId: wsRef.id,
           role: "owner"
         });

         await batch.commit();
      }
      onUserCreated(user);
    } catch (e: any) {
      setError("Error checkUser: " + e.message);
      throw e;
    } finally {
      checkRef.current = false;
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await checkUserDocument(res.user);
      // Do not setLoading(false) here on success, await App.tsx re-render
    } catch (e: any) { 
      if (e.code === 'auth/unauthorized-domain') {
        setError(`Domain ini (${window.location.hostname}) belum diizinkan untuk Google Sign-In. Silakan tambahkan domain ini di Firebase Console > Authentication > Settings > Authorized Domains.`);
        setLoading(false);
      } else if (e.code === 'auth/account-exists-with-different-credential') {
        setError("Akun dengan email ini sudah terdaftar. Silakan login menggunakan Email & Password.");
        setLoading(false);
      } else if (e.code === 'auth/invalid-credential') {
        setError("Kredensial Google bermasalah. Pastikan waktu (jam/tanggal) di perangkat Anda sudah benar.");
        setLoading(false);
      } else if (
        e.code === 'auth/popup-blocked' || 
        e.code === 'auth/popup-closed-by-user' || 
        e.code === 'auth/cross-origin-cookies-blocked' ||
        e.message.includes("popup")
      ) {
        setError("Pop-up diblokir oleh browser. Jika Anda berada di dalam preview, silakan buka aplikasi di tab baru (klik ikon di pojok kanan atas) atau gunakan login Email & Password.");
        setLoading(false);
      } else {
        setError("Firebase Error (" + e.code + "): " + e.message); 
        setLoading(false);
      }
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError("Masukkan email terlebih dahulu.");
    setLoading(true);
    setError("");
    setMsg("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Link pencetakan ulang password telah dikirim ke email Anda.");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
         const res = await signInWithEmailAndPassword(auth, email, password);
         await checkUserDocument(res.user);
      } else if (mode === "signup") {
         const res = await createUserWithEmailAndPassword(auth, email, password);
         await sendEmailVerification(res.user);
         await checkUserDocument(res.user);
      }
    } catch (e: any) { 
      if (e.code === 'auth/operation-not-allowed') {
        setError("Firebase Error (auth/operation-not-allowed). Fitur Email/Password belum aktif. Silakan masuk ke project Firebase Anda, menu Authentication > Sign-in method, dan aktifkan Email/Password.");
      } else if (e.code === 'auth/invalid-credential') {
        setError("Kredensial tidak valid. Mungkin email/password Anda salah, atau Anda sebelumnya mendaftar menggunakan jalur lain (seperti Akun Google). Silakan periksa kembali.");
      } else {
        setError(e.message); 
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-sans">
      <div className="max-w-5xl w-full md:h-[600px] flex flex-col md:flex-row shadow-2xl md:rounded-[32px] rounded-2xl overflow-hidden bg-white">
        {/* Left: Mesh Gradient */}
        <div className="w-full md:w-1/2 relative bg-gray-900 overflow-hidden flex flex-col justify-between p-10 text-white min-h-[200px] md:min-h-full">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600 via-gray-900 to-black opacity-90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black opacity-80"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px] -top-20 -left-20"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] -bottom-20 -right-20"></div>
          
          <div className="hidden md:block relative text-white font-bold text-4xl">*</div>
          <div className="relative z-10 text-3xl md:text-5xl font-extrabold leading-tight tracking-tighter mt-auto md:mt-0">
            Satu Dashboard.<br/>Semua Konten.
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-gray-950 mb-2">Hubify</h2>
            <p className="text-sm font-normal text-gray-500 mb-8">By Nalendra Putra Firdaus</p>

            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold">{error}</div>}
                {msg && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm font-semibold">{msg}</div>}
                
                {mode === "forgot" ? (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <input type="email" placeholder="Email terdaftar" className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" value={email} onChange={e=>setEmail(e.target.value)} />
                    <button disabled={loading} className="w-full bg-gray-950 text-white rounded-2xl p-4 font-bold hover:bg-gray-800 transition-all">{loading ? "Loading..." : "Kirim Link Reset"}</button>
                    <div className="text-center mt-4 text-sm">
                      <button type="button" onClick={() => setMode("login")} className="text-blue-600 font-bold hover:underline">Kembali ke Login</button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" value={email} onChange={e=>setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" value={password} onChange={e=>setPassword(e.target.value)} required />
                    {mode === "login" && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => setMode("forgot")} className="text-sm font-semibold text-blue-600 hover:underline">Lupa Password?</button>
                      </div>
                    )}
                    <button disabled={loading} className="w-full bg-gray-950 text-white rounded-2xl p-4 font-bold hover:bg-gray-800 transition-all">
                      {loading ? "Loading..." : mode === "login" ? "Masuk" : "Daftar Free Trial 7 Hari"}
                    </button>
                  </form>
                )}

                {mode !== "forgot" && (
                  <>
                    <div className="flex items-center my-6 text-sm text-gray-400 gap-2">
                      <div className="flex-1 h-px bg-gray-200"></div>
                      atau masuk lewat
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl p-4 font-semibold hover:bg-gray-50 transition-all text-sm">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5" alt="Google" />
                      {mode === "login" ? "Masuk Pake Google" : "Daftar Pake Google (Free Trial 7 Hari)"}
                    </button>

                    <div className="mt-8 text-center text-sm text-gray-500">
                      {mode === "login" ? (
                        <>Belum punya akun? <button type="button" onClick={() => setMode("signup")} className="text-blue-600 font-bold hover:underline">Daftar</button></>
                      ) : (
                        <>Sudah punya akun? <button type="button" onClick={() => setMode("login")} className="text-blue-600 font-bold hover:underline">Masuk</button></>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
