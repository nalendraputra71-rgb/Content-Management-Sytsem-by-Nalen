import { useState, useMemo, useRef, useEffect } from "react";
import { auth, callAiWithQuota } from "./firebase";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell, PieChart as RPieChart, Pie } from "recharts";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, TrendingUp, Sparkles, PieChart, Users, BarChart2, Activity, Calendar, Zap, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, Target, Star, Settings, Check, RotateCcw, SlidersHorizontal } from "lucide-react";

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
               <span className="text-sm font-semibold text-gray-700">Semua Platform</span>
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

const METRICS_META: Record<string, { label: string; desc: string; category: "organic" | "ads"; color: string }> = {
  // Organic/General
  views: { label: "Views (Tayangan)", desc: "Total tayangan konten di feed / timeline", category: "organic", color: "#2C2016" },
  reach: { label: "Reach (Jangkauan)", desc: "Jumlah akun unik yang melihat konten", category: "organic", color: "#3B82F6" },
  likes: { label: "Likes (Suka)", desc: "Jumlah interaksi suka pada konten", category: "organic", color: "#9C2B4E" },
  comments: { label: "Comments (Komentar)", desc: "Jumlah komentar di postingan", category: "organic", color: "#2B4C7E" },
  reposts: { label: "Reposts (Bagikan Ulang)", desc: "Jumlah postingan dibagikan ulang / retweet", category: "organic", color: "#A67C1C" },
  shares: { label: "Shares (Share Link)", desc: "Jumlah share link ke platform lain", category: "organic", color: "#2D7A5E" },
  saves: { label: "Saves (Simpan)", desc: "Jumlah user yang menyimpan konten", category: "organic", color: "#723680" },
  profileVisits: { label: "Profile Visits", desc: "Kunjungan ke halaman profil Anda", category: "organic", color: "#059669" },
  bioLinkTaps: { label: "Bio Link Taps", desc: "Ketukan pada link website di bio", category: "organic", color: "#2563EB" },
  follows: { label: "Follows", desc: "Jumlah pengikut baru dari konten ini", category: "organic", color: "#D97706" },

  // Ads Specific
  clicks: { label: "Clicks (Klik Iklan)", desc: "Total klik pada link/tombol iklan", category: "ads", color: "#3B82F6" },
  conversions: { label: "Conversions (Konversi)", desc: "Tindakan berharga seperti pembelian/registrasi", category: "ads", color: "#10B981" },
  msgConvStarted: { label: "Messages Started", desc: "Jumlah percakapan pesan baru yang dimulai", category: "ads", color: "#8B5CF6" },
  threeSecPlays: { label: "3-Sec Video Plays", desc: "Pemutaran video minimal selama 3 detik", category: "ads", color: "#F59E0B" },
  spendBudget: { label: "Spend Budget", desc: "Total anggaran iklan yang telah dibelanjakan", category: "ads", color: "#EF4444" },
  dailyBudget: { label: "Daily Budget", desc: "Anggaran harian yang disiapkan", category: "ads", color: "#F97316" },
  duration: { label: "Duration (Days)", desc: "Lama penayangan kampanye iklan", category: "ads", color: "#6366F1" },
  cprProfileVisit: { label: "CPR Profile Visit", desc: "Biaya per Kunjungan Profil (Cost Per Result)", category: "ads", color: "#EC4899" },
};

export function AnalyticsView({content,pillars,platforms,contentTypes,pics,statuses,openEdit,isRestricted}: any) {
  const [dateFilt,setDateFilt] = useState("28d"); 
  const [customS,setCustomS] = useState("");
  const [customE,setCustomE] = useState("");
  const [adsFilter,setAdsFilter] = useState("organic"); 
  const [platformFilter, setPlatformFilter] = useState("all");
  const [activeMetrics,setActiveMetrics] = useState(["views", "reach", "likes", "comments"]);
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

  const [isMetricSettingOpen, setIsMetricSettingOpen] = useState(false);
  const [tempSelectedMetrics, setTempSelectedMetrics] = useState<string[]>(["views", "reach", "likes", "comments"]);
  const metricSettingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (metricSettingRef.current && !metricSettingRef.current.contains(event.target as Node)) {
        setIsMetricSettingOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openMetricSetting = () => {
    setTempSelectedMetrics([...activeMetrics]);
    setIsMetricSettingOpen(true);
  };

  const toggleTempMetric = (k: string) => {
    setTempSelectedMetrics(prev =>
      prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
    );
  };

  const applyMetrics = () => {
    setActiveMetrics([...tempSelectedMetrics]);
    setIsMetricSettingOpen(false);
  };

  const resetToDefaultMetrics = () => {
    setTempSelectedMetrics(["views", "reach", "likes", "comments"]);
  };

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
      Object.keys(METRICS_META).forEach(k => {
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

      const data = await callAiWithQuota(auth.currentUser?.uid || 'anon', undefined, { prompt, model: "gemini-2.0-flash" });
      setAiInsight(data.text || "Tidak ada respon dari AI.");
    } catch(e:any) {
      console.error("AI Error:", e);
      const errMsg = e.message || "";
      if (errMsg.includes("habis")) {
        setAiInsight(errMsg);
      } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
        setAiInsight("Gagal mendapatkan Executive Summary: Terlalu banyak permintaan AI secara bersamaan (Quota Exceeded). Silakan tunggu sekitar 30 detik lalu coba lagi.");
      } else {
        setAiInsight("Gagal mendapatkan Executive Summary: " + errMsg + ".\n\nPastikan VITE_GEMINI_API_KEY sudah diset di Settings > Secrets.");
      }
    }
    setAiLoading(false);
  };

  const CDataList = ({title, list, rank=1}:any) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-base font-bold text-gray-900 m-0 tracking-tight">{title}</h4>
      </div>
      {list.length===0 && <p className="text-sm text-gray-500 text-center py-5">Data tidak tersedia untuk filter saat ini.</p>}
      <div className="flex flex-col gap-2.5">
        {list.map((item:any,i:number)=>{
          const e=getEng(item),ps=gps(pillars,item.pillar);
          return (
            <motion.div whileHover={{ scale: 1.01 }} key={item.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${i===0&&rank===1 ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-black/5"}`}>
              {rank===1 && (
                <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-full shrink-0 border-2 border-white shadow-sm ${i===0?"text-amber-600 bg-amber-200":i===1?"text-gray-400 bg-gray-100":"text-gray-300 bg-white"}`}>{i+1}</div>
              )}
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-black/10">
                {item.referenceImage ? (
                  <img src={item.referenceImage} alt="thumb" className="w-full h-full object-cover" />
                ) : item.linkSosmed ? (
                  <SocialThumbnail url={item.linkSosmed} fallback={<div className="text-xl">{item.platform?.toLowerCase()?.includes('instagram') ? '📸' : item.platform?.toLowerCase()?.includes('tiktok') ? '🎵' : '🔗'}</div>} />
                ) : (
                  <div className="text-[9px] text-gray-400 text-center leading-tight flex items-center justify-center h-full font-semibold">NO<br/>IMG</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold flex items-center gap-2 text-gray-900 mb-1">
                  <span onClick={()=>openEdit(item)} className="cursor-pointer truncate" title="Buka Detail Brief">{item.title||"(Tanpa judul)"}</span>
                  {item.linkSosmed && <a href={item.linkSosmed} target="_blank" rel="noreferrer" className="no-underline text-sm" title="Buka Postingan">🔗</a>}
                  {item.linkUpload && <a href={item.linkUpload} target="_blank" rel="noreferrer" className="no-underline text-sm" title="Akses Upload/Aset">📤</a>}
                </div>
                <div className="flex gap-1.5 flex-wrap items-center">
                  <PBadge name={item.platform} platforms={platforms}/>
                  <span style={{background:ps.light||"#F3F4F6",color:ps.color||"#111827"}} className="text-[10px] font-semibold px-2 py-0.5 rounded-full">{item.pillar}</span>
                  {item.isAds&&<span className="text-[10px] text-pink-500 font-bold bg-pink-50 px-2 py-0.5 rounded-full">💰 Ads</span>}
                </div>
              </div>
              <div className="text-right shrink-0 flex flex-col justify-center">
                <div className="text-lg font-bold text-gray-900 tracking-tight">{fmt(topSort==="engagement"?e:topSort==="reach"?getR(item):getV(item))}</div>
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{topSort}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  );

  const MCard = ({label,val,sub, colorTheme="glass", pctStr, icon: Icon}: any) => {
    const isGlass = colorTheme === "glass";
    
    // Light-mode modern SaaS themed cards with soft tints, clean borders and high contrast text
    const themeStyles: Record<string, {bg: string, border: string, text: string, subText: string, iconBg: string, iconColor: string}> = {
      glass: { bg: "bg-white", border: "border-black/[0.03]", text: "text-gray-900", subText: "text-gray-500", iconBg: "bg-gray-100", iconColor: "text-gray-700" },
      blue: { bg: "bg-blue-50/40", border: "border-blue-100", text: "text-gray-900", subText: "text-blue-600 font-semibold", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
      amber: { bg: "bg-amber-50/40", border: "border-amber-100", text: "text-gray-900", subText: "text-amber-700 font-semibold", iconBg: "bg-amber-100", iconColor: "text-amber-700" },
      purple: { bg: "bg-purple-50/40", border: "border-purple-100", text: "text-gray-900", subText: "text-purple-600 font-semibold", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
      emerald: { bg: "bg-emerald-50/40", border: "border-emerald-100", text: "text-gray-900", subText: "text-emerald-700 font-semibold", iconBg: "bg-emerald-100", iconColor: "text-emerald-700" },
      rose: { bg: "bg-rose-50/40", border: "border-rose-100", text: "text-gray-900", subText: "text-rose-600 font-semibold", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
      cyan: { bg: "bg-cyan-50/40", border: "border-cyan-100", text: "text-gray-900", subText: "text-cyan-700 font-semibold", iconBg: "bg-cyan-100", iconColor: "text-cyan-700" }
    };
    
    const theme = themeStyles[colorTheme] || themeStyles.glass;
    
    return (
    <motion.div whileHover={{ y: -2 }} className={`flex-1 min-w-0 flex flex-col justify-between h-full p-5 rounded-2xl border ${theme.border} shadow-sm overflow-hidden break-words transition-shadow hover:shadow-md ${theme.bg}`}>
      <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <div className={`${theme.iconBg} p-1.5 rounded-lg shrink-0`}><Icon size={16} className={theme.iconColor} /></div>}
          <div className={`text-[11px] font-bold tracking-wide uppercase leading-snug ${theme.subText}`}>{label}</div>
        </div>
        {pctStr && (
          <div className="flex flex-col items-end shrink-0">
            <div className={`text-[10px] font-bold px-1.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-0.5 ${pctStr.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : pctStr.startsWith('-') ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-100'}`}>
              {pctStr.startsWith('+') ? <ArrowUpRight size={10}/> : pctStr.startsWith('-') ? <ArrowDownRight size={10}/> : null}
              {pctStr}
            </div>
            {getPeriodText() && <div className="text-[9px] mt-1 font-semibold whitespace-nowrap text-gray-400">{getPeriodText()}</div>}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-extrabold leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis ${theme.text}`} title={String(val)}>{val}</div>
        {sub && <div className="text-[11px] mt-1.5 font-medium leading-snug text-gray-500">{sub}</div>}
      </div>
    </motion.div>
  )};

  return (
    <div className="px-6 pb-6 flex flex-col gap-5 w-full bg-[#FAFAFA] min-h-screen relative font-sans">
      <div ref={topAnchorRef} className="absolute top-0 left-0 h-[1px] w-full" />
      
      {/* Header */}
      <div className="pt-6 pb-2 flex justify-between items-end flex-wrap gap-4">
         <div>
           <h1 className="text-2xl font-extrabold m-0 text-gray-900 tracking-tight flex items-center gap-2">
             Analytics <Sparkles size={20} className="text-blue-600" />
           </h1>
           <p className="text-sm text-gray-500 mt-1">Pantau dan optimalkan performa konten secara menyeluruh dengan data real-time.</p>
         </div>
         <button onClick={() => window.print()} className="hover-scale btn-hover px-4 py-2 rounded-xl h-10 text-[13px] font-bold bg-white border border-black/[0.04] text-gray-900 shadow-sm flex items-center gap-2 cursor-pointer transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Cetak Laporan PDF
         </button>
      </div>

      {/* Filters (Sticky) */}
      <div className="sticky top-4 z-50 flex items-center justify-start gap-4 flex-wrap mb-2 bg-white/90 backdrop-blur-md border border-black/[0.03] rounded-full pl-8 pr-6 py-3.5 shadow-sm">
        <div className="flex gap-4 items-center flex-wrap">
          <PlatformFilterPopover 
            platformFilter={platformFilter} 
            setPlatformFilter={setPlatformFilter} 
            platforms={platforms} 
          />

          <div className="w-px h-6 bg-black/[0.06] shrink-0"/>

          <div className="flex gap-0.5 bg-black/[0.03] p-1 rounded-full border border-black/[0.01]">
            {[["all","Semua Data"],["organic","Organic"],["ads","Ads Only"]].map(([k,l])=>(
              <button key={k} onClick={()=>setAdsFilter(k)} className={`text-xs font-bold px-4 py-1.5 rounded-full border-none cursor-pointer transition-colors ${adsFilter===k ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>{l}</button>
            ))}
          </div>

          <div className="w-px h-6 bg-black/[0.06] shrink-0"/>

          <DateFilterPopover 
            dateFilt={dateFilt} setDateFilt={setDateFilt}
            customS={customS} setCustomS={setCustomS}
            customE={customE} setCustomE={setCustomE}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-wrap gap-4 w-[calc(100%+48px)] -mx-6 px-6">
        <div className="flex-1 min-w-[200px]"><MCard label="Total Konten" val={total} sub={`Dipublikasikan: ${pub}`} colorTheme="blue" icon={PieChart} pctStr={calcPct(total, prevTotal)} /></div>
        <div className="flex-1 min-w-[200px]"><MCard label="Views (Impresi)" val={fmt(tV)} pctStr={calcPct(tV, prevTV)} colorTheme="amber" icon={Activity}/></div>
        <div className="flex-1 min-w-[200px]"><MCard label="Reach" val={fmt(tR)} pctStr={calcPct(tR, prevTR)} colorTheme="purple" icon={Users}/></div>
        <div className="flex-1 min-w-[200px]"><MCard label="Engagement" val={fmt(tE)} sub={`Tingkat Interaksi: ${er}% (vs ${(prevER).toFixed(2)}%)`} pctStr={calcPct(tE, prevTE)} colorTheme="emerald" icon={Target}/></div>
        {(adsFilter==="all"||adsFilter==="ads") && <>
          <div className="flex-1 min-w-[200px]"><MCard label="Ad Clicks" val={fmt(tClicks)} colorTheme="rose" icon={Zap} pctStr={calcPct(tClicks, prevTClicks)}/></div>
          <div className="flex-1 min-w-[200px]"><MCard label="Ad Conversions" val={fmt(tConv)} colorTheme="cyan" icon={Star} pctStr={calcPct(tConv, prevTConv)}/></div>
        </>}
      </div>

      {/* Restricted Overlay & Main Dashboard Content */}
      <div className="relative">
        {isRestricted && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 rounded-[20px]">
            <div className="bg-white/80 p-6 md:p-8 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] text-center max-w-[400px] border border-white/70">
              <AlertCircle size={40} className="text-blue-500 mx-auto mb-3" />
              <h3 className="text-[18px] font-bold mb-2 text-gray-900 tracking-tight">Akses Analitik Premium</h3>
              <p className="text-[13px] text-gray-600 mb-5 leading-relaxed">Upgrade ke paket Pro untuk membuka analisis prediktif, AI Insights mendalam, heatmap performa, dan integrasi multi-platform tak terbatas.</p>
              <button className="hover-scale w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold text-[14px] border-none cursor-pointer shadow-[0_4px_14px_rgba(59,130,246,0.4)]" onClick={()=>window.location.hash="/billing"}>Upgrade Sekarang</button>
            </div>
          </div>
        )}

        <div className={`flex flex-col gap-6 ${isRestricted ? "blur-[8px] pointer-events-none select-none" : ""}`}>
          
          {/* Executive Summary Block */}
          <div className="bg-white rounded-2xl border border-black/[0.03] p-6 flex flex-col shadow-sm transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><GeminiIcon size={16} /></div>
                <h4 className="text-[15px] font-extrabold m-0 text-gray-900 tracking-tight">Ringkasan Eksekutif & Insight AI</h4>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 border-b border-black/[0.03] pb-4">
              <div className="bg-black/[0.01] p-3.5 rounded-xl border border-black/[0.02]">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Konten</div>
                <div className="text-lg font-extrabold text-gray-900">{total} <span className="text-xs font-normal text-gray-500">({pub} Published)</span></div>
              </div>
              <div className="bg-black/[0.01] p-3.5 rounded-xl border border-black/[0.02]">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Views & Impresi</div>
                <div className="text-lg font-extrabold text-gray-900 text-blue-600">{fmt(tV)} <span className="text-xs font-normal text-gray-500">Views</span></div>
              </div>
              <div className="bg-black/[0.01] p-3.5 rounded-xl border border-black/[0.02]">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Reach</div>
                <div className="text-lg font-extrabold text-gray-900 text-purple-600">{fmt(tR)} <span className="text-xs font-normal text-gray-500">Reach</span></div>
              </div>
              <div className="bg-black/[0.01] p-3.5 rounded-xl border border-black/[0.02]">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Engagement</div>
                <div className="text-lg font-extrabold text-emerald-600">{fmt(tE)} <span className="text-xs font-normal text-gray-500">(ER: {er}%)</span></div>
              </div>
            </div>

            <div className="mt-2">
              {aiInsight ? (
                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                  <div 
                    className="flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setShowAiInsight(!showAiInsight)}
                  >
                    <div className="text-xs font-bold text-blue-700 flex items-center gap-2">
                      ✨ Insight & Rekomendasi Pintar AI
                    </div>
                    <ChevronDown size={16} className="text-blue-700 transition-transform duration-300" style={{transform: showAiInsight ? "rotate(180deg)" : "none"}} />
                  </div>
                  {showAiInsight && (
                    <div className="text-[13px] leading-relaxed text-gray-700 mt-3 markdown-body">
                      <Markdown>{aiInsight}</Markdown>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={fetchAiInsight} disabled={aiLoading} className="hover-scale w-full bg-gray-900 hover:bg-black text-white border-none py-3 px-5 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:cursor-wait transition-colors">
                  <GeminiIcon size={14} />
                  {aiLoading ? <LoadingDots /> : "Generate AI Insights & Rekomendasi"}
                </button>
              )}
            </div>
          </div>

          {/* Distribution Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ minWidth: 0 }}>
            {/* Performance by Platform */}
            <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-5 flex flex-col min-w-0 transition-shadow hover:shadow-md">
              <div className="flex justify-between items-start mb-5 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><PieChart size={18} /></div>
                  <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">Distribusi Platform</h4>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="flex bg-black/[0.03] rounded-lg p-0.5 border border-black/[0.01]">
                    <button onClick={()=>setPlatformChartType("doughnut")} className={`border-none rounded-md px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-all ${platformChartType==="doughnut" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>Doughnut</button>
                    <button onClick={()=>setPlatformChartType("bar")} className={`border-none rounded-md px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-all ${platformChartType==="bar" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>Bar</button>
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
              <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}} debounce={300}>
                {platformChartType === "doughnut" ? (
                  <RPieChart>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any)=>[fmt(v)]}/>
                    <Legend content={<CustomLegend />} />
                    <Pie
                      data={platformData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                    >
                      {platformData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"][index % 4]} />)}
                    </Pie>
                  </RPieChart>
                ) : (
                  <BarChart data={platformData} margin={{top:10,right:0,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)"/>
                    <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} dy={10}/>
                    <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} tickFormatter={fmt} width={45}/>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.4)",marginBottom:4}} formatter={(v:any)=>[fmt(v)]}/>
                    <Bar dataKey="value" radius={[6,6,0,0]} barSize={36}>
                      {platformData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"][index % 4]} />)}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            
            {/* PIC Workload */}
            <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-5 flex flex-col min-w-0 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-2.5 mb-5 justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Users size={18} /></div>
                  <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">Distribusi Konten PIC</h4>
                </div>
                <div className="flex bg-black/[0.03] rounded-lg p-0.5 border border-black/[0.01]">
                  <button onClick={()=>setPicChartType("doughnut")} className={`border-none rounded-md px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-all ${picChartType==="doughnut" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>Doughnut</button>
                  <button onClick={()=>setPicChartType("bar")} className={`border-none rounded-md px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-all ${picChartType==="bar" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>Bar</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}} debounce={300}>
                {picChartType === "doughnut" ? (
                  <RPieChart>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any)=>[fmt(v)]}/>
                    <Legend content={<CustomLegend />} />
                    <Pie
                      data={picData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                    >
                      {picData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#6366F1"][index % 6]} />)}
                    </Pie>
                  </RPieChart>
                ) : (
                  <BarChart data={picData} margin={{top:10,right:0,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)"/>
                    <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} dy={10}/>
                    <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} tickFormatter={fmt} width={45}/>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.4)",marginBottom:4}} formatter={(v:any)=>[fmt(v)]}/>
                    <Bar dataKey="total" radius={[6,6,0,0]} barSize={36}>
                      {picData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#6366F1"][index % 6]} />)}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Performance by Pillar */}
            <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-5 flex flex-col min-w-0 transition-shadow hover:shadow-md">
              <div className="flex justify-between items-start mb-5 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><PieChart size={18} /></div>
                  <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">Distribusi Pilar Konten</h4>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
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
              <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}} debounce={300}>
                  <RPieChart>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any)=>[fmt(v)]}/>
                    <Legend content={<CustomLegend />} />
                    <Pie
                      data={pillarData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                    >
                      {pillarData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1"][index % 6]} />)}
                    </Pie>
                  </RPieChart>
              </ResponsiveContainer>
            </div>

            {/* Performance by Content Type */}
            <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-5 flex flex-col min-w-0 transition-shadow hover:shadow-md">
              <div className="flex justify-between items-start mb-5 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-50 p-2 rounded-lg text-pink-600"><PieChart size={18} /></div>
                  <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">Tipe Konten</h4>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
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
              <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}} debounce={300}>
                  <BarChart data={typeData} margin={{top:10,right:0,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)"/>
                    <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} dy={10}/>
                    <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} tickFormatter={fmt} width={45}/>
                    <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.4)",marginBottom:4}} formatter={(v:any)=>[fmt(v)]}/>
                    <Bar dataKey="value" radius={[6,6,0,0]} barSize={36}>
                      {typeData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#DB2777", "#EC4899", "#F472B6", "#FBCFE8"][index % 4]} />)}
                    </Bar>
                  </BarChart>
              </ResponsiveContainer>
            </div>
          </div>          {/* Trends Charts List */}
          <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-6 flex flex-col min-w-0 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><TrendingUp size={18} /></div>
                <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">Tren Pertumbuhan</h4>
              </div>

              {/* Metric Selection Popover */}
              <div className="relative" ref={metricSettingRef}>
                <button 
                  onClick={openMetricSetting} 
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-black/10 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-colors text-xs font-bold text-gray-800"
                >
                  <SlidersHorizontal size={14} className="text-gray-500" />
                  <span>Pilih Metrik</span>
                  <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold">
                    {activeMetrics.length}
                  </span>
                </button>

                <AnimatePresence>
                  {isMetricSettingOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 5 }} 
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-[100] w-[340px] md:w-[480px] overflow-hidden flex flex-col text-left"
                    >
                      {/* Header */}
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                          <h5 className="font-extrabold text-gray-900 text-sm tracking-tight">Tampilan Metrik</h5>
                          <p className="text-[10px] text-gray-400 font-medium">Pilih metrik yang ingin ditampilkan pada grafik</p>
                        </div>
                        <button 
                          onClick={resetToDefaultMetrics} 
                          className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                          title="Reset ke default (engagement dasar)"
                        >
                          <RotateCcw size={12} />
                          <span>Reset Default</span>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4 max-h-[380px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Organic Category */}
                        <div>
                          <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Metrik Organik
                          </div>
                          <div className="space-y-1">
                            {Object.entries(METRICS_META)
                              .filter(([_, meta]) => meta.category === "organic")
                              .map(([key, meta]) => {
                                const isChecked = tempSelectedMetrics.includes(key);
                                return (
                                  <label 
                                    key={key} 
                                    className={`flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/[0.02] cursor-pointer transition-colors ${isChecked ? 'bg-black/[0.01]' : ''}`}
                                  >
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked} 
                                      onChange={() => toggleTempMetric(key)} 
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                                    />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                                        <span className="text-xs font-bold text-gray-800">{meta.label.split(" (")[0]}</span>
                                      </div>
                                      <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{meta.desc}</p>
                                    </div>
                                  </label>
                                );
                              })}
                          </div>
                        </div>

                        {/* Ads Category */}
                        <div>
                          <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Metrik Ads (Iklan)
                          </div>
                          <div className="space-y-1">
                            {Object.entries(METRICS_META)
                              .filter(([_, meta]) => meta.category === "ads")
                              .map(([key, meta]) => {
                                const isChecked = tempSelectedMetrics.includes(key);
                                return (
                                  <label 
                                    key={key} 
                                    className={`flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/[0.02] cursor-pointer transition-colors ${isChecked ? 'bg-black/[0.01]' : ''}`}
                                  >
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked} 
                                      onChange={() => toggleTempMetric(key)} 
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                                    />
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                                        <span className="text-xs font-bold text-gray-800">{meta.label.split(" (")[0]}</span>
                                      </div>
                                      <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{meta.desc}</p>
                                    </div>
                                  </label>
                                );
                              })}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                        <button 
                          onClick={() => setIsMetricSettingOpen(false)} 
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-black/[0.03] transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={applyMetrics} 
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check size={12} />
                          <span>Terapkan</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Active Metrics Badges (Single horizontal scrollable clean row) */}
            {activeMetrics.length > 0 && (
              <div className="flex flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1.5 mb-5 p-2.5 bg-black/[0.01] rounded-full border border-black/[0.02] items-center">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider shrink-0 mr-1.5">Aktif:</span>
                {activeMetrics.map(k => (
                  <div key={k} className="px-2.5 py-1 bg-white border border-black/[0.04] rounded-full text-[11px] font-bold text-gray-700 flex items-center gap-1.5 shadow-sm shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: METRICS_META[k]?.color || "#3B82F6" }} />
                    <span>{METRICS_META[k]?.label?.split(" (")[0] || k}</span>
                    <button 
                      onClick={() => setActiveMetrics(prev => prev.filter(x => x !== k))}
                      className="text-gray-400 hover:text-gray-900 ml-1 cursor-pointer font-black text-[10px] leading-none"
                      title="Sembunyikan metrik ini"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeMetrics.length === 0 ? (
              <div className="py-12 text-center text-gray-400 bg-black/[0.01] rounded-2xl border border-dashed border-black/[0.06] flex flex-col items-center justify-center">
                <TrendingUp size={36} className="text-gray-300 mb-2 animate-bounce" />
                <p className="text-sm font-semibold">Tidak ada metrik terpilih.</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">Pilih metrik melalui tombol 'Pilih Metrik' di atas untuk menampilkan grafik.</p>
                <button 
                  onClick={openMetricSetting} 
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                >
                  Pilih Metrik
                </button>
              </div>
            ) : (
              <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
                {activeMetrics.map(k=>(
                  <div key={k} className="bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02] flex flex-col justify-between">
                    <div className="mb-4">
                      <div className="text-sm font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ background: METRICS_META[k]?.color || MC[k] || "#3B82F6" }} />
                         {METRICS_META[k]?.label || k}
                      </div>
                      {METRICS_META[k]?.desc && <div className="text-[11px] text-gray-400 font-medium">{METRICS_META[k]?.desc}</div>}
                    </div>
                    <ResponsiveContainer width="100%" height={320} debounce={300}>
                      {adsFilter==="all" ? (
                         <BarChart data={lineData} margin={{top:0,right:10,left:0,bottom:0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)"/>
                            <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} dy={10}/>
                            <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} tickFormatter={fmt} width={55}/>
                            <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} labelStyle={{marginBottom:6,color:"rgba(0,0,0,0.4)"}} />
                            <Bar dataKey={`${k}_org`} stackId={k} name={`Organik`} fill={METRICS_META[k]?.color || MC[k] || "#3B82F6"} radius={[0,0,4,4]} barSize={16}/>
                            <Bar dataKey={`${k}_ads`} stackId={k} name={`Ads`} fill={(METRICS_META[k]?.color || MC[k] || "#3B82F6")+"66"} radius={[4,4,0,0]} barSize={16}/>
                         </BarChart>
                      ) : (
                        <LineChart data={lineData} margin={{top:5,right:10,left:0,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)"/>
                          <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} dy={10}/>
                          <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} tickFormatter={fmt} width={55}/>
                          <Tooltip contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} labelStyle={{marginBottom:6,color:"rgba(0,0,0,0.4)"}} />
                          <Line type="monotone" dataKey={k} stroke={METRICS_META[k]?.color || MC[k] || "#3B82F6"} strokeWidth={3} dot={{r:0}} activeDot={{r:5, strokeWidth:0}} name={METRICS_META[k]?.label || k} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Heatmap (Full Width) */}
          <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-6 min-w-0 transition-shadow hover:shadow-md overflow-hidden w-full">
            <div className="w-full">
              <div className="flex items-center gap-2.5 mb-5 justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="bg-red-50 p-2 rounded-lg text-red-600"><Clock size={18} /></div>
                  <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">Heatmap Aktivitas (Best Time)</h4>
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
              <div className="flex gap-[1%] mb-2">
                <div className="w-6 shrink-0"/>
                {Array.from({length:24}).map((_,i)=><div key={`h${i}`} className="flex-1 text-center text-[9px] text-gray-400 font-bold">{i}</div>)}
              </div>
              {heatmap.map((row,di) => {
                const rowMax = Math.max(...row, 1);
                return (
                  <div key={di} className="flex gap-[1%] mb-1.5 items-center">
                    <div className="w-6 text-[10px] font-bold text-gray-900 shrink-0">{DAYS_S[di]}</div>
                    {row.map((val,hi) => (
                      <div key={hi} title={`${DAYS_ID[di]} Jam ${hi} - ${fmt(val)} ${heatmapMetric==="engagement"?"Eng":heatmapMetric==="reach"?"Reach":"Views"}`} className="flex-1 h-7 rounded-sm transition-all duration-200" style={{background:val===0?'#F3F4F6':(heatmapMetric==="engagement"?`#3B82F6`:`#8B5CF6`) , opacity: val===0 ? 1 : Math.max(0.15, val/rowMax)}}/>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 items-center bg-white rounded-2xl border border-black/[0.03] shadow-sm px-5 py-4 flex-wrap mt-2 min-w-0">
            <div className="flex gap-3 items-center flex-wrap">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Urutkan:</div>
              <div className="flex gap-0.5 bg-black/[0.03] p-1 rounded-xl border border-black/[0.01]">
                {[["engagement","Interaksi"],["reach","Jangkauan"],["views","Tayangan"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setTopSort(k)} className={`px-4 py-2 rounded-lg border-none font-bold text-xs cursor-pointer transition-all ${topSort===k ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="hidden sm:block w-px h-7 bg-black/[0.06] shrink-0"/>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Platform:</div>
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

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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

