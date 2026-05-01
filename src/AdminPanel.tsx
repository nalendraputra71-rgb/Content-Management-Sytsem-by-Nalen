import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Shield, Settings, Server, TrendingUp, CheckCircle, Activity, 
  Search, Edit2, CreditCard, RefreshCw, AlertCircle, FileText, Globe, 
  Bell, LifeBuoy, ToggleLeft, ToggleRight, ArrowUpRight, ArrowDownRight, 
  BarChart2, X, Download, MessageSquare, ExternalLink, Calendar,
  DollarSign, Package, Tag, Clock, ChevronRight, UserPlus, Filter
} from "lucide-react";
import { db, collection, getDocs, doc, updateDoc, setDoc, deleteDoc, onSnapshot, query, where, addDoc } from "./firebase";
import { fmt, B, CARD } from "./data";

export function AdminPanel({ userProfile, onLogout }: { userProfile: any, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [promosList, setPromosList] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [financeFilter, setFinanceFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);

  const [systemSettings, setSystemSettings] = useState<any>({
    maintenanceMode: false,
    allowRegistration: true,
    trialDays: 7
  });

  useEffect(() => {
    let unsubs: any[] = [];
    
    // Real-time synchronization for Users list
    unsubs.push(onSnapshot(collection(db, "users"), snap => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setUsers(data as any[]);
      setLoading(false);
      if (selectedUser) {
          const current = data.find((u: any) => u.id === selectedUser.id);
          if (current) setSelectedUser(current);
      }
    }));

    // Real-time synchronization for Admins
    unsubs.push(onSnapshot(query(collection(db, "users"), where("role", "==", "admin")), snap => {
      setAdmins(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }));

    // Real-time synchronization for Plans & Promos
    unsubs.push(onSnapshot(collection(db, "plans"), snap => {
      setPlans(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }));

    unsubs.push(onSnapshot(collection(db, "promos"), snap => {
      setPromosList(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }));

    // Real-time synchronization for Transactions
    unsubs.push(onSnapshot(collection(db, "transactions"), snap => {
      setTransactions(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }));

    // Real-time synchronization for Support
    unsubs.push(onSnapshot(query(collection(db, "tickets")), snap => {
      const data = snap.docs.map(d=>({id: d.id, ...d.data()}));
      setTickets(data.sort((a:any, b:any) => new Date(b.updatedAt||0).getTime() - new Date(a.updatedAt||0).getTime()));
      setLoadingTickets(false);
      if (selectedTicket) {
          const current = data.find((d: any) => d.id === selectedTicket.id);
          if (current) setSelectedTicket(current);
      }
    }));

    // System Settings
    unsubs.push(onSnapshot(doc(db, "config", "system"), snap => {
      if (snap.exists()) setSystemSettings(snap.data());
    }));
    
    return () => { unsubs.forEach(u => u()); };
  }, [selectedUser?.id, selectedTicket?.id]);

  const savePlan = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       const fd = new FormData(e.target as HTMLFormElement);
       const data = {
         name: fd.get("name"),
         desc: fd.get("desc"),
         price: Number(fd.get("price")),
         originalPrice: Number(fd.get("originalPrice")) || 0,
         addMonths: Number(fd.get("addMonths")),
         popular: fd.get("popular") === "on",
         features: (fd.get("features") as string).split("\n").filter(f => f.trim() !== "")
       };
       if (editingPlan?.id) {
         await updateDoc(doc(db, "plans", editingPlan.id), data);
       } else {
         const id = data.name!.toString().toLowerCase().replace(/\s+/g,'-');
         await setDoc(doc(db, "plans", id), { ...data, id });
       }
       setShowPlanModal(false);
     } catch (e: any) { alert(e.message); }
  };

  const fmtRp = (n: number) => "Rp" + (n || 0).toLocaleString("id-ID");

  const savePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target as HTMLFormElement);
      const code = (fd.get("code") as string).toUpperCase();
      const data = {
        code,
        type: fd.get("type"),
        value: Number(fd.get("value")),
        isActive: true,
        terms: fd.get("terms"),
        targetType: fd.get("targetType"), // 'all' or 'first_timer'
        usageLimit: Number(fd.get("usageLimit")) || 0,
        usageCount: editingPromo?.usageCount || 0,
        startDate: fd.get("startDate") || null,
        endDate: fd.get("endDate") || null,
        createdAt: editingPromo?.createdAt || new Date().toISOString()
      };
      await setDoc(doc(db, "promos", code), { ...data, id: code });
      setShowPromoModal(false);
    } catch (e: any) { alert(e.message); }
  };

  const updateSystemConfig = async (updates: any) => {
    try {
      await setDoc(doc(db, "config", "system"), updates, { merge: true });
    } catch (e: any) { alert(e.message); }
  };

  const handleUpdatePlan = async (uid: string, planName: string, daysToAdd: number = 30) => {
    try {
      const activeUntil = new Date();
      if (daysToAdd === 0) {
        activeUntil.setFullYear(2000); // Expired
      } else {
        activeUntil.setDate(activeUntil.getDate() + daysToAdd);
      }
      await updateDoc(doc(db, "users", uid), { 
        plan: planName.toLowerCase(), 
        activeUntil: activeUntil.toISOString() 
      });
      alert("Paket berhasil diperbarui secara manual.");
    } catch (e) { alert("Gagal update paket"); }
  };

  const togglePromo = async (p: any) => {
    try {
       await updateDoc(doc(db, "promos", p.id), { isActive: !p.isActive });
    } catch(e:any) { alert(e.message); }
  };

  const handleReply = async () => {
     const el = (document.getElementById("ticket_reply") as HTMLTextAreaElement);
     const text = el.value;
     if(!text || !selectedTicket) return;
     try {
        await updateDoc(doc(db, "tickets", selectedTicket.id), {
           messages: [...(selectedTicket.messages||[]), { sender: "admin", text, timestamp: new Date().toISOString() }],
           status: "open",
           readByUser: false,
           updatedAt: new Date().toISOString()
        });
        el.value = "";
     } catch(e:any) { alert(e.message); }
  };

  const isAdminUser = userProfile?.role === "admin" || userProfile?.email?.toLowerCase() === "nalendraputra71@gmail.com";
  if (!userProfile || !isAdminUser) {
    return <div style={{flex: 1, display:"flex", alignItems:"center", justifyContent:"center", color:"#9C2B4E", fontSize: 16, fontWeight: 700}}>Akses Ditolak.</div>;
  }

  const TABS = [
    { id: "dashboard", lb: "Dashboard", ic: <Activity size={18}/> },
    { id: "users", lb: "Manajemen User", ic: <Users size={18}/> },
    { id: "finance", lb: "Keuangan", ic: <DollarSign size={18}/> },
    { id: "admins", lb: "Super Admin", ic: <Shield size={18}/> },
    { id: "plans", lb: "Paket & Promo", ic: <Tag size={18}/> },
    { id: "support", lb: "Support & Tiket", ic: <LifeBuoy size={18}/> },
    { id: "settings", lb: "Pengaturan", ic: <Settings size={18}/> }
  ];

  const filteredUsers = users.filter((u:any) => (u.email || "").toLowerCase().includes(searchEmail.toLowerCase()));

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", height:"100vh", background:"#FAF7F2", overflow:"hidden"}}>
      {/* Header */}
      <div style={{background:"#2C2016", padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", color:"white", zIndex:10}}>
        <div style={{display:"flex", alignItems:"center", gap: 12}}>
          <div style={{width:40, height:40, background:"rgba(196,98,45,0.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <Shield size={24} color="#C4622D" />
          </div>
          <div>
            <h1 style={{margin:0, fontSize:16, fontWeight:800, letterSpacing:"-0.5px"}}>Admin Central</h1>
            <div style={{fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:600}}>{userProfile?.email}</div>
          </div>
        </div>
        <div style={{display:"flex", gap:12}}>
          <div style={{display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", padding:"6px 12px", borderRadius:20, fontSize:11, border:"1px solid rgba(255,255,255,0.1)"}}>
             <div style={{width:6, height:6, borderRadius:"50%", background:"#4CAF50", boxShadow:"0 0 8px #4CAF50"}} />
             Sistem Operasional
          </div>
        </div>
      </div>

      <div style={{display:"flex", flex:1, overflow:"hidden"}}>
        {/* Sidebar Nav */}
        <div style={{width: 240, background:"white", borderRight:"1px solid rgba(44,32,22,0.08)", display:"flex", flexDirection:"column", padding: "20px 12px", gap: 4}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedUser(null); }} 
              style={{
                display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", 
                background: activeTab === t.id ? "rgba(var(--theme-primary-rgb), 0.08)" : "transparent", 
                color: activeTab === t.id ? "var(--theme-primary)" : "rgba(44,32,22,0.5)", 
                border: "none", textAlign:"left", transition:"all 0.2s"
              }}
              className="hover-bg-theme"
            >
              {t.ic} {t.lb}
            </button>
          ))}
          <div style={{marginTop:"auto", padding:"12px 14px"}}>
             <button onClick={onLogout} style={{width:"100%", padding:"10px", borderRadius:10, border:"1px solid #EEE", background:"white", fontSize:12, fontWeight:700, cursor:"pointer", color:"#9C2B4E"}}>Sign Out</button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{flex:1, padding: 32, overflowY:"auto", paddingBottom: 100}}>
          <AnimatePresence mode="wait">
            
            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div key="db" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{maxWidth:1000}}>
                 <div style={{marginBottom:32}}>
                   <h2 style={{fontSize:28, fontWeight:800, color:"#2C2016", margin:0, letterSpacing:"-1px"}}>Ringkasan Sistem</h2>
                   <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", marginTop:4}}>Pantau pertumbuhan dan performa bisnis secara real-time.</p>
                 </div>

                 <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom:32}}>
                    <div style={CARD({padding:24, borderRadius:20})}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:16}}>
                        <div style={{width:40, height:40, background:"rgba(76,175,80,0.1)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          <Users size={20} color="#4CAF50"/>
                        </div>
                        <div style={{fontSize:12, color:"#4CAF50", fontWeight:700, background:"rgba(76,175,80,0.1)", padding:"4px 8px", borderRadius:6}}>+12%</div>
                      </div>
                      <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700}}>Total User Terdaftar</div>
                      <div style={{fontSize:32, fontWeight:800, marginTop:4}}>{users.length}</div>
                    </div>
                    <div style={CARD({padding:24, borderRadius:20})}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:16}}>
                        <div style={{width:40, height:40, background:"rgba(33,150,243,0.1)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          <Package size={20} color="#2196F3"/>
                        </div>
                      </div>
                      <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700}}>User Premium (Pro)</div>
                      <div style={{fontSize:32, fontWeight:800, marginTop:4}}>{users.filter(u=>u.plan==="pro").length}</div>
                    </div>
                    <div style={CARD({padding:24, borderRadius:20})}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:16}}>
                        <div style={{width:40, height:40, background:"rgba(196,98,45,0.1)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          <DollarSign size={20} color="#C4622D"/>
                        </div>
                      </div>
                      <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700}}>Total Revenue (Lifetime)</div>
                      <div style={{fontSize:32, fontWeight:800, marginTop:4}}>{fmtRp(transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0))}</div>
                    </div>
                 </div>

                 <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:20}}>
                    <div style={CARD({padding:24, borderRadius:20})}>
                       <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
                          <h3 style={{fontSize:16, fontWeight:800}}>Tiket Support Terbaru</h3>
                          <button onClick={()=>setActiveTab("support")} style={{fontSize:12, fontWeight:700, color:"var(--theme-primary)", background:"transparent", border:"none", cursor:"pointer"}}>Lihat Semua</button>
                       </div>
                       <div style={{display:"flex", flexDirection:"column", gap:12}}>
                          {tickets.slice(0, 5).map(t => (
                            <div key={t.id} style={{display:"flex", alignItems:"center", gap:16, padding:"12px", border:"1px solid #F5F5F5", borderRadius:12}}>
                               <div style={{width:36, height:36, borderRadius:10, background:"rgba(0,0,0,0.03)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                                  <MessageSquare size={16} />
                               </div>
                               <div style={{flex:1}}>
                                  <div style={{fontSize:13, fontWeight:700}}>{t.subject}</div>
                                  <div style={{fontSize:11, color:"rgba(0,0,0,0.4)"}}>{t.userEmail}</div>
                               </div>
                               <div style={{fontSize:11, fontWeight:700, color:"var(--theme-primary)", background:"rgba(var(--theme-primary-rgb), 0.1)", padding:"4px 8px", borderRadius:6}}>{t.status}</div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div style={CARD({padding:24, borderRadius:20})}>
                       <h3 style={{fontSize:16, fontWeight:800, marginBottom:16}}>Quick Settings</h3>
                       <div style={{display:"flex", flexDirection:"column", gap:16}}>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div style={{fontSize:13, fontWeight:600}}>Maintenance Mode</div>
                             <button onClick={()=>updateSystemConfig({maintenanceMode: !systemSettings.maintenanceMode})} style={{background:"transparent", border:"none", cursor:"pointer", color: systemSettings.maintenanceMode ? "#9C2B4E" : "#4CAF50"}}>
                               {systemSettings.maintenanceMode ? <ToggleRight size={32}/> : <ToggleLeft size={32}/>}
                             </button>
                          </div>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div style={{fontSize:13, fontWeight:600}}>Allow Registration</div>
                             <button onClick={()=>updateSystemConfig({allowRegistration: !systemSettings.allowRegistration})} style={{background:"transparent", border:"none", cursor:"pointer", color: systemSettings.allowRegistration ? "#4CAF50" : "#CCC"}}>
                               {systemSettings.allowRegistration ? <ToggleRight size={32}/> : <ToggleLeft size={32}/>}
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* USERS */}
            {activeTab === "users" && !selectedUser && (
              <motion.div key="users" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24}}>
                  <div>
                    <h2 style={{fontSize:28, fontWeight:800, margin:0, letterSpacing:"-1px"}}>Manajemen User</h2>
                    <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", marginTop:4}}>Kelola akses, paket, dan data seluruh pengguna sistem.</p>
                  </div>
                  <div style={{display:"flex", alignItems:"center", background:"white", padding:"10px 16px", borderRadius:12, border:"1px solid rgba(44,32,22,0.1)", width: 320, boxShadow:"0 2px 4px rgba(0,0,0,0.02)"}}>
                    <Search size={18} color="rgba(44,32,22,0.4)" style={{marginRight:10}}/>
                    <input placeholder="Cari email user..." value={searchEmail} onChange={e=>setSearchEmail(e.target.value)} style={{border:"none", outline:"none", flex:1, fontSize:13, background:"transparent", fontWeight:600}} />
                  </div>
                </div>

                <div style={CARD({borderRadius:20, overflow:"hidden", border:"1px solid #EEE"})}>
                  <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                    <thead style={{background:"#FAFAFA", borderBottom:"1px solid #EEE"}}>
                      <tr>
                        <th style={{padding:"16px 20px", textAlign:"left", color:"rgba(0,0,0,0.4)", fontWeight:700, fontSize:11, textTransform:"uppercase"}}>Email & Identitas</th>
                        <th style={{padding:"16px 20px", textAlign:"center", color:"rgba(0,0,0,0.4)", fontWeight:700, fontSize:11, textTransform:"uppercase"}}>Email Verified</th>
                        <th style={{padding:"16px 20px", textAlign:"center", color:"rgba(0,0,0,0.4)", fontWeight:700, fontSize:11, textTransform:"uppercase"}}>Paket</th>
                        <th style={{padding:"16px 20px", textAlign:"center", color:"rgba(0,0,0,0.4)", fontWeight:700, fontSize:11, textTransform:"uppercase"}}>Role</th>
                        <th style={{padding:"16px 20px", textAlign:"center", color:"rgba(0,0,0,0.4)", fontWeight:700, fontSize:11, textTransform:"uppercase"}}>Status</th>
                        <th style={{padding:"16px 20px", textAlign:"right"}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u:any) => (
                        <tr key={u.id} style={{borderBottom:"1px solid #FAFAFA"}} className="hover-bg-light">
                          <td style={{padding:"16px 20px"}}>
                             <div style={{fontWeight:700}}>{u.email}</div>
                             <div style={{fontSize:11, color:"rgba(0,0,0,0.3)"}}>ID: {u.id}</div>
                          </td>
                          <td style={{padding:"16px 20px", textAlign:"center"}}>
                             <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
                               <div style={{width:8, height:8, borderRadius:"50%", background: u.emailVerified ? "#4CAF50" : "#FF9800"}} />
                               <span style={{fontSize:12, fontWeight:700, color: u.emailVerified ? "#4CAF50" : "#FF9800"}}>{u.emailVerified ? "Verified" : "Unverified"}</span>
                             </div>
                          </td>
                          <td style={{padding:"16px 20px", textAlign:"center"}}>
                             <div style={{display:"inline-block", background: u.plan==="pro"?"rgba(var(--theme-primary-rgb),0.1)":"#F5F5F5", color:u.plan==="pro"?"var(--theme-primary)":"#666", padding:"4px 10px", borderRadius:20, fontWeight:800, fontSize:11, textTransform:"capitalize"}}>
                               {u.plan || "Free"}
                             </div>
                          </td>
                          <td style={{padding:"16px 20px", textAlign:"center"}}>
                             <span style={{fontSize:12, fontWeight:600}}>{u.role || "user"}</span>
                          </td>
                          <td style={{padding:"16px 20px", textAlign:"center"}}>
                             <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
                               <div style={{width:6, height:6, borderRadius:"50%", background: u.activeUntil && new Date(u.activeUntil) > new Date() ? "#4CAF50" : "#CCC"}} />
                               <span style={{fontSize:12}}>{u.activeUntil && new Date(u.activeUntil) > new Date() ? "Aktif" : "Expired"}</span>
                             </div>
                          </td>
                          <td style={{padding:"16px 20px", textAlign:"right"}}>
                            <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
                              <button onClick={() => setSelectedUser(u)} style={{background:"#F0F0F0", border:"none", padding:"8px 12px", borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer"}}>Open Profile</button>
                              <button onClick={() => setDeletingItem({id: u.id, type:"users", name: u.email})} style={{background:"rgba(156,43,78,0.1)", border:"1px solid rgba(156,43,78,0.2)", color:"#9C2B4E", borderRadius:8, padding:"8px 12px", fontSize:12, fontWeight:800, cursor:"pointer"}}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div style={{padding:60, textAlign:"center", color:"rgba(0,0,0,0.3)", fontWeight:600}}>Tidak ada user ditemukan.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* USER DETAIL */}
            {activeTab === "users" && selectedUser && (
              <motion.div key="userDetail" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}} style={{maxWidth:900}}>
                <button onClick={()=>setSelectedUser(null)} style={{background:"none", border:"none", display:"flex", alignItems:"center", gap:8, color:"var(--theme-primary)", fontWeight:800, cursor:"pointer", marginBottom:24}}>
                  <X size={18}/> Back to List
                </button>
                
                <div style={{display:"grid", gridTemplateColumns:"1fr 2fr", gap:20}}>
                   <div style={CARD({padding:24, borderRadius:24})}>
                      <div style={{width:80, height:80, background:"rgba(var(--theme-primary-rgb), 0.1)", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px"}}>
                         <Users size={40} color="var(--theme-primary)"/>
                      </div>
                      <h3 style={{textAlign:"center", margin:0, fontSize:18, fontWeight:800, wordBreak:"break-all"}}>{selectedUser.email}</h3>
                      <div style={{textAlign:"center", fontSize:12, color:"rgba(0,0,0,0.4)", marginTop:4}}>Joined: {new Date(selectedUser.createdAt||Date.now()).toLocaleDateString()}</div>
                      
                      <div style={{marginTop:24, paddingTop:24, borderTop:"1px solid #F5F5F5"}}>
                         <div style={{fontSize:11, fontWeight:800, color:"rgba(0,0,0,0.4)", textTransform:"uppercase", marginBottom:12}}>Status Berlangganan</div>
                         <div style={{background:"#FAFAFA", padding:12, borderRadius:12, border:"1px solid #EEE"}}>
                            <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                               <span style={{fontSize:12, fontWeight:600}}>Plan:</span>
                               <span style={{fontSize:13, fontWeight:800, color:"var(--theme-primary)"}}>{selectedUser.plan || "Free"}</span>
                            </div>
                            <div style={{display:"flex", justifyContent:"space-between"}}>
                               <span style={{fontSize:12, fontWeight:600}}>Active Until:</span>
                               <span style={{fontSize:12, fontWeight:700}}>{selectedUser.activeUntil ? new Date(selectedUser.activeUntil).toLocaleDateString() : "-"}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div style={{display:"flex", flexDirection:"column", gap:20}}>
                      <div style={CARD({padding:24, borderRadius:24})}>
                         <h3 style={{fontSize:16, fontWeight:800, marginBottom:16}}>Ubah Paket Manual</h3>
                         <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                            <button onClick={()=>handleUpdatePlan(selectedUser.id, "pro", 30)} style={{background:"var(--theme-primary)", color:"white", border:"none", padding:12, borderRadius:12, fontWeight:700, cursor:"pointer"}}>Set PRO (30 Hari)</button>
                            <button onClick={()=>handleUpdatePlan(selectedUser.id, "free", 0)} style={{background:"#F5F5F5", border:"none", padding:12, borderRadius:12, fontWeight:700, cursor:"pointer"}}>Set FREE (Revoke)</button>
                         </div>
                      </div>

                      <div style={CARD({padding:24, borderRadius:24})}>
                         <h3 style={{fontSize:16, fontWeight:800, marginBottom:16}}>Xendit History</h3>
                         <div style={{display:"flex", flexDirection:"column", gap:10}}>
                            {/* In a real app, this would be a filtered list of transactions */}
                            <div style={{padding:12, border:"1px dashed #DDD", borderRadius:12, textAlign:"center", fontSize:12, color:"#999"}}>
                               Belum ada riwayat transaksi Xendit untuk user ini.
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* FINANCE */}
            {activeTab === "finance" && (
              <motion.div key="finance" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                 <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32}}>
                   <div>
                     <h2 style={{fontSize:28, fontWeight:800, color:"#2C2016", margin:0, letterSpacing:"-1px"}}>Manajemen Keuangan</h2>
                     <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", marginTop:4}}>Pantau transaksi, revenue, dan pertumbuhan finansial SaaS.</p>
                   </div>
                   <div style={{display:"flex", gap:12}}>
                      <select 
                        value={financeFilter.month} 
                        onChange={e => setFinanceFilter(p => ({...p, month: Number(e.target.value)}))}
                        style={{padding:"10px 16px", borderRadius:12, border:"1px solid #DDD", fontSize:13, fontWeight:700}}
                      >
                        {Array.from({length:12}, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>{new Date(2000, m-1).toLocaleString('id-ID', {month:'long'})}</option>
                        ))}
                      </select>
                      <select 
                        value={financeFilter.year} 
                        onChange={e => setFinanceFilter(p => ({...p, year: Number(e.target.value)}))}
                        style={{padding:"10px 16px", borderRadius:12, border:"1px solid #DDD", fontSize:13, fontWeight:700}}
                      >
                        {[2024, 2025, 2026, 2027].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                   </div>
                 </div>

                 <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom:32}}>
                    <div style={CARD({padding:24, borderRadius:20})}>
                       <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700, textTransform:"uppercase"}}>Total Revenue</div>
                       <div style={{fontSize:36, fontWeight:800, marginTop:8}}>{fmtRp(transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0))}</div>
                       <div style={{fontSize:12, color:"#4CAF50", fontWeight:700, marginTop:8}}>Lifetime Earnings</div>
                    </div>
                    <div style={CARD({padding:24, borderRadius:20})}>
                       <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700, textTransform:"uppercase"}}>MRR (Estimated)</div>
                       <div style={{fontSize:36, fontWeight:800, marginTop:8}}>{fmtRp(users.filter(u=>u.plan==="pro").length * 99000)}</div>
                       <div style={{fontSize:12, color:"#2196F3", fontWeight:700, marginTop:8}}>Monthly Recurring Revenue</div>
                    </div>
                    <div style={CARD({padding:24, borderRadius:20})}>
                       <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700, textTransform:"uppercase"}}>Pendapatan Filter Terpilih</div>
                       <div style={{fontSize:36, fontWeight:800, marginTop:8}}>
                         {fmtRp(transactions.filter(t => {
                           const d = new Date(t.timestamp);
                           return d.getMonth() + 1 === financeFilter.month && d.getFullYear() === financeFilter.year;
                         }).reduce((acc, t) => acc + (Number(t.amount) || 0), 0))}
                       </div>
                       <div style={{fontSize:12, color:"#FF9800", fontWeight:700, marginTop:8}}>Bulan: {new Date(2000, financeFilter.month-1).toLocaleString('id-ID', { month: 'long' })} {financeFilter.year}</div>
                    </div>
                 </div>

                 <div style={CARD({borderRadius:20, overflow:"hidden", border:"1px solid #EEE"})}>
                    <div style={{padding:20, borderBottom:"1px solid #EEE", background:"#FAFAFA", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                       <h3 style={{fontSize:16, fontWeight:800, margin:0}}>History Transaksi Berdasarkan Filter</h3>
                       <button onClick={() => {
                          const csv = "Date,Email,Plan,Amount,Voucher,Method\n" + transactions.map(t => `${t.timestamp},${t.userEmail},${t.planName},${t.amount},${t.voucherCode || '-'},${t.paymentMethod}`).join("\n");
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.setAttribute('hidden', '');
                          a.setAttribute('href', url);
                          a.setAttribute('download', 'transaksi.csv');
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                       }} style={{fontSize:12, fontWeight:700, color:"var(--theme-primary)", background:"white", border:"1px solid #EEE", padding:"8px 16px", borderRadius:10, cursor:"pointer"}}>Ekspor CSV</button>
                    </div>
                    <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                       <thead>
                          <tr style={{background:"#FAFAFA", textAlign:"left"}}>
                             <th style={{padding:16, fontSize:11, fontWeight:800, color:"#999"}}>TANGGAL & JAM</th>
                             <th style={{padding:16, fontSize:11, fontWeight:800, color:"#999"}}>PENGGUNA</th>
                             <th style={{padding:16, fontSize:11, fontWeight:800, color:"#999"}}>PAKET</th>
                             <th style={{padding:16, fontSize:11, fontWeight:800, color:"#999"}}>VOUCHER</th>
                             <th style={{padding:16, fontSize:11, fontWeight:800, color:"#999"}}>NOMINAL</th>
                             <th style={{padding:16, fontSize:11, fontWeight:800, color:"#999"}}>METODE</th>
                          </tr>
                       </thead>
                       <tbody>
                          {transactions
                           .filter(t => {
                             const d = new Date(t.timestamp);
                             return d.getMonth() + 1 === financeFilter.month && d.getFullYear() === financeFilter.year;
                           })
                           .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                           .map(t => (
                            <tr key={t.id} style={{borderBottom:"1px solid #FAFAFA"}}>
                               <td style={{padding:16}}>
                                  <div style={{fontWeight:700}}>{new Date(t.timestamp).toLocaleDateString("id-ID", {dateStyle:"medium"})}</div>
                                  <div style={{fontSize:10, color:"#999"}}>{new Date(t.timestamp).toLocaleTimeString("id-ID", {hour:"2-digit", minute:"2-digit"})}</div>
                               </td>
                               <td style={{padding:16, fontWeight:700}}>{t.userEmail}</td>
                               <td style={{padding:16}}>
                                  <span style={{fontSize:11, fontWeight:800, background:"rgba(0,0,0,0.05)", padding:"4px 8px", borderRadius:6}}>{t.planName}</span>
                               </td>
                               <td style={{padding:16, color: t.voucherCode ? "#C4622D" : "#999", fontWeight: t.voucherCode ? 800 : 400}}>{t.voucherCode || "-"}</td>
                               <td style={{padding:16, fontWeight:800, color:"#4CAF50"}}>{fmtRp(t.amount)}</td>
                               <td style={{padding:16, fontSize:12, color:"#666"}}>{t.paymentMethod}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                    {transactions.filter(t => {
                       const d = new Date(t.timestamp);
                       return d.getMonth() + 1 === financeFilter.month && d.getFullYear() === financeFilter.year;
                    }).length === 0 && (
                      <div style={{padding:60, textAlign:"center", color:"#999"}}>Tidak ada transaksi pada periode ini.</div>
                    )}
                 </div>
              </motion.div>
            )}

            {/* SUPER ADMINS */}
            {activeTab === "admins" && (
              <motion.div key="admins" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{maxWidth:800}}>
                 <h2 style={{fontSize:28, fontWeight:800, marginBottom:24, letterSpacing:"-1px"}}>Super Admin Access</h2>
                 <div style={CARD({padding:24, borderRadius:24})}>
                    <p style={{fontSize:14, color:"rgba(0,0,0,0.5)", marginBottom:20}}>Hanya user dengan role <b>admin</b> yang bisa mengakses Admin Central.</p>
                    <div style={{display:"flex", flexDirection:"column", gap:12}}>
                       {admins.map(a => (
                         <div key={a.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"#F9F9F9", borderRadius:16, border:"1px solid #EEE"}}>
                            <div style={{display:"flex", alignItems:"center", gap:12}}>
                               <div style={{width:32, height:32, background:"rgba(0,0,0,0.05)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center"}}>
                                  <Shield size={16} color="var(--theme-primary)"/>
                               </div>
                               <span style={{fontWeight:700, fontSize:14}}>{a.email}</span>
                            </div>
                            {a.email !== "nalendraputra71@gmail.com" && (
                              <button onClick={async () => {
                                if(window.confirm(`Revoke admin access for ${a.email}?`)) {
                                   await updateDoc(doc(db, "users", a.id), { role: "user" });
                                }
                              }} style={{background:"transparent", border:"none", color:"#9C2B4E", fontSize:12, fontWeight:700, cursor:"pointer"}}>Revoke Access</button>
                            )}
                         </div>
                       ))}
                    </div>
                    
                    <div style={{marginTop:32, background:"rgba(var(--theme-primary-rgb), 0.05)", padding:20, borderRadius:16, border:"1px dashed var(--theme-primary)"}}>
                       <h4 style={{margin:0, fontSize:13, fontWeight:800}}>Push New Admin</h4>
                       <div style={{display:"flex", gap:10, marginTop:12}}>
                          <input id="new_admin_email" placeholder="Email user..." style={{flex:1, padding:"10px 14px", borderRadius:10, border:"1px solid #DDD", fontSize:13}} />
                          <button onClick={async () => {
                            const email = (document.getElementById("new_admin_email") as HTMLInputElement).value;
                            const target = users.find(u=>u.email === email);
                            if (target) {
                               await updateDoc(doc(db, "users", target.id), { role: "admin" });
                               (document.getElementById("new_admin_email") as HTMLInputElement).value = "";
                            } else {
                               alert("User tidak ditemukan.");
                            }
                          }} style={{background:"var(--theme-primary)", color:"white", border:"none", padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer"}}>Grant Admin</button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* PLANS & PROMOS */}
            {activeTab === "plans" && (
              <motion.div key="plans" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32}}>
                   <div>
                     <h2 style={{fontSize:28, fontWeight:800, margin:0, letterSpacing:"-1px"}}>Paket & Promosi</h2>
                     <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", marginTop:4}}>Konfigurasi skema pricing dan kode diskon marketing.</p>
                   </div>
                   <div style={{display:"flex", gap:12}}>
                     <button onClick={() => { setEditingPromo({}); setShowPromoModal(true); }} style={{background:"white", border:"1px solid #DDD", padding:"10px 20px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8}}>
                       <Tag size={16}/> New Promo
                     </button>
                     <button onClick={() => { setEditingPlan({}); setShowPlanModal(true); }} style={{background:"var(--theme-primary)", color:"white", border:"none", padding:"10px 24px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8}}>
                       <Package size={16}/> New Plan
                     </button>
                   </div>
                </div>

                <h3 style={{fontSize:18, fontWeight:800, marginBottom:20}}>Subscription Plans</h3>
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:20, marginBottom:40}}>
                  {plans.map(p => (
                    <div key={p.id} style={CARD({padding:24, borderRadius:24, border:"1px solid #EEE", borderTop:`4px solid ${p.popular ? 'var(--theme-primary)' : '#EEE'}`})}>
                       <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                          <div>
                            <div style={{fontSize:18, fontWeight:800}}>{p.name}</div>
                            <div style={{fontSize:12, color:"#999", marginTop:4}}>{p.desc}</div>
                          </div>
                          {p.popular && <span style={{background:"rgba(var(--theme-primary-rgb), 0.1)", color:"var(--theme-primary)", fontSize:10, fontWeight:800, padding:"4px 8px", borderRadius:6, textTransform:"uppercase"}}>Popular</span>}
                       </div>
                       <div style={{margin:"20px 0"}}>
                          <div style={{fontSize:24, fontWeight:800, color:"var(--theme-primary)"}}>Rp{p.price.toLocaleString()}</div>
                          <div style={{fontSize:11, color:"rgba(0,0,0,0.3)"}}>{p.addMonths} Bulan Akses Penuh</div>
                       </div>
                       <div style={{display:"flex", gap:10}}>
                          <button onClick={() => { setEditingPlan(p); setShowPlanModal(true); }} style={{flex:1, padding:10, borderRadius:12, border:"1px solid #EEE", background:"white", fontWeight:700, cursor:"pointer", fontSize:12}} className="hover-bg-light">Edit Settings</button>
                          <button onClick={() => setDeletingItem({id: p.id, type:"plans", name: p.name})} style={{background:"rgba(156,43,78,0.1)", color:"#9C2B4E", border:"1px solid rgba(156,43,78,0.1)", padding:10, borderRadius:12, fontWeight:700, cursor:"pointer", fontSize:12}}>Delete</button>
                       </div>
                    </div>
                  ))}
                  {plans.length === 0 && (
                    <div style={{gridColumn:"1/-1", padding:60, textAlign:"center", background:"white", borderRadius:24, border:"1px dashed #CCC", color:"#999"}}>Klik "+ New Plan" untuk membuat paket langganan.</div>
                  )}
                </div>

                <h3 style={{fontSize:18, fontWeight:800, marginBottom:20}}>Coupon Codes</h3>
                <div style={CARD({borderRadius:20, overflow:"hidden", border:"1px solid #EEE"})}>
                   <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                      <thead style={{background:"#FAFAFA"}}>
                        <tr>
                          <th style={{padding:16, textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase", color:"#999"}}>Kode Promo</th>
                          <th style={{padding:16, textAlign:"center", fontSize:11, fontWeight:700, textTransform:"uppercase", color:"#999"}}>Diskon</th>
                          <th style={{padding:16, textAlign:"center", fontSize:11, fontWeight:700, textTransform:"uppercase", color:"#999"}}>Pemakaian</th>
                          <th style={{padding:16, textAlign:"center", fontSize:11, fontWeight:700, textTransform:"uppercase", color:"#999"}}>Validity Period</th>
                          <th style={{padding:16, textAlign:"center", fontSize:11, fontWeight:700, textTransform:"uppercase", color:"#999"}}>Status</th>
                          <th style={{padding:16, textAlign:"right"}}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {promosList.map(p => (
                          <tr key={p.id} style={{borderBottom:"1px solid #FAFAFA"}}>
                             <td style={{padding:16, fontWeight:800}}>{p.code}</td>
                             <td style={{padding:16, textAlign:"center"}}>
                               <div style={{background:"rgba(76,175,80,0.1)", color:"#4CAF50", padding:"4px 10px", borderRadius:12, fontWeight:800, display:"inline-block"}}>
                                 {p.type === "percent" ? `${p.value}%` : fmtRp(p.value)}
                               </div>
                             </td>
                             <td style={{padding:16, textAlign:"center", fontWeight:700}}>{p.usageCount || 0}x</td>
                             <td style={{padding:16, textAlign:"center"}}>
                                <div style={{fontSize:10, color:"#666", fontWeight:600}}>
                                  {p.startDate ? `📅 From: ${p.startDate}` : "⚡ Immediate"} <br/>
                                  {p.endDate ? `🏁 To: ${p.endDate}` : "♾ No Expiry"}
                                </div>
                             </td>
                             <td style={{padding:16, textAlign:"center"}}>
                                <button onClick={()=>togglePromo(p)} style={{background:"none", border:"none", cursor:"pointer"}}>
                                  {p.isActive ? <ToggleRight color="#4CAF50" size={24}/> : <ToggleLeft color="#CCC" size={24}/>}
                                </button>
                             </td>
                             <td style={{padding:16, textAlign:"right"}}>
                                <div style={{display:"flex", gap:10, justifyContent:"flex-end"}}>
                                   <button onClick={() => { setEditingPromo(p); setShowPromoModal(true); }} style={{color:"var(--theme-primary)", background:"transparent", border:"none", fontWeight:800, cursor:"pointer", fontSize:12}}>Edit</button>
                                   <button onClick={() => setDeletingItem({id: p.id, type:"promos", name: p.code})} style={{color:"#9C2B4E", background:"transparent", border:"none", fontWeight:800, cursor:"pointer", fontSize:12}}>Delete</button>
                                </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   {promosList.length === 0 && (
                     <div style={{padding:40, textAlign:"center", color:"#999"}}>Belum ada kode promo aktif.</div>
                   )}
                </div>
              </motion.div>
            )}

            {/* SUPPORT & TICKETS */}
            {activeTab === "support" && (
              <motion.div key="support" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{height:"calc(100vh - 220px)", display:"flex", flexDirection:"column"}}>
                 <div style={{marginBottom:24}}>
                    <h2 style={{fontSize:28, fontWeight:800, margin:0, letterSpacing:"-1px"}}>Support Central</h2>
                    <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", marginTop:4}}>Tangani keluhan dan masukan pengguna melalui sistem tiket.</p>
                 </div>

                 <div style={{display:"flex", flex:1, gap:24, overflow:"hidden"}}>
                    <div style={{width:350, display:"flex", flexDirection:"column", gap:12, overflowY:"auto", paddingRight:4}}>
                       {tickets.map(t => (
                         <div key={t.id} onClick={()=>setSelectedTicket(t)} 
                           style={{
                             padding:16, background:"white", borderRadius:20, cursor:"pointer", transition:"all 0.2s",
                             border: selectedTicket?.id === t.id ? "2px solid var(--theme-primary)" : "1px solid #EEE",
                             boxShadow: selectedTicket?.id === t.id ? "0 4px 20px rgba(var(--theme-primary-rgb), 0.15)" : "none"
                           }}>
                            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                               <div style={{fontSize:11, fontWeight:800, color:"rgba(0,0,0,0.3)"}}>#{t.id.slice(-6).toUpperCase()}</div>
                               <div style={{fontSize:10, fontWeight:700, background: t.status==="open"?"#E3F2FD":"#F5F5F5", color: t.status==="open"?"#2196F3":"#666", padding:"2px 8px", borderRadius:6, textTransform:"uppercase"}}>{t.status}</div>
                            </div>
                            <div style={{fontSize:14, fontWeight:800, marginBottom:4}}>{t.subject}</div>
                            <div style={{fontSize:12, color:"rgba(0,0,0,0.5)"}}>{t.userEmail}</div>
                            <div style={{fontSize:10, color:"#999", marginTop:12, display:"flex", alignItems:"center", gap:4}}>
                               <Clock size={10}/> {new Date(t.updatedAt||0).toLocaleString("id-ID", {dateStyle:"short", timeStyle:"short"})}
                            </div>
                         </div>
                       ))}
                       {tickets.length === 0 && (
                         <div style={{padding:40, textAlign:"center", background:"#FFF", borderRadius:20, border:"1px dashed #DDD", color:"#999"}}>No tickets found.</div>
                       )}
                    </div>

                    <div style={{flex:1, background:"white", borderRadius:24, border:"1px solid #EEE", display:"flex", flexDirection:"column", overflow:"hidden"}}>
                        {selectedTicket ? (
                          <div style={{display:"flex", flexDirection:"column", height:"100%"}}>
                             <div style={{padding:"20px 24px", borderBottom:"1px solid #F5F5F5", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                                <div>
                                   <div style={{fontSize:18, fontWeight:800}}>{selectedTicket.subject}</div>
                                   <div style={{fontSize:12, color:"#999"}}>{selectedTicket.userEmail}</div>
                                </div>
                                <div style={{display:"flex", gap:10}}>
                                   <button onClick={async () => {
                                      await updateDoc(doc(db, "tickets", selectedTicket.id), { status: selectedTicket.status === "closed" ? "open" : "closed" });
                                   }} style={{background:"none", border:"1px solid #EEE", padding:"8px 16px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer"}}>{selectedTicket.status === "closed" ? "Reopen Ticket" : "Close Ticket"}</button>
                                </div>
                             </div>

                             <div style={{flex:1, padding:24, overflowY:"auto", display:"flex", flexDirection:"column", gap:16, background:"#FDFDFD"}}>
                                {(selectedTicket.messages || []).map((m: any, i: number) => (
                                  <div key={i} style={{alignSelf: m.sender === "admin" ? "flex-end" : "flex-start", maxWidth:"80%"}}>
                                     <div style={{fontSize:10, fontWeight:700, color:"#999", marginBottom:4, textAlign: m.sender==="admin" ? "right" : "left"}}>
                                        {m.sender === "admin" ? "Admin Response" : "User Message"} • {new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                     </div>
                                     <div style={{
                                        padding:"12px 16px", borderRadius:16, fontSize:13, lineHeight:1.5,
                                        background: m.sender === "admin" ? "var(--theme-primary)" : "white",
                                        color: m.sender === "admin" ? "white" : "black",
                                        border: m.sender === "admin" ? "none" : "1px solid #EEE",
                                        boxShadow: m.sender === "admin" ? "0 4px 12px rgba(var(--theme-primary-rgb), 0.2)" : "0 2px 4px rgba(0,0,0,0.02)"
                                     }}>
                                        {m.text}
                                     </div>
                                  </div>
                                ))}
                             </div>

                             <div style={{padding:20, background:"white", borderTop:"1px solid #F5F5F5"}}>
                                <div style={{display:"flex", gap:12}}>
                                   <textarea id="ticket_reply" placeholder="Tulis balasan support di sini..." 
                                      style={{flex:1, height:80, padding:16, border:"1px solid #EEE", borderRadius:16, fontSize:13, outline:"none", resize:"none"}} />
                                   <button onClick={handleReply} 
                                      style={{width:100, background:"var(--theme-primary)", color:"white", border:"none", borderRadius:16, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", fontWeight:800, cursor:"pointer"}}>
                                      KIRIM REPLY
                                   </button>
                                </div>
                             </div>
                          </div>
                        ) : (
                          <div style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, opacity:0.3}}>
                             <LifeBuoy size={64}/>
                             <div style={{fontWeight:800}}>Pilih tiket untuk membaca percakapan</div>
                          </div>
                        )}
                    </div>
                 </div>
              </motion.div>
            )}

            {/* SETTINGS */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{maxWidth:600}}>
                 <h2 style={{fontSize:28, fontWeight:800, marginBottom:24, letterSpacing:"-1px"}}>System Settings</h2>
                 
                 <div style={{display:"flex", flexDirection:"column", gap:20}}>
                    <div style={CARD({padding:24, borderRadius:24})}>
                       <h3 style={{fontSize:16, fontWeight:800, marginBottom:20, display:"flex", alignItems:"center", gap:8}}><Globe size={18}/> App Toggles</h3>
                       <div style={{display:"flex", flexDirection:"column", gap:16}}>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div>
                                <div style={{fontSize:14, fontWeight:700}}>Maintenance Mode</div>
                                <div style={{fontSize:12, color:"#999"}}>Tampilkan halaman maintenance ke semua user.</div>
                             </div>
                             <button onClick={()=>updateSystemConfig({maintenanceMode: !systemSettings.maintenanceMode})} style={{background:"transparent", border:"none", cursor:"pointer"}}>
                                {systemSettings.maintenanceMode ? <ToggleRight size={32} color="#9C2B4E"/> : <ToggleLeft size={32} color="#CCC"/>}
                             </button>
                          </div>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div>
                                <div style={{fontSize:14, fontWeight:700}}>Registrasi Baru</div>
                                <div style={{fontSize:12, color:"#999"}}>Izinkan pengguna baru untuk mendaftar akun.</div>
                             </div>
                             <button onClick={()=>updateSystemConfig({allowRegistration: !systemSettings.allowRegistration})} style={{background:"transparent", border:"none", cursor:"pointer"}}>
                                {systemSettings.allowRegistration ? <ToggleRight size={32} color="#4CAF50"/> : <ToggleLeft size={32} color="#CCC"/>}
                             </button>
                          </div>
                       </div>
                    </div>

                    <div style={CARD({padding:24, borderRadius:24})}>
                       <h3 style={{fontSize:16, fontWeight:800, marginBottom:20, display:"flex", alignItems:"center", gap:8}}><Calendar size={18}/> Billing Logic</h3>
                       <div style={{display:"flex", flexDirection:"column", gap:16}}>
                          <div>
                             <div style={{fontSize:13, fontWeight:700, marginBottom:8}}>Masa Uji Coba (Hari)</div>
                             <input type="number" defaultValue={systemSettings.trialDays} 
                               onBlur={(e)=>updateSystemConfig({trialDays: Number(e.target.value)})}
                               style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                             <div style={{fontSize:11, color:"#999", marginTop:6}}>Default jumlah hari user baru mendapatkan akses PRO gratis.</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Plan Modal */}
        {showPlanModal && editingPlan && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)", padding:20}}>
            <motion.form initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} onSubmit={savePlan} style={{background:"white", padding:32, borderRadius:28, width:480, maxHeight:"90vh", overflowY:"auto"}}>
               <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
                  <h3 style={{fontSize:20, fontWeight:800}}>{editingPlan.id ? "Edit Plan Details" : "Create New Plan"}</h3>
                  <button type="button" onClick={()=>setShowPlanModal(false)} style={{background:"#F5F5F5", border:"none", padding:8, borderRadius:10, cursor:"pointer"}}><X size={20}/></button>
               </div>
               <div style={{display:"flex", flexDirection:"column", gap:16, marginBottom:24}}>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Nama Paket</label>
                    <input name="name" placeholder="Pro Monthly, etc" defaultValue={editingPlan.name} required style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                  </div>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Keterangan Singkat</label>
                    <input name="desc" placeholder="Best for professionals" defaultValue={editingPlan.desc} required style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                  </div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
                    <div>
                      <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Harga (Rp)</label>
                      <input name="price" type="number" placeholder="99000" defaultValue={editingPlan.price} required style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                    </div>
                    <div>
                      <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Harga Coret (Rp)</label>
                      <input name="originalPrice" type="number" placeholder="149000" defaultValue={editingPlan.originalPrice} style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                    </div>
                  </div>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Masa Aktif (Bulan)</label>
                    <input name="addMonths" type="number" placeholder="1" defaultValue={editingPlan.addMonths} required style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                  </div>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Fitur (Pisahkan baris baru)</label>
                    <textarea name="features" placeholder="Fitur 1\nFitur 2" defaultValue={editingPlan.features?.join("\n")} style={{width:"100%", height:120, padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14, resize:"none"}} />
                  </div>
                  <label style={{display:"flex", alignItems:"center", gap:8, cursor:"pointer"}}>
                    <input name="popular" type="checkbox" defaultChecked={editingPlan.popular} />
                    <span style={{fontSize:13, fontWeight:700}}>Tandai sebagai Paket Populer</span>
                  </label>
               </div>
               <div style={{display:"flex", gap:12}}>
                 <button type="submit" style={{flex:1, background:"var(--theme-primary)", color:"white", border:"none", padding:14, borderRadius:16, fontWeight:800, cursor:"pointer"}}>Simpan Perubahan</button>
               </div>
            </motion.form>
          </motion.div>
        )}

        {/* Promo Modal */}
        {showPromoModal && editingPromo && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)", padding:20}}>
            <motion.form initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} onSubmit={savePromo} style={{background:"white", padding:32, borderRadius:28, width:400}}>
               <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
                  <h3 style={{fontSize:20, fontWeight:800}}>Generate Code</h3>
                  <button type="button" onClick={()=>setShowPromoModal(false)} style={{background:"#F5F5F5", border:"none", padding:8, borderRadius:10, cursor:"pointer"}}><X size={20}/></button>
               </div>
               <div style={{display:"flex", flexDirection:"column", gap:16, marginBottom:24}}>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Kode Promo</label>
                    <input name="code" placeholder="DISKON77" defaultValue={editingPromo.code} required style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:16, fontWeight:800, letterSpacing:1}} />
                  </div>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Tipe Diskon</label>
                    <select name="type" defaultValue={editingPromo.type || "percent"} style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}}>
                      <option value="percent">Persentase (%)</option>
                      <option value="fixed">Nominal Tetap (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Nilai Potongan</label>
                    <input name="value" type="number" placeholder="10" defaultValue={editingPromo.value} required style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                  </div>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Target Pengguna</label>
                    <select name="targetType" defaultValue={editingPromo.targetType || "all"} style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}}>
                      <option value="all">Semua Pengguna</option>
                      <option value="first_timer">Hanya User Baru (Pertama Kali perpanjang setelah Trial)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Batas Pemakaian (0=Tanpa Batas)</label>
                    <input name="usageLimit" type="number" defaultValue={editingPromo.usageLimit || 0} style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                  </div>
                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                    <div>
                      <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Mulai Berlaku</label>
                      <input name="startDate" type="date" defaultValue={editingPromo.startDate} style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                    </div>
                    <div>
                      <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Berakhir Pada</label>
                      <input name="endDate" type="date" defaultValue={editingPromo.endDate} style={{width:"100%", padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                    </div>
                  </div>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"#999", textTransform:"uppercase", marginBottom:6}}>Syarat & Ketentuan (S&K)</label>
                    <textarea name="terms" placeholder="Tulis syarat voucher di sini..." defaultValue={editingPromo.terms} style={{width:"100%", height:80, padding:12, borderRadius:12, border:"1px solid #EEE", fontSize:13, resize:"none"}} />
                  </div>
               </div>
               <button type="submit" style={{width:"100%", background:"var(--theme-primary)", color:"white", border:"none", padding:14, borderRadius:16, fontWeight:800, cursor:"pointer"}}>Aktifkan Promo</button>
            </motion.form>
          </motion.div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingItem && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.7)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)"}}>
            <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} 
              style={{background:"white", borderRadius:32, padding:"40px", textAlign:"center", maxWidth:400, boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
              <div style={{width:80, height:80, background:"rgba(156,43,78,0.1)", borderRadius:30, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px"}}>
                <AlertCircle color="#9C2B4E" size={48} />
              </div>
              <h3 style={{fontSize:22, fontWeight:800, color:"#2C2016", margin:0, letterSpacing:"-0.5px"}}>Konfirmasi Hapus</h3>
              <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", margin:"16px 0 32px", lineHeight:1.6}}>
                Apakah Anda yakin ingin menghapus <b>{deletingItem.type}</b> dengan nama <br/>
                <span style={{color:"#9C2B4E", fontWeight:800}}>"{deletingItem.name}"</span>? <br/>
                Tindakan ini tidak bisa dibatalkan.
              </p>
              <div style={{display:"flex", gap:14}}>
                <button onClick={() => setDeletingItem(null)} 
                  style={{flex:1, padding:"16px", borderRadius:16, border:"1px solid #EEE", background:"white", fontWeight:800, fontSize:14, cursor:"pointer"}} 
                  className="hover-bg-light">Batal</button>
                <button onClick={async () => {
                   try {
                     await deleteDoc(doc(db, deletingItem.type, deletingItem.id));
                     setDeletingItem(null);
                   } catch(e:any) { 
                     setDeletingItem(null);
                     alert("Gagal menghapus: " + e.message); 
                   }
                }} style={{flex:1, background:"#9C2B4E", color:"white", border:"none", padding:"16px", borderRadius:16, fontWeight:800, fontSize:14, cursor:"pointer", boxShadow:"0 8px 16px rgba(156,43,78,0.2)"}}>Hapus Permanen</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
