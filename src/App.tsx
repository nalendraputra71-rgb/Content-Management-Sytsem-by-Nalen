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
  doc, setDoc, getDoc, collection, collectionGroup, query, onSnapshot, deleteDoc, writeBatch,
  handleFirestoreError, testFirestoreConnection, where
} from "./firebase";

import { Header, NavBar, FilterBar, Sidebar } from "./Nav";
import { MonthView, WeekView, BoardView, TimelineView, TableView } from "./Views";
import { AnalyticsView } from "./AnalyticsView";
import { SettingsPanel } from "./SettingsPanel";
import { ContentModal } from "./ContentModal";
import { CsvModal } from "./CsvModal";
import { AuthScreen } from "./AuthScreen";
import { UserProfile } from "./UserProfile";
import { ShareWorkspaceModal } from "./ShareWorkspaceModal";

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
          // Listen to profile for real-time updates (auto-provisioning etc)
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
        <Route path="/login" element={user ? <Navigate to="/" /> : <AuthScreen onUserCreated={(u)=>setUser(u)} />} />
        <Route path="/public/:wsId" element={<PublicView />} />
        <Route path="/profile" element={user ? <CMSLayout><UserProfile userProfile={profile} activeWorkspace={null} onUpdate={setProfile} /></CMSLayout> : <Navigate to="/login" />} />
        <Route path="/*" element={user ? <CMSLayout><Dashboard user={user} profile={profile} /></CMSLayout> : <Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
}

function LoadingScreen({ title }: { title?: string }) {
  return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FAF7F2",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,color:"#2C2016",fontWeight:600}}>{title || "Your Company"}</div>
      <div style={{fontSize:14,color:"rgba(44,32,22,0.5)"}}>Menyiapkan arsitektur...</div>
    </div>
  );
}

function CMSLayout({ children }: any) {
  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#FAF7F2",minHeight:"100vh",color:"#2C2016"}}>
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
    bgColor: "#2C2016", titleFont: "'Playfair Display', serif", taglineFont: "'DM Sans', sans-serif", subtitleFont: "'DM Sans', sans-serif"
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

  useEffect(() => {
    if (!user) return;
    setWsLoading(true);
    const q = query(collectionGroup(db, "members"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, async (snap) => {
      try {
        const wsIds = snap.docs.map(d => (d.data() as any).workspaceId);
        if (wsIds.length === 0) {
          setWorkspaces([]);
          setWsLoading(false);
          return;
        }
        const wsPromises = wsIds.map(id => getDoc(doc(db, "workspaces", id)));
        const wsSnaps = await Promise.all(wsPromises);
        const wsList = wsSnaps.filter(s => s.exists()).map(s => ({ ...s.data(), id: s.id }));
        setWorkspaces(wsList);
        const currentWs = workspaceRef.current;
        if (wsList.length > 0) {
          // If current workspace is null or no longer in the list, set to first
          if (!currentWs || !wsList.find(w => w.id === currentWs.id)) {
            setWorkspace(wsList[0]);
          }
        }
      } catch (err) {
        console.error("Workspace fetch error:", err);
      } finally {
        setWsLoading(false);
      }
    }, (error) => {
      console.error("onSnapshot CollectionGroup error:", error);
      setErrorMsg(error.message);
      setWsLoading(false);
    });
    return () => unsub();
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
             // Deep comparison would be better, but at least don't update if nothing changed
             // OR just update the specific fields we care about
             if (JSON.stringify(prev?.settings) === JSON.stringify(data.settings) && prev?.name === data.name) return prev;
             return { ...prev, ...data, id: snap.id };
          });
          
          if (data.settings) {
            setTitle(data.settings.title !== undefined ? data.settings.title : "Your Company");
            setTagline(data.settings.tagline !== undefined ? data.settings.tagline : "Content Management System");
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
    if (!workspace) return;
    const isNew = modal.mode === "add";
    const itemId = isNew ? gid() : data.id;
    const itemData = { ...data, id: itemId, workspaceId: workspace.id, userId: user.uid };
    try {
      await setDoc(doc(db, "workspaces", workspace.id, "content", itemId), itemData, { merge: true });
      setModal(null);
    } catch (e) { handleFirestoreError(e, isNew?'create':'update'); }
  };

  const openEdit = (item:any) => setModal({mode:"edit",data:{...item,metrics:{...item.metrics}}});
  const openAdd  = (day:any) => setModal({mode:"add",data:emptyItem(year,month,day,pillars,platforms,pics,statuses)});
  const deleteItem = async (id:string) => { 
    if(!workspace || !id) {
      alert("Error: Identitas konten tidak ditemukan.");
      return;
    }
    // Removing window.confirm as it might be blocked in some iframe environments
    try {
      const docRef = doc(db, "workspaces", workspace.id, "content", id);
      await deleteDoc(docRef); 
      setModal(null); 
      setSaveMsg("Konten berhasil dihapus secara permanen.");
      setTimeout(()=>setSaveMsg(""), 3000);
    } catch (e: any) {
      alert(`Gagal menghapus (ID: ${id}): ` + e.message);
      handleFirestoreError(e, 'delete');
    }
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
      alert("Gagal mengarsipkan konten: " + e.message);
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
      alert("Gagal memulihkan konten: " + e.message);
      handleFirestoreError(e, 'update');
    }
  };

  const handleBulkActions = async (type: string) => {
    if (!workspace || bulkIds.length === 0) return;
    const confirmMsg = type === "delete" ? `Hapus permanen ${bulkIds.length} konten?` : type === "restore" ? `Pulihkan ${bulkIds.length} konten ke kalender?` : `Arsipkan ${bulkIds.length} konten?`;
    if (!window.confirm(confirmMsg)) return;

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
  };

  const updateWsSettings = async (updates: any) => {
    if (!workspace) return;
    try {
      const wsRef = doc(db, "workspaces", workspace.id);
      const newSettings = { ...workspace.settings, ...updates };
      await setDoc(wsRef, { 
        settings: newSettings,
        ...(updates.title ? { name: updates.title } : {})
      }, { merge: true });
      if (updates.title) {
        document.title = updates.title;
      }
      // Local state is updated via onSnapshot listener in App.tsx
    } catch (e) {
      console.error("Update settings error:", e);
    }
  };

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  const handleBulkImport = async (items: any[]) => {
    if (!workspace) return;
    try {
      const batch = writeBatch(db);
      items.forEach(item => {
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
      <div style={{height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#FAF7F2", flexDirection:"column", gap:20, padding:40, textAlign:"center"}}>
        <div style={{fontFamily:"'Playfair Display',serif", fontSize:24, color:"#2C2016", fontWeight:600}}>
          {errorMsg.includes("index") ? "Indeks Database Sedang Disiapkan..." : "Mempersiapkan Workspace Anda..."}
        </div>
        {!errorMsg.includes("index") && <div style={{width:40, height:40, border:"3px solid #C4622D", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite"}}/>}
        
        {errorMsg && (
          <div style={{maxWidth:500, fontSize:13, color:"#9C2B4E", background:"#F8EAF0", padding:16, borderRadius:12, fontWeight:500}}>
             {errorMsg.includes("index") ? 
               "Firebase sedang membuat indeks untuk pencarian workspace. Proses ini biasanya memakan waktu 1-2 menit. Silakan tunggu sebentar dan refresh halaman ini." : 
               `Oops! Terjadi kendala: ${errorMsg}`}
          </div>
        )}
        
        {errorMsg.includes("index") && (
          <button onClick={()=>window.location.reload()} style={{...B(true), padding:"10px 24px"}}>Coba Refresh Sekarang</button>
        )}
        
        <button onClick={()=>signOut(auth)} style={{...B(false), fontSize:13}}>Batal & Logout</button>
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
        />
      
        <NavBar tab={tab} setTab={setTab} year={year} setYear={setYear} month={month} setMonth={setMonth} onOpenAdd={()=>openAdd(1)}/>
      
      <FilterBar 
        filters={filters} setFilters={setFilters} 
        pillars={pillars} platforms={platforms} pics={pics} statuses={statuses} 
        showHolidays={showHolidays} setShowHolidays={setShowHolidays} 
        showArchived={showArchived} setShowArchived={setShowArchived}
        onImportClick={()=>setShowCsv(true)}
      />

      <div style={{padding:"20px 24px 56px"}}>
        {tab==="month"&&<MonthView year={year} month={month} monthContent={monthContent} filtered={filtered} openEdit={openEdit} openAdd={openAdd} showHolidays={showHolidays} holidays={holidays} pillars={pillars} platforms={platforms}/>}
        {tab==="week"&&<WeekView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} showHolidays={showHolidays} holidays={holidays} pillars={pillars} platforms={platforms}/>}
        {tab==="board"&&<BoardView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} statuses={statuses} pillars={pillars} platforms={platforms} search={search}/>}
        {tab==="timeline"&&<TimelineView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} pillars={pillars} platforms={platforms} showHolidays={showHolidays} holidays={holidays}/>}
        {tab==="table"&&<TableView filtered={filtered} openEdit={openEdit} archiveItem={archiveItem} unarchiveItem={unarchiveItem} deleteItem={deleteItem} pillars={pillars} platforms={platforms} showArchived={showArchived} search={search} bulkIds={bulkIds} setBulkIds={setBulkIds} onBulk={handleBulkActions} />}
        {tab==="analytics"&&<AnalyticsView content={content} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses} openEdit={openEdit}/>}
        {tab==="settings"&&<SettingsPanel pillars={pillars} setPillars={setPillars} platforms={platforms} setPlatforms={setPlatforms} pics={pics} setPics={setPics} statuses={statuses} setStatuses={setStatuses} holidays={holidays} setHolidays={setHolidays} onSeed={() => setContent(makeSeed())} />}
      </div>

      {shareModal && <ShareWorkspaceModal workspace={workspace} onClose={()=>setShareModal(false)} />}
      {modal&&<ContentModal modal={modal} onSave={handleSave} onClose={()=>setModal(null)} onArchive={archiveItem} onRestore={unarchiveItem} onDelete={deleteItem} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses}/>}
      {showCsv && <CsvModal onClose={()=>setShowCsv(false)} onImport={handleBulkImport} workspaceId={workspace?.id} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses} />}
      {exportModal && <div style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <div style={CARD({width:400})}>
           <h3 style={{fontFamily:"'Playfair Display',serif", fontSize:20, marginBottom:16}}>Ekspor Data (XLSX)</h3>
           <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", marginBottom:20}}>Unduh seluruh data konten dalam format Excel untuk workspace {workspace?.name}.</p>
           <button onClick={() => {
              const ws = XLSX.utils.json_to_sheet(content);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Content");
              XLSX.writeFile(wb, `Export_${workspace?.name}.xlsx`);
              setExportModal(false);
           }} style={{...B(true, "#2D7A5E"), width:"100%", height:44, marginBottom:10}}>Download XLSX</button>
           <button onClick={()=>setExportModal(false)} style={{...B(false), width:"100%"}}>Batal</button>
        </div>
      </div>}
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
    <div style={{padding:40, background:"#FAF7F2", minHeight:"100vh"}}>
       <div style={{maxWidth:1200, margin:"0 auto"}}>
          <h1 style={{fontFamily:"'Playfair Display',serif", fontSize:32, color:"#2C2016", marginBottom:8}}>{ws.settings?.title || ws.name}</h1>
          {ws.settings?.tagline && <p style={{fontSize:16, color:"#C4622D", fontStyle:"italic", marginBottom:12}}>{ws.settings.tagline}</p>}
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
