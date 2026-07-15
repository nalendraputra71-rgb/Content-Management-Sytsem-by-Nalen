import { useState, useRef, useEffect } from "react";
import { auth, callAiWithQuota, db } from "./firebase";
import { doc, updateDoc, onSnapshot, collection, query, where, getDocs, limit } from "firebase/firestore";
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
  Layout
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

export function ContentModal({modal, workspace, onSave,onClose,onArchive,onRestore,onDelete,onDuplicate,pillars,platforms,contentTypes,pics,statuses,onSettingUpdate}: any) {
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

  // Inline comment states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showResolvedInSection, setShowResolvedInSection] = useState<Record<string, boolean>>({});

  // Real-time snapshot listener for editor's comments sync
  useEffect(() => {
    if (!d.id || !d.workspaceId) return;
    const docRef = doc(db, "workspaces", d.workspaceId, "content", d.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
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
    }, (err) => {
      console.error("Error listening to real-time comments:", err);
    });
    return () => unsubscribe();
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

  const renderSectionCommentBadge = (sectionKey: string) => {
    const commentsList = d.comments || [];
    const count = commentsList.filter((c: any) => c.sectionId === sectionKey && !c.resolved).length;
    if (count === 0) return null;
    const isOpen = !!openSections[sectionKey];

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
        }}
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "10px",
          fontSize: "10px",
          fontWeight: 800,
          border: count > 0 ? "1px solid rgba(217, 119, 6, 0.3)" : "1px solid rgba(0, 0, 0, 0.05)",
          background: count > 0 ? "#FFFBEB" : isOpen ? "#EFF6FF" : "rgba(0,0,0,0.02)",
          color: count > 0 ? "#D97706" : isOpen ? "#2563EB" : "#9CA3AF",
          cursor: "pointer",
          textTransform: "uppercase",
          transition: "all 0.2s"
        }}
        title={`${count} komentar aktif.`}
      >
        <MessageSquare size={11} />
        <span>{count > 0 ? `${count} Komen` : "Komen"}</span>
      </button>
    );
  };

  const renderInlineCommentThread = (sectionKey: string) => {
    const commentsList = d.comments || [];
    const sectionComments = commentsList.filter((c: any) => c.sectionId === sectionKey);
    if (sectionComments.length === 0) return null;
    const unresolvedComments = sectionComments.filter((c: any) => !c.resolved);
    const resolvedComments = sectionComments.filter((c: any) => c.resolved);
    const isOpen = !!openSections[sectionKey];
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
                          </div>
                          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, textDecoration: "line-through", whiteSpace: "pre-wrap" }}>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reply field */}
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
      }
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [copiedBrief, setCopiedBrief] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedSharedLink, setCopiedSharedLink] = useState(false);
  const [shareTab, setShareTab] = useState<"public" | "users">("public");
  const [shareSearch, setShareSearch] = useState("");
  const [shareSearchLoading, setShareSearchLoading] = useState(false);
  const [shareSearchError, setShareSearchError] = useState("");
  const [shareSearchSuccess, setShareSearchSuccess] = useState<any>(null);
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

  const handleAddSharedUser = (userToShare: any) => {
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
      fullName: userToShare.fullName || userToShare.nickname || ""
    };

    const nextShared = [...currentShared, newUser];
    const nextSharedUids = nextShared.map((u: any) => u.uid);

    const next = { 
      ...dRef.current, 
      sharedUsers: nextShared,
      sharedUids: nextSharedUids,
      ownerEmail: auth.currentUser?.email || "",
      ownerName: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || ""
    };
    dRef.current = next;
    setD(next);
    setShareSearch("");
    setShareSearchSuccess(null);
  };

  const handleRemoveSharedUser = (uid: string) => {
    isDirty.current = true;
    const currentShared = d.sharedUsers || [];
    const nextShared = currentShared.filter((u: any) => u.uid !== uid);
    const nextSharedUids = nextShared.map((u: any) => u.uid);

    const next = { 
      ...dRef.current, 
      sharedUsers: nextShared,
      sharedUids: nextSharedUids
    };
    dRef.current = next;
    setD(next);
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
        await onSave(updatedD, false);
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
          await onSave(updatedD, false);
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
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -10 }}
        style={{
          background: "linear-gradient(135deg, #FCFAF7 0%, #F5EFEB 100%)",
          border: "1.5px solid rgba(166, 124, 28, 0.2)",
          borderRadius: 20,
          padding: "24px",
          marginBottom: 20,
          boxShadow: "0 10px 25px -5px rgba(166, 124, 28, 0.05), inset 0 2px 4px rgba(255,255,255,0.8)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(166, 124, 28, 0.1)", p: 2, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 }}>
              <Settings size={18} style={{ color: "#A67C1C" }} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#2C2016" }}>Desainer Tata Letak Brief</h4>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(44,32,22,0.5)" }}>Aktifkan kolom-kolom yang Anda perlukan dan atur urutannya secara instan.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLayoutConfig(false)}
            style={{ background: "rgba(0,0,0,0.04)", border: "none", color: "#2C2016", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", transition: "all 0.2s" }}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.08)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
          >
            <X size={14} />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "rgba(255,255,255,0.45)", border: "1px solid rgba(44,32,22,0.06)", padding: "12px 14px", borderRadius: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(44,32,22,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pilih Preset Cepat:</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => applyPreset("sederhana")}
              style={{ flex: 1, padding: "6px 10px", background: "#FFFFFF", border: "1px solid rgba(44,32,22,0.08)", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#2C2016", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, transition: "all 0.15s" }}
              onMouseOver={(e: any) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseOut={(e: any) => e.currentTarget.style.transform = "translateY(0)"}
            >
              🌱 Sederhana
            </button>
            <button
              onClick={() => applyPreset("standar")}
              style={{ flex: 1, padding: "6px 10px", background: "#FFFFFF", border: "1px solid rgba(44,32,22,0.08)", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#2C2016", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, transition: "all 0.15s" }}
              onMouseOver={(e: any) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseOut={(e: any) => e.currentTarget.style.transform = "translateY(0)"}
            >
              ⭐️ Standar
            </button>
            <button
              onClick={() => applyPreset("lengkap")}
              style={{ flex: 1, padding: "6px 10px", background: "#FFFFFF", border: "1px solid rgba(44,32,22,0.08)", borderRadius: 8, fontSize: 11, fontWeight: 700, color: "#2C2016", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, transition: "all 0.15s" }}
              onMouseOver={(e: any) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseOut={(e: any) => e.currentTarget.style.transform = "translateY(0)"}
            >
              🔥 Lengkap
            </button>
          </div>
        </div>

        {/* List of fields (Animated) */}
        <motion.div layout style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
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
                  background: isFieldVisible ? "#ffffff" : "rgba(255,255,255,0.4)",
                  padding: "10px 14px",
                  borderRadius: 12,
                  borderTop: isFieldVisible ? "1.5px solid #E2E8F0" : "1.5px solid rgba(44, 32, 22, 0.05)",
                  borderRight: isFieldVisible ? "1.5px solid #E2E8F0" : "1.5px solid rgba(44, 32, 22, 0.05)",
                  borderBottom: isFieldVisible ? "1.5px solid #E2E8F0" : "1.5px solid rgba(44, 32, 22, 0.05)",
                  borderLeft: isFieldVisible ? "4px solid #3B82F6" : "4px solid #CBD5E1",
                  boxShadow: isFieldVisible ? "0 4px 12px -2px rgba(0,0,0,0.03)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {/* Left side: Toggle + Icon + Label */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Custom iOS Toggle Switch */}
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
                      width: 38,
                      height: 20,
                      borderRadius: 10,
                      background: isFieldVisible ? "#3B82F6" : "#E2E8F0",
                      position: "relative",
                      transition: "background-color 0.2s"
                    }}>
                      <div style={{
                        width: 14,
                        height: 14,
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

                  {/* Field Icon and Label */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: isFieldVisible ? "#3B82F6" : "rgba(44,32,22,0.3)", display: "flex", alignItems: "center" }}>
                      {getFieldIcon(field.icon, 14)}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isFieldVisible ? "#2C2016" : "rgba(44,32,22,0.4)" }}>
                      {field.label}
                    </span>
                    {/* Status Badge */}
                    <span style={{
                      fontSize: 9,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: 6,
                      background: isFieldVisible ? "rgba(16, 185, 129, 0.1)" : "rgba(0,0,0,0.04)",
                      color: isFieldVisible ? "#10B981" : "rgba(0,0,0,0.4)"
                    }}>
                      {isFieldVisible ? "Aktif" : "Sembunyi"}
                    </span>
                  </div>
                </div>

                {/* Right side: Reorder Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ marginRight: 6, display: "flex", alignItems: "center" }}>
                    {/* Tiny inline custom SVG grip icon */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.25, color: "#2C2016" }}>
                      <circle cx="9" cy="5" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="9" cy="19" r="1.5" />
                      <circle cx="15" cy="5" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="15" cy="19" r="1.5" />
                    </svg>
                  </div>

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
                      background: idx === 0 ? "rgba(0,0,0,0.01)" : "#FFFFFF",
                      border: "1px solid rgba(44, 32, 22, 0.08)",
                      borderRadius: 8,
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: idx === 0 ? "default" : "pointer",
                      color: idx === 0 ? "rgba(0,0,0,0.15)" : "#2C2016",
                      boxShadow: idx === 0 ? "none" : "0 2px 4px rgba(0,0,0,0.02)",
                      transition: "all 0.1s"
                    }}
                    onMouseOver={(e: any) => { if (idx !== 0) e.currentTarget.style.background = "#F1F5F9"; }}
                    onMouseOut={(e: any) => { if (idx !== 0) e.currentTarget.style.background = "#FFFFFF"; }}
                  >
                    <ArrowUp size={13} />
                  </button>

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
                      background: idx === layoutFields.length - 1 ? "rgba(0,0,0,0.01)" : "#FFFFFF",
                      border: "1px solid rgba(44, 32, 22, 0.08)",
                      borderRadius: 8,
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: idx === layoutFields.length - 1 ? "default" : "pointer",
                      color: idx === layoutFields.length - 1 ? "rgba(0,0,0,0.15)" : "#2C2016",
                      boxShadow: idx === layoutFields.length - 1 ? "none" : "0 2px 4px rgba(0,0,0,0.02)",
                      transition: "all 0.1s"
                    }}
                    onMouseOver={(e: any) => { if (idx !== layoutFields.length - 1) e.currentTarget.style.background = "#F1F5F9"; }}
                    onMouseOut={(e: any) => { if (idx !== layoutFields.length - 1) e.currentTarget.style.background = "#FFFFFF"; }}
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Target scope chooser */}
        <div style={{ background: "rgba(44, 32, 22, 0.03)", padding: 14, borderRadius: 16, marginBottom: 20, border: "1px solid rgba(44,32,22,0.02)" }}>
          <label style={{ fontSize: 10, fontWeight: 800, color: "rgba(44,32,22,0.5)", textTransform: "uppercase", display: "block", marginBottom: 8, letterSpacing: "0.5px" }}>
            Cakupan Penyimpanan Pengaturan:
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setLayoutScope("local")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 10,
                border: `1.5px solid ${layoutScope === "local" ? "#3B82F6" : "rgba(44,32,22,0.08)"}`,
                background: layoutScope === "local" ? "rgba(59,130,246,0.08)" : "#ffffff",
                color: layoutScope === "local" ? "#3B82F6" : "rgba(44,32,22,0.6)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "center",
                boxShadow: layoutScope === "local" ? "0 4px 12px -2px rgba(59,130,246,0.15)" : "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s"
              }}
            >
              📌 Hanya Brief Ini
            </button>
            <button
              onClick={() => setLayoutScope("global")}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 10,
                border: `1.5px solid ${layoutScope === "global" ? "#3B82F6" : "rgba(44,32,22,0.08)"}`,
                background: layoutScope === "global" ? "rgba(59,130,246,0.08)" : "#ffffff",
                color: layoutScope === "global" ? "#3B82F6" : "rgba(44,32,22,0.6)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "center",
                boxShadow: layoutScope === "global" ? "0 4px 12px -2px rgba(59,130,246,0.15)" : "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s"
              }}
            >
              🌐 Semua Brief di Workspace
            </button>
          </div>
        </div>

        {/* Save configuration button */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
              color: "rgba(44,32,22,0.6)",
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: 8,
              transition: "all 0.2s"
            }}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "transparent"}
          >
            Batal
          </button>
          <button
            onClick={() => saveLayoutSettings(layoutFields, layoutScope)}
            style={{
              background: "#3B82F6",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "8px 20px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
              transition: "all 0.2s"
            }}
            onMouseOver={(e: any) => {
              e.currentTarget.style.background = "#2563EB";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e: any) => {
              e.currentTarget.style.background = "#3B82F6";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Simpan Tata Letak
          </button>
        </div>
      </motion.div>
    );
  };

  const renderDynamicField = (field: any) => {
    const { id, label, icon, placeholder, minRows = 3 } = field;
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
        <div key={id} ref={activeFieldRef} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
              {getFieldIcon(icon, 14)} {label}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {renderAiButton()}
              {renderSectionCommentBadge(id)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", minHeight: id === "briefCopywriting" ? 120 : id === "caption" ? 150 : 80 }}>
            <RichTextEditor 
              style={{ width: "100%" }} 
              inputRef={id === "briefCopywriting" ? briefRef : id === "caption" ? captionRef : id === "objective" ? objectiveRef : undefined} 
              value={fieldValue} 
              onChange={(val) => set(id, val)} 
              minRows={id === "briefCopywriting" ? 6 : id === "caption" ? 8 : minRows} 
              placeholder={placeholder} 
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
          style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", cursor: "pointer", display: "flex", flexDirection: "column" }}
          title={`Klik untuk mengedit ${label}`}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.5px" }}>
              {getFieldIcon(icon, 14)} {label}
              {renderSectionCommentBadge(id)}
            </span>
            {fieldValue && (
              <button 
                onClick={handleCopy} 
                style={{ background: isCopied ? "rgba(46,125,50,0.1)" : "rgba(59,130,246,0.08)", border: "none", color: isCopied ? "#2E7D32" : "#3B82F6", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 750, cursor: isCopied ? "default" : "pointer", display: "flex", alignItems: "center", transition: "all 0.3s ease" }}
              >
                {isCopied ? <>Berhasil disalin</> : <><Copy size={12} style={{marginRight: 4}} /> Salin {label}</>}
              </button>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, background: id === "briefCopywriting" ? "#FCFAF7" : id === "caption" ? "#FAFDFB" : "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(44, 32, 22, 0.03)" }}>
            {fieldValue ? <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: fieldValue }} /> : <span style={{ color: "rgba(44,32,22,0.4)", fontStyle: "italic" }}>Belum ada {label.toLowerCase()}. Klik di sini untuk mengedit.</span>}
          </div>
          {renderInlineCommentThread(id)}
        </div>
      );
    }
  };

  const generateCaption = async () => {
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
        
        const data = await callAiWithQuota(auth.currentUser?.uid || 'anon', undefined, { prompt, model: "gemini-2.0-flash" });
        set("caption", (data.text || "").trim());
        showToast("Caption berhasil dibuat oleh Gemini!", "success");
    } catch (e: any) {
        console.error("AI Error:", e);
        const errMsg = e.message || "";
        if (errMsg.includes("habis")) {
          showToast(errMsg, "error");
        } else if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
          showToast("Gagal menggenerate caption: Terlalu banyak permintaan AI. Silakan tunggu sekitar 30 detik lalu coba lagi.", "error");
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
  const canArchive = !d.archived && !isNew;
  const canDelete = !isNew;

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
        zIndex:300,
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
          borderTop: layoutMode === "drawer" ? "none" : "1px solid rgba(0,0,0,0.08)",
          borderRight: layoutMode === "drawer" ? "none" : "1px solid rgba(0,0,0,0.08)",
          borderBottom: layoutMode === "drawer" ? "none" : "1px solid rgba(0,0,0,0.08)",
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
                      Panduan & Salinan Konten
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
                      {showLayoutConfig ? "Tutup Pengaturan" : "Atur Kolom"}
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
          )}

        </div>
        </div>

        <div style={{display:"flex", gap:10, justifyContent:"space-between", alignItems:"center", padding: "10px 20px", borderTop: "1px solid rgba(44,32,22,0.08)", background: "white", borderRadius: "0 0 24px 24px", zIndex: 10, flexShrink: 0}}>
          <div style={{display:"flex", gap:10, alignItems:"center"}}>
            {isSaving && (
              <span style={{ fontSize: 10, color: "#3B82F6", fontWeight: 700, display: "flex", alignItems: "center" }} className="animate-pulse">
                Menyimpan...
              </span>
            )}
          </div>
          <div style={{display:"flex", gap:8}}>
            {onDuplicate && (
              <button onClick={()=>onDuplicate(d)} title="Duplikasi" className="hover-scale" style={{...B(false), background:"rgba(44,32,22,0.05)", border:"1.5px solid rgba(44,32,22,0.1)", color:"#2C2016", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><Copy size={14} /></button>
            )}
            {d.archived ? (
              <button onClick={()=>onRestore(d.id)} title="Tampilkan Lagi" className="hover-scale" style={{...B(false), background:"#E8F5E9", border:"1.5px solid #2E7D32", color:"#2E7D32", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><RefreshCcw size={14} /></button>
            ) : (
              canArchive && <button onClick={()=>onArchive(d.id)} title="Arsipkan" className="hover-scale" style={{...B(false), background:"rgba(255, 255, 255, 0.85)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)", border:"1px solid rgba(0,0,0,0.1)", color:"#666", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><Archive size={14} /></button>
            )}
            {canDelete && <button onClick={()=>onDelete(d.id)} title="Hapus" className="hover-scale" style={{...B(false), background:"#FDF5F8", border:"1.5px solid #9C2B4E", color:"#9C2B4E", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><Trash size={14} /></button>}
            
            {/* Dropdown Container for Sharing (Google Docs style) */}
            <div ref={shareDropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowShareDropdown(!showShareDropdown)}
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
                        Simpan/ketik judul terlebih dahulu untuk mengonfigurasi pengaturan berbagi.
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
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none", marginBottom: 4 }}>
                              <input
                                type="checkbox"
                                checked={!!d.allowComments}
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
                                value={`${window.location.origin}/#/shared-brief/${d.workspaceId}/${d.id}`}
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
                                  const shareUrl = `${window.location.origin}/#/shared-brief/${d.workspaceId}/${d.id}`;
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
                                href={`${window.location.origin}/#/shared-brief/${d.workspaceId}/${d.id}`}
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
                          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", marginBottom: 6 }}>
                            Masukkan Username atau Email
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <div style={{ position: "relative", flex: 1 }}>
                              <Search size={12} style={{ position: "absolute", left: 10, top: 10, color: "rgba(0,0,0,0.3)" }} />
                              <input
                                type="text"
                                value={shareSearch}
                                onChange={(e) => setShareSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleShareSearch()}
                                placeholder="nama_pengguna atau user@email.com"
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
                          <div style={{ background: "rgba(37, 99, 235, 0.04)", border: "1.5px dashed rgba(37, 99, 235, 0.2)", borderRadius: 12, padding: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                {String(shareSearchSuccess.fullName || shareSearchSuccess.nickname || shareSearchSuccess.email || "?").charAt(0).toUpperCase()}
                              </div>
                              <div style={{ overflow: "hidden" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {shareSearchSuccess.fullName || shareSearchSuccess.nickname || shareSearchSuccess.email}
                                </div>
                                <div style={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>
                                  @{shareSearchSuccess.username || "user"}
                                </div>
                              </div>
                            </div>
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
                        )}

                        {/* List of currently shared users */}
                        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 10, marginTop: 4 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", marginBottom: 8 }}>
                            Memiliki Akses Khusus ({(d.sharedUsers || []).length})
                          </div>
                          
                          {(!d.sharedUsers || d.sharedUsers.length === 0) ? (
                            <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
                              Belum ada pengguna Hubify Social yang ditambahkan.
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 110, overflowY: "auto", paddingRight: 2 }}>
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
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Helper instructions */}
                        <div style={{ fontSize: 9, color: "rgba(0,0,0,0.4)", lineHeight: 1.3, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 8 }}>
                          💡 Pengguna yang terdaftar di Hubify Social di atas akan dapat mengakses & memberikan komentar pada brief ini via link khusus.
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={async () => {
              isDirty.current = false;
              const newD = { ...dRef.current, manuallySaved: true };
              setD(newD);
              dRef.current = newD;
              await onSave(newD, true);
              onClose();
            }} className="hover-scale" style={{...B(false), background:"#3B82F6", border:"none", color:"white", padding:"5px 14px", fontSize:12, fontWeight:700}}>Simpan</button>
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

