import { useState, useEffect } from "react";
import { I, B, CARD, THEMES } from "./data";
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
  Trash2
} from "lucide-react";

function getSectionIcon(id: string, size = 16) {
  switch (id) {
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
  { id: "id-skb", name: "Indonesia - SKB 3 Menteri (Lengkap Hari Raya Islam & Cuti Bersama)", country: "ID", color: "#E11D48", isCustomApi: true },
  { id: "id", name: "Indonesia (Hari Libur Utama - Nager.Date)", country: "ID", color: "#EF4444" },
  { id: "us", name: "United States (US Holidays)", country: "US", color: "#2563EB" },
  { id: "sg", name: "Singapore (SG Holidays)", country: "SG", color: "#059669" },
  { id: "my", name: "Malaysia (MY Holidays)", country: "MY", color: "#D97706" },
  { id: "jp", name: "Japan (JP Holidays)", country: "JP", color: "#7C3AED" },
  { id: "gb", name: "United Kingdom (UK Holidays)", country: "GB", color: "#0891B2" },
];

export function SettingsPanel({ initialSettings, onSave, onSeed, isRestricted, profile, onUpdateProfile, onDirty, onLeave, onDelete, isOwner }: any) {
  const [section, setSection] = useState("visual");
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  
  // Local state for all settings
  const [localPillars, setLocalPillars] = useState(initialSettings.pillars || []);
  const [localPlatforms, setLocalPlatforms] = useState(initialSettings.platforms || []);
  const [localPics, setLocalPics] = useState(initialSettings.pics || []);
  const [localStatuses, setLocalStatuses] = useState(initialSettings.statuses || []);
  const [localHolidays, setLocalHolidays] = useState(initialSettings.holidays || {});
  const [localHolidayApis, setLocalHolidayApis] = useState(initialSettings.holidayApis || []);
  const [localCustomEvents, setLocalCustomEvents] = useState(initialSettings.customEvents || []);

  const [newVal, setNewVal] = useState("");
  const [newColor, setNewColor] = useState("#C4622D");
  const [newHKey, setNewHKey] = useState("");
  const [newHVal, setNewHVal] = useState("");

  const [newEvName, setNewEvName] = useState("");
  const [newEvColor, setNewEvColor] = useState("#C4622D");
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
                  JSON.stringify(localPics) !== JSON.stringify(initialSettings.pics || []) ||
                  JSON.stringify(localStatuses) !== JSON.stringify(initialSettings.statuses || []) ||
                  JSON.stringify(localHolidays) !== JSON.stringify(initialSettings.holidays || {}) ||
                  JSON.stringify(localHolidayApis) !== JSON.stringify(initialSettings.holidayApis || []) ||
                  JSON.stringify(localCustomEvents) !== JSON.stringify(initialSettings.customEvents || []);

  useEffect(() => {
    onDirty?.(isDirty);
  }, [isDirty, onDirty]);

  // Sync if initialSettings change (e.g. workspace switch strictly from backend)
  useEffect(() => {
    setLocalPillars(initialSettings.pillars || []);
    setLocalPlatforms(initialSettings.platforms || []);
    setLocalPics(initialSettings.pics || []);
    setLocalStatuses(initialSettings.statuses || []);
    setLocalHolidays(initialSettings.holidays || {});
    setLocalHolidayApis(initialSettings.holidayApis || []);
    setLocalCustomEvents(initialSettings.customEvents || []);
    setSaveSuccess(false);
  }, [JSON.stringify(initialSettings)]);

  const sections = [
    ["visual", "Tema Visual"],
    ["pillars", "Content Pillars"],
    ["platforms", "Platforms"],
    ["pics", "Team PIC"],
    ["statuses", "Status Workflow"],
    ["holidays", "Hari Besar"],
    ["customEvents", "Event Kustom"],
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
      await onSave({
        pillars: localPillars,
        platforms: localPlatforms,
        pics: localPics,
        statuses: localStatuses,
        holidays: localHolidays,
        holidayApis: localHolidayApis,
        customEvents: localCustomEvents
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
    setNewVal(""); setNewColor("#C4622D");
  };
  const editPillar = (i: any, name: any, color: any) => setLocalPillars((p: any) => p.map((x: any, idx: any) => idx === i ? { name, color, light: color + "22" } : x));
  const delPillar = (i: any) => setLocalPillars((p: any) => p.filter((_: any, idx: any) => idx !== i));

  const addPlatform = () => { if (!newVal.trim()) return; setLocalPlatforms((p: any) => [...p, { name: newVal.trim(), color: newColor }]); setNewVal(""); };
  const editPlatform = (i: any, name: any, color: any) => setLocalPlatforms((p: any) => p.map((x: any, idx: any) => idx === i ? { name, color } : x));
  const delPlatform = (i: any) => setLocalPlatforms((p: any) => p.filter((_: any, idx: any) => idx !== i));

  const addPic = () => { if (!newVal.trim()) return; setLocalPics((p: any) => [...p, { name: newVal.trim(), color: newColor }]); setNewVal(""); };
  const editPic = (i: any, name: any, color: any) => setLocalPics((p: any) => p.map((x: any, idx: any) => idx === i ? { name, color } : x));
  const delPic = (i: any) => setLocalPics((p: any) => p.filter((_: any, idx: any) => idx !== i));

  const addStatus = () => { if (!newVal.trim()) return; setLocalStatuses((s: any) => [...s, { name: newVal.trim(), color: newColor }]); setNewVal(""); };
  const editStatus = (i: any, name: any, color: any) => setLocalStatuses((p: any) => p.map((x: any, idx: any) => idx === i ? { name, color } : x));
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
    setEditEvColor(ev.color || "#C4622D");
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
      {colorPicker && <div style={{width: 36, height: 36, borderRadius: 10, overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", flexShrink: 0}}><input type="color" value={newColor} onChange={(e: any) => setNewColor(e.target.value)} style={{ width: "200%", height: "200%", transform: "translate(-25%, -25%)", border: "none", cursor: "pointer", background: "none" }} /></div>}
      <input value={value} onChange={(e: any) => onChange(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && onAdd()} placeholder={placeholder} style={I({ flex: 1, border: "none", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontSize: 14 })} />
      <button onClick={onAdd} className="hover-scale" style={{ ...B(true, "var(--theme-primary)"), padding: "0 20px", height: 42, fontWeight: 700, borderRadius: 12, border: "none", color: "white" }}>Tambah</button>
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
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#2C2016" }}>Pengaturan Workspace</h2>
          <p style={{ fontSize: 11, color: "rgba(44,32,22,0.4)", margin: 0, fontWeight: 600 }}>Ubah kategori, platform, PIC, dan event khusus.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saveSuccess && (
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#2D7A5E" }}>
              <CheckCircle2 size={16} /> Tersimpan
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
            <Save size={18} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
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
          {section === "visual" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("visual", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>Tema Visual Profesional</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>Pilih salah satu dari 10 tema warna profesional untuk aplikasi Anda. Tema ini berlaku secara global.</p>
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
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>Content Pillars</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>Kategori konten utama untuk strategi Anda</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localPillars.map((p: any, i: any) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.05)", boxShadow: "0 2px 8px rgba(44,32,22,0.02)", transition: "all 0.2s" }} className="hover:border-[var(--theme-primary)44]">
                  <div style={{width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", flexShrink: 0}}><input type="color" value={p.color} onChange={(e: any) => editPillar(i, p.name, e.target.value)} title="Warna Pillar" style={{ width: "200%", height: "200%", transform: "translate(-25%, -25%)", border: "none", cursor: "pointer" }} /></div>
                  <input value={p.name} onChange={(e: any) => editPillar(i, e.target.value, p.color)} style={{ flex: 1, fontSize: 14, fontWeight: 600, border: "none", background: "transparent", outline: "none", color: "#2C2016" }} />
                  <button onClick={() => delPillar(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9C2B4E", transition: "all 0.2s" }} className="hover:bg-[#9C2B4E] hover:text-white">Hapus</button>
                </div>
              ))}
              </div>
              {renderInputRow("Nama pillar baru...", newVal, setNewVal, addPillar, true)}
            </div>
          )}
          {section === "platforms" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("platforms", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>Platforms</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>Saluran distribusi konten Anda</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localPlatforms.map((p: any, i: any) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.05)", boxShadow: "0 2px 8px rgba(44,32,22,0.02)", transition: "all 0.2s" }} className="hover:border-[var(--theme-primary)44]">
                  <div style={{width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", flexShrink: 0}}><input type="color" value={p.color} onChange={(e: any) => editPlatform(i, p.name, e.target.value)} title="Warna Platform" style={{ width: "200%", height: "200%", transform: "translate(-25%, -25%)", border: "none", cursor: "pointer" }} /></div>
                  <input value={p.name} onChange={(e: any) => editPlatform(i, e.target.value, p.color)} style={{ flex: 1, fontSize: 14, fontWeight: 600, border: "none", background: "transparent", outline: "none", color: "#2C2016" }} />
                  <button onClick={() => delPlatform(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9C2B4E", transition: "all 0.2s" }} className="hover:bg-[#9C2B4E] hover:text-white">Hapus</button>
                </div>
              ))}
              </div>
              {renderInputRow("Nama platform baru...", newVal, setNewVal, addPlatform, true)}
            </div>
          )}
          {section === "pics" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("pics", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>Team PIC</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>Anggota tim yang bertanggung jawab (Person In Charge)</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localPics.map((p: any, i: any) => {
                const name = typeof p === 'string' ? p : p.name;
                const color = typeof p === 'string' ? "var(--theme-primary)" : p.color;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.05)", boxShadow: "0 2px 8px rgba(44,32,22,0.02)", transition: "all 0.2s" }} className="hover:border-[var(--theme-primary)44]">
                    <div style={{width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", flexShrink: 0}}><input type="color" value={color} onChange={(e: any) => editPic(i, name, e.target.value)} title="Warna PIC" style={{ width: "200%", height: "200%", transform: "translate(-25%, -25%)", border: "none", cursor: "pointer" }} /></div>
                    <input value={name} onChange={(e: any) => editPic(i, e.target.value, color)} style={{ flex: 1, fontSize: 14, fontWeight: 600, border: "none", background: "transparent", outline: "none", color: "#2C2016" }} />
                    <button onClick={() => delPic(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9C2B4E", transition: "all 0.2s" }} className="hover:bg-[#9C2B4E] hover:text-white">Hapus</button>
                  </div>
                );
              })}
              </div>
              {renderInputRow("Nama PIC baru...", newVal, setNewVal, addPic, true)}
            </div>
          )}
          {section === "statuses" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("statuses", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>Status Workflow</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>Urutan dari atas ke bawah = alur kerja</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {localStatuses.map((s: any, i: any) => {
                const name = typeof s === 'string' ? s : s.name;
                const color = typeof s === 'string' ? "var(--theme-primary)" : s.color;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 12, border: "1px solid rgba(44,32,22,0.05)", boxShadow: "0 2px 8px rgba(44,32,22,0.02)", transition: "all 0.2s" }} className="hover:border-[var(--theme-primary)44]">
                    <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(44,32,22,0.3)", width: 24, textAlign: "center" }}>{i + 1}.</span>
                    <div style={{width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", flexShrink: 0}}><input type="color" value={color} onChange={(e: any) => editStatus(i, name, e.target.value)} title="Warna Status" style={{ width: "200%", height: "200%", transform: "translate(-25%, -25%)", border: "none", cursor: "pointer" }} /></div>
                    <input value={name} onChange={(e: any) => editStatus(i, e.target.value, color)} style={{ flex: 1, background: color + "15", color: color, fontSize: 13, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", outline: "none", maxWidth: "fit-content" }} />
                    <div style={{flex: 1}} />
                    <button onClick={() => delStatus(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9C2B4E", transition: "all 0.2s" }} className="hover:bg-[#9C2B4E] hover:text-white">Hapus</button>
                  </div>
                );
              })}
              </div>
              {renderInputRow("Status baru (e.g. In Review)...", newVal, setNewVal, addStatus, true)}
            </div>
          )}
          {section === "holidays" && (
            <div className="fade-in">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--theme-primary)22", padding: 10, borderRadius: 12, color: "var(--theme-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {getSectionIcon("holidays", 20)}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>Hari Besar & Event Tahunan</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>Kelola hari libur otomatis (via API) atau tambahkan hari besar kustom Anda sendiri.</p>
                </div>
              </div>

              {/* Integrasi API Hari Besar Gratis */}
              <div style={{ background: "rgba(44,32,22,0.03)", border: "1px solid rgba(44,32,22,0.08)", borderRadius: 16, padding: 18, marginBottom: 24, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.01)" }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px", color: "var(--theme-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                  🔌 Sinkronisasi Kalender Hari Libur Otomatis
                </h4>
                <p style={{ fontSize: 11, color: "rgba(44,32,22,0.6)", margin: "0 0 14px", lineHeight: 1.4 }}>
                  Pilih kalender hari libur nasional resmi untuk ditampilkan otomatis di dashboard dan sistem kalender mingguan/bulanan Anda. Bisa diaktifkan bersamaan.
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
                <h4 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "#2C2016" }}>📋 Daftar Hari Besar Kustom</h4>
                <span style={{ fontSize: 11, color: "rgba(44,32,22,0.4)" }}>{sortedHolidays.length} Kustom terdaftar</span>
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
                      title="Hapus"
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
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--theme-primary)" }}>Pilih Tanggal</label>
                  <input 
                    type="date" 
                    value={newHKey} 
                    onChange={(e: any) => setNewHKey(e.target.value)} 
                    style={I({ border: "1px solid rgba(44,32,22,0.1)", background: "white", padding: "8px 10px", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.02)", fontSize: 13, height: 38, width: "100%" })} 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--theme-primary)" }}>Nama Hari Besar / Event</label>
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
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>Event Kustom & Promo</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>Misal: Pay Day Sale, Twin Date, atau Peluncuran Produk.</p>
                </div>
              </div>
              
              <div style={{ background: "var(--theme-primary)08", padding: 20, borderRadius: 20, display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, border: addEventAttempted && (!newEvName.trim() || !newEvStart || !newEvEnd) ? "2px solid #9C2B4E" : "1px dashed var(--theme-primary)44" }}>
                <input 
                  type="text" 
                  value={newEvName} 
                  onChange={(e: any) => setNewEvName(e.target.value)} 
                  placeholder="Nama Event (e.g., Payday Sale)" 
                  style={I({
                    borderColor: addEventAttempted && !newEvName.trim() ? "#9C2B4E" : "rgba(44,32,22,0.1)",
                    borderWidth: addEventAttempted && !newEvName.trim() ? "2px" : "1px",
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
                         borderColor: addEventAttempted && !newEvStart ? "#9C2B4E" : "rgba(44,32,22,0.1)",
                         borderWidth: addEventAttempted && !newEvStart ? "2px" : "1px",
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
                         borderColor: addEventAttempted && !newEvEnd ? "#9C2B4E" : "rgba(44,32,22,0.1)",
                         borderWidth: addEventAttempted && !newEvEnd ? "2px" : "1px",
                         background: addEventAttempted && !newEvEnd ? "#FDF5F8" : "white",
                         boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                       })} 
                     />
                   </div>
                   <div style={{flex: 0}}>
                     <label style={{fontSize:11, fontWeight:700, marginBottom:6, display:"block", color:"var(--theme-primary)"}}>Color</label>
                     <div style={{width: 44, height: 44, borderRadius: 12, overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", flexShrink: 0}}>
                       <input type="color" value={newEvColor} onChange={(e: any) => setNewEvColor(e.target.value)} style={{ width: "200%", height: "200%", transform: "translate(-25%, -25%)", border: "none", cursor: "pointer", background:"none" }} />
                     </div>
                   </div>
                </div>
                <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer", color:"#2C2016", fontWeight: 600}}>
                   <input type="checkbox" checked={newEvMonthly} onChange={e=>setNewEvMonthly(e.target.checked)} style={{width: 18, height: 18, accentColor: "var(--theme-primary)"}} />
                   Ulangi Setiap Bulan (Berdasarkan Tgl)
                </label>
                <button className="hover-scale" onClick={addCustomEvent} style={{ ...B(true, "var(--theme-primary)"), height: 44, borderRadius: 12, fontSize:14, fontWeight: 800, marginTop: 4, color: "white", border: "none" }}>Tambah Event Kustom</button>
                
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
                            borderColor: editEventAttempted && !editEvName.trim() ? "#9C2B4E" : "rgba(44,32,22,0.15)",
                            borderWidth: editEventAttempted && !editEvName.trim() ? "2px" : "1px",
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
                                 borderColor: editEventAttempted && !editEvStart ? "#9C2B4E" : "rgba(44,32,22,0.15)",
                                 borderWidth: editEventAttempted && !editEvStart ? "2px" : "1px",
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
                                 borderColor: editEventAttempted && !editEvEnd ? "#9C2B4E" : "rgba(44,32,22,0.15)",
                                 borderWidth: editEventAttempted && !editEvEnd ? "2px" : "1px",
                                 background: editEventAttempted && !editEvEnd ? "#FDF5F8" : "white"
                               })} 
                             />
                           </div>
                           <div style={{flex: 0}}>
                             <label style={{fontSize:11, fontWeight:700, marginBottom:6, display:"block", color:"var(--theme-primary)"}}>Color</label>
                             <div style={{width: 44, height: 44, borderRadius: 12, overflow: "hidden", border: "2px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", flexShrink: 0}}>
                               <input type="color" value={editEvColor} onChange={(e: any) => setEditEvColor(e.target.value)} style={{ width: "200%", height: "200%", transform: "translate(-25%, -25%)", border: "none", cursor: "pointer", background:"none" }} />
                             </div>
                           </div>
                        </div>
                        <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13, cursor:"pointer", color:"#2C2016", fontWeight: 600}}>
                           <input type="checkbox" checked={editEvMonthly} onChange={e=>setEditEvMonthly(e.target.checked)} style={{width: 18, height: 18, accentColor: "var(--theme-primary)"}} />
                           Ulangi Setiap Bulan (Berdasarkan Tgl)
                        </label>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                          <button onClick={() => setEditingEvId(null)} style={{ ...B(false), fontSize: 13, padding: "8px 16px", height: "auto", borderRadius: 10 }}>Batal</button>
                          <button onClick={() => saveEditedCustomEvent(ev.id)} style={{ ...B(true, "var(--theme-primary)"), fontSize: 13, padding: "8px 24px", height: "auto", borderRadius: 10, color: "white", border: "none", fontWeight: 800 }}>Simpan</button>
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
                        <button onClick={() => startEditCustomEvent(ev)} style={{ background: "rgba(44,32,22,0.05)", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", color: "#2C2016", fontWeight: 700 }} className="hover:bg-black/10">Edit</button>
                        <button onClick={() => delCustomEvent(ev.id)} style={{ background: "rgba(156,43,78,0.05)", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", color: "#9C2B4E", fontWeight: 700 }} className="hover:bg-[#9C2B4E] hover:text-white transition-colors">Hapus</button>
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
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>Manajemen Workspace</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0", maxWidth: 500 }}>Kelola status Anda di workspace ini. Anda dapat keluar dari workspace jika diundang, atau menghapus workspace jika Anda adalah pemiliknya.</p>
                </div>
              </div>
              
              <div style={{ background: "#FDF5F8", border: "1.5px solid rgba(156,43,78,0.15)", borderRadius: 20, padding: 24, boxShadow: "0 4px 12px rgba(156,43,78,0.05)", marginTop: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "#9C2B4E", marginBottom: 8 }}>{isOwner ? "Hapus Workspace Ini" : "Tinggalkan Workspace Ini"}</h4>
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
                    {isOwner ? "Hapus Workspace" : "Tinggalkan Workspace"}
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
                  <h3 style={{ fontSize: 18, margin: 0, color: "#2C2016" }}>General & Debug</h3>
                  <p style={{ fontSize: 12, color: "rgba(44,32,22,0.5)", margin: "4px 0 0" }}>Pengaturan lanjutan dan alat pengembangan</p>
                </div>
              </div>
              
              <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid rgba(44,32,22,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                   <div style={{marginTop: 2, color: "var(--theme-primary)", display: "flex", alignItems: "center"}}><Cloud size={18} /></div>
                   <div>
                     <strong style={{ fontSize: 14, color: "#2C2016", display: "block", marginBottom: 4 }}>Sinkronisasi Cloud Firestore</strong>
                     <p style={{ fontSize: 13, color: "rgba(44,32,22,0.6)", margin: 0, lineHeight: 1.5 }}>Setiap perubahan yang Anda buat disinkronkan secara aman ke Google Firebase Cloud Firestore setelah Anda menekan tombol simpan.</p>
                   </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "var(--theme-primary)08", padding: 16, borderRadius: 12, border: "1px dashed var(--theme-primary)44" }}>
                    <h4 style={{ fontSize: 14, margin: "0 0 6px", color: "var(--theme-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ display: "flex", alignItems: "center" }}><FlaskConical size={16} /></span> Testing Mode
                    </h4>
                    <p style={{ fontSize: 12, color: "rgba(44,32,22,0.6)", marginBottom: 14, lineHeight: 1.4 }}>Gunakan data dummy untuk melihat bagaimana dashboard ini bekerja dengan banyak data. Berguna untuk menguji performa dan tampilan.</p>
                    <button onClick={onSeed} className="hover-scale" style={{ ...B(false), background: "var(--theme-primary)", color: "white", border: "none", fontWeight: 700, padding: "10px 20px", borderRadius: 10 }}>✨ Generate Data Dummy (Seed)</button>
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
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#2C2016", marginBottom: 12 }}>Simpan Perubahan?</h3>
            <p style={{ fontSize: 14, color: "rgba(44,32,22,0.6)", marginBottom: 24, lineHeight: 1.5 }}>Ada perubahan yang belum disimpan. Ingin menyimpannya sekarang sebelum pindah bagian?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => setPendingSection(null)} style={{ ...B(true, "#2C2016"), width: "100%", height: 48, borderRadius: 12 }}>Tetap di Sini</button>
              <button onClick={() => { setSection(pendingSection); setPendingSection(null); }} style={{ background: "none", border: "none", color: "#9C2B4E", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "10px" }}>Tinggalkan Tanpa Menyimpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
