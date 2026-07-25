import { Tooltip } from "./components/Tooltip";
import { useI18n } from "./i18n";
import { useState, useRef, useEffect } from "react";
import { auth, callAiWithQuota, db } from "./firebase";
import { doc, updateDoc, onSnapshot, collection, query, where, getDocs, limit, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import TextareaAutosize from "react-textarea-autosize";
import { RichTextEditor } from "./RichTextEditor";
import { MiniCalendar } from "./components/MiniCalendar";
import { HubifyRoleSelect } from "./components/HubifyRoleSelect";

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
  Globe,
  Send,
  Maximize2,
  Link2,
  UserPlus,
  MessageSquare,
  PlayCircle,
  Wallet,
  Search,
  AtSign,
  X,
  UserCheck,
  Settings,
  ArrowUp,
  ArrowDown,
  Music,
  Hash,
  Compass,
  Layout,
  History,
  RefreshCw,
  ArrowRight
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
    profileVisits: "Kunjungan Profil",
    bioLinkTaps: "Klik Link Bio",
    msgConvStarted: "Pesan Dimulai",
    threeSecPlays: "Putar 3 Detik",
    spendBudget: "Total Spend",
    dailyBudget: "Budget Harian",
    cprProfileVisit: "CPR Profil",
    audience: "Audience",
    duration: "Durasi Iklan",
    likes: "Suka",
    clicks: "Klik Link",
    conversions: "Konversi",
    views: "Views",
    reach: "Reach",
    comments: "Komentar",
    reposts: "Reposts",
    saves: "Saves",
    follows: "Followers"
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

const DEFAULT_FIELDS = [
  { id: "objective", label: "Objective", icon: "Target", placeholder: "Tujuan atau target output dari konten ini...", visible: true },
  { id: "hook", label: "Hook", icon: "AlertCircle", placeholder: "Skenario pembuka konten yang bisa mengundang atensi dalam 3 detik pertama...", visible: true },
  { id: "briefCopywriting", label: "Brief Utama", icon: "FileText", placeholder: "Arah konten, tone of voice, call to action, poin kata kunci utama...", visible: true },
  { id: "cta", label: "Call to Action (CTA)", icon: "Megaphone", placeholder: "Ajak audiens melakukan sesuatu (Contoh: Klik link di bio, komen, dll)...", visible: true },
  { id: "caption", label: "Caption", icon: "PenTool", placeholder: "Salinan caption social media yang sudah siap diposting...", visible: true },
  { id: "targetAudience", label: "Target Audien", icon: "Users", placeholder: "Spesifik target demografi, persona, atau minat audiens...", visible: false },
  { id: "keyAngle", label: "Key Angle / Message", icon: "Sparkles", placeholder: "Sudut pandang unik atau pesan utama yang ingin ditekankan...", visible: false },
  { id: "visualConcept", label: "Visual Concept / Art Direction", icon: "Eye", placeholder: "Gaya visual, estetika, referensi transisi, atau moodboard...", visible: false },
  { id: "audioBgm", label: "Rekomendasi Audio & BGM", icon: "Music", placeholder: "Suara latar, lagu tren, ketukan, atau instruksi Voice Over (VO)...", visible: false },
  { id: "outro", label: "Outro / End Card", icon: "ExternalLink", placeholder: "Elemen visual/teks akhir sebelum video selesai...", visible: false },
  { id: "hashtags", label: "Hashtags", icon: "Hash", placeholder: "Rekomendasi hashtag untuk meningkatkan jangkauan algoritmik...", visible: false }
];

const getFieldIcon = (iconName: string, size = 14) => {
  switch (iconName) {
    case "Target": return <Target size={size} />;
    case "AlertCircle": return <AlertCircle size={size} />;
    case "FileText": return <FileText size={size} />;
    case "Megaphone": return <Megaphone size={size} />;
    case "PenTool": return <PenTool size={size} />;
    case "Users": return <Users size={size} />;
    case "Sparkles": return <Sparkles size={size} />;
    case "Eye": return <Eye size={size} />;
    case "Music": return <Music size={size} />;
    case "ExternalLink": return <ExternalLink size={size} />;
    case "Hash": return <Hash size={size} />;
    default: return <FileText size={size} />;
  }
};

const getFieldTranslation = (id: string, type: "label" | "placeholder", lang: string) => {
  const translations: any = {
    objective: {
      label: lang === "id" ? "Objective" : "Objective",
      placeholder: lang === "id" ? "Tujuan atau target output dari konten ini..." : "Goal or target output of this content..."
    },
    hook: {
      label: lang === "id" ? "Hook" : "Hook",
      placeholder: lang === "id" ? "Skenario pembuka konten yang bisa mengundang atensi dalam 3 detik pertama..." : "Opening hook to grab attention in the first 3 seconds..."
    },
    briefCopywriting: {
      label: lang === "id" ? "Brief Utama" : "Main Brief",
      placeholder: lang === "id" ? "Arah konten, tone of voice, call to action, poin kata kunci utama..." : "Content direction, tone of voice, call to action, key talking points..."
    },
    cta: {
      label: lang === "id" ? "Call to Action (CTA)" : "Call to Action (CTA)",
      placeholder: lang === "id" ? "Ajak audiens melakukan sesuatu (Contoh: Klik link di bio, komen, dll)..." : "Ask audience to take action (e.g. click link in bio, comment, etc.)..."
    },
    caption: {
      label: lang === "id" ? "Caption" : "Caption",
      placeholder: lang === "id" ? "Salinan caption social media yang sudah siap diposting..." : "Ready-to-post social media caption copy..."
    },
    targetAudience: {
      label: lang === "id" ? "Target Audien" : "Target Audience",
      placeholder: lang === "id" ? "Spesifik target demografi, persona, atau minat audiens..." : "Specific demographic target, persona, or audience interests..."
    },
    keyAngle: {
      label: lang === "id" ? "Key Angle / Message" : "Key Angle / Message",
      placeholder: lang === "id" ? "Sudut pandang unik atau pesan utama yang ingin ditekankan..." : "Unique angle or key message to highlight..."
    },
    visualConcept: {
      label: lang === "id" ? "Visual Concept / Art Direction" : "Visual Concept / Art Direction",
      placeholder: lang === "id" ? "Gaya visual, estetika, referensi transisi, atau moodboard..." : "Visual style, aesthetics, transitions, or moodboard..."
    },
    audioBgm: {
      label: lang === "id" ? "Rekomendasi Audio & BGM" : "Audio & BGM Recommendation",
      placeholder: lang === "id" ? "Suara latar, lagu tren, ketukan, atau instruksi Voice Over (VO)..." : "Background music, trending audio, beats, or voiceover (VO) instructions..."
    },
    outro: {
      label: lang === "id" ? "Outro / End Card" : "Outro / End Card",
      placeholder: lang === "id" ? "Elemen visual/teks akhir sebelum video selesai..." : "Visual/text element right before the content ends..."
    },
    hashtags: {
      label: lang === "id" ? "Hashtags" : "Hashtags",
      placeholder: lang === "id" ? "Rekomendasi hashtag untuk meningkatkan jangkauan algoritmik..." : "Hashtag recommendations to boost algorithmic reach..."
    }
  };
  return translations[id]?.[type] || "";
};

const HistoryChangeItem = ({ ch, lang }: { ch: any, lang: string }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (typeof ch === "string") {
    return (
      <div style={{background: "#F9FAFB", padding: "8px 12px", borderRadius: 8, border: "1px solid #F3F4F6"}}>
        <div style={{fontWeight: 700, fontSize: 12, color: "#111827"}}>{ch}</div>
      </div>
    );
  }
  
  const fromStr = String(ch.from || "-");
  const toStr = String(ch.to || "-");
  const isLong = fromStr.length > 30 || toStr.length > 30;

  return (
    <div style={{background: "#F9FAFB", padding: "8px 12px", borderRadius: 8, border: "1px solid #F3F4F6"}}>
      <div 
        style={{fontWeight: 700, fontSize: 12, color: "#111827", marginBottom: (expanded && isLong) ? 6 : 4, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: isLong ? "pointer" : "default"}}
        onClick={() => isLong && setExpanded(!expanded)}
      >
        <span>{ch.field}</span>
        {isLong && (
           <span style={{ fontSize: 10, color: "#3B82F6", fontWeight: 600 }}>{expanded ? (lang === "id" ? "Tutup" : "Collapse") : (lang === "id" ? "Detail" : "Expand")}</span>
        )}
      </div>
      
      {(expanded && isLong) ? (
        <div style={{display: "flex", flexDirection: "column", gap: 8, fontSize: 12, marginTop: 8}}>
          <div style={{background: "rgba(220, 38, 38, 0.05)", padding: 10, borderRadius: 6, border: "1px solid rgba(220, 38, 38, 0.1)"}}>
            <div style={{fontSize: 10, fontWeight: 700, color: "#DC2626", marginBottom: 4}}>{lang === "id" ? "Sebelumnya:" : "Previous:"}</div>
            <div style={{color: "#991B1B", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5}}>{fromStr}</div>
          </div>
          <div style={{display: "flex", justifyContent: "center"}}>
            <ArrowDown size={14} color="#9CA3AF" />
          </div>
          <div style={{background: "rgba(22, 163, 74, 0.05)", padding: 10, borderRadius: 6, border: "1px solid rgba(22, 163, 74, 0.1)"}}>
            <div style={{fontSize: 10, fontWeight: 700, color: "#16A34A", marginBottom: 4}}>{lang === "id" ? "Menjadi:" : "Changed to:"}</div>
            <div style={{color: "#166534", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5}}>{toStr}</div>
          </div>
        </div>
      ) : (
        <div style={{display: "flex", gap: 6, fontSize: 12, alignItems: "center"}}>
           <span style={{color: "#DC2626", textDecoration: "line-through", maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{fromStr}</span>
           <ArrowRight size={12} color="#9CA3AF" style={{flexShrink: 0}} />
           <span style={{color: "#16A34A", maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{toStr}</span>
        </div>
      )}
    </div>
  );
};

const getAssetLinks = (data: any): string[] => {
  if (Array.isArray(data?.assetLinks) && data.assetLinks.length > 0) {
    const valid = data.assetLinks.map((x: any) => (typeof x === "object" ? x.url || "" : String(x)));
    if (valid.length > 0) return valid;
  }
  if (data?.linkAsset) {
    const split = String(data.linkAsset)
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (split.length > 0) return split;
  }
  return [""];
};

const getSosmedLinks = (data: any): string[] => {
  if (Array.isArray(data?.sosmedLinks) && data.sosmedLinks.length > 0) {
    const valid = data.sosmedLinks.map((x: any) => (typeof x === "object" ? x.url || "" : String(x)));
    if (valid.length > 0) return valid;
  }
  if (data?.linkSosmed) {
    const split = String(data.linkSosmed)
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (split.length > 0) return split;
  }
  return [""];
};

const getLinkHostLabel = (url: string, defaultType: string = "Link") => {
  if (!url) return defaultType;
  const lower = url.toLowerCase();
  if (lower.includes("drive.google.com")) return "Google Drive";
  if (lower.includes("docs.google.com")) return "Google Docs";
  if (lower.includes("figma.com")) return "Figma";
  if (lower.includes("dropbox.com")) return "Dropbox";
  if (lower.includes("canva.com")) return "Canva";
  if (lower.includes("instagram.com")) return "Instagram";
  if (lower.includes("tiktok.com")) return "TikTok";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("facebook.com")) return "Facebook";
  if (lower.includes("x.com") || lower.includes("twitter.com")) return "Twitter / X";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (lower.includes("pinterest.com")) return "Pinterest";
  return defaultType === "Aset" ? "Aset Desain" : defaultType === "Sosmed" ? "Post Sosmed" : "Tautan";
};

export function ContentModal({modal, workspace, userProfile, planDetails, onSave,onClose,onArchive,onRestore,onDelete,onDuplicate,pillars,platforms,contentTypes,pics,statuses,onSettingUpdate}: any) {
  const { lang } = useI18n();
  const [d,setD] = useState({
    workspaceId: modal.data.workspaceId || workspace?.id || "",
    ...modal.data,
    metrics:{...(modal.data.metrics||{})},
    adsMetrics:{...(modal.data.adsMetrics||{views:0,reach:0,likes:0,comments:0,reposts:0,shares:0,saves:0,profileVisits:0,bioLinkTaps:0,follows:0,clicks:0,conversions:0,msgConvStarted:0,threeSecPlays:0,spendBudget:0,dailyBudget:0,duration:0,cprProfileVisit:0,audience:""})},
    referenceLinks:modal.data.referenceLinks||[],
    assetLinks: getAssetLinks(modal.data),
    sosmedLinks: getSosmedLinks(modal.data),
    customFields:modal.data.customFields||[]
  });
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    const targetWorkspaceId = d.workspaceId || workspace?.id;
    if (!targetWorkspaceId || !d.id || isRefreshing || modal.mode === "add") return;
    setIsRefreshing(true);
    try {
      const docRef = doc(db, "workspaces", targetWorkspaceId, "content", d.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const freshData = docSnap.data();
        setD((prev: any) => ({
          ...prev,
          ...freshData,
          metrics: { ...(freshData.metrics || {}) },
          adsMetrics: { ...(freshData.adsMetrics || prev.adsMetrics) },
          referenceLinks: freshData.referenceLinks || [],
          assetLinks: getAssetLinks(freshData),
          sosmedLinks: getSosmedLinks(freshData),
          customFields: freshData.customFields || []
        }));
      }
    } catch (e) {
      console.error("Failed to refresh:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const [editorProfiles, setEditorProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!d.history || d.history.length === 0) return;
    const fetchProfiles = async () => {
      let changed = false;
      const fetched: Record<string, any> = {};
      
      for (const h of d.history) {
        if (h.editorId) {
          // Check if we already have it in the state by fetching current state using functional update later
          // To avoid stale closures, we'll fetch blindly if we don't know, but we only update what we fetch
          try {
            const docSnap = await getDoc(doc(db, "users", h.editorId));
            if (docSnap.exists()) {
              fetched[h.editorId] = docSnap.data();
              changed = true;
            } else {
              fetched[h.editorId] = { fullName: h.editorName, nickname: h.editorName, avatar: h.editorAvatar };
              changed = true;
            }
          } catch (e) {
            console.error("Failed to fetch user profile", e);
          }
        }
      }
      if (changed) {
        setEditorProfiles(prev => {
          const next = { ...prev };
          let reallyChanged = false;
          for (const key in fetched) {
            if (!next[key]) {
              next[key] = fetched[key];
              reallyChanged = true;
            }
          }
          return reallyChanged ? next : prev;
        });
      }
    };
    
    // Only fetch for IDs we don't already have in editorProfiles
    const missingIds = d.history.map((h:any) => h.editorId).filter((id:any) => id && !editorProfiles[id]);
    if (missingIds.length > 0) {
      fetchProfiles();
    }
  }, [d.history, editorProfiles]);

  const [showWarning, setShowWarning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hourError, setHourError] = useState(false);
  const [minuteError, setMinuteError] = useState(false);
  const [productionHourError, setProductionHourError] = useState(false);
  const [productionMinuteError, setProductionMinuteError] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(modal.mode !== "add");
  const [editingFieldLeft, setEditingFieldLeft] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState<string | null>(null);
  const [editingFieldRight, setEditingFieldRight] = useState<string | null>(null);
  const activeFieldRef = useRef<any>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update browser tab title dynamically with the brief's title and restore on close
  useEffect(() => {
    const originalTitle = document.title;
    if (d.title) {
      document.title = `${d.title} - Hubify Social`;
    } else {
      document.title = "Brief Konten - Hubify Social";
    }
    return () => {
      document.title = originalTitle;
    };
  }, [d.title]);

  // Inline comment states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showResolvedInSection, setShowResolvedInSection] = useState<Record<string, boolean>>({});

  // Fetch editor's comments on mount
  useEffect(() => {
    if (!d.id || !d.workspaceId) return;
    const docRef = doc(db, "workspaces", d.workspaceId, "content", d.id);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.comments) {
          setD((prev: any) => {
            if (JSON.stringify(prev.comments) !== JSON.stringify(data.comments)) {
              return { ...prev, comments: data.comments };
            }
            return prev;
          });
        }
      }
    }).catch((err) => {
      console.error("Error fetching comments:", err);
    });
  }, [d.id, d.workspaceId]);

  const handleAddSectionComment = async (sectionId: string, commentText: string) => {
    if (!commentText.trim() || !d.id || !d.workspaceId) return;

    try {
      const authorName = auth.currentUser?.displayName || "Kreator";
      const updatedComments = [
        ...(d.comments || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          name: authorName,
          content: commentText.trim(),
          createdAt: new Date().toISOString(),
          sectionId,
          resolved: false
        }
      ];

      set("comments", updatedComments);
      const docRef = doc(db, "workspaces", d.workspaceId, "content", d.id);
      await updateDoc(docRef, { comments: updatedComments });
    } catch (err: any) {
      console.error("Failed to add section comment in editor:", err);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    if (!d.id || !d.workspaceId) return;
    try {
      const updatedComments = (d.comments || []).map((c: any) => 
        c.id === commentId ? { ...c, resolved: true } : c
      );

      set("comments", updatedComments);
      const docRef = doc(db, "workspaces", d.workspaceId, "content", d.id);
      await updateDoc(docRef, { comments: updatedComments });
    } catch (err: any) {
      console.error("Failed to resolve comment in editor:", err);
    }
  };

  const handleReopenComment = async (commentId: string) => {
    if (!d.id || !d.workspaceId) return;
    try {
      const updatedComments = (d.comments || []).map((c: any) => 
        c.id === commentId ? { ...c, resolved: false } : c
      );

      set("comments", updatedComments);
      const docRef = doc(db, "workspaces", d.workspaceId, "content", d.id);
      await updateDoc(docRef, { comments: updatedComments });
    } catch (err: any) {
      console.error("Failed to reopen comment in editor:", err);
    }
  };

  const [newCommentInputs, setNewCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const handleAddComment = async (sectionKey: string) => {
    const text = newCommentInputs[sectionKey]?.trim();
    if (!text) return;
    setSubmittingComment(prev => ({ ...prev, [sectionKey]: true }));
    try {
      const newC = {
        id: Math.random().toString(36).substring(2, 9),
        sectionId: sectionKey,
        name: userProfile?.fullName || userProfile?.nickname || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "User",
        content: text,
        createdAt: new Date().toISOString(),
        userId: auth.currentUser?.uid || null,
        resolved: false
      };
      const updatedComments = [...(d.comments || []), newC];
      set("comments", updatedComments);
      const docRef = doc(db, "workspaces", d.workspaceId || workspace?.id, "content", d.id);
      await updateDoc(docRef, { comments: updatedComments });
      setNewCommentInputs(prev => ({ ...prev, [sectionKey]: "" }));
    } catch (e) {
      console.error(e);
      showToast("Gagal mengirim komentar", "error");
    } finally {
      setSubmittingComment(prev => ({ ...prev, [sectionKey]: false }));
    }
  };

  const renderSectionCommentBadge = (sectionKey: string) => {
    if (!isCommentsEnabled) return null;
    const commentsList = d.comments || [];
    const count = commentsList.filter((c: any) => c.sectionId === sectionKey && !c.resolved).length;
    const isOpen = !!openSections[sectionKey];

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
        }}
        style={{
          background: count > 0 ? "#FFFBEB" : isOpen ? "#EFF6FF" : "rgba(0,0,0,0.03)",
          border: count > 0 ? "1px solid rgba(217, 119, 6, 0.3)" : isOpen ? "1px solid rgba(37, 99, 235, 0.2)" : "none",
          color: count > 0 ? "#D97706" : isOpen ? "#2563EB" : "#4B5563",
          width: "26px",
          height: "26px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative"
        }}
        title={lang === "id" ? "Komentar" : "Comment"}
      >
        <MessageSquare size={12} />
        {count > 0 && (
          <span style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            background: "#D97706",
            color: "#FFFFFF",
            fontSize: "8px",
            fontWeight: 800,
            borderRadius: "50%",
            width: "14px",
            height: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid #FFFFFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            {count}
          </span>
        )}
      </button>
    );
  };

  const renderInlineCommentThread = (sectionKey: string) => {
    if (!isCommentsEnabled) return null;
    const commentsList = d.comments || [];
    const sectionComments = commentsList.filter((c: any) => c.sectionId === sectionKey);
    const isOpen = !!openSections[sectionKey];
    if (sectionComments.length === 0 && !isOpen) return null;
    const unresolvedComments = sectionComments.filter((c: any) => !c.resolved);
    const resolvedComments = sectionComments.filter((c: any) => c.resolved);
    const showResolved = !!showResolvedInSection[sectionKey];

    return (
      <div style={{ marginTop: "14px", borderTop: "1px dashed rgba(0,0,0,0.06)", paddingTop: "12px" }}>
        {/* Toggle bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}>
            <MessageSquare size={12} style={{ color: "#2563EB" }} />
            Komentar Bagian Ini ({unresolvedComments.length})
          </span>
          <button
            type="button"
            onClick={() => setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}
            style={{
              background: "none",
              border: "none",
              fontSize: "10px",
              fontWeight: 800,
              color: "#2563EB",
              cursor: "pointer",
              textTransform: "uppercase"
            }}
          >
            {isOpen ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {unresolvedComments.length === 0 && resolvedComments.length === 0 ? (
                  <p style={{ fontSize: "11px", color: "#9CA3AF", fontStyle: "italic", textAlign: "center", padding: "12px", background: "rgba(0,0,0,0.01)", borderRadius: "12px", border: "1px dashed rgba(0,0,0,0.05)" }}>
                    Belum ada komentar di bagian ini.
                  </p>
                ) : (
                  unresolvedComments.map((comment: any) => (
                    <div key={comment.id} style={{ position: "relative", padding: "10px 12px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#111827" }}>{comment.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "9px", color: "#9CA3AF", fontWeight: 700 }}>
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                          {canComment && (
                            <button
                              type="button"
                              onClick={() => handleResolveComment(comment.id)}
                              style={{
                                background: "rgba(16, 185, 129, 0.1)",
                                border: "none",
                                color: "#10B981",
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                              title="Selesaikan Komentar (Resolve)"
                            >
                              <Check size={10} style={{ strokeWidth: 3 }} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: "11px", color: "#4B5563", margin: 0, lineHeight: 1.4, whiteSpace: "pre-wrap" }}>{comment.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Resolved comments collapsible list */}
              {resolvedComments.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowResolvedInSection(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "9px",
                      fontWeight: 800,
                      color: "#9CA3AF",
                      cursor: "pointer",
                      textTransform: "uppercase"
                    }}
                  >
                    {showResolved ? "Sembunyikan" : "Tampilkan"} {resolvedComments.length} komentar diselesaikan
                  </button>

                  {showResolved && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px", paddingLeft: "8px", borderLeft: "2px solid rgba(0,0,0,0.04)" }}>
                      {resolvedComments.map((comment: any) => (
                        <div key={comment.id} style={{ opacity: 0.6, padding: "8px 10px", borderRadius: "10px", background: "rgba(0,0,0,0.01)", border: "1px solid rgba(0,0,0,0.01)", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", fontWeight: 800, color: "#9CA3AF", textDecoration: "line-through" }}>{comment.name}</span>
                            {canComment && (
                              <button
                                type="button"
                                onClick={() => handleReopenComment(comment.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  fontSize: "9px",
                                  fontWeight: 800,
                                  color: "#2563EB",
                                  cursor: "pointer"
                                }}
                              >
                                Buka Kembali
                              </button>
                            )}
                          </div>
                          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, textDecoration: "line-through", whiteSpace: "pre-wrap" }}>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reply field */}
              {canComment ? (
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  <textarea
                    rows={1}
                    required
                    placeholder="Ketik balasan Anda (Enter untuk kirim)..."
                    id={`reply-${sectionKey}`}
                    style={{
                      flex: 1,
                      background: "rgba(0,0,0,0.03)",
                      border: "none",
                      outline: "none",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      fontSize: "11px",
                      fontWeight: 500,
                      resize: "none"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const val = (e.target as HTMLTextAreaElement).value;
                        if (val.trim()) {
                          handleAddSectionComment(sectionKey, val);
                          (e.target as HTMLTextAreaElement).value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const txtEl = document.getElementById(`reply-${sectionKey}`) as HTMLTextAreaElement;
                      if (txtEl && txtEl.value.trim()) {
                        handleAddSectionComment(sectionKey, txtEl.value);
                        txtEl.value = "";
                      }
                    }}
                    style={{
                      background: "#2563EB",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0 12px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Kirim
                  </button>
                </div>
              ) : (
                <div style={{ padding: "8px", background: "#F3F4F6", borderRadius: "8px", marginTop: "4px", textAlign: "center", fontSize: "10px", color: "#6B7280", fontWeight: 600 }}>
                  Anda tidak memiliki akses untuk memberikan komentar.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 220);
    return () => clearTimeout(timer);
  }, []);

  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const shareDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeFieldRef.current && !activeFieldRef.current.contains(event.target as Node)) {
        setEditingFieldLeft(null);
        setEditingFieldRight(null);
        setCalendarOpen(null);
      }
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShareClick = () => {
    setShowShareDropdown(!showShareDropdown);
  };

  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedSharedLink, setCopiedSharedLink] = useState(false);
  const [shareTab, setShareTab] = useState<"public" | "users">("public");
  const [shareSearch, setShareSearch] = useState("");
  const [shareSearchLoading, setShareSearchLoading] = useState(false);
  const [shareSearchError, setShareSearchError] = useState("");
  const [shareSearchSuccess, setShareSearchSuccess] = useState<any>(null);
  const [selectedRoleForNewUser, setSelectedRoleForNewUser] = useState<"viewer" | "commenter" | "editor">("viewer");

  // Determine current logged-in user's role on this document
  const currentUser = auth.currentUser || userProfile;

  const getUserContentRole = () => {
    if (!d) return "none";
    const uid = currentUser?.uid;
    const email = currentUser?.email?.toLowerCase();
    const username = userProfile?.username?.toLowerCase() || currentUser?.email?.split("@")[0]?.toLowerCase();

    const targetWsId = d.workspaceId || modal.data?.workspaceId;

    // 1. Workspace owner/admin/editor of THIS content's workspace OR Document Creator/Owner
    const isWsOwnerOrAdmin = workspace && targetWsId && (workspace.id === targetWsId) && uid && (
      workspace.ownerId === uid || 
      workspace.createdBy === uid || 
      (Array.isArray(workspace.members) && workspace.members.some((m: any) => m.uid === uid && (m.role === "owner" || m.role === "admin" || m.role === "editor")))
    );
    const isDocOwner = uid && (
      d.userId === uid || 
      d.createdBy === uid || 
      d.ownerId === uid
    );

    if (isWsOwnerOrAdmin || isDocOwner) {
      return "owner";
    }

    // 2. Shared user in sharedUsers array
    const sharedUsers = d.sharedUsers || [];
    if (uid || email || username) {
      const matched = sharedUsers.find((u: any) => 
        (uid && u.uid === uid) ||
        (email && u.email && u.email.toLowerCase() === email) ||
        (username && u.username && u.username.toLowerCase() === username)
      );
      if (matched) {
        return matched.role || "viewer";
      }
    }

    // 3. Public link access
    if (d.isPublic) {
      return d.linkAccessRole || d.publicRole || "viewer";
    }

    return "none";
  };

  const userRole = getUserContentRole();
  const canManageShare = userRole === "owner";
  const canEdit = userRole === "owner" || userRole === "editor";
  const canComment = userRole === "owner" || userRole === "editor" || userRole === "commenter";
  const isCommentsEnabled = !!(d.isPublic || (d.sharedUsers && d.sharedUsers.length > 0) || userRole !== "owner");
  const [layoutMode, setLayoutMode] = useState<"center" | "drawer">(() => {
    return (localStorage.getItem("contentModalLayout") as "center" | "drawer") || "center";
  });
  const [activeTab, setActiveTab] = useState<"draft" | "refs" | "metrics">("draft");
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [showLayoutConfig, setShowLayoutConfig] = useState(false);
  const [layoutScope, setLayoutScope] = useState<"local" | "global">("local");
  const [localToast, setLocalToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setLocalToast({ message, type });
    setTimeout(() => {
      setLocalToast(prev => prev?.message === message ? null : prev);
    }, 3500);
  };
  const [layoutFields, setLayoutFields] = useState<any[]>(() => {
    if (modal.data && modal.data.layoutSettings && Array.isArray(modal.data.layoutSettings.fields)) {
      const savedFields = modal.data.layoutSettings.fields;
      const merged = [...savedFields];
      DEFAULT_FIELDS.forEach(def => {
        if (!merged.some(f => f.id === def.id)) {
          merged.push(def);
        }
      });
      return merged;
    }
    if (workspace && workspace.layoutSettings && Array.isArray(workspace.layoutSettings.fields)) {
      const savedFields = workspace.layoutSettings.fields;
      const merged = [...savedFields];
      DEFAULT_FIELDS.forEach(def => {
        if (!merged.some(f => f.id === def.id)) {
          merged.push(def);
        }
      });
      return merged;
    }
    return DEFAULT_FIELDS;
  });
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
    if ((!d.isHubAiDraft || d.manuallySaved) && isDirty.current) {
        debounceRef.current = setTimeout(async () => {
          const currentD = dRef.current;
          if (!currentD.title || !String(currentD.title).trim()) return;
          setIsSaving(true);
          try {
            isDirty.current = false;
            const savedData = await onSave(currentD, false);
            if (savedData && savedData.history) {
              setD(prev => ({...prev, history: savedData.history}));
            }
          } catch (e) {
            console.error("Autosave failed", e);
            isDirty.current = true;
          }
          setIsSaving(false);
        }, 2000);
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

  const handleShareSearch = async () => {
    const qStr = shareSearch.trim().toLowerCase();
    if (!qStr) return;
    setShareSearchLoading(true);
    setShareSearchError("");
    setShareSearchSuccess(null);

    try {
      const uRef = collection(db, "users");
      let snap;

      if (qStr.includes("@") && !qStr.startsWith("@")) {
        // Search by email
        const q = query(uRef, where("email", "==", qStr), limit(1));
        snap = await getDocs(q);
      } else {
        // Search by username
        const cleanUsername = qStr.replace("@", "");
        const q = query(uRef, where("username", "==", cleanUsername), limit(1));
        snap = await getDocs(q);
      }

      if (snap && !snap.empty) {
        const found = { ...snap.docs[0].data(), uid: snap.docs[0].id } as any;
        setShareSearchSuccess(found);
      } else {
        setShareSearchError("Pengguna tidak ditemukan. Pastikan username atau email benar.");
      }
    } catch (err: any) {
      console.error("Error searching shared user:", err);
      setShareSearchError("Gagal mencari pengguna: " + err.message);
    } finally {
      setShareSearchLoading(false);
    }
  };

  const handleAddSharedUser = async (userToShare: any) => {
    if (!canManageShare) return;
    isDirty.current = true;
    const currentShared = d.sharedUsers || [];
    
    // Check if already shared
    if (currentShared.some((u: any) => u.uid === userToShare.uid)) {
      setShareSearchError("Pengguna ini sudah memiliki akses.");
      return;
    }

    const newUser = {
      uid: userToShare.uid,
      email: userToShare.email,
      username: userToShare.username || "",
      fullName: userToShare.fullName || userToShare.nickname || "",
      role: selectedRoleForNewUser || "viewer"
    };

    const nextShared = [...currentShared, newUser];
    const nextSharedUids = nextShared.map((u: any) => u.uid).filter(Boolean);
    const nextSharedEmails = nextShared.map((u: any) => u.email?.toLowerCase()).filter(Boolean);
    const nextEditorUids = nextShared.filter((u: any) => u.role === "editor").map((u: any) => u.uid).filter(Boolean);
    const nextCommenterUids = nextShared.filter((u: any) => u.role === "commenter" || u.role === "editor").map((u: any) => u.uid).filter(Boolean);

    const next = { 
      ...dRef.current, 
      sharedUsers: nextShared,
      sharedUids: nextSharedUids,
      sharedEmails: nextSharedEmails,
      editorUids: nextEditorUids,
      commenterUids: nextCommenterUids,
      ownerEmail: auth.currentUser?.email || "",
      ownerName: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || ""
    };
    dRef.current = next;
    setD(next);
    setShareSearch("");
    setShareSearchSuccess(null);

    // Save immediately to Firestore
    if (onSave) {
      await onSave(next, false);
    }

    // Send real-time notification to target user
    try {
      const senderName = auth.currentUser?.displayName || userProfile?.fullName || auth.currentUser?.email?.split('@')[0] || "Seseorang";
      const roleLabel = newUser.role === 'editor' ? 'Editor' : newUser.role === 'commenter' ? 'Komentator' : 'Pelihat';
      const contentTitle = next.title || next.topic || "Draft Brief";
      await addDoc(collection(db, "notifications"), {
        userId: userToShare.uid,
        type: "content_share",
        title: "Akses Konten Dibagikan",
        body: `${senderName} membagikan konten "${contentTitle}" kepada Anda dengan akses ${roleLabel}.`,
        link: "/dashboard",
        workspaceId: workspace?.id || next.workspaceId || "",
        contentId: next.id || "",
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Gagal membuat notifikasi sharing:", err);
    }

    showToast(`Berhasil memberikan akses ${newUser.role === 'editor' ? 'Editor' : newUser.role === 'commenter' ? 'Komentator' : 'Pelihat'} ke ${newUser.fullName || newUser.email}`, "success");
  };

  const handleUpdateSharedUserRole = async (uid: string, newRole: "viewer" | "commenter" | "editor") => {
    if (!canManageShare) return;
    isDirty.current = true;
    const currentShared = d.sharedUsers || [];
    const targetUser = currentShared.find((u: any) => u.uid === uid);
    const nextShared = currentShared.map((u: any) => 
      u.uid === uid ? { ...u, role: newRole } : u
    );
    const nextSharedUids = nextShared.map((u: any) => u.uid).filter(Boolean);
    const nextSharedEmails = nextShared.map((u: any) => u.email?.toLowerCase()).filter(Boolean);
    const nextEditorUids = nextShared.filter((u: any) => u.role === "editor").map((u: any) => u.uid).filter(Boolean);
    const nextCommenterUids = nextShared.filter((u: any) => u.role === "commenter" || u.role === "editor").map((u: any) => u.uid).filter(Boolean);

    const next = { 
      ...dRef.current, 
      sharedUsers: nextShared,
      sharedUids: nextSharedUids,
      sharedEmails: nextSharedEmails,
      editorUids: nextEditorUids,
      commenterUids: nextCommenterUids
    };
    dRef.current = next;
    setD(next);

    // Save immediately to Firestore
    if (onSave) {
      await onSave(next, false);
    }

    if (targetUser) {
      try {
        const senderName = auth.currentUser?.displayName || userProfile?.fullName || auth.currentUser?.email?.split('@')[0] || "Seseorang";
        const roleLabel = newRole === 'editor' ? 'Editor' : newRole === 'commenter' ? 'Komentator' : 'Pelihat';
        const contentTitle = next.title || next.topic || "Draft Brief";
        await addDoc(collection(db, "notifications"), {
          userId: uid,
          type: "content_share",
          title: "Peran Akses Diperbarui",
          body: `${senderName} memperbarui peran akses Anda pada "${contentTitle}" menjadi ${roleLabel}.`,
          link: "/dashboard",
          workspaceId: workspace?.id || next.workspaceId || "",
          contentId: next.id || "",
          read: false,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Gagal mengirim notifikasi update role:", err);
      }
    }

    showToast("Peran akses pengguna diperbarui", "info");
  };

  const handleRemoveSharedUser = async (uid: string) => {
    if (!canManageShare) return;
    isDirty.current = true;
    const currentShared = d.sharedUsers || [];
    const targetUser = currentShared.find((u: any) => u.uid === uid);
    const nextShared = currentShared.filter((u: any) => u.uid !== uid);
    const nextSharedUids = nextShared.map((u: any) => u.uid).filter(Boolean);
    const nextSharedEmails = nextShared.map((u: any) => u.email?.toLowerCase()).filter(Boolean);
    const nextEditorUids = nextShared.filter((u: any) => u.role === "editor").map((u: any) => u.uid).filter(Boolean);
    const nextCommenterUids = nextShared.filter((u: any) => u.role === "commenter" || u.role === "editor").map((u: any) => u.uid).filter(Boolean);

    const next = { 
      ...dRef.current, 
      sharedUsers: nextShared,
      sharedUids: nextSharedUids,
      sharedEmails: nextSharedEmails,
      editorUids: nextEditorUids,
      commenterUids: nextCommenterUids
    };
    dRef.current = next;
    setD(next);

    // Save immediately to Firestore
    if (onSave) {
      await onSave(next, false);
    }

    if (targetUser) {
      try {
        const senderName = auth.currentUser?.displayName || userProfile?.fullName || auth.currentUser?.email?.split('@')[0] || "Seseorang";
        const contentTitle = next.title || next.topic || "Draft Brief";
        await addDoc(collection(db, "notifications"), {
          userId: uid,
          type: "content_share",
          title: "Akses Konten Dicabut",
          body: `${senderName} telah mencabut akses Anda pada "${contentTitle}".`,
          link: "/dashboard",
          workspaceId: workspace?.id || next.workspaceId || "",
          contentId: next.id || "",
          read: false,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Gagal mengirim notifikasi pencabutan:", err);
      }
    }

    showToast("Akses pengguna telah dicabut", "info");
  };

  const handleUpdateLinkAccessRole = async (newRole: "viewer" | "commenter" | "editor") => {
    if (!canManageShare) return;
    isDirty.current = true;
    const next = {
      ...dRef.current,
      linkAccessRole: newRole,
      publicRole: newRole
    };
    dRef.current = next;
    setD(next);
    if (onSave) {
      await onSave(next, false);
    }
    showToast(`Akses link publik diubah menjadi ${newRole === 'editor' ? 'Editor' : newRole === 'commenter' ? 'Komentator' : 'Pelihat'}`, "info");
  };

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
      });
    }
  }, [d.title, modal.open, isReaderMode]);

  const set = (k:string,v:any) => {
    if (!canEdit && k !== "comments") {
      showToast("Akses Anda sebagai " + (userRole === "commenter" ? "Komentator" : "Pelihat") + " bersifat Read-Only", "error");
      return;
    }
    isDirty.current = true;
    let next = { ...dRef.current, [k]: v };
    if (k === "assetLinks" && Array.isArray(v)) {
      next.linkAsset = v.filter((s: string) => typeof s === "string" && s.trim() !== "").join("\n");
    }
    if (k === "sosmedLinks" && Array.isArray(v)) {
      next.linkSosmed = v.filter((s: string) => typeof s === "string" && s.trim() !== "").join("\n");
    }
    if (k === "linkAsset" && typeof v === "string") {
      next.assetLinks = v.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    }
    if (k === "linkSosmed" && typeof v === "string") {
      next.sosmedLinks = v.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    }
    dRef.current = next;
    setD(next);
  };
  const setM = (k:string,v:any, isAds=false) => {
    if (!canEdit) {
      showToast("Akses Anda sebagai " + (userRole === "commenter" ? "Komentator" : "Pelihat") + " bersifat Read-Only", "error");
      return;
    }
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
        showToast("Harap isi caption atau brief terlebih dahulu untuk dianalisis AI.", "error");
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
        
        const data = await callAiWithQuota(auth.currentUser?.uid || 'anon', userProfile?.plan, { prompt, model: "gemini-3.5-flash" }, planDetails?.maxAiGenerations || 50);
        setAiResult(data.text || lang === "id" ? "Tidak ada respon dari AI." : "No response from AI.");
    } catch (e: any) {
        console.error("AI Error:", e);
        const errMsg = e.message || "";
        if (errMsg.includes("habis")) {
          setAiResult(errMsg);
        } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
          setAiResult(lang === "id" ? "Gagal menganalisis konten: Terlalu banyak permintaan saat ini (Quota Exceeded). Silakan tunggu sekitar 30 detik lalu coba lagi, atau update akun Google AI Studio Anda ke Pay-as-you-go." : "Failed to analyze content: Too many requests at this time (Quota Exceeded). Please wait about 30 seconds and try again, or upgrade your Google AI Studio account to Pay-as-you-go.");
        } else {
          setAiResult("Gagal menganalisis konten: " + errMsg + ".\n\nPastikan VITE_GEMINI_API_KEY sudah diset di Settings > Secrets.");
        }
    }
    setAiLoading(false);
  };

  const getInitialLayoutFields = () => {
    if (modal.data && modal.data.layoutSettings && Array.isArray(modal.data.layoutSettings.fields)) {
      const savedFields = modal.data.layoutSettings.fields;
      const merged = [...savedFields];
      DEFAULT_FIELDS.forEach(def => {
        if (!merged.some(f => f.id === def.id)) {
          merged.push(def);
        }
      });
      return merged;
    }
    if (workspace && workspace.layoutSettings && Array.isArray(workspace.layoutSettings.fields)) {
      const savedFields = workspace.layoutSettings.fields;
      const merged = [...savedFields];
      DEFAULT_FIELDS.forEach(def => {
        if (!merged.some(f => f.id === def.id)) {
          merged.push(def);
        }
      });
      return merged;
    }
    return DEFAULT_FIELDS;
  };

  const saveLayoutSettings = async (fields: any[], scope: "local" | "global") => {
    try {
      if (scope === "local") {
        const updatedD = {
          ...dRef.current,
          layoutSettings: { fields }
        };
        dRef.current = updatedD;
        setD(updatedD);
        const savedData = await onSave(updatedD, false);
        if (savedData && savedData.history) {
           setD(prev => ({...prev, history: savedData.history}));
        }
      } else {
        if (workspace && workspace.id) {
          const workspaceRef = doc(db, "workspaces", workspace.id);
          await updateDoc(workspaceRef, {
            layoutSettings: { fields }
          });
          const updatedD = {
            ...dRef.current
          };
          delete updatedD.layoutSettings;
          dRef.current = updatedD;
          setD(updatedD);
          const savedData = await onSave(updatedD, false);
          if (savedData && savedData.history) {
             setD(prev => ({...prev, history: savedData.history}));
          }
        }
      }
      setLayoutFields(fields);
      setShowLayoutConfig(false);
      showToast("Pengaturan tata letak berhasil disimpan!", "success");
    } catch (error) {
      console.error("Error saving layout settings:", error);
      showToast("Gagal menyimpan pengaturan tata letak.", "error");
    }
  };

  const renderLayoutConfigPanel = () => {
    const getFieldDescription = (id: string, lang: string) => {
      const descriptions: any = {
        objective: lang === "id" ? "Tujuan utama dan target output spesifik dari konten ini" : "Main goal and specific output target of this content",
        hook: lang === "id" ? "Skenario pembuka pemancing atensi audiens dalam 3 detik pertama" : "Attention-grabbing opening scenario in the first 3 seconds",
        briefCopywriting: lang === "id" ? "Detail konsep, tone of voice, & poin-poin panduan utama" : "Concept details, tone of voice, & main guidelines",
        cta: lang === "id" ? "Ajakan aksi spesifik bagi audiens (Call to Action)" : "Specific call to action for the audience",
        caption: lang === "id" ? "Teks social media lengkap siap salin & posting" : "Ready-to-post social media caption copy",
        targetAudience: lang === "id" ? "Persona demografi atau audiens spesifik yang disasar" : "Specific target demographic or user persona",
        keyAngle: lang === "id" ? "Sudut pandang unik penentu pesan utama konten" : "Unique angle that defines the core message of the content",
        visualConcept: lang === "id" ? "Estetika visual, transisi, dan referensi moodboard" : "Visual aesthetics, transitions, and moodboard references",
        audioBgm: lang === "id" ? "Rekomendasi BGM, musik tren, & efek suara latar" : "BGM guidelines, trending music, & background sound effects",
        outro: lang === "id" ? "Penutup video, pancingan interaksi, atau visual penutup" : "Closing video scene, interaction hook, or visual outro",
        hashtags: lang === "id" ? "Rekomendasi tagar relevan untuk optimalisasi algoritma" : "Relevant tags recommendation for algorithm optimization"
      };
      return descriptions[id] || "";
    };

    const applyPreset = (presetType: "sederhana" | "standar" | "lengkap") => {
      const updated = layoutFields.map(f => {
        if (presetType === "sederhana") {
          return { ...f, visible: ["objective", "caption"].includes(f.id) };
        } else if (presetType === "standar") {
          return { ...f, visible: ["objective", "hook", "briefCopywriting", "cta", "caption"].includes(f.id) };
        } else {
          return { ...f, visible: true };
        }
      });
      setLayoutFields(updated);
      showToast(`Preset ${presetType === "sederhana" ? "Sederhana" : presetType === "standar" ? "Standar" : "Lengkap"} diaktifkan!`, "info");
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: -12 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -12 }}
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 16,
          padding: "32px",
          marginBottom: 28,
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: "rgba(37, 99, 235, 0.06)", padding: 10, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44 }}>
              <Layout size={22} style={{ color: "#2563EB" }} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em", fontFamily: "Plus Jakarta Sans, sans-serif" }}>Desainer Tata Letak Brief</h4>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280", fontWeight: 500, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: "1.4" }}>Tentukan visibilitas kolom dan urutkan susunan formulir brief kerja Anda secara real-time.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLayoutConfig(false)}
            style={{ background: "rgba(0,0,0,0.03)", border: "none", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", transition: "all 0.2s" }}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.06)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: 12 }}>
            {lang === "id" ? "Preset Tata Letak Cepat" : "Quick Layout Presets"}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => applyPreset("sederhana")}
              style={{ 
                flex: 1, 
                padding: "12px 16px", 
                background: "#FFFFFF", 
                border: "1px solid rgba(0,0,0,0.06)", 
                borderRadius: 12, 
                fontSize: 12, 
                fontWeight: 700, 
                color: "#111827", 
                cursor: "pointer", 
                boxShadow: "0 1px 3px rgba(0,0,0,0.01)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: 8, 
                transition: "all 0.2s", 
                fontFamily: "Plus Jakarta Sans, sans-serif" 
              }}
              onMouseOver={(e: any) => {
                e.currentTarget.style.background = "rgba(37, 99, 235, 0.02)";
                e.currentTarget.style.border = "1px solid rgba(37, 99, 235, 0.15)";
                e.currentTarget.style.color = "#2563EB";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e: any) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.border = "1px solid rgba(0,0,0,0.06)";
                e.currentTarget.style.color = "#111827";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Leaf size={14} style={{ color: "#10B981" }} />
              Sederhana
            </button>
            <button
              onClick={() => applyPreset("standar")}
              style={{ 
                flex: 1, 
                padding: "12px 16px", 
                background: "#FFFFFF", 
                border: "1px solid rgba(0,0,0,0.06)", 
                borderRadius: 12, 
                fontSize: 12, 
                fontWeight: 700, 
                color: "#111827", 
                cursor: "pointer", 
                boxShadow: "0 1px 3px rgba(0,0,0,0.01)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: 8, 
                transition: "all 0.2s", 
                fontFamily: "Plus Jakarta Sans, sans-serif" 
              }}
              onMouseOver={(e: any) => {
                e.currentTarget.style.background = "rgba(37, 99, 235, 0.02)";
                e.currentTarget.style.border = "1px solid rgba(37, 99, 235, 0.15)";
                e.currentTarget.style.color = "#2563EB";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e: any) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.border = "1px solid rgba(0,0,0,0.06)";
                e.currentTarget.style.color = "#111827";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FileText size={14} style={{ color: "#3B82F6" }} />
              Standar
            </button>
            <button
              onClick={() => applyPreset("lengkap")}
              style={{ 
                flex: 1, 
                padding: "12px 16px", 
                background: "#FFFFFF", 
                border: "1px solid rgba(0,0,0,0.06)", 
                borderRadius: 12, 
                fontSize: 12, 
                fontWeight: 700, 
                color: "#111827", 
                cursor: "pointer", 
                boxShadow: "0 1px 3px rgba(0,0,0,0.01)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: 8, 
                transition: "all 0.2s", 
                fontFamily: "Plus Jakarta Sans, sans-serif" 
              }}
              onMouseOver={(e: any) => {
                e.currentTarget.style.background = "rgba(37, 99, 235, 0.02)";
                e.currentTarget.style.border = "1px solid rgba(37, 99, 235, 0.15)";
                e.currentTarget.style.color = "#2563EB";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e: any) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.border = "1px solid rgba(0,0,0,0.06)";
                e.currentTarget.style.color = "#111827";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Sparkles size={14} style={{ color: "#F59E0B" }} />
              Lengkap
            </button>
          </div>
        </div>

        {/* List of fields (Ultra-clean, Flat list, No nested cards) */}
        <div style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Plus Jakarta Sans, sans-serif", marginBottom: 12 }}>
          {lang === "id" ? "Kolom Kerja & Susunan" : "Columns & Arrangement"}
        </div>
        <motion.div 
          layout 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            marginBottom: 32,
            borderTop: "1px solid rgba(0,0,0,0.04)"
          }}
        >
          {layoutFields.map((field, idx) => {
            const isFieldVisible = field.visible !== false;
            return (
              <motion.div 
                layout
                key={field.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 8px",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                  background: "transparent",
                  transition: "background-color 0.2s ease"
                }}
                onMouseOver={(e: any) => {
                  e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.01)";
                }}
                onMouseOut={(e: any) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* Left side: Switch + Icon + Label and Description */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                  {/* Premium Miniature Switch */}
                  <button 
                    onClick={() => {
                      const updated = [...layoutFields];
                      updated[idx] = { ...field, visible: !isFieldVisible };
                      setLayoutFields(updated);
                    }}
                    style={{ 
                      background: "transparent", 
                      border: "none", 
                      cursor: "pointer", 
                      padding: 0,
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 18,
                      borderRadius: 100,
                      background: isFieldVisible ? "#2563EB" : "#E5E7EB",
                      position: "relative",
                      transition: "background-color 0.2s ease"
                    }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#ffffff",
                        position: "absolute",
                        top: 3,
                        left: isFieldVisible ? 21 : 3,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                      }} />
                    </div>
                  </button>

                  {/* Clean rounded icon wrapper */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    width: 32, 
                    height: 32, 
                    borderRadius: "50%", 
                    background: isFieldVisible ? "rgba(37, 99, 235, 0.05)" : "rgba(0,0,0,0.02)", 
                    color: isFieldVisible ? "#2563EB" : "#9CA3AF",
                    flexShrink: 0,
                    transition: "all 0.2s ease"
                  }}>
                    {getFieldIcon(field.icon, 15)}
                  </div>

                  {/* Label & Description column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ 
                        fontSize: 13, 
                        fontWeight: 700, 
                        color: isFieldVisible ? "#111827" : "#9CA3AF", 
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        transition: "color 0.2s ease"
                      }}>
                        {getFieldTranslation(field.id, "label", lang) || field.label}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 500, 
                      color: isFieldVisible ? "#6B7280" : "#9CA3AF", 
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      opacity: isFieldVisible ? 1 : 0.6,
                      transition: "all 0.2s ease"
                    }}>
                      {getFieldDescription(field.id, lang)}
                    </span>
                  </div>
                </div>

                {/* Right side: Reorder Button Group Capsule */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 1, border: "1px solid rgba(0,0,0,0.05)", borderRadius: 8, background: "#ffffff", padding: 2 }}>
                    {/* Move Up */}
                    <button
                      disabled={idx === 0}
                      onClick={() => {
                        if (idx === 0) return;
                        const updated = [...layoutFields];
                        const temp = updated[idx];
                        updated[idx] = updated[idx - 1];
                        updated[idx - 1] = temp;
                        setLayoutFields(updated);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        borderRadius: 6,
                        width: 26,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: idx === 0 ? "not-allowed" : "pointer",
                        color: idx === 0 ? "#E5E7EB" : "#4B5563",
                        transition: "all 0.15s"
                      }}
                      onMouseOver={(e: any) => { if (idx !== 0) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                      onMouseOut={(e: any) => { if (idx !== 0) e.currentTarget.style.background = "transparent"; }}
                    >
                      <ArrowUp size={13} />
                    </button>

                    <div style={{ width: 1, height: 12, background: "rgba(0,0,0,0.04)" }} />

                    {/* Move Down */}
                    <button
                      disabled={idx === layoutFields.length - 1}
                      onClick={() => {
                        if (idx === layoutFields.length - 1) return;
                        const updated = [...layoutFields];
                        const temp = updated[idx];
                        updated[idx] = updated[idx + 1];
                        updated[idx + 1] = temp;
                        setLayoutFields(updated);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        borderRadius: 6,
                        width: 26,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: idx === layoutFields.length - 1 ? "not-allowed" : "pointer",
                        color: idx === layoutFields.length - 1 ? "#E5E7EB" : "#4B5563",
                        transition: "all 0.15s"
                      }}
                      onMouseOver={(e: any) => { if (idx !== layoutFields.length - 1) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                      onMouseOut={(e: any) => { if (idx !== layoutFields.length - 1) e.currentTarget.style.background = "transparent"; }}
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Target scope chooser (Segmented tab control style) */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ fontSize: 10, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", display: "block", marginBottom: 10, letterSpacing: "0.08em", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Ruang Lingkup Penyimpanan
          </label>
          <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.025)", padding: 4, borderRadius: 12, maxWidth: 440 }}>
            <button
              onClick={() => setLayoutScope("local")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: layoutScope === "local" ? "#FFFFFF" : "transparent",
                color: layoutScope === "local" ? "#111827" : "#6B7280",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: layoutScope === "local" ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
                transition: "all 0.2s ease",
                fontFamily: "Plus Jakarta Sans, sans-serif"
              }}
            >
              <Bookmark size={13} style={{ color: layoutScope === "local" ? "#2563EB" : "#9CA3AF" }} />
              Hanya Brief Ini
            </button>
            <button
              onClick={() => setLayoutScope("global")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: layoutScope === "global" ? "#FFFFFF" : "transparent",
                color: layoutScope === "global" ? "#111827" : "#6B7280",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: layoutScope === "global" ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
                transition: "all 0.2s ease",
                fontFamily: "Plus Jakarta Sans, sans-serif"
              }}
            >
              <Globe size={13} style={{ color: layoutScope === "global" ? "#2563EB" : "#9CA3AF" }} />
              Semua Brief Workspace
            </button>
          </div>
        </div>

        {/* Save configuration button */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: 24 }}>
          <button
            onClick={() => {
              const reloaded = getInitialLayoutFields();
              setLayoutFields(reloaded);
              setShowLayoutConfig(false);
              showToast("Konfigurasi dibatalkan", "info");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "#4B5563",
              padding: "10px 20px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: 10,
              transition: "all 0.2s",
              fontFamily: "Plus Jakarta Sans, sans-serif"
            }}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.03)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "transparent"}
          >
            Batal
          </button>
          <button
            onClick={() => saveLayoutSettings(layoutFields, layoutScope)}
            style={{
              background: "#2563EB",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "10px 24px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              boxShadow: "0 4px 14px rgba(37,99,235,0.15)"
            }}
            onMouseOver={(e: any) => {
              e.currentTarget.style.background = "#1D4ED8";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e: any) => {
              e.currentTarget.style.background = "#2563EB";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Simpan Tata Letak
          </button>
        </div>
      </motion.div>
    );
  };

  const renderCommentsTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
        borderRadius: 16,
        padding: "16px 20px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageCircle size={16} style={{ color: "#2563EB" }} /> {lang === "id" ? "Komentar Diskusi" : "Discussion Comments"}
        </div>
        
        {/* List of general comments */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {(d.comments || []).filter((c: any) => !c.sectionId || c.sectionId === "general").length === 0 ? (
            <p style={{ fontSize: "11px", color: "#9CA3AF", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
              {lang === "id" ? "Belum ada komentar diskusi." : "No discussion comments yet."}
            </p>
          ) : (
            (d.comments || []).filter((c: any) => !c.sectionId || c.sectionId === "general").map((comment: any) => (
              <div key={comment.id} style={{ padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#111827" }}>{comment.name}</span>
                  <span style={{ fontSize: "9px", color: "#9CA3AF", fontWeight: 700 }}>
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#4B5563", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Add comment input */}
        {canComment ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px", borderTop: "1px solid rgba(0,0,0,0.04)", paddingTop: "12px" }}>
            <textarea
              rows={3}
              value={newCommentInputs["general"] || ""}
              onChange={(e) => setNewCommentInputs(prev => ({ ...prev, general: e.target.value }))}
              placeholder={lang === "id" ? "Tulis pesan masukan / komentar..." : "Write a message / comment..."}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.02)",
                border: "1px solid rgba(0,0,0,0.05)",
                outline: "none",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "12px",
                fontWeight: 500,
                resize: "none"
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                disabled={submittingComment["general"] || !newCommentInputs["general"]?.trim()}
                onClick={() => handleAddComment("general")}
                style={{
                  background: "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: submittingComment["general"] || !newCommentInputs["general"]?.trim() ? "not-allowed" : "pointer",
                  opacity: submittingComment["general"] || !newCommentInputs["general"]?.trim() ? 0.5 : 1
                }}
              >
                {submittingComment["general"] ? (lang === "id" ? "Mengirim..." : "Sending...") : (lang === "id" ? "Kirim Komentar" : "Send Comment")}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "16px", background: "#F3F4F6", borderRadius: "12px", marginTop: "8px", textAlign: "center", fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>
            {lang === "id" ? "Anda tidak memiliki akses untuk memberikan komentar." : "You do not have permission to comment."}
          </div>
        )}
      </div>
    </div>
  );

  const renderDynamicField = (field: any) => {
    const { id, label, icon, placeholder, minRows = 3 } = field;
    const translatedLabel = getFieldTranslation(id, "label", lang) || label;
    const translatedPlaceholder = getFieldTranslation(id, "placeholder", lang) || placeholder;
    const fieldValue = d[id] || "";
    const isEditing = editingFieldRight === id;

    const handleCopy = (e: any) => {
      e.stopPropagation();
      navigator.clipboard.writeText(htmlToPlainText(fieldValue));
      setCopiedFields(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [id]: false }));
      }, 2000);
    };

    const isCopied = copiedFields[id];

    const renderAiButton = () => {
      if (id === "briefCopywriting") {
        return (
          <button onClick={analyzeContent} disabled={aiLoading} 
            style={{...B(false), fontSize:10, padding:"4px 10px", borderRadius: 8, background:"#f3f4f6", color:"#1f2937", border:"1px solid #d1d5db", display:"flex", alignItems:"center", gap:4}}>
            <GeminiIcon size={12} />
            {aiLoading ? <LoadingDots /> : "Analyze with Gemini"}
          </button>
        );
      }
      if (id === "caption") {
        return (
          <button onClick={generateCaption} disabled={captionLoading} 
            style={{...B(false), fontSize:10, padding:"4px 10px", borderRadius: 8, background:"#f3f4f6", color:"#1f2937", border:"1px solid #d1d5db", display:"flex", alignItems:"center", gap:4}}>
            <GeminiIcon size={12} />
            {captionLoading ? <LoadingDots /> : "Generate Caption"}
          </button>
        );
      }
      return null;
    };

    if (isEditing) {
      return (
        <div key={id} ref={activeFieldRef} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", minWidth: 0, width: "100%", maxWidth: "100%", overflow: "visible", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
              {getFieldIcon(icon, 14)} {translatedLabel}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {renderAiButton()}
              {renderSectionCommentBadge(id)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", minHeight: id === "briefCopywriting" ? 120 : id === "caption" ? 150 : 80, minWidth: 0, width: "100%", maxWidth: "100%", overflow: "visible" }}>
            <RichTextEditor 
              inputRef={id === "briefCopywriting" ? briefRef : id === "caption" ? captionRef : id === "objective" ? objectiveRef : undefined} 
              value={fieldValue} 
              onChange={(val) => set(id, val)} 
              editable={canEdit}
              readOnly={!canEdit}
              minRows={id === "briefCopywriting" ? 6 : id === "caption" ? 8 : minRows} 
              placeholder={translatedPlaceholder} 
            />
          </div>
          {renderInlineCommentThread(id)}
        </div>
      );
    } else {
      return (
        <div 
          key={id}
          onClick={() => setEditingFieldRight(id)}
          style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "pointer", display: "flex", flexDirection: "column", minWidth: 0, width: "100%", maxWidth: "100%", overflow: "hidden" }}
          title={lang === "id" ? `Klik untuk mengedit ${translatedLabel}` : `Click to edit ${translatedLabel}`}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
              {getFieldIcon(icon, 14)} {translatedLabel}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
              {fieldValue && (
                <button 
                  onClick={handleCopy} 
                  onMouseOver={(e: any) => {
                    if (!isCopied) {
                      e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                    }
                  }}
                  onMouseOut={(e: any) => {
                    if (!isCopied) {
                      e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                    }
                  }}
                  style={{ 
                    background: isCopied ? "rgba(16,185,129,0.06)" : "rgba(0,0,0,0.03)", 
                    border: "none", 
                    color: isCopied ? "#059669" : "#4B5563", 
                    width: "26px",
                    height: "26px",
                    borderRadius: "6px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    cursor: isCopied ? "default" : "pointer", 
                    transition: "all 0.2s ease"
                  }}
                  title={isCopied ? (lang === "id" ? "Disalin" : "Copied") : (lang === "id" ? "Salin" : "Copy")}
                >
                  {isCopied ? <Check size={11} /> : <Copy size={11} />}
                </button>
              )}
              {renderSectionCommentBadge(id)}
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: id === "briefCopywriting" ? "#FCFAF7" : id === "caption" ? "#FAFDFB" : "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(44, 32, 22, 0.03)", wordBreak: "break-word", overflowWrap: "anywhere", overflow: "hidden", maxWidth: "100%" }}>
            {fieldValue ? <div className="tiptap-prose" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }} dangerouslySetInnerHTML={{ __html: fieldValue }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>{lang === "id" ? `Belum ada ${translatedLabel.toLowerCase()}. Klik di sini untuk mengedit.` : `No ${translatedLabel.toLowerCase()} yet. Click here to edit.`}</span>}
          </div>
          {renderInlineCommentThread(id)}
        </div>
      );
    }
  };

  const generateCaption = async () => {
    if (userProfile?.plan !== "vip") {
       const hasFeature = planDetails?.features?.includes("AI Caption Generator");
       if (!hasFeature) {
          showToast(`Fitur AI Caption Generator tidak tersedia di paket Anda. Silakan upgrade paket.`, "error");
          return;
       }
    }
    if(!d.briefCopywriting) {
        showToast("Harap isi Brief Konten terlebih dahulu agar AI memiliki konteks untuk membuat caption.", "error");
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
        
        const data = await callAiWithQuota(auth.currentUser?.uid || 'anon', userProfile?.plan, { prompt, model: "gemini-3.5-flash" }, planDetails?.maxAiGenerations || 50);
        set("caption", (data.text || "").trim());
        showToast("Caption berhasil dibuat oleh Gemini!", "success");
    } catch (e: any) {
        console.error("AI Error:", e);
        const errMsg = e.message || "";
        if (errMsg.includes("habis")) {
          showToast(errMsg, "error");
        } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
          showToast(lang === "id" ? "Gagal menggenerate caption: Terlalu banyak permintaan AI. Silakan tunggu sekitar 30 detik lalu coba lagi." : "Failed to generate caption: Too many AI requests. Please wait about 30 seconds and try again.", "error");
        } else {
          showToast("Gagal menggenerate caption: " + errMsg, "error");
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
  const canArchive = !d.archived && !isNew && (userRole === "owner");
  const canDelete = !isNew && (userRole === "owner");

  const renderMobileView = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.2 }} 
        onClick={handleClose} 
        style={{
          position:"fixed",inset:0,
          background:"rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display:"flex",
          alignItems:"flex-end",
          justifyContent:"center",
          zIndex:99999,
          willChange: "opacity, filter"
        }}
      >
        <motion.div 
          id="content-brief-modal-card-mobile"
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }} 
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          onClick={e=>e.stopPropagation()} 
          style={{
            background: "#FAFAFA",
            backgroundColor: "#FAFAFA",
            borderRadius: "24px 24px 0 0",
            width:"100%",
            height: "92vh",
            position:"relative",
            boxShadow: "0 -10px 40px rgba(0,0,0,0.15)", 
            display: "flex", 
            flexDirection: "column",
            overflow: "hidden",
            opacity: 1
          }}
        >
          {/* Toast Notification */}
          <AnimatePresence>
            {localToast && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: 70,
                  left: "50%",
                  x: "-50%",
                  background: localToast.type === "success" ? "#10B981" : localToast.type === "error" ? "#EF4444" : "#3B82F6",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  zIndex: 9999,
                  pointerEvents: "none",
                  whiteSpace: "nowrap"
                }}
              >
                {localToast.type === "success" && <Check size={12} strokeWidth={3} />}
                {localToast.type === "error" && <AlertTriangle size={12} />}
                {localToast.type === "info" && <Sparkles size={12} />}
                {localToast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "#FFFFFF",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            zIndex: 50
          }}>
            <button 
              onClick={handleClose} 
              style={{
                background: "rgba(0,0,0,0.03)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4B5563",
                cursor: "pointer"
              }}
            >
              <X size={18} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#111827", letterSpacing: "-0.2px" }}>
                {d.isHubAiDraft ? "Draf Konten AI" : (isNew ? "Buat Konten" : "Brief Konten")}
              </span>
              {isSaving && (
                <span style={{ fontSize: 9, color: "#3B82F6", fontWeight: 700 }} className="animate-pulse">
                  {lang === "id" ? "Menyimpan otomatis..." : "Autosaving..."}
                </span>
              )}
            </div>
            {canEdit ? (
              <button 
                onClick={async () => {
                  isDirty.current = false;
                  const newD = { ...dRef.current, manuallySaved: true };
                  setD(newD);
                  dRef.current = newD;
                  await onSave(newD, true);
                  onClose();
                }} 
                style={{
                  background: "#2563EB",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37,99,235,0.2)"
                }}
              >
                {lang === "id" ? "Simpan" : "Save"}
              </button>
            ) : (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 8,
                background: userRole === "commenter" ? "#FEFCE8" : "rgba(0,0,0,0.04)",
                color: userRole === "commenter" ? "#CA8A04" : "#4B5563",
                border: userRole === "commenter" ? "1px solid #FEF08A" : "1px solid rgba(0,0,0,0.06)"
              }}>
                {userRole === "commenter" ? "Komentator" : "Pelihat (Read-Only)"}
              </span>
            )}
          </div>

          {/* Scrollable Content */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px 120px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            
            {/* Title Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
              <TextareaAutosize 
                ref={titleRef}
                value={d.title} 
                readOnly={!canEdit}
                onChange={(e)=>set("title",e.target.value)} 
                minRows={1}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "22px",
                  fontWeight: 800, 
                  letterSpacing: "-0.5px",
                  color: "#111827",
                  width: "100%",
                  outline: "none",
                  padding: 0, 
                  resize: "none", 
                  lineHeight: 1.25, 
                  wordBreak: "break-word"
                }} 
                placeholder={lang === "id" ? "Judul Konten..." : "Content Title..."}
              />
            </div>

            {/* Properties List (Notion Style, Beautifully integrated for mobile) */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "16px",
              border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Detail & Properti
              </span>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Zap size={14} style={{ color: "#D97706" }} />
                    Status
                  </div>
                  {editingFieldLeft === "status" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} value={d.status} options={statuses} prefix="" onChange={(v)=>{set("status", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({statuses: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { statuses: renames } } : {})})} 
                        style={{ padding: "4px 8px", fontSize: 11, fontWeight: 700, background: getTranslucentColor(activeStatusColor, "15"), color: activeStatusColor, borderRadius: 8, border: "none" }} />
                    </div>
                  ) : (
                    <div onClick={() => setEditingFieldLeft("status")} style={{ background: getTranslucentColor(activeStatusColor, "15"), padding: "4px 10px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: activeStatusColor }}>
                        {d.status || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* PIC */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Users size={14} style={{ color: "#2563EB" }} />
                    PIC / Assign
                  </div>
                  {editingFieldLeft === "pic" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} multiple={true} value={d.pic} options={pics} prefix="" onChange={(v)=>{set("pic", Array.isArray(v) ? v.join(", ") : v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({pics: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { pics: renames } } : {})})} 
                        style={{ width: "100%", padding: "4px 8px", fontSize: 12, fontWeight: 600, background: "transparent", color: "#111827", borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div onClick={() => setEditingFieldLeft("pic")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: d.pic ? "#111827" : "rgba(0,0,0,0.4)" }}>
                        {d.pic || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Jadwal Produksi */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Calendar size={14} style={{ color: "#10B981" }} />
                    Jadwal Produksi
                  </div>
                  {editingFieldLeft === "productionDate" ? (
                    <div ref={activeFieldRef} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.03)", borderRadius: 8, padding: "2px 6px" }}>
                      <div style={{ position: "relative", zIndex: 99999 }}>
                        <button 
                          onClick={() => setCalendarOpen(prev => prev === "production" ? null : "production")}
                          style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", outline: "none", cursor: "pointer", padding: "4px 0", minWidth: 70 }}
                        >
                          {d.productionYear ? `${String(d.productionDay).padStart(2, '0')}/${String(d.productionMonth).padStart(2, '0')}/${d.productionYear}` : "Pilih..."}
                        </button>
                        <AnimatePresence>
                          {calendarOpen === "production" && (
                            <MiniCalendar alignRight={true} 
                              date={{ year: d.productionYear, month: d.productionMonth, day: d.productionDay }}
                              onChange={(date: any) => { set("productionYear", date.year); set("productionMonth", date.month); set("productionDay", date.day); }}
                              onClose={() => setCalendarOpen(null)}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      <input type="number" min={d.timeFormat === '24H' ? 0 : 1} max={d.timeFormat === '24H' ? 23 : 12} value={d.productionHour !== undefined && d.productionHour !== null ? d.productionHour : ""} onChange={handleProductionHourChange} 
                        style={{ background: "rgba(0,0,0,0.05)", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", width: 20, textAlign: "center", outline: "none", padding: "1px 0", borderRadius: 4 }} placeholder="00" />
                      <span style={{color:"#111827", fontWeight: 700, fontSize: 11}}>:</span>
                      <input type="number" min={0} max={59} step={5} value={d.productionMinute !== undefined && d.productionMinute !== null ? d.productionMinute : ""} onChange={handleProductionMinuteChange} 
                        style={{ background: "rgba(0,0,0,0.05)", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", width: 20, textAlign: "center", outline: "none", padding: "1px 0", borderRadius: 4 }} placeholder="00" />
                    </div>
                  ) : (
                    <div onClick={() => setEditingFieldLeft("productionDate")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: (d.productionDay && d.productionMonth && d.productionYear) ? "#4B5563" : "rgba(0,0,0,0.4)" }}>
                        {d.productionDay && d.productionMonth && d.productionYear ? `${String(d.productionDay).padStart(2,'0')}/${String(d.productionMonth).padStart(2,'0')} (${String(d.productionHour || 0).padStart(2,'0')}:${String(d.productionMinute || 0).padStart(2,'0')})` : (lang === "id" ? "Atur..." : "Set...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Jadwal Upload */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Clock size={14} style={{ color: "#3B82F6" }} />
                    Jadwal Upload
                  </div>
                  {editingFieldLeft === "uploadDate" ? (
                    <div ref={activeFieldRef} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.03)", borderRadius: 8, padding: "2px 6px" }}>
                      <div style={{ position: "relative", zIndex: 99999 }}>
                        <button 
                          onClick={() => setCalendarOpen(prev => prev === "upload" ? null : "upload")}
                          style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", outline: "none", cursor: "pointer", padding: "4px 0", minWidth: 70 }}
                        >
                          {d.year ? `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}` : "Pilih..."}
                        </button>
                        <AnimatePresence>
                          {calendarOpen === "upload" && (
                            <MiniCalendar alignRight={true} 
                              date={{ year: d.year, month: d.month, day: d.day }}
                              onChange={(date: any) => { set("year", date.year); set("month", date.month); set("day", date.day); }}
                              onClose={() => setCalendarOpen(null)}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      <input type="number" min={d.timeFormat === '24H' ? 0 : 1} max={d.timeFormat === '24H' ? 23 : 12} value={d.uploadHour !== undefined && d.uploadHour !== null ? d.uploadHour : ""} onChange={handleHourChange} 
                        style={{ background: "rgba(0,0,0,0.05)", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", width: 20, textAlign: "center", outline: "none", padding: "1px 0", borderRadius: 4 }} placeholder="00" />
                      <span style={{color:"#111827", fontWeight: 700, fontSize: 11}}>:</span>
                      <input type="number" min={0} max={59} step={5} value={d.uploadMinute !== undefined && d.uploadMinute !== null ? d.uploadMinute : ""} onChange={handleMinuteChange} 
                        style={{ background: "rgba(0,0,0,0.05)", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", width: 20, textAlign: "center", outline: "none", padding: "1px 0", borderRadius: 4 }} placeholder="00" />
                    </div>
                  ) : (
                    <div onClick={() => setEditingFieldLeft("uploadDate")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: (d.day && d.month && d.year) ? "#4B5563" : "rgba(0,0,0,0.4)" }}>
                        {d.day && d.month && d.year ? `${String(d.day).padStart(2,'0')}/${String(d.month).padStart(2,'0')} (${String(d.uploadHour || 0).padStart(2,'0')}:${String(d.uploadMinute || 0).padStart(2,'0')})` : (lang === "id" ? "Atur..." : "Set...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pillar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Flag size={14} style={{ color: activePillarColor }} />
                    Pillar
                  </div>
                  {editingFieldLeft === "pillar" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} value={d.pillar} options={pillars} prefix="" onChange={(v)=>{set("pillar", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({pillars: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { pillars: renames } } : {})})} 
                        style={{ padding: "4px 8px", fontSize: 11, fontWeight: 600, background: "rgba(0,0,0,0.04)", color: "#4b5563", borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div onClick={() => setEditingFieldLeft("pillar")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>
                        {d.pillar || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Platform */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Paperclip size={14} style={{ color: "#EC4899" }} />
                    Platform
                  </div>
                  {editingFieldLeft === "platform" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} value={d.platform} options={platforms} prefix="" onChange={(v)=>{set("platform", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} 
                        style={{ padding: "4px 8px", fontSize: 11, fontWeight: 600, background: "transparent", color: "#4b5563", borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div onClick={() => setEditingFieldLeft("platform")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>
                        {d.platform || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tipe Konten */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <FileText size={14} style={{ color: activeContentTypeColor }} />
                    Tipe Konten
                  </div>
                  {editingFieldLeft === "contentType" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} value={d.contentType} options={contentTypes} prefix="" onChange={(v)=>{set("contentType", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({contentTypes: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { contentTypes: renames } } : {})})} 
                        style={{ padding: "4px 8px", fontSize: 11, fontWeight: 700, background: getTranslucentColor(activeContentTypeColor, "15"), color: activeContentTypeColor, borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div onClick={() => setEditingFieldLeft("contentType")} style={{ background: getTranslucentColor(activeContentTypeColor, "15"), padding: "4px 10px", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: activeContentTypeColor }}>
                        {d.contentType || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Referensi */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Link size={14} style={{ color: "#3B82F6" }} />
                    Referensi
                  </div>
                  {editingFieldLeft === "assetLink" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <input type="text" value={d.assetLink || ""} onChange={(e:any)=>set("assetLink", e.target.value)} placeholder={lang === "id" ? "Tautkan..." : "Link..."} style={{ background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 500, color: "#111827", width: "100%", padding: "4px 8px" }} autoFocus />
                    </div>
                  ) : (
                    <div onClick={() => setEditingFieldLeft("assetLink")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: d.assetLink ? "#2563EB" : "rgba(0,0,0,0.4)" }}>
                        {d.assetLink ? (lang === "id" ? "Buka Link" : "Open Link") : (lang === "id" ? "Tautkan..." : "Link...")}
                      </span>
                      {d.assetLink && <ExternalLink size={10} style={{ color: "#2563EB" }} />}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Analysis Result Panel (if exists) */}
            {aiResult && (
              <div style={{
                background: "rgba(227, 242, 253, 0.4)",
                border: "1px solid rgba(187, 222, 251, 0.6)",
                borderRadius: "18px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(30,136,229,0.04)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#1E88E5", display: "flex", alignItems: "center", gap: 6 }}>
                    <GeminiIcon size={14} />
                    AI Content Analysis
                  </span>
                  <button onClick={() => setAiResult("")} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#1E88E5" }}>&times;</button>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: "#2C3E50", whiteSpace: "pre-wrap" }}><Markdown>{aiResult}</Markdown></div>
              </div>
            )}

            {/* Segmented Control Tab Selector (Apple style, 100% width) */}
            <div style={{ 
              display: "flex", background: "rgba(0,0,0,0.04)", padding: "3px", boxSizing: "border-box",
              borderRadius: "12px", width: "100%", height: "38px", position: "relative"
            }}>
              <motion.div
                layout
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                style={{
                  position: "absolute",
                  top: 3,
                  bottom: 3,
                  borderRadius: "10px",
                  background: "#FFFFFF",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  width: "calc((100% - 6px) / 3)",
                  left: activeTab === "draft" ? 3 : activeTab === "refs" ? "calc(((100% - 6px) / 3) + 3px)" : "calc(((100% - 6px) / 3 * 2) + 3px)",
                  zIndex: 0
                }}
              />
              {[
                { id: "draft", label: lang === "id" ? "Brief Konten" : "Brief Content" },
                { id: "refs", label: lang === "id" ? "Aset" : "Assets" },
                { id: "metrics", label: lang === "id" ? "Metrik" : "Metrics" }
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
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "transparent",
                    color: activeTab === id ? "#000000" : "rgba(0,0,0,0.5)",
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

            {/* Tab contents (Render the specific selected tab view) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* TAB 1: BRIEF & CONTENT */}
              {activeTab === "draft" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {lang === "id" ? "Panduan & Salinan Konten" : "Guidelines & Copy"}
                    </span>
                    <button
                      onClick={() => setShowLayoutConfig(!showLayoutConfig)}
                      style={{
                        background: showLayoutConfig ? "rgba(166, 124, 28, 0.08)" : "rgba(0,0,0,0.03)",
                        border: "none",
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 10,
                        fontWeight: 700,
                        color: showLayoutConfig ? "#A67C1C" : "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Settings size={12} />
                      {showLayoutConfig ? "Tutup" : "Kolom"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showLayoutConfig && renderLayoutConfigPanel()}
                  </AnimatePresence>

                  {layoutFields
                    .filter(f => f.visible !== false)
                    .map(field => renderDynamicField(field))}
                </div>
              )}

              {/* TAB 2: ASSETS & REFERENCES */}
              {activeTab === "refs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Tautan Aset
                    </span>
                    
                    {/* Link Aset Final & Folder */}
                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <FolderOpen size={13} style={{ color: "#2563EB" }} /> {lang === "id" ? "Link Aset" : "Asset Links"}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = getAssetLinks(dRef.current);
                            set("assetLinks", [...current, ""]);
                          }}
                          style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                        >
                          + Tambah Link
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {getAssetLinks(d).map((lnk: string, idx: number) => (
                          <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              value={lnk}
                              onChange={(e: any) => {
                                const arr = [...getAssetLinks(dRef.current)];
                                arr[idx] = e.target.value;
                                set("assetLinks", arr);
                              }}
                              style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 13 }}
                              placeholder="https://drive.google.com/..."
                            />
                            {lnk.trim() !== "" && (
                              <a
                                href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka link"
                                style={{ color: "#2563EB", padding: "4px 6px", display: "flex", alignItems: "center" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            {getAssetLinks(d).length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const arr = getAssetLinks(dRef.current).filter((_: any, i: number) => i !== idx);
                                  set("assetLinks", arr.length ? arr : [""]);
                                }}
                                style={{ background: "none", border: "none", color: "#EF4444", fontWeight: 700, padding: "0 6px", cursor: "pointer" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Link Postingan Sosmed */}
                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <Link size={13} style={{ color: "#2563EB" }} /> {lang === "id" ? "Link Postingan" : "Post Links"}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = getSosmedLinks(dRef.current);
                            set("sosmedLinks", [...current, ""]);
                          }}
                          style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                        >
                          + Tambah Link
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {getSosmedLinks(d).map((lnk: string, idx: number) => (
                          <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              value={lnk}
                              onChange={(e: any) => {
                                const arr = [...getSosmedLinks(dRef.current)];
                                arr[idx] = e.target.value;
                                set("sosmedLinks", arr);
                              }}
                              style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 13 }}
                              placeholder="https://instagram.com/p/..."
                            />
                            {lnk.trim() !== "" && (
                              <a
                                href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka link"
                                style={{ color: "#2563EB", padding: "4px 6px", display: "flex", alignItems: "center" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            {getSosmedLinks(d).length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const arr = getSosmedLinks(dRef.current).filter((_: any, i: number) => i !== idx);
                                  set("sosmedLinks", arr.length ? arr : [""]);
                                }}
                                style={{ background: "none", border: "none", color: "#EF4444", fontWeight: 700, padding: "0 6px", cursor: "pointer" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Bahan Referensi & Catatan
                    </span>

                    <div style={GRP}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 4, display: "block" }}>{lang === "id" ? "Catatan Referensi" : "Reference Notes"}</label>
                      <TextareaAutosize value={d.referenceText} onChange={(e:any)=>set("referenceText",e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 13, minHeight: 80 } as any} minRows={3} placeholder={lang === "id" ? "Referensi, mood, visual..." : "Reference details..."}/>
                    </div>

                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", margin: 0 }}>{lang === "id" ? "Daftar Link Referensi" : "Reference Link List"}</label>
                        <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks",[...(dRef.current.referenceLinks||[]),""]); }} style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>+ Tambah</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(d.referenceLinks||[]).map((lnk:string, i:number)=>(
                          <div key={i} style={{ display: "flex", gap: 6 }}>
                            <input value={lnk} onChange={(e:any)=>set("referenceLinks", dRef.current.referenceLinks.map((l:any,idx:number)=>idx===i?e.target.value:l))} style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12 }} placeholder="https://..."/>
                            <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks", dRef.current.referenceLinks.filter((_:any,idx:number)=>idx!==i)); }} style={{ background: "none", border: "none", color: "#EF4444", fontWeight: 700, padding: "0 6px" }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={GRP}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 4, display: "block" }}>{lang === "id" ? "Gambar Referensi" : "Reference Image"}</label>
                      <input type="file" accept="image/*" onChange={handleRefImg} style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: "100%" }}/>
                      {d.referenceImage && (
                        <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)" }}>
                          <img src={d.referenceImage} alt="ref" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}/>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PERFORMANCE METRICS */}
              {activeTab === "metrics" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Custom Fields Card */}
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                        <Plus size={14} /> Field Kustom
                      </span>
                      <button onClick={(e)=>{ e.stopPropagation(); set("customFields",[...(d.customFields||[]),{name: lang === "id" ? "Label Baru" : "New Field",value:""}]); setEditingFieldRight("customField_"+((d.customFields?.length||0))); }} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 8, background: "rgba(0,0,0,0.03)", border: "none", color: "#111827", fontWeight: 700 }}>+ Field</button>
                    </div>

                    {(d.customFields||[]).length === 0 ? (
                      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", textAlign: "center", padding: "10px 0" }}>Belum ada custom fields.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(d.customFields||[]).map((cf:any, idx:number)=>(
                          <div key={idx} onClick={() => setEditingFieldRight("customField_"+idx)} style={{ background: "rgba(0,0,0,0.02)", padding: "12px", borderRadius: 12, position: "relative" }}>
                            {editingFieldRight === "customField_"+idx ? (
                              <div ref={activeFieldRef} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <input autoFocus value={cf.name} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,name:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", width: "100%", padding: 0 }} placeholder="Nama Field..."/>
                                  <button onClick={(e)=>{ e.stopPropagation(); set("customFields", d.customFields.filter((_:any,i:number)=>i!==idx)); setEditingFieldRight(null); }} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 14, fontWeight: 700, padding: "0 4px" }}>✕</button>
                                </div>
                                <TextareaAutosize value={cf.value} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,value:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111827", width: "100%", padding: 0, resize: "none" }} minRows={1} placeholder="Isi field..."/>
                              </div>
                            ) : (
                              <>
                                <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", marginBottom: 4 }}>{cf.name || `Kolom ${idx+1}`}</div>
                                <div style={{ fontSize: 13, color: "#111827", whiteSpace: "pre-wrap" }}>{cf.value || "-"}</div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Organic & Ads Report Card */}
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}><BarChart2 size={12} /> Metrik Performa</span>
                      {d.metricsUpdatedAt && <span style={{ fontSize: 9, color: "rgba(0,0,0,0.4)" }}>{d.metricsUpdatedAt}</span>}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {/* Organic reach */}
                      <div style={{ background: "rgba(59,130,246,0.03)", border: "1px solid rgba(59,130,246,0.06)", borderRadius: 14, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", marginBottom: 8, display: "flex", alignItems: "center" }}><Leaf size={14} style={{ marginRight: 4 }} /> Organik</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                          {MK.map((k:string) => (
                            <div onClick={() => setEditingFieldRight("metric_"+k)} key={k} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.02)", padding: "6px 8px", borderRadius: 8 }}>
                              {getMetricIcon(k, MC[k]||"#3B82F6", 13)}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 8, color: "rgba(0,0,0,0.4)", textTransform: "capitalize", lineHeight: 1.1, marginBottom: 1 }}>{formatMetricKey(k)}</div>
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
                                    style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: 12, fontWeight: 800, color: "#111827", padding: 0 }}
                                  />
                                ) : (
                                  <div style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>{fmt(d.metrics[k] || 0)}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: "1px dashed rgba(59,130,246,0.15)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "space-between" }}>
                            <span>Total Interaksi:</span>
                            <strong style={{ color: "#3B82F6" }}>{fmt(eng(d.metrics))}</strong>
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "space-between" }}>
                            <span>Engagement Rate:</span>
                            <strong style={{ color: "#3B82F6" }}>{(d.metrics?.reach || 0) > 0 ? ((eng(d.metrics) / d.metrics.reach) * 100).toFixed(2) : 0}%</strong>
                          </div>
                        </div>
                      </div>

                      {/* Paid Campaign Results */}
                      <div style={{ background: d.isAds ? "rgba(156,43,78,0.03)" : "rgba(0,0,0,0.01)", border: d.isAds ? "1px solid rgba(156,43,78,0.06)" : "1px dashed rgba(0,0,0,0.06)", borderRadius: 14, padding: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#9C2B4E", display: "flex", alignItems: "center" }}><DollarSign size={14} style={{ marginRight: 4 }} /> Iklan (Ads)</span>
                          <button onClick={(e)=>{ e.stopPropagation(); set("isAds",!d.isAds); }} style={{ width: 32, height: 18, borderRadius: 9, border: "none", cursor: "pointer", background: d.isAds ? "#9C2B4E" : "rgba(0,0,0,0.15)", position: "relative" }}>
                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: d.isAds ? 16 : 2, transition: "left .2s" }}/>
                          </button>
                        </div>

                        {d.isAds ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {ADS_CATEGORIES.map(cat => (
                              <div key={cat.title}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: "#9C2B4E", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{cat.title}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                  {cat.keys.map(k => (
                                    <div onClick={() => setEditingFieldRight("adsMetric_"+k)} key={k} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(156,43,78,0.02)", padding: "5px 8px", borderRadius: 8 }}>
                                      {getMetricIcon(k, "#9C2B4E", 13)}
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 8, color: "rgba(0,0,0,0.4)", textTransform: "capitalize", lineHeight: 1.1, marginBottom: 1 }}>{formatMetricKey(k)}</div>
                                        {editingFieldRight === "adsMetric_"+k ? (
                                          <input 
                                            ref={activeFieldRef}
                                            autoFocus
                                            type={k === "audience" ? "text" : "number"} 
                                            min={k === "audience" ? undefined : 0} 
                                            value={d.adsMetrics?.[k] === 0 && k !== "audience" ? "" : (d.adsMetrics?.[k] !== undefined && d.adsMetrics?.[k] !== null ? d.adsMetrics[k] : "")} 
                                            onChange={(e:any)=>setM(k,e.target.value,true)} 
                                            onKeyDown={(e) => e.key === "Enter" && setEditingFieldRight(null)}
                                            style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: 11, fontWeight: 800, color: "#111827", padding: 0 }}
                                          />
                                        ) : (
                                          <div style={{ fontSize: 11, fontWeight: 800, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                        ) : (
                          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>Kampanye berbayar dinonaktifkan.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Sharing Panel moved to Bottom Sheet format for visibility */}

          </div>

          {/* Sticky Mobile Footer Action Bar */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#FFFFFF",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            padding: "12px 16px 24px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 100
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {d.history && d.history.length > 0 && (
                <span onClick={() => setShowHistory(true)} style={{ fontSize: 10, color: "#9CA3AF", fontStyle: "italic", cursor: "pointer", maxWidth: 140, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {lang === "id" ? "diedit terakhir oleh" : "last edited by"} {editorProfiles[d.history[0].editorId]?.fullName || editorProfiles[d.history[0].editorId]?.nickname || d.history[0].editorName} {lang === "id" ? "pada" : "at"} {new Date(d.history[0].timestamp).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" })}, {new Date(d.history[0].timestamp).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              <Tooltip text={lang === "id" ? "Muat Ulang (Refresh)" : "Refresh"} position="top">
                <button onClick={handleRefresh} disabled={isRefreshing} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.03)", border: "none", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", opacity: isRefreshing ? 0.5 : 1, cursor: isRefreshing ? "not-allowed" : "pointer" }}>
                  <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                </button>
              </Tooltip>
              {canEdit && onDuplicate && (
                <Tooltip text="Duplikasi" position="top"><button onClick={()=>onDuplicate(d)}  style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.03)", border: "none", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}><Copy size={16} /></button></Tooltip>
              )}
              {d.archived ? (
                <Tooltip text="Pulihkan" position="top"><button onClick={()=>onRestore(d.id)}  style={{ width: 40, height: 40, borderRadius: 12, background: "#E8F5E9", border: "none", color: "#2E7D32", display: "flex", alignItems: "center", justifyContent: "center" }}><RefreshCcw size={16} /></button></Tooltip>
              ) : (
                canArchive && (
                  <Tooltip text="Arsipkan" position="top"><button onClick={()=>onArchive(d.id)}  style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.03)", border: "none", color: "#4B5563", display: "flex", alignItems: "center", justifyContent: "center" }}><Archive size={16} /></button></Tooltip>
                )
              )}
              {canDelete && (
                <Tooltip text="Hapus" position="top"><button onClick={()=>onDelete(d.id, false, d.workspaceId || workspace?.id)}  style={{ width: 40, height: 40, borderRadius: 12, background: "#FEF2F2", border: "none", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash size={16} /></button></Tooltip>
              )}
            </div>

            {canEdit && (
            <button
              onClick={() => setShowShareDropdown(!showShareDropdown)}
              style={{
                background: showShareDropdown ? "#2563EB" : "rgba(37,99,235,0.08)",
                color: showShareDropdown ? "#FFFFFF" : "#2563EB",
                border: "none",
                borderRadius: "12px",
                padding: "10px 18px",
                fontSize: "12px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Send size={14} />
              Bagikan
            </button>
            )}
          </div>

          {/* Confirm exit prompt for AI draft */}
          <AnimatePresence>
            {showExitConfirm && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding: 16}} onClick={e=>e.stopPropagation()}>
                 <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} style={{background:"#FFFFFF",padding:24,borderRadius:24,maxWidth:320,width:"100%",boxShadow:"0 12px 30px rgba(0,0,0,0.15)",textAlign:"center"}}>
                    <h3 style={{margin:"0 0 12px",fontSize:18,color:"#111827", fontWeight:800}}>Hapus Draf?</h3>
                    <p style={{margin:"0 0 20px",fontSize:13,color:"#4B5563",lineHeight:1.4}}>
                       Draf konten AI ini belum disimpan. Yakin ingin menutupnya? Draf ini akan hilang sepenuhnya.
                    </p>
                    <div style={{display:"flex",gap:10}}>
                       <button onClick={() => onClose()} style={{flex:1,padding:"10px 14px",background:"transparent",border:"1px solid rgba(0,0,0,0.1)",color:"#111827",borderRadius:12,fontWeight:700,fontSize:12}}>
                          Hapus
                       </button>
                       <button onClick={() => setShowExitConfirm(false)} style={{flex:1,padding:"10px 14px",background:"#2563EB",border:"none",color:"white",borderRadius:12,fontWeight:700,fontSize:12}}>
                          Lanjutkan
                       </button>
                    </div>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backdrop for mobile share bottom sheet */}
          <AnimatePresence>
            {showShareDropdown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowShareDropdown(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(15, 23, 42, 0.4)",
                  zIndex: 209,
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)"
                }}
              />
            )}
          </AnimatePresence>

          {/* Mobile Bottom Sheet Sharing Panel */}
          <AnimatePresence>
            {showShareDropdown && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "#FFFFFF",
                  borderTopLeftRadius: "28px",
                  borderTopRightRadius: "28px",
                  padding: "20px 20px calc(24px + env(safe-area-inset-bottom, 0px)) 20px",
                  boxShadow: "0 -10px 40px rgba(0,0,0,0.15)",
                  zIndex: 210,
                  maxHeight: "85vh",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                {/* Drag Handle Indicator */}
                <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, margin: "0 auto 16px auto", flexShrink: 0 }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontSize: 14, fontWeight: 800 }}>
                    <Globe size={16} style={{ color: "#2563EB" }} /> Pengaturan Berbagi
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowShareDropdown(false)} 
                    style={{ 
                      border: "none", 
                      background: "rgba(0,0,0,0.03)", 
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16, 
                      fontWeight: 700, 
                      color: "#4B5563",
                      cursor: "pointer" 
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Segmented Tab Control */}
                <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.04)", padding: 2, borderRadius: 8, marginBottom: 16, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setShareTab("public")}
                    style={{
                      flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "none",
                      background: shareTab === "public" ? "#FFFFFF" : "transparent",
                      color: shareTab === "public" ? "#2563eb" : "#4b5563",
                      boxShadow: shareTab === "public" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Tautan Publik
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareTab("users")}
                    style={{
                      flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "none",
                      background: shareTab === "users" ? "#FFFFFF" : "transparent",
                      color: shareTab === "users" ? "#2563eb" : "#4b5563",
                      boxShadow: shareTab === "users" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Kirim ke Pengguna
                  </button>
                </div>

                {shareTab === "public" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none", background: "rgba(0,0,0,0.02)", padding: "12px 16px", borderRadius: "12px" }}>
                      <input
                        type="checkbox"
                        checked={!!d.isPublic}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          set("isPublic", isChecked);
                          if (!isChecked) {
                            set("allowComments", false);
                          }
                        }}
                        style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                        Aktifkan Link Publik
                      </span>
                    </label>

                    {d.isPublic && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none", background: "rgba(0,0,0,0.02)", padding: "12px 16px", borderRadius: "12px" }}>
                          <input
                            type="checkbox"
                            checked={d.allowComments !== false}
                            onChange={(e) => set("allowComments", e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                            Izinkan Komentar Pengunjung
                          </span>
                        </label>

                        <div style={{ display: "flex", gap: 4, alignItems: "center", background: "rgba(0,0,0,0.03)", padding: "10px 14px", borderRadius: 12 }}>
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`}
                            style={{ background: "transparent", border: "none", outline: "none", fontSize: 11, color: "#4B5563", width: "100%", fontFamily: "monospace" }}
                          />
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const shareUrl = `${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              setCopiedSharedLink(true);
                              setTimeout(() => setCopiedSharedLink(false), 2000);
                            }}
                            style={{
                              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              background: "#2563eb", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "12px", fontSize: "12px", fontWeight: 800, cursor: "pointer"
                            }}
                          >
                            {copiedSharedLink ? (
                              <>
                                <Check size={14} /> Disalin!
                              </>
                            ) : (
                              <>
                                <Link2 size={14} /> Salin Link
                              </>
                            )}
                          </button>

                          <a
                            href={`${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              background: "rgba(0,0,0,0.04)", color: "#111827", border: "none", borderRadius: 12, padding: "12px", fontSize: "12px", fontWeight: 800, textDecoration: "none"
                            }}
                          >
                            <ExternalLink size={14} /> Buka
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", letterSpacing: "0.2px" }}>Masukkan username atau email</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <Search size={14} style={{ position: "absolute", left: 12, top: 12, color: "rgba(0,0,0,0.4)" }} />
                        <input
                          type="text"
                          value={shareSearch}
                          onChange={(e) => setShareSearch(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleShareSearch()}
                          placeholder="username atau email"
                          style={{ width: "100%", background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 12, padding: "10px 12px 10px 34px", fontSize: 13, fontWeight: 500, outline: "none" }}
                        />
                      </div>
                      <button type="button" onClick={handleShareSearch} disabled={shareSearchLoading || !shareSearch.trim()} style={{ background: "#2563eb", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "0 16px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{shareSearchLoading ? "..." : "Cari"}</button>
                    </div>

                    {shareSearchError && <div style={{ fontSize: 12, color: "#e11d48", fontWeight: 700 }}>{shareSearchError}</div>}

                    {shareSearchSuccess && (
                      <div style={{ background: "rgba(37, 99, 235, 0.04)", border: "1.5px dashed rgba(37, 99, 235, 0.2)", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563eb", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {String(shareSearchSuccess.fullName || shareSearchSuccess.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <div style={{ overflow: "hidden", flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#111827", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareSearchSuccess.fullName || shareSearchSuccess.email}</div>
                            <div style={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>@{shareSearchSuccess.username}</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, borderTop: "1px dashed rgba(37, 99, 235, 0.15)", paddingTop: 8 }}>
                          <HubifyRoleSelect
                            value={selectedRoleForNewUser}
                            onChange={(role) => setSelectedRoleForNewUser(role)}
                            compact={true}
                            align="left"
                          />
                          <button type="button" onClick={() => handleAddSharedUser(shareSearchSuccess)} style={{ background: "#2563eb", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Bagikan Akses</button>
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 8, letterSpacing: "0.2px" }}>Memiliki Akses ({(d.sharedUsers || []).length})</div>
                      {(!d.sharedUsers || d.sharedUsers.length === 0) ? (
                        <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>Belum ada pengguna.</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                          {(d.sharedUsers || []).map((u: any) => (
                            <div key={u.uid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.02)", borderRadius: 10, padding: "8px 12px" }}>
                              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{u.fullName || u.email}</span>
                                {u.username && <span style={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>@{u.username}</span>}
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {canManageShare ? (
                                  <HubifyRoleSelect
                                    value={(u.role || "viewer") as any}
                                    onChange={(role) => handleUpdateSharedUserRole(u.uid, role)}
                                    compact={true}
                                    align="right"
                                  />
                                ) : (
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    background: u.role === "editor" ? "#eff6ff" : u.role === "commenter" ? "#fefce8" : "rgba(0,0,0,0.04)",
                                    color: u.role === "editor" ? "#2563eb" : u.role === "commenter" ? "#ca8a04" : "#374151"
                                  }}>
                                    {u.role === "editor" ? "Editor" : u.role === "commenter" ? "Komentator" : "Pelihat"}
                                  </span>
                                )}

                                {canManageShare && (
                                  <button type="button" onClick={() => handleRemoveSharedUser(u.uid)} style={{ background: "none", border: "none", color: "#e11d48", display: "flex", alignItems: "center", cursor: "pointer" }}><X size={14}/></button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  };

  if (isMobile) {
    return renderMobileView();
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.2, ease: "easeInOut" }} 
      onClick={handleClose} 
      style={{
        position:"fixed",inset:0,
        background:"rgba(0,0,0,0.5)",
        display:"flex",
        alignItems: layoutMode === "drawer" ? "stretch" : "center",
        justifyContent: layoutMode === "drawer" ? "flex-end" : "center",
        zIndex:99999,
        padding: layoutMode === "drawer" ? 0 : 16,
        willChange: "opacity"
      }}>
      <motion.div 
        id="content-brief-modal-card"
        initial={layoutMode === "drawer" ? { x: "100%", opacity: 0.85 } : { scale: 0.96, opacity: 0, y: 12 }} 
        animate={layoutMode === "drawer" ? { x: 0, opacity: 1 } : { scale: 1, opacity: 1, y: 0 }} 
        exit={layoutMode === "drawer" ? { x: "100%", opacity: 0.85 } : { scale: 0.96, opacity: 0, y: 12 }} 
        transition={layoutMode === "drawer" 
          ? { type: "spring", damping: 32, stiffness: 280, mass: 0.9 } 
          : { type: "spring", damping: 26, stiffness: 320, mass: 0.9 }
        }
        onClick={e=>e.stopPropagation()} 
        style={{
          background: "#ffffff", 
          borderTop: layoutMode === "drawer" ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
          borderRight: layoutMode === "drawer" ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
          borderBottom: layoutMode === "drawer" ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
          borderLeft: layoutMode === "drawer" ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.08)",
          borderRadius: layoutMode === "drawer" ? "24px 0 0 24px" : "24px",
          maxWidth: "1050px",
          width:"100%",
          height: layoutMode === "drawer" ? "100%" : "90vh",
          position:"relative",
          boxShadow: layoutMode === "drawer" ? "-10px 0 30px rgba(0,0,0,0.05)" : "0 12px 30px rgba(0,0,0,0.05)", 
          display: "flex", flexDirection: "column",
          willChange: "transform, opacity",
          transform: "translate3d(0,0,0)"
        }}
      >
        {/* Toast Notification */}
        <AnimatePresence>
          {localToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                position: "absolute",
                top: 24,
                left: "50%",
                x: "-50%",
                background: localToast.type === "success" ? "#10B981" : localToast.type === "error" ? "#EF4444" : "#3B82F6",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 700,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                zIndex: 9999,
                pointerEvents: "none"
              }}
            >
              {localToast.type === "success" && <Check size={14} strokeWidth={3} />}
              {localToast.type === "error" && <AlertTriangle size={14} />}
              {localToast.type === "info" && <Sparkles size={14} />}
              {localToast.message}
            </motion.div>
          )}
        </AnimatePresence>

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
              padding: "32px 28px 250px 28px", 
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
                        readOnly={!canEdit}
                        onChange={(e)=>set("title",e.target.value)} 
                        minRows={1}
                        style={{background:"transparent",border:"none",fontSize:40,fontWeight:900, letterSpacing:"-1.2px",color:"#111827",width:"100%",outline:"none",padding:0, resize: "none", overflow: "hidden", lineHeight: 1.1, wordBreak: "break-word", whiteSpace: "pre-wrap"}} 
                        placeholder={lang === "id" ? "Ketik Judul Konten..." : "Type Content Title..."}/>
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
                        <CustomDropdown alignRight={true} dark={false} value={d.status} options={statuses} prefix="" onChange={(v)=>{set("status", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({statuses: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { statuses: renames } } : {})})} 
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
                          {d.status || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Pilih Status..." : "Select Status..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: PIC / Assign */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Users size={14}/> PIC / Assign
                    </div>
                    {editingFieldLeft === "pic" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown alignRight={true} dark={false} multiple={true} value={d.pic} options={pics} prefix="" onChange={(v)=>{set("pic", Array.isArray(v) ? v.join(", ") : v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({pics: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { pics: renames } } : {})})} 
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
                          {d.pic || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Ketik atau pilih PIC..." : "Type or select PIC..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Jadwal Produksi */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Calendar size={14}/> {lang === "id" ? "Jadwal Produksi" : "Production Schedule"}
                    </div>
                    {editingFieldLeft === "productionDate" ? (
                      <div ref={activeFieldRef} style={{flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap"}}>
                        <div style={{display: "flex", alignItems: "center", gap: 4, background: "#FFF", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, padding: "4px 8px"}}>
                          <div style={{ position: "relative", zIndex: 99999 }}>
                            <button 
                              onClick={() => setCalendarOpen(prev => prev === "production2" ? null : "production2")}
                              style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", outline: "none", cursor: "pointer", padding: "2px 0", minWidth: 80, textAlign: "left" }}
                            >
                              {d.productionYear ? `${String(d.productionDay).padStart(2, '0')}/${String(d.productionMonth).padStart(2, '0')}/${d.productionYear}` : "Pilih..."}
                            </button>
                            <AnimatePresence>
                              {calendarOpen === "production2" && (
                                <MiniCalendar alignRight={true} 
                                  date={{ year: d.productionYear, month: d.productionMonth, day: d.productionDay }}
                                  onChange={(date: any) => { set("productionYear", date.year); set("productionMonth", date.month); set("productionDay", date.day); }}
                                  onClose={() => setCalendarOpen(null)}
                                />
                              )}
                            </AnimatePresence>
                          </div>
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
                          {d.productionDay && d.productionMonth && d.productionYear ? `${String(d.productionDay).padStart(2,'0')}/${String(d.productionMonth).padStart(2,'0')}/${d.productionYear} (${String(d.productionHour !== undefined && d.productionHour !== null ? d.productionHour : 0).padStart(2,'0')}:${String(d.productionMinute !== undefined && d.productionMinute !== null ? d.productionMinute : 0).padStart(2,'0')})` : <span style={{fontStyle: "italic"}}>{lang === "id" ? "Atur tanggal produksi..." : "Set production date..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Jadwal Upload */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Calendar size={14}/> {lang === "id" ? "Jadwal Upload" : "Publish Schedule"}
                    </div>
                    {editingFieldLeft === "uploadDate" ? (
                      <div ref={activeFieldRef} style={{flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap"}}>
                        <div style={{display: "flex", alignItems: "center", gap: 4, background: "#FFF", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, padding: "4px 8px"}}>
                          <div style={{ position: "relative", zIndex: 99999 }}>
                            <button 
                              onClick={() => setCalendarOpen(prev => prev === "upload2" ? null : "upload2")}
                              style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", outline: "none", cursor: "pointer", padding: "2px 0", minWidth: 80, textAlign: "left" }}
                            >
                              {d.year ? `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}` : "Pilih..."}
                            </button>
                            <AnimatePresence>
                              {calendarOpen === "upload2" && (
                                <MiniCalendar alignRight={true} 
                                  date={{ year: d.year, month: d.month, day: d.day }}
                                  onChange={(date: any) => { set("year", date.year); set("month", date.month); set("day", date.day); }}
                                  onClose={() => setCalendarOpen(null)}
                                />
                              )}
                            </AnimatePresence>
                          </div>
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
                          {d.day && d.month && d.year ? `${String(d.day).padStart(2,'0')}/${String(d.month).padStart(2,'0')}/${d.year} (${String(d.uploadHour !== undefined && d.uploadHour !== null ? d.uploadHour : 0).padStart(2,'0')}:${String(d.uploadMinute !== undefined && d.uploadMinute !== null ? d.uploadMinute : 0).padStart(2,'0')})` : <span style={{fontStyle: "italic"}}>{lang === "id" ? "Atur tanggal upload..." : "Set publish date..."}</span>}
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
                        <CustomDropdown alignRight={true} dark={false} value={d.pillar} options={pillars} prefix="" onChange={(v)=>{set("pillar", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({pillars: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { pillars: renames } } : {})})} 
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
                          {d.pillar || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Pilih pillar..." : "Select pillar..."}</span>}
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
                        <CustomDropdown alignRight={true} dark={false} value={d.platform} options={platforms} prefix="" onChange={(v)=>{set("platform", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} 
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
                          {d.platform || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Pilih platform..." : "Select platform..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Content Type / Type */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <FileText size={14}/> {lang === "id" ? "Tipe Konten" : "Content Type"}
                    </div>
                    {editingFieldLeft === "contentType" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown alignRight={true} dark={false} value={d.contentType} options={contentTypes} prefix="" onChange={(v)=>{set("contentType", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({contentTypes: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { contentTypes: renames } } : {})})} 
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
                          {d.contentType || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Pilih tipe..." : "Select type..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Referensi */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Link size={14}/> {lang === "id" ? "Referensi" : "Reference"}
                    </div>
                    {editingFieldLeft === "assetLink" ? (
                      <div ref={activeFieldRef} style={{flex: 1, display: "flex", alignItems: "center", gap: 6}}>
                        <input type="text" value={d.assetLink || ""} onChange={(e:any)=>set("assetLink", e.target.value)} placeholder={lang === "id" ? "Tautkan link referensi..." : "Link reference..."} style={{background: "#FFF", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, outline: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: "100%", padding: "4px 8px"}} autoFocus />
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
                              {lang === "id" ? "Link Referensi" : "Reference Link"}
                            </span>
                            <a href={d.assetLink} target="_blank" rel="noopener noreferrer" style={{color: "#2563eb", display: "flex", alignItems: "center"}} onClick={(e) => e.stopPropagation()}>
                              <ExternalLink size={14} />
                            </a>
                          </>
                        ) : (
                          <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontSize: 13}}>{lang === "id" ? "Tautkan referensi..." : "Link reference..."}</span>
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
              { id: "draft", label: lang === "id" ? "Brief Konten" : "Brief Content" },
              { id: "refs", label: lang === "id" ? "Aset" : "Assets" },
              { id: "metrics", label: lang === "id" ? "Metrik" : "Metrics" }
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

          {!isReady ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", height: 504, opacity: 0.6 }} className="animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.06)", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(44,32,22,0.06)" }} />
                    <div style={{ width: 80, height: 12, borderRadius: 4, background: "rgba(44,32,22,0.06)" }} />
                  </div>
                  <div style={{ width: "100%", height: n === 2 ? 140 : 60, borderRadius: 10, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.06)" }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
              
              {/* TAB DRAFT (Objective, Brief, Caption, and customizable layout fields) */}
              {activeTab === "draft" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                  
                  {/* CONFIG BUTTON BAR */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {lang === "id" ? "Panduan & Salinan Konten" : "Guidelines & Copy"}
                    </span>
                    <button
                      onClick={() => setShowLayoutConfig(!showLayoutConfig)}
                      style={{
                        background: showLayoutConfig ? "rgba(166, 124, 28, 0.1)" : "rgba(44,32,22,0.04)",
                        border: showLayoutConfig ? "1px solid rgba(166, 124, 28, 0.2)" : "1px solid rgba(44,32,22,0.05)",
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: showLayoutConfig ? "#A67C1C" : "rgba(44,32,22,0.6)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <Settings size={12} />
                      {showLayoutConfig ? (lang === "id" ? "Tutup Pengaturan" : "Close Layout") : (lang === "id" ? "Atur Kolom" : "Configure Columns")}
                    </button>
                  </div>

                  {/* Render the config drawer */}
                  <AnimatePresence>
                    {showLayoutConfig && renderLayoutConfigPanel()}
                  </AnimatePresence>

                  {/* Render all visible fields according to the saved layout order */}
                  {layoutFields
                    .filter(f => f.visible !== false)
                    .map(field => renderDynamicField(field))}
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
                    display: "flex",
                    flexDirection: "column",
                    gap: 16
                  }}>
                    {/* Link Aset Final & Folder */}
                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <FolderOpen size={14} style={{ color: "#3B82F6" }} /> {lang === "id" ? "Link Aset" : "Asset Links"}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = getAssetLinks(dRef.current);
                            set("assetLinks", [...current, ""]);
                          }}
                          style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                        >
                          + Tambah Link
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {getAssetLinks(d).map((lnk: string, idx: number) => (
                          <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              value={lnk}
                              onChange={(e: any) => {
                                const arr = [...getAssetLinks(dRef.current)];
                                arr[idx] = e.target.value;
                                set("assetLinks", arr);
                              }}
                              style={{ ...I(), border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10, flex: 1 }}
                              placeholder="https://drive.google.com/..."
                            />
                            {lnk.trim() !== "" && (
                              <a
                                href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka link"
                                style={{ color: "#3B82F6", padding: "4px 6px", display: "flex", alignItems: "center" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            {getAssetLinks(d).length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const arr = getAssetLinks(dRef.current).filter((_: any, i: number) => i !== idx);
                                  set("assetLinks", arr.length ? arr : [""]);
                                }}
                                style={{ background: "none", border: "none", color: "#9C2B4E", fontWeight: 700, padding: "0 6px", cursor: "pointer" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Link Upload / Postingan Sosmed */}
                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <Link size={14} style={{ color: "#3B82F6" }} /> {lang === "id" ? "Link Postingan" : "Post Links"}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = getSosmedLinks(dRef.current);
                            set("sosmedLinks", [...current, ""]);
                          }}
                          style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                        >
                          + Tambah Link
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {getSosmedLinks(d).map((lnk: string, idx: number) => (
                          <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              value={lnk}
                              onChange={(e: any) => {
                                const arr = [...getSosmedLinks(dRef.current)];
                                arr[idx] = e.target.value;
                                set("sosmedLinks", arr);
                              }}
                              style={{ ...I(), border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10, flex: 1 }}
                              placeholder="https://instagram.com/p/..."
                            />
                            {lnk.trim() !== "" && (
                              <a
                                href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka link"
                                style={{ color: "#3B82F6", padding: "4px 6px", display: "flex", alignItems: "center" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            {getSosmedLinks(d).length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const arr = getSosmedLinks(dRef.current).filter((_: any, i: number) => i !== idx);
                                  set("sosmedLinks", arr.length ? arr : [""]);
                                }}
                                style={{ background: "none", border: "none", color: "#9C2B4E", fontWeight: 700, padding: "0 6px", cursor: "pointer" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reference Section */}
                  <div style={{background:"rgba(44,32,22,0.03)",border:"1px solid rgba(44,32,22,0.08)",borderRadius:16,padding:"16px 20px",marginBottom:0}}>
                    <div style={{...L,marginBottom:8}}><Paperclip size={14} /> {lang === "id" ? "Referensi Konten" : "Content Reference"}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div style={GRP}><label style={{...L,marginBottom:2}}>{lang === "id" ? "Catatan Referensi" : "Reference Notes"}</label><TextareaAutosize value={d.referenceText} onChange={(e:any)=>set("referenceText",e.target.value)} style={I({resize:"vertical"})} minRows={3} placeholder={lang === "id" ? "Referensi, mood, arahan visual..." : "Reference, mood, visual direction..."}/></div>
                      <div style={GRP}>
                        <label style={{...L,marginBottom:2}}>{lang === "id" ? "Link Referensi" : "Reference Links"} <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks",[...(dRef.current.referenceLinks||[]),""]); }} style={{background:"none",border:"none",color:"#3B82F6",cursor:"pointer",fontSize:10}}>{lang === "id" ? "(+ Tambah)" : "(+ Add)"}</button></label>
                        {(d.referenceLinks||[]).map((lnk:string,i:number)=>(
                          <div key={i} style={{display:"flex",gap:4,marginBottom:4}}>
                            <input value={lnk} onChange={(e:any)=>set("referenceLinks", dRef.current.referenceLinks.map((l:any,idx:number)=>idx===i?e.target.value:l))} style={I()} placeholder="https://..."/>
                            <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks", dRef.current.referenceLinks.filter((_:any,idx:number)=>idx!==i)); }} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer"}}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={GRP}>
                      <label style={{...L,marginBottom:2}}>{lang === "id" ? "Upload Gambar Referensi" : "Upload Reference Image"}</label>
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
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                      <FolderOpen size={14} /> Tautan Aset
                    </div>

                    {(() => {
                      const validAsset = getAssetLinks(d).filter((l: string) => l.trim() !== "");
                      const validSosmed = getSosmedLinks(d).filter((l: string) => l.trim() !== "");
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {/* Asset Links Section */}
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(44,32,22,0.5)", marginBottom: 6, textTransform: "uppercase" }}>
                              Link Aset ({validAsset.length})
                            </div>
                            {validAsset.length > 0 ? (
                              <div style={{ display: "grid", gridTemplateColumns: validAsset.length > 1 ? "1fr 1fr" : "1fr", gap: 8 }}>
                                {validAsset.map((lnk: string, idx: number) => {
                                  const hostLabel = getLinkHostLabel(lnk, "Aset");
                                  return (
                                    <a
                                      key={idx}
                                      href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        textDecoration: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        background: "rgba(59,130,246,0.04)",
                                        border: "1px solid rgba(59,130,246,0.15)",
                                        borderRadius: 12,
                                        padding: "10px 14px",
                                        transition: "all 0.2s",
                                        minWidth: 0
                                      }}
                                    >
                                      <span style={{ fontSize: 16, color: "#3B82F6", flexShrink: 0, display: "flex", alignItems: "center" }}><FolderOpen size={16} /></span>
                                      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                          {hostLabel} {validAsset.length > 1 ? `#${idx + 1}` : ""}
                                        </div>
                                        <div style={{ fontSize: 10, color: "rgba(44,32,22,0.5)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                          {lnk}
                                        </div>
                                      </div>
                                      <ExternalLink size={12} style={{ color: "#3B82F6", flexShrink: 0 }} />
                                    </a>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 10, padding: "10px 14px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                                <FolderOpen size={14} style={{ flexShrink: 0 }} /> Link aset belum ditautkan.
                              </div>
                            )}
                          </div>

                          {/* Sosmed Links Section */}
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(44,32,22,0.5)", marginBottom: 6, textTransform: "uppercase" }}>
                              Link Postingan ({validSosmed.length})
                            </div>
                            {validSosmed.length > 0 ? (
                              <div style={{ display: "grid", gridTemplateColumns: validSosmed.length > 1 ? "1fr 1fr" : "1fr", gap: 8 }}>
                                {validSosmed.map((lnk: string, idx: number) => {
                                  const hostLabel = getLinkHostLabel(lnk, "Sosmed");
                                  return (
                                    <a
                                      key={idx}
                                      href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        textDecoration: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        background: "rgba(37,99,235,0.04)",
                                        border: "1px solid rgba(37,99,235,0.15)",
                                        borderRadius: 12,
                                        padding: "10px 14px",
                                        transition: "all 0.2s",
                                        minWidth: 0
                                      }}
                                    >
                                      <span style={{ fontSize: 16, color: "#2563EB", flexShrink: 0, display: "flex", alignItems: "center" }}><ExternalLink size={16} /></span>
                                      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                          {hostLabel} {validSosmed.length > 1 ? `#${idx + 1}` : ""}
                                        </div>
                                        <div style={{ fontSize: 10, color: "rgba(37,99,235,0.6)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                          {lnk}
                                        </div>
                                      </div>
                                      <ExternalLink size={12} style={{ color: "#2563EB", flexShrink: 0 }} />
                                    </a>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 10, padding: "10px 14px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                                <ExternalLink size={14} style={{ flexShrink: 0 }} /> Belum live di sosmed.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
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
                              <Link size={12} style={{marginRight: 4}}/> {lang === "id" ? `Link Referensi ${idx + 1}` : `Reference Link ${idx + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                      {d.referenceImage && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(44,32,22,0.5)" }}>{lang === "id" ? "Moodboard Inspirasi:" : "Inspiration Moodboard:"}</span>
                          <img src={d.referenceImage} alt="moodboard" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.7)", objectFit: "contain" }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: "12px 16px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                      <Paperclip size={14} style={{ flexShrink: 0 }} /> {lang === "id" ? "Belum ada data referensi. Klik untuk menambahkan..." : "No reference data yet. Click to add..."}
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
                      <Plus size={14} /> {lang === "id" ? "Bidang Kustom" : "Custom Fields"}
                    </div>
                    <button onClick={(e)=>{ e.stopPropagation(); set("customFields",[...(d.customFields||[]),{name: lang === "id" ? "Label Baru" : "New Field",value:""}]); setEditingFieldRight("customField_"+((d.customFields?.length||0))); }} style={{fontSize:10,padding:"4px 10px", borderRadius: 8, background: "rgba(44,32,22,0.05)", border: "none", color: "#2C2016", fontWeight: 600, cursor: "pointer"}}>{lang === "id" ? "+ Tambah Field" : "+ Add Field"}</button>
                  </div>
                  {(d.customFields||[]).length === 0 ? (
                    <div style={{ fontSize: 11, color: "rgba(44,32,22,0.4)", textAlign: "center", padding: "10px 0" }}>{lang === "id" ? "Belum ada custom fields." : "No custom fields yet."}</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {(d.customFields||[]).map((cf:any, idx:number)=>(
                        <div key={idx} onClick={() => setEditingFieldRight("customField_"+idx)} style={{ background: "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10, position: "relative", cursor: "pointer" }}>
                          {editingFieldRight === "customField_"+idx ? (
                            <div ref={activeFieldRef} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <input autoFocus value={cf.name} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,name:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.5)", textTransform: "uppercase", width: "100%", padding: 0 }} placeholder={lang === "id" ? "Nama Field..." : "Field Name..."}/>
                                <button onClick={(e)=>{ e.stopPropagation(); set("customFields", d.customFields.filter((_:any,i:number)=>i!==idx)); setEditingFieldRight(null); }} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer", padding: "0 4px", fontSize: 14}}>✕</button>
                              </div>
                              <TextareaAutosize value={cf.value} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,value:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#2C2016", width: "100%", padding: 0, resize: "none" }} minRows={1} placeholder={lang === "id" ? "Isi field..." : "Field value..."}/>
                            </div>
                          ) : (
                            <>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.5)", textTransform: "uppercase", marginBottom: 4 }}>{cf.name || (lang === "id" ? `Kolom ${idx+1}` : `Field ${idx+1}`)}</div>
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
                    <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}><BarChart2 size={12} /> {lang === "id" ? "Laporan Statistik Performa" : "Performance Stats Report"}</span>
                    {d.metricsUpdatedAt && <span style={{ fontSize: 10, color: "rgba(44,32,22,0.4)" }}>{lang === "id" ? "Terakhir diupdate:" : "Last updated:"} {d.metricsUpdatedAt}</span>}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "rgba(59,130,246,0.03)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Leaf size={14} style={{marginRight: 4}} /> {lang === "id" ? "Jangkauan Organik" : "Organic Reach"}</div>
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
                          <span>{lang === "id" ? "Total Interaksi:" : "Total Engagements:"}</span>
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
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={14} style={{marginRight: 4}} /> {lang === "id" ? "Hasil Kampanye Berbayar" : "Paid Campaign Results"}</div>
                              <button onClick={(e)=>{ e.stopPropagation(); set("isAds",!d.isAds); }} style={{width:32,height:18,borderRadius:9,border:"none",cursor:"pointer",background:d.isAds?"#9C2B4E":"rgba(44,32,22,0.15)",transition:"background .2s",position:"relative",flexShrink:0}}>
                                <div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:2,left:d.isAds?16:2,transition:"left .2s"}}/>
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
                              {ADS_CATEGORIES.map(cat => (
                                <div key={cat.title}>
                                  <div style={{fontSize: 12, fontWeight: 800, color: "#9C2B4E", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(156,43,78,0.15)", paddingBottom: 4}}>{lang === "id" ? (cat.title === "Overview" ? "Ringkasan" : cat.title === "Engagement" ? "Interaksi" : cat.title === "Profile Activity" ? "Aktivitas Profil" : cat.title === "Details" ? "Detail Iklan" : cat.title) : cat.title}</div>
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
                              <span>{lang === "id" ? "Total Interaksi Iklan:" : "Total Ad Engagements:"}</span>
                              <strong style={{ color: "#9C2B4E" }}>{fmt(eng(d.adsMetrics || {}))}</strong>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.5 }}>
                            <DollarSign size={14} />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{lang === "id" ? "Tidak ada kampanye berbayar" : "No paid campaigns"}</span>
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
          )}

        </div>
        </div>

        <div style={{display:"flex", gap:10, justifyContent:"space-between", alignItems:"center", padding: "10px 20px", borderTop: "1px solid rgba(44,32,22,0.08)", background: "white", borderRadius: "0 0 24px 24px", zIndex: 10, flexShrink: 0}}>
          <div style={{display:"flex", gap:10, alignItems:"center"}}>
            {isSaving && (
              <span style={{ fontSize: 10, color: "#3B82F6", fontWeight: 700, display: "flex", alignItems: "center" }} className="animate-pulse">
                {lang === "id" ? "Menyimpan..." : "Saving..."}
              </span>
            )}
            {!isSaving && d.history && d.history.length > 0 && (
              <span onClick={() => setShowHistory(true)} style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#3B82F6"} onMouseLeave={(e) => e.currentTarget.style.color = "#9CA3AF"}>
                {lang === "id" ? "diedit terakhir oleh" : "last edited by"} {editorProfiles[d.history[0].editorId]?.fullName || editorProfiles[d.history[0].editorId]?.nickname || d.history[0].editorName} {lang === "id" ? "pada" : "at"} {new Date(d.history[0].timestamp).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" })}, {new Date(d.history[0].timestamp).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
          <div style={{display:"flex", gap:8}}>
            <Tooltip text={lang === "id" ? "Muat Ulang" : "Refresh"} position="top">
              <button onClick={handleRefresh} disabled={isRefreshing} className="hover-scale" style={{...B(false), background:"rgba(44,32,22,0.05)", border:"1.5px solid rgba(44,32,22,0.1)", color:"#2C2016", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center", opacity: isRefreshing ? 0.5 : 1, cursor: isRefreshing ? "not-allowed" : "pointer"}}>
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </Tooltip>
            {canEdit && onDuplicate && (
              <Tooltip text={lang === "id" ? "Duplikasi" : "Duplicate"} position="top"><button onClick={()=>onDuplicate(d)} className="hover-scale" style={{...B(false), background:"rgba(44,32,22,0.05)", border:"1.5px solid rgba(44,32,22,0.1)", color:"#2C2016", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><Copy size={14} /></button></Tooltip>
            )}
            {d.archived ? (
              canArchive && <Tooltip text={lang === "id" ? "Tampilkan Lagi" : "Restore"} position="top"><button onClick={()=>onRestore(d.id)} className="hover-scale" style={{...B(false), background:"#E8F5E9", border:"1.5px solid #2E7D32", color:"#2E7D32", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><RefreshCcw size={14} /></button></Tooltip>
            ) : (
              canArchive && <Tooltip text={lang === "id" ? "Arsipkan" : "Archive"} position="top"><button onClick={()=>onArchive(d.id)} className="hover-scale" style={{...B(false), background:"rgba(255, 255, 255, 0.85)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)", border:"1px solid rgba(0,0,0,0.1)", color:"#666", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><Archive size={14} /></button></Tooltip>
            )}
            {canDelete && <Tooltip text={lang === "id" ? "Hapus" : "Delete"} position="top"><button onClick={()=>onDelete(d.id, false, d.workspaceId || workspace?.id)} className="hover-scale" style={{...B(false), background:"#FDF5F8", border:"1.5px solid #9C2B4E", color:"#9C2B4E", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><Trash size={14} /></button></Tooltip>}
            
            {/* Dropdown Container for Sharing (Google Docs style) */}
            {canEdit && (
            <div ref={shareDropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={handleShareClick}
                className="hover-scale"
                style={{
                  ...B(false),
                  background: showShareDropdown ? "#2563eb" : "rgba(37, 99, 235, 0.08)",
                  border: "1px solid rgba(37, 99, 235, 0.2)",
                  color: showShareDropdown ? "#FFFFFF" : "#2563eb",
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <Send size={13} style={{ marginRight: 4 }} />
                Bagikan
              </button>

              <AnimatePresence>
                {showShareDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      right: 0,
                      marginBottom: 10,
                      width: 340,
                      background: "#FFFFFF",
                      borderRadius: 20,
                      boxShadow: "0 20px 45px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      padding: 20,
                      zIndex: 150,
                      textAlign: "left"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                      <Globe size={15} className="text-blue-600" /> Pengaturan Berbagi
                    </div>

                    {/* Segmented Tab Control */}
                    <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.04)", padding: 2, borderRadius: 8, marginBottom: 16 }}>
                      <button
                        type="button"
                        onClick={() => setShareTab("public")}
                        style={{
                          flex: 1,
                          padding: "6px 0",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: "none",
                          background: shareTab === "public" ? "#FFFFFF" : "transparent",
                          color: shareTab === "public" ? "#2563eb" : "#4b5563",
                          boxShadow: shareTab === "public" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        Tautan Publik
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareTab("users")}
                        style={{
                          flex: 1,
                          padding: "6px 0",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: "none",
                          background: shareTab === "users" ? "#FFFFFF" : "transparent",
                          color: shareTab === "users" ? "#2563eb" : "#4b5563",
                          boxShadow: shareTab === "users" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        Kirim ke Pengguna
                      </button>
                    </div>

                    {!d.id ? (
                      <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontStyle: "italic", lineHeight: 1.4 }}>
                        {lang === "id" ? "Simpan/ketik judul terlebih dahulu untuk mengonfigurasi pengaturan berbagi." : "Save/type title first to configure sharing settings."}
                      </div>
                    ) : shareTab === "public" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
                          <input
                            type="checkbox"
                            checked={!!d.isPublic}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              set("isPublic", isChecked);
                              if (!isChecked) {
                                set("allowComments", false);
                              }
                            }}
                            style={{ width: 15, height: 15, accentColor: "#2563eb", cursor: "pointer" }}
                          />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                            Aktifkan Link Publik
                          </span>
                        </label>

                        {d.isPublic && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 4 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                              <input
                                type="checkbox"
                                checked={d.allowComments !== false}
                                onChange={(e) => set("allowComments", e.target.checked)}
                                style={{ width: 14, height: 14, accentColor: "#2563eb", cursor: "pointer" }}
                              />
                              <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563" }}>
                                Izinkan Komentar Pengunjung
                              </span>
                            </label>

                            <div style={{ display: "flex", gap: 4, alignItems: "center", background: "rgba(0,0,0,0.03)", padding: "4px 8px", borderRadius: 8 }}>
                              <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  outline: "none",
                                  fontSize: 10,
                                  color: "#6b7280",
                                  width: "100%",
                                  fontFamily: "monospace"
                                }}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                            </div>

                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const shareUrl = `${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`;
                                  navigator.clipboard.writeText(shareUrl);
                                  setCopiedSharedLink(true);
                                  setTimeout(() => setCopiedSharedLink(false), 2000);
                                }}
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  background: "#2563eb",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "6px 8px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "background 0.2s"
                                }}
                              >
                                {copiedSharedLink ? (
                                  <>
                                    <Check size={12} /> Disalin!
                                  </>
                                ) : (
                                  <>
                                    <Link2 size={12} /> Salin Link
                                  </>
                                )}
                              </button>

                              <a
                                href={`${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  background: "rgba(0,0,0,0.04)",
                                  color: "#4b5563",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "6px 8px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  textDecoration: "none",
                                  cursor: "pointer",
                                  transition: "background 0.2s"
                                }}
                              >
                                <ExternalLink size={12} /> Buka
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {/* Search field for Hubify Users */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 6 }}>
                            Masukkan username atau email
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <div style={{ position: "relative", flex: 1 }}>
                              <Search size={12} style={{ position: "absolute", left: 10, top: 10, color: "rgba(0,0,0,0.3)" }} />
                              <input
                                type="text"
                                value={shareSearch}
                                onChange={(e) => setShareSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleShareSearch()}
                                placeholder="username atau email"
                                style={{
                                  width: "100%",
                                  background: "rgba(0,0,0,0.03)",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "6px 10px 6px 28px",
                                  fontSize: 12,
                                  outline: "none"
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleShareSearch}
                              disabled={shareSearchLoading || !shareSearch.trim()}
                              style={{
                                background: "#2563eb",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: 8,
                                padding: "0 12px",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                opacity: (!shareSearch.trim() || shareSearchLoading) ? 0.6 : 1
                              }}
                            >
                              {shareSearchLoading ? "..." : "Cari"}
                            </button>
                          </div>
                        </div>

                        {shareSearchError && (
                          <div style={{ fontSize: 11, color: "#e11d48", fontWeight: 500 }}>
                            {shareSearchError}
                          </div>
                        )}

                        {/* Search result user card */}
                        {shareSearchSuccess && (
                          <div style={{ background: "rgba(37, 99, 235, 0.04)", border: "1.5px dashed rgba(37, 99, 235, 0.2)", borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                {String(shareSearchSuccess.fullName || shareSearchSuccess.nickname || shareSearchSuccess.email || "?").charAt(0).toUpperCase()}
                              </div>
                              <div style={{ overflow: "hidden", flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {shareSearchSuccess.fullName || shareSearchSuccess.nickname || shareSearchSuccess.email}
                                </div>
                                <div style={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>
                                  @{shareSearchSuccess.username || "user"}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px dashed rgba(37, 99, 235, 0.15)", paddingTop: 6 }}>
                              <HubifyRoleSelect
                                value={selectedRoleForNewUser}
                                onChange={(role) => setSelectedRoleForNewUser(role)}
                                compact={true}
                                align="left"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddSharedUser(shareSearchSuccess)}
                                style={{
                                  background: "#2563eb",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: 6,
                                  padding: "4px 8px",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2
                                }}
                              >
                                <UserCheck size={10} /> Bagikan
                              </button>
                            </div>
                          </div>
                        )}

                        {/* List of currently shared users */}
                        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 10, marginTop: 4 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 8 }}>
                            Memiliki Akses Khusus ({(d.sharedUsers || []).length})
                          </div>
                          
                          {(!d.sharedUsers || d.sharedUsers.length === 0) ? (
                            <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
                              Belum ada pengguna Hubify Social yang ditambahkan.
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 140, overflowY: "auto", paddingRight: 2 }}>
                              {(d.sharedUsers || []).map((u: any) => (
                                <div key={u.uid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.02)", borderRadius: 8, padding: "6px 8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#4b5563", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
                                      {String(u.fullName || u.email || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ overflow: "hidden" }}>
                                      <div style={{ fontSize: 10, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {u.fullName || u.email}
                                      </div>
                                      {u.username && (
                                        <div style={{ fontSize: 8, color: "rgba(0,0,0,0.4)", marginTop: -2 }}>
                                          @{u.username}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    {canManageShare ? (
                                      <HubifyRoleSelect
                                        value={(u.role || "viewer") as any}
                                        onChange={(role) => handleUpdateSharedUserRole(u.uid, role)}
                                        compact={true}
                                        align="right"
                                      />
                                    ) : (
                                      <span style={{
                                        fontSize: 9,
                                        fontWeight: 700,
                                        padding: "2px 6px",
                                        borderRadius: 10,
                                        background: u.role === "editor" ? "#eff6ff" : u.role === "commenter" ? "#fefce8" : "rgba(0,0,0,0.04)",
                                        color: u.role === "editor" ? "#2563eb" : u.role === "commenter" ? "#ca8a04" : "#374151"
                                      }}>
                                        {u.role === "editor" ? "Editor" : u.role === "commenter" ? "Komentator" : "Pelihat"}
                                      </span>
                                    )}

                                    {canManageShare && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSharedUser(u.uid)}
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "#e11d48",
                                          cursor: "pointer",
                                          padding: 2,
                                          display: "flex",
                                          alignItems: "center",
                                          opacity: 0.7
                                        }}
                                        title="Hapus Akses"
                                        onMouseOver={(e: any) => e.currentTarget.style.opacity = 1}
                                        onMouseOut={(e: any) => e.currentTarget.style.opacity = 0.7}
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            {canEdit ? (
              <button onClick={async () => {
                isDirty.current = false;
                const newD = { ...dRef.current, manuallySaved: true };
                setD(newD);
                dRef.current = newD;
                await onSave(newD, true);
                onClose();
              }} className="hover-scale" style={{...B(false), background:"#3B82F6", border:"none", color:"white", padding:"5px 14px", fontSize:12, fontWeight:700}}>{lang === "id" ? "Simpan" : "Save"}</button>
            ) : (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 8,
                background: userRole === "commenter" ? "#FEFCE8" : "rgba(0,0,0,0.04)",
                color: userRole === "commenter" ? "#CA8A04" : "#4B5563",
                border: userRole === "commenter" ? "1px solid #FEF08A" : "1px solid rgba(0,0,0,0.06)"
              }}>
                {userRole === "commenter" ? "Komentator" : "Pelihat (Read-Only)"}
              </span>
            )}
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

      {/* History Modal Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding: 16}} onClick={()=>setShowHistory(false)}>
            <motion.div initial={{scale:0.95, y: 20}} animate={{scale:1, y: 0}} exit={{scale:0.95, y: 20}} style={{background:"#FFFFFF",padding:"24px 32px",borderRadius:24,maxWidth:480,width:"100%",boxShadow:"0 20px 40px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column",maxHeight:"80vh"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20}}>
                <h3 style={{margin:0, fontSize:20, color:"#111827", fontWeight:800, display: "flex", alignItems: "center", gap: 8}}>
                  <History size={20} color="var(--theme-primary)" />
                  {lang === "id" ? "Riwayat Perubahan" : "Edit History"}
                </h3>
                <button onClick={()=>setShowHistory(false)} style={{background:"rgba(0,0,0,0.05)", border:"none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4B5563"}}><X size={16} /></button>
              </div>
              <div style={{flex:1, overflowY:"auto", paddingRight: 8, display:"flex", flexDirection:"column", gap:16}}>
                {!d.history || d.history.length === 0 ? (
                  <div style={{textAlign:"center", padding: "40px 0", color: "#6B7280", fontSize: 14}}>
                    {lang === "id" ? "Belum ada riwayat perubahan." : "No edit history yet."}
                  </div>
                ) : (
                  d.history.map((h: any, i: number) => {
                    const prof = editorProfiles[h.editorId] || {};
                    const name = prof.fullName || prof.nickname || h.editorName;
                    const avatar = prof.avatar || prof.photoURL || h.editorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
                    return (
                    <div key={i} style={{display:"flex", gap:12, paddingBottom: 16, borderBottom: i === d.history.length - 1 ? "none" : "1px solid #F3F4F6"}}>
                      <img src={avatar} style={{width: 36, height: 36, borderRadius: "50%", objectFit:"cover"}} />
                      <div style={{flex:1}}>
                        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 4}}>
                          <span style={{fontWeight:700, fontSize: 14, color: "#111827"}}>{name}</span>
                          <span style={{fontSize: 12, color: "#9CA3AF"}}>{new Date(h.timestamp).toLocaleString(lang === "id" ? "id-ID" : "en-US", {dateStyle:"medium", timeStyle:"short"})}</span>
                        </div>
                        {h.action === "created" ? (
                          <div style={{fontSize: 13, color: "#4B5563"}}>{lang === "id" ? "Membuat konten ini." : "Created this content."}</div>
                        ) : (
                          <div style={{fontSize: 13, color: "#4B5563"}}>
                            <div style={{marginBottom: 8}}>{lang === "id" ? "Telah melakukan perubahan:" : "Made changes:"}</div>
                            <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                               {h.changes?.map((ch: any, idx: number) => (
                                 <HistoryChangeItem key={idx} ch={ch} lang={lang} />
                               ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )})
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

