import { useState, useEffect } from "react";
import { auth, db, signOut, updatePassword, doc, getDoc, updateDoc } from "./firebase";
import { User, Mail, Shield, CreditCard, ChevronRight, LogOut, Key, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { I, B, CARD } from "./data";
import { motion } from "motion/react";

export function UserProfile({ userProfile, activeWorkspace, onUpdate }: { userProfile: any, activeWorkspace: any, onUpdate: (data: any) => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState(userProfile?.fullName || "");
  const [userName, setUserName] = useState(userProfile?.username || "");
  const [newPass, setNewPass] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const uRef = doc(db, "users", userProfile.uid);
      await updateDoc(uRef, { fullName: name, username: userName });
      onUpdate({ ...userProfile, fullName: name, username: userName });
      setMessage({ text: "Profil berhasil diperbarui", type: "success" });
      setIsEditing(false);
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPass) return;
    setLoading(true);
    try {
      if (auth.currentUser) await updatePassword(auth.currentUser, newPass);
      setMessage({ text: "Password berhasil diubah", type: "success" });
      setNewPass("");
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setLoading(false);
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
        <div style={{width:80, height:80, borderRadius:24, background:"#C4622D", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:32, fontWeight:600, boxShadow:"0 10px 30px rgba(196, 98, 45, 0.2)"}}>
          {userProfile?.fullName?.[0]}
        </div>
        <div>
          <h1 style={{ fontSize:28, color:"#2C2016", marginBottom:4}}>{userProfile?.fullName}</h1>
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
            {!isEditing && <button onClick={()=>setIsEditing(true)} style={{fontSize:12, color:"#C4622D", fontWeight:700, background:"none", border:"none", cursor:"pointer"}}>Edit</button>}
          </div>
          
          <div style={{display:"flex", flexDirection:"column", gap:16}}>
            <div>
              <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:4}}>Nama Lengkap</label>
              <input disabled={!isEditing} value={name} onChange={e=>setName(e.target.value)} style={I({background:!isEditing?"#F5F5F5":"white"})} />
            </div>
            <div>
              <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:4}}>Username</label>
              <input disabled value={userName} style={I({background:"#F5F5F5"})} />
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
            <div>
              <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:4}}>Password Baru</label>
              <div style={{display:"flex", gap:8}}>
                <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="••••••••" style={I({})} />
                <button onClick={handleChangePassword} disabled={!newPass || loading} style={{...B(!!newPass), whiteSpace:"nowrap"}}>Ubah</button>
              </div>
            </div>
            <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:8}}>
               <button onClick={()=>signOut(auth)} style={{...B(false), width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", color:"#9C2B4E", borderColor:"#F8EAF0"}}>
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
                  <span style={{background:"#2D7A5E", color:"white", fontSize:11, fontWeight:800, padding:"4px 10px", borderRadius:20}}>LIFETIME PRO - ACTIVE</span>
                </div>
              </div>
              <button style={{...B(false), fontSize:11}}>Riwayat Transaksi</button>
           </div>
           
           <div style={{background:"#FAFAF8", padding:16, borderRadius:12, border:"1px solid rgba(44,32,22,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                 <p style={{fontSize:13, fontWeight:600, color:"#2C2016"}}>Workspace Aktif: {activeWorkspace?.name}</p>
                 <p style={{fontSize:12, color:"rgba(44,32,22,0.5)"}}>Anda adalah Owner dari workspace ini.</p>
              </div>
              <button style={{...B(true), background:"#2C2016", border:"none", color:"white", fontSize:11, display:"flex", alignItems:"center", gap:6}}>Upgrade / Ganti Plan <ChevronRight size={14}/></button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
