import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Layout,
  List,
  Clock,
  PieChart,
  Settings,
  Sun,
  Users,
  Cloud,
  Edit2,
  Search,
  Share2,
  Pencil,
  Image,
  LogOut,
  Menu,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bell,
  MoreVertical,
  AlertTriangle,
  Columns,
  Shield,
  X,
  MessageCircle,
  Activity,
  BarChart2,
  MessageSquare,
  Crown,
  Trash2,
  Check,
  Download,
  Sparkles,
  Home, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { eng, fmt, YEARS, B, I, TAB, MONTHS, CustomDropdown } from "./data";
import {
  useNotifications,
  NotificationToast,
  NotificationPanel,
} from "./NotificationSystem";
import { MenuToggle } from "./MenuToggle";

export function Header({ profile }: any) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  let greeting = "Selamat Malam";
  if (hour >= 5 && hour < 11) greeting = "Selamat Pagi";
  else if (hour >= 11 && hour < 15) greeting = "Selamat Siang";
  else if (hour >= 15 && hour < 18) greeting = "Selamat Sore";

  return (
    <div style={{ padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", borderBottom: "1px solid rgba(0,0,0,0.05)", zIndex: 40 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1D4D7A" }}>{greeting}, {profile?.name || "User"}</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <button className="hover-scale" style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e2e8f0", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Bell size={18} color="#64748b" />
        </button>
        <img 
          src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.name || "User"}`} 
          alt="Avatar" 
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #1D4D7A" }} 
        />
      </div>
    </div>
  );
}

export function Sidebar({ open, setOpen, tab, setTab, workspaces, activeWorkspace, onWorkspaceSelect, user, profile, onLogout, title }: any) {
  const isSuperAdmin = profile?.email?.toLowerCase() === "nalendraputra71@gmail.com" || user?.email?.toLowerCase() === "nalendraputra71@gmail.com";

  const MENU_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: <Layout size={20} /> },
    { id: "soc_hub", label: "SocHub", icon: <MessageSquare size={20} /> },
    { id: "social-hub-ai", label: "Social Studio", icon: <PieChart size={20} /> },
    { id: "settings", label: "Pengaturan", icon: <Settings size={20} /> },
  ];

  if (isSuperAdmin) {
    MENU_ITEMS.push({ id: "admin", label: "Admin Panel", icon: <Shield size={20} /> });
  }

  return (
    <div style={{ width: open ? 240 : 80, height: "100%", background: "linear-gradient(to bottom, #0B2A4A, #1D4D7A)", color: "white", transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", display: "flex", flexDirection: "column", position: "relative", zIndex: 50 }}>
      <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => window.location.href = '/'}>
        <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src="/icon.png" alt="Hubify Social" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }} />
        </div>
        {open && <span style={{ fontSize: 22, fontWeight: 900, whiteSpace: "nowrap" }}>Hubify<span style={{ color: "#3B82F6", fontWeight: 700 }}>Social</span></span>}
      </div>
      
      {open && (
        <button
          onClick={() => setOpen(false)}
          style={{ position: "absolute", right: -12, top: 32, width: 24, height: 24, borderRadius: "50%", background: "#1D4D7A", color: "white", border: "2px solid #FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 60 }}
        >
          <ChevronLeft size={14} />
        </button>
      )}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{ position: "absolute", right: -12, top: 32, width: 24, height: 24, borderRadius: "50%", background: "#1D4D7A", color: "white", border: "2px solid #FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 60 }}
        >
          <ChevronRight size={14} />
        </button>
      )}

      <div style={{ flex: 1, padding: "20px 0", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", overflowX: "hidden" }}>
        {MENU_ITEMS.map(item => {
          const isActive = tab === item.id || (item.id === "social-hub-ai" && tab.startsWith("social"));
          return (
            <div 
              key={item.id} 
              onClick={() => setTab(item.id)}
              style={{ 
                padding: "12px 20px", 
                display: "flex", 
                alignItems: "center", 
                gap: 16, 
                cursor: "pointer",
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                borderLeft: isActive ? "4px solid #3B82F6" : "4px solid transparent",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>{item.icon}</div>
              {open && <span style={{ fontWeight: 600, fontSize: 14, opacity: isActive ? 1 : 0.6, whiteSpace: "nowrap" }}>{item.label}</span>}
            </div>
          );
        })}
      </div>

      <div style={{ padding: "20px" }}>
        <div 
          onClick={onLogout} 
          style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          <LogOut size={20} color="#FCA5A5" />
          {open && <span style={{ fontWeight: 600, fontSize: 14, color: "#FCA5A5", whiteSpace: "nowrap" }}>Keluar</span>}
        </div>
      </div>
    </div>
  );
}

function ColsIcon({ size }: any) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid currentColor",
        borderRadius: 2,
        display: "flex",
      }}
    >
      <div style={{ flex: 1, borderRight: "1px solid currentColor" }} />
      <div style={{ flex: 1 }} />
    </div>
  );
}

export function NavBar({
  tab,
  setTab,
  year,
  setYear,
  month,
  setMonth,
  contentTab,
  setContentTab,
  onOpenAdd,
  onOpenAddEvent,
  search,
  onSearch,
  onShare,
  sidebarOpen,
}: any) {
  const [localSearchOpen, setLocalSearchOpen] = useState(!sidebarOpen);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSearchOpen(!sidebarOpen);
  }, [sidebarOpen]);

  useEffect(() => {
    const clickOutside = (e: any) => {
      if (addRef.current && !addRef.current.contains(e.target))
        setIsAddOpen(false);
    };
    window.addEventListener("mousedown", clickOutside);
    return () => window.removeEventListener("mousedown", clickOutside);
  }, []);

  const CONTENT_TABS = [
    { id: "month", label: "Bulan" },
    { id: "board", label: "Board" },
    { id: "timeline", label: "Timeline" },
    { id: "table", label: "Tabel" },
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: 16,
        zIndex: 50,
        margin: "16px 24px 0",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        transform: "translateZ(0)",
        willChange: "transform",
        border: "1px solid rgba(0,0,0,0.03)",
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "rgba(0,0,0,0.02)",
            padding: 6,
            borderRadius: 999,
            position: "relative",
          }}
        >
          {CONTENT_TABS.map((t) => (
            <button
              className="hover-scale"
              key={t.id}
              onClick={() => setContentTab(t.id)}
              style={{
                position: "relative",
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                background: "transparent",
                color: contentTab === t.id ? "var(--theme-primary)" : "#666",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
            >
              {contentTab === t.id && (
                <motion.div
                  layoutId="activeContentTabHighlight"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "white",
                    borderRadius: 999,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{t.label}</span>
            </button>
          ))}
        </div>

        <div
          style={{
            width: 1,
            height: 20,
            background: "rgba(0,0,0,0.1)",
            display: "block",
          }}
        />

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 110 }}>
            <CustomDropdown
              value={String(month)}
              options={MONTHS.map((m, i) => ({ id: String(i + 1), name: m }))}
              onChange={(v: any) => setMonth(+v)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.06)",
                fontWeight: 600,
                fontSize: 12,
              }}
            />
          </div>
          <div style={{ width: 80 }}>
            <CustomDropdown
              value={String(year)}
              options={YEARS.map((y) => String(y))}
              onChange={(v: any) => setYear(+v)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.06)",
                fontWeight: 600,
                fontSize: 12,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <motion.div
          animate={{
            width: localSearchOpen ? 200 : 36,
            padding: localSearchOpen ? "6px 14px" : "6px",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "white",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            overflow: "hidden",
            cursor: !localSearchOpen ? "pointer" : "text",
            flexShrink: 0,
            height: 36,
          }}
          onClick={() => {
            if (!localSearchOpen) setLocalSearchOpen(true);
          }}
        >
          <Search
            size={16}
            style={{
              opacity: 0.5,
              flexShrink: 0,
              color: "#2C2016",
              margin: !localSearchOpen ? "auto" : "0",
            }}
            onClick={(e) => {
              if (localSearchOpen && !search) {
                e.stopPropagation();
                setLocalSearchOpen(false);
              }
            }}
          />
          <AnimatePresence>
            {localSearchOpen && (
              <motion.input
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#2C2016",
                  fontSize: 12,
                  width: "100%",
                }}
                value={search}
                onChange={(e: any) => onSearch && onSearch(e.target.value)}
                placeholder="Cari konten..."
                autoFocus
              />
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          ref={addRef}
          layout
          style={{
            position: "relative",
            flexShrink: 0,
            height: 36,
            display: "flex",
            alignItems: "center",
            borderRadius: 999,
            background: "var(--theme-primary)",
            boxShadow: "0 4px 16px rgba(var(--theme-primary-rgb),0.3)",
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!isAddOpen ? (
              <motion.button
                key="btn-tambah"
                className="hover-scale btn-hover"
                onClick={() => setIsAddOpen(true)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  ...B(true, "transparent"),
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 999,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  border: "none",
                  color: "white",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                <Plus size={16} />{" "}
                <span style={{ whiteSpace: "nowrap" }}>Tambah Baru</span>
              </motion.button>
            ) : (
              <motion.div
                key="btn-split"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  height: 36,
                  padding: "2px 6px",
                }}
              >
                <button
                  className="hover-scale"
                  onClick={() => {
                    onOpenAdd();
                    setIsAddOpen(false);
                  }}
                  style={{
                    ...B(false),
                    background: "transparent",
                    color: "white",
                    border: "none",
                    height: "100%",
                    padding: "0 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Edit2 size={14} />{" "}
                  <span style={{ whiteSpace: "nowrap" }}>Konten</span>
                </button>
                <div
                  style={{
                    width: 1,
                    height: 14,
                    background: "rgba(255,255,255,0.3)",
                    flexShrink: 0,
                  }}
                />
                <button
                  className="hover-scale"
                  onClick={() => {
                    onOpenAddEvent();
                    setIsAddOpen(false);
                  }}
                  style={{
                    ...B(false),
                    background: "transparent",
                    color: "white",
                    border: "none",
                    height: "100%",
                    padding: "0 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Calendar size={14} />{" "}
                  <span style={{ whiteSpace: "nowrap" }}>Event</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <button
          className="hover-scale btn-hover shadow-sm"
          onClick={onShare}
          style={{
            background: "var(--theme-primary)",
            border: "none",
            borderRadius: 999,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
          }}
          title="Bagikan Link Workspace"
        >
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
}

function MultiSelectFilter({
  values,
  options,
  onChange,
  label,
  style,
  onUpdateOptions,
}: any) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Exclude "All" from local editable options, we handle "All" manually.
  const baseOptions = options.filter(
    (o: any) => (o.id || o.name || o) !== "All",
  );
  const [localOptions, setLocalOptions] = useState<any[]>(baseOptions);

  useEffect(() => {
    if (!editMode) {
      setLocalOptions(baseOptions);
    }
  }, [options, editMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        if (editMode && onUpdateOptions) {
          onUpdateOptions(localOptions);
          setEditMode(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editMode, localOptions, onUpdateOptions]);

  const handleSaveEdit = () => {
    if (onUpdateOptions) {
      onUpdateOptions(localOptions);
    }
    setEditMode(false);
  };

  const toggle = (id: string) => {
    const allIds = baseOptions.map((o) =>
      typeof o === "string" ? o : o.id || o.name || o,
    );
    const current = values.includes("All") ? allIds : values;

    if (id === "All") {
      if (values.includes("All")) {
        onChange([]);
      } else {
        onChange(["All"]);
      }
      return;
    }

    let next = [];
    if (current.includes(id)) {
      next = current.filter((v: any) => v !== id);
    } else {
      next = [...current, id];
    }

    if (next.length === allIds.length) {
      onChange(["All"]);
    } else {
      onChange(next);
    }
  };

  const displayLabel = values.includes("All")
    ? "Semua"
    : values.length > 0
      ? values
          .map((v: any) => {
            const o = options.find(
              (opt: any) => (opt.id || opt.name || opt) === v,
            );
            return o ? o.name || o.id || o : v;
          })
          .join(", ")
      : `Tidak ada ${label}`;

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        onClick={() => setOpen(!open)}
        className="hover-scale"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 10,
          border: "1px solid rgba(44,32,22,0.1)",
          background: "white",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          color: "#2C2016",
          height: 32,
          ...style,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayLabel}
          </span>
        </div>
        <ChevronDown
          size={14}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "all 0.2s",
            opacity: 0.6,
            flexShrink: 0,
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              minWidth: "100%",
              width: "max-content",
              maxWidth: "250px",
              marginTop: 4,
              background: "white",
              border: "1px solid rgba(44,32,22,0.1)",
              borderRadius: 12,
              padding: 6,
              zIndex: 9999,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              maxHeight: 300,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {editMode && onUpdateOptions ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "8px 4px",
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#4B5563",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    paddingBottom: 6,
                    borderBottom: "1px solid #F3F4F6",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
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
                      transition: "all 0.2s",
                    }}
                  >
                    Selesai
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    maxHeight: "180px",
                    overflowY: "auto",
                    paddingRight: 2,
                  }}
                >
                  {localOptions.map((o, i) => {
                    const isStr = typeof o === "string";
                    const val = isStr ? o : o.id || o.name || o;
                    const optLabel = isStr ? o : o.label || o.name || o;
                    const color = isStr ? null : o.color;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!isStr && (
                          <div
                            style={{
                              position: "relative",
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              border: "1px solid #E5E7EB",
                              overflow: "hidden",
                              cursor: "pointer",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: color || "#2C2016",
                            }}
                          >
                            <input
                              type="color"
                              value={color || "#2C2016"}
                              onChange={(e) => {
                                const newOpts = [...localOptions];
                                newOpts[i] = {
                                  ...newOpts[i],
                                  color: e.target.value,
                                };
                                setLocalOptions(newOpts);
                              }}
                              style={{
                                position: "absolute",
                                opacity: 0,
                                width: "100%",
                                height: "100%",
                                cursor: "pointer",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: "white",
                                opacity: 0.7,
                                pointerEvents: "none",
                              }}
                            />
                          </div>
                        )}
                        <input
                          value={optLabel}
                          onChange={(e) => {
                            const newOpts = [...localOptions];
                            if (isStr) newOpts[i] = e.target.value;
                            else
                              newOpts[i] = {
                                ...newOpts[i],
                                name: e.target.value,
                                id: e.target.value,
                              };
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
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSaveEdit();
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newOpts = localOptions.filter(
                              (_, idx) => idx !== i,
                            );
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
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const isObj =
                      localOptions.length > 0 &&
                      typeof localOptions[0] !== "string";
                    const newItem = isObj
                      ? {
                          name: "Opsi Baru",
                          id: "opsi-" + Date.now(),
                          color: "#3B82F6",
                        }
                      : "Opsi Baru";
                    const newOpts = [...localOptions, newItem];
                    setLocalOptions(newOpts);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "8px",
                    background: "#F3F4F6",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#4B5563",
                    cursor: "pointer",
                    marginTop: 4,
                  }}
                >
                  <Plus size={12} /> Tambah Opsi
                </button>
              </div>
            ) : (
              <>
                {options.map((opt: any, i: any) => {
                  const val =
                    typeof opt === "string" ? opt : opt.id || opt.name;
                  const name =
                    typeof opt === "string" ? opt : opt.name || opt.id;
                  const isAll = values.includes("All");
                  const selected =
                    val === "All" ? isAll : isAll || values.includes(val);

                  return (
                    <button
                      key={i}
                      onClick={() => toggle(val)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 12px",
                        background: "transparent",
                        color: "#4B5563",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        cursor: "pointer",
                        fontWeight: selected ? 600 : 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {selected && (
                          <Check size={14} color="#9C2B4E" strokeWidth={3} />
                        )}
                      </div>
                      <span
                        style={{
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {name}
                      </span>
                    </button>
                  );
                })}
                {onUpdateOptions && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditMode(true);
                    }}
                    style={{
                      borderTop: "1px solid rgba(44,32,22,0.1)",
                      marginTop: 4,
                      paddingTop: 4,
                      paddingBottom: 0,
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        color: "#4B5563",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(243, 244, 246, 0.4)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F3F4F6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(243, 244, 246, 0.4)")
                      }
                    >
                      <Pencil size={12} /> Edit Opsi
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

export function FilterBar({
  filters,
  setFilters,
  pillars,
  platforms,
  contentTypes,
  pics,
  statuses,
  showHolidays,
  setShowHolidays,
  showArchived,
  setShowArchived,
  onImportClick,
  onExportClick,
  onSettingUpdate,
}: any) {
  const set = (k: any, v: any) => setFilters((p: any) => ({ ...p, [k]: v }));
  return (
    <div
      style={{
        position: "relative",
        zIndex: 20,
        margin: "12px 24px 0",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        border: "1px solid rgba(0,0,0,0.03)",
        borderRadius: 24,
        padding: "16px 24px",
        display: "flex",
        gap: 16,
        alignItems: "flex-end",
        flexWrap: "wrap",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {[
          ["Pillar", pillars, "pillar"],
          ["Platform", platforms, "platform"],
          ["Tipe Konten", contentTypes, "contentType"],
          ["PIC", pics, "pic"],
        ].map(([l, opt, key]) => (
          <div
            key={key as string}
            style={{
              width: 130,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <label
              style={{
                fontSize: 9,
                fontWeight: 750,
                color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase",
                paddingLeft: 4,
              }}
            >
              {l as string}
            </label>
            <MultiSelectFilter
              label={l as string}
              values={filters[key as string] || ["All"]}
              options={[{ id: "All", name: "Semua" }, ...(opt as any[])]}
              onChange={(v: any) => set(key, v)}
              onUpdateOptions={(opts: any) => {
                const settingKey =
                  key === "pillar"
                    ? "pillars"
                    : key === "platform"
                      ? "platforms"
                      : "pics";
                if (onSettingUpdate) onSettingUpdate({ [settingKey]: opts });
              }}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 1,
        }}
      >
        <button
          className="hover-scale"
          onClick={() => setShowArchived((v: any) => !v)}
          style={{
            ...B(false, "var(--theme-primary)"),
            background: showArchived ? "var(--theme-primary)11" : "transparent",
            border: showArchived
              ? "1px solid var(--theme-primary)44"
              : "1px solid rgba(44,32,22,0.1)",
            fontSize: 11,
            padding: "0 12px",
            height: 32,
            borderRadius: 16,
          }}
        >
          📦 Arsip
        </button>
      </div>
      <div style={{ flex: 1 }} />
      <button
        className="hover-scale btn-hover"
        onClick={onExportClick}
        style={{
          ...B(false, "#10B981"),
          background: "white",
          border: "1px solid rgba(16,185,129,0.3)",
          color: "#10B981",
          height: 32,
          padding: "0 12px",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 1,
        }}
      >
        <Download size={14} style={{ opacity: 0.6 }} /> Export
      </button>
      <button
        className="hover-scale btn-hover"
        onClick={onImportClick}
        style={{
          ...B(false, "#2C2016"),
          background: "white",
          border: "1px solid rgba(44,32,22,0.1)",
          height: 32,
          padding: "0 12px",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 1,
        }}
      >
        <Plus size={14} style={{ opacity: 0.6 }} /> Import
      </button>
    </div>
  );
}
