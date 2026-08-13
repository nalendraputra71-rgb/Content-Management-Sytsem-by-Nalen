import { useI18n } from "./i18n";
import React, { useState, useEffect } from "react";
import { Bell, CalendarClock, PartyPopper, X, ChevronDown, ChevronUp, Archive, Trash2, HelpCircle, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, collection, query, onSnapshot, orderBy, where, collectionGroup, doc, updateDoc, deleteDoc, limit } from "./firebase";

export function useNotifications(userProfile: any, isPanelOpen = false) {
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
    let unsubGlobal: any = null;
    let unsubTickets: any = null;
    let unsubInvites: any = null;
    
    let initialGlobalLoaded = false;

    if (isPanelOpen) {
      unsubGlobal = onSnapshot(collection(db, "global_notifications"), (snap) => {
        if (!isMounted) return;
        
        const isInitial = !initialGlobalLoaded;
        initialGlobalLoaded = true;

        const globalNotifs = snap.docs.map(d => ({id: d.id, ...d.data()})) as any[];
        globalNotifs.sort((a, b) => {
          const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt || 0).getTime();
          const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        
        // Filter by target
        const applicableGlobal = globalNotifs.filter((n:any) => {
          if (n.active === false) return false;
          let isMatch = false;
          if (Array.isArray(n.target)) {
            if (n.target.includes("all")) isMatch = true;
            if (n.target.includes("pro") && !isExpired && !isTrial) isMatch = true;
            if (n.target.includes("expired") && isExpired) isMatch = true;
            if (n.target.some((t: string) => t.startsWith("plan:") && userProfile?.plan === t.replace("plan:", ""))) isMatch = true;
          } else {
            if (n.target === "all") isMatch = true;
            if (n.target === "pro" && !isExpired && !isTrial) isMatch = true;
            if (n.target === "expired" && isExpired) isMatch = true;
            if (n.target?.startsWith("plan:")) {
              const targetPlan = n.target.replace("plan:", "");
              if (userProfile?.plan === targetPlan) isMatch = true;
            }
          }
          return isMatch;
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
         unsubTickets = onSnapshot(query(collection(db, "tickets"), where("userId", "==", userProfile.uid), limit(10)), (snap) => {
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
         unsubInvites = onSnapshot(query(collectionGroup(db, "members"), where("userId", "==", userProfile.uid), limit(10)), (snap) => {
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
    }

         let initialPersonalLoaded = false;
         let unsubPersonal = onSnapshot(query(collection(db, "notifications"), where("userId", "==", userProfile.uid), limit(15)), (snap) => {
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
  }, [userProfile, isPanelOpen]);

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

export function NotificationPanel({ notifications, onClose, onRead, onContactSupport, deleteNotif, deleteAll, markAllRead, onInviteAction }: { notifications: any[], onClose?: () => void, onRead: (id: string) => void, onContactSupport: () => void, deleteNotif: (id:string)=>void, deleteAll: ()=>void, markAllRead?: () => void, onInviteAction?: (wsId:string, mId:string, action:'accept'|'reject') => void }) {
  const { lang } = useI18n();
  const [filter, setFilter] = useState<'all' | 'unread' | 'invite'>('all');

  const unreadCount = notifications.filter(n => n.unread).length;

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return n.unread;
    if (filter === 'invite') return n.type === 'invite';
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[var(--theme-primary)] flex items-center justify-center font-semibold shrink-0 border border-orange-100">
            <Bell size={20} className="text-[#EA580C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                {lang === "id" ? "Pusat Notifikasi" : "Notification Center"}
              </h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-orange-100/80 text-[#EA580C] border border-orange-200/50">
                  {unreadCount} {lang === "id" ? "Baru" : "New"}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "id" ? "Daftar pembaruan akun, tiket bantuan, dan undangan workspace." : "Your account updates, support tickets, and workspace invites."}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && markAllRead && (
            <button 
              onClick={markAllRead} 
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 border border-gray-200/60 cursor-pointer"
              title={lang === "id" ? "Tandai Semua Dibaca" : "Mark all read"}
            >
              <CheckCheck size={14} className="text-emerald-600"/>
              <span>{lang === "id" ? "Tandai Dibaca" : "Mark Read"}</span>
            </button>
          )}
          
          {notifications.length > 0 && (
            <button 
              onClick={deleteAll} 
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5 border border-rose-100 cursor-pointer"
              title={lang === "id" ? "Hapus Semua" : "Clear All"}
            >
              <Trash2 size={14}/>
              <span>{lang === "id" ? "Hapus Semua" : "Clear All"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <div className="py-3 border-b border-gray-100 flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-neutral-100 text-gray-900 shadow-2xs font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {lang === "id" ? "Semua" : "All"} ({notifications.length})
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === 'unread'
                ? 'bg-neutral-100 text-gray-900 shadow-2xs font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {lang === "id" ? "Belum Dibaca" : "Unread"} ({unreadCount})
          </button>

          {notifications.some(n => n.type === 'invite') && (
            <button
              onClick={() => setFilter('invite')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filter === 'invite'
                  ? 'bg-neutral-100 text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {lang === "id" ? "Undangan" : "Invites"}
            </button>
          )}
        </div>
      )}

      {/* Main List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifs.length === 0 && (
            <motion.div 
              initial={{opacity:0, scale:0.98}} 
              animate={{opacity:1, scale:1}} 
              exit={{opacity:0, scale:0.98}} 
              className="py-16 px-4 text-center flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200/60 text-gray-400 flex items-center justify-center">
                <Bell size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">
                  {lang === "id" ? "Tidak Ada Notifikasi" : "No Notifications"}
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  {filter === 'unread' 
                    ? (lang === "id" ? "Semua notifikasi sudah Anda baca." : "You have read all notifications.")
                    : (lang === "id" ? "Belum ada notifikasi baru untuk Anda." : "No new notifications for you right now.")}
                </p>
              </div>
            </motion.div>
          )}

          {filteredNotifs.map((n) => (
            <motion.div
               layout
               initial={{opacity: 0, y: 8}}
               animate={{opacity: 1, y: 0}}
               exit={{opacity: 0, scale: 0.95}}
               key={n.id} 
               onClick={() => onRead(n.id)}
               className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex gap-3.5 items-start ${
                 n.unread 
                   ? "bg-orange-50/40 border-orange-200 shadow-2xs" 
                   : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-2xs"
               }`}
            >
              {/* Icon Container */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                n.unread ? "bg-white border-orange-100 shadow-2xs" : "bg-gray-50 border-gray-200/40"
              }`}>
                {typeof n.icon === "string" ? n.icon : React.cloneElement(n.icon as React.ReactElement<any>, { size: 16 })}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className={`text-xs font-bold ${n.unread ? "text-gray-900" : "text-gray-700"}`}>
                    {n.title}
                  </h5>
                  {n.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#EA580C] shrink-0" />
                  )}
                </div>

                <p className={`text-xs leading-relaxed ${n.unread ? "text-gray-800 font-medium" : "text-gray-600"}`}>
                  {n.desc}
                </p>

                {/* Workspace Invite Action Buttons */}
                {n.type === "invite" && (
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-200/60">
                    <button 
                      onClick={(e)=>{ e.stopPropagation(); onInviteAction?.(n.workspaceId, n.memberId, 'accept'); }} 
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      {lang === "id" ? "Terima Undangan" : "Accept Invite"}
                    </button>
                    <button 
                      onClick={(e)=>{ e.stopPropagation(); onInviteAction?.(n.workspaceId, n.memberId, 'reject'); }} 
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === "id" ? "Tolak" : "Reject"}
                    </button>
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-2 text-[10px] text-gray-400 font-medium">
                  {n.time}
                </div>
              </div>

              {/* Delete button */}
              <button 
                onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} 
                className="absolute top-3.5 right-3 text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                title={lang === "id" ? "Hapus Notifikasi" : "Delete"}
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer CS / Support link */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="text-gray-400 font-medium">
          {lang === "id" ? "Ada kendala atau masukan?" : "Have feedback or issues?"}
        </span>
        <button 
          onClick={onContactSupport} 
          className="text-[#EA580C] hover:text-[#C2410C] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <HelpCircle size={14}/>
          <span>{lang === "id" ? "Hubungi CS / Saran" : "Contact CS"}</span>
        </button>
      </div>
    </div>
  );
}
