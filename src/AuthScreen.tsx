import React, { useState } from "react";
import { 
  auth, db, googleProvider, signInWithPopup, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  doc, setDoc, getDoc, runTransaction, collection
} from "./firebase";
import { Mail, Lock, User, AtSign, ArrowRight, Globe } from "lucide-react";
import { I, B } from "./data";
import { motion, AnimatePresence } from "motion/react";

export function AuthScreen({ onUserCreated, currentUser }: { onUserCreated: (u: any) => void, currentUser?: any }) {
  const [mode, setMode] = useState<"login" | "signup" | "onboarding">(currentUser ? "onboarding" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempUser, setTempUser] = useState<any>(currentUser || null);

  React.useEffect(() => {
    if (currentUser && !tempUser) {
      setTempUser(currentUser);
      setMode("onboarding");
    }
  }, [currentUser, tempUser]);

  const checkUserDocument = async (user: any) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      onUserCreated(user);
    } else {
      setTempUser(user);
      setMode("onboarding");
    }
  };

  const getErrorMessage = (e: any) => {
    const code = e.code || "";
    if (code === "auth/unauthorized-domain") {
      return "Domain belum terdaftar. Silakan tambahkan domain ini ke Authorized Domains di setelan Firebase Authentication.";
    }
    if (code === "auth/operation-not-allowed") {
      return "Login dengan Email/Password belum diaktifkan. Silakan aktifkan di setelan Firebase Authentication.";
    }
    if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
      return "Email atau password salah.";
    }
    if (code === "auth/email-already-in-use") {
      return "Email ini sudah terdaftar. Silakan login.";
    }
    if (code === "auth/weak-password") {
      return "Password terlalu lemah (minimal 6 karakter).";
    }
    return e.message || "Terjadi kesalahan saat memproses permintaan.";
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      
      // Check if user info exists
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      
      if (snap.exists()) {
        onUserCreated(user);
      } else {
        // Auto-provision for Google users to reduce friction
        const wsId = `ws-${Date.now()}`;
        const autoUsername = (user.email?.split("@")[0] || "user") + Math.floor(Math.random() * 1000);
        const fullName = user.displayName || autoUsername;
        
        await runTransaction(db, async (transaction) => {
          const usernameRef = doc(db, "usernames", autoUsername.toLowerCase());
          const wsRef = doc(db, "workspaces", wsId);
          const memberRef = doc(db, "workspaces", wsId, "members", user.uid);
          
          transaction.set(usernameRef, { uid: user.uid });
          transaction.set(userRef, {
            uid: user.uid,
            email: user.email,
            username: autoUsername.toLowerCase(),
            fullName: fullName,
            avatar: user.photoURL || `https://ui-avatars.com/api/?name=${fullName}`,
            plan: "pro", // Bypass paywall
            role: "user",
            createdAt: new Date().toISOString()
          });

          transaction.set(wsRef, {
            id: wsId,
            name: `${fullName}'s Workspace`,
            ownerId: user.uid,
            publicLinkEnabled: false,
            createdAt: new Date().toISOString(),
            settings: {
               title: "Your Company",
               tagline: "Content Management System",
               plan: "pro" // Workspace level plan
            }
          });

          transaction.set(memberRef, {
            userId: user.uid,
            workspaceId: wsId,
            email: user.email,
            role: "owner",
            joinedAt: new Date().toISOString()
          });
        });
        
        onUserCreated(user);
      }
    } catch (e: any) {
      if (e.code !== "auth/popup-closed-by-user") {
        setError(getErrorMessage(e));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        const res = await signInWithEmailAndPassword(auth, email, password);
        await checkUserDocument(res.user);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        setTempUser(res.user);
        setMode("onboarding");
      }
    } catch (e: any) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser || !username.trim()) return;
    setLoading(true);
    setError("");

    try {
      await runTransaction(db, async (transaction) => {
        // Check if username taken
        const usernameRef = doc(db, "usernames", username.toLowerCase());
        const uSnap = await transaction.get(usernameRef);
        if (uSnap.exists()) throw new Error("Username sudah digunakan.");

        const userRef = doc(db, "users", tempUser.uid);
        const wsId = `ws-${Date.now()}`;
        const wsRef = doc(db, "workspaces", wsId);
        const memberRef = doc(db, "workspaces", wsId, "members", tempUser.uid);

        transaction.set(usernameRef, { uid: tempUser.uid });
        transaction.set(userRef, {
          uid: tempUser.uid,
          email: tempUser.email,
          username: username.toLowerCase(),
          fullName,
          avatar: tempUser.photoURL || `https://ui-avatars.com/api/?name=${fullName}`,
          plan: "pro", // Per user request: Lifetime Pro Active
          createdAt: new Date().toISOString()
        });

        // Initialize first workspace
        transaction.set(wsRef, {
          id: wsId,
          name: `${fullName}'s Workspace`,
          ownerId: tempUser.uid,
          publicLinkEnabled: false,
          createdAt: new Date().toISOString(),
          settings: { title: "Your Company", tagline: "Content Management System", plan: "pro" }
        });

        transaction.set(memberRef, {
          userId: tempUser.uid,
          workspaceId: wsId,
          email: tempUser.email,
          role: "owner",
          joinedAt: new Date().toISOString()
        });
      });

      onUserCreated(tempUser);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh", display:"flex", background:"#FAFAFA", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Inter', sans-serif"}}>
      <div className="card-shadow" style={{width:"100%", maxWidth:400, background:"#FFFFFF", borderRadius:32, padding:48, border:"1px solid rgba(44,32,22,0.05)"}}>
        <div style={{textAlign:"center", marginBottom:40}}>
          <h1 style={{fontSize:32, color:"#2C2016", fontWeight:800, letterSpacing:"-1px", marginBottom:8}}>CONTENT MANAGEMENT</h1>
          <p style={{fontSize:12, color:"#FF6B00", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:16}}>By Nalendra Putra Firdaus</p>
          <p style={{fontSize:16, color:"rgba(44,32,22,0.6)", fontWeight:500}}>
            {mode === "login" ? "Selamat datang kembali!" : mode === "signup" ? "Mulai rencanakan kontenmu sekarang." : "Lengkapi profilmu."}
          </p>
        </div>

        {error && <div style={{background:"#F8EAF0", color:"#9C2B4E", padding:14, borderRadius:16, fontSize:13, marginBottom:24, fontWeight:600}}>{error}</div>}
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} transition={{duration:0.2}}>
            {mode === "onboarding" ? (
              <form onSubmit={handleOnboarding} style={{display:"flex", flexDirection:"column", gap:20}}>
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", letterSpacing:1}}>Username Unik</label>
              <div style={{position:"relative"}}>
                <AtSign size={18} style={{position:"absolute", left:16, top:15, color:"rgba(44,32,22,0.3)"}}/>
                <input required value={username} onChange={e=>setUsername(e.target.value.replace(/[^a-z0-9_]/g,""))} placeholder="username" style={{...I({paddingLeft:44})}} />
              </div>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:8}}>
              <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", letterSpacing:1}}>Nama Lengkap</label>
              <div style={{position:"relative"}}>
                <User size={18} style={{position:"absolute", left:16, top:15, color:"rgba(44,32,22,0.3)"}}/>
                <input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nama Lengkap" style={{...I({paddingLeft:44})}} />
              </div>
            </div>
            <button className="hover-scale btn-hover" disabled={loading} type="submit" style={{...B(true), height:54, fontSize:15, marginTop:12}}>
              {loading ? "Menyimpan..." : "Selesaikan Registrasi"} <ArrowRight size={20}/>
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleEmailAuth} style={{display:"flex", flexDirection:"column", gap:20}}>
              <div style={{display:"flex", flexDirection:"column", gap:8}}>
                <div style={{position:"relative"}}>
                  <Mail size={18} style={{position:"absolute", left:16, top:15, color:"rgba(44,32,22,0.3)"}}/>
                  <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email Address" style={{...I({paddingLeft:44})}} />
                </div>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:8}}>
                <div style={{position:"relative"}}>
                  <Lock size={18} style={{position:"absolute", left:16, top:15, color:"rgba(44,32,22,0.3)"}}/>
                  <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{...I({paddingLeft:44})}} />
                </div>
              </div>
              <button className="hover-scale btn-hover" disabled={loading} type="submit" style={{...B(true, "#2C2016"), height:54, fontSize:15, marginTop:12}}>
                {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar Akun"}
              </button>
            </form>

            <div style={{display:"flex", alignItems:"center", gap:20, margin:"32px 0"}}>
              <div style={{flex:1, height:1, background:"rgba(44,32,22,0.08)"}}/>
              <span style={{fontSize:12, color:"rgba(44,32,22,0.3)", fontWeight:700, letterSpacing:1}}>ATAU</span>
              <div style={{flex:1, height:1, background:"rgba(44,32,22,0.08)"}}/>
            </div>

            <button onClick={handleGoogle} className="hover-scale btn-hover" disabled={loading} style={{...B(false), width:"100%", height:54, fontSize:15, border:"2px solid rgba(44,32,22,0.08)"}}>
              <Globe size={20} color="#FF6B00"/> Masuk dengan Google
            </button>

            <div style={{textAlign:"center", marginTop:40, fontSize:14, color:"rgba(44,32,22,0.5)", fontWeight:500}}>
              {mode === "login" ? (
                <>Belum punya akun? <button onClick={()=>setMode("signup")} style={{background:"none", border:"none", color:"#FF6B00", fontWeight:700, cursor:"pointer", transition:"all 0.3s"}}>Daftar</button></>
              ) : (
                <>Sudah punya akun? <button onClick={()=>setMode("login")} style={{background:"none", border:"none", color:"#FF6B00", fontWeight:700, cursor:"pointer", transition:"all 0.3s"}}>Masuk</button></>
              )}
            </div>
          </>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
