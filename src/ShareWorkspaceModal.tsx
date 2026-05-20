import { useState, useEffect } from "react";
import { db, collection, query, where, getDocs, doc, setDoc, deleteDoc, updateDoc, limit } from "./firebase";
import { Users, Mail, Shield, Trash2, Link, Copy, Check, Search, AtSign } from "lucide-react";
import { I, B, CARD } from "./data";
import { motion, AnimatePresence } from "motion/react";

export function ShareWorkspaceModal({ workspace, userProfile, onClose }: { workspace: any, userProfile: any, onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);

  useEffect(() => {
    if (workspace?.id) {
       fetchMembers();
    }
  }, [workspace?.id]);

  if (!workspace) return null;

  const fetchMembers = async () => {
    if (!workspace?.id) return;
    const mRef = collection(db, "workspaces", workspace.id, "members");
    const snap = await getDocs(mRef);
    setMembers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
  };

  const handleSearch = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setLoading(true);
    try {
      const uRef = collection(db, "users");
      const q = query(uRef, where("email", "==", email.toLowerCase()), limit(5));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setSearchResult({ ...snap.docs[0].data(), id: snap.docs[0].id });
      } else {
        setSearchResult("none");
      }
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (userToInvite: any) => {
    setLoading(true);
    try {
      const memberRef = doc(db, "workspaces", workspace.id, "members", userToInvite.uid);
      await setDoc(memberRef, {
        userId: userToInvite.uid,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        email: userToInvite.email,
        role: role,
        joinedAt: new Date().toISOString(),
        status: "pending",
        inviterName: userProfile?.fullName || userProfile?.email || "Seseorang"
      });
      fetchMembers();
      setEmail("");
      setSearchResult(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    const ref = doc(db, "workspaces", workspace.id, "members", userId);
    await updateDoc(ref, { role: newRole });
    fetchMembers();
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
       const ref = doc(db, "workspaces", workspace.id, "members", memberToRemove.id || memberToRemove.userId);
       await deleteDoc(ref);
       fetchMembers();
       setMemberToRemove(null);
    } catch (e: any) {
       console.error("Failed to remove member:", e);
    }
  };

  const togglePublicLink = async () => {
    setLoading(true);
    try {
      const wsRef = doc(db, "workspaces", workspace.id);
      await updateDoc(wsRef, { publicLinkEnabled: !workspace.publicLinkEnabled });
      // Parent App.tsx now has an onSnapshot listener that will update this modal's props automatically
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}#/public/${workspace.id}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const publicUrl = `${window.location.origin}${window.location.pathname}#/public/${workspace.id}`;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.2 }} onClick={onClose} style={{position:"fixed", inset:0, background:"rgba(30,21,9,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16}}>
      <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={e=>e.stopPropagation()} style={{background:"#FAFAFA", borderRadius:24, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto", padding:32, boxShadow:"0 40px 100px rgba(0,0,0,0.4)"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
          <h2 style={{ fontSize:24, color:"#2C2016"}}>Share Workspace</h2>
          <button onClick={onClose} style={{background:"none", border:"none", fontSize:24, color:"rgba(44,32,22,0.3)", cursor:"pointer"}}>&times;</button>
        </div>

        {/* Invite Section */}
        <div style={{marginBottom:32}}>
          <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:8}}>Invite by Email</label>
          <div style={{display:"flex", gap:8, marginBottom:12}}>
            <div style={{position:"relative", flex:1}}>
              <Search size={16} style={{position:"absolute", left:12, top:13, color:"rgba(44,32,22,0.3)"}}/>
              <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} placeholder="user@gmail.com" style={I({paddingLeft:36})} />
            </div>
            <button onClick={handleSearch} disabled={loading || !email.includes("@")} style={{...B(true), height:40}}>{loading?"...":"Search"}</button>
          </div>

          {searchResult && searchResult !== "none" && (
             <div style={{background:"white", border:"1.5px solid rgba(196,98,45,0.2)", borderRadius:16, padding:12, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                   <div style={{width:32, height:32, borderRadius:8, background:"#C4622D", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700}}>{(searchResult.fullName || searchResult.nickname || searchResult.email || "?")[0].toUpperCase()}</div>
                   <div>
                      <div style={{fontSize:13, fontWeight:600}}>{searchResult.fullName || searchResult.nickname || searchResult.email}</div>
                      <div style={{fontSize:11, color:"rgba(44,32,22,0.5)"}}>@{searchResult.username || searchResult.email.split('@')[0]}</div>
                   </div>
                </div>
                <div style={{display:"flex", gap:6}}>
                   <select value={role} onChange={e=>setRole(e.target.value)} style={{...I({width:"auto", height:32, padding:"0 8px", fontSize:11})}}>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                   </select>
                   <button onClick={()=>inviteMember(searchResult)} disabled={loading} style={{...B(true), height:32, padding:"0 12px", border:"none", background:"#C4622D", color:"white", fontSize:11}}>Invite</button>
                </div>
             </div>
          )}
          {searchResult === "none" && <div style={{fontSize:12, color:"#9C2B4E", textAlign:"center", padding:8}}>User tidak ditemukan. Pastikan email terdaftar.</div>}
        </div>

        {/* Member List */}
        <div>
           <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:12}}>Workspace Members ({members.length})</label>
           <div style={{display:"flex", flexDirection:"column", gap:12}}>
             {members.map(m => (
               <div key={m.userId} style={{display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(44,32,22,0.05)", paddingBottom:8}}>
                  <div style={{display:"flex", alignItems:"center", gap:10}}>
                    <div style={{width:28, height:28, borderRadius:8, background:m.role==="owner"?"#2C2016":"#F5F5F5", color:m.role==="owner"?"white":"#2C2016", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800}}>
                      {m.role==="owner" ? "O" : (m.role ? m.role[0].toUpperCase() : "V")}
                    </div>
                    <div>
                      <div style={{fontSize:13, fontWeight:500}}>{m.email}</div>
                      <div style={{fontSize:10, color:"rgba(44,32,22,0.4)", textTransform:"capitalize"}}>{m.role || "viewer"}</div>
                    </div>
                  </div>
                  {m.role !== "owner" && (
                    <div style={{display:"flex", gap:4}}>
                       <select value={m.role || "viewer"} onChange={e=>updateRole(m.id || m.userId, e.target.value)} style={{...I({width:"auto", height:24, padding:"0 4px", fontSize:10, border:"none", background:"transparent"})}}>
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="owner">Transfer Owner</option>
                       </select>
                       <button onClick={()=>setMemberToRemove(m)} style={{background:"none", border:"none", color:"rgba(156, 43, 78, 0.5)", cursor:"pointer", padding:4}}><Trash2 size={14}/></button>
                    </div>
                  )}
               </div>
             ))}
           </div>
        </div>

        <AnimatePresence>
          {memberToRemove && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"absolute", inset:0, background:"rgba(30,21,9,0.85)", zIndex:1001, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:24, backdropFilter:"blur(4px)"}}>
               <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={e=>e.stopPropagation()} style={{background:"white", padding:32, borderRadius:24, width: "90%", maxWidth:360, textAlign:"center", boxShadow:"0 20px 40px rgba(0,0,0,0.2)"}}>
                  <div style={{width:64, height:64, borderRadius:32, background:"rgba(225, 29, 72, 0.1)", color:"#E11D48", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px"}}>
                    <Trash2 size={32} />
                  </div>
                  <h3 style={{fontSize:20, fontWeight:800, color:"#2C2016", marginBottom:12, letterSpacing:"-0.5px"}}>Hapus Member?</h3>
                  <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24, whiteSpace:"normal", lineHeight:1.5}}>
                    Apakah Anda yakin ingin menghapus <b>{memberToRemove.username ? `@${memberToRemove.username}` : memberToRemove.email}</b> dari workspace ini?
                  </p>
                  <div style={{display:"flex", gap:12}}>
                     <button onClick={()=>setMemberToRemove(null)} style={{flex:1, padding:12, borderRadius:12, background:"#FAFAFA", border:"1px solid rgba(44,32,22,0.1)", fontWeight:600, color:"#2C2016", cursor:"pointer"}}>Batal</button>
                     <button onClick={confirmRemoveMember} style={{flex:1, padding:12, borderRadius:12, background:"#E11D48", border:"none", fontWeight:600, color:"white", cursor:"pointer"}}>Hapus Akses</button>
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </motion.div>
  );
}
