import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  style,
}: {
  options: { label: string; value: string; icon?: any }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: any;
  style?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        minWidth: 160,
        ...style,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          fontSize: 13,
          color: selected ? "#111827" : "#6B7280",
          fontWeight: selected ? 600 : 500,
          cursor: "pointer",
          gap: 12,
          transition: "all 0.2s",
        }}
        onMouseOver={(e: any) =>
          (e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)")
        }
        onMouseOut={(e: any) =>
          (e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)")
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {selected?.icon ? (
            <selected.icon size={16} />
          ) : Icon ? (
            <Icon size={16} />
          ) : null}
          <span style={{ whiteSpace: "nowrap" }}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: "#9CA3AF",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
            zIndex: 50,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: 250,
            overflowY: "auto",
          }}
        >
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background:
                  value === opt.value ? "rgba(37,99,235,0.04)" : "#FFFFFF",
                border: "none",
                borderBottom:
                  i < options.length - 1
                    ? "1px solid rgba(0,0,0,0.04)"
                    : "none",
                fontSize: 13,
                fontWeight: value === opt.value ? 700 : 500,
                color: value === opt.value ? "#2563EB" : "#374151",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
              onMouseOver={(e: any) =>
                value !== opt.value &&
                (e.currentTarget.style.background = "rgba(0,0,0,0.02)")
              }
              onMouseOut={(e: any) =>
                value !== opt.value &&
                (e.currentTarget.style.background = "#FFFFFF")
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {opt.icon && <opt.icon size={16} />}
                {opt.label}
              </div>
              {value === opt.value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
