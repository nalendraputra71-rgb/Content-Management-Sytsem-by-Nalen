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

  // Sync temp state when props change (from DB)
  useEffect(() => {
    setTmp(title);
    setTmpTag(tagline);
    setTmpStyle(headerStyle || {});
  }, [title, tagline, headerStyle]);

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
    <div style={{background:appliedStyle?.bgColor||"#1E1509",color:appliedStyle?.titleColor||"#FAF7F2",padding:"16px 24px",position:"relative",overflow:"hidden",minHeight:140,display:"flex",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
      {headerImage && <img src={headerImage} alt="header" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.3,pointerEvents:"none"}} />}
      
      <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"center",gap:24,width:"100%"}}>
        <div style={{display:"flex", alignItems:"center", gap:16, flex:1}}>
          <button onClick={onToggleSidebar} style={{background:"rgba(255,255,255,0.1)", border:"none", borderRadius:8, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"white"}}>
            {sidebarOpen ? <ChevronLeft size={20}/> : <Menu size={20}/>}
          </button>
          
          <div style={{minWidth:200}}>
            {ed ? (
              <div style={{display:"flex",flexDirection:"column",gap:6,background:"rgba(0,0,0,0.85)",padding:14,borderRadius:12,backdropFilter:"blur(12px)",maxWidth:350,border:"1px solid rgba(255,255,255,0.15)",zIndex:100,boxShadow:"0 10px 30px rgba(0,0,0,0.3)"}}>
                 <div style={{display:"flex",flexDirection:"column",gap:4}}>
                   <label style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase"}}>Judul Utama</label>
                   <div style={{display:"flex",gap:8}}>
                     <input value={tmp} onChange={(e:any)=>setTmp(e.target.value)} style={{flex:1,fontSize:13,background:"white",border:"none",borderRadius:6,color:"#333",padding:"6px 10px"}}/>
                     <input type="color" value={tmpStyle?.titleColor||"#FAF7F2"} onChange={(e)=>setTmpStyle({...tmpStyle,titleColor:e.target.value})} style={{width:28,height:28,border:"none",borderRadius:4,cursor:"pointer"}}/>
                   </div>
                 </div>
                 <div style={{display:"flex",flexDirection:"column",gap:4}}>
                   <label style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase"}}>Tagline / Sub-judul</label>
                   <input value={tmpTag} onChange={(e:any)=>setTmpTag(e.target.value)} placeholder="Masukkan tagline..." style={{fontSize:12,background:"white",border:"none",borderRadius:6,color:"#333",padding:"6px 10px",width:"100%"}}/>
                 </div>
                 <div style={{display:"flex",gap:12,marginTop:8}}>
                   <button onClick={()=>{onBrandingChange({title:tmp, tagline:tmpTag, headerStyle:tmpStyle});setEd(false);}} style={{background:"#C4622D",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",color:"white",fontSize:11,fontWeight:700,flex:1}}>Simpan Perubahan</button>
                   <button onClick={()=>{setTmp(title);setTmpTag(tagline);setTmpStyle(headerStyle);setEd(false);}} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:6,padding:"7px 14px",cursor:"pointer",color:"white",fontSize:11}}>Batal</button>
                 </div>
              </div>
            ) : (
              <div onClick={()=>setEd(true)} style={{cursor:"pointer"}}>
                 <h1 style={{fontFamily:appliedStyle?.titleFont||"'Playfair Display',serif",fontSize:24,fontWeight:600,margin:0,color:appliedStyle?.titleColor||"#FAF7F2",display:"flex",alignItems:"center",gap:8}}>{title} <Pencil size={14} style={{opacity:0.3}}/></h1>
                 <p style={{margin:"2px 0 0",color:appliedStyle?.taglineColor||"rgba(250,247,242,0.6)",fontSize:12,fontStyle:"italic"}}>{tagline}</p>
              </div>
            )}
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"6px 12px",border:"1px solid rgba(255,255,255,0.1)",maxWidth:300,flex:1}}>
            <Search size={14} style={{opacity:0.5}}/>
            <input value={search} onChange={(e:any)=>onSearch(e.target.value)} placeholder="Cari konten..." style={{background:"transparent",border:"none",outline:"none",color:"white",fontSize:12,width:"100%"}}/>
          </div>
        </div>

        <div style={{display:"flex",gap:32,alignItems:"center"}}>
          <div style={{display:"flex", gap:16, borderRight:"1px solid rgba(255,255,255,0.1)", paddingRight:24}}>
            {[["Published",pub], ["Reach",fmt(tr)], ["Eng",fmt(te)]].map(([l,v])=>(
              <div key={l as string} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:600,lineHeight:1}}>{v as any}</div>
                <div style={{fontSize:9,color:"rgba(250,247,242,0.4)",marginTop:4,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>{l as string}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex", gap:12, alignItems:"center", background:"rgba(255,255,255,0.05)", padding:"6px 12px", borderRadius:10}}>
             <select value={qNumber} onChange={(e)=>onQNumberChange(+e.target.value)} style={{background:"transparent", border:"none", color:"white", fontSize:11, fontWeight:700, cursor:"pointer", outline:"none"}}>
               <option value={0} style={{color:"black"}}>Thn Ini</option>
               <option value={1} style={{color:"black"}}>Q1</option>
               <option value={2} style={{color:"black"}}>Q2</option>
               <option value={3} style={{color:"black"}}>Q3</option>
               <option value={4} style={{color:"black"}}>Q4</option>
             </select>
          </div>

          <div style={{display:"flex",gap:8}}>
            <button onClick={onShare} style={{...B(true,"#C4622D"), border:"none", height:32, padding:"0 12px", display:"flex", alignItems:"center", gap:6, fontSize:11}}><Share2 size={14}/> Share</button>
            <button onClick={onExport} style={{...B(false), background:"rgba(255,255,255,0.1)", color:"white", border:"none", height:32, padding:"0 12px", display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:600}}>Export</button>
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
    {id:"settings", ic:<Settings size={18}/>, lb:"Pilar & Tag"}
  ];

  if (!open) return null;

  return (
    <div style={{width:240, background:"#1E1509", borderRight:"1px solid rgba(255,255,255,0.05)", height:"100vh", position:"sticky", top:0, display:"flex", flexDirection:"column", flexShrink:0, zIndex:200, color:"#FAF7F2"}}>
      <div style={{padding:24, borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, letterSpacing:1, color:"#C4622D", marginBottom:16}}>{title || "Your Company"}</div>
        
        <label style={{fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:8}}>Workspaces</label>
        <div style={{display:"flex", flexDirection:"column", gap:6}}>
          {workspaces.map((ws:any) => (
            <button 
              key={ws.id} 
              onClick={() => onWorkspaceSelect(ws)} 
              style={{
                width:"100%", textAlign:"left", background:activeWorkspace?.id === ws.id ? "rgba(196,98,45,1)" : "rgba(255,255,255,0.05)", 
                border:"none", borderRadius:8, padding:"8px 12px", color:activeWorkspace?.id === ws.id ? "white" : "#FAF7F2", 
                fontSize:13, fontWeight:500, cursor:"pointer", transition:"all 0.2s"
              }}
            >
              {ws.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:16, flex:1, overflowY:"auto"}}>
        <label style={{fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:8, paddingLeft:8}}>Views</label>
        <div style={{display:"flex", flexDirection:"column", gap:4}}>
          {VIEWS.map(v => (
             <button 
                key={v.id} 
                onClick={() => setTab(v.id)} 
                style={{
                  display:"flex", alignItems:"center", gap:12, width:"100%", padding:"10px 12px", background:tab===v.id?"rgba(255,255,255,0.1)":"transparent",
                  border:"none", borderRadius:8, color:tab===v.id?"white":"rgba(250,247,242,0.6)", cursor:"pointer", transition:"all 0.2s"
                }}
             >
                <span style={{color:tab===v.id?"#C4622D":"currentColor"}}>{v.ic}</span>
                <span style={{fontSize:13, fontWeight:tab===v.id?600:400}}>{v.lb}</span>
             </button>
          ))}
        </div>
      </div>

      <div style={{padding:16, borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <div 
          onClick={() => navigate("/profile")}
          style={{
            display:"flex", alignItems:"center", gap:12, padding:10, borderRadius:12, background:"rgba(0,0,0,0.2)", cursor:"pointer", marginBottom:8
          }}
        >
          <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} alt="avatar" style={{width:32, height:32, borderRadius:8, border:"2px solid #C4622D"}} />
          <div style={{overflow:"hidden"}}>
            <div style={{fontSize:12, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{user?.displayName}</div>
            <div style={{fontSize:10, color:"#C4622D", fontWeight:600}}>Lihat Profil</div>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          style={{
            width:"100%", background:"rgba(156, 43, 78, 0.1)", border:"1.5px solid rgba(156, 43, 78, 0.2)", borderRadius:8, padding:"8px", 
            color:"#E57373", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8
          }}
        >
          <LogOut size={14}/> LOGOUT
        </button>
      </div>
    </div>
  );
}

function ColsIcon({size}: any) { return <div style={{width:size, height:size, border:"2px solid currentColor", borderRadius:2, display:"flex"}}><div style={{flex:1, borderRight:"1px solid currentColor"}}/><div style={{flex:1}}/></div>; }

export function NavBar({tab,setTab,year,setYear,month,setMonth,onOpenAdd}: any) {
  return (
    <div style={{background:"white",borderBottom:"1px solid rgba(44,32,22,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",height:60,position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <select value={year} onChange={(e:any)=>setYear(+e.target.value)} style={{...I(),width:100,padding:"6px",fontSize:13}}>{YEARS.map(y=><option key={y}>{y}</option>)}</select>
        <select value={month} onChange={(e:any)=>setMonth(+e.target.value)} style={{...I(),width:120,padding:"6px",fontSize:13}}>{MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select>
        <button onClick={onOpenAdd} style={{...B(true,"#C4622D"), height:36, padding:"0 20px", display:"flex", alignItems:"center", gap:8, border:"none", color:"white", fontWeight:700, marginLeft:12}}><Plus size={18}/> Konten Baru</button>
      </div>
    </div>
  );
}

export function FilterBar({filters,setFilters,pillars,platforms,pics,statuses,showHolidays,setShowHolidays,showArchived,setShowArchived,onImportClick}: any) {
  const set = (k: any,v: any) => setFilters((p:any)=>({...p,[k]:v}));
  return (
    <div style={{background:"#F5F0E8",borderBottom:"1px solid rgba(44,32,22,0.07)",padding:"10px 32px",display:"flex",gap:24,alignItems:"center"}}>
      <div style={{display:"flex", gap:16, flexWrap:"wrap"}}>
        {[["Pillar",pillars,"pillar"], ["Platform",platforms,"platform"], ["PIC",pics,"pic"]].map(([l,opt,key])=>(
          <select key={key as string} value={filters[key as string]} onChange={(e)=>set(key,e.target.value)} style={{...I(),width:130,padding:"5px 10px",fontSize:12,background:"transparent",borderColor:"rgba(44,32,22,0.1)"}}>
            <option key="all" value="All">Semua {l as string}</option>
            {(opt as any[]).map((o:any)=>{
              const name = typeof o === 'string' ? o : o.name;
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>
        ))}
      </div>
      <div style={{display:"flex", gap:12}}>
        <button onClick={()=>setShowHolidays((v:any)=>!v)} style={{...B(showHolidays,"#2C2016"), fontSize:11, padding:"4px 12px"}}>{showHolidays?"Tampil":"Sembunyi"} Hari Besar</button>
        <button onClick={()=>setShowArchived((v:any)=>!v)} style={{...B(showArchived,"#C4622D"), fontSize:11, padding:"4px 12px"}}>📦 Arsip</button>
      </div>
      <div style={{flex:1}}/>
      <button onClick={onImportClick} style={{...B(false), background:"rgba(125, 200, 164, 0.1)", color:"#7DC8A4", borderColor:"rgba(125, 200, 164, 0.2)", height:30, fontSize:10, display:"flex", alignItems:"center", gap:6}}>
        <Plus size={14}/> IMPORT CSV
      </button>
    </div>
  );
}
