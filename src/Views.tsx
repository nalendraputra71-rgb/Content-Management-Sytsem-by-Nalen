import { useState, useMemo, useRef, useEffect } from "react";
import { 
  MONTHS, MS, DAYS_S, MK, MC,
  eng, fmt, fmtD, fmtT, gps, gpc, gss,
  I, B, CARD, PBadge, SBadge, getDynamicEvents 
} from "./data";

export function MonthView({year,month,monthContent,filtered,openEdit,openAdd,showHolidays,holidays,pillars,platforms}: any) {
  const dim = new Date(year,month,0).getDate();
  const sd = new Date(year,month-1,1).getDay();
  const getEv = (d:any) => {
    const staticEv = holidays[`${year}-${month}-${d}`];
    const dynamicEv = getDynamicEvents(year, month, d);
    if (!staticEv) return dynamicEv;
    if (!dynamicEv) return staticEv;
    return `${staticEv} | ${dynamicEv}`;
  };
  const getF  = (d:any) => filtered.filter((c:any)=>c.day===d&&!c.archived);
  const getA  = (d:any) => monthContent.filter((c:any)=>c.day===d&&!c.archived);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:3}}>
        {DAYS_S.map(d=><div key={d} style={{textAlign:"center",fontSize:9,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(44,32,22,0.3)",padding:"5px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {Array.from({length:sd}).map((_,i)=><div key={`e${i}`} style={{minHeight:100,background:"rgba(44,32,22,0.02)",borderRadius:8}}/>)}
        {Array.from({length:dim}).map((_,i)=>{
          const day=i+1,items=getF(day),allItems=getA(day),ev=showHolidays?getEv(day):null;
          const isSpec=ev&&(ev.includes("Launch")||ev.includes("Flash")||ev.includes("Sale"));
          return (
            <div key={day} style={{minHeight:110,background:isSpec?"#FDF0EB":ev?"#F5F0E8":"white",borderRadius:8,padding:6,border:isSpec?"1.5px solid rgba(196,98,45,0.4)":ev?"1px solid rgba(196,98,45,0.2)":"1px solid rgba(44,32,22,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                <span style={{fontSize:18,fontWeight:800,lineHeight:1,color:isSpec?"#FF6B00":"#2C2016"}}>{day}</span>
                <div style={{display:"flex",gap:3,alignItems:"center"}}>
                  {allItems.length>0&&<span style={{background:"#2C2016",color:"#FAF7F2",borderRadius:12,padding:"2px 6px",fontSize:9,fontWeight:700}}>{allItems.length}</span>}
                  <button onClick={()=>openAdd(day)} style={{background:"rgba(255,107,0,0.1)",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:"#FF6B00",padding:0,transition:"all 0.2s"}} className="hover-scale">+</button>
                </div>
              </div>
              {ev&&<div style={{fontSize:8,color:isSpec?"#C4622D":"#A67C1C",fontWeight:700,marginBottom:3,lineHeight:1.2,textTransform:"uppercase",letterSpacing:0.3}}>{ev}</div>}
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {items.slice(0,4).map((item:any)=>{
                  const ps=gps(pillars,item.pillar);
                  return (
                    <button key={item.id} className="hover-scale" onClick={()=>openEdit(item)} style={{background:ps.light,border:"none",borderLeft:`3px solid ${ps.color}`,borderRadius:"4px 8px 8px 4px",padding:"4px 6px",textAlign:"left",cursor:"pointer",width:"100%",marginBottom:2}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:3}}>
                        <span className="pill-tag" style={{background:gpc(platforms,item.platform),color:"#FAF7F2",fontSize:8,padding:"1px 4px",marginTop:1}}>{item.platform[0]}</span>
                        {item.isAds&&<span style={{fontSize:8,marginTop:1}}>💰</span>}
                        <span style={{fontSize:10,color:ps.color,fontWeight:700,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.title||"(tanpa judul)"}</span>
                      </div>
                    </button>
                  );
                })}
                {items.length>4&&<div style={{fontSize:9,color:"rgba(44,32,22,0.4)",paddingLeft:4,fontWeight:500}}>+{items.length-4} lainnya</div>}
                {items.length===0&&allItems.length>0&&<div style={{fontSize:8,color:"rgba(44,32,22,0.3)",fontStyle:"italic"}}>Disembunyikan filter</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WeekView({year,month,content,openEdit,openAdd,pillars,platforms,showHolidays,holidays}: any) {
  const [wOff,setWOff] = useState(0);
  const base = new Date(year,month-1,1);
  const ws = new Date(base.getTime() + wOff*7*86400000);
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(ws.getTime()+i*86400000);
    return {date:d,y:d.getFullYear(),mo:d.getMonth()+1,d:d.getDate(),dow:d.getDay()};
  });
  const getItems = (day:any) => content.filter((c:any)=>c.year===day.y&&c.month===day.mo&&c.day===day.d&&!c.archived);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <button onClick={()=>setWOff(w=>w-1)} style={{...B(false),padding:"5px 12px"}}>← Minggu Lalu</button>
        <div style={{fontSize:16,fontWeight:700,color:"#2C2016"}}>
          {fmtD(days[0].y,days[0].mo,days[0].d)} — {fmtD(days[6].y,days[6].mo,days[6].d)}
        </div>
        <button onClick={()=>setWOff(w=>w+1)} style={{...B(false),padding:"5px 12px"}}>Minggu Depan →</button>
        <button onClick={()=>setWOff(0)} style={{...B(false),padding:"5px 10px",fontSize:11}}>↺ Reset</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
        {days.map(day=>{
          const items=getItems(day);
          const staticEv=showHolidays?holidays[`${day.y}-${day.mo}-${day.d}`]:null;
          const dynamicEv=showHolidays?getDynamicEvents(day.y, day.mo, day.d):null;
          const ev = staticEv ? (dynamicEv ? `${staticEv} | ${dynamicEv}` : staticEv) : dynamicEv;
          const isToday=new Date().toDateString()===day.date.toDateString();
          return (
            <div key={day.d+"-"+day.mo} style={{background:isToday?"#FDF5E8":"white",borderRadius:10,padding:10,border:isToday?"2px solid #C4622D":"1px solid rgba(44,32,22,0.08)",minHeight:180}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",color:"rgba(44,32,22,0.4)"}}>{DAYS_S[day.dow]}</div>
                  <div style={{fontSize:24,fontWeight:800,lineHeight:1,color:isToday?"#FF6B00":"#2C2016"}}>{day.d}</div>
                  <div style={{fontSize:9,fontWeight:600,color:"rgba(44,32,22,0.3)"}}>{MS[day.mo-1]} {day.y}</div>
                </div>
                <button onClick={()=>openAdd(day.d)} className="hover-scale" style={{background:"rgba(255,107,0,0.1)",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",color:"#FF6B00",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",padding:0,transition:"all 0.2s"}}>+</button>
              </div>
              {ev&&<div style={{fontSize:8,color:"#A67C1C",fontWeight:700,background:"#FBF5E3",borderRadius:4,padding:"2px 5px",marginBottom:5}}>{ev}</div>}
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {items.map((item:any)=>{
                  const ps=gps(pillars,item.pillar);
                  return (
                    <button key={item.id} className="hover-scale card-hover" onClick={()=>openEdit(item)} style={{background:ps.light,border:"none",borderLeft:`3px solid ${ps.color}`,borderRadius:"6px 12px 12px 6px",padding:"6px 8px",textAlign:"left",cursor:"pointer",width:"100%",marginBottom:4}}>
                      <div style={{fontSize:10,color:ps.color,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                      <div style={{fontSize:8,color:"rgba(44,32,22,0.5)",marginTop:2,fontWeight:600}}>{fmtT(item.uploadHour,item.uploadMinute)} · {item.platform} {item.isAds?"💰":""}</div>
                    </button>
                  );
                })}
                {items.length===0&&<div style={{fontSize:9,color:"rgba(44,32,22,0.2)",fontStyle:"italic",textAlign:"center",marginTop:8}}>Kosong</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BoardView({year,month,content,filtered,openEdit,openAdd,statuses,pillars,platforms,search}: any) {
  const items = filtered.filter((c:any)=>c.year===year&&c.month===month&&!c.archived);
  
  const High = ({txt}:any) => {
    try {
      if(!search || !txt) return <>{txt}</>;
      const str = String(txt);
      const parts = str.split(new RegExp(`(${search})`, 'gi'));
      return <>{parts.map((p:any,i:number)=>p.toLowerCase()===search.toLowerCase()?<mark key={i} style={{background:"#FDF0EB",color:"#C4622D",padding:"0 2px",borderRadius:2}}>{p}</mark>:p)}</>;
    } catch(e) { return <>{txt}</>; }
  };

  return (
    <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:12,minHeight:400}}>
      {Array.isArray(statuses) && statuses.map((st:any)=>{
        const stName = typeof st === 'string' ? st : (st?.name || st?.id || String(st));
        const cols=items.filter((c:any)=>c.status===stName);
        const ss = (typeof st !== 'string' && st?.color) ? {bg: st.color+"20", color: st.color} : gss(stName);
        return (
          <div key={stName} style={{minWidth:220,flex:"0 0 220px",background:"#F5F0E8",borderRadius:12,padding:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:ss?.color||"#ccc"}}/>
                <span style={{fontSize:11,fontWeight:700,color:"#2C2016"}}>{stName}</span>
              </div>
              <span style={{background:ss?.bg||"#eee",color:ss?.color||"#333",fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:8}}>{cols.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {cols.map((item:any)=>{
                const ps=gps(pillars,item.pillar) || {color:"#ccc", light:"#eee"};
                return (
                  <div key={item.id} onClick={()=>openEdit(item)} style={{background:"white",borderRadius:8,padding:"10px 12px",cursor:"pointer",boxShadow:"0 1px 3px rgba(44,32,22,0.07)",borderLeft:`3px solid ${ps.color}`}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#2C2016",lineHeight:1.3,marginBottom:5}}><High txt={item.title||"(tanpa judul)"}/></div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                      <PBadge name={item.platform} platforms={platforms}/>
                      <span style={{background:ps.light,color:ps.color,fontSize:8,padding:"1px 5px",borderRadius:6}}>{item.pillar}</span>
                      {item.isAds&&<span style={{fontSize:8,color:"#9C2B4E",fontWeight:700}}>💰 Ads</span>}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:9,color:"rgba(44,32,22,0.4)"}}>PIC: {item.pic || "-"}</span>
                      <span style={{fontSize:9,color:"rgba(44,32,22,0.35)"}}>{item.day}/{String(item.month).padStart(2,"0")}</span>
                    </div>
                    {eng(item.metrics)>0&&<div style={{fontSize:9,color:"#C4622D",fontWeight:600,marginTop:3}}>⚡ {fmt(eng(item.metrics))} eng</div>}
                  </div>
                );
              })}
              <button onClick={()=>openAdd(1)} style={{background:"rgba(44,32,22,0.04)",border:"1.5px dashed rgba(44,32,22,0.15)",borderRadius:8,padding:"8px",cursor:"pointer",color:"rgba(44,32,22,0.4)",fontSize:11,width:"100%",textAlign:"center"}}>+ Tambah</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TimelineView({year,month,content,filtered,openEdit,openAdd,pillars,platforms,showHolidays,holidays}: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dim = new Date(year,month,0).getDate();
  const getItems = (d:any) => filtered.filter((c:any)=>c.day===d&&!c.archived);
  const getEv = (d:any) => showHolidays?holidays[`${year}-${month}-${d}`]:null;
  useEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollLeft=0;
  },[year,month]);
  return (
    <div>
      <div style={{fontSize:16,fontWeight:700,marginBottom:12,color:"#2C2016"}}>Timeline — {MONTHS[month-1]} {year}</div>
      <div ref={scrollRef} style={{overflowX:"auto",paddingBottom:12}}>
        <div style={{display:"flex",gap:6,minWidth:dim*120+"px"}}>
          {Array.from({length:dim},(_,i)=>{
            const day=i+1,items=getItems(day),ev=getEv(day);
            const dow=new Date(year,month-1,day).getDay();
            const isWe=dow===0||dow===6;
            return (
              <div key={day} style={{flex:"0 0 120px",background:isWe?"#F5F0E8":ev?"#FDF5E8":"white",borderRadius:10,padding:8,border:ev?"1.5px solid rgba(196,98,45,0.3)":"1px solid rgba(44,32,22,0.07)",minHeight:220}}>
                <div style={{borderBottom:"1.5px solid rgba(44,32,22,0.08)",paddingBottom:6,marginBottom:6}}>
                  <div style={{fontSize:9,textTransform:"uppercase",fontWeight:700,color:"rgba(44,32,22,0.4)"}}>{DAYS_S[dow]}</div>
                  <div style={{fontSize:24,fontWeight:800,lineHeight:1,color:isWe?"rgba(44,32,22,0.3)":"#2C2016"}}>{day}</div>
                  {ev&&<div style={{fontSize:8,color:"#A67C1C",fontWeight:700,lineHeight:1.2,marginTop:4}}>{ev}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {items.map((item:any)=>{
                    const ps=gps(pillars,item.pillar);
                    return (
                      <button key={item.id} className="hover-scale card-hover" onClick={()=>openEdit(item)} style={{background:ps.light,border:"none",borderLeft:`3px solid ${ps.color}`,borderRadius:"4px 8px 8px 4px",padding:"4px 6px",textAlign:"left",cursor:"pointer",width:"100%"}}>
                        <div style={{fontSize:9,color:ps.color,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",wordWrap:"break-word"}}>{item.title||"(tanpa judul)"}</div>
                        <div style={{fontSize:8,color:"rgba(44,32,22,0.5)",marginTop:2,fontWeight:600}}>{fmtT(item.uploadHour,item.uploadMinute)} {item.isAds?"💰":""}</div>
                      </button>
                    );
                  })}
                  <button onClick={()=>openAdd(day)} className="hover-scale btn-hover" style={{background:"transparent",border:"1px dashed rgba(44,32,22,0.15)",borderRadius:8,padding:"6px",cursor:"pointer",color:"rgba(44,32,22,0.4)",fontSize:11,width:"100%", fontWeight:600}}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TableView({filtered,openEdit,archiveItem,unarchiveItem,deleteItem,pillars,platforms,showArchived,search,bulkIds,setBulkIds,onBulk}: any) {
  const [sort,setSort] = useState({col:"day",dir:"asc"});

  const defaultWidths: Record<string, number> = {
    "Tgl": 60, "Platform": 100, "Pillar": 120, "Judul Konten": 200, "Brief Konten": 250, "PIC": 100, "Status": 120, "Views": 80, "Reach": 80, "Engagement": 100, "Aksi": 160
  };
  const [colWidths, setColWidths] = useState<Record<string, number>>(()=>{
    const saved = localStorage.getItem("socialStudioColWidths");
    return saved ? JSON.parse(saved) : defaultWidths;
  });

  const handleResize = (col: string, newWidth: number) => {
    setColWidths((prev) => {
      const next = {...prev, [col]: Math.max(50, newWidth)};
      localStorage.setItem("socialStudioColWidths", JSON.stringify(next));
      return next;
    });
  };

  const Resizer = ({ col, currentWidth }: { col: string, currentWidth: number }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const startX = e.pageX;
      const startWidth = currentWidth || defaultWidths[col];
      
      const onMouseMove = (moveEvent: MouseEvent) => {
        handleResize(col, startWidth + moveEvent.pageX - startX);
      };
      
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    return <div onMouseDown={handleMouseDown} onClick={e=>e.stopPropagation()} style={{position: "absolute", top: 0, right: -2, width: 6, height: "100%", cursor: "col-resize", zIndex: 10}} />;
  };

  const items = filtered.filter((c:any)=>showArchived?c.archived:!c.archived);
  const sorted = useMemo(()=>{
    return [...items].sort((a,b)=>{
      let va=a[sort.col],vb=b[sort.col];
      if(sort.col==="engagement"){va=eng(a.metrics)+eng(a.adsMetrics);vb=eng(b.metrics)+eng(b.adsMetrics);}
      if(sort.col==="reach"){va=(a.metrics?.reach||0)+(a.adsMetrics?.reach||0);vb=(b.metrics?.reach||0)+(b.adsMetrics?.reach||0);}
      if(sort.col==="views"){va=(a.metrics?.views||0)+(a.adsMetrics?.views||0);vb=(b.metrics?.views||0)+(b.adsMetrics?.views||0);}
      if(typeof va==="string") return sort.dir==="asc"?va.localeCompare(vb):vb.localeCompare(va);
      return sort.dir==="asc"?(va||0)-(vb||0):(vb||0)-(va||0);
    });
  },[items,sort]);
  const setS = (col:any) => setSort(s=>s.col===col?{col,dir:s.dir==="asc"?"desc":"asc"}:{col,dir:"asc"});
  const th = (col:any) => ({textAlign:"left" as any,fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase" as any,color:"rgba(44,32,22,0.4)",padding:"10px 10px",borderBottom:"2px solid rgba(44,32,22,0.08)",whiteSpace:"nowrap" as any,cursor:"pointer",userSelect:"none" as any});
  const td = {padding:"8px 10px",fontSize:12,borderBottom:"1px solid rgba(44,32,22,0.05)",verticalAlign:"middle"};
  const arrow = (col:any) => sort.col===col?(sort.dir==="asc"?"↑":"↓"):"";

  const toggleBulk = (id:string) => setBulkIds((p:any)=>p.includes(id)?p.filter((x:any)=>x!==id):[...p,id]);
  const toggleAll = () => setBulkIds(bulkIds.length===sorted.length?[]:sorted.map((c:any)=>c.id));

  const High = ({txt}:any) => {
    if(!search)return txt;
    const parts = txt.toString().split(new RegExp(`(${search})`, 'gi'));
    return parts.map((p:any,i:number)=>p.toLowerCase()===search.toLowerCase()?<mark key={i} style={{background:"#FDF0EB",color:"#C4622D",padding:"0 2px",borderRadius:2}}>{p}</mark>:p);
  };

  return (
    <div style={{background:"white",borderRadius:12,overflow:"auto",boxShadow:"0 1px 4px rgba(44,32,22,0.08)"}}>
      {bulkIds.length>0 && (
        <div style={{padding:"8px 16px",background:"rgba(196,98,45,0.05)",borderBottom:"1px solid rgba(196,98,45,0.1)",display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:600,color:"#C4622D"}}>{bulkIds.length} terpilih</span>
          <div style={{width:1,height:14,background:"rgba(196,98,45,0.2)"}}/>
          <button onClick={()=>onBulk("archive")} style={{background:"none",border:"none",color:"#723680",fontSize:13,fontWeight:600,cursor:"pointer"}}>📦 Arsip Massal</button>
          <button onClick={()=>onBulk("restore")} style={{background:"none",border:"none",color:"#2E7D32",fontSize:13,fontWeight:600,cursor:"pointer"}}>🔄 Pulihkan Massal</button>
          <button onClick={()=>onBulk("delete")} style={{background:"none",border:"none",color:"#9C2B4E",fontSize:13,fontWeight:600,cursor:"pointer"}}>🗑️ Hapus Massal</button>
          <div style={{flex:1}}/>
          <button onClick={()=>setBulkIds([])} style={{background:"none",border:"none",color:"rgba(44,32,22,0.4)",fontSize:13,cursor:"pointer"}}>Batal</button>
        </div>
      )}
      {sorted.length===0
        ? <div style={{padding:48,textAlign:"center",color:"rgba(44,32,22,0.3)",fontSize:14}}>Tidak ada konten.</div>
        : <table style={{minWidth:"100%", width: "max-content", borderCollapse:"collapse", tableLayout: "fixed"}}>
            <thead>
              <tr>
                <th style={{padding:"10px",borderBottom:"2px solid rgba(44,32,22,0.08)",width:40}}><input type="checkbox" checked={bulkIds.length===sorted.length&&sorted.length>0} onChange={toggleAll}/></th>
                {[["Tgl","day"],["Platform","platform"],["Pillar","pillar"],["Judul Konten","title"],["Brief Konten","briefCopywriting"],["PIC","pic"],["Status","status"],["Views","views"],["Reach","reach"],["Engagement","engagement"],["Aksi",""]].map(([h,col])=>(
                  <th key={h} style={{...th(col), position: "relative", width: colWidths[h] || 100}} onClick={()=>col&&setS(col)}>
                    {h}{col&&<span style={{marginLeft:3,opacity:0.5}}>{arrow(col)}</span>}
                    <Resizer col={h} currentWidth={colWidths[h]} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(item=>{
                const e=eng(item.metrics)+eng(item.adsMetrics),ps=gps(pillars,item.pillar),ss=gss(item.status);
                const v=(item.metrics?.views||0)+(item.adsMetrics?.views||0);
                const r=(item.metrics?.reach||0)+(item.adsMetrics?.reach||0);
                return (
                  <tr key={item.id} style={{background:item.archived?"rgba(114,54,128,0.04)":bulkIds.includes(item.id)?"rgba(196,98,45,0.03)":"white",opacity:item.archived?0.7:1}} onMouseEnter={x=>x.currentTarget.style.background="#FAFAF8"} onMouseLeave={x=>x.currentTarget.style.background=item.archived?"rgba(114,54,128,0.04)":bulkIds.includes(item.id)?"rgba(196,98,45,0.03)":"white"}>
                    <td style={td}><input type="checkbox" checked={bulkIds.includes(item.id)} onChange={()=>toggleBulk(item.id)}/></td>
                    <td style={td}>
                      <span style={{fontWeight:800,fontSize:16,color:"#2C2016"}}>{item.day}</span>
                      <div style={{fontSize:10,color:"rgba(44,32,22,0.4)",fontWeight:600}}>{fmtT(item.uploadHour,item.uploadMinute)}</div>
                    </td>
                    <td style={td}><PBadge name={item.platform} platforms={platforms}/></td>
                    <td style={td}><span className="pill-tag" style={{background:ps.light,color:ps.color}}>{item.pillar}</span></td>
                    <td style={{...td, verticalAlign:"top"}}>
                      <div style={{fontWeight:600,lineHeight:1.4, wordBreak:"break-word"}}><High txt={item.title}/></div>
                      <div style={{display:"flex",gap:4,marginTop:6, flexWrap: "wrap"}}>
                        {item.isAds&&<span style={{fontSize:8,color:"#9C2B4E",fontWeight:700}}>💰 Ads</span>}
                        {item.archived&&<span style={{fontSize:8,color:"#723680",fontWeight:700}}>📦 Arsip</span>}
                        {item.linkAsset&&<a href={item.linkAsset} target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:"#2B4C7E"}}>🔗 Aset</a>}
                      </div>
                    </td>
                    <td style={{...td, verticalAlign:"top"}}>
                      <div style={{fontSize:12,color:"rgba(44,32,22,0.6)",lineHeight:1.5, wordBreak:"break-word", whiteSpace: "pre-wrap"}}>{item.briefCopywriting||"-"}</div>
                    </td>
                    <td style={td}><span className="pill-tag" style={{background:"rgba(44,32,22,0.06)",color:"#2C2016"}}>{item.pic}</span></td>
                    <td style={td}><SBadge status={item.status}/></td>
                    <td style={{...td,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{fmt(v)}</td>
                    <td style={{...td,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{fmt(r)}</td>
                    <td style={{...td,textAlign:"right",fontVariantNumeric:"tabular-nums",fontWeight:600,color:"#C4622D"}}>{fmt(e)}</td>
                    <td style={td}>
                      <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                        <button onClick={()=>openEdit(item)} style={{background:"#F5F0E8",border:"none",borderRadius:6,padding:"3px 8px",fontSize:10,cursor:"pointer",color:"#2C2016",fontWeight:500}}>Edit</button>
                        {item.status==="Published"&&!item.archived&&<button onClick={()=>archiveItem(item.id)} style={{background:"#F1E8F5",border:"none",borderRadius:6,padding:"3px 8px",fontSize:10,cursor:"pointer",color:"#723680",fontWeight:500}}>📦 Arsip</button>}
                        {item.archived&&<button onClick={()=>unarchiveItem(item.id)} style={{background:"#E8F5E9",border:"none",borderRadius:6,padding:"3px 8px",fontSize:10,cursor:"pointer",color:"#2E7D32",fontWeight:500}}>🔄 Pulihkan</button>}
                        {!item.archived&&<button onClick={()=>deleteItem(item.id)} style={{background:"#FDF5F8",border:"none",borderRadius:6,padding:"3px 8px",fontSize:10,cursor:"pointer",color:"#9C2B4E",fontWeight:500}}>🗑️ Hapus</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      }
    </div>
  );
}
