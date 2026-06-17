import { useState, useRef, useEffect } from "react";
import { auth, callAiWithQuota } from "./firebase";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import TextareaAutosize from "react-textarea-autosize";
import { RichTextEditor } from "./RichTextEditor";

const GeminiIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1.5L14.45 9.55L22.5 12L14.45 14.45L12 22.5L9.55 14.45L1.5 12L9.55 9.55L12 1.5Z" fill="url(#gemini_gradient_curr)" />
    <defs>
      <linearGradient id="gemini_gradient_curr" x1="1.5" y1="12" x2="22.5" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="0.5" stopColor="#9B72CB"/>
        <stop offset="1" stopColor="#D96570"/>
      </linearGradient>
    </defs>
  </svg>
);

const LoadingDots = () => (
  <span>
    Menganalisis konten
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5}}>.</motion.span>
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.2}}>.</motion.span>
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.4}}>.</motion.span>
  </span>
);

import { 
  MK, MC, eng, fmt, fmtD, gps,
  I, L, B, GRP, CustomDropdown, htmlToPlainText
} from "./data";
import { 
  ChevronDown,
  AlertCircle,
  Megaphone,
  Eye, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Repeat, 
  Bookmark, 
  MousePointer, 
  Target,
  Sparkles,
  Edit2,
  Calendar,
  FileText,
  PenTool,
  Link,
  Paperclip,
  Plus,
  BarChart2,
  FolderOpen,
  ExternalLink,
  Clock,
  BookOpen,
  Copy,
  Archive,
  Trash,
  RefreshCcw,
  Leaf,
  DollarSign,
  Flag,
  Smartphone,
  User,
  Zap,
  Check,
  AlertTriangle,
  PanelRight,
  Maximize2,
  Link2,
  UserPlus,
  MessageSquare,
  PlayCircle,
  Wallet
} from "lucide-react";

const getMetricIcon = (k: string, color?: string, size = 14) => {
  const props = { size, color: color || "currentColor", style: { flexShrink: 0 } };
  switch (k.toLowerCase()) {
    case "views":
      return <Eye {...props} />;
    case "reach":
      return <Users {...props} />;
    case "likes":
      return <Heart {...props} fill={color ? `${color}35` : "transparent"} />;
    case "comments":
      return <MessageCircle {...props} />;
    case "shares":
      return <Share2 {...props} />;
    case "reposts":
      return <Repeat {...props} />;
    case "saves":
      return <Bookmark {...props} fill={color ? `${color}35` : "transparent"} />;
    case "clicks":
      return <MousePointer {...props} />;
    case "conversions":
      return <Target {...props} />;
    case "profilevisits":
      return <User {...props} />;
    case "biolinktaps":
      return <Link2 {...props} />;
    case "follows":
      return <UserPlus {...props} />;
    case "msgconvstarted":
      return <MessageSquare {...props} />;
    case "threesecplays":
      return <PlayCircle {...props} />;
    case "spendbudget":
      return <DollarSign {...props} />;
    case "dailybudget":
      return <Wallet {...props} />;
    case "duration":
      return <Clock {...props} />;
    case "cprprofilevisit":
      return <DollarSign {...props} />;
    case "audience":
      return <Users {...props} />;
    default:
      return null;
  }
};

const formatMetricKey = (k: string) => {
  const custom: Record<string, string> = {
    profileVisits: "Profile Visits",
    bioLinkTaps: "Bio Link Taps",
    msgConvStarted: "Msg Conv. Started",
    threeSecPlays: "3s Plays",
    spendBudget: "Spend Budget",
    dailyBudget: "Daily Budget",
    cprProfileVisit: "Cost per Profile Visit",
    audience: "Audience",
    duration: "Duration Ad",
    likes: "Likes & Reactions",
    clicks: "Link Clicks"
  };
  return custom[k] || k;
};

const ADS_CATEGORIES = [
  {
    title: "Overview",
    keys: ["views", "reach", "comments", "reposts", "bioLinkTaps", "conversions"]
  },
  {
    title: "Engagement",
    keys: ["threeSecPlays", "clicks", "likes", "saves", "shares"]
  },
  {
    title: "Profile Activity",
    keys: ["profileVisits", "follows", "msgConvStarted"]
  },
  {
    title: "Details",
    keys: ["cprProfileVisit", "spendBudget", "dailyBudget", "duration", "audience"]
  }
];

export function ContentModal({modal,onSave,onClose,onArchive,onRestore,onDelete,onDuplicate,pillars,platforms,contentTypes,pics,statuses,onSettingUpdate}: any) {
  const [d,setD] = useState({...modal.data,metrics:{...(modal.data.metrics||{})},adsMetrics:{...(modal.data.adsMetrics||{views:0,reach:0,likes:0,comments:0,reposts:0,shares:0,saves:0,profileVisits:0,bioLinkTaps:0,follows:0,clicks:0,conversions:0,msgConvStarted:0,threeSecPlays:0,spendBudget:0,dailyBudget:0,duration:0,cprProfileVisit:0,audience:""})},referenceLinks:modal.data.referenceLinks||[],customFields:modal.data.customFields||[]});
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hourError, setHourError] = useState(false);
  const [minuteError, setMinuteError] = useState(false);
  const [productionHourError, setProductionHourError] = useState(false);
  const [productionMinuteError, setProductionMinuteError] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(modal.mode !== "add");
  const [editingFieldLeft, setEditingFieldLeft] = useState<string | null>(null);
  const [editingFieldRight, setEditingFieldRight] = useState<string | null>(null);
  const activeFieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeFieldRef.current && !activeFieldRef.current.contains(event.target as Node)) {
        setEditingFieldLeft(null);
        setEditingFieldRight(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"center" | "drawer">(() => {
    return (localStorage.getItem("contentModalLayout") as "center" | "drawer") || "center";
  });
  const [activeTab, setActiveTab] = useState<"draft" | "refs" | "metrics">("draft");
  useEffect(() => {
    localStorage.setItem("contentModalLayout", layoutMode);
  }, [layoutMode]);

  const dRef = useRef(d);
  useEffect(() => {
    dRef.current = d;
  }, [d]);

  useEffect(() => {
    if (modal.data && modal.data.id && !d.id) {
      setD((p:any) => {
        const next = { ...p, id: modal.data.id };
        dRef.current = next;
        return next;
      });
    }
  }, [modal.data, d.id]);

  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round", marginRight: "4px"}}>
      <motion.path 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4 }}
        d="M20 6L9 17l-5-5"
      />
    </svg>
  );

  const handleHourChange = (e: any) => {
    isDirty.current = true;
    const valStr = e.target.value;
    if (valStr === "") {
      set("uploadHour", "");
      setHourError(false);
      return;
    }
    const val = Number(valStr);
    const timeFormat = d.timeFormat || '24H';
    const minHour = timeFormat === '24H' ? 0 : 1;
    const maxHour = timeFormat === '24H' ? 23 : 12;
    
    if (isNaN(val) || val < minHour || val > maxHour) {
      set("uploadHour", ""); // auto delete
      setHourError(true);
      setTimeout(() => {
        setHourError(false);
      }, 2500);
    } else {
      set("uploadHour", val);
      setHourError(false);
    }
  };

  const handleProductionHourChange = (e: any) => {
    isDirty.current = true;
    const valStr = e.target.value;
    if (valStr === "") {
      set("productionHour", "");
      setProductionHourError(false);
      return;
    }
    const val = Number(valStr);
    const timeFormat = d.timeFormat || '24H';
    const minHour = timeFormat === '24H' ? 0 : 1;
    const maxHour = timeFormat === '24H' ? 23 : 12;
    
    if (isNaN(val) || val < minHour || val > maxHour) {
      set("productionHour", ""); // auto delete
      setProductionHourError(true);
      setTimeout(() => {
        setProductionHourError(false);
      }, 2500);
    } else {
      set("productionHour", val);
      setProductionHourError(false);
    }
  };

  const handleFormatChange = (e: any) => {
    isDirty.current = true;
    const newFormat = e.target.value;
    const oldFormat = d.timeFormat || '24H';
    let currentHour = Number(d.uploadHour);

    if (!isNaN(currentHour) && d.uploadHour !== "" && d.uploadHour !== undefined && d.uploadHour !== null) {
      if (oldFormat === '24H' && newFormat !== '24H') {
         if (currentHour === 0) currentHour = 12;
         else if (currentHour > 12) currentHour = currentHour - 12;
      } else if (oldFormat !== '24H' && newFormat === '24H') {
         if (oldFormat === 'PM' && currentHour < 12) currentHour += 12;
         if (oldFormat === 'AM' && currentHour === 12) currentHour = 0;
      }
      set("uploadHour", currentHour);
    }
    set('timeFormat', newFormat);
  };

  const handleMinuteChange = (e: any) => {
    isDirty.current = true;
    const valStr = e.target.value;
    if (valStr === "") {
      set("uploadMinute", "");
      setMinuteError(false);
      return;
    }
    const val = Number(valStr);
    if (isNaN(val) || val < 0 || val > 59) {
      set("uploadMinute", ""); // auto delete
      setMinuteError(true);
      setTimeout(() => {
        setMinuteError(false);
      }, 2500);
    } else {
      set("uploadMinute", val);
      setMinuteError(false);
    }
  };

  const handleProductionMinuteChange = (e: any) => {
    isDirty.current = true;
    const valStr = e.target.value;
    if (valStr === "") {
      set("productionMinute", "");
      setProductionMinuteError(false);
      return;
    }
    const val = Number(valStr);
    if (isNaN(val) || val < 0 || val > 59) {
      set("productionMinute", ""); // auto delete
      setProductionMinuteError(true);
      setTimeout(() => {
        setProductionMinuteError(false);
      }, 2500);
    } else {
      set("productionMinute", val);
      setProductionMinuteError(false);
    }
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!d.isHubAiDraft || d.manuallySaved) {
        debounceRef.current = setTimeout(async () => {
          const currentD = dRef.current;
          if (!currentD.title || !String(currentD.title).trim()) return;
          setIsSaving(true);
          try {
            await onSave(currentD, false);
          } catch (e) {
            console.error("Autosave failed", e);
          }
          setIsSaving(false);
        }, 1000);
    }
    return () => { if(debounceRef.current) clearTimeout(debounceRef.current); };
  }, [d]);

  const activePillar = gps(pillars, d.pillar);
  const headerBg = activePillar?.color || "#2C2016";

  const getTranslucentColor = (hex: string, alpha: string) => {
    if (!hex) return "rgba(255,255,255,0.14)";
    if (hex.startsWith("#")) {
      let cleanHex = hex;
      if (hex.length === 4) {
        cleanHex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      return `${cleanHex}${alpha}`;
    }
    return hex;
  };

  const activePillarColor = activePillar?.color || "#3B82F6";

  // Platform lookup
  const activePlatformOption = platforms?.find((x:any) => {
    const name = typeof x === 'string' ? x : x?.name;
    return name?.trim()?.toLowerCase() === d.platform?.trim()?.toLowerCase();
  }) || platforms?.[0];
  const activePlatformColor = (activePlatformOption && typeof activePlatformOption !== 'string') ? activePlatformOption.color || "#2C2016" : "#2C2016";

  const activeContentTypeOption = contentTypes?.find((x:any) => {
    const name = typeof x === 'string' ? x : x?.name;
    return name?.trim()?.toLowerCase() === d.contentType?.trim()?.toLowerCase();
  }) || contentTypes?.[0];
  const activeContentTypeColor = (activeContentTypeOption && typeof activeContentTypeOption !== 'string') ? activeContentTypeOption.color || "#2C2016" : "#2C2016";

  // PIC lookup
  const activePicOption = pics?.find((x:any) => {
    const name = typeof x === 'string' ? x : x?.name;
    return name?.trim()?.toLowerCase() === d.pic?.trim()?.toLowerCase();
  }) || pics?.[0];
  const activePicColor = (activePicOption && typeof activePicOption !== 'string') ? activePicOption.color || "#2B4C7E" : "#2B4C7E";

  // Status lookup
  const activeStatusOption = statuses?.find((x:any) => {
    const name = typeof x === 'string' ? x : x?.name;
    return name?.trim()?.toLowerCase() === d.status?.trim()?.toLowerCase();
  }) || statuses?.[0];
  const activeStatusColor = (activeStatusOption && typeof activeStatusOption !== 'string') ? activeStatusOption.color || "#A67C1C" : "#A67C1C";

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const objectiveRef = useRef<HTMLTextAreaElement>(null);
  const briefRef = useRef<HTMLTextAreaElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const [focusTarget, setFocusTarget] = useState<string|null>(null);

  const isDirty = useRef(false);

  useEffect(() => {
    if (!isReaderMode && focusTarget) {
      setTimeout(() => {
        if (focusTarget === "title" && titleRef.current) {
          titleRef.current.focus();
          const len = titleRef.current.value.length;
          titleRef.current.setSelectionRange(len, len);
        } else if (focusTarget === "objective" && objectiveRef.current) {
          objectiveRef.current.focus();
          const len = objectiveRef.current.value.length;
          objectiveRef.current.setSelectionRange(len, len);
        } else if (focusTarget === "brief" && briefRef.current) {
          briefRef.current.focus();
          const len = briefRef.current.value.length;
          briefRef.current.setSelectionRange(len, len);
        } else if (focusTarget === "caption" && captionRef.current) {
          captionRef.current.focus();
          const len = captionRef.current.value.length;
          captionRef.current.setSelectionRange(len, len);
        }
        setFocusTarget(null);
      }, 100);
    }
  }, [isReaderMode, focusTarget]);

  useEffect(() => {
    if (titleRef.current) {
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.style.height = 'auto';
          titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
        }
      }, 0);
    }
  }, [d.title, modal.open, isReaderMode]);

  const set = (k:string,v:any) => {
    isDirty.current = true;
    const next = { ...dRef.current, [k]: v };
    dRef.current = next;
    setD(next);
  };
  const setM = (k:string,v:any, isAds=false) => {
    isDirty.current = true;
    const ts = new Date().toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"});
    const val = v === "" ? "" : (Number(v) || 0);
    let next;
    if(isAds) {
      next = {...dRef.current,adsMetrics:{...dRef.current.adsMetrics,[k]:val},metricsUpdatedAt:ts};
    } else {
      next = {...dRef.current,metrics:{...dRef.current.metrics,[k]:val},metricsUpdatedAt:ts};
    }
    dRef.current = next;
    setD(next);
  };

  const handleClose = async (e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (d.isHubAiDraft && !d.manuallySaved) {
       setShowExitConfirm(true);
       return;
    }
    
    if (isDirty.current) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      try {
        await onSave(dRef.current, false);
      } catch (e) {
        console.error("Autosave failed on close:", e);
      }
    }
    onClose();
  };

  const addCustomField = () => {
    isDirty.current = true;
    const next = {...dRef.current, customFields: [...dRef.current.customFields, {key:"", value:""}]};
    dRef.current = next;
    setD(next);
  };
  const updateCustomField = (index:number, k:string, v:any) => {
    isDirty.current = true;
    const arr = [...dRef.current.customFields];
    arr[index] = {...arr[index], [k]:v};
    const next = {...dRef.current, customFields: arr};
    dRef.current = next;
    setD(next);
  };
  const removeCustomField = (index:number) => {
    isDirty.current = true;
    const arr = [...dRef.current.customFields];
    arr.splice(index, 1);
    const next = {...dRef.current, customFields: arr};
    dRef.current = next;
    setD(next);
  };

  const analyzeContent = async () => {
    if(!d.caption && !d.briefCopywriting) {
        alert("Harap isi caption atau brief terlebih dahulu untuk dianalisis AI.");
        return;
    }
    setAiLoading(true);
    setAiResult("");
    try {
        const prompt = `Analisis konten pemasaran berikut ini:
        Judul: ${d.title}
        Pillar: ${d.pillar}
        Platform: ${d.platform}
        Hook: ${d.hook || "-"}
        Brief: ${d.briefCopywriting}
        Call to Action: ${d.cta || "-"}
        Objective: ${d.objective}
        
        Berikan evaluasi singkat dan 3 poin saran perbaikan untuk meningkatkan engagement. Format dalam Bahasa Indonesia, singkat, padat, dan teknis.`;
        
        const data = await callAiWithQuota(auth.currentUser?.uid || 'anon', undefined, { prompt, model: "gemini-2.0-flash" });
        setAiResult(data.text || "Tidak ada respon dari AI.");
    } catch (e: any) {
        console.error("AI Error:", e);
        const errMsg = e.message || "";
        if (errMsg.includes("habis")) {
          setAiResult(errMsg);
        } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
          setAiResult("Gagal menganalisis konten: Terlalu banyak permintaan saat ini (Quota Exceeded). Silakan tunggu sekitar 30 detik lalu coba lagi, atau update akun Google AI Studio Anda ke Pay-as-you-go.");
        } else {
          setAiResult("Gagal menganalisis konten: " + errMsg + ".\n\nPastikan VITE_GEMINI_API_KEY sudah diset di Settings > Secrets.");
        }
    }
    setAiLoading(false);
  };

  const generateCaption = async () => {
    if(!d.briefCopywriting) {
        alert("Harap isi Brief Konten terlebih dahulu agar AI memiliki konteks untuk membuat caption.");
        return;
    }
    setCaptionLoading(true);
    try {
        const prompt = `Buatkan caption social media berdasarkan brief berikut:
        Judul: ${d.title}
        Pillar: ${d.pillar}
        Platform: ${d.platform}
        Hook: ${d.hook || "-"}
        Brief: ${d.briefCopywriting}
        Call to Action: ${d.cta || "-"}
        Objective: ${d.objective}
        
        Tuliskan HANYA hasil caption akhirnya saja. Jangan berikan pengantar/penutup eksplanasi. Sertakan hashtag yang relevan sesuai dengan platform. Outputkan dalam format tag HTML dasar seperti <p>, <strong>, <em>, <br> untuk styling format typography-nya.`;
        
        const data = await callAiWithQuota(auth.currentUser?.uid || 'anon', undefined, { prompt, model: "gemini-2.0-flash" });
        set("caption", (data.text || "").trim());
    } catch (e: any) {
        console.error("AI Error:", e);
        const errMsg = e.message || "";
        if (errMsg.includes("habis")) {
          alert(errMsg);
        } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
          alert("Gagal menggenerate caption: Terlalu banyak permintaan AI. Silakan tunggu sekitar 30 detik lalu coba lagi.");
        } else {
          alert("Gagal menggenerate caption: " + errMsg);
        }
    }
    setCaptionLoading(false);
  };

  const handleRefImg = (e:any) => {
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev:any)=>set("referenceImage",ev.target.result);
    reader.readAsDataURL(file);
  };
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const [isRightScrolled, setIsRightScrolled] = useState(false);

  const handleRightScroll = (e: any) => {
    setIsRightScrolled(e.currentTarget.scrollTop > 10);
  };

  const isNew = modal.mode==="add";
  const canArchive = !d.archived && !isNew;
  const canDelete = !isNew;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.15 }} onClick={handleClose} 
      style={{
        position:"fixed",inset:0,
        background:"rgba(0,0,0,0.5)",
        display:"flex",
        alignItems: layoutMode === "drawer" ? "stretch" : "center",
        justifyContent: layoutMode === "drawer" ? "flex-end" : "center",
        zIndex:300,
        padding: layoutMode === "drawer" ? 0 : 16
      }}>
      <motion.div 
        initial={layoutMode === "drawer" ? {x: "100%", opacity:1} : {scale:0.97, opacity:0, y:15}} 
        animate={layoutMode === "drawer" ? {x: 0, opacity:1} : {scale:1, opacity:1, y:0}} 
        exit={layoutMode === "drawer" ? {x: "100%", opacity:1} : {scale:0.97, opacity:0, y:15}} 
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={e=>e.stopPropagation()} 
        style={{
          background: "#ffffff", 
          border: layoutMode === "drawer" ? "none" : "1px solid rgba(0,0,0,0.08)",
          borderLeft: layoutMode === "drawer" ? "1px solid rgba(0,0,0,0.08)" : undefined,
          borderRadius: layoutMode === "drawer" ? "24px 0 0 24px" : "24px",
          maxWidth: "1050px",
          width:"100%",
          height: layoutMode === "drawer" ? "100%" : "90vh",
          position:"relative",
          boxShadow: layoutMode === "drawer" ? "-10px 0 30px rgba(0,0,0,0.05)" : "0 12px 30px rgba(0,0,0,0.05)", 
          display: "flex", flexDirection: "column"
        }}
      >
        {/* Modal Controls */}
        <div style={{position: "absolute", top: 32, right: 32, display: "flex", alignItems: "center", gap: "8px", zIndex: 50}}>
          <button 
            onClick={(e) => { e.stopPropagation(); setLayoutMode(p => p === "center" ? "drawer" : "center"); }}
            title="Ubah Tampilan Mode (Popup / Drawer)"
            style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:14,color:"#444",display:"flex",alignItems:"center",justifyContent:"center", transition: "background 0.2s"}}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          >
            {layoutMode === "drawer" ? <Maximize2 size={14}/> : <PanelRight size={14}/>}
          </button>
          <button 
            className="hover-scale" 
            onClick={handleClose} 
            style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:20,fontWeight: 500, color:"#444",display:"flex",alignItems:"center",justifyContent:"center", transition: "background 0.2s"}}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          >
            ×
          </button>
        </div>
        <div style={{display: "flex", flexDirection: "row", flex: 1, overflow: "hidden"}}>
            {/* LEFT COLUMN: IDENTITAS & SETTINGS */}
            <div style={{ 
              width: "380px", 
              padding: "32px 28px", 
              flexShrink: 0, 
              display: "flex", 
              flexDirection: "column", 
              gap: "16px", 
              background: "transparent",
              borderRight: "1px solid rgba(0,0,0,0.08)", 
              overflowY: "auto" 
            }}>
          
          
          {/* Title Area */}
          <div 
            style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", position: "relative" }}
          >
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8, width: "100%"}}>
                  <motion.div 
                    animate={isShaking && (!d.title || !String(d.title).trim()) ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }} 
                    transition={{ duration: 0.5 }}
                    style={{width: "100%"}}
                  >
                     <TextareaAutosize 
                        ref={titleRef}
                        value={d.title} 
                        onChange={(e)=>set("title",e.target.value)} 
                        minRows={1}
                        style={{background:"transparent",border:"none",fontSize:40,fontWeight:900, letterSpacing:"-1.2px",color:"#111827",width:"100%",outline:"none",padding:0, resize: "none", overflow: "hidden", lineHeight: 1.1, wordBreak: "break-word", whiteSpace: "pre-wrap"}} 
                        placeholder="Ketik Judul Konten..."/>
                  </motion.div>
              </div>

              {/* PROPERTIES (NOTION STYLE) */}
              <div style={{display: "flex", flexDirection: "column", gap: 14, width: "100%", marginTop: 8}}>
                 
                 {/* Item: Status */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Zap size={14}/> Status
                    </div>
                    {editingFieldLeft === "status" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown dark={false} value={d.status} options={statuses} prefix="" onChange={(v)=>{set("status", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({statuses: opts})} 
                          style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, background: getTranslucentColor(activeStatusColor, "20"), color: activeStatusColor, border: "1px solid rgba(44,32,22,0.15)", boxShadow: "none", borderRadius: 6 }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditingFieldLeft("status")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 12, fontWeight: 700, color: activeStatusColor, background: getTranslucentColor(activeStatusColor, "20"), padding: "4px 10px", borderRadius: 6, display: "inline-block"}}>
                          {d.status || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>Pilih Status...</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: PIC / Assign */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Users size={14}/> Assign
                    </div>
                    {editingFieldLeft === "pic" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown dark={false} multiple={true} value={d.pic} options={pics} prefix="" onChange={(v)=>{set("pic", Array.isArray(v) ? v.join(", ") : v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({pics: opts})} 
                          style={{ width: "100%", padding: "4px 8px", fontSize: 13, fontWeight: 600, background: "transparent", color: "#111827", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, boxShadow: "none" }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditingFieldLeft("pic")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer", 
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 13, fontWeight: 600, color: "#111827", display: "inline-block", maxWidth: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                          {d.pic || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>Ketik atau pilih PIC...</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Jadwal Produksi */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Calendar size={14}/> Jadwal Produksi
                    </div>
                    {editingFieldLeft === "productionDate" ? (
                      <div ref={activeFieldRef} style={{flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap"}}>
                        <div style={{display: "flex", alignItems: "center", gap: 4, background: "#FFF", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, padding: "4px 8px"}}>
                          <input type="date" value={`${d.productionYear || new Date().getFullYear()}-${String(d.productionMonth || new Date().getMonth()+1).padStart(2, '0')}-${String(d.productionDay || new Date().getDate()).padStart(2, '0')}`} 
                            onChange={(e:any) => {
                              const parts = e.target.value.split("-");
                              if (parts.length === 3) {
                                set("productionYear", parseInt(parts[0], 10)); set("productionMonth", parseInt(parts[1], 10)); set("productionDay", parseInt(parts[2], 10));
                              }
                            }} 
                            style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", outline: "none", cursor: "pointer", padding: "2px 0" }}
                          />
                          <input type="number" min={d.timeFormat === '24H' ? 0 : 1} max={d.timeFormat === '24H' ? 23 : 12} value={d.productionHour !== undefined && d.productionHour !== null ? d.productionHour : ""} onChange={handleProductionHourChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                          <span style={{color:"#111827", fontWeight: 700, fontSize: 13}}>:</span>
                          <input type="number" min={0} max={59} step={5} value={d.productionMinute !== undefined && d.productionMinute !== null ? d.productionMinute : ""} onChange={handleProductionMinuteChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditingFieldLeft("productionDate")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 13, fontWeight: 500, color: (d.productionDay && d.productionMonth && d.productionYear) ? "#4b5563" : "rgba(44,32,22,0.4)"}}>
                          {d.productionDay && d.productionMonth && d.productionYear ? `${String(d.productionDay).padStart(2,'0')}/${String(d.productionMonth).padStart(2,'0')}/${d.productionYear} (${String(d.productionHour !== undefined && d.productionHour !== null ? d.productionHour : 0).padStart(2,'0')}:${String(d.productionMinute !== undefined && d.productionMinute !== null ? d.productionMinute : 0).padStart(2,'0')})` : <span style={{fontStyle: "italic"}}>Atur tanggal produksi...</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Jadwal Upload */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Calendar size={14}/> Jadwal Upload
                    </div>
                    {editingFieldLeft === "uploadDate" ? (
                      <div ref={activeFieldRef} style={{flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap"}}>
                        <div style={{display: "flex", alignItems: "center", gap: 4, background: "#FFF", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, padding: "4px 8px"}}>
                          <input type="date" value={`${d.year || new Date().getFullYear()}-${String(d.month || new Date().getMonth()+1).padStart(2, '0')}-${String(d.day || new Date().getDate()).padStart(2, '0')}`} 
                            onChange={(e:any) => {
                              const parts = e.target.value.split("-");
                              if (parts.length === 3) {
                                set("year", parseInt(parts[0], 10)); set("month", parseInt(parts[1], 10)); set("day", parseInt(parts[2], 10));
                              }
                            }} 
                            style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", outline: "none", cursor: "pointer", padding: "2px 0" }}
                          />
                          <input type="number" min={d.timeFormat === '24H' ? 0 : 1} max={d.timeFormat === '24H' ? 23 : 12} value={d.uploadHour !== undefined && d.uploadHour !== null ? d.uploadHour : ""} onChange={handleHourChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                          <span style={{color:"#111827", fontWeight: 700, fontSize: 13}}>:</span>
                          <input type="number" min={0} max={59} step={5} value={d.uploadMinute !== undefined && d.uploadMinute !== null ? d.uploadMinute : ""} onChange={handleMinuteChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditingFieldLeft("uploadDate")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 13, fontWeight: 500, color: (d.day && d.month && d.year) ? "#4b5563" : "rgba(44,32,22,0.4)"}}>
                          {d.day && d.month && d.year ? `${String(d.day).padStart(2,'0')}/${String(d.month).padStart(2,'0')}/${d.year} (${String(d.uploadHour !== undefined && d.uploadHour !== null ? d.uploadHour : 0).padStart(2,'0')}:${String(d.uploadMinute !== undefined && d.uploadMinute !== null ? d.uploadMinute : 0).padStart(2,'0')})` : <span style={{fontStyle: "italic"}}>Atur tanggal upload...</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Pillar */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Flag size={14}/> Pillar
                    </div>
                    {editingFieldLeft === "pillar" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown dark={false} value={d.pillar} options={pillars} prefix="" onChange={(v)=>{set("pillar", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({pillars: opts})} 
                          style={{ padding: "4px 8px", fontSize: 12, fontWeight: 600, background: "rgba(0,0,0,0.06)", color: "#4b5563", border: "1px solid rgba(44, 32, 22, 0.15)", borderRadius: 6, boxShadow: "none" }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditingFieldLeft("pillar")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 12, fontWeight: 600, color: "#4b5563", background: "rgba(0,0,0,0.06)", padding: "4px 10px", borderRadius: 6, display: "inline-block"}}>
                          {d.pillar || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>Pilih pillar...</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Platform */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Paperclip size={14}/> Platform
                    </div>
                    {editingFieldLeft === "platform" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown dark={false} value={d.platform} options={platforms} prefix="" onChange={(v)=>{set("platform", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({platforms: opts})} 
                          style={{ padding: "4px 8px", fontSize: 12, fontWeight: 600, background: "transparent", color: "#4b5563", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, boxShadow: "none" }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditingFieldLeft("platform")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 12, fontWeight: 600, color: "#4b5563", display: "inline-block"}}>
                          {d.platform || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>Pilih platform...</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Content Type / Type */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <FileText size={14}/> Type
                    </div>
                    {editingFieldLeft === "contentType" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown dark={false} value={d.contentType} options={contentTypes} prefix="" onChange={(v)=>{set("contentType", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts) => onSettingUpdate && onSettingUpdate({contentTypes: opts})} 
                          style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, background: getTranslucentColor(activeContentTypeColor, "20"), color: activeContentTypeColor, border: "1px solid rgba(44,32,22,0.15)", boxShadow: "none", borderRadius: 6 }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditingFieldLeft("contentType")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 12, fontWeight: 700, color: activeContentTypeColor, background: getTranslucentColor(activeContentTypeColor, "20"), padding: "4px 10px", borderRadius: 6, display: "inline-block"}}>
                          {d.contentType || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>Pilih tipe...</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Referensi */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Link size={14}/> Referensi
                    </div>
                    {editingFieldLeft === "assetLink" ? (
                      <div ref={activeFieldRef} style={{flex: 1, display: "flex", alignItems: "center", gap: 6}}>
                        <input type="text" value={d.assetLink || ""} onChange={(e:any)=>set("assetLink", e.target.value)} placeholder="Tautkan link referensi..." style={{background: "#FFF", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, outline: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: "100%", padding: "4px 8px"}} autoFocus />
                      </div>
                    ) : (
                      <div 
                        onClick={() => setEditingFieldLeft("assetLink")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28, gap: 6
                        }}
                        className="hover:bg-black/5"
                      >
                        {d.assetLink ? (
                          <>
                            <span style={{fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "underline", display: "inline-block", maxWidth: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                              Link Referensi
                            </span>
                            <a href={d.assetLink} target="_blank" rel="noopener noreferrer" style={{color: "#2563eb", display: "flex", alignItems: "center"}} onClick={(e) => e.stopPropagation()}>
                              <ExternalLink size={14} />
                            </a>
                          </>
                        ) : (
                          <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontSize: 13}}>Tautkan referensi...</span>
                        )}
                      </div>
                    )}
                 </div>

              </div>
          </div>
          
{/* AI Analysis Result Section if exists */}
          {aiResult && (
            <div style={{background:"rgba(227, 242, 253, 0.4)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:"1px solid rgba(187, 222, 251, 0.6)", borderRadius:12, padding:16, boxShadow:"0 4px 12px rgba(30,136,229,0.08)", marginTop: aiResult ? 0 : 0}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                <span style={{fontSize:12, fontWeight:700, color:"#1E88E5", display:"flex", alignItems:"center", gap:6}}>
                    <GeminiIcon size={14} />
                    AI Content Analysis
                </span>
                <button onClick={()=>setAiResult("")} style={{border:"none", background:"transparent", fontSize:16, cursor:"pointer", color:"#1E88E5"}}>&times;</button>
              </div>
              <div style={{fontSize:12, lineHeight:1.6, color:"#2C3E50", whiteSpace:"pre-wrap"}}><Markdown>{aiResult}</Markdown></div>
            </div>
          )}
          
            </div>
            {/* RIGHT COLUMN: MAIN CONTENT */}
            <div ref={modalScrollRef} onScroll={handleRightScroll} style={{ 
              flex: 1, 
              padding: "0 32px 32px 32px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "16px", 
              background: "transparent", 
              overflowY: "scroll",
              position: "relative"
            }}>

          {/* Removed single mode banner transition flow to place mode switch in the footer */}

          <div style={{
            position: "sticky",
            top: 0,
            paddingTop: 32,
            paddingBottom: 16,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none"
          }}>
            {/* APPLE-LIKE SEGMENTED CONTROL */}
            <div style={{ 
              display: "flex", background: "rgba(0,0,0,0.05)", padding: "2px", boxSizing: "border-box",
              borderRadius: "10px", width: "100%", maxWidth: "450px", marginTop: 0, marginBottom: 0, height: "32px", position: "relative",
              pointerEvents: "auto"
            }}>
            <motion.div
              layout
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              style={{
                position: "absolute",
                top: 2,
                bottom: 2,
                borderRadius: "8px",
                background: "#FFFFFF",
                boxShadow: isRightScrolled ? "0 8px 24px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)" : "0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)",
                width: "calc((100% - 4px) / 3)",
                left: activeTab === "draft" ? 2 : activeTab === "refs" ? "calc(((100% - 4px) / 3) + 2px)" : "calc(((100% - 4px) / 3 * 2) + 2px)",
                zIndex: 0
              }}
            />
            {[
              { id: "draft", label: "Brief & Konten" },
              { id: "refs", label: "Aset & Referensi" },
              { id: "metrics", label: "Metrik & Ads" }
            ].map(({ id, label }) => (
              <button 
                key={id}
                onClick={(e) => { e.preventDefault(); setActiveTab(id as any); }}
                style={{
                  flex: 1,
                  padding: "0",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "transparent",
                  color: activeTab === id ? "#000000" : "rgba(0,0,0,0.6)",
                  boxShadow: "none",
                  transition: "color 0.2s",
                  position: "relative",
                  zIndex: 1
                }}
              >
                {label}
              </button>
            ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
            
            {/* TAB DRAFT (Objective, Brief, Caption) */}
            {activeTab === "draft" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                {/* Objective Block */}
                {editingFieldRight === "objective" ? (
                  <div ref={activeFieldRef} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0, marginBottom: 8 }}>
                      <Target size={14} /> Objective
                    </label>
                    <RichTextEditor inputRef={objectiveRef} value={d.objective} onChange={(val)=>set("objective",val)} minRows={2} placeholder="Tujuan atau target output dari konten ini..."/>
                  </div>
                ) : (
                  <div 
                    onClick={() => setEditingFieldRight("objective")}
                    style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "pointer" }}
                    title="Klik untuk mengedit Objective"
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                      <Target size={14} /> Objective
                    </div>
                    <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10 }}>
                      {d.objective ? <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: d.objective }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Tidak ada spesifikasi objective khusus. Klik di sini untuk mengedit.</span>}
                    </div>
                  </div>
                )}

                {/* Hook Block */}
                {editingFieldRight === "hook" ? (
                  <div ref={activeFieldRef} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0, marginBottom: 8 }}>
                      <AlertCircle size={14} /> Hook
                    </label>
                    <RichTextEditor value={d.hook || ""} onChange={(val)=>set("hook",val)} minRows={2} placeholder="Skenario pembuka konten yang bisa mengundang atensi dalam 3 detik pertama..."/>
                  </div>
                ) : (
                  <div 
                    onClick={() => setEditingFieldRight("hook")}
                    style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "pointer" }}
                    title="Klik untuk mengedit Hook"
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                      <AlertCircle size={14} /> Hook
                    </div>
                    <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10 }}>
                      {d.hook ? <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: d.hook }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Skenario / teks hook belum diisi. Klik di sini untuk mengedit.</span>}
                    </div>
                  </div>
                )}

                {/* Brief Block */}
                {editingFieldRight === "brief" ? (
                  <div ref={activeFieldRef} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column" }}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 8}}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <FileText size={14} /> Brief
                        </label>
                        <button onClick={analyzeContent} disabled={aiLoading} 
                          style={{...B(false), fontSize:10, padding:"4px 10px", borderRadius: 8, background:"#f3f4f6", color:"#1f2937", border:"1px solid #d1d5db", display:"flex", alignItems:"center", gap:4}}>
                          <GeminiIcon size={12} />
                          {aiLoading ? <LoadingDots /> : "Analyze with Gemini"}
                        </button>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", minHeight: 120}}>
                      <RichTextEditor style={{width: "100%"}} inputRef={briefRef} value={d.briefCopywriting} onChange={(val)=>set("briefCopywriting",val)} minRows={6} placeholder="Arah konten, tone of voice, call to action, poin kata kunci utama..."/>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setEditingFieldRight("brief")}
                    style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "pointer", display: "flex", flexDirection: "column" }}
                    title="Klik untuk mengedit Brief"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
                        <FileText size={14} /> Brief
                      </span>
                      {d.briefCopywriting && (
                        <button onClick={(e) => { e.stopPropagation(); if (copiedBrief) return; navigator.clipboard.writeText(htmlToPlainText(d.briefCopywriting)); setCopiedBrief(true); setTimeout(() => setCopiedBrief(false), 2000); }} style={{ background: copiedBrief ? "rgba(46,125,50,0.1)" : "rgba(59,130,246,0.08)", border: "none", color: copiedBrief ? "#2E7D32" : "#3B82F6", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 750, cursor: copiedBrief ? "default" : "pointer", display: "flex", alignItems: "center", transition: "all 0.3s ease" }}>
                          {copiedBrief ? <>Berhasil disalin</> : <><Copy size={12} style={{marginRight: 4}} /> Salin Brief</>}
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "#FCFAF7", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(44, 32, 22, 0.03)" }}>
                      {d.briefCopywriting ? <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: d.briefCopywriting }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Belum ada brief konten. Klik di sini untuk mengedit.</span>}
                    </div>
                  </div>
                )}

                {/* CTA Block */}
                {editingFieldRight === "cta" ? (
                  <div ref={activeFieldRef} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0, marginBottom: 8 }}>
                      <Megaphone size={14} /> Call to Action (CTA)
                    </label>
                    <RichTextEditor value={d.cta || ""} onChange={(val)=>set("cta",val)} minRows={2} placeholder="Ajak audiens melakukan sesuatu (Contoh: Klik link di bio, komen, dll)..."/>
                  </div>
                ) : (
                  <div 
                    onClick={() => setEditingFieldRight("cta")}
                    style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "pointer" }}
                    title="Klik untuk mengedit Call to Action"
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                      <Megaphone size={14} /> Call to Action (CTA)
                    </div>
                    <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10 }}>
                      {d.cta ? <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: d.cta }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Call to Action belum diisi. Klik di sini untuk mengedit.</span>}
                    </div>
                  </div>
                )}

                {/* Caption Block */}
                {editingFieldRight === "caption" ? (
                  <div ref={activeFieldRef} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column" }}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 8}}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <PenTool size={14} /> Caption
                        </label>
                        <button onClick={generateCaption} disabled={captionLoading} 
                          style={{...B(false), fontSize:10, padding:"4px 10px", borderRadius: 8, background:"#f3f4f6", color:"#1f2937", border:"1px solid #d1d5db", display:"flex", alignItems:"center", gap:4}}>
                          <GeminiIcon size={12} />
                          {captionLoading ? <LoadingDots /> : "Generate Caption"}
                        </button>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", minHeight: 150}}>
                      <RichTextEditor style={{width: "100%"}} inputRef={captionRef} value={d.caption} onChange={(val)=>set("caption",val)} minRows={8} placeholder="Salinan caption social media yang sudah siap diposting..."/>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setEditingFieldRight("caption")}
                    style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "pointer", display: "flex", flexDirection: "column" }}
                    title="Klik untuk mengedit Caption"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
                        <PenTool size={14} /> Caption
                      </span>
                      {d.caption && (
                        <button onClick={(e) => { e.stopPropagation(); if (copiedCaption) return; navigator.clipboard.writeText(htmlToPlainText(d.caption)); setCopiedCaption(true); setTimeout(() => setCopiedCaption(false), 2000); }} style={{ background: copiedCaption ? "rgba(46,125,50,0.1)" : "rgba(59,130,246,0.08)", border: "none", color: copiedCaption ? "#2E7D32" : "#3B82F6", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 750, cursor: copiedCaption ? "default" : "pointer", display: "flex", alignItems: "center", transition: "all 0.3s ease" }}>
                          {copiedCaption ? <>Berhasil disalin</> : <><Copy size={12} style={{marginRight: 4}} /> Salin Caption</>}
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: "#FAFDFB", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(44, 32, 22, 0.03)" }}>
                      {d.caption ? <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: d.caption }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Belum ada salinan caption. Klik di sini untuk mengedit.</span>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB REFS (Cloud Links & Resources) */}
            {activeTab === "refs" && (
              editingFieldRight === "refs" ? (
                <div ref={activeFieldRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Block 6: Asset Link & Social Media Link */}
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16
                  }}>
                    <div style={GRP}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                        <Link size={14} /> Link Aset Final (G-Drive / Dropbox)
                      </label>
                      <input value={d.linkAsset||""} onChange={(e:any)=>set("linkAsset",e.target.value)} style={{...I(), border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10 }} placeholder="https://drive.google.com/..."/>
                    </div>
                    <div style={GRP}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                        <Link size={14} /> Link Upload / Postingan Sosmed
                      </label>
                      <input value={d.linkSosmed||""} onChange={(e:any)=>set("linkSosmed",e.target.value)} style={{...I(), border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10 }} placeholder="https://instagram.com/p/..."/>
                    </div>
                  </div>

                  {/* Reference Section */}
                  <div style={{background:"rgba(44,32,22,0.03)",border:"1px solid rgba(44,32,22,0.08)",borderRadius:16,padding:"16px 20px",marginBottom:0}}>
                    <div style={{...L,marginBottom:8}}><Paperclip size={14} /> Referensi Konten</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div style={GRP}><label style={{...L,marginBottom:2}}>Catatan Referensi</label><TextareaAutosize value={d.referenceText} onChange={(e:any)=>set("referenceText",e.target.value)} style={I({resize:"vertical"})} minRows={3} placeholder="Referensi, mood, arahan visual..."/></div>
                      <div style={GRP}>
                        <label style={{...L,marginBottom:2}}>Link Referensi <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks",[...(dRef.current.referenceLinks||[]),""]); }} style={{background:"none",border:"none",color:"#3B82F6",cursor:"pointer",fontSize:10}}>(+ Tambah)</button></label>
                        {(d.referenceLinks||[]).map((lnk:string,i:number)=>(
                          <div key={i} style={{display:"flex",gap:4,marginBottom:4}}>
                            <input value={lnk} onChange={(e:any)=>set("referenceLinks", dRef.current.referenceLinks.map((l:any,idx:number)=>idx===i?e.target.value:l))} style={I()} placeholder="https://..."/>
                            <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks", dRef.current.referenceLinks.filter((_:any,idx:number)=>idx!==i)); }} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer"}}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={GRP}>
                      <label style={{...L,marginBottom:2}}>Upload Gambar Referensi</label>
                      <input type="file" accept="image/*" onChange={handleRefImg} style={{fontSize:11,color:"rgba(44,32,22,0.5)"}}/>
                      {d.referenceImage&&<img src={d.referenceImage} alt="ref" style={{maxWidth:200,maxHeight:100,borderRadius:6,marginTop:6,border:"1px solid rgba(44,32,22,0.1)",objectFit:"contain"}}/>}
                    </div>
                  </div>
                </div>
              ) : (
                <div onClick={() => setEditingFieldRight("refs")} style={{ display: "flex", flexDirection: "column", gap: 16, cursor: "pointer" }} title="Klik di mana saja untuk mengedit Referensi">
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px" }}>
                      <FolderOpen size={14} /> Tautan & Folder Sumber Daya
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {d.linkAsset ? (
                        <a href={d.linkAsset} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "12px 16px", transition: "background 0.2s", minWidth: 0 }}>
                          <span style={{ fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><FolderOpen size={18} /></span>
                          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6" }}>Buka Aset Desain</div>
                            <div style={{ fontSize: 10, color: "rgba(44,32,22,0.5)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.linkAsset}</div>
                          </div>
                        </a>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: "12px 16px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                          <FolderOpen size={14} style={{ flexShrink: 0 }} /> Link aset belum ditautkan.
                        </div>
                      )}

                      {d.linkSosmed ? (
                        <a href={d.linkSosmed} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "12px 16px", transition: "background 0.2s", minWidth: 0 }}>
                          <span style={{ fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><ExternalLink size={18} /></span>
                          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>Lihat Sosmed</div>
                            <div style={{ fontSize: 10, color: "rgba(59,130,246,0.6)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.linkSosmed}</div>
                          </div>
                        </a>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: "12px 16px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                          <ExternalLink size={14} style={{ flexShrink: 0 }} /> Belum live di sosmed.
                        </div>
                      )}
                    </div>
                  </div>

                  {(d.referenceText || (d.referenceLinks && d.referenceLinks.filter((l:string)=>l.trim() !== "").length > 0) || d.referenceImage) ? (
                    <div style={{
                      background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                      borderRadius: 16,
                      padding: "16px 20px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                        <Paperclip size={14} /> Bahan Referensi Visual & Catatan
                      </div>
                      {d.referenceText && (
                        <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, marginBottom: 8, padding: "12px 16px", background: "rgba(44,32,22,0.02)", borderRadius: 10 }}>
                          {d.referenceText}
                        </div>
                      )}
                      {d.referenceLinks && d.referenceLinks.filter((l:string)=>l.trim() !== "").length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: d.referenceImage ? 8 : 0 }}>
                          {d.referenceLinks.filter((l:string)=>l.trim() !== "").map((lnk:string, idx:number) => (
                            <a key={idx} href={lnk} target="_blank" rel="noreferrer" style={{ textDecoration: "none", fontSize: 11, color: "#3B82F6", background: "rgba(59,130,246,0.06)", padding: "4px 8px", borderRadius: 8, fontWeight: 600 }}>
                              <Link size={12} style={{marginRight: 4}}/> Link Referensi {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      {d.referenceImage && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(44,32,22,0.5)" }}>Moodboard Inspirasi:</span>
                          <img src={d.referenceImage} alt="moodboard" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.7)", objectFit: "contain" }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: "12px 16px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                      <Paperclip size={14} style={{ flexShrink: 0 }} /> Belum ada data referensi. Klik untuk menambahkan...
                    </div>
                  )}
                </div>
              )
            )}

            {/* TAB METRICS (Stats, Bento, ads) */}
            {activeTab === "metrics" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Item 7: Custom Fields Section */}
                <div style={{
                  background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"
                }}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                      <Plus size={14} /> Bidang Kustom (Custom Fields)
                    </div>
                    <button onClick={(e)=>{ e.stopPropagation(); set("customFields",[...(d.customFields||[]),{name:"Label Baru",value:""}]); setEditingFieldRight("customField_"+((d.customFields?.length||0))); }} style={{fontSize:10,padding:"4px 10px", borderRadius: 8, background: "rgba(44,32,22,0.05)", border: "none", color: "#2C2016", fontWeight: 600, cursor: "pointer"}}>+ Tambah Field</button>
                  </div>
                  {(d.customFields||[]).length === 0 ? (
                    <div style={{ fontSize: 11, color: "rgba(44,32,22,0.4)", textAlign: "center", padding: "10px 0" }}>Belum ada custom fields.</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {(d.customFields||[]).map((cf:any, idx:number)=>(
                        <div key={idx} onClick={() => setEditingFieldRight("customField_"+idx)} style={{ background: "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10, position: "relative", cursor: "pointer" }}>
                          {editingFieldRight === "customField_"+idx ? (
                            <div ref={activeFieldRef} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <input autoFocus value={cf.name} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,name:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.5)", textTransform: "uppercase", width: "100%", padding: 0 }} placeholder="Nama Field..."/>
                                <button onClick={(e)=>{ e.stopPropagation(); set("customFields", d.customFields.filter((_:any,i:number)=>i!==idx)); setEditingFieldRight(null); }} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer", padding: "0 4px", fontSize: 14}}>✕</button>
                              </div>
                              <TextareaAutosize value={cf.value} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,value:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#2C2016", width: "100%", padding: 0, resize: "none" }} minRows={1} placeholder="Isi field..."/>
                            </div>
                          ) : (
                            <>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.5)", textTransform: "uppercase", marginBottom: 4 }}>{cf.name || `Field ${idx+1}`}</div>
                              <div style={{ fontSize: 13, color: "#2C2016", whiteSpace: "pre-wrap" }}>{cf.value || "-"}</div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Item 8: High Impact Stats (Bento Widget) */}
                <div style={{
                  background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}><BarChart2 size={12} /> Laporan Statistik Performa</span>
                    {d.metricsUpdatedAt && <span style={{ fontSize: 10, color: "rgba(44,32,22,0.4)" }}>Terakhir diupdate: {d.metricsUpdatedAt}</span>}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "rgba(59,130,246,0.03)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Leaf size={14} style={{marginRight: 4}} /> Jangkauan Organik</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 8, marginBottom: 10 }}>
                          {MK.map((k:string) => (
                            <div onClick={() => setEditingFieldRight("metric_"+k)} key={k} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(44,32,22,0.02)", padding: "6px 10px", borderRadius: 8, cursor: "pointer", position: "relative" }}>
                              {getMetricIcon(k, MC[k]||"#3B82F6", 14)}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 9, color: "rgba(44,32,22,0.5)", textTransform: "capitalize", lineHeight: 1.1, marginBottom: 2 }}>{formatMetricKey(k)}</div>
                                {editingFieldRight === "metric_"+k ? (
                                  <input 
                                    ref={activeFieldRef}
                                    autoFocus
                                    type="number" 
                                    min={0} 
                                    placeholder="0" 
                                    value={d.metrics[k] === 0 ? "" : (d.metrics[k] !== undefined && d.metrics[k] !== null ? d.metrics[k] : "")} 
                                    onChange={(e:any)=>setM(k,e.target.value)} 
                                    onKeyDown={(e) => e.key === "Enter" && setEditingFieldRight(null)}
                                    style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: 12, fontWeight: 805, color: "#2C2016", padding: 0 }}
                                  />
                                ) : (
                                  <div style={{ fontSize: 12, fontWeight: 805, color: "#2C2016" }}>{fmt(d.metrics[k] || 0)}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ borderTop: "1px dashed rgba(59,130,246,0.15)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                          <span>Total Interaksi:</span>
                          <strong style={{ color: "#3B82F6" }}>{fmt(eng(d.metrics))}</strong>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                          <span>Engagement Rate:</span>
                          <strong style={{ color: "#3B82F6" }}>{(d.metrics?.reach || 0) > 0 ? ((eng(d.metrics) / d.metrics.reach) * 100).toFixed(2) : 0}%</strong>
                        </div>
                      </div>
                    </div>
   
                    <div style={{ background: d.isAds ? "rgba(156,43,78,0.03)" : "rgba(44,32,22,0.01)", border: d.isAds ? "1px solid rgba(156,43,78,0.08)" : "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", justifyContent: d.isAds ? "space-between" : "center" }}>
                      {d.isAds ? (
                        <>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#9C2B4E", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={14} style={{marginRight: 4}} /> Hasil Kampanye Berbayar</div>
                              <button onClick={(e)=>{ e.stopPropagation(); set("isAds",!d.isAds); }} style={{width:32,height:18,borderRadius:9,border:"none",cursor:"pointer",background:d.isAds?"#9C2B4E":"rgba(44,32,22,0.15)",transition:"background .2s",position:"relative",flexShrink:0}}>
                                <div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:2,left:d.isAds?16:2,transition:"left .2s"}}/>
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
                              {ADS_CATEGORIES.map(cat => (
                                <div key={cat.title}>
                                  <div style={{fontSize: 12, fontWeight: 800, color: "#9C2B4E", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(156,43,78,0.15)", paddingBottom: 4}}>{cat.title}</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 6 }}>
                                    {cat.keys.map(k => (
                                      <div onClick={() => setEditingFieldRight("adsMetric_"+k)} key={k} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(156,43,78,0.02)", padding: "5px 8px", borderRadius: 8, cursor: "pointer" }}>
                                        {getMetricIcon(k, k==="clicks"||k==="conversions"?"#9C2B4E":MC[k]||"#9C2B4E", 13)}
                                        <div style={{flex: 1, minWidth: 0}}>
                                          <div style={{ fontSize: 8, color: "rgba(44,32,22,0.5)", textTransform: "capitalize", lineHeight: 1.1, marginBottom: 2 }}>{formatMetricKey(k)}</div>
                                          {editingFieldRight === "adsMetric_"+k ? (
                                            <input 
                                              ref={activeFieldRef}
                                              autoFocus
                                              type={k === "audience" ? "text" : "number"} 
                                              min={k === "audience" ? undefined : 0} 
                                              placeholder={k === "audience" ? "..." : "0"} 
                                              value={d.adsMetrics?.[k] === 0 && k !== "audience" ? "" : (d.adsMetrics?.[k] !== undefined && d.adsMetrics?.[k] !== null ? d.adsMetrics[k] : "")} 
                                              onChange={(e:any)=>setM(k,e.target.value,true)} 
                                              onKeyDown={(e) => e.key === "Enter" && setEditingFieldRight(null)}
                                              style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: 11, fontWeight: 805, color: "#2C2016", padding: 0 }}
                                            />
                                          ) : (
                                            <div style={{ fontSize: 11, fontWeight: 805, color: "#2C2016", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={k === "audience" ? (d.adsMetrics?.[k] || "") : ""}>
                                              {k === "audience" ? (d.adsMetrics?.[k] || "-") : fmt((d.adsMetrics || {})[k] || 0)}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ borderTop: "1px dashed rgba(156,43,78,0.15)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                            <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                              <span>Clicks / Conversions:</span>
                              <strong style={{ color: "#9C2B4E" }}>{fmt(d.adsMetrics?.clicks || 0)} / {fmt(d.adsMetrics?.conversions || 0)}</strong>
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                              <span>Total Engagement Ads:</span>
                              <strong style={{ color: "#9C2B4E" }}>{fmt(eng(d.adsMetrics || {}))}</strong>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.5 }}>
                            <DollarSign size={14} />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>Tidak ada kampanye berbayar</span>
                          </div>
                          <button onClick={(e)=>{ e.stopPropagation(); set("isAds",!d.isAds); }} style={{width:32,height:18,borderRadius:9,border:"none",cursor:"pointer",background:d.isAds?"#9C2B4E":"rgba(44,32,22,0.15)",transition:"background .2s",position:"relative",flexShrink:0}}>
                            <div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:2,left:d.isAds?16:2,transition:"left .2s"}}/>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
        </div>

        <div style={{display:"flex", gap:10, justifyContent:"space-between", alignItems:"center", padding: "10px 20px", borderTop: "1px solid rgba(44,32,22,0.08)", background: "white", borderRadius: "0 0 24px 24px", zIndex: 10, flexShrink: 0}}>
          <div style={{display:"flex", gap:10, alignItems:"center"}}>
            <button onClick={handleClose} className="hover-scale" style={{...B(false), background:"transparent", border:"1px solid rgba(44,32,22,0.2)", color:"#2C2016", padding:"5px 12px", fontSize:11, fontWeight:700}}>Tutup</button>
            {isSaving && (
              <span style={{ fontSize: 10, color: "#3B82F6", fontWeight: 700, display: "flex", alignItems: "center" }} className="animate-pulse">
                Menyimpan...
              </span>
            )}
          </div>
          <div style={{display:"flex", gap:8}}>
            {onDuplicate && (
              <button onClick={()=>onDuplicate(d)} className="hover-scale" style={{...B(false), background:"rgba(44,32,22,0.05)", border:"1.5px solid rgba(44,32,22,0.1)", color:"#2C2016", padding:"5px 10px", fontSize:11, fontWeight:700}}><Copy size={12} style={{marginRight: 4}} /> Duplikasi</button>
            )}
            {d.archived ? (
              <button onClick={()=>onRestore(d.id)} className="hover-scale" style={{...B(false), background:"#E8F5E9", border:"1.5px solid #2E7D32", color:"#2E7D32", padding:"5px 10px", fontSize:11, fontWeight:700}}><RefreshCcw size={12} style={{marginRight: 4}} /> Tampilkan Lagi</button>
            ) : (
              canArchive && <button onClick={()=>onArchive(d.id)} className="hover-scale" style={{...B(false), background:"rgba(255, 255, 255, 0.85)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)", border:"1px solid rgba(0,0,0,0.1)", color:"#666", padding:"5px 10px", fontSize:11, fontWeight:700}}><Archive size={12} style={{marginRight: 4}} /> Arsipkan</button>
            )}
            {canDelete && <button onClick={()=>onDelete(d.id)} className="hover-scale" style={{...B(false), background:"#FDF5F8", border:"1.5px solid #9C2B4E", color:"#9C2B4E", padding:"5px 10px", fontSize:11, fontWeight:700}}><Trash size={12} style={{marginRight: 4}} /> Hapus</button>}
            <button onClick={async () => {
              isDirty.current = false;
              const newD = { ...dRef.current, manuallySaved: true };
              setD(newD);
              dRef.current = newD;
              await onSave(newD, true);
              onClose();
            }} className="hover-scale" style={{...B(false), background:"#3B82F6", border:"none", color:"white", padding:"5px 14px", fontSize:12, fontWeight:700}}>Simpan Brief Konten</button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,borderRadius:24}} onClick={e=>e.stopPropagation()}>
             <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} style={{background:"#FFFFFF", border:"1px solid rgba(255,255,255,0.5)",padding:32,borderRadius:24,maxWidth:360,width:"100%",boxShadow:"0 12px 30px rgba(0,0,0,0.2)",textAlign:"center"}}>
                <h3 style={{margin:"0 0 16px",fontSize:20,color:"#2C2016", fontWeight:800}}>Keluar Murni?</h3>
                <p style={{margin:"0 0 24px",fontSize:14,color:"rgba(44,32,22,0.6)",lineHeight:1.5}}>
                   Konten dari HUB.AI ini belum Anda simpan. Yakin ingin menutupnya? Jika ditutup, draf ini akan hangus dan hilang sepenuhnya.
                </p>
                <div style={{display:"flex",gap:12}}>
                   <button onClick={async ()=>{
                     onClose();
                   }} style={{flex:1,padding:"12px 16px",background:"transparent",border:"1.5px solid rgba(44,32,22,0.2)",color:"#2C2016",borderRadius:24,fontWeight:700,cursor:"pointer"}}>
                      Hapus Draft
                   </button>
                   <button onClick={()=>{
                     setShowExitConfirm(false);
                   }} style={{flex:1,padding:"12px 16px",background:"#3B82F6",border:"none",color:"white",borderRadius:24,fontWeight:700,cursor:"pointer"}}>
                      Lanjutkan Edit
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

