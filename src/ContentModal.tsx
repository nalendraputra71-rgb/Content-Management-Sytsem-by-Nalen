import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import TextareaAutosize from "react-textarea-autosize";

const GeminiIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1.5L14.45 9.55L22.5 12L14.45 14.45L12 22.5L9.55 14.45L1.5 12L9.55 9.55L12 1.5Z" fill="url(#gemini_gradient_curr)" />
    <defs>
      <linearGradient id="gemini_gradient_curr" x1="1.5" y1="12" x2="22.5" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="0.5" stopColor="#9B72CB"/>
        <stop offset="1" stopColor="#D96570"/>
      </linearGradient>
    </defs>
  </svg>
);

const LoadingDots = () => (
  <span>
    Menganalisis konten
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5}}>.</motion.span>
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.2}}>.</motion.span>
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.4}}>.</motion.span>
  </span>
);

import { 
  MK, MC, eng, fmt, fmtD, gps,
  I, L, B, GRP, CustomDropdown
} from "./data";
import { 
  ChevronDown,
  Eye, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Repeat, 
  Bookmark, 
  MousePointer, 
  Target 
} from "lucide-react";

const getMetricIcon = (k: string, color?: string, size = 14) => {
  const props = { size, color: color || "currentColor", style: { flexShrink: 0 } };
  switch (k.toLowerCase()) {
    case "views":
      return <Eye {...props} />;
    case "reach":
      return <Users {...props} />;
    case "likes":
      return <Heart {...props} fill={color ? `${color}35` : "transparent"} />;
    case "comments":
      return <MessageCircle {...props} />;
    case "shares":
      return <Share2 {...props} />;
    case "reposts":
      return <Repeat {...props} />;
    case "saves":
      return <Bookmark {...props} fill={color ? `${color}35` : "transparent"} />;
    case "clicks":
      return <MousePointer {...props} />;
    case "conversions":
      return <Target {...props} />;
    default:
      return null;
  }
};

export function ContentModal({modal,onSave,onClose,onArchive,onRestore,onDelete,pillars,platforms,pics,statuses}: any) {
  const [d,setD] = useState({...modal.data,metrics:{...(modal.data.metrics||{})},adsMetrics:{...(modal.data.adsMetrics||{views:0,reach:0,likes:0,comments:0,shares:0,reposts:0,saves:0,clicks:0,conversions:0})},referenceLinks:modal.data.referenceLinks||[],customFields:modal.data.customFields||[]});
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hourError, setHourError] = useState(false);
  const [minuteError, setMinuteError] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(modal.mode !== "add");

  const handleHourChange = (e: any) => {
    isDirty.current = true;
    const valStr = e.target.value;
    if (valStr === "") {
      set("uploadHour", "");
      setHourError(false);
      return;
    }
    const val = Number(valStr);
    if (isNaN(val) || val < 0 || val > 23) {
      set("uploadHour", ""); // auto delete
      setHourError(true);
      setTimeout(() => {
        setHourError(false);
      }, 2500);
    } else {
      set("uploadHour", val);
      setHourError(false);
    }
  };

  const handleMinuteChange = (e: any) => {
    isDirty.current = true;
    const valStr = e.target.value;
    if (valStr === "") {
      set("uploadMinute", "");
      setMinuteError(false);
      return;
    }
    const val = Number(valStr);
    if (isNaN(val) || val < 0 || val > 59) {
      set("uploadMinute", ""); // auto delete
      setMinuteError(true);
      setTimeout(() => {
        setMinuteError(false);
      }, 2500);
    } else {
      set("uploadMinute", val);
      setMinuteError(false);
    }
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!d.title || !String(d.title).trim()) return;
      setIsSaving(true);
      try {
        await onSave(d, false);
      } catch (e) {
        console.error("Autosave failed", e);
      }
      setIsSaving(false);
    }, 1000);
    return () => { if(debounceRef.current) clearTimeout(debounceRef.current); };
  }, [d]);

  const activePillar = gps(pillars, d.pillar);
  const headerBg = activePillar?.color || "#2C2016";

  const titleRef = useRef<HTMLTextAreaElement>(null);

  const isDirty = useRef(false);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [d.title, modal.open]);

  const set = (k:string,v:any) => {
    isDirty.current = true;
    setD((p:any)=>({...p,[k]:v}));
  };
  const setM = (k:string,v:any, isAds=false) => {
    isDirty.current = true;
    const ts = new Date().toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"});
    const val = v === "" ? "" : (Number(v) || 0);
    if(isAds) {
      setD((p:any)=>({...p,adsMetrics:{...p.adsMetrics,[k]:val},metricsUpdatedAt:ts}));
    } else {
      setD((p:any)=>({...p,metrics:{...p.metrics,[k]:val},metricsUpdatedAt:ts}));
    }
  };

  const handleClose = async () => {
    if (isDirty.current) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      try {
        await onSave(d, false);
      } catch (e) {
        console.error("Autosave failed on close:", e);
      }
    }
    onClose();
  };

  const addCustomField = () => {
    isDirty.current = true;
    setD((p:any)=>({...p, customFields: [...p.customFields, {key:"", value:""}]}));
  };
  const updateCustomField = (index:number, k:string, v:any) => {
    isDirty.current = true;
    const arr = [...d.customFields];
    arr[index] = {...arr[index], [k]:v};
    set("customFields", arr);
  };
  const removeCustomField = (index:number) => {
    isDirty.current = true;
    const arr = [...d.customFields];
    arr.splice(index, 1);
    set("customFields", arr);
  };

  const analyzeContent = async () => {
    if(!d.caption && !d.briefCopywriting) {
        alert("Harap isi caption atau brief terlebih dahulu untuk dianalisis AI.");
        return;
    }
    setAiLoading(true);
    setAiResult("");
    try {
        const prompt = `Analisis konten pemasaran berikut ini:
        Judul: ${d.title}
        Pillar: ${d.pillar}
        Platform: ${d.platform}
        Caption: ${d.caption}
        Brief: ${d.briefCopywriting}
        Objective: ${d.objective}
        
        Berikan evaluasi singkat dan 3 poin saran perbaikan untuk meningkatkan engagement. Format dalam Bahasa Indonesia, singkat, padat, dan teknis.`;
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("API Key is missing.");
        }
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });

        setAiResult(response.text || "Tidak ada respon dari AI.");
    } catch (e: any) {
        console.error("AI Error:", e);
        const errMsg = e.message || "";
        if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
          setAiResult("Gagal menganalisis konten: Terlalu banyak permintaan saat ini (Quota Exceeded). Silakan tunggu sekitar 30 detik lalu coba lagi, atau update akun Google AI Studio Anda ke Pay-as-you-go.");
        } else {
          setAiResult("Gagal menganalisis konten: " + errMsg + ".\n\nPastikan VITE_GEMINI_API_KEY sudah diset di Settings > Secrets.");
        }
    }
    setAiLoading(false);
  };

  const generateCaption = async () => {
    if(!d.briefCopywriting) {
        alert("Harap isi Brief Konten terlebih dahulu agar AI memiliki konteks untuk membuat caption.");
        return;
    }
    setCaptionLoading(true);
    try {
        const prompt = `Buatkan caption social media berdasarkan brief berikut:
        Judul: ${d.title}
        Pillar: ${d.pillar}
        Platform: ${d.platform}
        Brief: ${d.briefCopywriting}
        Objective: ${d.objective}
        
        Tuliskan HANYA hasil caption akhirnya saja. Jangan berikan pengantar/penutup eksplanasi. Sertakan hashtag yang relevan sesuai dengan platform.`;
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("API Key is missing.");
        }
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        set("caption", (response.text || "").trim());
    } catch (e: any) {
        console.error("AI Error:", e);
        const errMsg = e.message || "";
        if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
          alert("Gagal menggenerate caption: Terlalu banyak permintaan AI. Silakan tunggu sekitar 30 detik lalu coba lagi.");
        } else {
          alert("Gagal menggenerate caption: " + errMsg);
        }
    }
    setCaptionLoading(false);
  };

  const handleRefImg = (e:any) => {
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev:any)=>set("referenceImage",ev.target.result);
    reader.readAsDataURL(file);
  };
  const modalScrollRef = useRef<HTMLDivElement>(null);

  const isNew = modal.mode==="add";
  const canArchive = !d.archived && !isNew;
  const canDelete = !isNew;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} onClick={handleClose} style={{position:"fixed",inset:0,background:"rgba(30,21,9,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}}>
      <motion.div 
        initial={{scale:0.97, opacity:0, y:15}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.97, opacity:0, y:15}} transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={e=>e.stopPropagation()} 
        style={{background:"#FAFAFA",borderRadius:24,maxWidth:620,width:"100%",maxHeight:"94vh",position:"relative",boxShadow:"0 24px 60px rgba(30,21,9,0.3)", display: "flex", flexDirection: "column"}}
      >
        <div ref={modalScrollRef} style={{padding: "24px 28px", overflow: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "16px"}}>
          
          {/* Block 1: Area Identitas Atas */}
          <div style={{background:headerBg,color:"#FAFAFA",borderRadius:16,padding:"20px 24px",boxShadow:"inset 0 2px 4px rgba(255,255,255,0.05)", position:"relative", transition: "background 0.3s ease"}}>
              <button className="hover-scale" onClick={handleClose} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:18,color:"white",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8, paddingRight: 40}}>
                  <div style={{display:"flex", justifyContent:"space-between", width:"100%", alignItems:"center"}}>
                     <span style={{fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:1.5, color:"rgba(255,255,255,0.5)"}}>
                        {isNew?"✨ Konten Baru":"✏️ Detail Konten"}
                     </span>
                  </div>
                  
                  <motion.div 
                    animate={isShaking && (!d.title || !String(d.title).trim()) ? { x: [-10, 10, -10, 10, 0], backgroundColor: ["transparent", "rgba(255, 68, 68, 0.4)", "transparent"] } : { x: 0, backgroundColor: "transparent" }} 
                    transition={{ duration: 0.5 }}
                    style={{width: "100%"}}
                  >
                     {isReaderMode ? (
                       <div style={{fontSize:28, fontWeight:900, letterSpacing:"-0.75px", color:"white", width:"100%", padding:"4px 0 4px 0", lineHeight: 1.25, wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                         {d.title || "(Ketik Judul Konten)"}
                       </div>
                     ) : (
                       <textarea 
                          ref={titleRef}
                          value={d.title} 
                          onChange={(e:any)=>set("title",e.target.value)} 
                          rows={1}
                          style={{background:"transparent",border:"none",fontSize:28,fontWeight:900, letterSpacing:"-0.75px",color:"white",width:"100%",outline:"none",padding:"4px 0 8px 0", resize: "none", overflow: "hidden", lineHeight: 1.25}} 
                          placeholder="Tulis Judul Konten..."/>
                     )}
                  </motion.div>

                  <div style={{
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    flexWrap: "wrap", 
                    color: "rgba(255,255,255,0.9)", 
                    marginTop: "-2px",
                    marginBottom: "2px",
                    width: "100%"
                  }}>
                    {isReaderMode ? (
                      <>
                        <span style={{fontSize: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5}}>
                          📅 {(() => {
                            const daysIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
                            const monthsIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                            if (d.day && d.month && d.year) {
                              try {
                                const dayName = daysIndo[new Date(d.year, d.month - 1, d.day).getDay()];
                                return `${dayName}, ${d.day} ${monthsIndo[d.month - 1]} ${d.year}`;
                              } catch(e) {
                                return `${d.day} ${monthsIndo[d.month - 1]} ${d.year}`;
                              }
                            }
                            return "Belum ditentukan";
                          })()}
                        </span>
                        <div style={{height: "10px", width: "1px", background: "rgba(255,255,255,0.3)"}} />
                        <span style={{fontSize: "12px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5}}>
                          🕒 {d.uploadHour !== undefined && d.uploadHour !== null ? String(d.uploadHour).padStart(2, '0') : "00"}:{d.uploadMinute !== undefined && d.uploadMinute !== null ? String(d.uploadMinute).padStart(2, '0') : "00"} WIB
                        </span>
                      </>
                    ) : (
                      <div style={{display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", width: "100%"}}>
                        {/* Compact Edit Date */}
                        <div style={{display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.15)", padding: "4px 8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)"}}>
                          <span style={{fontSize: "12px", display: "flex", alignItems: "center"}}>📅</span>
                          <input 
                            type="date" 
                            value={`${d.year || new Date().getFullYear()}-${String(d.month || new Date().getMonth()+1).padStart(2, '0')}-${String(d.day || new Date().getDate()).padStart(2, '0')}`} 
                            onChange={(e:any) => {
                              const parts = e.target.value.split("-");
                              if (parts.length === 3) {
                                set("year", parseInt(parts[0], 10));
                                set("month", parseInt(parts[1], 10));
                                set("day", parseInt(parts[2], 10));
                              }
                            }} 
                            style={{
                              background: "transparent",
                              border: "none",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "white",
                              outline: "none",
                              cursor: "pointer",
                              padding: 0,
                              colorScheme: "dark"
                            }}
                          />
                        </div>

                        <div style={{height: "14px", width: "1px", background: "rgba(255,255,255,0.25)"}} />

                        {/* Compact Edit Time */}
                        <div style={{display: "flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.15)", padding: "4px 8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)"}}>
                          <span style={{fontSize: "12px", display: "flex", alignItems: "center", marginRight: "2px"}}>🕒</span>
                          <input 
                            type="number" 
                            min={0} 
                            max={23} 
                            value={d.uploadHour !== undefined && d.uploadHour !== null ? d.uploadHour : ""} 
                            onChange={handleHourChange} 
                            style={{
                              background: "transparent",
                              border: "none",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "white",
                              width: "20px",
                              textAlign: "center",
                              outline: "none",
                              padding: 0,
                              margin: 0
                            }} 
                            placeholder="00"
                          />
                          <span style={{color:"rgba(255,255,255,0.5)", fontWeight: 700, fontSize: "11px"}}>:</span>
                          <input 
                            type="number" 
                            min={0} 
                            max={59} 
                            step={5} 
                            value={d.uploadMinute !== undefined && d.uploadMinute !== null ? d.uploadMinute : ""} 
                            onChange={handleMinuteChange} 
                            style={{
                              background: "transparent",
                              border: "none",
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "white",
                              width: "20px",
                              textAlign: "center",
                              outline: "none",
                              padding: 0,
                              margin: 0
                            }} 
                            placeholder="00"
                          />
                          <span style={{fontSize: "9px", color: "rgba(255,255,255,0.7)", marginLeft: "4px", fontWeight: 700}}>WIB</span>
                        </div>

                        {(hourError || minuteError) && (
                          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.85)", background: "rgba(156,43,78,0.4)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                            ⚠️ Input Waktu tidak valid
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Row of dropdowns without a single merged shape container */}
                  <div style={{
                    display: "grid", 
                    gridTemplateColumns: "repeat(4, 1fr)", 
                    gap: "12px", 
                    width: "100%", 
                    marginTop: "2px",
                    paddingRight: "44px" /* leave room for absolute org/boost icon */
                  }}>
                    {/* Pillar */}
                    <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
                      <span style={{fontSize: "9px", fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "3px"}}>
                        🏁 Pillar
                      </span>
                      {isReaderMode ? (
                        <span style={{
                          fontSize: "11px", 
                          fontWeight: 700, 
                          color: "white", 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: 3, 
                          textOverflow: "ellipsis", 
                          overflow: "hidden", 
                          whiteSpace: "nowrap",
                          background: "rgba(255,255,255,0.14)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          height: "26px",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}>
                          {d.pillar || "Tanpa Pillar"}
                        </span>
                      ) : (
                        <CustomDropdown 
                          dark={true}
                          value={d.pillar} 
                          options={pillars} 
                          prefix="" 
                          onChange={(v)=>set("pillar",v)} 
                          style={{ 
                            width: "100%", 
                            padding: "4px 10px", 
                            borderRadius: "8px", 
                            fontSize: "11px", 
                            fontWeight: 700, 
                            background: "rgba(255,255,255,0.14)", 
                            color: "white", 
                            border: "1px solid rgba(255,255,255,0.15)",
                            height: "26px",
                            display: "inline-flex",
                            alignItems: "center",
                            boxShadow: "none"
                          }}
                        />
                      )}
                    </div>

                    {/* Platform */}
                    <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
                      <span style={{fontSize: "9px", fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "3px"}}>
                        📱 Platform
                      </span>
                      {isReaderMode ? (
                        <span style={{
                          fontSize: "11px", 
                          fontWeight: 700, 
                          color: "white", 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: 3, 
                          textOverflow: "ellipsis", 
                          overflow: "hidden", 
                          whiteSpace: "nowrap",
                          background: "rgba(255,255,255,0.14)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          height: "26px",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}>
                          {d.platform || "Tanpa Platform"}
                        </span>
                      ) : (
                        <CustomDropdown 
                          dark={true}
                          value={d.platform} 
                          options={platforms} 
                          prefix="" 
                          onChange={(v)=>set("platform",v)} 
                          style={{ 
                            width: "100%", 
                            padding: "4px 10px", 
                            borderRadius: "8px", 
                            fontSize: "11px", 
                            fontWeight: 700, 
                            background: "rgba(255,255,255,0.14)", 
                            color: "white", 
                            border: "1px solid rgba(255,255,255,0.15)",
                            height: "26px",
                            display: "inline-flex",
                            alignItems: "center",
                            boxShadow: "none"
                          }}
                        />
                      )}
                    </div>

                    {/* PIC */}
                    <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
                      <span style={{fontSize: "9px", fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "3px"}}>
                        👤 PIC
                      </span>
                      {isReaderMode ? (
                        <span style={{
                          fontSize: "11px", 
                          fontWeight: 700, 
                          color: "white", 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: 3, 
                          textOverflow: "ellipsis", 
                          overflow: "hidden", 
                          whiteSpace: "nowrap",
                          background: "rgba(255,255,255,0.14)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          height: "26px",
                          border: "1px solid rgba(255,255,255,0.1)"
                        }}>
                          {d.pic || "Tanpa PIC"}
                        </span>
                      ) : (
                        <CustomDropdown 
                          dark={true}
                          value={d.pic} 
                          options={pics} 
                          prefix="" 
                          onChange={(v)=>set("pic",v)} 
                          style={{ 
                            width: "100%", 
                            padding: "4px 10px", 
                            borderRadius: "8px", 
                            fontSize: "11px", 
                            fontWeight: 700, 
                            background: "rgba(255,255,255,0.14)", 
                            color: "white", 
                            border: "1px solid rgba(255,255,255,0.15)",
                            height: "26px",
                            display: "inline-flex",
                            alignItems: "center",
                            boxShadow: "none"
                          }}
                        />
                      )}
                    </div>

                    {/* Status */}
                    <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
                      <span style={{fontSize: "9px", fontWeight: 750, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "3px"}}>
                        ⚡ Status
                      </span>
                      {isReaderMode ? (
                        <span style={{
                          fontSize: "11px", 
                          fontWeight: 800, 
                          color: "white", 
                          display: "inline-flex", 
                          alignItems: "center", 
                          gap: 3, 
                          textTransform: "uppercase", 
                          textOverflow: "ellipsis", 
                          overflow: "hidden", 
                          whiteSpace: "nowrap",
                          background: "rgba(255,255,255,0.22)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          height: "26px",
                          border: "1px solid rgba(255,255,255,0.15)"
                        }}>
                          {d.status || "Draft"}
                        </span>
                      ) : (
                        <CustomDropdown 
                          dark={true}
                          value={d.status} 
                          options={statuses} 
                          prefix="" 
                          onChange={(v)=>set("status",v)} 
                          style={{ 
                            width: "100%", 
                            padding: "4px 10px", 
                            borderRadius: "8px", 
                            fontSize: "11px", 
                            fontWeight: 800, 
                            textTransform: "uppercase",
                            background: "rgba(255,255,255,0.22)", 
                            color: "white", 
                            border: "1px solid rgba(255,255,255,0.2)",
                            height: "26px",
                            display: "inline-flex",
                            alignItems: "center",
                            boxShadow: "none"
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Absolute organic/boost icon at the bottom-right of the title block container */}
                  <div 
                    className="hover-scale"
                    style={{
                      position: "absolute",
                      bottom: "16px",
                      right: "16px",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: d.isAds ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      zIndex: 10,
                      userSelect: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                    }} 
                    title={d.isAds ? "Campaign Boosted (Paid Ads)" : "Organic (🍃)"}
                  >
                    {d.isAds ? "💰" : "🍃"}
                  </div>
              </div>
          </div>

          {/* AI Analysis Result Section if exists */}
          {aiResult && (
            <div style={{background:"#E3F2FD", border:"1px solid #BBDEFB", borderRadius:12, padding:16, boxShadow:"0 4px 12px rgba(30,136,229,0.08)"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                <span style={{fontSize:12, fontWeight:700, color:"#1E88E5", display:"flex", alignItems:"center", gap:6}}>
                    <GeminiIcon size={14} />
                    AI Content Analysis
                </span>
                <button onClick={()=>setAiResult("")} style={{border:"none", background:"transparent", fontSize:16, cursor:"pointer", color:"#1E88E5"}}>&times;</button>
              </div>
              <div style={{fontSize:12, lineHeight:1.6, color:"#2C3E50", whiteSpace:"pre-wrap"}}><Markdown>{aiResult}</Markdown></div>
            </div>
          )}

          {/* Removed single mode banner transition flow to place mode switch in the footer */}

          {!isReaderMode ? (
            <>
              {/* Removed Block 3: Pengaturan Jadwal & Waktu (now inline under title) */}

              {/* Block 4: Ads Toggle */}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",background:"rgba(156,43,78,0.05)",borderRadius:16,border:"1px solid rgba(156,43,78,0.1)"}}>
                <button onClick={()=>set("isAds",!d.isAds)} style={{width:40,height:22,borderRadius:11,border:"none",cursor:"pointer",background:d.isAds?"#9C2B4E":"rgba(44,32,22,0.15)",transition:"background .2s",position:"relative",flexShrink:0}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:2,left:d.isAds?20:2,transition:"left .2s"}}/>
                </button>
                <div>
                  <span style={{fontSize:13,fontWeight:700,color:d.isAds?"#9C2B4E":"#2C2016"}}>💰 {d.isAds?"Konten Berbayar (Ads/Boost)":"Konten Organik"}</span>
                  <div style={{fontSize:10,color:"rgba(44,32,22,0.5)"}}>Toggle untuk menandai apakah konten ini diiklankan ke target audiens berbayar</div>
                </div>
              </div>

              {/* Block 5: Objective, Brief & Caption */}
              <div style={{
                background: "#FFFFFF",
                border: "1px solid rgba(44,32,22,0.08)",
                borderRadius: 16,
                padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(44,32,22,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}>
                <div style={GRP}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                    🎯 Objective Konten
                  </label>
                  <TextareaAutosize value={d.objective} onChange={(e:any)=>set("objective",e.target.value)} style={I({ border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10, resize:"vertical" })} minRows={3} placeholder="Tujuan atau target output dari konten ini..."/>
                </div>

                {/* Brief Section with AI Button */}
                <div style={GRP}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          📝 Brief Konten
                        </label>
                        <button onClick={analyzeContent} disabled={aiLoading} 
                          style={{...B(false), fontSize:10, padding:"4px 10px", borderRadius: 8, background:"#f3f4f6", color:"#1f2937", border:"1px solid #d1d5db", display:"flex", alignItems:"center", gap:4}}>
                          <GeminiIcon size={12} />
                          {aiLoading ? <LoadingDots /> : "Analyze with Gemini"}
                        </button>
                    </div>
                    <TextareaAutosize value={d.briefCopywriting} onChange={(e:any)=>set("briefCopywriting",e.target.value)} style={I({ border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10, resize:"vertical" })} minRows={4} placeholder="Arah konten, tone of voice, call to action, poin kata kunci utama..."/>
                </div>

                {/* Caption Section with AI Button */}
                <div style={GRP}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          ✍️ Salinan Caption
                        </label>
                        <button onClick={generateCaption} disabled={captionLoading} 
                          style={{...B(false), fontSize:10, padding:"4px 10px", borderRadius: 8, background:"#f3f4f6", color:"#1f2937", border:"1px solid #d1d5db", display:"flex", alignItems:"center", gap:4}}>
                          <GeminiIcon size={12} />
                          {captionLoading ? <LoadingDots /> : "Generate Caption"}
                        </button>
                    </div>
                    <TextareaAutosize value={d.caption} onChange={(e:any)=>set("caption",e.target.value)} style={I({ border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10, resize:"vertical" })} minRows={3} placeholder="Salinan caption social media yang sudah siap diposting..."/>
                </div>
              </div>

              {/* Block 6: Asset Link & Social Media Link */}
              <div style={{
                background: "#FFFFFF",
                border: "1px solid rgba(44,32,22,0.08)",
                borderRadius: 16,
                padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(44,32,22,0.02)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16
              }}>
                <div style={GRP}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                    🔗 Link Aset Final (G-Drive / Dropbox)
                  </label>
                  <input value={d.linkAsset||""} onChange={(e:any)=>set("linkAsset",e.target.value)} style={{...I(), border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10 }} placeholder="https://drive.google.com/..."/>
                </div>
                <div style={GRP}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                    🔗 Link Upload / Postingan Sosmed
                  </label>
                  <input value={d.linkSosmed||""} onChange={(e:any)=>set("linkSosmed",e.target.value)} style={{...I(), border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10 }} placeholder="https://instagram.com/p/..."/>
                </div>
              </div>

              {/* Reference Section */}
              <div style={{background:"rgba(44,32,22,0.03)",border:"1px solid rgba(44,32,22,0.08)",borderRadius:16,padding:"16px 20px",marginBottom:0}}>
                <div style={{...L,marginBottom:8}}>📎 Referensi Konten</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div style={GRP}><label style={{...L,marginBottom:2}}>Catatan Referensi</label><TextareaAutosize value={d.referenceText} onChange={(e:any)=>set("referenceText",e.target.value)} style={I({resize:"vertical"})} minRows={3} placeholder="Referensi, mood, arahan visual..."/></div>
                  <div style={GRP}>
                    <label style={{...L,marginBottom:2}}>Link Referensi <button onClick={()=>set("referenceLinks",[...(d.referenceLinks||[]),""])} style={{background:"none",border:"none",color:"#C4622D",cursor:"pointer",fontSize:10}}>(+ Tambah)</button></label>
                    {(d.referenceLinks||[]).map((lnk:string,i:number)=>(
                      <div key={i} style={{display:"flex",gap:4,marginBottom:4}}>
                        <input value={lnk} onChange={(e:any)=>set("referenceLinks", d.referenceLinks.map((l:any,idx:number)=>idx===i?e.target.value:l))} style={I()} placeholder="https://..."/>
                        <button onClick={()=>set("referenceLinks", d.referenceLinks.filter((_:any,idx:number)=>idx!==i))} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer"}}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={GRP}>
                  <label style={{...L,marginBottom:2}}>Upload Gambar Referensi</label>
                  <input type="file" accept="image/*" onChange={handleRefImg} style={{fontSize:11,color:"rgba(44,32,22,0.5)"}}/>
                  {d.referenceImage&&<img src={d.referenceImage} alt="ref" style={{maxWidth:200,maxHeight:100,borderRadius:6,marginTop:6,border:"1px solid rgba(44,32,22,0.1)",objectFit:"contain"}}/>}
                </div>
              </div>

              {/* Custom Fields */}
              <div style={{
                background: "#FFFFFF",
                border: "1px solid rgba(44,32,22,0.08)",
                borderRadius: 16,
                padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(44,32,22,0.02)"
              }}>
                 <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                   <label style={{...L, margin: 0}}>➕ Bidang Kustom (Custom Fields)</label>
                   <button onClick={()=>set("customFields",[...(d.customFields||[]),{name:"Label Baru",value:""}])} style={{...B(false),fontSize:10,padding:"4px 10px", borderRadius: 8}}>+ Tambah Field</button>
                 </div>
                 {(d.customFields||[]).length === 0 ? (
                   <div style={{ fontSize: 11, color: "rgba(44,32,22,0.4)", textAlign: "center", padding: "10px 0" }}>Belum ada custom fields kustom.</div>
                 ) : (
                   (d.customFields||[]).map((cf:any,i:number)=>(
                     <div key={i} style={{display:"flex",gap:8,marginBottom:8, alignItems: "center"}}>
                        <input value={cf.name} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,idx:number)=>idx===i?{...f,name:e.target.value}:f))} style={{...I(),width:130, height: "38px"}} placeholder="Nama Field..."/>
                        <TextareaAutosize value={cf.value} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,idx:number)=>idx===i?{...f,value:e.target.value}:f))} style={I({resize:"vertical", padding: "8px 12px"})} minRows={1} placeholder="Isi field..."/>
                        <button onClick={()=>set("customFields", d.customFields.filter((_:any,idx:number)=>idx!==i))} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer", padding: "4px 8px"}}>✕</button>
                     </div>
                   ))
                 )}
              </div>

              {/* Metrics Section */}
              <div style={{
                display: "grid",
                gridTemplateColumns: d.isAds ? "1fr 1fr" : "1fr",
                gap: "16px",
                marginBottom: "18px"
              }}>
                {/* Metrics */}
                <div style={{
                  background: "rgba(44,32,22,0.03)",
                  border: "1px solid rgba(44,32,22,0.08)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div style={{...L, display: "flex", alignItems: "center", gap: 6, margin: 0}}>
                        <span>📊 Jangkauan Organik</span>
                      </div>
                      {d.metricsUpdatedAt && <div style={{fontSize:9, color:"rgba(44,32,22,0.4)"}}>Last update: {d.metricsUpdatedAt}</div>}
                    </div>
                    <div style={{display:"grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8}}>
                      {MK.map((k:string)=>(
                        <div key={k} style={GRP}>
                          <label style={{...L, marginBottom: 4, color: MC[k]||"#C4622D", display: "flex", alignItems: "center", gap: 4, textTransform: "capitalize", fontSize: "11px"}}>
                            {getMetricIcon(k, MC[k]||"#C4622D", 12)}
                            {k}
                          </label>
                          <input 
                            type="number" 
                            min={0} 
                            placeholder="0" 
                            value={d.metrics[k] === 0 ? "" : (d.metrics[k] !== undefined && d.metrics[k] !== null ? d.metrics[k] : "")} 
                            onChange={(e:any)=>setM(k,e.target.value)} 
                            style={I({textAlign:"right", fontSize: "12px", padding: "6px 8px"})}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{marginTop:12, padding:"8px 10px", background:"rgba(196,98,45,0.06)", borderRadius:8, display:"flex", flexDirection: "column", gap:2}}>
                    <span style={{fontSize:11, color:"rgba(44,32,22,0.6)", display: "flex", justifyContent: "space-between"}}>
                      <span>Total Engagement:</span>
                      <strong style={{color:"#C4622D"}}>{fmt(eng(d.metrics))}</strong>
                    </span>
                    <span style={{fontSize:11, color:"rgba(44,32,22,0.6)", display: "flex", justifyContent: "space-between"}}>
                      <span>ER Rate:</span>
                      <strong style={{color:"#C4622D"}}>{(d.metrics?.reach||0)>0?((eng(d.metrics)/(d.metrics.reach))*100).toFixed(2):0}%</strong>
                    </span>
                  </div>
                </div>

                {/* Ads Metrics */}
                {d.isAds && (
                  <div style={{
                    background: "rgba(156,43,78,0.03)",
                    border: "1px solid rgba(156,43,78,0.1)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}>
                    <div>
                      <div style={{...L, marginBottom:12, color:"#9C2B4E", display: "flex", alignItems: "center", gap: 6}}>
                        <span>💰 Hasil Kampanye Berbayar</span>
                      </div>
                      <div style={{display:"grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8}}>
                        {[...MK,"clicks","conversions"].map((k:string)=>(
                          <div key={k} style={GRP}>
                            <label style={{...L, marginBottom: 4, color: k==="clicks"||k==="conversions"?"#9C2B4E":MC[k]||"#9C2B4E", display: "flex", alignItems: "center", gap: 4, textTransform: "capitalize", fontSize: "11px"}}>
                              {getMetricIcon(k, k==="clicks"||k==="conversions"?"#9C2B4E":MC[k]||"#9C2B4E", 12)}
                              {k}
                            </label>
                            <input 
                              type="number" 
                              min={0} 
                              placeholder="0" 
                              value={d.adsMetrics?.[k] === 0 ? "" : (d.adsMetrics?.[k] !== undefined && d.adsMetrics?.[k] !== null ? d.adsMetrics[k] : "")} 
                              onChange={(e:any)=>setM(k,e.target.value,true)} 
                              style={I({textAlign:"right", fontSize: "12px", padding: "6px 8px"})}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{marginTop:12, padding:"8px 10px", background:"rgba(156,43,78,0.06)", borderRadius:8, display:"flex", flexDirection: "column", gap:2}}>
                      <span style={{fontSize:11, color:"#9C2B4E", display: "flex", justifyContent: "space-between"}}>
                        <span>Total Engagement Ads:</span>
                        <strong>{fmt(eng(d.adsMetrics||{}))}</strong>
                      </span>
                      <span style={{fontSize:11, color:"#9C2B4E", display: "flex", justifyContent: "space-between"}}>
                        <span>Ad Click / Conv:</span>
                        <strong>{fmt(d.adsMetrics?.clicks||0)} / {fmt(d.adsMetrics?.conversions||0)}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* BEAUTIFUL READING PRESENTATION (READER MODE) */}
              
              {/* Item 2: Objective */}
              <div style={{
                background: "#FFFFFF",
                border: "1px solid rgba(44,32,22,0.08)",
                borderRadius: 16,
                padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(44,32,22,0.02)"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                  🎯 Objective Konten
                </div>
                <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, whiteSpace: "pre-wrap", background: "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10 }}>
                  {d.objective ? d.objective : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Tidak ada spesifikasi objective khusus.</span>}
                </div>
              </div>

              {/* Item 3: Brief Markdown Section */}
              <div style={{
                background: "#FFFFFF",
                border: "1px solid rgba(44,32,22,0.08)",
                borderRadius: 16,
                padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(44,32,22,0.02)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
                    📝 Arahan Kreatif & Brief Konten
                  </span>
                  {d.briefCopywriting && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(d.briefCopywriting);
                        alert("Brief berhasil disalin!");
                      }} 
                      style={{ background: "rgba(196,98,45,0.08)", border: "none", color: "#C4622D", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 750, cursor: "pointer" }}
                    >
                      📋 Salin Brief
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "#FCFAF7", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(44,32,22,0.03)" }}>
                  {d.briefCopywriting ? (
                    <div className="markdown-body">
                      <Markdown>{d.briefCopywriting}</Markdown>
                    </div>
                  ) : (
                    <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Belum ada brief konten yang ditambahkan. Silakan beralih ke Mode Input & Edit untuk menambahkan brief.</span>
                  )}
                </div>
              </div>

              {/* Item 4: Final Caption Previews */}
              <div style={{
                background: "#FFFFFF",
                border: "1px solid rgba(44,32,22,0.08)",
                borderRadius: 16,
                padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(44,32,22,0.02)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
                    ✍️ Salinan Caption Posting
                  </span>
                  {d.caption && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(d.caption);
                        alert("Caption berhasil disalin ke Clipboard!");
                      }} 
                      style={{ background: "rgba(196,98,45,0.08)", border: "none", color: "#C4622D", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 750, cursor: "pointer" }}
                    >
                      📋 Salin Caption
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "#FAFDFB", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(44,32,22,0.03)" }}>
                  {d.caption ? (
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {d.caption}
                    </div>
                  ) : (
                    <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Belum ada salinan caption. Silakan beralih ke Mode Input & Edit atau gunakan fitur "Generate Caption" bertenaga Gemini AI.</span>
                  )}
                </div>
              </div>

              {/* Item 5: Main Cloud Links */}
              <div style={{
                background: "#FFFFFF",
                border: "1px solid rgba(44,32,22,0.08)",
                borderRadius: 16,
                padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(44,32,22,0.02)"
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px" }}>
                  🔗 Tautan & Folder Sumber Daya
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {d.linkAsset ? (
                    <a href={d.linkAsset} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, background: "rgba(196,98,45,0.04)", border: "1px solid rgba(196,98,45,0.15)", borderRadius: 12, padding: "12px 16px", transition: "background 0.2s" }} className="hover-scale">
                      <span style={{ fontSize: 18 }}>📁</span>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#C4622D" }}>Buka Aset Desain</div>
                        <div style={{ fontSize: 10, color: "rgba(44,32,22,0.5)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.linkAsset}</div>
                      </div>
                    </a>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: "12px 16px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                      📁 Link aset belum ditautkan.
                    </div>
                  )}

                  {d.linkSosmed ? (
                    <a href={d.linkSosmed} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "12px 16px", transition: "background 0.2s" }} className="hover-scale">
                      <span style={{ fontSize: 18 }}>🚀</span>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>Lihat Sosmed</div>
                        <div style={{ fontSize: 10, color: "rgba(59,130,246,0.6)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.linkSosmed}</div>
                      </div>
                    </a>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: "12px 16px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                      🚀 Belum live di sosmed.
                    </div>
                  )}
                </div>
              </div>

              {/* Item 6: Moodboard / Ref Section */}
              {(d.referenceText || (d.referenceLinks && d.referenceLinks.filter((l:string)=>l.trim() !== "").length > 0) || d.referenceImage) && (
                <div style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(44,32,22,0.08)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  boxShadow: "0 4px 20px rgba(44,32,22,0.02)"
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px" }}>
                    📎 Bahan Referensi Visual & Catatan
                  </div>
                  {d.referenceText && (
                    <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, marginBottom: 8, padding: "12px 16px", background: "rgba(44,32,22,0.02)", borderRadius: 10 }}>
                      {d.referenceText}
                    </div>
                  )}
                  {d.referenceLinks && d.referenceLinks.filter((l:string)=>l.trim() !== "").length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: d.referenceImage ? 8 : 0 }}>
                      {d.referenceLinks.filter((l:string)=>l.trim() !== "").map((lnk:string, idx:number) => (
                        <a key={idx} href={lnk} target="_blank" rel="noreferrer" style={{ textDecoration: "none", fontSize: 11, color: "#C4622D", background: "rgba(196,98,45,0.06)", padding: "4px 8px", borderRadius: 8, fontWeight: 600 }}>
                          🔗 Link Referensi {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  {d.referenceImage && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(44,32,22,0.5)" }}>Moodboard Inspirasi:</span>
                      <img src={d.referenceImage} alt="moodboard" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10, border: "1px solid rgba(44,32,22,0.08)", objectFit: "contain" }} />
                    </div>
                  )}
                </div>
              )}

              {/* Item 7: Custom Fields Section */}
              {d.customFields && d.customFields.filter((cf:any) => cf.name?.trim() || cf.value?.trim()).length > 0 && (
                <div style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(44,32,22,0.08)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  boxShadow: "0 4px 20px rgba(44,32,22,0.02)"
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px" }}>
                    ➕ Bidang Kustom (Custom Fields)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {d.customFields.filter((cf:any) => cf.name?.trim() || cf.value?.trim()).map((cf:any, idx:number) => (
                      <div key={idx} style={{ background: "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.5)", textTransform: "uppercase", marginBottom: 4 }}>{cf.name || `Field ${idx+1}`}</div>
                        <div style={{ fontSize: 13, color: "#2C2016", whiteSpace: "pre-wrap" }}>{cf.value || "-"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Item 8: High Impact Stats (Bento Widget) */}
              <div style={{
                background: "#FFFFFF",
                border: "1px solid rgba(44,32,22,0.08)",
                borderRadius: 16,
                padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(44,32,22,0.02)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>📊 Laporan Statistik Performa</span>
                  {d.metricsUpdatedAt && <span style={{ fontSize: 10, color: "rgba(44,32,22,0.4)" }}>Terakhir diupdate: {d.metricsUpdatedAt}</span>}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Organik Card Inside Reader */}
                  <div style={{ background: "rgba(196,98,45,0.03)", border: "1px solid rgba(196,98,45,0.08)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#C4622D", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>🍃 Jangkauan Organik</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 8, marginBottom: 10 }}>
                        {MK.map((k:string) => (
                          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(44,32,22,0.02)", padding: "6px 10px", borderRadius: 8 }}>
                            {getMetricIcon(k, MC[k]||"#C4622D", 14)}
                            <div>
                              <div style={{ fontSize: 9, color: "rgba(44,32,22,0.5)", textTransform: "capitalize", lineHeight: 1.1 }}>{k}</div>
                              <div style={{ fontSize: 12, fontWeight: 805, color: "#2C2016" }}>{fmt(d.metrics[k] || 0)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderTop: "1px dashed rgba(196,98,45,0.15)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                      <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                        <span>Total Interaksi:</span>
                        <strong style={{ color: "#C4622D" }}>{fmt(eng(d.metrics))}</strong>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                        <span>Engagement Rate:</span>
                        <strong style={{ color: "#C4622D" }}>{(d.metrics?.reach || 0) > 0 ? ((eng(d.metrics) / d.metrics.reach) * 100).toFixed(2) : 0}%</strong>
                      </div>
                    </div>
                  </div>
 
                  {/* Ads Card Inside Reader */}
                  <div style={{ background: d.isAds ? "rgba(156,43,78,0.03)" : "rgba(44,32,22,0.01)", border: d.isAds ? "1px solid rgba(156,43,78,0.08)" : "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", justifyContent: d.isAds ? "space-between" : "center" }}>
                    {d.isAds ? (
                      <>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#9C2B4E", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>💰 Hasil Kampanye Berbayar</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 6, marginBottom: 8 }}>
                            {[...MK, "clicks", "conversions"].map((k:string) => (
                              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(156,43,78,0.02)", padding: "5px 8px", borderRadius: 8 }}>
                                {getMetricIcon(k, k==="clicks"||k==="conversions"?"#9C2B4E":MC[k]||"#9C2B4E", 13)}
                                <div>
                                  <div style={{ fontSize: 8, color: "rgba(44,32,22,0.5)", textTransform: "capitalize", lineHeight: 1.1 }}>{k}</div>
                                  <div style={{ fontSize: 11, fontWeight: 805, color: "#2C2016" }}>{fmt((d.adsMetrics || {})[k] || 0)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ borderTop: "1px dashed rgba(156,43,78,0.15)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                          <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                            <span>Clicks / Conversions:</span>
                            <strong style={{ color: "#9C2B4E" }}>{fmt(d.adsMetrics?.clicks || 0)} / {fmt(d.adsMetrics?.conversions || 0)}</strong>
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                            <span>Total Engagement Ads:</span>
                            <strong style={{ color: "#9C2B4E" }}>{fmt(eng(d.adsMetrics || {}))}</strong>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "10px 0" }}>
                        <div style={{ fontSize: 18, marginBottom: 2 }}>🍃</div>
                        <div style={{ fontSize: 12, fontWeight: 750, color: "rgba(44,32,22,0.4)" }}>Bukan Konten Berbayar</div>
                        <div style={{ fontSize: 10, color: "rgba(44,32,22,0.3)", marginTop: 2 }}>Metrik ads tidak aktif untuk posting organik.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        <div style={{display:"flex", gap:10, justifyContent:"space-between", alignItems:"center", padding: "16px 28px", borderTop: "1px solid rgba(44,32,22,0.08)", background: "white", borderRadius: "0 0 24px 24px", zIndex: 10, flexShrink: 0}}>
          <div style={{display:"flex", gap:8}}>
            {d.archived ? (
              <button onClick={()=>onRestore(d.id)} className="hover-scale" style={{...B(false), background:"#E8F5E9", border:"1.5px solid #2E7D32", color:"#2E7D32", padding:"7px 14px", fontSize:12, fontWeight:700}}>🔄 Tampilkan Lagi</button>
            ) : (
              canArchive && <button onClick={()=>onArchive(d.id)} className="hover-scale" style={{...B(false), background:"#FAFAFA", border:"1.5px solid rgba(44,32,22,0.1)", color:"#666", padding:"7px 14px", fontSize:12, fontWeight:700}}>📦 Arsipkan</button>
            )}
            {canDelete && <button onClick={()=>onDelete(d.id)} className="hover-scale" style={{...B(false), background:"#FDF5F8", border:"1.5px solid #9C2B4E", color:"#9C2B4E", padding:"7px 14px", fontSize:12, fontWeight:700}}>🗑️ Hapus</button>}
          </div>
          <div style={{display:"flex", gap:12, alignItems:"center"}}>
            {isSaving && (
              <span style={{ fontSize: 11, color: "#C4622D", fontWeight: 700, display: "flex", alignItems: "center" }} className="animate-pulse">
                Menyimpan...
              </span>
            )}
            <button
              onClick={() => setIsReaderMode(!isReaderMode)}
              className="hover-scale"
              title={isReaderMode ? "Edit Detail Konten" : "Selesai & Lihat Detail Konten"}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "none",
                background: isReaderMode ? "#C4622D" : "#2E7D32",
                color: "white",
                fontSize: 18,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(44,32,22,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              {isReaderMode ? "✏️" : "📖"}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {false && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,borderRadius:24}} onClick={e=>e.stopPropagation()}>
             <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} style={{background:"#FAFAFA",padding:32,borderRadius:24,maxWidth:360,width:"100%",boxShadow:"0 12px 30px rgba(0,0,0,0.2)",textAlign:"center"}}>
                <h3 style={{margin:"0 0 16px",fontSize:20,color:"#2C2016", fontWeight:800}}>Keluar dari Draft?</h3>
                <p style={{margin:"0 0 24px",fontSize:14,color:"rgba(44,32,22,0.6)",lineHeight:1.5}}>
                   {modal.mode === "add" ? "Anda sedang membuat draft baru. Yakin ingin keluar? Jika dihapus, draft ini akan hilang sepenuhnya." : "Anda sedang mengedit konten. Yakin ingin keluar?"}
                </p>
                <div style={{display:"flex",gap:12}}>
                   <button onClick={async ()=>{
                     if (modal.mode === "add" && d.title?.trim() !== "") {
                        await onDelete(d.id, true);
                     } else {
                        onClose();
                     }
                   }} style={{flex:1,padding:"12px 16px",background:"var(--theme-bg)",border:"1.5px solid rgba(44,32,22,0.2)",color:"#2C2016",borderRadius:24,fontWeight:700,cursor:"pointer"}}>
                      {modal.mode === "add" ? "Hapus Draft" : "Keluar"}
                   </button>
                   <button onClick={()=>{
                     setShowExitConfirm(false);
                   }} style={{flex:1,padding:"12px 16px",background:"var(--theme-primary, #C4622D)",border:"none",color:"white",borderRadius:24,fontWeight:700,cursor:"pointer"}}>
                      Lanjutkan Edit
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

