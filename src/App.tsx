import { useState, useEffect, useMemo, useRef } from "react";
import { HashRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { 
  MONTHS, YEARS, DP, DPL, DPIC, DST, DH, 
  gid, eng, fmtD, fmtT, emptyItem, makeSeed, 
  I, B, CARD
} from "./data";

import { 
  auth, db, onAuthStateChanged, signOut,
  doc, setDoc, getDoc, collection, collectionGroup, query, onSnapshot, deleteDoc, writeBatch, updateDoc,
  handleFirestoreError, testFirestoreConnection, where
} from "./firebase";

import { Header, NavBar, FilterBar, Sidebar } from "./Nav";
import { MonthView, WeekView, BoardView, TimelineView, TableView } from "./Views";
import { AnalyticsView } from "./AnalyticsView";
import { SocialStudioView } from "./SocialStudioView";
import { SettingsPanel } from "./SettingsPanel";
import { AdminPanel } from "./AdminPanel";
import { ContentModal } from "./ContentModal";
import { CsvModal } from "./CsvModal";
import { AuthScreen } from "./AuthScreen";
import { UserProfile } from "./UserProfile";
import { BillingView } from "./BillingView";
import { ShareWorkspaceModal } from "./ShareWorkspaceModal";

import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    testFirestoreConnection();
    let unsubProfile: any = null;
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          // Check profile existence first to prevent flicker
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
             setProfile(snap.data());
             if (snap.data().emailVerified !== u.emailVerified) {
               await setDoc(doc(db, "users", u.uid), { emailVerified: u.emailVerified }, { merge: true });
             }
          }
          
          // Listen to profile for real-time updates
          unsubProfile = onSnapshot(doc(db, "users", u.uid), (snap) => {
            if (snap.exists()) setProfile(snap.data());
          });
          setUser(u);
        } else {
          if (unsubProfile) unsubProfile();
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => { unsubAuth(); if (unsubProfile) unsubProfile(); };
  }, []);

  if (authLoading) return <LoadingScreen />;

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={(user && profile) ? <Navigate to="/" /> : <AuthScreen currentUser={user && !profile ? user : null} onUserCreated={(u)=>setUser(u)} />} />
        <Route path="/profile" element={(user && profile) ? <CMSLayout><UserProfile userProfile={profile} activeWorkspace={null} onUpdate={setProfile} /></CMSLayout> : <Navigate to="/login" />} />
        <Route path="/billing" element={(user && profile) ? <CMSLayout><BillingView userProfile={profile} activeWorkspace={null} onUpdate={setProfile} /></CMSLayout> : <Navigate to="/login" />} />
        <Route path="/*" element={(user && profile) ? <CMSLayout><Dashboard user={user} profile={profile} /></CMSLayout> : <Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
}

function LoadingScreen({ title }: { title?: string }) {
  return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FAFAFA",flexDirection:"column",gap:24}}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        style={{
          width: 50, height: 50, borderRadius: "50%",
          border: "4px solid rgba(255, 107, 0, 0.2)",
          borderTopColor: "#FF6B00"
        }}
      />
      <div style={{fontFamily:"'Inter', sans-serif",fontSize:24,color:"#2C2016",fontWeight:800}}>{title || "CMS Console"}</div>
    </div>
  );
}

function CMSLayout({ children }: any) {
  return (
    <div style={{fontFamily:"'Inter', sans-serif",background:"#FAFAFA",minHeight:"100vh",color:"#2C2016"}}>
      {children}
    </div>
  );
}

function Dashboard({ user, profile }: any) {
  const [tab, setTab]           = useState("month");
  const [workspace, setWorkspace] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [content, setContent]   = useState<any[]>([]);
  const [wsLoading, setWsLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [year, setYear]         = useState(new Date().getFullYear());
  const [month, setMonth]       = useState(new Date().getMonth() + 1);
  const [modal, setModal]       = useState<any>(null);
  const [saveMsg, setSaveMsg]   = useState("");
  const [search, setSearch]     = useState("");
  const [confirmAction, setConfirmAction] = useState<{title:string, msg:string, onConfirm:()=>void}|null>(null);
  const [shareModal, setShareModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const workspaceRef = useRef(workspace);

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  const [showHolidays, setShowHolidays] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters]   = useState({pillar:"All",platform:"All",pic:"All",status:"All"});
  const [title, setTitle]       = useState("Your Company");
  const [tagline, setTagline]   = useState("Content Management System");
  const [headerImage, setHeaderImage] = useState<string|null>(null);
  const [headerStyle, setHeaderStyle] = useState({
    titleColor: "#C4622D", taglineColor: "#FAF7F2", subtitleColor: "rgba(250,247,242,0.8)",
    bgColor: "#2C2016", titleFont: "inherit", taglineFont: "inherit", subtitleFont: "inherit"
  });
  const [qYear, setQYear]       = useState(new Date().getFullYear());
  const [qNumber, setQNumber]   = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [showCsv, setShowCsv]   = useState(false);

  const [pillars, setPillars]   = useState(DP);
  const [platforms, setPlatforms] = useState(DPL);
  const [pics, setPics]         = useState(DPIC);
  const [statuses, setStatuses] = useState(DST);
  const [holidays, setHolidays] = useState(DH);

  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [exportModal, setExportModal] = useState(false);
  const [exStart, setExStart] = useState("");
  const [exEnd, setExEnd] = useState("");

  const isRestricted = useMemo(() => {
    if (!profile?.activeUntil) return false;
    return new Date() > new Date(profile.activeUntil);
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    setWsLoading(true);
    const q = query(collectionGroup(db, "members"), where("userId", "==", user.uid));
    
    let wsUnsubs: (() => void)[] = [];

    const unsubMembers = onSnapshot(q, (snap) => {
      try {
        const wsIds = snap.docs.map(d => (d.data() as any).workspaceId).filter(id => !!id);
        
        // Cleanup previous listeners
        wsUnsubs.forEach(u => u());
        wsUnsubs = [];

        if (wsIds.length === 0) {
          setWorkspaces([]);
          setWsLoading(false);
          return;
        }

        const results: Record<string, any> = {};
        const pendingIds = new Set(wsIds);

        wsIds.forEach(id => {
          const u = onSnapshot(doc(db, "workspaces", id), (wsSnap) => {
            if (wsSnap.exists()) {
              results[id] = { ...wsSnap.data(), id: wsSnap.id };
            } else {
              delete results[id];
            }
            pendingIds.delete(id);
            
            // Only update state once we have checked all initial documents
            if (pendingIds.size === 0) {
              const list = wsIds.map(wid => results[wid]).filter(w => !!w);
              setWorkspaces(list);
              
              const currentWs = workspaceRef.current;
              if (list.length > 0) {
                if (!currentWs || !list.find(w => w.id === currentWs.id)) {
                  setWorkspace(list[0]);
                }
              }
              setWsLoading(false);
            }
          }, (err) => {
            console.error(`Workspace ${id} fetch error:`, err);
            pendingIds.delete(id);
            if (pendingIds.size === 0) {
              const listArr = wsIds.map(wid => results[wid]).filter(w => !!w);
              setWorkspaces(listArr);
              setWsLoading(false);
            }
          });
          wsUnsubs.push(u);
        });

      } catch (err) {
        console.error("Workspace processing error:", err);
        setWsLoading(false);
      }
    }, (error) => {
      console.error("onSnapshot CollectionGroup error:", error);
      setErrorMsg(error.message);
      setWsLoading(false);
    });

    return () => {
      unsubMembers();
      wsUnsubs.forEach(u => u());
    };
  }, [user]);

  useEffect(() => {
    if (!workspace?.id || !user?.uid) return;
    setContentLoading(true);
    const wsRef = doc(db, "workspaces", workspace.id);
    const unsubWs = onSnapshot(wsRef, (snap) => {
       const data = snap.data();
       if (data) {
          // Update current workspace state with fresh data from DB
          setWorkspace((prev: any) => {
             if (JSON.stringify(prev?.settings) === JSON.stringify(data.settings) && prev?.name === data.name) return prev;
             return { ...prev, ...data, id: snap.id };
          });
          
          if (data.settings) {
            setTitle(data.settings.title !== undefined ? data.settings.title : "Your Company");
            setTagline(data.settings.tagline !== undefined ? data.settings.tagline : "Content Management System");
            
            // Real-time synchronization for all settings categories
            if (data.settings.pillars) setPillars(data.settings.pillars);
            if (data.settings.platforms) setPlatforms(data.settings.platforms);
            if (data.settings.pics) setPics(data.settings.pics);
            if (data.settings.statuses) setStatuses(data.settings.statuses);
            if (data.settings.holidays) setHolidays(data.settings.holidays);
            if (data.settings.headerImage !== undefined) setHeaderImage(data.settings.headerImage);
            if (data.settings.headerStyle) setHeaderStyle(data.settings.headerStyle);
          }
       }
    });

    const contentRef = collection(db, "workspaces", workspace.id, "content");
    const unsubContent = onSnapshot(query(contentRef), (snap) => {
      setContent(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      setContentLoading(false);
    }, (e) => {
      handleFirestoreError(e, 'list', contentRef.path);
      setContentLoading(false);
    });

    return () => { unsubWs(); unsubContent(); };
  }, [workspace?.id, user?.uid]);

  const handleSave = async (data: any) => {
    console.log("handleSave called with data:", data);
    if (!workspace) {
        console.error("Workspace is null");
        return;
    }
    if (isRestricted) {
      alert("Akses Terbatas: Fitur ini dikunci.");
      return;
    }
    const isNew = modal.mode === "add";
    const itemId = isNew ? gid() : data.id;
    
    // Clean up undefined values before saving to Firestore to prevent silent or synchronous failures
    const cleanData = { ...data };
    Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === undefined) {
            delete cleanData[key];
        }
    });

    const itemData = { ...cleanData, id: itemId, workspaceId: workspace.id, userId: user?.uid || "" };
    console.log("Cleaned itemData:", itemData);
    
    try {
      await setDoc(doc(db, "workspaces", workspace.id, "content", itemId), itemData, { merge: true });
      console.log("Save successful!");
      setModal(null);
    } catch (e: any) { 
      console.error("Save Error:", e);
      alert("Gagal menyimpan data: " + e.message);
      handleFirestoreError(e, isNew?'create':'update'); 
    }
  };

  const openEdit = (item:any) => setModal({mode:"edit",data:{...item,metrics:{...item.metrics}}});
  const openAdd  = (day:any) => {
    if (isRestricted) return alert("Akses Terbatas: Fitur ini dikunci pada masa uji coba yang telah habis.");
    setModal({mode:"add",data:emptyItem(year,month,day,pillars,platforms,pics,statuses)});
  };
  const deleteItem = async (id:string) => { 
    if(!workspace || !id || isRestricted) return;
    setConfirmAction({
      title: "Hapus Konten?",
      msg: "Yakin ingin menghapus permanen konten ini? Tindakan ini tidak dapat dikembalikan.",
      onConfirm: async () => {
        try {
          const docRef = doc(db, "workspaces", workspace.id, "content", id);
          await deleteDoc(docRef); 
          setModal(null); 
          setSaveMsg("Konten berhasil dihapus secara permanen.");
          setTimeout(()=>setSaveMsg(""), 3000);
        } catch (e: any) {
          handleFirestoreError(e, 'delete');
        }
      }
    });
  };

  const archiveItem = async (id:string) => {
    if(!workspace || !id) return;
    try {
      const docRef = doc(db, "workspaces", workspace.id, "content", id);
      await setDoc(docRef, { archived: true, updatedAt: new Date().toISOString() }, { merge: true });
      setModal(null);
      setSaveMsg("Konten berhasil diarsipkan.");
      setTimeout(()=>setSaveMsg(""), 3000);
    } catch (e: any) {
      handleFirestoreError(e, 'update');
    }
  };

  const unarchiveItem = async (id:string) => {
    if(!workspace || !id) return;
    try {
      const docRef = doc(db, "workspaces", workspace.id, "content", id);
      await setDoc(docRef, { archived: false, updatedAt: new Date().toISOString() }, { merge: true });
      setModal(null);
      setSaveMsg("Konten berhasil dipulihkan ke kalender.");
      setTimeout(()=>setSaveMsg(""), 3000);
    } catch (e: any) {
      handleFirestoreError(e, 'update');
    }
  };

  const handleBulkActions = async (type: string) => {
    if (!workspace || bulkIds.length === 0 || isRestricted) return;
    
    setConfirmAction({
      title: type === "delete" ? "Hapus Massal?" : type === "restore" ? "Pulihkan Massal?" : "Arsipkan Massal?",
      msg: `Apakah Anda yakin ingin ${type === "delete" ? "menghapus permanen" : type === "restore" ? "memulihkan" : "mengarsipkan"} ${bulkIds.length} konten?`,
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          bulkIds.forEach(id => {
            const ref = doc(db, "workspaces", workspace.id, "content", id);
            if (type === "delete") {
              batch.delete(ref);
            } else if (type === "restore") {
              batch.update(ref, { archived: false });
            } else {
              batch.update(ref, { archived: true });
            }
          });
          await batch.commit();
          setBulkIds([]);
          const actionName = type === "delete" ? "menghapus" : type === "restore" ? "memulihkan" : "mengarsipkan";
          setSaveMsg(`Berhasil ${actionName} ${bulkIds.length} konten.`);
          setTimeout(()=>setSaveMsg(""), 3000);
        } catch (e) {
          handleFirestoreError(e, 'write');
        }
      }
    });
  };

  const updateWsSettings = async (updates: any) => {
    if (!workspace) return;
    try {
      const wsRef = doc(db, "workspaces", workspace.id);
      const fsUpdates: any = {};
      Object.keys(updates).forEach(k => {
        fsUpdates[`settings.${k}`] = updates[k];
        if (k === "title") fsUpdates.name = updates[k];
      });
      await updateDoc(wsRef, fsUpdates);
      
      if (updates.title) {
        document.title = updates.title;
      }
    } catch (e: any) {
      console.error("Update settings error:", e);
      handleFirestoreError(e, 'update');
    }
  };

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  const handleBulkImport = async (items: any[]) => {
    if (!workspace) return;
    try {
      const CHUNK_SIZE = 450;
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const id = item.id || gid();
          const ref = doc(db, "workspaces", workspace.id, "content", id);
          batch.set(ref, { 
            ...item, 
            id, 
            workspaceId: workspace.id, 
            userId: user.uid,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
        await batch.commit();
      }
      setSaveMsg(`Berhasil mengimpor ${items.length} konten.`);
      setTimeout(()=>setSaveMsg(""), 3000);
    } catch (e) {
      handleFirestoreError(e, 'write');
    }
  };

  const monthContent = content.filter(c=>c.year===year&&c.month===month);
  const filtered = useMemo(()=> {
    let items = search ? content.filter(c=>[c.title,c.caption].join(" ").toLowerCase().includes(search.toLowerCase())) : monthContent;
    return items.filter((c:any)=>(filters.pillar==="All"||c.pillar===filters.pillar)&&(filters.platform==="All"||c.platform===filters.platform)&&(filters.pic==="All"||c.pic===filters.pic)&&(filters.status==="All"||c.status===filters.status));
  },[monthContent,content,search,filters]);

  const provLock = useRef(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (wsLoading) return <LoadingScreen title={title} />;

  if (workspaces.length === 0) {
    return (
      <div style={{height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#FAFAFA", flexDirection:"column", gap:20, padding:40, textAlign:"center"}}>
        <div style={{ fontSize:24, color:"#2C2016", fontWeight:800, letterSpacing:"-0.5px"}}>
          {errorMsg.includes("index") ? "Indeks Database Sedang Disiapkan..." : "Mempersiapkan Workspace Anda..."}
        </div>
        {!errorMsg.includes("index") && <div style={{width:40, height:40, border:"3px solid #FF6B00", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite"}}/>}
        
        {errorMsg && (
          <div style={{maxWidth:500, fontSize:13, color:"#9C2B4E", background:"#F8EAF0", padding:16, borderRadius:12, fontWeight:500}}>
             {errorMsg.includes("index") ? 
               "Firebase sedang membuat indeks untuk pencarian workspace. Proses ini biasanya memakan waktu 1-2 menit. Silakan tunggu sebentar dan refresh halaman ini." : 
               `Oops! Terjadi kendala: ${errorMsg}`}
          </div>
        )}
        
        {errorMsg.includes("index") && (
          <button onClick={()=>window.location.reload()} className="hover-scale" style={{...B(true), padding:"10px 24px", borderRadius:24}}>Coba Refresh Sekarang</button>
        )}
        
        <button onClick={()=>signOut(auth)} className="hover-scale" style={{...B(false), fontSize:13, borderRadius:24, marginTop:12}}>Batal & Logout</button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{display:"flex", minHeight:"100vh", background:"#FAF7F2"}}>
      <Sidebar 
        open={sidebarOpen} tab={tab} setTab={setTab} 
        workspaces={workspaces} activeWorkspace={workspace} onWorkspaceSelect={setWorkspace} 
        user={user} profile={profile} onLogout={()=>signOut(auth)}
        title={title}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      <div style={{flex:1, minWidth:0, display:"flex", flexDirection:"column"}}>
        <Header 
          title={title} tagline={tagline}
          onBrandingChange={(v:any)=>updateWsSettings(v)}
          headerImage={headerImage} onHeaderImageChange={(v:string)=>updateWsSettings({headerImage:v})}
          headerStyle={headerStyle} setHeaderStyle={(v:any)=>updateWsSettings({headerStyle:v})}
          content={content} qYear={qYear} onQYearChange={setQYear} qNumber={qNumber} onQNumberChange={setQNumber}
          onExport={()=>setExportModal(true)} onImportClick={()=>setShowCsv(true)} 
          user={user} onShare={()=>setShareModal(true)}
          sidebarOpen={sidebarOpen} onToggleSidebar={()=>setSidebarOpen(!sidebarOpen)}
          search={search} onSearch={setSearch}
        />
      
      {["month", "board", "timeline", "table"].includes(tab) && (
        <NavBar tab={tab} setTab={setTab} year={year} setYear={setYear} month={month} setMonth={setMonth} onOpenAdd={()=>openAdd(1)} isRestricted={isRestricted}/>
      )}
      
      {["month", "board", "timeline", "table"].includes(tab) && (
        <FilterBar 
          filters={filters} setFilters={setFilters} 
          pillars={pillars} platforms={platforms} pics={pics} statuses={statuses} 
          showHolidays={showHolidays} setShowHolidays={setShowHolidays} 
          showArchived={showArchived} setShowArchived={setShowArchived}
          onImportClick={()=>setShowCsv(true)}
          isRestricted={isRestricted}
        />
      )}

      <div style={{padding:"20px 24px 56px", position: "relative"}}>
        {isRestricted && (
          <div style={{background:"#F8EAF0",border:"1px solid #9C2B4E",color:"#9C2B4E",padding:"12px 24px",borderRadius:12,marginBottom:24,display:"flex",alignItems:"center",gap:12,fontWeight:600}}>
            🔒 Mode Terbatas: Masa aktif Anda telah habis. <span style={{flex:1}}></span>
            <button onClick={()=>window.location.hash="/billing"} style={{background:"#9C2B4E",color:"#fff",padding:"8px 16px",borderRadius:8,fontSize:14,border:"none",cursor:"pointer"}}>Berlangganan Untuk Selengkapnya</button>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 5, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.99 }} transition={{ duration: 0.15, ease: "easeOut" }}>
            {tab==="month"&&<MonthView year={year} month={month} monthContent={monthContent} filtered={filtered} openEdit={openEdit} openAdd={openAdd} showHolidays={showHolidays} holidays={holidays} pillars={pillars} platforms={platforms} isRestricted={isRestricted}/>}
            {tab==="week"&&<WeekView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} showHolidays={showHolidays} holidays={holidays} pillars={pillars} platforms={platforms} isRestricted={isRestricted}/>}
            {tab==="board"&&<BoardView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} statuses={statuses} pillars={pillars} platforms={platforms} search={search} isRestricted={isRestricted}/>}
            {tab==="timeline"&&<TimelineView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} pillars={pillars} platforms={platforms} showHolidays={showHolidays} holidays={holidays} isRestricted={isRestricted}/>}
            {tab==="table"&&<TableView filtered={filtered} openEdit={openEdit} archiveItem={archiveItem} unarchiveItem={unarchiveItem} deleteItem={deleteItem} pillars={pillars} platforms={platforms} showArchived={showArchived} search={search} bulkIds={bulkIds} setBulkIds={setBulkIds} onBulk={handleBulkActions} isRestricted={isRestricted}/>}
            {tab.startsWith("social")&&<SocialStudioView tab={tab} />}
            {tab==="analytics"&&<AnalyticsView content={content} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses} openEdit={openEdit} isRestricted={isRestricted}/>}
            {tab==="settings"&&<SettingsPanel 
              initialSettings={{pillars, platforms, pics, statuses, holidays}} 
              onSave={updateWsSettings}
              onSeed={() => setContent(makeSeed())} 
              isRestricted={isRestricted}
            />}
            {tab==="admin"&&<AdminPanel userProfile={profile} onLogout={()=>signOut(auth)} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {shareModal && <ShareWorkspaceModal key="share" workspace={workspace} onClose={()=>setShareModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {modal && <ContentModal key="content" modal={modal} onSave={handleSave} onClose={()=>setModal(null)} onArchive={archiveItem} onRestore={unarchiveItem} onDelete={deleteItem} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses} isRestricted={isRestricted}/>}
      </AnimatePresence>
      <AnimatePresence>
        {showCsv && <CsvModal key="csv" onClose={()=>setShowCsv(false)} onImport={handleBulkImport} workspaceId={workspace?.id} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses} existingContent={content} />}
      </AnimatePresence>
      <AnimatePresence>
        {exportModal && <motion.div key="export" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center"}}>
          <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={CARD({width:400, padding:32, borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.2)"})}>
             <h3 style={{fontSize:20, fontWeight:700, marginBottom:16}}>Ekspor Data (XLSX)</h3>
             <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24, lineHeight:1.5}}>Unduh seluruh data konten dalam format Excel (XLSX) untuk workspace <strong style={{color:"#FF6B00"}}>{workspace?.name}</strong>.</p>
             <button className="btn-hover hover-scale" onClick={() => {
                const exportData = content.map((c: any) => ({
                    "Judul Konten": c.title || "",
                    "Tanggal (1-31)": c.day || 1,
                    "Bulan (1-12)": c.month || 1,
                    "Tahun": c.year || 2025,
                    "Jam (0-23)": c.uploadHour || 9,
                    "Menit": c.uploadMinute || 0,
                    "Pillar": c.pillar || "",
                    "Platform": c.platform || "",
                    "PIC": c.pic || "",
                    "Status": c.status || "",
                    "Ads (Y/N)": c.isAds ? "Y" : "N",
                    "Views": c.metrics?.views || 0,
                    "Reach": c.metrics?.reach || 0,
                    "Likes": c.metrics?.likes || 0,
                    "Comments": c.metrics?.comments || 0,
                    "Shares": c.metrics?.shares || 0,
                    "Saves": c.metrics?.saves || 0,
                    "Objective": c.objective || "",
                    "Brief Konten": c.briefCopywriting || "",
                    "Caption": c.caption || ""
                }));
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Content");
                XLSX.writeFile(wb, `Export_${workspace?.name}.xlsx`);
                setExportModal(false);
             }} style={{...B(true, "#FF6B00"), width:"100%", height:48, marginBottom:12, fontSize:14, borderRadius:24}}>Unduh File Excel</button>
             <button className="hover-scale" onClick={()=>setExportModal(false)} style={{...B(false), width:"100%", height:48, fontSize:14, borderRadius:24}}>Batal</button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {confirmAction && (
          <motion.div key="confirm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <motion.div initial={{scale:0.95, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0, y:20}} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={CARD({width:400, padding:32, borderRadius:24, boxShadow:"0 20px 40px rgba(0,0,0,0.2)", textAlign:"center"})}>
               <h3 style={{fontSize:20, fontWeight:700, marginBottom:16, color: confirmAction.title.includes("Hapus") ? "#9C2B4E" : "#2C2016"}}>{confirmAction.title}</h3>
               <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:24, lineHeight:1.5}}>{confirmAction.msg}</p>
               <div style={{display:"flex",gap:12,justifyContent:"center"}}>
                 <button className="hover-scale" onClick={()=>setConfirmAction(null)} style={{...B(false), flex:1, height:48, fontSize:14, borderRadius:24}}>Batal</button>
                 <button className="hover-scale btn-hover" onClick={()=>{confirmAction.onConfirm(); setConfirmAction(null);}} style={{...B(true, confirmAction.title.includes("Hapus") ? "#9C2B4E" : "#C4622D"), flex:1, height:48, fontSize:14, borderRadius:24}}>{confirmAction.title.includes("Hapus") ? "Hapus" : "Lanjutkan"}</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}

function PublicView() {
  const { wsId } = useParams();
  const [content, setContent] = useState<any[]>([]);
  const [ws, setWs] = useState<any>(null);

  useEffect(() => {
    if (!wsId) return;
    getDoc(doc(db, "workspaces", wsId)).then(s => setWs(s.data()));
    onSnapshot(collection(db, "workspaces", wsId, "content"), (snap) => {
      setContent(snap.docs.map(d => d.data()));
    });
  }, [wsId]);

  if (!ws?.publicLinkEnabled) return <div style={{textAlign:"center", padding:100}}>Workspace ini private atau tidak ditemukan.</div>;

  return (
    <div style={{padding:40, background:"#FAFAFA", minHeight:"100vh"}}>
       <div style={{maxWidth:1200, margin:"0 auto"}}>
          <h1 style={{fontSize:32, color:"#2C2016", marginBottom:8, fontWeight:800, letterSpacing:"-1px"}}>{ws.settings?.title || ws.name}</h1>
          {ws.settings?.tagline && <p style={{fontSize:16, color:"rgba(44,32,22,0.6)", fontStyle:"italic", marginBottom:12}}>{ws.settings.tagline}</p>}
          <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", marginBottom:32}}>Public Read-Only View • Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>
          
          <TableView 
            filtered={content} 
            openEdit={()=>{}} 
            archiveItem={()=>{}} 
            deleteItem={()=>{}} 
            pillars={DP} 
            platforms={DPL} 
            showArchived={false} 
            search="" 
            bulkIds={[]} 
            setBulkIds={()=>{}} 
            onBulk={()=>{}} 
          />
       </div>
    </div>
  );
}
