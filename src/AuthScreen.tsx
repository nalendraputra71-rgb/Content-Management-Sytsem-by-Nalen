import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  auth, db, googleProvider, signInWithPopup, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail,
  doc, setDoc, getDoc, runTransaction, collection
} from "./firebase";
import { motion, AnimatePresence } from "motion/react";

export function AuthScreen({ onUserCreated, currentUser }: { onUserCreated: (u: any) => void, currentUser?: any }) {
  const location = useLocation();
  const initialMode = location.state?.mode || "signup";
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);
  
  // Update mode if location.state.mode changes
  useEffect(() => {
    if (location.state?.mode) {
      setMode(location.state.mode);
    }
  }, [location.state?.mode]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");

  const getFriendlyError = (e: any) => {
    switch(e.code) {
      case 'auth/popup-closed-by-user': return "Login dibatalkan, kamu menutup popup sebelum selesai.";
      case 'auth/operation-not-allowed': return "Metode login ini belum aktif nih. Coba cara lain ya.";
      case 'auth/email-already-in-use': return "Email ini udah pernah didaftarin.";
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential': return "Username atau passwordnya salah, coba cek lagi ya.";
      case 'auth/too-many-requests': return "Udah terlalu sering nyoba nih. Wait sebentar trus coba lagi ya.";
      case 'auth/invalid-email': return "Format emailnya kurang pas nih.";
      case 'auth/weak-password': return "Passwordnya terlalu gampang ditebak, minimal 6 karakter ya.";
      case 'auth/network-request-failed': return "Wah internetnya lagi ngadat nih, cek koneksi dulu yuk.";
      default: return "Ups, ada kendala teknis. Coba sebentar lagi ya.";
    }
  };

  const checkUserDocument = async (user: any, providedFullName?: string, providedNickname?: string) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
         const activeUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-Day Free Trial
         
         const cRole = user.email?.toLowerCase() === "nalendraputra71@gmail.com" ? "admin" : "user";
         const cPlan = user.email?.toLowerCase() === "nalendraputra71@gmail.com" ? "pro" : "trial";

         await setDoc(userRef, {
           uid: user.uid,
           email: user.email,
           fullName: providedFullName || user.displayName || "Your Name",
           nickname: providedNickname || "",
           username: (user.displayName || "user").replace(/\s+/g, "").toLowerCase() + Math.floor(Math.random()*1000),
           avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || "Your Name"}`,
           plan: cPlan,
           activeUntil: activeUntil.toISOString(),
           hasUsedPromo: false,
           role: cRole,
           createdAt: new Date().toISOString()
         });

         const wsRef = doc(collection(db, "workspaces"));
         await setDoc(wsRef, {
           name: "Content Management",
           ownerId: user.uid,
           settings: {
             title: "Content Management",
             tagline: "Content Management System"
           }
         });
         await setDoc(doc(db, "workspaces", wsRef.id, "members", user.uid), {
           userId: user.uid,
           workspaceId: wsRef.id,
           role: "owner"
         });
      }
      onUserCreated(user);
    } catch (e: any) {
      setError(getFriendlyError(e));
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await checkUserDocument(res.user);
    } catch (e: any) { setError(getFriendlyError(e)); }
    finally { setLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError("Masukkan email terlebih dahulu.");
    setLoading(true);
    setError("");
    setMsg("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Link udah dikirim ke email kamu, buruan cek ya!");
    } catch (e: any) { 
      setError(getFriendlyError(e));
    }
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
         if (!fullName || !nickname) {
           setError("Nama Lengkap dan Nama Panggilan wajib diisi!");
           setLoading(false);
           return;
         }
         const res = await createUserWithEmailAndPassword(auth, email, password);
         await sendEmailVerification(res.user);
         await checkUserDocument(res.user, fullName, nickname);
      }
    } catch (e: any) { 
      setError(getFriendlyError(e));
    }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFEFF] font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1D4D7A]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-5xl w-full flex flex-col md:flex-row shadow-[0_20px_60px_-15px_rgba(11,42,74,0.15)] rounded-[32px] overflow-hidden bg-white relative z-10 min-h-[580px] border border-black/5"
      >
        {/* Left: Branding & Visuals */}
        <div className="w-full md:w-[45%] relative bg-[#0B2A4A] overflow-hidden flex flex-col p-10 md:p-12 text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#1D4D7A] via-transparent to-[#0B2A4A] opacity-80"></div>
          
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 top-12 w-40 h-40 bg-gradient-to-tr from-blue-400 to-[#1D4D7A] rounded-full blur-2xl opacity-40 mix-blend-screen"
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-12 bottom-12 w-48 h-48 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full blur-3xl opacity-30 mix-blend-screen"
          />
          
          <div className="relative z-10 flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
              <img src="/icon.png" alt="Hubify" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; e.currentTarget.parentElement!.nextElementSibling!.style.display = 'flex' }} />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-400 to-blue-200 hidden items-center justify-center text-[#0B2A4A] font-extrabold text-xl shadow-lg">
              H
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Hubify</span>
          </div>

          <div className="relative z-10 mt-auto mb-8">
            <motion.h1 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
               className="text-4xl md:text-5xl font-extrabold leading-[1.1] mb-6 tracking-tight"
            >
              Urus Konten.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Bebas Ruwet.</span>
            </motion.h1>
            <motion.p 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4 }}
               className="text-blue-100/80 font-medium text-lg max-w-sm"
            >
              Atur ide, jadwalin postingan, dan pantau analitik di satu dashboard yang cakep.
            </motion.p>
          </div>

          {/* Social Icons floating */}
          <div className="relative z-10 flex gap-4 mt-8">
             <motion.div animate={{y: [0, -5, 0]}} transition={{duration: 3, repeat: Infinity}} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"><svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.88z"/></svg></motion.div>
             <motion.div animate={{y: [0, -5, 0]}} transition={{duration: 3, repeat: Infinity, delay: 0.2}} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"><svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></motion.div>
             <motion.div animate={{y: [0, -5, 0]}} transition={{duration: 3, repeat: Infinity, delay: 0.4}} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"><svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg></motion.div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col relative overflow-y-auto bg-white">
            <button onClick={() => window.location.href = '#/'} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#1D4D7A] transition-colors mb-4 shrink-0 w-fit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Kembali
            </button>
            
            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} transition={{ duration: 0.3, ease: "easeOut" }}>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B2A4A] mb-1">{mode === 'signup' ? 'Mulai Sekarang 🔥' : mode === 'login' ? 'Selamat Datang Lagi 👋' : 'Reset Password 🤔'}</h2>
                <p className="text-sm font-medium text-slate-500 mb-6">
                  {mode === 'signup' ? 'Bikin akun sekarang juga.' : mode === 'login' ? 'Masuk buat lanjutin kerjaan kamu yang tertunda.' : 'Tenang, kita bantu pulihin akun kamu.'}
                </p>

                {error && <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-start gap-2"><span className="text-base mt-0.5">🚨</span> <span>{error}</span></motion.div>}
                {msg && <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 flex items-start gap-2"><span className="text-base mt-0.5">✅</span> <span>{msg}</span></motion.div>}
                
                {mode === "forgot" ? (
                  <form onSubmit={handleForgot} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#0B2A4A] ml-1">Email Saat Daftar</label>
                      <input type="email" placeholder="contoh@hubify.com" className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-[#1D4D7A] bg-slate-50 focus:bg-white outline-none transition-all font-medium text-[#0B2A4A] placeholder:text-slate-400 text-sm" value={email} onChange={e=>setEmail(e.target.value)} />
                    </div>
                    <button disabled={loading} className="w-full bg-[#1D4D7A] text-white rounded-xl p-3 font-bold text-sm hover:bg-[#0B2A4A] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#1D4D7A]/20 mt-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                      {loading ? "Ngirim..." : "Kirim Link Reset"}
                    </button>
                    <div className="text-center mt-4 text-sm">
                      <button type="button" onClick={() => setMode("login")} className="text-slate-500 font-bold hover:text-[#1D4D7A] transition-colors">Batal, kembali ke Login</button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    {mode === "signup" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#0B2A4A] ml-1">Nama Lengkap</label>
                          <input type="text" placeholder="John Doe" className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-[#1D4D7A] bg-slate-50 focus:bg-white outline-none transition-all font-medium text-[#0B2A4A] placeholder:text-slate-400 text-sm" value={fullName} onChange={e=>setFullName(e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#0B2A4A] ml-1">Nama Panggilan</label>
                          <input type="text" placeholder="Loe" className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-[#1D4D7A] bg-slate-50 focus:bg-white outline-none transition-all font-medium text-[#0B2A4A] placeholder:text-slate-400 text-sm" value={nickname} onChange={e=>setNickname(e.target.value)} required />
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#0B2A4A] ml-1">Email</label>
                      <input type="email" placeholder="contoh@hubify.com" className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-[#1D4D7A] bg-slate-50 focus:bg-white outline-none transition-all font-medium text-[#0B2A4A] placeholder:text-slate-400 text-sm" value={email} onChange={e=>setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-[#0B2A4A]">Password</label>
                        {mode === "login" && (
                          <button type="button" onClick={() => setMode("forgot")} className="text-xs font-bold text-blue-600 hover:text-[#0B2A4A] transition-colors">Lupa Password?</button>
                        )}
                      </div>
                      <input type="password" placeholder="Minimal 6 karakter" className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-[#1D4D7A] bg-slate-50 focus:bg-white outline-none transition-all font-medium text-[#0B2A4A] placeholder:text-slate-400 text-sm" value={password} onChange={e=>setPassword(e.target.value)} required />
                    </div>
                    
                    <button disabled={loading} className="w-full bg-[#1D4D7A] text-white rounded-xl p-3 mt-4 font-bold text-sm hover:bg-[#0B2A4A] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#1D4D7A]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                      {loading ? "Tunggu bentar..." : mode === "login" ? "Masuk ke Dashboard" : "Daftar"}
                    </button>
                  </form>
                )}

                {mode !== "forgot" && (
                  <>
                    <div className="flex items-center my-6 text-xs font-bold text-slate-300 gap-4">
                      <div className="flex-1 h-[1px] bg-slate-100 rounded-full"></div>
                      ATAU LEBIH CEPAT
                      <div className="flex-1 h-[1px] bg-slate-100 rounded-full"></div>
                    </div>

                    <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 bg-white rounded-xl p-3 font-bold text-[#0B2A4A] text-sm hover:border-[#1D4D7A]/30 hover:bg-blue-50/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
                      <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                      {mode === "login" ? "Masuk pake Google" : "Daftar pake Google"}
                    </button>

                    <div className="mt-6 text-center text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {mode === "login" ? (
                        <>Belum gabung sama Hubify? <button onClick={() => setMode("signup")} className="text-[#1D4D7A] font-bold hover:underline">Daftar sekarang</button></>
                      ) : (
                        <>Udah punya akun? <button onClick={() => setMode("login")} className="text-[#1D4D7A] font-bold hover:underline">Masuk di sini</button></>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
              </AnimatePresence>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
