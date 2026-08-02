import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, Trash2 } from "lucide-react";
import { ColorPickerSelect } from "./components/ColorPickerSelect";
import { useI18n } from "./i18n";
import { gid, I, B } from "./data";

export function QuickAddEventModal({ workspace, onClose, onSaveSettings, initialEvent }: any) {
  const { lang } = useI18n();
  const [name, setName] = useState(initialEvent?.name || "");
  const [start, setStart] = useState(initialEvent?.start || "");
  const [end, setEnd] = useState(initialEvent?.end || "");
  const [color, setColor] = useState(initialEvent?.color || "#3B82F6");
  const [monthly, setMonthly] = useState(initialEvent?.monthly || false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim() || !start || !end) {
      setError("Harap isi nama event, tanggal mulai, dan tanggal selesai.");
      return;
    }
    setError("");
    const currentEvents = workspace?.settings?.customEvents || [];
    let updatedEvents: any[];

    if (initialEvent?.id) {
      updatedEvents = currentEvents.map((ev: any) => 
        ev.id === initialEvent.id 
          ? { ...ev, name: name.trim(), start, end, color, monthly }
          : ev
      );
    } else {
      const newEv = {
        id: gid(),
        name: name.trim(),
        start,
        end,
        color,
        monthly
      };
      updatedEvents = [...currentEvents, newEv];
    }

    await onSaveSettings({ customEvents: updatedEvents });
    onClose();
  };

  const handleDelete = async () => {
    if (!initialEvent?.id) return;
    const currentEvents = workspace?.settings?.customEvents || [];
    const updatedEvents = currentEvents.filter((ev: any) => ev.id !== initialEvent.id);
    await onSaveSettings({ customEvents: updatedEvents });
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "none" }} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.15 } }} style={{ position: "relative", zIndex: 1, background: "#FAFAF8", width: "90%", maxWidth: 440, borderRadius: 24, boxShadow: "0 24px 64px rgba(44,32,22,0.3)", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.05)", background: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#2C2016", display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={20} />
            {initialEvent 
              ? (lang === "id" ? "Edit Event Kustom" : "Edit Custom Event") 
              : (lang === "id" ? "Tambah Event Kustom" : "Add Custom Event")}
          </h3>
          <button onClick={onClose} style={{ background: "rgba(44,32,22,0.05)", border: "none", width: 32, height: 32, borderRadius: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover-scale">✕</button>
        </div>
        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {error && <div style={{ fontSize: 13, background: "#FDF5F8", color: "#9C2B4E", padding: "10px 14px", borderRadius: 10, fontWeight: 600 }}>{error}</div>}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--theme-primary)" }}>{lang === "id" ? "Nama Event *" : "Event Name *"}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Launching Produk" style={I({ fontSize: 14 })} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--theme-primary)" }}>Start Date *</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={I({ fontSize: 14, padding: "10px 12px" })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--theme-primary)" }}>End Date *</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={I({ fontSize: 14, padding: "10px 12px" })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block", color: "var(--theme-primary)" }}>{lang === "id" ? "Warna Event" : "Event Color"}</label>
              <ColorPickerSelect value={color} onChange={(val) => setColor(val)} size={44} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "#2C2016", fontWeight: 600, marginTop: 18 }}>
              <input type="checkbox" checked={monthly} onChange={e => setMonthly(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--theme-primary)" }} />
              Ulangi Setiap Bulan
            </label>
          </div>
        </div>
        <div style={{ padding: "16px 24px", background: "white", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
          {initialEvent && (
            <button 
              onClick={handleDelete} 
              style={{ fontSize: 13, padding: "10px 16px", height: "auto", borderRadius: 12, color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)", background: "#FEF2F2", display: "flex", alignItems: "center", gap: 6, marginRight: "auto", cursor: "pointer", fontWeight: 700 }}
              className="hover:bg-rose-100 transition-colors"
            >
              <Trash2 size={15} />
              <span>{lang === "id" ? "Hapus" : "Delete"}</span>
            </button>
          )}
          <button onClick={onClose} style={{ ...B(false), fontSize: 13, padding: "10px 20px", height: "auto", borderRadius: 12 }}>{lang === "id" ? "Batal" : "Cancel"}</button>
          <button onClick={handleSave} style={{ ...B(true, "var(--theme-primary)"), fontSize: 13, padding: "10px 24px", height: "auto", borderRadius: 12, color: "white", border: "none", fontWeight: 800 }}>{lang === "id" ? "Simpan Event" : "Save Event"}</button>
        </div>
      </motion.div>
    </div>
  );
}


