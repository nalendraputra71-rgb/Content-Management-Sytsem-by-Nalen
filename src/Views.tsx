import { useI18n } from "./i18n";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Instagram, Facebook, Youtube, Linkedin, Music, Globe , ChevronDown, Plus, GripVertical } from "lucide-react";
import { 
  MONTHS, MONTHS_EN, MS, MS_EN, DAYS_S, DAYS_S_EN, MK, MC,
  eng, fmt, fmtD, fmtT, getMin, gps, gpc, gss,
  I, B, CARD, PBadge, SBadge, PiBadge, getDynamicEvents, htmlToPlainText 
} from "./data";
import { DynamicPlatformIcon } from "./components/DynamicPlatformIcon";

function getPlatformIcon(platformIdentifier: string, size = 12, color?: string) {
  const name = String(platformIdentifier || "").trim().toLowerCase();
  
  const exactMatches = ["ig", "tt", "fb", "meta", "x", "li", "yt"];
  const includesMatches = ["instagram", "tiktok", "facebook", "threads", "twitter", "linkedin", "youtube"];
  const isKnown = exactMatches.includes(name) || includesMatches.some(k => name.includes(k));

  if (name.includes("semua") || name === "all" || name.includes("globe")) {
    return <Globe size={size} color="#888888" />;
  }
  
  if (isKnown) {
    return <DynamicPlatformIcon platformName={platformIdentifier} size={size} color={color} />;
  }
  
  return null;
}

export function MonthView({year,month,monthContent,filtered,openEdit,openAdd,showHolidays,holidays,customEvents,onEditCustomEvent,pillars,platforms,pics,showArchived,contentTypes,moveItemDate}: any) {
  const { lang } = useI18n();
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date();
    if (today.getFullYear() === year && (today.getMonth() + 1) === month) {
      return today.getDate();
    }
    return 1;
  });
  
  const dim = new Date(year,month,0).getDate();
  const sd = new Date(year,month-1,1).getDay();
  
  // Clamp selectedDay when year/month change
  useEffect(() => {
    const maxDays = new Date(year, month, 0).getDate();
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [year, month, selectedDay]);
  
  const getEv = (d:any) => {
    let result: {name: string, color: string | null, rawEvent?: any}[] = [];
    
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
          const startDay = start.getDate();
          const endDay = end.getDate();
          if (startDay <= endDay) {
            if (d >= startDay && d <= endDay) match = true;
          } else {
            if (d >= startDay || d <= endDay) match = true;
          }
        } else {
          match = current >= start && current <= end;
        }

        if (match) {
          result.push({ name: ev.name, color: ev.color, rawEvent: ev });
        }
      });
    }

    return result;
  };

  const getF  = (d:any) => filtered.filter((c:any)=>c.day===d&&(!c.archived || showArchived)).sort((a:any,b:any) => getMin(a) - getMin(b));
  const getA  = (d:any) => monthContent.filter((c:any)=>c.day===d&&(!c.archived || showArchived));

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
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

  const getSelectedDayName = () => {
    const d = new Date(year, month - 1, selectedDay);
    if (lang === "id") {
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      return `${days[d.getDay()]}, ${selectedDay} ${months[month - 1]} ${year}`;
    } else {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${days[d.getDay()]}, ${months[month - 1]} ${selectedDay}, ${year}`;
    }
  };

  const activeMobileItems = getF(selectedDay);
  const activeMobileAllItems = getA(selectedDay);
  const activeMobileEvs = showHolidays ? getEv(selectedDay) : [];

  return (
    <>
      {/* DESKTOP CALENDAR VIEW - Completely Untouched */}
      <div className="hidden md:block">
        <div id="content-planner-calendar" style={{
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          transform: "translateZ(0)",
          willChange: "transform",
          borderRadius: "32px",
          padding: "24px",
          border: "1px solid rgba(0, 0, 0, 0.03)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.03)"
        }}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:8,marginBottom:12}}>
            {(lang === "id" ? DAYS_S : DAYS_S_EN).map(d=><div key={d} style={{textAlign:"center",fontSize:12,fontWeight:600,textTransform:"uppercase",color:"rgba(0,0,0,0.5)",letterSpacing:1}}>{d}</div>)}
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
                    background: dragOverDate === day ? "rgba(255,255,255,0.9)" : isToday ? "rgba(37, 99, 235, 0.08)" : "rgba(255,255,255,0.7)",
                    borderRadius: 24,
                    padding: 12,
                    border: dragOverDate === day ? "2px dashed var(--theme-primary)" : isToday ? "2px solid var(--theme-primary)" : "1px solid rgba(0,0,0,0.03)",
                    boxShadow: dragOverDate === day ? "inset 0 0 0 1px rgba(0,122,255,0.1)" : isToday ? "0 8px 24px rgba(37, 99, 235, 0.12)" : "0 2px 12px rgba(0,0,0,0.02)",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
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
                      <div 
                        key={idx} 
                        onClick={(evt) => {
                          if (e.rawEvent && onEditCustomEvent) {
                            evt.stopPropagation();
                            onEditCustomEvent(e.rawEvent);
                          }
                        }}
                        title={e.rawEvent ? (lang === "id" ? "Klik untuk edit event" : "Click to edit event") : undefined}
                        style={{
                          fontSize:7, 
                          color: e.color || (isSpec ? "#3B82F6" : "#A67C1C"), 
                          background: e.color ? `${e.color}15` : "transparent",
                          padding: e.color ? "1px 5px" : "0",
                          borderRadius: 4,
                          fontWeight: 700, 
                          lineHeight: 1.2, 
                          letterSpacing:0.3,
                          border: e.color ? `1px solid ${e.color}33` : "none",
                          cursor: e.rawEvent ? "pointer" : "default",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2
                        }}
                        className={e.rawEvent ? "hover:opacity-80 transition-opacity" : ""}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="[&::-webkit-scrollbar]:hidden" style={{display:"flex",flexDirection:"column",gap:2, flex: 1, minHeight: 0, overflowY: "auto", msOverflowStyle: "none", scrollbarWidth: "none"}}>
                    <AnimatePresence>
                      {items.map((item:any)=>{
                        const ps = item.archived ? { color: "#7A7976", light: "#EBEAE6" } : gps(pillars, String(item.pillar).split(',')[0].trim());
                        const platformName = String(item.platform || "").split(',')[0].trim();
                        const platformColor = item.archived ? "#7A7976" : gpc(platforms, platformName);
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
                              background: "rgba(255,255,255,0.8)",
                              flexShrink:0,border:"1px solid rgba(0,0,0,0.04)",borderRadius:"12px",padding:"6px 8px",textAlign:"left",cursor:"grab",width:"100%",marginBottom:4,
                              boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                            }}
                          >
                            <div style={{display:"flex",alignItems:"flex-start",gap:3}}>
                              <span style={{flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                {getPlatformIcon(platformName, 12, platformColor)}
                              </span>
                              {item.isAds&&<span style={{fontSize:9,flexShrink:0,marginTop:1}}>💰</span>}
                              <span style={{fontSize:10,color:platformColor,fontWeight:500,lineHeight:1.2,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.title||"Untitled"}{item.archived ? " 📦" : ""}</span>
                            </div>
                            <div style={{fontSize:8,color:"rgba(55,53,47,0.6)",marginTop:2,fontWeight:500,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                              {item.contentType && (
                                <div style={{display:"flex",alignItems:"center",gap:2}}>
                                  {(() => {
                                    const bg = gpc(contentTypes || [], item.contentType);
                                    const hex = bg.startsWith('#') ? (bg.length === 4 ? '#' + bg[1] + bg[1] + bg[2] + bg[2] + bg[3] + bg[3] : bg) : '#F1F1EF';
                                    const r = parseInt(hex.slice(1, 3), 16) || 0;
                                    const g = parseInt(hex.slice(3, 5), 16) || 0;
                                    const b = parseInt(hex.slice(5, 7), 16) || 0;
                                    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
                                    const tc = yiq >= 128 ? "#1F2937" : "#fff";
                                    return (
                                      <span style={{
                                        backgroundColor: bg,
                                        color: tc,
                                        fontWeight: 800,
                                        fontSize: 6.5,
                                        width: 13,
                                        height: 13,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "50%"
                                      }}>
                                        {String(item.contentType).split(' ').filter(Boolean).slice(0, 2).map((w: string) => w.charAt(0)).join('').toUpperCase()}
                                      </span>
                                    );
                                  })()}
                                </div>
                              )}
                              {item.pic && (
                                <div style={{display:"flex",alignItems:"center",gap:2}}>
                                  {item.contentType && <span>•</span>}
                                  <span style={{color: gpc(pics || [], item.pic), fontWeight: 700}}>
                                    {item.pic}
                                  </span>
                                </div>
                              )}
                              <div style={{display:"flex",alignItems:"center",gap:3}}>
                                 {(item.contentType || item.pic) && <span>•</span>}
                                 <Clock size={8} /> {fmtT(item.uploadHour, item.uploadMinute, item.timeFormat)}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                    {items.length===0&&allItems.length>0&&<div style={{fontSize:8,color:"rgba(44,32,22,0.3)",fontStyle:"italic"}}>Disembunyikan filter</div>}
                  </div>
                  {items.length > 2 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 24,
                        background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1) 80%)",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        paddingBottom: 2,
                        pointerEvents: "none",
                      }}
                    >
                      <ChevronDown size={14} color="rgba(44,32,22,0.4)" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOBILE CALENDAR VIEW - Clean, Spacious, Elegant */}
      <div className="block md:hidden flex flex-col gap-6">
        {/* Calendar Grid Box */}
        <div className="bg-white rounded-[28px] p-5 shadow-sm border border-black/[0.03]">
          {/* Days of week Header */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] font-extrabold text-black/40 uppercase tracking-wider mb-3 border-b border-black/[0.03]">
            {(lang === "id" ? DAYS_S : DAYS_S_EN).map(d => <div key={d}>{d}</div>)}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty offset spaces */}
            {Array.from({length:sd}).map((_,i)=><div key={`e${i}`} className="aspect-square bg-transparent"/>)}
            
            {/* Active days of the month */}
            {Array.from({length:dim}).map((_,i)=>{
              const day = i + 1;
              const items = getF(day);
              const evs = showHolidays ? getEv(day) : [];
              const isToday = new Date().toDateString() === new Date(year, month - 1, day).toDateString();
              const isSelected = selectedDay === day;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square w-full rounded-2xl flex flex-col items-center justify-between p-2 transition-all relative border outline-none ${
                    isSelected 
                      ? "bg-[var(--theme-primary)] text-white font-black border-transparent shadow-md scale-[1.04]" 
                      : isToday 
                        ? "bg-[rgba(35,131,226,0.06)] text-[var(--theme-primary)] font-black border-[var(--theme-primary)]/30" 
                        : "bg-black/[0.02] hover:bg-black/[0.04] text-gray-800 border-transparent"
                  }`}
                  style={{
                    boxShadow: isSelected ? "0 10px 20px -5px rgba(35, 131, 226, 0.4)" : "none",
                  }}
                >
                  <span className="text-xs font-bold leading-none mt-0.5">{day}</span>
                  
                  {/* Indicators (Tiny premium dots) */}
                  <div className="flex gap-1 justify-center mb-0.5 min-h-[4px]">
                    {evs.length > 0 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-amber-400"}`} />
                    )}
                    {items.slice(0, 2).map((item: any, idx: number) => {
                      const platformColor = gpc(platforms, String(item.platform || "").split(',')[0].trim());
                      return (
                        <span 
                          key={idx} 
                          className="w-1 h-1 rounded-full" 
                          style={{ backgroundColor: isSelected ? "#FFFFFF" : platformColor }} 
                        />
                      );
                    })}
                    {items.length > 2 && (
                      <span className={`text-[6px] font-black leading-none ${isSelected ? "text-white" : "text-black/40"}`}>+</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Section */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-black/[0.03]">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-black/[0.03]">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[var(--theme-primary)] uppercase tracking-widest">{lang === "id" ? "Agenda Konten" : "Content Agenda"}</span>
              <h3 className="text-sm font-black text-gray-900 leading-tight mt-1">{getSelectedDayName()}</h3>
            </div>
            
            {/* Quick Add Button */}
            <button
              onClick={() => openAdd(selectedDay)}
              className="flex items-center justify-center gap-1.5 h-9 px-4 bg-[var(--theme-primary)] text-white font-extrabold text-xs rounded-full hover:opacity-90 active:scale-95 transition-all cursor-pointer border-none outline-none shadow-sm"
              style={{
                boxShadow: "0 4px 12px -2px rgba(35, 131, 226, 0.3)",
              }}
            >
              <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
              <span>{lang === "id" ? "Tambah" : "Add"}</span>
            </button>
          </div>

          {/* Holidays / Events list for this day */}
          {activeMobileEvs.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {activeMobileEvs.map((e, idx) => (
                <div 
                  key={idx}
                  onClick={(evt) => {
                    if (e.rawEvent && onEditCustomEvent) {
                      evt.stopPropagation();
                      onEditCustomEvent(e.rawEvent);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black bg-amber-50 text-amber-800 border border-amber-100 ${e.rawEvent ? "cursor-pointer hover:opacity-80 active:scale-98 transition-all" : ""}`}
                  style={e.color ? { backgroundColor: `${e.color}08`, color: e.color, borderColor: `${e.color}15` } : {}}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                  <span className="truncate flex-1">{e.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Content Items List for this day */}
          {activeMobileItems.length > 0 ? (
            <div className="flex flex-col gap-3">
              {activeMobileItems.map((item: any) => {
                const platformName = String(item.platform || "").split(',')[0].trim();
                const platformColor = item.archived ? "#7A7976" : gpc(platforms, platformName);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => openEdit(item)}
                    className="w-full text-left bg-black/[0.01] hover:bg-black/[0.03] active:bg-black/[0.05] p-4 rounded-[22px] border border-black/[0.02] transition-all flex items-start gap-4 outline-none relative overflow-hidden"
                  >
                    {/* Left Colored accent strip */}
                    <div 
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: platformColor,
                      }}
                    />

                    {/* Platform Icon on Mobile */}
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-black/[0.02] flex-shrink-0 ml-1"
                      style={{ color: platformColor }}
                    >
                      {getPlatformIcon(platformName, 20, platformColor)}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        {item.pillar && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 truncate max-w-[130px]">
                            {String(item.pillar).split(',')[0].trim()}
                          </span>
                        )}
                        {item.isAds && (
                          <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">💰 Ads</span>
                        )}
                      </div>
                      
                      <h4 className="text-sm font-extrabold text-gray-900 leading-snug truncate">
                        {item.title || "Untitled"}
                        {item.archived ? " 📦" : ""}
                      </h4>

                      {/* Sub-info line */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {fmtT(item.uploadHour, item.uploadMinute, item.timeFormat)}
                        </span>

                        {item.contentType && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: gpc(contentTypes || [], item.contentType) }} />
                            {item.contentType}
                          </span>
                        )}

                        {item.pic && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-black/[0.03] text-gray-700">
                            PIC: {item.pic}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Empty State of selected day */
            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-gray-100 rounded-3xl bg-black/[0.01]">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-gray-400 mb-4 shadow-sm border border-black/[0.01]">
                <Clock size={24} className="opacity-40" />
              </div>
              <p className="text-xs font-extrabold text-gray-700 text-center mb-1">
                {lang === "id" ? "Tidak Ada Konten Terjadwal" : "No Scheduled Content"}
              </p>
              <p className="text-[11px] text-gray-400 text-center max-w-[220px] leading-relaxed mb-5">
                {lang === "id" 
                  ? "Hari ini bersih dari jadwal posting. Buat konten baru sekarang!" 
                  : "This day is clear of posts. Draft a new content plan now!"}
              </p>
              <button
                onClick={() => openAdd(selectedDay)}
                className="px-5 py-2.5 bg-[var(--theme-primary)] text-white font-black text-[11px] rounded-full hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border-none outline-none"
                style={{
                  boxShadow: "0 4px 12px -2px rgba(35, 131, 226, 0.3)",
                }}
              >
                <Plus size={12} color="#FFFFFF" strokeWidth={2.5} />
                <span>{lang === "id" ? "Buat Konten" : "Create Content"}</span>
              </button>
            </div>
          )}

          {/* Hidden items warning */}
          {activeMobileItems.length === 0 && activeMobileAllItems.length > 0 && (
            <div className="text-center py-4 text-[11px] text-gray-400 italic font-bold">
              {lang === "id" ? "Beberapa konten disembunyikan oleh filter aktif" : "Some items are hidden by active filters"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function WeekView({year,month,content,filtered,openEdit,openAdd,pillars,platforms,showHolidays,holidays,customEvents,onEditCustomEvent,showArchived}: any) {
  const { lang } = useI18n();
  const [wOff,setWOff] = useState(0);
  const base = new Date(year,month-1,1);
  const ws = new Date(base.getTime() + wOff*7*86400000);
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(ws.getTime()+i*86400000);
    return {date:d,y:d.getFullYear(),mo:d.getMonth()+1,d:d.getDate(),dow:d.getDay()};
  });
  const getItems = (day:any) => filtered.filter((c:any)=>c.year===day.y&&c.month===day.mo&&c.day===day.d&&(!c.archived || showArchived)).sort((a:any,b:any) => getMin(a) - getMin(b));
  
  const getDayEvs = (y: number, m: number, d: number) => {
    let result: { name: string, color: string | null, rawEvent?: any }[] = [];
    if (!showHolidays) return result;
    const staticEv = holidays[`${y}-${m}-${d}`];
    if (staticEv) result.push({ name: staticEv, color: null });
    const dynamicEv = getDynamicEvents(y, m, d);
    if (dynamicEv) result.push({ name: dynamicEv, color: "#3B82F6" });
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
        const current = new Date(y, m - 1, d);
        let match = false;
        if (ev.monthly) {
          const startDay = start.getDate();
          const endDay = end.getDate();
          if (startDay <= endDay) {
            if (d >= startDay && d <= endDay) match = true;
          } else {
            if (d >= startDay || d <= endDay) match = true;
          }
        } else {
          match = current >= start && current <= end;
        }
        if (match) {
          result.push({ name: ev.name, color: ev.color, rawEvent: ev });
        }
      });
    }
    return result;
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
        <button onClick={()=>setWOff(w=>w-1)} style={{...B(false),padding:"4px 8px", background:"transparent", border:"none", boxShadow:"none", color:"#787774"}}>{lang === "id" ? "← Sebelumnya" : "← Previous"}</button>
        <div style={{fontSize:16,fontWeight:600,color:"#37352F"}}>
          {fmtD(days[0].y,days[0].mo,days[0].d)} — {fmtD(days[6].y,days[6].mo,days[6].d)}
        </div>
        <button onClick={()=>setWOff(w=>w+1)} style={{...B(false),padding:"4px 8px", background:"transparent", border:"none", boxShadow:"none", color:"#787774"}}>{lang === "id" ? "Berikutnya →" : "Next →"}</button>
        <button onClick={()=>setWOff(0)} style={{...B(false),padding:"4px 8px",fontSize:12, background:"transparent", border:"none", boxShadow:"none", color:"#787774"}}>{lang === "id" ? "Hari Ini" : "Today"}</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:12}}>
        {days.map(day=>{
          const items=getItems(day);
          const dayEvs = getDayEvs(day.y, day.mo, day.d);
          const isToday=new Date().toDateString()===day.date.toDateString();
          return (
            <div key={day.d+"-"+day.mo} style={{background:"transparent",borderRadius:0,padding:0,border:"none",minHeight:180}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8, borderBottom: "1px solid rgba(55,53,47,0.08)", paddingBottom: 8}}>
                <div style={{display:"flex", alignItems:"baseline", gap: 6}}>
                  <div style={{fontSize:12,fontWeight:600,color:isToday?"#2383e2":"#787774"}}>{(lang === "id" ? DAYS_S : DAYS_S_EN)[day.dow]}</div>
                  <div style={{fontSize:18,fontWeight:500,lineHeight:1,color:isToday?"#2383e2":"#37352F"}}>{day.d}</div>
                </div>
                <button onClick={()=>openAdd(day.d)} style={{background:"transparent",border:"none",borderRadius:"4px",width:20,height:20,cursor:"pointer",color:"#787774",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",padding:0,transition:"all 0.2s"}} className="hover:bg-gray-200">+</button>
              </div>
              {dayEvs.map((e, idx) => (
                <div 
                  key={idx}
                  onClick={(evt) => {
                    if (e.rawEvent && onEditCustomEvent) {
                      evt.stopPropagation();
                      onEditCustomEvent(e.rawEvent);
                    }
                  }}
                  style={{
                    fontSize: 8,
                    color: e.color || "#A67C1C",
                    fontWeight: 700,
                    background: e.color ? `${e.color}15` : "#FBF5E3",
                    borderRadius: 4,
                    padding: "2px 5px",
                    marginBottom: 3,
                    border: e.color ? `1px solid ${e.color}33` : "none",
                    cursor: e.rawEvent ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2
                  }}
                  className={e.rawEvent ? "hover:opacity-80" : ""}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                </div>
              ))}
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {items.map((item:any)=>{
                  const firstPillar = String(item.pillar).split(',')[0].trim();
                  const ps = item.archived ? { color: "#7A7976", light: "#EBEAE6" } : gps(pillars, firstPillar);
                  const platformName = String(item.platform || "").split(',')[0].trim();
                  const platformColor = item.archived ? "#7A7976" : gpc(platforms, platformName);
                  return (
                    <button key={item.id} onClick={()=>openEdit(item)} style={{background:ps.light,border:"none",borderRadius:"4px",padding:"6px 8px",textAlign:"left",cursor:"pointer",width:"100%",marginBottom:4, transition: "background 0.2s"}}>
                      <div style={{fontSize:11,color:platformColor,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                        {getPlatformIcon(platformName, 10, platformColor)}
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title || "Untitled"}{item.archived ? " 📦" : ""}</span>
                      </div>
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

export function BoardView({year,month,content,filtered,openEdit,openAdd,statuses,pillars,platforms,search,showArchived,moveItemStatus}: any) {
  const { lang } = useI18n();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (Array.isArray(statuses) && statuses.length > 0 && !activeStatus) {
      const first = typeof statuses[0] === 'string' ? statuses[0] : (statuses[0]?.name || statuses[0]?.id || String(statuses[0]));
      setActiveStatus(first);
    }
  }, [statuses, activeStatus]);

  const items = filtered.filter((c:any)=>c.year===year&&c.month===month&&(!c.archived || showArchived));
  
  const High = ({txt}:any) => {
    try {
      if(!search || !txt) return <>{txt}</>;
      const str = String(txt);
      const parts = str.split(new RegExp(`(${search})`, 'gi'));
      return <>{parts.map((p:any,i:number)=>p.toLowerCase()===search.toLowerCase()?<mark key={i} style={{background:"rgba(var(--theme-primary-rgb),0.1)",color:"var(--theme-primary)",padding:"0 2px",borderRadius:2}}>{p}</mark>:p)}</>;
    } catch(e) { return <>{txt}</>; }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, statusName: string) => {
    e.preventDefault();
    if (dragOverColumn !== statusName) {
      setDragOverColumn(statusName);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    setDraggedItemId(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id && moveItemStatus) {
      await moveItemStatus(id, targetStatus);
    }
  };

  if (isMobile) {
    const currentStatusName = activeStatus || (Array.isArray(statuses) && statuses.length > 0 ? (typeof statuses[0] === 'string' ? statuses[0] : (statuses[0]?.name || statuses[0]?.id || String(statuses[0]))) : "");
    const currentCols = items.filter((c:any)=>c.status===currentStatusName).sort((a:any,b:any) => getMin(a) - getMin(b));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 6 }}>
        {/* Mobile Status Dropdown Selection */}
        <div style={{ position: "relative", zIndex: 30 }}>
          <button
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.03)",
              background: "white",
              color: "#111827",
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              outline: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
              textAlign: "left",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: gss(currentStatusName)?.color || "var(--theme-primary)",
              }} />
              <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Status:
              </span>
              <span style={{ color: "#111827", fontWeight: 800 }}>{currentStatusName}</span>
              <span style={{
                background: "rgba(0,0,0,0.03)",
                color: "#4B5563",
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 999,
                fontWeight: 800,
                border: "1px solid rgba(0,0,0,0.03)"
              }}>{currentCols.length}</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              transition: "transform 0.2s ease",
              transform: statusDropdownOpen ? "rotate(180deg)" : "rotate(0deg)"
            }}>
              <ChevronDown size={16} strokeWidth={2.5} className="text-gray-400" />
            </div>
          </button>

          <AnimatePresence>
            {statusDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: 8,
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.03)",
                  padding: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  zIndex: 100,
                }}
              >
                {Array.isArray(statuses) && statuses.map((st: any) => {
                  const stName = typeof st === 'string' ? st : (st?.name || st?.id || String(st));
                  const count = items.filter((c: any) => c.status === stName).length;
                  const isSelected = currentStatusName === stName;
                  const ss = (typeof st !== 'string' && st?.color) ? { color: st.color } : gss(stName);

                  return (
                    <button
                      key={stName}
                      onClick={() => {
                        setActiveStatus(stName);
                        setStatusDropdownOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "none",
                        background: isSelected ? "rgba(0,0,0,0.02)" : "transparent",
                        color: isSelected ? "#111827" : "#4B5563",
                        fontSize: 13,
                        fontWeight: isSelected ? 800 : 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        outline: "none",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: ss?.color || "var(--theme-primary)",
                        }} />
                        <span>{stName}</span>
                      </div>
                      <span style={{
                        background: isSelected ? "white" : "rgba(0,0,0,0.03)",
                        color: isSelected ? "#111827" : "#6B7280",
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 999,
                        fontWeight: 800,
                        border: isSelected ? "1px solid rgba(0,0,0,0.04)" : "none",
                      }}>{count}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content list for active status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {currentCols.map((item:any)=>{
            const platformName = String(item.platform || "").split(',')[0].trim();
            const platformColor = item.archived ? "#7A7976" : gpc(platforms, platformName);

            return (
              <div
                key={item.id}
                onClick={() => openEdit(item)}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 22,
                  padding: "16px",
                  border: "1px solid rgba(0,0,0,0.03)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.15s ease",
                }}
                className="active:scale-[0.99]"
              >
                {/* Left side accent indicator */}
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: platformColor,
                }} />

                {/* Title */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingLeft: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", lineHeight: 1.4, flex: 1 }}>
                    <High txt={item.title || "Untitled"}/><span style={{fontWeight: 400}}>{item.archived ? " 📦" : ""}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                    <span>🕒</span> {fmtT(item.uploadHour, item.uploadMinute, item.timeFormat)}
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 6 }}>
                  <PBadge name={item.platform} platforms={platforms}/>
                  <PiBadge name={item.pillar} pillars={pillars}/>
                  {item.isAds && (
                    <span style={{
                      fontSize: 9,
                      background: "#FEF3C7",
                      color: "#D97706",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 6
                    }}>
                      💰 Ads
                    </span>
                  )}
                </div>

                {/* Metrics */}
                {eng(item.metrics) > 0 && (
                  <div style={{
                    fontSize: 10,
                    color: "#111827",
                    fontWeight: 800,
                    background: "rgba(0,0,0,0.03)",
                    alignSelf: "flex-start",
                    padding: "4px 10px",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginLeft: 6
                  }}>
                    <span>⚡</span> {fmt(eng(item.metrics))} {lang === "id" ? "interaksi" : "eng"}
                  </div>
                )}

                {/* Divider & Footer */}
                <div style={{ height: 1, background: "rgba(0,0,0,0.03)", marginLeft: 6 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#6B7280", paddingLeft: 6 }}>
                  <span>
                    <span style={{ color: "#9CA3AF", fontWeight: 500 }}>{lang === "id" ? "Oleh" : "By"}:</span> <span style={{ fontWeight: 800, color: "#374151" }}>{item.pic || "-"}</span>
                  </span>
                  <span style={{
                    background: "rgba(0,0,0,0.03)",
                    padding: "3px 8px",
                    borderRadius: 8,
                    fontWeight: 800,
                    color: "#4B5563"
                  }}>
                    {item.day}/{String(item.month).padStart(2, "0")}
                  </span>
                </div>
              </div>
            );
          })}

          {currentCols.length === 0 && (
            <div style={{
              border: "1px dashed rgba(0,0,0,0.06)",
              borderRadius: 24,
              padding: "40px 16px",
              textAlign: "center",
              color: "#9CA3AF",
              fontSize: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: "white"
            }}>
              <span style={{ fontSize: 24 }}>📁</span>
              <span style={{ fontWeight: 800, color: "#4B5563" }}>{lang === "id" ? "Belum ada konten" : "No content yet"}</span>
            </div>
          )}
        </div>

        {/* Add button at bottom of active column */}
        <button
          onClick={() => openAdd(1, { status: currentStatusName })}
          style={{
            background: "var(--theme-primary)",
            border: "none",
            borderRadius: 16,
            padding: "14px 18px",
            color: "white",
            fontSize: 13,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 4px 14px rgba(35, 131, 226, 0.3)",
            cursor: "pointer",
            outline: "none",
            width: "100%",
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{lang === "id" ? "Tambah Konten Baru" : "Add New Content"}</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      gap: 8,
      overflowX: "auto",
      paddingBottom: 16,
      paddingTop: 2,
      minHeight: 500,
      scrollBehavior: "smooth"
    }}>
      {Array.isArray(statuses) && statuses.map((st:any)=>{
        const stName = typeof st === 'string' ? st : (st?.name || st?.id || String(st));
        const cols = items.filter((c:any)=>c.status===stName).sort((a:any,b:any) => getMin(a) - getMin(b));
        const ss = (typeof st !== 'string' && st?.color) ? {bg: st.color+"15", color: st.color} : gss(stName);
        
        const isDraggingOver = dragOverColumn === stName;

        return (
          <div 
            key={stName} 
            onDragOver={(e) => handleDragOver(e, stName)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stName)}
            style={{
              minWidth: 215,
              flex: "0 0 215px",
              background: isDraggingOver ? "rgba(37, 99, 235, 0.03)" : "rgba(0, 0, 0, 0.015)",
              borderRadius: "12px",
              padding: "10px 8px 8px 8px",
              border: isDraggingOver ? "2px dashed var(--theme-primary)" : "1px solid rgba(0, 0, 0, 0.015)",
              boxShadow: isDraggingOver ? "0 4px 12px rgba(37, 99, 235, 0.03)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              transition: "all 0.12s ease",
              position: "relative"
            }}
          >
            {/* Column Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Visual Circle Status Indicator */}
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: ss?.color || "var(--theme-primary)",
                  display: "inline-block"
                }} />
                
                <span style={{
                  color: "#111827",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "-0.01em"
                }}>{stName}</span>
                
                {/* Count Badge */}
                <span style={{
                  background: "rgba(0, 0, 0, 0.04)",
                  color: "#4B5563",
                  fontSize: 9.5,
                  fontWeight: 600,
                  padding: "1px 4px",
                  borderRadius: 8
                }}>{cols.length}</span>
              </div>

              {/* Option to quick add */}
              <button 
                onClick={() => openAdd(1, { status: stName })}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  padding: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                  transition: "all 0.12s"
                }}
                className="hover:bg-black/5 hover:text-black"
                title={lang === "id" ? "Tambah Konten di status ini" : "Add Content in this status"}
              >
                <Plus size={12} />
              </button>
            </div>

            {/* List of cards */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              flex: 1,
              overflowY: "auto",
              minHeight: 120,
              padding: "1px"
            }}>
              {cols.map((item:any)=>{
                const isBeingDragged = draggedItemId === item.id;
                
                return (
                  <div 
                    key={item.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => openEdit(item)}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      cursor: "grab",
                      boxShadow: isBeingDragged ? "0 4px 10px rgba(0,0,0,0.05)" : "0 1px 2px rgba(0,0,0,0.01)",
                      border: isBeingDragged ? "1px solid var(--theme-primary)" : "1px solid rgba(0,0,0,0.03)",
                      opacity: isBeingDragged ? 0.4 : (item.archived ? 0.65 : 1),
                      display: "flex", 
                      flexDirection: "column", 
                      gap: 4,
                      userSelect: "none",
                      position: "relative",
                      transition: "transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease",
                    }} 
                    className="hover:shadow-sm hover:border-black/10 active:cursor-grabbing group board-card"
                  >
                    {/* Top line with category badge and dynamic drag handler indicator */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 4
                    }}>
                      <div style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "#111827",
                        lineHeight: 1.25,
                        flex: 1,
                        letterSpacing: "-0.01em",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        <High txt={item.title || "Untitled"}/><span style={{fontWeight: 400}}>{item.archived ? " 📦" : ""}</span>
                      </div>

                      {/* Grip indicator visible on hover */}
                      <div style={{
                        color: "#D1D5DB",
                        display: "flex",
                        alignItems: "center",
                        opacity: 0.3,
                        transition: "all 0.15s"
                      }} className="group-hover:opacity-100 group-hover:text-slate-400">
                        <GripVertical size={10} />
                      </div>
                    </div>

                    {/* Tags line */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                      <PBadge name={item.platform} platforms={platforms}/>
                      <PiBadge name={item.pillar} pillars={pillars}/>
                      {item.isAds && (
                        <span style={{
                          fontSize: 7.5,
                          background: "#FCE7F3",
                          color: "#9D174D",
                          fontWeight: 700,
                          padding: "1px 3px",
                          borderRadius: 3
                        }}>
                          💰 Ads
                        </span>
                      )}
                    </div>

                    {/* Engagement section if available */}
                    {eng(item.metrics) > 0 && (
                      <div style={{
                        fontSize: 9.5,
                        color: "#1F2937",
                        fontWeight: 600,
                        background: "rgba(0,0,0,0.025)",
                        alignSelf: "flex-start",
                        padding: "1px 5px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5
                      }}>
                        <span>⚡</span> {fmt(eng(item.metrics))} {lang === "id" ? "interaksi" : "eng"}
                      </div>
                    )}

                    {/* Divider (Thin subtle line) */}
                    <div style={{
                      height: 1,
                      background: "rgba(0, 0, 0, 0.015)",
                      margin: "1px 0"
                    }} />

                    {/* Footer metadata */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 9.5,
                      color: "#6B7280"
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <span style={{ fontWeight: 500, color: "#9CA3AF" }}>{lang === "id" ? "Oleh" : "By"}:</span> <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: 65 }} title={item.pic}>{item.pic || "-"}</span>
                      </span>
                      <span style={{
                        background: "rgba(0,0,0,0.02)",
                        padding: "1px 3px",
                        borderRadius: 3,
                        fontWeight: 600,
                        color: "#4B5563"
                      }}>
                        {item.day}/{String(item.month).padStart(2, "0")}
                      </span>
                    </div>

                  </div>
                );
              })}
              
              {cols.length === 0 && (
                <div style={{
                  border: "1px dashed rgba(0,0,0,0.025)",
                  borderRadius: 10,
                  padding: "12px 8px",
                  textAlign: "center",
                  color: "#9CA3AF",
                  fontSize: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  minHeight: 50,
                  background: "rgba(255,255,255,0.12)"
                }}>
                  <span style={{ fontSize: 12 }}>📁</span>
                  <span>{lang === "id" ? "Belum ada konten" : "No content yet"}</span>
                </div>
              )}
            </div>

            {/* Quick Button New Item at Bottom */}
            <button 
              onClick={() => openAdd(1, { status: stName })} 
              style={{
                background: "rgba(255, 255, 255, 0.4)",
                border: "1px dashed rgba(0,0,0,0.06)",
                borderRadius: "8px",
                padding: "4px 8px",
                cursor: "pointer",
                color: "#4B5563",
                fontSize: 11,
                fontWeight: 600,
                width: "100%",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                transition: "all 0.12s"
              }}
              className="hover:bg-white hover:border-black/10 hover:text-black hover:shadow-xs"
            >
              <Plus size={10} /> {lang === "id" ? "Tambah Konten" : "Add Content"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function TimelineView({year,month,content,filtered,openEdit,openAdd,pillars,platforms,showHolidays,holidays,showArchived}: any) {
  const { lang } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dim = new Date(year,month,0).getDate();
  const getItems = (d:any) => filtered.filter((c:any)=>c.day===d&&(!c.archived || showArchived)).sort((a:any,b:any) => getMin(a) - getMin(b));
  const getEv = (d:any) => showHolidays?holidays[`${year}-${month}-${d}`]:null;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollLeft=0;
  },[year,month]);

  if (isMobile) {
    const activeDays = Array.from({ length: dim }, (_, i) => {
      const d = i + 1;
      return {
        day: d,
        items: getItems(d),
        ev: getEv(d),
        dow: new Date(year, month - 1, d).getDay()
      };
    }).filter(d => d.items.length > 0 || d.ev);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#111827", letterSpacing: "-0.01em", paddingLeft: 4 }}>
          📅 Timeline — {(lang === "id" ? MONTHS : MONTHS_EN)[month-1]} {year}
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 24, paddingLeft: 8, paddingRight: 4 }}>
          {/* Vertical Timeline Thread Line */}
          {activeDays.length > 0 && (
            <div style={{
              position: "absolute",
              left: 20,
              top: 10,
              bottom: 10,
              width: 2,
              background: "rgba(0,0,0,0.05)",
              zIndex: 1
            }} />
          )}

          {activeDays.map(({ day, items, ev, dow }) => {
            const isWe = dow === 0 || dow === 6;
            return (
              <div
                key={day}
                style={{
                  display: "flex",
                  gap: 16,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {/* Timeline Day Circle Node */}
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: isWe ? "#F3F4F6" : "var(--theme-primary)",
                  color: isWe ? "#9CA3AF" : "white",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  boxShadow: isWe ? "none" : "0 4px 10px rgba(35, 131, 226, 0.2)",
                  flexShrink: 0,
                  marginTop: 6,
                }}>
                  {day}
                </div>

                {/* Day Card Content on the Right */}
                <div
                  style={{
                    flex: 1,
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.03)",
                    borderRadius: 24,
                    padding: 16,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "rgba(0,0,0,0.4)", textTransform: "uppercase" }}>
                      {(lang === "id" ? DAYS_S : DAYS_S_EN)[dow]}
                    </span>
                    {ev && (
                      <span style={{
                        fontSize: 9,
                        background: "#FEF3C7",
                        color: "#D97706",
                        fontWeight: 900,
                        padding: "2px 8px",
                        borderRadius: 6,
                        maxWidth: 140,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        🎉 {ev}
                      </span>
                    )}
                  </div>

                  {/* Items list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((item: any) => {
                      const platformName = String(item.platform || "").split(',')[0].trim();
                      const platformColor = item.archived ? "#7A7976" : gpc(platforms, platformName);

                      return (
                        <button
                          key={item.id}
                          onClick={() => openEdit(item)}
                          style={{
                            background: "rgba(0,0,0,0.01)",
                            border: "1px solid rgba(0,0,0,0.02)",
                            borderRadius: 16,
                            padding: "12px",
                            textAlign: "left",
                            cursor: "pointer",
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            outline: "none",
                            position: "relative",
                            overflow: "hidden"
                          }}
                        >
                          <div style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            background: platformColor
                          }} />

                          <div style={{ fontSize: 12, fontWeight: 800, color: "#111827", lineHeight: 1.4, paddingLeft: 4 }}>
                            {item.title || "Untitled"}{item.archived ? " 📦" : ""}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingLeft: 4 }}>
                            <span style={{ fontSize: 10, color: "#6B7280", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
                              <span>🕒</span> {fmtT(item.uploadHour, item.uploadMinute, item.timeFormat)}
                            </span>
                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                              <PBadge name={item.platform} platforms={platforms}/>
                              {item.isAds && (
                                <span style={{
                                  fontSize: 8,
                                  background: "#FEF3C7",
                                  color: "#D97706",
                                  fontWeight: 800,
                                  padding: "1px 4px",
                                  borderRadius: 4
                                }}>💰</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={() => openAdd(day)}
                    style={{
                      background: "rgba(0,0,0,0.02)",
                      border: "none",
                      borderRadius: 14,
                      padding: "10px 14px",
                      cursor: "pointer",
                      color: "#4B5563",
                      fontSize: 11,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      outline: "none",
                    }}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>{lang === "id" ? "Tambah Konten" : "Add Content"}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {activeDays.length === 0 && (
            <div style={{
              background: "white",
              border: "1px dashed rgba(0,0,0,0.06)",
              borderRadius: 28,
              padding: "48px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              boxShadow: "0 4px 16px rgba(0,0,0,0.01)",
            }}>
              <span style={{ fontSize: 32 }}>📅</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                  {lang === "id" ? "Tidak Ada Jadwal Konten" : "No Scheduled Content"}
                </span>
                <span style={{ fontSize: 11, color: "#9CA3AF", maxWidth: 220, lineHeight: 1.5 }}>
                  {lang === "id"
                    ? "Belum ada konten atau event terjadwal di bulan ini."
                    : "There is no content or events scheduled for this month yet."}
                </span>
              </div>
              <button
                onClick={() => openAdd(1)}
                style={{
                  background: "var(--theme-primary)",
                  border: "none",
                  borderRadius: 16,
                  padding: "12px 24px",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 4px 12px rgba(35, 131, 226, 0.3)",
                }}
              >
                {lang === "id" ? "Buat Konten Pertama" : "Create First Content"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{fontSize:16,fontWeight:700,marginBottom:12,color:"#111827",letterSpacing:"-0.01em"}}>Timeline — {(lang === "id" ? MONTHS : MONTHS_EN)[month-1]} {year}</div>
      <div ref={scrollRef} style={{
        overflowX:"auto",
        paddingBottom:16,
        background: "rgba(0, 0, 0, 0.015)",
        borderRadius: "16px",
        padding: "16px 12px",
        border: "1px solid rgba(0,0,0,0.02)",
        boxShadow: "none"
      }}>
        <div style={{display:"flex",gap:12,minWidth:dim*150+"px"}}>
          {Array.from({length:dim},(_,i)=>{
            const day=i+1,items=getItems(day),ev=getEv(day);
            const dow=new Date(year,month-1,day).getDay();
            const isWe=dow===0||dow===6;
            return (
              <div key={day} style={{flex:"0 0 150px",background:"transparent",borderRadius:0,padding:0,borderRight:"1px solid rgba(0,0,0,0.04)",minHeight:180, paddingRight: 12}}>
                <div style={{borderBottom:"1px solid rgba(0,0,0,0.04)",paddingBottom:6,marginBottom:10, display:"flex", alignItems:"baseline", gap: 4}}>
                  <div style={{fontSize:11,fontWeight:600,color:"rgba(0,0,0,0.3)"}}>{(lang === "id" ? DAYS_S : DAYS_S_EN)[dow]}</div>
                  <div style={{fontSize:16,fontWeight:700,lineHeight:1,color:isWe?"rgba(0,0,0,0.35)":"#111827"}}>{day}</div>
                  {ev&&<div style={{fontSize:9,color:"#D9730D",fontWeight:600,lineHeight:1.1, marginLeft: "auto", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:60}} title={ev}>{ev}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {items.map((item:any)=>{
                    const firstPillar = String(item.pillar).split(',')[0].trim();
                    const ps = item.archived ? { color: "#787774", light: "rgba(255,255,255,0.5)" } : gps(pillars, firstPillar);
                    return (
                      <button key={item.id} onClick={()=>openEdit(item)} style={{
                        background:"#FFFFFF",
                        border:"1px solid rgba(0,0,0,0.03)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                        borderRadius:"8px",padding:"6px 8px",textAlign:"left",cursor:"pointer",width:"100%", transition: "all 0.1s ease"
                      }} className="hover:shadow-xs hover:border-black/10">
                        <div style={{fontSize:10.5,color:"#111827",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",wordWrap:"break-word",lineHeight:1.2}}>{item.title||"Untitled"}{item.archived ? " 📦" : ""}</div>
                        <div style={{fontSize:9,color:"rgba(55,53,47,0.5)",marginTop:3,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span>{fmtT(item.uploadHour,item.uploadMinute,item.timeFormat)}</span>
                          {item.isAds&&<span style={{fontSize:8}}>💰</span>}
                        </div>
                      </button>
                    );
                  })}
                  <button onClick={()=>openAdd(day)} style={{
                    background: "rgba(255, 255, 255, 0.4)",
                    border: "1px dashed rgba(0,0,0,0.06)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    cursor:"pointer",
                    color:"#4B5563",
                    fontSize:10.5,
                    width:"100%", 
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3, 
                    fontWeight:600,
                    transition: "all 0.12s"
                  }} className="hover:bg-white hover:border-black/10 hover:text-black hover:shadow-xs">
                    <Plus size={10} /> {lang === "id" ? "Tambah" : "Add"}
                  </button>
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
  const { lang } = useI18n();
  const [sort,setSort] = useState({col:"day",dir:"asc"});

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {bulkIds.length > 0 && (
          <div style={{
            padding: "12px 18px",
            background: "rgba(35, 131, 226, 0.05)",
            border: "1px solid rgba(35, 131, 226, 0.15)",
            borderRadius: 20,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            boxShadow: "0 4px 12px rgba(35, 131, 226, 0.05)",
          }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: "var(--theme-primary)" }}>{bulkIds.length} {lang === "id" ? "terpilih" : "selected"}</span>
            <div style={{ width: 1, height: 14, background: "rgba(35, 131, 226, 0.2)" }}/>
            <button onClick={() => onBulk("archive")} style={{ background: "none", border: "none", color: "#4B5563", fontSize: 11, fontWeight: 800, cursor: "pointer", outline: "none" }}>{lang === "id" ? "📦 Arsip" : "📦 Archive"}</button>
            <button onClick={() => onBulk("restore")} style={{ background: "none", border: "none", color: "#10B981", fontSize: 11, fontWeight: 800, cursor: "pointer", outline: "none" }}>{lang === "id" ? "Pulihkan" : "Restore"}</button>
            <button onClick={() => onBulk("delete")} style={{ background: "none", border: "none", color: "#EF4444", fontSize: 11, fontWeight: 800, cursor: "pointer", outline: "none" }}>{lang === "id" ? "Hapus" : "Delete"}</button>
            <div style={{ flex: 1 }} />
            <button onClick={() => setBulkIds([])} style={{ background: "rgba(0,0,0,0.03)", border: "none", padding: "4px 10px", borderRadius: 999, color: "#4B5563", fontSize: 11, fontWeight: 800, cursor: "pointer", outline: "none" }}>{lang === "id" ? "Batal" : "Cancel"}</button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map(item => {
            const e = eng(item.metrics) + eng(item.adsMetrics);
            const v = (item.metrics?.views || 0) + (item.adsMetrics?.views || 0);
            const r = (item.metrics?.reach || 0) + (item.adsMetrics?.reach || 0);
            const platformName = String(item.platform || "").split(',')[0].trim();
            const platformColor = item.archived ? "#7A7976" : gpc(platforms, platformName);

            return (
              <div
                key={item.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.03)",
                  borderRadius: 22,
                  padding: "16px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  opacity: item.archived ? 0.75 : 1,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Left side accent indicator */}
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: platformColor,
                }} />

                {/* Header Row: Checkbox, Date & PIC */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={bulkIds.includes(item.id)}
                      onChange={() => toggleBulk(item.id)}
                      style={{
                        width: 18,
                        height: 18,
                        cursor: "pointer",
                        accentColor: "var(--theme-primary)",
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>
                        {item.day}/{String(item.month).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
                        <span>🕒</span> {fmtT(item.uploadHour, item.uploadMinute, item.timeFormat)}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 10,
                    background: "rgba(0,0,0,0.03)",
                    padding: "3px 8px",
                    borderRadius: 8,
                    fontWeight: 800,
                    color: "#4B5563"
                  }}>
                    👤 {item.pic || "-"}
                  </span>
                </div>

                {/* Badges Row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 6 }}>
                  <PBadge name={item.platform} platforms={platforms}/>
                  <PiBadge name={item.pillar} pillars={pillars}/>
                  <span style={{
                    background: "rgba(0,0,0,0.03)",
                    color: "#111827",
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    {item.contentType || "-"}
                  </span>
                  <SBadge status={item.status}/>
                </div>

                {/* Title & Copywriting brief */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 6 }} onClick={() => openEdit(item)}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", lineHeight: 1.4 }}>
                    <High txt={item.title || "Untitled"}/><span style={{fontWeight: 400}}>{item.archived ? " 📦" : ""}</span>
                  </div>
                  {item.briefCopywriting && (
                    <div style={{
                      fontSize: 11,
                      color: "#4B5563",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      background: "rgba(0,0,0,0.015)",
                      padding: "10px",
                      borderRadius: 12,
                      fontWeight: 500,
                    }}>
                      {htmlToPlainText(item.briefCopywriting)}
                    </div>
                  )}
                </div>

                {/* Metrics Summary Row */}
                {(v > 0 || r > 0 || e > 0) && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    background: "rgba(0,0,0,0.015)",
                    padding: "10px",
                    borderRadius: 14,
                    textAlign: "center",
                    marginLeft: 6
                  }}>
                    <div>
                      <div style={{ fontSize: 8, textTransform: "uppercase", fontWeight: 900, color: "#6B7280", letterSpacing: "0.05em" }}>Views</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>{fmt(v)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 8, textTransform: "uppercase", fontWeight: 900, color: "#6B7280", letterSpacing: "0.05em" }}>Reach</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>{fmt(r)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 8, textTransform: "uppercase", fontWeight: 900, color: "#6B7280", letterSpacing: "0.05em" }}>Eng</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>{fmt(e)}</div>
                    </div>
                  </div>
                )}

                {/* Quick actions for card */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.03)", marginLeft: 6 }}>
                  <button onClick={() => openEdit(item)} style={{ background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 11, cursor: "pointer", color: "#111827", fontWeight: 800, outline: "none" }}>
                    Edit
                  </button>
                  {item.status === "Published" && !item.archived && (
                    <button onClick={() => archiveItem(item.id)} style={{ background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 11, cursor: "pointer", color: "#111827", fontWeight: 800, outline: "none" }}>
                      {lang === "id" ? "Arsip" : "Archive"}
                    </button>
                  )}
                  {item.archived && (
                    <button onClick={() => unarchiveItem(item.id)} style={{ background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 11, cursor: "pointer", color: "#111827", fontWeight: 800, outline: "none" }}>
                      {lang === "id" ? "Pulihkan" : "Restore"}
                    </button>
                  )}
                  {!item.archived && (
                    <button onClick={() => deleteItem(item.id)} style={{ background: "#FEE2E2", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: 10, padding: "7px 13px", fontSize: 11, cursor: "pointer", color: "#EF4444", fontWeight: 800, outline: "none" }}>
                      {lang === "id" ? "Hapus" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div style={{
              background: "white",
              border: "1px dashed rgba(0,0,0,0.06)",
              borderRadius: 28,
              padding: "48px 24px",
              textAlign: "center",
              color: "#9CA3AF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 28 }}>📁</span>
              <span style={{ fontWeight: 800, color: "#4B5563" }}>{lang === "id" ? "Tidak ada konten" : "No contents"}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      transform: "translateZ(0)",
      willChange: "transform",
      borderRadius: "32px",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
      border: "1px solid rgba(0,0,0,0.03)"
    }}>
      {bulkIds.length>0 && (
        <div style={{padding:"8px 16px",background:"rgba(59,130,246,0.05)",borderBottom:"1px solid rgba(59,130,246,0.1)",display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:600,color:"#3B82F6"}}>{bulkIds.length} terpilih</span>
          <div style={{width:1,height:14,background:"rgba(59,130,246,0.2)"}}/>
          <button onClick={()=>onBulk("archive")} style={{background:"none",border:"none",color:"#723680",fontSize:13,fontWeight:600,cursor:"pointer"}}>{lang === "id" ? "📦 Arsip Massal" : "📦 Bulk Archive"}</button>
          <button onClick={()=>onBulk("restore")} style={{background:"none",border:"none",color:"#2E7D32",fontSize:13,fontWeight:600,cursor:"pointer"}}>{lang === "id" ? "🔄 Pulihkan Massal" : "🔄 Bulk Restore"}</button>
          <button onClick={()=>onBulk("delete")} style={{background:"none",border:"none",color:"#9C2B4E",fontSize:13,fontWeight:600,cursor:"pointer"}}>{lang === "id" ? "🗑️ Hapus Massal" : "🗑️ Bulk Delete"}</button>
          <div style={{flex:1}}/>
          <button onClick={()=>setBulkIds([])} style={{background:"none",border:"none",color:"rgba(44,32,22,0.4)",fontSize:13,cursor:"pointer"}}>{lang === "id" ? "Batal" : "Cancel"}</button>
        </div>
      )}
      {sorted.length===0
        ? <div style={{padding:48,textAlign:"center",color:"#787774",fontSize:14}}>{lang === "id" ? "Tidak ada konten" : "No contents"}</div>
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
                        {item.linkAsset && (
                          <a
                            href={item.linkAsset.split(/[\n,]+/)[0].startsWith("http") ? item.linkAsset.split(/[\n,]+/)[0] : `https://${item.linkAsset.split(/[\n,]+/)[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{fontSize:9,color:"#2B4C7E"}}
                          >
                            🔗 Aset
                          </a>
                        )}
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
                        <button onClick={()=>openEdit(item)} style={{background:"#F1F1EF",border:"none",borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#37352F",fontWeight:500}}>{lang === "id" ? "Edit" : "Edit"}</button>
                        {item.status==="Published" || String(status).toLowerCase().includes("tayang") || String(status).toLowerCase().includes("publikasi")&&!item.archived&&<button onClick={()=>archiveItem(item.id)} style={{background:"#F1F1EF",border:"none",borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#37352F",fontWeight:500}}>{lang === "id" ? "Arsip" : "Archive"}</button>}
                        {item.archived&&<button onClick={()=>unarchiveItem(item.id)} style={{background:"#F1F1EF",border:"none",borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#37352F",fontWeight:500}}>{lang === "id" ? "Pulihkan" : "Restore"}</button>}
                        {!item.archived&&<button onClick={()=>deleteItem(item.id)} style={{background:"#FFEEA3",border:"1px solid #FFE066",borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#D9730D",fontWeight:500}}>{lang === "id" ? "Hapus" : "Delete"}</button>}
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
