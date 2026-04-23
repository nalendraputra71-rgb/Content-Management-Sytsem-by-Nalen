import { useState } from "react";
import { 
  MONTHS, DAYS_S, YEARS, MK, MC,
  eng, fmt, fmtD, fmtT, gps, gpc, gss,
  I, B, TAB, CARD, PBadge 
} from "./data";

export function Header({title,onTitleChange,tagline,onTaglineChange,headerImage,onHeaderImageChange,headerStyle,setHeaderStyle,content,qYear,onQYearChange,qNumber,onQNumberChange,saveMsg,search,onSearch,onExport,onImportClick,undoContent,redoContent,canUndo,canRedo}: any) {
  const [ed,setEd] = useState(false);
  const [tmp,setTmp] = useState(title);
  const [tmpTag,setTmpTag] = useState(tagline);
  const [tmpStyle,setTmpStyle] = useState(headerStyle);

  // When ed is true, directly show tmpStyle instead of headerStyle for live preview
  const appliedStyle = ed ? (tmpStyle || headerStyle) : headerStyle;

  // Quarterly / Annual filtering
  let qContent = content;
  if (qNumber === 0) {
    // All Year
    qContent = content.filter((c:any) => c.year === qYear);
  } else {
    // Specific Quarter
    const qMonths = qNumber === 1 ? [1,2,3] : qNumber === 2 ? [4,5,6] : qNumber === 3 ? [7,8,9] : [10,11,12];
    qContent = content.filter((c:any) => c.year === qYear && qMonths.includes(c.month));
  }
  
  const active = qContent.filter((c:any)=>!c.archived);
  const pub = active.filter((c:any)=>c.status==="Published").length;
  const arc = qContent.filter((c:any)=>c.archived).length;
  const tr = active.reduce((s:any,c:any)=>s+(c.metrics.reach||0)+(c.adsMetrics?.reach||0),0);
  const te = active.reduce((s:any,c:any)=>s+eng(c.metrics)+eng(c.adsMetrics),0);

  const handleImg = (e:any) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev:any) => onHeaderImageChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{background:appliedStyle?.bgColor||"#1E1509",color:appliedStyle?.titleColor||"#FAF7F2",padding:"20px 24px",position:"relative",overflow:"hidden",minHeight:180,display:"flex",alignItems:"center"}}>
      {headerImage && <img src={headerImage} alt="header" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.3,pointerEvents:"none"}} />}
      {!headerImage && <>
        <div style={{position:"absolute",top:0,right:0,width:400,height:220,background:"radial-gradient(circle, rgba(196,98,45,0.18) 0%, transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:-40,left:-40,width:180,height:180,background:"radial-gradient(circle, rgba(62,94,40,0.12) 0%, transparent 70%)"}}/>
      </>}
      
      <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16,width:"100%"}}>
        <div style={{flex:1,minWidth:220}}>
          <div style={{fontFamily:appliedStyle?.subtitleFont||"'DM Sans', sans-serif",fontSize:9,letterSpacing:3,color:appliedStyle?.subtitleColor||"#C4622D",fontWeight:600,textTransform:"uppercase",marginBottom:5}}>Content Management & Analytics Dashboard</div>
          {ed ? (
            <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:6,background:"rgba(0,0,0,0.6)",padding:12,borderRadius:8,backdropFilter:"blur(5px)",maxWidth:400}}>
              <label style={{fontSize:10,color:"white",marginBottom:-2}}>Judul</label>
              <div style={{display:"flex",gap:4}}><input value={tmp} onChange={(e:any)=>setTmp(e.target.value)} style={{flex:1,fontFamily:tmpStyle?.titleFont||"'Playfair Display', serif",fontSize:14,background:"white",border:"none",borderRadius:4,color:"#333",padding:"4px 8px",outline:"none"}}/><select value={tmpStyle?.titleFont||"'Playfair Display', serif"} onChange={(e)=>setTmpStyle({...tmpStyle,titleFont:e.target.value})} style={{width:80,fontSize:10,borderRadius:4}}><option value={"'Playfair Display', serif"}>Serif</option><option value={"'DM Sans', sans-serif"}>Sans</option></select><input type="color" value={tmpStyle?.titleColor||"#FAF7F2"} onChange={(e)=>setTmpStyle({...tmpStyle,titleColor:e.target.value})} style={{width:24,height:24}} title="Warna Judul"/></div>
              
              <label style={{fontSize:10,color:"white",marginBottom:-2,marginTop:4}}>Tagline</label>
              <div style={{display:"flex",gap:4}}><input value={tmpTag} onChange={(e:any)=>setTmpTag(e.target.value)} style={{flex:1,fontFamily:tmpStyle?.taglineFont||"'DM Sans', sans-serif",fontSize:13,background:"white",border:"none",borderRadius:4,color:"#333",padding:"4px 8px",outline:"none"}}/><select value={tmpStyle?.taglineFont||"'DM Sans', sans-serif"} onChange={(e)=>setTmpStyle({...tmpStyle,taglineFont:e.target.value})} style={{width:80,fontSize:10,borderRadius:4}}><option value={"'DM Sans', sans-serif"}>Sans</option><option value={"'Playfair Display', serif"}>Serif</option></select><input type="color" value={tmpStyle?.taglineColor||"rgba(250,247,242,0.6)"} onChange={(e)=>setTmpStyle({...tmpStyle,taglineColor:e.target.value})} style={{width:24,height:24}} title="Warna Tagline"/></div>
              
              <label style={{fontSize:10,color:"white",marginBottom:-2,marginTop:4}}>Subtitle & Background Header</label>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input type="color" value={tmpStyle?.subtitleColor||"#C4622D"} onChange={(e)=>setTmpStyle({...tmpStyle,subtitleColor:e.target.value})} style={{width:24,height:24}} title="Warna Subtitle"/>
                <input type="color" value={tmpStyle?.bgColor||"#2C2016"} onChange={(e)=>setTmpStyle({...tmpStyle,bgColor:e.target.value})} style={{width:24,height:24}} title="Warna Background"/>
                <select value={tmpStyle?.subtitleFont||"'DM Sans', sans-serif"} onChange={(e)=>setTmpStyle({...tmpStyle,subtitleFont:e.target.value})} style={{width:80,fontSize:10,borderRadius:4}}><option value={"'DM Sans', sans-serif"}>Sans</option><option value={"'Playfair Display', serif"}>Serif</option></select>
              </div>

              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button onClick={()=>{onTitleChange(tmp);onTaglineChange(tmpTag);setHeaderStyle(tmpStyle);setEd(false);}} style={{background:"#C4622D",border:"none",borderRadius:6,padding:"4px 12px",cursor:"pointer",color:"white",fontSize:11,fontWeight:600}}>Simpan</button>
                <button onClick={()=>{setTmp(title);setTmpTag(tagline);setTmpStyle(headerStyle);setEd(false);}} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:6,padding:"4px 12px",cursor:"pointer",color:"white",fontSize:11}}>Batal</button>
                <label style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"white",fontSize:11,display:"flex",alignItems:"center",gap:4}}>
                  🖼️ Gambar <input type="file" accept="image/*" onChange={handleImg} style={{display:"none"}}/>
                </label>
                {headerImage && <button onClick={()=>onHeaderImageChange(null)} style={{background:"rgba(255,0,0,0.4)",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"white",fontSize:11}}>Hapus Img</button>}
              </div>
            </div>
          ) : (
            <div onClick={()=>{setTmp(title);setTmpTag(tagline||"LifeinHalalstyle");setTmpStyle(headerStyle||{titleColor:"#FAF7F2",taglineColor:"rgba(250,247,242,0.6)",subtitleColor:"#C4622D",bgColor:"#2C2016",titleFont:"'Playfair Display', serif",taglineFont:"'DM Sans', sans-serif",subtitleFont:"'DM Sans', sans-serif"});setEd(true);}} style={{cursor:"pointer",display:"inline-block",padding:"4px 8px",margin:"-4px -8px",borderRadius:8}} title="Klik untuk edit header">
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                <h1 style={{fontFamily:appliedStyle?.titleFont||"'Playfair Display',serif",fontSize:32,fontWeight:600,margin:0,lineHeight:1,color:appliedStyle?.titleColor||"#FAF7F2"}}>{ed?tmp:title}</h1>
                <span style={{fontSize:11,opacity:0.35,marginTop:4}}>✏️</span>
              </div>
              <p style={{margin:"0 0 6px",color:appliedStyle?.taglineColor||"rgba(250,247,242,0.6)",fontSize:13,fontStyle:"italic",fontFamily:appliedStyle?.taglineFont||"'DM Sans', sans-serif"}}>{ed?tmpTag:(tagline||"LifeinHalalstyle")}</p>
            </div>
          )}
          <div style={{fontSize:11,height:16}}>{saveMsg&&<span style={{color:"#7DC8A4",fontWeight:500}}>{saveMsg}</span>}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,background:"rgba(255,255,255,0.07)",borderRadius:20,padding:"6px 14px",border:"1px solid rgba(255,255,255,0.1)",width:"fit-content",minWidth:260}}>
            <span style={{fontSize:13,opacity:0.4}}>🔍</span>
            <input value={search} onChange={(e:any)=>onSearch(e.target.value)} placeholder="Cari judul, caption, campaign..."
              style={{background:"transparent",border:"none",outline:"none",color:"#FAF7F2",fontSize:12,fontFamily:"inherit",width:210}}/>
            {search&&<button onClick={()=>onSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(250,247,242,0.4)",fontSize:16,padding:0,lineHeight:1}}>×</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",gap:2,padding:"6px 10px",background:"rgba(255,255,255,0.06)",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",width:"fit-content"}}>
            <div style={{fontSize:8,color:"#C4622D",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>Recap Filter</div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <select value={qYear} onChange={(e)=>onQYearChange(+e.target.value)} style={{background:"transparent",color:"white",border:"none",fontSize:11,outline:"none",cursor:"pointer",fontWeight:600}}>
                {YEARS.map(y=><option key={y} value={y} style={{color:"black"}}>{y}</option>)}
              </select>
              <div style={{width:1,height:10,background:"rgba(255,255,255,0.2)"}}/>
              <select value={qNumber} onChange={(e)=>onQNumberChange(+e.target.value)} style={{background:"transparent",color:"white",border:"none",fontSize:11,outline:"none",cursor:"pointer",fontWeight:600}}>
                <option value={0} style={{color:"black"}}>Full Year</option>
                <option value={1} style={{color:"black"}}>Q1</option>
                <option value={2} style={{color:"black"}}>Q2</option>
                <option value={3} style={{color:"black"}}>Q3</option>
                <option value={4} style={{color:"black"}}>Q4</option>
              </select>
            </div>
          </div>

          {[["Published",pub],["Diarsipkan",arc],["Tot. Reach",fmt(tr)],["Tot. Eng",fmt(te)]].map(([l,v])=>(
            <div key={l as any} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:600,lineHeight:1,letterSpacing:-0.5}}>{v as any}</div>
              <div style={{fontSize:9,color:"rgba(250,247,242,0.3)",marginTop:4,letterSpacing:1.2,textTransform:"uppercase",fontWeight:600}}>{l as any}</div>
            </div>
          ))}
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
            {/* History Controls */}
            <div style={{display:"flex",background:"rgba(255,255,255,0.1)",borderRadius:20,padding:2,border:"1px solid rgba(255,255,255,0.15)"}}>
              <button onClick={undoContent} disabled={!canUndo} style={{display:"flex",alignItems:"center",gap:4,background:canUndo?"rgba(255,255,255,0.05)":"transparent",border:"none",borderRadius:"18px 0 0 18px",padding:"5px 12px",color:canUndo?"#FAF7F2":"rgba(255,255,255,0.25)",cursor:canUndo?"pointer":"not-allowed",fontSize:10,fontWeight:600,transition:"all 0.2s"}}>
                ↩️ Undo
              </button>
              <div style={{width:1,height:14,background:"rgba(255,255,255,0.1)",alignSelf:"center"}}/>
              <button onClick={redoContent} disabled={!canRedo} style={{display:"flex",alignItems:"center",gap:4,background:canRedo?"rgba(255,255,255,0.05)":"transparent",border:"none",borderRadius:"0 18px 18px 0",padding:"5px 12px",color:canRedo?"#FAF7F2":"rgba(255,255,255,0.25)",cursor:canRedo?"pointer":"not-allowed",fontSize:10,fontWeight:600,transition:"all 0.2s"}}>
                Redo ↪️
              </button>
            </div>

            {/* Data Controls */}
            <div style={{display:"flex",gap:6}}>
              <button onClick={onImportClick} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(114,54,128,0.1)",border:"1px solid rgba(114,54,128,0.3)",borderRadius:16,padding:"6px 12px",color:"#FAF7F2",cursor:"pointer",fontSize:10,fontWeight:600,transition:"all 0.2s"}}>
                📥 Import
              </button>
              <button onClick={onExport} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(196,98,45,0.1)",border:"1px solid rgba(196,98,45,0.3)",borderRadius:16,padding:"6px 12px",color:"#FAF7F2",cursor:"pointer",fontSize:10,fontWeight:600,transition:"all 0.2s"}}>
                📤 Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NavBar({tab,setTab,year,setYear,month,setMonth,onOpenAdd}: any) {
  const showDatePicker = !["analytics","settings"].includes(tab);
  
  const VIEWS = [
    {id:"month", ic:"📅", lb:"Bulan"},
    {id:"week", ic:"📆", lb:"Minggu"},
    {id:"board", ic:"🗂️", lb:"Board"},
    {id:"timeline", ic:"📈", lb:"Timeline"},
    {id:"table", ic:"📋", lb:"Tabel"}
  ];
  
  const currentView = VIEWS.find(v=>v.id===tab);

  return (
    <div style={{background:"white",borderBottom:"1px solid rgba(44,32,22,0.08)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",flexWrap:"wrap",gap:4,position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0"}}>
        <div style={{position:"relative", display:"flex", alignItems:"center", gap:8}}>
          <span style={{fontSize:11, fontWeight:600, color:"rgba(44,32,22,0.6)", textTransform:"uppercase"}}>Tampilan:</span>
          <select value={currentView?tab:""} onChange={(e)=>setTab(e.target.value)} style={{...I(),width:140,padding:"6px 12px",fontSize:13,fontWeight:600,border:"none",background:"#FDF0EB",color:"#C4622D",cursor:"pointer"}}>
            {!currentView && <option value="" disabled>--- Pilihan ---</option>}
            {VIEWS.map(v=><option key={v.id} value={v.id}>{v.ic} {v.lb}</option>)}
          </select>
        </div>
        <div style={{width:1,height:24,background:"rgba(44,32,22,0.1)",margin:"0 4px"}}/>
        {showDatePicker&&<>
          <select value={year} onChange={(e:any)=>setYear(+e.target.value)} style={{...I(),width:"auto",padding:"5px 10px",fontSize:13}}>
            {YEARS.map(y=><option key={y}>{y}</option>)}
          </select>
          <select value={month} onChange={(e:any)=>setMonth(+e.target.value)} style={{...I(),width:"auto",padding:"5px 10px",fontSize:13}}>
            {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
        </>}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center",padding:"8px 0"}}>
        <button style={TAB(tab==="analytics")} onClick={()=>setTab("analytics")}>📊 Analitik</button>
        <button style={TAB(tab==="settings")} onClick={()=>setTab("settings")}>⚙️ Pengaturan</button>
        <button style={{...B(true,"#C4622D"),fontWeight:600,marginLeft:12}} onClick={onOpenAdd}>+ Konten Baru</button>
      </div>
    </div>
  );
}

export function FilterBar({filters,setFilters,pillars,platforms,pics,statuses,showHolidays,setShowHolidays,showArchived,setShowArchived}: any) {
  const set = (k: any,v: any) => setFilters((p:any)=>({...p,[k]:v}));
  const FilterSelect = ({label, value, onChange, options, defaultLabel}: any) => (
    <div style={{display:"flex",flexDirection:"column",gap:2}}>
      <span style={{fontSize:9,color:"rgba(44,32,22,0.5)",fontWeight:600,textTransform:"uppercase"}}>{label}</span>
      <select value={value} onChange={(e)=>onChange(e.target.value)} style={{...I(),width:"auto",padding:"4px 8px",fontSize:11}}>
        <option value="All">{defaultLabel}</option>
        {options.map((o:any)=><option key={o.name||o} value={o.name||o}>{o.name||o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{background:"#F5F0E8",borderBottom:"1px solid rgba(44,32,22,0.07)",padding:"8px 24px",display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
      <span style={{fontSize:9,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:"rgba(44,32,22,0.4)",marginBottom:6}}>Filter:</span>
      <FilterSelect label="Pillar" value={filters.pillar} onChange={(v:any)=>set("pillar",v)} options={pillars} defaultLabel="Semua Pillar" />
      <FilterSelect label="Platform" value={filters.platform} onChange={(v:any)=>set("platform",v)} options={platforms} defaultLabel="Semua Platform" />
      <FilterSelect label="PIC" value={filters.pic} onChange={(v:any)=>set("pic",v)} options={pics} defaultLabel="Semua PIC" />
      <FilterSelect label="Status" value={filters.status} onChange={(v:any)=>set("status",v)} options={statuses} defaultLabel="Semua Status" />
      
      <div style={{width:1,height:16,background:"rgba(44,32,22,0.12)",margin:"0 2px", alignSelf:"center"}}/>
      <button onClick={()=>setShowHolidays((v:any)=>!v)} style={{...B(showHolidays,"#A67C1C"),fontSize:10,padding:"4px 10px", marginBottom:2}}>
        {showHolidays?"👁️":"🙈"} Hari Besar
      </button>
      <button onClick={()=>setShowArchived((v:any)=>!v)} style={{...B(showArchived,"#723680"),fontSize:10,padding:"4px 10px", marginBottom:2}}>
        📦 Arsip {showArchived?"(Tampil)":"(Hidden)"}
      </button>
    </div>
  );
}
