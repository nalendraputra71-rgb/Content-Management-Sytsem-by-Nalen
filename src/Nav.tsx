import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { 
  Calendar, Layout, List, Clock, PieChart, Settings, 
  Search, Share2, Pencil, Image, LogOut, Menu, Plus, ChevronLeft, ChevronDown, ChevronUp, Bell, Columns, Shield, X, MessageCircle, Activity, BarChart2, MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { eng, fmt, YEARS, B, I, TAB, MONTHS, CustomDropdown } from "./data";
import { useNotifications, NotificationToast, NotificationPanel } from "./NotificationSystem";

export function Header({
  title, tagline, onBrandingChange,
  headerImage, onHeaderImageChange, headerStyle, setHeaderStyle,
  content, qYear, onQYearChange, qNumber, onQNumberChange,
  onExport, onImportClick, onShare, search, onSearch, 
  onToggleSidebar, sidebarOpen
}: any) {
  const [ed, setEd] = useState(false);
  const [tmp, setTmp] = useState(title);
  const [tmpTag, setTmpTag] = useState(tagline);
  const [tmpStyle, setTmpStyle] = useState(headerStyle || {});
  const [localSearchOpen, setLocalSearchOpen] = useState(!sidebarOpen);

  // Sync temp state when props change (from DB)
  useEffect(() => {
    setTmp(title);
    setTmpTag(tagline);
    setTmpStyle(headerStyle || {});
  }, [title, tagline, headerStyle]);

  useEffect(() => {
    setLocalSearchOpen(!sidebarOpen);
  }, [sidebarOpen]);

  const appliedStyle = headerStyle || {};
  const navigate = useNavigate();

  let qContent = content;
  if (qNumber > 0) {
    const qMonths = qNumber === 1 ? [1,2,3] : qNumber === 2 ? [4,5,6] : qNumber === 3 ? [7,8,9] : [10,11,12];
    qContent = content.filter((c:any) => c.year === qYear && qMonths.includes(c.month));
  }
  
  const active = qContent.filter((c:any)=>!c.archived);
  const pub = active.filter((c:any)=>c.status==="Published").length;
  const tr = active.reduce((s:any,c:any)=>s+(c.metrics?.reach||0)+(c.adsMetrics?.reach||0),0);
  const te = active.reduce((s:any,c:any)=>s+eng(c.metrics)+eng(c.adsMetrics),0);

  const handleImg = (e:any) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev:any) => onHeaderImageChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{background:appliedStyle?.bgColor||"#2C2016",color:appliedStyle?.titleColor||"#FAFAFA",padding:"24px 40px",position:"relative",minHeight:160,display:"flex",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.05)", zIndex: 100}}>
      {headerImage && <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",borderRadius: "inherit"}}><img src={headerImage} alt="header" style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.3}} /></div>}
      
      <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"center",gap:32,width:"100%"}}>
        <div style={{display:"flex", alignItems:"center", gap:24, flex:1}}>
          <button className="hover-scale" onClick={onToggleSidebar} style={{background:"rgba(255,255,255,0.1)", border:"none", borderRadius:16, width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"white", transition: "all 0.3s ease"}}>
            {sidebarOpen ? <ChevronLeft size={22}/> : <Menu size={22}/>}
          </button>
          
          <div style={{minWidth:250}}>
            {ed ? (
              <div style={{display:"flex",flexDirection:"column",gap:8,background:"rgba(0,0,0,0.9)",padding:24,borderRadius:24,backdropFilter:"blur(20px)",maxWidth:400,border:"1px solid rgba(255,255,255,0.15)",zIndex:100,boxShadow:"0 20px 50px rgba(0,0,0,0.4)"}}>
                 <div style={{display:"flex",flexDirection:"column",gap:6}}>
                   <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Judul Utama</label>
                   <div style={{display:"flex",gap:12}}>
                     <input value={tmp} onChange={(e:any)=>setTmp(e.target.value)} style={{flex:1,fontSize:14,background:"white",border:"none",borderRadius:12,color:"#333",padding:"10px 16px"}}/>
                     <input type="color" value={tmpStyle?.titleColor||"#FAFAFA"} onChange={(e)=>setTmpStyle({...tmpStyle,titleColor:e.target.value})} style={{width:40,height:40,border:"none",borderRadius:12,cursor:"pointer"}}/>
                   </div>
                 </div>
                 <div style={{display:"flex",flexDirection:"column",gap:6}}>
                   <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1}}>Tagline / Sub-judul</label>
                   <input value={tmpTag} onChange={(e:any)=>setTmpTag(e.target.value)} placeholder="Masukkan tagline..." style={{fontSize:13,background:"white",border:"none",borderRadius:12,color:"#333",padding:"10px 16px",width:"100%"}}/>
                 </div>
                 <div style={{display:"flex",gap:16,marginTop:12}}>
                   <button className="btn-hover" onClick={()=>{onBrandingChange({title:tmp, tagline:tmpTag, headerStyle:tmpStyle});setEd(false);}} style={{background:"#FF6B00",border:"none",borderRadius:16,padding:"10px 20px",cursor:"pointer",color:"white",fontSize:13,fontWeight:700,flex:1}}>Simpan</button>
                   <button className="btn-hover" onClick={()=>{setTmp(title);setTmpTag(tagline);setTmpStyle(headerStyle);setEd(false);}} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:16,padding:"10px 20px",cursor:"pointer",color:"white",fontSize:12}}>Batal</button>
                 </div>
              </div>
            ) : (
              <div onClick={()=>setEd(true)} className="hover-scale" style={{cursor:"pointer"}}>
                 <h1 style={{fontFamily:appliedStyle?.titleFont||"inherit",fontSize:32,fontWeight:800,letterSpacing:"-1px",margin:0,color:appliedStyle?.titleColor||"#FAFAFA",display:"flex",alignItems:"center",gap:12}}>{title} <Pencil size={18} style={{opacity:0.3}}/></h1>
                 <p style={{margin:"6px 0 0",color:appliedStyle?.taglineColor||"rgba(250,247,242,0.6)",fontSize:14,fontWeight:500,fontStyle:"italic"}}>{tagline}</p>
              </div>
            )}
          </div>
 
          <motion.div 
            animate={{ width: localSearchOpen ? 240 : 44, padding: localSearchOpen ? "8px 16px" : "8px" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.1)",borderRadius:22, border:"1px solid rgba(255,255,255,0.15)", overflow:"hidden", cursor: !localSearchOpen ? "pointer" : "text", flexShrink: 0, height: 40}}
            onClick={() => { if (!localSearchOpen) setLocalSearchOpen(true); }}
          >
            <Search size={18} style={{opacity:0.5, flexShrink:0, margin: !localSearchOpen ? "auto" : "0"}} onClick={(e) => {
               if(localSearchOpen && !search) {
                  e.stopPropagation();
                  setLocalSearchOpen(false);
               }
            }}/>
            <AnimatePresence>
              {localSearchOpen && (
                <motion.input 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{background:"transparent",border:"none",outline:"none",color:"white",fontSize:13}}
                  className="focus-ring" value={search} onChange={(e:any)=>onSearch && onSearch(e.target.value)} placeholder="Cari konten..." 
                  autoFocus
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div style={{display:"flex",gap:24,alignItems:"center", flexShrink:0}}>
          <div style={{display:"flex", gap:24, borderRight:"1px solid rgba(255,255,255,0.15)", paddingRight:24}}>
            {[["Published",pub], ["Reach",fmt(tr)], ["Eng",fmt(te)]].map(([l,v])=>(
              <div key={l as string} style={{textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,lineHeight:1,letterSpacing:"-1px"}}>{v as any}</div>
                <div style={{fontSize:10,color:"rgba(250,247,242,0.4)",marginTop:6,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700}}>{l as string}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex", gap:16, alignItems:"center", background:"rgba(255,255,255,0.1)", padding:"6px 14px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)"}}>
             <div style={{minWidth: 170}}>
               <CustomDropdown dark value={String(qNumber)} options={[
                 {id: "0", name: "Tahun Ini"},
                 {id: "1", name: "Q1 (Jan-Mar)"},
                 {id: "2", name: "Q2 (Apr-Jun)"},
                 {id: "3", name: "Q3 (Jul-Sep)"},
                 {id: "4", name: "Q4 (Okt-Des)"}
               ]} onChange={(v)=>onQNumberChange(+v)} style={{padding: 0, border: "none", background: "transparent"}} />
             </div>
          </div>

          <div style={{display:"flex",gap:12}}>
            <button className="hover-scale btn-hover shadow-lg" onClick={onShare} style={{background:"#FF6B00",border:"none",borderRadius:14,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"white",boxShadow:"0 8px 16px rgba(255,107,0,0.3)"}} title="Bagikan Link Workspace"><Share2 size={18}/></button>
            <label className="hover-scale btn-hover" style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:14,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"white",transition: "all 0.3s ease"}}>
              <Image size={18}/>
              <input type="file" hidden accept="image/*" onChange={handleImg} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatSupportPanel({onClose, userId, userEmail, userProfile}: {onClose:()=>void, userId:string, userEmail:string, userProfile:any}) {
  const [ticketSubject, setTicketSubject] = useState("Pertanyaan/Bantuan Umum");
  const [ticketMsg, setTicketMsg] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let unsub: any;
    import("./firebase").then(({ db, collection, query, where, onSnapshot }) => {
      // Find open ticket for this user
      const q = query(collection(db, "tickets"), where("userId", "==", userId));
      unsub = onSnapshot(q, snap => {
         const openTickets = snap.docs.map(d=>({id: d.id, ...d.data()})).filter((t:any) => t.status === "open");
         if (openTickets.length > 0) {
            // Pick most recently updated open ticket
            openTickets.sort((a:any, b:any)=>new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setActiveTicket(openTickets[0]);
         } else {
            setActiveTicket(null);
         }
         setInitialLoading(false);
      });
    });
    return () => { if(unsub) unsub(); }
  }, [userId]);

  const handleSendReply = async () => {
    const el = document.getElementById("chat_input") as HTMLInputElement;
    const text = el.value;
    if(!text || !activeTicket) return;
    try {
      const { doc, updateDoc, db } = await import("./firebase");
      await updateDoc(doc(db, "tickets", activeTicket.id), {
         messages: [...(activeTicket.messages||[]), { sender: "user", text, timestamp: new Date().toISOString() }],
         updatedAt: new Date().toISOString()
      });
      el.value = "";
    } catch(e:any) { alert(e.message); }
  };

  const handleSendForm = async () => {
    if(!ticketMsg) return;
    setLoading(true);
    try {
      const { collection, addDoc, db } = await import("./firebase");
      await addDoc(collection(db, "tickets"), {
         userId,
         userEmail,
         username: userProfile?.username || "",
         subject: ticketSubject,
         messages: [{ sender: "user", text: ticketMsg, timestamp: new Date().toISOString() }],
         status: "open",
         updatedAt: new Date().toISOString()
      });
      setShowSuccess(true);
      setTimeout(() => {
         onClose();
      }, 3000);
    } catch(e:any) { 
       alert(e.message); 
    } finally {
       setLoading(false);
    }
  };

  if (initialLoading) return null;

  // VIEW MODE: Active Ticket Thread
  if (activeTicket) {
    return (
      <motion.div initial={{opacity:0, y:20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:20, scale:0.95}} style={{position:"fixed", bottom:24, right:24, width:380, background:"white", borderRadius:20, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", border:"1px solid rgba(44,32,22,0.05)", zIndex:500, display:"flex", flexDirection:"column", overflow:"hidden"}}>
        <div style={{background:"#2C2016", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", color:"white"}}>
           <div>
             <h4 style={{margin:0, fontSize:15, fontWeight:800}}>{activeTicket.subject}</h4>
             <div style={{fontSize:11, color:"rgba(255,255,255,0.6)"}}>Menunggu tanggapan admin...</div>
           </div>
           <button onClick={onClose} style={{background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer"}} className="hover-scale"><X size={18}/></button>
        </div>
        <div style={{height:300, background:"#FAFAFA", padding:"20px", overflowY:"auto", display:"flex", flexDirection:"column", gap:12}}>
           {(activeTicket.messages||[]).map((m:any, i:number) => (
             <div key={i} style={{display:"flex", flexDirection:"column", alignItems: m.sender==="user"?"flex-end":"flex-start"}}>
               <div style={{background:m.sender==="user" ? "#FF6B00" : "white", color:m.sender==="user"?"white":"#2C2016", padding:"10px 14px", borderRadius:m.sender==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", fontSize:13, boxShadow:"0 2px 10px rgba(0,0,0,0.05)", maxWidth:"90%", lineHeight:1.5}}>
                 {m.text}
               </div>
               <div style={{fontSize:10, color:"rgba(44,32,22,0.4)", marginTop:4}}>{new Date(m.timestamp).toLocaleString("id-ID", {dateStyle:"short", timeStyle:"short"})}</div>
             </div>
           ))}
        </div>
        <div style={{padding:"16px", background:"white", borderTop:"1px solid rgba(44,32,22,0.05)", display:"flex", gap:12}}>
           <input id="chat_input" placeholder="Tulis balasan..." onKeyDown={e=>e.key==='Enter'&&handleSendReply()} style={{flex:1, border:"1px solid rgba(44,32,22,0.1)", borderRadius:20, padding:"10px 16px", fontSize:13, outline:"none"}} />
           <button onClick={handleSendReply} style={{background:"#FF6B00", color:"white", border:"none", width:38, height:38, borderRadius:19, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}} className="hover-scale"><Plus size={18}/></button>
        </div>
      </motion.div>
    );
  }

  // CREATE TICKET MODE
  if (showSuccess) {
    return (
      <motion.div initial={{opacity:0, y:20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:20, scale:0.95}} style={{position:"fixed", bottom:24, right:24, width:380, background:"white", borderRadius:20, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", border:"1px solid rgba(44,32,22,0.05)", zIndex:500, padding:32, textAlign:"center"}}>
         <div style={{width:64,height:64,borderRadius:"50%",background:"#E5F4EE",color:"#2D7A5E",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px"}}>✓</div>
         <h3 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Pesan Terkirim!</h3>
         <p style={{fontSize:13,color:"rgba(44,32,22,0.5)",marginBottom:24,lineHeight:1.5}}>Terima kasih atas laporan/masukan Anda. Tim kami akan segera menindaklanjuti. Anda akan menerima notifikasi jika ada balasan.</p>
         <button onClick={onClose} style={{...B(false),width:"100%"}}>Tutup</button>
      </motion.div>
    );
  }

  if (showCancelConfirm) {
    return (
      <motion.div initial={{opacity:0, y:20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:20, scale:0.95}} style={{position:"fixed", bottom:24, right:24, width:340, background:"white", borderRadius:20, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", border:"1px solid rgba(44,32,22,0.05)", zIndex:500, padding:24, textAlign:"center"}}>
         <h3 style={{fontSize:16,fontWeight:800,marginBottom:8}}>Batalkan Laporan?</h3>
         <p style={{fontSize:13,color:"rgba(44,32,22,0.5)",marginBottom:20,lineHeight:1.5}}>Pesan yang sudah Anda ketik akan hilang.</p>
         <div style={{display:"flex", gap:12}}>
            <button onClick={()=>setShowCancelConfirm(false)} style={{...B(false), flex:1}}>Tidak</button>
            <button onClick={onClose} style={{...B(true,"#9C2B4E"), flex:1}}>Ya, Batal</button>
         </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{opacity:0, y:20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:20, scale:0.95}} style={{position:"fixed", bottom:24, right:24, width:380, background:"white", borderRadius:20, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", border:"1px solid rgba(44,32,22,0.05)", zIndex:500, display:"flex", flexDirection:"column", overflow:"hidden"}}>
      <div style={{background:"#2C2016", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", color:"white"}}>
         <div>
           <h4 style={{margin:0, fontSize:15, fontWeight:800}}>Hubungi Support</h4>
           <div style={{fontSize:11, color:"rgba(255,255,255,0.6)"}}>Kirim saran atau laporkan bug</div>
         </div>
         <button onClick={()=>setShowCancelConfirm(true)} style={{background:"none", border:"none", color:"rgba(255,255,255,0.6)", cursor:"pointer"}} className="hover-scale"><X size={18}/></button>
      </div>
      
      <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:16, background:"#FAFAFA"}}>
         <div>
            <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:6}}>Email Pengirim</label>
            <input disabled value={userEmail} style={{...I({background:"#EBEBEB",color:"rgba(44,32,22,0.5)",cursor:"not-allowed"})}} />
         </div>
         <div>
            <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:6}}>Username Pengirim</label>
            <input disabled value={userProfile?.username || "Tanpa Username"} style={{...I({background:"#EBEBEB",color:"rgba(44,32,22,0.5)",cursor:"not-allowed"})}} />
         </div>
         <div>
            <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:6}}>Jenis Pesan</label>
            <CustomDropdown value={ticketSubject} onChange={(v)=>setTicketSubject(v)} options={[
               "Pertanyaan/Bantuan Umum",
               "Saran & Masukan (Feedback)",
               "Laporan Bug/Eror",
               "Laporan Pembayaran"
            ]} style={{...I({})}} />
         </div>
         <div>
            <label style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.4)", textTransform:"uppercase", display:"block", marginBottom:6}}>Isi Pesan / Laporan</label>
            <textarea value={ticketMsg} onChange={(e)=>setTicketMsg(e.target.value)} placeholder="Tuliskan secara detail kendala atau saran Anda..." style={{...I({minHeight:100,resize:"none",fontFamily:"inherit"})}} />
         </div>
         
         <div style={{display:"flex", gap:12, marginTop:8}}>
            <button onClick={()=>setShowCancelConfirm(true)} disabled={loading} style={{...B(false), flex:1}}>Batal</button>
            <button onClick={handleSendForm} disabled={loading||!ticketMsg} style={{...B(true), flex:1}}>{loading?"Sedang Mengirim...":"Kirim Pesan"}</button>
         </div>
      </div>
    </motion.div>
  );
}

export function Sidebar({ 
  open, tab, setTab, 
  workspaces, activeWorkspace, onWorkspaceSelect, 
  user, profile, onLogout, title, onOpenSidebar
}: any) {
  const navigate = useNavigate();
  const [showViews, setShowViews] = useState(true);
  const [showWorkspaces, setShowWorkspaces] = useState(true);
  const [showSocial, setShowSocial] = useState(true);
  
  const VIEWS = [
    {id:"month", ic:<Calendar size={18}/>, lb:"Bulan"},
    {id:"board", ic:<Layout size={18}/>, lb:"Board"},
    {id:"timeline", ic:<Clock size={18}/>, lb:"Timeline"},
    {id:"table", ic:<List size={18}/>, lb:"Tabel"},
    {id:"analytics", ic:<PieChart size={18}/>, lb:"Analitik"}
  ];

  const SOCIAL_STUDIO = [
    {id:"social-dashboard", ic:<Activity size={18}/>, lb:"Overview", soon: true},
    {id:"social-analytics", ic:<BarChart2 size={18}/>, lb:"Analytics Expert", soon: true},
    {id:"social-competitor", ic:<Search size={18}/>, lb:"Analisis Kompetitor", soon: true},
    {id:"social-calendar", ic:<Calendar size={18}/>, lb:"Kalender Konten", soon: true},
    {id:"social-inbox", ic:<MessageSquare size={18}/>, lb:"Inbox & Komen", soon: true},
    {id:"social-content", ic:<Layout size={18}/>, lb:"Konten", soon: true}
  ];

  const isSuperAdmin = profile?.role === "admin" || profile?.email?.toLowerCase() === "nalendraputra71@gmail.com" || user?.email?.toLowerCase() === "nalendraputra71@gmail.com";
  const EXTRA = [
    {id:"settings", ic:<Settings size={18}/>, lb:"Pengaturan"},
    ...(isSuperAdmin ? [{id:"admin", ic:<Shield size={18}/>, lb:"Admin Panel", super:true}] : [])
  ];

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showChatSupport, setShowChatSupport] = useState(false);
  const { notifications, setNotifications, toast, setToast } = useNotifications(profile);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    if (id.startsWith("ticket_")) {
      const dbId = id.replace("ticket_", "");
      try {
        const { doc, updateDoc, db } = await import("./firebase");
        await updateDoc(doc(db, "tickets", dbId), { readByUser: true });
        // Also open chat support so they can reply
        setShowNotifPanel(false);
        setShowChatSupport(true);
      } catch (e) { console.error(e); }
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <>
      <NotificationToast toast={toast} onClose={() => setToast(null)} onClick={() => { 
        setShowNotifPanel(true); 
        if(onOpenSidebar) onOpenSidebar(); 
      }} />
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }} 
            animate={{ width: 270, opacity: 1 }} 
            exit={{ width: 0, opacity: 0 }} 
            transition={{ duration: 0.3 }}
            style={{background:"#2C2016", color:"#FAFAFA", display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,0.05)", height:"100vh", position:"sticky", top:0, zIndex:200, overflow:"hidden", whiteSpace: "nowrap"}}
          >
            <div style={{minWidth: 270, height: "100%", display: "flex", flexDirection: "column", position: "relative"}}>
              <div style={{padding:"24px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                <div style={{fontSize:20, fontWeight:800, letterSpacing:"-1px", color:"#FF6B00"}}>{title || "CMS Console"}</div>
                <div style={{position: "relative"}}>
                  <button onClick={() => setShowNotifPanel(!showNotifPanel)} style={{background:"none", border:"none", color:showNotifPanel ? "#FF6B00" : "rgba(255,255,255,0.6)", cursor:"pointer", display:"flex", position: "relative"}} className="hover-scale">
                    <Bell size={20} />
                    {unreadCount > 0 && <div style={{position:"absolute", top:-2, right:-2, background:"#FF6B00", width:8, height:8, borderRadius:4}} />}
                  </button>
                </div>
              </div>
            
            <div style={{flex:1, overflowY:"auto", display:"flex", flexDirection:"column"}}>
              <AnimatePresence mode="wait">
                {showNotifPanel ? (
                   <motion.div key="notif" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} style={{flex:1, display:"flex", flexDirection:"column", height: "100%"}}>
                      <NotificationPanel notifications={notifications} onClose={() => setShowNotifPanel(false)} onRead={handleRead} onContactSupport={() => { setShowNotifPanel(false); setShowChatSupport(true); }} />
                   </motion.div>
                ) : (
                   <motion.div key="menu" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} style={{padding: "20px 16px"}}>
              
              {/* Workspaces Section */}
              <div style={{marginBottom: 24}}>
                <div onClick={() => setShowWorkspaces(!showWorkspaces)} style={{display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", marginBottom:8, padding:"0 8px"}}>
                  <label style={{fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:1.5, cursor:"pointer"}}>Workspaces</label>
                  {showWorkspaces ? <ChevronUp size={14} color="rgba(255,255,255,0.3)"/> : <ChevronDown size={14} color="rgba(255,255,255,0.3)"/>}
                </div>
                
                <AnimatePresence>
                  {showWorkspaces && (
                    <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}} style={{display:"flex", flexDirection:"column", gap:8, overflow:"hidden"}}>
                      {workspaces.map((ws: any) => (
                        <button 
                          className="hover-scale"
                          key={ws.id} 
                          onClick={() => onWorkspaceSelect(ws)} 
                          style={{
                            width:"100%", textAlign:"left", background:activeWorkspace?.id === ws.id ? "#FF6B00" : "rgba(255,255,255,0.05)", 
                            border:"none", borderRadius:12, padding:"10px 14px", color:activeWorkspace?.id === ws.id ? "white" : "#FAFAFA", 
                            fontSize:13, fontWeight:600, cursor:"pointer", transition: "all 0.3s ease"
                          }}
                        >
                          {ws.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content Planner Section */}
              <div style={{marginBottom: 24}}>
                <div onClick={() => setShowViews(!showViews)} style={{display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", marginBottom:8, padding:"0 8px"}}>
                  <label style={{fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:1.5, cursor:"pointer"}}>Content Planner</label>
                  {showViews ? <ChevronUp size={14} color="rgba(255,255,255,0.3)"/> : <ChevronDown size={14} color="rgba(255,255,255,0.3)"/>}
                </div>
                
                <AnimatePresence>
                  {showViews && (
                    <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}} style={{display:"flex", flexDirection:"column", gap:4, overflow:"hidden"}}>
                      {VIEWS.map(v => (
                        <button 
                            className="hover-scale"
                            key={v.id} 
                            onClick={() => setTab(v.id)} 
                            style={{
                              display:"flex", alignItems:"center", gap:14, width:"100%", padding:"10px 14px", background:tab===v.id?"rgba(255,255,255,0.1)":"transparent",
                              border:"none", borderRadius:12, color:tab===v.id?"white":"rgba(250,247,242,0.6)", cursor:"pointer", transition: "all 0.3s ease"
                            }}
                        >
                            <span style={{color:tab===v.id?"#FF6B00":"currentColor"}}>{v.ic}</span>
                            <span style={{fontSize:13, fontWeight:tab===v.id?700:500}}>{v.lb}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Social Studio Section */}
              <div style={{marginBottom: 24}}>
                <div onClick={() => setShowSocial(!showSocial)} style={{display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", marginBottom:8, padding:"0 8px"}}>
                  <div style={{display:"flex", alignItems:"center", gap:6}}>
                    <label style={{fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:1.5, cursor:"pointer"}}>Social Studio</label>
                  </div>
                  {showSocial ? <ChevronUp size={14} color="rgba(255,255,255,0.3)"/> : <ChevronDown size={14} color="rgba(255,255,255,0.3)"/>}
                </div>
                
            <AnimatePresence>
              {showSocial && (
                <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} exit={{height:0, opacity:0}} style={{display:"flex", flexDirection:"column", gap:2, overflow:"hidden"}}>
                  {SOCIAL_STUDIO.map((v: any) => (
                    <button 
                        className="hover-scale"
                        key={v.id} 
                        onClick={() => setTab(v.id)} 
                        style={{
                          display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 14px", background:tab===v.id?"rgba(255,255,255,0.1)":"transparent",
                          border:"none", borderRadius:12, color:tab===v.id?"white":"rgba(250,247,242,0.6)", cursor:"pointer", transition: "all 0.3s ease", position:"relative"
                        }}
                    >
                        <span style={{color:tab===v.id?"#FF6B00":"currentColor", flexShrink: 0}}>{v.ic}</span>
                        <span style={{fontSize:13, fontWeight:tab===v.id?700:500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", textAlign: "left"}}>{v.lb}</span>
                        {v.soon && (
                          <span style={{background:"rgba(255,107,0,0.2)", color:"#FF6B00", padding:"1px 6px", borderRadius:4, fontSize:8, fontWeight:800, flexShrink: 0}}>SOON</span>
                        )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
              </div>

              {/* Extras Section (Analytics/Settings) */}
              <div style={{display:"flex", flexDirection:"column", gap:4}}>
                {EXTRA.map((v: any) => (
                   <button 
                      className="hover-scale"
                      key={v.id} 
                      onClick={() => setTab(v.id)} 
                      style={{
                        display:"flex", alignItems:"center", gap:14, width:"100%", padding:"10px 14px", background:tab===v.id?"rgba(255,255,255,0.1)":"transparent",
                        border:"none", borderRadius:12, color:tab===v.id?"white":"rgba(250,247,242,0.6)", cursor:"pointer", transition: "all 0.3s ease", position:"relative"
                      }}
                   >
                      <span style={{color:tab===v.id?"#FF6B00":"currentColor"}}>{v.ic}</span>
                      <span style={{fontSize:13, fontWeight:tab===v.id?700:500}}>{v.lb}</span>
                      {v.beta && <span style={{position:"absolute", right:10, background:"#9C2B4E", color:"white", fontSize:8, padding:"2px 6px", borderRadius:4, fontWeight:800, letterSpacing:0.5}}>BETA</span>}
                      {v.super && <span style={{position:"absolute", right:10, background:"#2D7A5E", color:"white", fontSize:8, padding:"2px 6px", borderRadius:4, fontWeight:800, letterSpacing:0.5}}>SUPER</span>}
                   </button>
                ))}
              </div>

                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            <div style={{padding:"20px 16px", borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <div 
                onClick={() => navigate("/profile")}
                className="hover-scale"
                style={{
                  display:"flex", alignItems:"center", gap:12, padding:12, borderRadius:16, background:"rgba(255,255,255,0.05)", cursor:"pointer", marginBottom:8
                }}
              >
                <img src={profile?.photoURL || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} alt="avatar" style={{width:36, height:36, borderRadius:12, border:"2px solid #FF6B00", objectFit:"cover"}} />
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 4}}>
                    <span style={{fontSize: 13, fontWeight: 800, color: "white", whiteSpace: "normal", wordBreak: "break-word"}}>
                      {profile?.fullName || user?.displayName || "User"}
                    </span>
                    <span style={{
                      background: (profile?.activeUntil && new Date(profile.activeUntil) > new Date()) ? "#FF6B00" : "#9C2B4E", 
                      color: "white", 
                      padding: "2px 6px", 
                      borderRadius: 4, 
                      fontSize: 9, 
                      fontWeight: 900, 
                      flexShrink: 0,
                      lineHeight: 1,
                      display: "inline-block",
                      marginTop: 2
                    }}>
                      {(profile?.activeUntil && new Date(profile.activeUntil) > new Date()) ? "PRO" : "FREE"}
                    </span>
                  </div>
                  <div style={{fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 4}}>Pengaturan Profil</div>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-hover hover-scale"
                style={{
                  width:"100%", background:"rgba(156, 43, 78, 0.1)", border:"1.5px solid rgba(156, 43, 78, 0.2)", borderRadius:12, padding:"10px", 
                  color:"#E57373", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8
                }}
              >
                <LogOut size={14}/> LOG OUT / KELUAR
              </button>
            </div>
            
            {/* Logout Confirm Modal */}
            <AnimatePresence>
              {showLogoutConfirm && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(5px)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} style={{background:"white", padding:30, borderRadius:20, width:320, textAlign:"center"}}>
                    <h3 style={{fontSize:20, fontWeight:800, color:"#2C2016", marginBottom:12, whiteSpace:"normal"}}>Keluar dari sistem?</h3>
                    <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24, whiteSpace:"normal"}}>Apakah Anda yakin ingin keluar dari akun Anda?</p>
                    <div style={{display:"flex", gap:12}}>
                      <button onClick={()=>setShowLogoutConfirm(false)} style={{flex:1, padding:12, borderRadius:12, background:"#FAFAFA", border:"1px solid rgba(44,32,22,0.1)", fontWeight:600, color:"#2C2016", cursor:"pointer"}}>Batal</button>
                      <button onClick={confirmLogout} style={{flex:1, padding:12, borderRadius:12, background:"#9C2B4E", border:"none", fontWeight:600, color:"white", cursor:"pointer"}}>Keluar</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Support Window Prototype */}
            <AnimatePresence>
              {showChatSupport && user?.uid && (
                 <ChatSupportPanel onClose={()=>setShowChatSupport(false)} userId={user.uid} userEmail={profile?.email} userProfile={profile} />
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

function ColsIcon({size}: any) { return <div style={{width:size, height:size, border:"2px solid currentColor", borderRadius:2, display:"flex"}}><div style={{flex:1, borderRight:"1px solid currentColor"}}/><div style={{flex:1}}/></div>; }

export function NavBar({tab,setTab,year,setYear,month,setMonth,onOpenAdd}: any) {
  return (
    <div style={{background:"white",borderBottom:"1px solid rgba(44,32,22,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px",height:80,position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",gap:16,alignItems:"center"}}>
        <div style={{width: 120}}><CustomDropdown value={String(year)} options={YEARS.map(y=>String(y))} onChange={(v:any)=>setYear(+v)} style={{padding:"8px 12px",borderRadius:12}} /></div>
        <div style={{width: 140}}><CustomDropdown value={String(month)} options={MONTHS.map((m,i)=>({id:String(i+1), name:m}))} onChange={(v:any)=>setMonth(+v)} style={{padding:"8px 12px",borderRadius:12}} /></div>
        <button className="hover-scale btn-hover shadow-lg" onClick={onOpenAdd} style={{...B(true,"#FF6B00"), height:46, padding:"0 28px", borderRadius:23, fontSize:14, display:"flex", alignItems:"center", gap:10, border:"none", color:"white", fontWeight:700, marginLeft:24, boxShadow:"0 6px 16px rgba(255,107,0,0.3)"}}><Plus size={22}/> Konten Baru</button>
      </div>
    </div>
  );
}

export function FilterBar({filters,setFilters,pillars,platforms,pics,statuses,showHolidays,setShowHolidays,showArchived,setShowArchived,onImportClick}: any) {
  const set = (k: any,v: any) => setFilters((p:any)=>({...p,[k]:v}));
  return (
    <div style={{background:"#FAFAFA",borderBottom:"1px solid rgba(44,32,22,0.05)",padding:"16px 40px",display:"flex",gap:24,alignItems:"center"}}>
      <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
        {[["Pillar",pillars,"pillar"], ["Platform",platforms,"platform"], ["PIC",pics,"pic"]].map(([l,opt,key])=>(
          <div key={key as string} style={{width: 160}}>
            <CustomDropdown 
              value={filters[key as string]} 
              options={[{id: "All", name: `Semua ${l}`}, ...(opt as any[])]} 
              onChange={(v)=>set(key,v)} 
              style={{padding:"8px 12px",borderRadius:12,fontSize:13,background:"white"}} 
            />
          </div>
        ))}
      </div>
      <div style={{display:"flex", gap:12}}>
        <button className="hover-scale" onClick={()=>setShowHolidays((v:any)=>!v)} style={{...B(false,"#2C2016"), background: showHolidays ? "rgba(44,32,22,0.05)" : "transparent", borderColor: showHolidays ? "rgba(44,32,22,0.2)" : "rgba(44,32,22,0.1)", fontSize:12, padding:"8px 16px", borderRadius:20}}>{showHolidays?"Tampil":"Sembunyi"} Hari Besar</button>
        <button className="hover-scale" onClick={()=>setShowArchived((v:any)=>!v)} style={{...B(false,"#FF6B00"), background: showArchived ? "rgba(255,107,0,0.05)" : "transparent", borderColor: showArchived ? "rgba(255,107,0,0.3)" : "rgba(44,32,22,0.1)", fontSize:12, padding:"8px 16px", borderRadius:20}}>📦 Arsip</button>
      </div>
      <div style={{flex:1}}/>
      <button className="hover-scale btn-hover" onClick={onImportClick} style={{...B(false,"#2C2016"), background:"white", border:"1px solid rgba(44,32,22,0.1)", height:38, padding:"0 16px", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:8}}>
        <Plus size={16} style={{opacity:0.6}}/> Import CSV
      </button>
    </div>
  );
}
