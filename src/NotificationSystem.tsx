import { useState, useEffect } from "react";
import { Bell, CalendarClock, PartyPopper, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function useNotifications(userProfile: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toast, setToast] = useState<any | null>(null);

  useEffect(() => {
    if (!userProfile) return;
    const isTrial = userProfile?.plan === "trial";
    const activeUntil = userProfile?.activeUntil ? new Date(userProfile.activeUntil) : new Date(0);
    const isExpired = new Date() > activeUntil;
    const sisaHari = Math.ceil((activeUntil.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

    const notifs: any[] = [];

    // Welcome / Payment specific
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
        icon: <CalendarClock size={20} color="#FF6B00" />,
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
        const applicableGlobal = globalNotifs.filter(n => {
          if (n.target === "all") return true;
          if (n.target === "pro" && !isExpired && !isTrial) return true;
          if (n.target === "expired" && isExpired) return true;
          return false;
        }).map(n => ({
          id: n.id,
          icon: <Bell size={20} color="#2D7A5E" />,
          title: n.title,
          desc: n.desc,
          time: new Date(n.createdAt).toLocaleDateString("id-ID"),
          unread: true // the state doesn't remember if user read it, for simplicity just make it unread.
        }));

        setNotifications(prev => {
           const others = prev.filter(p => !p.id.startsWith("global_"));
           // Add "global_" prefix to differentiate
           return [...applicableGlobal.map(ag => ({...ag, id: `global_${ag.id}`})), ...others];
        });
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
                return [...ticketNotifs, ...others];
            });
         });
      }
    });

    // Ensure state receives the local notifs first
    setNotifications(prev => [...prev.filter(p => p.id !== "pro_active" && p.id !== "welcome" && p.id !== "expired" && p.id !== "expiring_soon"), ...notifs]);

    return () => { 
       isMounted = false; 
       if (unsubGlobal) unsubGlobal();
       if (unsubTickets) unsubTickets();
    };
  }, [userProfile]);

  return { notifications, setNotifications, toast, setToast };
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

export function NotificationPanel({ notifications, onClose, onRead, onContactSupport }: { notifications: any[], onClose: () => void, onRead: (id: string) => void, onContactSupport: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: "flex", flexDirection: "column", height: "100%", whiteSpace: "normal" }}
    >
      <div style={{padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <h3 style={{margin: 0, fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:1}}>Notifikasi</h3>
        <button onClick={onClose} style={{background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display:"flex", alignItems:"center", gap:4, fontSize:11, fontWeight:600}} className="hover-scale">
          Kembali <X size={14}/>
        </button>
      </div>
      <div style={{flex: 1, overflowY: "auto", padding: "0 12px", display:"flex", flexDirection:"column", gap:8}}>
        {notifications.length === 0 && (
          <div style={{padding: 30, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12}}>Belum ada notifikasi.</div>
        )}
        {notifications.map((n) => (
          <div 
             key={n.id} 
             onClick={() => onRead(n.id)}
             style={{
               display: "flex", gap: 12, padding: 12, borderRadius: 12, 
               background: n.unread ? "rgba(255, 107, 0, 0.1)" : "transparent",
               cursor: "pointer", transition: "all 0.2s"
             }}
             className="hover:bg-[rgba(255,255,255,0.05)]"
          >
            <div style={{width: 32, height: 32, borderRadius: 16, background: "white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
              {n.icon}
            </div>
            <div>
              <div style={{fontSize: 13, fontWeight: 700, color: "white", marginBottom: 2}}>{n.title}</div>
              <div style={{fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.4, marginBottom: 4}}>{n.desc}</div>
              <div style={{fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600}}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Contact Support Link */}
      <div style={{padding:"20px", marginTop:"auto"}}>
         <button onClick={onContactSupport} style={{width:"100%", background:"none", border:"1px dashed rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.7)", padding:"12px", borderRadius:12, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s"}} className="hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.4)]">
            Hubungi Kami untuk Saran / Kendala
         </button>
      </div>
    </motion.div>
  );
}
