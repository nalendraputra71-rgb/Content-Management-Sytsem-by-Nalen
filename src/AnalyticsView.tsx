import { useState, useMemo, useRef, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell } from "recharts";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { 
  MONTHS, MS, DAYS_S, DAYS_ID, YEARS, MK, MC,
  eng, fmt, gps,
  I, B, CARD, PBadge 
} from "./data";

function CustomDropdown({ value, options, onChange, style }: { value: string, options: any[], onChange: (val: string) => void, style?: any }) {
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
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(44,32,22,0.1)", background: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#2C2016" }}
      >
        <span>{displayLabel}</span>
        <ChevronDown size={14} color="rgba(44,32,22,0.4)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'all 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
            style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "white", border: "1px solid rgba(44,32,22,0.1)", borderRadius: 8, padding: 4, zIndex: 100, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", minWidth: 120, overflowY: "auto", maxHeight: 200 }}
          >
            {options.map((o, i) => {
              const val = typeof o === 'string' ? o : o.id;
              const isSelected = val === value;
              return (
                <div 
                  key={i} 
                  onClick={() => { onChange(val); setOpen(false); }}
                  style={{ padding: "8px 12px", borderRadius: 6, fontSize: 12, fontWeight: isSelected?800:600, cursor: "pointer", background: isSelected ? "#FDF0EB" : "transparent", color: isSelected ? "#C4622D" : "#2C2016", transition: "all 0.1s", whiteSpace: "nowrap" }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#FAFAFA"; }}
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

export function AnalyticsView({content,pillars,platforms,pics,statuses,openEdit,isRestricted}: any) {
  const [dateFilt,setDateFilt] = useState("all"); 
  const [customS,setCustomS] = useState("");
  const [customE,setCustomE] = useState("");
  const [adsFilter,setAdsFilter] = useState("all"); 
  const [activeMetrics,setActiveMetrics] = useState(["reach","likes","comments"]);
  const [topSort,setTopSort] = useState("engagement");
  const [topPlatform,setTopPlatform] = useState("All");
  
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiInsight, setShowAiInsight] = useState(true);

  const toggleMetric = (k:string) => setActiveMetrics(m=>m.includes(k)?m.filter(x=>x!==k):[...m,k]);

  // Handle Quick Filters & Custom via date logic 
  const isDateMatch = (c:any, isPrev:boolean=false) => {
    let cdt = new Date(c.year, c.month-1, c.day);
    const now = new Date();
    
    if(dateFilt==="custom") {
      const sDate = customS ? new Date(customS) : new Date(0);
      const eDate = customE ? new Date(customE) : new Date("2100-01-01");
      if(!isPrev) return cdt >= sDate && cdt <= eDate;
      const diff = eDate.getTime() - sDate.getTime();
      return cdt >= new Date(sDate.getTime()-diff) && cdt < sDate;
    }
    if(dateFilt==="all") return !isPrev; // No prev period for "All"
    
    if(dateFilt==="tm") {
      const targetMonth = isPrev ? now.getMonth()-1 : now.getMonth();
      const targetYear = now.getFullYear();
      let expectedDate = new Date(targetYear, targetMonth, 1);
      return cdt.getMonth()===expectedDate.getMonth() && cdt.getFullYear()===expectedDate.getFullYear();
    }
    if(dateFilt==="3m") {
      const start = new Date(now.getFullYear(), now.getMonth()-3, now.getDate());
      if(!isPrev) return cdt >= start;
      const prevStart = new Date(start.getFullYear(), start.getMonth()-3, start.getDate());
      return cdt >= prevStart && cdt < start;
    }
    if(dateFilt==="6m") {
      const start = new Date(now.getFullYear(), now.getMonth()-6, now.getDate());
      if(!isPrev) return cdt >= start;
      const prevStart = new Date(start.getFullYear(), start.getMonth()-6, start.getDate());
      return cdt >= prevStart && cdt < start;
    }
    if(dateFilt==="1y") {
      const targetYear = isPrev ? now.getFullYear()-1 : now.getFullYear();
      return cdt.getFullYear()===targetYear;
    }
    return !isPrev;
  };

  const base = content.filter((c:any)=>isDateMatch(c)&&(adsFilter==="all"||((adsFilter==="ads")===c.isAds)));
  const prevBase = content.filter((c:any)=>isDateMatch(c, true)&&(adsFilter==="all"||((adsFilter==="ads")===c.isAds)));
  
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

    if (dateFilt === "tm") {
       const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
       for (let d = 1; d <= daysInMonth; d++) {
         labels.push({
           label: d.toString(),
           filter: (c: any) => c.day === d && c.month === now.getMonth() + 1 && c.year === now.getFullYear()
         });
       }
    } else if (dateFilt === "3m") {
       for (let i = 2; i >= 0; i--) {
         const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
         const m = target.getMonth() + 1;
         const y = target.getFullYear();
         labels.push({ label: `${MS[m-1]} ${y % 100}`, filter: (c: any) => c.month === m && c.year === y });
       }
    } else if (dateFilt === "6m") {
       for (let i = 5; i >= 0; i--) {
         const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
         const m = target.getMonth() + 1;
         const y = target.getFullYear();
         labels.push({ label: `${MS[m-1]} ${y % 100}`, filter: (c: any) => c.month === m && c.year === y });
       }
    } else if (dateFilt === "1y") {
       const targetYear = now.getFullYear();
       MONTHS.forEach((_, i) => {
         labels.push({ label: MS[i], filter: (c: any) => c.month === i + 1 && c.year === targetYear });
       });
    } else if (dateFilt === "custom") {
       const sDate = customS ? new Date(customS) : new Date(now.getFullYear(), now.getMonth(), 1);
       const eDate = customE ? new Date(customE) : new Date();
       const diff = eDate.getTime() - sDate.getTime();
       const days = Math.floor(diff / (1000 * 60 * 60 * 24));
       
       if (days <= 45) {
         for (let i = 0; i <= days; i++) {
            const dt = new Date(sDate.getTime() + i * 86400000);
            labels.push({
              label: `${dt.getDate()}/${dt.getMonth() + 1}`,
              filter: (c: any) => c.day === dt.getDate() && c.month === dt.getMonth() + 1 && c.year === dt.getFullYear()
            });
         }
       } else {
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
    } else {
       // dateFilt === "all"
       // Find span of years in content
       const years = content.length > 0 ? Array.from(new Set(content.map((c: any) => c.year))).sort() as number[] : [now.getFullYear()];
       const minYear = years[0];
       const maxYear = years[years.length - 1];
       
       if (minYear === maxYear) {
         MONTHS.forEach((_, i) => {
           labels.push({ label: MS[i], filter: (c: any) => c.month === i + 1 && c.year === minYear });
         });
       } else {
         // Show by month-year for the whole range
         for (let y = minYear; y <= maxYear; y++) {
           MONTHS.forEach((_, i) => {
              labels.push({ 
                label: `${MS[i]} '${y % 100}`, 
                filter: (c: any) => c.month === i + 1 && c.year === y 
              });
           });
         }
       }
    }

    return labels.map(({ label, filter }) => {
      const d = content.filter(c => filter(c) && (adsFilter === "all" || (adsFilter === "ads" === c.isAds)));
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
  }, [content, dateFilt, customS, customE, adsFilter]);

  // Heatmap Data
  const heatmap = useMemo(() => {
    let m = Array(7).fill(0).map(() => Array(24).fill(0));
    base.filter((c:any)=>c.status==="Published").forEach((c:any) => {
      let cd = new Date(c.year, c.month-1, c.day).getDay();
      let h = c.uploadHour || 9;
      if (h>=0 && h<24) m[cd][h] += getEng(c); 
    });
    return m;
  }, [base]);

  // Platform Data
  const platformData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      if(!pmap[c.platform]) pmap[c.platform] = {name:c.platform, count:0};
      pmap[c.platform].count += 1;
    });
    return platforms.map((p:any) => ({
      name: p.name,
      count: pmap[p.name]?.count || 0,
      color: p.color
    })).sort((a:any, b:any) => b.count - a.count);
  }, [base, platforms]);
  const picData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      if(!pmap[c.pic]) pmap[c.pic] = {name:c.pic, total:0, org:0, ads:0};
      pmap[c.pic].total += 1;
      if(c.isAds) pmap[c.pic].ads += 1;
      else pmap[c.pic].org += 1;
    });
    return Object.values(pmap).sort((a:any,b:any)=>b.total-a.total);
  }, [base]);

  const fetchAiInsight = async () => {
    setAiLoading(true);
    setAiInsight("");
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      // Extract comprehensive data for LLM
      const topCont = base.filter((c:any)=>c.status==="Published"&&getV(c)>0).sort((a:any,b:any)=>getEng(b)-getEng(a)).slice(0,3);
      const badCont = base.filter((c:any)=>c.status==="Published"&&getV(c)>0).sort((a:any,b:any)=>getEng(a)-getEng(b)).slice(0,3);
      
      // Calculate best time to post
      let bestDay = 0, bestHour = 0, maxEng = 0;
      heatmap.forEach((days, dIdx) => {
        days.forEach((eng, hIdx) => {
          if(eng > maxEng) { maxEng = eng; bestDay = dIdx; bestHour = hIdx; }
        });
      });
      const bestTimeStr = maxEng > 0 ? `${DAYS_ID[bestDay]} pukul ${bestHour}:00` : "Belum cukup data";
      
      const picDataStr = picData.map((p:any)=>`${p.name} (${p.total})`).join(", ");

      const prompt = `Act as an expert Social Media Analyst. Review this comprehensive data summary for Your Company CMS:
      - Date Filter: ${dateFilt} (Quick range: ${adsFilter})
      - Growth/Trends:
         * Total Content: ${total} (${pTotal||"N/A"})
         * Total Views: ${fmt(tV)} (${pV||"N/A"})
         * Total Reach: ${fmt(tR)} (${pR||"N/A"})
         * Total Engagement: ${fmt(tE)} (${pE||"N/A"})
         * Ad Performance: Clicks ${fmt(tClicks)} (${pC||"N/A"}), Conv ${fmt(tConv)} (${pCv||"N/A"})
      - Engagement Rate Level: ${er}% (vs Prev: ${prevER.toFixed(2)}%)
      - Best Time to Upload: ${bestTimeStr} (Peak Eng: ${maxEng})
      - Team Workload (PIC): ${picDataStr}
      
      TOP PERFORMING CONTENT (Best 3):
      ${topCont.map((c:any,i:number)=>`${i+1}. "${c.title}" [Pillar: ${c.pillar}, Platform: ${c.platform}, Eng: ${getEng(c)}]`).join("\n")}
      
      WORST PERFORMING CONTENT (Bottom 3):
      ${badCont.map((c:any,i:number)=>`${i+1}. "${c.title}" [Pillar: ${c.pillar}, Platform: ${c.platform}, Eng: ${getEng(c)}]`).join("\n")}
      
      Please provide a comprehensive but concise Executive Summary and Analysis in Indonesian. 
      Focus on identifying WHY some content works and others don't, based on pillars, timing, and PIC workload.
      Structure your response with:
      1. A bulleted summary of growth trends and key performance indicators.
      2. Analysis of "Winners" vs "Losers" patterns.
      3. Specifically give 3 bulleted actionable NEXT STEP suggestions. KEEP THE FORMAT CLEAN AND PROFESSIONAL.`;

      if(!apiKey || apiKey === "") {
        setAiInsight("Analisis Cepat (Mode Tanpa AI):\n\n" + 
          "* Engagement Rate: " + er + "%\n" +
          "* Pertumbuhan Views: " + (pV||"N/A") + "\n" +
          "* Waktu Terbaik: " + bestTimeStr + "\n\n" +
          "(Catatan: AI Gemini tidak aktif karena GEMINI_API_KEY tidak terdeteksi. Gunakan VITE_GEMINI_API_KEY di setelan aplikasi).");
      } else {
        const ai = new GoogleGenAI({ apiKey });
        const resp = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt
        });
        setAiInsight(resp.text || "Tidak ada respon dari AI.");
      }
    } catch(e:any) {
      console.error("AI Error:", e);
      setAiInsight("Gagal mengambil data AI (Executive Summary): " + e.message);
    }
    setAiLoading(false);
  };

  const CDataList = ({title, list, rank=1}:any) => (
    <div style={CARD()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h4 style={{fontSize:16,fontWeight:700,margin:0}}>{title}</h4>
      </div>
      {list.length===0 && <p style={{fontSize:12,color:"rgba(44,32,22,0.4)"}}>Data tidak tersedia</p>}
      {list.map((item:any,i:number)=>{
        const e=getEng(item),ps=gps(pillars,item.pillar);
        return (
          <div key={item.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:i===0&&rank===1?"#FDF0EB":"#FAFAF8",border:"1px solid rgba(44,32,22,0.06)",borderRadius:8,marginBottom:6}}>
            {rank===1 && <span style={{fontSize:18,fontWeight:700,color:i===0?"#FF6B00":i===1?"#A67C1C":"rgba(44,32,22,0.2)",width:24,flexShrink:0}}>#{i+1}</span>}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                <span onClick={()=>openEdit(item)} style={{cursor:"pointer", color:"inherit", borderBottom:"1px dashed rgba(0,0,0,0.3)"}} title="Buka Detail Brief">{item.title||"(Tanpa judul)"}</span>
                {item.linkSosmed && <a href={item.linkSosmed} target="_blank" rel="noreferrer" style={{textDecoration:"none",fontSize:12}} title="Buka Postingan">🔗</a>}
                {item.linkUpload && <a href={item.linkUpload} target="_blank" rel="noreferrer" style={{textDecoration:"none",fontSize:12}} title="Akses Upload/Aset">📤</a>}
              </div>
              <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap",alignItems:"center"}}>
                <PBadge name={item.platform} platforms={platforms}/>
                <span style={{background:ps.light,color:ps.color,fontSize:8,padding:"1px 5px",borderRadius:6}}>{item.pillar}</span>
                {item.isAds&&<span style={{fontSize:8,color:"#9C2B4E",fontWeight:700}}>💰 Ads</span>}
                {item.briefCopywriting&&<span style={{fontSize:9,color:"#2B4C7E",cursor:"pointer"}} title={item.briefCopywriting}>📝 Brief</span>}
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:16,fontWeight:700,color:"#FF6B00"}}>{fmt(topSort==="engagement"?e:topSort==="reach"?getR(item):getV(item))}</div>
              <div style={{fontSize:9,color:"rgba(44,32,22,0.4)",textTransform:"capitalize"}}>{topSort}</div>
            </div>
          </div>
        )
      })}
    </div>
  );

  const MCard = ({label,val,sub,color="#C4622D", pctStr}: any) => (
    <div style={CARD({flex:1,minWidth:100,display:"flex",flexDirection:"column"})}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
        <div style={{fontSize:9,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(44,32,22,0.4)"}}>{label}</div>
        {pctStr && <div style={{fontSize:10,fontWeight:600,color:pctColor(pctStr),background:pctColor(pctStr)+"1A",padding:"2px 6px",borderRadius:4}}>{pctStr}</div>}
      </div>
      <div style={{fontSize:24,fontWeight:700,color,lineHeight:1,marginTop:"auto"}}>{val}</div>
      {sub&&<div style={{fontSize:10,color:"rgba(44,32,22,0.4)",marginTop:3}}>{sub}</div>}
    </div>
  );

  return (
    <div style={{padding:"24px",display:"flex",flexDirection:"column",gap:24,maxWidth:1600}}>
      
      {/* Filters */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["all","Sepanjang Waktu"],["tm","Bulan Ini"],["3m","3 Bln Terakhir"],["6m","6 Bln Terakhir"],["1y","1 Thn Ini"],["custom","Custom Range"]].map(([k,l])=>(
            <button key={k} onClick={()=>setDateFilt(k)} style={{...B(dateFilt===k,"#A67C1C"),fontSize:12}}>{l}</button>
          ))}
          {dateFilt==="custom" && (
             <div style={{display:"flex",gap:6,alignItems:"center"}}>
               <input type="date" value={customS} onChange={(e)=>setCustomS(e.target.value)} style={{...I(),padding:"4px 8px"}}/>
               <span style={{fontSize:12,color:"rgba(44,32,22,0.5)"}}>hingga</span>
               <input type="date" value={customE} onChange={(e)=>setCustomE(e.target.value)} style={{...I(),padding:"4px 8px"}}/>
             </div>
          )}
        </div>
        <div style={{display:"flex",gap:6,background:"white",padding:"4px 8px",borderRadius:24,border:"1px solid rgba(44,32,22,0.1)"}}>
          {[["all","Semua Data"],["organic","🌱 Organic"],["ads","💰 Ads Only"]].map(([k,l])=>(
            <button key={k} onClick={()=>setAdsFilter(k)} style={{background:adsFilter===k?"rgba(196,98,45,0.1)":"transparent",color:adsFilter===k?"#C4622D":"#2C2016",border:"none",borderRadius:16,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",flexWrap:"wrap",gap:14,gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))"}}>
        <MCard label="Total Konten" val={total} sub={`Dipublikasikan: ${pub}`} color="#2C2016" pctStr={calcPct(total, prevTotal)}/>
        <MCard label="Views (Impression)" val={fmt(tV)} pctStr={calcPct(tV, prevTV)}/>
        <MCard label="Total Reach" val={fmt(tR)} pctStr={calcPct(tR, prevTR)}/>
        <MCard label="Tot. Engagement" val={fmt(tE)} sub={`Rate: ${er}% (vs ${(prevER).toFixed(2)}%)`} pctStr={calcPct(tE, prevTE)}/>
        {(adsFilter==="all"||adsFilter==="ads") && <>
          <MCard label="Ad Clicks" val={fmt(tClicks)} color="#9C2B4E" pctStr={calcPct(tClicks, prevTClicks)}/>
          <MCard label="Ad Conversions" val={fmt(tConv)} color="#9C2B4E" pctStr={calcPct(tConv, prevTConv)}/>
        </>}
      </div>

      {/* Restricted Overlay Logic applies downward */}
      <div style={{position:"relative"}}>
        {isRestricted && (
          <div style={{position:"absolute",inset:0,zIndex:10,backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(250, 247, 242, 0.4)",borderRadius:16}}>
            <div style={{background:"white",padding:"24px 32px",borderRadius:16,boxShadow:"0 10px 40px rgba(0,0,0,0.1)",textAlign:"center",maxWidth:400}}>
              <h3 style={{fontSize:18,fontWeight:800,marginBottom:12,color:"#9C2B4E"}}>Akses Analitik Terkunci</h3>
              <p style={{fontSize:14,color:"rgba(44,32,22,0.6)",marginBottom:20}}>Upgrade ke Pro untuk melihat data asli, insight AI, dan laporan lengkap performa konten Anda.</p>
              <button className="hover-scale" onClick={()=>window.location.hash="/billing"} style={{background:"#9C2B4E",color:"white",padding:"12px 24px",borderRadius:12,fontWeight:600,border:"none",cursor:"pointer",width:"100%"}}>Berlangganan Sekarang</button>
            </div>
          </div>
        )}
        <div style={{filter: isRestricted ? "blur(4px)" : "none", pointerEvents: isRestricted ? "none" : "auto", userSelect: isRestricted ? "none" : "auto"}}>
      <div style={CARD()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <h4 style={{fontSize:16,fontWeight:700,margin:0}}>📈 Tren Pertumbuhan</h4>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {["reach","likes","comments","shares","reposts","saves","clicks"].map(k=>(
              <button key={k} onClick={()=>toggleMetric(k)} style={{background:activeMetrics.includes(k)?`${MC[k]}22`||"rgba(196,98,45,0.1)":"rgba(44,32,22,0.03)",color:activeMetrics.includes(k)?MC[k]||"#C4622D":"rgba(44,32,22,0.4)",border:"none",borderRadius:12,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",textTransform:"capitalize"}}>
                {activeMetrics.includes(k)?"✓ ":""}{k}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          {adsFilter==="all" ? (
             <BarChart data={lineData} margin={{top:0,right:8,left:-16,bottom:0}}>
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,32,22,0.06)"/>
               <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(44,32,22,0.45)"}}/>
               <YAxis tick={{fontSize:11,fill:"rgba(44,32,22,0.45)"}} tickFormatter={fmt}/>
               <Tooltip contentStyle={{borderRadius:8,fontSize:12,border:"1px solid rgba(44,32,22,0.1)"}} formatter={(v:any)=>[fmt(v)]}/>
               <Legend wrapperStyle={{fontSize:11}}/>
               {activeMetrics.map((k,idx)=>(
                 <Bar key={k+"_org"} dataKey={`${k}_org`} stackId={k} name={`Org ${k}`} fill={MC[k]||"#C4622D"} radius={[0,0,4,4]}/>
               ))}
               {activeMetrics.map((k,idx)=>(
                 <Bar key={k+"_ads"} dataKey={`${k}_ads`} stackId={k} name={`Ads ${k}`} fill={(MC[k]||"#C4622D")+"88"} radius={[4,4,0,0]}/>
               ))}
             </BarChart>
          ) : (
            <LineChart data={lineData} margin={{top:0,right:8,left:-16,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,32,22,0.06)"/>
              <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(44,32,22,0.45)"}}/>
              <YAxis tick={{fontSize:11,fill:"rgba(44,32,22,0.45)"}} tickFormatter={fmt}/>
              <Tooltip contentStyle={{borderRadius:8,fontSize:12,border:"1px solid rgba(44,32,22,0.1)"}} formatter={(v:any)=>[fmt(v)]}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              {activeMetrics.map(k=>(
                <Line key={k} type="monotone" dataKey={k} stroke={MC[k]||"#C4622D"} strokeWidth={2.5} dot={{r:3}} activeDot={{r:6}} name={k.charAt(0).toUpperCase()+k.slice(1)}/>
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div style={{padding:"18px 22px",background:"#1E1509",color:"#FAF7F2",borderRadius:12}}>
        <div style={{fontSize:12,fontWeight:600,color:"#C4622D",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>📊 Executive Summary</div>
        
        <ul style={{fontSize:13,lineHeight:1.8,margin:0,paddingLeft:20,marginBottom:16,opacity:0.95}}>
          <li><strong>Total Konten:</strong> {total} (Dipublikasikan: {pub}) dalam periode & fiter terpilih.</li>
          <li><strong>Agregasi Views & Reach:</strong> Total views mencapai <strong style={{color:"#F0B18A"}}>{fmt(tV)}</strong> impresi dengan ukuran audiens (reach) sekitar <strong style={{color:"#F0B18A"}}>{fmt(tR)}</strong>.</li>
          <li><strong>Kualitas Interaksi:</strong> Menghasilkan <strong style={{color:"#F0B18A"}}>{fmt(tE)} total engagement</strong> (Engagement Rate = {er}%).</li>
          {adsFilter!=="organic" && tClicks>0 && <li><strong>Konversi Iklan:</strong> {fmt(tClicks)} clicks & {fmt(tConv)} conversions.</li>}
        </ul>

        <div style={{borderTop:"1px dashed rgba(255,255,255,0.1)",paddingTop:14}}>
          {aiInsight ? (
            <div style={{background:"rgba(255,255,255,0.05)",padding:14,borderRadius:8}}>
              <div 
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}
                onClick={() => setShowAiInsight(!showAiInsight)}
              >
                <div style={{fontSize:11,fontWeight:600,color:"#8AAEF0"}}>🤖 Rekomendasi AI Next Step:</div>
                <div style={{fontSize:18,color:"#8AAEF0"}}>{showAiInsight ? "↑" : "↓"}</div>
              </div>
              {showAiInsight && (
                <div style={{fontSize:13,lineHeight:1.6,wordWrap:"break-word",marginTop:12}} className="markdown-body">
                  <Markdown>{aiInsight}</Markdown>
                </div>
              )}
            </div>
          ) : (
            <button onClick={fetchAiInsight} disabled={aiLoading} style={{...B(false),background:"#C4622D",color:"white",border:"none",padding:"8px 16px",fontWeight:600,cursor:aiLoading?"wait":"pointer"}}>
              {aiLoading?"Menganalisis data...":"🤖 Hasilkan Saran AI"}
            </button>
          )}
        </div>
      </div>
      
      {/* Heatmap & PIC Workload */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(380px,1fr))",gap:32}}>
        <div style={CARD()}>
          <h4 style={{fontSize:16,fontWeight:700,margin:"0 0 16px"}}>📈 Konten per Platform</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={platformData} margin={{top:10,right:10,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)"/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:"rgba(44,32,22,0.5)"}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:10,fill:"rgba(44,32,22,0.5)"}} tickLine={false} axisLine={false}/>
              <Tooltip cursor={{fill:"rgba(0,0,0,0.05)"}} contentStyle={{borderRadius:8,fontSize:12,border:"1px solid rgba(0,0,0,0.1)",boxShadow:"0 4px 12px rgba(0,0,0,0.05)"}} itemStyle={{color:"#2C2016",fontWeight:600}} labelStyle={{color:"rgba(44,32,22,0.5)",marginBottom:4}}/>
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {platformData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || "#C4622D"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={CARD()}>
          <h4 style={{fontSize:16,fontWeight:700,margin:"0 0 16px"}}>🔥 Best Time to Upload (Heatmap)</h4>
          <div style={{display:"flex",gap:4,marginBottom:6}}>
            <div style={{width:30}}/>
            {Array.from({length:24}).map((_,i)=><div key={`h${i}`} style={{flex:1,textAlign:"center",fontSize:10,color:"rgba(44,32,22,0.4)"}}>{i}</div>)}
          </div>
          {heatmap.map((row,di) => {
            const rowMax = Math.max(...row, 1);
            return (
              <div key={di} style={{display:"flex",gap:4,marginBottom:4,alignItems:"center"}}>
                <div style={{width:30,fontSize:10,fontWeight:600}}>{DAYS_S[di]}</div>
                {row.map((val,hi) => (
                  <div key={hi} title={`${DAYS_ID[di]} Jam ${hi} - ${fmt(val)} Eng`} style={{flex:1,height:22,borderRadius:4,background:`rgba(196,98,45,${val===0?0.03 : Math.max(0.15, val/rowMax)})`}}/>
                ))}
              </div>
            );
          })}
        </div>
        
        <div style={CARD()}>
          <h4 style={{fontSize:16,fontWeight:700,margin:"0 0 16px"}}>👥 Beban Kerja PIC</h4>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {picData.map((p:any) => (
              <div key={p.name} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:80,fontSize:12,fontWeight:600,color:"#2C2016",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                <div style={{flex:1,background:"rgba(44,32,22,0.05)",height:8,borderRadius:4,position:"relative",overflow:"hidden",display:"flex"}}>
                  <div style={{width:`${(p.org/Math.max(...picData.map((x:any)=>x.total)))*100}%`,background:"#538135",height:"100%"}} title={`Organic: ${p.org}`}/>
                  <div style={{width:`${(p.ads/Math.max(...picData.map((x:any)=>x.total)))*100}%`,background:"#9C2B4E",height:"100%"}} title={`Ads: ${p.ads}`}/>
                </div>
                <div style={{width:30,fontSize:11,fontWeight:700,textAlign:"right"}}>{p.total}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:16,justifyContent:"flex-end",marginTop:12,fontSize:10}}>
            <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,background:"#538135",borderRadius:"50%"}}/>Organic</span>
            <span style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,background:"#9C2B4E",borderRadius:"50%"}}/>Ads</span>
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:16,alignItems:"center",background:"white",padding:"10px 16px",borderRadius:12,border:"1px solid rgba(44,32,22,0.08)",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{fontSize:12,fontWeight:600,color:"rgba(44,32,22,0.5)"}}>Sort by:</div>
          {[["engagement","Eng"],["reach","Reach"],["views","Views"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTopSort(k)} style={{...B(topSort===k,"#C4622D"),padding:"4px 8px"}}>{l}</button>
          ))}
        </div>
        <div style={{width:1,height:24,background:"rgba(44,32,22,0.1)"}}/>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{fontSize:12,fontWeight:600,color:"rgba(44,32,22,0.5)"}}>Filter Platform:</div>
          <CustomDropdown 
            value={topPlatform} 
            onChange={setTopPlatform} 
            options={[
              {id:"All", label:"Semua Platform"},
              ...platforms.map((p:any)=>({id:p.name, label:p.name}))
            ]} 
            style={{ width: 160 }} 
          />
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20}}>
        <div>
          <CDataList 
            title={`🏆 Top 10 Konten${topPlatform!=="All"?" ("+topPlatform+")":""}`} 
            list={base.filter((c:any)=>c.status==="Published" && getV(c)>0 && (topPlatform==="All" || c.platform===topPlatform)).sort((a:any,b:any)=>{
              if(topSort==="engagement") return getEng(b)-getEng(a);
              if(topSort==="reach") return getR(b)-getR(a);
              return getV(b)-getV(a);
            }).slice(0,10)}
            rank={1}
          />
        </div>
        <div>
          <CDataList 
            title={`⚠️ Bad Konten${topPlatform!=="All"?" ("+topPlatform+")":""}`}
            list={base.filter((c:any)=>c.status==="Published" && getV(c)>0 && (topPlatform==="All" || c.platform===topPlatform))
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

