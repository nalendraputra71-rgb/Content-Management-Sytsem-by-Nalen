import { useState, useEffect } from "react";
import { useI18n } from "./i18n";
import { I, B, CARD, THEMES } from "./data";
import { ColorPickerSelect } from "./components/ColorPickerSelect";
import { 
  Save, 
  CheckCircle2, 
  Palette, 
  Layers, 
  Smartphone, 
  Users, 
  ClipboardList, 
  Calendar, 
  Sparkles, 
  Building, 
  Settings, 
  Cloud, 
  FlaskConical,
  Trash2,
  X,
  Globe
} from "lucide-react";

function getSectionIcon(id: string, size = 16) {
  switch (id) {
    case "language": return <Globe size={size} />;
    case "visual": return <Palette size={size} />;
    case "pillars": return <Layers size={size} />;
    case "platforms": return <Smartphone size={size} />;
    case "pics": return <Users size={size} />;
    case "statuses": return <ClipboardList size={size} />;
    case "holidays": return <Calendar size={size} />;
    case "customEvents": return <Sparkles size={size} />;
    case "workspace": return <Building size={size} />;
    case "general": return <Settings size={size} />;
    default: return <Settings size={size} />;
  }
}

function formatIndonesiaDate(ymdString: string) {
  const parts = ymdString.split("-");
  if (parts.length !== 3) return ymdString;
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(m) || isNaN(d) || m < 1 || m > 12) return ymdString;
  return `${d} ${months[m - 1]} ${y}`;
}

export const HOLIDAY_API_OPTIONS = [
  { id: "id-skb", name: "Indonesia (Libur Nasional & Cuti Bersama)", country: "ID", color: "#E11D48", isCustomApi: true },
  { id: "id-id-observances", name: "Indonesia (Hari Peringatan Nasional)", country: "ID", color: "#6366F1", isCustomApi: true },
  { id: "id-int-observances", name: "Internasional (Hari Peringatan Global)", country: "ID", color: "#4F46E5", isCustomApi: true },
  { id: "us", name: "United States (US Holidays)", country: "US", color: "#2563EB" },
  { id: "sg", name: "Singapore (SG Holidays)", country: "SG", color: "#059669" },
  { id: "my", name: "Malaysia (MY Holidays)", country: "MY", color: "#D97706" },
  { id: "jp", name: "Japan (JP Holidays)", country: "JP", color: "#7C3AED" },
  { id: "gb", name: "United Kingdom (UK Holidays)", country: "GB", color: "#0891B2" },
];

export function SettingsPanel({ initialSettings, onSave, onSeed, isRestricted, profile, onUpdateProfile, onDirty, onLeave, onDelete, isOwner }: any) {
  const { lang, setLang } = useI18n();
  const [section, setSection] = useState("visual");
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  
  // Local state for all settings
  const transformInit = (arr: any[]) => (arr || []).map((x:any) => {
    const isStr = typeof x === 'string';
    return { 
      name: isStr ? x : x.name, 
      color: isStr ? "var(--theme-primary)" : x.color, 
      light: isStr ? undefined : x.light,
      _originalName: isStr ? x : x.name 
    };
  });

  const [localPillars, setLocalPillars] = useState(() => transformInit(initialSettings.pillars));
  const [localPlatforms, setLocalPlatforms] = useState(() => transformInit(initialSettings.platforms));
  const [localContentTypes, setLocalContentTypes] = useState(() => transformInit(initialSettings.contentTypes));
  const [localPics, setLocalPics] = useState(() => transformInit(initialSettings.pics));
  const [localStatuses, setLocalStatuses] = useState(() => transformInit(initialSettings.statuses));
  const [localHolidays, setLocalHolidays] = useState(initialSettings.holidays || {});
  const [localHolidayApis, setLocalHolidayApis] = useState(initialSettings.holidayApis || []);
  const [localCustomEvents, setLocalCustomEvents] = useState(initialSettings.customEvents || []);
  const [localShowHolidays, setLocalShowHolidays] = useState(initialSettings.showHolidays ?? true);

  const [newVal, setNewVal] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [newHKey, setNewHKey] = useState("");
  const [newHVal, setNewHVal] = useState("");

  const [newEvName, setNewEvName] = useState("");
  const [newEvColor, setNewEvColor] = useState("#3B82F6");
  const [newEvStart, setNewEvStart] = useState("");
  const [newEvEnd, setNewEvEnd] = useState("");
  const [newEvMonthly, setNewEvMonthly] = useState(false);

  const [editingEvId, setEditingEvId] = useState<string | null>(null);
  const [editEvName, setEditEvName] = useState("");
  const [editEvColor, setEditEvColor] = useState("");
  const [editEvStart, setEditEvStart] = useState("");
  const [editEvEnd, setEditEvEnd] = useState("");
  const [editEvMonthly, setEditEvMonthly] = useState(false);

  const [addEventAttempted, setAddEventAttempted] = useState(false);
  const [editEventAttempted, setEditEventAttempted] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [themeSuccess, setThemeSuccess] = useState(false);

  // Dirty check logic
  const isDirty = JSON.stringify(localPillars) !== JSON.stringify(initialSettings.pillars || []) ||
                  JSON.stringify(localPlatforms) !== JSON.stringify(initialSettings.platforms || []) ||
                  JSON.stringify(localContentTypes) !== JSON.stringify(initialSettings.contentTypes || []) ||
                  JSON.stringify(localPics) !== JSON.stringify(initialSettings.pics || []) ||
                  JSON.stringify(localStatuses) !== JSON.stringify(initialSettings.statuses || []) ||
                  JSON.stringify(localHolidays) !== JSON.stringify(initialSettings.holidays || {}) ||
                  JSON.stringify(localHolidayApis) !== JSON.stringify(initialSettings.holidayApis || []) ||
                  JSON.stringify(localCustomEvents) !== JSON.stringify(initialSettings.customEvents || []) ||
                  localShowHolidays !== (initialSettings.showHolidays ?? true);

  useEffect(() => {
    onDirty?.(isDirty);
  }, [isDirty, onDirty]);

  // Sync if initialSettings change (e.g. workspace switch strictly from backend)
  useEffect(() => {
    setLocalPillars(transformInit(initialSettings.pillars));
    setLocalPlatforms(transformInit(initialSettings.platforms));
    setLocalContentTypes(transformInit(initialSettings.contentTypes));
    setLocalPics(transformInit(initialSettings.pics));
    setLocalStatuses(transformInit(initialSettings.statuses));
    setLocalHolidays(initialSettings.holidays || {});
    setLocalHolidayApis(initialSettings.holidayApis || []);
    setLocalCustomEvents(initialSettings.customEvents || []);
    setSaveSuccess(false);
  }, [JSON.stringify(initialSettings)]);

  const sections = [
    ["language", lang === 'id' ? "Bahasa" : "Language"],
    ["visual", lang === 'id' ? "Tema Visual" : "Visual Theme"],
    ["pillars", lang === 'id' ? "Pilar Konten" : "Content Pillars"],
    ["contentTypes", lang === 'id' ? "Tipe Konten" : "Content Types"],
    ["pics", lang === 'id' ? "Anggota Tim / PIC" : "Team / PIC"],
    ["statuses", lang === 'id' ? "Status Workflow" : "Workflow Status"],
    ["holidays", lang === 'id' ? "Hari Besar" : "Holidays"],
    ["customEvents", lang === 'id' ? "Event Kustom" : "Custom Events"],
    ["workspace", "Workspace"],
    ["general", "General & Debug"]
  ];

  const handleSectionChange = (id: string) => {
    if (isDirty) {
      setPendingSection(id);
    } else {
      setSection(id);
    }
  };

  const handleSaveTheme = async (themeId: string) => {
    setSavingTheme(true);
    setThemeSuccess(false);
    try {
      await onUpdateProfile({ themeId });
      setThemeSuccess(true);
      setTimeout(() => setThemeSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingTheme(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const cleanArray = (arr: any[]) => arr.map(x => {
        const { _originalName, ...rest } = x;
        return rest;
      });
      
      const deduplicate = (arr: any[]) => {
         const seen = new Set();
         return arr.filter(x => {
            const name = typeof x === 'string' ? x : x.name;
            const nameLower = String(name || "").trim().toLowerCase();
            if (!nameLower || seen.has(nameLower)) return false;
            seen.add(nameLower);
            return true;
         });
      };

      const computedRenames: any = { pillars: {}, platforms: {}, contentTypes: {}, pics: {}, statuses: {} };
      
      const trackRenames = (arr: any[], type: string) => {
         arr.forEach(x => {
            if (x._originalName && x._originalName !== x.name) {
               computedRenames[type][x._originalName] = x.name;
            }
         });
      };

      trackRenames(localPillars, 'pillars');
      trackRenames(localPlatforms, 'platforms');
      trackRenames(localContentTypes, 'contentTypes');
      trackRenames(localPics, 'pics');
      trackRenames(localStatuses, 'statuses');

      await onSave({
        pillars: deduplicate(cleanArray(localPillars)),
        platforms: deduplicate(cleanArray(localPlatforms)),
        contentTypes: deduplicate(cleanArray(localContentTypes)),
        pics: deduplicate(cleanArray(localPics)),
        statuses: deduplicate(cleanArray(localStatuses)),
        holidays: localHolidays,
        holidayApis: localHolidayApis,
        customEvents: localCustomEvents,
        showHolidays: localShowHolidays,
        renames: computedRenames
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Save settings error:", e);
    } finally {
      setSaving(false);
    }
  };

  const addPillar = () => {
    if (!newVal.trim()) return;
    setLocalPillars((p: any) => [...p, { name: newVal.trim(), color: newColor, light: newColor + "22" }]);
    setNewVal(""); setNewColor("#3B82F6");
  };
  const editPillar = (i: any, name: any, color: any) => setLocalPillars((p: any) => p.map((x: any, idx: any) => idx === i ? { ...x, name, color, light: color + "22" } : x));
  const delPillar = (i: any) => setLocalPillars((p: any) => p.filter((_: any, idx: any) => idx !== i));

  const addPlatform = () => { if (!newVal.trim()) return; setLocalPlatforms((p: any) => [...p, { name: newVal.trim(), color: newColor }]); setNewVal(""); };
  const editPlatform = (i: any, name: any, color: any) => setLocalPlatforms((p: any) => p.map((x: any, idx: any) => idx === i ? { ...x, name, color } : x));
  const delPlatform = (i: any) => setLocalPlatforms((p: any) => p.filter((_: any, idx: any) => idx !== i));

  const addContentType = () => { if (!newVal.trim()) return; setLocalContentTypes((p: any) => [...p, { name: newVal.trim(), color: newColor }]); setNewVal(""); };
  const editContentType = (i: any, name: any, color: any) => setLocalContentTypes((p: any) => p.map((x: any, idx: any) => idx === i ? { ...x, name, color } : x));
  const delContentType = (i: any) => setLocalContentTypes((p: any) => p.filter((_: any, idx: any) => idx !== i));

  const addPic = () => { if (!newVal.trim()) return; setLocalPics((p: any) => [...p, { name: newVal.trim(), color: newColor }]); setNewVal(""); };
  const editPic = (i: any, name: any, color: any) => setLocalPics((p: any) => p.map((x: any, idx: any) => idx === i ? { ...x, name, color } : x));
  const delPic = (i: any) => setLocalPics((p: any) => p.filter((_: any, idx: any) => idx !== i));

  const addStatus = () => { if (!newVal.trim()) return; setLocalStatuses((s: any) => [...s, { name: newVal.trim(), color: newColor }]); setNewVal(""); };
  const editStatus = (i: any, name: any, color: any) => setLocalStatuses((p: any) => p.map((x: any, idx: any) => idx === i ? { ...x, name, color } : x));
  const delStatus = (i: any) => setLocalStatuses((s: any) => s.filter((_: any, idx: any) => idx !== i));

  const addHoliday = () => {
    if (!newHKey || !newHVal.trim()) return;
    const parts = newHKey.split("-");
    if (parts.length === 3) {
      const y = parts[0];
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const cleanedKey = `${y}-${m}-${d}`;
      setLocalHolidays((h: any) => ({ ...h, [cleanedKey]: newHVal.trim() }));
      setNewHKey("");
      setNewHVal("");
    }
  };
  const delHoliday = (k: any) => setLocalHolidays((h: any) => { const n = { ...h }; delete n[k]; return n; });

  const addCustomEvent = () => {
    setAddEventAttempted(true);
    if (!newEvName.trim() || !newEvStart || !newEvEnd) return;
    setLocalCustomEvents((prev: any) => [...prev, {
      id: Date.now().toString(),
      name: newEvName.trim(),
      color: newEvColor,
      start: newEvStart,
      end: newEvEnd,
      monthly: newEvMonthly
    }]);
    setNewEvName(""); setNewEvStart(""); setNewEvEnd(""); setNewEvMonthly(false);
    setAddEventAttempted(false);
  };
  const delCustomEvent = (id: string) => setLocalCustomEvents((prev: any) => prev.filter((ev: any) => ev.id !== id));

  const startEditCustomEvent = (ev: any) => {
    setEditingEvId(ev.id);
    setEditEvName(ev.name);
    setEditEvColor(ev.color || "#3B82F6");
    setEditEvStart(ev.start || "");
    setEditEvEnd(ev.end || "");
    setEditEvMonthly(ev.monthly || false);
    setEditEventAttempted(false);
  };

  const saveEditedCustomEvent = (id: string) => {
    setEditEventAttempted(true);
    if (!editEvName.trim() || !editEvStart || !editEvEnd) return;
    setLocalCustomEvents((prev: any) => prev.map((ev: any) => ev.id === id ? {
      ...ev,
      name: editEvName.trim(),
      color: editEvColor,
      start: editEvStart,
      end: editEvEnd,
      monthly: editEvMonthly
    } : ev));
    setEditingEvId(null);
    setEditEventAttempted(false);
  };

  const renderInputRow = (placeholder: string, value: string, onChange: any, onAdd: any, colorPicker: boolean) => (
    <div style={{ display: "flex", gap: 8, marginTop: 12, background: "var(--theme-primary)11", padding: 10, borderRadius: 16, border: "1px dashed var(--theme-primary)44", alignItems: "center" }}>
      {colorPicker && <ColorPickerSelect value={newColor} onChange={(val) => setNewColor(val)} />}
      <input value={value} onChange={(e: any) => onChange(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && onAdd()} placeholder={placeholder} style={I({ flex: 1, border: "none", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontSize: 14 })} />
      <button onClick={onAdd} className="hover-scale" style={{ ...B(true, "var(--theme-primary)"), padding: "0 20px", height: 42, fontWeight: 700, borderRadius: 12, border: "none", color: "white" }}>{lang === 'id' ? 'Tambah' : 'Add'}</button>
    </div>
  );

  const sortedHolidays = Object.entries(localHolidays).sort(([k1], [k2]) => {
    const parts1 = k1.split("-").map(Number);
    const parts2 = k2.split("-").map(Number);
    const y1 = parts1[0] || 0;
    const m1 = parts1[1] || 1;
    const d1 = parts1[2] || 1;
    const y2 = parts2[0] || 0;
    const m2 = parts2[1] || 1;
    const d2 = parts2[2] || 1;
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    return date1.getTime() - date2.getTime();
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header Sticky Action Bar */}
      <div style={{ background: "white", borderRadius: 16, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(44,32,22,0.08)", position: "sticky", top: 16, zIndex: 60 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Pengaturan Workspace' : 'Workspace Settings'}</h2>
          <p style={{ fontSize: 11, color: "rgba(44,32,22,0.4)", margin: 0, fontWeight: 600 }}>{lang === 'id' ? 'Ubah kategori, platform, PIC, dan event khusus.' : 'Change categories, platforms, PICs, and custom events.'}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveSuccess && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#2D7A5E" }}>
              <CheckCircle2 size={16} /> {lang === 'id' ? 'Tersimpan' : 'Saved'}
            </span>
          )}
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="hover-scale shadow-lg"
            style={{ 
              ...B(true, saveSuccess ? "#2D7A5E" : "var(--theme-primary)"), 
              display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 24, fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", border: "none", color: "white"
            }}
          >
            <Save size={18} /> {saving ? (lang === 'id' ? "Menyimpan..." : "Saving...") : (lang === 'id' ? "Simpan Perubahan" : "Save Changes")}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 16, minHeight: 400 }}>
        <div style={{ background: "white", borderRadius: 16, padding: "12px 4px", boxShadow: "0 1px 6px rgba(44,32,22,0.06)", height: "fit-content", border: "1px solid rgba(44,32,22,0.04)" }}>
          {sections.map(([id, label]) => (
            <button 
              key={id} 
              onClick={() => handleSectionChange(id)} 
              style={{ 
                width: "calc(100% - 16px)", 
                margin: "4px 8px",
                padding: "10px 14px", 
                textAlign: "left", 
                border: "none", 
                borderRadius: "10px",
                background: section === id ? "var(--theme-primary)15" : "transparent", 
                cursor: "pointer", 
                fontSize: 13, 
                fontWeight: section === id ? 700 : 500, 
                color: section === id ? "var(--theme-primary)" : "rgba(44,32,22,0.8)", 
                display: "flex", 
                alignItems: "center", 
                gap: 12,
                boxShadow: section === id ? "0 2px 6px rgba(0,0,0,0.02)" : "none",
                transition: "all 0.15s ease-out"
              }}
              className="hover:bg-black/[0.02]"
            >
              <span style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: section === id ? "var(--theme-primary)" : "rgba(44,32,22,0.5)",
                transform: section === id ? "scale(1.05)" : "scale(1)",
                transition: "transform 0.15s"
              }}>
                {getSectionIcon(id, 16)}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div style={CARD()}>
          {section === "language" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("language", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Bahasa Antarmuka' : 'Interface Language'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>
                    {lang === 'id' ? 'Pilih bahasa yang ingin digunakan di seluruh antarmuka aplikasi.' : 'Choose the language you want to use throughout the application interface.'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div 
                  onClick={() => setLang('id')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: `2px solid ${lang === 'id' ? 'var(--theme-primary)' : 'transparent'}`, background: lang === 'id' ? 'var(--theme-primary)11' : '#f8f9fa', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🇮🇩</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#2C2016' }}>Bahasa Indonesia</div>
                      <div style={{ fontSize: 12, color: 'rgba(44,32,22,0.5)' }}>Bahasa sistem default</div>
                    </div>
                  </div>
                  {lang === 'id' && <CheckCircle2 size={20} color="var(--theme-primary)" />}
                </div>

                <div 
                  onClick={() => setLang('en')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, border: `2px solid ${lang === 'en' ? 'var(--theme-primary)' : 'transparent'}`, background: lang === 'en' ? 'var(--theme-primary)11' : '#f8f9fa', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🇺🇸</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#2C2016' }}>English</div>
                      <div style={{ fontSize: 12, color: 'rgba(44,32,22,0.5)' }}>International language</div>
                    </div>
                  </div>
                  {lang === 'en' && <CheckCircle2 size={20} color="var(--theme-primary)" />}
                </div>
              </div>
            </div>
          )}
          {section === "visual" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("visual", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Tema Visual Profesional' : 'Professional Visual Theme'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>{lang === 'id' ? 'Pilih salah satu dari 10 tema warna profesional untuk aplikasi Anda. Tema ini berlaku secara global.' : 'Choose one of 10 professional color themes for your app. This theme applies globally.'}</p>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                {THEMES.map((t) => {
                  const isActive = profile?.themeId === t.id || (!profile?.themeId && t.id === "sunset");
                  return (
                    <button 
                      key={t.id} 
                      onClick={() => handleSaveTheme(t.id)}
                      className="hover-scale"
                      disabled={savingTheme}
                      style={{
                        padding: "16px",
                        background: "white",
                        borderRadius: 16,
                        border: `2.5px solid ${isActive ? t.primary : "rgba(44,32,22,0.05)"}`,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        alignItems: "center",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        textAlign: "center"
                      }}
                    >
                      {isActive && (
                        <div style={{ position: "absolute", top: 8, right: 8, background: t.primary, color: "white", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>
                          ✓
                        </div>
                      )}
                      <div style={{ display: "flex", width: "100%", height: 32, borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <div style={{ flex: 1, background: t.primary }} />
                        <div style={{ flex: 1, background: t.header }} />
                        <div style={{ flex: 1, background: t.sidebar }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: isActive ? t.primary : "#2C2016" }}>{t.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {themeSuccess && (
                <div style={{ marginTop: 24, padding: "12px 16px", background: "#E5F4EE", color: "#2D7A5E", borderRadius: 12, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                   <CheckCircle2 size={18} /> Tema berhasil disimpan dan disinkronkan ke seluruh perangkat Anda.
                </div>
              )}
            </div>
          )}
          {section === "pillars" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("pillars", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Pilar Konten' : 'Content Pillars'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>{lang === 'id' ? 'Kategori konten utama untuk strategi Anda' : 'Main content categories for your strategy'}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localPillars.map((p: any, i: any) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.05)", boxShadow: "0 2px 8px rgba(44,32,22,0.02)", transition: "all 0.2s" }} className="hover:border-[var(--theme-primary)44]">
                  <ColorPickerSelect value={p.color} onChange={(val) => editPillar(i, p.name, val)} />
                  <input value={p.name} onChange={(e: any) => editPillar(i, e.target.value, p.color)} style={{ flex: 1, fontSize: 14, fontWeight: 600, border: "none", background: "transparent", outline: "none", color: "#2C2016" }} />
                  <button onClick={() => delPillar(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9C2B4E", transition: "all 0.2s" }} className="hover:bg-[#9C2B4E] hover:text-white">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                </div>
              ))}
              </div>
              {renderInputRow("" + (lang === 'id' ? 'Nama pillar baru...' : 'New pillar name...') + "", newVal, setNewVal, addPillar, true)}
            </div>
          )}
          {section === "platforms" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("platforms", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Platform' : 'Platforms'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>{lang === 'id' ? 'Saluran distribusi konten Anda' : 'Your content distribution channels'}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localPlatforms.map((p: any, i: any) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.05)", boxShadow: "0 2px 8px rgba(44,32,22,0.02)", transition: "all 0.2s" }} className="hover:border-[var(--theme-primary)44]">
                  <ColorPickerSelect value={p.color} onChange={(val) => editPlatform(i, p.name, val)} />
                  <input value={p.name} onChange={(e: any) => editPlatform(i, e.target.value, p.color)} style={{ flex: 1, fontSize: 14, fontWeight: 600, border: "none", background: "transparent", outline: "none", color: "#2C2016" }} />
                  <button onClick={() => delPlatform(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9C2B4E", transition: "all 0.2s" }} className="hover:bg-[#9C2B4E] hover:text-white">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                </div>
              ))}
              </div>
              {renderInputRow("" + (lang === 'id' ? 'Nama platform baru...' : 'New platform name...') + "", newVal, setNewVal, addPlatform, true)}
            </div>
          )}
          {section === "contentTypes" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Tipe Konten' : 'Content Types'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>{lang === 'id' ? 'Bentuk dan format konten (Video, Feed, dll)' : 'Content shapes and formats (Video, Feed, etc)'}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localContentTypes.map((p: any, i: any) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.05)", boxShadow: "0 2px 8px rgba(44,32,22,0.02)", transition: "all 0.2s" }} className="hover:border-[var(--theme-primary)44]">
                  <ColorPickerSelect value={p.color} onChange={(val) => editContentType(i, p.name, val)} />
                  <input value={p.name} onChange={(e: any) => editContentType(i, e.target.value, p.color)} style={{ flex: 1, fontSize: 14, fontWeight: 600, border: "none", background: "transparent", outline: "none", color: "#2C2016" }} />
                  <button onClick={() => delContentType(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9C2B4E", transition: "all 0.2s" }} className="hover:bg-[#9C2B4E] hover:text-white">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                </div>
              ))}
              </div>
              {renderInputRow("" + (lang === 'id' ? 'Nama tipe konten baru...' : 'New content type name...') + "", newVal, setNewVal, addContentType, true)}
            </div>
          )}
          {section === "pics" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("pics", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'PIC Tim' : 'Team PIC'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>{lang === 'id' ? 'Anggota tim yang bertanggung jawab (Person In Charge)' : 'Team members in charge (Person In Charge)'}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localPics.map((p: any, i: any) => {
                const name = typeof p === 'string' ? p : p.name;
                const color = typeof p === 'string' ? "var(--theme-primary)" : p.color;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.05)", boxShadow: "0 2px 8px rgba(44,32,22,0.02)", transition: "all 0.2s" }} className="hover:border-[var(--theme-primary)44]">
                    <ColorPickerSelect value={color} onChange={(val) => editPic(i, name, val)} />
                    <input value={name} onChange={(e: any) => editPic(i, e.target.value, color)} style={{ flex: 1, fontSize: 14, fontWeight: 600, border: "none", background: "transparent", outline: "none", color: "#2C2016" }} />
                    <button onClick={() => delPic(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9C2B4E", transition: "all 0.2s" }} className="hover:bg-[#9C2B4E] hover:text-white">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                  </div>
                );
              })}
              </div>
              {renderInputRow("" + (lang === 'id' ? 'Nama PIC baru...' : 'New PIC name...') + "", newVal, setNewVal, addPic, true)}
            </div>
          )}
          {section === "statuses" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("statuses", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Status Workflow' : 'Workflow Status'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>{lang === 'id' ? 'Urutan dari atas ke bawah = alur kerja' : 'Top to bottom order = workflow'}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localStatuses.map((s: any, i: any) => {
                const name = typeof s === 'string' ? s : s.name;
                const color = typeof s === 'string' ? "var(--theme-primary)" : s.color;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.05)", boxShadow: "0 2px 8px rgba(44,32,22,0.02)", transition: "all 0.2s" }} className="hover:border-[var(--theme-primary)44]">
                    <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(44,32,22,0.3)", width: 24, textAlign: "center" }}>{i + 1}.</span>
                    <ColorPickerSelect value={color} onChange={(val) => editStatus(i, name, val)} />
                    <input value={name} onChange={(e: any) => editStatus(i, e.target.value, color)} style={{ flex: 1, background: color + "15", color: color, fontSize: 13, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", outline: "none", maxWidth: "fit-content" }} />
                    <div style={{flex: 1}} />
                    <button onClick={() => delStatus(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9C2B4E", transition: "all 0.2s" }} className="hover:bg-[#9C2B4E] hover:text-white">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                  </div>
                );
              })}
              </div>
              {renderInputRow("" + (lang === 'id' ? 'Status baru (e.g. In Review)...' : 'New status (e.g. In Review)...') + "", newVal, setNewVal, addStatus, true)}
            </div>
          )}
          {section === "holidays" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("holidays", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Hari Besar & Event Tahunan' : 'Holidays & Annual Events'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>{lang === 'id' ? 'Kelola hari libur otomatis (via API) atau tambahkan hari besar kustom Anda sendiri.' : 'Manage automatic holidays (via API) or add your own custom holidays.'}</p>
                </div>
              </div>

              {/* Pengaturan Tampilan */}
              <div style={{ background: "white", padding: 20, borderRadius: 16, border: "1px solid rgba(44,32,22,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: "#2C2016" }}>" + (lang === 'id' ? 'Tampilkan di Kalender' : 'Show in Calendar') + "</h4>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: 0 }}>" + (lang === 'id' ? 'Pilih apakah label hari besar dan event kustom ditampilkan di semua tampilan kalender.' : 'Choose whether holiday and custom event labels are displayed in all calendar views.') + "</p>
                </div>
                <div style={{
                  width: 48, height: 28, background: localShowHolidays ? "var(--theme-primary)" : "rgba(44,32,22,0.1)",
                  borderRadius: 14, position: "relative", cursor: "pointer", transition: "all 0.3s"
                }} onClick={() => setLocalShowHolidays(!localShowHolidays)}>
                  <div style={{
                    width: 20, height: 20, background: "white", borderRadius: "50%",
                    position: "absolute", top: 4, left: localShowHolidays ? 24 : 4, transition: "all 0.3s",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }} />
                </div>
              </div>

              {/* Integrasi API Hari Besar Gratis */}
              <div style={{ background: "rgba(44,32,22,0.03)", border: "1px solid rgba(44,32,22,0.08)", borderRadius: 16, padding: 18, marginBottom: 24, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.01)" }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px", color: "var(--theme-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                  🔌 Sinkronisasi Kalender Hari Libur Otomatis
                </h4>
                <p style={{ fontSize: 11, color: "rgba(44,32,22,0.6)", margin: "0 0 14px", lineHeight: 1.4 }}>
                  {lang === "id" ? "Pilih kalender hari libur nasional resmi untuk ditampilkan otomatis di dashboard dan sistem kalender mingguan/bulanan Anda. Bisa diaktifkan bersamaan." : "Select official national holiday calendars to automatically display on your dashboard and weekly/monthly calendar system. Can be enabled simultaneously."}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                  {HOLIDAY_API_OPTIONS.map((opt) => {
                    const active = localHolidayApis.includes(opt.id);
                    return (
                      <label 
                        key={opt.id} 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 10, 
                          padding: "10px 14px", 
                          background: active ? "white" : "rgba(255,255,255,0.4)", 
                          border: `2.5px solid ${active ? "var(--theme-primary)" : "rgba(44,32,22,0.06)"}`, 
                          borderRadius: 12, 
                          cursor: "pointer", 
                          fontSize: 12, 
                          fontWeight: 700,
                          color: active ? "var(--theme-primary)" : "rgba(44,32,22,0.7)",
                          boxShadow: active ? "0 4px 10px rgba(0,0,0,0.04)" : "none",
                          transition: "all 0.15s ease-out"
                        }}
                        className="hover-scale"
                      >
                        <input 
                          type="checkbox" 
                          checked={active} 
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalHolidayApis((prev: string[]) => [...prev, opt.id]);
                            } else {
                              setLocalHolidayApis((prev: string[]) => prev.filter(x => x !== opt.id));
                            }
                          }}
                          style={{
                            accentColor: "var(--theme-primary)",
                            cursor: "pointer",
                            width: 16,
                            height: 16
                          }}
                        />
                        <span>{opt.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#2C2016" }}>" + (lang === 'id' ? '📋 Daftar Hari Besar Kustom' : '📋 Custom Holidays List') + "</h4>
                <span style={{ fontSize: 11, color: "rgba(44,32,22,0.4)" }}>{sortedHolidays.length}" + (lang === 'id' ? ' Kustom terdaftar' : ' Custom registered') + "</span>
              </div>
              
              <div style={{ maxHeight: 220, overflow: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, paddingRight: 4 }}>
                {sortedHolidays.map(([k, v]: any) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 16, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.06)", boxShadow: "0 1px 4px rgba(44,32,22,0.015)" }}>
                    <div style={{ background: "var(--theme-primary)12", color: "var(--theme-primary)", padding: "4px 10px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <Calendar size={13} />
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-sans)" }}>
                        {formatIndonesiaDate(k)}
                      </span>
                    </div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#2C2016" }}>{v}</span>
                    <button 
                      onClick={() => delHoliday(k)} 
                      style={{ 
                        background: "rgba(156, 43, 78, 0.05)", 
                        border: "none", 
                        borderRadius: 8, 
                        width: 28, 
                        height: 28, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        cursor: "pointer", 
                        color: "#9C2B4E", 
                        transition: "all 0.2s" 
                      }} 
                      title={lang === "id" ? "Hapus" : "Delete"}
                      className="hover:bg-[#9C2B4E] hover:text-white"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {sortedHolidays.length === 0 && (
                  <div style={{ padding: "30px 20px", textAlign: "center", fontSize: 12, color: "rgba(44,32,22,0.4)", border: "1px dashed rgba(44,32,22,0.12)", borderRadius: 16 }}>
                    Belum ada hari besar kustom. Gunakan formulir di bawah untuk menambahkan.
                  </div>
                )}
              </div>
              
              <div style={{ display: "flex", gap: 12, background: "var(--theme-primary)08", padding: 14, borderRadius: 16, border: "1px dashed var(--theme-primary)33", alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "none", width: 160 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--theme-primary)" }}>" + (lang === 'id' ? 'Pilih Tanggal' : 'Select Date') + "</label>
                  <input 
                    type="date" 
                    value={newHKey} 
                    onChange={(e: any) => setNewHKey(e.target.value)} 
                    style={I({ border: "1px solid rgba(44,32,22,0.1)", background: "white", padding: "8px 10px", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.02)", fontSize: 13, height: 38, width: "100%" })} 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--theme-primary)" }}>" + (lang === 'id' ? 'Nama Hari Besar / Event' : 'Holiday / Event Name') + "</label>
                  <input 
                    value={newHVal} 
                    onChange={(e: any) => setNewHVal(e.target.value)} 
                    onKeyDown={(e: any) => e.key === "Enter" && addHoliday()}
                    placeholder="Contoh: HUT RI, Idul Fitri, Tahun Baru" 
                    style={I({ border: "1px solid rgba(44,32,22,0.1)", background: "white", padding: "8px 12px", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.02)", fontSize: 13, height: 38, width: "100%" })} 
                  />
                </div>
                <button 
                  onClick={addHoliday} 
                  className="hover-scale font-bold" 
                  style={{ 
                    ...B(true, "var(--theme-primary)"), 
                    padding: "0 24px", 
                    height: 38, 
                    borderRadius: 8, 
                    border: "none", 
                    color: "white",
                    fontSize: 13
                  }}
                >
                  Tambah
                </button>
              </div>
            </div>
          )}
          {section === "customEvents" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("customEvents", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Event Kustom & Promo' : 'Custom Events & Promos'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>{lang === 'id' ? 'Misal: Pay Day Sale, Twin Date, atau Peluncuran Produk.' : 'E.g., Pay Day Sale, Twin Date, or Product Launch.'}</p>
                </div>
              </div>
              
              <div style={{ background: "var(--theme-primary)08", padding: 20, borderRadius: 20, display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, border: addEventAttempted && (!newEvName.trim() || !newEvStart || !newEvEnd) ? "2px solid #9C2B4E" : "1px dashed var(--theme-primary)44" }}>
                <input 
                  type="text" 
                  value={newEvName} 
                  onChange={(e: any) => setNewEvName(e.target.value)} 
                  placeholder="Nama Event (e.g., Payday Sale)" 
                  style={I({
                    border: addEventAttempted && !newEvName.trim() ? "2px solid #9C2B4E" : "1px solid rgba(44,32,22,0.1)",
                    background: addEventAttempted && !newEvName.trim() ? "#FDF5F8" : "white",
                    fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                  })} 
                />
                <div style={{ display: "flex", gap: 12 }}>
                   <div style={{flex: 1}}>
                     <label style={{fontSize:11, fontWeight:700, marginBottom:6, display:"block", color: addEventAttempted && !newEvStart ? "#9C2B4E" : "var(--theme-primary)"}}>Start Date {addEventAttempted && !newEvStart && "*"}</label>
                     <input 
                       type="date" 
                       value={newEvStart} 
                       onChange={(e: any) => setNewEvStart(e.target.value)} 
                       style={I({
                         fontSize:13, 
                         padding:10,
                         border: addEventAttempted && !newEvStart ? "2px solid #9C2B4E" : "1px solid rgba(44,32,22,0.1)",
                         background: addEventAttempted && !newEvStart ? "#FDF5F8" : "white",
                         boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                       })} 
                     />
                   </div>
                   <div style={{flex: 1}}>
                     <label style={{fontSize:11, fontWeight:700, marginBottom:6, display:"block", color: addEventAttempted && !newEvEnd ? "#9C2B4E" : "var(--theme-primary)"}}>End Date {addEventAttempted && !newEvEnd && "*"}</label>
                     <input 
                       type="date" 
                       value={newEvEnd} 
                       onChange={(e: any) => setNewEvEnd(e.target.value)} 
                       style={I({
                         fontSize:13, 
                         padding:10,
                         border: addEventAttempted && !newEvEnd ? "2px solid #9C2B4E" : "1px solid rgba(44,32,22,0.1)",
                         background: addEventAttempted && !newEvEnd ? "#FDF5F8" : "white",
                         boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                       })} 
                     />
                   </div>
                   <div style={{flex: 0}}>
                     <label style={{fontSize:11, fontWeight:700, marginBottom:6, display:"block", color:"var(--theme-primary)"}}>Color</label>
                     <ColorPickerSelect value={newEvColor} onChange={(val) => setNewEvColor(val)} />
                   </div>
                </div>
                <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer", color:"#2C2016", fontWeight: 600}}>
                   <input type="checkbox" checked={newEvMonthly} onChange={e=>setNewEvMonthly(e.target.checked)} style={{width: 18, height: 18, accentColor: "var(--theme-primary)"}} />
                   Ulangi Setiap Bulan (Berdasarkan Tgl)
                </label>
                <button className="hover-scale" onClick={addCustomEvent} style={{ ...B(true, "var(--theme-primary)"), height: 44, borderRadius: 12, fontSize:14, fontWeight: 800, marginTop: 4, color: "white", border: "none" }}>" + (lang === 'id' ? 'Tambah Event Kustom' : 'Add Custom Event') + "</button>
                
                {addEventAttempted && (!newEvName.trim() || !newEvStart || !newEvEnd) && (
                  <span style={{ fontSize: 11, color: "#9C2B4E", fontWeight: 700, marginTop: 4, display: "block" }}>
                    ⚠️ Harap lengkapi semua kolom yang ditandai merah terlebih dahulu!
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {localCustomEvents.map((ev: any) => {
                  const isEditing = editingEvId === ev.id;
                  if (isEditing) {
                    return (
                      <div className="fade-in" key={ev.id} style={{ background: "white", padding: 20, borderRadius: 20, display: "flex", flexDirection: "column", gap: 12, border: editEventAttempted && (!editEvName.trim() || !editEvStart || !editEvEnd) ? "2px solid #9C2B4E" : `2px solid ${editEvColor}AA`, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                        <input 
                          type="text" 
                          value={editEvName} 
                          onChange={(e: any) => setEditEvName(e.target.value)} 
                          placeholder="Nama Event" 
                          style={I({
                            border: editEventAttempted && !editEvName.trim() ? "2px solid #9C2B4E" : "1px solid rgba(44,32,22,0.15)",
                            background: editEventAttempted && !editEvName.trim() ? "#FDF5F8" : "white", fontSize: 14
                          })} 
                        />
                        <div style={{ display: "flex", gap: 12 }}>
                           <div style={{flex: 1}}>
                             <label style={{fontSize:11, fontWeight:700, marginBottom:6, display:"block", color: editEventAttempted && !editEvStart ? "#9C2B4E" : "var(--theme-primary)"}}>Start Date {editEventAttempted && !editEvStart && "*"}</label>
                             <input 
                               type="date" 
                               value={editEvStart} 
                               onChange={(e: any) => setEditEvStart(e.target.value)} 
                               style={I({
                                 fontSize:13, 
                                 padding:10,
                                 border: editEventAttempted && !editEvStart ? "2px solid #9C2B4E" : "1px solid rgba(44,32,22,0.15)",
                                 background: editEventAttempted && !editEvStart ? "#FDF5F8" : "white"
                               })} 
                             />
                           </div>
                           <div style={{flex: 1}}>
                             <label style={{fontSize:11, fontWeight:700, marginBottom:6, display:"block", color: editEventAttempted && !editEvEnd ? "#9C2B4E" : "var(--theme-primary)"}}>End Date {editEventAttempted && !editEvEnd && "*"}</label>
                             <input 
                               type="date" 
                               value={editEvEnd} 
                               onChange={(e: any) => setEditEvEnd(e.target.value)} 
                               style={I({
                                 fontSize:13, 
                                 padding:10,
                                 border: editEventAttempted && !editEvEnd ? "2px solid #9C2B4E" : "1px solid rgba(44,32,22,0.15)",
                                 background: editEventAttempted && !editEvEnd ? "#FDF5F8" : "white"
                               })} 
                             />
                           </div>
                           <div style={{flex: 0}}>
                             <label style={{fontSize:11, fontWeight:700, marginBottom:6, display:"block", color:"var(--theme-primary)"}}>Color</label>
                             <ColorPickerSelect value={editEvColor} onChange={(val) => setEditEvColor(val)} />
                           </div>
                        </div>
                        <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer", color:"#2C2016", fontWeight: 600}}>
                           <input type="checkbox" checked={editEvMonthly} onChange={e=>setEditEvMonthly(e.target.checked)} style={{width: 18, height: 18, accentColor: "var(--theme-primary)"}} />
                           Ulangi Setiap Bulan (Berdasarkan Tgl)
                        </label>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                          <button onClick={() => setEditingEvId(null)} style={{ ...B(false), fontSize: 13, padding: "8px 16px", height: "auto", borderRadius: 10 }}>{lang === 'id' ? 'Batal' : 'Cancel'}</button>
                          <button onClick={() => saveEditedCustomEvent(ev.id)} style={{ ...B(true, "var(--theme-primary)"), fontSize: 13, padding: "8px 24px", height: "auto", borderRadius: 10, color: "white", border: "none", fontWeight: 800 }}>{lang === 'id' ? 'Simpan' : 'Save'}</button>
                        </div>
                        {editEventAttempted && (!editEvName.trim() || !editEvStart || !editEvEnd) && (
                          <span style={{ fontSize: 11, color: "#9C2B4E", fontWeight: 700, marginTop: 4, display: "block" }}>
                            ⚠️ Harap lengkapi semua kolom edit yang ditandai merah sebelum menyimpan!
                          </span>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="hover-scale" key={ev.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", padding: "14px 18px", borderRadius: 16, border:`1.5px solid ${ev.color}44`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{width:14, height:14, borderRadius:"50%", background:ev.color, boxShadow:`0 0 12px ${ev.color}88` }} />
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, color:"#2C2016" }}>{ev.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(44,32,22,0.6)", marginTop: 2, fontWeight: 500 }}>
                            {ev.start} s/d {ev.end} {ev.monthly && <span style={{color: "var(--theme-primary)", fontWeight: 700}}>• (Bulanan)</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEditCustomEvent(ev)} style={{ background: "rgba(44,32,22,0.05)", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", color: "#2C2016", fontWeight: 700 }} className="hover:bg-black/10">{lang === "id" ? "Edit" : "Edit"}</button>
                        <button onClick={() => delCustomEvent(ev.id)} style={{ background: "rgba(156,43,78,0.05)", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", color: "#9C2B4E", fontWeight: 700 }} className="hover:bg-[#9C2B4E] hover:text-white transition-colors">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                      </div>
                    </div>
                  );
                })}
                {localCustomEvents.length === 0 && <div style={{padding:40, textAlign:"center", fontSize:13, fontWeight: 500, color:"rgba(44,32,22,0.3)", border: "1px dashed rgba(44,32,22,0.1)", borderRadius: 16 }}>Belum ada event kustom.</div>}
              </div>
            </div>
          )}
          {section === "workspace" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("workspace", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'Manajemen Workspace' : 'Workspace Management'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0", maxWidth: 500 }}>{lang === 'id' ? 'Kelola status Anda di workspace ini. Anda dapat keluar dari workspace jika diundang, atau menghapus workspace jika Anda adalah pemiliknya.' : 'Manage your status in this workspace. You can leave the workspace if you were invited, or delete the workspace if you are the owner.'}</p>
                </div>
              </div>
              
              <div style={{ background: "#FDF5F8", border: "1.5px solid rgba(156,43,78,0.15)", borderRadius: 20, padding: 24, boxShadow: "0 4px 12px rgba(156,43,78,0.05)", marginTop: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "#9C2B4E", marginBottom: 8 }}>{isOwner ? lang === "id" ? "Hapus Workspace Ini" : "Delete This Workspace" : lang === "id" ? "Tinggalkan Workspace Ini" : "Leave This Workspace"}</h4>
                <p style={{ fontSize: 13, color: "rgba(156,43,78,0.7)", marginBottom: 24, lineHeight: 1.5 }}>
                  {isOwner 
                    ? "Menghapus workspace akan menghilangkan seluruh data konten, platform, dan anggota di dalamnya secara permanen. Tindakan ini tidak dapat dibatalkan!" 
                    : "Anda akan kehilangan akses ke seluruh konten dan pengaturan di workspace ini. Anda harus diundang kembali oleh pemilik untuk mendapatkan akses lagi."}
                </p>
                
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button 
                    onClick={isOwner ? onDelete : onLeave}
                    className="hover-scale"
                    style={{ 
                      ...B(true, "#9C2B4E"), 
                      padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 800, background: "#9C2B4E", border: "none", color: "white"
                    }}
                  >
                    {isOwner ? lang === "id" ? "Hapus Workspace" : "Delete Workspace" : lang === "id" ? "Tinggalkan Workspace" : "Leave Workspace"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {section === "general" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("general", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>{lang === 'id' ? 'General & Debug' : 'General & Debug'}</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>{lang === 'id' ? 'Pengaturan lanjutan dan alat pengembangan' : 'Advanced settings and development tools'}</p>
                </div>
              </div>
              
              <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid rgba(44,32,22,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                   <div style={{marginTop: 2, color: "var(--theme-primary)", display: "flex", alignItems: "center"}}><Cloud size={18} /></div>
                   <div>
                     <strong style={{ fontSize: 14, color: "#2C2016", display: "block", marginBottom: 4 }}>" + (lang === 'id' ? 'Sinkronisasi Cloud Firestore' : 'Cloud Firestore Sync') + "</strong>
                     <p style={{ fontSize: 13, color: "rgba(44,32,22,0.6)", margin: 0, lineHeight: 1.5 }}>" + (lang === 'id' ? 'Setiap perubahan yang Anda buat disinkronkan secara aman ke Google Firebase Cloud Firestore setelah Anda menekan tombol simpan.' : 'Every change you make is securely synced to Google Firebase Cloud Firestore after you press the save button.') + "</p>
                   </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "var(--theme-primary)08", padding: 16, borderRadius: 12, border: "1px dashed var(--theme-primary)44" }}>
                    <h4 style={{ fontSize: 14, margin: "0 0 6px", color: "var(--theme-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ display: "flex", alignItems: "center" }}><FlaskConical size={16} /></span> Testing Mode
                    </h4>
                    <p style={{ fontSize: 12, color: "rgba(44,32,22,0.6)", marginBottom: 14, lineHeight: 1.4 }}>" + (lang === 'id' ? 'Gunakan data dummy untuk melihat bagaimana dashboard ini bekerja dengan banyak data. Berguna untuk menguji performa dan tampilan.' : 'Use dummy data to see how this dashboard works with large amounts of data. Useful for testing performance and layout.') + "</p>
                    <button onClick={onSeed} className="hover-scale" style={{ ...B(false), background: "var(--theme-primary)", color: "white", border: "none", fontWeight: 700, padding: "10px 20px", borderRadius: 10 }}>" + (lang === 'id' ? '✨ Generate Data Dummy (Seed)' : '✨ Generate Dummy Data (Seed)') + "</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {pendingSection && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: 32, borderRadius: 24, width: 380, textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#2C2016", marginBottom: 12 }}>{lang === 'id' ? 'Simpan Perubahan?' : 'Save Changes?'}</h3>
            <p style={{ fontSize: 14, color: "rgba(44,32,22,0.6)", marginBottom: 24, lineHeight: 1.5 }}>{lang === 'id' ? 'Ada perubahan yang belum disimpan. Ingin menyimpannya sekarang sebelum pindah bagian?' : 'There are unsaved changes. Do you want to save them now before leaving this section?'}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => setPendingSection(null)} style={{ ...B(true, "#2C2016"), width: "100%", height: 48, borderRadius: 12 }}>{lang === 'id' ? 'Tetap di Sini' : 'Stay Here'}</button>
              <button onClick={() => { setSection(pendingSection); setPendingSection(null); }} style={{ background: "none", border: "none", color: "#9C2B4E", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "10px" }}>{lang === 'id' ? 'Tinggalkan Tanpa Menyimpan' : 'Leave without Saving'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
