import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CopyPlus, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, Globe, Layout, AlignLeft, MapPin, Download, ChevronRight, ChevronLeft, Calendar as CalIcon, Settings
} from "lucide-react";
import Markdown from "react-markdown";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

function CustomDropdown({ value, options, onChange, renderOption }: { value: string, options: any[], onChange: (val: string) => void, renderOption?: (o:any)=>React.ReactNode }) {
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
  const displayLabel = activeOption ? (typeof activeOption === 'string' ? activeOption : activeOption.label || activeOption.name) : value;

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 160 }}>
      <button 
        onClick={() => setOpen(!open)} 
        className="hover-scale"
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(44,32,22,0.1)", background: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#2C2016" }}
      >
        <span>{displayLabel}</span>
        <ChevronDown size={16} color="rgba(44,32,22,0.4)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'all 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.15 }}
            style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 8, background: "white", border: "1px solid rgba(44,32,22,0.1)", borderRadius: 12, padding: 8, zIndex: 100, boxShadow: "0 10px 40px rgba(0,0,0,0.1)", maxHeight: 300, overflowY: "auto" }}
          >
            {options.map((o, i) => {
              const val = typeof o === 'string' ? o : o.id;
              const isSelected = val === value;
              return (
                <div 
                  key={i} 
                  onClick={() => { onChange(val); setOpen(false); }}
                  style={{ padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: isSelected?800:600, cursor: "pointer", background: isSelected ? "var(--theme-primary)22" : "transparent", color: isSelected ? "var(--theme-primary)" : "#2C2016", transition: "all 0.1s" }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#FAFAFA"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {renderOption ? renderOption(o) : (typeof o === 'string' ? o : o.label || o.name)}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DASHBOARD_TIME_RANGES = ["7 Hari Terakhir", "30 Hari Terakhir", "Bulan Ini", "Tahun Ini", "Custom..."];
const ANALYTICS_METRICS = [
  { id: "all", label: "Semua Metrik (Bandingkan)" },
  { id: "er", label: "Total ER" },
  { id: "views", label: "Views" },
  { id: "reach", label: "Reach" },
  { id: "likes", label: "Likes" },
  { id: "comments", label: "Komentar" },
  { id: "shares", label: "Share" },
  { id: "reposts", label: "Repost" },
  { id: "saves", label: "Save" }
];

const PLATFORMS = [
  { id: "all", name: "Semua Platform", icon: <Globe size={18}/>, color: "#888" },
  { id: "meta", name: "Facebook", icon: <Facebook size={18}/>, color: "#1877F2" },
  { id: "instagram", name: "Instagram", icon: <Instagram size={18}/>, color: "#E4405F" },
  { id: "tiktok", name: "TikTok", icon: <div style={{fontWeight:800, fontSize:12, display:"flex", alignItems:"center", height:"100%"}}>TT</div>, color: "#000000" }
];

export function SocialStudioView({ tab }: { tab: string }) {
  const [showSoonPopup, setShowSoonPopup] = useState(true);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [showMultiAccountPopup, setShowMultiAccountPopup] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [dashTimeRange, setDashTimeRange] = useState("30 Hari Terakhir");
  const [analyticsMetric, setAnalyticsMetric] = useState("er");
  const [analyticsPlatform, setAnalyticsPlatform] = useState("all");
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("30 Hari Terakhir");
  const [contentPlatform, setContentPlatform] = useState("all");
  const [contentTimeRange, setContentTimeRange] = useState("30 Hari Terakhir");
  const [heatmapMetric, setHeatmapMetric] = useState("views");

  const [selectedContent, setSelectedContent] = useState<any>(null);

  useEffect(() => {
    setShowSoonPopup(true);
  }, [tab]);

  const [contentSort, setContentSort] = useState("terbaru");

  const toggleConnection = (id: string) => {
    if (connectedPlatforms.includes(id)) {
      setShowMultiAccountPopup(true);
    } else {
      setConnectedPlatforms(prev => [...prev, id]);
    }
  };

  const generateReport = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiReport(`### 🤖 Ringkasan AI Analytics\n\n**Performa Keseluruhan:**\nCukup stabil di bulan ini dengan pertumbuhan *Total ER* +12%. Mayoritas penonton menyukai video Reels berdurasi di bawah 15 detik.\n\n**Rekomendasi Langkah Selanjutnya:**\n1. Kurangi durasi teks on-screen di video TikTok, fokuskan pada visual hook 3 detik awal.\n2. Jadwal post terbaik audiens Anda bergeser ke pukul 20:00 - 21:00.\n3. Buat lebih banyak konten "behind the scenes" yang kemarin sukses meraih engagement rate tertinggi (8.5%).`);
      setAiLoading(false);
    }, 1500);
  };

  const MOCK_CHART_DATA = React.useMemo(() => {
    // Generate different seeds based on platform and what is being viewed
    let multiplier = 1;
    if (analyticsPlatform === 'instagram') multiplier = 1.5;
    else if (analyticsPlatform === 'tiktok') multiplier = 2;
    else if (analyticsPlatform === 'meta') multiplier = 0.8;
    else if (analyticsPlatform === 'all') multiplier = 4.3;

    return Array.from({length: 14}).map((_, i) => ({
      date: `Day ${i+1}`,
      views: Math.floor((Math.random() * 5000 + 1000) * multiplier),
      reach: Math.floor((Math.random() * 3000 + 500) * multiplier),
      likes: Math.floor((Math.random() * 1000 + 100) * multiplier),
      comments: Math.floor((Math.random() * 200 + 10) * multiplier),
      shares: Math.floor((Math.random() * 100 + 5) * multiplier),
      er: Number((Math.random() * 3 + 1 + (multiplier * 0.5)).toFixed(1)),
      reposts: Math.floor((Math.random() * 50 + 1) * multiplier),
      saves: Math.floor((Math.random() * 300 + 20) * multiplier)
    }));
  }, [analyticsPlatform]);

  const SORT_OPTIONS = [
    { id: "terbaru", label: "Terbaru" },
    { id: "terlama", label: "Terlama" },
    { id: "a-z", label: "A - Z" },
    { id: "z-a", label: "Z - A" },
  ];

  const DISPLAY_CONTENT = React.useMemo(() => {
    let list = Array.from({length: 20}).map((_, i) => ({
      id: i,
      title: `Judul Postingan ${i % 2 === 0 ? 'Menarik' : 'Viral'} ke-${i+1}`,
      time: `2026-08-${(20 - i).toString().padStart(2, '0')} 19:40`,
      type: i % 3 === 0 ? 'meta' : i % 3 === 1 ? 'instagram' : 'tiktok',
      views: Math.floor(Math.random() * 500000),
      er: (Math.random() * 5).toFixed(1),
      comments: Math.floor(Math.random() * 5000),
      shares: Math.floor(Math.random() * 1000),
      saves: Math.floor(Math.random() * 10000)
    }));

    if (contentPlatform !== "all") {
      list = list.filter(c => c.type === contentPlatform);
    }

    list.sort((a, b) => {
      if (contentSort === "a-z") return a.title.localeCompare(b.title);
      if (contentSort === "z-a") return b.title.localeCompare(a.title);
      if (contentSort === "terbaru") return new Date(b.time).getTime() - new Date(a.time).getTime();
      if (contentSort === "terlama") return new Date(a.time).getTime() - new Date(b.time).getTime();
      return 0;
    });

    return list;
  }, [contentPlatform, contentSort]);

  const HeatmapMock = () => (
    <div style={{display:"grid", gridTemplateColumns:"auto repeat(7, 1fr)", gap:4, width:"100%"}}>
      <div/>
      {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d=><div key={d} style={{textAlign:"center", fontSize:11, fontWeight:800, color:"rgba(44,32,22,0.5)"}}>{d}</div>)}
      {[8,10,12,14,16,18,20].map(h => (
        <React.Fragment key={h}>
          <div style={{fontSize:11, fontWeight:700, color:"rgba(44,32,22,0.5)", alignSelf:"center", paddingRight:8, textAlign:"right"}}>{h}:00</div>
          {Array.from({length:7}).map((_, i) => {
            const intensity = Math.random();
            return (
              <motion.div 
                whileHover={{scale:1.1}}
                key={i} 
                style={{
                  height: 24, borderRadius:4, cursor:"pointer",
                  background: heatmapMetric==="views" ? `rgba(255, 107, 0, ${0.1 + intensity*0.9})` : `rgba(45, 122, 94, ${0.1 + intensity*0.9})`
                }} 
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  const CalendarMock = () => {
    const days = Array.from({length: 31}).map((_, i) => i + 1);
    const mockPosts = [
      { day: 5, type: 'ig', title: 'Promo Baju', time: '12:00' },
      { day: 12, type: 'tt', title: 'Viral Tips', time: '19:00' },
      { day: 15, type: 'fb', title: 'Event Kemerdekaan', time: '14:30' },
      { day: 22, type: 'ig', title: 'New Arrival', time: '18:00' },
      { day: 28, type: 'tt', title: 'Review Product', time: '20:15' }
    ];

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, width: "100%", marginTop: 24 }}>
        {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d=><div key={d} style={{textAlign:"center", fontWeight:800, fontSize:13, color:"rgba(44,32,22,0.5)"}}>{d}</div>)}
        {Array.from({length: 3}).map((_, i)=><div key={'empty'+i} style={{padding:"20px", background:"rgba(44,32,22,0.02)", borderRadius:12}} />)}
        {days.map(d => {
          const posts = mockPosts.filter(p => p.day === d);
          return (
            <div key={d} style={{padding:"12px 12px 40px", background:"white", border:"1px solid rgba(44,32,22,0.1)", borderRadius:12, minHeight:100, position:"relative"}}>
              <div style={{fontWeight:800, fontSize:14}}>{d}</div>
              <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:6}}>
                {posts.map((p, i) => (
                  <motion.div 
                    whileHover={{scale:1.02}}
                    key={i} 
                    onClick={() => setSelectedContent(p)}
                    style={{
                      background: p.type==='ig'?'#F8EAF0':p.type==='tt'?'#f0f0f0':'#EBF3FC', 
                      color: p.type==='ig'?'#E4405F':p.type==='tt'?'#000':'#1877F2',
                      padding:"6px 8px", borderRadius:6, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", gap:6, cursor:"pointer"
                    }}
                  >
                    {p.type==='ig'&&<Instagram size={12}/>}{p.type==='fb'&&<Facebook size={12}/>}{p.type==='tt'&&<span style={{fontSize:10, fontWeight:900}}>TT</span>}
                    <div style={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{p.title}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  const ContentModalMock = () => {
    if (!selectedContent) return null;
    return (
      <div style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(44,32,22,0.6)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24}}>
        <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} style={{background:"white", borderRadius:24, width:"100%", maxWidth:800, display:"flex", overflow:"hidden"}}>
           <div style={{flex:1, background:"#000", display:"flex", alignItems:"center", justifyContent:"center", color:"white", minHeight:400, position:"relative"}}>
             <PlayCircle size={48} opacity={0.5}/>
             <div style={{position:"absolute", top:16, left:16, background:"rgba(0,0,0,0.5)", padding:"6px 12px", borderRadius:12, fontSize:12, fontWeight:700}}>{selectedContent.type.toUpperCase()} • {selectedContent.time}</div>
           </div>
           <div style={{width:400, display:"flex", flexDirection:"column"}}>
             <div style={{padding:20, borderBottom:"1px solid rgba(44,32,22,0.1)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
               <h3 style={{fontSize:18, fontWeight:800, margin:0}}>{selectedContent.title}</h3>
               <button onClick={()=>setSelectedContent(null)} className="hover-scale" style={{background:"rgba(44,32,22,0.05)", border:"none", cursor:"pointer", width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#2C2016"}}><X size={18}/></button>
             </div>
             <div style={{padding:20, flex:1, overflowY:"auto"}}>
                <div style={{fontSize:13, color:"rgba(44,32,22,0.6)", lineHeight:1.5, marginBottom:24}}>
                  "Caption panjang lebar bla bla bla #hashtag #viral #fyp"
                </div>
                <h4 style={{fontSize:14, fontWeight:800, marginBottom:16}}>Insight Detail</h4>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                   {['Views', 'Reach', 'Likes', 'Komen', 'Share', 'Save'].map(m => (
                     <div key={m} style={{background:"#FAFAFA", borderRadius:8, padding:12}}>
                       <div style={{fontSize:11, color:"rgba(44,32,22,0.5)", fontWeight:700, marginBottom:4}}>{m}</div>
                       <div style={{fontSize:16, fontWeight:800, color:"#2C2016"}}>{Math.floor(Math.random()*10000)}</div>
                     </div>
                   ))}
                </div>
             </div>
             <div style={{padding:20, borderTop:"1px solid rgba(44,32,22,0.1)"}}>
               <button className="hover-scale" style={{width:"100%", background:"var(--theme-primary)", color:"white", border:"none", padding:"12px", borderRadius:12, fontWeight:700, cursor:"pointer"}}>Buka di Platform Asli</button>
             </div>
           </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", background: "#FAFAFA", overflow: "hidden", position:"relative" }}>
      <AnimatePresence>
        {showSoonPopup && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(44,32,22,0.6)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(5px)"}}>
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}} style={{background:"white", borderRadius:24, padding:40, maxWidth:500, textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)"}}>
              <div style={{width:80, height:80, borderRadius:40, background:"var(--theme-primary)22", color:"var(--theme-primary)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px"}}>
                <Sparkles size={40}/>
              </div>
              <h2 style={{fontSize:24, fontWeight:800, color:"#2C2016", marginBottom:16}}>Fitur Segera Hadir (Coming Soon)</h2>
              <p style={{fontSize:15, color:"rgba(44,32,22,0.6)", lineHeight:1.6, marginBottom:32, fontWeight:500}}>
                Hi! Modul Social Studio ini masih dalam tahap mockup / purwarupa. Kami tidak sabar meluncurkannya secara penuhn untuk Anda.
                Data dan layar yang Anda lihat sekarang hanyalah **contoh (mockup)** sebagai gambaran fungsi ke depannya. 
              </p>
              <button className="hover-scale" onClick={() => setShowSoonPopup(false)} style={{background:"var(--theme-primary)", color:"white", border:"none", padding:"14px 32px", borderRadius:12, fontSize:15, fontWeight:800, cursor:"pointer", width:"100%"}}>Saya Mengerti, Lihat Preview</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContentModalMock />

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
        
        {/* DASHBOARD OVERVIEW */}
        {tab === "social-dashboard" && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
             <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
               <h2 style={{ fontSize: 28, fontWeight: 800, color: "#2C2016", margin: 0 }}>Social Studio Overview</h2>
               <div style={{display:"flex", gap:12}}>
                 <CustomDropdown value={dashTimeRange} options={DASHBOARD_TIME_RANGES} onChange={setDashTimeRange} />
                 <button className="hover-scale" style={{background:"white", border:"1px solid rgba(44,32,22,0.1)", borderRadius:12, padding:"10px 16px", cursor:"pointer", fontWeight:700}}><Settings size={16} color="rgba(44,32,22,0.6)"/></button>
               </div>
             </div>
             
             {/* Integrations Preview */}
             <div style={{background:"white", borderRadius:20, border:"1px solid rgba(44,32,22,0.05)", padding:24, marginBottom:24}}>
               <h3 style={{fontSize:16, fontWeight:800, marginBottom:16}}>Integrasi Platform</h3>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                 {PLATFORMS.filter(p=>p.id!=="all").map(p => {
                   const isConn = connectedPlatforms.includes(p.id);
                   return (
                     <div key={p.id} onClick={() => toggleConnection(p.id)} className="hover-scale" style={{ padding:16, borderRadius:16, border:"1px solid rgba(44,32,22,0.1)", display:"flex", alignItems:"center", gap:12, cursor:"pointer", background:isConn?"#FDF0EB":"transparent", transition:"all 0.2s" }}>
                       <div style={{width:40, height:40, borderRadius:20, background:isConn?p.color:`${p.color}15`, color:isConn?"white":p.color, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          {p.icon}
                       </div>
                       <div style={{flex:1}}>
                         <div style={{fontSize:15, fontWeight:800, color:"#2C2016"}}>{p.name}</div>
                         <div style={{fontSize:12, color:isConn?"#FF6B00":"rgba(44,32,22,0.4)", fontWeight:700}}>{isConn?"1 akun terhubung":"Tambahkan akun"}</div>
                       </div>
                     </div>
                   )
                 })}
               </div>
             </div>

             {/* Chart Overview */}
             <div style={{background:"white", borderRadius:20, border:"1px solid rgba(44,32,22,0.05)", padding:24}}>
               <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
                 <h3 style={{fontSize:18, fontWeight:800, margin:0}}>Trend Interaksi</h3>
                 <div style={{display:"flex", gap:12}}>
                    <CustomDropdown value={analyticsPlatform} options={PLATFORMS} onChange={setAnalyticsPlatform} renderOption={(o)=>
                      <div style={{display:"flex", alignItems:"center", gap:8, fontWeight:700}}>{o.icon} <span>{o.name}</span></div>
                    }/>
                 </div>
               </div>
               
               <div style={{height: 350, width: "100%"}}>
                  <ResponsiveContainer>
                    <LineChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44,32,22,0.05)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(44,32,22,0.5)', fontWeight:600}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(44,32,22,0.5)', fontWeight:600}} />
                      <RechartsTooltip contentStyle={{borderRadius:12, border:"none", boxShadow:"0 5px 20px rgba(0,0,0,0.1)", fontWeight:700}} />
                      <Legend iconType="circle" wrapperStyle={{fontSize:13, fontWeight:700, color:"#2C2016"}} />
                      <Line type="monotone" dataKey="views" name="Views" stroke="var(--theme-primary)" strokeWidth={3} dot={{r:4, strokeWidth:2}} activeDot={{r:6}} />
                      <Line type="monotone" dataKey="reach" name="Reach" stroke="#2D7A5E" strokeWidth={3} dot={{r:4, strokeWidth:2}} />
                      <Line type="monotone" dataKey="likes" name="Likes" stroke="#9C2B4E" strokeWidth={3} dot={{r:4, strokeWidth:2}} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
               
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 24 }}>
                 {[{lb:"Views", v:"124.5K", i:<Activity size={20}/>}, {lb:"Reach", v:"89.2K", i:<TrendingUp size={20}/>}, {lb:"Total ER", v:"4.8%", i:<BarChart3 size={20}/>}, {lb:"Total Likes", v:"12.4K", i:<CopyPlus size={20}/>}].map((s,i) => (
                   <div key={i} style={{ background: "#FAFAFA", borderRadius: 16, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(44,32,22,0.4)", marginBottom: 12 }}>
                         <div style={{ fontSize: 13, fontWeight: 800 }}>{s.lb}</div>
                         {s.i}
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: "#2C2016" }}>{s.v}</div>
                   </div>
                 ))}
               </div>
             </div>
          </motion.div>
        )}

        {/* ANALYTICS EXPERT */}
        {tab === "social-analytics" && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
               <div>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "#2C2016", margin: 0 }}>Analytics Expert</h2>
                  <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", margin:"4px 0 0", fontWeight:600}}>Data mendalam dengan AI Analysis.</p>
               </div>
               <div style={{ display: "flex", gap: 12 }}>
                 <CustomDropdown value={analyticsPlatform} options={PLATFORMS} onChange={setAnalyticsPlatform} renderOption={(o)=><div style={{display:"flex", alignItems:"center", gap:8, fontWeight:700}}>{o.icon} <span>{o.name}</span></div>} />
                 <CustomDropdown value={analyticsTimeRange} options={DASHBOARD_TIME_RANGES} onChange={setAnalyticsTimeRange} />
               </div>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                {[
                  {lb:"Views", v:"1,240,551", gr:"+15.2%", st:"#2D7A5E", bg:"#E5F4EE"},
                  {lb:"Reach", v:"980,123", gr:"+10.1%", st:"#2D7A5E", bg:"#E5F4EE"},
                  {lb:"Total ER", v:"5.2%", gr:"+1.2%", st:"#2D7A5E", bg:"#E5F4EE"},
                  {lb:"Komentar", v:"4,120", gr:"-2.1%", st:"#9C2B4E", bg:"#F8EAF0"},
                  {lb:"Likes", v:"88,312", gr:"+40.5%", st:"#2D7A5E", bg:"#E5F4EE"},
                  {lb:"Share", v:"10,204", gr:"+5.0%", st:"#2D7A5E", bg:"#E5F4EE"},
                  {lb:"Repost", v:"2,300", gr:"-1.0%", st:"#9C2B4E", bg:"#F8EAF0"},
                  {lb:"Save", v:"14,500", gr:"+20.4%", st:"#2D7A5E", bg:"#E5F4EE"}
                ].map((s,i) => (
                  <div key={i} className="hover-scale" style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid rgba(44,32,22,0.05)" }}>
                     <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(44,32,22,0.5)", marginBottom: 8 }}>{s.lb}</div>
                     <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                       <div style={{ fontSize: 24, fontWeight: 800, color: "#2C2016" }}>{s.v}</div>
                       <div style={{ background:s.bg, color:s.st, padding:"4px 8px", borderRadius:6, fontSize:11, fontWeight:800 }}>{s.gr}</div>
                     </div>
                  </div>
                ))}
             </div>

             {/* Detailed Chart Segment */}
             <div style={{ background: "white", borderRadius: 20, border: "1px solid rgba(44,32,22,0.05)", padding: 24, marginBottom: 24 }}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
                  <h3 style={{fontSize:18, fontWeight:800, margin:0}}>Grafik Tren {ANALYTICS_METRICS.find(m=>m.id === analyticsMetric)?.label}</h3>
                  <CustomDropdown value={analyticsMetric} options={ANALYTICS_METRICS} onChange={setAnalyticsMetric} />
                </div>
                <div style={{height: 300, width: "100%"}}>
                  <ResponsiveContainer>
                    <LineChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(44,32,22,0.05)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(44,32,22,0.5)', fontWeight:600}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'rgba(44,32,22,0.5)', fontWeight:600}} />
                      <RechartsTooltip contentStyle={{borderRadius:12, border:"none", boxShadow:"0 5px 20px rgba(0,0,0,0.1)", fontWeight:700}} />
                      {analyticsMetric === 'all' && <Legend iconType="circle" wrapperStyle={{fontSize:13, fontWeight:700, color:"#2C2016"}} />}
                      {analyticsMetric === 'all' ? (
                        <>
                          <Line type="monotone" dataKey="views" name="Views" stroke="var(--theme-primary)" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="reach" name="Reach" stroke="#2D7A5E" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="likes" name="Likes" stroke="#9C2B4E" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="comments" name="Komentar" stroke="#1877F2" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="shares" name="Share" stroke="#000" strokeWidth={2} dot={false} />
                        </>
                      ) : (
                        <Line type="monotone" dataKey={analyticsMetric} name={ANALYTICS_METRICS.find(m=>m.id === analyticsMetric)?.label} stroke="var(--theme-primary)" strokeWidth={3} dot={{r:4, strokeWidth:2}} activeDot={{r:6}} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
               </div>
             </div>

             {/* Audience & AI */}
             <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:20, marginBottom:24}}>
                <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid rgba(44,32,22,0.05)" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                     <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Data Audiens</h3>
                   </div>
                   <div style={{display:"flex", gap:20, flexWrap:"wrap"}}>
                     <div style={{flex:1, minWidth:200}}>
                       <h4 style={{fontSize:13, fontWeight:800, color:"rgba(44,32,22,0.5)", marginBottom:16}}>Demografi Geografis</h4>
                       <div style={{height:200, width:"100%", background:"#E5EDF8", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden"}}>
                          <div style={{position:"absolute", width:"100%", height:"100%", background:"url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Indonesia_blank_map.svg') center center/contain no-repeat", opacity: 0.5}} />
                          <div className="hover-scale" style={{position:"absolute", top:"55%", left:"30%"}}>
                            <MapPin size={24} color="var(--theme-primary)" fill="white" />
                            <div style={{fontSize:10, fontWeight:800, background:"white", padding:"2px 4px", borderRadius:4, color:"#2C2016", position:"absolute", top:24, left:-10, whiteSpace:"nowrap"}}>Jakarta (45%)</div>
                          </div>
                          <div className="hover-scale" style={{position:"absolute", top:"65%", left:"45%"}}>
                            <MapPin size={16} color="var(--theme-primary)" fill="white" />
                            <div style={{fontSize:10, fontWeight:800, background:"white", padding:"2px 4px", borderRadius:4, color:"#2C2016", position:"absolute", top:16, left:-10, whiteSpace:"nowrap"}}>Surabaya (15%)</div>
                          </div>
                          <div className="hover-scale" style={{position:"absolute", top:"35%", left:"15%"}}>
                            <MapPin size={12} color="var(--theme-primary)" fill="white" />
                            <div style={{fontSize:10, fontWeight:800, background:"white", padding:"2px 4px", borderRadius:4, color:"#2C2016", position:"absolute", top:12, left:-10, whiteSpace:"nowrap"}}>Medan (10%)</div>
                          </div>
                          <div className="hover-scale" style={{position:"absolute", top:"60%", left:"75%"}}>
                            <MapPin size={12} color="var(--theme-primary)" fill="white" />
                            <div style={{fontSize:10, fontWeight:800, background:"white", padding:"2px 4px", borderRadius:4, color:"#2C2016", position:"absolute", top:12, left:-10, whiteSpace:"nowrap"}}>Makassar (10%)</div>
                          </div>
                       </div>

                     </div>
                     <div style={{flex:1, minWidth:200}}>
                       <h4 style={{fontSize:13, fontWeight:800, color:"rgba(44,32,22,0.5)", marginBottom:16}}>Gender & Umur</h4>
                       <div style={{height: 200}}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{age:"18-24", p:40, l:30},{age:"25-34", p:35, l:25},{age:"35-44", p:15, l:10}]} layout="vertical" margin={{top:0, right:0, left:0, bottom:0}}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(44,32,22,0.05)" />
                              <XAxis type="number" hide />
                              <YAxis dataKey="age" type="category" axisLine={false} tickLine={false} tick={{fontSize:11, fontWeight:800}} width={40} />
                              <RechartsTooltip cursor={{fill:"transparent"}} contentStyle={{borderRadius:8, fontWeight:700, border:"none", boxShadow:"0 4px 10px rgba(0,0,0,0.1)"}} />
                              <Bar dataKey="p" name="Perempuan" fill="var(--theme-primary)" radius={[0,4,4,0]} barSize={12} />
                              <Bar dataKey="l" name="Laki-laki" fill="#2C2016" radius={[0,4,4,0]} barSize={12} />
                            </BarChart>
                          </ResponsiveContainer>
                       </div>
                     </div>
                   </div>
                </div>

                <div style={{ background: "var(--theme-primary)11", borderRadius: 20, padding: 24, border: "1px solid var(--theme-primary)22", display:"flex", flexDirection:"column" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8, color:"var(--theme-primary)" }}><Sparkles size={18}/> Gemini AI</h3>
                   </div>
                   <button className="hover-scale" onClick={generateReport} disabled={aiLoading} style={{ background: "var(--theme-primary)", color: "white", border: "none", padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", width:"100%", marginBottom:20, flexShrink:0 }}>
                     {aiLoading ? "Gemini sedang berpikir..." : "Analisis Insight Saat Ini"}
                   </button>
                   <div style={{flex:1, overflowY:"auto"}}>
                     {aiReport ? (
                       <div className="markdown-body" style={{ fontSize: 14, color: "#2C2016", lineHeight:1.6 }}>
                         <Markdown>{aiReport}</Markdown>
                       </div>
                     ) : (
                       <div style={{textAlign:"center", color:"rgba(44,32,22,0.5)", marginTop:40, fontSize:13, fontWeight:700}}>Klik tombol di atas untuk mendapatkan analisa pakar dari Gemini.</div>
                     )}
                   </div>
                </div>
             </div>

             <div style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid rgba(44,32,22,0.05)" }}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin:0 }}>Best Time to Post (Heatmap)</h3>
                  <CustomDropdown value={heatmapMetric} options={[{id:"views", label:"Berdasarkan Views"}, {id:"engagement", label:"Berdasarkan Engagement"}]} onChange={setHeatmapMetric} />
                </div>
                <HeatmapMock />
             </div>
          </motion.div>
        )}

        {/* CONTENT TAB */}
        {tab === "social-content" && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
               <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: "#2C2016", margin: 0 }}>Konten Dipublikasi</h2>
                  <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", margin:"4px 0 0", fontWeight:600}}>List 100% postingan yang ditarik secara otomatis.</p>
               </div>
               <div style={{ display: "flex", gap: 12 }}>
                 <CustomDropdown value={contentPlatform} options={PLATFORMS} onChange={setContentPlatform} renderOption={(o)=><div style={{display:"flex", alignItems:"center", gap:8, fontWeight:700}}>{o.icon} <span>{o.name}</span></div>} />
                 <CustomDropdown value={contentSort} options={SORT_OPTIONS} onChange={setContentSort} />
                 <CustomDropdown value={contentTimeRange} options={DASHBOARD_TIME_RANGES} onChange={setContentTimeRange} />
                 <button className="hover-scale" style={{background:"#2C2016", color:"white", borderRadius:12, padding:"10px 16px", border:"none", fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:8}}>
                   <Download size={14}/> Download CSV
                 </button>
               </div>
             </div>

             <div style={{background:"white", borderRadius:20, border:"1px solid rgba(44,32,22,0.05)", overflow:"hidden"}}>
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                  <thead style={{background:"#FAFAFA", borderBottom:"1px solid rgba(44,32,22,0.1)", color:"rgba(44,32,22,0.5)"}}>
                    <tr>
                      <th style={{padding:"16px 20px", textAlign:"left", fontWeight:800}}>Konten / Judul</th>
                      <th style={{padding:"16px 20px", textAlign:"left", fontWeight:800}}>Platform</th>
                      <th style={{padding:"16px 20px", textAlign:"right", fontWeight:800}}>Views</th>
                      <th style={{padding:"16px 20px", textAlign:"right", fontWeight:800}}>ER</th>
                      <th style={{padding:"16px 20px", textAlign:"right", fontWeight:800}}>Komen</th>
                      <th style={{padding:"16px 20px", textAlign:"right", fontWeight:800}}>Share</th>
                      <th style={{padding:"16px 20px", textAlign:"right", fontWeight:800}}>Save</th>
                      <th style={{padding:"16px 20px", textAlign:"center", fontWeight:800}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DISPLAY_CONTENT.map((post, i) => (
                      <tr key={i} className="hover-fade" style={{borderBottom:"1px solid rgba(44,32,22,0.05)", transition:"background 0.2s"}}>
                        <td style={{padding:"16px 20px"}}>
                          <div style={{display:"flex", alignItems:"center", gap:12}}>
                            <div style={{width:48, height:48, borderRadius:8, background:"#f0f0f0", flexShrink:0}}></div>
                            <div>
                              <div style={{fontWeight:800, color:"#2C2016", marginBottom:4}}>{post.title}</div>
                              <div style={{fontSize:11, color:"rgba(44,32,22,0.5)", fontWeight:600}}>{post.time}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"16px 20px"}}>
                          <div style={{display:"inline-flex", alignItems:"center", gap:6, background:post.type==='instagram'?"#F8EAF0":post.type==='meta'?"#EBF3FC":"#f0f0f0", color:post.type==='instagram'?"#E4405F":post.type==='meta'?"#1877F2":"#000", padding:"4px 8px", borderRadius:6, fontSize:11, fontWeight:800}}>
                            {post.type==='instagram' ? <Instagram size={12}/> : post.type==='meta' ? <Facebook size={12}/> : <div style={{fontSize:10, fontWeight:900}}>TT</div>}
                            {post.type==='instagram' ? "Instagram" : post.type==='meta' ? "Facebook" : "TikTok"}
                          </div>
                        </td>
                        <td style={{padding:"16px 20px", textAlign:"right", fontWeight:800}}>{post.views > 1000 ? (post.views/1000).toFixed(1) + 'K' : post.views}</td>
                        <td style={{padding:"16px 20px", textAlign:"right", fontWeight:800, color:"var(--theme-primary)"}}>{post.er}%</td>
                        <td style={{padding:"16px 20px", textAlign:"right", fontWeight:700}}>{post.comments}</td>
                        <td style={{padding:"16px 20px", textAlign:"right", fontWeight:700}}>{post.shares}</td>
                        <td style={{padding:"16px 20px", textAlign:"right", fontWeight:700}}>{post.saves}</td>
                        <td style={{padding:"16px 20px", textAlign:"center"}}>
                          <button onClick={()=>setSelectedContent(post)} className="hover-scale" style={{background:"transparent", border:"1px solid rgba(44,32,22,0.2)", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontWeight:800, fontSize:11, color:"#2C2016"}}>Detail</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </motion.div>
        )}

        {/* CALENDAR */}
        {tab === "social-calendar" && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
               <div>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "#2C2016", margin: 0 }}>Kalender Konten Sosial</h2>
                  <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", margin:"4px 0 0", fontWeight:600}}>Lihat semua postingan yang terpublikasi di kalender.</p>
               </div>
               <div style={{ display: "flex", gap: 12 }}>
                 <CustomDropdown value={contentPlatform} options={PLATFORMS} onChange={setContentPlatform} renderOption={(o)=><div style={{display:"flex", alignItems:"center", gap:8, fontWeight:700}}>{o.icon} <span>{o.name}</span></div>} />
                 <div style={{display:"flex", alignItems:"center", background:"white", border:"1px solid rgba(44,32,22,0.1)", borderRadius:12, padding:4}}>
                    <button className="hover-scale" style={{background:"transparent", border:"none", padding:6, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}><ChevronLeft size={16}/></button>
                    <div style={{fontWeight:800, fontSize:13, padding:"0 12px"}}>Agustus 2026</div>
                    <button className="hover-scale" style={{background:"transparent", border:"none", padding:6, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}><ChevronRight size={16}/></button>
                 </div>
               </div>
             </div>

             <CalendarMock />
          </motion.div>
        )}

        {/* COMPETITOR ANALYSIS */}
        {tab === "social-competitor" && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
               <div>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "#2C2016", margin: 0 }}>Analisis Kompetitor</h2>
                  <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", margin:"4px 0 0", fontWeight:600}}>Bandingkan performa hingga 5 akun kompetitor secara realtime.</p>
               </div>
               <CustomDropdown value={contentPlatform} options={[{id:"ig", label:"Instagram"}, {id:"tt", label:"TikTok"}]} onChange={setContentPlatform} />
             </div>

             <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <input placeholder="Ketik username kompetitor (contoh: @kompetitor)..." style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(44,32,22,0.1)", fontSize: 14, fontFamily:"inherit", fontWeight:500 }} />
                <button className="hover-scale" style={{ background: "#2C2016", color: "white", border: "none", padding: "0 24px", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>Tambah Kompetitor</button>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {["@brandsebelah", "@kompetitor_id"].map((comp, idx) => (
                  <div key={idx} className="hover-scale" style={{ background: "white", borderRadius: 20, padding: 24, border: "1px solid rgba(44,32,22,0.05)" }}>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                         <div style={{ width: 40, height: 40, borderRadius: 20, background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={20} color="rgba(44,32,22,0.3)"/></div>
                         <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{comp}</h3>
                       </div>
                       <div style={{ fontSize: 12, fontWeight: 800, color: "#2D7A5E", background: "#E5F4EE", padding: "6px 10px", borderRadius: 8 }}>ER: 4.2%</div>
                     </div>
                     <div style={{ fontSize: 13, color: "rgba(44,32,22,0.5)", marginBottom: 16, fontWeight:600 }}>Rata-rata posting: <strong style={{color:"#2C2016"}}>14 per bulan</strong></div>
                     <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Top 3 Konten Mereka</h4>
                     {[1,2,3].map(i => (
                       <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(44,32,22,0.05)" }}>
                         <div style={{ width: 60, height: 60, borderRadius: 8, background: "#f0f0f0" }}></div>
                         <div>
                           <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Review Produk Viral</div>
                           <div style={{ fontSize: 11, color: "rgba(44,32,22,0.5)", fontWeight:700 }}>150K Views • 12K Likes</div>
                         </div>
                       </div>
                     ))}
                  </div>
                ))}
             </div>
          </motion.div>
        )}

        {/* INBOX */}
        {tab === "social-inbox" && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} style={{ height: "calc(100vh - 120px)", display: "flex", gap: 24 }}>
             <div style={{ flex: 1, background: "white", borderRadius: 20, border: "1px solid rgba(44,32,22,0.05)", display: "flex", flexDirection: "column", overflow:"hidden" }}>
                <div style={{ padding: 20, borderBottom: "1px solid rgba(44,32,22,0.05)" }}>
                   <h3 style={{fontSize:18, fontWeight:800, margin:"0 0 16px"}}>Kotak Masuk</h3>
                   <input placeholder="Cari pesan atau username..." style={{ width: "100%", padding: "10px 16px", borderRadius: 20, border: "1px solid rgba(44,32,22,0.1)", fontSize: 13, fontFamily:"inherit" }} />
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="hover-scale" style={{padding:"16px 20px", borderBottom:"1px solid rgba(44,32,22,0.05)", cursor:"pointer", display:"flex", gap:12, background:i===1?"#FAFAFA":"transparent"}}>
                       <div style={{width:40, height:40, borderRadius:20, background:"#f0f0f0", flexShrink:0}}></div>
                       <div style={{overflow:"hidden"}}>
                         <div style={{fontWeight:800, fontSize:14, marginBottom:4, display:"flex", alignItems:"center", gap:6}}>User IG #{i} <span style={{fontSize:9, background:"#F8EAF0", color:"#E4405F", padding:"2px 6px", borderRadius:4, fontWeight:800}}>Instagram</span></div>
                         <div style={{fontSize:12, color:"rgba(44,32,22,0.6)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontWeight:i===1?800:600}}>Pesanan saya kapan dikirim ka...</div>
                       </div>
                     </div>
                   ))}
                </div>
             </div>
             <div style={{ flex: 2, background: "white", borderRadius: 20, border: "1px solid rgba(44,32,22,0.05)", display: "flex", flexDirection: "column", overflow:"hidden" }}>
                <div style={{ padding: 20, borderBottom: "1px solid rgba(44,32,22,0.05)", display:"flex", alignItems:"center", gap:12 }}>
                   <div style={{width:48, height:48, borderRadius:24, background:"#f0f0f0"}}></div>
                   <div>
                     <div style={{fontWeight:800, fontSize:18}}>User IG #1</div>
                     <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700}}>Direct Message • Instagram</div>
                   </div>
                </div>
                <div style={{ flex: 1, padding: 24, overflowY: "auto", display:"flex", flexDirection:"column", gap:16, background:"#FAFAFA" }}>
                   <div style={{background:"white", border:"1px solid rgba(44,32,22,0.05)", padding:16, borderRadius:"16px 16px 16px 4px", maxWidth:"70%", alignSelf:"flex-start", boxShadow:"0 2px 10px rgba(0,0,0,0.02)"}}>
                     <div style={{fontSize:14, lineHeight:1.5, color:"#2C2016", fontWeight:600}}>Halo min, pesanan saya nomor 1234 kapan dikirim ya? Terima kasih.</div>
                     <div style={{fontSize:10, color:"rgba(44,32,22,0.4)", fontWeight:800, marginTop:8}}>10:42 AM</div>
                   </div>
                </div>
                <div style={{ padding: 20, borderTop: "1px solid rgba(44,32,22,0.05)", display:"flex", gap:12, background:"white" }}>
                   <input placeholder="Ketik balasan..." style={{ flex: 1, padding: "14px 20px", borderRadius: 24, border: "1px solid rgba(44,32,22,0.1)", fontSize: 14, outline:"none", fontFamily:"inherit", fontWeight:600 }} />
                   <button className="hover-scale" style={{ width:48, height:48, borderRadius:24, background: "var(--theme-primary)", color: "white", border: "none", display:"flex", alignItems:"center", justifyContent:"center", cursor: "pointer", flexShrink:0 }}><Send size={18}/></button>
                </div>
             </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
