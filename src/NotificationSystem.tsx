import { useState, useEffect } from "react";
import { Bell, CalendarClock, PartyPopper, X, ChevronDown, ChevronUp, Archive, Trash2, HelpCircle, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function useNotifications(userProfile: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toast, setToast] = useState<any | null>(null);
  
  const archiveNotif = (id: string) => {
    const existing = JSON.parse(localStorage.getItem('archivedNotifs')||'[]');
    if(!existing.includes(id)){
      localStorage.setItem('archivedNotifs', JSON.stringify([...existing, id]));
    }
    setNotifications(prev => prev.map(n => n.id === id ? {...n, isArchived: true} : n));
  };

  const archiveAll = () => {
    const activeIds = notifications.filter(n => !n.isArchived).map(n => n.id);
    const existing = JSON.parse(localStorage.getItem('archivedNotifs')||'[]');
    const newArchived = [...new Set([...existing, ...activeIds])];
    localStorage.setItem('archivedNotifs', JSON.stringify(newArchived));
    setNotifications(prev => prev.map(n => ({...n, isArchived: true})));
  };

  useEffect(() => {
    if (!userProfile) return;
    const isTrial = userProfile?.plan === "trial";
    const activeUntil = userProfile?.activeUntil ? new Date(userProfile.activeUntil) : new Date(0);
    const isExpired = new Date() > activeUntil;
    const sisaHari = Math.ceil((activeUntil.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

    const notifs: any[] = [];

      const archivedIds = JSON.parse(localStorage.getItem('archivedNotifs')||'[]');
      
      const applyArchive = (arr: any[]) => arr.map(n => ({...n, isArchived: archivedIds.includes(n.id)}));

      if (userProfile?.hasUsedPromo) {
        notifs.push({
          id: "pro_active",
          icon: <PartyPopper size={20} color="#538135" />,
          title: "Akun PRO Aktif!",
          desc: `Terima kasih telah berlangganan! Akun PRO Anda aktif sampai dengan tanggal ${activeUntil.toLocaleDateString("id-ID", {dateStyle:"medium"})}.`,
          time: "Baru saja",
          unread: true
        });
      } else {
      notifs.push({
        id: "welcome",
        icon: <PartyPopper size={20} color="#FF6B00" />,
        title: "Selamat Datang!",
        desc: "Nikmati 7 hari free trial penuh fitur.",
        time: "Sistem",
        unread: true
      });
    }

    if (isExpired) {
      notifs.unshift({
        id: "expired",
        icon: <CalendarClock size={20} color="#9C2B4E" />,
        title: "Masa Aktif Berakhir",
        desc: "Langganan Anda telah berakhir. Silakan perpanjang paket.",
        time: "Hari ini",
        unread: true
      });
    } else if (sisaHari <= 3 && sisaHari > 0) {
      notifs.unshift({
        id: "expiring_soon",
        icon: <CalendarClock size={20} color="var(--theme-primary)" />,
        title: `Akses berakhir dalam ${sisaHari} hari!`,
        desc: `Segera perpanjang langganan agar alur kerja tidak terhenti.`,
        time: "Hari ini",
        unread: true
      });
    }

    // Fetch global notifications realtime
    let isMounted = true;
    let unsubGlobal: any;
    let unsubTickets: any;
    
    import("./firebase").then(({ db, collection, query, onSnapshot, orderBy, where }) => {
      unsubGlobal = onSnapshot(query(collection(db, "global_notifications"), orderBy("createdAt", "desc")), (snap) => {
        if (!isMounted) return;
        const globalNotifs = snap.docs.map(d => ({id: d.id, ...d.data()})) as any[];
        
        // Filter by target
        const applicableGlobal = globalNotifs.filter((n:any) => {
          if (n.target === "all") return true;
          if (n.target === "pro" && !isExpired && !isTrial) return true;
          if (n.target === "expired" && isExpired) return true;
          return false;
        }).map((n:any) => ({
          id: `global_${n.id}`,
          icon: <Bell size={20} color="#2D7A5E" />,
          title: n.title,
          desc: n.desc,
          time: new Date(n.createdAt).toLocaleDateString("id-ID"),
          unread: true
        }));

        setNotifications(prev => {
           const others = prev.filter(p => !p.id.startsWith("global_"));
           return applyArchive([...applicableGlobal, ...others]);
        });
      }, (err:any) => {
        console.warn("Global_notifications onSnapshot error:", err);
      });

      // Listen to user tickets too
      if (userProfile.uid) {
         unsubTickets = onSnapshot(query(collection(db, "tickets"), where("userId", "==", userProfile.uid)), (snap) => {
            if (!isMounted) return;
            const ticketNotifs: any[] = [];
            snap.forEach(d => {
               const data = d.data();
               const messages = data.messages || [];
               const lastMsg = messages[messages.length - 1];
               // If last message is from admin, show notification
               if (lastMsg && lastMsg.sender === "admin") {
                  ticketNotifs.push({
                     id: `ticket_${d.id}`,
                     icon: <Bell size={20} color="#FF6B00" />,
                     title: "Balasan Tiket Bantuan",
                     desc: lastMsg.text,
                     time: new Date(lastMsg.timestamp).toLocaleString("id-ID", {dateStyle:"short", timeStyle:"short"}),
                     unread: !data.readByUser
                  });
               }
            });
            
            // Sort by time descending
            ticketNotifs.sort((a,b) => {
               const timeA = a.time.split(" ")[0].split("/").reverse().join() + a.time.split(" ")[1];
               const timeB = b.time.split(" ")[0].split("/").reverse().join() + b.time.split(" ")[1];
               return timeA < timeB ? 1 : -1;
            });

            setNotifications(prev => {
                const others = prev.filter(p => !p.id.startsWith("ticket_"));
                return applyArchive([...ticketNotifs, ...others]);
            });
         }, (err:any) => {
           console.warn("Tickets onSnapshot error:", err);
         });
      }
    });

    // Ensure state receives the local notifs first
    setNotifications(prev => applyArchive([...prev.filter(p => p.id !== "pro_active" && p.id !== "welcome" && p.id !== "expired" && p.id !== "expiring_soon"), ...notifs]));

    return () => { 
       isMounted = false; 
       if (unsubGlobal) unsubGlobal();
       if (unsubTickets) unsubTickets();
    };
  }, [userProfile]);

  return { notifications, setNotifications, toast, setToast, archiveNotif, archiveAll };
}

export function NotificationToast({ toast, onClose, onClick }: { toast: any, onClose: () => void, onClick: () => void }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) return;
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [expanded, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -50, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          style={{
            position: "fixed", top: 20, right: 20, zIndex: 1000, 
            background: "white", padding: 16, borderRadius: 16, 
            width: expanded ? 320 : "auto", maxWidth: "calc(100vw - 40px)", boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "1px solid rgba(44,32,22,0.05)", display: "flex", gap: 16, alignItems: "flex-start",
            cursor: expanded ? "default" : "pointer", overflow: "hidden"
          }}
          onClick={() => {
            if (!expanded) {
              setExpanded(true);
              onClick(); // Mark as read or open side panel
            }
          }}
        >
          <div style={{width: 36, height: 36, borderRadius: 18, background: "#FAFAFA", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
            {toast.icon}
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontSize: 14, fontWeight: 700, color: "#2C2016", marginBottom: 4}}>{toast.title}</div>
            {expanded ? (
               <motion.div initial={{height:0, opacity:0}} animate={{height:"auto", opacity:1}} style={{fontSize:12, color:"rgba(44,32,22,0.6)", lineHeight:1.5}}>
                 {toast.desc}
               </motion.div>
            ) : (
               <div style={{fontSize: 12, color: "rgba(44,32,22,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                 {toast.desc}
               </div>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{background: "none", border: "none", cursor: "pointer", color: "rgba(44,32,22,0.4)"}}>
            <X size={16}/>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NotificationPanel({ notifications, onClose, onRead, onContactSupport, archiveNotif, archiveAll }: { notifications: any[], onClose: () => void, onRead: (id: string) => void, onContactSupport: () => void, archiveNotif: (id:string)=>void, archiveAll: ()=>void }) {
  const [viewArchived, setViewArchived] = useState(false);
  const visibleNotifs = notifications.filter(n => !!n.isArchived === viewArchived);
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: "flex", flexDirection: "column", height: "100%", whiteSpace: "normal" }}
    >
      <div style={{padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)"}}>
        <h3 style={{margin: 0, fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.8)", textTransform:"uppercase", letterSpacing:1, display:"flex", alignItems:"center", gap:8}}>
          {viewArchived ? <Archive size={16}/> : <Bell size={16}/>}
          {viewArchived ? "Arsip" : "Notifikasi"}
        </h3>
        <div style={{display:"flex", gap: 8, alignItems: "center"}}>
          {!viewArchived && visibleNotifs.length > 0 && (
            <button onClick={archiveAll} style={{background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding:4}} className="hover-scale hover:text-[var(--theme-primary)]" title="Hapus Semua">
              <CheckCheck size={16}/>
            </button>
          )}
          <button onClick={() => setViewArchived(!viewArchived)} style={{background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding:4}} className="hover-scale hover:text-white" title={viewArchived ? "Lihat Notifikasi" : "Lihat Arsip"}>
             {viewArchived ? <Bell size={16}/> : <Archive size={16}/>}
          </button>
          <button onClick={onClose} style={{background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", display:"flex", alignItems:"center", justifyContent:"center", width: 24, height: 24, borderRadius: 12}} className="hover-scale" title="Kembali">
            <X size={14}/>
          </button>
        </div>
      </div>
      <div style={{flex: 1, overflowY: "auto", padding: "12px", display:"flex", flexDirection:"column", gap:8}}>
        {visibleNotifs.length === 0 && (
          <div style={{padding: 30, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12}}>Belum ada {viewArchived ? "arsip " : ""}notifikasi.</div>
        )}
        {visibleNotifs.map((n) => (
          <div 
             key={n.id} 
             onClick={() => onRead(n.id)}
             style={{
               display: "flex", gap: 12, padding: 12, borderRadius: 12, 
               background: (!n.isArchived && n.unread) ? "rgba(255, 107, 0, 0.1)" : "transparent",
               cursor: "pointer", transition: "all 0.2s", position: "relative"
             }}
             className="hover:bg-[rgba(255,255,255,0.05)] group"
          >
            <div style={{width: 32, height: 32, borderRadius: 16, background: "white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
              {n.icon}
            </div>
            <div style={{flex: 1, paddingRight: 16}}>
              <div style={{fontSize: 13, fontWeight: (!n.isArchived && n.unread) ? 800 : 600, color: (!n.isArchived && n.unread) ? "white" : "rgba(255,255,255,0.7)", marginBottom: 2}}>{n.title}</div>
              {(!n.isArchived && n.unread) ? (
                <div style={{fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.4, marginBottom: 6}}>{n.desc}</div>
              ) : (
                <div style={{fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"}}>{n.desc}</div>
              )}
              <div style={{fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600}}>{n.time}</div>
            </div>
            {!viewArchived && (
              <button 
                 onClick={(e) => { e.stopPropagation(); archiveNotif(n.id); }} 
                 style={{background:"none", border:"none", color:"rgba(255,255,255,0.4)", position:"absolute", top:12, right:8, cursor:"pointer", padding:4}}
                 className="opacity-0 group-hover:opacity-100 hover:text-[var(--theme-primary)] transition-all"
                 title="Arsipkan Notifikasi"
              >
                 <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer Area */}
      <div style={{padding:"16px", marginTop:"auto", borderTop: "1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"center"}}>
         <button onClick={onContactSupport} style={{display:"flex", alignItems:"center", gap: 8, background:"none", border:"none", color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s"}} className="hover:text-white" title="Hubungi Kami untuk Saran dan Kendala">
            <HelpCircle size={16}/> CS / Saran
         </button>
      </div>
    </motion.div>
  );
}
