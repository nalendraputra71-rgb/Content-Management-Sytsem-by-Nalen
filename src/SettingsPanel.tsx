import { useState, useEffect } from "react";
import { I, B, CARD } from "./data";
import { Save, CheckCircle2 } from "lucide-react";

export function SettingsPanel({ initialSettings, onSave, onSeed, isRestricted }: any) {
  const [section, setSection] = useState("pillars");
  
  // Local state for all settings
  const [localPillars, setLocalPillars] = useState(initialSettings.pillars || []);
  const [localPlatforms, setLocalPlatforms] = useState(initialSettings.platforms || []);
  const [localPics, setLocalPics] = useState(initialSettings.pics || []);
  const [localStatuses, setLocalStatuses] = useState(initialSettings.statuses || []);
  const [localHolidays, setLocalHolidays] = useState(initialSettings.holidays || {});

  const [newVal, setNewVal] = useState("");
  const [newColor, setNewColor] = useState("#C4622D");
  const [newHKey, setNewHKey] = useState("");
  const [newHVal, setNewHVal] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync if initialSettings change (e.g. workspace switch)
  useEffect(() => {
    setLocalPillars(initialSettings.pillars || []);
    setLocalPlatforms(initialSettings.platforms || []);
    setLocalPics(initialSettings.pics || []);
    setLocalStatuses(initialSettings.statuses || []);
    setLocalHolidays(initialSettings.holidays || {});
    setSaveSuccess(false);
  }, [initialSettings]);

  const sections = [
    ["pillars", "Content Pillars", "🎨"],
    ["platforms", "Platforms", "📱"],
    ["pics", "Team PIC", "👤"],
    ["statuses", "Status Workflow", "📋"],
    ["holidays", "Hari Besar", "📅"],
    ["general", "General & Debug", "⚙️"]
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSave({
        pillars: localPillars,
        platforms: localPlatforms,
        pics: localPics,
        statuses: localStatuses,
        holidays: localHolidays
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

  const addHoliday = () => { if (!newHKey.trim() || !newHVal.trim()) return; setLocalHolidays((h: any) => ({ ...h, [newHKey]: newHVal })); setNewHKey(""); setNewHVal(""); };
  const delHoliday = (k: any) => setLocalHolidays((h: any) => { const n = { ...h }; delete n[k]; return n; });

  const InputRow = ({ placeholder, value, onChange, onAdd, colorPicker }: any) => (
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      {colorPicker && <input type="color" value={newColor} onChange={(e: any) => setNewColor(e.target.value)} style={{ width: 36, height: 36, border: "1.5px solid rgba(44,32,22,0.15)", borderRadius: 6, cursor: "pointer", padding: 2 }} />}
      <input value={value} onChange={(e: any) => onChange(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && onAdd()} placeholder={placeholder} style={I({ flex: 1 })} />
      <button onClick={onAdd} className="hover-scale" style={{ ...B(true, "#C4622D"), padding: "7px 14px", fontWeight: 600 }}>+ Tambah</button>
    </div>
  );

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
              ...B(true, saveSuccess ? "#2D7A5E" : "#C4622D"), 
              display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 24, fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer" 
            }}
          >
            <Save size={18} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, minHeight: 400 }}>
        <div style={{ background: "white", borderRadius: 12, padding: "12px 0", boxShadow: "0 1px 4px rgba(44,32,22,0.08)", height: "fit-content" }}>
          {sections.map(([id, label, ic]) => (
            <button key={id} onClick={() => setSection(id)} style={{ width: "100%", padding: "10px 16px", textAlign: "left", border: "none", borderLeft: `3px solid ${section === id ? "#C4622D" : "transparent"}`, background: section === id ? "#FDF0EB" : "transparent", cursor: "pointer", fontSize: 13, fontWeight: section === id ? 600 : 400, color: "#2C2016", display: "flex", alignItems: "center", gap: 8 }}>
              <span>{ic}</span>{label}
            </button>
          ))}
        </div>
        <div style={CARD()}>
          {section === "pillars" && (
            <>
              <h3 style={{ fontSize: 18, margin: "0 0 14px" }}>🎨 Content Pillars</h3>
              {localPillars.map((p: any, i: any) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#FAFAF8", borderRadius: 8, marginBottom: 6 }}>
                  <input type="color" value={p.color} onChange={(e: any) => editPillar(i, p.name, e.target.value)} title="Warna Pillar" style={{ width: 24, height: 24, padding: 0, border: "none", cursor: "pointer" }} />
                  <input value={p.name} onChange={(e: any) => editPillar(i, e.target.value, p.color)} style={{ flex: 1, fontSize: 13, fontWeight: 500, border: "none", background: "transparent", outline: "none" }} />
                  <button onClick={() => delPillar(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#9C2B4E", }}>Hapus</button>
                </div>
              ))}
              <InputRow placeholder="Nama pillar baru..." value={newVal} onChange={setNewVal} onAdd={addPillar} colorPicker />
            </>
          )}
          {section === "platforms" && (
            <>
              <h3 style={{ fontSize: 18, margin: "0 0 14px" }}>📱 Platforms</h3>
              {localPlatforms.map((p: any, i: any) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#FAFAF8", borderRadius: 8, marginBottom: 6 }}>
                  <input type="color" value={p.color} onChange={(e: any) => editPlatform(i, p.name, e.target.value)} title="Warna Platform" style={{ width: 24, height: 24, padding: 0, border: "none", cursor: "pointer" }} />
                  <input value={p.name} onChange={(e: any) => editPlatform(i, e.target.value, p.color)} style={{ flex: 1, fontSize: 13, fontWeight: 500, border: "none", background: "transparent", outline: "none" }} />
                  <button onClick={() => delPlatform(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#9C2B4E", }}>Hapus</button>
                </div>
              ))}
              <InputRow placeholder="Nama platform baru..." value={newVal} onChange={setNewVal} onAdd={addPlatform} colorPicker />
            </>
          )}
          {section === "pics" && (
            <>
              <h3 style={{ fontSize: 18, margin: "0 0 14px" }}>👤 Team PIC</h3>
              {localPics.map((p: any, i: any) => {
                const name = typeof p === 'string' ? p : p.name;
                const color = typeof p === 'string' ? "#C4622D" : p.color;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#FAFAF8", borderRadius: 8, marginBottom: 6 }}>
                    <input type="color" value={color} onChange={(e: any) => editPic(i, name, e.target.value)} title="Warna PIC" style={{ width: 24, height: 24, padding: 0, border: "none", cursor: "pointer" }} />
                    <input value={name} onChange={(e: any) => editPic(i, e.target.value, color)} style={{ flex: 1, fontSize: 13, fontWeight: 500, border: "none", background: "transparent", outline: "none" }} />
                    <button onClick={() => delPic(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#9C2B4E", }}>Hapus</button>
                  </div>
                );
              })}
              <InputRow placeholder="Nama PIC baru..." value={newVal} onChange={setNewVal} onAdd={addPic} colorPicker />
            </>
          )}
          {section === "statuses" && (
            <>
              <h3 style={{ fontSize: 18, margin: "0 0 14px" }}>📋 Status Workflow</h3>
              <div style={{ fontSize: 11, color: "rgba(44,32,22,0.4)", marginBottom: 10 }}>Urutan dari atas ke bawah = alur kerja</div>
              {localStatuses.map((s: any, i: any) => {
                const name = typeof s === 'string' ? s : s.name;
                const color = typeof s === 'string' ? "#C4622D" : s.color;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#FAFAF8", borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "rgba(44,32,22,0.3)" }}>{i + 1}.</span>
                    <input type="color" value={color} onChange={(e: any) => editStatus(i, name, e.target.value)} title="Warna Status" style={{ width: 24, height: 24, padding: 0, border: "none", cursor: "pointer" }} />
                    <input value={name} onChange={(e: any) => editStatus(i, e.target.value, color)} style={{ flex: 1, background: color + "15", color: color, fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 8, border: "none", outline: "none", maxWidth: "fit-content" }} />
                    <button onClick={() => delStatus(i)} style={{ background: "#FDF5F8", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "#9C2B4E", }}>Hapus</button>
                  </div>
                );
              })}
              <InputRow placeholder="Status baru (e.g. In Review)..." value={newVal} onChange={setNewVal} onAdd={addStatus} colorPicker />
            </>
          )}
          {section === "holidays" && (
            <>
              <h3 style={{ fontSize: 18, margin: "0 0 14px" }}>📅 Hari Besar & Event</h3>
              <div style={{ fontSize: 11, color: "rgba(44,32,22,0.4)", marginBottom: 10 }}>Format key: YYYY-M-D (contoh: 2026-8-17)</div>
              <div style={{ maxHeight: 280, overflow: "auto", display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                {Object.entries(localHolidays).sort().map(([k, v]: any) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "#FAFAF8", borderRadius: 8 }}>
                    <span style={{ fontSize: 10, color: "rgba(44,32,22,0.4)", fontFamily: "monospace", flexShrink: 0 }}>{k}</span>
                    <span style={{ flex: 1, fontSize: 12 }}>{v}</span>
                    <button onClick={() => delHoliday(k)} style={{ background: "#FDF5F8", border: "none", borderRadius: 6, padding: "2px 7px", fontSize: 10, cursor: "pointer", color: "#9C2B4E", }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={newHKey} onChange={(e: any) => setNewHKey(e.target.value)} placeholder="YYYY-M-D" style={I({ width: 130, flex: "none" })} />
                <input value={newHVal} onChange={(e: any) => setNewHVal(e.target.value)} placeholder="🎉 Nama Event" style={I({ flex: 1 })} />
                <button onClick={addHoliday} className="hover-scale" style={{ ...B(true, "#C4622D"), padding: "7px 14px", fontWeight: 600 }}>+ Tambah</button>
              </div>
            </>
          )}
          {section === "general" && (
            <>
              <h3 style={{ fontSize: 18, margin: "0 0 14px" }}>⚙️ General & Debug</h3>
              <div style={{ background: "#FAFAF8", borderRadius: 10, padding: 16, border: "1px solid rgba(44,32,22,0.06)" }}>
                <p style={{ fontSize: 13, color: "#2C2016", marginBottom: 12 }}><strong>Penyimpanan Data:</strong> Data Anda disinkronkan ke Google Firebase Cloud Firestore setelah Anda menekan tombol simpan.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: "#FDF0EB", padding: 12, borderRadius: 8, border: "1px solid rgba(196,98,45,0.15)" }}>
                    <h4 style={{ fontSize: 12, margin: "0 0 6px", color: "#C4622D" }}>🧪 Testing Mode</h4>
                    <p style={{ fontSize: 11, color: "rgba(44,32,22,0.6)", marginBottom: 10 }}>Gunakan data dummy untuk melihat bagaimana dashboard ini bekerja dengan banyak data.</p>
                    <button onClick={onSeed} style={{ ...B(false), background: "#C4622D", color: "white", border: "none", fontWeight: 700, padding: "8px 16px" }}>✨ Generate Data Dummy (Seed)</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
