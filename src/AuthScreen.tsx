import React, { useState } from "react";
import { 
  auth, db, googleProvider, signInWithPopup, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  doc, setDoc, getDoc, runTransaction, collection
} from "./firebase";
import { motion, AnimatePresence } from "motion/react";

export function AuthScreen({ onUserCreated, currentUser }: { onUserCreated: (u: any) => void, currentUser?: any }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      onUserCreated(res.user);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-sans">
      <div className="max-w-5xl w-full h-[600px] flex shadow-2xl rounded-[32px] overflow-hidden bg-white">
        {/* Left: Mesh Gradient */}
        <div className="w-1/2 relative bg-gray-900 overflow-hidden flex flex-col justify-between p-10 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600 via-gray-900 to-black opacity-90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black opacity-80"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px] -top-20 -left-20"></div>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] -bottom-20 -right-20"></div>
          
          <div className="relative text-white font-bold text-4xl">*</div>
          <div className="relative z-10 text-5xl font-extrabold leading-tight tracking-tighter">
            Satu Dashboard.<br/>Semua Konten.
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-1/2 p-16 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-gray-950 mb-2">Content Management</h2>
            <p className="text-sm font-normal text-gray-500 mb-8">By Nalendra Putra Firdaus</p>

            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <input type="email" placeholder="Email" className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" value={email} onChange={e=>setEmail(e.target.value)} />
                  <input type="password" placeholder="Password" className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" value={password} onChange={e=>setPassword(e.target.value)} />
                  <button className="w-full bg-gray-950 text-white rounded-2xl p-4 font-bold hover:bg-gray-800 transition-all">{mode === "login" ? "Masuk" : "Daftar"}</button>
                </form>

                <div className="flex items-center my-6 text-sm text-gray-400 gap-2">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  atau masuk lewat
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl p-4 font-semibold hover:bg-gray-50 transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5" alt="Google" />
                  {mode === "login" ? "Masuk" : "Daftar"} Pake Google
                </button>

                <div className="mt-8 text-center text-sm text-gray-500">
                  {mode === "login" ? (
                    <>Belum punya akun? <button onClick={() => setMode("signup")} className="text-blue-600 font-bold hover:underline">Daftar</button></>
                  ) : (
                    <>Sudah punya akun? <button onClick={() => setMode("login")} className="text-blue-600 font-bold hover:underline">Masuk</button></>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
