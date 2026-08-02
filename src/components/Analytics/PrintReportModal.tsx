import React, { useState, useMemo, useRef, useEffect } from "react";
import { useI18n } from "../../i18n";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { 
  ChevronLeft, ChevronRight, X, Download, ZoomIn, ZoomOut, Eye, SlidersHorizontal, Calendar, 
  RotateCcw, Check, Sparkles, PieChart, Users, Target, Zap, Star, AlertTriangle, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { MONTHS, MS, DAYS_S, DAYS_S_EN, DAYS_ID, DAYS_EN, YEARS, MK, MC, eng, fmt } from "../../data";
import { getAggregatedDemographics, METRICS_META } from "./analyticsHelpers";

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any[];
  platforms: any[];
  platformFilter: string;
  dateFilt: string;
  customS: string;
  customE: string;
  demographics: any;
  activeMetrics: string[];
}

export function PrintReportModal({
  isOpen,
  onClose,
  content,
  platforms,
  platformFilter,
  dateFilt,
  customS,
  customE,
  demographics,
  activeMetrics
}: PrintReportModalProps) {
  const { lang } = useI18n();
  const [printPlatforms, setPrintPlatforms] = useState<string[]>([]);
  const [printDateRange, setPrintDateRange] = useState("28d");
  const [printCustomS, setPrintCustomS] = useState("");
  const [printCustomE, setPrintCustomE] = useState("");
  const [printSections, setPrintSections] = useState({
    overview: true,
    content: true,
    trends: true,
    audience: true,
  });
  const [isPrintReady, setIsPrintReady] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [previewScale, setPreviewScale] = useState(1);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const platformNames = useMemo(() => {
    return (platforms || []).map((p: any) => typeof p === 'string' ? p : p.name);
  }, [platforms]);

  useEffect(() => {
    if (isOpen) {
      const activePlatNames = platformFilter === "all" ? platformNames : [platformFilter];
      setPrintPlatforms(prev => prev.length === 0 ? activePlatNames : prev);
      setPrintDateRange(prev => prev === "28d" && dateFilt !== "28d" ? dateFilt : prev);
      setPrintCustomS(prev => prev === "" && customS !== "" ? customS : prev);
      setPrintCustomE(prev => prev === "" && customE !== "" ? customE : prev);
    }
  }, [isOpen, platformFilter, platformNames, dateFilt, customS, customE]);

  useEffect(() => {
    if (!isOpen || !previewContainerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (manualZoom !== null) return;
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const targetW = 395;
        const targetH = 558;
        const padding = 32;
        const scaleX = (width - padding) / targetW;
        const scaleY = (height - padding) / targetH;
        const newScale = Math.min(scaleX, scaleY, 1.0);
        setPreviewScale(Math.max(newScale, 0.15));
      }
    });
    
    resizeObserver.observe(previewContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [isOpen, manualZoom]);

  const selectedPages = useMemo(() => {
    const list = [{ id: "cover", title: lang === "id" ? "Halaman Sampul (Cover)" : "Cover Page" }];
    if (printSections.overview) list.push({ id: "overview", title: lang === "id" ? "Ringkasan Kinerja (Overview)" : "Performance Overview" });
    if (printSections.content) list.push({ id: "content", title: lang === "id" ? "Performa Konten Terpopuler" : "Top Content Performance" });
    if (printSections.trends) list.push({ id: "trends", title: lang === "id" ? "Tren & Pertumbuhan" : "Trends & Growth" });
    if (printSections.audience) list.push({ id: "audience", title: lang === "id" ? "Demografi & Aktivitas" : "Audience & Activity" });
    return list;
  }, [printSections, lang]);

  useEffect(() => {
    if (previewPageIndex >= selectedPages.length) {
      setPreviewPageIndex(Math.max(0, selectedPages.length - 1));
    }
  }, [selectedPages, previewPageIndex]);

  const formatPrintDate = (dStr: string) => {
    if (!dStr) return "";
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleExecutePrint = async () => {
    if (printPlatforms.length === 0) {
      alert("Harap pilih minimal satu platform untuk laporan.");
      return;
    }
    onClose();
    setIsPrintReady(true);
    setIsGeneratingPDF(true);
    setTimeout(async () => {
      try {
        const container = document.getElementById("print-report-container");
        if (!container) {
          alert("Gagal menemukan elemen laporan untuk disimpan.");
          setIsGeneratingPDF(false);
          setIsPrintReady(false);
          return;
        }

        const pages = container.querySelectorAll(".print-page");
        if (pages.length === 0) {
          alert(lang === "id" ? "Tidak ada halaman laporan untuk disimpan." : "No report pages to save.");
          setIsGeneratingPDF(false);
          setIsPrintReady(false);
          return;
        }

        const { jsPDF } = await import("jspdf");
        const html2canvas = (await import("html2canvas")).default;

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true
        });

        for (let i = 0; i < pages.length; i++) {
          const pageEl = pages[i] as HTMLElement;
          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.9);
          
          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
        }

        const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
        pdf.save(`Laporan_Analisis_Hubify_${dateStr}.pdf`);
      } catch (err) {
        console.error("Gagal membuat PDF:", err);
        alert("Terjadi kesalahan saat menyimpan PDF.");
      } finally {
        setIsGeneratingPDF(false);
        setIsPrintReady(false);
      }
    }, 600);
  };

  const printData = useMemo(() => {
    if (!isOpen && !isPrintReady) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let finalStartDate = new Date(now);
    let finalEndDate = new Date(now);

    if (printDateRange === "custom") {
      finalStartDate = printCustomS ? new Date(printCustomS) : new Date(now.getFullYear(), 0, 1);
      finalEndDate = printCustomE ? new Date(printCustomE) : new Date();
    } else if (printDateRange === "all") {
      const years = content.length > 0 ? Array.from(new Set(content.map((c: any) => c.year))).sort() as number[] : [now.getFullYear()];
      finalStartDate = new Date(years[0] || now.getFullYear(), 0, 1);
    } else {
      const dayOfWeek = now.getDay();
      if (printDateRange === "yesterday") {
        finalStartDate.setDate(now.getDate() - 1);
        finalEndDate = new Date(finalStartDate);
      } else if (printDateRange === "7d") {
        finalStartDate.setDate(now.getDate() - 7);
      } else if (printDateRange === "28d") {
        finalStartDate.setDate(now.getDate() - 28);
      } else if (printDateRange === "90d") {
        finalStartDate.setDate(now.getDate() - 90);
      } else if (printDateRange === "tw") {
        finalStartDate.setDate(now.getDate() - dayOfWeek);
      } else if (printDateRange === "tm") {
        finalStartDate.setDate(1);
      } else if (printDateRange === "ty") {
        finalStartDate.setMonth(0);
        finalStartDate.setDate(1);
      } else if (printDateRange === "lw") {
        finalStartDate.setDate(now.getDate() - dayOfWeek - 7);
        finalEndDate = new Date(finalStartDate);
        finalEndDate.setDate(finalStartDate.getDate() + 6);
      } else if (printDateRange === "lm") {
        finalStartDate.setMonth(now.getMonth() - 1);
        finalStartDate.setDate(1);
        finalEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
      }
    }
    
    finalStartDate.setHours(0,0,0,0);
    finalEndDate.setHours(23,59,59,999);

    const fmtDateString = (d: Date) => {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    let rangeLabel = `${fmtDateString(finalStartDate)} - ${fmtDateString(finalEndDate)}`;

    const filteredBase = content.filter((c: any) => {
      let cdt = new Date(c.year, c.month - 1, c.day);
      let isMatch = cdt >= finalStartDate && cdt <= finalEndDate;

      if (!isMatch) return false;

      const itemPlatforms = String(c.platform).split(',').map(s => s.trim().toLowerCase());
      const selectedLower = printPlatforms.map(p => p.toLowerCase());
      
      return itemPlatforms.some(ip => selectedLower.includes(ip));
    });

    const getV = (c: any) => (c.metrics?.views || 0) + (c.isAds ? c.adsMetrics?.views || 0 : 0);
    const getR = (c: any) => (c.metrics?.reach || 0) + (c.isAds ? c.adsMetrics?.reach || 0 : 0);
    const getLikes = (c: any) => (c.metrics?.likes || 0) + (c.isAds ? c.adsMetrics?.likes || 0 : 0);
    const getComments = (c: any) => (c.metrics?.comments || 0) + (c.isAds ? c.adsMetrics?.comments || 0 : 0);
    const getShares = (c: any) => (c.metrics?.shares || 0) + (c.isAds ? c.adsMetrics?.shares || 0 : 0);
    const getEng = (c: any) => eng(c.metrics) + (c.isAds ? eng(c.adsMetrics || {}) : 0);

    const totalViews = filteredBase.reduce((s, c) => s + getV(c), 0);
    const totalReach = filteredBase.reduce((s, c) => s + getR(c), 0);
    const totalLikes = filteredBase.reduce((s, c) => s + getLikes(c), 0);
    const totalComments = filteredBase.reduce((s, c) => s + getComments(c), 0);
    const totalShares = filteredBase.reduce((s, c) => s + getShares(c), 0);
    const totalEngagement = filteredBase.reduce((s, c) => s + getEng(c), 0);
    const engagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) : "0.00";

    const totalPosts = filteredBase.length;
    const publishedPosts = filteredBase.filter((c: any) => c.status === "Published").length;

    const sortedTopPosts = [...filteredBase]
      .sort((a, b) => getEng(b) - getEng(a))
      .slice(0, 5);

    const groupedTimeline: { [key: string]: any } = {};
    
    let currDate = new Date(finalStartDate);
    currDate.setHours(0,0,0,0);
    const endDateTime = new Date(finalEndDate).setHours(0,0,0,0);
    
    while(currDate.getTime() <= endDateTime) {
      const dateKey = `${String(currDate.getDate()).padStart(2, '0')}/${String(currDate.getMonth() + 1).padStart(2, '0')}`;
      const dayData: any = {
        date: dateKey,
        timestamp: currDate.getTime(),
      };
      activeMetrics.forEach(m => dayData[m] = 0);
      groupedTimeline[dateKey] = dayData;
      currDate.setDate(currDate.getDate() + 1);
    }

    const metricTotals: Record<string, number> = {};
    activeMetrics.forEach(m => metricTotals[m] = 0);

    filteredBase.forEach((c: any) => {
      const dateKey = `${String(c.day).padStart(2, '0')}/${String(c.month + 1).padStart(2, '0')}`;
      if (!groupedTimeline[dateKey]) {
        const dayData: any = {
          date: dateKey,
          timestamp: new Date(c.year, c.month - 1, c.day).getTime(),
        };
        activeMetrics.forEach(m => dayData[m] = 0);
        groupedTimeline[dateKey] = dayData;
      }
      activeMetrics.forEach(m => {
        let val = 0;
        if (m === 'engagement') val = getEng(c);
        else if (m === 'views') val = getV(c);
        else if (m === 'reach') val = getR(c);
        else if (m === 'likes') val = getLikes(c);
        else val = (c.isAds ? (c.adsMetrics?.[m] || 0) : (c.metrics?.[m] || 0));
        groupedTimeline[dateKey][m] += val;
        metricTotals[m] += val;
      });
    });

    const timelineData = Object.values(groupedTimeline).sort((a: any, b: any) => a.timestamp - b.timestamp);
    const totalDays = Math.max(Object.keys(groupedTimeline).length, 1);

    const aggDemo = getAggregatedDemographics(demographics, printPlatforms);

    let originalRangeLabel = "";
    if (printDateRange === "custom") {
      rangeLabel = `${formatPrintDate(printCustomS) || "Mulai"} - ${formatPrintDate(printCustomE) || "Selesai"}`;
    } else {
      const labelsMap: any = {
        yesterday: "Kemarin",
        "7d": "7 Hari Terakhir",
        "28d": "28 Hari Terakhir",
        "90d": "90 Hari Terakhir",
        tw: "Minggu Ini",
        tm: lang === "id" ? "Bulan Ini" : "This Month",
        ty: "Tahun Ini",
        lw: "Minggu Lalu",
        lm: lang === "id" ? "Bulan Lalu" : "Last Month",
        all: lang === "id" ? "Semua Waktu" : "All Time"
      };
      originalRangeLabel = labelsMap[printDateRange] || "Periode Laporan";
      rangeLabel = `${originalRangeLabel} (${rangeLabel})`;
    }

    return {
      filteredBase,
      totalViews,
      totalReach,
      totalLikes,
      totalComments,
      totalShares,
      totalEngagement,
      engagementRate,
      totalPosts,
      publishedPosts,
      topPosts: sortedTopPosts,
      timelineData,
      totalDays,
      metricTotals,
      demographics: aggDemo,
      rangeLabel
    };
  }, [isOpen, isPrintReady, printPlatforms, printDateRange, printCustomS, printCustomE, demographics, content, lang, activeMetrics]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-6 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full h-full md:h-[90vh] md:max-w-6xl bg-white md:rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.25)] flex flex-col md:flex-row overflow-hidden border border-black/[0.02]"
            >
              {/* Sidebar Settings Panel */}
              <div className="w-full md:w-[360px] bg-gray-50 border-r border-black/[0.04] p-6 flex flex-col justify-between shrink-0 h-[45%] md:h-full overflow-y-auto">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-[17px] font-extrabold text-gray-900 tracking-tight">{lang === "id" ? "Ekspor PDF Laporan" : "Export PDF Report"}</h4>
                      <p className="text-[11px] text-gray-400 font-semibold">{lang === "id" ? "Sesuaikan parameter & desain cetak" : "Customize print design and parameters"}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/[0.04] active:bg-black/[0.08] hover:bg-black/[0.06] flex items-center justify-center text-gray-500 cursor-pointer border-none transition-colors"><X size={16} /></button>
                  </div>

                  <div className="space-y-5">
                    {/* Choose Platforms */}
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{lang === "id" ? "Pilih Platform" : "Platforms"}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {platformNames.map((pName: string) => {
                          const active = printPlatforms.includes(pName);
                          return (
                            <button
                              key={pName}
                              onClick={() => {
                                setPrintPlatforms(prev =>
                                  prev.includes(pName) ? prev.filter(x => x !== pName) : [...prev, pName]
                                );
                              }}
                              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent ${active ? "bg-blue-600 text-white shadow-sm font-extrabold" : "bg-white border-black/[0.05] text-gray-600 hover:text-gray-900 active:bg-black/[0.03]"}`}
                            >
                              {pName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Date Range Selector */}
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{lang === "id" ? "Rentang Waktu Laporan" : "Date Range"}</span>
                      <select
                        value={printDateRange}
                        onChange={(e) => setPrintDateRange(e.target.value)}
                        className="w-full bg-white border border-black/[0.08] rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-blue-500 shadow-sm transition-shadow focus:shadow"
                      >
                        <option value="yesterday">{lang === "id" ? "Kemarin" : "Yesterday"}</option>
                        <option value="7d">{lang === "id" ? "7 Hari Terakhir" : "Last 7 days"}</option>
                        <option value="28d">{lang === "id" ? "28 Hari Terakhir" : "Last 28 days"}</option>
                        <option value="90d">{lang === "id" ? "90 Hari Terakhir" : "Last 90 days"}</option>
                        <option value="tm">{lang === "id" ? "Bulan Ini" : "This Month"}</option>
                        <option value="lm">{lang === "id" ? "Bulan Lalu" : "Last Month"}</option>
                        <option value="all">{lang === "id" ? "Semua Waktu" : "All Time"}</option>
                        <option value="custom">{lang === "id" ? "Kustom" : "Custom"}</option>
                      </select>

                      {printDateRange === "custom" && (
                        <div className="mt-3 p-3.5 bg-white border border-black/[0.04] rounded-2xl flex flex-col gap-3 shadow-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{lang === "id" ? "Mulai" : "Start"}</span>
                              <input type="date" value={printCustomS} onChange={(e)=>setPrintCustomS(e.target.value)} className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-black/[0.06] rounded-lg outline-none focus:border-blue-500 font-semibold text-gray-800" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{lang === "id" ? "Selesai" : "End"}</span>
                              <input type="date" value={printCustomE} onChange={(e)=>setPrintCustomE(e.target.value)} className="w-full text-xs px-3 py-1.5 bg-gray-50 border border-black/[0.06] rounded-lg outline-none focus:border-blue-500 font-semibold text-gray-800" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Report Sections Checklist */}
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{lang === "id" ? "Bagian Laporan" : "Report Sections"}</span>
                      <div className="space-y-2 bg-white p-3.5 border border-black/[0.04] rounded-2xl shadow-sm">
                        {[
                          { key: "overview", label: lang === "id" ? "Ringkasan Kinerja (Hal 1)" : "Performance Summary (Pg 1)" },
                          { key: "content", label: lang === "id" ? "Performa Konten (Hal 2)" : "Content Performance (Pg 2)" },
                          { key: "trends", label: lang === "id" ? "Tren & Pertumbuhan (Hal 3)" : "Trends & Growth (Pg 3)" },
                          { key: "audience", label: lang === "id" ? "Demografi Audiens (Hal 4)" : "Audience Demographics (Pg 4)" },
                        ].map((sect) => (
                          <label key={sect.key} className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={(printSections as any)[sect.key]}
                              onChange={(e) => {
                                setPrintSections(prev => ({ ...prev, [sect.key]: e.target.checked }));
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-gray-700">{sect.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.04] mt-6 bg-gray-50 shrink-0">
                  <button
                    onClick={handleExecutePrint}
                    className="w-full hover-scale btn-hover h-11 bg-blue-600 active:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.3)] border-none cursor-pointer transition-all"
                  >
                    <Download size={15} />
                    <span>{lang === "id" ? "Cetak & Unduh PDF" : "Print & Download PDF"}</span>
                  </button>
                </div>
              </div>

              {/* Main Content Preview Area */}
              <div className="flex-1 bg-slate-900 flex flex-col h-[55%] md:h-full relative select-none">
                {/* Scale & Navigation Bar */}
                <div className="h-14 border-b border-white/[0.06] px-6 flex justify-between items-center bg-slate-950 shrink-0 text-white">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setManualZoom(prev => Math.max((prev || previewScale) - 0.1, 0.25))}
                      className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] flex items-center justify-center text-slate-300 cursor-pointer border-none transition-colors"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <button
                      onClick={() => setManualZoom(prev => Math.min((prev || previewScale) + 0.1, 1.5))}
                      className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] flex items-center justify-center text-slate-300 cursor-pointer border-none transition-colors"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    {(manualZoom !== null) && (
                      <button
                        onClick={() => setManualZoom(null)}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 px-2 cursor-pointer bg-transparent border-none"
                      >
                        {lang === "id" ? "Auto Fit" : "Reset Fit"}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      disabled={previewPageIndex === 0}
                      onClick={() => setPreviewPageIndex(prev => prev - 1)}
                      className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] disabled:opacity-30 disabled:hover:bg-white/[0.04] flex items-center justify-center text-white cursor-pointer border-none transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold tracking-wide text-slate-300">{lang === "id" ? `Halaman ${previewPageIndex + 1} dari ${selectedPages.length}` : `Page ${previewPageIndex + 1} of ${selectedPages.length}`}</span>
                    <button
                      disabled={previewPageIndex === selectedPages.length - 1}
                      onClick={() => setPreviewPageIndex(prev => prev + 1)}
                      className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] disabled:opacity-30 disabled:hover:bg-white/[0.04] flex items-center justify-center text-white cursor-pointer border-none transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Simulated Binder Folder Container */}
                <div ref={previewContainerRef} className="flex-1 overflow-auto flex items-center justify-center p-4">
                  {printData ? (
                    <div className="relative">
                      {/* Document Binder Paper Backing */}
                      <div
                        className="bg-slate-950 border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-transform duration-300"
                        style={{
                          width: 395,
                          height: 558,
                          transform: `scale(${manualZoom !== null ? manualZoom : previewScale})`,
                          transformOrigin: "center center"
                        }}
                      >
                        <div className="w-full h-full p-8 bg-white text-gray-900 text-left relative flex flex-col justify-between select-text">
                          
                          {/* Page 1: COVER */}
                          {selectedPages[previewPageIndex]?.id === "cover" && (
                            <div className="h-full flex flex-col justify-between">
                              <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                                <span className="text-[10px] font-black tracking-widest text-blue-600">HUBIFY</span>
                                <span className="text-[8px] font-bold text-gray-400">LAPORAN ANALISIS MEDIA SOSIAL</span>
                              </div>
                              
                              <div className="my-auto py-4">
                                <div className="w-8 h-1 bg-blue-600 mb-4 rounded-full" />
                                <h1 className="text-xl font-black tracking-tight text-gray-950 uppercase leading-none mb-2" style={{ fontSize: 24 }}>
                                  {lang === "id" ? "Laporan Kinerja" : "Social Media"}<br />{lang === "id" ? "Media Sosial" : "Performance Report"}
                                </h1>
                                <p className="text-[10px] text-gray-500 font-medium tracking-wide max-w-[280px]">
                                  {lang === "id" ? "Analisis komprehensif performa platform, keterlibatan konten, pertumbuhan tren, dan demografi audiens." : "Comprehensive analysis of platform performance, content engagement, trend growth, and audience demographics."}
                                </p>
                              </div>
                              
                              <div className="border-t border-gray-150 pt-3 grid grid-cols-2 gap-4 text-[8px]">
                                <div>
                                  <span className="block text-[6.5px] font-bold text-gray-400 uppercase tracking-wider mb-1">DIPERSIAPKAN UNTUK</span>
                                  <span className="block font-black text-gray-900">Hubify Social Manager</span>
                                </div>
                                <div>
                                  <span className="block text-[6.5px] font-bold text-gray-400 uppercase tracking-wider mb-1">METADATA LAPORAN</span>
                                  <div className="flex flex-col gap-0.5 text-gray-600 text-[7px]">
                                    <div>Platform: <span className="font-bold text-gray-900">{printPlatforms.join(", ")}</span></div>
                                    <div>Periode: <span className="font-bold text-gray-900">{printData.rangeLabel}</span></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Page 2: OVERVIEW */}
                          {selectedPages[previewPageIndex]?.id === "overview" && (
                            <div className="h-full flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                                  <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                                  <span className="text-[8px] font-bold text-gray-500">{printData.rangeLabel}</span>
                                </div>
                                
                                <h2 className="text-xs font-black text-gray-950 uppercase tracking-tight mb-0.5">1. Ringkasan Kinerja Utama</h2>
                                <p className="text-[9px] text-gray-400 mb-3">Pencapaian performa akumulatif postingan organik dan iklan.</p>
                                
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="p-2.5 rounded-xl border border-gray-100 bg-white">
                                    <span className="block text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Postingan</span>
                                    <span className="text-base font-extrabold text-gray-900">{printData.totalPosts} <span className="text-[10px] text-gray-400 font-normal">konten</span></span>
                                  </div>
                                  <div className="p-2.5 rounded-xl border border-gray-100 bg-white">
                                    <span className="block text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Average Engagement Rate</span>
                                    <span className="text-base font-extrabold text-blue-600">{printData.engagementRate}%</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl border border-gray-100 bg-white">
                                    <span className="block text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Views / Impression</span>
                                    <span className="text-base font-extrabold text-gray-900">{printData.totalViews.toLocaleString('id-ID')}</span>
                                  </div>
                                  <div className="p-2.5 rounded-xl border border-gray-100 bg-white">
                                    <span className="block text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Jangkauan (Reach)</span>
                                    <span className="text-base font-extrabold text-gray-900">{printData.totalReach.toLocaleString('id-ID')}</span>
                                  </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 mb-3 text-[8.5px]">
                                  <h4 className="font-extrabold text-gray-900 mb-1.5 uppercase tracking-wider text-[7.5px]">Rincian Interaksi Sosial</h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <span className="block text-[7px] text-gray-400 font-bold">Likes</span>
                                      <span className="font-extrabold text-gray-900">{printData.totalLikes.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div>
                                      <span className="block text-[7px] text-gray-400 font-bold">Comments</span>
                                      <span className="font-extrabold text-gray-900">{printData.totalComments.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div>
                                      <span className="block text-[7px] text-gray-400 font-bold">Shares</span>
                                      <span className="font-extrabold text-gray-900">{printData.totalShares.toLocaleString('id-ID')}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border-t border-gray-150 pt-1.5 text-center text-[7.5px] text-gray-400 flex justify-between shrink-0">
                                <span>Hubify Analytics System</span>
                                <span>{lang === "id" ? "Halaman 2" : "Page 2"}</span>
                              </div>
                            </div>
                          )}

                          {/* Page 3: CONTENT */}
                          {selectedPages[previewPageIndex]?.id === "content" && (
                            <div className="h-full flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                                  <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                                  <span className="text-[8px] font-bold text-gray-500">{printData.rangeLabel}</span>
                                </div>
                                
                                <h2 className="text-xs font-black text-gray-950 uppercase tracking-tight mb-0.5">2. Analisis Kinerja Konten</h2>
                                <p className="text-[9px] text-gray-400 mb-3">Postingan terpopuler diurutkan berdasarkan skor keterlibatan tertinggi.</p>
                                
                                <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
                                  <table className="w-full text-left border-collapse text-[7.5px]">
                                    <thead>
                                      <tr className="bg-gray-50 border-b border-gray-100 text-[6.5px] font-bold text-gray-500 uppercase">
                                        <th className="py-1.5 px-2 w-6 text-center">No</th>
                                        <th className="py-1.5 px-2">Konten / Keterangan</th>
                                        <th className="py-1.5 px-2 w-16 text-center">Platform</th>
                                        <th className="py-1.5 px-2 w-16 text-right">Views</th>
                                        <th className="py-1.5 px-2 w-16 text-right">Engagement</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {printData.topPosts.length === 0 ? (
                                        <tr>
                                          <td colSpan={5} className="py-4 text-center text-gray-400">Tidak ada konten.</td>
                                        </tr>
                                      ) : (
                                        printData.topPosts.slice(0, 4).map((post: any, index: number) => {
                                          const getV = (c: any) => (c.metrics?.views || 0) + (c.isAds ? c.adsMetrics?.views || 0 : 0);
                                          const getEng = (c: any) => eng(c.metrics) + (c.isAds ? eng(c.adsMetrics || {}) : 0);
                                          return (
                                            <tr key={post.id || index} className="border-b border-gray-100 last:border-none">
                                              <td className="py-2 px-2 text-center text-gray-400 font-bold">{index + 1}</td>
                                              <td className="py-2 px-2 font-bold text-gray-900 truncate max-w-[120px]">{post.caption || post.title || "Konten tanpa judul"}</td>
                                              <td className="py-2 px-2 text-center capitalize text-blue-600 font-bold">{post.platform}</td>
                                              <td className="py-2 px-2 text-right">{getV(post).toLocaleString('id-ID')}</td>
                                              <td className="py-2 px-2 text-right font-black">{getEng(post).toLocaleString('id-ID')}</td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[8.5px] text-gray-500 leading-relaxed">
                                  <span className="block font-bold text-gray-800 mb-0.5">Analisis Kinerja Konten:</span>
                                  Format visual interaktif dan caption yang interaktif (call to action terarah) memiliki korelasi kuat dengan tingginya skor interaksi audiens.
                                </div>
                              </div>
                              
                              <div className="border-t border-gray-150 pt-1.5 text-center text-[7.5px] text-gray-400 flex justify-between shrink-0">
                                <span>Hubify Analytics System</span>
                                <span>{lang === "id" ? "Halaman 3" : "Page 3"}</span>
                              </div>
                            </div>
                          )}

                          {/* Page 4: TRENDS */}
                          {selectedPages[previewPageIndex]?.id === "trends" && (
                            <div className="h-full flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                                  <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                                  <span className="text-[8px] font-bold text-gray-500">{printData.rangeLabel}</span>
                                </div>
                                
                                <h2 className="text-xs font-black text-gray-950 uppercase tracking-tight mb-0.5">3. Tren & Pertumbuhan Kinerja</h2>
                                <p className="text-[9px] text-gray-400 mb-2">Kurva pertumbuhan jangkauan dan interaksi lintas platform.</p>
                                
                                <div className="grid grid-cols-2 gap-2 mb-2.5">
                                  {activeMetrics.slice(0, 4).map((k) => (
                                    <div key={k} className="p-2 rounded-xl border border-gray-100 bg-white">
                                      <span className="block text-[6px] font-extrabold text-gray-500 uppercase tracking-wider mb-1 text-center">
                                        {(lang === "id" ? METRICS_META[k]?.label : METRICS_META[k]?.labelEn) || k}
                                      </span>
                                      <div className="w-full h-[60px] relative">
                                        {printData.timelineData && printData.timelineData.length > 0 ? (
                                          <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={printData.timelineData.slice(-10)}>
                                              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                              <XAxis dataKey="date" tick={{ fontSize: 5, fill: "#9ca3af" }} />
                                              <YAxis tick={{ fontSize: 5, fill: "#9ca3af" }} width={15} />
                                              <Line type="monotone" dataKey={k} stroke={METRICS_META[k]?.color || "#2563eb"} strokeWidth={1} dot={false} />
                                            </LineChart>
                                          </ResponsiveContainer>
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[6px]">Data tidak tersedia</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[9px]">
                                  <div className="p-2 rounded-xl border border-gray-100 bg-gray-50/50">
                                    <span className="block text-[7.5px] font-bold text-gray-400 uppercase">Rata-rata Views</span>
                                    <span className="text-xs font-black text-gray-800 mt-0.5 block">
                                      {printData.totalPosts > 0 ? Math.round(printData.totalViews / printData.totalPosts).toLocaleString('id-ID') : "0"} /post
                                    </span>
                                  </div>
                                  <div className="p-2 rounded-xl border border-gray-100 bg-gray-50/50">
                                    <span className="block text-[7.5px] font-bold text-gray-400 uppercase">Rata-rata Interaksi</span>
                                    <span className="text-xs font-black text-gray-800 mt-0.5 block">
                                      {printData.totalPosts > 0 ? Math.round(printData.totalEngagement / printData.totalPosts).toLocaleString('id-ID') : "0"} /post
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border-t border-gray-150 pt-1.5 text-center text-[7.5px] text-gray-400 flex justify-between shrink-0">
                                <span>Hubify Analytics System</span>
                                <span>{lang === "id" ? "Halaman 4" : "Page 4"}</span>
                              </div>
                            </div>
                          )}

                          {/* Page 5: AUDIENCE */}
                          {selectedPages[previewPageIndex]?.id === "audience" && (
                            <div className="h-full flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                                  <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                                  <span className="text-[8px] font-bold text-gray-500">{printData.rangeLabel}</span>
                                </div>
                                
                                <h2 className="text-xs font-black text-gray-950 uppercase tracking-tight mb-0.5">{lang === "id" ? "4. Analisis Demografi Audiens" : "4. Audience Demographics Analysis"}</h2>
                                <p className="text-[9px] text-gray-400 mb-2">Distribusi gender, demografi kelompok usia, dan ketertarikan minat teratas.</p>
                                
                                {printData.demographics ? (
                                  <div className="flex flex-col gap-2 text-[8.5px]">
                                    <div className="p-2 rounded-xl border border-gray-100 bg-white">
                                      <h4 className="text-[7.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Distribusi Gender</h4>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-pink-500 font-extrabold">{printData.demographics.gender?.female || 50}% Wanita</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                          <div className="h-full bg-pink-500" style={{ width: `${printData.demographics.gender?.female || 50}%` }}></div>
                                          <div className="h-full bg-blue-500 flex-1"></div>
                                        </div>
                                        <span className="text-[8px] text-blue-500 font-extrabold">{printData.demographics.gender?.male || 50}% Pria</span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="p-2 rounded-xl border border-gray-100 bg-white">
                                        <h4 className="text-[7.5px] font-bold text-gray-500 uppercase mb-1">Usia Terbanyak</h4>
                                        <div className="flex flex-col gap-0.5">
                                          {(printData.demographics.age || []).slice(0, 3).map((item: any) => (
                                            <div key={item.range} className="flex items-center justify-between">
                                              <span className="text-gray-400">{item.range}</span>
                                              <span className="font-extrabold text-gray-800">{item.value}%</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="p-2 rounded-xl border border-gray-100 bg-white">
                                        <h4 className="text-[7.5px] font-bold text-gray-500 uppercase mb-1">Negara Teratas</h4>
                                        <div className="flex flex-col gap-0.5">
                                          {(printData.demographics.countries || []).slice(0, 3).map((item: any) => (
                                            <div key={item.name} className="flex items-center justify-between">
                                              <span className="text-gray-400 truncate max-w-[50px]">{item.name}</span>
                                              <span className="font-extrabold text-gray-800">{item.percentage}%</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[8px] text-gray-500 leading-relaxed">
                                      <span className="block font-bold text-gray-800 mb-0.5">Rekomendasi Konten Audiens:</span>
                                      Sesuaikan tone-of-voice agar bernuansa kasual & solutif guna meraih kecocokan demografi usia utama.
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-6 text-center text-gray-400 text-[8.5px]">Data demografi tidak tersedia.</div>
                                )}
                              </div>
                              
                              <div className="border-t border-gray-150 pt-1.5 text-center text-[7.5px] text-gray-400 flex justify-between shrink-0">
                                <span>Hubify Analytics System</span>
                                <span>{lang === "id" ? "Halaman 5" : "Page 5"}</span>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Folder rings decoration */}
                        <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 flex flex-col gap-14 pointer-events-none">
                          <div className="w-4 h-2 bg-slate-800/80 rounded-full border border-slate-700/60 shadow-lg" />
                          <div className="w-4 h-2 bg-slate-800/80 rounded-full border border-slate-700/60 shadow-lg" />
                          <div className="w-4 h-2 bg-slate-800/80 rounded-full border border-slate-700/60 shadow-lg" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                      <div className="animate-spin text-blue-500 w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                      <span>Menyiapkan preview halaman...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NATIVE HIGH-FIDELITY PRINTABLE REPORT */}
      {isPrintReady && printData && (
        <div id="print-report-container" className="hidden print:block bg-white text-gray-900 text-left p-0 m-0">
          
          {/* COVER PAGE */}
          <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2.5cm" }}>
            <div className="flex justify-between items-center border-b border-gray-150 pb-6">
              <span className="text-sm font-extrabold tracking-widest text-blue-600">HUBIFY</span>
              <span className="text-xs font-semibold text-gray-400">LAPORAN ANALISIS MEDIA SOSIAL</span>
            </div>
            
            <div className="my-auto py-12">
              <div className="w-16 h-1.5 bg-blue-600 mb-8 rounded-full" />
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 uppercase leading-tight mb-4" style={{ fontSize: "38px" }}>
                {lang === "id" ? "Laporan Kinerja" : "Social Media"}<br />{lang === "id" ? "Media Sosial" : "Performance Report"}
              </h1>
              <p className="text-lg text-gray-500 font-medium tracking-wide max-w-md">
                {lang === "id" ? "Analisis komprehensif performa platform, keterlibatan konten, pertumbuhan tren, dan demografi audiens." : "Comprehensive analysis of platform performance, content engagement, trend growth, and audience demographics."}
              </p>
            </div>
            
            <div className="border-t border-gray-150 pt-8 grid grid-cols-2 gap-8 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{lang === "id" ? "DIPERSIAPKAN UNTUK" : "PREPARED FOR"}</span>
                <span className="block text-sm font-extrabold text-gray-900">Hubify Social Manager</span>
                <span className="block text-gray-500 mt-1">{lang === "id" ? "Laporan Kinerja Lintas Platform" : "Cross-Platform Performance Report"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">METADATA LAPORAN</span>
                <div className="flex flex-col gap-1 text-gray-600">
                  <div>Platform: <span className="font-bold text-gray-900">{printPlatforms.join(", ")}</span></div>
                  <div>Periode: <span className="font-bold text-gray-900">{printData.rangeLabel}</span></div>
                  <div>Dicetak: <span className="font-bold text-gray-900">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE 1: OVERVIEW */}
          {printSections.overview && (
            <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2cm" }}>
              <div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                  <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                  <span className="text-xs font-bold text-gray-500">{printData.rangeLabel}</span>
                </div>
                
                <h2 className="text-xl font-extrabold text-gray-950 uppercase tracking-tight mb-2">1. Ringkasan Kinerja Utama</h2>
                <p className="text-xs text-gray-500 mb-6">Pencapaian performa akumulatif postingan organik dan kampanye iklan di platform terpilih.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Postingan</span>
                    <span className="text-2xl font-extrabold text-gray-900">{printData.totalPosts} <span className="text-xs text-gray-400 font-normal">konten</span></span>
                    <span className="block text-[10px] text-gray-400 mt-1">{printData.publishedPosts} diterbitkan di periode ini</span>
                  </div>
                  <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-rata Engagement Rate</span>
                    <span className="text-2xl font-extrabold text-blue-600">{printData.engagementRate}%</span>
                    <span className="block text-[10px] text-gray-400 mt-1">Dihitung berdasarkan total keterlibatan per jangkauan</span>
                  </div>
                  <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Views / Impression</span>
                    <span className="text-2xl font-extrabold text-gray-900">{printData.totalViews.toLocaleString('id-ID')}</span>
                    <span className="block text-[10px] text-gray-400 mt-1">Akumulasi jumlah penayangan konten</span>
                  </div>
                  <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Jangkauan (Reach)</span>
                    <span className="text-2xl font-extrabold text-gray-900">{printData.totalReach.toLocaleString('id-ID')}</span>
                    <span className="block text-[10px] text-gray-400 mt-1">Akumulasi jumlah akun unik yang dijangkau</span>
                  </div>
                </div>

                <div className="print-card p-5 rounded-2xl bg-gray-50 border border-gray-100 mb-8 text-xs">
                  <h4 className="font-extrabold text-gray-900 mb-3 uppercase tracking-wider text-[10px]">Rincian Interaksi Sosial</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">Suka (Likes)</span>
                      <span className="text-sm font-extrabold text-gray-900">{printData.totalLikes.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">Komentar</span>
                      <span className="text-sm font-extrabold text-gray-900">{printData.totalComments.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold mb-1">Bagikan (Shares)</span>
                      <span className="text-sm font-extrabold text-gray-900">{printData.totalShares.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 text-center text-[9px] text-gray-400 flex justify-between">
                <span>Hubify Analytics System</span>
                <span>{lang === "id" ? "Halaman 2" : "Page 2"}</span>
              </div>
            </div>
          )}

          {/* PAGE 2: CONTENT */}
          {printSections.content && (
            <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2cm" }}>
              <div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                  <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                  <span className="text-xs font-bold text-gray-500">{printData.rangeLabel}</span>
                </div>
                
                <h2 className="text-xl font-extrabold text-gray-950 uppercase tracking-tight mb-2">2. Analisis Kinerja Konten</h2>
                <p className="text-xs text-gray-500 mb-6">Daftar konten terpopuler diurutkan berdasarkan skor keterlibatan (engagement) tertinggi.</p>
                
                <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4">Konten / Keterangan</th>
                        <th className="py-3 px-4 w-24 text-center">Platform</th>
                        <th className="py-3 px-4 w-20 text-right">Views</th>
                        <th className="py-3 px-4 w-20 text-right">Reach</th>
                        <th className="py-3 px-4 w-24 text-right">Engagement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printData.topPosts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400">{lang === "id" ? "Tidak ada konten yang diterbitkan di periode ini." : "No content published in this period."}</td>
                        </tr>
                      ) : (
                        printData.topPosts.map((post: any, index: number) => {
                          const getV = (c: any) => (c.metrics?.views || 0) + (c.isAds ? c.adsMetrics?.views || 0 : 0);
                          const getR = (c: any) => (c.metrics?.reach || 0) + (c.isAds ? c.adsMetrics?.reach || 0 : 0);
                          const getEng = (c: any) => eng(c.metrics) + (c.isAds ? eng(c.adsMetrics || {}) : 0);
                          const erVal = getR(post) > 0 ? ((getEng(post) / getR(post)) * 100).toFixed(1) : "0.0";
                          
                          return (
                            <tr key={post.id || index} className="border-b border-gray-100 last:border-none">
                              <td className="py-4 px-4 text-center text-gray-400 font-bold">{index + 1}</td>
                              <td className="py-4 px-4">
                                <span className="block font-bold text-gray-900 line-clamp-2 max-w-sm">{post.caption || post.title || "Konten tanpa judul"}</span>
                                <span className="block text-[10px] text-gray-400 mt-1">{post.day}/{post.month}/{post.year} • {post.status} {post.isAds ? "• Ad Campaign" : ""}</span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 capitalize">{post.platform}</span>
                              </td>
                              <td className="py-4 px-4 text-right text-gray-600 font-medium">{getV(post).toLocaleString('id-ID')}</td>
                              <td className="py-4 px-4 text-right text-gray-600 font-medium">{getR(post).toLocaleString('id-ID')}</td>
                              <td className="py-4 px-4 text-right font-bold text-gray-900">{getEng(post).toLocaleString('id-ID')} <span className="block text-[9px] text-blue-600 font-normal">({erVal}%)</span></td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="print-card p-5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 leading-relaxed">
                  <span className="block font-bold text-gray-900 mb-1">Kesimpulan Performa Konten:</span>
                  Postingan dengan interaksi visual yang kuat, caption yang interaktif, dan penempatan iklan (Ads Campaign) yang strategis menunjukkan tingkat retensi audiens tertinggi. Kami menyarankan untuk mereplikasi format visual dari 3 konten terpopuler di atas untuk strategi kampanye media sosial selanjutnya.
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 text-center text-[9px] text-gray-400 flex justify-between">
                <span>Hubify Analytics System</span>
                <span>{lang === "id" ? "Halaman 3" : "Page 3"}</span>
              </div>
            </div>
          )}

          {/* PAGE 3: TRENDS */}
          {printSections.trends && (
            <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2cm" }}>
              <div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                  <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                  <span className="text-xs font-bold text-gray-500">{printData.rangeLabel}</span>
                </div>
                
                <h2 className="text-xl font-extrabold text-gray-950 uppercase tracking-tight mb-2">3. Tren & Pertumbuhan Kinerja</h2>
                <p className="text-xs text-gray-500 mb-6">Analisis kurva perkembangan views dan jangkauan media sosial seiring berjalannya waktu.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {activeMetrics.map((k) => (
                    <div key={k} className="print-card p-4 rounded-2xl border border-gray-100 bg-white">
                      <span className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2 text-center">
                        {(lang === "id" ? METRICS_META[k]?.label : METRICS_META[k]?.labelEn) || k}
                      </span>
                      <div className="w-full flex justify-center">
                        {printData.timelineData && printData.timelineData.length > 0 ? (
                          <LineChart width={310} height={180} data={printData.timelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="date" tick={{ fontSize: 8, fill: "#9ca3af" }} />
                            <YAxis tick={{ fontSize: 8, fill: "#9ca3af" }} width={40} />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey={k} 
                              name={(lang === "id" ? METRICS_META[k]?.label : METRICS_META[k]?.labelEn) || k} 
                              stroke={METRICS_META[k]?.color || "#2563eb"} 
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        ) : (
                          <div className="w-[310px] h-[180px] flex items-center justify-center text-gray-400 text-xs">Data tidak tersedia.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3 text-center text-[9px] text-gray-400 flex justify-between">
                <span>Hubify Analytics System</span>
                <span>{lang === "id" ? "Halaman 4" : "Page 4"}</span>
              </div>
            </div>
          )}

          {/* PAGE 4: AUDIENCE */}
          {printSections.audience && (
            <div className="print-page flex flex-col justify-between" style={{ minHeight: "297mm", padding: "2cm" }}>
              <div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-8">
                  <span className="text-xs font-extrabold tracking-wider text-gray-400 uppercase">Hubify Analytics Report</span>
                  <span className="text-xs font-bold text-gray-500">{printData.rangeLabel}</span>
                </div>
                
                <h2 className="text-xl font-extrabold text-gray-950 uppercase tracking-tight mb-2">4. Analisis Demografi Audiens</h2>
                <p className="text-xs text-gray-500 mb-6">Profil demografis audiens berdasarkan jenis kelamin, wilayah negara, dan sebaran usia.</p>
                
                {printData.demographics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="print-card p-5 rounded-2xl bg-white border border-gray-100 flex flex-col justify-between">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">Distribusi Gender</h4>
                        <div className="flex items-center justify-between text-xs text-gray-700 font-bold mb-4">
                          <span className="text-pink-500">{printData.demographics.gender?.female || 50}% Wanita</span>
                          <span className="text-blue-500">{printData.demographics.gender?.male || 50}% Pria</span>
                        </div>
                        <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden flex">
                          <div className="h-full bg-pink-500" style={{ width: `${printData.demographics.gender?.female || 50}%` }} />
                          <div className="h-full bg-blue-500 flex-1" />
                        </div>
                      </div>

                      <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">Sebaran Usia</h4>
                        <div className="space-y-2 text-xs">
                          {(printData.demographics.age || []).slice(0, 4).map((a: any) => (
                            <div key={a.range} className="flex items-center justify-between py-0.5 border-b border-gray-50 last:border-none">
                              <span className="text-gray-500 font-medium">{a.range} tahun</span>
                              <span className="font-extrabold text-gray-900">{a.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="print-card p-5 rounded-2xl bg-white border border-gray-100">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">Geografi Teratas (Negara)</h4>
                        <div className="space-y-2 text-xs">
                          {(printData.demographics.countries || []).slice(0, 4).map((c: any) => (
                            <div key={c.name} className="flex items-center justify-between py-0.5 border-b border-gray-50 last:border-none">
                              <span className="text-gray-500 font-medium">{c.name}</span>
                              <span className="font-extrabold text-gray-900">{c.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="print-card p-5 rounded-2xl border border-gray-100 bg-white flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3">Distribusi Perangkat</h4>
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-4">
                            {(printData.demographics.devices || []).slice(0, 3).map((d: any) => (
                              <div key={d.name} className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <span className="block text-gray-400 uppercase font-bold text-[8px] mb-1">{d.name}</span>
                                <span className="block text-xs font-extrabold text-gray-900">{d.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-1.5">Minat Teratas Audiens</h4>
                          <div className="flex flex-wrap gap-1">
                            {(printData.demographics.interests || []).slice(0, 4).map((i: any) => (
                              <span key={i.name} className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-600 border border-gray-200">{i.name} ({i.percentage}%)</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="print-card p-8 text-center text-gray-400 text-xs">Data demografi tidak tersedia.</div>
                )}
              </div>
              
              <div className="border-t border-gray-100 pt-3 text-center text-[9px] text-gray-400 flex justify-between">
                <span>Hubify Analytics System</span>
                <span>{lang === "id" ? "Halaman 5" : "Page 5"}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-report-container, #print-report-container * {
            visibility: visible !important;
          }
          #print-report-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            z-index: 9999999 !important;
          }

          /* Force page-breaks on custom sections */
          .print-page {
            page-break-after: always !important;
            break-after: page !important;
            padding: 2cm !important;
            box-sizing: border-box !important;
            min-height: 297mm; /* Standard A4 height */
          }
          .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          /* Disable shadows and borders that render badly in PDF */
          .print-card {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </>
  );
}
