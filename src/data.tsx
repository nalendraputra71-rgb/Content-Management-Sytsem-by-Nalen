import { useState, useEffect, useMemo, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";

export const htmlToPlainText = (html: any) => {
  if (!html || typeof html !== 'string') return "";
  let text = html;

  // Convert common block elements to newlines
  text = text.replace(/<br\s*[\/]?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  
  // Convert lists
  text = text.replace(/<li[^>]*>/gi, "• ");
  text = text.replace(/<\/li>/gi, "\n");
  
  // Convert formatting to simple markdown equivalents for readable export
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_");
  text = text.replace(/<i[^>]*>(.*?)<\/i>/gi, "_$1_");
  
  // Remove any remaining HTML tags
  text = text.replace(/<(?:.|\n)*?>/gm, "");
  
  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    text = textarea.value;
  }
  
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
};

export function CustomDropdown({ value, options = [], onChange, dark = false, style = {}, prefix = "", alignRight = false, onUpdateOptions, multiple = false, initiallyOpen = false, onClose }: { value: any, options?: any[], onChange: (val: any) => void, dark?: boolean, style?: any, prefix?: string, alignRight?: boolean, onUpdateOptions?: (newOptions: any[]) => void, multiple?: boolean, initiallyOpen?: boolean, onClose?: () => void }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [editMode, setEditMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [localOptions, setLocalOptions] = useState<any[]>(options);

  // Sync with prop options when not editing
  useEffect(() => {
    if (!editMode) {
      setLocalOptions(options || []);
    }
  }, [options, editMode]);

  const handleSaveEdit = (optsToSave?: any[]) => {
    const finalOpts = optsToSave !== undefined ? optsToSave : localOptions;
    setEditMode(false);
    if (onUpdateOptions) {
      onUpdateOptions(finalOpts);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        if (editMode) {
          handleSaveEdit();
        }
        if (onClose) {
          onClose();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editMode, localOptions, onUpdateOptions, onClose]);

  const valuesArray = multiple ? (Array.isArray(value) ? value : (value ? String(value).split(',').map(s=>s.trim()).filter(Boolean) : [])) : [value];
  const activeOptions = valuesArray.map(v => options.find(o => (typeof o === 'string' ? o : o.id || o.name || o) === v)).filter(Boolean);
  
  let displayLabel: any = value;
  let activeColor = null;

  if (multiple) {
    if (activeOptions.length === 0) displayLabel = value || "Pilih opsi...";
    else if (activeOptions.length === 1) {
      const opt = activeOptions[0];
      displayLabel = typeof opt === 'string' ? opt : opt.label || opt.name || opt;
      activeColor = typeof opt === 'string' ? null : opt.color;
    } else {
      displayLabel = activeOptions.map(opt => typeof opt === 'string' ? opt : opt.label || opt.name || opt).join(", ");
    }
  } else {
    const activeOption = activeOptions[0];
    displayLabel = activeOption ? (typeof activeOption === 'string' ? activeOption : activeOption.label || activeOption.name || activeOption) : value;
    activeColor = (activeOption && typeof activeOption !== 'string') ? activeOption.color : null;
  }

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
          textAlign: "left",
          height: "auto",
          minHeight: "36px",
          ...style
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 8, overflow: "hidden", flex: 1}} title={typeof displayLabel === 'string' ? displayLabel : ''}>
           {activeColor && !dark && <div style={{width:8, height:8, borderRadius:"50%", background:activeColor, flexShrink:0}}/>}
           <span style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "1.4"}}>{prefix}{displayLabel}</span>
         </div>
         <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'all 0.2s', opacity: 0.6, flexShrink: 0 }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
            style={{ position: "absolute", top: "100%", left: alignRight ? "auto" : 0, right: alignRight ? 0 : "auto", minWidth: "100%", width: "max-content", maxWidth: "250px", marginTop: 4, background: "white", border: "1px solid rgba(44,32,22,0.1)", borderRadius: 12, padding: 6, zIndex: 9999, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", maxHeight: 300, overflowY: "auto", overflowX: "hidden" }}
          >
            {editMode && onUpdateOptions ? (
              <div 
                style={{display: "flex", flexDirection: "column", gap: 8, padding: "8px 4px"}}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div style={{fontSize: 11, fontWeight: 800, color: "#4B5563", textTransform: "uppercase", letterSpacing: 0.8, paddingBottom: 6, borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4}}>
                  <span>Edit Opsi</span>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleSaveEdit(); 
                    }} 
                    style={{
                      background: "rgba(59, 130, 246, 0.1)", 
                      border: "none", 
                      padding: "4px 8px",
                      borderRadius: 6,
                      cursor: "pointer", 
                      color: "#2563EB", 
                      fontSize: 10, 
                      fontWeight: 700,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.18)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)"}
                  >
                    Selesai
                  </button>
                </div>
                <div style={{display: "flex", flexDirection: "column", gap: 6, maxHeight: "180px", overflowY: "auto", paddingRight: 2}}>
                  {localOptions.map((o, i) => {
                    const isStr = typeof o === 'string';
                    const val = isStr ? o : o.id || o.name || o;
                    const label = isStr ? o : o.label || o.name || o;
                    const color = isStr ? null : o.color;
                    return (
                      <div key={i} style={{display: "flex", alignItems: "center", gap: 6}} onClick={(e) => e.stopPropagation()}>
                        {!isStr && (
                          <div style={{position: "relative", width: 22, height: 22, borderRadius: "50%", border: "1px solid #E5E7EB", overflow: "hidden", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: color || "#2C2016"}}>
                            <input 
                              type="color" 
                              value={color || "#2C2016"} 
                              onChange={(e) => {
                                const newOpts = [...localOptions];
                                newOpts[i] = { ...newOpts[i], color: e.target.value };
                                setLocalOptions(newOpts);
                              }}
                              style={{position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer"}}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div style={{width: 10, height: 10, borderRadius: "50%", background: "white", opacity: 0.7, pointerEvents: "none"}} />
                          </div>
                        )}
                        <input 
                          value={label}
                          onChange={(e) => {
                            const newOpts = [...localOptions];
                            if (isStr) newOpts[i] = e.target.value;
                            else newOpts[i] = { ...newOpts[i], name: e.target.value, id: e.target.value };
                            setLocalOptions(newOpts);
                          }}
                          placeholder="Nama opsi..."
                          style={{
                            flex: 1, 
                            minWidth: 0, 
                            fontSize: 12, 
                            padding: "6px 8px", 
                            border: "1px solid #E5E7EB", 
                            borderRadius: 6, 
                            outline: "none",
                            background: "#FFFFFF",
                            color: "#1F2937",
                            fontWeight: 600,
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
                            transition: "all 0.15s"
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#3B82F6";
                            e.target.style.boxShadow = "0 0 0 2px rgba(59, 130, 246, 0.15)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#E5E7EB";
                            e.target.style.boxShadow = "none";
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveEdit();
                            }
                          }}
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const newOpts = localOptions.filter((_, idx) => idx !== i);
                            setLocalOptions(newOpts);
                          }}
                          style={{
                            background: "none", 
                            border: "none", 
                            color: "#9C2B4E", 
                            cursor: "pointer", 
                            padding: 6, 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            borderRadius: 6,
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#FEE2E2"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                        >
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const isObj = localOptions.length > 0 && typeof localOptions[0] !== 'string';
                    const newItem = isObj ? {name: "Opsi Baru", id: "Opsi Baru", color: "#3B82F6"} : "Opsi Baru";
                    const newOpts = [...localOptions, newItem];
                    setLocalOptions(newOpts);
                  }}
                  style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#4B5563", cursor: "pointer", marginTop: 4, transition: "all 0.2s"}}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#E5E7EB"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#F3F4F6"}
                >
                  <Plus size={12}/> Tambah Opsi
                </button>
              </div>
            ) : (
              <>
                {options.map((o, i) => {
                  const val = typeof o === 'string' ? o : o.id || o.name || o;
                  const isSelected = multiple ? valuesArray.includes(val) : val === value;
                  const label = typeof o === 'string' ? o : o.label || o.name || o;
                  const color = (typeof o !== 'string') ? o.color : null;
                  
                  return (
                    <div 
                      key={i} 
                      onClick={() => { 
                        if (multiple) {
                           let v = [...valuesArray];
                           if (v.includes(val)) v = v.filter(x => x !== val);
                           else v.push(val);
                           onChange(v);
                        } else {
                           onChange(val); 
                           setOpen(false); 
                           if (onClose) onClose();
                        }
                      }}
                      style={{ 
                        padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: isSelected?800:600, cursor: "pointer", 
                        background: isSelected ? (color ? color + "20" : "rgba(var(--theme-primary-rgb), 0.1)") : "transparent", 
                        color: isSelected ? (color || "var(--theme-primary)") : "#2C2016", 
                        transition: "all 0.1s",
                        display: "flex", alignItems: "center", gap: 10,
                        marginBottom: 2
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#FAFAFA"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                    >
                      {multiple && (
                        <div style={{width: 14, height: 14, borderRadius: 4, border: "1px solid", borderColor: isSelected ? (color || "var(--theme-primary)") : "#D1D5DB", background: isSelected ? (color || "var(--theme-primary)") : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
                          {isSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      )}
                      {color && !multiple && <div style={{width:10, height:10, borderRadius:"50%", background:color}}/>}
                      {color && multiple && <div style={{width:10, height:10, borderRadius:"50%", background:color}}/>}
                      <span style={{flex: 1, wordBreak: "break-word"}}>{prefix}{label}</span>
                    </div>
                  );
                })}
                {multiple && (
                  <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 12px", borderTop: "1px solid rgba(44,32,22,0.06)", marginTop: 4 }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                        if (onClose) onClose();
                      }}
                      style={{
                        padding: "6px 14px",
                        background: "#2563EB",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 750,
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#1D4ED8"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#2563EB"}
                    >
                      Selesai
                    </button>
                  </div>
                )}
                {onUpdateOptions && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); setEditMode(true); }}
                    style={{ borderTop: "1px solid rgba(44,32,22,0.1)", marginTop: 4, paddingTop: 4, paddingBottom: 0 }}
                  >
                    <div 
                      style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "rgba(44,32,22,0.5)" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <Pencil size={12}/> Edit Opsi Dropdown
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const THEMES = [
  { id: "modern-blue", name: "Modern Blue (Default)", primary: "#1D4D7A", rgb: "29, 77, 122", sidebar: "#0B2A4A", header: "#FFFFFF", text: "#FFFFFF", gradient: "linear-gradient(135deg, #0B2A4A 0%, #1D4D7A 100%)", bg: "#F5F7FB", textMain: "#111827", textSec: "#6B7280", border: "#E5E7EB" },
  { id: "sunset", name: "Sunset Orange", primary: "#3B82F6", rgb: "255, 107, 0", sidebar: "#1A140F", header: "#2C2016", text: "#FFFFFF" },
  { id: "midnight", name: "Midnight Navy", primary: "#3B82F6", rgb: "59, 130, 246", sidebar: "#0F172A", header: "#1E293B", text: "#FFFFFF" },
  { id: "graphite", name: "Slate Graphite", primary: "#64748B", rgb: "100, 116, 139", sidebar: "#18181B", header: "#27272A", text: "#FFFFFF" },
  { id: "ocean", name: "Deep Ocean", primary: "#0D9488", rgb: "13, 148, 136", sidebar: "#042F2E", header: "#134E4A", text: "#FFFFFF" },
  { id: "silver", name: "Modern Silver", primary: "#475569", rgb: "71, 85, 105", sidebar: "#1E293B", header: "#334155", text: "#FFFFFF" },
  { id: "minimal-white", name: "Minimalist White", primary: "#2563EB", rgb: "37, 99, 235", sidebar: "#111827", header: "#1F2937", text: "#FFFFFF" },
  { id: "business-blue", name: "Business Blue", primary: "#1E40AF", rgb: "30, 64, 175", sidebar: "#111827", header: "#1E3A8A", text: "#FFFFFF" },
  { id: "coffee", name: "Coffee Mocha", primary: "#A67C1C", rgb: "166, 124, 28", sidebar: "#271B13", header: "#3D2B1E", text: "#FFFFFF" },
  { id: "charcoal", name: "Charcoal Elite", primary: "#4B5563", rgb: "75, 85, 99", sidebar: "#000000", header: "#111111", text: "#FFFFFF" },
  { id: "elegant-soft", name: "Elegant Soft", primary: "#7C3AED", rgb: "124, 58, 237", sidebar: "#1A1A1A", header: "#262626", text: "#FFFFFF" },
];

export const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
export const MS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
export const DAYS_ID = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
export const DAYS_S = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
export const YEARS = [2024,2025,2026,2027,2028];
export const MK = ["views","reach","likes","comments","shares","reposts","saves"];
export const MC: any = {views:"#2C2016",reach:"#3B82F6",likes:"#9C2B4E",comments:"#2B4C7E",shares:"#2D7A5E",reposts:"#A67C1C",saves:"#723680"};

export const DP = [
  {name:"Pillar 1", color:"#3B82F6",light:"#FDF0EB"},
  {name:"Pillar 2", color:"#2B4C7E",light:"#E5EEF7"},
  {name:"Pillar 3", color:"#2D7A5E",light:"#E5F4EE"}
];
export const DPL = [
  {name:"Feed",   color:"#2C2016"},
  {name:"Reels",  color:"#3B82F6"},
  {name:"Stories",color:"#A67C1C"},
  {name:"TikTok", color:"#2D7A5E"},
];
export const DPIC = [
  {name: "PIC 1", color: "#2B4C7E"},
  {name: "PIC 2", color: "#9C2B4E"},
  {name: "PIC 3", color: "#3E5E28"}
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

export const DCT = [
  {name: "Feed", color: "#2B4C7E"},
  {name: "Video Pendek", color: "#3B82F6"},
  {name: "Video Panjang", color: "#3E5E28"},
  {name: "Single Post", color: "#9C2B4E"},
  {name: "Story", color: "#A67C1C"}
];

export const DH: any = {
  "2025-5-1":"🛠️ Hari Buruh","2025-5-2":"📚 Hari Pendidikan","2025-5-12":"🙏 Waisak",
  "2025-5-14":"🎉 Launch Day!","2025-5-20":"🇮🇩 Kebangkitan Nasional",
  "2025-5-22":"🔥 Flash Sale","2025-5-29":"🙏 Kenaikan Isa Almasih",
  "2026-1-1":"🎆 Tahun Baru","2026-5-1":"🛠️ Hari Buruh","2026-8-17":"🇮🇩 Kemerdekaan",
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
export const gid  = () => `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
export const eng  = (m: any)  => m ? (m.likes||0)+(m.comments||0)+(m.shares||0)+(m.reposts||0)+(m.saves||0) : 0;
export const fmt  = (n: any)  => Number(n||0).toLocaleString('id-ID');
export const fmtD = (y: any,mo: any,d: any) => { const w=new Date(y,mo-1,d).getDay(); return `${DAYS_ID[w]}, ${String(d).padStart(2,"0")}/${String(mo).padStart(2,"0")}/${y}`; };
export const fmtT = (h: any, m: any, format?: string) => {
  const hh = String(h !== undefined && h !== null ? h : 9).padStart(2,"0");
  const mm = String(m !== undefined && m !== null ? m : 0).padStart(2,"0");
  if (format === 'AM' || format === 'PM') {
    return `${hh}:${mm} ${format}`;
  }
  return `${hh}:${mm}`;
};

export const getMin = (item: any) => {
  let h = item.uploadHour !== undefined && item.uploadHour !== null ? Number(item.uploadHour) : 24;
  let m = item.uploadMinute !== undefined && item.uploadMinute !== null ? Number(item.uploadMinute) : 0;
  if (item.timeFormat === 'PM' && h < 12) h += 12;
  if (item.timeFormat === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

/**
 * Returns dynamic promo events based on date patterns:
 * - Twin Date (e.g., 5.5, 6.6)
 * - Payday Sale (25th to end of month)
 */
export const getDynamicEvents = (y: number, m: number, d: number) => {
  return "";
};
export const nowTs= () => new Date().toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"});
export const gps  = (ps: any,name: any) => {
  const p = ps?.find((x:any)=>x?.name?.trim()?.toLowerCase()===name?.trim()?.toLowerCase()) || ps?.[0];
  const color = p?.color || "#3B82F6";
  const light = p?.light || color + "22";
  return { name: p?.name || name, color, light };
};
export const gpc  = (pls: any,name: any) => (pls.find((p:any)=>p.name?.trim()?.toLowerCase()===name?.trim()?.toLowerCase())||{color:"#2C2016"}).color;
export const gss  = (name: any) => SS[name]||{bg:"#F5F0E8",color:"#A67C1C"};

export const emptyItem = (y:any,mo:any,d:any,pillars:any,platforms:any,pics:any,statuses:any,contentTypes:any) => ({
  id:gid(),year:y,month:mo,day:d,
  uploadHour:9,uploadMinute:0,
  pillar:pillars[0]?.name||pillars[0]||"",platform:platforms[0]?.name||platforms[0]||"",
  contentType:contentTypes?.[0]?.name||contentTypes?.[0]||"",
  pic:pics[0]?.name||pics[0]||"",status:statuses[0]?.name||statuses[0]||"Draft",
  title:"",caption:"",briefCopywriting:"",objective:"",
  referenceText:"",referenceLinks:[],referenceImage:"",
  customFields:[],
  linkAsset:"",linkSosmed:"",
  isAds:false,archived:false,metricsUpdatedAt:null,
  metrics:{views:0,reach:0,likes:0,comments:0,shares:0,reposts:0,saves:0},
  adsMetrics:{views:0,reach:0,likes:0,comments:0,shares:0,reposts:0,saves:0,clicks:0,conversions:0}
});

// ─── SEED ─────────────────────────────────────────────────────────────────────

const baseSeed: any[] = [];

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
export const B = (active:any, color = "var(--theme-primary)") => ({
  border: active ? `1px solid ${color}` : `1px solid rgba(44,32,22,0.1)`,
  borderRadius: 24,
  padding: "8px 18px",
  fontSize: 13,
  cursor: "pointer",
  fontWeight: 600,
  background: active ? (color === "var(--theme-primary)" || color === "var(--theme-gradient)" ? "var(--theme-gradient)" : color) : "transparent",
  color: active ? "white" : "#2C2016",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8
});

export const TAB = (active:any) => ({
  border: "none",
  borderBottom: `2.5px solid ${active ? "var(--theme-primary)" : "transparent"}`,
  background: "transparent",
  padding: "12px 20px",
  fontSize: 13,
  fontWeight: active ? 700 : 500,
  cursor: "pointer",
  
  color: active ? "var(--theme-primary)" : "rgba(44,32,22,0.5)",
  whiteSpace: "nowrap" as any
});
export const CARD = (ex:any={}) => ({
  background: "rgba(255,255,255,0.45)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  transform: "translateZ(0)",
  willChange: "transform",
  borderRadius: 24,
  padding: "24px",
  boxShadow: "0 8px 30px rgba(44,32,22,0.06)",
  border: "1px solid rgba(255,255,255,0.6)",
  marginBottom: 24,
  ...ex
});
export const GRP = {display:"flex",flexDirection:"column" as any,gap:8};

// ─── TINY COMPONENTS ─────────────────────────────────────────────────────────
export const SBadge = ({status}: any) => { const s=gss(status); return <span className="pill-tag" style={{background:s.bg,color:s.color}}>{status}</span>; };
export const PBadge = ({name,platforms}: any) => { 
  if (!name) return null;
  const names = String(name).split(',').map(s=>s.trim()).filter(Boolean);
  return (
    <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
      {names.map((n, i) => {
        const bg = gpc(platforms, n); 
        const p = platforms?.find((x:any)=>x.name?.trim()?.toLowerCase()===n.toLowerCase());
        const light = p?.light || `${bg}20`;
        return <span key={i} className="pill-tag" style={{background:light,color:bg}}>{n}</span>; 
      })}
    </div>
  );
};
export const PiBadge = ({name,pillars}: any) => {
  if (!name) return null;
  const names = String(name).split(',').map(s=>s.trim()).filter(Boolean);
  return (
    <div style={{display:"flex", flexWrap:"wrap", gap:4}}>
      {names.map((n, i) => {
        const ps = gps(pillars, n);
        return <span key={i} className="pill-tag" style={{background:ps.light,color:ps.color}}>{n}</span>;
      })}
    </div>
  );
};
