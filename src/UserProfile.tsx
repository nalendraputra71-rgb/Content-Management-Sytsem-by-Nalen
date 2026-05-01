import { useState, useEffect } from "react";
import { auth, db, signOut, updatePassword, doc, getDoc, updateDoc, runTransaction, collection, query, where, getDocs } from "./firebase";
import { User, Mail, Shield, CreditCard, ChevronRight, LogOut, Key, Save, ArrowLeft, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { I, B, CARD } from "./data";
import { motion } from "motion/react";

export function UserProfile({ userProfile, activeWorkspace, onUpdate }: { userProfile: any, activeWorkspace: any, onUpdate: (data: any) => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState(userProfile?.fullName || "");
  const [userName, setUserName] = useState(userProfile?.username || "");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [emailStatusMsg, setEmailStatusMsg] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [showTxModal, setShowTxModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const loadTransactions = async () => {
     setShowTxModal(true);
     setLoadingTx(true);
     try {
       const q = query(collection(db, "transactions"), where("userId", "==", userProfile.uid));
       const snap = await getDocs(q);
       const tMap = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a:any,b:any)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
       setTransactions(tMap);
     } catch(e:any) {
       console.error("Failed to load tx", e);
     } finally {
       setLoadingTx(false);
     }
  };

  const handleDownloadInvoice = (tx: any) => {
     const invWindow = window.open("", "_blank");
     if (!invWindow) return;
     invWindow.document.write(`
       <html>
         <head><title>Invoice ${tx.id}</title>
         <style>
            body { font-family: sans-serif; padding: 40px; color: #2C2016; }
            h1 { color: #FF6B00; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #EEE; padding-bottom: 20px; margin-bottom: 20px; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #EEE; }
            .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; }
         </style>
         </head>
         <body>
           <div class="header">
             <div>
               <h1>INVOICE</h1>
               <p>No: ${tx.id.toUpperCase()}</p>
             </div>
             <div style="text-align:right">
               <strong>Social Studio CMS</strong>
               <p>support@socialstudio.com</p>
             </div>
           </div>
           <div class="details">
             <p><strong>Ditagihkan ke:</strong></p>
             <p>${userProfile.fullName || 'User'}<br/>${userProfile.email}</p>
             <p>Tanggal: ${new Date(tx.timestamp).toLocaleString("id-ID")}</p>
             <p>Metode Pembayaran: ${tx.paymentMethod?.toUpperCase() || '-'}</p>
             <p>Status: ${tx.status?.toUpperCase() || 'SUCCESS'}</p>
           </div>
           <table>
             <thead><tr><th>Deskripsi</th><th>Jumlah</th></tr></thead>
             <tbody>
               <tr><td>${tx.planName || 'Paket Pro'} (${tx.durationDays || '30'} Hari)</td><td>Rp ${tx.amount?.toLocaleString('id-ID')}</td></tr>
             </tbody>
           </table>
           <div class="total">Total: Rp ${tx.amount?.toLocaleString('id-ID')}</div>
           <script>window.print();</script>
         </body>
       </html>
     `);
     invWindow.document.close();
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const cleanUsername = userName.replace(/[^a-z0-9_]/g, '').toLowerCase();
      if(cleanUsername.length < 3 || cleanUsername.length > 20) {
         throw new Error("Username harus antara 3 - 20 karakter dan hanya boleh berisi huruf, angka, atau underscore.");
      }
      
      if (cleanUsername !== userProfile.username) {
         await runTransaction(db, async (t) => {
            const ustrRef = doc(db, "usernames", cleanUsername);
            const ustrDoc = await t.get(ustrRef);
            if (ustrDoc.exists()) throw new Error("Username sudah dipakai, silakan gunakan username lain.");
            
            if (userProfile.username) {
               const oldUstrRef = doc(db, "usernames", userProfile.username);
               t.delete(oldUstrRef);
            }
            
            t.set(ustrRef, { uid: userProfile.uid });
            t.update(doc(db, "users", userProfile.uid), { fullName: name, username: cleanUsername });
         });
      } else {
         const uRef = doc(db, "users", userProfile.uid);
         await updateDoc(uRef, { fullName: name, username: cleanUsername });
      }

      onUpdate({ ...userProfile, fullName: name, username: cleanUsername });
      setMessage({ text: "Profil berhasil diperbarui", type: "success" });
      setIsEditing(false);
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext("2d");
        const sx = (img.width - size)/2;
        const sy = (img.height - size)/2;
        ctx?.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        
        setLoading(true);
        try {
          const uRef = doc(db, "users", userProfile.uid);
          await updateDoc(uRef, { avatar: base64 });
          const { updateProfile } = await import("./firebase");
          if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: base64 });
          onUpdate({ ...userProfile, avatar: base64 });
          setMessage({ text: "Foto profil berhasil diperbarui", type: "success" });
        } catch (e: any) {
          setMessage({ text: e.message, type: "error" });
        } finally {
          setLoading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const hasPasswordProvider = auth.currentUser?.providerData?.some((p:any) => p.providerId === 'password');

  const handleChangePassword = async () => {
    if (!newPass) return setMessage({ text: "Masukkan password baru", type: "error" });
    if (hasPasswordProvider && !oldPass) return setMessage({ text: "Masukkan password lama", type: "error" });
    setLoading(true);
    try {
      if (hasPasswordProvider && auth.currentUser && auth.currentUser.email) {
        const credential = await import("./firebase").then(m => m.EmailAuthProvider.credential(auth.currentUser!.email!, oldPass));
        await import("./firebase").then(m => m.reauthenticateWithCredential(auth.currentUser!, credential));
      }
      if (auth.currentUser) await updatePassword(auth.currentUser, newPass);
      setMessage({ text: "Password berhasil disimpan", type: "success" });
      setOldPass("");
      setNewPass("");
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
         setMessage({ text: "Sesi telah berakhir. Silakan logout dan login kembali untuk keamanan.", type: "error" });
      } else {
         setMessage({ text: e.message, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      setLoading(true);
      try {
        const { sendEmailVerification } = await import("./firebase");
        await sendEmailVerification(auth.currentUser);
        setEmailStatusMsg("Email verifikasi telah dikirim. Silakan cek inbox Anda.");
      } catch (e: any) {
        setEmailStatusMsg(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div initial={{opacity:0, y: 20}} animate={{opacity:1, y: 0}} exit={{opacity:0, y: -20}} transition={{ duration: 0.3 }} style={{maxWidth:800, margin:"0 auto", padding:"40px 24px", display:"flex", flexDirection:"column", gap:32}}>
      <div>
        <button className="hover-scale" onClick={() => navigate("/")} style={{...B(false), border:"none", background:"#FAFAFA", borderBottom:"1px solid rgba(44,32,22,0.1)", color:"#2C2016", fontSize:12, fontWeight:700, padding:"8px 16px", borderRadius:10, display:"flex", alignItems:"center", gap:8, cursor:"pointer"}}>
          <ArrowLeft size={16}/> Kembali ke Beranda
        </button>
      </div>

      <div style={{display:"flex", alignItems:"center", gap:24}}>
        <label htmlFor="avatarUpload" style={{position:"relative", cursor:"pointer", display:"block"}}>
          <div style={{width:80, height:80, borderRadius:24, background:"var(--theme-primary)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:32, fontWeight:600, boxShadow:"0 10px 30px var(--theme-primary)33", overflow:"hidden", border:"2px solid transparent", transition:"all 0.2s"}} className="hover:border-white">
            {userProfile?.avatar ? <img src={userProfile.avatar} alt="Avatar" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : userProfile?.fullName?.[0]}
          </div>
          <div style={{position:"absolute", bottom:-6, right:-6, background:"#2C2016", color:"white", width:24,height:24,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid white", boxShadow:"0 2px 5px rgba(0,0,0,0.1)"}}>
            <Pencil size={12}/>
          </div>
          <input type="file" id="avatarUpload" style={{display:"none"}} accept="image/*" onChange={handleImageUpload} />
        </label>
        <div>
          <h1 style={{ fontSize:28, color:"#2C2016", marginBottom:4, display:"flex", alignItems:"center", gap:10}}>
            {userProfile?.fullName}
            <span style={{background: (userProfile?.activeUntil && new Date(userProfile.activeUntil) > new Date()) ? "var(--theme-primary)" : "#9C2B4E", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight:800, display:"inline-block", verticalAlign:"middle"}}>
              {(userProfile?.activeUntil && new Date(userProfile.activeUntil) > new Date()) ? "PRO" : "FREE"}
            </span>
          </h1>
          <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", fontWeight:500}}>@{userProfile?.username} · {userProfile?.email}</p>
        </div>
      </div>

      {message.text && (
        <div style={{padding:16, borderRadius:12, background:message.type==="success"?"#E5F4EE":"#F8EAF0", color:message.type==="success"?"#2D7A5E":"#9C2B4E", fontSize:14, fontWeight:600}}>
          {message.text}
        </div>
      )}

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:24}}>
        {/* Profile Card */}
        <div style={CARD()}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
            <h3 style={{fontSize:16, fontWeight:700, display:"flex", alignItems:"center", gap:10}}><User size={18}/> Informasi Profil</h3>
            {!isEditing && <button onClick={()=>setIsEditing(true)} style={{fontSize:12, color:"var(--theme-primary)", fontWeight:700, background:"none", border:"none", cursor:"pointer"}}>Edit</button>}
          </div>
          
          <div style={{display:"flex", flexDirection:"column", gap:16}}>
            <div>
              <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:4}}>Nama Lengkap</label>
              <input disabled={!isEditing} value={name} onChange={e=>setName(e.target.value)} style={I({background:!isEditing?"#F5F5F5":"white"})} />
            </div>
            <div>
              <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:4}}>Username</label>
              <input disabled={!isEditing} value={userName} onChange={e=>setUserName(e.target.value)} style={I({background:!isEditing?"#F5F5F5":"white"})} />
            </div>
            {isEditing && (
              <button onClick={handleUpdateProfile} disabled={loading} style={{...B(true), width:"100%", height:40, display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
                <Save size={16}/> Simpan Perubahan
              </button>
            )}
          </div>
        </div>

        {/* Security Card */}
        <div style={CARD()}>
          <h3 style={{fontSize:16, fontWeight:700, display:"flex", alignItems:"center", gap:10, marginBottom:20}}><Shield size={18}/> Keamanan</h3>
          
          <div style={{display:"flex", flexDirection:"column", gap:16}}>
            <div style={{padding: 12, borderRadius:12, background:"#F5F5F5"}}>
              <div style={{fontSize:12, fontWeight:700, marginBottom:4}}>Status Verifikasi Email</div>
              {auth.currentUser?.emailVerified ? (
                <div style={{color:"#2D7A5E", fontSize:13, fontWeight:600}}>✅ Terverifikasi</div>
              ) : (
                <div>
                  <div style={{color:"#9C2B4E", fontSize:13, fontWeight:600, marginBottom:8}}>❌ Belum Terverifikasi</div>
                  <button onClick={handleSendVerification} disabled={loading} style={{...B(false), fontSize:11, padding:"6px 12px"}}>Kirim Ulang Link Verifikasi</button>
                  {emailStatusMsg && <div style={{fontSize:11, color:"#2D7A5E", marginTop:8}}>{emailStatusMsg}</div>}
                </div>
              )}
            </div>

            <div>
              {hasPasswordProvider ? (
                <>
                  <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:4}}>Password Lama</label>
                  <input type="password" value={oldPass} onChange={e=>setOldPass(e.target.value)} placeholder="••••••••" style={I({marginBottom:8})} />
                </>
              ) : (
                <div style={{marginBottom:12, fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:600}}>Anda belum menyetel password (login via Google). Buat password sekarang.</div>
              )}
              
              <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:4}}>Password Baru</label>
              <div style={{display:"flex", gap:8}}>
                <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="••••••••" style={I({})} />
                <button onClick={handleChangePassword} disabled={!newPass || (hasPasswordProvider && !oldPass) || loading} style={{...B(!!newPass && (!hasPasswordProvider || !!oldPass)), whiteSpace:"nowrap"}}>{hasPasswordProvider ? "Ubah" : "Simpan"}</button>
              </div>
            </div>
            <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:8}}>
               <button onClick={()=>setShowLogoutConfirm(true)} style={{...B(false), width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", color:"#9C2B4E", borderColor:"#F8EAF0"}}>
                 Ganti Akun / Logout <LogOut size={16}/>
               </button>
            </div>
          </div>
        </div>

        {/* Billing Card */}
        <div style={CARD({gridColumn:"span 2"})}>
           <div style={{display:"flex", justifyContent:"space-between", alignItems:"start"}}>
              <div>
                <h3 style={{fontSize:16, fontWeight:700, display:"flex", alignItems:"center", gap:10, marginBottom:8}}><CreditCard size={18}/> Paket Langganan</h3>
                <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:16}}>
                  <span style={{background: (userProfile?.activeUntil && new Date(userProfile.activeUntil) > new Date()) ? "#2D7A5E" : "#9C2B4E", color:"white", fontSize:11, fontWeight:800, padding:"4px 10px", borderRadius:20}}>
                    {(userProfile?.activeUntil && new Date(userProfile.activeUntil) > new Date()) 
                      ? `PRO (Aktif s.d ${new Date(userProfile.activeUntil).toLocaleDateString("id-ID", {dateStyle:"medium"})})` 
                      : "FREE (Uji Coba Berakhir)"}
                  </span>
                </div>
              </div>
              <button onClick={loadTransactions} style={{...B(false), fontSize:11}}>Riwayat Transaksi</button>
           </div>
           
           <div style={{background:"#FAFAF8", padding:16, borderRadius:12, border:"1px solid rgba(44,32,22,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                 <p style={{fontSize:13, fontWeight:600, color:"#2C2016"}}>Workspace Aktif: {activeWorkspace?.name || "Personal Workspace"}</p>
                 <p style={{fontSize:12, color:"rgba(44,32,22,0.5)"}}>Anda adalah Owner dari workspace ini.</p>
              </div>
              <button onClick={() => navigate("/billing")} className="hover-scale" style={{...B(true), background:"#2C2016", border:"none", color:"white", fontSize:11, display:"flex", alignItems:"center", gap:6}}>Upgrade / Ganti Plan <ChevronRight size={14}/></button>
           </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(5px)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center"}}>
          <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} style={{background:"white", padding:30, borderRadius:20, width:320, textAlign:"center"}}>
            <h3 style={{fontSize:20, fontWeight:800, color:"#2C2016", marginBottom:12}}>Keluar dari sistem?</h3>
            <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24}}>Apakah Anda yakin ingin keluar dari akun Anda?</p>
            <div style={{display:"flex", gap:12}}>
              <button onClick={()=>setShowLogoutConfirm(false)} style={{flex:1, padding:12, borderRadius:12, background:"#FAFAFA", border:"1px solid rgba(44,32,22,0.1)", fontWeight:600, color:"#2C2016", cursor:"pointer"}}>Batal</button>
              <button onClick={() => { setShowLogoutConfirm(false); signOut(auth); }} style={{flex:1, padding:12, borderRadius:12, background:"#9C2B4E", border:"none", fontWeight:600, color:"white", cursor:"pointer"}}>Keluar</button>
            </div>
          </motion.div>
        </div>
      )}

      {showTxModal && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(5px)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center"}}>
          <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} style={{background:"white", padding:30, borderRadius:20, width:600, maxHeight:"80vh", overflowY:"auto"}}>
             <div style={{display:"flex", justifyContent:"space-between", marginBottom:20}}>
               <h3 style={{fontSize:18, fontWeight:700}}>Riwayat Transaksi</h3>
               <button onClick={()=>setShowTxModal(false)} style={{background:"none", border:"none", cursor:"pointer", fontSize:18}}>×</button>
             </div>
             
             {loadingTx ? (
               <div style={{textAlign:"center", padding:40, color:"rgba(44,32,22,0.5)"}}>Memuat transaksi...</div>
             ) : transactions.length === 0 ? (
               <div style={{textAlign:"center", padding:40, color:"rgba(44,32,22,0.5)"}}>Belum ada riwayat transaksi.</div>
             ) : (
               <div style={{display:"flex", flexDirection:"column", gap:12}}>
                 {transactions.map(tx => (
                   <div key={tx.id} style={{border:"1px solid rgba(44,32,22,0.1)", borderRadius:12, padding:16, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <div>
                        <div style={{fontWeight:700, marginBottom:4}}>{tx.planName || 'Paket'}</div>
                        <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", marginBottom:4}}>{new Date(tx.timestamp).toLocaleString("id-ID")} • {tx.paymentMethod?.toUpperCase() || '-'}</div>
                        <div style={{fontSize:11, background:tx.status==="success"?"#E5F4EE":"#F8EAF0", color:tx.status==="success"?"#2D7A5E":"#9C2B4E", padding:"2px 8px", borderRadius:4, display:"inline-block", fontWeight:700}}>
                          {tx.status?.toUpperCase() || 'SUCCESS'}
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                <div style={{fontWeight:800, color:"var(--theme-primary)", marginBottom:8}}>Rp {tx.amount?.toLocaleString('id-ID')}</div>
                        {tx.status === "success" && (
                          <button onClick={()=>handleDownloadInvoice(tx)} className="hover-scale" style={{background:"#FAFAFA", border:"1px solid rgba(44,32,22,0.2)", borderRadius:6, padding:"4px 8px", fontSize:11, fontWeight:600, cursor:"pointer"}}>Download Invoice</button>
                        )}
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
