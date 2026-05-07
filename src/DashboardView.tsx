import React, { useState, useEffect, useMemo, useRef } from "react";
import DOMPurify from "dompurify";
import { 
  motion, 
  AnimatePresence, 
  Reorder 
} from "motion/react";
import { 
  Sun, Moon, Cloud, CloudRain, Wind, 
  CheckCircle2, Circle, Clock, Plus, 
  ChevronRight, StickyNote, TrendingUp, BarChart3, 
  Users, Eye, MessageSquare, Share2, 
  GripVertical, Layout, Edit3, Save, 
  Calendar, RotateCcw, Target, Sparkles,
  ArrowRight, Settings, User as UserIcon, X, Maximize2, Move, Trash2, Pencil
} from "lucide-react";
import { 
  doc, setDoc, updateDoc, onSnapshot, 
  collection, query, where, orderBy, getDocs, addDoc, deleteDoc, serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { B, CARD, TRANS, I, SS, gss, TAB } from "./data";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";

// --- WIDGET TYPES ---
type WidgetType = "todos" | "goal" | "sticky" | "shortcut";

interface LayoutItem {
  id: string;
  type: WidgetType;
  w: number; // grid columns
  h: number; // grid rows (optional, but good for bento)
}

const DEFAULT_LAYOUT: LayoutItem[] = [
  { id: "w-goal", type: "goal", w: 1, h: 2 },
  { id: "w-todos", type: "todos", w: 1, h: 2 },
  { id: "w-sticky", type: "sticky", w: 1, h: 2 },
  { id: "w-shortcut", type: "shortcut", w: 3, h: 1 },
];

export function DashboardView({ user, profile, activeWorkspace, content, theme, setTab, sidebarOpen, setSidebarOpen }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [layout, setLayout] = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const navigate = useNavigate();
  const [config, setConfig] = useState<any>({
    stickyNotes: [],
    goals: { posts: 20, views: 10000, engagement: 1000, er: 5 }
  });
  const [todos, setTodos] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>({ temp: "--", desc: "Memuat info...", city: "Mencari lokasi..." });
  const [time, setTime] = useState(new Date());
  const [trends, setTrends] = useState<string[]>(["Cara viral hari ini", "Content strategy", "Trending audio", "Tips FYP TikTok"]);
  const [loading, setLoading] = useState(true);

  // Time
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Trends API
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch("https://corsproxy.io/?" + encodeURIComponent("https://trends.google.com/trends/trendingsearches/daily/rss?geo=ID"));
        if (!res.ok) throw new Error("Failed to fetch RSS");
        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const items = Array.from(xml.querySelectorAll("item title")).slice(0, 5).map(node => node.textContent || "");
        if (items.length > 0) setTrends(items);
      } catch (e) {
        // Fallback to initial dummy data on error, ignoring silently to prevent console spam 
        // as public CORS proxies are frequently unreliable.
      }
    };
    fetchTrends();
  }, []);

  // Weather API with location
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        
        // Reverse geocoding for city
        let city = "Lokasi Tidak Diketahui";
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const geoData = await geoRes.json();
          city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || "Lokasi Anda";
        } catch(e) {}

        setWeather({ temp: data.current_weather.temperature, desc: "Cerah & Berawan", city });
      } catch (e) {
        console.error("Weather fetch error:", e);
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(-6.2088, 106.8456) // Fallback Jakarta
      );
    } else {
      fetchWeather(-6.2088, 106.8456);
    }
  }, []);

  // Sync Layout & Config
  useEffect(() => {
    if (!activeWorkspace?.id) return;
    const unsub = onSnapshot(doc(db, "workspaces", activeWorkspace.id, "dashboard", "config"), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.layout) {
          const existingIds = d.layout.map((x:any) => x.id);
          const missing = DEFAULT_LAYOUT.filter(x => !existingIds.includes(x.id));
          setLayout([...d.layout, ...missing]);
        }
        // Safely spread goals to ensure object structure exists
        setConfig((prev: any) => ({ ...prev, ...d, goals: d.goals || prev.goals })); 
      }
      setLoading(false);
    }, (error) => {
      console.warn("Config snapshot error:", error);
      setLoading(false);
    });
    return unsub;
  }, [activeWorkspace?.id]);

  // Sync Todos
  useEffect(() => {
    if (!activeWorkspace?.id) return;
    const q = query(
      collection(db, "workspaces", activeWorkspace.id, "todos"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setTodos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.warn("Todos snapshot error:", error);
    });
    return unsub;
  }, [activeWorkspace?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = layout.findIndex(x => x.id === active.id);
    const newIndex = layout.findIndex(x => x.id === over.id);
    const newLayout = arrayMove(layout, oldIndex, newIndex);
    
    setLayout(newLayout);
  };

  const updateItemSize = (id: string, newW: number, newH: number, absolute=false) => {
    setLayout(prev => prev.map(item => {
      if (item.id === id) {
        if (absolute) {
           return { ...item, w: Math.max(1, Math.min(4, newW)), h: Math.max(1, Math.min(4, newH)) };
        }
        return { ...item, w: Math.max(1, Math.min(4, item.w + newW)), h: Math.max(1, Math.min(4, item.h + newH)) };
      }
      return item;
    }));
  };

  const saveLayout = async () => {
    if (!activeWorkspace?.id) return;
    await setDoc(doc(db, "workspaces", activeWorkspace.id, "dashboard", "config"), {
      ...config,
      layout
    }, { merge: true });
    setIsEditing(false);
  };

  const updateConfig = async (key: string, val: any) => {
    if (!activeWorkspace?.id) return;
    const newConfig = { ...config, [key]: val };
    setConfig(newConfig);
    await setDoc(doc(db, "workspaces", activeWorkspace.id, "dashboard", "config"), {
      [key]: val,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  const [clockMenu, setClockMenu] = useState(false);
  
  const clockSettings = config.clock || { type: "analog", format: 24 };

  if (loading) return <div style={{padding:40, textAlign:"center", color:"rgba(0,0,0,0.3)"}}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: 1400, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header Container */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 32 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1, minWidth: 280 }}>
          <GreetingSection profile={profile} theme={theme} trends={trends} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end" }}>
           <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", justifyContent: "flex-end" }}>
             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase" }}>{weather.city}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#2C2016", fontSize: 32, fontWeight: 800 }}>
                   {weather?.temp > 30 ? <Sun size={32} color="#FF6B00" /> : <Cloud size={32} color="#3F51B5" />}
                   <span>{weather?.temp}°C</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(0,0,0,0.5)" }}>{weather.desc}</div>
             </div>
             <div style={{ width: 1, height: 64, background: "rgba(0,0,0,0.1)", display: "block" }} />
             
             <div style={{ position: "relative" }}>
               {clockSettings.type === "analog" ? (
                 <div 
                   onClick={() => setClockMenu(!clockMenu)}
                   style={{ width: 100, height: 100, borderRadius: "50%", background: "white", border: "5px solid #2C2016", position: "relative", cursor: "pointer" }}
                 >
                   <div style={{ position: "absolute", top: "50%", left: "50%", width: 6, height: 6, background: "#FF6B00", borderRadius: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }} />
                   {/* Hour Hand */}
                   <div style={{ position: "absolute", top: "25%", left: "calc(50% - 2.5px)", width: 5, height: "25%", background: "#2C2016", borderRadius: 4, transformOrigin: "bottom center", transform: `rotate(${(time.getHours() % 12) * 30 + time.getMinutes() * 0.5}deg)` }} />
                   {/* Minute Hand */}
                   <div style={{ position: "absolute", top: "15%", left: "calc(50% - 2px)", width: 4, height: "35%", background: "#666", borderRadius: 4, transformOrigin: "bottom center", transform: `rotate(${time.getMinutes() * 6}deg)` }} />
                   {/* Second Hand */}
                   <div style={{ position: "absolute", top: "10%", left: "calc(50% - 1px)", width: 2, height: "40%", background: "#FF6B00", borderRadius: 4, transformOrigin: "bottom center", transform: `rotate(${time.getSeconds() * 6}deg)` }} />
                 </div>
               ) : (
                 <div 
                   onClick={() => setClockMenu(!clockMenu)}
                   style={{ fontSize: 56, fontWeight: 900, color: "#2C2016", letterSpacing: "-2px", fontVariantNumeric: "tabular-nums", cursor: "pointer", display: "flex", alignItems: "baseline", gap: 8 }}
                 >
                   {time.toLocaleTimeString("en-US", { 
                     hour: "2-digit", 
                     minute: "2-digit", 
                     hour12: clockSettings.format === 12 
                   }).replace(/\s?[APap][mM]/, "").replace("::", ":")}
                   {clockSettings.format === 12 && (
                     <span style={{ fontSize: 20, fontWeight: 700, color: "rgba(0,0,0,0.4)", letterSpacing: 0 }}>
                       {time.getHours() >= 12 ? 'PM' : 'AM'}
                     </span>
                   )}
                 </div>
               )}
               
               <AnimatePresence>
                 {clockMenu && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: "absolute", top: "100%", right: 0, marginTop: 12, background: "white", padding: 16, borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", minWidth: 200, zIndex: 100 }}>
                     <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", marginBottom: 12 }}>Tampilan Jam</div>
                     <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                       <button onClick={() => { updateConfig("clock", { ...clockSettings, type: "digital" }); setClockMenu(false); }} style={{ ...B(clockSettings.type === "digital", theme.primary), padding: "8px 12px", fontSize: 13 }}>Jam Digital</button>
                       <button onClick={() => { updateConfig("clock", { ...clockSettings, type: "analog" }); setClockMenu(false); }} style={{ ...B(clockSettings.type === "analog", theme.primary), padding: "8px 12px", fontSize: 13 }}>Jam Analog</button>
                     </div>
                     {clockSettings.type === "digital" && (
                       <>
                         <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", margin: "16px 0 12px 0" }}>Format Waktu</div>
                         <div style={{ display: "flex", gap: 8 }}>
                           <button onClick={() => { updateConfig("clock", { ...clockSettings, format: 24 }); setClockMenu(false); }} style={{ ...B(clockSettings.format === 24, theme.primary), flex: 1, padding: "8px 0", fontSize: 13 }}>24 Jam</button>
                           <button onClick={() => { updateConfig("clock", { ...clockSettings, format: 12 }); setClockMenu(false); }} style={{ ...B(clockSettings.format === 12, theme.primary), flex: 1, padding: "8px 0", fontSize: 13 }}>AM/PM</button>
                         </div>
                       </>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           </div>
           
           <button 
             onClick={() => isEditing ? saveLayout() : setIsEditing(true)} 
             style={{ ...B(isEditing, isEditing ? "var(--theme-primary)" : "#2C2016"), borderRadius: 12, height: 32, padding: "0 16px", fontSize: 12 }}
             className="hover-scale"
           >
             {isEditing ? <><Save size={14} /> Selesai</> : <><Layout size={14} /> Atur Widget</>}
           </button>
        </div>
      </div>

      {/* Goal Metrics (Always on top) */}
      <MetricsRow content={content} config={config} updateConfig={updateConfig} theme={theme} />

      {/* Bento Grid */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <style>
          {`
            @media (max-width: 800px) {
              .w-widget {
                grid-column: 1 / -1 !important;
                grid-row: span 1 !important;
                min-height: 250px;
              }
            }
          `}
        </style>
        <style>
          {`
            .dashboard-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              grid-auto-rows: 160px;
              grid-auto-flow: dense;
              gap: 24px;
              flex: 1;
            }
            .w-widget {
              /* Add container queries for widget contents */
              container-type: size;
              container-name: widget;
            }
            /* Make sure columns don't overflow */
            @media (max-width: 1200px) {
              .dashboard-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
              .w-widget-span-3, .w-widget-span-4 { grid-column: span 2 !important; }
            }
            @media (max-width: 768px) {
              .dashboard-grid {
                grid-template-columns: repeat(1, minmax(0, 1fr));
              }
              .w-widget { grid-column: span 1 !important; }
            }
            @media (min-width: 1201px) {
               .dashboard-grid {
                 grid-template-columns: repeat(3, minmax(0, 1fr));
               }
            }
          `}
        </style>
        <div className="dashboard-grid">
          <SortableContext items={layout.map(w => w.id)} strategy={rectSortingStrategy}>
            {layout.map((w) => (
              <DashboardWidget 
                key={w.id} 
                item={w} 
                activeWorkspace={activeWorkspace}
                user={user}
                config={config}
                updateConfig={updateConfig}
                todos={todos}
                content={content}
                isEditing={isEditing}
                theme={theme}
                onResize={updateItemSize}
                setTab={setTab}
                navigate={navigate}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}

// --- TOP LEVEL COMPONENTS ---

function GreetingSection({ profile, theme, trends = ["Cara viral di TikTok hari ini", "AI untuk Content Creator", "Ide konten Instagram kreatif", "Tips jualan di e-commerce", "Trend warna pastel", "Outfit inspirasi minggu ini"] }: any) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hour = time.getHours();
  let greeting = "Selamat Malam";
  if (hour < 11) greeting = "Selamat Pagi";
  else if (hour < 15) greeting = "Selamat Siang";
  else if (hour < 19) greeting = "Selamat Sore";

  const [trendIndex, setTrendIndex] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTrendIndex(x => (x + 1) % trends.length), 4000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, maxWidth: 800 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: "#2C2016", letterSpacing: "-1.5px", margin: 0, lineHeight: 1.1 }}>
          {greeting},<br/>
          <span style={{ color: theme.primary }}>{profile?.nickname || profile?.fullName?.split(" ")[0] || "Kreator"}! ✨</span>
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, background: theme.primary+"10", padding: "12px 20px", borderRadius: 100, width: "fit-content" }}>
         <TrendingUp size={18} color={theme.primary} />
         <span style={{ fontSize: 13, fontWeight: 800, color: theme.primary, textTransform: "uppercase", whiteSpace: "nowrap" }}>Google Trends Naik:</span>
         <div style={{ position: "relative", height: 20, width: 200, overflow: "hidden" }}>
           <AnimatePresence mode="wait">
             <motion.div 
               key={trendIndex} 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, y: -20 }} 
               transition={{ duration: 0.3 }}
               style={{ position: "absolute", fontSize: 14, fontWeight: 700, color: "#2C2016", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", width: "100%" }}
             >
               "{trends[trendIndex]}"
             </motion.div>
           </AnimatePresence>
         </div>
      </div>
    </motion.div>
  );
}

function MetricsRow({ content, config, updateConfig, theme }: any) {
  const [showGoals, setShowGoals] = useState(false);
  const [localGoals, setLocalGoals] = useState(config.goals);

  const totals = useMemo(() => {
    return content.reduce((acc: any, c: any) => {
      const m = c.metrics || {};
      acc.views += (m.views || 0);
      acc.likes += (m.likes || 0);
      acc.comments += (m.comments || 0);
      acc.shares += (m.shares || 0);
      acc.totalPosts += (c.status === "Published" ? 1 : 0);
      return acc;
    }, { views: 0, likes: 0, comments: 0, shares: 0, totalPosts: 0 });
  }, [content]);

  const engSum = totals.likes + totals.comments + totals.shares;
  const engRate = totals.views > 0 ? ((engSum / totals.views) * 100) : 0;

  const metrics = [
    { label: "Total Posts", current: totals.totalPosts, target: config.goals?.posts || 20, icon: <BarChart3 size={18}/>, color: "#2C2016" },
    { label: "Views", current: totals.views, target: config.goals?.views || 10000, icon: <Eye size={18}/>, color: "#FF6B00" },
    { label: "Engagement", current: engSum, target: config.goals?.engagement || 1000, icon: <MessageSquare size={18}/>, color: "#9C2B4E" },
    { label: "ER Analysis (%)", current: engRate, target: config.goals?.er || 5, isPerc: true, icon: <TrendingUp size={18}/>, color: "#2D7A5E" },
  ];

  return (
    <div style={{ background: "var(--theme-gradient)", padding: 24, borderRadius: 24, border: "1px solid rgba(0,0,0,0.03)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.9)", letterSpacing: 0.5, margin: 0, textTransform: "uppercase" }}>Goal Metrics Tiap Bulannya</h2>
        <button 
          onClick={() => {
            setLocalGoals(config.goals || { posts: 20, views: 10000, engagement: 1000, er: 5 });
            setShowGoals(true);
          }}
          className="hover-scale"
          style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", fontSize: 12, padding: "6px 16px", borderRadius: 12, height: 32, display: "flex", alignItems: "center", gap: 6, fontWeight: 700, cursor: "pointer" }}
        >
          <Target size={14} /> Atur Goals
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ padding: 16, background: "rgba(255,255,255,0.1)", borderRadius: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.02)", border: "1px solid rgba(255,255,255,0.1)" }}>
             <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>
               {m.icon}
               <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", opacity: 0.8 }}>{m.label}</span>
             </div>
             <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: "white" }}>
                  {m.isPerc ? m.current.toFixed(2) : m.current.toLocaleString()}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
                  / {m.isPerc ? m.target : m.target.toLocaleString()}
                </span>
             </div>
             <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: m.current >= m.target ? "#A7F3D0" : "#FECACA" }}>
                {m.current >= m.target 
                  ? "Tercapai! ✨" 
                  : `Kurang ${(m.target - m.current).toLocaleString()} lagi`}
             </div>
          </div>
        ))}
      </div>

      {showGoals && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: 32, borderRadius: 24, width: 400 }}>
             <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Atur Goal Bulanan</h3>
             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
               <div>
                 <label style={{ fontSize: 12, fontWeight: 700 }}>Total Posts</label>
                 <input type="number" value={localGoals.posts} onChange={e=>setLocalGoals({...localGoals, posts: Number(e.target.value)})} style={I({})} />
               </div>
               <div>
                 <label style={{ fontSize: 12, fontWeight: 700 }}>Total Views</label>
                 <input type="number" value={localGoals.views} onChange={e=>setLocalGoals({...localGoals, views: Number(e.target.value)})} style={I({})} />
               </div>
               <div>
                 <label style={{ fontSize: 12, fontWeight: 700 }}>Total Engagement</label>
                 <input type="number" value={localGoals.engagement} onChange={e=>setLocalGoals({...localGoals, engagement: Number(e.target.value)})} style={I({})} />
               </div>
               <div>
                 <label style={{ fontSize: 12, fontWeight: 700 }}>ER Analysis Target (%)</label>
                 <input type="number" value={localGoals.er} onChange={e=>setLocalGoals({...localGoals, er: Number(e.target.value)})} style={I({})} />
               </div>
             </div>
             <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={()=>setShowGoals(false)} style={{ ...B(false), flex: 1, padding: 12 }}>Batal</button>
                <button 
                  onClick={()=>{
                    updateConfig("goals", localGoals); 
                    setShowGoals(false);
                  }} 
                  style={{ ...B(true, theme.primary), flex: 1, padding: 12 }}
                >
                  Simpan Goal
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- RESIZE HANDLE ---
function ResizeHandle({ item, onResize }: any) {
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = item.w;
    const startH = item.h;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = Math.round((moveEvent.clientX - startX) / 300); 
      const dy = Math.round((moveEvent.clientY - startY) / 180); 
      
      const newW = Math.max(1, Math.min(4, startW + dx));
      const newH = Math.max(1, Math.min(4, startH + dy));
      if (newW !== item.w || newH !== item.h) {
         onResize(item.id, newW, newH, true);
      }
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <div 
      onPointerDown={handlePointerDown}
      style={{
        position: "absolute", bottom: -4, right: -4, width: 20, height: 20, 
        background: "var(--theme-primary, #C4622D)", borderRadius: "50%", cursor: "nwse-resize",
        zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
      }}
    >
      <div style={{width: 6, height: 6, background: "white", borderRadius: "50%"}} />
    </div>
  );
}

// --- DND WIDGET WRAPPER ---

function DashboardWidget({ item, isEditing, onResize, ...props }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: item.id,
    disabled: !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${item.w}`,
    gridRow: `span ${item.h}`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as any
  };

  const renderContent = () => {
    switch (item.type) {
      case "todos": return <TodoWidget {...props} item={item} />;
      case "goal": return <DailyProgressWidget {...props} item={item} />;
      case "sticky": return <StickyNoteWidget {...props} item={item} />;
      case "shortcut": return <ShortcutWidget {...props} item={item} />;
      default: return null;
    }
  };

  // If shortcut or empty type are removed, we just return null above
  const content = renderContent();
  if (!content) return null;

  return (
    <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} ref={setNodeRef} style={style} className={`w-widget w-widget-span-${item.w} group ${isEditing ? 'active:cursor-grabbing' : ''}`}>
      <style>
        {`
          .widget-content-container {
            container-type: size;
            container-name: widget;
          }
        `}
      </style>
      <motion.div layout style={{ ...CARD({ padding: 0 }), height: "100%", position: "relative", display: "flex", flexDirection: "column", border: isEditing ? "2px dashed var(--theme-primary, #2C2016)" : "1px solid rgba(0,0,0,0.03)" }}>
        
        {isEditing && (
          <>
            <motion.div layout {...attributes} {...listeners} style={{ position: "absolute", top: 12, right: 12, zIndex: 20, padding: 8, background: "rgba(0,0,0,0.8)", color: "white", borderRadius: 8, cursor: "grab" }}>
              <Move size={16} />
            </motion.div>
            <ResizeHandle item={item} onResize={onResize} />
          </>
        )}

        <motion.div layout className="widget-content-container" style={{ flex: 1, padding: "clamp(12px, 5cqw, 24px) clamp(12px, 5cqw, 24px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {content || <div style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(0,0,0,0.2)", fontSize:12, fontWeight:700}}>Widget Kosong</div>}
        </motion.div>

      </motion.div>
    </motion.div>
  );
}

// --- SPECIFIC WIDGETS REDESIGNED ---

function TodoWidget({ todos, activeWorkspace, user, content, theme }: any) {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [addingTodo, setAddingTodo] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [newTodoDate, setNewTodoDate] = useState(new Date().toISOString().split("T")[0]);
  
  // History tab filtering
  const [histStart, setHistStart] = useState("");
  const [histEnd, setHistEnd] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const automatedContent = useMemo(() => {
    return content.map((c: any) => ({
      id: `content-${c.id}`,
      text: c.title || "Konten Tanpa Judul",
      completed: c.status === "Published",
      type: "KONTEN",
      dueDate: `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`,
      isAutomated: true
    }));
  }, [content]);

  const usingDummyData = todos.length === 0 && content.length === 0;
  
  const dummyTodos = [
    { id: "d1", text: "Riset Tren TikTok", completed: true, type: "TUGAS", dueDate: todayStr },
    { id: "d2", text: "Buat Script Video Review", completed: true, type: "TUGAS", dueDate: todayStr },
    { id: "d3", text: "Shoot Video Produk OOTD", completed: false, type: "KONTEN", dueDate: todayStr },
    { id: "d4", text: "Edit & Kasih Suara Voiceover", completed: false, type: "TUGAS", dueDate: todayStr },
    { id: "d5", text: "Meeting dengan brand X", completed: false, type: "TUGAS", dueDate: tomorrowStr },
    { id: "d6", text: "Upload Video Review", completed: false, type: "KONTEN", dueDate: tomorrowStr }
  ];

  const allTodos = usingDummyData ? dummyTodos : [...todos, ...automatedContent];

  const activeToday = allTodos
    .filter(t => !t.completed && t.dueDate === todayStr)
    .sort((a,b) => (a.type === "KONTEN" ? -1 : 1));

  const activeTomorrow = allTodos
    .filter(t => !t.completed && t.dueDate === tomorrowStr)
    .sort((a,b) => (a.type === "KONTEN" ? -1 : 1));

  const activeLate = allTodos
    .filter(t => !t.completed && t.dueDate < todayStr && t.dueDate)
    .sort((a,b) => (a.dueDate > b.dueDate ? 1 : -1));

  const completedTodos = allTodos
    .filter(t => t.completed && (!tab || tab === "history"))
    .filter(t => {
      if (!histStart && !histEnd) return true;
      if (histStart && t.dueDate < histStart) return false;
      if (histEnd && t.dueDate > histEnd) return false;
      return true;
    })
    .sort((a,b) => (b.completedAt || 0) > (a.completedAt || 0) ? -1 : 1);

  const completedToday = allTodos.filter(t => t.completed && t.dueDate === todayStr).sort((a,b) => (b.completedAt || 0) > (a.completedAt || 0) ? -1 : 1);
  const completedTomorrow = allTodos.filter(t => t.completed && t.dueDate === tomorrowStr).sort((a,b) => (b.completedAt || 0) > (a.completedAt || 0) ? -1 : 1);

  const addTodo = async () => {
    if (!newTodo.trim() || !activeWorkspace?.id) return;
    await addDoc(collection(db, "workspaces", activeWorkspace.id, "todos"), {
      text: DOMPurify.sanitize(newTodo.trim()),
      completed: false,
      userId: user.uid,
      dueDate: newTodoDate,
      createdAt: serverTimestamp(),
      type: "TUGAS"
    });
    setNewTodo("");
    setAddingTodo(false);
  };

  const toggleTodo = async (todo: any) => {
    if (todo.isAutomated) {
      if (!activeWorkspace?.id) return;
      const contentId = todo.id.replace("content-", "");
      const newStatus = todo.completed ? "In Review" : "Published";
      
      const { doc: fDoc, updateDoc } = await import("./firebase");
      const { db } = await import("./firebase");
      
      await updateDoc(fDoc(db, "workspaces", activeWorkspace.id, "content", contentId), {
        status: newStatus
      });
      return;
    }
    await updateDoc(doc(db, "workspaces", activeWorkspace.id, "todos", todo.id), {
      completed: !todo.completed,
      completedAt: !todo.completed ? serverTimestamp() : null
    });
  };

  const deleteTodo = async (todo: any) => {
    if (todo.isAutomated) return;
    await deleteDoc(doc(db, "workspaces", activeWorkspace.id, "todos", todo.id));
  };

  const renameTodo = async (todo: any, newText: string) => {
    if (todo.isAutomated) return;
    await updateDoc(doc(db, "workspaces", activeWorkspace.id, "todos", todo.id), {
      text: DOMPurify.sanitize(newText)
    });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.05)", marginBottom: "clamp(8px, 4cqh, 16px)" }}>
        <div style={{ display: "flex", gap: "clamp(8px, 2cqw, 20px)" }}>
          <button onClick={() => setTab("active")} style={{ ...TAB(tab === "active"), fontSize: "clamp(12px, 5cqw, 15px)", padding: "clamp(6px, 2cqh, 10px) 0" }}>To Do List</button>
          <button onClick={() => setTab("history")} style={{ ...TAB(tab === "history"), fontSize: "clamp(12px, 5cqw, 15px)", padding: "clamp(6px, 2cqh, 10px) 0" }}>Riwayat</button>
        </div>
        <button 
          onClick={() => setAddingTodo(!addingTodo)}
          style={{ width: "clamp(24px, 10cqw, 36px)", height: "clamp(24px, 10cqw, 36px)", borderRadius: "50%", background: addingTodo ? "rgba(0,0,0,0.1)" : theme.primary, color: addingTodo ? "black" : "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}
        >
          {addingTodo ? <X size={"clamp(14px, 5cqw, 18px)"} /> : <Plus size={"clamp(14px, 5cqw, 18px)"} />}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingRight: 8, paddingBottom: 60 }}>
        
        <AnimatePresence>
          {addingTodo && (
            <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }} style={{ overflow: "hidden", marginBottom: 16 }}>
              <div style={{ background: "#FAFAF8", padding: "clamp(10px, 4cqw, 16px)", borderRadius: 16, border: "1px solid rgba(0,0,0,0.05)" }}>
                <input 
                  value={newTodo} onChange={(e)=>setNewTodo(e.target.value)}
                  placeholder="Tugas baru..."
                  autoFocus
                  style={I({ border: "none", background: "white", padding: "clamp(8px, 3cqh, 12px)", borderRadius: 12, marginBottom: 12, fontSize: "clamp(12px, 5cqw, 14px)" })}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                   <input 
                     type="date" 
                     value={newTodoDate} 
                     onChange={(e)=>setNewTodoDate(e.target.value)}
                     style={I({ padding: "clamp(6px, 2cqh, 8px) 12px", background: "white", border: "none", borderRadius: 12, flex: 1, fontSize: "clamp(11px, 4cqw, 13px)" })}
                   />
                   <button onClick={addTodo} style={{ ...B(true, theme.primary), padding: "clamp(6px, 2cqh, 8px) clamp(10px, 4cqw, 16px)", borderRadius: 12, fontSize: "clamp(11px, 4cqw, 13px)" }}>Simpan</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === "active" && (
          <>
            {/* LEWAT TENGGAT */}
            {activeLate.length > 0 && (
              <div style={{ marginBottom: "clamp(12px, 5cqh, 24px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "clamp(8px, 4cqh, 16px)" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.05)" }} />
                  <div style={{ fontSize: "clamp(10px, 3.5cqw, 12px)", fontWeight: 800, color: "#9C2B4E", textTransform: "uppercase" }}>Lewat TenggatWaktu</div>
                  <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.05)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                  <AnimatePresence>
                    {activeLate.map(t => <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} onRename={renameTodo} theme={theme} />)}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* HARI INI */}
            <div style={{ marginBottom: "clamp(12px, 5cqh, 24px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "clamp(8px, 4cqh, 16px)" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.05)" }} />
                <div style={{ fontSize: "clamp(10px, 3.5cqw, 12px)", fontWeight: 800, color: "rgba(0,0,0,0.4)", textTransform: "uppercase" }}>Hari Ini</div>
                <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.05)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                <AnimatePresence>
                  {activeToday.length === 0 && completedToday.length === 0 && <div style={{ fontSize: "clamp(11px, 4cqw, 14px)", color: "rgba(0,0,0,0.3)", textAlign: "center", padding: 12 }}>Kosong</div>}
                  {activeToday.map(t => <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} onRename={renameTodo} theme={theme} />)}
                  {completedToday.map(t => <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} onRename={renameTodo} theme={theme} />)}
                </AnimatePresence>
              </div>
            </div>

            {/* BESOK */}
            <div style={{ marginBottom: "clamp(12px, 5cqh, 24px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "clamp(8px, 4cqh, 16px)" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.05)" }} />
                <div style={{ fontSize: "clamp(10px, 3.5cqw, 12px)", fontWeight: 800, color: "rgba(0,0,0,0.4)", textTransform: "uppercase" }}>Besok</div>
                <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.05)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                <AnimatePresence>
                  {activeTomorrow.length === 0 && completedTomorrow.length === 0 && <div style={{ fontSize: "clamp(11px, 4cqw, 14px)", color: "rgba(0,0,0,0.3)", textAlign: "center", padding: 12 }}>Kosong</div>}
                  {activeTomorrow.map(t => <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} onRename={renameTodo} theme={theme} />)}
                  {completedTomorrow.map(t => <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} onRename={renameTodo} theme={theme} />)}
                </AnimatePresence>
              </div>
            </div>


          </>
        )}

        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: "clamp(4px, 2cqw, 12px)", alignItems: "center", background: "#FAFAF8", padding: "clamp(8px, 3cqw, 12px)", borderRadius: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: "clamp(10px, 4cqw, 13px)", fontWeight: 700, color: "rgba(0,0,0,0.6)", width: "100%" }}>Filter Rentang Tanggal:</div>
              <input type="date" value={histStart} onChange={(e)=>setHistStart(e.target.value)} style={I({fontSize: "clamp(10px, 4cqw, 13px)", padding: "clamp(4px, 2cqw, 8px)"})} title="Tanggal Mulai" />
              <span>-</span>
              <input type="date" value={histEnd} onChange={(e)=>setHistEnd(e.target.value)} style={I({fontSize: "clamp(10px, 4cqw, 13px)", padding: "clamp(4px, 2cqw, 8px)"})} title="Tanggal Selesai" />
            </div>
            {completedTodos.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "rgba(0,0,0,0.3)", fontSize: "clamp(11px, 4cqw, 14px)" }}>Belum ada riwayat.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
               <AnimatePresence>
                 {completedTodos.map(t => (
                   <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} onRename={renameTodo} theme={theme} disableAnimation />
                 ))}
               </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onRename, onDelete, theme, disableAnimation }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);

  const handleRename = () => {
    if (editValue.trim() && editValue.trim() !== todo.text) {
      if (onRename) onRename(todo, editValue.trim());
    } else {
      setEditValue(todo.text);
    }
    setIsEditing(false);
  };

  return (
    <motion.div 
      layout={!disableAnimation}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: todo.completed ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="group"
      style={{ 
        display: "flex", alignItems: "center", gap: "clamp(8px, 3cqw, 16px)", padding: "clamp(8px, 3cqw, 16px) clamp(12px, 4cqw, 20px)", background: todo.completed ? "transparent" : "#FAFAF8", 
        border: todo.completed ? "1px dashed rgba(0,0,0,0.1)" : "1px solid transparent",
        borderRadius: 16,
        position: "relative"
      }}
    >
      <button 
        onClick={() => onToggle(todo)} 
        disabled={isEditing}
        style={{ border: "none", background: "none", cursor: isEditing ? "default" : "pointer", padding: 0 }}
      >
        {todo.completed ? <CheckCircle2 size={20} color={theme.primary} style={{ width: "clamp(16px, 5cqw, 24px)", height: "clamp(16px, 5cqw, 24px)" }} /> : <Circle size={20} color="rgba(0,0,0,0.15)" style={{ width: "clamp(16px, 5cqw, 24px)", height: "clamp(16px, 5cqw, 24px)" }} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
           <input
             autoFocus
             value={editValue}
             onChange={e => setEditValue(e.target.value)}
             onBlur={handleRename}
             onKeyDown={e => {
               if (e.key === 'Enter') {
                 handleRename();
               } else if (e.key === 'Escape') {
                 setEditValue(todo.text);
                 setIsEditing(false);
               }
             }}
             style={{ width: "100%", fontSize: "clamp(11px, 4.5cqw, 14px)", fontWeight: 600, color: "#2C2016", border: `1px solid ${theme.primary}`, borderRadius: 8, padding: "2px 8px", outline: "none", background: "white" }}
           />
        ) : (
          <div 
            onClick={() => { if(!todo.isAutomated) setIsEditing(true); }}
            style={{ fontSize: "clamp(11px, 4.5cqw, 14px)", fontWeight: 600, color: "#2C2016", textDecoration: todo.completed ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: todo.isAutomated ? "default" : "text" }}
          >
            {todo.text}
          </div>
        )}
        <div style={{ display: "flex", gap: "clamp(4px, 2cqw, 8px)", marginTop: "clamp(2px, 1cqw, 6px)" }}>
          <span style={{ fontSize: "clamp(8px, 3cqw, 10px)", fontWeight: 800, color: todo.type === "KONTEN" ? "#9C2B4E" : "#C4622D", background: todo.type === "KONTEN" ? "#9C2B4E15" : "#C4622D15", padding: "2px 6px", borderRadius: 4 }}>
            {todo.type}
          </span>
          <span style={{ fontSize: "clamp(8px, 3cqw, 10px)", fontWeight: 700, color: "rgba(0,0,0,0.3)" }}>
            {todo.dueDate}
          </span>
        </div>
      </div>
      {!todo.isAutomated && !isEditing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { if(onDelete) onDelete(todo); }} style={{ border: "none", background: "#fef2f2", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function DailyProgressWidget({ todos, content, theme }: any) {
  const todayStr = new Date().toISOString().split("T")[0];
  
  const automatedContent = content.filter((c: any) => {
    return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}` === todayStr;
  });

  const manualTodos = todos.filter((t: any) => t.dueDate === todayStr);

  const total = automatedContent.length + manualTodos.length;
  const completed = automatedContent.filter((c:any)=>c.status==="Published").length + manualTodos.filter((t:any)=>t.completed).length;

  const perc = total === 0 ? 50 : Math.round((completed / total) * 100);
  const displayTotal = total === 0 ? 4 : total;
  const displayCompleted = total === 0 ? 2 : completed;
  
  const radius = 80;
  const circum = 2 * Math.PI * radius;
  const offset = circum - (perc / 100) * circum;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "clamp(12px, 5cqw, 20px)", fontWeight: 900, color: "rgba(0,0,0,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>
        Daily Progress
      </div>
      <div style={{ position: "relative", width: "100%", minHeight: 0, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", margin: "clamp(8px, 4cqh, 24px) 0" }}>
        <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%", maxHeight: "100%" }}>
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA4335" />
              <stop offset="50%" stopColor="#FBBC05" />
              <stop offset="100%" stopColor="#34A853" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#FAFAF8" strokeWidth="16" />
          <motion.circle 
            cx="100" cy="100" r={radius} fill="none" stroke="url(#progressGrad)" strokeWidth="16" strokeLinecap="round" 
            initial={{ strokeDashoffset: circum }}
            animate={{ strokeDashoffset: offset }}
            style={{ strokeDasharray: circum }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "clamp(24px, 12cqw, 48px)", fontWeight: 900, color: "#2C2016", letterSpacing: "-2px" }}>{perc}%</div>
          <div style={{ fontSize: "clamp(10px, 4cqw, 14px)", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>Selesai {displayCompleted}/{displayTotal}</div>
        </div>
      </div>
      <div style={{ fontSize: "clamp(11px, 4cqw, 16px)", fontWeight: 800, color: perc >= 100 && total > 0 ? "#34A853" : "#2C2016", textAlign: "center", minHeight: 20 }}>
        {total === 0 ? "Belum tugas." : perc >= 100 ? "Semua Tugas Selesai! 🎉" : "Terus semangat!"}
      </div>
    </div>
  );
}

import { createPortal } from "react-dom";

function StickyNoteWidget({ config, updateConfig, theme }: any) {
  const [showModal, setShowModal] = useState(false);
  const notes = config.stickyNotes || [];
  
  const dummyNotes = [
    { id: "d1", text: "Briefing konten Tiktok besok jam 10 pagi", color: "#FFF59D" },
    { id: "d2", text: "Cek email brand partnership dari X", color: "#81D4FA" },
    { id: "d3", text: "Edit video tutorial makeup part 2", color: "#F48FB1" },
    { id: "d4", text: "Riset ide untuk hari Ibu", color: "#C5E1A5" }
  ];

  const displayNotes = notes.length > 0 ? notes : dummyNotes;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(8px, 4cqh, 16px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StickyNote color={theme.primary} style={{ width: "clamp(14px, 5cqw, 20px)", height: "clamp(14px, 5cqw, 20px)" }} />
          <div style={{ fontSize: "clamp(10px, 4cqw, 14px)", fontWeight: 800, textTransform: "uppercase", whiteSpace: "nowrap" }}>Sticky Notes</div>
        </div>
        <button className="hover-scale" onClick={() => setShowModal(true)} style={{ background: theme.primary+"15", border: "none", color: theme.primary, cursor: "pointer", padding: "clamp(4px, 2cqh, 8px) clamp(8px, 3cqw, 12px)", borderRadius: 12, fontSize: "clamp(10px, 3.5cqw, 13px)", fontWeight: 800, whiteSpace: "nowrap" }}>
           Buka Semua ({notes.length})
        </button>
      </div>
      
      {/* Preview max 4 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 100px), 1fr))", gridAutoRows: "1fr", gap: "clamp(8px, 3cqw, 16px)", flex: 1 }}>
         {displayNotes.slice(0, 4).map((n: any) => (
           <div key={n.id} style={{ background: n.color || "#FFF59D", padding: "clamp(12px, 5cqw, 20px)", borderRadius: 16, fontSize: "clamp(11px, 4cqw, 14px)", color: "#2C2016", overflow: "hidden", position: "relative", boxShadow: "inset 0 0 20px rgba(0,0,0,0.02)" }}>
              <textarea 
                value={notes.find((note:any) => note.id === n.id)?.text ?? n.text} 
                onChange={(e) => {
                  if (notes.find((note:any) => note.id === n.id)) {
                    updateConfig("stickyNotes", notes.map((note:any) => note.id === n.id ? { ...note, text: e.target.value } : note));
                  } else {
                    updateConfig("stickyNotes", [...notes, { id: n.id, text: e.target.value, color: n.color }]);
                  }
                }}
                style={{ width: "100%", height: "100%", background: "transparent", border: "none", resize: "none", outline: "none", fontSize: "clamp(11px, 4cqw, 14px)", fontWeight: 600, color: "rgba(0,0,0,0.8)", lineHeight: 1.4 }}
                placeholder="Pesan kosong..."
              />
           </div>
         ))}
      </div>

      {createPortal(
        <AnimatePresence>
          {showModal && (
            <StickyNotesModal notes={notes} updateConfig={updateConfig} onClose={() => setShowModal(false)} theme={theme} />
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function StickyNotesModal({ notes, updateConfig, onClose, theme }: any) {
  const colors = ["#FFF59D", "#FFCC80", "#FFAB91", "#F48FB1", "#CE93D8", "#B39DDB", "#90CAF9", "#81D4FA", "#80CBC4", "#C5E1A5"];
  
  const addNote = () => {
    if (notes.length >= 10) return;
    const newNote = { id: Date.now().toString(), text: "", color: colors[notes.length % colors.length] };
    updateConfig("stickyNotes", [...notes, newNote]);
  };

  const updateNote = (id: string, text: string) => {
    const fresh = notes.map((n: any) => n.id === id ? { ...n, text: DOMPurify.sanitize(text) } : n);
    updateConfig("stickyNotes", fresh);
  };

  const changeColor = (id: string, color: string) => {
    const fresh = notes.map((n: any) => n.id === id ? { ...n, color } : n);
    updateConfig("stickyNotes", fresh);
  };

  const deleteNote = (id: string) => {
    updateConfig("stickyNotes", notes.filter((n: any) => n.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(5px)" }}>
       <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: "white", width: "100%", maxWidth: 1000, height: "80vh", borderRadius: 32, padding: 32, display: "flex", flexDirection: "column", boxShadow: "0 30px 60px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Sticky Notes</h2>
              <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }}>Catat ide dan reminder cepat ({notes.length}/10)</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="hover-scale" disabled={notes.length >= 10} onClick={addNote} style={{ ...B(true, theme.primary), padding: "12px 24px", borderRadius: 16, fontSize: 14, fontWeight: 800 }}>+ Tambah Note</button>
              <button className="hover-scale" onClick={onClose} style={{ background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", padding: 12, borderRadius: 16 }}><X size={24} /></button>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, padding: 4 }}>
            <AnimatePresence>
              {notes.map((n: any) => (
                <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={n.id} style={{ background: n.color, borderRadius: 24, padding: 24, position: "relative", display: "flex", flexDirection: "column", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", minHeight: 200 }}>
                   <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", background: "rgba(255,255,255,0.4)", padding: 6, borderRadius: 12, width: "max-content" }}>
                     {colors.map(c => (
                       <button key={c} onClick={() => changeColor(n.id, c)} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: c === n.color ? "2px solid rgba(0,0,0,0.4)" : "2px solid transparent", cursor: "pointer", padding: 0 }} />
                     ))}
                   </div>
                   <textarea 
                     value={n.text}
                     onChange={e => updateNote(n.id, e.target.value)}
                     placeholder="Mulai mengetik ide kamu..."
                     style={{ flex: 1, width: "100%", background: "transparent", border: "none", resize: "none", outline: "none", fontSize: 16, fontWeight: 600, color: "rgba(0,0,0,0.8)", lineHeight: 1.5 }}
                   />
                   <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                     <button onClick={() => deleteNote(n.id)} style={{ background: "rgba(0,0,0,0.1)", border: "none", borderRadius: 12, padding: "8px 16px", fontSize: 12, fontWeight: 800, cursor: "pointer", color: "rgba(0,0,0,0.6)" }}>
                       Hapus Note
                     </button>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
       </motion.div>
    </motion.div>
  );
}

function ShortcutWidget({ theme, setTab, navigate }: any) {
  return (
    <div style={{ padding: 0, height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "clamp(8px, 4cqw, 16px)", flexDirection: "row", flexWrap: "wrap", alignContent: "center" }}>
      <div style={{ fontSize: "clamp(10px, 3.5cqw, 13px)", fontWeight: 800, color: "rgba(0,0,0,0.3)", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>QUICK ACTION</div>
      
      <div style={{ display: "flex", gap: "clamp(8px, 2cqw, 12px)", flex: 1, justifyContent: "flex-end", height: "100%", alignItems: "center" }}>
        <button 
          className="hover-scale"
          onClick={() => setTab("settings")}
          style={{ background: "#FAFAF8", border: "1px solid rgba(0,0,0,0.05)", padding: "0 clamp(12px, 4cqw, 24px)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: "clamp(11px, 4cqw, 13px)", fontWeight: 800, color: "#2C2016", cursor: "pointer", height: "clamp(40px, 15cqh, 56px)", flex: 1, whiteSpace: "nowrap" }}
        >
          <Settings size={"clamp(14px, 5cqw, 16px)"} /> <span style={{display: "inline-block", overflow: "hidden", textOverflow: "ellipsis"}}>Pengaturan</span>
        </button>
        <button 
          className="hover-scale"
          onClick={() => navigate("/profile")}
          style={{ background: "#FAFAF8", border: "1px solid rgba(0,0,0,0.05)", padding: "0 clamp(12px, 4cqw, 24px)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: "clamp(11px, 4cqw, 13px)", fontWeight: 800, color: "#2C2016", cursor: "pointer", height: "clamp(40px, 15cqh, 56px)", flex: 1, whiteSpace: "nowrap" }}
        >
          <UserIcon size={"clamp(14px, 5cqw, 16px)"} /> <span style={{display: "inline-block", overflow: "hidden", textOverflow: "ellipsis"}}>Profil</span>
        </button>
        <button 
          className="hover-scale"
          style={{ ...B(true, theme.primary), padding: "0 clamp(12px, 4cqw, 24px)", borderRadius: 16, fontSize: "clamp(11px, 4cqw, 13px)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "none", color: "white", cursor: "pointer", height: "clamp(40px, 15cqh, 56px)", flex: 1.5, boxShadow: `0 10px 30px ${theme.primary}25`, whiteSpace: "nowrap" }}
          onClick={() => window.dispatchEvent(new CustomEvent("openContentModal"))}
        >
          <Sparkles size={"clamp(14px, 5cqw, 18px)"} /> <span style={{display: "inline-block", overflow: "hidden", textOverflow: "ellipsis"}}>Buat Konten</span>
        </button>
      </div>
    </div>
  );
}
