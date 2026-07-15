import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, ChevronLeft, ChevronRight, Play, RefreshCw, 
  HelpCircle, MessageSquare, ExternalLink, Sparkles 
} from "lucide-react";

interface HubyTutorialProps {
  profile: any;
  onUpdateProfile: (updates: any) => Promise<void>;
  tab: string;
  setTab: (tab: string) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  onActiveChange?: (active: boolean) => void;
}

interface TutorialStep {
  title: string;
  text: string;
  image: string;
  tabTarget: string;
  highlightSelector?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Halo! Aku Huby! 🐧✨",
    text: "Kenalin, aku **Huby**, asisten personal-mu yang siap menemani keliling Hubify Social. Aplikasi ini didesain biar hidup sebagai content creator jadi jauh lebih mudah, terstruktur, dan asyik! Yuk, ikuti tur singkat bersamaku!",
    image: "/Assets/Huby/huby-wave.png",
    tabTarget: "dashboard"
  },
  {
    title: "Target & Sasaran KPI Bulanan 🌤️📌",
    text: "Widget **Target KPI & Goal Bulanan** ini membantu memantau target konten bulanan dan pencapaian metrik secara detail dalam sekali pandang!",
    image: "/Assets/Huby/huby-excited.png",
    tabTarget: "dashboard",
    highlightSelector: "dashboard-monthly-goals"
  },
  {
    title: "Dashboard Utama 🏠🌟",
    text: "Ini adalah area utama **Dashboard**! Di sini, semua bento widget interaktif penting berkumpul mulai dari to-do list, draf memo cepat, hingga status kolaborasi kerja dalam sekali pandang!",
    image: "/Assets/Huby/huby-enjoy.png",
    tabTarget: "dashboard",
    highlightSelector: "dashboard-main-grid"
  },
  {
    title: "Kalender Konten Interaktif 📅✨",
    text: "Ini adalah **Kalender Konten Bulanan** yang interaktif! Di kalender visual ini, merencanakan agenda, menjadwalkan draf, melihat event hari libur, serta melakukan drag-and-drop jadwal draf konten bisa dilakukan dengan mudah!",
    image: "/Assets/Huby/huby-love.png",
    tabTarget: "content_planner",
    highlightSelector: "content-planner-calendar"
  },
  {
    title: "Tombol Tambah Brief Baru ➕✍️",
    text: "Butuh membuat draf brief baru dengan cepat? Cukup klik tombol **Tambah Baru** di kanan atas ini untuk memulai lembar kerja brief konten yang rapi!",
    image: "/Assets/Huby/huby-wave.png",
    tabTarget: "content_planner",
    highlightSelector: "navbar-tambah-baru"
  },
  {
    title: "Isi Pop-up Brief Konten 📄💡",
    text: "Ini adalah lembar kerja **Brief Konten** secara general! Di sini tersedia opsi untuk menentukan platform, pilar konten, draf ide utama, copywriting/caption, hingga bantuan AI generator untuk menyempurnakan tulisan dalam satu pop-up!",
    image: "/Assets/Huby/huby-enjoy.png",
    tabTarget: "content_planner",
    highlightSelector: "content-brief-modal-card"
  },
  {
    title: "Hub.ai Content Generator Panel 🤖💡",
    text: "Ini adalah panel kerja asisten pintar **Hub.ai**! Di sini tersedia fitur chat langsung, brainstorming ide konten, pembuatan salinan tulisan/caption viral, hingga pencarian referensi taktis secara instan!",
    image: "/Assets/Huby/huby-side eye.png",
    tabTarget: "social-hub-ai",
    highlightSelector: "social-hub-ai-panel"
  },
  {
    title: "Ringkasan Performa (KPI) 📈",
    text: "Di halaman **Overview**, terdapat **Ringkasan Performa** dari seluruh konten. Angka-angka ringkasan ini sangat penting untuk mengukur *views, reach, dan engagement* secara cepat!",
    image: "/Assets/Huby/huby-excited.png",
    tabTarget: "analytics-overview",
    highlightSelector: "analytics-metrics-row"
  },
  {
    title: "Peringkat Konten Terbaik & Terendah 🏆⚠️",
    text: "Melalui halaman **Content**, disuguhkan data **Top 10 Konten Terbaik dan Terendah**. Sangat membantu menganalisis format draf konten mana yang paling disukai audiens!",
    image: "/Assets/Huby/huby-excited.png",
    tabTarget: "analytics-content",
    highlightSelector: "analytics-content-rankings"
  },
  {
    title: "Grafik Tren Pertumbuhan Interaktif 📈🚀",
    text: "Lacak kurva pertumbuhan followers dan engagement di **Tren Pertumbuhan**. Di sini metrik performa bisa dipilih dan difilter secara dinamis untuk menyusun strategi viral berikutnya!",
    image: "/Assets/Huby/huby-love.png",
    tabTarget: "analytics-trends",
    highlightSelector: "analytics-trends-chart"
  },
  {
    title: "Waktu Posting Terbaik (Heatmap) 👥⏰",
    text: "Ingin postingan selalu ramai? Di halaman **Audience**, widget **Heatmap Aktivitas** menunjukkan jam dan hari paling aktif audiens berdasarkan riwayat interaksi nyata!",
    image: "/Assets/Huby/huby-side eye.png",
    tabTarget: "analytics-activity",
    highlightSelector: "analytics-audience-heatmap"
  },
  {
    title: "Hooray! Siap Viral! 🎉🔥",
    text: "Yeeay! Tur keliling kita sudah selesai. Sekarang saatnya meluncur dan mengeksplorasi seluruh sudut Hubify Social untuk menciptakan karya-karya luar biasa. Selamat berkreasi! 🐧💪",
    image: "/Assets/Huby/huby-dab.png",
    tabTarget: "dashboard"
  }
];

export function HubyTutorial({ 
  profile, 
  onUpdateProfile, 
  tab, 
  setTab,
  sidebarOpen,
  setSidebarOpen,
  onActiveChange
}: HubyTutorialProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showHelperMenu, setShowHelperMenu] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Notify parent of active state changes
  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const hasAutoTriggered = React.useRef(false);

  // Auto trigger tour if profile exists and tour is not completed
  useEffect(() => {
    if (profile && profile.completedTour !== true && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStep(0);
        setTab("dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [profile, setTab]);

  // Handle step and selector rect calculations
  useEffect(() => {
    if (!isActive) {
      setElementRect(null);
      window.dispatchEvent(new Event("closeContentModal"));
      return;
    }

    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;

    // Handle programmatic opening/closing of ContentModal for the brief modal step
    if (step.highlightSelector === "content-brief-modal-card") {
      window.dispatchEvent(new Event("openContentModal"));
    } else {
      window.dispatchEvent(new Event("closeContentModal"));
    }

    // Synchronously clear elementRect if there's no highlightSelector (avoids flash & lag)
    if (!step.highlightSelector) {
      setElementRect(null);
    }

    // Switch tab if needed
    if (tab !== step.tabTarget) {
      setTab(step.tabTarget);
    }

    // Force open sidebar if pointing to sidebar elements
    if (step.highlightSelector && step.highlightSelector.startsWith("sidebar-tab-")) {
      if (setSidebarOpen && !sidebarOpen) {
        setSidebarOpen(true);
      }
    }

    let intervalId: any = null;

    const calculateRect = (shouldScroll = false) => {
      if (!step.highlightSelector) {
        setElementRect(null);
        return;
      }

      const el = document.getElementById(step.highlightSelector);
      if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
        if (shouldScroll) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        const rect = el.getBoundingClientRect();
        setElementRect(rect);
      } else {
        setElementRect(null);
      }
    };

    // Calculate rect with delay to allow transition completion
    const delay = step.tabTarget !== tab ? 450 : 150;
    const timer = setTimeout(() => {
      calculateRect(true);
      
      // Polling to handle content updates/renders
      let count = 0;
      intervalId = setInterval(() => {
        calculateRect(false);
        count++;
        if (count > 8) {
          clearInterval(intervalId);
        }
      }, 250);
    }, delay);

    const handleScrollResize = () => calculateRect(false);

    window.addEventListener("resize", handleScrollResize);
    window.addEventListener("scroll", handleScrollResize, { passive: true });

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("resize", handleScrollResize);
      window.removeEventListener("scroll", handleScrollResize);
    };
  }, [currentStep, isActive, tab, setTab, sidebarOpen, setSidebarOpen]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsActive(false);
    setShowSkipConfirm(false);
    try {
      await onUpdateProfile({ completedTour: true });
    } catch (err) {
      console.warn("Failed to save completedTour state in profile:", err);
    }
  };

  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
    setShowHelperMenu(false);
    setTab("dashboard");
  };

  const handleSkip = () => {
    setShowSkipConfirm(true);
  };

  const confirmSkip = () => {
    handleComplete();
  };

  // Calculate Popover Position & Arrow Side for Spotlight Step
  const getPopoverPlacement = () => {
    if (!elementRect) {
      return {
        style: {
          position: "relative" as const,
          maxWidth: "460px",
          width: "100%",
        },
        arrow: null,
        arrowStyle: {} as React.CSSProperties
      };
    }

    if (isMobile) {
      return {
        style: {
          position: "fixed" as const,
          bottom: "16px",
          left: "16px",
          right: "16px",
          width: "calc(100% - 32px)",
        },
        arrow: null,
        arrowStyle: {} as React.CSSProperties
      };
    }

    const r = elementRect;
    const padding = 20;
    const popoverWidth = 360;
    const popoverHeight = 240;

    const spaceRight = window.innerWidth - (r.right + padding);
    const spaceLeft = r.left - padding;
    const spaceBottom = window.innerHeight - (r.bottom + padding);
    const spaceTop = r.top - padding;

    // Prefer Right, then Left, then Bottom, then Top
    if (spaceRight >= popoverWidth) {
      const topPos = Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, r.top + r.height / 2 - popoverHeight / 2));
      const elementCenterY = r.top + r.height / 2;
      const relativeCenterY = elementCenterY - topPos;
      const arrowTop = Math.max(20, Math.min(popoverHeight - 34, relativeCenterY - 7));
      return {
        style: {
          position: "fixed" as const,
          left: `${r.right + padding}px`,
          top: `${topPos}px`,
          width: `${popoverWidth}px`,
        },
        arrow: "left",
        arrowStyle: {
          left: "-8px",
          top: `${arrowTop}px`,
          borderRight: "none",
          borderTop: "none",
        } as React.CSSProperties
      };
    } else if (spaceLeft >= popoverWidth) {
      const topPos = Math.max(16, Math.min(window.innerHeight - popoverHeight - 16, r.top + r.height / 2 - popoverHeight / 2));
      const elementCenterY = r.top + r.height / 2;
      const relativeCenterY = elementCenterY - topPos;
      const arrowTop = Math.max(20, Math.min(popoverHeight - 34, relativeCenterY - 7));
      return {
        style: {
          position: "fixed" as const,
          left: `${r.left - popoverWidth - padding}px`,
          top: `${topPos}px`,
          width: `${popoverWidth}px`,
        },
        arrow: "right",
        arrowStyle: {
          right: "-8px",
          top: `${arrowTop}px`,
          borderLeft: "none",
          borderBottom: "none",
        } as React.CSSProperties
      };
    } else if (spaceBottom >= popoverHeight) {
      const leftPos = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, r.left + r.width / 2 - popoverWidth / 2));
      const elementCenterX = r.left + r.width / 2;
      const relativeCenterX = elementCenterX - leftPos;
      const arrowLeft = Math.max(20, Math.min(popoverWidth - 34, relativeCenterX - 7));
      return {
        style: {
          position: "fixed" as const,
          left: `${leftPos}px`,
          top: `${r.bottom + padding}px`,
          width: `${popoverWidth}px`,
        },
        arrow: "top",
        arrowStyle: {
          top: "-8px",
          left: `${arrowLeft}px`,
          borderRight: "none",
          borderBottom: "none",
        } as React.CSSProperties
      };
    } else if (spaceTop >= popoverHeight) {
      const leftPos = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, r.left + r.width / 2 - popoverWidth / 2));
      const elementCenterX = r.left + r.width / 2;
      const relativeCenterX = elementCenterX - leftPos;
      const arrowLeft = Math.max(20, Math.min(popoverWidth - 34, relativeCenterX - 7));
      return {
        style: {
          position: "fixed" as const,
          left: `${leftPos}px`,
          top: `${Math.max(16, r.top - popoverHeight - padding)}px`,
          width: `${popoverWidth}px`,
        },
        arrow: "bottom",
        arrowStyle: {
          bottom: "-8px",
          left: `${arrowLeft}px`,
          borderLeft: "none",
          borderTop: "none",
        } as React.CSSProperties
      };
    } else {
      // Element is huge and there's no space on any side, so center the popover in the screen
      return {
        style: {
          position: "fixed" as const,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: `${popoverWidth}px`,
        },
        arrow: null,
        arrowStyle: {} as React.CSSProperties
      };
    }
  };

  const placement = getPopoverPlacement();
  const currentStepData = TUTORIAL_STEPS[currentStep];

  return (
    <>
      {/* 1. Backdrop Overlay & Spotlight Cutout */}
      <AnimatePresence>
        {isActive && (
          <div 
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99998,
              pointerEvents: "auto",
              background: "transparent",
            }}
          >
            {/* Spotlight Cutout Element */}
            {elementRect ? (
              <motion.div
                initial={false}
                animate={{
                  top: elementRect.top - 8,
                  left: elementRect.left - 8,
                  width: elementRect.width + 16,
                  height: elementRect.height + 16,
                }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                style={{
                  position: "fixed",
                  borderRadius: 16,
                  boxShadow: "0 0 0 9999px rgba(11, 37, 74, 0.45), 0 0 15px rgba(255,255,255,0.4)",
                  pointerEvents: "none",
                  zIndex: 99998,
                }}
              />
            ) : (
              // General Center Backdrop Overlay
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(11, 37, 74, 0.4)",
                  backdropFilter: "blur(4px)",
                  zIndex: 99998,
                }}
              />
            )}

            {/* If there is no spotlight (elementRect is null), we show a beautifully centered, cloud-themed splash screen. */}
            {!elementRect ? (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 99999,
                  padding: 24,
                  pointerEvents: "none"
                }}
              >
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.93, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.93 }}
                  transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  style={{
                    background: "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)", // Dreamy cloud white gradient
                    borderRadius: 32,
                    boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.15), 0 0 0 1px rgba(37, 99, 235, 0.05)", // Soft high-end glow
                    width: "100%",
                    maxWidth: 480,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    pointerEvents: "auto",
                    border: "1px solid rgba(37, 99, 235, 0.12)"
                  }}
                >
                  {/* Close button */}
                  <button 
                    onClick={handleSkip}
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      background: "rgba(37, 99, 235, 0.05)",
                      border: "none",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--theme-primary)",
                      cursor: "pointer",
                      zIndex: 10
                    }}
                    className="hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors"
                  >
                    <X size={18} />
                  </button>

                  {/* Mascot Header Banner */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40, paddingBottom: 10, position: "relative" }}>
                    {/* Cloud glow backdrops */}
                    <div style={{
                      position: "absolute",
                      top: 20,
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)",
                      zIndex: 1
                    }} />
                    <motion.img 
                      key={currentStepData.image}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      src={currentStepData.image} 
                      alt="Huby Mascot" 
                      style={{ width: 130, height: 130, objectFit: "contain", zIndex: 2, pointerEvents: "none" }}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Title & Body */}
                  <div style={{ padding: "12px 32px 24px", textAlign: "center" }}>
                    <h3 style={{ fontSize: 22, fontWeight: 850, color: "#1E293B", marginBottom: 12, letterSpacing: "-0.5px" }}>
                      {currentStepData.title}
                    </h3>
                    
                    <p style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                      {currentStepData.text.split("**").map((chunk, index) => 
                        index % 2 === 1 ? <strong key={index} style={{ color: "var(--theme-primary)", fontWeight: 700 }}>{chunk}</strong> : chunk
                      )}
                    </p>
                  </div>

                  {/* Foot navigation */}
                  <div style={{
                    padding: "16px 32px 24px",
                    borderTop: "1px solid rgba(37, 99, 235, 0.08)",
                    background: "rgba(37, 99, 235, 0.01)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    {/* Dots */}
                    <div style={{ display: "flex", gap: 5 }}>
                      {TUTORIAL_STEPS.map((_, idx) => (
                        <div 
                          key={idx}
                          style={{
                            width: idx === currentStep ? 18 : 6,
                            height: 6,
                            borderRadius: 3,
                            background: idx === currentStep ? "var(--theme-primary)" : "rgba(37, 99, 235, 0.15)",
                            transition: "all 0.25s ease"
                          }}
                        />
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      {currentStep > 0 && (
                        <button
                          onClick={handlePrev}
                          style={{
                            padding: "9px 16px",
                            borderRadius: 12,
                            border: "1px solid rgba(37, 99, 235, 0.15)",
                            background: "white",
                            color: "#1E293B",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                          className="hover:bg-slate-50 transition-all active:scale-95"
                        >
                          Kembali
                        </button>
                      )}
                      
                      <button
                        onClick={handleNext}
                        style={{
                          padding: "9px 20px",
                          borderRadius: 12,
                          border: "none",
                          background: "var(--theme-primary)",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(var(--theme-primary-rgb), 0.25)",
                        }}
                        className="hover:opacity-90 active:scale-95 transition-all"
                      >
                        {currentStep === TUTORIAL_STEPS.length - 1 ? "Ayo Mulai! 🚀" : "Lanjut"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              // Spotlight cloud-style speech bubble
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                style={{
                  ...placement.style,
                  background: "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)", // Premium modern bubble gradient
                  border: "1px solid rgba(37, 99, 235, 0.15)",
                  borderRadius: 24,
                  boxShadow: "0 15px 35px -10px rgba(37, 99, 235, 0.18), 0 0 0 1px rgba(37, 99, 235, 0.05)",
                  overflow: "visible", // For cloud tail
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 99999,
                }}
              >
                {/* Cloud speech bubble tail */}
                {placement.arrow && !isMobile && (
                  <div
                    style={{
                      position: "absolute",
                      width: 14,
                      height: 14,
                      background: "#FFFFFF",
                      border: "1px solid rgba(37, 99, 235, 0.15)",
                      zIndex: -1,
                      transform: "rotate(45deg)",
                      ...placement.arrowStyle
                    }}
                  />
                )}

                {/* Popover Header */}
                <div 
                  style={{
                    padding: "12px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(37, 99, 235, 0.08)",
                    background: "rgba(37, 99, 235, 0.01)"
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: "var(--theme-primary)", background: "rgba(var(--theme-primary-rgb), 0.08)", padding: "3px 8px", borderRadius: 8 }}>
                    TUR KELILING 🐧
                  </span>
                  <button 
                    onClick={handleSkip}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748B",
                      cursor: "pointer",
                      padding: 2,
                    }}
                    className="hover:scale-110 hover:text-[#EF4444] transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Popover Content */}
                <div style={{ padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start", flex: 1 }}>
                  {/* Circle character wrapper */}
                  <div 
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "rgba(var(--theme-primary-rgb), 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    <motion.img 
                      key={currentStepData.image}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      src={currentStepData.image} 
                      alt="Huby" 
                      style={{ width: 52, height: 52, objectFit: "contain", pointerEvents: "none" }}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Text Description */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <h4 style={{ fontSize: 14.5, fontWeight: 800, color: "#1E293B", margin: 0, letterSpacing: "-0.2px" }}>
                      {currentStepData.title}
                    </h4>
                    <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: 0 }}>
                      {currentStepData.text.split("**").map((chunk, index) => 
                        index % 2 === 1 ? <strong key={index} style={{ color: "var(--theme-primary)", fontWeight: 700 }}>{chunk}</strong> : chunk
                      )}
                    </p>
                  </div>
                </div>

                {/* Popover Footer */}
                <div 
                  style={{
                    padding: "12px 18px",
                    borderTop: "1px solid rgba(37, 99, 235, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "white",
                    borderBottomLeftRadius: 23,
                    borderBottomRightRadius: 23
                  }}
                >
                  {/* Dots progress */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {TUTORIAL_STEPS.map((_, idx) => (
                      <div 
                        key={idx}
                        style={{
                          width: idx === currentStep ? 14 : 5,
                          height: 5,
                          borderRadius: 2.5,
                          background: idx === currentStep ? "var(--theme-primary)" : "rgba(37, 99, 235, 0.15)",
                          transition: "all 0.2s"
                        }}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrev}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 10,
                          border: "1px solid rgba(37, 99, 235, 0.15)",
                          background: "white",
                          color: "#1E293B",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        className="hover:bg-slate-50 transition-all"
                      >
                        Kembali
                      </button>
                    )}
                    
                    <button
                      onClick={handleNext}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 10,
                        border: "none",
                        background: "var(--theme-primary)",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(var(--theme-primary-rgb), 0.2)",
                      }}
                      className="hover:opacity-90 active:scale-95 transition-all"
                    >
                      {currentStep === TUTORIAL_STEPS.length - 1 ? "Mulai! 🎉" : "Lanjut"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* 2. Skip Confirmation Modal */}
      <AnimatePresence>
        {showSkipConfirm && (
          <div 
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(11, 37, 74, 0.4)",
              backdropFilter: "blur(3px)",
              zIndex: 100000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24
            }}
          >
            <motion.div 
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)",
                border: "1px solid rgba(37, 99, 235, 0.15)",
                padding: "32px 24px",
                borderRadius: 28,
                maxWidth: 380,
                width: "100%",
                textAlign: "center",
                boxShadow: "0 20px 50px rgba(37, 99, 235, 0.15)"
              }}
            >
              <img 
                src="/Assets/Huby/huby-sad.png" 
                alt="Sad Huby" 
                style={{ width: 110, height: 110, margin: "0 auto 16px", objectFit: "contain" }}
                referrerPolicy="no-referrer"
              />
              <h4 style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", marginBottom: 10 }}>Yah, mau skip turnya? 🥺</h4>
              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.5, marginBottom: 24 }}>
                Huby baru aja mau berteman baik. Yakin tidak mau keliling sebentar bersamaku?
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button 
                  onClick={() => setShowSkipConfirm(false)}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "1px solid rgba(37, 99, 235, 0.15)",
                    background: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#1E293B"
                  }}
                  className="hover:bg-slate-50 transition-all"
                >
                  Lanjut Tur
                </button>
                <button 
                  onClick={confirmSkip}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: "none",
                    background: "#EF4444",
                    color: "white",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)"
                  }}
                  className="hover:opacity-90 active:scale-95 transition-all"
                >
                  Skip Aja, Huby
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Floating Companion Badge Button */}
      <div 
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
          pointerEvents: "none"
        }}
      >
        {/* Floating Bubble Helper Menu */}
        <AnimatePresence>
          {showHelperMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)",
                borderRadius: 24,
                boxShadow: "0 10px 30px rgba(37, 99, 235, 0.12)",
                padding: "20px 24px",
                width: 290,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                pointerEvents: "auto",
                border: "1px solid rgba(37, 99, 235, 0.12)",
                transformOrigin: "bottom right"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--theme-primary)", letterSpacing: 0.5, background: "rgba(var(--theme-primary-rgb), 0.08)", padding: "2px 6px", borderRadius: 6 }}>
                  ASSISTANT HUBY 🐧
                </span>
                <button 
                  onClick={() => setShowHelperMenu(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.4)" }}
                >
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>
                Halo! Butuh bantuan atau mau mengulang tur keliling Hubify Social bersamaku?
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                <button
                  onClick={startTour}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: "var(--theme-primary)",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(var(--theme-primary-rgb), 0.2)"
                  }}
                  className="hover:opacity-90 active:scale-95 transition-all"
                >
                  <RefreshCw size={14} /> Ulangi Tur Keliling
                </button>

                <button
                  onClick={() => {
                    setTab("social-hub-ai");
                    setShowHelperMenu(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(37, 99, 235, 0.15)",
                    background: "white",
                    color: "#1E293B",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  className="hover:bg-slate-50 transition-all"
                >
                  <Sparkles size={14} color="var(--theme-primary)" /> Tanya Social Hub AI
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Mascot Button */}
        <motion.button
          onClick={() => {
            if (isActive) {
              handleSkip();
            } else {
              setShowHelperMenu(!showHelperMenu);
            }
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          style={{
            pointerEvents: "auto",
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FFFFFF 0%, #F5F9FF 100%)",
            boxShadow: "0 8px 24px rgba(37, 99, 235, 0.15)",
            border: showHelperMenu ? "3px solid var(--theme-primary)" : "1px solid rgba(37, 99, 235, 0.12)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "visible",
            padding: 0
          }}
          title="Tanya Huby"
        >
          {/* Notification Ping Badge if they haven't completed the tour */}
          {profile && profile.completedTour !== true && !isActive && (
            <span style={{
              position: "absolute",
              top: -2,
              right: -2,
              display: "flex",
              height: 14,
              width: 14,
              zIndex: 10
            }}>
              <span style={{
                position: "absolute",
                display: "inline-flex",
                height: "100%",
                width: "100%",
                borderRadius: "50%",
                background: "var(--theme-primary)",
                opacity: 0.75,
                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
              }}></span>
              <span style={{
                position: "relative",
                display: "inline-flex",
                borderRadius: "50%",
                height: 14,
                width: 14,
                background: "var(--theme-primary)"
              }}></span>
            </span>
          )}

          <img 
            src={isActive ? currentStepData.image : "/Assets/Huby/huby-wave.png"} 
            alt="Huby companion" 
            style={{ width: 56, height: 56, objectFit: "contain", transform: showHelperMenu ? "translateY(-1px) scale(1.05)" : "none", transition: "all 0.25s ease" }}
            referrerPolicy="no-referrer"
          />

          {/* Inline keyframe animation helper styles */}
          <style>{`
            @keyframes ping {
              75%, 100% {
                transform: scale(2.2);
                opacity: 0;
              }
            }
          `}</style>
        </motion.button>
      </div>
    </>
  );
}
