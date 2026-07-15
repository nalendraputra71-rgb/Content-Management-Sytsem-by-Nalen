import { useI18n } from "./i18n";
import React, { useState, useEffect } from "react";
import { Bell, CalendarClock, PartyPopper, X, ChevronDown, ChevronUp, Archive, Trash2, HelpCircle, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, collection, query, onSnapshot, orderBy, where, collectionGroup, doc, updateDoc, deleteDoc } from "./firebase";

export function useNotifications(userProfile: any) {
  const { lang } = useI18n();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toast, setToast] = useState<any | null>(null);
  
  const getDeletedIds = () => JSON.parse(localStorage.getItem(`deletedNotifs_${userProfile?.uid}`) || '[]');

  const deleteNotif = (id: string) => {
    if (!userProfile) return;
    const existing = getDeletedIds();
    if(!existing.includes(id)){
      localStorage.setItem(`deletedNotifs_${userProfile.uid}`, JSON.stringify([...existing, id]));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteAll = () => {
    if (!userProfile) return;
    const activeIds = notifications.map(n => n.id);
    const existing = getDeletedIds();
    const newDeleted = [...new Set([...existing, ...activeIds])];
    localStorage.setItem(`deletedNotifs_${userProfile.uid}`, JSON.stringify(newDeleted));
    setNotifications([]);
  };

  useEffect(() => {
    if (!userProfile) return;
    const isTrial = userProfile?.plan === "trial";
    const activeUntil = userProfile?.activeUntil ? new Date(userProfile.activeUntil) : new Date(0);
    const isExpired = new Date() > activeUntil;
    const sisaHari = Math.ceil((activeUntil.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

    const notifs: any[] = [];

      const applyFilters = (arr: any[]) => {
          const deletedIds = getDeletedIds();
          return arr.filter(n => !deletedIds.includes(n.id));
      };

      if (userProfile?.hasUsedPromo) {
        notifs.push({
          id: "pro_active",
          icon: <PartyPopper size={14} color="#538135" />,
          title: lang === "id" ? "Akun PRO Aktif!" : "PRO Account Active!",
          desc: lang === "id" ? `Terima kasih telah berlangganan! Akun PRO Anda aktif sampai dengan tanggal ${activeUntil.toLocaleDateString("id-ID", {dateStyle:"medium"})}.` : `Thank you for subscribing! Your PRO account is active until ${activeUntil.toLocaleDateString("en-US", {dateStyle:"medium"})}.`,
          time: lang === "id" ? "Baru saja" : "Just now",
          unread: true
        });
      } else {
      notifs.push({
        id: "welcome",
        icon: <PartyPopper size={14} color="#3B82F6" />,
        title: lang === "id" ? "Selamat Datang!" : "Welcome!",
        desc: lang === "id" ? "Nikmati 7 hari free trial penuh fitur." : "Enjoy a 7-day full-featured free trial.",
        time: lang === "id" ? "Sistem" : "System",
        unread: true
      });
    }

    if (isExpired) {
      notifs.unshift({
        id: "expired",
        icon: <CalendarClock size={14} color="#9C2B4E" />,
        title: lang === "id" ? "Masa Aktif Berakhir" : "Subscription Expired",
        desc: lang === "id" ? "Langganan Anda telah berakhir. Silakan perpanjang paket." : "Your subscription has ended. Please renew your plan.",
        time: lang === "id" ? "Hari ini" : "Today",
        unread: true
      });
    } else if (sisaHari <= 3 && sisaHari > 0) {
      notifs.unshift({
        id: "expiring_soon",
        icon: <CalendarClock size={14} color="var(--theme-primary)" />,
        title: lang === "id" ? `Akses berakhir dalam ${sisaHari} hari!` : `Access expires in ${sisaHari} days!`,
        desc: lang === "id" ? `Segera perpanjang langganan agar alur kerja tidak terhenti.` : `Renew your subscription soon so your workflow is not interrupted.`,
        time: lang === "id" ? "Hari ini" : "Today",
        unread: true
      });
    }

    // Fetch global notifications realtime
    let isMounted = true;
    let unsubGlobal: any;
    let unsubTickets: any;
    let unsubInvites: any;
    
    let initialGlobalLoaded = false;

    
      unsubGlobal = onSnapshot(query(collection(db, "global_notifications"), orderBy("createdAt", "desc")), (snap) => {
        if (!isMounted) return;
        
        const isInitial = !initialGlobalLoaded;
        initialGlobalLoaded = true;

        const globalNotifs = snap.docs.map(d => ({id: d.id, ...d.data()})) as any[];
        
        // Filter by target
        const applicableGlobal = globalNotifs.filter((n:any) => {
          if (n.target === "all") return true;
          if (n.target === "pro" && !isExpired && !isTrial) return true;
          if (n.target === "expired" && isExpired) return true;
          return false;
        }).map((n:any) => ({
          id: `global_${n.id}`,
          icon: <Bell size={14} color="#2D7A5E" />,
          title: n.title,
          desc: n.desc,
          time: new Date(n.createdAt).toLocaleString(lang === "id" ? "id-ID" : "en-US", {dateStyle:"short", timeStyle:"short"}),
          unread: true
        }));

        setNotifications(prev => {
           const others = prev.filter(p => !p.id.startsWith("global_"));
           const newGlobal = applicableGlobal.filter(n => !prev.some(o => o.id === n.id));
           const finalNotifs = applyFilters([...applicableGlobal, ...others]);
           
           if (!isInitial && newGlobal.length > 0) {
               const dIds = getDeletedIds();
               const toastedIds = JSON.parse(localStorage.getItem(`toastedNotifs_${userProfile?.uid}`) || '[]');
               const unarchivedNew = newGlobal.filter(n => !dIds.includes(n.id) && !toastedIds.includes(n.id));
               if (unarchivedNew.length > 0 && typeof window !== "undefined") {
                   setTimeout(() => setToast(unarchivedNew[0]), 500);
                   localStorage.setItem(`toastedNotifs_${userProfile?.uid}`, JSON.stringify([...toastedIds, unarchivedNew[0].id]));
               }
           }
           return finalNotifs;
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
                     icon: <Bell size={14} color="#3B82F6" />,
                     title: lang === "id" ? "Balasan Tiket Bantuan" : "Support Ticket Reply",
                     desc: lastMsg.text,
                     time: new Date(lastMsg.timestamp).toLocaleString(lang === "id" ? "id-ID" : "en-US", {dateStyle:"short", timeStyle:"short"}),
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
                return applyFilters([...ticketNotifs, ...others]);
            });
         }, (err:any) => {
           console.warn("Tickets onSnapshot error:", err);
         });

         // Listen to workspace invites
         let initialInvitesLoaded = false;
         unsubInvites = onSnapshot(query(collectionGroup(db, "members"), where("userId", "==", userProfile.uid)), (snap) => {
            if (!isMounted) return;
            const isInitial = !initialInvitesLoaded;
            initialInvitesLoaded = true;
            
            const inviteNotifs: any[] = [];
            snap.forEach(d => {
               const data = d.data();
               if (data.status !== "pending") return; // LOCAL FILTER TO AVOID COMPOSITE INDEX ERROR
               const wsName = data.workspaceName || "Workspace Baru";
               const inviter = data.inviterName || "Seseorang";
               inviteNotifs.push({
                   id: `invite_${data.workspaceId}_${d.id}`, // the member doc id is usually user.uid, but safe to add both
                   type: "invite",
                   workspaceId: data.workspaceId,
                   memberId: d.id,
                   icon: <Bell size={14} color="#3B82F6" />,
                   title: "Undangan Workspace Baru",
                   desc: `${inviter} mengundang Anda untuk bergabung ke "${wsName}".`,
                   time: new Date(data.joinedAt || Date.now()).toLocaleString(lang === "id" ? "id-ID" : "en-US", {dateStyle:"short", timeStyle:"short"}),
                   unread: true
               });
            });

            setNotifications(prev => {
                const others = prev.filter(p => !p.id.startsWith("invite_"));
                const newInvites = inviteNotifs.filter(n => !prev.some(o => o.id === n.id));
                const finalNotifs = applyFilters([...inviteNotifs, ...others]);
                
                // Show toast for new invites
                if (!isInitial && newInvites.length > 0) {
                     // Check if not deleted and not toasted
                     const dIds = getDeletedIds();
                     const toastedIds = JSON.parse(localStorage.getItem(`toastedNotifs_${userProfile?.uid}`) || '[]');
                     
                     const unarchivedNew = newInvites.filter(n => !dIds.includes(n.id) && !toastedIds.includes(n.id));
                     if (unarchivedNew.length > 0 && typeof window !== "undefined") {
                         // wait a bit to avoid flashes
                         setTimeout(() => setToast(unarchivedNew[0]), 500); 
                         localStorage.setItem(`toastedNotifs_${userProfile?.uid}`, JSON.stringify([...toastedIds, unarchivedNew[0].id]));
                     }
                }
                return finalNotifs;
            });
         }, (err:any) => {
            console.warn("Invites onSnapshot error:", err);
         });

         let initialPersonalLoaded = false;
         let unsubPersonal = onSnapshot(query(collection(db, "notifications"), where("userId", "==", userProfile.uid)), (snap) => {
            if (!isMounted) return;
            const isInitial = !initialPersonalLoaded;
            initialPersonalLoaded = true;
            
            const personalNotifs: any[] = [];
            snap.forEach(d => {
               const data = d.data();
               personalNotifs.push({
                   id: `personal_${d.id}`,
                   type: data.type || "social",
                   icon: <Bell size={14} color="#3B82F6" />,
                   title: data.title,
                   desc: data.body,
                   link: data.link,
                   time: data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()).toLocaleString(lang === "id" ? "id-ID" : "en-US", {dateStyle:"short", timeStyle:"short"}) : new Date().toLocaleString(lang === "id" ? "id-ID" : "en-US", {dateStyle:"short", timeStyle:"short"}),
                   unread: !data.read
               });
            });
            
            // Sort by time descending
            personalNotifs.sort((a,b) => {
               const timeA = a.time.split(" ")[0].split("/").reverse().join() + a.time.split(" ")[1];
               const timeB = b.time.split(" ")[0].split("/").reverse().join() + b.time.split(" ")[1];
               return timeA < timeB ? 1 : -1;
            });

            setNotifications(prev => {
                const others = prev.filter(p => !p.id.startsWith("personal_"));
                const newPersonal = personalNotifs.filter(n => !prev.some(o => o.id === n.id));
                const finalNotifs = applyFilters([...personalNotifs, ...others]);
                
                if (!isInitial && newPersonal.length > 0) {
                     const dIds = getDeletedIds();
                     const toastedIds = JSON.parse(localStorage.getItem(`toastedNotifs_${userProfile?.uid}`) || '[]');

                     const unarchivedNew = newPersonal.filter(n => !dIds.includes(n.id) && !toastedIds.includes(n.id));
                     if (unarchivedNew.length > 0 && typeof window !== "undefined") {
                         setTimeout(() => setToast(unarchivedNew[0]), 500); 
                         localStorage.setItem(`toastedNotifs_${userProfile?.uid}`, JSON.stringify([...toastedIds, unarchivedNew[0].id]));
                     }
                }
                return finalNotifs;
            });
         }, (err:any) => {
            console.warn("Personal onSnapshot error:", err);
         });
         
         // Attach to window so we can clean it up
         (window as any)._unsubPersonal = unsubPersonal;
      }

    // Ensure state receives the local notifs first
    setNotifications(prev => applyFilters([...prev.filter(p => p.id !== "pro_active" && p.id !== "welcome" && p.id !== "expired" && p.id !== "expiring_soon"), ...notifs]));

    return () => { 
       isMounted = false; 
       if (unsubGlobal) unsubGlobal();
       if (unsubTickets) unsubTickets();
       if (unsubInvites) unsubInvites();
       if ((window as any)._unsubPersonal) (window as any)._unsubPersonal();
    };
  }, [userProfile]);

  const handleInviteAction = async (workspaceId: string, memberId: string, action: 'accept'|'reject') => {
      try {
          
          const ref = doc(db, "workspaces", workspaceId, "members", memberId);
          if (action === "accept") {
              await updateDoc(ref, { status: "active" });
          } else {
              await deleteDoc(ref);
          }
          setToast(null);
      } catch(e) {
          console.error("Failed to process invite:", e);
      }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, unread: false})));
    // Realistically you might want to call Firebase to mark them read, but for simple UI this is enough
  };

  return { notifications, setNotifications, toast, setToast, deleteNotif, deleteAll, markAllRead, handleInviteAction };
}

export function NotificationToast({ toast, onClose, onClick, onInviteAction }: { toast: any, onClose: () => void, onClick: () => void, onInviteAction?: (wsId:string, mId:string, action:'accept'|'reject') => void }) {
  const { lang } = useI18n();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded || toast?.type === "invite") return;
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [expanded, onClose, toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div 
          layout
          initial={{ opacity: 0, y: -20, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          style={{
            position: "fixed", top: 24, right: 24, zIndex: 1000, 
            background: "white", padding: "10px 16px", borderRadius: 32, 
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid rgba(44,32,22,0.05)", display: "flex", gap: 12, alignItems: "center",
            cursor: "pointer", maxWidth: "90vw", width: "max-content", margin: "0 auto"
          }}
          onClick={() => {
            onClick(); // Mark as read or open side panel
          }}
        >
          <div style={{width: 24, height: 24, borderRadius: 12, background: "rgba(44,32,22,0.05)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
            {typeof toast.icon === "string" ? toast.icon : React.cloneElement(toast.icon as React.ReactElement<any>, { size: 14 })}
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 8}}>
            <div style={{fontSize: 13, fontWeight: 700, color: "#2C2016"}}>{toast.title}</div>
            <div style={{fontSize: 13, color: "rgba(44,32,22,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200}}>
              {toast.desc}
            </div>
          </div>
          {toast.type === "invite" && (
            <div style={{display: "flex", gap: 6, marginLeft: 8}}>
                <button onClick={(e)=>{ e.stopPropagation(); onInviteAction?.(toast.workspaceId, toast.memberId, 'accept'); }} style={{padding:"6px 12px", background:"#3B82F6", border:"none", borderRadius:16, color:"white", fontSize:12, fontWeight:700, cursor:"pointer"}}>{lang === "id" ? "Terima" : "Accept"}</button>
                <button onClick={(e)=>{ e.stopPropagation(); onInviteAction?.(toast.workspaceId, toast.memberId, 'reject'); }} style={{padding:"6px 12px", background:"rgba(44,32,22,0.05)", border:"none", borderRadius:16, color:"#2C2016", fontSize:12, fontWeight:700, cursor:"pointer"}}>{lang === "id" ? "Tolak" : "Reject"}</button>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{background: "none", border: "none", cursor: "pointer", color: "rgba(44,32,22,0.3)", flexShrink:0, padding: 4, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 8}} className="hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <X size={14}/>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NotificationPanel({ notifications, onClose, onRead, onContactSupport, deleteNotif, deleteAll, markAllRead, onInviteAction }: { notifications: any[], onClose: () => void, onRead: (id: string) => void, onContactSupport: () => void, deleteNotif: (id:string)=>void, deleteAll: ()=>void, markAllRead?: () => void, onInviteAction?: (wsId:string, mId:string, action:'accept'|'reject') => void }) {
  const { lang } = useI18n();
  const visibleNotifs = notifications;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: "flex", flexDirection: "column", height: "100%", whiteSpace: "normal" }}
    >
      <div style={{padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)"}}>
        <h3 style={{margin: 0, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.8)", textTransform:"uppercase", letterSpacing:1, display:"flex", alignItems:"center", gap:8}}>
          Notifikasi
        </h3>
        <div style={{display:"flex", gap: 8, alignItems: "center"}}>
          {visibleNotifs.some(n => n.unread) && (
            <button onClick={markAllRead} style={{background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding:4, display: "flex", alignItems: "center", gap: 4}} className="hover:text-[var(--theme-primary)] transition-colors" title="Tandai Semua Dibaca">
              <CheckCheck size={14}/>
            </button>
          )}
          {visibleNotifs.length > 0 && (
            <button onClick={deleteAll} style={{background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding:4}} className="hover-scale hover:text-[var(--theme-primary)]" title="Hapus Semua">
              <Trash2 size={16}/>
            </button>
          )}
          <button onClick={onClose} style={{background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", display:"flex", alignItems:"center", justifyContent:"center", width: 24, height: 24, borderRadius: 12}} className="hover-scale" title="Kembali">
            <X size={14}/>
          </button>
        </div>
      </div>
      <div style={{flex: 1, overflowY: "auto", padding: "12px", display:"flex", flexDirection:"column", gap:8}}>
        <AnimatePresence mode="popLayout">
          {visibleNotifs.length === 0 && (
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} style={{padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12}}>
              <div style={{width: 48, height: 48, borderRadius: 24, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <Bell size={20} color="rgba(255,255,255,0.3)" />
              </div>
              <div style={{fontSize: 12, fontWeight: 500}}>{lang === "id" ? "Belum ada notifikasi." : "No notifications."}</div>
            </motion.div>
          )}
          {visibleNotifs.map((n) => (
            <motion.div
               layout
               initial={{opacity: 0, y: 10}}
               animate={{opacity: 1, y: 0}}
               exit={{opacity: 0, scale: 0.95}}
               key={n.id} 
               onClick={() => onRead(n.id)}
               style={{
                 display: "flex", gap: 12, padding: 12, borderRadius: 12, 
                 background: n.unread ? "rgba(255, 107, 0, 0.1)" : "transparent",
                 cursor: "pointer", transition: "all 0.2s", position: "relative"
               }}
               className="hover:bg-[rgba(255,255,255,0.05)] group"
            >
              <div style={{width: 28, height: 28, borderRadius: 14, background: "white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative"}}>
                {n.icon}
                {n.unread && (
                   <div style={{position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 4, background: "var(--theme-primary)", border: "2px solid #1E293B"}} />
                )}
              </div>
              <div style={{flex: 1, paddingRight: 16}}>
                <div style={{fontSize: 12, fontWeight: n.unread ? 800 : 600, color: n.unread ? "white" : "rgba(255,255,255,0.7)", marginBottom: 2}}>{n.title}</div>
                {n.unread ? (
                  <div style={{fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.4, marginBottom: 6}}>
                      {n.desc}
                      {n.type === "invite" && (
                          <div style={{display: "flex", gap: 8, marginTop: 8}}>
                              <button onClick={(e)=>{ e.stopPropagation(); onInviteAction?.(n.workspaceId, n.memberId, 'accept'); }} style={{flex:1, padding:"6px", background:"#3B82F6", border:"none", borderRadius:6, color:"white", fontSize:11, fontWeight:700, cursor:"pointer"}}>{lang === "id" ? "Terima" : "Accept"}</button>
                              <button onClick={(e)=>{ e.stopPropagation(); onInviteAction?.(n.workspaceId, n.memberId, 'reject'); }} style={{flex:1, padding:"6px", background:"rgba(255,255,255,0.1)", border:"none", borderRadius:6, color:"white", fontSize:11, fontWeight:700, cursor:"pointer"}}>{lang === "id" ? "Tolak" : "Reject"}</button>
                          </div>
                      )}
                  </div>
                ) : (
                  <div style={{fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, marginBottom: 4, ...(n.type === "invite" ? {} : {display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"})}}>
                      {n.desc}
                      {n.type === "invite" && (
                          <div style={{display: "flex", gap: 8, marginTop: 8}}>
                              <button onClick={(e)=>{ e.stopPropagation(); onInviteAction?.(n.workspaceId, n.memberId, 'accept'); }} style={{flex:1, padding:"6px", background:"#3B82F6", border:"none", borderRadius:6, color:"white", fontSize:11, fontWeight:700, cursor:"pointer"}}>{lang === "id" ? "Terima" : "Accept"}</button>
                              <button onClick={(e)=>{ e.stopPropagation(); onInviteAction?.(n.workspaceId, n.memberId, 'reject'); }} style={{flex:1, padding:"6px", background:"rgba(255,255,255,0.1)", border:"none", borderRadius:6, color:"white", fontSize:11, fontWeight:700, cursor:"pointer"}}>{lang === "id" ? "Tolak" : "Reject"}</button>
                          </div>
                      )}
                  </div>
                )}
                <div style={{fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600}}>{n.time}</div>
              </div>
              <button 
                 onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} 
                 style={{background:"none", border:"none", color:"rgba(255,255,255,0.4)", position:"absolute", top:12, right:8, cursor:"pointer", padding:4}}
                 className="opacity-0 group-hover:opacity-100 hover:text-[var(--theme-primary)] transition-all"
                 title="Hapus Notifikasi"
              >
                 <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
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
