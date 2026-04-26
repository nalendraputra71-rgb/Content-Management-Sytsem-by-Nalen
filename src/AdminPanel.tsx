import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Shield, Settings, Server, TrendingUp, CheckCircle, Activity, 
  Search, Edit2, CreditCard, RefreshCw, AlertCircle, FileText, Globe, 
  Bell, LifeBuoy, ToggleLeft, ToggleRight, ArrowUpRight, ArrowDownRight, 
  BarChart2, X, Download, MessageSquare
} from "lucide-react";
import { db, collection, getDocs, doc, updateDoc, setDoc, deleteDoc } from "./firebase";
import { fmt, B } from "./data";

export function AdminPanel({ userProfile, onLogout }: { userProfile: any, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setUsers(data as any[]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const [plans, setPlans] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);

  const fetchPlans = async () => {
    try {
      const snap = await getDocs(collection(db, "plans"));
      setPlans(snap.docs.map(d => ({id: d.id, ...d.data()})));
      const promoSnap = await getDocs(collection(db, "promos"));
      setPromos(promoSnap.docs.map(d => ({id: d.id, ...d.data()})));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (["users", "dashboard", "finance", "admins"].includes(activeTab)) {
      fetchUsers();
    }
    if (activeTab === "plans") {
      fetchPlans();
    }
  }, [activeTab]);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

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
       if (editingPlan.id) {
         await updateDoc(doc(db, "plans", editingPlan.id), data);
       } else {
         await setDoc(doc(db, "plans", data.name!.toString().toLowerCase().replace(/\s+/g,'')), data);
       }
       setShowPlanModal(false);
       fetchPlans();
     } catch (e: any) {
       alert(e.message);
     }
  };

  const handleUpdateRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      fetchUsers();
      if(selectedUser?.id === uid) setSelectedUser({...selectedUser, role: newRole});
    } catch (e) { console.error(e); }
  };

  const handleUpdatePlan = async (uid: string, newPlan: string, daysToAdd: number = 30) => {
    try {
      const activeUntil = new Date();
      activeUntil.setDate(activeUntil.getDate() + daysToAdd);
      await updateDoc(doc(db, "users", uid), { plan: newPlan, activeUntil: activeUntil.toISOString() });
      fetchUsers();
      if(selectedUser?.id === uid) setSelectedUser({...selectedUser, plan: newPlan, activeUntil: activeUntil.toISOString()});
    } catch (e) { console.error(e); }
  };

  const toggleUserFeature = async (uid: string, feature: string, currentValue: boolean) => {
    try {
      const features = selectedUser?.features || {};
      const newFeatures = { ...features, [feature]: !currentValue };
      await updateDoc(doc(db, "users", uid), { features: newFeatures });
      setSelectedUser({...selectedUser, features: newFeatures});
    } catch (e) { console.error(e); }
  };

  const isAdminUser = userProfile?.role === "admin" || userProfile?.email?.toLowerCase() === "nalendraputra71@gmail.com";
  if (!userProfile || !isAdminUser) {
    return (
      <div style={{flex: 1, display:"flex", alignItems:"center", justifyContent:"center", color:"red", fontSize: 16, fontWeight: 700}}>
        Akses Ditolak: Anda bukan Admin.
      </div>
    );
  }

  const [dashboardDateRange, setDashboardDateRange] = useState({ 
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear() 
  });
  const [financeDateRange, setFinanceDateRange] = useState({
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear() 
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [promosList, setPromosList] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    let unsubs: any[] = [];
    import("./firebase").then(({ db, collection, onSnapshot, query }) => {
      if (activeTab === "finance") {
         unsubs.push(onSnapshot(collection(db, "transactions"), snap => {
            setTransactions(snap.docs.map(d=>({id: d.id, ...d.data()})));
         }, err => console.error("Transactions onSnapshot error", err)));
      }
      if (activeTab === "plans") {
         unsubs.push(onSnapshot(collection(db, "promos"), snap => {
            setPromosList(snap.docs.map(d => ({id: d.id, ...d.data()})));
         }, err => console.error("Promos onSnapshot error", err)));
      }
      if (activeTab === "support") {
         unsubs.push(onSnapshot(query(collection(db, "tickets")), snap => {
            const data = snap.docs.map(d=>({id: d.id, ...d.data()}));
            setTickets(data);
            setLoadingTickets(false);
            if (selectedTicket) {
               const current = data.find((d: any) => d.id === selectedTicket.id);
               if (current) setSelectedTicket(current);
            }
         }, err => {
            console.error("Tickets onSnapshot error", err);
            setLoadingTickets(false);
         }));
      }
    });
    return () => { unsubs.forEach(u => u()); };
  }, [activeTab, selectedTicket]);
  
  const filteredUsers = users.filter((u:any) => (u.email || "").toLowerCase().includes(searchEmail.toLowerCase()));
  const activePaidUsers = users.filter(u => u.plan === "pro" && new Date(u.activeUntil) > new Date()).length;
  // Ini contoh perhitungan sederhana, idealnya dari log transaksi sesuai rentang waktu:
  const trialUsers = users.filter(u => u.plan === "trial").length;
  const mrr = activePaidUsers * 125000; // Asumsi harga core plan Rp125.000

  const TABS = [
    { id: "dashboard", lb: "Dashboard", ic: <Activity size={18}/> },
    { id: "users", lb: "Manajemen User", ic: <Users size={18}/> },
    { id: "admins", lb: "Super Admin", ic: <Shield size={18}/> },
    { id: "finance", lb: "Keuangan & Billing", ic: <CreditCard size={18}/> },
    { id: "plans", lb: "Paket & Promo", ic: <FileText size={18}/> },
    { id: "xendit", lb: "Xendit & Webhook", ic: <Globe size={18}/> },
    { id: "notifications", lb: "Push Notification", ic: <Bell size={18}/> },
    { id: "support", lb: "Support & Tiket", ic: <LifeBuoy size={18}/> },
    { id: "settings", lb: "Pengaturan Sistem", ic: <Settings size={18}/> }
  ];

  const handleAddPromo = async () => {
     const code = prompt("Masukkan kode promo (ex: MERDEKA50):");
     if (!code) return;
     const discount = prompt("Masukkan nominal diskon/percent:");
     if (!discount) return;
     try {
       const { db, doc, setDoc } = await import("./firebase");
       await setDoc(doc(db, "promos", code.toUpperCase()), {
          code: code.toUpperCase(),
          discount: discount,
          usageCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
       });
     } catch(e:any) { alert(e.message); }
  };

  const togglePromo = async (p: any) => {
    try {
       const { db, doc, updateDoc } = await import("./firebase");
       await updateDoc(doc(db, "promos", p.id), { isActive: !p.isActive });
    } catch(e:any) { alert(e.message); }
  };

  const handleReply = async () => {
     const text = (document.getElementById("ticket_reply") as HTMLTextAreaElement).value;
     if(!text || !selectedTicket) return;
     try {
        const { doc, updateDoc, db } = await import("./firebase");
        await updateDoc(doc(db, "tickets", selectedTicket.id), {
           messages: [...(selectedTicket.messages||[]), { sender: "admin", text, timestamp: new Date().toISOString() }],
           status: "open",
           readByUser: false,
           updatedAt: new Date().toISOString()
        });
        (document.getElementById("ticket_reply") as HTMLTextAreaElement).value = "";
     } catch(e:any) { alert(e.message); }
  };

  return (
    <div style={{flex:1, display:"flex", flexDirection:"column", height:"100vh", background:"#FAF7F2"}}>
      {/* Header */}
      <div style={{background:"#2C2016", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", color:"white"}}>
        <div style={{display:"flex", alignItems:"center", gap: 12}}>
          <Shield size={24} color="#FF6B00" />
          <div>
            <h1 style={{margin:0, fontSize:18, fontWeight:800, letterSpacing:"-0.5px"}}>Admin Panel CMS</h1>
            <div style={{fontSize:11, color:"rgba(255,255,255,0.6)"}}>Superadmin: {userProfile?.email}</div>
          </div>
        </div>
        <div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", padding:"6px 12px", color:"white", borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:700}}>Keluar Admin</button>
        </div>
      </div>

      <div style={{display:"flex", flex:1, overflow:"hidden"}}>
        {/* Sidebar Mini */}
        <div style={{width: 220, background:"white", borderRight:"1px solid rgba(44,32,22,0.1)", display:"flex", flexDirection:"column", padding: "16px 12px", gap: 8, overflowY:"auto"}}>
          {TABS.map(t => (
            <button 
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSelectedUser(null); }}
              style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer",
                background: activeTab === t.id ? "rgba(255,107,0,0.1)" : "transparent",
                color: activeTab === t.id ? "#FF6B00" : "rgba(44,32,22,0.6)",
                border: "none", textAlign:"left", transition:"all 0.2s"
              }}
            >
              {t.ic} {t.lb}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{flex:1, padding: 24, overflowY:"auto"}}>
          
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
                <h2 style={{fontSize:22, fontWeight:800, color:"#2C2016", margin:0}}>Ringkasan Eksekutif</h2>
                <div style={{display:"flex", gap:8}}>
                  <select value={dashboardDateRange.month} onChange={(e)=>setDashboardDateRange(p=>({...p, month: parseInt(e.target.value)}))} style={{padding:"8px 12px", borderRadius:8, border:"1px solid rgba(44,32,22,0.1)", background:"white"}}>
                    {Array.from({length:12}).map((_,i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
                  </select>
                  <select value={dashboardDateRange.year} onChange={(e)=>setDashboardDateRange(p=>({...p, year: parseInt(e.target.value)}))} style={{padding:"8px 12px", borderRadius:8, border:"1px solid rgba(44,32,22,0.1)", background:"white"}}>
                    {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24}}>
                <div style={{background:"white", borderRadius:12, padding:20, border:"1px solid rgba(44,32,22,0.05)", boxShadow:"0 2px 8px rgba(0,0,0,0.02)"}}>
                   <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700, marginBottom:8}}>Estimasi MRR</div>
                   <div style={{fontSize:28, fontWeight:800, color:"#2C2016"}}>Rp {fmt(mrr)}</div>
                   <div style={{fontSize:11, color:"#2D7A5E", display:"flex", alignItems:"center", gap:4, marginTop:8}}><ArrowUpRight size={12}/> +5.2% dari bulan lalu</div>
                </div>
                <div style={{background:"white", borderRadius:12, padding:20, border:"1px solid rgba(44,32,22,0.05)", boxShadow:"0 2px 8px rgba(0,0,0,0.02)"}}>
                   <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700, marginBottom:8}}>Total User Berbayar</div>
                   <div style={{fontSize:28, fontWeight:800, color:"#2C2016"}}>{activePaidUsers}</div>
                   <div style={{fontSize:11, color:"#2D7A5E", display:"flex", alignItems:"center", gap:4, marginTop:8}}><ArrowUpRight size={12}/> +12 user baru</div>
                </div>
                <div style={{background:"white", borderRadius:12, padding:20, border:"1px solid rgba(44,32,22,0.05)", boxShadow:"0 2px 8px rgba(0,0,0,0.02)"}}>
                   <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700, marginBottom:8}}>User Free Trial</div>
                   <div style={{fontSize:28, fontWeight:800, color:"#2C2016"}}>{trialUsers}</div>
                   <div style={{fontSize:11, color:"rgba(44,32,22,0.5)", marginTop:8}}>Potensi konversi bulan ini</div>
                </div>
                <div style={{background:"white", borderRadius:12, padding:20, border:"1px solid rgba(44,32,22,0.05)", boxShadow:"0 2px 8px rgba(0,0,0,0.02)"}}>
                   <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700, marginBottom:8}}>Churn Rate</div>
                   <div style={{fontSize:28, fontWeight:800, color:"#9C2B4E"}}>2.4%</div>
                   <div style={{fontSize:11, color:"#9C2B4E", display:"flex", alignItems:"center", gap:4, marginTop:8}}><ArrowDownRight size={12}/> -0.5% dari bulan lalu</div>
                </div>
              </div>
              
              <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16}}>
                 <div style={{background:"white", borderRadius:12, padding:20, border:"1px solid rgba(44,32,22,0.05)"}}>
                    <h3 style={{fontSize:14, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8}}><BarChart2 size={16}/> Grafik Pendapatan 30 Hari Terakhir</h3>
                    <div style={{height: 200, background:"#FAFAFA", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(44,32,22,0.3)", fontSize:12, border:"1px dashed rgba(44,32,22,0.1)"}}>
                       [Visualisasi Grafik Pendapatan Harian]
                    </div>
                 </div>
                 <div style={{background:"white", borderRadius:12, padding:20, border:"1px solid rgba(44,32,22,0.05)"}}>
                    <h3 style={{fontSize:14, fontWeight:700, marginBottom:16}}>Aktivitas Terkini</h3>
                    <div style={{display:"flex", flexDirection:"column", gap:12}}>
                       {["Pembaruan plan user john@doe.com ke PRO", "Invoice #INV-001 lunas via QRIS", "Tiket support #224 menanti balasan", "Registrasi user baru sarah@mail.com"].map((a,i) => (
                         <div key={i} style={{fontSize:12, paddingBottom:12, borderBottom:"1px solid rgba(44,32,22,0.05)"}}>
                           <span style={{color:"#FF6B00", fontWeight:700}}>•</span> {a}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* MANAJEMEN USER */}
          {activeTab === "users" && !selectedUser && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:20}}>
                <div>
                  <h2 style={{fontSize:22, fontWeight:800, marginBottom:4, color:"#2C2016"}}>Manajemen User</h2>
                  <p style={{fontSize:13, color:"rgba(44,32,22,0.5)", margin:0}}>Total {users.length} user terdaftar.</p>
                </div>
                <div style={{display:"flex", alignItems:"center", background:"white", padding:"8px 12px", borderRadius:10, border:"1px solid rgba(44,32,22,0.1)", width: 260}}>
                  <Search size={16} color="rgba(44,32,22,0.4)" style={{marginRight:8}}/>
                  <input placeholder="Cari email atau nama..." value={searchEmail} onChange={e=>setSearchEmail(e.target.value)} style={{border:"none", outline:"none", flex:1, fontSize:12, background:"transparent"}} />
                </div>
              </div>

              {loading ? (
                <div style={{textAlign:"center", padding:40, color:"rgba(44,32,22,0.5)", fontSize:13}}>Sedang memuat data...</div>
              ) : (
                <div style={{background:"white", borderRadius:12, border:"1px solid rgba(44,32,22,0.05)", overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.02)"}}>
                  <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
                    <thead style={{background:"#FAFAFA", borderBottom:"1px solid rgba(44,32,22,0.05)"}}>
                      <tr>
                        <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(44,32,22,0.5)", fontWeight:700}}>User Info</th>
                        <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Tgl Daftar</th>
                        <th style={{padding:"12px 16px", textAlign:"center", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Status Email</th>
                        <th style={{padding:"12px 16px", textAlign:"center", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Plan</th>
                        <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Aktif Sampai</th>
                        <th style={{padding:"12px 16px", textAlign:"center", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u:any) => {
                         const isExpired = u.activeUntil ? new Date(u.activeUntil) < new Date() : true;
                         return (
                          <tr key={u.id} style={{borderBottom:"1px solid rgba(44,32,22,0.03)"}}>
                            <td style={{padding:"12px 16px"}}>
                               <div style={{fontWeight:700, color:"#2C2016"}}>{u.fullName || "Tanpa Nama"}</div>
                               <div style={{color:"rgba(44,32,22,0.5)", fontSize:11}}>@{u.username} • {u.email}</div>
                            </td>
                            <td style={{padding:"12px 16px"}}>
                               <div style={{color:"#2C2016", fontSize:12, fontWeight:500}}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID") : "-"}</div>
                               <div style={{color:"rgba(44,32,22,0.5)", fontSize:11}}>{u.createdAt ? new Date(u.createdAt).toLocaleTimeString("id-ID", {hour:'2-digit', minute:'2-digit'}) : ""}</div>
                            </td>
                            <td style={{padding:"12px 16px", textAlign:"center"}}>
                               {u.emailVerified ? <span style={{color:"#2D7A5E", fontWeight:700}}>Terverifikasi</span> : <span style={{color:"#9C2B4E", fontWeight:700}}>Belum</span>}
                            </td>
                            <td style={{padding:"12px 16px", textAlign:"center"}}>
                              <span style={{background:u.plan==="pro"?"#C4622D":"#EBEBEB", color:u.plan==="pro"?"white":"#2C2016", padding:"4px 8px", borderRadius:4, fontSize:10, fontWeight:800}}>
                                {(u.plan||"").toUpperCase()}
                              </span>
                            </td>
                            <td style={{padding:"12px 16px", color:isExpired?"#9C2B4E":"#2C2016", fontWeight:isExpired?700:500}}>
                               {u.activeUntil ? new Date(u.activeUntil).toLocaleDateString('id-ID') : "-"}
                            </td>
                            <td style={{padding:"12px 16px", textAlign:"center", display:"flex", gap:8, justifyContent:"center"}}>
                               <button onClick={() => setSelectedUser(u)} style={{background:"#FAFAFA", border:"1px solid rgba(44,32,22,0.1)", padding:"6px 12px", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", color:"#2C2016"}}>
                                 Detail Akses
                               </button>
                               <button onClick={async () => {
                                  if (confirm(`Apakah Anda yakin ingin menghapus user ${u.email} secara permanen? Data user ini akan hilang dari database.`)) {
                                     try {
                                        await deleteDoc(doc(db, "users", u.id));
                                        alert("User berhasil dihapus");
                                        fetchUsers();
                                     } catch (e:any) {
                                        alert("Gagal menghapus: " + e.message);
                                     }
                                  }
                               }} style={{background:"#FDF0EB", border:"1px solid rgba(196,98,45,0.15)", padding:"6px 12px", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", color:"#9C2B4E"}}>
                                 Hapus
                               </button>
                            </td>
                          </tr>
                         )
                      })}
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan={5} style={{textAlign:"center", padding:20, color:"rgba(44,32,22,0.5)", fontSize:13}}>User tidak ditemukan.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* USER DETAIL VIEW */}
          {activeTab === "users" && selectedUser && (
            <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}}>
              <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:24, cursor:"pointer", color:"rgba(44,32,22,0.5)", fontSize:13, fontWeight:600}} onClick={() => setSelectedUser(null)}>
                <CheckCircle size={14} style={{transform:"rotate(180deg)"}} /> Kembali ke Daftar User
              </div>
              
              <div style={{display:"flex", gap:20}}>
                 {/* Profil Info & Paket */}
                 <div style={{flex: 1, display:"flex", flexDirection:"column", gap:16}}>
                    <div style={{background:"white", borderRadius:12, padding:24, border:"1px solid rgba(44,32,22,0.05)"}}>
                       <div style={{display:"flex", alignItems:"center", gap:16, marginBottom:20}}>
                          <img src={selectedUser.avatar} alt="av" style={{width:60, height:60, borderRadius:30}} />
                          <div>
                            <div style={{fontSize:18, fontWeight:800, color:"#2C2016"}}>{selectedUser.fullName || "-"}</div>
                            <div style={{fontSize:13, color:"rgba(44,32,22,0.5)"}}>{selectedUser.email}</div>
                          </div>
                       </div>
                       
                       <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24}}>
                          <div style={{background:"#FAFAFA", padding:12, borderRadius:8}}>
                             <div style={{fontSize:11, color:"rgba(44,32,22,0.5)", fontWeight:700, marginBottom:4}}>Status Paket Saat Ini</div>
                             <div style={{fontSize:14, fontWeight:700, color:"#FF6B00", textTransform:"uppercase"}}>{selectedUser.plan || "Trial"}</div>
                          </div>
                          <div style={{background:"#FAFAFA", padding:12, borderRadius:8}}>
                             <div style={{fontSize:11, color:"rgba(44,32,22,0.5)", fontWeight:700, marginBottom:4}}>Masa Aktif Berakhir</div>
                             <div style={{fontSize:14, fontWeight:700, color:new Date(selectedUser.activeUntil) < new Date() ? "#9C2B4E":"#2D7A5E"}}>
                               {selectedUser.activeUntil ? new Date(selectedUser.activeUntil).toLocaleDateString('id-ID') : "-"}
                             </div>
                          </div>
                       </div>
                       
                       <h4 style={{fontSize:13, fontWeight:700, marginBottom:12, color:"#2C2016"}}>Aksi Manajemen Paket</h4>
                       <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                          <button onClick={() => handleUpdatePlan(selectedUser.id, "pro", 30)} style={{...B(false), padding:"8px 12px", fontSize:11}}>+ Perpanjang 30 Hari (PRO)</button>
                          <button onClick={() => handleUpdatePlan(selectedUser.id, "trial", 7)} style={{...B(false), padding:"8px 12px", fontSize:11, background:"white", color:"#2C2016", border:"1px solid rgba(44,32,22,0.1)"}}>Reset 7 Hari Trial</button>
                          <button onClick={() => handleUpdatePlan(selectedUser.id, "free", -1)} style={{...B(false), padding:"8px 12px", fontSize:11, background:"#9C2B4E", color:"white"}}>Matikan Paket</button>
                       </div>
                    </div>

                    <div style={{background:"white", borderRadius:12, padding:24, border:"1px solid rgba(44,32,22,0.05)"}}>
                       <h3 style={{fontSize:14, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8}}><CreditCard size={16}/> Riwayat Transaksi Billing</h3>
                       <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", textAlign:"center", padding:"20px 0"}}>
                          Belum ada histori pembayaran untuk user ini.
                       </div>
                       {/* Placeholder jika ada: List invoice history via Xendit */}
                    </div>
                 </div>

                 {/* Feature Access Control */}
                 <div style={{width: 320, background:"white", borderRadius:12, border:"1px solid rgba(44,32,22,0.05)", flexShrink:0}}>
                    <div style={{padding:20, borderBottom:"1px solid rgba(44,32,22,0.05)"}}>
                      <h3 style={{fontSize:14, fontWeight:700, margin:0}}>Kontrol Akses Fitur</h3>
                      <div style={{fontSize:11, color:"rgba(44,32,22,0.5)", marginTop:4}}>Kustomisasi fitur yang aktif untuk {selectedUser.fullName}.</div>
                    </div>
                    <div style={{padding:20, display:"flex", flexDirection:"column", gap:16}}>
                       {[
                         {id:"workspaces", lb:"Manajemen Workspace", desc:"Bisa membuat >1 workspace"},
                         {id:"social_ig", lb:"Social Studio (Instagram)", desc:"Akses API posting Instagram"},
                         {id:"social_tiktok", lb:"Social Studio (TikTok)", desc:"Akses API posting TikTok"},
                         {id:"ai_report", lb:"AI Executive Summary", desc:"Generate report menggunakan Gemini"},
                         {id:"custom_pillars", lb:"Custom Content Pillars", desc:"Kustomisasi sistem pilar"}
                       ].map(f => {
                          const isActive = selectedUser.features ? selectedUser.features[f.id] !== false : true; // Default true if not set
                          return (
                            <div key={f.id} style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                               <div>
                                 <div style={{fontSize:12, fontWeight:700, color:"#2C2016"}}>{f.lb}</div>
                                 <div style={{fontSize:10, color:"rgba(44,32,22,0.4)"}}>{f.desc}</div>
                               </div>
                               <div onClick={() => toggleUserFeature(selectedUser.id, f.id, isActive)} style={{cursor:"pointer", color: isActive ? "#2D7A5E" : "rgba(44,32,22,0.2)"}}>
                                 {isActive ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
                               </div>
                            </div>
                          )
                       })}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* SUPER ADMIN MANAGEMENT */}
          {activeTab === "admins" && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <h2 style={{fontSize:22, fontWeight:800, marginBottom:20, color:"#2C2016"}}>Manajemen Super Admin</h2>
              
              <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:20}}>
                 <div>
                    <div style={{background:"white", borderRadius:12, padding:24, border:"1px solid rgba(44,32,22,0.05)", marginBottom:20}}>
                       <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
                          <h3 style={{fontSize:14, fontWeight:700, margin:0}}>Daftar Super Admin</h3>
                          <button onClick={async () => {
                              const promptEmail = prompt("Masukkan email user yang ingin dijadikan Super Admin:");
                              if (!promptEmail) return;
                              const targetUser = users.find(u => u.email?.toLowerCase() === promptEmail.toLowerCase());
                              if (targetUser) {
                                 const confirmInvite = confirm(`Jadikan ${targetUser.email} sebagai Super Admin? Mereka akan mendapatkan akses penuh ke panel ini.`);
                                 if (confirmInvite) {
                                    try {
                                       await updateDoc(doc(db, "users", targetUser.id), { role: "admin" });
                                       alert(`${targetUser.email} berhasil diundang sebagai Super Admin.`);
                                       fetchUsers();
                                    } catch(e:any) { alert("Gagal mengundang: " + e.message); }
                                 }
                              } else {
                                 alert("User tidak ditemukan dalam database. Mereka harus membuat akun terlebih dahulu.");
                              }
                          }} style={{background:"#2D7A5E", color:"white", border:"none", padding:"6px 12px", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer"}}>+ Undang Admin</button>
                       </div>
                       
                       <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
                          <thead style={{background:"#FAFAFA", borderBottom:"1px solid rgba(44,32,22,0.05)"}}>
                            <tr>
                              <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Email / Nama</th>
                              <th style={{padding:"12px 16px", textAlign:"center", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Status</th>
                              <th style={{padding:"12px 16px", textAlign:"center", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.filter(u => u.role === "admin" || u.email?.toLowerCase() === "nalendraputra71@gmail.com").map((u:any) => (
                              <tr key={u.id} style={{borderBottom:"1px solid rgba(44,32,22,0.03)"}}>
                                <td style={{padding:"12px 16px"}}>
                                   <div style={{fontWeight:700, color:"#2C2016"}}>{u.fullName || "Tanpa Nama"}</div>
                                   <div style={{color:"rgba(44,32,22,0.5)", fontSize:11}}>{u.email}</div>
                                </td>
                                <td style={{padding:"12px 16px", textAlign:"center"}}>
                                   <span style={{background:"#C4622D", color:"white", padding:"4px 8px", borderRadius:4, fontSize:10, fontWeight:800}}>AKTIF</span>
                                </td>
                                <td style={{padding:"12px 16px", textAlign:"center"}}>
                                   {u.email !== userProfile?.email && u.email?.toLowerCase() !== "nalendraputra71@gmail.com" && (
                                     <button onClick={async () => {
                                        if (confirm(`Apakah Anda yakin ingin mencabut akses admin dari ${u.email}?`)) {
                                           try {
                                              await updateDoc(doc(db, "users", u.id), { role: "user" });
                                              fetchUsers();
                                           } catch(e:any) { alert(e.message); }
                                        }
                                     }} style={{background:"transparent", border:"1px solid #9C2B4E", color:"#9C2B4E", borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer"}}>Copot</button>
                                   )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
                 
                 <div>
                    <div style={{background:"white", borderRadius:12, padding:24, border:"1px solid rgba(44,32,22,0.05)"}}>
                       <h3 style={{fontSize:14, fontWeight:700, marginBottom:16}}>Keamanan Akun Saya</h3>
                       <div style={{fontSize:12, color:"rgba(44,32,22,0.6)", marginBottom:16, lineHeight:1.5}}>
                          Anda dapat mengubah data diri dan kredensial Anda, serta memicu verifikasi keamanan melalui email.
                       </div>
                       
                       <label style={{fontSize:12, fontWeight:700, marginBottom:6, display:"block"}}>Username Admin</label>
                       <div style={{display:"flex", gap:8, marginBottom:16}}>
                          <input id="admin_username_input" defaultValue={userProfile?.username} style={{flex:1, padding:10, borderRadius:8, border:"1px solid rgba(44,32,22,0.1)", fontSize:12}} />
                          <button onClick={async () => {
                             const el = document.getElementById("admin_username_input") as HTMLInputElement;
                             if(el) {
                                try {
                                  await updateDoc(doc(db, "users", userProfile.uid), { username: el.value });
                                  alert("Username berhasil disimpan!");
                                } catch (e: any) { alert(e.message); }
                             }
                          }} style={{background:"#FF6B00", color:"white", border:"none", borderRadius:8, padding:"0 16px", fontWeight:700, cursor:"pointer"}}>Simpan</button>
                       </div>
                       
                       <label style={{fontSize:12, fontWeight:700, marginBottom:6, display:"block"}}>Reset Password</label>
                       <p style={{fontSize:11, color:"rgba(44,32,22,0.5)", margin:"0 0 12px"}}>Kami akan mengirimkan link untuk mengubah password via email dengan verifikasi autentikasi.</p>
                       <button onClick={async () => {
                         try {
                           const { sendPasswordResetEmail, auth } = await import("./firebase");
                           await sendPasswordResetEmail(auth, userProfile?.email);
                           alert("Link reset password telah dikirim ke email " + userProfile?.email);
                         } catch(e:any) {
                           alert(e.message);
                         }
                       }} style={{width:"100%", background:"#FAFAFA", color:"#2C2016", border:"1px solid rgba(44,32,22,0.1)", borderRadius:8, padding:"10px", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
                         <Shield size={16}/> Kirim Email Reset Password
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* FINANCE & BILLING */}
          {activeTab === "finance" && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
                <h2 style={{fontSize:22, fontWeight:800, color:"#2C2016", margin:0}}>Keuangan & Log Pembayaran</h2>
                <div style={{display:"flex", gap:8}}>
                  <select value={financeDateRange.month} onChange={(e)=>setFinanceDateRange(p=>({...p, month: parseInt(e.target.value)}))} style={{padding:"8px 12px", borderRadius:8, border:"1px solid rgba(44,32,22,0.1)", background:"white"}}>
                    {Array.from({length:12}).map((_,i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
                  </select>
                  <select value={financeDateRange.year} onChange={(e)=>setFinanceDateRange(p=>({...p, year: parseInt(e.target.value)}))} style={{padding:"8px 12px", borderRadius:8, border:"1px solid rgba(44,32,22,0.1)", background:"white"}}>
                    {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24}}>
                 <div style={{background:"white", borderRadius:12, padding:20, border:"1px solid rgba(44,32,22,0.05)"}}>
                    <h3 style={{fontSize:14, fontWeight:700, marginBottom:16}}>Laporan Net vs Gross (Bulan Ini)</h3>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13}}>
                      <span style={{color:"rgba(44,32,22,0.6)"}}>Gross Revenue (Uang masuk dari user)</span>
                      <strong style={{color:"#2C2016"}}>Rp {fmt(transactions.filter((t:any) => {
                const d = new Date(t.timestamp);
                return d.getMonth() + 1 === financeDateRange.month && d.getFullYear() === financeDateRange.year;
             }).reduce((acc, t) => acc + (Number(t.amount) || 0), 0))}</strong>
                    </div>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:12, fontSize:13}}>
                      <span style={{color:"rgba(44,32,22,0.6)"}}>Biaya Layanan Xendit (Admin Fees)</span>
                      <strong style={{color:"#9C2B4E"}}>- Rp {fmt(transactions.filter((t:any) => {
                const d = new Date(t.timestamp);
                return d.getMonth() + 1 === financeDateRange.month && d.getFullYear() === financeDateRange.year;
             }).reduce((acc, t) => acc + (Number(t.amount) || 0), 0) * 0.03)}</strong>
                    </div>
                    <div style={{borderTop:"1px solid rgba(44,32,22,0.1)", paddingTop:12, display:"flex", justifyContent:"space-between", fontSize:14}}>
                      <span style={{fontWeight:700, color:"#2C2016"}}>Net Revenue (Bersih)</span>
                      <strong style={{color:"#2D7A5E", fontWeight:800}}>Rp {fmt(transactions.filter((t:any) => {
                const d = new Date(t.timestamp);
                return d.getMonth() + 1 === financeDateRange.month && d.getFullYear() === financeDateRange.year;
             }).reduce((acc, t) => acc + (Number(t.amount) || 0), 0) * 0.97)}</strong>
                    </div>
                 </div>
                 
                 <div style={{background:"white", borderRadius:12, padding:20, border:"1px solid rgba(44,32,22,0.05)"}}>
                    <h3 style={{fontSize:14, fontWeight:700, marginBottom:16}}>Status Saluran Pembayaran (Channels)</h3>
                    <div style={{display:"flex", flexDirection:"column", gap:8}}>
                       <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, padding:8, background:"#FAFAFA", borderRadius:6}}>
                         <div style={{display:"flex", alignItems:"center", gap:8}}><div style={{width:8,height:8,borderRadius:4,background:"#2D7A5E"}}/> Virtual Account BCA/Mandiri</div>
                         <ToggleRight size={20} color="#2D7A5E" />
                       </div>
                       <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, padding:8, background:"#FAFAFA", borderRadius:6}}>
                         <div style={{display:"flex", alignItems:"center", gap:8}}><div style={{width:8,height:8,borderRadius:4,background:"#2D7A5E"}}/> E-Wallet (OVO, DANA)</div>
                         <ToggleRight size={20} color="#2D7A5E" />
                       </div>
                       <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, padding:8, background:"rgba(156,43,78,0.05)", borderRadius:6}}>
                         <div style={{display:"flex", alignItems:"center", gap:8}}><div style={{width:8,height:8,borderRadius:4,background:"#9C2B4E"}}/> QRIS (Maintenance)</div>
                         <ToggleLeft size={20} color="rgba(44,32,22,0.3)" />
                       </div>
                    </div>
                 </div>
              </div>

              <div style={{background:"white", borderRadius:12, padding:20, border:"1px solid rgba(44,32,22,0.05)"}}>
                 <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
                   <h3 style={{fontSize:14, fontWeight:700, margin:0}}>Log Transaksi Terkini</h3>
                   <button style={{display:"flex", alignItems:"center", gap:6, background:"transparent", border:"1px solid rgba(44,32,22,0.1)", borderRadius:6, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer"}}>
                     <RefreshCw size={12}/> Sync All to Xendit
                   </button>
                 </div>
                 <table style={{width:"100%", borderCollapse:"collapse", fontSize:12}}>
                    <thead style={{background:"#FAFAFA", borderBottom:"1px solid rgba(44,32,22,0.05)"}}>
                      <tr>
                        <th style={{padding:"12px", textAlign:"left", color:"rgba(44,32,22,0.5)", fontWeight:700}}>ID Invoice</th>
                        <th style={{padding:"12px", textAlign:"left", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Email User</th>
                        <th style={{padding:"12px", textAlign:"left", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Nominal</th>
                        <th style={{padding:"12px", textAlign:"left", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Metode</th>
                        <th style={{padding:"12px", textAlign:"center", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Status</th>
                        <th style={{padding:"12px", textAlign:"center", color:"rgba(44,32,22,0.5)", fontWeight:700}}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.filter((t:any) => new Date(t.timestamp).getMonth() + 1 === financeDateRange.month).length === 0 ? 
                        <tr><td colSpan={6} style={{padding:12, textAlign:"center"}}>Tidak ada transaksi di rentang waktu ini.</td></tr> :
                        transactions.filter((t:any) => new Date(t.timestamp).getMonth() + 1 === financeDateRange.month).map((t:any, i:number) => (
                          <tr key={t.id} style={{borderBottom:"1px solid rgba(44,32,22,0.03)"}}>
                            <td style={{padding:"12px", fontWeight:600, color:"#FF6B00"}}>#INV-{new Date(t.timestamp).getFullYear()}-{i+1}</td>
                            <td style={{padding:"12px"}}>{t.userEmail}</td>
                            <td style={{padding:"12px", fontWeight:700}}>Rp {fmt(t.amount || 0)}</td>
                            <td style={{padding:"12px", color:"rgba(44,32,22,0.6)"}}>{t.paymentMethod || "Xendit QRIS"}</td>
                            <td style={{padding:"12px", textAlign:"center"}}><span style={{background:"#E5F4EE", color:"#2D7A5E", padding:"4px 8px", borderRadius:4, fontSize:10, fontWeight:800}}>LUNAS</span></td>
                            <td style={{padding:"12px", textAlign:"center"}}>
                               <button style={{background:"transparent", border:"none", cursor:"pointer", color:"rgba(44,32,22,0.5)"}} title="Download Invoice"><Download size={14}/></button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                 </table>
              </div>
            </motion.div>
          )}

          {/* PLANS & PROMO */}
          {activeTab === "plans" && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                <h2 style={{fontSize:22, fontWeight:800, marginBottom:20, color:"#2C2016"}}>Manajemen Paket & Promo</h2>
                <p style={{fontSize:13, color:"rgba(44,32,22,0.6)", marginBottom:24}}>Kustomisasi harga, durasi, dan jenis paket aktif yang akan ditampilkan di halaman langganan user.</p>
                
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16, marginBottom:32}}>
                   {plans.map((p) => (
                     <div key={p.id} style={{background:"white", borderRadius:12, padding:20, border: p.popular ? "2px solid rgba(255,107,0,0.2)" : "1px solid rgba(44,32,22,0.1)", position:"relative"}}>
                        {p.popular && <div style={{fontSize:11, fontWeight:800, color:"#FF6B00", textTransform:"uppercase", letterSpacing:1, marginBottom:8}}>Terlaris</div>}
                        <h3 style={{fontSize:16, fontWeight:800, margin:"0 0 4px"}}>{p.name}</h3>
                        <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", textDecoration:"line-through", marginBottom:2}}>
                           {p.originalPrice ? `Rp ${p.originalPrice.toLocaleString('id-ID')}` : ''}
                        </div>
                        <div style={{fontSize:24, fontWeight:800, color:"#2C2016", marginBottom:16}}>Rp {p.price?.toLocaleString('id-ID')} <span style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:500}}>/ {p.addMonths} bln</span></div>
                        <div style={{fontSize:12, color:"rgba(44,32,22,0.6)", height: 40, marginBottom:16}}>{p.desc}</div>
                        <div style={{display:"flex", gap:8}}>
                           <button onClick={() => { setEditingPlan(p); setShowPlanModal(true); }} className="hover-scale" style={{flex:1, background:"#FAFAFA", border:"1px solid rgba(44,32,22,0.1)", borderRadius:6, padding:"8px", fontSize:11, fontWeight:700, cursor:"pointer"}}>Edit Paket</button>
                           <button onClick={async () => {
                             if (confirm(`Yakin ingin menghapus paket ${p.name}?`)) {
                               try {
                                 await deleteDoc(doc(db, "plans", p.id));
                                 fetchPlans();
                               } catch(e) { console.error(e); }
                             }
                           }} className="hover-scale" style={{background:"transparent", border:"1px solid #9C2B4E", color:"#9C2B4E", borderRadius:6, padding:"8px 12px", fontSize:11, fontWeight:700, cursor:"pointer"}}>Hapus</button>
                        </div>
                     </div>
                   ))}
                   
                   <div onClick={() => { setEditingPlan({}); setShowPlanModal(true); }} className="hover-scale" style={{background:"#FAFAFA", borderRadius:12, padding:20, border:"1px dashed rgba(44,32,22,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", cursor:"pointer", minHeight: 180}}>
                      <div style={{fontSize:24, color:"rgba(44,32,22,0.3)", marginBottom:8}}>+</div>
                      <div style={{fontSize:13, fontWeight:700, color:"rgba(44,32,22,0.5)"}}>Tambah Paket Baru</div>
                   </div>
                </div>

                <div style={{background:"white", borderRadius:12, padding:24, border:"1px solid rgba(44,32,22,0.05)"}}>
                   <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
                     <h3 style={{fontSize:16, fontWeight:800}}>Kode Promo Aktif</h3>
                     <button onClick={handleAddPromo} style={{background:"rgba(255,107,0,0.1)", color:"#FF6B00", border:"none", borderRadius:6, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer"}}>+ Tambah Promo</button>
                   </div>
                   {promosList.length === 0 ? <div style={{fontSize:12, color:"rgba(44,32,22,0.5)"}}>Belum ada promo.</div> : promosList.map(p => (
                     <div key={p.id} style={{display:"flex", alignItems:"center", gap:16, padding:"12px 16px", background:"#FAFAFA", borderRadius:8, marginBottom:8, opacity: p.isActive ? 1 : 0.6}}>
                        <div style={{flex:1}}>
                           <div style={{fontSize:14, fontWeight:800, color:"#FF6B00", letterSpacing:1}}>{p.code}</div>
                           <div style={{fontSize:11, color:"rgba(44,32,22,0.5)"}}>Diskon {p.discount}. (Digunakan: {p.usageCount||0} kali) {p.isActive ? "" : "(Nonaktif)"}</div>
                        </div>
                        <div style={{display:"flex", gap:8}}>
                          <button onClick={()=>togglePromo(p)} style={{background:"transparent", border:"1px solid rgba(44,32,22,0.2)", borderRadius:6, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer"}}>
                            {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                          <button onClick={async () => {
                             if (confirm(`Yakin ingin menghapus promo ${p.code}?`)) {
                               try {
                                 await deleteDoc(doc(db, "promos", p.id));
                                 fetchPlans();
                               } catch(e) { console.error(e); }
                             }
                           }} style={{background:"transparent", border:"1px solid #9C2B4E", color:"#9C2B4E", borderRadius:6, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer"}}>
                             Hapus
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>
          )}

          {/* XENDIT WEBHOOK & DUNNING */}
          {activeTab === "xendit" && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <h2 style={{fontSize:22, fontWeight:800, marginBottom:20, color:"#2C2016"}}>Log Webhook & Dunning Xendit</h2>
              <div style={{display:"flex", gap:16, marginBottom:24}}>
                 <div style={{flex:2, background:"#1E1509", borderRadius:12, padding:20, color:"white"}}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
                      <h3 style={{fontSize:14, fontWeight:700, margin:0, display:"flex", alignItems:"center", gap:8}}><Activity size={16} color="#8AAEF0"/> Live Webhook Listener</h3>
                      <div style={{fontSize:11, background:"#2D7A5E", padding:"4px 8px", borderRadius:4, fontWeight:700}}>LISTENING PORT 3000</div>
                    </div>
                    <div style={{fontFamily:"monospace", fontSize:11, color:"rgba(255,255,255,0.6)", display:"flex", flexDirection:"column", gap:8, background:"rgba(0,0,0,0.3)", padding:16, borderRadius:8, height:150, overflowY:"auto"}}>
                       <div><span style={{color:"#8AAEF0"}}>[2026-04-25 14:12:02]</span> POST /api/webhook/xendit - 200 OK (invoice_paid)</div>
                       <div><span style={{color:"#8AAEF0"}}>[2026-04-25 10:05:11]</span> POST /api/webhook/xendit - 200 OK (invoice_created)</div>
                       <div style={{color:"#F0B18A"}}><span style={{color:"#F0B18A"}}>[2026-04-24 23:59:00]</span> POST /api/webhook/xendit - 500 ERROR (Connection Timeout)</div>
                    </div>
                 </div>
                 <div style={{flex:1, background:"white", borderRadius:12, padding:20, border:"1px dashed #9C2B4E"}}>
                    <h3 style={{fontSize:14, fontWeight:700, margin:"0 0 8px", color:"#9C2B4E"}}>Dunning Auto-Debit</h3>
                    <p style={{fontSize:12, color:"rgba(44,32,22,0.6)", marginBottom:16, lineHeight:1.5}}>Ada 3 user yang gagal auto-debit kartu kredit bulan ini karena saldo tidak cukup.</p>
                    <button style={{width:"100%", background:"#9C2B4E", color:"white", border:"none", padding:"10px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer"}}>
                      Kirim Email Tagihan Manual
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {/* SUPPORT TICKETS */}
          {activeTab === "support" && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                <h2 style={{fontSize:22, fontWeight:800, marginBottom:20, color:"#2C2016"}}>Tiket Laporan & Feedback User</h2>
                <div style={{display:"flex", gap:20}}>
                   <div style={{flex:1, display:"flex", flexDirection:"column", gap:12}}>
                      {loadingTickets ? <div style={{fontSize:12, color:"rgba(44,32,22,0.5)"}}>Loading tickets...</div> : 
                       tickets.length === 0 ? <div style={{fontSize:12, color:"rgba(44,32,22,0.5)"}}>Belum ada tiket masuk.</div> : 
                       tickets.map((t: any) => {
                         const isPriority = t.subject?.toLowerCase().includes("pembayaran");
                         return (
                        <div key={t.id} onClick={()=>setSelectedTicket(t)} style={{background:"white", borderRadius:12, padding:16, border: selectedTicket?.id === t.id ? "1px solid #FF6B00" : "1px solid rgba(44,32,22,0.05)", borderLeft: isPriority ? "4px solid #9C2B4E" : selectedTicket?.id === t.id ? "4px solid #FF6B00" : "4px solid rgba(44,32,22,0.1)", cursor:"pointer", opacity: selectedTicket?.id === t.id ? 1 : 0.7}}>
                           <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                              <div style={{fontSize:12, fontWeight:800, color:"#2C2016", display:"flex", alignItems:"center", gap:6}}>
                                 {t.userEmail}
                                 {isPriority && <span style={{background:"#9C2B4E", color:"white", padding:"2px 6px", borderRadius:4, fontSize:9, fontWeight:800, textTransform:"uppercase"}}>Urgent</span>}
                              </div>
                              <div style={{fontSize:11, color:"rgba(44,32,22,0.5)"}}>{new Date(t.updatedAt).toLocaleString("id-ID", {dateStyle:"short", timeStyle:"short"})}</div>
                           </div>
                           <div style={{fontSize:14, fontWeight:700, marginBottom:4, color: isPriority ? "#9C2B4E" : "#2C2016"}}>{t.subject}</div>
                           <div style={{fontSize:12, color:"rgba(44,32,22,0.6)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>
                              {t.messages?.[t.messages.length - 1]?.text || "No message"}
                           </div>
                        </div>
                      )})}
                   </div>

                   <div style={{flex:2, background:"white", borderRadius:12, padding:24, border:"1px solid rgba(44,32,22,0.05)", display:"flex", flexDirection:"column", minHeight: 400}}>
                      {selectedTicket ? (
                        <>
                          <div style={{borderBottom:"1px solid rgba(44,32,22,0.05)", paddingBottom:16, marginBottom:16}}>
                             <h3 style={{fontSize:18, fontWeight:800, margin:"0 0 4px"}}>{selectedTicket.subject}</h3>
                             <div style={{fontSize:12, color:"rgba(44,32,22,0.5)"}}>Dilaporkan oleh {selectedTicket.userEmail}</div>
                          </div>
                          <div style={{flex:1, overflowY:"auto", marginBottom:16, fontSize:13, lineHeight:1.6, color:"#2C2016", display:"flex", flexDirection:"column", gap:12}}>
                             {(selectedTicket.messages||[]).map((m: any, i:number) => (
                                <div key={i} style={{background: m.sender==="admin" ? "#F8EAF0" : "#FAFAFA", padding: 12, borderRadius: 8, alignSelf: m.sender==="admin" ? "flex-end" : "flex-start", maxWidth:"80%"}}>
                                   <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                                      <div style={{fontSize:11, fontWeight:700, color:m.sender==="admin" ? "#9C2B4E" : "rgba(44,32,22,0.5)"}}>{m.sender === "admin" ? "Admin" : selectedTicket.userEmail}</div>
                                      <div style={{fontSize:10, color:"rgba(44,32,22,0.4)"}}>{new Date(m.timestamp).toLocaleString("id-ID", {dateStyle:"short", timeStyle:"short"})}</div>
                                   </div>
                                   <div>{m.text}</div>
                                </div>
                             ))}
                          </div>
                          <div style={{display:"flex", gap:12}}>
                             <textarea id="ticket_reply" placeholder="Tulis balasan Anda, user akan menerima notifikasi..." style={{flex:1, padding:12, borderRadius:8, border:"1px solid rgba(44,32,22,0.1)", fontSize:13, resize:"none", height:80, fontFamily:"inherit"}}></textarea>
                             <button onClick={handleReply} style={{background:"#2D7A5E", color:"white", border:"none", borderRadius:8, padding:"0 20px", fontWeight:700, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4}}>
                               <MessageSquare size={18}/> Balas
                             </button>
                          </div>
                        </>
                      ) : (
                         <div style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(44,32,22,0.3)"}}>Pilih tiket untuk membalas</div>
                      )}
                   </div>
                </div>
              </motion.div>
          )}

          {/* PUSH NOTIFS */}
          {activeTab === "notifications" && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <h2 style={{fontSize:22, fontWeight:800, marginBottom:20, color:"#2C2016"}}>Kirim Push Notification Aplikasi</h2>
              <div style={{background:"white", borderRadius:12, padding:24, border:"1px solid rgba(44,32,22,0.05)", maxWidth:600}}>
                 <label style={{fontSize:12, fontWeight:700, marginBottom:8, display:"block", color:"rgba(44,32,22,0.5)"}}>Pilih Target Audiens</label>
                 <select id="notif_target" defaultValue="all" style={{width:"100%", padding:12, borderRadius:8, border:"1px solid rgba(44,32,22,0.1)", marginBottom:20, fontSize:13, background:"#FAFAFA"}}>
                    <option value="all">Semua User (Termasuk Trial & Free)</option>
                    <option value="pro">Hanya User Akun PRO Aktif</option>
                    <option value="expired">Hanya User Kadaluarsa / Churned</option>
                 </select>
                 
                 <label style={{fontSize:12, fontWeight:700, marginBottom:8, display:"block", color:"rgba(44,32,22,0.5)"}}>Judul Notifikasi</label>
                 <input id="notif_title" placeholder="Contoh: Fitur Baru Telah Rilis!" style={{width:"100%", padding:12, borderRadius:8, border:"1px solid rgba(44,32,22,0.1)", marginBottom:20, fontSize:13}} />
                 
                 <label style={{fontSize:12, fontWeight:700, marginBottom:8, display:"block", color:"rgba(44,32,22,0.5)"}}>Isi Pesan</label>
                 <textarea id="notif_desc" placeholder="Pesan singkat maksmial 150 karakter..." style={{width:"100%", padding:12, borderRadius:8, border:"1px solid rgba(44,32,22,0.1)", marginBottom:24, fontSize:13, resize:"none", height:100}}></textarea>
                 
                 <button onClick={async () => {
                    const tEl = document.getElementById("notif_title") as HTMLInputElement;
                    const dEl = document.getElementById("notif_desc") as HTMLTextAreaElement;
                    const tgEl = document.getElementById("notif_target") as HTMLSelectElement;
                    if(!tEl.value || !dEl.value) return alert("Penuhi semua kolom");
                    try {
                       const { addDoc, collection, db } = await import("./firebase");
                       await addDoc(collection(db, "global_notifications"), {
                          title: tEl.value,
                          desc: dEl.value,
                          target: tgEl.value,
                          createdAt: new Date().toISOString()
                       });
                       tEl.value = ""; dEl.value = "";
                       alert("Notifikasi berhasil dikirim!");
                    } catch(e:any) { alert(e.message); }
                 }} style={{width:"100%", background:"#FF6B00", color:"white", border:"none", padding:"14px", borderRadius:8, fontSize:14, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8}}>
                   <Bell size={18}/> Kirim Notifikasi Sekarang
                 </button>
              </div>
            </motion.div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
              <h2 style={{fontSize:22, fontWeight:800, marginBottom:20, color:"#2C2016"}}>Pengaturan Basis CMS</h2>
              <div style={{background:"white", borderRadius:12, padding:24, border:"1px solid rgba(44,32,22,0.05)", display:"flex", flexDirection:"column", gap: 20}}>
                 <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom:16, borderBottom:"1px solid rgba(44,32,22,0.05)"}}>
                   <div>
                     <div style={{fontSize:14, fontWeight:700, color:"#2C2016", marginBottom:4}}>Mode Maintenance Keseluruhan</div>
                     <div style={{fontSize:12, color:"rgba(44,32,22,0.5)"}}>Matikan aplikasi untuk perbaikan. User akan melihat layar Maintenance.</div>
                   </div>
                   <button style={{background:"transparent", border:"1px solid rgba(44,32,22,0.2)", padding:"8px 16px", borderRadius:8, fontWeight:700, color:"rgba(44,32,22,0.4)", cursor:"pointer"}}>OFF</button>
                 </div>
                 
                 <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", paddingBottom:16, borderBottom:"1px solid rgba(44,32,22,0.05)"}}>
                   <div>
                     <div style={{fontSize:14, fontWeight:700, color:"#2C2016", marginBottom:4}}>Hapus Periode Arsip Otomatis</div>
                     <div style={{fontSize:12, color:"rgba(44,32,22,0.5)"}}>Berapa lama data terarsip di sistem sebelum dihancurkan selamanya?</div>
                   </div>
                   <select style={{background:"#FAFAFA", border:"1px solid rgba(44,32,22,0.1)", padding:"8px 12px", borderRadius:8, fontWeight:700, color:"#2C2016", outline:"none"}}>
                     <option>90 Hari Terakhir</option>
                     <option>1 Tahun</option>
                     <option>Tidak Pernah Hapus</option>
                   </select>
                 </div>
                 
              </div>
            </motion.div>
          )}

        </div>
      </div>
        {showPlanModal && editingPlan && (
          <div style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <form onSubmit={savePlan} style={{background:"white", padding:30, borderRadius:20, width:500, maxHeight:"90vh", overflowY:"auto"}}>
               <h3 style={{fontSize:20, fontWeight:700, marginBottom:16}}>{editingPlan.id ? "Edit Paket" : "Tambah Paket"}</h3>
               <div style={{display:"flex", flexDirection:"column", gap:12, marginBottom:20}}>
                 <div>
                    <label style={{fontSize:12, fontWeight:700, color:"rgba(44,32,22,0.5)"}}>Nama Paket</label>
                    <input name="name" defaultValue={editingPlan.name} required style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EBEBEB"}} />
                 </div>
                 <div>
                    <label style={{fontSize:12, fontWeight:700, color:"rgba(44,32,22,0.5)"}}>Deskripsi Pendek</label>
                    <input name="desc" defaultValue={editingPlan.desc} required style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EBEBEB"}} />
                 </div>
                 <div style={{display:"flex", gap:12}}>
                   <div style={{flex:1}}>
                      <label style={{fontSize:12, fontWeight:700, color:"rgba(44,32,22,0.5)"}}>Harga Coret (Original) Rp</label>
                      <input name="originalPrice" type="number" defaultValue={editingPlan.originalPrice} style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EBEBEB"}} />
                   </div>
                   <div style={{flex:1}}>
                      <label style={{fontSize:12, fontWeight:700, color:"rgba(44,32,22,0.5)"}}>Harga Jual Rp</label>
                      <input name="price" type="number" defaultValue={editingPlan.price} required style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EBEBEB"}} />
                   </div>
                 </div>
                 <div>
                    <label style={{fontSize:12, fontWeight:700, color:"rgba(44,32,22,0.5)"}}>Durasi (Bulan)</label>
                    <input name="addMonths" type="number" defaultValue={editingPlan.addMonths || 1} required style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EBEBEB"}} />
                 </div>
                 <div>
                    <label style={{fontSize:12, fontWeight:700, color:"rgba(44,32,22,0.5)"}}><input type="checkbox" name="popular" defaultChecked={editingPlan.popular} /> Tandai "Terlaris"</label>
                 </div>
                 <div>
                    <label style={{fontSize:12, fontWeight:700, color:"rgba(44,32,22,0.5)"}}>Fitur (1 per baris)</label>
                    <textarea name="features" defaultValue={editingPlan.features?.join("\n")} style={{width:"100%", minHeight:100, padding:"12px", borderRadius:12, border:"1px solid #EBEBEB"}} />
                 </div>
               </div>
               <div style={{display:"flex", gap:12}}>
                 <button type="button" onClick={()=>setShowPlanModal(false)} style={{flex:1, padding:"12px", borderRadius:12, background:"#F5F5F5", border:"none", fontWeight:600, cursor:"pointer"}}>Batal</button>
                 <button type="submit" style={{flex:1, padding:"12px", borderRadius:12, background:"#FF6B00", color:"white", border:"none", fontWeight:600, cursor:"pointer"}}>Simpan Paket</button>
               </div>
            </form>
          </div>
        )}
    </div>
  );
}
