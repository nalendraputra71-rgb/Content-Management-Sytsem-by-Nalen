import { useState, useMemo, useRef, useEffect } from "react";
import { useI18n } from "./i18n";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth, callAiWithQuota } from "./firebase";
import { usePlanLimits } from "./hooks/usePlanLimits";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell, PieChart as RPieChart, Pie } from "recharts";
import { DemoEditModal } from "./components/DemoEditModal";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, TrendingUp, Sparkles, PieChart, Users, BarChart2, Activity, Calendar, Zap, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, Target, Star, Settings, Check, RotateCcw, SlidersHorizontal, Globe, Smartphone, Heart, Edit2, X, Download, ZoomIn, ZoomOut, Eye } from "lucide-react";

import { 
  MONTHS, MS, DAYS_S, DAYS_S_EN, DAYS_ID, DAYS_EN, YEARS, MK, MC,
  eng, fmt, gps,
  I, B, CARD, PBadge, htmlToPlainText 
} from "./data";

import { 
  CustomLegend, 
  GeminiIcon, 
  LoadingDots, 
  SocialThumbnail, 
  getBlankDemographics, 
  getDemographicsForPlatform, 
  getAggregatedDemographics, 
  METRICS_META 
} from "./components/Analytics/analyticsHelpers";

import { 
  CustomDropdown, 
  MobileStepper, 
  MobileFilterDropdown, 
  PlatformFilterPopover, 
  DateFilterPopover 
} from "./components/Analytics/AnalyticsFilters";

import { 
  MCard, 
  CDataList 
} from "./components/Analytics/AnalyticsCards";

import { PrintReportModal } from "./components/Analytics/PrintReportModal";













export function AnalyticsView({
  content: originalContent,
  pillars,
  platforms,
  contentTypes,
  pics,
  statuses,
  openEdit,
  isRestricted,
  isTutorialActive,
  userProfile,
  planDetails,
  workspaceId,
  workspaceSettings,
  onUpdateSettings,
  activeSubTab: activeSubTabProp,
  setActiveSubTab: setActiveSubTabProp
}: any) {
  const { hasCapability } = usePlanLimits(planDetails);
  const { lang } = useI18n();
  
  const [extraContent, setExtraContent] = useState<any[]>([]);
  const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set());
  const content = useMemo(() => {
    if (isTutorialActive) {
      // Generate dummy content for the tutorial. 
      // Distribute dates over the last 90 days for better trend visualization
      const dummy = [];
      const now = new Date();
      for (let i = 0; i < 90; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - Math.floor(Math.random() * 90));
        dummy.push({
          id: 'dummy_' + i,
          title: 'Dummy Content ' + (i+1),
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          status: 'Published',
          platform: ['Instagram', 'TikTok', 'Facebook'][Math.floor(Math.random() * 3)],
          contentType: ['Reels', 'Carousel', 'Single Post', 'Video'][Math.floor(Math.random() * 4)],
          pic: ['PIC A', 'PIC B', 'PIC C'][Math.floor(Math.random() * 3)],
          metrics: {
            views: Math.floor(Math.random() * 10000) + 1000,
            reach: Math.floor(Math.random() * 8000) + 500,
            engagement: Math.floor(Math.random() * 500) + 50,
            likes: Math.floor(Math.random() * 400) + 50,
            comments: Math.floor(Math.random() * 100) + 5,
            shares: Math.floor(Math.random() * 50) + 1,
            saves: Math.floor(Math.random() * 40) + 1,
          },
          uploadHour: Math.floor(Math.random() * 24),
          isAds: Math.random() > 0.8
        });
      }
      return dummy;
    }
    const map = new Map();
    (originalContent || []).forEach((c: any) => map.set(c.id, c));
    extraContent.forEach(c => map.set(c.id, c));
    return Array.from(map.values());
  }, [originalContent, extraContent, isTutorialActive]);


  

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [dateFilt,setDateFilt] = useState("tm"); 
  const [customS,setCustomS] = useState("");
  const [customE,setCustomE] = useState("");

  // Fetch historical analytics data for requested date range
  useEffect(() => {
    if (!workspaceId || isTutorialActive) return;

    const now = new Date();
    now.setHours(0,0,0,0);
    let targetS = new Date(now);
    let targetE = new Date(now);
    let prevS = new Date(now);
    let prevE = new Date(now);
    let fetchAll = false;

    if(dateFilt === "custom") {
      if (customS) {
         const [y, m, d] = customS.split('-');
         targetS = new Date(Number(y), Number(m)-1, Number(d), 0, 0, 0, 0);
      } else {
         targetS = new Date(0);
      }
      if (customE) {
         const [y, m, d] = customE.split('-');
         targetE = new Date(Number(y), Number(m)-1, Number(d), 23, 59, 59, 999);
      } else {
         targetE = new Date("2100-01-01");
      }
      const diffDays = Math.ceil((targetE.getTime() - targetS.getTime()) / 86400000);
      prevS = new Date(targetS);
      prevS.setDate(prevS.getDate() - diffDays);
      prevE = new Date(targetS);
      prevE.setDate(prevE.getDate() - 1);
    } else if(dateFilt === "all") {
      fetchAll = true;
    } else {
      const dayOfWeek = now.getDay();
      if(dateFilt==="yesterday") {
        targetS.setDate(now.getDate()-1);
        targetE = new Date(targetS);
      } else if(dateFilt==="7d") {
        targetS.setDate(now.getDate()-7);
      } else if(dateFilt==="28d") {
        targetS.setDate(now.getDate()-28);
      } else if(dateFilt==="90d") {
        targetS.setDate(now.getDate()-90);
      } else if(dateFilt==="tw") {
        targetS.setDate(now.getDate() - dayOfWeek);
      } else if(dateFilt==="tm") {
        targetS.setDate(1);
      } else if(dateFilt==="ty") {
        targetS.setMonth(0);
        targetS.setDate(1);
      } else if(dateFilt==="lw") {
        targetS.setDate(now.getDate() - dayOfWeek - 7);
        targetE = new Date(targetS);
        targetE.setDate(targetS.getDate() + 6);
      } else if(dateFilt==="lm") {
        targetS.setDate(1);
        targetS.setMonth(now.getMonth()-1);
        targetE = new Date(now.getFullYear(), now.getMonth(), 0); 
      }
      const diff = targetE.getTime() - targetS.getTime() + 86400000;
      prevE = new Date(targetS.getTime() - 86400000);
      prevS = new Date(targetS.getTime() - diff);
    }

    const neededMonths = new Set<string>();
    
    if (fetchAll) {
       // if all is selected, we could fetch everything but that might be heavy
       // let's just fetch all contents for the workspace
       neededMonths.add("ALL");
    } else {
       const dates = [targetS, targetE, prevS, prevE];
       const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
       const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
       
       let curr = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
       const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
       while(curr <= end) {
         neededMonths.add(curr.getFullYear() + "-" + (curr.getMonth() + 1));
         curr.setMonth(curr.getMonth() + 1);
       }
    }

    const monthsToFetch = Array.from(neededMonths).filter(m => !fetchedMonths.has(m));
    if (monthsToFetch.length === 0) return; // already fetched

    const fetchMonthsData = async () => {
       try {
          if (monthsToFetch.includes("ALL")) {
             const q = query(collection(db, "workspaces", workspaceId, "content"));
             const snap = await getDocs(q);
             const docs = snap.docs.map(d => ({id: d.id, ...d.data()}));
             setExtraContent(docs);
             setFetchedMonths(new Set(["ALL"]));
          } else {
             const promises = monthsToFetch.map(m => {
                const [y, mo] = m.split("-").map(Number);
                const q = query(collection(db, "workspaces", workspaceId, "content"), 
                   where("year", "==", y), 
                   where("month", "==", mo)
                );
                return getDocs(q);
             });
             const snaps = await Promise.all(promises);
             let newDocs: any[] = [];
             snaps.forEach(snap => {
                newDocs = newDocs.concat(snap.docs.map(d => ({id: d.id, ...d.data()})));
             });
             setExtraContent(prev => {
                const map = new Map();
                prev.forEach(c => map.set(c.id, c));
                newDocs.forEach(c => map.set(c.id, c));
                return Array.from(map.values());
             });
             setFetchedMonths(prev => {
                const next = new Set(prev);
                monthsToFetch.forEach(m => next.add(m));
                return next;
             });
          }
       } catch (err) {
          console.error("Failed to fetch historical analytics data:", err);
       }
    };
    
    fetchMonthsData();

  }, [workspaceId, isTutorialActive, dateFilt, customS, customE]);


  useEffect(() => {
    if (isTutorialActive) {
      setDateFilt("90d");
    } else {
      setDateFilt("tm");
    }
  }, [isTutorialActive]);
  const [adsFilter,setAdsFilter] = useState("organic"); 
  const [platformFilter, setPlatformFilter] = useState("all");

  const platformOptions = useMemo(() => {
    const list = [{ id: "all", label: lang === "id" ? "Semua Platform" : "All Platforms" }];
    if (platforms) {
      platforms.forEach((p: any) => {
        const val = typeof p === 'string' ? p : p.name;
        list.push({ id: val, label: val });
      });
    }
    return list;
  }, [platforms, lang]);

  const adsOptions = useMemo(() => [
    { id: "all", label: lang === "id" ? "Semua Data" : "All Data" },
    { id: "organic", label: "Organic" },
    { id: "ads", label: "Ads Only" }
  ], [lang]);

  const dateOptions = useMemo(() => [
    {id:"yesterday", label: lang === "id" ? "Kemarin" : "Yesterday"},
    {id:"7d", label: lang === "id" ? "7 Hari Terakhir" : "Last 7 days"},
    {id:"28d", label: lang === "id" ? "28 Hari Terakhir" : "Last 28 days"},
    {id:"90d", label: lang === "id" ? "90 Hari Terakhir" : "Last 90 days"},
    {id:"tw", label: lang === "id" ? "Minggu Ini" : "This week"},
    {id:"tm", label: lang === "id" ? "Bulan Ini" : "This month"},
    {id:"ty", label: lang === "id" ? "Tahun Ini" : "This year"},
    {id:"lw", label: lang === "id" ? "Minggu Lalu" : "Last week"},
    {id:"lm", label: lang === "id" ? "Bulan Lalu" : "Last month"},
  ], [lang]);

  // States for Mobile Bottom Sheets and Temp Date Options
  const [activeDrawerFilter, setActiveDrawerFilter] = useState<"platform" | "date" | "view" | "metrics" | "all_filters" | null>(null);
  const [tempDateFilt, setTempDateFilt] = useState(dateFilt);
  const [tempCustomS, setTempCustomS] = useState(customS);
  const [tempCustomE, setTempCustomE] = useState(customE);
  const [tempPlatformFilter, setTempPlatformFilter] = useState(platformFilter);
  const [tempAdsFilter, setTempAdsFilter] = useState(adsFilter);

  useEffect(() => {
    if (activeDrawerFilter === "date" || activeDrawerFilter === "all_filters") {
      setTempDateFilt(dateFilt);
      setTempCustomS(customS);
      setTempCustomE(customE);
    }
    if (activeDrawerFilter === "all_filters") {
      setTempPlatformFilter(platformFilter);
      setTempAdsFilter(adsFilter);
    }
  }, [activeDrawerFilter, dateFilt, customS, customE, platformFilter, adsFilter]);

  const [demographics, setDemographics] = useState<any>(() => {
    if (workspaceSettings?.demographics && Object.keys(workspaceSettings.demographics).length > 0) {
      return workspaceSettings.demographics;
    }
    const saved = localStorage.getItem("hubify_custom_demographics");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load demographics from localStorage:", e);
      }
    }
    return {};
  });

  useEffect(() => {
    if (workspaceSettings?.demographics && Object.keys(workspaceSettings.demographics).length > 0) {
      setDemographics(workspaceSettings.demographics);
      try {
        localStorage.setItem("hubify_custom_demographics", JSON.stringify(workspaceSettings.demographics));
      } catch (e) {}
    }
  }, [workspaceSettings?.demographics]);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeMetrics,setActiveMetrics] = useState(["views", "reach", "likes", "comments"]);
  const [topSort,setTopSort] = useState("engagement");
  const [topPlatform,setTopPlatform] = useState("All");
  const [platformMetric, setPlatformMetric] = useState("engagement");
  const [platformChartType, setPlatformChartType] = useState("doughnut");
  const [picChartType, setPicChartType] = useState("doughnut");
  const [heatmapMetric, setHeatmapMetric] = useState("engagement");
  const [activeSubTabState, setActiveSubTabState] = useState("overview");
  const activeSubTab = activeSubTabProp !== undefined ? activeSubTabProp : activeSubTabState;
  const setActiveSubTab = setActiveSubTabProp !== undefined ? setActiveSubTabProp : setActiveSubTabState;

  // States for Cetak Laporan PDF
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);


  const platformNames = useMemo(() => {
    return (platforms || []).map((p: any) => typeof p === 'string' ? p : p.name);
  }, [platforms]);

  const handleOpenPrintModal = () => {
    if (!hasCapability('pdfExport')) {
      alert(lang === 'id' ? 'Upgrade paket untuk mengekspor Laporan PDF.' : 'Upgrade plan to export PDF Reports.');
      return;
    }
    setIsPrintModalOpen(true);
  };

  const printData: any = null; /*
    if (!isPrintModalOpen && !isPrintReady) return null;

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

      if (adsFilter !== "all") {
        const matchAds = adsFilter === "all" || (adsFilter === "ads" ? !!c.isAds : !c.isAds);
        if (!matchAds) return false;
      }

      const itemPlatforms = String(c.platform).split(',').map(s => s.trim().toLowerCase());
      const selectedLower = printPlatforms.map(p => p.toLowerCase());
      
      return itemPlatforms.some(ip => selectedLower.includes(ip));
    });

    const getV = (c: any) => (c.metrics?.views || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.views || 0 : 0);
    const getR = (c: any) => (c.metrics?.reach || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.reach || 0 : 0);
    const getLikes = (c: any) => (c.metrics?.likes || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.likes || 0 : 0);
    const getComments = (c: any) => (c.metrics?.comments || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.comments || 0 : 0);
    const getShares = (c: any) => (c.metrics?.shares || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.shares || 0 : 0);
    const getEng = (c: any) => eng(c.metrics) + (c.isAds || adsFilter === "all" ? eng(c.adsMetrics || {}) : 0);

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
    
    // Fill in all days between finalStartDate and finalEndDate
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
  */

  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const topAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!topAnchorRef.current) return;
    const observer = new IntersectionObserver(([ent]) => setIsScrolled(!ent.isIntersecting), { threshold: 1 });
    observer.observe(topAnchorRef.current);
    return () => observer.disconnect();
  }, []);
  const [showAiInsight, setShowAiInsight] = useState(true);

  useEffect(() => {
    setAiInsight("");
  }, [dateFilt, customS, customE, adsFilter, platformFilter]);

  const [isMetricSettingOpen, setIsMetricSettingOpen] = useState(false);
  const [tempSelectedMetrics, setTempSelectedMetrics] = useState<string[]>(["views", "reach", "likes", "comments"]);
  const metricSettingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (metricSettingRef.current && !metricSettingRef.current.contains(event.target as Node)) {
        setIsMetricSettingOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openMetricSetting = () => {
    setTempSelectedMetrics([...activeMetrics]);
    setIsMetricSettingOpen(true);
  };

  const toggleTempMetric = (k: string) => {
    setTempSelectedMetrics(prev =>
      prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
    );
  };

  const applyMetrics = () => {
    setActiveMetrics([...tempSelectedMetrics]);
    setIsMetricSettingOpen(false);
  };

  const resetToDefaultMetrics = () => {
    setTempSelectedMetrics(["views", "reach", "likes", "comments"]);
  };

  // Handle Quick Filters & Custom via date logic 
  const { base, prevBase } = useMemo(() => {
    const isDateMatch = (c:any, isPrev:boolean=false) => {
      let cdt = new Date(c.year, c.month - 1, c.day);
      const now = new Date();
      now.setHours(0,0,0,0);
      
      if(dateFilt==="custom") {
        let sDate = new Date(0);
        let eDate = new Date("2100-01-01");
        if (customS) {
           const [y, m, d] = customS.split('-');
           sDate = new Date(Number(y), Number(m)-1, Number(d), 0, 0, 0, 0);
        }
        if (customE) {
           const [y, m, d] = customE.split('-');
           eDate = new Date(Number(y), Number(m)-1, Number(d), 23, 59, 59, 999);
        }
        if(!isPrev) return cdt >= sDate && cdt <= eDate;
        const diffDays = Math.ceil((eDate.getTime() - sDate.getTime()) / 86400000);
        const prevSDate = new Date(sDate);
        prevSDate.setDate(prevSDate.getDate() - diffDays);
        return cdt >= prevSDate && cdt < sDate;
      }
      if(dateFilt==="all") return !isPrev;
      
      let targetS = new Date(now);
      let targetE = new Date(now);
      
      const dayOfWeek = now.getDay();

      if(dateFilt==="yesterday") {
        targetS.setDate(now.getDate()-1);
        targetE = new Date(targetS);
      } else if(dateFilt==="7d") {
        targetS.setDate(now.getDate()-7);
      } else if(dateFilt==="28d") {
        targetS.setDate(now.getDate()-28);
      } else if(dateFilt==="90d") {
        targetS.setDate(now.getDate()-90);
      } else if(dateFilt==="tw") {
        targetS.setDate(now.getDate() - dayOfWeek);
      } else if(dateFilt==="tm") {
        targetS.setDate(1);
      } else if(dateFilt==="ty") {
        targetS.setMonth(0);
        targetS.setDate(1);
      } else if(dateFilt==="lw") {
        targetS.setDate(now.getDate() - dayOfWeek - 7);
        targetE = new Date(targetS);
        targetE.setDate(targetS.getDate() + 6);
      } else if(dateFilt==="lm") {
        targetS.setDate(1);
        targetS.setMonth(now.getMonth()-1);
        targetE = new Date(now.getFullYear(), now.getMonth(), 0); 
      }
      if(isPrev) {
        const diff = targetE.getTime() - targetS.getTime() + 86400000;
        targetE = new Date(targetS.getTime() - 86400000);
        targetS = new Date(targetS.getTime() - diff);
      }
      
      return cdt >= targetS && cdt <= targetE;
    };

    const filteredByPlatformAndAds = content.filter((c: any) => 
      (adsFilter === "all" || (adsFilter === "ads" ? !!c.isAds : !c.isAds)) && 
      (platformFilter === "all" || String(c.platform).split(',').map(s=>s.trim()).includes(platformFilter))
    );

    return {
      base: filteredByPlatformAndAds.filter((c: any) => isDateMatch(c)),
      prevBase: filteredByPlatformAndAds.filter((c: any) => isDateMatch(c, true))
    };
  }, [content, dateFilt, customS, customE, adsFilter, platformFilter]);
  
  const getEng = (c:any) => eng(c.metrics) + (c.isAds||adsFilter==="all"?eng(c.adsMetrics||{}):0);
  const getV = (c:any) => (c.metrics?.views||0) + (c.isAds||adsFilter==="all"?c.adsMetrics?.views||0:0);
  const getR = (c:any) => (c.metrics?.reach||0) + (c.isAds||adsFilter==="all"?c.adsMetrics?.reach||0:0);
  const getLikes = (c: any) => (c.metrics?.likes || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.likes || 0 : 0);
  const getComments = (c: any) => (c.metrics?.comments || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.comments || 0 : 0);
  const getShares = (c: any) => (c.metrics?.shares || 0) + (c.isAds || adsFilter === "all" ? c.adsMetrics?.shares || 0 : 0);
  
  const total  = base.length;
  const pub    = base.filter((c:any)=>c.status==="Published").length;
  
  // Randomize numbers if restricted to prevent data leak but show structure
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  const getRand = (val: number, seed: number) => val;
  
  const tV = getRand(base.reduce((s:any,c:any)=>s+getV(c),0), 1);
  const tR = getRand(base.reduce((s:any,c:any)=>s+getR(c),0), 2);
  const tE = getRand(base.reduce((s:any,c:any)=>s+getEng(c),0), 3);
  const er = tR>0?((tE/tR)*100).toFixed(2):"0.00";

  const tClicks = getRand(base.reduce((s:any,c:any)=>s+(c.adsMetrics?.clicks||0),0), 4);
  const tConv = getRand(base.reduce((s:any,c:any)=>s+(c.adsMetrics?.conversions||0),0), 5);

  // Prev Calculations
  const prevTotal = prevBase.length;
  const prevTV = prevBase.reduce((s:any,c:any)=>s+getV(c),0);
  const prevTR = prevBase.reduce((s:any,c:any)=>s+getR(c),0);
  const prevTE = prevBase.reduce((s:any,c:any)=>s+getEng(c),0);
  const prevTClicks = prevBase.reduce((s:any,c:any)=>s+(c.adsMetrics?.clicks||0),0);
  const prevTConv = prevBase.reduce((s:any,c:any)=>s+(c.adsMetrics?.conversions||0),0);
  const prevER = prevTR>0?((prevTE/prevTR)*100):0;
  
  const calcPct = (curr:number, prev:number) => {
    if(dateFilt==="all") return null;
    if(prev===0) return curr>0 ? "+100%" : "0%";
    const pct = ((curr-prev)/prev)*100;
    return (pct>0?"+":"")+pct.toFixed(1)+"%";
  };

  const pctColor = (pctStr:string|null) => {
    if(!pctStr) return "transparent";
    if(pctStr.startsWith("+")) return "#7DC8A4";
    if(pctStr.startsWith("-")) return "#E57373";
    return "rgba(44,32,22,0.4)";
  };

  const getPeriodText = () => {
    if(dateFilt==="all") return "";
    if(dateFilt==="yesterday") return lang === "id" ? "vs hari sebelumnya" : "vs prev day";
    if(dateFilt==="ty") return lang === "id" ? "vs tahun lalu" : "vs last year";
    return lang === "id" ? "vs periode sebelumnya" : "vs prev period";
  }

  const pTotal = calcPct(total, prevTotal);
  const pV = calcPct(tV, prevTV);
  const pR = calcPct(tR, prevTR);
  const pE = calcPct(tE, prevTE);
  const pC = calcPct(tClicks, prevTClicks);
  const pCv = calcPct(tConv, prevTConv);

  // Chart Data (Adjusts based on date filter)
  const lineData = useMemo(() => {
    let labels: { label: string, filter: (c: any) => boolean }[] = [];
    const now = new Date();
    
    let sDate = new Date();
    let eDate = new Date();
    
    // Normalize now to midnight to ensure clean day calculations
    now.setHours(0,0,0,0);
    eDate = new Date(now);

    if (dateFilt === "tm") {
       sDate = new Date(now.getFullYear(), now.getMonth(), 1);
       eDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
    } else if (dateFilt === "lm") {
       sDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
       eDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (dateFilt === "yesterday") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
       eDate = new Date(sDate);
    } else if (dateFilt === "7d") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    } else if (dateFilt === "28d") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28);
    } else if (dateFilt === "90d") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    } else if (dateFilt === "tw") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    } else if (dateFilt === "lw") {
       sDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
       eDate = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate() + 6);
    } else if (dateFilt === "ty") {
       sDate = new Date(now.getFullYear(), 0, 1);
    } else if (dateFilt === "3m") {
       sDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    } else if (dateFilt === "6m") {
       sDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    } else if (dateFilt === "1y") {
       sDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    } else if (dateFilt === "custom") {
       sDate = new Date(now.getFullYear(), now.getMonth(), 1);
       eDate = new Date();
       if (customS) {
         const [y, m, d] = customS.split('-');
         sDate = new Date(Number(y), Number(m)-1, Number(d), 0, 0, 0, 0);
       }
       if (customE) {
         const [y, m, d] = customE.split('-');
         eDate = new Date(Number(y), Number(m)-1, Number(d), 0, 0, 0, 0);
       }
    } else {
       // all
       const years = content.length > 0 ? Array.from(new Set(content.map((c: any) => c.year))).sort() as number[] : [now.getFullYear()];
       const minYear = years[0];
       sDate = new Date(minYear, 0, 1);
    }

    const diff = eDate.getTime() - sDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days <= 95) {
       // Daily Breakdown
       for (let i = 0; i <= days; i++) {
          const dt = new Date(sDate.getTime() + i * 86400000);
          labels.push({
            label: days <= 35 ? `${dt.getDate()} ${MS[dt.getMonth()]}` : `${dt.getDate()}/${dt.getMonth() + 1}`,
            filter: (c: any) => c.day === dt.getDate() && c.month === (dt.getMonth() + 1) && c.year === dt.getFullYear()
          });
       }
    } else if (days <= 366) {
       // Weekly Breakdown
       const weeks = Math.ceil((days + 1) / 7);
       for (let i = 0; i < weeks; i++) {
          const wStart = new Date(sDate.getTime() + i * 7 * 86400000);
          const wEnd = new Date(Math.min(wStart.getTime() + 6 * 86400000, eDate.getTime()));
          labels.push({
            label: `${wStart.getDate()} ${MS[wStart.getMonth()]} - ${wEnd.getDate()} ${MS[wEnd.getMonth()]}`,
            filter: (c: any) => {
              const d = new Date(c.year, c.month - 1, c.day);
              // Normalize times
              d.setHours(0,0,0,0);
              return d.getTime() >= wStart.getTime() && d.getTime() <= wEnd.getTime();
            }
          });
       }
    } else {
       // Monthly Breakdown
       let curr = new Date(sDate.getFullYear(), sDate.getMonth(), 1);
       while (curr <= eDate) {
          const m = curr.getMonth() + 1;
          const y = curr.getFullYear();
          labels.push({
            label: `${MS[m - 1]} ${y % 100}`,
            filter: (c: any) => c.month === m && c.year === y
          });
          curr.setMonth(curr.getMonth() + 1);
       }
    }

    const preFiltered = content.filter((c: any) => 
      (adsFilter === "all" || (adsFilter === "ads" ? !!c.isAds : !c.isAds)) && 
      (platformFilter === "all" || String(c.platform).split(',').map(s=>s.trim()).includes(platformFilter))
    );

    return labels.map(({ label, filter }) => {
      const d = preFiltered.filter(filter);
      const row: any = { name: label };
      Object.keys(METRICS_META).forEach(k => {
        row[`${k}_org`] = d.filter((c: any) => !c.isAds).reduce((s: any, c: any) => s + (c.metrics?.[k] || 0), 0);
        row[`${k}_ads`] = d.filter((c: any) => c.isAds).reduce((s: any, c: any) => s + (c.adsMetrics?.[k] || 0), 0);
        row[k] = row[`${k}_org`] + row[`${k}_ads`];
      });
      row.engagement_org = d.filter((c: any) => !c.isAds).reduce((s: any, c: any) => s + eng(c.metrics), 0);
      row.engagement_ads = d.filter((c: any) => c.isAds).reduce((s: any, c: any) => s + eng(c.adsMetrics || {}), 0);
      row.engagement = row.engagement_org + row.engagement_ads;
      return row;
    });
  }, [content, dateFilt, customS, customE, adsFilter, platformFilter]);

  // Heatmap Data
  const heatmap = useMemo(() => {
    let m = Array(7).fill(0).map(() => Array(24).fill(0));
    base.filter((c:any)=>c.status==="Published").forEach((c:any) => {
      let cd = new Date(c.year, c.month - 1, c.day).getDay();
      let h = c.uploadHour || 9;
      if (h>=0 && h<24) {
        if (heatmapMetric === "engagement") m[cd][h] += getEng(c);
        else if (heatmapMetric === "views") m[cd][h] += getV(c);
        else if (heatmapMetric === "reach") m[cd][h] += getR(c);
      }
    });
    return m;
  }, [base, heatmapMetric]);

  // Platform Data
  const platformData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      const plats = c.platform ? String(c.platform).split(',').map(s=>s.trim()).filter(Boolean) : ["Tanpa Platform"];
      plats.forEach(p => {
        if(!pmap[p]) pmap[p] = {name:p, engagement:0, views:0, reach:0};
        pmap[p].engagement += getEng(c);
        pmap[p].views += getV(c);
        pmap[p].reach += getR(c);
      });
    });
    return platforms.map((p:any) => ({
      name: p.name,
      value: pmap[p.name] ? pmap[p.name][platformMetric] : 0,
      color: p.color
    })).sort((a:any, b:any) => b.value - a.value);
  }, [base, platforms, platformMetric]);
  // Pillar Data
  const [pillarMetric, setPillarMetric] = useState("engagement");
  const pillarData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      const p = c.pillar || "Tanpa Pilar";
      if(!pmap[p]) pmap[p] = {name:p, engagement:0, views:0, reach:0, total: 0};
      pmap[p].engagement += getEng(c);
      pmap[p].views += getV(c);
      pmap[p].reach += getR(c);
      pmap[p].total += 1;
    });
    return pillars.map((p:any) => ({
      name: p.name || p.id || p,
      value: pmap[p.name || p.id || p] ? pmap[p.name || p.id || p][pillarMetric] : 0,
      color: p.color || "#3B82F6",
      total: pmap[p.name || p.id || p] ? pmap[p.name || p.id || p].total : 0
    })).sort((a:any, b:any) => b.value - a.value);
  }, [base, pillars, pillarMetric]);

  // Content Type Data
  const [typeMetric, setTypeMetric] = useState("engagement");
  const typeData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      const t = c.contentType || "Tanpa Tipe";
      if(!pmap[t]) pmap[t] = {name:t, engagement:0, views:0, reach:0, total: 0};
      pmap[t].engagement += getEng(c);
      pmap[t].views += getV(c);
      pmap[t].reach += getR(c);
      pmap[t].total += 1;
    });
    return (contentTypes || []).map((t:any) => {
      const tName = t.name || t.id || t;
      return {
        name: tName,
        value: pmap[tName] ? pmap[tName][typeMetric] : 0,
        total: pmap[tName] ? pmap[tName].total : 0,
        color: t.color
      };
    }).sort((a:any, b:any) => b.value - a.value);
  }, [base, contentTypes, typeMetric]);

  const picData = useMemo(() => {
    const pmap: any = {};
    base.forEach((c:any)=>{
      const picsList = c.pic ? String(c.pic).split(',').map(s=>s.trim()).filter(Boolean) : ["Tanpa PIC"];
      picsList.forEach(p => {
        if(!pmap[p]) pmap[p] = {name:p, total:0, org:0, ads:0};
        pmap[p].total += 1;
        if(c.isAds) pmap[p].ads += 1;
        else pmap[p].org += 1;
      });
    });
    return Object.values(pmap).map((p:any) => {
      const userPic = (pics || []).find((x:any)=> (x.name || x.id || x) === p.name);
      return { ...p, color: userPic?.color };
    }).sort((a:any,b:any)=>b.total-a.total);
  }, [base, pics]);

  const fetchAiInsight = async () => {
    setAiLoading(true);
    setAiInsight("");
    try {
      // Extract data untuk LLM
      const topCont = base.filter((c:any)=>c.status==="Published"&&getV(c)>0).sort((a:any,b:any)=>getEng(b)-getEng(a)).slice(0,3);
      const badCont = base.filter((c:any)=>c.status==="Published"&&getV(c)>0).sort((a:any,b:any)=>getEng(a)-getEng(b)).slice(0,3);
      
      let bestDay = 0, bestHour = 0, maxEng = 0;
      heatmap.forEach((days, dIdx) => {
        days.forEach((engValue, hIdx) => {
          if(engValue > maxEng) { maxEng = engValue; bestDay = dIdx; bestHour = hIdx; }
        });
      });
      const bestTimeStr = maxEng > 0 
        ? `${(lang === "id" ? DAYS_ID : DAYS_EN)[bestDay]} ${lang === "id" ? "pukul" : "at"} ${bestHour}:00` 
        : (lang === "id" ? "Belum cukup data" : "Not enough data");
      const picDataStr = picData.map((p:any)=>`${p.name} (${p.total})`).join(", ");

      const prompt = `Anda adalah ahli Social Media Analyst. Buatlah Executive Summary yang profesional dan actionable berdasarkan data kinerja konten berikut:

Data Kinerja:
- Filter Waktu: ${dateFilt}
- Filter Platform: ${platformFilter}
- Total Konten: ${total} (${pTotal||"N/A"})
- Kinerja: Views ${fmt(tV)} (${pV||"N/A"}), Reach ${fmt(tR)} (${pR||"N/A"}), Eng. ${fmt(tE)} (${pE||"N/A"})
- Engagement Rate (ER): ${er}% (vs Prev: ${prevER.toFixed(2)}%)
- Kinerja Iklan: Clicks ${fmt(tClicks)} (${pC||"N/A"}), Conv ${fmt(tConv)} (${pCv||"N/A"})
- Waktu Terbaik Upload: ${bestTimeStr} (Peak Eng: ${maxEng})

Konten Terbaik (Top 3):
${topCont.map((c:any,i:number)=>`${i+1}. "${c.title}" [Pilar: ${c.pillar}, Platform: ${c.platform}, Eng: ${getEng(c)}]`).join("\n")}

Konten Terburuk (Bottom 3):
${badCont.map((c:any,i:number)=>`${i+1}. "${c.title}" [Pilar: ${c.pillar}, Platform: ${c.platform}, Eng: ${getEng(c)}]`).join("\n")}

Instruksi Format Output:
Berikan respons dalam bahasa Indonesia yang terstruktur dengan 3 bagian berikut:
1. Ringkasan Insight: Analisis kinerja keseluruhan, tren pertumbuhan, dan insight dari waktu tayang/metrik utama.
2. Evaluasi Konten: Analisis pola dari konten yang berhasil (Winners) vs kurang berhasil (Losers), apa yang membedakannya (misalnya topik, pilar, atau platform).
3. Next Step Pengembangan Konten: Berikan 3-5 saran konkrit dan actionable untuk pembuatan konten berikutnya berdasarkan data di atas.`;

      const data = await callAiWithQuota(auth.currentUser?.uid || 'anon', userProfile?.plan, { prompt, model: planDetails?.capabilities?.allowedModels?.[0] || "gemini-3.6-flash" }, planDetails?.aiTokenLimit);
      setAiInsight(data.text || lang === "id" ? "Tidak ada respon dari AI." : "No response from AI.");
    } catch(e:any) {
      console.error("AI Error:", e);
      const errMsg = e.message || "";
      if (errMsg.includes("habis")) {
        setAiInsight(errMsg);
      } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
        setAiInsight(lang === "id" ? "Gagal mendapatkan Executive Summary: Terlalu banyak permintaan AI secara bersamaan (Quota Exceeded). Silakan tunggu sekitar 30 detik lalu coba lagi." : "Failed to get Executive Summary: Too many AI requests at the same time (Quota Exceeded). Please wait about 30 seconds and try again.");
      } else {
        setAiInsight("Gagal mendapatkan Executive Summary: " + errMsg + ".\n\nPastikan VITE_GEMINI_API_KEY sudah diset di Settings > Secrets.");
      }
    }
    setAiLoading(false);
  };



  return (
    <div className="px-3 md:px-6 pb-6 flex flex-col gap-4 md:gap-5 w-full min-h-screen relative font-sans">
      <div ref={topAnchorRef} className="absolute top-0 left-0 h-[1px] w-full" />
      
      {/* Header */}
      <div className="pt-4 md:pt-6 pb-2 flex justify-between items-start md:items-end gap-4">
         <div className="min-w-0 flex-1">
           <h1 className="text-2xl font-extrabold m-0 text-gray-900 tracking-tight flex items-center gap-2">
             {activeSubTab === "overview" && "Overview"}
             {activeSubTab === "content" && "Content"}
             {activeSubTab === "trends" && "Trends"}
             {activeSubTab === "activity" && "Audience"}
             <Sparkles size={20} className="text-blue-600 shrink-0" />
           </h1>
           <p className="text-sm text-gray-500 mt-1">
             {activeSubTab === "overview" && "Monitor overall content performance summaries with real-time data."}
             {activeSubTab === "content" && "Analyze the detailed performance of each post and your content types."}
             {activeSubTab === "trends" && "Track growth graphics of key metrics and campaign effectiveness over time."}
             {activeSubTab === "activity" && "Identify the best times and highest interactions of your audience based on posting times."}
           </p>
         </div>
         <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
           {isMobile && (
             <button
               onClick={() => {
                 setTempSelectedMetrics([...activeMetrics]);
                 setTempDateFilt(dateFilt);
                 setTempCustomS(customS || "");
                 setTempCustomE(customE || "");
                 setTempPlatformFilter(platformFilter);
                 setTempAdsFilter(adsFilter);
                 setActiveDrawerFilter("all_filters");
               }}
               className="p-3 rounded-2xl bg-black/[0.03] active:bg-black/[0.08] text-gray-900 flex items-center justify-center shadow-sm cursor-pointer border-none active:scale-95 transition-all relative"
               style={{ width: 44, height: 44 }}
               title={lang === "id" ? "Filter" : "Filter"}
             >
               <SlidersHorizontal size={18} />
               {/* Show an indicator badge if filters are customized */}
               {(platformFilter !== "all" || dateFilt !== "tm" || adsFilter !== "all" || activeMetrics.length !== 4) && (
                 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white" />
               )}
             </button>
           )}
           <button onClick={handleOpenPrintModal} className="hidden md:flex hover-scale btn-hover px-4 py-2 rounded-xl h-10 text-[13px] font-bold bg-white border border-black/[0.04] text-gray-900 shadow-sm items-center gap-2 cursor-pointer transition-all">
              <Download size={16} className="text-gray-900" />
              {lang === "id" ? "Simpan Laporan PDF" : "Save PDF Report"}
           </button>
         </div>
      </div>

      {/* Filters */}
      {!isMobile && (
        <div className="flex items-center justify-start gap-4 flex-wrap mb-4 bg-white border border-black/[0.03] rounded-full pl-8 pr-6 py-3.5 shadow-sm">
          <div className="flex gap-4 items-center flex-wrap">
            <PlatformFilterPopover 
              platformFilter={platformFilter} 
              setPlatformFilter={setPlatformFilter} 
              platforms={platforms} 
            />

            <div className="w-px h-6 bg-black/[0.06] shrink-0"/>

            <div className="flex gap-0.5 bg-black/[0.03] p-1 rounded-full border border-black/[0.01]">
              {[["all",lang === "id" ? "Semua Data" : "All Data"],["organic","Organic"],["ads","Ads Only"]].map(([k,l])=>(
                <button key={k} onClick={()=>setAdsFilter(k)} className={`text-xs font-bold px-4 py-1.5 rounded-full border-none cursor-pointer transition-colors ${adsFilter===k ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>{l}</button>
              ))}
            </div>

            <div className="w-px h-6 bg-black/[0.06] shrink-0"/>

            <DateFilterPopover 
              dateFilt={dateFilt} setDateFilt={setDateFilt}
              customS={customS} setCustomS={setCustomS}
              customE={customE} setCustomE={setCustomE}
            />
          </div>
        </div>
      )}

      {/* Restricted Overlay & Main Dashboard Content */}
      <div className="relative">

        {(!hasCapability('heatmaps') || !hasCapability('topBadAnalysis') || !hasCapability('platformAnalytics')) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 rounded-[20px]">
            <div className="bg-white/80 p-6 md:p-8 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] text-center max-w-[400px] border border-white/70">
              <AlertCircle size={40} className="text-blue-500 mx-auto mb-3" />
              <h3 className="text-[18px] font-bold mb-2 text-gray-900 tracking-tight">{lang === 'id' ? 'Akses Analitik Premium' : 'Premium Analytics Access'}</h3>
              <p className="text-[13px] text-gray-600 mb-5 leading-relaxed">{lang === 'id' ? 'Upgrade ke paket yang lebih tinggi untuk membuka analitik premium, AI Insights mendalam, heatmap performa, dan integrasi multi-platform.' : 'Upgrade your plan to unlock premium analytics, deep AI Insights, performance heatmaps, and multi-platform integration.'}</p>
              <button className="hover-scale w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold text-[14px] border-none cursor-pointer shadow-[0_4px_14px_rgba(59,130,246,0.4)]" onClick={()=>window.location.href="/billing"}>{lang === 'id' ? 'Upgrade Sekarang' : 'Upgrade Now'}</button>
            </div>
          </div>
        )}


        <div className={`flex flex-col gap-6 ${isRestricted ? "blur-[8px] pointer-events-none select-none" : ""}`}>
          
          {/* VIEW: OVERVIEW */}
          {activeSubTab === "overview" && (
            <>
              {/* Metrics Row */}
              <div id="analytics-metrics-row" className="flex flex-wrap gap-4 w-[calc(100%+48px)] -mx-6 px-6 mb-1 pb-2" style={{ scrollMarginTop: 100 }}>
                <div className="flex flex-col flex-1 min-w-[200px]"><MCard label={lang === "id" ? "Total Konten" : "Total Content"} val={total} sub={lang === "id" ? `Dipublikasikan: ${pub}` : `Published: ${pub}`} colorTheme="blue" icon={PieChart} pctStr={calcPct(total, prevTotal)} getPeriodText={getPeriodText} /></div>
                <div className="flex flex-col flex-1 min-w-[200px]"><MCard label={lang === "id" ? "Views (Impresi)" : "Views (Impressions)"} val={fmt(tV)} pctStr={calcPct(tV, prevTV)} colorTheme="amber" icon={Activity} getPeriodText={getPeriodText} /></div>
                <div className="flex flex-col flex-1 min-w-[200px]"><MCard label={lang === "id" ? "Reach" : "Reach"} val={fmt(tR)} pctStr={calcPct(tR, prevTR)} colorTheme="purple" icon={Users} getPeriodText={getPeriodText} /></div>
                <div className="flex flex-col flex-1 min-w-[200px]"><MCard label={lang === "id" ? "Engagement" : "Engagement"} val={fmt(tE)} sub={lang === "id" ? `Tingkat Interaksi: ${er}% (vs ${(prevER).toFixed(2)}%)` : `Engagement Rate: ${er}% (vs ${(prevER).toFixed(2)}%)`} pctStr={calcPct(tE, prevTE)} colorTheme="emerald" icon={Target} getPeriodText={getPeriodText} /></div>
                {(adsFilter==="all"||adsFilter==="ads") && <>
                  <div className="flex flex-col flex-1 min-w-[200px]"><MCard label={lang === "id" ? "Klik Iklan" : "Ad Clicks"} val={fmt(tClicks)} colorTheme="rose" icon={Zap} pctStr={calcPct(tClicks, prevTClicks)} getPeriodText={getPeriodText} /></div>
                  <div className="flex flex-col flex-1 min-w-[200px]"><MCard label={lang === "id" ? "Konversi Iklan" : "Ad Conversions"} val={fmt(tConv)} colorTheme="cyan" icon={Star} pctStr={calcPct(tConv, prevTConv)} getPeriodText={getPeriodText} /></div>
                </>}
              </div>

              {/* Executive Summary Block */}
              <div id="analytics-executive-summary" className="bg-white rounded-2xl border border-black/[0.03] p-6 flex flex-col shadow-sm transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><GeminiIcon size={16} /></div>
                    <h4 className="text-[15px] font-extrabold m-0 text-gray-900 tracking-tight">{lang === "id" ? "Ringkasan Eksekutif & Insight AI" : "Executive Summary & AI Insights"}</h4>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 border-b border-black/[0.03] pb-4">
                  <div className="bg-black/[0.01] p-3.5 rounded-xl border border-black/[0.02]">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{lang === "id" ? "Total Konten" : "Total Content"}</div>
                    <div className="text-lg font-extrabold text-gray-900">{total} <span className="text-xs font-normal text-gray-500">({pub} {lang === "id" ? "Dipublikasikan" : "Published"})</span></div>
                  </div>
                  <div className="bg-black/[0.01] p-3.5 rounded-xl border border-black/[0.02]">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{lang === "id" ? "Total Views & Impresi" : "Total Views & Impressions"}</div>
                    <div className="text-lg font-extrabold text-gray-900 text-blue-600">{fmt(tV)} <span className="text-xs font-normal text-gray-500">Views</span></div>
                  </div>
                  <div className="bg-black/[0.01] p-3.5 rounded-xl border border-black/[0.02]">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{lang === "id" ? "Total Reach" : "Total Reach"}</div>
                    <div className="text-lg font-extrabold text-gray-900 text-purple-600">{fmt(tR)} <span className="text-xs font-normal text-gray-500">Reach</span></div>
                  </div>
                  <div className="bg-black/[0.01] p-3.5 rounded-xl border border-black/[0.02]">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{lang === "id" ? "Total Engagement" : "Total Engagement"}</div>
                    <div className="text-lg font-extrabold text-emerald-600">{fmt(tE)} <span className="text-xs font-normal text-gray-500">(ER: {er}%)</span></div>
                  </div>
                </div>

                <div className="mt-2">
                  {aiInsight ? (
                    <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                      <div 
                        className="flex justify-between items-center cursor-pointer select-none"
                        onClick={() => setShowAiInsight(!showAiInsight)}
                      >
                        <div className="text-xs font-bold text-blue-700 flex items-center gap-2">
                          {lang === "id" ? "✨ Insight & Rekomendasi Pintar AI" : "✨ AI Smart Insights & Recommendations"}
                        </div>
                        <ChevronDown size={16} className="text-blue-700 transition-transform duration-300" style={{transform: showAiInsight ? "rotate(180deg)" : "none"}} />
                      </div>
                      {showAiInsight && (
                        <div className="text-[13px] leading-relaxed text-gray-700 mt-3 markdown-body">
                          <Markdown>{aiInsight}</Markdown>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={fetchAiInsight} disabled={aiLoading} className="hover-scale w-full bg-gray-900 hover:bg-black text-white border-none py-3 px-5 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:cursor-wait transition-colors">
                      <GeminiIcon size={14} />
                      {aiLoading ? <LoadingDots /> : (lang === "id" ? "Generate AI Insights & Rekomendasi" : "Generate AI Insights & Recommendations")}
                    </button>
                  )}
                </div>
              </div>

              {/* Distribution Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ minWidth: 0 }}>
                {/* Performance by Platform */}
                <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-5 flex flex-col min-w-0 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-start mb-5 gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><PieChart size={18} /></div>
                      <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">{lang === "id" ? "Distribusi Platform" : "Platform Distribution"}</h4>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <div className="flex bg-black/[0.03] rounded-lg p-0.5 border border-black/[0.01]">
                        <button onClick={()=>setPlatformChartType("doughnut")} className={`border-none rounded-md px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-all ${platformChartType==="doughnut" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>Doughnut</button>
                        <button onClick={()=>setPlatformChartType("bar")} className={`border-none rounded-md px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-all ${platformChartType==="bar" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>Bar</button>
                      </div>
                      <CustomDropdown 
                        value={platformMetric} 
                        onChange={setPlatformMetric} 
                        options={[
                          {id:"engagement", label: lang === "id" ? "Interaksi" : "Engagement"},
                          {id:"views", label: lang === "id" ? "Tayangan" : "Views"},
                          {id:"reach", label: lang === "id" ? "Jangkauan" : "Reach"}
                        ]} 
                        style={{ width: 120 }} 
                      />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}} debounce={300}>
                    {platformChartType === "doughnut" ? (
                      <RPieChart>
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
                        <Legend content={<CustomLegend />} />
                        <Pie
                          data={platformData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={4}
                        >
                          {platformData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"][index % 4]} />)}
                        </Pie>
                      </RPieChart>
                    ) : (
                      <BarChart data={platformData} margin={{top:10,right:0,left:0,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)"/>
                        <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} dy={10}/>
                        <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} tickFormatter={fmt} width={45}/>
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.4)",marginBottom:4}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
                        <Bar dataKey="value" name="Total" radius={[6,6,0,0]} maxBarSize={48}>
                          {platformData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"][index % 4]} />)}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Performance by Pillar */}
                <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-5 flex flex-col min-w-0 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-start mb-5 gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><PieChart size={18} /></div>
                      <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">{lang === "id" ? "Distribusi Pilar Konten" : "Content Pillar Distribution"}</h4>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <CustomDropdown 
                        value={pillarMetric} 
                        onChange={setPillarMetric} 
                        options={[
                          {id:"engagement", label: lang === "id" ? "Interaksi" : "Engagement"},
                          {id:"views", label: lang === "id" ? "Tayangan" : "Views"},
                          {id:"reach", label: lang === "id" ? "Jangkauan" : "Reach"},
                          {id:"total", label: lang === "id" ? "Total Item" : "Total Items"}
                        ]} 
                        style={{ width: 120 }} 
                      />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}} debounce={300}>
                      <RPieChart>
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
                        <Legend content={<CustomLegend />} />
                        <Pie
                          data={pillarData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={4}
                        >
                          {pillarData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1"][index % 6]} />)}
                        </Pie>
                      </RPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* VIEW: CONTENT PERFORMANCE */}
          {activeSubTab === "content" && (
            <>
              {/* Header Sort & Filter for rankings */}
              <div className="flex gap-4 items-center bg-white rounded-2xl border border-black/[0.03] shadow-sm px-5 py-4 flex-wrap min-w-0">
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{lang === "id" ? "Urutkan Konten:" : "Sort Content:"}</div>
                  <div className="flex gap-0.5 bg-black/[0.03] p-1 rounded-xl border border-black/[0.01]">
                    {[[ "engagement", lang === "id" ? "Interaksi" : "Engagement" ], [ "reach", lang === "id" ? "Jangkauan" : "Reach" ], [ "views", lang === "id" ? "Tayangan" : "Views" ]].map(([k,l])=>(
                      <button key={k} onClick={()=>setTopSort(k)} className={`px-4 py-2 rounded-lg border-none font-bold text-xs cursor-pointer transition-all ${topSort===k ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:block w-px h-7 bg-black/[0.06] shrink-0"/>
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{lang === "id" ? "Filter Platform:" : "Platform Filter:"}</div>
                  <CustomDropdown 
                    value={topPlatform} 
                    onChange={setTopPlatform} 
                    options={[
                      {id:"All", label:(lang === "id" ? "Semua Platform" : "All Platforms")},
                      ...platforms.map((p:any)=>({id:p.name, label:p.name}))
                    ]} 
                    style={{ width: 180 }} 
                  />
                </div>
              </div>

              {/* Best & Lowest Content Lists */}
              <div id="analytics-content-rankings" className="grid gap-6 grid-cols-1 md:grid-cols-2" style={{ scrollMarginTop: 100 }}>
                <div>
                  <CDataList 
                    title={lang === "id" ? `🏆 Top 10 Konten Terbaik${topPlatform!=="All"?" ("+topPlatform+")":""}` : `🏆 Top 10 Best Content${topPlatform!=="All"?" ("+topPlatform+")":""}`} 
                    list={base.filter((c:any)=>c.status==="Published" && getV(c)>0 && (topPlatform==="All" || (c.platform && c.platform.includes(topPlatform)))).sort((a:any,b:any)=>{
                      if(topSort==="engagement") return getEng(b)-getEng(a);
                      if(topSort==="reach") return getR(b)-getR(a);
                      return getV(b)-getV(a);
                    }).slice(0,10)}
                    rank={1}
                    pillars={pillars}
                    platforms={platforms}
                    openEdit={openEdit}
                    fmt={fmt}
                    getV={getV}
                    getR={getR}
                    getEng={getEng}
                    topSort={topSort}
                  />
                </div>
                <div>
                  <CDataList 
                    title={lang === "id" ? `⚠️ 10 Konten Terendah${topPlatform!=="All"?" ("+topPlatform+")":""}` : `⚠️ 10 Lowest Content${topPlatform!=="All"?" ("+topPlatform+")":""}`}
                    list={base.filter((c:any)=>c.status==="Published" && getV(c)>0 && (topPlatform==="All" || (c.platform && c.platform.includes(topPlatform))))
                      .sort((a:any,b:any)=>{
                      if(topSort==="engagement") return getEng(a)-getEng(b);
                      if(topSort==="reach") return getR(a)-getR(b);
                      return getV(a)-getV(b);
                    }).slice(0,10)}
                    rank={-1}
                    pillars={pillars}
                    platforms={platforms}
                    openEdit={openEdit}
                    fmt={fmt}
                    getV={getV}
                    getR={getR}
                    getEng={getEng}
                    topSort={topSort}
                  />
                </div>
              </div>

              {/* Other distribution metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ minWidth: 0 }}>
                {/* Performance by Content Type */}
                <div id="analytics-content-type-chart" className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-5 flex flex-col min-w-0 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-start mb-5 gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-pink-50 p-2 rounded-lg text-pink-600"><PieChart size={18} /></div>
                      <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">{lang === "id" ? "Tipe Konten" : "Content Type"}</h4>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      <CustomDropdown 
                        value={typeMetric} 
                        onChange={setTypeMetric} 
                        options={[
                          {id:"engagement", label: lang === "id" ? "Interaksi" : "Engagement"},
                          {id:"views", label: lang === "id" ? "Tayangan" : "Views"},
                          {id:"reach", label: lang === "id" ? "Jangkauan" : "Reach"},
                          {id:"total", label: lang === "id" ? "Total Item" : "Total Items"}
                        ]} 
                        style={{ width: 120 }} 
                      />
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}} debounce={300}>
                      <BarChart data={typeData} margin={{top:10,right:0,left:0,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)"/>
                        <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} dy={10}/>
                        <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} tickFormatter={fmt} width={45}/>
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.4)",marginBottom:4}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
                        <Bar dataKey="value" name={lang === "id" ? "Total" : "Total"} radius={[6,6,0,0]} maxBarSize={48}>
                          {typeData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#DB2777", "#EC4899", "#F472B6", "#FBCFE8"][index % 4]} />)}
                        </Bar>
                      </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* PIC Workload */}
                <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-5 flex flex-col min-w-0 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2.5 mb-5 justify-between flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Users size={18} /></div>
                      <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">{lang === "id" ? "Distribusi Konten PIC" : "PIC Content Distribution"}</h4>
                    </div>
                    <div className="flex bg-black/[0.03] rounded-lg p-0.5 border border-black/[0.01]">
                      <button onClick={()=>setPicChartType("doughnut")} className={`border-none rounded-md px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-all ${picChartType==="doughnut" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>Doughnut</button>
                      <button onClick={()=>setPicChartType("bar")} className={`border-none rounded-md px-3 py-1.5 text-[10px] font-bold cursor-pointer transition-all ${picChartType==="bar" ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>Bar</button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={320} style={{marginTop: "auto"}} debounce={300}>
                    {picChartType === "doughnut" ? (
                      <RPieChart>
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
                        <Legend content={<CustomLegend />} />
                        <Pie
                          data={picData}
                          dataKey="total"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={4}
                        >
                          {picData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#6366F1"][index % 6]} />)}
                        </Pie>
                      </RPieChart>
                    ) : (
                      <BarChart data={picData} margin={{top:10,right:0,left:0,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)"/>
                        <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} dy={10}/>
                        <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} tickLine={false} axisLine={false} tickFormatter={fmt} width={45}/>
                        <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} itemStyle={{color:"#111827",fontWeight:700}} labelStyle={{color:"rgba(0,0,0,0.4)",marginBottom:4}} formatter={(v:any, n:any, props:any)=>[fmt(v), props?.payload?.name || n]}/>
                        <Bar dataKey="total" name={lang === "id" ? "Jumlah Konten" : "Total Content"} radius={[6,6,0,0]} maxBarSize={48}>
                          {picData.map((entry:any, index:number) => <Cell key={`cell-${index}`} fill={entry.color || ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#6366F1"][index % 6]} />)}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* VIEW: TRENDS & GROWTH */}
          {activeSubTab === "trends" && (
            <>
              {/* DESKTOP VIEW - Completely Untouched */}
              <div className="hidden md:block">
                <div id="analytics-trends-chart" className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-6 flex flex-col min-w-0 transition-shadow hover:shadow-md" style={{ scrollMarginTop: 100 }}>
                  <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><TrendingUp size={18} /></div>
                      <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">{lang === "id" ? "Tren Pertumbuhan" : "Growth Trends"}</h4>
                    </div>
                  </div>

                  {/* Active Metrics Bar containing Selection Button on the Left */}
                  <div className="flex items-center gap-2 mb-5 p-1.5 bg-black/[0.02] rounded-full border border-black/[0.03] relative min-w-0">
                    {/* Metric Selection Popover on Far Left */}
                    <div className="relative shrink-0" ref={metricSettingRef}>
                      <button 
                        onClick={openMetricSetting} 
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-black/[0.08] px-3.5 py-1.5 rounded-full shadow-sm cursor-pointer transition-all text-xs font-extrabold text-gray-800 hover:scale-[1.02] active:scale-95 shrink-0"
                      >
                        <SlidersHorizontal size={13} className="text-gray-500" />
                        <span>{lang === "id" ? "Pilih Metrik" : "Select Metric"}</span>
                        {activeMetrics.length > 0 && (
                          <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                            {activeMetrics.length}
                          </span>
                        )}
                      </button>

                      <AnimatePresence>
                        {isMetricSettingOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 5 }} 
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/10 z-[100] w-[320px] sm:w-[420px] md:w-[480px] overflow-hidden flex flex-col text-left"
                          >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                              <div>
                                <h5 className="font-extrabold text-gray-900 text-sm tracking-tight">{lang === "id" ? "Tampilan Metrik" : "Metric View"}</h5>
                                <p className="text-[10px] text-gray-400 font-medium">{lang === "id" ? "Pilih metrik yang ingin ditampilkan pada grafik" : "Select metrics to display on the chart"}</p>
                              </div>
                              <button 
                                onClick={resetToDefaultMetrics} 
                                className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                                title={lang === "id" ? "Reset ke default (engagement dasar)" : "Reset to default (basic engagement)"}
                              >
                                <RotateCcw size={12} />
                                <span>{lang === "id" ? "Reset Default" : "Reset to Default"}</span>
                              </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 max-h-[380px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Organic Category */}
                              <div>
                                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  {lang === "id" ? "Metrik Organik" : "Organic Metrics"}
                                </div>
                                <div className="space-y-1">
                                  {Object.entries(METRICS_META)
                                    .filter(([_, meta]) => meta.category === "organic")
                                    .map(([key, meta]) => {
                                      const isChecked = tempSelectedMetrics.includes(key);
                                      return (
                                        <label 
                                          key={key} 
                                          className={`flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/[0.02] cursor-pointer transition-colors ${isChecked ? 'bg-black/[0.01]' : ''}`}
                                        >
                                          <input 
                                            type="checkbox" 
                                            checked={isChecked} 
                                            onChange={() => toggleTempMetric(key)} 
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                                          />
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                                              <span className="text-xs font-bold text-gray-800">{(lang === "id" ? meta.label : meta.labelEn).split(" (")[0]}</span>
                                            </div>
                                            <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{(lang === "id" ? meta.desc : meta.descEn)}</p>
                                          </div>
                                        </label>
                                      );
                                    })}
                                </div>
                              </div>

                              {/* Ads Category */}
                              <div>
                                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  Metrik Ads (Iklan)
                                </div>
                                <div className="space-y-1">
                                  {Object.entries(METRICS_META)
                                    .filter(([_, meta]) => meta.category === "ads")
                                    .map(([key, meta]) => {
                                      const isChecked = tempSelectedMetrics.includes(key);
                                      return (
                                        <label 
                                          key={key} 
                                          className={`flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/[0.02] cursor-pointer transition-colors ${isChecked ? 'bg-black/[0.01]' : ''}`}
                                        >
                                          <input 
                                            type="checkbox" 
                                            checked={isChecked} 
                                            onChange={() => toggleTempMetric(key)} 
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                                          />
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                                              <span className="text-xs font-bold text-gray-800">{(lang === "id" ? meta.label : meta.labelEn).split(" (")[0]}</span>
                                            </div>
                                            <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{(lang === "id" ? meta.desc : meta.descEn)}</p>
                                          </div>
                                        </label>
                                      );
                                    })}
                                </div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                              <button 
                                onClick={() => setIsMetricSettingOpen(false)} 
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-500 hover:bg-black/[0.03] transition-colors cursor-pointer"
                              >
                                Batal
                              </button>
                              <button 
                                onClick={applyMetrics} 
                                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Check size={12} />
                                <span>{lang === "id" ? "Terapkan" : "Apply"}</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-px h-5 bg-black/[0.08] shrink-0" />

                    {/* Scrollable Active Badges */}
                    <div className="flex-1 flex flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-2 items-center">
                      {activeMetrics.map(k => (
                        <div key={k} className="px-3 py-1 bg-white border border-black/[0.05] rounded-full text-[11px] font-bold text-gray-700 flex items-center gap-1.5 shadow-sm shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: METRICS_META[k]?.color || "#3B82F6" }} />
                          <span>{(lang === "id" ? METRICS_META[k]?.label : METRICS_META[k]?.labelEn)?.split(" (")[0] || k}</span>
                          <button 
                            onClick={() => setActiveMetrics(prev => prev.filter(x => x !== k))}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-4 h-4 rounded-full flex items-center justify-center ml-1 cursor-pointer font-black text-[10px] transition-colors"
                            title="Sembunyikan metrik ini"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {base.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-black/[0.01] rounded-2xl border border-dashed border-black/[0.06] flex flex-col items-center justify-center">
                      <TrendingUp size={36} className="text-gray-300 mb-2 opacity-50" />
                      <p className="text-sm font-semibold">{lang === "id" ? "Tidak ada data untuk periode ini." : "No data for this period."}</p>
                      <p className="text-xs text-gray-400 mt-1 mb-4">Silakan ubah filter tanggal, platform, atau tipe konten untuk melihat tren data.</p>
                    </div>
                  ) : activeMetrics.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 bg-black/[0.01] rounded-2xl border border-dashed border-black/[0.06] flex flex-col items-center justify-center">
                      <TrendingUp size={36} className="text-gray-300 mb-2 animate-bounce" />
                      <p className="text-sm font-semibold">{lang === "id" ? "Tidak ada metrik terpilih." : "No metric selected."}</p>
                      <p className="text-xs text-gray-400 mt-1 mb-4">{lang === "id" ? "Pilih metrik melalui tombol 'Pilih Metrik' di atas untuk menampilkan grafik." : "Select metrics via the 'Select Metric' button above to display chart."}</p>
                      <button 
                        onClick={openMetricSetting} 
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
                      >
                        {lang === "id" ? "Pilih Metrik" : "Select Metric"}
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
                      {activeMetrics.map((k, index) => {
                        const currentTotal = base.reduce((sum: number, c: any) => {
                          let val = 0;
                          if (k === 'engagement') val = getEng(c);
                          else if (k === 'views') val = getV(c);
                          else if (k === 'reach') val = getR(c);
                          else if (k === 'likes') val = getLikes(c);
                          else if (k === 'comments') val = getComments(c);
                          else val = (c.metrics?.[k] || 0) + (c.isAds || adsFilter === "all" ? (c.adsMetrics?.[k] || 0) : 0);
                          return sum + val;
                        }, 0);
                        const previousTotal = prevBase.reduce((sum: number, c: any) => {
                          let val = 0;
                          if (k === 'engagement') val = getEng(c);
                          else if (k === 'views') val = getV(c);
                          else if (k === 'reach') val = getR(c);
                          else if (k === 'likes') val = getLikes(c);
                          else if (k === 'comments') val = getComments(c);
                          else val = (c.metrics?.[k] || 0) + (c.isAds || adsFilter === "all" ? (c.adsMetrics?.[k] || 0) : 0);
                          return sum + val;
                        }, 0);
                        const pctStr = calcPct(currentTotal, previousTotal);

                        return (
                          <div key={k} className="bg-white rounded-2xl border border-black/[0.03] p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md">
                            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.02] pb-4">
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                                   <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: METRICS_META[k]?.color || "#3B82F6" }} />
                                   {(lang === "id" ? METRICS_META[k]?.label : METRICS_META[k]?.labelEn) || k}
                                </div>
                                {(lang === "id" ? METRICS_META[k]?.desc : METRICS_META[k]?.descEn) && <div className="text-[11px] text-gray-400 font-medium leading-relaxed">{(lang === "id" ? METRICS_META[k]?.desc : METRICS_META[k]?.descEn)}</div>}
                              </div>

                              {/* UI/UX for Metric Total & Pct Change - Minimalist & Borderless */}
                              <div className="flex items-center gap-4 shrink-0 sm:text-right">
                                <div className="flex flex-col sm:items-end">
                                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-0.5">Total</span>
                                  <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">{fmt(currentTotal)}</span>
                                </div>

                                {pctStr && (
                                  <>
                                    {/* Elegant subtle vertical separator */}
                                    <div className="hidden sm:block w-px h-8 bg-black/[0.05]" />
                                    <div className="flex flex-col items-start sm:items-end">
                                      <div className={`text-sm font-extrabold flex items-center gap-0.5 leading-none ${pctStr.startsWith('+') ? 'text-emerald-600' : pctStr.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
                                        {pctStr.startsWith('+') ? <ArrowUpRight size={13} strokeWidth={3} className="shrink-0" /> : pctStr.startsWith('-') ? <ArrowDownRight size={13} strokeWidth={3} className="shrink-0" /> : null}
                                        <span>{pctStr}</span>
                                      </div>
                                      <span className="text-[9px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider leading-none">{getPeriodText() || "vs prev"}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <ResponsiveContainer width="100%" height={320} debounce={300}>
                              {adsFilter==="all" ? (
                                 <BarChart data={lineData} margin={{top:0,right:10,left:0,bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)"/>
                                    <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} dy={10}/>
                                    <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} tickFormatter={fmt} width={55}/>
                                    <Tooltip cursor={{fill:"rgba(0,0,0,0.02)"}} contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} labelStyle={{marginBottom:6,color:"rgba(0,0,0,0.4)"}} />
                                    <Bar dataKey={`${k}_org`} stackId={k} name={lang === "id" ? "Organik" : "Organic"} fill={METRICS_META[k]?.color || "#3B82F6"} radius={[0,0,4,4]} maxBarSize={24}/>
                                    <Bar dataKey={`${k}_ads`} stackId={k} name={`Ads`} fill={(METRICS_META[k]?.color || "#3B82F6")+"66"} radius={[4,4,0,0]} maxBarSize={24}/>
                                 </BarChart>
                              ) : (
                                <LineChart data={lineData} margin={{top:5,right:10,left:0,bottom:0}}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)"/>
                                  <XAxis dataKey="name" tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} dy={10}/>
                                  <YAxis tick={{fontSize:11,fill:"rgba(0,0,0,0.4)"}} axisLine={false} tickLine={false} tickFormatter={fmt} width={55}/>
                                  <Tooltip contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.04)",boxShadow:"0 10px 30px rgba(0,0,0,0.04)"}} labelStyle={{marginBottom:6,color:"rgba(0,0,0,0.4)"}} />
                                  <Line type="monotone" dataKey={k} stroke={METRICS_META[k]?.color || "#3B82F6"} strokeWidth={3} dot={{r:0}} activeDot={{r:5, strokeWidth:0}} name={(lang === "id" ? METRICS_META[k]?.label : METRICS_META[k]?.labelEn) || k} />
                                </LineChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* MOBILE VIEW - Beautiful, Clean, Modern, and Touch-Friendly */}
              <div className="block md:hidden flex flex-col gap-5" style={{ scrollMarginTop: 100 }}>
                {/* Charts Area */}
                {base.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 bg-white rounded-[24px] border border-dashed border-black/[0.06] flex flex-col items-center justify-center p-6 shadow-sm">
                    <TrendingUp size={32} className="text-gray-300 mb-2.5 opacity-50" />
                    <p className="text-xs font-bold text-gray-800 leading-tight">
                      {lang === "id" ? "Tidak ada data untuk periode ini." : "No data for this period."}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-[220px] leading-relaxed">
                      {lang === "id" 
                        ? "Ubah filter tanggal, platform, atau tipe konten Anda." 
                        : "Change date filters, platforms, or content types to view trends."}
                    </p>
                  </div>
                ) : activeMetrics.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 bg-white rounded-[24px] border border-dashed border-black/[0.06] flex flex-col items-center justify-center p-6 shadow-sm">
                    <TrendingUp size={32} className="text-gray-300 mb-2.5 animate-bounce" />
                    <p className="text-xs font-bold text-gray-800 leading-tight">
                      {lang === "id" ? "Tidak ada metrik terpilih." : "No metric selected."}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-[220px] leading-relaxed mb-4">
                      {lang === "id" ? "Pilih salah satu metrik untuk menampilkan visualisasi grafik performa." : "Select a metric to display its performance visualization chart."}
                    </p>
                    <button 
                      onClick={() => {
                        setTempSelectedMetrics([...activeMetrics]);
                        setTempDateFilt(dateFilt);
                        setTempCustomS(customS || "");
                        setTempCustomE(customE || "");
                        setTempPlatformFilter(platformFilter);
                        setTempAdsFilter(adsFilter);
                        setActiveDrawerFilter("all_filters");
                      }} 
                      className="px-4 py-2 bg-[var(--theme-primary)] text-white text-xs font-black rounded-full shadow-sm transition-all cursor-pointer border-none"
                    >
                      {lang === "id" ? "Pilih Metrik Sekarang" : "Select Metric Now"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {activeMetrics.map((k, index) => {
                      const currentTotal = base.reduce((sum: number, c: any) => {
                        let val = 0;
                        if (k === 'engagement') val = getEng(c);
                        else if (k === 'views') val = getV(c);
                        else if (k === 'reach') val = getR(c);
                        else if (k === 'likes') val = getLikes(c);
                        else if (k === 'comments') val = getComments(c);
                        else val = (c.metrics?.[k] || 0) + (c.isAds || adsFilter === "all" ? (c.adsMetrics?.[k] || 0) : 0);
                        return sum + val;
                      }, 0);
                      const previousTotal = prevBase.reduce((sum: number, c: any) => {
                        let val = 0;
                        if (k === 'engagement') val = getEng(c);
                        else if (k === 'views') val = getV(c);
                        else if (k === 'reach') val = getR(c);
                        else if (k === 'likes') val = getLikes(c);
                        else if (k === 'comments') val = getComments(c);
                        else val = (c.metrics?.[k] || 0) + (c.isAds || adsFilter === "all" ? (c.adsMetrics?.[k] || 0) : 0);
                        return sum + val;
                      }, 0);
                      const pctStr = calcPct(currentTotal, previousTotal);
                      const isUp = pctStr?.startsWith('+');
                      const isDown = pctStr?.startsWith('-');

                      return (
                        <div key={k} className="bg-white rounded-[24px] border border-black/[0.03] p-4 flex flex-col justify-between shadow-sm">
                          {/* Info Header */}
                          <div className="mb-4 pb-3 border-b border-black/[0.02]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: METRICS_META[k]?.color || "#3B82F6" }} />
                              <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                                {(lang === "id" ? METRICS_META[k]?.label : METRICS_META[k]?.labelEn) || k}
                              </span>
                            </div>
                            
                            {(lang === "id" ? METRICS_META[k]?.desc : METRICS_META[k]?.descEn) && (
                              <p className="text-[10px] text-gray-400 font-medium m-0 leading-tight">
                                {(lang === "id" ? METRICS_META[k]?.desc : METRICS_META[k]?.descEn)}
                              </p>
                            )}

                            {/* Mobile stats row */}
                            <div className="flex items-end justify-between mt-3 bg-black/[0.01] p-2.5 rounded-xl border border-black/[0.01]">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total</span>
                                <span className="text-xl font-black text-gray-900 tracking-tight leading-none">
                                  {fmt(currentTotal)}
                                </span>
                              </div>

                              {pctStr && (
                                <div className="flex flex-col items-end">
                                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5 leading-none ${
                                    isUp 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                      : isDown 
                                        ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                        : 'bg-gray-50 text-gray-600 border border-gray-100'
                                  }`}>
                                    {isUp ? <ArrowUpRight size={10} strokeWidth={3.5} /> : isDown ? <ArrowDownRight size={10} strokeWidth={3.5} /> : null}
                                    <span>{pctStr}</span>
                                  </div>
                                  <span className="text-[8px] text-gray-400 font-bold mt-1 uppercase tracking-widest leading-none">
                                    {getPeriodText() || "vs prev"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Chart viewport - Clean, compact dimensions for mobile screen */}
                          <div className="w-full overflow-hidden">
                            <ResponsiveContainer width="100%" height={210} debounce={200}>
                              {adsFilter === "all" ? (
                                 <BarChart data={lineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)"/>
                                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(0,0,0,0.4)", fontWeight: 700 }} axisLine={false} tickLine={false} dy={6} />
                                    <YAxis tick={{ fontSize: 9, fill: "rgba(0,0,0,0.4)", fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={40} />
                                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.02)" }} contentStyle={{ borderRadius: 12, fontSize: 10, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 10px 20px rgba(0,0,0,0.04)" }} labelStyle={{ marginBottom: 4, color: "rgba(0,0,0,0.4)" }} />
                                    <Bar dataKey={`${k}_org`} stackId={k} name={lang === "id" ? "Organik" : "Organic"} fill={METRICS_META[k]?.color || "#3B82F6"} radius={[0, 0, 3, 3]} maxBarSize={14} />
                                    <Bar dataKey={`${k}_ads`} stackId={k} name={`Ads`} fill={(METRICS_META[k]?.color || "#3B82F6") + "66"} radius={[3, 3, 0, 0]} maxBarSize={14} />
                                 </BarChart>
                              ) : (
                                 <LineChart data={lineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)"/>
                                   <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(0,0,0,0.4)", fontWeight: 700 }} axisLine={false} tickLine={false} dy={6} />
                                   <YAxis tick={{ fontSize: 9, fill: "rgba(0,0,0,0.4)", fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={40} />
                                   <Tooltip contentStyle={{ borderRadius: 12, fontSize: 10, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 10px 20px rgba(0,0,0,0.04)" }} labelStyle={{ marginBottom: 4, color: "rgba(0,0,0,0.4)" }} />
                                   <Line type="monotone" dataKey={k} stroke={METRICS_META[k]?.color || "#3B82F6"} strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 4, strokeWidth: 0 }} name={(lang === "id" ? METRICS_META[k]?.label : METRICS_META[k]?.labelEn) || k} />
                                 </LineChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW: ACTIVITY HEATMAP & DEMOGRAPHICS */}
          {activeSubTab === "activity" && (
            <div className="flex flex-col gap-6 w-full">
              {/* Card 1: Heatmap Activity */}
              <div id="analytics-audience-heatmap" className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-6 min-w-0 transition-shadow hover:shadow-md overflow-hidden w-full" style={{ scrollMarginTop: 100 }}>
                <div className="w-full">
                  <div className="flex items-center gap-2.5 mb-5 justify-between flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="bg-red-50 p-2 rounded-lg text-red-600"><Clock size={18} /></div>
                      <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">{lang === "id" ? "Heatmap Aktivitas (Best Time)" : "Activity Heatmap (Best Time)"}</h4>
                    </div>
                    <CustomDropdown 
                      value={heatmapMetric} 
                      onChange={setHeatmapMetric} 
                      options={[
                        {id:"engagement", label:"Engagement"},
                        {id:"reach", label:"Awareness (Reach)"},
                        {id:"views", label:"Awareness (Views)"}
                      ]} 
                      style={{ width: 170 }} 
                    />
                  </div>
                  <div className="flex gap-[1%] mb-2">
                    <div className="w-6 shrink-0"/>
                    {Array.from({length:24}).map((_,i)=><div key={`h${i}`} className="flex-1 text-center text-[9px] text-gray-400 font-bold">{i}</div>)}
                  </div>
                  {heatmap.map((row,di) => {
                    const rowMax = Math.max(...row, 1);
                    return (
                      <div key={di} className="flex gap-[1%] mb-1.5 items-center">
                        <div className="w-6 text-[10px] font-bold text-gray-900 shrink-0">{(lang === "id" ? DAYS_S : DAYS_S_EN)[di]}</div>
                        {row.map((val,hi) => (
                          <div key={hi} title={`${(lang === "id" ? DAYS_ID : DAYS_EN)[di]} ${lang === "id" ? "Jam" : "Hour"} ${hi} - ${fmt(val)} ${heatmapMetric==="engagement"?"Eng":heatmapMetric==="reach"?"Reach":"Views"}`} className="flex-1 h-7 rounded-sm transition-all duration-200" style={{background:val===0?'#F3F4F6':(heatmapMetric==="engagement"?`#3B82F6`:`#8B5CF6`) , opacity: val===0 ? 1 : Math.max(0.15, val/rowMax)}}/>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: Complete Demographics Section */}
              <div className="bg-white rounded-2xl border border-black/[0.03] shadow-sm p-6 min-w-0 transition-shadow hover:shadow-md overflow-hidden w-full">
                {/* Header and Platform Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-b-black/[0.03]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users size={18} /></div>
                      <h4 className="font-extrabold text-gray-900 text-[15px] m-0 tracking-tight">{lang === "id" ? "Demografi Lengkap Audiens" : "Complete Audience Demographics"}</h4>
                      
                      {/* Interactive Active Platform Badge synced with navbar */}
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {platformFilter === "all" ? (lang === "id" ? "Semua Platform" : "All Platforms") : platformFilter}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{lang === "id" ? "Persebaran umur, jenis kelamin, lokasi, dan preferensi minat berdasarkan tiap platform yang difilter." : "Distribution of age, gender, location, and interest preferences based on each filtered platform."}</p>
                  </div>

                  {/* Manual Editor Trigger Button - Sync with all platforms */}
                  <button 
                    onClick={() => setIsDemoModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md border-none"
                  >
                    <Edit2 size={13} />
                    <span>{lang === "id" ? "Edit Data Demografi" : "Edit Demographic Data"}</span>
                  </button>
                </div>

                {/* Demographics Content */}
                {(() => {
                  const isAll = platformFilter === "all";
                  const demo = isAll 
                    ? getAggregatedDemographics(demographics, platforms) 
                    : demographics[platformFilter.toLowerCase()];

                  const hasNoData = !demo;
                  const activeDemo = demo || getDemographicsForPlatform(isAll ? "all" : platformFilter);

                  return (
                    <div className="relative rounded-2xl overflow-hidden min-h-[340px]">
                      {/* Blurred/grayscale visual preview */}
                      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ${
                        hasNoData ? "filter grayscale opacity-25 blur-[0.5px] pointer-events-none select-none" : ""
                      }`}>
                        
                        {/* Column 1: Gender & Age (Umur & Gender) */}
                        <div className="bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Users size={15} className="text-blue-600" />
                              <h5 className="text-[13px] font-extrabold text-gray-900 m-0 tracking-tight">{lang === "id" ? "Umur & Gender" : "Age & Gender"}</h5>
                            </div>

                            {/* Gender Split Bar */}
                            <div className="mb-6">
                              <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                                <span className="flex items-center gap-1">👩 Wanita <span className="text-pink-600">{activeDemo.gender?.female || 0}%</span></span>
                                <span className="flex items-center gap-1">👨 Pria <span className="text-blue-600">{activeDemo.gender?.male || 0}%</span></span>
                              </div>
                              <div className="flex h-3 rounded-full overflow-hidden bg-black/[0.04]">
                                <div className="bg-pink-500 h-full transition-all duration-500" style={{ width: `${activeDemo.gender?.female || 0}%` }} />
                                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${activeDemo.gender?.male || 0}%` }} />
                              </div>
                            </div>

                            {/* Age Groups List */}
                            <div className="space-y-3">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">Kelompok Umur</span>
                              {(activeDemo.age || []).map((item: any) => (
                                <div key={item.range} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-700">{item.range}</span>
                                    <span className="font-extrabold text-gray-900">{item.value}%</span>
                                  </div>
                                  <div className="h-2 bg-black/[0.03] rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${item.value}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Top Locations (Kota & Negara) */}
                        <div className="bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Globe size={15} className="text-blue-600" />
                              <h5 className="text-[13px] font-extrabold text-gray-900 m-0 tracking-tight">{lang === "id" ? "Lokasi Teratas" : "Top Locations"}</h5>
                            </div>

                            {/* Cities List */}
                            <div className="space-y-3 mb-6">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">{lang === "id" ? "Kota Utama" : "Top Cities"}</span>
                              {(activeDemo.cities || []).map((city: any) => (
                                <div key={city.name} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-700">{city.name || "-"}</span>
                                    <span className="font-extrabold text-gray-900">{city.percentage}%</span>
                                  </div>
                                  <div className="h-2 bg-black/[0.03] rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${city.percentage * 2}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Countries List */}
                            <div className="space-y-2.5">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">{lang === "id" ? "Negara Utama" : "Top Countries"}</span>
                              {(activeDemo.countries || []).map((country: any) => (
                                <div key={country.name} className="flex justify-between items-center text-xs py-1 border-b border-black/[0.02] last:border-0">
                                  <span className="font-bold text-gray-700 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                    {country.name || "-"}
                                  </span>
                                  <span className="font-extrabold text-gray-900">{country.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Interests & Devices (Minat & Perangkat) */}
                        <div className="bg-black/[0.01] p-5 rounded-2xl border border-black/[0.02] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <Heart size={15} className="text-blue-600" />
                              <h5 className="text-[13px] font-extrabold text-gray-900 m-0 tracking-tight">{lang === "id" ? "Minat & Perangkat" : "Interests & Devices"}</h5>
                            </div>

                            {/* Interests List */}
                            <div className="space-y-3 mb-6">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">{lang === "id" ? "Top Minat Audiens" : "Top Audience Interests"}</span>
                              {(activeDemo.interests || []).map((interest: any) => (
                                <div key={interest.name} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-gray-700 truncate max-w-[70%]">{interest.name || "-"}</span>
                                    <span className="font-extrabold text-gray-900">{interest.percentage}%</span>
                                  </div>
                                  <div className="h-2 bg-black/[0.03] rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${interest.percentage * 2}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Devices List */}
                            <div className="space-y-2.5">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-2">{lang === "id" ? "Perangkat / Device" : "Device / Platform"}</span>
                              {(activeDemo.devices || []).map((device: any) => (
                                <div key={device.name} className="flex items-center justify-between text-xs bg-white border border-black/[0.03] p-2 rounded-xl">
                                  <span className="font-bold text-gray-700 flex items-center gap-2">
                                    <Smartphone size={13} className="text-gray-400" />
                                    {device.name || "-"}
                                  </span>
                                  <span className="font-extrabold text-gray-900">{device.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* No Data Overlay */}
                      {hasNoData && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-black/5 backdrop-blur-[0.5px]">
                          <div className="bg-white/95 shadow-xl border border-black/[0.05] p-6 sm:p-8 rounded-2xl max-w-sm flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="bg-blue-50 text-blue-600 p-3.5 rounded-full mb-3.5">
                              <Users size={28} />
                            </div>
                            <h5 className="font-extrabold text-gray-900 text-sm tracking-tight m-0">{lang === "id" ? "Tidak Ada Data Demografi" : "No Demographic Data"}</h5>
                            <p className="text-xs text-gray-500 mt-2 mb-4 leading-relaxed max-w-xs">
                              {isAll 
                                ? lang === "id" ? "Belum ada data demografi yang diisi di platform manapun. Klik tombol di bawah untuk mulai mengisi data demografi Anda." : "No demographic data entered on any platform. Click the button below to start entering your demographic data."
                                : `${lang === "id" ? "Belum ada data demografi yang diisi untuk platform " + platformFilter + ". Silakan isi data secara manual menggunakan tombol di bawah." : "No demographic data entered for " + platformFilter + " platform. Please enter data manually using the button below."}`}
                            </p>
                            <button 
                              onClick={() => setIsDemoModalOpen(true)}
                              className="px-4.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg border-none"
                            >
                              {lang === "id" ? "Isi Data Demografi" : "Fill Demographic Data"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}


        </div>
      </div>

            {/* DEMOGRAPHICS EDITING MODAL */}
      <DemoEditModal lang={lang} 
        isDemoModalOpen={isDemoModalOpen} 
        setIsDemoModalOpen={setIsDemoModalOpen} 
        demographics={demographics} 
        setDemographics={setDemographics} 
        platformFilter={platformFilter} 
        platforms={platforms} 
        onSaveDemographics={(updatedDemo: any) => {
          setDemographics(updatedDemo);
          try {
            localStorage.setItem("hubify_custom_demographics", JSON.stringify(updatedDemo));
          } catch (e) {}
          if (onUpdateSettings) {
            onUpdateSettings({ demographics: updatedDemo });
          }
        }}
      />

      {/* PRINT CONFIGURATION MODAL */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        content={content}
        platforms={platforms}
        platformFilter={platformFilter}
        dateFilt={dateFilt}
        customS={customS}
        customE={customE}
        demographics={demographics}
        activeMetrics={activeMetrics}
      />
    </div>
  );
}

