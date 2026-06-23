import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock } from "lucide-react";
import { 
  MONTHS, MS, DAYS_S, MK, MC,
  eng, fmt, fmtD, fmtT, getMin, gps, gpc, gss,
  I, B, CARD, PBadge, SBadge, PiBadge, getDynamicEvents, htmlToPlainText 
} from "./data";

export function MonthView({year,month,monthContent,filtered,openEdit,openAdd,showHolidays,holidays,customEvents,pillars,platforms,showArchived,contentTypes,moveItemDate}: any) {
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);
  
  const dim = new Date(year,month,0).getDate();
  const sd = new Date(year,month-1,1).getDay();
  
  const getEv = (d:any) => {
    let result: {name: string, color: string | null}[] = [];
    
    // 1. Static Holidays
    const staticEv = holidays[`${year}-${month}-${d}`];
    if (staticEv) result.push({ name: staticEv, color: null });
    
    // 2. Dynamic Holidays (Launch days etc)
    const dynamicEv = getDynamicEvents(year, month, d);
    if (dynamicEv) result.push({ name: dynamicEv, color: "#3B82F6" });

    // 3. Custom Events
    if (customEvents && Array.isArray(customEvents)) {
      const parseLocalDate = (dateStr: any) => {
        if (!dateStr || typeof dateStr !== "string") return new Date(0);
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
        return new Date(dateStr);
      };

      customEvents.forEach((ev: any) => {
        const start = parseLocalDate(ev.start);
        const end = parseLocalDate(ev.end);
        const current = new Date(year, month - 1, d);
        
        let match = false;
        if (ev.monthly) {
          // Monthly recurrence check (only day of month)
          const startDay = start.getDate();
          const endDay = end.getDate();
          // Handling multi-day monthly events (e.g. 25-28 every month)
          if (startDay <= endDay) {
            if (d >= startDay && d <= endDay) match = true;
          } else {
            // Crossing month boundary (not common for monthly setting but possible)
            if (d >= startDay || d <= endDay) match = true;
          }
        } else {
          // Standard date range check
          match = current >= start && current <= end;
        }

        if (match) {
          result.push({ name: ev.name, color: ev.color });
        }
      });
    }

    return result;
  };

  const getF  = (d:any) => filtered.filter((c:any)=>c.day===d&&(!c.archived || showArchived)).sort((a:any,b:any) => getMin(a) - getMin(b));
  const getA  = (d:any) => monthContent.filter((c:any)=>c.day===d&&(!c.archived || showArchived));

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    if (e.dataTransfer.setDragImage) {
      // Optional drag image logic can go here
    }
  };

  const handleDragOver = (e: React.DragEvent, dateTarget: number) => {
    e.preventDefault();
    if (dragOverDate !== dateTarget) {
      setDragOverDate(dateTarget);
    }
  };

  const handleDragEnter = (e: React.DragEvent, dateTarget: number) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent, dateTarget: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDate: number) => {
    e.preventDefault();
    setDragOverDate(null);
    const id = e.dataTransfer.getData('text/plain');
    if (id && moveItemDate) {
      await moveItemDate(id, targetDate);
    }
  };

  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.45)",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      transform: "translateZ(0)",
      willChange: "transform",
      borderRadius: "24px",
      padding: "24px",
      border: "1px solid rgba(255, 255, 255, 0.6)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"
    }}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:8,marginBottom:12}}>
        {DAYS_S.map(d=><div key={d} style={{textAlign:"center",fontSize:12,fontWeight:600,textTransform:"uppercase",color:"rgba(0,0,0,0.5)",letterSpacing:1}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:8}}>
        {Array.from({length:sd}).map((_,i)=><div key={`e${i}`} style={{minHeight:100,background:"transparent"}}/>)}
        {Array.from({length:dim}).map((_,i)=>{
          const day=i+1, items=getF(day), allItems=getA(day), evs=showHolidays?getEv(day):[];
          const isSpec = evs.some(e => e.name.includes("Launch") || e.name.includes("Flash") || e.name.includes("Sale") || e.name.includes("Promo") || e.name.includes("Payday"));
          const isToday = new Date().toDateString() === new Date(year, month - 1, day).toDateString();
          
          return (
            <div key={day} 
              onDragOver={(e) => handleDragOver(e, day)}
              onDragEnter={(e) => handleDragEnter(e, day)}
              onDragLeave={(e) => handleDragLeave(e, day)}
              onDrop={(e) => handleDrop(e, day)}
              style={{
              minHeight: 140, 
              maxHeight: 250,
              display: "flex",
              flexDirection: "column",
              background: dragOverDate === day ? "rgba(255,255,255,0.9)" : isToday ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
              borderRadius: 16,
              padding: 10,
              border: dragOverDate === day ? "1px dashed rgba(0,122,255,0.5)" : isToday ? "1px solid rgba(0,122,255,0.3)" : "1px solid rgba(255,255,255,0.7)",
              boxShadow: dragOverDate === day ? "inset 0 0 0 1px rgba(0,122,255,0.2)" : isToday ? "0 4px 16px rgba(0,122,255,0.1)" : "0 2px 10px rgba(0,0,0,0.02)",
              transition: "all 0.2s"
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <span style={{fontSize:14,fontWeight:600,lineHeight:1,color:isToday?"#2383e2":"#37352F", paddingLeft: 4, paddingTop: 4}}>{day}</span>
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  {allItems.length>0&&<span style={{color:"#787774",fontSize:11,fontWeight:500}}>{allItems.length} item</span>}
                  <button onClick={()=>openAdd(day)} style={{background:"transparent",border:"none",borderRadius:"4px",width:20,height:20,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#787774",padding:0,transition:"all 0.2s"}} className="hover:bg-gray-200">+</button>
                </div>
              </div>
              
              <div style={{display:"flex", flexDirection:"column", gap:2, marginBottom:4}}>
                {evs.map((e, idx) => (
                  <div key={idx} style={{
                    fontSize:7, 
                    color: e.color || (isSpec ? "#3B82F6" : "#A67C1C"), 
                    background: e.color ? `${e.color}15` : "transparent",
                    padding: e.color ? "1px 4px" : "0",
                    borderRadius: 4,
                    fontWeight: 700, 
                    lineHeight: 1.2, 
                    letterSpacing:0.3,
                    border: e.color ? `1px solid ${e.color}33` : "none"
                  }}>
                    {e.name}
                  </div>
                ))}
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:2, flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "2px", scrollbarWidth: "thin"}}>
                <AnimatePresence>
                  {items.map((item:any)=>{
                    const ps = item.archived ? { color: "#7A7976", light: "#EBEAE6" } : gps(pillars, String(item.pillar).split(',')[0].trim());
                    const ctName = String(item.contentType || "").split(',')[0].trim();
                    const ctChar = ctName ? ctName.charAt(0).toUpperCase() : (item.platform ? (String(item.platform).split(',')[0].trim().charAt(0).toUpperCase() || "T") : "T");
                    const ctBg = item.archived 
                      ? "#9E9D9A" 
                      : (ctName 
                          ? gpc(contentTypes || [], ctName) 
                          : gpc(platforms, String(item.platform || "").split(',')[0].trim()));
                    return (
                      <motion.button 
                        layout
                        layoutId={item.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={item.id} 
                        draggable 
                        onDragStart={(e: any) => handleDragStart(e, item.id)} 
                        onDragEnd={() => setDragOverDate(null)}
                        onClick={()=>openEdit(item)} 
                        style={{
                          background: "rgba(255,255,255,0.7)",
                          flexShrink:0,border:"1px solid rgba(255,255,255,0.9)",borderRadius:"6px",padding:"4px 6px",textAlign:"left",cursor:"grab",width:"100%",marginBottom:2,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.02)"
                        }}
                      >
                        <div style={{display:"flex",alignItems:"flex-start",gap:3}}>
                          <span style={{background:ctBg,color:"white",fontSize:9,fontWeight:600,padding:"0px 3px",borderRadius:2,flexShrink:0,marginTop:1}}>{ctChar}</span>
                          {item.isAds&&<span style={{fontSize:9,flexShrink:0,marginTop:1}}>💰</span>}
                          <span style={{fontSize:10,color:ps.color,fontWeight:500,lineHeight:1.2,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.title||"Untitled"}{item.archived ? " 📦" : ""}</span>
                        </div>
                        <div style={{fontSize:8,color:"rgba(55,53,47,0.6)",marginTop:2,fontWeight:500,display:"flex",alignItems:"center",gap:3}}>
                           <Clock size={8} /> {fmtT(item.uploadHour, item.uploadMinute, item.timeFormat)}
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
                {items.length===0&&allItems.length>0&&<div style={{fontSize:8,color:"rgba(44,32,22,0.3)",fontStyle:"italic"}}>Disembunyikan filter</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WeekView({year,month,content,filtered,openEdit,openAdd,pillars,platforms,showHolidays,holidays,showArchived}: any) {
  const [wOff,setWOff] = useState(0);
  const base = new Date(year,month-1,1);
  const ws = new Date(base.getTime() + wOff*7*86400000);
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(ws.getTime()+i*86400000);
    return {date:d,y:d.getFullYear(),mo:d.getMonth()+1,d:d.getDate(),dow:d.getDay()};
  });
  const getItems = (day:any) => filtered.filter((c:any)=>c.year===day.y&&c.month===day.mo&&c.day===day.d&&(!c.archived || showArchived)).sort((a:any,b:any) => getMin(a) - getMin(b));
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <button onClick={()=>setWOff(w=>w-1)} style={{...B(false),padding:"4px 8px", background:"transparent", border:"none", boxShadow:"none", color:"#787774"}}>← Previous</button>
        <div style={{fontSize:16,fontWeight:600,color:"#37352F"}}>
          {fmtD(days[0].y,days[0].mo,days[0].d)} — {fmtD(days[6].y,days[6].mo,days[6].d)}
        </div>
        <button onClick={()=>setWOff(w=>w+1)} style={{...B(false),padding:"4px 8px", background:"transparent", border:"none", boxShadow:"none", color:"#787774"}}>Next →</button>
        <button onClick={()=>setWOff(0)} style={{...B(false),padding:"4px 8px",fontSize:12, background:"transparent", border:"none", boxShadow:"none", color:"#787774"}}>Today</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:12}}>
        {days.map(day=>{
          const items=getItems(day);
          const staticEv=showHolidays?holidays[`${day.y}-${day.mo}-${day.d}`]:null;
          const dynamicEv=showHolidays?getDynamicEvents(day.y, day.mo, day.d):null;
          const ev = staticEv ? (dynamicEv ? `${staticEv} | ${dynamicEv}` : staticEv) : dynamicEv;
          const isToday=new Date().toDateString()===day.date.toDateString();
          return (
            <div key={day.d+"-"+day.mo} style={{background:"transparent",borderRadius:0,padding:0,border:"none",minHeight:180}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8, borderBottom: "1px solid rgba(55,53,47,0.08)", paddingBottom: 8}}>
                <div style={{display:"flex", alignItems:"baseline", gap: 6}}>
                  <div style={{fontSize:12,fontWeight:600,color:isToday?"#2383e2":"#787774"}}>{DAYS_S[day.dow]}</div>
                  <div style={{fontSize:18,fontWeight:500,lineHeight:1,color:isToday?"#2383e2":"#37352F"}}>{day.d}</div>
                </div>
                <button onClick={()=>openAdd(day.d)} style={{background:"transparent",border:"none",borderRadius:"4px",width:20,height:20,cursor:"pointer",color:"#787774",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",padding:0,transition:"all 0.2s"}} className="hover:bg-gray-200">+</button>
              </div>
              {ev&&<div style={{fontSize:8,color:"#A67C1C",fontWeight:700,background:"#FBF5E3",borderRadius:4,padding:"2px 5px",marginBottom:5}}>{ev}</div>}
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {items.map((item:any)=>{
                  const firstPillar = String(item.pillar).split(',')[0].trim();
                  const ps = item.archived ? { color: "#7A7976", light: "#EBEAE6" } : gps(pillars, firstPillar);
                  return (
                    <button key={item.id} onClick={()=>openEdit(item)} style={{background:ps.light,border:"none",borderRadius:"4px",padding:"6px 8px",textAlign:"left",cursor:"pointer",width:"100%",marginBottom:4, transition: "background 0.2s"}}>
                      <div style={{fontSize:11,color:ps.color,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title || "Untitled"}{item.archived ? " 📦" : ""}</div>
                      <div style={{fontSize:10,color:"rgba(55,53,47,0.6)",marginTop:2,fontWeight:400}}>{fmtT(item.uploadHour,item.uploadMinute,item.timeFormat)} · {String(item.platform).split(',')[0].trim()} {String(item.platform).includes(',')?'+':''} {item.isAds?"💰":""}</div>
                    </button>
                  );
                })}
                {items.length===0&&<div style={{fontSize:11,color:"#787774",fontStyle:"italic",textAlign:"left",marginTop:4}}>No items</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BoardView({year,month,content,filtered,openEdit,openAdd,statuses,pillars,platforms,search,showArchived}: any) {
  const items = filtered.filter((c:any)=>c.year===year&&c.month===month&&(!c.archived || showArchived));
  
  const High = ({txt}:any) => {
    try {
      if(!search || !txt) return <>{txt}</>;
      const str = String(txt);
      const parts = str.split(new RegExp(`(${search})`, 'gi'));
      return <>{parts.map((p:any,i:number)=>p.toLowerCase()===search.toLowerCase()?<mark key={i} style={{background:"rgba(var(--theme-primary-rgb),0.1)",color:"var(--theme-primary)",padding:"0 2px",borderRadius:2}}>{p}</mark>:p)}</>;
    } catch(e) { return <>{txt}</>; }
  };

  return (
    <div style={{display:"flex",gap:24,overflowX:"auto",paddingBottom:24,minHeight:400}}>
      {Array.isArray(statuses) && statuses.map((st:any)=>{
        const stName = typeof st === 'string' ? st : (st?.name || st?.id || String(st));
        const cols=items.filter((c:any)=>c.status===stName).sort((a:any,b:any) => getMin(a) - getMin(b));
        const ss = (typeof st !== 'string' && st?.color) ? {bg: st.color+"20", color: st.color} : gss(stName);
        return (
          <div key={stName} style={{
            minWidth:280,
            flex:"0 0 280px",
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            transform: "translateZ(0)",
            willChange: "transform",
            borderRadius: "24px",
            padding: "20px",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.04)"
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{background:ss?.bg||"rgba(255,255,255,0.8)",border:"1px solid rgba(255,255,255,0.6)",color:ss?.color||"#333",fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:8}}>{stName}</span>
                <span style={{color:"rgba(0,0,0,0.5)",fontSize:13,fontWeight:600}}>{cols.length}</span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {cols.map((item:any)=>{
                const ps = item.archived ? { color: "#787774", light: "rgba(255,255,255,0.5)" } : (gps(pillars,item.pillar) || {color:"#787774", light:"rgba(255,255,255,0.5)"});
                return (
                  <div key={item.id} onClick={()=>openEdit(item)} style={{
                    background:"rgba(255,255,255,0.7)",
                    borderRadius:16,
                    padding:"16px",
                    cursor:"pointer",
                    boxShadow:"0 2px 12px rgba(0,0,0,0.03)",
                    border:"1px solid rgba(255,255,255,0.9)",
                    opacity: item.archived ? 0.75 : 1, display:"flex", flexDirection:"column", gap: 8,
                    transition: "all 0.2s"
                  }} className="hover:scale-[1.02] hover:shadow-lg">
                    <div style={{fontSize:13,fontWeight:500,color:"#37352F",lineHeight:1.4}}><High txt={item.title||"Untitled"}/>{item.archived ? " 📦" : ""}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      <PBadge name={item.platform} platforms={platforms}/>
                      <PiBadge name={item.pillar} pillars={pillars}/>
                      {item.isAds&&<span style={{fontSize:8,color:"#9C2B4E",fontWeight:700}}>💰 Ads</span>}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center", paddingTop:4, borderTop:"1px solid rgba(55,53,47,0.06)"}}>
                      <span style={{fontSize:11,color:"#787774"}}>PIC: {item.pic || "-"}</span>
                      <span style={{fontSize:11,color:"#787774"}}>{item.day}/{String(item.month).padStart(2,"0")}</span>
                    </div>
                    {eng(item.metrics)>0&&<div style={{fontSize:11,color:"#37352F",fontWeight:500}}>⚡ {fmt(eng(item.metrics))} eng</div>}
                  </div>
                );
              })}
              <button onClick={()=>openAdd(1)} style={{background:"transparent",border:"none",padding:"6px 8px",cursor:"pointer",color:"#787774",fontSize:13,width:"100%",textAlign:"left", display: "flex", gap: 6}}><span style={{fontSize:16, fontWeight:200}}>+</span> New</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TimelineView({year,month,content,filtered,openEdit,openAdd,pillars,platforms,showHolidays,holidays,showArchived}: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dim = new Date(year,month,0).getDate();
  const getItems = (d:any) => filtered.filter((c:any)=>c.day===d&&(!c.archived || showArchived)).sort((a:any,b:any) => getMin(a) - getMin(b));
  const getEv = (d:any) => showHolidays?holidays[`${year}-${month}-${d}`]:null;
  useEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollLeft=0;
  },[year,month]);
  return (
    <div>
      <div style={{fontSize:20,fontWeight:600,marginBottom:20,color:"rgba(0,0,0,0.8)"}}>Timeline — {MONTHS[month-1]} {year}</div>
      <div ref={scrollRef} style={{
        overflowX:"auto",
        paddingBottom:20,
        background: "rgba(255,255,255,0.45)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        transform: "translateZ(0)",
        willChange: "transform",
        borderRadius: "24px",
        padding: "24px",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.04)"
      }}>
        <div style={{display:"flex",gap:24,minWidth:dim*200+"px"}}>
          {Array.from({length:dim},(_,i)=>{
            const day=i+1,items=getItems(day),ev=getEv(day);
            const dow=new Date(year,month-1,day).getDay();
            const isWe=dow===0||dow===6;
            return (
              <div key={day} style={{flex:"0 0 200px",background:"transparent",borderRadius:0,padding:0,borderRight:"1px solid rgba(0,0,0,0.1)",minHeight:220, paddingRight: 24}}>
                <div style={{borderBottom:"1px solid rgba(0,0,0,0.1)",paddingBottom:12,marginBottom:16, display:"flex", alignItems:"baseline", gap: 8}}>
                  <div style={{fontSize:13,fontWeight:600,color:"rgba(0,0,0,0.4)"}}>{DAYS_S[dow]}</div>
                  <div style={{fontSize:20,fontWeight:600,lineHeight:1,color:isWe?"rgba(0,0,0,0.4)":"rgba(0,0,0,0.8)"}}>{day}</div>
                  {ev&&<div style={{fontSize:11,color:"#D9730D",fontWeight:600,lineHeight:1.2, marginLeft: "auto"}}>{ev}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {items.map((item:any)=>{
                    const firstPillar = String(item.pillar).split(',')[0].trim();
                    const ps = item.archived ? { color: "#787774", light: "rgba(255,255,255,0.5)" } : gps(pillars, firstPillar);
                    return (
                      <button key={item.id} onClick={()=>openEdit(item)} style={{
                        background:"rgba(255,255,255,0.7)",
                        border:"1px solid rgba(255,255,255,0.9)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                        borderRadius:"12px",padding:"10px 12px",textAlign:"left",cursor:"pointer",width:"100%", transition: "all 0.2s"
                      }} className="hover:bg-white/80 hover:shadow-md">
                        <div style={{fontSize:11,color:ps.color,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",wordWrap:"break-word"}}>{item.title||"Untitled"}{item.archived ? " 📦" : ""}</div>
                        <div style={{fontSize:10,color:"rgba(55,53,47,0.6)",marginTop:4,fontWeight:400}}>{fmtT(item.uploadHour,item.uploadMinute,item.timeFormat)} {item.isAds?"💰":""}</div>
                      </button>
                    );
                  })}
                  <button onClick={()=>openAdd(day)} style={{background:"transparent",border:"none",padding:"4px",cursor:"pointer",color:"#787774",fontSize:13,width:"100%", display: "flex", gap: 4, fontWeight:400}}><span style={{fontSize:16, fontWeight:200, lineHeight: 1}}>+</span> New</button>
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
    "Tgl": 60, "Platform": 100, "Pillar": 120, "Tipe Konten": 120, "Judul Konten": 200, "Brief Konten": 250, "PIC": 100, "Status": 120, "Views": 80, "Reach": 80, "Engagement": 100, "Aksi": 160
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
  const th = (col:any) => ({textAlign:"left" as any,fontSize:13,fontWeight:600,color:"rgba(0,0,0,0.6)",padding:"12px 16px",borderBottom:"1px solid rgba(0,0,0,0.1)",borderRight:"1px solid rgba(0,0,0,0.05)",whiteSpace:"nowrap" as any,cursor:"pointer",userSelect:"none" as any});
  const td: React.CSSProperties = {padding:"12px 16px",fontSize:13,color:"rgba(0,0,0,0.8)",borderBottom:"1px solid rgba(0,0,0,0.05)",borderRight:"1px solid rgba(0,0,0,0.05)",verticalAlign:"top", whiteSpace: "normal", wordBreak: "break-word"};
  const arrow = (col:any) => sort.col===col?(sort.dir==="asc"?"▴":"▾"):"";

  const toggleBulk = (id:string) => setBulkIds((p:any)=>p.includes(id)?p.filter((x:any)=>x!==id):[...p,id]);
  const toggleAll = () => setBulkIds(bulkIds.length===sorted.length?[]:sorted.map((c:any)=>c.id));

  const High = ({txt}:any) => {
    if(!search)return txt;
    const parts = txt.toString().split(new RegExp(`(${search})`, 'gi'));
    return parts.map((p:any,i:number)=>p.toLowerCase()===search.toLowerCase()?<mark key={i} style={{background:"var(--theme-primary)22",color:"var(--theme-primary)",padding:"0 2px",borderRadius:2}}>{p}</mark>:p);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.45)",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      transform: "translateZ(0)",
      willChange: "transform",
      borderRadius: "24px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
      border: "1px solid rgba(255,255,255,0.6)"
    }}>
      {bulkIds.length>0 && (
        <div style={{padding:"8px 16px",background:"rgba(59,130,246,0.05)",borderBottom:"1px solid rgba(59,130,246,0.1)",display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:600,color:"#3B82F6"}}>{bulkIds.length} terpilih</span>
          <div style={{width:1,height:14,background:"rgba(59,130,246,0.2)"}}/>
          <button onClick={()=>onBulk("archive")} style={{background:"none",border:"none",color:"#723680",fontSize:13,fontWeight:600,cursor:"pointer"}}>📦 Arsip Massal</button>
          <button onClick={()=>onBulk("restore")} style={{background:"none",border:"none",color:"#2E7D32",fontSize:13,fontWeight:600,cursor:"pointer"}}>🔄 Pulihkan Massal</button>
          <button onClick={()=>onBulk("delete")} style={{background:"none",border:"none",color:"#9C2B4E",fontSize:13,fontWeight:600,cursor:"pointer"}}>🗑️ Hapus Massal</button>
          <div style={{flex:1}}/>
          <button onClick={()=>setBulkIds([])} style={{background:"none",border:"none",color:"rgba(44,32,22,0.4)",fontSize:13,cursor:"pointer"}}>Batal</button>
        </div>
      )}
      {sorted.length===0
        ? <div style={{padding:48,textAlign:"center",color:"#787774",fontSize:14}}>No contents</div>
        : <div style={{overflowX: "auto"}}><table style={{minWidth:"100%", width: "max-content", borderCollapse:"collapse", tableLayout: "fixed", borderSpacing: 0}}>
            <thead>
              <tr style={{background:"rgba(255,255,255,0.4)"}}>
                <th style={{padding:"12px 16px",borderBottom:"1px solid rgba(0,0,0,0.1)",borderRight:"1px solid rgba(0,0,0,0.05)",width:40}}><input type="checkbox" checked={bulkIds.length===sorted.length&&sorted.length>0} onChange={toggleAll}/></th>
                {[["Tgl","day"],["Platform","platform"],["Pillar","pillar"],["Tipe Konten","contentType"],["Judul Konten","title"],["Brief Konten","briefCopywriting"],["PIC","pic"],["Status","status"],["Views","views"],["Reach","reach"],["Engagement","engagement"],["Aksi",""]].map(([h,col])=>(
                  <th key={h} style={{...th(col), position: "relative", width: colWidths[h] || 100}} onClick={()=>col&&setS(col)}>
                    {h}{col&&<span style={{marginLeft:3,opacity:0.5}}>{arrow(col)}</span>}
                    <Resizer col={h} currentWidth={colWidths[h]} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(item=>{
                const e=eng(item.metrics)+eng(item.adsMetrics),ps = item.archived ? { color: "#787774", light: "#F1F1EF" } : gps(pillars,item.pillar),ss=gss(item.status);
                const v=(item.metrics?.views||0)+(item.adsMetrics?.views||0);
                const r=(item.metrics?.reach||0)+(item.adsMetrics?.reach||0);
                return (
                  <tr key={item.id} style={{background:item.archived?"rgba(0,0,0,0.02)":bulkIds.includes(item.id)?"rgba(0,122,255,0.08)":"transparent",opacity:item.archived?0.7:1}} onMouseEnter={x=>x.currentTarget.style.background="rgba(255,255,255,0.8)"} onMouseLeave={x=>x.currentTarget.style.background=item.archived?"rgba(0,0,0,0.02)":bulkIds.includes(item.id)?"rgba(0,122,255,0.08)":"transparent"}>
                    <td style={td}><input type="checkbox" checked={bulkIds.includes(item.id)} onChange={()=>toggleBulk(item.id)}/></td>
                    <td style={td}>
                      <span style={{fontWeight:500,fontSize:14}}>{item.day}</span>
                      <div style={{fontSize:11,color:"#787774",fontWeight:400}}>{fmtT(item.uploadHour,item.uploadMinute,item.timeFormat)}</div>
                    </td>
                    <td style={td}><PBadge name={item.platform} platforms={platforms}/></td>
                    <td style={td}><PiBadge name={item.pillar} pillars={pillars}/></td>
                    <td style={td}><span style={{background:"#F1F1EF",color:"#37352F", padding:"2px 6px", borderRadius:4, fontSize:12, fontWeight:500}}>{item.contentType||"-"}</span></td>
                    <td style={{...td, verticalAlign:"top"}}>
                      <div style={{fontWeight:500,lineHeight:1.4, wordBreak:"break-word"}}><High txt={item.title||"Untitled"}/></div>
                      <div style={{display:"flex",gap:6,marginTop:6, flexWrap: "wrap"}}>
                        {item.isAds&&<span style={{fontSize:8,color:"#9C2B4E",fontWeight:700}}>💰 Ads</span>}
                        {item.archived&&<span style={{fontSize:8,color:"#723680",fontWeight:700}}>📦 Arsip</span>}
                        {item.linkAsset&&<a href={item.linkAsset} target="_blank" rel="noopener noreferrer" style={{fontSize:9,color:"#2B4C7E"}}>🔗 Aset</a>}
                      </div>
                    </td>
                    <td style={{...td, verticalAlign:"top"}}>
                      <div style={{fontSize:13,color:"rgba(55,53,47,0.8)",lineHeight:1.5, wordBreak:"break-word", whiteSpace: "pre-wrap"}}>{htmlToPlainText(item.briefCopywriting)||"-"}</div>
                    </td>
                    <td style={td}><span style={{background:"#F1F1EF",color:"#37352F", padding:"2px 6px", borderRadius:4, fontSize:12, fontWeight:500}}>{item.pic||"-"}</span></td>
                    <td style={td}><SBadge status={item.status}/></td>
                    <td style={{...td,textAlign:"left"}}>{fmt(v)}</td>
                    <td style={{...td,textAlign:"left"}}>{fmt(r)}</td>
                    <td style={{...td,textAlign:"left",fontWeight:500}}>{fmt(e)}</td>
                    <td style={td}>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        <button onClick={()=>openEdit(item)} style={{background:"#F1F1EF",border:"none",borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#37352F",fontWeight:500}}>Edit</button>
                        {item.status==="Published"&&!item.archived&&<button onClick={()=>archiveItem(item.id)} style={{background:"#F1F1EF",border:"none",borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#37352F",fontWeight:500}}>Arsip</button>}
                        {item.archived&&<button onClick={()=>unarchiveItem(item.id)} style={{background:"#F1F1EF",border:"none",borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#37352F",fontWeight:500}}>Pulihkan</button>}
                        {!item.archived&&<button onClick={()=>deleteItem(item.id)} style={{background:"#FFEEA3",border:"1px solid #FFE066",borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#D9730D",fontWeight:500}}>Hapus</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
      }
    </div>
  );
}
