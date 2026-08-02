import React, { useState, useEffect, useRef, useMemo } from "react";
import { useI18n } from "../../i18n";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, PieChart, Calendar, Check } from "lucide-react";
import { MS } from "../../data";

export function CustomDropdown({ value, options = [], onChange, style }: { value: string, options?: any[], onChange: (val: string) => void, style?: any }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find(o => (typeof o === 'string' ? o : o.id) === value);
  const displayLabel = activeOption ? (typeof activeOption === 'string' ? activeOption : activeOption.label) : value;

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      <button 
        onClick={() => setOpen(!open)} 
        className="hover-scale"
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 20px", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.5)", backdropFilter: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#2C2016" }}
      >
        <span>{displayLabel}</span>
        <ChevronDown size={14} color="rgba(44,32,22,0.5)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'all 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
            style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "rgba(255,255,255,0.85)", backdropFilter: "none", WebkitBackdropFilter: "none", border: "1px solid rgba(255,255,255,0.8)", borderRadius: 12, padding: 6, zIndex: 100, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", minWidth: 120, overflowY: "auto", maxHeight: 200 }}
          >
            {options.map((o, i) => {
              const val = typeof o === 'string' ? o : o.id;
              const isSelected = val === value;
              return (
                <div 
                  key={i} 
                  onClick={() => { onChange(val); setOpen(false); }}
                  style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: isSelected?800:600, cursor: "pointer", background: isSelected ? "rgba(59,130,246,0.1)" : "transparent", color: isSelected ? "#3B82F6" : "#2C2016", transition: "all 0.1s", whiteSpace: "nowrap" }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.6)"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {typeof o === 'string' ? o : o.label}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileStepper({
  value,
  options,
  onChange,
  prefix = "",
}: {
  value: string;
  options: any[];
  onChange: (val: string) => void;
  prefix?: string;
}) {
  const currentIndex = options.findIndex(
    (o) => (typeof o === "string" ? o : o.id || o[0]) === value
  );

  const handlePrev = () => {
    if (currentIndex === -1 || options.length <= 1) return;
    const nextIdx = (currentIndex - 1 + options.length) % options.length;
    const option = options[nextIdx];
    onChange(typeof option === "string" ? option : option.id || option[0]);
  };

  const handleNext = () => {
    if (currentIndex === -1 || options.length <= 1) return;
    const nextIdx = (currentIndex + 1) % options.length;
    const option = options[nextIdx];
    onChange(typeof option === "string" ? option : option.id || option[0]);
  };

  const activeOption = options[currentIndex];
  const displayLabel = activeOption
    ? typeof activeOption === "string"
      ? activeOption
      : activeOption.label || activeOption.name || activeOption[1]
    : value;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "white",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 12,
        padding: "4px 8px",
        width: "100%",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.01)",
        height: 44,
      }}
    >
      <button
        onClick={handlePrev}
        style={{
          background: "transparent",
          border: "none",
          padding: 8,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(0,0,0,0.5)",
          width: 40,
          height: 40,
        }}
      >
        <ChevronLeft size={18} />
      </button>
      <div
        style={{
          fontWeight: 700,
          fontSize: 13,
          color: "#111827",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flex: 1,
          justifyContent: "center",
          fontFamily: "Plus Jakarta Sans, Inter, sans-serif",
        }}
      >
        {prefix && <span style={{ opacity: 0.5, fontWeight: 500 }}>{prefix}:</span>}
        <span style={{ color: "#000000" }}>{displayLabel}</span>
      </div>
      <button
        onClick={handleNext}
        style={{
          background: "transparent",
          border: "none",
          padding: 8,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(0,0,0,0.5)",
          width: 40,
          height: 40,
        }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function MobileFilterDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (val: string) => void;
  icon?: any;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find((o) => o.id === value);
  const displayLabel = activeOption ? activeOption.label : value;

  return (
    <div ref={ref} className="relative flex flex-col gap-1 w-full text-left">
      <label className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider pl-2">
        {label}
      </label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-1.5 bg-white border border-black/[0.08] hover:bg-gray-50 px-2.5 py-1 rounded-full shadow-sm cursor-pointer transition-colors text-[11px] font-bold h-8"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && <Icon size={12} className="text-gray-500 shrink-0" />}
          <span className="text-gray-800 truncate">{displayLabel}</span>
        </div>
        <ChevronDown
          size={12}
          className="text-gray-500 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-black/10 z-[9999] overflow-hidden flex flex-col w-full min-w-[150px] text-left max-h-[250px] overflow-y-auto py-1"
          >
            {options.map((opt) => {
              const selected = opt.id === value;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer border-none bg-transparent text-left"
                >
                  <span className={selected ? "text-blue-600 font-bold" : ""}>
                    {opt.label}
                  </span>
                  {selected && <Check size={12} className="text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlatformFilterPopover({ platformFilter, setPlatformFilter, platforms }: any) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel = platformFilter === "all" ? (lang === "id" ? "Semua Platform" : "All Platforms") : platformFilter;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-white border hover:bg-white/70 px-4.5 py-2 rounded-full border-black/10 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors text-xs font-bold">
        <PieChart size={15} className="text-gray-500" />
        <span className="text-gray-800">{activeLabel}</span>
        <ChevronDown size={13} className="text-gray-500 ml-0.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-[9999] overflow-hidden flex flex-col w-max min-w-[170px] text-left max-h-[350px] overflow-y-auto py-2"
          >
             <label className="flex items-center gap-2.5 px-4.5 py-2.5 hover:bg-gray-50 cursor-pointer">
               <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-white ${platformFilter === "all" ? 'border-blue-500' : 'border-gray-300'}`}>
                 {platformFilter === "all" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
               </div>
               <span className="text-sm font-semibold text-gray-700">{lang === 'id' ? 'Semua Platform' : 'All Platforms'}</span>
               <input type="radio" className="hidden" value="all" checked={platformFilter === "all"} onChange={() => { setPlatformFilter("all"); setOpen(false); }} />
             </label>
             {platforms?.map((p: any) => {
               const val = typeof p === 'string' ? p : p.name;
               return (
                 <label key={val} className="flex items-center gap-2.5 px-4.5 py-2.5 hover:bg-gray-50 cursor-pointer border-t border-gray-100">
                   <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-white ${platformFilter === val ? 'border-blue-500' : 'border-gray-300'}`}>
                     {platformFilter === val && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                   </div>
                   <span className="text-sm font-semibold text-gray-700">{val}</span>
                   <input type="radio" className="hidden" value={val} checked={platformFilter === val} onChange={() => { setPlatformFilter(val); setOpen(false); }} />
                 </label>
               )
             })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DateFilterPopover({ dateFilt, setDateFilt, customS, setCustomS, customE, setCustomE }: any) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const OPTIONS = [
    {id:"yesterday", label: lang === "id" ? "Kemarin" : "Yesterday"},
    {id:"7d", label: lang === "id" ? "7 Hari Terakhir" : "Last 7 days"},
    {id:"28d", label: lang === "id" ? "28 Hari Terakhir" : "Last 28 days"},
    {id:"90d", label: lang === "id" ? "90 Hari Terakhir" : "Last 90 days"},
    {id:"tw", label: lang === "id" ? "Minggu Ini" : "This week"},
    {id:"tm", label: lang === "id" ? "Bulan Ini" : "This month"},
    {id:"ty", label: lang === "id" ? "Tahun Ini" : "This year"},
    {id:"lw", label: lang === "id" ? "Minggu Lalu" : "Last week"},
    {id:"lm", label: lang === "id" ? "Bulan Lalu" : "Last month"},
    {id:"custom", label: lang === "id" ? "Kustom" : "Custom"},
  ];

  let activeLabel = OPTIONS.find(o => o.id === dateFilt)?.label || (lang === "id" ? "Sepanjang Waktu" : "All Time");
  if (dateFilt === "custom") {
    const formatDate = (dStr: string) => {
      if (!dStr) return "";
      const d = new Date(dStr);
      return isNaN(d.getTime()) ? "" : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    if (customS && customE) activeLabel = `${formatDate(customS)} - ${formatDate(customE)}`;
    else if (customS) activeLabel = formatDate(customS);
  }

  const [tempFilt, setTempFilt] = useState(dateFilt);
  const [tempS, setTempS] = useState(customS);
  const [tempE, setTempE] = useState(customE);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdate = () => {
    setDateFilt(tempFilt);
    if(tempFilt === "custom") {
      setCustomS(tempS);
      setCustomE(tempE);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setTempFilt(dateFilt);
    setTempS(customS);
    setTempE(customE);
    setOpen(false);
  };

  const [navDate, setNavDate] = useState(new Date());

  const handleDateClick = (y: number, m: number, d: number) => {
    setTempFilt("custom");
    const clickedDateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    if (!tempS || (tempS && tempE)) {
      setTempS(clickedDateStr);
      setTempE("");
    } else {
      const sDate = new Date(tempS);
      const clickedDate = new Date(clickedDateStr);
      if (clickedDate < sDate) {
        setTempE(tempS);
        setTempS(clickedDateStr);
      } else {
        setTempE(clickedDateStr);
      }
    }
  };

  const activeDateRange = useMemo(() => {
    if (tempFilt === "custom" || tempFilt === "all") return { sDateStr: tempS, eDateStr: tempE };
    const now = new Date();
    now.setHours(0,0,0,0);
    let targetS = new Date(now);
    let targetE = new Date(now);
    const dayOfWeek = now.getDay();

    if(tempFilt==="yesterday") {
      targetS.setDate(now.getDate()-1);
      targetE = new Date(targetS);
    } else if(tempFilt==="7d") {
      targetS.setDate(now.getDate()-7);
    } else if(tempFilt==="28d") {
      targetS.setDate(now.getDate()-28);
    } else if(tempFilt==="90d") {
      targetS.setDate(now.getDate()-90);
    } else if(tempFilt==="tw") {
      targetS.setDate(now.getDate() - dayOfWeek);
    } else if(tempFilt==="tm") {
      targetS.setDate(1);
    } else if(tempFilt==="ty") {
      targetS.setMonth(0);
      targetS.setDate(1);
    } else if(tempFilt==="lw") {
      targetS.setDate(now.getDate() - dayOfWeek - 7);
      targetE = new Date(targetS);
      targetE.setDate(targetS.getDate() + 6);
    } else if(tempFilt==="lm") {
      targetS.setDate(1);
      targetS.setMonth(now.getMonth()-1);
      targetE = new Date(now.getFullYear(), now.getMonth(), 0); 
    }

    const fmt = (d: Date) => {
      if (isNaN(d.getTime())) return "";
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    return { sDateStr: fmt(targetS), eDateStr: fmt(targetE) };
  }, [tempFilt, tempS, tempE]);

  const isExactDate = (y: number, m: number, d: number) => {
    if (tempFilt === "all") return false;
    const { sDateStr, eDateStr } = activeDateRange;
    if (!sDateStr) return false;
    const curDateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return curDateStr === sDateStr || curDateStr === eDateStr;
  };

  const isDateInRange = (y: number, m: number, d: number) => {
    if (tempFilt === "all") return false;
    const { sDateStr, eDateStr } = activeDateRange;
    if (!sDateStr || !eDateStr) return false;
    const curDateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return curDateStr > sDateStr && curDateStr < eDateStr;
  };

  const renderCalendar = (offset: number) => {
    const baseDate = new Date(navDate.getFullYear(), navDate.getMonth() + offset, 1);
    const y = baseDate.getFullYear();
    const m = baseDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    
    let days = [];
    for(let i=0;i<firstDay;i++) days.push(null);
    for(let i=1;i<=daysInMonth;i++) days.push(i);

    const monthName = baseDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
      <div className="flex-1 w-52 bg-transparent">
         <div className="font-semibold text-gray-800 text-sm mb-3 text-center">{monthName}</div>
         <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2 font-medium">
           {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d}>{d}</div>)}
         </div>
         <div className="grid grid-cols-7 gap-y-1 gap-x-0 cursor-default">
           {days.map((d, i) => {
              if(!d) return <div key={i} />;
              const isSel = isExactDate(y, m, d);
              const inRange = isDateInRange(y, m, d);
              
              return (
                <div 
                  key={i} 
                  onClick={() => handleDateClick(y, m, d)}
                  className={`text-xs p-1.5 rounded-md text-center transition-colors cursor-pointer ${isSel ? 'bg-blue-600 text-white font-bold' : inRange ? 'bg-blue-50 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {d}
                </div>
              );
           })}
         </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setTempFilt(dateFilt); setTempS(customS); setTempE(customE); setOpen(!open); }} className="flex items-center gap-2 bg-white border hover:bg-white/70 px-4.5 py-2 rounded-full border-black/10 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors text-xs font-bold">
        <Calendar size={15} className="text-gray-500" />
        <span className="text-gray-800">{activeLabel}</span>
        <ChevronDown size={13} className="text-gray-500 ml-0.5" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-[9999] overflow-hidden flex flex-col md:flex-row w-max text-left">
          {/* Left Sidebar */}
          <div className="w-44 bg-gray-50 border-r border-black/5 py-4 px-2.5 flex flex-col gap-1 overflow-y-auto max-h-[350px]">
             {OPTIONS.map(o => (
               <label key={o.id} className="flex items-center gap-2.5 px-3.5 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                 <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-white ${tempFilt === o.id ? 'border-blue-500' : 'border-gray-300'}`}>
                   {tempFilt === o.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                 </div>
                 <span className="text-xs font-semibold text-gray-700">{o.label}</span>
                 <input type="radio" className="hidden" name="dateFiltRadio" value={o.id} checked={tempFilt === o.id} onChange={() => setTempFilt(o.id)} />
               </label>
             ))}
          </div>

          {/* Right Area */}
          <div className="flex flex-col p-6 max-w-lg bg-transparent">
             {/* Calendars */}
             <div className="flex gap-4 relative justify-center">
               <button onClick={() => setNavDate(new Date(navDate.getFullYear(), navDate.getMonth()-1, 1))} className="absolute -left-1 top-0 p-1 hover:bg-gray-100 rounded-full"><ChevronLeft size={16}/></button>
               {renderCalendar(0)}
               <button onClick={() => setNavDate(new Date(navDate.getFullYear(), navDate.getMonth()+1, 1))} className="absolute -right-1 top-0 p-1 hover:bg-gray-100 rounded-full"><ChevronRight size={16}/></button>
             </div>

             {/* Footer Form */}
             <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
               <div className="flex items-center justify-between gap-4">
                 {tempFilt === "custom" ? (
                   <div className="flex gap-1.5 items-center">
                     <input type="date" value={tempS} onChange={(e)=>setTempS(e.target.value)} className="text-xs px-2 py-1 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 font-medium"/>
                     <span className="text-gray-400 font-semibold text-xs">-</span>
                     <input type="date" value={tempE} onChange={(e)=>setTempE(e.target.value)} className="text-xs px-2 py-1 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 font-medium"/>
                   </div>
                 ) : (
                   <div className="font-semibold text-gray-800 text-sm">{OPTIONS.find(o=>o.id===tempFilt)?.label}</div>
                 )}
               </div>
               
               <div className="flex items-center gap-2 self-end">
                 <button onClick={handleCancel} className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                 <button onClick={handleUpdate} className="px-4 py-1.5 rounded-lg bg-blue-600 border border-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">Update</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
