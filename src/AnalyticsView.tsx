import { useState, useMemo, useRef, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell, PieChart as RPieChart, Pie } from "recharts";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, TrendingUp, Sparkles, PieChart, Users, BarChart2, Activity, Calendar, Zap, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, Target, Star } from "lucide-react";

const CustomLegend = ({ payload }: any) => {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 20px", paddingTop: 20 }}>
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const GeminiIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1.5L14.45 9.55L22.5 12L14.45 14.45L12 22.5L9.55 14.45L1.5 12L9.55 9.55L12 1.5Z" fill="url(#gemini_gradient)" />
    <defs>
      <linearGradient id="gemini_gradient" x1="1.5" y1="12" x2="22.5" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="0.5" stopColor="#9B72CB"/>
        <stop offset="1" stopColor="#D96570"/>
      </linearGradient>
    </defs>
  </svg>
);

const LoadingDots = () => (
  <span>
    Menganalisis data
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5}}>.</motion.span>
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.2}}>.</motion.span>
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.4}}>.</motion.span>
  </span>
);

import { 
  MONTHS, MS, DAYS_S, DAYS_ID, YEARS, MK, MC,
  eng, fmt, gps,
  I, B, CARD, PBadge, htmlToPlainText 
} from "./data";

const SocialThumbnail = ({ url, fallback }: { url: string, fallback: any }) => {
  const [img, setImg] = useState<string|null>(null);
  useEffect(() => {
    if(!url) return;
    let isMounted = true;
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      .then(r=>r.json())
      .then(d=>{
        if(isMounted && d?.data?.image?.url) {
          setImg(d.data.image.url);
        }
      })
      .catch(e=>console.log("no thumb"));
    return () => { isMounted = false };
  }, [url]);

  if(img) return <img src={img} alt="thumb" style={{width: "100%", height: "100%", objectFit: "cover"}} />;
  return fallback;
};


function CustomDropdown({ value, options = [], onChange, style }: { value: string, options?: any[], onChange: (val: string) => void, style?: any }) {
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
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.5)", backdropFilter: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#2C2016" }}
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

function PlatformFilterPopover({ platformFilter, setPlatformFilter, platforms }: any) {
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

  const activeLabel = platformFilter === "all" ? "Semua Platform" : platformFilter;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-white border hover:bg-white/70 px-3 py-1.5 rounded-lg border border-black/10 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
        <PieChart size={16} className="text-gray-500" />
        <span className="text-sm font-semibold text-gray-800">{activeLabel}</span>
        <ChevronDown size={14} className="text-gray-500 ml-1" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-[9999] overflow-hidden flex flex-col w-max min-w-[160px] text-left max-h-[350px] overflow-y-auto"
          >
             <label className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer">
               <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-white ${platformFilter === "all" ? 'border-blue-500' : 'border-gray-300'}`}>
                 {platformFilter === "all" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
               </div>
               <span className="text-sm font-semibold text-gray-700">Semua Platform</span>
               <input type="radio" className="hidden" value="all" checked={platformFilter === "all"} onChange={() => { setPlatformFilter("all"); setOpen(false); }} />
             </label>
             {platforms?.map((p: any) => {
               const val = typeof p === 'string' ? p : p.name;
               return (
                 <label key={val} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer border-t border-gray-100">
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

function DateFilterPopover({ dateFilt, setDateFilt, customS, setCustomS, customE, setCustomE }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const OPTIONS = [
    {id:"yesterday", label:"Yesterday"},
    {id:"7d", label:"Last 7 days"},
    {id:"28d", label:"Last 28 days"},
    {id:"90d", label:"Last 90 days"},
    {id:"tw", label:"This week"},
    {id:"tm", label:"This month"},
    {id:"ty", label:"This year"},
    {id:"lw", label:"Last week"},
    {id:"lm", label:"Last month"},
    {id:"custom", label:"Custom"},
  ];

  let activeLabel = OPTIONS.find(o => o.id === dateFilt)?.label || "Sepanjang Waktu";
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
      targetS.setMonth(now.getMonth()-1);
      targetS.setDate(1);
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
      <button onClick={() => { setTempFilt(dateFilt); setTempS(customS); setTempE(customE); setOpen(!open); }} className="flex items-center gap-2 bg-white border hover:bg-white/70 px-3 py-1.5 rounded-lg border border-black/10 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
        <Calendar size={16} className="text-gray-500" />
        <span className="text-sm font-semibold text-gray-800">{activeLabel}</span>
        <ChevronDown size={14} className="text-gray-500 ml-1" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-[9999] overflow-hidden flex flex-col md:flex-row w-max text-left">
          {/* Left Sidebar */}
          <div className="w-40 bg-gray-50 border-r border-black/5 p-2 flex flex-col gap-1 overflow-y-auto max-h-[350px]">
             {OPTIONS.map(o => (
               <label key={o.id} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
                 <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-white ${tempFilt === o.id ? 'border-blue-500' : 'border-gray-300'}`}>
                   {tempFilt === o.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                 </div>
                 <span className="text-xs font-semibold text-gray-700">{o.label}</span>
                 <input type="radio" className="hidden" name="dateFiltRadio" value={o.id} checked={tempFilt === o.id} onChange={() => setTempFilt(o.id)} />
               </label>
             ))}
          </div>

          {/* Right Area */}
          <div className="flex flex-col p-4 max-w-lg bg-transparent">
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

export function AnalyticsView({content,pillars,platforms,contentTypes,pics,statuses,openEdit,isRestricted}: any) {
  const [dateFilt,setDateFilt] = useState("28d"); 
  const [customS,setCustomS] = useState("");
  const [customE,setCustomE] = useState("");
  const [adsFilter,setAdsFilter] = useState("organic"); 
  const [platformFilter, setPlatformFilter] = useState("all");
  const [activeMetrics,setActiveMetrics] = useState(["reach","likes","comments"]);
  const [topSort,setTopSort] = useState("engagement");
  const [topPlatform,setTopPlatform] = useState("All");
  const [platformMetric, setPlatformMetric] = useState("engagement");
  const [platformChartType, setPlatformChartType] = useState("doughnut");
  const [picChartType, setPicChartType] = useState("doughnut");
  const [heatmapMetric, setHeatmapMetric] = useState("engagement");
  
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const topAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!topAnchorRef.current) return;
    const observer = new IntersectionObserver(([ent]) => setIsScrolled(!ent.isIntersecting), { threshold: 1 });
    observer.observe(topAnchorRef.current);
    return () => observer.disconnect();
  }, []);
  const [showAiInsight, setShowAiInsight] = useState(true);

  useEffect(() => {
    setAiInsight("");
  }, [dateFilt, customS, customE, adsFilter, platformFilter]);

  const toggleMetric = (k:string) => setActiveMetrics(m=>m.includes(k)?m.filter(x=>x!==k):[...m,k]);

  // Handle Quick Filters & Custom via date logic 
  const isDateMatch = (c:any, isPrev:boolean=false) => {
    let cdt = new Date(c.year, c.month-1, c.day);
    const now = new Date();
    now.setHours(0,0,0,0);
    
    if(dateFilt==="custom") {
      const sDate = customS ? new Date(customS) : new Date(0);
      const eDate = customE ? new Date(customE) : new Date("2100-01-01");
      if(!isPrev) return cdt >= sDate && cdt <= eDate;
      const diff = eDate.getTime() - sDate.getTime();
      return cdt >= new Date(sDate.getTime()-diff) && cdt < sDate;
    }
    if(dateFilt==="all") return !isPrev;
    
    let targetS = new Date(now);
    let targetE = new Date(now);
    
    const dayOfWeek = now.getDay();

    if(dateFilt==="yesterday") {
      targetS.setDate(now.getDate()-1);
      targetE = new Date(targetS);
    } else if(dateFilt==="7d") {
      targetS.setDate(now.getDate()-7);
    } else if(dateFilt==="28d") {
      targetS.setDate(now.getDate()-28);
    } else if(dateFilt==="90d") {
      targetS.setDate(now.getDate()-90);
    } else if(dateFilt==="tw") {
      targetS.setDate(now.getDate() - dayOfWeek);
    } else if(dateFilt==="tm") {
      targetS.setDate(1);
    } else if(dateFilt==="ty") {
      targetS.setMonth(0);
      targetS.setDate(1);
    } else if(dateFilt==="lw") {
      targetS.setDate(now.getDate() - dayOfWeek - 7);
      targetE = new Date(targetS);
      targetE.setDate(targetS.getDate() + 6);
    } else if(dateFilt==="lm") {
      targetS.setMonth(now.getMonth()-1);
      targetS.setDate(1);
      targetE = new Date(now.getFullYear(), now.getMonth(), 0); 
    }

    if(isPrev) {
      const diff = targetE.getTime() - targetS.getTime() + 86400000;
      targetE = new Date(targetS.getTime() - 86400000);
      targetS = new Date(targetS.getTime() - diff);
    }
    
    return cdt >= targetS && cdt <= targetE;
  };

  const base = content.filter((c:any)=>isDateMatch(c)&&(adsFilter==="all"||((adsFilter==="ads")===c.isAds))&&(platformFilter==="all"||String(c.platform).split(',').map(s=>s.trim()).includes(platformFilter)));
  const prevBase = content.filter((c:any)=>isDateMatch(c, true)&&(adsFilter==="all"||((adsFilter==="ads")===c.isAds))&&(platformFilter==="all"||String(c.platform).split(',').map(s=>s.trim()).includes(platformFilter)));
  
  const getEng = (c:any) => eng(c.metrics) + (c.isAds||adsFilter==="all"?eng(c.adsMetrics||{}):0);
  const getV = (c:any) => (c.metrics?.views||0) + (c.isAds||adsFilter==="all"?c.adsMetrics?.views||0:0);
  const getR = (c:any) => (c.metrics?.reach||0) + (c.isAds||adsFilter==="all"?c.adsMetrics?.reach||0:0);
  
  const total  = base.length;
  const pub    = base.filter((c:any)=>c.status==="Published").length;
  
  // Randomize numbers if restricted to prevent data leak but show structure
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  const getRand = (val: number, seed: number) => isRestricted ? Math.floor(seededRandom(seed) * 50000) : val;
  
  const tV = getRand(base.reduce((s:any,c:any)=>s+getV(c),0), 1);
  const tR = getRand(base.reduce((s:any,c:any)=>s+getR(c),0), 2);
  const tE = getRand(base.reduce((s:any,c:any)=>s+getEng(c),0), 3);
  const er = tR>0?((tE/tR)*100).toFixed(2):"0.00";

  const tClicks = getRand(base.reduce((s:any,c:any)=>s+(c.adsMetrics?.clicks||0),0), 4);
  const tConv = getRand(base.reduce((s:any,c:any)=>s+(c.adsMetrics?.conversions||0),0), 5);

  // Prev Calculations
  const prevTotal = prevBase.length;
  const prevTV = prevBase.reduce((s:any,c:any)=>s+getV(c),0);
  const prevTR = prevBase.reduce((s:any,c:any)=>s+getR(c),0);
  const prevTE = prevBase.reduce((s:any,c:any)=>s+getEng(c),0);
  const prevTClicks = prevBase.reduce((s:any,c:any)=>s+(c.adsMetrics?.clicks||0),0);
  const prevTConv = prevBase.reduce((s:any,c:any)=>s+(c.adsMetrics?.conversions||0),0);
  const prevER = prevTR>0?((prevTE/prevTR)*100):0;
  
  const calcPct = (curr:number, prev:number) => {
    if(dateFilt==="all") return null;
    if(prev===0) return curr>0 ? "+100%" : "0%";
    const pct = ((curr-prev)/prev)*100;
    return (pct>0?"+":"")+pct.toFixed(1)+"%";
  };

  const pctColor = (pctStr:string|null) => {
    if(!pctStr) return "transparent";
    if(pctStr.startsWith("+")) return "#7DC8A4";
    if(pctStr.startsWith("-")) return "#E57373";
    return "rgba(44,32,22,0.4)";
  };

  const getPeriodText = () => {
    if(dateFilt==="all") return "";
    if(dateFilt==="yesterday") return "vs prev day";
    if(dateFilt==="ty") return "vs last year";
    return "vs prev period";
  }

  const pTotal = calcPct(total, prevTotal);
  const pV = calcPct(tV, prevTV);
  const pR = calcPct(tR, prevTR);
  const pE = calcPct(tE, prevTE);
  const pC = calcPct(tClicks, prevTClicks);
  const pCv = calcPct(tConv, prevTConv);

  // Chart Data (Adjusts based on date filter)
  const lineData = useMemo(() => {
    let labels: { label: string, filter: (c: any) => boolean }[] = [];
    const now = new Date();
    
    let sDate = new Date();
    let eDate = new Date();
    
    // Normalize now to midnight to ensure clean day calculations
    now.setHours(0,0,0,0);
    eDate = new Date(now);

    if (dateFilt === "tm") {
       sDate = new Date(now.getFullYear(), now.getMonth(), 1);
       eDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
    } else if (dateFilt === "lm") {
       sDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
       eDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (dateFilt === "yesterday") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
       eDate = new Date(sDate);
    } else if (dateFilt === "7d") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (dateFilt === "28d") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28);
    } else if (dateFilt === "90d") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    } else if (dateFilt === "tw") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    } else if (dateFilt === "lw") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
       eDate = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() + 6);
    } else if (dateFilt === "ty") {
       sDate = new Date(now.getFullYear(), 0, 1);
    } else if (dateFilt === "3m") {
       sDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (dateFilt === "6m") {
       sDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (dateFilt === "1y") {
       sDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    } else if (dateFilt === "custom") {
       sDate = customS ? new Date(customS) : new Date(now.getFullYear(), now.getMonth(), 1);
       eDate = customE ? new Date(customE) : new Date();
       sDate.setHours(0,0,0,0);
       eDate.setHours(0,0,0,0);
    } else {
       // all
       const years = content.length > 0 ? Array.from(new Set(content.map((c: any) => c.year))).sort() as number[] : [now.getFullYear()];
       const minYear = years[0];
       sDate = new Date(minYear, 0, 1);
    }

    const diff = eDate.getTime() - sDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days <= 95) {
       // Daily Breakdown
       for (let i = 0; i <= days; i++) {
          const dt = new Date(sDate.getTime() + i * 86400000);
          labels.push({
            label: days <= 35 ? `${dt.getDate()} ${MS[dt.getMonth()]}` : `${dt.getDate()}/${dt.getMonth() + 1}`,
            filter: (c: any) => c.day === dt.getDate() && c.month === dt.getMonth() + 1 && c.year === dt.getFullYear()
          });
       }
    } else if (days <= 366) {
       // Weekly Breakdown
       const weeks = Math.ceil((days + 1) / 7);
       for (let i = 0; i < weeks; i++) {
          const wStart = new Date(sDate.getTime() + i * 7 * 86400000);
          const wEnd = new Date(Math.min(wStart.getTime() + 6 * 86400000, eDate.getTime()));
          labels.push({
            label: `${wStart.getDate()} ${MS[wStart.getMonth()]} - ${wEnd.getDate()} ${MS[wEnd.getMonth()]}`,
            filter: (c: any) => {
              const d = new Date(c.year, c.month-1, c.day);
              // Normalize times
              d.setHours(0,0,0,0);
              return d.getTime() >= wStart.getTime() && d.getTime() <= wEnd.getTime();
            }
          });
       }
    } else {
       // Monthly Breakdown
       let curr = new Date(sDate.getFullYear(), sDate.getMonth(), 1);
       while (curr <= eDate) {
          const m = curr.getMonth() + 1;
          const y = curr.getFullYear();
          labels.push({
            label: `${MS[m - 1]} ${y % 100}`,
            filter: (c: any) => c.month === m && c.year === y
          });
          curr.setMonth(curr.getMonth() + 1);
       }
    }

    return labels.map(({ label, filter }) => {
      const d = content.filter((c:any) => filter(c) && (adsFilter === "all" || ((adsFilter === "ads") === c.isAds)) && (platformFilter === "all" || String(c.platform).split(',').map(s=>s.trim()).includes(platformFilter)));
      const row: any = { name: label };
      ["views", "reach", "likes", "comments", "shares", "reposts", "saves", "clicks", "conversions"].forEach(k => {
        row[`${k}_org`] = d.filter((c: any) => !c.isAds).reduce((s: any, c: any) => s + (c.metrics?.[k] || 0), 0);
        row[`${k}_ads`] = d.filter((c: any) => c.isAds).reduce((s: any, c: any) => s + (c.adsMetrics?.[k] || 0), 0);
        row[k] = row[`${k}_org`] + row[`${k}_ads`];
      });
      row.engagement_org = d.filter((c: any) => !c.isAds).reduce((s: any, c: any) => s + eng(c.metrics), 0);
      row.engagement_ads = d.filter((c: any) => c.isAds).reduce((s: any, c: any) => s + eng(c.adsMetrics || {}), 0);
      row.engagement = row.engagement_org + row.engagement_ads;
      return row;
    });
  }, [content, dateFilt, customS, customE, adsFilter, platformFilter]);

  // Heatmap Data
  const heatmap = useMemo(() => {
    let m = Array(7).fill(0).map(() => Array(24).fill(0));
    base.filter((c:any)=>c.status==="Published").forEach((c:any) => {
      let cd = new Date(c.year, c.month-1, c.day).getDay();
      let h = c.uploadHour || 9;
      if (h>=0 && h<24) {
        if (heatmapMetric === "engagement") m[cd][h] += getEng(c);
        else if (heatmapMetric === "views") m[cd][h] += getV(c);
        else if (heatmapMetric === "reach") m[cd][h] += getR(c);
      }
    });
    return m;
  }, [base, heatmapMetric]);

  // Platform Data
  const platformData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      const plats = c.platform ? String(c.platform).split(',').map(s=>s.trim()).filter(Boolean) : ["Tanpa Platform"];
      plats.forEach(p => {
        if(!pmap[p]) pmap[p] = {name:p, engagement:0, views:0, reach:0};
        pmap[p].engagement += getEng(c);
        pmap[p].views += getV(c);
        pmap[p].reach += getR(c);
      });
    });
    return platforms.map((p:any) => ({
      name: p.name,
      value: pmap[p.name] ? pmap[p.name][platformMetric] : 0,
      color: p.color
    })).sort((a:any, b:any) => b.value - a.value);
  }, [base, platforms, platformMetric]);
  // Pillar Data
  const [pillarMetric, setPillarMetric] = useState("engagement");
  const pillarData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      const p = c.pillar || "Tanpa Pilar";
      if(!pmap[p]) pmap[p] = {name:p, engagement:0, views:0, reach:0, total: 0};
      pmap[p].engagement += getEng(c);
      pmap[p].views += getV(c);
      pmap[p].reach += getR(c);
      pmap[p].total += 1;
    });
    return pillars.map((p:any) => ({
      name: p.name || p.id || p,
      value: pmap[p.name || p.id || p] ? pmap[p.name || p.id || p][pillarMetric] : 0,
      color: p.color || "#3B82F6",
      total: pmap[p.name || p.id || p] ? pmap[p.name || p.id || p].total : 0
    })).sort((a:any, b:any) => b.value - a.value);
  }, [base, pillars, pillarMetric]);

  // Content Type Data
  const [typeMetric, setTypeMetric] = useState("engagement");
  const typeData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      const t = c.contentType || "Tanpa Tipe";
      if(!pmap[t]) pmap[t] = {name:t, engagement:0, views:0, reach:0, total: 0};
      pmap[t].engagement += getEng(c);
      pmap[t].views += getV(c);
      pmap[t].reach += getR(c);
      pmap[t].total += 1;
    });
    return (contentTypes || []).map((t:any) => {
      const tName = t.name || t.id || t;
      return {
        name: tName,
        value: pmap[tName] ? pmap[tName][typeMetric] : 0,
        total: pmap[tName] ? pmap[tName].total : 0,
        color: t.color
      };
    }).sort((a:any, b:any) => b.value - a.value);
  }, [base, contentTypes, typeMetric]);

  const picData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      const picsList = c.pic ? String(c.pic).split(',').map(s=>s.trim()).filter(Boolean) : ["Tanpa PIC"];
      picsList.forEach(p => {
        if(!pmap[p]) pmap[p] = {name:p, total:0, org:0, ads:0};
        pmap[p].total += 1;
        if(c.isAds) pmap[p].ads += 1;
        else pmap[p].org += 1;
      });
    });
    return Object.values(pmap).map((p:any) => {
      const userPic = (pics || []).find((x:any)=> (x.name || x.id || x) === p.name);
      return { ...p, color: userPic?.color };
    }).sort((a:any,b:any)=>b.total-a.total);
  }, [base, pics]);

  const fetchAiInsight = async () => {
    setAiLoading(true);
    setAiInsight("");
    try {
      // Extract data untuk LLM
      const topCont = base.filter((c:any)=>c.status==="Published"&&getV(c)>0).sort((a:any,b:any)=>getEng(b)-getEng(a)).slice(0,3);
      const badCont = base.filter((c:any)=>c.status==="Published"&&getV(c)>0).sort((a:any,b:any)=>getEng(a)-getEng(b)).slice(0,3);
      
      let bestDay = 0, bestHour = 0, maxEng = 0;
      heatmap.forEach((days, dIdx) => {
        days.forEach((engValue, hIdx) => {
          if(engValue > maxEng) { maxEng = engValue; bestDay = dIdx; bestHour = hIdx; }
        });
      });
      const bestTimeStr = maxEng > 0 ? `${DAYS_ID[bestDay]} pukul ${bestHour}:00` : "Belum cukup data";
      const picDataStr = picData.map((p:any)=>`${p.name} (${p.total})`).join(", ");

      const prompt = `Anda adalah ahli Social Media Analyst. Buatlah Executive Summary yang profesional dan actionable berdasarkan data kinerja konten berikut:

Data Kinerja:
- Filter Waktu: ${dateFilt}
- Filter Platform: ${platformFilter}
- Total Konten: ${total} (${pTotal||"N/A"})
- Kinerja: Views ${fmt(tV)} (${pV||"N/A"}), Reach ${fmt(tR)} (${pR||"N/A"}), Eng. ${fmt(tE)} (${pE||"N/A"})
- Engagement Rate (ER): ${er}% (vs Prev: ${prevER.toFixed(2)}%)
- Kinerja Iklan: Clicks ${fmt(tClicks)} (${pC||"N/A"}), Conv ${fmt(tConv)} (${pCv||"N/A"})
- Waktu Terbaik Upload: ${bestTimeStr} (Peak Eng: ${maxEng})

Konten Terbaik (Top 3):
${topCont.map((c:any,i:number)=>`${i+1}. "${c.title}" [Pilar: ${c.pillar}, Platform: ${c.platform}, Eng: ${getEng(c)}]`).join("\n")}

Konten Terburuk (Bottom 3):
${badCont.map((c:any,i:number)=>`${i+1}. "${c.title}" [Pilar: ${c.pillar}, Platform: ${c.platform}, Eng: ${getEng(c)}]`).join("\n")}

Instruksi Format Output:
Berikan respons dalam bahasa Indonesia yang terstruktur dengan 3 bagian berikut:
1. Ringkasan Insight: Analisis kinerja keseluruhan, tren pertumbuhan, dan insight dari waktu tayang/metrik utama.
2. Evaluasi Konten: Analisis pola dari konten yang berhasil (Winners) vs kurang berhasil (Losers), apa yang membedakannya (misalnya topik, pilar, atau platform).
3. Next Step Pengembangan Konten: Berikan 3-5 saran konkrit dan actionable untuk pembuatan konten berikutnya berdasarkan data di atas.`;

      const req = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: "gemini-2.5-flash" })
      });
      
      if (!req.ok) {
        const err = await req.json();
        throw new Error(err.error || "Gagal menghubungi server AI");
      }
      
      const data = await req.json();
      setAiInsight(data.text || "Tidak ada respon dari AI.");
    } catch(e:any) {
      console.error("AI Error:", e);
      const errMsg = e.message || "";
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
        setAiInsight("Gagal mendapatkan Executive Summary: Terlalu banyak permintaan AI secara bersamaan (Quota Exceeded). Silakan tunggu sekitar 30 detik lalu coba lagi.");
      } else {
        setAiInsight("Gagal mendapatkan Executive Summary: " + errMsg + ".\n\nPastikan VITE_GEMINI_API_KEY sudah diset di Settings > Secrets.");
      }
    }
    setAiLoading(false);
  };

  const CDataList = ({title, list, rank=1}:any) => (
    <div style={{...CARD({background: "white", padding: "20px", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)"})}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h4 style={{fontSize:16,fontWeight:800,margin:0, color:"#111827", letterSpacing: "-0.5px"}}>{title}</h4>
      </div>
      {list.length===0 && <p style={{fontSize:13,color:"rgba(0,0,0,0.5)", textAlign: "center", padding: "20px 0"}}>Data tidak tersedia untuk filter saat ini.</p>}
      <div style={{display: "flex", flexDirection: "column", gap: 10}}>
        {list.map((item:any,i:number)=>{
          const e=getEng(item),ps=gps(pillars,item.pillar);
          return (
            <motion.div whileHover={{ scale: 1.01 }} key={item.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px",background:i===0&&rank===1?"#FEFCE8":"#FAFAFA",border:i===0&&rank===1?"1px solid #FEF08A":"1px solid rgba(0,0,0,0.04)",borderRadius:12, transition: "all 0.2s"}}>
              {rank===1 && (
                <div style={{width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize:12,fontWeight:800,color:i===0?"#CA8A04":i===1?"#9CA3AF":"#D1D5DB", background: i===0?"#FEF08A":i===1?"#F3F4F6":"white", borderRadius: "50%", flexShrink:0, border: "2px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"}}>{i+1}</div>
              )}
              <div style={{width: 40, height: 40, borderRadius: 8, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)"}}>
                {item.referenceImage ? (
                  <img src={item.referenceImage} alt="thumb" style={{width: "100%", height: "100%", objectFit: "cover"}} />
                ) : item.linkSosmed ? (
                  <SocialThumbnail url={item.linkSosmed} fallback={<div style={{fontSize: 20}}>{item.platform?.toLowerCase()?.includes('instagram') ? '📸' : item.platform?.toLowerCase()?.includes('tiktok') ? '🎵' : '🔗'}</div>} />
                ) : (
                  <div style={{fontSize: 9, color: "rgba(0,0,0,0.4)", textAlign: "center", lineHeight: 1.1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontWeight: 600}}>NO<br/>IMG</div>
                )}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8, color: "#111827", marginBottom: 4}}>
                  <span onClick={()=>openEdit(item)} style={{cursor:"pointer", color:"inherit", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}} title="Buka Detail Brief">{item.title||"(Tanpa judul)"}</span>
                  {item.linkSosmed && <a href={item.linkSosmed} target="_blank" rel="noreferrer" style={{textDecoration:"none",fontSize:13}} title="Buka Postingan">🔗</a>}
                  {item.linkUpload && <a href={item.linkUpload} target="_blank" rel="noreferrer" style={{textDecoration:"none",fontSize:13}} title="Akses Upload/Aset">📤</a>}
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                  <PBadge name={item.platform} platforms={platforms}/>
                  <span style={{background:ps.light||"#F3F4F6",color:ps.color||"#111827",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:12}}>{item.pillar}</span>
                  {item.isAds&&<span style={{fontSize:10,color:"#EC4899",fontWeight:800, background:"#FDF2F8", padding:"2px 8px", borderRadius:12}}>💰 Ads</span>}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0, display:"flex", flexDirection:"column", justifyContent:"center"}}>
                <div style={{fontSize:18,fontWeight:800,color:"#111827", letterSpacing:"-0.5px"}}>{fmt(topSort==="engagement"?e:topSort==="reach"?getR(item):getV(item))}</div>
                <div style={{fontSize:10,fontWeight:600,color:"rgba(0,0,0,0.5)",textTransform:"uppercase", letterSpacing: 0.5}}>{topSort}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  );

  const MCard = ({label,val,sub,color="var(--theme-primary)", pctStr, icon: Icon, bg="glass"}: any) => {
    const isGlass = bg === "glass";
    const bgVal = isGlass ? "rgba(255,255,255,0.45)" : bg;
    return (
    <motion.div whileHover={{ y: -2 }} style={{...CARD({ flex:1, minWidth:0, display:"flex", flexDirection:"column", justifyContent:"space-between", height:"100%", padding:"16px", background: bgVal, backdropFilter: isGlass ? "blur(16px)" : "none", WebkitBackdropFilter: isGlass ? "blur(16px)" : "none", transform: "translateZ(0)", willChange: "transform", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.04)", overflow: "hidden", wordBreak: "break-word" })}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8, flexWrap: "wrap"}}>
        <div style={{display:"flex", alignItems:"center", gap: 6, minWidth: 0}}>
          {Icon && <div style={{background:`rgba(0,0,0,0.04)`, padding: 6, borderRadius: 8, flexShrink: 0}}><Icon size={14} color={color} /></div>}
          <div style={{fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color: !isGlass?"rgba(255,255,255,0.7)":"rgba(0,0,0,0.5)",lineHeight:1.4}}>{label}</div>
        </div>
        {pctStr && (
          <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0}}>
            <div style={{fontSize:10,fontWeight:700,color:pctStr.startsWith('+')?"#10B981":pctStr.startsWith('-')?"#EF4444":"rgba(0,0,0,0.4)",background:pctStr.startsWith('+')?"#D1FAE5":pctStr.startsWith('-')?"#FEE2E2":"#F3F4F6",padding:"4px 6px",borderRadius:8,whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:2}}>
              {pctStr.startsWith('+') ? <ArrowUpRight size={10}/> : pctStr.startsWith('-') ? <ArrowDownRight size={10}/> : null}
              {pctStr}
            </div>
            {getPeriodText() && <div style={{fontSize: 9, color: !isGlass?"rgba(255,255,255,0.4)":"rgba(0,0,0,0.4)", marginTop: 4, fontWeight: 600, whiteSpace:"nowrap"}}>{getPeriodText()}</div>}
          </div>
        )}
      </div>
      <div style={{minWidth: 0}}>
        <div style={{fontSize:24,fontWeight:800,color:!isGlass?"#fff":"#111827",lineHeight:1.1, letterSpacing: "-0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}} title={String(val)}>{val}</div>
        {sub&&<div style={{fontSize:11,color:!isGlass?"rgba(255,255,255,0.6)":"rgba(0,0,0,0.5)",marginTop:6,fontWeight:500, lineHeight: 1.4}}>{sub}</div>}
      </div>
    </motion.div>
  )};

  return (
    <div style={{padding:"0 24px 24px",display:"flex",flexDirection:"column",gap:20,width:"100%", background: "transparent", minHeight: "100vh", position: "relative"}}>
      <div ref={topAnchorRef} style={{position: "absolute", top: 0, left: 0, height: 1, width: "100%"}} />
      
      {/* Header */}
      <div style={{paddingTop: 24, paddingBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16}}>
         <div>
           <h1 style={{fontSize: 24, fontWeight: 800, margin: 0, color: "#111827", letterSpacing: "-0.5px", display:"flex", alignItems:"center", gap: 8}}>Analytics <Sparkles size={20} color="var(--theme-primary)" /></h1>
           <p style={{fontSize: 14, color: "rgba(0,0,0,0.5)", margin: "4px 0 0"} }>Pantau dan optimalkan performa konten secara menyeluruh.</p>
         </div>
         <button onClick={() => window.print()} className="hover-scale btn-hover" style={{...B(false), padding: "8px 16px", borderRadius: 16, height: 40, fontSize: 13, background: "rgba(255,255,255,0.6)", backdropFilter: "none", WebkitBackdropFilter: "none", color: "#111827", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 8}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Cetak Laporan PDF
         </button>
      </div>

      {/* Filters (Sticky) */}
      <div className="flex items-center justify-start gap-4 flex-wrap mb-2" style={{
        position: "sticky",
        top: 16,
        zIndex: 50,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        transform: "translateZ(0)",
        willChange: "transform",
        border: "1px solid rgba(255,255,255,0.8)",
        borderRadius: 20,
        padding: "12px 20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.04)"
      }}>
        <div className="flex gap-3 items-center">
          <PlatformFilterPopover 
            platformFilter={platformFilter} 
            setPlatformFilter={setPlatformFilter} 
            platforms={platforms} 
          />

          <div className="w-px h-6 bg-black/10 shrink-0"/>

          <div className="flex gap-1 bg-white p-1 rounded-xl border border-white/60 shadow-sm">
            {[["all","Semua Data"],["organic","Organic"],["ads","Ads Only"]].map(([k,l])=>(
              <button key={k} onClick={()=>setAdsFilter(k)} className={`text-sm font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors ${adsFilter===k ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:bg-white/40"}`}>{l}</button>
            ))}
          </div>

          <div className="w-px h-6 bg-black/10 shrink-0"/>

          <DateFilterPopover 
            dateFilt={dateFilt} setDateFilt={setDateFilt}
            customS={customS} setCustomS={setCustomS}
            customE={customE} setCustomE={setCustomE}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{display:"grid",gap:16,gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))"}}>
        <MCard label="Total Konten" val={total} sub={`Dipublikasikan: ${pub}`} color="#3B82F6" icon={PieChart} pctStr={calcPct(total, prevTotal)} bg="#111827" />
        <MCard label="Views (Impresi)" val={fmt(tV)} pctStr={calcPct(tV, prevTV)} color="#EAB308" icon={Activity}/>
        <MCard label="Reach" val={fmt(tR)} pctStr={calcPct(tR, prevTR)} color="#8B5CF6" icon={Users}/>
        <MCard label="Engagement" val={fmt(tE)} sub={`Tingkat Interaksi: ${er}% (vs ${(prevER).toFixed(2)}%)`} pctStr={calcPct(tE, prevTE)} color="#10B981" icon={Target}/>
        {(adsFilter==="all"||adsFilter==="ads") && <>
          <MCard label="Ad Clicks" val={fmt(tClicks)} color="#EC4899" icon={Zap} pctStr={calcPct(tClicks, prevTClicks)}/>
          <MCard label="Ad Conversions" val={fmt(tConv)} color="#EC4899" icon={Star} pctStr={calcPct(tConv, prevTConv)}/>
        </>}
      </div>

      {/* Restricted Overlay & Main Dashboard Content */}
      <div style={{position:"relative"}}>
        {isRestricted && (
          <div style={{position:"absolute",inset:0,zIndex:10,backdropFilter: "none",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255, 255, 255, 0.4)",borderRadius:20}}>
            <div style={{background:"rgba(255,255,255,0.65)",backdropFilter: "none",WebkitBackdropFilter: "none",transform:"translateZ(0)",willChange:"transform",padding:"24px 32px",borderRadius:24,boxShadow:"0 20px 60px rgba(0,0,0,0.08)",textAlign:"center",maxWidth:400,border:"1px solid rgba(255,255,255,0.7)"}}>
              <AlertCircle size={40} color="var(--theme-primary)" style={{margin: "0 auto 12px"}} />
              <h3 style={{fontSize:18,fontWeight:800,marginBottom:8,color:"#111827", letterSpacing: "-0.5px"}}>Akses Analitik Premium</h3>
              <p style={{fontSize:13,color:"rgba(0,0,0,0.6)",marginBottom:20, lineHeight:1.6}}>Upgrade ke paket Pro untuk membuka analisis prediktif, AI Insights mendalam, heatmap performa, dan integrasi multi-platform tak terbatas.</p>
              <button className="hover-scale" onClick={()=>window.location.hash="/billing"} style={{background:"var(--theme-primary)",color:"white",padding:"12px 24px",borderRadius:10,fontWeight:700,fontSize:14,border:"none",cursor:"pointer",width:"100%", boxShadow: "0 4px 14px rgba(59,130,246,0.4)"}}>Upgrade Sekarang</button>
            </div>
          </div>
        )}

        <div style={{display: "flex", flexDirection: "column", gap: 24, filter: isRestricted ? "blur(8px)" : "none", pointerEvents: isRestricted ? "none" : "auto", userSelect: isRestricted ? "none" : "auto"}}>
          
          {/* Executive Summary Block */}
          <div style={{...CARD({background: "#111827", color: "white", padding: "20px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column" })}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div style={{display:"flex", alignItems:"center", gap: 8}}>
                <div style={{background:"rgba(255,255,255,0.1)", padding: 6, borderRadius: 8}}><GeminiIcon size={16} /></div>
                <h4 style={{fontSize:16,fontWeight:800,margin:0,color:"white", letterSpacing: "-0.5px"}}>Executive Summary</h4>
              </div>
            </div>
            
            <ul style={{fontSize:13,lineHeight:1.6,margin:0,paddingLeft:16,marginBottom:20,color:"rgba(255,255,255,0.8)"}}>
              <li><strong style={{color:"white"}}>Total Konten:</strong> {total} (Dipublikasikan: {pub}) dalam periode terpilih.</li>
              <li><strong style={{color:"white"}}>Jangkauan & Impresi:</strong> Total views mencapai <strong style={{color:"#60A5FA"}}>{fmt(tV)}</strong> impresi dengan ukuran audiens (reach) sekitar <strong style={{color:"#60A5FA"}}>{fmt(tR)}</strong>.</li>
              <li><strong style={{color:"white"}}>Tingkat Interaksi:</strong> Menghasilkan <strong style={{color:"#34D399"}}>{fmt(tE)} engagement</strong> (ER: {er}%).</li>
              {adsFilter!=="organic" && tClicks>0 && <li><strong style={{color:"white"}}>Return Konversi Iklan:</strong> {fmt(tClicks)} clicks & {fmt(tConv)} conversions.</li>}
            </ul>

            <div style={{marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20}}>
              {aiInsight ? (
                <div style={{background:"rgba(255,255,255,0.04)",padding:16,borderRadius:12}}>
                  <div 
                    style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}
                    onClick={() => setShowAiInsight(!showAiInsight)}
                  >
                    <div style={{fontSize:13,fontWeight:700,color:"#93C5FD",display:"flex",alignItems:"center",gap:8}}>
                      ✨ Insight & Rekomendasi AI
                    </div>
                    <ChevronDown size={18} color="#93C5FD" style={{transform: showAiInsight ? "rotate(180deg)" : "none", transition: "all 0.3s"}} />
                  </div>
                  {showAiInsight && (
                    <div style={{fontSize:13,lineHeight:1.6,color:"rgba(255,255,255,0.8)",marginTop:16}} className="markdown-body dark">
                      <Markdown>{aiInsight}</Markdown>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={fetchAiInsight} disabled={aiLoading} className="hover-scale" style={{background:"white",color:"#111827",border:"none",padding:"12px 20px",borderRadius:12,fontWeight:700,fontSize:14,cursor:aiLoading?"wait":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap: 10, width: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                  <GeminiIcon size={18} />
                  {aiLoading ? <LoadingDots /> : "Generate AI Insights"}
                </button>
              )}
            </div>
          </div>

          {/* Distribution Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance by Platform */}
            <div style={{background: "rgba(255,255,255,0.45)", backdropFilter: "none", WebkitBackdropFilter: "none", transform: "translateZ(0)", willChange: "transform", padding: "20px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12, flexWrap: "wrap"}}>
                <div style={{display:"flex", alignItems:"center", gap: 8}}>
                  <div style={{background:"#FEF3C7", padding: 6, borderRadius: 8}}><PieChart size={16} color="#D97706" /></div>
                  <h4 style={{fontSize:15,fontWeight:800,margin:0, color:"#111827", letterSpacing: "-0.5px"}}>Distribusi Platform</h4>
                </div>
                <div style={{display:"flex", gap: 8, alignItems:"center", flexWrap: "wrap"}}>
                  <div style={{display:"flex", background:"#F3F4F6", borderRadius:8, padding:2}}>
                    <button onClick={()=>setPlatformChartType("doughnut")} style={{background:platformChartType==="doughnut"?"white":"transparent",border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:700,color:platformChartType==="doughnut"?"#111827":"rgba(0,0,0,0.5)",cursor:"pointer",boxShadow:platformChartType==="doughnut"?"0 2px 4px rgba(0,0,0,0.05)":"none"}}>Doughnut</button>
                    <button onClick={()=>setPlatformChartType("bar")} style={{background:platformChartType==="bar"?"white":"transparent",border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:700,color:platformChartType==="bar"?"#111827":"rgba(0,0,0,0.5)",cursor:"pointer",boxShadow:platformChartType==="bar"?"0 2px 4px rgba(0,0,0,0.05)":"none"}}>Bar</button>
                  </div>
                  <CustomDropdown 
                    value={platformMetric} 
                    onChange={setPlatformMetric} 
                    options={[
                      {id:"engagement", label:"Engagement"},
                      {id:"views", label:"Views"},
                      {id:"reach", label:"Reach"}
                    ]} 
                    style={{ width: 120 }} 
                  />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}}>
                {platformChartType === "doughnut" ? (
                  <RPieChart>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.03)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.08)",boxShadow:"0 10px 30px rgba(0,0,0,0.08)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any)=>[fmt(v)]}/>
                    <Legend content={<CustomLegend />} />
                    <Pie
                      data={platformData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={105}
                      paddingAngle={5}
                    >
                      {platformData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"][index % 4]} />)}
                    </Pie>
                  </RPieChart>
                ) : (
                  <BarChart data={platformData} margin={{top:10,right:0,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)"/>
                    <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.5)"}} tickLine={false} axisLine={false} dy={10}/>
                    <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.5)"}} tickLine={false} axisLine={false} tickFormatter={fmt} width={45}/>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.03)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.08)",boxShadow:"0 10px 30px rgba(0,0,0,0.08)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.5)",marginBottom:4}} formatter={(v:any)=>[fmt(v)]}/>
                    <Bar dataKey="value" radius={[6,6,0,0]} barSize={40}>
                      {platformData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"][index % 4]} />)}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {/* PIC Workload */}
            <div style={{background: "rgba(255,255,255,0.45)", backdropFilter: "none", WebkitBackdropFilter: "none", transform: "translateZ(0)", willChange: "transform", padding: "20px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column"}}>
              <div style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 20, justifyContent: "space-between", flexWrap: "wrap"}}>
                <div style={{display:"flex", alignItems:"center", gap: 8}}>
                  <div style={{background:"#E0E7FF", padding: 6, borderRadius: 8}}><Users size={16} color="#4F46E5" /></div>
                  <h4 style={{fontSize:15,fontWeight:800,margin:0, color:"#111827", letterSpacing: "-0.5px"}}>Distribusi Konten PIC</h4>
                </div>
                <div style={{display:"flex", background:"#F3F4F6", borderRadius:8, padding:2}}>
                  <button onClick={()=>setPicChartType("doughnut")} style={{background:picChartType==="doughnut"?"white":"transparent",border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:700,color:picChartType==="doughnut"?"#111827":"rgba(0,0,0,0.5)",cursor:"pointer",boxShadow:picChartType==="doughnut"?"0 2px 4px rgba(0,0,0,0.05)":"none"}}>Doughnut</button>
                  <button onClick={()=>setPicChartType("bar")} style={{background:picChartType==="bar"?"white":"transparent",border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,fontWeight:700,color:picChartType==="bar"?"#111827":"rgba(0,0,0,0.5)",cursor:"pointer",boxShadow:picChartType==="bar"?"0 2px 4px rgba(0,0,0,0.05)":"none"}}>Bar</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}}>
                {picChartType === "doughnut" ? (
                  <RPieChart>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.03)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.08)",boxShadow:"0 10px 30px rgba(0,0,0,0.08)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any)=>[fmt(v)]}/>
                    <Legend content={<CustomLegend />} />
                    <Pie
                      data={picData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={105}
                      paddingAngle={5}
                    >
                      {picData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#6366F1"][index % 6]} />)}
                    </Pie>
                  </RPieChart>
                ) : (
                  <BarChart data={picData} margin={{top:10,right:0,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)"/>
                    <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.5)"}} tickLine={false} axisLine={false} dy={10}/>
                    <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.5)"}} tickLine={false} axisLine={false} tickFormatter={fmt} width={45}/>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.03)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.08)",boxShadow:"0 10px 30px rgba(0,0,0,0.08)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.5)",marginBottom:4}} formatter={(v:any)=>[fmt(v)]}/>
                    <Bar dataKey="total" radius={[6,6,0,0]} barSize={40}>
                      {picData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#6366F1"][index % 6]} />)}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Performance by Pillar */}
            <div style={{background: "rgba(255,255,255,0.45)", backdropFilter: "none", WebkitBackdropFilter: "none", transform: "translateZ(0)", willChange: "transform", padding: "20px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12, flexWrap: "wrap"}}>
                <div style={{display:"flex", alignItems:"center", gap: 8}}>
                  <div style={{background:"#DCFCE7", padding: 6, borderRadius: 8}}><PieChart size={16} color="#16A34A" /></div>
                  <h4 style={{fontSize:15,fontWeight:800,margin:0, color:"#111827", letterSpacing: "-0.5px"}}>Distribusi Pilar Konten</h4>
                </div>
                <div style={{display:"flex", gap: 8, alignItems:"center", flexWrap: "wrap"}}>
                  <CustomDropdown 
                    value={pillarMetric} 
                    onChange={setPillarMetric} 
                    options={[
                      {id:"engagement", label:"Engagement"},
                      {id:"views", label:"Views"},
                      {id:"reach", label:"Reach"},
                      {id:"total", label:"Total Item"}
                    ]} 
                    style={{ width: 120 }} 
                  />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}}>
                  <RPieChart>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.03)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.08)",boxShadow:"0 10px 30px rgba(0,0,0,0.08)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any)=>[fmt(v)]}/>
                    <Legend content={<CustomLegend />} />
                    <Pie
                      data={pillarData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={105}
                      paddingAngle={5}
                    >
                      {pillarData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1"][index % 6]} />)}
                    </Pie>
                  </RPieChart>
              </ResponsiveContainer>
            </div>

            {/* Performance by Content Type */}
            <div style={{background: "rgba(255,255,255,0.45)", backdropFilter: "none", WebkitBackdropFilter: "none", transform: "translateZ(0)", willChange: "transform", padding: "20px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 12, flexWrap: "wrap"}}>
                <div style={{display:"flex", alignItems:"center", gap: 8}}>
                  <div style={{background:"#FCE7F3", padding: 6, borderRadius: 8}}><PieChart size={16} color="#DB2777" /></div>
                  <h4 style={{fontSize:15,fontWeight:800,margin:0, color:"#111827", letterSpacing: "-0.5px"}}>Tipe Konten</h4>
                </div>
                <div style={{display:"flex", gap: 8, alignItems:"center", flexWrap: "wrap"}}>
                  <CustomDropdown 
                    value={typeMetric} 
                    onChange={setTypeMetric} 
                    options={[
                      {id:"engagement", label:"Engagement"},
                      {id:"views", label:"Views"},
                      {id:"reach", label:"Reach"},
                      {id:"total", label:"Total Item"}
                    ]} 
                    style={{ width: 120 }} 
                  />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}}>
                  <BarChart data={typeData} margin={{top:10,right:0,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)"/>
                    <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.5)"}} tickLine={false} axisLine={false} dy={10}/>
                    <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.5)"}} tickLine={false} axisLine={false} tickFormatter={fmt} width={45}/>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.03)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.08)",boxShadow:"0 10px 30px rgba(0,0,0,0.08)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.5)",marginBottom:4}} formatter={(v:any)=>[fmt(v)]}/>
                    <Bar dataKey="value" radius={[6,6,0,0]} barSize={40}>
                      {typeData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#DB2777", "#EC4899", "#F472B6", "#FBCFE8"][index % 4]} />)}
                    </Bar>
                  </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Trends Charts List */}
          <div style={{background: "rgba(255,255,255,0.45)", backdropFilter: "none", WebkitBackdropFilter: "none", transform: "translateZ(0)", willChange: "transform", padding: "20px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div style={{display:"flex", alignItems:"center", gap: 8}}>
                <div style={{background:"#F3F4F6", padding: 6, borderRadius: 8}}><TrendingUp size={16} color="#111827" /></div>
                <h4 style={{fontSize:16,fontWeight:800,margin:0,color:"#111827", letterSpacing: "-0.5px"}}>Tren Pertumbuhan</h4>
              </div>
            </div>
            <div style={{display:"grid", gap:20, gridTemplateColumns:"repeat(auto-fit, minmax(360px, 1fr))"}}>
              {["views","reach","likes","comments","shares","saves","clicks"].map(k=>(
                <div key={k} style={{background: "#F9FAFB", padding: "20px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.04)"}}>
                  <div style={{fontSize: 14, fontWeight: 800, textTransform: "capitalize", color: "#111827", marginBottom: 16, display: "flex", alignItems: "center", gap: 8}}>
                     <div style={{width: 10, height: 10, borderRadius: "50%", background: MC[k] || "#3B82F6"}} />
                     {k}
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    {adsFilter==="all" ? (
                       <BarChart data={lineData} margin={{top:0,right:10,left:0,bottom:0}}>
                         <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} dy={10}/>
                         <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} tickFormatter={fmt} width={55}/>
                         <Tooltip cursor={{fill:"rgba(0,0,0,0.04)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.05)",boxShadow:"0 4px 12px rgba(0,0,0,0.05)"}} labelStyle={{marginBottom:6,color:"rgba(0,0,0,0.5)"}} />
                         <Bar dataKey={`${k}_org`} stackId={k} name={`Org`} fill={MC[k]||"#3B82F6"} radius={[0,0,4,4]} barSize={16}/>
                         <Bar dataKey={`${k}_ads`} stackId={k} name={`Ads`} fill={(MC[k]||"#3B82F6")+"66"} radius={[4,4,0,0]} barSize={16}/>
                       </BarChart>
                    ) : (
                      <LineChart data={lineData} margin={{top:5,right:10,left:0,bottom:0}}>
                        <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} dy={10}/>
                        <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} tickFormatter={fmt} width={55}/>
                        <Tooltip contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.05)",boxShadow:"0 4px 12px rgba(0,0,0,0.05)"}} labelStyle={{marginBottom:6,color:"rgba(0,0,0,0.5)"}} />
                        <Line type="monotone" dataKey={k} stroke={MC[k]||"#3B82F6"} strokeWidth={3} dot={{r:0}} activeDot={{r:5, strokeWidth:0}} name={k} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
          
          {/* Heatmap (Full Width) */}
          <div style={{background: "rgba(255,255,255,0.45)", backdropFilter: "none", WebkitBackdropFilter: "none", transform: "translateZ(0)", willChange: "transform", padding: "20px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)", width: "100%", overflow: "hidden"}}>
            <div style={{width: "100%"}}>
              <div style={{display:"flex", alignItems:"center", gap: 10, marginBottom: 20, justifyContent: "space-between", flexWrap: "wrap"}}>
                <div style={{display:"flex", alignItems:"center", gap: 8}}>
                  <div style={{background:"#FEE2E2", padding: 6, borderRadius: 8}}><Clock size={16} color="#DC2626" /></div>
                  <h4 style={{fontSize:15,fontWeight:800,margin:0, color:"#111827", letterSpacing: "-0.5px"}}>Heatmap Aktivitas (Best Time)</h4>
                </div>
                <CustomDropdown 
                  value={heatmapMetric} 
                  onChange={setHeatmapMetric} 
                  options={[
                    {id:"engagement", label:"Engagement"},
                    {id:"reach", label:"Awareness (Reach)"},
                    {id:"views", label:"Awareness (Views)"}
                  ]} 
                  style={{ width: 170 }} 
                />
              </div>
              <div style={{display:"flex",gap:"1%",marginBottom:8}}>
                <div style={{width:24}}/>
                {Array.from({length:24}).map((_,i)=><div key={`h${i}`} style={{flex:1,textAlign:"center",fontSize:9,color:"rgba(0,0,0,0.5)", fontWeight:700}}>{i}</div>)}
              </div>
              {heatmap.map((row,di) => {
                const rowMax = Math.max(...row, 1);
                return (
                  <div key={di} style={{display:"flex",gap:"1%",marginBottom:4,alignItems:"center"}}>
                    <div style={{width:24,fontSize:10,fontWeight:700, color:"#111827"}}>{DAYS_S[di]}</div>
                    {row.map((val,hi) => (
                      <div key={hi} title={`${DAYS_ID[di]} Jam ${hi} - ${fmt(val)} ${heatmapMetric==="engagement"?"Eng":heatmapMetric==="reach"?"Reach":"Views"}`} style={{flex:1,height:28,borderRadius:4,background:val===0?'#F3F4F6':(heatmapMetric==="engagement"?`#3B82F6`:`#8B5CF6`) , opacity: val===0 ? 1 : Math.max(0.15, val/rowMax), transition: "all 0.2s"}}/>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{display:"flex",gap:16,alignItems:"center",background: "rgba(255,255,255,0.45)", backdropFilter: "none", WebkitBackdropFilter: "none", transform: "translateZ(0)", willChange: "transform", padding:"16px 20px", borderRadius:24, border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.04)",flexWrap:"wrap", marginTop: 8}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:"rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: 0.5}}>Urutkan:</div>
              <div style={{display:"flex", gap: 4, background:"#F3F4F6", padding:4, borderRadius:8}}>
                {[["engagement","Interaksi"],["reach","Jangkauan"],["views","Tayangan"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setTopSort(k)} style={{background:topSort===k?"white":"transparent", color:topSort===k?"#111827":"rgba(0,0,0,0.6)", padding:"6px 14px", borderRadius:6, border:"none", fontWeight: 600, fontSize:13, cursor:"pointer", transition:"all 0.2s", boxShadow:topSort===k?"0 2px 6px rgba(0,0,0,0.05)":"none"}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{width:1,height:28,background:"rgba(0,0,0,0.1)"}}/>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:"rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: 0.5}}>Platform:</div>
              <CustomDropdown 
                value={topPlatform} 
                onChange={setTopPlatform} 
                options={[
                  {id:"All", label:"Semua Platform"},
                  ...platforms.map((p:any)=>({id:p.name, label:p.name}))
                ]} 
                style={{ width: 180 }} 
              />
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:24}}>
            <div>
              <CDataList 
                title={`🏆 Top 10 Konten Terbaik${topPlatform!=="All"?" ("+topPlatform+")":""}`} 
                list={base.filter((c:any)=>c.status==="Published" && getV(c)>0 && (topPlatform==="All" || (c.platform && c.platform.includes(topPlatform)))).sort((a:any,b:any)=>{
                  if(topSort==="engagement") return getEng(b)-getEng(a);
                  if(topSort==="reach") return getR(b)-getR(a);
                  return getV(b)-getV(a);
                }).slice(0,10)}
                rank={1}
              />
            </div>
            <div>
              <CDataList 
                title={`⚠️ 10 Konten Terendah${topPlatform!=="All"?" ("+topPlatform+")":""}`}
                list={base.filter((c:any)=>c.status==="Published" && getV(c)>0 && (topPlatform==="All" || (c.platform && c.platform.includes(topPlatform))))
                  .sort((a:any,b:any)=>{
                  if(topSort==="engagement") return getEng(a)-getEng(b);
                  if(topSort==="reach") return getR(a)-getR(b);
                  return getV(a)-getV(b);
                }).slice(0,10)}
                rank={-1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

