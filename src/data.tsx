import { useState, useEffect, useMemo, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export function CustomDropdown({ value, options, onChange, dark = false, style = {}, prefix = "" }: { value: string, options: any[], onChange: (val: string) => void, dark?: boolean, style?: any, prefix?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find(o => (typeof o === 'string' ? o : o.id || o.name || o) === value);
  const displayLabel = activeOption ? (typeof activeOption === 'string' ? activeOption : activeOption.label || activeOption.name || activeOption) : value;
  const activeColor = (activeOption && typeof activeOption !== 'string') ? activeOption.color : null;

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button 
        onClick={() => setOpen(!open)} 
        className="hover-scale"
        style={{ 
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, 
          padding: "8px 12px", borderRadius: 8, 
          border: dark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(44,32,22,0.2)", 
          background: dark ? (activeColor ? activeColor : "rgba(255,255,255,0.1)") : (activeColor ? activeColor + "15" : "white"), 
          fontSize: 13, fontWeight: 700, cursor: "pointer", 
          color: dark ? "white" : (activeColor || "#2C2016"),
          ...style
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 8, overflow: "hidden"}}>
           {activeColor && !dark && <div style={{width:8, height:8, borderRadius:"50%", background:activeColor, flexShrink:0}}/>}
           <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{prefix}{displayLabel}</span>
        </div>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'all 0.2s', opacity: 0.6, flexShrink: 0 }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
            style={{ position: "absolute", top: "100%", left: 0, minWidth: "100%", width: "max-content", marginTop: 4, background: "white", border: "1px solid rgba(44,32,22,0.1)", borderRadius: 12, padding: 6, zIndex: 9999, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", maxHeight: 250, overflowY: "auto" }}
          >
            {options.map((o, i) => {
              const val = typeof o === 'string' ? o : o.id || o.name || o;
              const isSelected = val === value;
              const label = typeof o === 'string' ? o : o.label || o.name || o;
              const color = (typeof o !== 'string') ? o.color : null;
              
              return (
                <div 
                  key={i} 
                  onClick={() => { onChange(val); setOpen(false); }}
                  style={{ 
                    padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: isSelected?800:600, cursor: "pointer", 
                    background: isSelected ? (color ? color + "20" : "#FDF0EB") : "transparent", 
                    color: isSelected ? (color || "#FF6B00") : "#2C2016", 
                    transition: "all 0.1s",
                    display: "flex", alignItems: "center", gap: 10,
                    marginBottom: 2
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#FAFAFA"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {color && <div style={{width:10, height:10, borderRadius:"50%", background:color}}/>}
                  <span style={{flex: 1, whiteSpace: "nowrap"}}>{prefix}{label}</span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
export const MS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
export const DAYS_ID = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
export const DAYS_S = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
export const YEARS = [2024,2025,2026,2027,2028];
export const MK = ["views","reach","likes","comments","shares","reposts","saves"];
export const MC: any = {views:"#2C2016",reach:"#FF6B00",likes:"#9C2B4E",comments:"#2B4C7E",shares:"#2D7A5E",reposts:"#A67C1C",saves:"#723680"};

export const DP = [
  {name:"Outfit Inspiration",    color:"#FF6B00",light:"#FDF0EB"},
  {name:"Product Showcase",      color:"#A67C1C",light:"#FBF5E3"},
  {name:"Edukasi",               color:"#2D7A5E",light:"#E5F4EE"},
  {name:"Campaign/Promo",        color:"#9C2B4E",light:"#F8EAF0"},
  {name:"Values & Brand Story",  color:"#3E5E28",light:"#EAF1E5"},
  {name:"Behind the Scene",      color:"#2B4C7E",light:"#E5EEF7"},
  {name:"Community & Social Proof",color:"#723680",light:"#F1E8F5"},
];
export const DPL = [
  {name:"Feed",   color:"#2C2016"},
  {name:"Reels",  color:"#FF6B00"},
  {name:"Stories",color:"#A67C1C"},
  {name:"TikTok", color:"#2D7A5E"},
];
export const DPIC = [
  {name: "Eko", color: "#2B4C7E"},
  {name: "Fakhri", color: "#9C2B4E"},
  {name: "Fauzan", color: "#3E5E28"}
];
export const DST = [
  {name: "Draft", color: "#A67C1C"},
  {name: "Waiting Approval", color: "#2B4C7E"},
  {name: "Revise", color: "#9C2B4E"},
  {name: "Ready to Post", color: "#3E5E28"},
  {name: "Published", color: "#2D7A5E"}
];
export const SS: any = {
  "Draft":{bg:"#FBF5E3",color:"#A67C1C"},
  "Waiting Approval":{bg:"#E5EEF7",color:"#2B4C7E"},
  "Revise":{bg:"#F8EAF0",color:"#9C2B4E"},
  "Ready to Post":{bg:"#EAF1E5",color:"#3E5E28"},
  "Published":{bg:"#E5F4EE",color:"#2D7A5E"},
};
export const DH: any = {
  "2025-5-1":"🛠️ Hari Buruh","2025-5-2":"📚 Hari Pendidikan","2025-5-12":"🙏 Waisak",
  "2025-5-14":"🎉 Launch Day!","2025-5-20":"🇮🇩 Kebangkitan Nasional",
  "2025-5-22":"🔥 Flash Sale","2025-5-29":"🙏 Kenaikan Isa Almasih",
  "2026-1-1":"🎆 Tahun Baru","2026-5-1":"🛠️ Hari Buruh","2026-8-17":"🇮🇩 Kemerdekaan",
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
export const gid  = () => `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
export const eng  = (m: any)  => m ? (m.likes||0)+(m.comments||0)+(m.shares||0)+(m.reposts||0)+(m.saves||0) : 0;
export const fmt  = (n: any)  => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(1)}K`:String(n||0);
export const fmtD = (y: any,mo: any,d: any) => { const w=new Date(y,mo-1,d).getDay(); return `${DAYS_ID[w]}, ${String(d).padStart(2,"0")}/${String(mo).padStart(2,"0")}/${y}`; };
export const fmtT = (h: any,m: any) => `${String(h||9).padStart(2,"0")}:${String(m||0).padStart(2,"0")}`;

/**
 * Returns dynamic promo events based on date patterns:
 * - Twin Date (e.g., 5.5, 6.6)
 * - Payday Sale (25th to end of month)
 */
export const getDynamicEvents = (y: number, m: number, d: number) => {
  const events = [];
  if (d === m) events.push(`💎 Twin Date ${m}.${m} Promo`);
  const tm = new Date(y, m - 1, d + 1);
  if (tm.getDate() === tm.getMonth() + 1) events.push(`⏳ ${tm.getMonth() + 1}.${tm.getMonth() + 1} Eve`);
  if (d >= 25) events.push("💰 Payday Sale");
  return events.join(" & ");
};
export const nowTs= () => new Date().toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"});
export const gps  = (ps: any,name: any) => ps.find((p:any)=>p.name?.trim()?.toLowerCase()===name?.trim()?.toLowerCase())||ps[0]||{color:"#C4622D",light:"#FDF0EB"};
export const gpc  = (pls: any,name: any) => (pls.find((p:any)=>p.name?.trim()?.toLowerCase()===name?.trim()?.toLowerCase())||{color:"#2C2016"}).color;
export const gss  = (name: any) => SS[name]||{bg:"#F5F0E8",color:"#A67C1C"};

export const emptyItem = (y:any,mo:any,d:any,pillars:any,platforms:any,pics:any,statuses:any) => ({
  id:gid(),year:y,month:mo,day:d,
  uploadHour:9,uploadMinute:0,
  pillar:pillars[0]?.name||pillars[0]||"",platform:platforms[0]?.name||platforms[0]||"",
  pic:pics[0]?.name||pics[0]||"",status:statuses[0]?.name||statuses[0]||"Draft",
  title:"",caption:"",briefCopywriting:"",objective:"",
  referenceText:"",referenceLinks:[],referenceImage:"",
  customFields:[],
  linkAsset:"",linkUpload:"",
  isAds:false,archived:false,metricsUpdatedAt:null,
  metrics:{views:0,reach:0,likes:0,comments:0,shares:0,reposts:0,saves:0},
  adsMetrics:{views:0,reach:0,likes:0,comments:0,shares:0,reposts:0,saves:0,clicks:0,conversions:0}
});

// ─── SEED ─────────────────────────────────────────────────────────────────────

const baseSeed = [
  {day:1,pillar:"Outfit Inspiration",platform:"Feed",title:"Perempuan Bekerja, Tetap Stylish & Profesional",pic:"Fakhri",status:"Published",isAds:false,uploadHour:9,uploadMinute:0,metrics:{views:2100,reach:1800,likes:220,comments:31,shares:15,reposts:8,saves:44}},
  {day:1,pillar:"Community & Social Proof",platform:"Stories",title:"Poll: Tim WFO atau WFH?",pic:"Eko",status:"Published",isAds:false,uploadHour:10,uploadMinute:0,metrics:{views:890,reach:720,likes:0,comments:0,shares:0,reposts:0,saves:0}},
  {day:2,pillar:"Values & Brand Story",platform:"Reels",title:"Dari Kampus ke Karier: Your Company Tumbuh Bareng Kamu",pic:"Fauzan",status:"Published",isAds:true,uploadHour:17,uploadMinute:0,metrics:{views:5200,reach:4100,likes:580,comments:72,shares:90,reposts:45,saves:130},adsMetrics:{views:15000,reach:12000,likes:800,comments:120,shares:150,reposts:80,saves:200,clicks:350,conversions:24}},
  {day:3,pillar:"Product Showcase",platform:"Feed",title:"Hero Koleksi Work Life Outdoor — Ini Dia Andalanmu!",pic:"Fakhri",status:"Published",isAds:false,uploadHour:9,uploadMinute:0,metrics:{views:1800,reach:1500,likes:190,comments:24,shares:12,reposts:6,saves:55}},
  {day:5,pillar:"Behind the Scene",platform:"Reels",title:"BTS Campaign Shoot 'Work Life Outdoor' 🎬",pic:"Fauzan",status:"Published",isAds:false,uploadHour:18,uploadMinute:0,metrics:{views:3800,reach:3000,likes:410,comments:55,shares:60,reposts:28,saves:95}},
  {day:7,pillar:"Edukasi",platform:"Feed",title:"Panduan Lengkap Pilih Bahan Breathable untuk Outdoor",pic:"Eko",status:"Published",isAds:false,uploadHour:8,uploadMinute:30,metrics:{views:1600,reach:1300,likes:175,comments:30,shares:45,reposts:20,saves:120}},
  {day:10,pillar:"Outfit Inspiration",platform:"Reels",title:"GRWM: From Work to Outdoor with Your Company ✨",pic:"Fauzan",status:"Published",isAds:true,uploadHour:17,uploadMinute:30,metrics:{views:6100,reach:5200,likes:720,comments:95,shares:110,reposts:55,saves:180},adsMetrics:{views:25000,reach:18000,likes:1200,comments:300,shares:450,reposts:200,saves:800,clicks:600,conversions:55}},
  {day:14,pillar:"Product Showcase",platform:"Reels",title:"🎉 LAUNCH DAY: Koleksi Terbaru Your Company!",pic:"Fauzan",status:"Published",isAds:true,uploadHour:9,uploadMinute:0,metrics:{views:12500,reach:10200,likes:1800,comments:250,shares:320,reposts:180,saves:420},adsMetrics:{views:50000,reach:38000,likes:3500,comments:800,shares:1200,reposts:900,saves:2100,clicks:1500,conversions:210}},
  {day:17,pillar:"Edukasi",platform:"Reels",title:"5 Ways to Style Koleksi Baru Your Company 🎥",pic:"Fauzan",status:"Published",isAds:false,uploadHour:17,uploadMinute:0,metrics:{views:7200,reach:6100,likes:880,comments:120,shares:145,reposts:70,saves:230}},
  {day:21,pillar:"Campaign/Promo",platform:"Reels",title:"⚡ FLASH SALE INCOMING — Siap-Siap Your Company Squad!",pic:"Fauzan",status:"Published",isAds:true,uploadHour:9,uploadMinute:0,metrics:{views:8900,reach:7500,likes:1100,comments:180,shares:200,reposts:95,saves:280},adsMetrics:{views:35000,reach:27000,likes:2200,comments:450,shares:850,reposts:350,saves:1200,clicks:1800,conversions:320}},
  {day:22,pillar:"Campaign/Promo",platform:"Feed",title:"🔥 FLASH SALE IS LIVE! Buruan Sebelum Habis!",pic:"Fakhri",status:"Published",isAds:true,uploadHour:7,uploadMinute:0,metrics:{views:9800,reach:8200,likes:1350,comments:220,shares:280,reposts:130,saves:310},adsMetrics:{views:42000,reach:35000,likes:2800,comments:600,shares:1100,reposts:450,saves:1500,clicks:2100,conversions:450}},
  {day:25,pillar:"Community & Social Proof",platform:"Feed",title:"Terima Kasih Sudah Belanja! 💕 #YourCompanyFamily",pic:"Eko",status:"Published",isAds:false,uploadHour:12,uploadMinute:0,metrics:{views:3300,reach:2900,likes:450,comments:80,shares:35,reposts:18,saves:70}},
  {day:15,pillar:"Product Showcase",platform:"Feed",title:"Draft Konten Juni - Product Review",pic:"Eko",status:"Draft",isAds:false,uploadHour:9,uploadMinute:0,metrics:{views:0,reach:0,likes:0,comments:0,shares:0,reposts:0,saves:0}},
];

export const makeSeed = () => {
  let gId = 1;
  const fullSeed: any[] = [];
  
  // Make 2025 Month 5 manually specifically based on the current context format
  baseSeed.forEach(x => {
    fullSeed.push({id:String(gId++),year:2025,month:5,caption:"",briefCopywriting:"",objective:"",referenceText:"",referenceLink:"",referenceImage:"",linkAsset:"",linkUpload:"",archived:false,metricsUpdatedAt:null,...x});
  });

  // Generate Dummy Data for 2024
  for(let m=1; m<=12; m++) {
    // 6 items per month
    for(let i=0; i<6; i++) {
        const rnd = baseSeed[Math.floor(Math.random()*baseSeed.length)];
        // randomize metrics slightly so data looks organic
        const rFactor = 0.5 + Math.random();
        const metrics = {
            views: Math.floor(rnd.metrics.views! * rFactor),
            reach: Math.floor(rnd.metrics.reach! * rFactor),
            likes: Math.floor(rnd.metrics.likes! * rFactor),
            comments: Math.floor(rnd.metrics.comments! * rFactor),
            shares: Math.floor(rnd.metrics.shares! * rFactor),
            reposts: Math.floor((rnd.metrics as any).reposts! * rFactor),
            saves: Math.floor(rnd.metrics.saves! * rFactor)
        };
        const item = {
            id:String(gId++),
            year:2024,
            month:m,
            day: Math.floor(Math.random()*28)+1,
            caption:"",briefCopywriting:"",objective:"",referenceText:"",referenceLink:"",referenceImage:"",linkAsset:"",linkUpload:"",archived:false,metricsUpdatedAt:null,
            ...rnd,
            title: rnd.title + ` (Archive 2024-${m})`,
            metrics: metrics
        };
        
        if (item.isAds && item.adsMetrics) {
            item.adsMetrics = {
                views: Math.floor(item.adsMetrics.views! * rFactor),
                reach: Math.floor(item.adsMetrics.reach! * rFactor),
                likes: Math.floor(item.adsMetrics.likes! * rFactor),
                comments: Math.floor(item.adsMetrics.comments! * rFactor),
                shares: Math.floor(item.adsMetrics.shares! * rFactor),
                reposts: Math.floor((item.adsMetrics as any).reposts! * rFactor),
                saves: Math.floor(item.adsMetrics.saves! * rFactor),
                clicks: Math.floor((item.adsMetrics as any).clicks! * rFactor),
                conversions: Math.floor((item.adsMetrics as any).conversions! * rFactor)
            };
        }
        
        fullSeed.push(item);
    }
  }

  return fullSeed;
};

// ─── SHARED STYLE HELPERS ─────────────────────────────────────────────────────
export const TRANS = "all 0.3s ease";
export const I = (ex:any={}) => ({
  border: "1px solid rgba(44,32,22,0.15)",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  
  color: "#2C2016",
  background: "white",
  width: "100%",
  boxSizing: "border-box" as any,
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
  ...ex
});
export const L = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: "uppercase" as any,
  color: "rgba(44,32,22,0.5)",
  display: "block",
  marginBottom: 6
};
export const B = (active:any, color = "#FF6B00") => ({
  border: active ? `1px solid ${color}` : `1px solid rgba(44,32,22,0.1)`,
  borderRadius: 24,
  padding: "8px 18px",
  fontSize: 13,
  cursor: "pointer",
  
  fontWeight: 600,
  background: active ? color : "transparent",
  color: active ? "white" : "#2C2016",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8
});

export const TAB = (active:any) => ({
  border: "none",
  borderBottom: `2.5px solid ${active ? "#FF6B00" : "transparent"}`,
  background: "transparent",
  padding: "12px 20px",
  fontSize: 13,
  fontWeight: active ? 700 : 500,
  cursor: "pointer",
  
  color: active ? "#FF6B00" : "rgba(44,32,22,0.5)",
  whiteSpace: "nowrap" as any
});
export const CARD = (ex:any={}) => ({
  background: "white",
  borderRadius: 24,
  padding: "24px",
  boxShadow: "0 8px 30px rgba(44,32,22,0.06)",
  border: "1px solid rgba(44,32,22,0.04)",
  ...ex
});
export const GRP = {display:"flex",flexDirection:"column" as any,gap:8};

// ─── TINY COMPONENTS ─────────────────────────────────────────────────────────
export const SBadge = ({status}: any) => { const s=gss(status); return <span className="pill-tag" style={{background:s.bg,color:s.color}}>{status}</span>; };
export const PBadge = ({name,platforms}: any) => { 
  const bg = gpc(platforms,name); 
  // Add transparency to the hex background colors defined in DP/DPL if needed for pastel, but we have 'light' variant.
  // Actually, we'll just stick to the text color = thick, bg = pastel. We can use the 'light' color.
  const p = platforms?.find((x:any)=>x.name===name);
  const light = p?.light || `${bg}20`; // 20% opacity as fallback pastel
  return <span className="pill-tag" style={{background:light,color:bg}}>{name}</span>; 
};
