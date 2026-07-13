import { useState, useMemo, useRef, useEffect } from "react";
import { auth, callAiWithQuota } from "./firebase";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell, PieChart as RPieChart, Pie } from "recharts";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, TrendingUp, Sparkles, PieChart, Users, BarChart2, Activity, Calendar, Zap, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, Target, Star, Settings, Check, RotateCcw, SlidersHorizontal, Globe, Smartphone, Heart, Edit2, X, Download, ZoomIn, ZoomOut } from "lucide-react";

const CustomLegend = ({ payload }: any) => {
  return (
    <div style={{ maxHeight: "80px", overflowY: "auto", marginTop: "16px", paddingBottom: "4px" }}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 16px" }}>
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: entry.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
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

function getBlankDemographics(platform: string) {
  return {
    platform,
    gender: { male: 0, female: 0 },
    age: [
      { range: "13-17", value: 0 },
      { range: "18-24", value: 0 },
      { range: "25-34", value: 0 },
      { range: "35-44", value: 0 },
      { range: "45+", value: 0 },
    ],
    cities: [
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
    ],
    countries: [
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
    ],
    devices: [
      { name: "Android", percentage: 0 },
      { name: "iOS (iPhone)", percentage: 0 },
      { name: "Web / Desktop", percentage: 0 },
    ],
    interests: [
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
      { name: "", percentage: 0 },
    ]
  };
}

function getDemographicsForPlatform(platform: string) {
  const norm = (platform || "").toLowerCase();
  
  if (norm.includes("tiktok")) {
    return {
      platform: "TikTok",
      gender: { male: 38, female: 62 },
      age: [
        { range: "13-17", value: 15 },
        { range: "18-24", value: 50 },
        { range: "25-34", value: 25 },
        { range: "35-44", value: 7 },
        { range: "45+", value: 3 },
      ],
      cities: [
        { name: "Jakarta", percentage: 38 },
        { name: "Surabaya", percentage: 18 },
        { name: "Bandung", percentage: 16 },
        { name: "Medan", percentage: 12 },
        { name: "Yogyakarta", percentage: 10 },
      ],
      countries: [
        { name: "Indonesia", percentage: 91 },
        { name: "Malaysia", percentage: 5 },
        { name: "Singapore", percentage: 2 },
        { name: "United States", percentage: 1 },
        { name: "Lainnya", percentage: 1 },
      ],
      devices: [
        { name: "Android", percentage: 76 },
        { name: "iOS (iPhone)", percentage: 23 },
        { name: "Web / Desktop", percentage: 1 },
      ],
      interests: [
        { name: "Entertainment & Comedy", percentage: 35 },
        { name: "Kuliner & Resep", percentage: 22 },
        { name: "Kecantikan & Skincare", percentage: 18 },
        { name: "Musik & Dance", percentage: 15 },
        { name: "Edukasi & Bisnis", percentage: 10 },
      ]
    };
  }

  if (norm.includes("reels")) {
    return {
      platform: "Reels",
      gender: { male: 44, female: 56 },
      age: [
        { range: "13-17", value: 8 },
        { range: "18-24", value: 42 },
        { range: "25-34", value: 38 },
        { range: "35-44", value: 9 },
        { range: "45+", value: 3 },
      ],
      cities: [
        { name: "Jakarta", percentage: 44 },
        { name: "Bandung", percentage: 20 },
        { name: "Surabaya", percentage: 14 },
        { name: "Medan", percentage: 11 },
        { name: "Yogyakarta", percentage: 8 },
      ],
      countries: [
        { name: "Indonesia", percentage: 87 },
        { name: "Malaysia", percentage: 6 },
        { name: "Singapore", percentage: 4 },
        { name: "United States", percentage: 2 },
        { name: "Lainnya", percentage: 1 },
      ],
      devices: [
        { name: "iOS (iPhone)", percentage: 52 },
        { name: "Android", percentage: 46 },
        { name: "Web / Desktop", percentage: 2 },
      ],
      interests: [
        { name: "Fashion & Lifestyle", percentage: 32 },
        { name: "Kuliner", percentage: 26 },
        { name: "Traveling & Estetik", percentage: 20 },
        { name: "Teknologi & Gadget", percentage: 12 },
        { name: "Pengembangan Diri", percentage: 10 },
      ]
    };
  }

  if (norm.includes("feed")) {
    return {
      platform: "Feed",
      gender: { male: 46, female: 54 },
      age: [
        { range: "13-17", value: 5 },
        { range: "18-24", value: 35 },
        { range: "25-34", value: 44 },
        { range: "35-44", value: 12 },
        { range: "45+", value: 4 },
      ],
      cities: [
        { name: "Jakarta", percentage: 46 },
        { name: "Bandung", percentage: 18 },
        { name: "Surabaya", percentage: 15 },
        { name: "Medan", percentage: 10 },
        { name: "Yogyakarta", percentage: 7 },
      ],
      countries: [
        { name: "Indonesia", percentage: 85 },
        { name: "Malaysia", percentage: 6 },
        { name: "Singapore", percentage: 5 },
        { name: "Japan", percentage: 2 },
        { name: "Lainnya", percentage: 2 },
      ],
      devices: [
        { name: "iOS (iPhone)", percentage: 48 },
        { name: "Android", percentage: 49 },
        { name: "Web / Desktop", percentage: 3 },
      ],
      interests: [
        { name: "Inspirasi & Quotes", percentage: 28 },
        { name: "Fotografi & Desain", percentage: 24 },
        { name: "Kuliner & Tempat Nongkrong", percentage: 22 },
        { name: "Teknologi & Finansial", percentage: 16 },
        { name: "Olahraga & Kesehatan", percentage: 10 },
      ]
    };
  }

  if (norm.includes("stories")) {
    return {
      platform: "Stories",
      gender: { male: 40, female: 60 },
      age: [
        { range: "13-17", value: 6 },
        { range: "18-24", value: 38 },
        { range: "25-34", value: 42 },
        { range: "35-44", value: 10 },
        { range: "45+", value: 4 },
      ],
      cities: [
        { name: "Jakarta", percentage: 48 },
        { name: "Bandung", percentage: 22 },
        { name: "Surabaya", percentage: 12 },
        { name: "Medan", percentage: 9 },
        { name: "Yogyakarta", percentage: 6 },
      ],
      countries: [
        { name: "Indonesia", percentage: 88 },
        { name: "Malaysia", percentage: 5 },
        { name: "Singapore", percentage: 4 },
        { name: "Australia", percentage: 1 },
        { name: "Lainnya", percentage: 2 },
      ],
      devices: [
        { name: "iOS (iPhone)", percentage: 58 },
        { name: "Android", percentage: 40 },
        { name: "Web / Desktop", percentage: 2 },
      ],
      interests: [
        { name: "Keseharian & Vlogs", percentage: 35 },
        { name: "Belanja & Promo", percentage: 25 },
        { name: "Makanan & Cafe Baru", percentage: 20 },
        { name: "Interaksi & Tanya Jawab", percentage: 12 },
        { name: "Karir & Produktivitas", percentage: 8 },
      ]
    };
  }

  // All Platforms combined / default fallback
  return {
    platform: "Semua Platform",
    gender: { male: 45, female: 55 },
    age: [
      { range: "13-17", value: 11 },
      { range: "18-24", value: 41 },
      { range: "25-34", value: 35 },
      { range: "35-44", value: 9 },
      { range: "45+", value: 4 },
    ],
    cities: [
      { name: "Jakarta", percentage: 43 },
      { name: "Bandung", percentage: 19 },
      { name: "Surabaya", percentage: 15 },
      { name: "Medan", percentage: 12 },
      { name: "Yogyakarta", percentage: 7 },
    ],
    countries: [
      { name: "Indonesia", percentage: 88 },
      { name: "Malaysia", percentage: 6 },
      { name: "Singapore", percentage: 3 },
      { name: "United States", percentage: 1 },
      { name: "Lainnya", percentage: 2 },
    ],
    devices: [
      { name: "Android", percentage: 60 },
      { name: "iOS (iPhone)", percentage: 37 },
      { name: "Web / Desktop", percentage: 3 },
    ],
    interests: [
      { name: "Kuliner & Foodies", percentage: 28 },
      { name: "Fashion, Beauty & Skincare", percentage: 24 },
      { name: "Entertainment & Vlogs", percentage: 22 },
      { name: "Teknologi & Gadget", percentage: 14 },
      { name: "Gaya Hidup & Finansial", percentage: 12 },
    ]
  };
}

function getAggregatedDemographics(demographicsState: any, platformsList: any[]) {
  const filledKeys = (platformsList || []).map((p: any) => {
    const name = typeof p === 'string' ? p : p.name;
    return { name, key: name.toLowerCase() };
  }).filter(item => !!demographicsState[item.key]);

  if (filledKeys.length === 0) {
    return null;
  }

  const numPlatforms = filledKeys.length;
  
  let totalFemale = 0;
  let totalMale = 0;
  
  const ageSums: { [range: string]: number } = {
    "13-17": 0, "18-24": 0, "25-34": 0, "35-44": 0, "45+": 0
  };

  const citySums: { [name: string]: number } = {};
  const countrySums: { [name: string]: number } = {};
  const deviceSums: { [name: string]: number } = {};
  const interestSums: { [name: string]: number } = {};

  filledKeys.forEach(item => {
    const data = demographicsState[item.key];
    if (!data) return;
    
    // Gender
    totalFemale += (data.gender?.female !== undefined ? data.gender.female : 50);
    totalMale += (data.gender?.male !== undefined ? data.gender.male : 50);
    
    // Age
    if (Array.isArray(data.age)) {
      data.age.forEach((g: any) => {
        if (g.range && g.value !== undefined) {
          ageSums[g.range] = (ageSums[g.range] || 0) + g.value;
        }
      });
    }

    // Cities
    if (Array.isArray(data.cities)) {
      data.cities.forEach((c: any) => {
        if (c.name && c.percentage !== undefined) {
          const normName = c.name.trim();
          if (normName) {
            citySums[normName] = (citySums[normName] || 0) + c.percentage;
          }
        }
      });
    }

    // Countries
    if (Array.isArray(data.countries)) {
      data.countries.forEach((c: any) => {
        if (c.name && c.percentage !== undefined) {
          const normName = c.name.trim();
          if (normName) {
            countrySums[normName] = (countrySums[normName] || 0) + c.percentage;
          }
        }
      });
    }

    // Devices
    if (Array.isArray(data.devices)) {
      data.devices.forEach((d: any) => {
        if (d.name && d.percentage !== undefined) {
          const normName = d.name.trim();
          if (normName) {
            deviceSums[normName] = (deviceSums[normName] || 0) + d.percentage;
          }
        }
      });
    }

    // Interests
    if (Array.isArray(data.interests)) {
      data.interests.forEach((n: any) => {
        if (n.name && n.percentage !== undefined) {
          const normName = n.name.trim();
          if (normName) {
            interestSums[normName] = (interestSums[normName] || 0) + n.percentage;
          }
        }
      });
    }
  });

  const femaleAvg = Math.round(totalFemale / numPlatforms);
  const maleAvg = 100 - femaleAvg;

  const ageList = Object.keys(ageSums).map(range => ({
    range,
    value: Math.round(ageSums[range] / numPlatforms)
  }));

  const citiesList = Object.keys(citySums).map(name => ({
    name,
    percentage: Math.round(citySums[name] / numPlatforms)
  })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  const countriesList = Object.keys(countrySums).map(name => ({
    name,
    percentage: Math.round(countrySums[name] / numPlatforms)
  })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  const devicesList = Object.keys(deviceSums).map(name => ({
    name,
    percentage: Math.round(deviceSums[name] / numPlatforms)
  })).sort((a, b) => b.percentage - a.percentage).slice(0, 3);

  const interestsList = Object.keys(interestSums).map(name => ({
    name,
    percentage: Math.round(interestSums[name] / numPlatforms)
  })).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

  return {
    platform: "Semua Platform",
    gender: { male: maleAvg, female: femaleAvg },
    age: ageList,
    cities: citiesList,
    countries: countriesList,
    devices: devicesList,
    interests: interestsList
  };
}

export function AnalyticsView({
  content,
  pillars,
  platforms,
  contentTypes,
  pics,
  statuses,
  openEdit,
  isRestricted,
  activeSubTab: activeSubTabProp,
  setActiveSubTab: setActiveSubTabProp
}: any) {
  const [dateFilt,setDateFilt] = useState("tm"); 
  const [customS,setCustomS] = useState("");
  const [customE,setCustomE] = useState("");
  const [adsFilter,setAdsFilter] = useState("organic"); 
  const [platformFilter, setPlatformFilter] = useState("all");
  const [demographics, setDemographics] = useState<any>(() => {
    const saved = localStorage.getItem("hubify_custom_demographics");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load demographics from localStorage:", e);
      }
    }
    return {};
  });
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [editDemoData, setEditDemoData] = useState<any>(null);
  const [editingPlatform, setEditingPlatform] = useState("");
  const [tempDemographics, setTempDemographics] = useState<any>({});
  const [activeMetrics,setActiveMetrics] = useState(["views", "reach", "likes", "comments"]);
  const [topSort,setTopSort] = useState("engagement");
  const [topPlatform,setTopPlatform] = useState("All");
  const [platformMetric, setPlatformMetric] = useState("engagement");
  const [platformChartType, setPlatformChartType] = useState("doughnut");
  const [picChartType, setPicChartType] = useState("doughnut");
  const [heatmapMetric, setHeatmapMetric] = useState("engagement");
  const [activeSubTabState, setActiveSubTabState] = useState("overview");
  const activeSubTab = activeSubTabProp !== undefined ? activeSubTabProp : activeSubTabState;
  const setActiveSubTab = setActiveSubTabProp !== undefined ? setActiveSubTabProp : setActiveSubTabState;

  // States for Cetak Laporan PDF
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printPlatforms, setPrintPlatforms] = useState<string[]>([]);
  const [printDateRange, setPrintDateRange] = useState("28d");
  const [printCustomS, setPrintCustomS] = useState("");
  const [printCustomE, setPrintCustomE] = useState("");
  const [printSections, setPrintSections] = useState({
    overview: true,
    content: true,
    trends: true,
    audience: true,
  });
  const [isPrintReady, setIsPrintReady] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [previewScale, setPreviewScale] = useState(1);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPrintModalOpen || !previewContainerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (manualZoom !== null) return;
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const targetW = 395;
        const targetH = 558;
        const padding = 32; // Spacing for floating borders
        const scaleX = (width - padding) / targetW;
        const scaleY = (height - padding) / targetH;
        const newScale = Math.min(scaleX, scaleY, 1.0);
        setPreviewScale(Math.max(newScale, 0.15));
      }
    });
    
    resizeObserver.observe(previewContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [isPrintModalOpen, manualZoom]);

  const selectedPages = useMemo(() => {
    const list = [{ id: "cover", title: "Halaman Sampul (Cover)" }];
    if (printSections.overview) list.push({ id: "overview", title: "Ringkasan Kinerja (Overview)" });
    if (printSections.content) list.push({ id: "content", title: "Performa Konten Terpopuler" });
    if (printSections.trends) list.push({ id: "trends", title: "Tren & Pertumbuhan" });
    if (printSections.audience) list.push({ id: "audience", title: "Demografi & Aktivitas" });
    return list;
  }, [printSections]);

  useEffect(() => {
    if (previewPageIndex >= selectedPages.length) {
      setPreviewPageIndex(Math.max(0, selectedPages.length - 1));
    }
  }, [selectedPages, previewPageIndex]);

  const platformNames = useMemo(() => {
    return (platforms || []).map((p: any) => typeof p === 'string' ? p : p.name);
  }, [platforms]);

  useEffect(() => {
    if (isPrintModalOpen) {
      const activePlatNames = platformFilter === "all" ? platformNames : [platformFilter];
      setPrintPlatforms(prev => prev.length === 0 ? activePlatNames : prev);
      setPrintDateRange(prev => prev === "28d" && dateFilt !== "28d" ? dateFilt : prev);
      setPrintCustomS(prev => prev === "" && customS !== "" ? customS : prev);
      setPrintCustomE(prev => prev === "" && customE !== "" ? customE : prev);
    }
  }, [isPrintModalOpen, platformFilter, platformNames, dateFilt, customS, customE]);

  const formatPrintDate = (dStr: string) => {
    if (!dStr) return "";
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleOpenPrintModal = () => {
    const activePlatNames = platformFilter === "all" ? platformNames : [platformFilter];
    setPrintPlatforms(activePlatNames);
    setPrintDateRange(dateFilt);
    setPrintCustomS(customS);
    setPrintCustomE(customE);
    setIsPrintModalOpen(true);
  };

  const handleExecutePrint = async () => {
    if (printPlatforms.length === 0) {
      alert("Harap pilih minimal satu platform untuk laporan.");
      return;
    }
    setIsPrintModalOpen(false);
    setIsPrintReady(true);
    setIsGeneratingPDF(true);
    setTimeout(async () => {
      try {
        const container = document.getElementById("print-report-container");
        if (!container) {
          alert("Gagal menemukan elemen laporan untuk disimpan.");
          setIsGeneratingPDF(false);
          setIsPrintReady(false);
          return;
        }

        const pages = container.querySelectorAll(".print-page");
        if (pages.length === 0) {
          alert("Tidak ada halaman laporan untuk disimpan.");
          setIsGeneratingPDF(false);
          setIsPrintReady(false);
          return;
        }

        const { jsPDF } = await import("jspdf");
        const html2canvas = (await import("html2canvas")).default;

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true
        });

        for (let i = 0; i < pages.length; i++) {
          const pageEl = pages[i] as HTMLElement;
          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.9);
          
          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
        }

        const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        pdf.save(`Laporan_Analisis_Hubify_${dateStr}.pdf`);
      } catch (err) {
        console.error("Gagal membuat PDF:", err);
        alert("Terjadi kesalahan saat menyimpan PDF.");
      } finally {
        setIsGeneratingPDF(false);
        setIsPrintReady(false);
      }
    }, 600);
  };

  const printData = useMemo(() => {
    if (!isPrintModalOpen && !isPrintReady) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let finalStartDate = new Date(now);
    let finalEndDate = new Date(now);

    if (printDateRange === "custom") {
      finalStartDate = printCustomS ? new Date(printCustomS) : new Date(now.getFullYear(), 0, 1);
      finalEndDate = printCustomE ? new Date(printCustomE) : new Date();
    } else if (printDateRange === "all") {
      const years = content.length > 0 ? Array.from(new Set(content.map((c: any) => c.year))).sort() as number[] : [now.getFullYear()];
      finalStartDate = new Date(years[0] || now.getFullYear(), 0, 1);
    } else {
      const dayOfWeek = now.getDay();
      if (printDateRange === "yesterday") {
        finalStartDate.setDate(now.getDate() - 1);
        finalEndDate = new Date(finalStartDate);
      } else if (printDateRange === "7d") {
        finalStartDate.setDate(now.getDate() - 7);
      } else if (printDateRange === "28d") {
        finalStartDate.setDate(now.getDate() - 28);
      } else if (printDateRange === "90d") {
        finalStartDate.setDate(now.getDate() - 90);
      } else if (printDateRange === "tw") {
        finalStartDate.setDate(now.getDate() - dayOfWeek);
      } else if (printDateRange === "tm") {
        finalStartDate.setDate(1);
      } else if (printDateRange === "ty") {
        finalStartDate.setMonth(0);
        finalStartDate.setDate(1);
      } else if (printDateRange === "lw") {
        finalStartDate.setDate(now.getDate() - dayOfWeek - 7);
        finalEndDate = new Date(finalStartDate);
        finalEndDate.setDate(finalStartDate.getDate() + 6);
      } else if (printDateRange === "lm") {
        finalStartDate.setMonth(now.getMonth() - 1);
        finalStartDate.setDate(1);
        finalEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
      }
    }
    
    finalStartDate.setHours(0,0,0,0);
    finalEndDate.setHours(23,59,59,999);

    const fmtDateString = (d: Date) => {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    let rangeLabel = `${fmtDateString(finalStartDate)} - ${fmtDateString(finalEndDate)}`;

    const filteredBase = content.filter((c: any) => {
      let cdt = new Date(c.year, c.month - 1, c.day);
      let isMatch = cdt >= finalStartDate && cdt <= finalEndDate;

      if (!isMatch) return false;

      if (adsFilter !== "all") {
        const matchAds = adsFilter === "all" || (adsFilter === "ads" ? !!c.isAds : !c.isAds);
        if (!matchAds) return false;
      }

      const itemPlatforms = String(c.platform).split(',').map(s => s.trim().toLowerCase());
      const selectedLower = printPlatforms.map(p => p.toLowerCase());
      
      return itemPlatforms.some(ip => selectedLower.includes(ip));
    });

    const getV = (c: any) => (c.metrics?.views || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.views || 0 : 0);
    const getR = (c: any) => (c.metrics?.reach || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.reach || 0 : 0);
    const getLikes = (c: any) => (c.metrics?.likes || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.likes || 0 : 0);
    const getComments = (c: any) => (c.metrics?.comments || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.comments || 0 : 0);
    const getShares = (c: any) => (c.metrics?.shares || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.shares || 0 : 0);
    const getEng = (c: any) => eng(c.metrics) + (c.isAds || adsFilter === "all" ? eng(c.adsMetrics || {}) : 0);

    const totalViews = filteredBase.reduce((s, c) => s + getV(c), 0);
    const totalReach = filteredBase.reduce((s, c) => s + getR(c), 0);
    const totalLikes = filteredBase.reduce((s, c) => s + getLikes(c), 0);
    const totalComments = filteredBase.reduce((s, c) => s + getComments(c), 0);
    const totalShares = filteredBase.reduce((s, c) => s + getShares(c), 0);
    const totalEngagement = filteredBase.reduce((s, c) => s + getEng(c), 0);
    const engagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) : "0.00";

    const totalPosts = filteredBase.length;
    const publishedPosts = filteredBase.filter((c: any) => c.status === "Published").length;

    const sortedTopPosts = [...filteredBase]
      .sort((a, b) => getEng(b) - getEng(a))
      .slice(0, 5);

    const groupedTimeline: { [key: string]: any } = {};
    
    // Fill in all days between finalStartDate and finalEndDate
    let currDate = new Date(finalStartDate);
    currDate.setHours(0,0,0,0);
    const endDateTime = new Date(finalEndDate).setHours(0,0,0,0);
    
    while(currDate.getTime() <= endDateTime) {
      const dateKey = `${String(currDate.getDate()).padStart(2, '0')}/${String(currDate.getMonth() + 1).padStart(2, '0')}`;
      const dayData: any = {
        date: dateKey,
        timestamp: currDate.getTime(),
      };
      activeMetrics.forEach(m => dayData[m] = 0);
      groupedTimeline[dateKey] = dayData;
      currDate.setDate(currDate.getDate() + 1);
    }

    const metricTotals: Record<string, number> = {};
    activeMetrics.forEach(m => metricTotals[m] = 0);

    filteredBase.forEach((c: any) => {
      const dateKey = `${String(c.day).padStart(2, '0')}/${String(c.month + 1).padStart(2, '0')}`;
      if (!groupedTimeline[dateKey]) {
        const dayData: any = {
          date: dateKey,
          timestamp: new Date(c.year, c.month - 1, c.day).getTime(),
        };
        activeMetrics.forEach(m => dayData[m] = 0);
        groupedTimeline[dateKey] = dayData;
      }
      activeMetrics.forEach(m => {
        let val = 0;
        if (m === 'engagement') val = getEng(c);
        else if (m === 'views') val = getV(c);
        else if (m === 'reach') val = getR(c);
        else if (m === 'likes') val = getLikes(c);
        else val = (c.isAds ? (c.adsMetrics?.[m] || 0) : (c.metrics?.[m] || 0));
        groupedTimeline[dateKey][m] += val;
        metricTotals[m] += val;
      });
    });

    const timelineData = Object.values(groupedTimeline).sort((a: any, b: any) => a.timestamp - b.timestamp);
    const totalDays = Math.max(Object.keys(groupedTimeline).length, 1);

    const aggDemo = getAggregatedDemographics(demographics, printPlatforms);

    let originalRangeLabel = "";
    if (printDateRange === "custom") {
      rangeLabel = `${formatPrintDate(printCustomS) || "Mulai"} - ${formatPrintDate(printCustomE) || "Selesai"}`;
    } else {
      const labelsMap: any = {
        yesterday: "Kemarin",
        "7d": "7 Hari Terakhir",
        "28d": "28 Hari Terakhir",
        "90d": "90 Hari Terakhir",
        tw: "Minggu Ini",
        tm: "Bulan Ini",
        ty: "Tahun Ini",
        lw: "Minggu Lalu",
        lm: "Bulan Lalu",
        all: "Semua Waktu"
      };
      originalRangeLabel = labelsMap[printDateRange] || "Periode Laporan";
      rangeLabel = `${originalRangeLabel} (${rangeLabel})`;
    }

    return {
      filteredBase,
      totalViews,
      totalReach,
      totalLikes,
      totalComments,
      totalShares,
      totalEngagement,
      engagementRate,
      totalPosts,
      publishedPosts,
      topPosts: sortedTopPosts,
      timelineData,
      totalDays,
      metricTotals,
      demographics: aggDemo,
      rangeLabel
    };
  }, [isPrintModalOpen, isPrintReady, printPlatforms, printDateRange, printCustomS, printCustomE, demographics, content, adsFilter]);

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
    let cdt = new Date(c.year, c.month - 1, c.day);
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

  const base = content.filter((c:any)=>isDateMatch(c)&&(adsFilter==="all"||(adsFilter==="ads"?!!c.isAds:!c.isAds))&&(platformFilter==="all"||String(c.platform).split(',').map(s=>s.trim()).includes(platformFilter)));
  const prevBase = content.filter((c:any)=>isDateMatch(c, true)&&(adsFilter==="all"||(adsFilter==="ads"?!!c.isAds:!c.isAds))&&(platformFilter==="all"||String(c.platform).split(',').map(s=>s.trim()).includes(platformFilter)));
  
  const getEng = (c:any) => eng(c.metrics) + (c.isAds||adsFilter==="all"?eng(c.adsMetrics||{}):0);
  const getV = (c:any) => (c.metrics?.views||0) + (c.isAds||adsFilter==="all"?c.adsMetrics?.views||0:0);
  const getR = (c:any) => (c.metrics?.reach||0) + (c.isAds||adsFilter==="all"?c.adsMetrics?.reach||0:0);
  const getLikes = (c: any) => (c.metrics?.likes || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.likes || 0 : 0);
  const getComments = (c: any) => (c.metrics?.comments || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.comments || 0 : 0);
  const getShares = (c: any) => (c.metrics?.shares || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.shares || 0 : 0);
  
  const total  = base.length;
  const pub    = base.filter((c:any)=>c.status==="Published").length;
  
  // Randomize numbers if restricted to prevent data leak but show structure
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  const getRand = (val: number, seed: number) => val;
  
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
            filter: (c: any) => c.day === dt.getDate() && c.month === dt.getMonth() && c.year === dt.getFullYear()
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
              const d = new Date(c.year, c.month - 1, c.day);
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
            filter: (c: any) => c.month === m - 1 && c.year === y
          });
          curr.setMonth(curr.getMonth() + 1);
       }
    }

    return labels.map(({ label, filter }) => {
      const d = content.filter((c:any) => filter(c) && (adsFilter === "all" || (adsFilter === "ads" ? !!c.isAds : !c.isAds)) && (platformFilter === "all" || String(c.platform).split(',').map(s=>s.trim()).includes(platformFilter)));
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
      let cd = new Date(c.year, c.month - 1, c.day).getDay();
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
    <motion.div whileHover={{ y: -2 }} className={`flex-1 min-w-0 flex flex-col justify-between h-full p-5 rounded-2xl border ${theme.border} shadow-sm overflow-visible break-words transition-shadow hover:shadow-md ${theme.bg}`}>
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
             {activeSubTab === "overview" && "Overview"}
             {activeSubTab === "content" && "Content"}
             {activeSubTab === "trends" && "Trends"}
             {activeSubTab === "activity" && "Audience"}
             <Sparkles size={20} className="text-blue-600" />
           </h1>
           <p className="text-sm text-gray-500 mt-1">
             {activeSubTab === "overview" && "Monitor overall content performance summaries with real-time data."}
             {activeSubTab === "content" && "Analyze the detailed performance of each post and your content types."}
             {activeSubTab === "trends" && "Track growth graphics of key metrics and campaign effectiveness over time."}
             {activeSubTab === "activity" && "Identify the best times and highest interactions of your audience based on posting times."}
           </p>
         </div>
         <button onClick={handleOpenPrintModal} className="hover-scale btn-hover px-4 py-2 rounded-xl h-10 text-[13px] font-bold bg-white border border-black/[0.04] text-gray-900 shadow-sm flex items-center gap-2 cursor-pointer transition-all">
            <Download size={16} className="text-gray-900" />
            Simpan Laporan PDF
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
          
          {/* VIEW: OVERVIEW */}
          {activeSubTab === "overview" && (
            <>
              {/* Metrics Row */}
              <div className="flex flex-wrap gap-4 w-[calc(100%+48px)] -mx-6 px-6 mb-1 pb-2">
                <div className="flex flex-col flex-1 min-w-[200px]"><MCard label="Total Konten" val={total} sub={`Dipublikasikan: ${pub}`} colorTheme="blue" icon={PieChart} pctStr={calcPct(total, prevTotal)} /></div>
                <div className="flex flex-col flex-1 min-w-[200px]"><MCard label="Views (Impresi)" val={fmt(tV)} pctStr={calcPct(tV, prevTV)} colorTheme="amber" icon={Activity}/></div>
                <div className="flex flex-col flex-1 min-w-[200px]"><MCard label="Reach" val={fmt(tR)} pctStr={calcPct(tR, prevTR)} colorTheme="purple" icon={Users}/></div>
                <div className="flex flex-col flex-1 min-w-[200px]"><MCard label="Engagement" val={fmt(tE)} sub={`Tingkat Interaksi: ${er}% (vs ${(prevER).toFixed(2)}%)`} pctStr={calcPct(tE, prevTE)} colorTheme="emerald" icon={Target}/></div>
                {(adsFilter==="all"||adsFilter==="ads") && <>
                  <div className="flex flex-col flex-1 min-w-[200px]"><MCard label="Ad Clicks" val={fmt(tClicks)} colorTheme="rose" icon={Zap} pctStr={calcPct(tClicks, prevTClicks)}/></div>
                  <div className="flex flex-col flex-1 min-w-[200px]"><MCard label="Ad Conversions" val={fmt(tConv)} colorTheme="cyan" icon={Star} pctStr={calcPct(tConv, prevTConv)}/></div>
                </>}
              </div>

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
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
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
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.4)",marginBottom:4}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
                        <Bar dataKey="value" name="Total" radius={[6,6,0,0]} maxBarSize={48}>
                          {platformData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"][index % 4]} />)}
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
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
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
              </div>
            </>
          )}

          {/* VIEW: CONTENT PERFORMANCE */}
          {activeSubTab === "content" && (
            <>
              {/* Header Sort & Filter for rankings */}
              <div className="flex gap-4 items-center bg-white rounded-2xl border border-black/[0.03] shadow-sm px-5 py-4 flex-wrap min-w-0">
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Urutkan Konten:</div>
                  <div className="flex gap-0.5 bg-black/[0.03] p-1 rounded-xl border border-black/[0.01]">
                    {[["engagement","Interaksi"],["reach","Jangkauan"],["views","Tayangan"]].map(([k,l])=>(
                      <button key={k} onClick={()=>setTopSort(k)} className={`px-4 py-2 rounded-lg border-none font-bold text-xs cursor-pointer transition-all ${topSort===k ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:block w-px h-7 bg-black/[0.06] shrink-0"/>
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Filter Platform:</div>
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

              {/* Best & Lowest Content Lists */}
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

              {/* Other distribution metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ minWidth: 0 }}>
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
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.4)",marginBottom:4}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
                        <Bar dataKey="value" name="Total" radius={[6,6,0,0]} maxBarSize={48}>
                          {typeData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#DB2777", "#EC4899", "#F472B6", "#FBCFE8"][index % 4]} />)}
                        </Bar>
                      </BarChart>
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
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
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
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.4)",marginBottom:4}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
                        <Bar dataKey="total" name="Jumlah Konten" radius={[6,6,0,0]} maxBarSize={48}>
                          {picData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#6366F1"][index % 6]} />)}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* VIEW: TRENDS & GROWTH */}
          {activeSubTab === "trends" && (
            <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-6 flex flex-col min-w-0 transition-shadow hover:shadow-md">
              <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><TrendingUp size={18} /></div>
                  <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">Tren Pertumbuhan</h4>
                </div>
              </div>

              {/* Active Metrics Bar containing Selection Button on the Left */}
              <div className="flex items-center gap-2 mb-5 p-1.5 bg-black/[0.02] rounded-full border border-black/[0.03] relative min-w-0">
                {/* Metric Selection Popover on Far Left */}
                <div className="relative shrink-0" ref={metricSettingRef}>
                  <button 
                    onClick={openMetricSetting} 
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-black/[0.08] px-3.5 py-1.5 rounded-full shadow-sm cursor-pointer transition-all text-xs font-extrabold text-gray-800 hover:scale-[1.02] active:scale-95 shrink-0"
                  >
                    <SlidersHorizontal size={13} className="text-gray-500" />
                    <span>Pilih Metrik</span>
                    {activeMetrics.length > 0 && (
                      <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                        {activeMetrics.length}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isMetricSettingOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 5 }} 
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-[100] w-[320px] sm:w-[420px] md:w-[480px] overflow-hidden flex flex-col text-left"
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

                {/* Vertical Divider */}
                <div className="w-px h-5 bg-black/[0.08] shrink-0" />

                {/* Scrollable Active Badges */}
                <div className="flex-1 flex flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-2 items-center">
                  {activeMetrics.map(k => (
                    <div key={k} className="px-3 py-1 bg-white border border-black/[0.05] rounded-full text-[11px] font-bold text-gray-700 flex items-center gap-1.5 shadow-sm shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: METRICS_META[k]?.color || "#3B82F6" }} />
                      <span>{METRICS_META[k]?.label?.split(" (")[0] || k}</span>
                      <button 
                        onClick={() => setActiveMetrics(prev => prev.filter(x => x !== k))}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-4 h-4 rounded-full flex items-center justify-center ml-1 cursor-pointer font-black text-[10px] transition-colors"
                        title="Sembunyikan metrik ini"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

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
                  {activeMetrics.map((k, index) => {
                    const currentTotal = base.reduce((sum: number, c: any) => {
                      let val = 0;
                      if (k === 'engagement') val = getEng(c);
                      else if (k === 'views') val = getV(c);
                      else if (k === 'reach') val = getR(c);
                      else if (k === 'likes') val = getLikes(c);
                      else if (k === 'comments') val = getComments(c);
                      else val = (c.metrics?.[k] || 0) + (c.isAds || adsFilter === "all" ? (c.adsMetrics?.[k] || 0) : 0);
                      return sum + val;
                    }, 0);
                    const previousTotal = prevBase.reduce((sum: number, c: any) => {
                      let val = 0;
                      if (k === 'engagement') val = getEng(c);
                      else if (k === 'views') val = getV(c);
                      else if (k === 'reach') val = getR(c);
                      else if (k === 'likes') val = getLikes(c);
                      else if (k === 'comments') val = getComments(c);
                      else val = (c.metrics?.[k] || 0) + (c.isAds || adsFilter === "all" ? (c.adsMetrics?.[k] || 0) : 0);
                      return sum + val;
                    }, 0);
                    const pctStr = calcPct(currentTotal, previousTotal);

                    return (
                      <div key={k} className="bg-white rounded-2xl border border-black/[0.03] p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md">
                        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.02] pb-4">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                               <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: METRICS_META[k]?.color || "#3B82F6" }} />
                               {METRICS_META[k]?.label || k}
                            </div>
                            {METRICS_META[k]?.desc && <div className="text-[11px] text-gray-400 font-medium leading-relaxed">{METRICS_META[k]?.desc}</div>}
                          </div>

                          {/* UI/UX for Metric Total & Pct Change - Minimalist & Borderless */}
                          <div className="flex items-center gap-4 shrink-0 sm:text-right">
                            <div className="flex flex-col sm:items-end">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5">Total</span>
                              <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">{fmt(currentTotal)}</span>
                            </div>

                            {pctStr && (
                              <>
                                {/* Elegant subtle vertical separator */}
                                <div className="hidden sm:block w-px h-8 bg-black/[0.05]" />
                                <div className="flex flex-col items-start sm:items-end">
                                  <div className={`text-sm font-extrabold flex items-center gap-0.5 leading-none ${pctStr.startsWith('+') ? 'text-emerald-600' : pctStr.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
                                    {pctStr.startsWith('+') ? <ArrowUpRight size={13} strokeWidth={3} className="shrink-0" /> : pctStr.startsWith('-') ? <ArrowDownRight size={13} strokeWidth={3} className="shrink-0" /> : null}
                                    <span>{pctStr}</span>
                                  </div>
                                  <span className="text-[9px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider leading-none">{getPeriodText() || "vs prev"}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <ResponsiveContainer width="100%" height={320} debounce={300}>
                          {adsFilter==="all" ? (
                             <BarChart data={lineData} margin={{top:0,right:10,left:0,bottom:0}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)"/>
                                <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} dy={10}/>
                                <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} tickFormatter={fmt} width={55}/>
                                <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} labelStyle={{marginBottom:6,color:"rgba(0,0,0,0.4)"}} />
                                <Bar dataKey={`${k}_org`} stackId={k} name={`Organik`} fill={METRICS_META[k]?.color || "#3B82F6"} radius={[0,0,4,4]} maxBarSize={24}/>
                                <Bar dataKey={`${k}_ads`} stackId={k} name={`Ads`} fill={(METRICS_META[k]?.color || "#3B82F6")+"66"} radius={[4,4,0,0]} maxBarSize={24}/>
                             </BarChart>
                          ) : (
                            <LineChart data={lineData} margin={{top:5,right:10,left:0,bottom:0}}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)"/>
                              <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} dy={10}/>
                              <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} tickFormatter={fmt} width={55}/>
                              <Tooltip contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} labelStyle={{marginBottom:6,color:"rgba(0,0,0,0.4)"}} />
                              <Line type="monotone" dataKey={k} stroke={METRICS_META[k]?.color || "#3B82F6"} strokeWidth={3} dot={{r:0}} activeDot={{r:5, strokeWidth:0}} name={METRICS_META[k]?.label || k} />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW: ACTIVITY HEATMAP & DEMOGRAPHICS */}
          {activeSubTab === "activity" && (
            <div className="flex flex-col gap-6 w-full">
              {/* Card 1: Heatmap Activity */}
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

              {/* Card 2: Complete Demographics Section */}
              <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-6 min-w-0 transition-shadow hover:shadow-md overflow-hidden w-full">
                {/* Header and Platform Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-b-black/[0.03]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={18} /></div>
                      <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">Demografi Lengkap Audiens</h4>
                      
                      {/* Interactive Active Platform Badge synced with navbar */}
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {platformFilter === "all" ? "Semua Platform" : platformFilter}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Persebaran umur, jenis kelamin, lokasi, dan preferensi minat berdasarkan tiap platform yang difilter.</p>
                  </div>

                  {/* Manual Editor Trigger Button - Sync with all platforms */}
                  <button 
                    onClick={() => {
                      const initialTemp = JSON.parse(JSON.stringify(demographics));
                      setTempDemographics(initialTemp);

                      const firstPlatform = platforms[0];
                      const startPlatform = platformFilter === "all" 
                        ? (typeof firstPlatform === 'string' ? firstPlatform : (firstPlatform?.name || "TikTok")) 
                        : platformFilter;
                      setEditingPlatform(startPlatform);
                      
                      const current = initialTemp[startPlatform.toLowerCase()] || null;
                      setEditDemoData(current ? JSON.parse(JSON.stringify(current)) : getBlankDemographics(startPlatform));
                      
                      setIsDemoModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md border-none"
                  >
                    <Edit2 size={13} />
                    <span>Edit Data Demografi</span>
                  </button>
                </div>

                {/* Demographics Content */}
                {(() => {
                  const isAll = platformFilter === "all";
                  const demo = isAll 
                    ? getAggregatedDemographics(demographics, platforms) 
                    : demographics[platformFilter.toLowerCase()];

                  const hasNoData = !demo;
                  const activeDemo = demo || getDemographicsForPlatform(isAll ? "all" : platformFilter);

                  return (
                    <div className="relative rounded-2xl overflow-hidden min-h-[340px]">
                      {/* Blurred/grayscale visual preview */}
                      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${
                        hasNoData ? "filter grayscale opacity-25 blur-[0.5px] pointer-events-none select-none" : ""
                      }`}>
                        
                        {/* Column 1: Gender & Age (Umur & Gender) */}
                        <div className="bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Users size={15} className="text-blue-600" />
                              <h5 className="text-[13px] font-extrabold text-gray-900 m-0 tracking-tight">Umur & Gender</h5>
                            </div>

                            {/* Gender Split Bar */}
                            <div className="mb-6">
                              <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                                <span className="flex items-center gap-1">👩 Wanita <span className="text-pink-600">{activeDemo.gender?.female || 0}%</span></span>
                                <span className="flex items-center gap-1">👨 Pria <span className="text-blue-600">{activeDemo.gender?.male || 0}%</span></span>
                              </div>
                              <div className="flex h-3 rounded-full overflow-hidden bg-black/[0.04]">
                                <div className="bg-pink-500 h-full transition-all duration-500" style={{ width: `${activeDemo.gender?.female || 0}%` }} />
                                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${activeDemo.gender?.male || 0}%` }} />
                              </div>
                            </div>

                            {/* Age Groups List */}
                            <div className="space-y-3">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Kelompok Umur</span>
                              {(activeDemo.age || []).map((item: any) => (
                                <div key={item.range} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-700">{item.range}</span>
                                    <span className="font-extrabold text-gray-900">{item.value}%</span>
                                  </div>
                                  <div className="h-2 bg-black/[0.03] rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${item.value}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Top Locations (Kota & Negara) */}
                        <div className="bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Globe size={15} className="text-blue-600" />
                              <h5 className="text-[13px] font-extrabold text-gray-900 m-0 tracking-tight">Lokasi Teratas</h5>
                            </div>

                            {/* Cities List */}
                            <div className="space-y-3 mb-6">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Kota Utama</span>
                              {(activeDemo.cities || []).map((city: any) => (
                                <div key={city.name} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-700">{city.name || "-"}</span>
                                    <span className="font-extrabold text-gray-900">{city.percentage}%</span>
                                  </div>
                                  <div className="h-2 bg-black/[0.03] rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${city.percentage * 2}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Countries List */}
                            <div className="space-y-2.5">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Negara Utama</span>
                              {(activeDemo.countries || []).map((country: any) => (
                                <div key={country.name} className="flex justify-between items-center text-xs py-1 border-b border-black/[0.02] last:border-0">
                                  <span className="font-bold text-gray-700 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    {country.name || "-"}
                                  </span>
                                  <span className="font-extrabold text-gray-900">{country.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Interests & Devices (Minat & Perangkat) */}
                        <div className="bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Heart size={15} className="text-blue-600" />
                              <h5 className="text-[13px] font-extrabold text-gray-900 m-0 tracking-tight">Minat & Perangkat</h5>
                            </div>

                            {/* Interests List */}
                            <div className="space-y-3 mb-6">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Top Minat Audiens</span>
                              {(activeDemo.interests || []).map((interest: any) => (
                                <div key={interest.name} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-700 truncate max-w-[70%]">{interest.name || "-"}</span>
                                    <span className="font-extrabold text-gray-900">{interest.percentage}%</span>
                                  </div>
                                  <div className="h-2 bg-black/[0.03] rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${interest.percentage * 2}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Devices List */}
                            <div className="space-y-2.5">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Perangkat / Device</span>
                              {(activeDemo.devices || []).map((device: any) => (
                                <div key={device.name} className="flex items-center justify-between text-xs bg-white border border-black/[0.03] p-2 rounded-xl">
                                  <span className="font-bold text-gray-700 flex items-center gap-2">
                                    <Smartphone size={13} className="text-gray-400" />
                                    {device.name || "-"}
                                  </span>
                                  <span className="font-extrabold text-gray-900">{device.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* No Data Overlay */}
                      {hasNoData && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-black/5 backdrop-blur-[0.5px]">
                          <div className="bg-white/95 shadow-xl border border-black/[0.05] p-6 sm:p-8 rounded-2xl max-w-sm flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="bg-blue-50 text-blue-600 p-3.5 rounded-full mb-3.5">
                              <Users size={28} />
                            </div>
                            <h5 className="font-extrabold text-gray-900 text-sm tracking-tight m-0">Tidak Ada Data Demografi</h5>
                            <p className="text-xs text-gray-500 mt-2 mb-4 leading-relaxed max-w-xs">
                              {isAll 
                                ? "Belum ada data demografi yang diisi di platform manapun. Klik tombol di bawah untuk mulai mengisi data demografi Anda."
                                : `Belum ada data demografi yang diisi untuk platform ${platformFilter}. Silakan isi data secara manual menggunakan tombol di bawah.`}
                            </p>
                            <button 
                              onClick={() => {
                                const initialTemp = JSON.parse(JSON.stringify(demographics));
                                setTempDemographics(initialTemp);

                                const firstPlatform = platforms[0];
                                const startPlatform = isAll 
                                  ? (typeof firstPlatform === 'string' ? firstPlatform : (firstPlatform?.name || "TikTok")) 
                                  : platformFilter;
                                setEditingPlatform(startPlatform);
                                
                                const current = initialTemp[startPlatform.toLowerCase()] || null;
                                setEditDemoData(current ? JSON.parse(JSON.stringify(current)) : getBlankDemographics(startPlatform));
                                
                                setIsDemoModalOpen(true);
                              }}
                              className="px-4.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg border-none"
                            >
                              Isi Data Demografi
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}


        </div>
      </div>

      {/* DEMOGRAPHICS EDITING MODAL */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-black/[0.03] flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-950 m-0 tracking-tight flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-blue-600" />
                    <span>Edit Demografi Audiens</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Sesuaikan persebaran demografi per platform. Perubahan disimpan secara offline di browser Anda.</p>
                </div>
                <button 
                  onClick={() => setIsDemoModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/[0.05] text-gray-400 hover:text-gray-900 transition-colors border-none cursor-pointer bg-transparent"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Platform Selector Row inside Modal */}
              <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Pilih Platform untuk Diedit:</span>
                  <div className="relative">
                    <select 
                      value={editingPlatform}
                      onChange={(e) => {
                        const nextPlatform = e.target.value;
                        const updatedTemp = {
                          ...tempDemographics,
                          [editingPlatform.toLowerCase()]: editDemoData
                        };
                        setTempDemographics(updatedTemp);
                        setEditingPlatform(nextPlatform);
                        const loadedData = updatedTemp[nextPlatform.toLowerCase()] !== undefined
                          ? updatedTemp[nextPlatform.toLowerCase()]
                          : (demographics[nextPlatform.toLowerCase()] || null);
                        setEditDemoData(loadedData ? JSON.parse(JSON.stringify(loadedData)) : getBlankDemographics(nextPlatform));
                      }}
                      className="bg-white border border-black/10 hover:border-blue-500 rounded-xl px-3.5 py-1.5 text-xs font-bold text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                    >
                      {platforms.map((p: any) => {
                        const name = typeof p === 'string' ? p : p.name;
                        return (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-100/50 px-3 py-1 rounded-full border border-blue-200/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>Mengedit data untuk: <strong className="text-blue-900 font-extrabold">{editingPlatform}</strong></span>
                </div>
              </div>

              {/* Modal Body - Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/[0.1] [&::-webkit-scrollbar-thumb]:rounded-full">
                
                {editDemoData && (
                  <>
                    {/* 1. GENDER (JENIS KELAMIN) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>1. Jenis Kelamin (Gender Split)</span>
                  </h4>
                  <div className="bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02] space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-pink-600">👩 Wanita: {editDemoData.gender.female}%</span>
                      <span className="text-blue-600">👨 Pria: {editDemoData.gender.male}%</span>
                    </div>
                    {/* Horizontal Bar Visualizer */}
                    <div className="flex h-4 rounded-full overflow-hidden bg-black/[0.04]">
                      <div className="bg-pink-500 h-full transition-all" style={{ width: `${editDemoData.gender.female}%` }} />
                      <div className="bg-blue-500 h-full transition-all" style={{ width: `${editDemoData.gender.male}%` }} />
                    </div>
                    {/* Real-time Slider */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 block">Geser untuk mengatur persentase Wanita (Pria otomatis menyesuaikan):</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={editDemoData.gender.female}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setEditDemoData((prev: any) => ({
                            ...prev,
                            gender: {
                              female: val,
                              male: 100 - val
                            }
                          }));
                        }}
                        className="w-full h-1.5 bg-black/[0.05] rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. AGE GROUPS (KELOMPOK UMUR) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>2. Kelompok Umur</span>
                    </h4>
                    {/* Sum Tracker */}
                    {(() => {
                      const totalAge = editDemoData.age.reduce((acc: number, item: any) => acc + (parseInt(item.value) || 0), 0);
                      return (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${totalAge === 100 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"}`}>
                          Total: {totalAge}% {totalAge !== 100 && "(Harus 100%)"}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02]">
                    {editDemoData.age.map((item: any, idx: number) => (
                      <div key={item.range} className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 block">{item.range}</label>
                        <div className="relative flex items-center">
                          <input 
                            type="number" 
                            min="0"
                            max="100"
                            value={item.value}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              const newAge = [...editDemoData.age];
                              newAge[idx] = { ...newAge[idx], value: val };
                              setEditDemoData((prev: any) => ({ ...prev, age: newAge }));
                            }}
                            className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-7 py-2.5 text-sm font-bold text-gray-900 outline-none transition-all"
                          />
                          <span className="absolute right-3 text-xs text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. LOCATIONS & INTERESTS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* CITIES */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>3. Kota Teratas</span>
                      </h4>
                      {(() => {
                        const total = editDemoData.cities.reduce((acc: number, item: any) => acc + (parseInt(item.percentage) || 0), 0);
                        return <span className="text-[10px] font-bold text-gray-400">Total: {total}%</span>;
                      })()}
                    </div>
                    <div className="bg-black/[0.01] p-4 rounded-2xl border border-black/[0.02] space-y-3">
                      {editDemoData.cities.map((city: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={city.name}
                            placeholder={`Kota ${idx+1}`}
                            onChange={(e) => {
                              const newCities = [...editDemoData.cities];
                              newCities[idx] = { ...newCities[idx], name: e.target.value };
                              setEditDemoData((prev: any) => ({ ...prev, cities: newCities }));
                            }}
                            className="flex-1 min-w-0 bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                          />
                          <div className="relative w-20 shrink-0">
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={city.percentage}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                const newCities = [...editDemoData.cities];
                                newCities[idx] = { ...newCities[idx], percentage: val };
                                setEditDemoData((prev: any) => ({ ...prev, cities: newCities }));
                              }}
                              className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-6 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COUNTRIES */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>4. Negara Teratas</span>
                      </h4>
                      {(() => {
                        const total = editDemoData.countries.reduce((acc: number, item: any) => acc + (parseInt(item.percentage) || 0), 0);
                        return <span className="text-[10px] font-bold text-gray-400">Total: {total}%</span>;
                      })()}
                    </div>
                    <div className="bg-black/[0.01] p-4 rounded-2xl border border-black/[0.02] space-y-3">
                      {editDemoData.countries.map((country: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={country.name}
                            placeholder={`Negara ${idx+1}`}
                            onChange={(e) => {
                              const newCountries = [...editDemoData.countries];
                              newCountries[idx] = { ...newCountries[idx], name: e.target.value };
                              setEditDemoData((prev: any) => ({ ...prev, countries: newCountries }));
                            }}
                            className="flex-1 min-w-0 bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                          />
                          <div className="relative w-20 shrink-0">
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={country.percentage}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                const newCountries = [...editDemoData.countries];
                                newCountries[idx] = { ...newCountries[idx], percentage: val };
                                setEditDemoData((prev: any) => ({ ...prev, countries: newCountries }));
                              }}
                              className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-6 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INTERESTS */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>5. Minat Audiens</span>
                      </h4>
                      {(() => {
                        const total = editDemoData.interests.reduce((acc: number, item: any) => acc + (parseInt(item.percentage) || 0), 0);
                        return <span className="text-[10px] font-bold text-gray-400">Total: {total}%</span>;
                      })()}
                    </div>
                    <div className="bg-black/[0.01] p-4 rounded-2xl border border-black/[0.02] space-y-3">
                      {editDemoData.interests.map((interest: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            value={interest.name}
                            placeholder={`Kategori Minat ${idx+1}`}
                            onChange={(e) => {
                              const newInts = [...editDemoData.interests];
                              newInts[idx] = { ...newInts[idx], name: e.target.value };
                              setEditDemoData((prev: any) => ({ ...prev, interests: newInts }));
                            }}
                            className="flex-1 min-w-0 bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                          />
                          <div className="relative w-20 shrink-0">
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={interest.percentage}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                const newInts = [...editDemoData.interests];
                                newInts[idx] = { ...newInts[idx], percentage: val };
                                setEditDemoData((prev: any) => ({ ...prev, interests: newInts }));
                              }}
                              className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-6 py-2 text-xs font-bold text-gray-900 outline-none transition-all"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* 4. DEVICES */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>6. Perangkat / Devices</span>
                    </h4>
                    {(() => {
                      const totalDevices = editDemoData.devices.reduce((acc: number, item: any) => acc + (parseInt(item.percentage) || 0), 0);
                      return (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${totalDevices === 100 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"}`}>
                          Total: {totalDevices}% {totalDevices !== 100 && "(Harus 100%)"}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02]">
                    {editDemoData.devices.map((device: any, idx: number) => (
                      <div key={device.name} className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 block">{device.name}</label>
                        <div className="relative flex items-center">
                          <input 
                            type="number" 
                            min="0"
                            max="100"
                            value={device.percentage}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                              const newDevs = [...editDemoData.devices];
                              newDevs[idx] = { ...newDevs[idx], percentage: val };
                              setEditDemoData((prev: any) => ({ ...prev, devices: newDevs }));
                            }}
                            className="w-full bg-black/[0.03] border-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl pl-3 pr-7 py-2.5 text-sm font-bold text-gray-900 outline-none transition-all"
                          />
                          <span className="absolute right-3 text-xs text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                  </>
                )}

              </div>

              {/* Modal Footer (Sticky Bottom Action Bar) */}
              <div className="p-5 bg-gray-50 border-t border-black/[0.03] flex justify-end items-center shrink-0">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsDemoModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-black/[0.03] rounded-xl cursor-pointer transition-all border-none bg-transparent"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      const finalTemp = {
                        ...tempDemographics,
                        [editingPlatform.toLowerCase()]: editDemoData
                      };
                      setDemographics(finalTemp);
                      localStorage.setItem("hubify_custom_demographics", JSON.stringify(finalTemp));
                      setIsDemoModalOpen(false);
                    }}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg border-none"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRINT CONFIGURATION MODAL */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl w-full max-w-[95vw] lg:max-w-[90vw] h-[90vh] md:h-[92vh] shadow-2xl flex flex-col overflow-hidden text-gray-900 font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="py-3 px-6 border-b border-black/[0.03] flex items-center justify-between shrink-0 bg-white">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-950 m-0 tracking-tight flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect><polyline points="6 9 6 2 18 2 18 9"></polyline></svg>
                    <span>Studio Konfigurasi & Simpan PDF</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Atur preferensi laporan dan unduh dokumen PDF secara real-time.</p>
                </div>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-black/[0.05] text-gray-400 hover:text-gray-900 transition-colors border-none cursor-pointer bg-transparent"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Split Body Layout */}
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
                {/* Left Panel: Controls */}
                <div className="w-full lg:w-[380px] shrink-0 overflow-y-auto p-6 border-r border-black/[0.03] flex flex-col gap-6 text-left bg-white">
                  {/* 1. Platforms */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">1. Pilih Platform</label>
                      <button
                        onClick={() => {
                          if (printPlatforms.length === platformNames.length) {
                            setPrintPlatforms([]);
                          } else {
                            setPrintPlatforms(platformNames);
                          }
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-transparent border-none cursor-pointer"
                      >
                        {printPlatforms.length === platformNames.length ? "Hapus Semua" : "Pilih Semua"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {platformNames.map((name: string) => {
                        const isSelected = printPlatforms.includes(name);
                        return (
                          <button
                            key={name}
                            onClick={() => {
                              if (isSelected) {
                                setPrintPlatforms(printPlatforms.filter(p => p !== name));
                              } else {
                                setPrintPlatforms([...printPlatforms, name]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                : "bg-black/[0.03] border-transparent text-gray-700 hover:bg-black/[0.06]"
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Date Range */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-2">2. Rentang Waktu</label>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {[
                        { id: "7d", label: "7 Hari Terakhir" },
                        { id: "28d", label: "28 Hari Terakhir" },
                        { id: "tm", label: "Bulan Ini" },
                        { id: "lm", label: "Bulan Lalu" },
                        { id: "custom", label: "Rentang Kustom" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setPrintDateRange(opt.id)}
                          className={`px-3 py-2 rounded-xl text-[11px] font-semibold text-left transition-all border cursor-pointer ${
                            printDateRange === opt.id
                              ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {printDateRange === "custom" && (
                      <div className="grid grid-cols-2 gap-2 p-3 bg-black/[0.02] rounded-2xl border border-black/[0.04] mt-2">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Mulai</label>
                          <input
                            type="date"
                            value={printCustomS}
                            onChange={(e) => setPrintCustomS(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Sampai</label>
                          <input
                            type="date"
                            value={printCustomE}
                            onChange={(e) => setPrintCustomE(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Sections to Include */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-800 uppercase tracking-wider mb-2">3. Bagian Laporan</label>
                    <div className="flex flex-col gap-1.5 bg-black/[0.01] p-3 rounded-2xl border border-black/[0.03]">
                      {[
                        { id: "overview", label: "Ringkasan Kinerja (Overview)", desc: "Menampilkan performa total views, reach, dan engagement rate." },
                        { id: "content", label: "Performa Konten Terpopuler", desc: "Menampilkan 5 konten dengan engagement tertinggi." },
                        { id: "trends", label: "Tren & Pertumbuhan", desc: "Grafik historis kinerja performa media sosial." },
                        { id: "audience", label: "Demografi & Aktivitas Audiens", desc: "Data gender, umur, negara, kota, dan jam aktif audiens." }
                      ].map((sec) => (
                        <label key={sec.id} className="flex items-start gap-3 p-2 hover:bg-black/[0.02] rounded-xl cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={(printSections as any)[sec.id]}
                            onChange={(e) => setPrintSections({ ...printSections, [sec.id]: e.target.checked })}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <span className="block text-[11px] font-bold text-gray-900">{sec.label}</span>
                            <span className="block text-[9px] text-gray-500 mt-0.5">{sec.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Live Visual Report Preview */}
                <div className="hidden lg:flex flex-1 bg-slate-900 flex-col overflow-hidden relative border-l border-white/[0.04]">
                  {/* Toolbar */}
                  <div className="h-14 border-b border-white/[0.06] bg-slate-950 px-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">Live Preview Laporan</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Zoom controls */}
                      <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg p-1">
                        <button
                          onClick={() => setManualZoom(prev => Math.max((prev || previewScale) - 0.2, 0.3))}
                          className="p-1 rounded-md hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border-none flex items-center justify-center"
                          title="Zoom Out"
                        >
                          <ZoomOut size={14} />
                        </button>
                        <span className="text-[10px] font-bold text-slate-300 min-w-[36px] text-center">
                          {Math.round((manualZoom || previewScale) * 100)}%
                        </span>
                        <button
                          onClick={() => setManualZoom(prev => Math.min((prev || previewScale) + 0.2, 3))}
                          className="p-1 rounded-md hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border-none flex items-center justify-center"
                          title="Zoom In"
                        >
                          <ZoomIn size={14} />
                        </button>
                        <button
                          onClick={() => setManualZoom(null)}
                          className="p-1 ml-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border-none flex items-center justify-center text-[10px] font-bold"
                          title="Reset Zoom"
                        >
                          Fit
                        </button>
                      </div>

                      <div className="w-px h-4 bg-slate-700" />

                      {/* Page navigators */}
                      <div className="flex items-center gap-3">
                        <button
                          disabled={previewPageIndex === 0}
                          onClick={() => setPreviewPageIndex(prev => Math.max(0, prev - 1))}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer border-none flex items-center justify-center"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-[11px] font-extrabold text-slate-300">
                          Hal {previewPageIndex + 1} dari {selectedPages.length}
                        </span>
                        <button
                          disabled={previewPageIndex === selectedPages.length - 1}
                          onClick={() => setPreviewPageIndex(prev => Math.min(selectedPages.length - 1, prev + 1))}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer border-none flex items-center justify-center"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="w-px h-4 bg-slate-700 mx-1" />

                      {/* Print Button */}
                      <button
                        onClick={handleExecutePrint}
                        disabled={isGeneratingPDF}
                        className={`px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer transition-all border-none flex items-center gap-1.5 ${isGeneratingPDF ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isGeneratingPDF ? (
                          <>
                            <svg className="animate-spin text-white" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                            <span>Menyimpan PDF...</span>
                          </>
                        ) : (
                          <>
                            <Download size={14} className="text-white" />
                            <span>Simpan PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Active Page Name */}
                  <div className="bg-slate-950/40 py-2 px-5 border-b border-white/[0.03] flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Seksi Dokumen:</span>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">
                      {selectedPages[previewPageIndex]?.title || "Halaman Sampul"}
                    </span>
                  </div>

                  {/* Canvas Viewport */}
                  <div className="flex-1 overflow-auto p-6 flex bg-slate-950/70 relative" ref={previewContainerRef}>
                    {printData ? (
                      <div className="relative flex-shrink-0 m-auto" style={{ width: 395 * (manualZoom || previewScale), height: 558 * (manualZoom || previewScale) }}>
                        <div 
                          className="absolute top-0 left-0 origin-top-left transition-all duration-300 select-none"
                          style={{ 
                            transform: `scale(${manualZoom || previewScale})`,
                            width: "395px",
                            height: "558px"
                          }}
                        >
                          {/* Scaled A4 Sheet representation */}
                          <div 
                            className="w-[395px] h-[558px] bg-white rounded-xl shadow-2xl p-6 flex flex-col justify-between text-gray-800 border border-gray-100 relative overflow-hidden text-left"
                            style={{ fontSize: "10px" }}
                          >
                            {/* 1. Cover Page */}
                            {selectedPages[previewPageIndex]?.id === "cover" && (
                              <div className="h-full flex flex-col justify-between">
                                <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                                  <span className="text-xs font-black tracking-widest text-blue-600">HUBIFY</span>
                                  <span className="text-[9px] font-bold text-gray-400">ANALISIS MEDIA SOSIAL</span>
                                </div>
                                
                                <div className="my-auto py-4">
                                  <div className="w-10 h-1 bg-blue-600 mb-4 rounded-full" />
                                  <h1 className="text-xl font-black tracking-tight text-gray-950 uppercase leading-snug mb-1.5">
                                    Laporan Kinerja<br />Media Sosial
                                  </h1>
                                  <p className="text-[10px] text-gray-500 font-medium tracking-wide max-w-xs leading-relaxed">
                                    Analisis komprehensif performa platform, keterlibatan konten, pertumbuhan tren, dan demografi audiens.
                                  </p>
                                </div>
                                
                                <div className="border-t border-gray-150 pt-3 grid grid-cols-2 gap-4 text-[9px]">
                                  <div>
                                    <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">DIPERSIAPKAN UNTUK</span>
                                    <span className="block font-black text-gray-900">Hubify Social Manager</span>
                                    <span className="block text-gray-400 mt-0.5">Laporan Lintas Platform</span>
                                  </div>
                                  <div>
                                    <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">METADATA LAPORAN</span>
                                    <div className="flex flex-col gap-0.5 text-gray-500">
                                      <div className="truncate">Platform: <span className="font-extrabold text-gray-800">{(printPlatforms || []).join(", ") || "Semua"}</span></div>
                                      <div>Periode: <span className="font-extrabold text-gray-800">{printData.rangeLabel}</span></div>
                                      <div>Dicetak: <span className="font-extrabold text-gray-800">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 2. Overview Page */}
                            {selectedPages[previewPageIndex]?.id === "overview" && (
                              <div className="h-full flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                                    <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                                    <span className="text-[8px] font-bold text-gray-500">{printData.rangeLabel}</span>
                                  </div>
                                  
                                  <h2 className="text-xs font-black text-gray-950 uppercase tracking-tight mb-0.5">1. Ringkasan Kinerja Utama</h2>
                                  <p className="text-[9px] text-gray-400 mb-2">Pencapaian performa akumulatif postingan organik dan kampanye iklan.</p>
                                  
                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="p-2.5 rounded-xl bg-gray-50/50 border border-black/[0.03]">
                                      <span className="block text-[7.5px] font-bold text-gray-400 uppercase tracking-wider">Total Postingan</span>
                                      <span className="text-sm font-black text-gray-900 mt-0.5 block">{printData.totalPosts} <span className="text-[9px] text-gray-400 font-normal">konten</span></span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-blue-50/40 border border-blue-100/30">
                                      <span className="block text-[7.5px] font-bold text-blue-500 uppercase tracking-wider">Average Engagement</span>
                                      <span className="text-sm font-black text-blue-600 mt-0.5 block">{printData.engagementRate}%</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-gray-50/50 border border-black/[0.03]">
                                      <span className="block text-[7.5px] font-bold text-gray-400 uppercase tracking-wider">Total Impressions</span>
                                      <span className="text-sm font-black text-gray-900 mt-0.5 block">{printData.totalViews.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-gray-50/50 border border-black/[0.03]">
                                      <span className="block text-[7.5px] font-bold text-gray-400 uppercase tracking-wider">Total Reach</span>
                                      <span className="text-sm font-black text-gray-900 mt-0.5 block">{printData.totalReach.toLocaleString('id-ID')}</span>
                                    </div>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-gray-50 border border-black/[0.02] mb-3 text-[9px]">
                                    <h4 className="font-extrabold text-gray-800 mb-1.5 uppercase tracking-wider text-[7.5px]">Rincian Interaksi Sosial</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <span className="block text-[8px] text-gray-400 font-bold">Suka (Likes)</span>
                                        <span className="font-extrabold text-gray-900">{printData.totalLikes.toLocaleString('id-ID')}</span>
                                      </div>
                                      <div>
                                        <span className="block text-[8px] text-gray-400 font-bold">Komentar</span>
                                        <span className="font-extrabold text-gray-900">{printData.totalComments.toLocaleString('id-ID')}</span>
                                      </div>
                                      <div>
                                        <span className="block text-[8px] text-gray-400 font-bold">Bagikan (Shares)</span>
                                        <span className="font-extrabold text-gray-900">{printData.totalShares.toLocaleString('id-ID')}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-blue-50/30 border border-blue-100/20 text-[8.5px] text-gray-600 leading-relaxed">
                                    <div className="flex items-center gap-1 mb-1 text-blue-800 font-black uppercase text-[7.5px]">
                                      <Sparkles size={10} className="text-blue-600" />
                                      <span>Analisis Inteligensi Laporan</span>
                                    </div>
                                    <div className="line-clamp-4 text-gray-600">
                                      {aiInsight ? (
                                        aiInsight.replace(/[#*`]/g, '')
                                      ) : (
                                        `Aktivitas media sosial di seluruh platform menunjukkan tingkat keterlibatan (engagement rate) yang stabil sebesar ${printData.engagementRate}%. Jangkauan (reach) menyentuh angka ${printData.totalReach.toLocaleString('id-ID')} akun unik dengan total views ${printData.totalViews.toLocaleString('id-ID')}. Hal ini mengindikasikan respon positif dari audiens.`
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border-t border-gray-100 pt-1.5 text-center text-[7.5px] text-gray-400 flex justify-between shrink-0">
                                  <span>Hubify Analytics System</span>
                                  <span>Halaman 2</span>
                                </div>
                              </div>
                            )}

                            {/* 3. Content Page */}
                            {selectedPages[previewPageIndex]?.id === "content" && (
                              <div className="h-full flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                                    <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                                    <span className="text-[8px] font-bold text-gray-500">{printData.rangeLabel}</span>
                                  </div>
                                  
                                  <h2 className="text-xs font-black text-gray-950 uppercase tracking-tight mb-0.5">2. Analisis Kinerja Konten</h2>
                                  <p className="text-[9px] text-gray-400 mb-3">Daftar konten terpopuler diurutkan berdasarkan skor keterlibatan tertinggi.</p>
                                  
                                  <div className="border border-gray-100 rounded-xl overflow-hidden mb-3 bg-white">
                                    <table className="w-full text-left border-collapse text-[8.5px]">
                                      <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-[7.5px] font-bold text-gray-500 uppercase tracking-wider">
                                          <th className="py-1.5 px-2 w-8 text-center">No</th>
                                          <th className="py-1.5 px-2">Keterangan Konten</th>
                                          <th className="py-1.5 px-2 text-center w-14">Platform</th>
                                          <th className="py-1.5 px-2 text-right w-16">Engagement</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {printData.topPosts.length === 0 ? (
                                          <tr>
                                            <td colSpan={4} className="py-6 text-center text-gray-400">Tidak ada konten di periode ini.</td>
                                          </tr>
                                        ) : (
                                          printData.topPosts.slice(0, 4).map((post: any, index: number) => {
                                            const getR = (c: any) => (c.metrics?.reach || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.reach || 0 : 0);
                                            const getEng = (c: any) => eng(c.metrics) + (c.isAds || adsFilter === "all" ? eng(c.adsMetrics || {}) : 0);
                                            const erVal = getR(post) > 0 ? ((getEng(post) / getR(post)) * 100).toFixed(1) : "0.0";
                                            
                                            return (
                                              <tr key={post.id || index} className="border-b border-gray-100 last:border-none">
                                                <td className="py-1.5 px-2 text-center text-gray-400 font-bold">{index + 1}</td>
                                                <td className="py-1.5 px-2 truncate max-w-[120px] font-extrabold text-gray-900">{post.caption || post.title || "Konten Media Sosial"}</td>
                                                <td className="py-1.5 px-2 text-center">
                                                  <span className="inline-block px-1.5 py-0.5 rounded-full text-[7px] font-extrabold bg-blue-50 text-blue-700 capitalize">{post.platform}</span>
                                                </td>
                                                <td className="py-1.5 px-2 text-right font-black text-gray-900">{getEng(post).toLocaleString('id-ID')} <span className="text-[7px] text-blue-600 font-normal">({erVal}%)</span></td>
                                              </tr>
                                            );
                                          })
                                        )}
                                      </tbody>
                                    </table>
                                  </div>

                                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[8.5px] text-gray-500 leading-relaxed">
                                    <span className="block font-bold text-gray-800 mb-0.5">Analisis Kinerja Konten:</span>
                                    Format visual interaktif dan caption yang interaktif (call to action terarah) memiliki korelasi kuat dengan tingginya skor interaksi audiens.
                                  </div>
                                </div>
                                
                                <div className="border-t border-gray-150 pt-1.5 text-center text-[7.5px] text-gray-400 flex justify-between shrink-0">
                                  <span>Hubify Analytics System</span>
                                  <span>Halaman 3</span>
                                </div>
                              </div>
                            )}

                            {/* 4. Trends Page */}
                            {selectedPages[previewPageIndex]?.id === "trends" && (
                              <div className="h-full flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                                    <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                                    <span className="text-[8px] font-bold text-gray-500">{printData.rangeLabel}</span>
                                  </div>
                                  
                                  <h2 className="text-xs font-black text-gray-950 uppercase tracking-tight mb-0.5">3. Tren & Pertumbuhan Kinerja</h2>
                                  <p className="text-[9px] text-gray-400 mb-2">Kurva pertumbuhan jangkauan dan interaksi lintas platform.</p>
                                  
                                  {/* Historical Chart Grid */}
                                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                                    {activeMetrics.slice(0, 4).map((k) => (
                                      <div key={k} className="p-2 rounded-xl border border-gray-100 bg-white">
                                        <span className="block text-[6px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 text-center">
                                          {METRICS_META[k]?.label || k}
                                        </span>
                                        <div className="w-full h-[60px] relative">
                                          {printData.timelineData && printData.timelineData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                              <LineChart data={printData.timelineData.slice(-10)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                                <XAxis dataKey="date" tick={{ fontSize: 5, fill: "#9ca3af" }} />
                                                <YAxis tick={{ fontSize: 5, fill: "#9ca3af" }} width={15} />
                                                <Line type="monotone" dataKey={k} stroke={METRICS_META[k]?.color || "#2563eb"} strokeWidth={1} dot={false} />
                                              </LineChart>
                                            </ResponsiveContainer>
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[6px]">Data tidak tersedia</div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                                    <div className="p-2 rounded-xl border border-gray-100 bg-gray-50/50">
                                      <span className="block text-[7.5px] font-bold text-gray-400 uppercase">Rata-rata Views</span>
                                      <span className="text-xs font-black text-gray-800 mt-0.5 block">
                                        {printData.totalPosts > 0 ? Math.round(printData.totalViews / printData.totalPosts).toLocaleString('id-ID') : "0"} /post
                                      </span>
                                    </div>
                                    <div className="p-2 rounded-xl border border-gray-100 bg-gray-50/50">
                                      <span className="block text-[7.5px] font-bold text-gray-400 uppercase">Rata-rata Interaksi</span>
                                      <span className="text-xs font-black text-gray-800 mt-0.5 block">
                                        {printData.totalPosts > 0 ? Math.round(printData.totalEngagement / printData.totalPosts).toLocaleString('id-ID') : "0"} /post
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="border-t border-gray-150 pt-1.5 text-center text-[7.5px] text-gray-400 flex justify-between shrink-0">
                                  <span>Hubify Analytics System</span>
                                  <span>Halaman 4</span>
                                </div>
                              </div>
                            )}

                            {/* 5. Audience Page */}
                            {selectedPages[previewPageIndex]?.id === "audience" && (
                              <div className="h-full flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                                    <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                                    <span className="text-[8px] font-bold text-gray-500">{printData.rangeLabel}</span>
                                  </div>
                                  
                                  <h2 className="text-xs font-black text-gray-950 uppercase tracking-tight mb-0.5">4. Analisis Demografi Audiens</h2>
                                  <p className="text-[9px] text-gray-400 mb-2">Distribusi gender, demografi kelompok usia, dan ketertarikan minat teratas.</p>
                                  
                                  {printData.demographics ? (
                                    <div className="flex flex-col gap-2 text-[8.5px]">
                                      <div className="p-2 rounded-xl border border-gray-100 bg-white">
                                        <h4 className="text-[7.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Distribusi Gender</h4>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[8px] text-pink-500 font-extrabold">{printData.demographics.gender?.female || 50}% Wanita</span>
                                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-pink-500" style={{ width: `${printData.demographics.gender?.female || 50}%` }}></div>
                                            <div className="h-full bg-blue-500 flex-1"></div>
                                          </div>
                                          <span className="text-[8px] text-blue-500 font-extrabold">{printData.demographics.gender?.male || 50}% Pria</span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 rounded-xl border border-gray-100 bg-white">
                                          <h4 className="text-[7.5px] font-bold text-gray-500 uppercase mb-1">Usia Terbanyak</h4>
                                          <div className="flex flex-col gap-0.5">
                                            {(printData.demographics.age || []).slice(0, 3).map((item: any) => (
                                              <div key={item.range} className="flex items-center justify-between">
                                                <span className="text-gray-400">{item.range}</span>
                                                <span className="font-extrabold text-gray-800">{item.value}%</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="p-2 rounded-xl border border-gray-100 bg-white">
                                          <h4 className="text-[7.5px] font-bold text-gray-500 uppercase mb-1">Negara Teratas</h4>
                                          <div className="flex flex-col gap-0.5">
                                            {(printData.demographics.countries || []).slice(0, 3).map((item: any) => (
                                              <div key={item.name} className="flex items-center justify-between">
                                                <span className="text-gray-400 truncate max-w-[50px]">{item.name}</span>
                                                <span className="font-extrabold text-gray-800">{item.percentage}%</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[8px] text-gray-500 leading-relaxed">
                                        <span className="block font-bold text-gray-800 mb-0.5">Rekomendasi Konten Audiens:</span>
                                        Sesuaikan tone-of-voice agar bernuansa kasual & solutif guna meraih kecocokan demografi usia utama.
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-6 text-center text-gray-400 text-[8.5px]">Data demografi tidak tersedia.</div>
                                  )}
                                </div>
                                
                                <div className="border-t border-gray-150 pt-1.5 text-center text-[7.5px] text-gray-400 flex justify-between shrink-0">
                                  <span>Hubify Analytics System</span>
                                  <span>Halaman 5</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Folder rings decoration */}
                          <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 flex flex-col gap-14 pointer-events-none">
                            <div className="w-4 h-2 bg-slate-800/80 rounded-full border border-slate-700/60 shadow-lg" />
                            <div className="w-4 h-2 bg-slate-800/80 rounded-full border border-slate-700/60 shadow-lg" />
                            <div className="w-4 h-2 bg-slate-800/80 rounded-full border border-slate-700/60 shadow-lg" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                        <svg className="animate-spin text-blue-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                        <span>Menyiapkan preview halaman...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NATIVE HIGH-FIDELITY PRINTABLE REPORT */}
      {isPrintReady && printData && (
        <div id="print-report-container" className="hidden print:block bg-white text-gray-900 text-left p-0 m-0">
          
          {/* COVER PAGE */}
          <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2.5cm" }}>
            <div className="flex justify-between items-center border-b border-gray-150 pb-6">
              <span className="text-sm font-extrabold tracking-widest text-blue-600">HUBIFY</span>
              <span className="text-xs font-semibold text-gray-400">LAPORAN ANALISIS MEDIA SOSIAL</span>
            </div>
            
            <div className="my-auto py-12">
              <div className="w-16 h-1.5 bg-blue-600 mb-8 rounded-full" />
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 uppercase leading-tight mb-4" style={{ fontSize: "38px" }}>
                Laporan Kinerja<br />Media Sosial
              </h1>
              <p className="text-lg text-gray-500 font-medium tracking-wide max-w-md">
                Analisis komprehensif performa platform, keterlibatan konten, pertumbuhan tren, dan demografi audiens.
              </p>
            </div>
            
            <div className="border-t border-gray-150 pt-8 grid grid-cols-2 gap-8 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">DIPERSIAPKAN UNTUK</span>
                <span className="block text-sm font-extrabold text-gray-900">Hubify Social Manager</span>
                <span className="block text-gray-500 mt-1">Laporan Kinerja Lintas Platform</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">METADATA LAPORAN</span>
                <div className="flex flex-col gap-1 text-gray-600">
                  <div>Platform: <span className="font-bold text-gray-900">{printPlatforms.join(", ")}</span></div>
                  <div>Periode: <span className="font-bold text-gray-900">{printData.rangeLabel}</span></div>
                  <div>Dicetak: <span className="font-bold text-gray-900">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE 1: RINGKASAN KINERJA (OVERVIEW) */}
          {printSections.overview && (
            <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2cm" }}>
              <div>
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                  <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                  <span className="text-xs font-bold text-gray-500">{printData.rangeLabel}</span>
                </div>
                
                <h2 className="text-xl font-extrabold text-gray-950 uppercase tracking-tight mb-2">1. Ringkasan Kinerja Utama</h2>
                <p className="text-xs text-gray-500 mb-6">Pencapaian performa akumulatif postingan organik dan kampanye iklan di platform terpilih.</p>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Postingan</span>
                    <span className="text-2xl font-extrabold text-gray-900">{printData.totalPosts} <span className="text-xs text-gray-400 font-normal">konten</span></span>
                    <span className="block text-[10px] text-gray-400 mt-1">{printData.publishedPosts} diterbitkan di periode ini</span>
                  </div>
                  <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-rata Engagement Rate</span>
                    <span className="text-2xl font-extrabold text-blue-600">{printData.engagementRate}%</span>
                    <span className="block text-[10px] text-gray-400 mt-1">Dihitung berdasarkan total keterlibatan per jangkauan</span>
                  </div>
                  <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Views / Impression</span>
                    <span className="text-2xl font-extrabold text-gray-900">{printData.totalViews.toLocaleString('id-ID')}</span>
                    <span className="block text-[10px] text-gray-400 mt-1">Akumulasi jumlah penayangan konten</span>
                  </div>
                  <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Jangkauan (Reach)</span>
                    <span className="text-2xl font-extrabold text-gray-900">{printData.totalReach.toLocaleString('id-ID')}</span>
                    <span className="block text-[10px] text-gray-400 mt-1">Akumulasi jumlah akun unik yang dijangkau</span>
                  </div>
                </div>

                {/* Submetrics list */}
                <div className="print-card p-5 rounded-2xl bg-gray-50 border border-gray-100 mb-8 text-xs">
                  <h4 className="font-extrabold text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Rincian Interaksi Sosial</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">Suka (Likes)</span>
                      <span className="text-sm font-extrabold text-gray-900">{printData.totalLikes.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">Komentar</span>
                      <span className="text-sm font-extrabold text-gray-900">{printData.totalComments.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">Bagikan (Shares)</span>
                      <span className="text-sm font-extrabold text-gray-900">{printData.totalShares.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="print-card p-5 rounded-2xl bg-blue-50/50 border border-blue-100/50 text-xs">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Sparkles size={14} className="text-blue-600" />
                    <h4 className="font-extrabold text-blue-900 uppercase tracking-wider text-[10px]">Analisis Inteligensi Laporan</h4>
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    {aiInsight ? (
                      <Markdown>{aiInsight}</Markdown>
                    ) : (
                      <p>
                        Berdasarkan data performa yang dianalisis, aktivitas media sosial di seluruh platform {printPlatforms.join(", ")} menunjukkan tingkat keterlibatan yang {parseFloat(printData.engagementRate) >= 5 ? "sangat kuat" : "stabil"} sebesar {printData.engagementRate}%. Jangkauan (reach) mencapai {printData.totalReach.toLocaleString('id-ID')} akun unik dengan total views {printData.totalViews.toLocaleString('id-ID')}. Hal ini mengindikasikan efektivitas penyebaran konten serta respon positif dari audiens target di periode ini. Rekomendasi utama adalah terus melakukan optimasi pada postingan dengan performa keterlibatan (engagement) yang tinggi untuk meningkatkan loyalitas audiens.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t border-gray-100 pt-3 text-center text-[9px] text-gray-400 flex justify-between">
                <span>Hubify Analytics System</span>
                <span>Halaman 2</span>
              </div>
            </div>
          )}

          {/* PAGE 2: PERFORMA KONTEN (CONTENT) */}
          {printSections.content && (
            <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2cm" }}>
              <div>
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                  <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                  <span className="text-xs font-bold text-gray-500">{printData.rangeLabel}</span>
                </div>
                
                <h2 className="text-xl font-extrabold text-gray-950 uppercase tracking-tight mb-2">2. Analisis Kinerja Konten</h2>
                <p className="text-xs text-gray-500 mb-6">Daftar konten terpopuler diurutkan berdasarkan skor keterlibatan (engagement) tertinggi.</p>
                
                {/* Top Posts Table */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4">Konten / Keterangan</th>
                        <th className="py-3 px-4 w-24 text-center">Platform</th>
                        <th className="py-3 px-4 w-20 text-right">Views</th>
                        <th className="py-3 px-4 w-20 text-right">Reach</th>
                        <th className="py-3 px-4 w-24 text-right">Engagement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printData.topPosts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400">Tidak ada konten yang diterbitkan di periode ini.</td>
                        </tr>
                      ) : (
                        printData.topPosts.map((post: any, index: number) => {
                          const getV = (c: any) => (c.metrics?.views || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.views || 0 : 0);
                          const getR = (c: any) => (c.metrics?.reach || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.reach || 0 : 0);
                          const getEng = (c: any) => eng(c.metrics) + (c.isAds || adsFilter === "all" ? eng(c.adsMetrics || {}) : 0);
                          const erVal = getR(post) > 0 ? ((getEng(post) / getR(post)) * 100).toFixed(1) : "0.0";
                          
                          return (
                            <tr key={post.id || index} className="border-b border-gray-100 last:border-none">
                              <td className="py-4 px-4 text-center text-gray-400 font-bold">{index + 1}</td>
                              <td className="py-4 px-4">
                                <span className="block font-bold text-gray-900 line-clamp-2 max-w-sm">{post.caption || post.title || "Konten tanpa judul"}</span>
                                <span className="block text-[10px] text-gray-400 mt-1">{post.day}/{post.month}/{post.year} • {post.status} {post.isAds ? "• Ad Campaign" : ""}</span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 capitalize">{post.platform}</span>
                              </td>
                              <td className="py-4 px-4 text-right text-gray-600 font-medium">{getV(post).toLocaleString('id-ID')}</td>
                              <td className="py-4 px-4 text-right text-gray-600 font-medium">{getR(post).toLocaleString('id-ID')}</td>
                              <td className="py-4 px-4 text-right font-bold text-gray-900">{getEng(post).toLocaleString('id-ID')} <span className="block text-[9px] text-blue-600 font-normal">({erVal}%)</span></td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="print-card p-5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 leading-relaxed">
                  <span className="block font-bold text-gray-900 mb-1">Kesimpulan Performa Konten:</span>
                  Postingan dengan interaksi visual yang kuat, caption yang interaktif, dan penempatan iklan (Ads Campaign) yang strategis menunjukkan tingkat retensi audiens tertinggi. Kami menyarankan untuk mereplikasi format visual dari 3 konten terpopuler di atas untuk strategi kampanye media sosial selanjutnya.
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t border-gray-100 pt-3 text-center text-[9px] text-gray-400 flex justify-between">
                <span>Hubify Analytics System</span>
                <span>Halaman 3</span>
              </div>
            </div>
          )}

          {/* PAGE 3: TREN & PERTUMBUHAN (TRENDS) */}
          {printSections.trends && (
            <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2cm" }}>
              <div>
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                  <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                  <span className="text-xs font-bold text-gray-500">{printData.rangeLabel}</span>
                </div>
                
                <h2 className="text-xl font-extrabold text-gray-950 uppercase tracking-tight mb-2">3. Tren & Pertumbuhan Kinerja</h2>
                <p className="text-xs text-gray-500 mb-6">Analisis kurva perkembangan views dan jangkauan media sosial seiring berjalannya waktu.</p>
                
                {/* Historical Chart Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {activeMetrics.map((k) => (
                    <div key={k} className="print-card p-4 rounded-2xl border border-gray-100 bg-white">
                      <span className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2 text-center">
                        {METRICS_META[k]?.label || k}
                      </span>
                      <div className="w-full flex justify-center">
                        {printData.timelineData && printData.timelineData.length > 0 ? (
                          <LineChart width={310} height={180} data={printData.timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#9ca3af" }} />
                            <YAxis tick={{ fontSize: 8, fill: "#9ca3af" }} width={40} />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey={k} 
                              name={METRICS_META[k]?.label || k} 
                              stroke={METRICS_META[k]?.color || "#2563eb"} 
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        ) : (
                          <div className="w-[310px] h-[180px] flex items-center justify-center text-gray-400 text-xs">Data tidak tersedia.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Analytical breakdown */}
                <div className={`grid gap-4 mb-6 ${activeMetrics.length === 1 ? 'grid-cols-1' : activeMetrics.length === 2 ? 'grid-cols-2' : activeMetrics.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {activeMetrics.map(k => (
                    <div key={k} className="print-card p-4 rounded-2xl border border-gray-100 bg-white">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1 truncate">Rata-rata {METRICS_META[k]?.label || k}</span>
                      <span className="text-xl font-extrabold text-gray-900">
                        {Math.round((printData.metricTotals[k] || 0) / printData.totalDays).toLocaleString('id-ID')} <span className="text-xs text-gray-400 font-normal">/hari</span>
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  Secara umum kurva memperlihatkan adanya pola peningkatan interaksi sosial yang konsisten pada akhir pekan. Hal ini memberikan petunjuk strategis bagi tim konten untuk memaksimalkan publikasi materi berkualitas tinggi pada hari Jumat sore hingga hari Minggu untuk memperoleh hasil jangkauan organik terbaik.
                </p>
              </div>
              
              {/* Footer */}
              <div className="border-t border-gray-100 pt-3 text-center text-[9px] text-gray-400 flex justify-between">
                <span>Hubify Analytics System</span>
                <span>Halaman 4</span>
              </div>
            </div>
          )}

          {/* PAGE 4: DEMOGRAFI AUDIENS (AUDIENCE) */}
          {printSections.audience && (
            <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2cm" }}>
              <div>
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                  <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                  <span className="text-xs font-bold text-gray-500">{printData.rangeLabel}</span>
                </div>
                
                <h2 className="text-xl font-extrabold text-gray-950 uppercase tracking-tight mb-2">4. Analisis Demografi & Aktivitas Audiens</h2>
                <p className="text-xs text-gray-500 mb-6">Analisis mendalam mengenai profil pengguna, kelompok usia, geografi asal, dan tingkat aktivitas mereka.</p>
                
                {printData.demographics ? (
                  <div className="flex flex-col gap-6">
                    {/* Gender Breakdown Row */}
                    <div className="print-card p-5 rounded-2xl border border-gray-100 bg-white">
                      <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">Distribusi Gender Pengikut</h4>
                      <div className="flex items-center gap-4 text-xs font-bold">
                        <div className="flex-1 text-left">
                          <span className="text-gray-500">Perempuan:</span> <span className="text-base text-pink-600 font-extrabold">{printData.demographics.gender?.female || 50}%</span>
                        </div>
                        <div className="flex-[3] h-4 bg-gray-100 rounded-full overflow-hidden flex">
                          <div className="h-full bg-pink-500" style={{ width: `${printData.demographics.gender?.female || 50}%` }}></div>
                          <div className="h-full bg-blue-500 flex-1"></div>
                        </div>
                        <div className="flex-1 text-right">
                          <span className="text-gray-500">Laki-laki:</span> <span className="text-base text-blue-600 font-extrabold">{printData.demographics.gender?.male || 50}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Age breakdown with simple vertical bar bars */}
                      <div className="print-card p-5 rounded-2xl border border-gray-100 bg-white">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-4">Kelompok Usia Utama</h4>
                        <div className="flex flex-col gap-2.5 text-[11px]">
                          {(printData.demographics.age || []).map((item: any) => (
                            <div key={item.range} className="flex items-center gap-3">
                              <span className="w-10 text-gray-500 font-semibold">{item.range}</span>
                              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.value}%` }}></div>
                              </div>
                              <span className="w-8 text-right font-bold text-gray-800">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Countries breakdown */}
                      <div className="print-card p-5 rounded-2xl border border-gray-100 bg-white">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-4">Negara Asal Terbanyak</h4>
                        <div className="flex flex-col gap-2.5 text-[11px]">
                          {(printData.demographics.countries || []).slice(0, 5).map((item: any) => (
                            <div key={item.name} className="flex items-center gap-3">
                              <span className="w-20 truncate text-gray-500 font-semibold">{item.name}</span>
                              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                              </div>
                              <span className="w-8 text-right font-bold text-gray-800">{item.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Top Cities */}
                      <div className="print-card p-5 rounded-2xl border border-gray-100 bg-white">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-4">Kota Asal Terbanyak</h4>
                        <div className="flex flex-col gap-2.5 text-[11px]">
                          {(printData.demographics.cities || []).slice(0, 5).map((item: any) => (
                            <div key={item.name} className="flex items-center gap-3">
                              <span className="w-20 truncate text-gray-500 font-semibold">{item.name}</span>
                              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                              </div>
                              <span className="w-8 text-right font-bold text-gray-800">{item.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Device & Interests */}
                      <div className="print-card p-5 rounded-2xl border border-gray-100 bg-white flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">Distribusi Perangkat</h4>
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-4">
                            {(printData.demographics.devices || []).slice(0, 3).map((d: any) => (
                              <div key={d.name} className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <span className="block text-gray-400 uppercase font-bold text-[8px] mb-1">{d.name}</span>
                                <span className="block text-xs font-extrabold text-gray-900">{d.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-1.5">Minat Teratas Audiens</h4>
                          <div className="flex flex-wrap gap-1">
                            {(printData.demographics.interests || []).slice(0, 4).map((i: any) => (
                              <span key={i.name} className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-600 border border-gray-200">{i.name} ({i.percentage}%)</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="print-card p-5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 leading-relaxed">
                      <span className="block font-bold text-gray-900 mb-1">Analisis Strategis Audiens:</span>
                      Mayoritas audiens Anda berada di kelompok usia produktif (18-34 tahun) dengan akses dominan menggunakan perangkat seluler (Smartphone). Mengetahui profil geografis dan ketertarikan minat utama ini, pesan kampanye pemasaran harus dikembangkan secara singkat, lugas, ramah seluler, dan terfokus pada gaya hidup digital yang relevan dengan generasi muda.
                    </div>
                  </div>
                ) : (
                  <div className="print-card p-8 text-center text-gray-400 text-xs">Data demografi pengikut untuk platform terpilih tidak tersedia atau belum dikonfigurasi.</div>
                )}
              </div>
              
              {/* Footer */}
              <div className="border-t border-gray-100 pt-3 text-center text-[9px] text-gray-400 flex justify-between">
                <span>Hubify Analytics System</span>
                <span>Halaman 5</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Stylesheet specifically injected for beautiful high-fidelity printing */}
      <style>{`
        @media print {
          /* Hide non-printable app wrapper */
          body > #root > div, 
          body > #root > main, 
          body > #root > section, 
          .no-print, 
          header, 
          footer, 
          nav {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Override body styling for clean print margins */
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: 'Plus Jakarta Sans', 'Inter', sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          /* Ensure the print container is fully visible and occupies full space */
          #print-report-container {
            display: block !important;
            visibility: visible !important;
            background-color: #ffffff !important;
            width: 100% !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            z-index: 9999999 !important;
          }

          /* Force page-breaks on custom sections */
          .print-page {
            page-break-after: always !important;
            break-after: page !important;
            padding: 2cm !important;
            box-sizing: border-box !important;
            min-height: 297mm; /* Standard A4 height */
          }
          .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          /* Disable shadows and borders that render badly in PDF */
          .print-card {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>

    </div>
  );
}

