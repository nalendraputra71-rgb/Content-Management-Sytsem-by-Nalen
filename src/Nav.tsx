import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { 
  Calendar, Layout, List, Clock, PieChart, Settings, 
  Search, Share2, Pencil, Image, LogOut, Menu, Plus, ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { eng, fmt, YEARS, B, I, TAB, MONTHS } from "./data";

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
  const [localSearchOpen, setLocalSearchOpen] = useState(sidebarOpen);

  // Sync temp state when props change (from DB)
  useEffect(() => {
    setTmp(title);
    setTmpTag(tagline);
    setTmpStyle(headerStyle || {});
  }, [title, tagline, headerStyle]);

  useEffect(() => {
    setLocalSearchOpen(sidebarOpen);
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
    <div style={{background:appliedStyle?.bgColor||"#2C2016",color:appliedStyle?.titleColor||"#FAFAFA",padding:"24px 40px",position:"relative",overflow:"hidden",minHeight:160,display:"flex",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
      {headerImage && <img src={headerImage} alt="header" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.3,pointerEvents:"none"}} />}
      
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

        <div style={{display:"flex",gap:24,alignItems:"center"}}>
          <div style={{display:"flex", gap:24, borderRight:"1px solid rgba(255,255,255,0.15)", paddingRight:24}}>
            {[["Published",pub], ["Reach",fmt(tr)], ["Eng",fmt(te)]].map(([l,v])=>(
              <div key={l as string} style={{textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:800,lineHeight:1,letterSpacing:"-1px"}}>{v as any}</div>
                <div style={{fontSize:10,color:"rgba(250,247,242,0.4)",marginTop:6,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700}}>{l as string}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex", gap:16, alignItems:"center", background:"rgba(255,255,255,0.1)", padding:"8px 16px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)"}}>
             <select className="custom-select-dark focus-ring" value={qNumber} onChange={(e)=>onQNumberChange(+e.target.value)} style={{background:"transparent", border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", outline:"none", borderRadius: 8}}>
               <option value={0}>Tahun Ini</option>
               <option value={1}>Q1 (Jan-Mar)</option>
               <option value={2}>Q2 (Apr-Jun)</option>
               <option value={3}>Q3 (Jul-Sep)</option>
               <option value={4}>Q4 (Okt-Des)</option>
             </select>
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

export function Sidebar({ 
  open, tab, setTab, 
  workspaces, activeWorkspace, onWorkspaceSelect, 
  user, profile, onLogout, title
}: any) {
  const navigate = useNavigate();
  const VIEWS = [
    {id:"month", ic:<Calendar size={18}/>, lb:"Bulan"},
    {id:"week", ic:<ColsIcon size={18}/>, lb:"Minggu"},
    {id:"board", ic:<Layout size={18}/>, lb:"Board"},
    {id:"timeline", ic:<Clock size={18}/>, lb:"Timeline"},
    {id:"table", ic:<List size={18}/>, lb:"Tabel"},
    {id:"analytics", ic:<PieChart size={18}/>, lb:"Analitik"},
    {id:"settings", ic:<Settings size={18}/>, lb:"Pengaturan"}
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }} 
          animate={{ width: 240, opacity: 1 }} 
          exit={{ width: 0, opacity: 0 }} 
          transition={{ duration: 0.3 }}
          style={{background:"#2C2016", color:"#FAFAFA", display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,0.05)", height:"100vh", position:"sticky", top:0, zIndex:200, overflow:"hidden", whiteSpace: "nowrap"}}
        >
          <div style={{minWidth: 240, height: "100%", display: "flex", flexDirection: "column"}}>
            <div style={{padding:"24px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{fontSize:20, fontWeight:800, marginBottom:16, letterSpacing:"-1px", color:"#FF6B00"}}>{title || "CMS Console"}</div>
              
              <div style={{display:"flex", flexDirection:"column", gap:8}}>
                <label style={{fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:1.5}}>Pilih Workspace</label>
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
              </div>
            </div>

            <div style={{padding:"20px 12px", flex:1, overflowY:"auto"}}>
              <label style={{fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:1.5, display:"block", marginBottom:8, paddingLeft:8}}>Navigasi Utama</label>
              <div style={{display:"flex", flexDirection:"column", gap:4}}>
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
              </div>
            </div>

            <div style={{padding:"20px 16px", borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <div 
                onClick={() => navigate("/profile")}
                className="hover-scale"
                style={{
                  display:"flex", alignItems:"center", gap:12, padding:12, borderRadius:16, background:"rgba(255,255,255,0.05)", cursor:"pointer", marginBottom:8
                }}
              >
                <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} alt="avatar" style={{width:36, height:36, borderRadius:12, border:"2px solid #FF6B00"}} />
                <div style={{overflow:"hidden"}}>
                  <div style={{fontSize:13, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color:"white"}}>{user?.displayName}</div>
                  <div style={{fontSize:10, color:"#FF6B00", fontWeight:700}}>Pengaturan Profil</div>
                </div>
              </div>
              <button 
                onClick={onLogout} 
                className="btn-hover hover-scale"
                style={{
                  width:"100%", background:"rgba(156, 43, 78, 0.1)", border:"1.5px solid rgba(156, 43, 78, 0.2)", borderRadius:12, padding:"10px", 
                  color:"#E57373", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8
                }}
              >
                <LogOut size={14}/> KELUAR SISTEM
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ColsIcon({size}: any) { return <div style={{width:size, height:size, border:"2px solid currentColor", borderRadius:2, display:"flex"}}><div style={{flex:1, borderRight:"1px solid currentColor"}}/><div style={{flex:1}}/></div>; }

export function NavBar({tab,setTab,year,setYear,month,setMonth,onOpenAdd}: any) {
  return (
    <div style={{background:"white",borderBottom:"1px solid rgba(44,32,22,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px",height:80,position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",gap:16,alignItems:"center"}}>
        <select className="hover-scale custom-select focus-ring" value={year} onChange={(e:any)=>setYear(+e.target.value)} style={{...I(),width:120,padding:"8px 12px",borderRadius:12}}>{YEARS.map(y=><option key={y}>{y}</option>)}</select>
        <select className="hover-scale custom-select focus-ring" value={month} onChange={(e:any)=>setMonth(+e.target.value)} style={{...I(),width:140,padding:"8px 12px",borderRadius:12}}>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select>
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
          <select className="hover-scale custom-select focus-ring" key={key as string} value={filters[key as string]} onChange={(e)=>set(key,e.target.value)} style={{...I(),width:160,padding:"10px 14px",fontSize:13,background:"white",borderColor:"rgba(44,32,22,0.08)",borderRadius:12}}>
            <option key="all" value="All">Semua {l as string}</option>
            {(opt as any[]).map((o:any)=>{
              const name = typeof o === 'string' ? o : o.name;
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>
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
