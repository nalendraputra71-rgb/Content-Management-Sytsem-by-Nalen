import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { 
  MONTHS, YEARS, DP, DPL, DPIC, DST, DH, 
  gid, eng, fmtD, fmtT, emptyItem, makeSeed 
} from "./data";

import { Header, NavBar, FilterBar } from "./Nav";
import { MonthView, WeekView, BoardView, TimelineView, TableView } from "./Views";
import { AnalyticsView } from "./AnalyticsView";
import { SettingsPanel } from "./SettingsPanel";
import { ContentModal } from "./ContentModal";
import { CsvModal } from "./CsvModal";

export default function App() {
  const [content, setContent]   = useState<any[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [tab, setTab]           = useState("month");
  const [year, setYear]         = useState(2025);
  const [month, setMonth]       = useState(5);
  const [modal, setModal]       = useState<any>(null);
  const [saveMsg, setSaveMsg]   = useState("");
  const [search, setSearch]     = useState("");
  const [showHolidays, setShowHolidays] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters]   = useState({pillar:"All",platform:"All",pic:"All",status:"All"});
  const [title, setTitle]       = useState("FAKDHERA");
  const [tagline, setTagline]   = useState("LifeinHalalstyle");
  const [headerImage, setHeaderImage] = useState<string|null>(null);

  const [qYear, setQYear]       = useState(2025);
  const [qNumber, setQNumber]   = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  
  const [headerStyle, setHeaderStyle] = useState({
    titleColor: "#C4622D",
    taglineColor: "#FAF7F2",
    subtitleColor: "rgba(250,247,242,0.8)",
    bgColor: "#2C2016",
    titleFont: "'Playfair Display', serif",
    taglineFont: "'DM Sans', sans-serif",
    subtitleFont: "'DM Sans', sans-serif"
  });

  const [showCsv, setShowCsv]   = useState(false);
  const [pillars, setPillars]   = useState(DP);
  const [platforms, setPlatforms] = useState(DPL);
  const [pics, setPics]         = useState(DPIC);
  const [statuses, setStatuses] = useState(DST);
  const [holidays, setHolidays] = useState(DH);

  const STORAGE_KEY = "fakdhera-cms-v2";
  const storage = (window as any).storage || {
    get: async (k: string) => { const v = localStorage.getItem(k); return v ? {value: v} : null; },
    set: async (k: string, v: string) => localStorage.setItem(k, v)
  };

  // Load
  useEffect(()=>{
    (async()=>{
      try {
        const r = await storage.get(STORAGE_KEY);
        if(r){
          const s=JSON.parse(r.value);
          setContent((s.content||makeSeed()).map((c:any)=>{
            const defaultAds = {views:0,reach:0,likes:0,comments:0,shares:0,reposts:0,saves:0,clicks:0,conversions:0};
            return {...c, adsMetrics: {...defaultAds, ...(c.adsMetrics||{})}};
          }));
          setTitle(s.title||"FAKDHERA");
          setTagline(s.tagline||"LifeinHalalstyle");
          setHeaderImage(s.headerImage||null);
          if(s.headerStyle) setHeaderStyle(s.headerStyle);
          setPillars(s.pillars||DP);
          setPlatforms(s.platforms||DPL);
          setPics(s.pics||DPIC);
          setStatuses(s.statuses||DST);
          setHolidays(s.holidays||DH);
        } else { setContent(makeSeed()); }
      } catch { setContent(makeSeed()); }
      setLoaded(true);
    })();
  },[]);

  // Save
  useEffect(()=>{
    if(!loaded)return;
    (async()=>{
      try {
        await storage.set(STORAGE_KEY,JSON.stringify({content,title,tagline,headerImage,headerStyle,pillars,platforms,pics,statuses,holidays}));
        setSaveMsg("✓ Tersimpan");
        setTimeout(()=>setSaveMsg(""),2500);
      } catch { setSaveMsg("⚠ Gagal simpan"); }
    })();
  },[content,title,tagline,headerImage,headerStyle,pillars,platforms,pics,statuses,holidays,loaded]);

  // Filtered content for current month/year
  const monthContent = content.filter(c=>c.year===year&&c.month===month);
  const filtered = useMemo(()=>{
    let items = search
      ? content.filter(c=>[c.title,c.caption,c.briefCopywriting,c.objective].join(" ").toLowerCase().includes(search.toLowerCase()))
      : monthContent;
    return items.filter((c:any)=>
      (filters.pillar==="All"||c.pillar===filters.pillar)&&
      (filters.platform==="All"||c.platform===filters.platform)&&
      (filters.pic==="All"||c.pic===filters.pic)&&
      (filters.status==="All"||c.status===filters.status)
    );
  },[monthContent,content,search,filters]);

  const openEdit = (item:any) => setModal({mode:"edit",data:{...item,metrics:{...item.metrics}}});
  const openAdd  = (day:any) => setModal({mode:"add",data:emptyItem(year,month,day,pillars,platforms,pics,statuses)});

  const [pastContent, setPastContent] = useState<any[]>([]);
  const [futureContent, setFutureContent] = useState<any[]>([]);

  const pushState = (newContent: any[]) => {
    setPastContent(p => [...p, content]);
    setFutureContent([]);
    setContent(newContent);
  };

  const undoContent = () => {
    if (pastContent.length === 0) return;
    const prev = pastContent[pastContent.length - 1];
    setPastContent(p => p.slice(0, p.length - 1));
    setFutureContent(f => [...f, content]);
    setContent(prev);
  };

  const redoContent = () => {
    if (futureContent.length === 0) return;
    const next = futureContent[futureContent.length - 1];
    setFutureContent(f => f.slice(0, f.length - 1));
    setPastContent(p => [...p, content]);
    setContent(next);
  };

  const handleSave = (data:any) => {
    const newContent = modal.mode==="add"?[...content,{...data,id:gid()}]:content.map((c:any)=>c.id===data.id?data:c);
    pushState(newContent);
    setModal(null);
  };
  const archiveItem = (id:string) => {
    if(window.confirm("Arsipkan konten ini? Data analitik tetap tersimpan.")) {
      pushState(content.map((c:any)=>c.id===id?{...c,archived:true}:c));
      setModal(null);
    }
  };
  const deleteItem = (id:string) => {
    if(window.confirm("Hapus permanen konten Draft ini? Tidak dapat dibatalkan.")) {
      pushState(content.filter((c:any)=>c.id!==id));
      setModal(null);
    }
  };

  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const handleBulk = (action:string) => {
    if(action==="archive") {
      if(window.confirm(`Arsipkan ${bulkIds.length} konten?`)){
        pushState(content.map((c:any)=>bulkIds.includes(c.id)?{...c,archived:true}:c));
        setBulkIds([]);
      }
    }
    if(action==="delete") {
      if(window.confirm(`Hapus permanen ${bulkIds.length} konten?`)){
        pushState(content.filter((c:any)=>!bulkIds.includes(c.id)));
        setBulkIds([]);
      }
    }
  };

  const handleImport = (data:any) => {
    pushState([...content, ...data]);
    setShowCsv(false);
  };

  // Excel Export
  const exportExcel = (startDt:string, endDt:string) => {
    try {
      const expContent = content.filter(c=> {
        const itemDate = new Date(c.year, c.month-1, c.day);
        const sDate = startDt ? new Date(startDt) : new Date(0);
        const eDate = endDt ? new Date(endDt) : new Date(8640000000000000);
        return itemDate >= sDate && itemDate <= eDate;
      });
      const makeRows = (arr:any[]) => arr.map(c=>({
        "ID":c.id,"Judul":c.title,
        "Tanggal":fmtD(c.year,c.month,c.day),
        "Jam Upload":fmtT(c.uploadHour,c.uploadMinute),
        "Tahun":c.year,"Bulan":MONTHS[c.month-1],
        "Pillar":c.pillar,"Platform":c.platform,
        "PIC":c.pic,"Status":c.status,
        "Ads/Organic":c.isAds?"Ads":"Organic",
        "Arsip":c.archived?"Ya":"Tidak",
        "Caption":c.caption,"Brief":c.briefCopywriting,
        "Objective":c.objective,"Referensi":c.referenceText,
        "Link Referensi (Array)":c.referenceLinks?.join(", ")||c.referenceLink,
        "Link Aset":c.linkAsset,
        "Views (Org)":c.metrics.views,"Reach (Org)":c.metrics.reach,
        "Likes (Org)":c.metrics.likes,"Comments (Org)":c.metrics.comments,
        "Shares (Org)":c.metrics.shares,"Saves (Org)":c.metrics.saves,
        "Views (Ads)":c.adsMetrics?.views||0,"Reach (Ads)":c.adsMetrics?.reach||0,
        "Clicks (Ads)":c.adsMetrics?.clicks||0,"Conversions (Ads)":c.adsMetrics?.conversions||0,
        "Total Engagement":eng(c.metrics) + eng(c.adsMetrics||{}),
        "ER (%)":(c.metrics.reach||0)>0?((eng(c.metrics)/c.metrics.reach)*100).toFixed(2):0,
        "Metrics Updated":c.metricsUpdatedAt||""
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(makeRows(expContent.filter(c=>!c.archived))),"Data Konten");
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(makeRows(expContent.filter(c=>c.archived)).length>0?makeRows(expContent.filter(c=>c.archived)):[{Note:"Tidak ada arsip"}]),"Data Arsip");
      const monthlyData = YEARS.flatMap(y=>MONTHS.map((m,i)=>{
        const d=content.filter(c=>c.year===y&&c.month===i+1);
        return {"Tahun":y,"Bulan":m,"Total":d.length,"Published":d.filter(c=>c.status==="Published").length,
          "Reach":d.reduce((s:any,c:any)=>s+(c.metrics.reach||0)+(c.adsMetrics?.reach||0),0),"Engagement":d.reduce((s:any,c:any)=>s+eng(c.metrics)+eng(c.adsMetrics||{}),0)};
      }));
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(monthlyData),"Analytics");
      XLSX.writeFile(wb,`Fakdhera-CMS-Export.xlsx`);
      setExportModal(false);
    } catch(e) {
      console.error("Excel export failed, trying CSV fallback",e);
      const expContent = content;
      const rows = expContent.map((c:any)=>`"${c.title}","${c.year}","${MONTHS[c.month-1]}","${c.day}","${c.status}","${c.pic}","${c.isAds?'Ads':'Organic'}","${eng(c.metrics)}"`);
      const csv = ["Title,Tahun,Bulan,Hari,Status,PIC,Type,Engagement",...rows].join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
      a.download = "fakdhera-export.csv";
      a.click();
      setExportModal(false);
    }
  };

  const [exportModal, setExportModal] = useState(false);
  const [exStart, setExStart] = useState("");
  const [exEnd, setExEnd] = useState("");

  const showFilterBar = !["analytics","settings"].includes(tab);

  if(!loaded) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'DM Sans',sans-serif",flexDirection:"column",gap:12,background:"#FAF7F2"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:"#2C2016"}}>FAKDHERA</div>
      <div style={{fontSize:13,color:"rgba(44,32,22,0.4)"}}>Memuat data...</div>
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#FAF7F2",minHeight:"100vh",color:"#2C2016"}}>
      <Header 
        title={title} onTitleChange={setTitle} 
        tagline={tagline} onTaglineChange={setTagline} 
        headerImage={headerImage} onHeaderImageChange={setHeaderImage} 
        headerStyle={headerStyle} setHeaderStyle={setHeaderStyle} 
        content={content} 
        qYear={qYear} onQYearChange={setQYear}
        qNumber={qNumber} onQNumberChange={setQNumber}
        saveMsg={saveMsg} search={search} onSearch={setSearch} 
        onExport={()=>setExportModal(true)} onImportClick={()=>setShowCsv(true)} 
        undoContent={undoContent} redoContent={redoContent} 
        canUndo={pastContent.length>0} canRedo={futureContent.length>0}
      />
      <NavBar tab={tab} setTab={setTab} year={year} setYear={setYear} month={month} setMonth={setMonth} onOpenAdd={()=>openAdd(1)}/>
      {showFilterBar&&<FilterBar filters={filters} setFilters={setFilters} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses} showHolidays={showHolidays} setShowHolidays={setShowHolidays} showArchived={showArchived} setShowArchived={setShowArchived}/>}

      {/* Search Banner */}
      {search&&<div style={{background:"#FDF0EB",padding:"8px 24px",borderBottom:"1px solid rgba(196,98,45,0.15)",fontSize:12,color:"#C4622D",fontWeight:500}}>
        🔍 Hasil pencarian "{search}": {filtered.length} konten ditemukan — <button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:"#C4622D",cursor:"pointer",textDecoration:"underline",fontFamily:"inherit",fontSize:12}}>Hapus pencarian</button>
      </div>}

      <div style={{padding:"20px 24px 56px"}}>
        {tab==="month"&&<MonthView year={year} month={month} monthContent={monthContent} filtered={filtered} openEdit={openEdit} openAdd={openAdd} showHolidays={showHolidays} holidays={holidays} pillars={pillars} platforms={platforms}/>}
        {tab==="week"&&<WeekView year={year} month={month} content={content} openEdit={openEdit} openAdd={openAdd} pillars={pillars} platforms={platforms} showHolidays={showHolidays} holidays={holidays}/>}
        {tab==="board"&&<BoardView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} statuses={statuses} pillars={pillars} platforms={platforms} search={search}/>}
        {tab==="timeline"&&<TimelineView year={year} month={month} content={content} filtered={filtered} openEdit={openEdit} openAdd={openAdd} pillars={pillars} platforms={platforms} showHolidays={showHolidays} holidays={holidays}/>}
        {tab==="table"&&<TableView filtered={filtered} openEdit={openEdit} archiveItem={archiveItem} deleteItem={deleteItem} pillars={pillars} platforms={platforms} showArchived={showArchived} search={search} bulkIds={bulkIds} setBulkIds={setBulkIds} onBulk={handleBulk}/>}
        {tab==="analytics"&&<AnalyticsView content={content} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses} openEdit={openEdit}/>}
        {tab==="settings"&&<SettingsPanel pillars={pillars} setPillars={setPillars} platforms={platforms} setPlatforms={setPlatforms} pics={pics} setPics={setPics} statuses={statuses} setStatuses={setStatuses} holidays={holidays} setHolidays={setHolidays}/>}
      </div>

      {exportModal && (
        <div onClick={()=>setExportModal(false)} style={{position:"fixed",inset:0,background:"rgba(30,21,9,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#FAF7F2",borderRadius:16,padding:24,width:320,boxShadow:"0 24px 60px rgba(30,21,9,0.4)"}}>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,marginBottom:16,color:"#2C2016"}}>Pilih Rentang Export</h3>
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:"#2C2016",marginBottom:4}}>Dari Tanggal</label>
              <input type="date" value={exStart} onChange={(e)=>setExStart(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid rgba(44,32,22,0.15)",background:"white",fontFamily:"inherit"}}/>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,color:"#2C2016",marginBottom:4}}>Sampai Tanggal</label>
              <input type="date" value={exEnd} onChange={(e)=>setExEnd(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid rgba(44,32,22,0.15)",background:"white",fontFamily:"inherit"}}/>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setExportModal(false)} style={{background:"transparent",border:"none",color:"#2C2016",padding:"8px 16px",fontWeight:600,cursor:"pointer"}}>Batal</button>
              <button onClick={()=>exportExcel(exStart, exEnd)} style={{background:"#C4622D",border:"none",color:"white",padding:"8px 16px",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Download Excel</button>
            </div>
          </div>
        </div>
      )}

      {modal&&<ContentModal modal={modal} onSave={handleSave} onClose={()=>setModal(null)} onArchive={archiveItem} onDelete={deleteItem} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses}/>}
      {showCsv&&<CsvModal onClose={()=>setShowCsv(false)} onImport={handleImport} pillars={pillars} platforms={platforms} pics={pics} statuses={statuses}/>}
    </div>
  );
}
