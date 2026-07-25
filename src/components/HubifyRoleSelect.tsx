import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, MessageSquare, Edit2, ChevronDown, Check } from "lucide-react";

export type RoleType = "viewer" | "commenter" | "editor";

interface RoleOption {
  value: RoleType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeColor: string;
  accentBg: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "viewer",
    label: "Pelihat",
    shortLabel: "Pelihat",
    icon: Eye,
    badgeBg: "rgba(107, 114, 128, 0.12)",
    badgeColor: "#4b5563",
    accentBg: "rgba(107, 114, 128, 0.05)"
  },
  {
    value: "commenter",
    label: "Komentator",
    shortLabel: "Komentator",
    icon: MessageSquare,
    badgeBg: "rgba(217, 119, 6, 0.12)",
    badgeColor: "#b45309",
    accentBg: "rgba(245, 158, 11, 0.06)"
  },
  {
    value: "editor",
    label: "Editor",
    shortLabel: "Editor",
    icon: Edit2,
    badgeBg: "rgba(37, 99, 235, 0.12)",
    badgeColor: "#2563eb",
    accentBg: "rgba(37, 99, 235, 0.06)"
  }
];

interface HubifyRoleSelectProps {
  value: RoleType;
  onChange: (role: RoleType) => void;
  disabled?: boolean;
  compact?: boolean;
  align?: "left" | "right";
  className?: string;
}

export const HubifyRoleSelect: React.FC<HubifyRoleSelectProps> = ({
  value = "viewer",
  onChange,
  disabled = false,
  compact = true,
  align = "right",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number } | null>(null);

  const currentOption = ROLE_OPTIONS.find((opt) => opt.value === value) || ROLE_OPTIONS[0];
  const IconComponent = currentOption.icon;

  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 150;
    const menuEstimatedHeight = 140;

    let top = rect.bottom + 4;
    if (top + menuEstimatedHeight > window.innerHeight && rect.top - menuEstimatedHeight - 4 > 0) {
      top = rect.top - menuEstimatedHeight - 4;
    }

    if (align === "right") {
      let right = window.innerWidth - rect.right;
      if (right < 8) right = 8;
      if (window.innerWidth - right < menuWidth) {
        right = Math.max(8, window.innerWidth - menuWidth - 8);
      }
      setCoords({ top, right });
    } else {
      let left = rect.left;
      if (left < 8) left = 8;
      if (left + menuWidth > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - menuWidth - 8);
      }
      setCoords({ top, left });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();

      const handleScrollOrResize = () => {
        updateCoords();
      };

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          buttonRef.current && !buttonRef.current.contains(target) &&
          menuRef.current && !menuRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    } else {
      setCoords(null);
    }
  }, [isOpen, align]);

  return (
    <div style={{ display: "inline-block" }} className={className}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "3px 7px",
          borderRadius: 7,
          background: currentOption.accentBg,
          border: `1px solid ${currentOption.badgeColor}25`,
          color: currentOption.badgeColor,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 10.5,
          fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.15s ease",
          outline: "none",
          userSelect: "none",
          boxShadow: isOpen ? "0 0 0 2px rgba(37, 99, 235, 0.15)" : "none"
        }}
        onMouseOver={(e) => {
          if (!disabled) {
            e.currentTarget.style.filter = "brightness(0.96)";
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.filter = "none";
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
            height: 16,
            borderRadius: 4,
            background: currentOption.badgeBg,
            color: currentOption.badgeColor,
            flexShrink: 0
          }}
        >
          <IconComponent size={10} strokeWidth={2.5} />
        </span>
        <span>{currentOption.label}</span>
        {!disabled && (
          <ChevronDown
            size={10}
            style={{
              transition: "transform 0.18s ease",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              opacity: 0.75,
              marginLeft: 1
            }}
          />
        )}
      </button>

      {/* Popover Menu rendered via Portal at body level */}
      {isOpen && coords && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: coords.top,
            ...(coords.left !== undefined ? { left: coords.left } : {}),
            ...(coords.right !== undefined ? { right: coords.right } : {}),
            zIndex: 9999999,
            width: 145,
            background: "#ffffff",
            borderRadius: 10,
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: "0 10px 28px -4px rgba(0, 0, 0, 0.18), 0 3px 8px -2px rgba(0, 0, 0, 0.06)",
            padding: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            animation: "hubifyRoleMenuFadeIn 0.12s ease-out forwards"
          }}
        >
          <style>{`
            @keyframes hubifyRoleMenuFadeIn {
              from { opacity: 0; transform: translateY(-4px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {ROLE_OPTIONS.map((opt) => {
            const OptIcon = opt.icon;
            const isSelected = opt.value === value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "5px 8px",
                  borderRadius: 7,
                  background: isSelected ? opt.accentBg : "transparent",
                  border: isSelected ? `1px solid ${opt.badgeColor}25` : "1px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.1s ease",
                  outline: "none",
                  width: "100%"
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      background: opt.badgeBg,
                      color: opt.badgeColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <OptIcon size={11} strokeWidth={2.4} />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? opt.badgeColor : "#111827",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {opt.label}
                  </span>
                </div>

                {isSelected && <Check size={12} color={opt.badgeColor} strokeWidth={2.5} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
};
