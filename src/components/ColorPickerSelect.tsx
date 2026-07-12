import React, { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";

export const PRESET_COLORS = [
  { name: "Aqua Blue", hex: "#00CEDC" },
  { name: "Chartreuse", hex: "#BED853" },
  { name: "Soft Pink", hex: "#FF9DE0" },
  { name: "Turquoise", hex: "#01A0C7" },
  { name: "Grassy Green", hex: "#35A900" },
  { name: "Bright Pink", hex: "#FF5AC3" },
  { name: "Sapphire Blue", hex: "#2B4CD1" },
  { name: "Mint", hex: "#8EE9A4" },
  { name: "Coral", hex: "#FF7C78" },
  { name: "Sky Blue", hex: "#9AE7EF" },
  { name: "Olive Green", hex: "#8EA94C" },
  { name: "Chocolate Brown", hex: "#7A402A" },
  { name: "Lavender", hex: "#CC86DC" },
  { name: "Golden Yellow", hex: "#FFDB01" },
  { name: "Cinnamon", hex: "#D37015" },
  { name: "Mod Magenta", hex: "#CE1796" },
  { name: "Eames Orange", hex: "#FF8601" },
  { name: "Warm Grey", hex: "#867474" },
  { name: "Plum Purple", hex: "#A30A74" },
  { name: "Brick Red", hex: "#DF4603" },
  { name: "Blue Grey", hex: "#98B7C9" },
  { name: "Navy Blue", hex: "#010A71" },
  { name: "Wagon Red", hex: "#CF0012" },
  { name: "Rich Black", hex: "#000000" },
];

export function ColorPickerSelect({ value, onChange, size = 28 }: { value: string, onChange: (val: string) => void, size?: number }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: "relative", flexShrink: 0 }} ref={containerRef}>
      <div 
        onClick={() => setOpen(!open)}
        title={PRESET_COLORS.find(c => c.hex === value)?.name || value}
        style={{ 
          width: size, 
          height: size, 
          borderRadius: 8, 
          background: value, 
          cursor: "pointer", 
          border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          transition: "transform 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      />
      {open && (
        <div style={{ 
          position: "absolute", 
          top: size + 8, 
          left: 0, 
          zIndex: 1000, 
          background: "#FFFFFF", 
          padding: 16, 
          borderRadius: 16, 
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)", 
          border: "1px solid rgba(0,0,0,0.05)", 
          display: "flex", 
          flexDirection: "column", 
          gap: 16, 
          width: 260 
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Warna Tema</div>
             <button onClick={() => setOpen(false)} style={{ background: "rgba(0,0,0,0.03)", border: "none", cursor: "pointer", padding: 4, borderRadius: "50%", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {PRESET_COLORS.map(c => {
              // Determine if checkmark should be black or white based on lightness
              const hex = c.hex.replace('#', '');
              const r = parseInt(hex.substr(0, 2), 16);
              const g = parseInt(hex.substr(2, 2), 16);
              const b = parseInt(hex.substr(4, 2), 16);
              const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
              const checkColor = brightness > 155 ? "#111827" : "#FFFFFF";

              return (
                <div 
                  key={c.hex}
                  title={c.name}
                  onClick={() => { onChange(c.hex); setOpen(false); }}
                  style={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: 8, 
                    background: c.hex, 
                    cursor: "pointer", 
                    border: value === c.hex ? "2px solid #111827" : "1px solid rgba(0,0,0,0.05)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    transition: "transform 0.15s ease",
                    boxShadow: value === c.hex ? "0 0 0 2px #FFFFFF inset" : "none"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  {value === c.hex && <Check size={14} color={checkColor} style={{ strokeWidth: 3 }} />}
                </div>
              );
            })}
          </div>
          <div style={{ height: 1, background: "rgba(0,0,0,0.05)" }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 8 }}>Kustomisasi</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(0,0,0,0.02)", padding: 8, borderRadius: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0, position: "relative" }}>
                 <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ position: "absolute", top: -10, left: -10, width: 48, height: 48, border: "none", cursor: "pointer", padding: 0 }} />
              </div>
              <input 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                style={{ flex: 1, fontSize: 13, border: "1px solid rgba(0,0,0,0.05)", borderRadius: 6, padding: "6px 10px", outline: "none", fontWeight: 500, color: "#111827", background: "#FFFFFF", fontFamily: "monospace" }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
