import { PlatformPreview } from "./components/PlatformPreview";
import { db, callAiWithQuota, handleFirestoreError, collection, onSnapshot, addDoc, serverTimestamp, setDoc, doc, updateDoc, deleteDoc } from "./firebase";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CopyPlus,
  MessageSquare,
  Clock,
  MessageCircle,
  BarChart3,
  Bell,
  CheckSquare,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Link2,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Send,
  Edit3,
  Sparkles,
  ChevronDown,
  Shield,
  User,
  Search,
  Activity,
  PieChart,
  Users,
  X,
  PlayCircle,
  Globe,
  Layout,
  AlignLeft,
  MapPin,
  Download,
  ChevronRight,
  ChevronLeft,
  Calendar as CalIcon,
  Settings,
  Book,
  Copy,
  Check,
  List,
  Trash2,
  Plus,
  Star,
  Paperclip,
  Mic,
  MoreHorizontal,
  Share,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  FileText,
  Pin,
  Edit,
  Edit2,
  Lightbulb,
  Heart,
  Upload,
  AlertTriangle,
  Info,
  Video,
  AtSign,
  Music,
} from "lucide-react";
import Markdown from "react-markdown";
import { PlatformIntegrationModal } from "./PlatformIntegrationModal";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

function SimulatedStreamMarkdown({
  content,
  onComplete,
  scrollContainerRef,
}: {
  content: string;
  onComplete?: () => void;
  scrollContainerRef?: any;
}) {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedContent("");
    const interval = setInterval(() => {
      const chunk = Math.max(1, Math.floor(content.length / 60));
      i += chunk + Math.floor(Math.random() * 5);
      if (i >= content.length) {
        i = content.length;
        setDisplayedContent(content.substring(0, i));
        clearInterval(interval);
        onComplete && onComplete();
      } else {
        setDisplayedContent(content.substring(0, i) + " █");
      }
      if (scrollContainerRef?.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }
    }, 30);
    return () => clearInterval(interval);
  }, [content, scrollContainerRef]); // omit onComplete from deps to avoid re-trigger if bound dynamically

  return <Markdown>{displayedContent}</Markdown>;
}

function getPlatformIcon(platformIdentifier: string, size = 16) {
  const name = String(platformIdentifier || "").trim().toLowerCase();
  if (name.includes("instagram") || name === "ig") {
    return <Instagram size={size} color="#E1306C" />;
  }
  if (name.includes("tiktok") || name === "tt") {
    return <Music size={size} color="#000000" />;
  }
  if (name.includes("facebook") || name === "fb" || name === "meta") {
    return <Facebook size={size} color="#1877F2" />;
  }
  if (name.includes("threads")) {
    return <AtSign size={size} color="#111111" />;
  }
  if (name === "x" || name.includes("twitter")) {
    return <span style={{ fontWeight: 900, fontSize: size, fontFamily: "sans-serif", color: "#111111", display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, lineHeight: 1 }}>𝕏</span>;
  }
  if (name.includes("linkedin")) {
    return <Linkedin size={size} color="#0077B5" />;
  }
  if (name.includes("youtube") || name === "yt") {
    return <Youtube size={size} color="#FF0000" />;
  }
  if (name.includes("semua") || name === "all" || name.includes("globe")) {
    return <Globe size={size} color="#888888" />;
  }
  return <Globe size={size} color="#2D5A86" />;
}

function CustomDropdown({
  value,
  options,
  onChange,
  renderOption,
  pill = true,
}: {
  value: string;
  options: any[];
  onChange: (val: string) => void;
  renderOption?: (o: any) => React.ReactNode;
  pill?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find(
    (o) => (typeof o === "string" ? o : o.id) === value,
  );
  const displayLabel = activeOption
    ? typeof activeOption === "string"
      ? activeOption
      : activeOption.label || activeOption.name
    : value;

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 160 }}>
      <button
        onClick={() => setOpen(!open)}
        className="hover-scale"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: pill ? "10px 20px" : "10px 16px",
          borderRadius: pill ? "9999px" : "12px",
          border: "1px solid rgba(44,32,22,0.1)",
          background: "white",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          color: "#2C2016",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {getPlatformIcon(displayLabel) ? (
            <span style={{ display: "flex", alignItems: "center" }}>
              {getPlatformIcon(displayLabel, 16)}
            </span>
          ) : getPlatformIcon(value) ? (
            <span style={{ display: "flex", alignItems: "center" }}>
              {getPlatformIcon(value, 16)}
            </span>
          ) : activeOption && typeof activeOption !== "string" && activeOption.icon ? (
            <span style={{ display: "flex", alignItems: "center", color: activeOption.color || "inherit" }}>
              {React.isValidElement(activeOption.icon)
                ? React.cloneElement(activeOption.icon as any, { size: 16 })
                : activeOption.icon}
            </span>
          ) : null}
          <span>{displayLabel}</span>
        </div>
        <ChevronDown
          size={16}
          color="rgba(44,32,22,0.4)"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "all 0.2s",
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 8,
              background: "white",
              border: "1px solid rgba(44,32,22,0.1)",
              borderRadius: 12,
              padding: 8,
              zIndex: 100,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {options.map((o, i) => {
              const val = typeof o === "string" ? o : o.id;
              const isSelected = val === value;
              return (
                <div
                  key={i}
                  onClick={() => {
                    onChange(val);
                    setOpen(false);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isSelected ? 800 : 600,
                    cursor: "pointer",
                    background: isSelected
                      ? "var(--theme-primary)22"
                      : "transparent",
                    color: isSelected ? "var(--theme-primary)" : "#2C2016",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "#FAFAFA";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {renderOption
                    ? renderOption(o)
                    : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {getPlatformIcon(typeof o === "string" ? o : o.label || o.name || o.id) ? (
                          <span style={{ display: "flex", alignItems: "center" }}>
                            {getPlatformIcon(typeof o === "string" ? o : o.label || o.name || o.id, 16)}
                          </span>
                        ) : (typeof o !== "string" && o.icon) ? (
                          <span style={{ display: "flex", alignItems: "center", color: o.color || "inherit" }}>
                            {React.isValidElement(o.icon)
                              ? React.cloneElement(o.icon as any, { size: 16 })
                              : o.icon}
                          </span>
                        ) : null}
                        <span>{typeof o === "string" ? o : o.label || o.name}</span>
                      </div>
                    )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DASHBOARD_TIME_RANGES = [
  "7 Hari Terakhir",
  "30 Hari Terakhir",
  "Bulan Ini",
  "Tahun Ini",
  "Custom...",
];
const ANALYTICS_METRICS = [
  { id: "all", label: "Semua Metrik (Bandingkan)" },
  { id: "er", label: "Total ER" },
  { id: "views", label: "Views" },
  { id: "reach", label: "Reach" },
  { id: "likes", label: "Likes" },
  { id: "comments", label: "Komentar" },
  { id: "shares", label: "Share" },
  { id: "reposts", label: "Repost" },
  { id: "saves", label: "Save" },
];

const PLATFORMS = [
  {
    id: "all",
    name: "Semua Platform",
    icon: <Globe size={18} />,
    color: "#888",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram size={18} />,
    color: "#E4405F",
    contentTypes: [
      { id: "feed", label: "Post (Image/Carousel)" },
      { id: "reel", label: "Reels" },
      { id: "story", label: "Story" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: <Music size={18} />,
    color: "#000000",
    contentTypes: [
      { id: "video", label: "Video" },
      { id: "photo_carousel", label: "Photo Carousel" },
    ],
  },
  {
    id: "meta",
    name: "Facebook",
    icon: <Facebook size={18} />,
    color: "#1877F2",
    contentTypes: [
      { id: "feed", label: "Post" },
      { id: "reel", label: "Reels" },
      { id: "story", label: "Story" },
    ],
  },
  {
    id: "threads",
    name: "Threads",
    icon: <AtSign size={18} />,
    color: "#000000",
    contentTypes: [{ id: "thread", label: "Thread" }],
  },
  {
    id: "x",
    name: "X",
    icon: <span style={{ fontWeight: 900, fontSize: 15, fontFamily: "sans-serif" }}>𝕏</span>,
    color: "#000000",
    contentTypes: [
      { id: "post", label: "Post" },
      { id: "thread", label: "Thread" },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: <Linkedin size={18} />,
    color: "#0A66C2",
    contentTypes: [
      { id: "post", label: "Post" },
      { id: "article", label: "Article" },
    ],
  },
];

export function SocialStudioView({
  tab,
  workspaceId,
  content = [],
  workspace,
  user,
  profile,
  onOpenModal,
}: {
  tab: string;
  workspaceId?: string;
  content?: any[];
  workspace?: any;
  user?: any;
  profile?: any;
  onOpenModal?: (data: any) => void;
}) {
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [rawSelectedInboxMsg, setRawSelectedInboxMsg] = useState<any>(null);
  const [msgContent, setMsgContent] = useState("");
  const [inboxFilter, setInboxFilter] = useState("all");
  const [inboxViewMode, setInboxViewMode] = useState<"dms" | "comments">("dms");
  const [rawSelectedComment, setRawSelectedComment] = useState<any>(null);

  const setSelectedInboxMsg = setRawSelectedInboxMsg;
  const setSelectedComment = setRawSelectedComment;

  const MOCK_COMMENTS: any[] = [];

  const [activeTab, setActiveTab] = useState("social-dashboard");


  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [activeHistoryMenuId, setActiveHistoryMenuId] = useState<string | null>(null);
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [analyticsMetric, setAnalyticsMetric] = useState("reach");
  const [analyticsPlatform, setAnalyticsPlatform] = useState("all");
  const [audiencePlatform, setAudiencePlatform] = useState("all");
  const [dashboardPlatform, setDashboardPlatform] = useState("all");
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("30d");
  const [animatingMessageIndex, setAnimatingMessageIndex] = useState(-1);
  const [calendarPosts, setCalendarPosts] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const commentChatScrollRef = useRef<HTMLDivElement>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [compInput, setCompInput] = useState("");
  const [compLoading, setCompLoading] = useState(false);
  const configDropdownRef = useRef<HTMLDivElement>(null);
  const configPanelRef = useRef<HTMLDivElement>(null);
  const [connectedAccountsData, setConnectedAccountsData] = useState<Record<string, any>>({});
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [contentPlatform, setContentPlatform] = useState("all");
  const [contentSort, setContentSort] = useState("newest");
  const [createPostCaption, setCreatePostCaption] = useState("");
  const [createPostDate, setCreatePostDate] = useState("");
  const [createPostMedia, setCreatePostMedia] = useState<any[]>([]);
  const [createPostMode, setCreatePostMode] = useState<"now"|"schedule">("now");
  const [createPostPlatforms, setCreatePostPlatforms] = useState<string[]>([]);
  const [createPostPlatformTypes, setCreatePostPlatformTypes] = useState<Record<string, string>>({});
  const [createPostTime, setCreatePostTime] = useState("");
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [dashTimeRange, setDashTimeRange] = useState("30d");
  const [dataSource, setDataSource] = useState("all");
  const dataSourceDropdownRef = useRef<HTMLDivElement>(null);
  const DEFAULT_CONFIG_ITEM = { id: "", title: "", prompt: "" };
  const [disconnectPrompt, setDisconnectPrompt] = useState<{open: boolean, platformId: string|null}>({open: false, platformId: null});
  const [editingConfig, setEditingConfig] = useState<any>({});
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [editSessionTitle, setEditSessionTitle] = useState("");
  const [expandedEditPlatforms, setExpandedEditPlatforms] = useState<Record<string, boolean>>({});
  
  
  useEffect(() => {
    if (!workspaceId) return;
    
    // Auto-sync backend secrets to this workspace
    fetch('/api/meta/sync-secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId })
    }).catch(console.error);
    
    const accountsRef = collection(db, "workspaces", workspaceId, "connectedAccounts");
    const unsubscribe = onSnapshot(accountsRef, (snapshot) => {
      const accounts: Record<string, any> = {};
      const platforms: string[] = [];
      snapshot.forEach((doc) => {
        accounts[doc.id] = doc.data();
        platforms.push(doc.id);
      });
      setConnectedAccountsData(accounts);
      setConnectedPlatforms(platforms);
    }, (err) => {
      console.error("Failed to subscribe to connectedAccounts", err);
    });
    return () => unsubscribe();
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId || connectedPlatforms.length === 0) return;
    
    const fetchApiData = async () => {
      try {
        let allPosts: any[] = [];
        let allComments: any[] = [];
        let apiErrors: string[] = [];
        
        for (const platform of ['meta', 'instagram']) {
          if (connectedAccountsData[platform]) {
            try {
              const accToken = connectedAccountsData[platform].accessToken; 
              const accId = connectedAccountsData[platform].accountId; 
              
              const postsRes = await fetch(`/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=posts&clientAccessToken=${accToken}&clientAccountId=${accId}`);
              const postsData = await postsRes.json().catch(() => ({}));
              if (postsRes.ok && !postsData.error) {
                if (postsData.data) {
                  const mappedPosts = postsData.data.map((p: any) => ({
                    id: p.id,
                    platform: platform,
                    content: p.message || p.caption || "No content",
                    date: new Date(p.created_time || p.timestamp).toLocaleDateString(),
                    status: "published",
                    likes: p.likes?.summary?.total_count || p.like_count || 0,
                    comments: p.comments?.summary?.total_count || p.comments_count || 0,
                    media: p.media_url || p.attachments?.data?.[0]?.media?.image?.src || "",
                    author: connectedAccountsData[platform].accountName || platform
                  }));
                  allPosts = [...allPosts, ...mappedPosts];
                }
              } else {
                apiErrors.push(`${platform} (posts): ${postsData.error?.message || postsData.error || postsRes.statusText}`);
              }
              
            } catch (err: any) {
              apiErrors.push(`${platform}: ${err.message || 'Unknown error'}`);
            }
          }
        }
        
        if (apiErrors.length > 0) {
          setMetaApiError(apiErrors.join(' | '));
        } else {
          setMetaApiError(null);
        }
        
        setRealPosts(allPosts);
      } catch (e) {
        console.error("fetchApiData err:", e);
      }
    };
    
    fetchApiData();
  }, [workspaceId, connectedPlatforms, connectedAccountsData]);

  const [diagnosticResult, setDiagnosticResult] = useState<Record<string, any>>({});
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const runDiagnostic = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult({});
    const results: Record<string, any> = {};
    
    if (connectedPlatforms.length === 0) {
      results["all"] = { status: "error", message: "Belum ada platform yang terkoneksi di Workspace ini." };
      setDiagnosticResult(results);
      setIsDiagnosing(false);
      return;
    }
    
    for (const platform of connectedPlatforms) {
      try {
        const accToken = connectedAccountsData[platform]?.accessToken;
        const accId = connectedAccountsData[platform]?.accountId;
        
        if (!accToken || !accId) {
          results[platform] = { status: "error", message: "Akses Token atau Account ID tidak ditemukan di database." };
          continue;
        }
        
        const res = await fetch(`/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=posts&clientAccessToken=${accToken}&clientAccountId=${accId}`);
        const data = await res.json().catch(() => ({}));
        
        if (res.ok && !data.error) {
          results[platform] = { status: "success", message: "Koneksi berhasil, token valid!" };
        } else {
          results[platform] = { status: "error", message: `Gagal: ${data.error?.message || data.error || res.statusText}` };
        }
      } catch (err: any) {
         results[platform] = { status: "error", message: `Error jaringan/sistem: ${err.message}` };
      }
    }
    
    setDiagnosticResult(results);
    setIsDiagnosing(false);
  };

  const handleChatSubmit = async (...args: any[]) => {};
  const handleCloseConfigPanel = (...args: any[]) => {};
  const handleCreatePost = async (...args: any[]) => {};
  const handleDiscardConfigs = (...args: any[]) => {};
  const handleToggleConfigPanel = (...args: any[]) => {};
  
  const [heatmapMetric, setHeatmapMetric] = useState("engagement");
  const [hubaiConfigs, setHubaiConfigs] = useState<any[]>([]);
  const HUBAI_TIPS = ["Tip 1", "Tip 2"];
  const inboxChatScrollRef = useRef<HTMLDivElement>(null);
  const [integrationModal, setIntegrationModal] = useState<{open: boolean, platform: string|null}>({open: false, platform: null});
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [mergedComments, setMergedComments] = useState<any[]>([]);
  const [metaApiError, setMetaApiError] = useState<string | null>(null);
  const [platformOverrides, setPlatformOverrides] = useState<Record<string, any>>({});
  const PROMPT_IDEAS = ["Idea 1", "Idea 2"];
  const [realInsights, setRealInsights] = useState<any>(null);
  const [realPosts, setRealPosts] = useState<any[]>([]);
  
  const renderHighlightedText = (text: string, query?: string) => <>{text}</>;
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const saveConfig = async (...args: any[]) => {};
  const [savingConfig, setSavingConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedComment = null;
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const selectedInboxMsg = null;
  const sendCommentReply = async (...args: any[]) => {};
  const sendDMMessage = async (...args: any[]) => {};
  
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showCreatePostPopup, setShowCreatePostPopup] = useState(false);
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  
  const updateEditingConfig = (key: string, value: any) => setEditingConfig((prev: any) => ({...prev, [key]: value}));
  const [targetMessageIndex, setTargetMessageIndex] = useState(-1);
  const ANALYSIS_IDEAS = ["Idea 1"];


  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const newHistory = [...chatHistory, { role: "user", content: userMsg }];
    let currentSessionId = activeSessionId;

    setChatHistory(newHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      if (!currentSessionId && user?.uid) {
        try {
          const docRef = await addDoc(
            collection(db, "users", user.uid, "aiChats"),
            {
              title:
                userMsg.substring(0, 30) + (userMsg.length > 30 ? "..." : ""),
              messages: newHistory,
              updatedAt: serverTimestamp(),
            },
          );
          currentSessionId = docRef.id;
          setActiveSessionId(currentSessionId);
        } catch (err) {
          console.error("Gagal save session ke Firebase", err);
        }
      } else if (currentSessionId && user?.uid) {
        try {
          await setDoc(
            doc(db, "users", user.uid, "aiChats", currentSessionId),
            {
              messages: newHistory,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        } catch (err) {
          console.error("Gagal update session ke Firebase", err);
        }
      }

      const recentContent = [...(content || [])]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
      const contextData: any = {
        workspaceName: workspace?.name,
        userName: profile?.name || user?.displayName || "Creator",
        companyName: profile?.companyName,
        industry: profile?.industry,
        platformConnections: connectedPlatforms,
      };

      if (dataSource === "all" || dataSource === "social_management") {
        contextData.socialManagement = {
          totalContentPlanned: (content || []).length,
          recentContent: recentContent.map((c) => ({
            title: c.title,
            date: c.date,
            type: c.type,
            status: c.status,
            platform: Array.isArray(c.platform)
              ? c.platform.join(",")
              : c.platform || "",
          })),
        };
      }

      if (dataSource === "all" || dataSource === "social_studio") {
        contextData.socialStudio = {
          analyticsData: MOCK_CHART_DATA.slice(-7).map((d) => ({
            date: d.date,
            views: d.views,
            er: d.er,
          })),
          competitors: competitors
            .slice(0, 3)
            .map((c) => ({ user: c.username, er: c.er })),
          inbox: inboxMessages.slice(0, 5).map((m) => ({
            from: m.senderName || `User ${m.senderId || "?"}`,
            msg: m.content,
            plat: m.platform,
          })),
          contentPerf: DISPLAY_CONTENT.slice(0, 5).map((c) => ({
            title: c.title,
            plat: c.type,
            views: c.views,
            er: c.er,
          })),
        };
      }

      let updatedHistory = [...newHistory];
      const optimizedHistory =
        newHistory.length > 5
          ? [...newHistory.slice(0, 1), ...newHistory.slice(-4)]
          : newHistory;

      try {
        const activeConfig =
          hubaiConfigs.find((c) => c.id === activeConfigId) ||
          hubaiConfigs[0] ||
          DEFAULT_CONFIG_ITEM;
        const strContext = JSON.stringify(contextData);
        const configStr = `
Profil Personalisasi HUB.AI:
- Posisi Pekerjaan: ${activeConfig.jobRole || "Tidak disebutkan"}
- Gaya Bahasa (Tone of Voice): ${activeConfig.toneOfVoice || "Asik, praktis, profesional"}
- Nama Brand: ${activeConfig.brandName || "Tidak disebutkan"}
- Bidang/Industri Brand: ${activeConfig.brandIndustry || "Tidak disebutkan"}
- Target Audience: ${activeConfig.targetAudience || "Tidak disebutkan"}
- Unique Selling Proposition (USP): ${activeConfig.usp || "Tidak disebutkan"}
- Tujuan Konten: ${activeConfig.contentGoals || "Tidak disebutkan"}
- Pilar Konten (Content Pillars): ${activeConfig.contentPillars || "Tidak disebutkan"}
- Kompetitor: ${activeConfig.competitors || "Tidak disebutkan"}
- Info Tambahan: ${activeConfig.additionalInfo || "Tidak disebutkan"}
- Kamus Brand (Glossary): ${activeConfig.brandGlossary || "Tidak disebutkan"}
- Contoh Konten (Reference): ${activeConfig.contentExamples || "Tidak disebutkan"}
`;
        const sysPrompt = `Anda adalah HUB.AI, Expert Social Media Manager & Creative Director kelas dunia yang bekerja di dalam platform Hubify. Anda memiliki spesialisasi dalam merancang strategi media sosial yang berfokus pada retention rate, tingginya engagement, dan konversi audience, bukan sekadar membuat teks basa-basi.

${configStr}

Data Platform Real-Time:
Anda saat ini terhubung langsung dengan data referensi user dari platform Hubify.
Data Source yang terbuka untuk Anda analisis saat ini adalah: ${dataSource === "all" ? "Semua Platform (Social Management & Social Studio)" : dataSource === "social_management" ? "Hanya Tab Social Management (Calendar dsb)" : "Hanya Tab Social Studio (Real-time Analytics, Inbox, Kompetitor)"}.
Data User:
${strContext}

Tugas Utama Anda:
1. Menjawab pertanyaan mendalam mengenai social media marketing, tren, copywriting, dan strategi. Anda dapat membagikan wawasan Anda dari pengetahuan AI umum Anda secara luas. Gunakan Tone of Voice sesuai konfigurasi Personalisi.
2. Menganalisis dan membuat laporan singkat berdasarkan data 'analyticsData', 'competitors', atau performa rill setiap post di 'contentPerf' jika ada.
3. Memberikan ide konten dan mereview kalender yang sudah diisi di 'recentContent'. Anda juga dapat merancang draft caption yang disesuaikan profil brand.
4. Memberikan saran balasan untuk pesan masuk berdasarkan data 'inbox'.

Panduan Komunikasi:
- Selalu pastikan pilihan kata, Hook, CTA, dan arahan visual yang Anda berikan tertuju pada metrik yang penting (retention rate, engagement, konversi) dan bukan sekadar kata-kata manis.
- **Copywriting Framework:** Selalu gunakan framework copywriting yang terbukti sukses, seperti AIDA (Attention, Interest, Desire, Action) atau PAS (Problem, Agitate, Solution) dalam merancang alur konten, terutama untuk Hook 3 detik pertama agar benar-benar menangkap audiens, yang dilanjutkan dengan struktur logis sampai ke CTA.
- **Wajib Menggunakan Bank Formula Hook:** Untuk setiap pembuatan teks / konten, Anda HARUS menggunakan (atau mengadaptasi) salah satu dari formula hook berikut agar ampuh menangkap atensi, dan sesuaikan tipenya berdasarkan format konten:
  - **(Video/Story/Reels) Negatif / Peringatan:** "Jangan [Kata Kerja] [Hal] sebelum kamu tahu rahasia ini!" atau "Kesalahan terbesar saat [Mencoba Sesuatu] yang bikin kamu [Dampak Buruk]."
  - **(Video/Story/Reels) Eksklusivitas / Rahasia:** "Ini dia rahasia [Hasil] tanpa harus [Pain Point]!" atau "Cara [Orang Sukses] mendapatkan [Hasil] dalam [Waktu]."
  - **(Video/Story/Reels) Relatable / Validasi Emosi:** "Siapa di sini yang ngerasa [Pain Point]? Ternyata alasannya..." atau "Capek sama [Masalah]? Coba lakukan ini."
  - **(Video/Story/Reels) Challenge / Tantangan:** "Coba deh lakukan [Tindakan] ini selama [Waktu], dan lihat apa yang terjadi." atau "Berani nggak kamu berhenti [Kebiasaan Buruk] mulai hari ini?"
  - **(Video/Story/Reels) Unpopular Opinion:** "Mungkin banyak yang nggak setuju, tapi [Fakta Menarik/Pandangan Berbeda]." atau "[Hal yang Dipercaya Banyak Orang] itu ternyata salah besar!"
  - **(Video/Story/Reels) Storytelling & Curiosity:** "Gimana caranya gue bisa [Pencapaian] padahal dulu [Keadaan Sulit]." atau "Pernah kepikiran nggak kenapa [Fenomena Aneh] bisa terjadi?"
  - **(Carousel Edukasi) Listicle / Langkah:** "[Angka] Cara Ampuh untuk [Mencapai Goal] Tanpa [Pain Point] (Geser 👉)" atau "Step-by-step [Selesaikan Masalah] Buat Kamu yang [Kondisi Spesifik]."
  - **(Carousel Edukasi) Visual Roadmap / Before-After:** "Dari [Kondisi Buruk] Jadi [Kondisi Ideal]. Ini Roadmap-nya (Save Biar Ga Lupa!)"
  - **(Carousel Edukasi) Mistakes / Checklist:** "Ceklis Wajib Sebelum [Tindakan Penting] Biar Nggak Menyesal!" atau "[Angka] Kesalahan Fatal Paling Sering Saat [Melakukan Sesuatu]."
  - **(Carousel Produk) Transformasi Fitur:** "Lelah dengan [Masalah Fokus]? Ini Solusi yang Bikin [Hasil Menarik] dalam [Waktu]." atau "Wajah [Kondisi Awal]? Cukup Pakai [Produk] Bisa Langsung [Hasil Akhir]."
  - **(Carousel Produk) Alasan Rasional (Why Us):** "Kenapa [Nama Produk] Selalu Sold Out? (Geser untuk Tahu Jawabannya)" atau "5 Alasan Kenapa [Tipe Pelanggan] Harus Punya [Nama Produk] Ini."
  - **(Carousel Produk) Bongkar Fakta / Anatomi:** "Bedah Tuntas Rahasia di Balik [Nama Produk]. Pantesan [Benefit]!" atau "Apa Aja Sih Isi [Nama Produk] Terlaris Ini? Yuk Intip!"
  - **(Carousel Produk) Social Proof / Review:** "Kata Mereka yang Udah Cobain [Nama Produk]..." atau "Rating [Produk] Ini [Angka]! Beneran Bagus atau Cuma Hype?"
- **Kecerdasan Spesifik Platform:** Sesuaikan gaya dan arahan visual dengan karakteristik platform:
  - **TikTok:** Buat brief yang kasual, fast-paced, raw, dan trend-driven.
  - **Instagram Reels:** Arahkan pada estetika visual tinggi, transisi yang smooth, dan kualitas gambar.
  - **LinkedIn:** Gunakan bahasa profesional, informatif, dan berbobot.
- **Interaktivitas (WAJIB DILAKUKAN):** Setiap kali user meminta dibuatkan brief konten, rancangan konten, atau draft (sepanjang apa pun prompt mereka), JANGAN langsung membuatkan hasilnya jika mereka belum menjelaskan 6 hal pokok berikut secara spesifik: (1) Isi detail konten/USP, (2) Target audiens, (3) Tujuan konten, (4) Platform yang dituju, (5) Tipe konten (Reels, Carousel, dll), dan (6) Durasi/Panjang konten (Pendek, Standar, Panjang). Jika informasi ini belum lengkap, Anda WAJIB bertanya balik secara ramah poin mana saja yang kurang. Jangan eksekusi brief sebelum spesifikasinya jelas!
- Berbicaralah dalam bahasa Indonesia yang selaras dengan Tone of Voice di atas, apabila tidak disebutkan tetap gunakan tone yang asik, praktis, profesional, dan to the point.
- Jadikan Profil Personalisasi sebagai landasan saat Anda memberikan ide atau draft tulisan.
- Jika user bertanya terkait metrik atau kalender mereka, gunakan data JSON di atas untuk menjawab. Jika datanya tidak ada, katakan Anda belum melihat data tersebut.
- Jangan sebut format 'JSON' dalam balasan. Berikan langsung wawasannya atau hasilnya.
- Jika user meminta untuk membuat laporan, buatkan rangkuman bullet point yang rapi.
- JIKA user meminta untuk membuat brief konten, rancangan konten, atau draft konten (dan Anda sudah memiliki informasi yang cukup), WAJIB gunakan format tag berikut di dalam respons Anda agar sistem dapat membacanya:

**[JUDUL]** 
(isi judul konten yang spesifik dan menarik)

**[PLATFORM]** 
(isi platform target seperti Instagram, TikTok, LinkedIn, dll)

**[TIPE KONTEN]** 
(isi tipe konten seperti Reels, Feed, Story, dll)

**[OBJECTIVE]** 
(jelaskan tujuan spesifik konten ini dibuat)

**[HOOK]** 
(berikan kalimat pancingan 3 detik pertama yang kuat)

**[CTA]** 
(isi call to action yang spesifik dan mengarahkan konversi)

**[CAPTION]** 
(tuliskan caption lengkap dengan gaya bahasa yang sesuai. Buat paragraf yang rapi dan mudah dibaca. Sertakan hashtag yang relevan)

**[BRIEF]** 
(Berikan panduan visual dan eksekusi yang komprehensif dalam bentuk bullet points. Jelaskan dengan detail aspek-aspek berikut:
- **Visual & Angle:** (Jelaskan urutan scene, framing kamera, dan komposisi)
- **Audio & Musik:** (Sebutkan mood musik yang cocok, efek suara, atau gaya Voice Over)
- **Teks On-Screen:** (Detailkan teks yang perlu muncul dalam video/grafis)
- **Mood & Tone:** (Gambarkan nuansa visual dan emosi yang ingin disampaikan)
- **Properti & Talent:** (Sebutkan jika ada kebutuhan spesifik untuk model atau properti)
)

PENTING UNTUK DIPERHATIKAN SEPUTAR FORMAT:
- STRICT FORMATTING: Jangan mengubah nama tag yang berada di dalam tanda kurung siku (seperti tidak boleh menjadi [JUDUL KONTEN], harus tetap [JUDUL]). Harus sama persis dengan template di atas.
- Pisahkan setiap tag dan isinya HANYA dengan enter ganda (baris kosong baru).
- JANGAN PERNAH menambahkan karakter khusus untuk membungkus kode atau teks (hindari penggunaan code blocks seperti \`\`\` tanpa alasan yang jelas).
- JANGAN PERNAH memberikan garis pemisah panjang (seperti --- atau ===) antar bagian.
- Gunakan teks tebal (**bold**) hanya pada judul tag atau sub-judul poin untuk kerapian.
- Pastikan isi dari setiap tag langsung ditulis di bawah tag tersebut tanpa awalan titik dua (:).
Catatan: Anda boleh menambahkan teks pembuka/penutup di luar tag tersebut.`;

        const data = await callAiWithQuota(user.uid, profile?.plan, {
          prompt: userMsg,
          history: optimizedHistory,
          system: sysPrompt,
          useSearchGrounding: true,
        });
        updatedHistory.push({ role: "assistant", content: data.text });
      } catch (err: any) {
        updatedHistory.push({
          role: "assistant",
          content:
            err.message || "Terjadi kesalahan sistem atau melebihi kuota AI.",
        });
        const isQuotaErr =
          err.message?.includes("429") || err.message?.includes("kuota");
        if (!isQuotaErr) {
          console.error("Gemini API Error", err);
        }
      }

      setChatHistory(updatedHistory);
      setAnimatingMessageIndex(updatedHistory.length - 1);

      if (currentSessionId && user?.uid) {
        try {
          await setDoc(
            doc(db, "users", user.uid, "aiChats", currentSessionId),
            {
              messages: updatedHistory,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        } catch (err) {
          console.error(
            "Gagal update session ke Firebase stlh AI response",
            err,
          );
        }
      }
    } catch (e) {
      console.error("Unhandled error in handleChatSubmit:", e);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Terjadi kesalahan internal. Mohon coba lagi.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateDraftFromAI = async (messageContent: string) => {
    if (!workspaceId) return;

    const extract = (tag: string) => {
      const regex = new RegExp(
        `(?:\\*\\*)?\\[${tag}\\](?:\\*\\*)?\\s*([\\s\\S]*?)(?=(?:\\s*(?:-|\\*)*\\s*(?:\\*\\*)?\\[[A-Z\\s]+\\](?:\\*\\*)?)|$)`,
        "i",
      );
      const match = messageContent.match(regex);
      let val = match ? match[1].trim() : "";
      if (val.startsWith(":")) val = val.substring(1).trim();
      return val;
    };

    const exJudul = extract("JUDUL");
    const exPlatform = extract("PLATFORM");
    const exTipe = extract("TIPE KONTEN");
    const exObjective = extract("OBJECTIVE");
    const exHook = extract("HOOK");
    const exCTA = extract("CTA");
    const exCaption = extract("CAPTION");
    const exBrief = extract("BRIEF");

    const parseMarkdown = (text: string) => {
      if (!text) return "";
      let html = text.trim();
      // Bold double asterisk
      html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Bold double underscore
      html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
      // Bold/Italic single asterisk (if user/ai uses single for bold/italic) avoiding lists
      html = html.replace(
        /\*(?![*\s])(.*?)(?<![*\s])\*/g,
        "<strong>$1</strong>",
      );
      // Italic single underscore avoiding lists
      html = html.replace(/_(?![_\s])(.*?)(?<![_\s])_/g, "<em>$1</em>");

      // Split by double enter to keep paragraphs separate
      const blocks = html.split(/\n\s*\n/);

      const htmlBlocks = blocks.map((block) => {
        if (/^[\s]*[-*]\s+/m.test(block)) {
          const listItems = block
            .split(/\n/)
            .map((line) => {
              const match = line.match(/^[\s]*[-*]\s+(.*)/);
              return match ? `<li>${match[1].trim()}</li>` : line;
            })
            .join("");
          return `<ul>${listItems}</ul>`;
        } else if (/^[\s]*\d+\.\s+/m.test(block)) {
          const listItems = block
            .split(/\n/)
            .map((line) => {
              const match = line.match(/^[\s]*\d+\.\s+(.*)/);
              return match ? `<li>${match[1].trim()}</li>` : line;
            })
            .join("");
          return `<ol>${listItems}</ol>`;
        }
        return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
      });

      return htmlBlocks.join("");
    };

    const titleMatch =
      messageContent.match(/# (.*)/) ||
      messageContent.match(/(?:\*\*)?\[JUDUL\](?:\*\*)?\s*(.*)/i);
    let fallbackTitle = titleMatch
      ? titleMatch[1].replace(/[:*#]/g, "").trim()
      : "Draft dari HUB.AI";
    if (fallbackTitle.startsWith("[")) fallbackTitle = "Draft dari HUB.AI";

    if (onOpenModal) {
      onOpenModal({
        title: exJudul
          ? exJudul.substring(0, 60)
          : fallbackTitle.substring(0, 60),
        caption: parseMarkdown(exCaption || messageContent),
        briefCopywriting: parseMarkdown(exBrief || messageContent),
        objective: parseMarkdown(exObjective) || "Dibuat otomatis oleh HUB.AI",
        hook: parseMarkdown(exHook) || "",
        cta: parseMarkdown(exCTA) || "",
        pic: user?.displayName || profile?.fullName || "Kreator",
        platform: exPlatform || "Instagram",
        contentType: exTipe || "Feed/Post",
        status: "Draft",
        date: new Date().toISOString().split("T")[0],
        isHubAiDraft: true,
      });
    } else {
      alert("Fungsi Modal belum tersambung ke komponen ini.");
    }
  };
  // ----------------------

  const addCompetitor = async () => {
    if (!compInput.trim()) return;
    setCompLoading(true);

    // Simulate AI parsing / API Fetch
    setTimeout(() => {
      setCompetitors((prev) => [
        ...prev,
        {
          username: compInput.startsWith("@") ? compInput : `@${compInput}`,
          er: (Math.random() * 5 + 1).toFixed(1) + "%",
          postsPerMonth: Math.floor(Math.random() * 20 + 5),
          topContent: [
            {
              title: "Tutorial Hack",
              views: Math.floor(Math.random() * 500) + "K",
              likes: Math.floor(Math.random() * 50) + "K",
            },
            {
              title: "Behind The Scenes",
              views: Math.floor(Math.random() * 300) + "K",
              likes: Math.floor(Math.random() * 30) + "K",
            },
            {
              title: "Meme Relatable",
              views: Math.floor(Math.random() * 100) + "K",
              likes: Math.floor(Math.random() * 10) + "K",
            },
          ],
        },
      ]);
      setCompInput("");
      setCompLoading(false);
    }, 1500);
  };

  const toggleConnection = async (id: string) => {
    if (connectedPlatforms.includes(id)) {
      setDisconnectPrompt({ isOpen: true, platformId: id });
    } else {
      setIntegrationModal({ isOpen: true, platformId: id });
    }
  };

  const handleIntegrationSuccess = (id: string) => {
    if (!workspaceId) {
      alert("Workspace ID not found");
      return;
    }
    // MOCK: only used for non-meta platforms
    const fakeToken = `${id.toUpperCase()}_MOCK_TOKEN_` + Date.now();
    const docRef = doc(db, "workspaces", workspaceId, "connectedAccounts", id);
    setDoc(docRef, {
      workspaceId,
      platform: id,
      accountId: `${id}_mock_id`,
      accountName: `${id.charAt(0).toUpperCase() + id.slice(1)} Business Account`,
      accessToken: fakeToken,
      status: "active",
      createdAt: serverTimestamp(),
    }).catch((e: any) => {
      console.error("Error setting account", e);
      alert("Failed to connect account: " + e.message);
    });
  };

  const generateReport = async () => {
    setAiLoading(true);
    try {
      const data = await callAiWithQuota(user.uid, profile?.plan, {
        prompt:
          "Anda adalah pakar Social Media Analytics. Berdasarkan data berikut, berikan ringkasan performa yang mudah dibaca (dalam 3 paragraf pendek) dan 3 poin 'Rekomendasi Langkah Selanjutnya'. Data: Views 1.2M (+15%), Reach 980K (+10%), ER 5.2% (+1.2%), Komentar 4.1K, Likes 88.3K, Share 10.2K.",
        system:
          "Output dalam Markdown yang bersih, profesional, dan to the point.",
      });
      setAiReport(data.text);
    } catch (err: any) {
      setAiReport(err.message || "Gagal mengambil laporan dari AI.");
    }
    setAiLoading(false);
  };

  const MOCK_CHART_DATA = React.useMemo(() => {
    if (realInsights && Object.keys(realInsights).length > 0) {
      // Just map some basic data from insights for the chart if we have it
      // Let's create a 14-day array mapping the values if available, or just mock it cleanly
      const dataToUse = realInsights[analyticsPlatform] || realInsights['meta'] || realInsights['instagram'];
      if (dataToUse) {
        // Typically insights have {name: 'page_impressions', values: [{value, end_time}]}
        // We'll extract the first metric's values for dates.
        const metric = dataToUse[0];
        if (metric && metric.values) {
          return metric.values.map((v: any, i: number) => ({
             date: new Date(v.end_time).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
             views: v.value || 0,
             reach: v.value || 0,
             likes: 0,
             comments: 0,
             shares: 0,
             er: 0,
             reposts: 0,
             saves: 0
          }));
        }
      }
    }

    // Generate different seeds based on platform and what is being viewed
    let multiplier = 1;
    if (analyticsPlatform === "instagram") multiplier = 1.5;
    else if (analyticsPlatform === "tiktok") multiplier = 2;
    else if (analyticsPlatform === "meta") multiplier = 0.8;
    else if (analyticsPlatform === "all") multiplier = 4.3;

    return Array.from({ length: 14 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      views: Math.floor((((i * 678) % 5000) + 1000) * multiplier),
      reach: Math.floor((((i * 345) % 3000) + 500) * multiplier),
      likes: Math.floor((((i * 123) % 1000) + 100) * multiplier),
      comments: Math.floor((((i * 45) % 200) + 10) * multiplier),
      shares: Math.floor((((i * 89) % 100) + 5) * multiplier),
      er: Number((((i * 1.5) % 3) + 1 + multiplier * 0.5).toFixed(1)),
      reposts: Math.floor((((i * 12) % 50) + 1) * multiplier),
      saves: Math.floor((((i * 56) % 300) + 20) * multiplier),
    }));
  }, [analyticsPlatform]);

  const SORT_OPTIONS = [
    { id: "terbaru", label: "Terbaru" },
    { id: "terlama", label: "Terlama" },
    { id: "a-z", label: "A - Z" },
    { id: "z-a", label: "Z - A" },
  ];

  const DISPLAY_CONTENT = React.useMemo(() => {
    let list = realPosts ? realPosts.map((p: any) => ({
      id: p.id,
      title: p.content ? p.content.slice(0, 40) + '...' : 'Post',
      captionSnippet: p.content ? p.content.slice(0, 60) + '...' : '',
      postTypeLabel: 'Post',
      accountName: p.author || 'Account',
      time: p.date ? new Date(p.date).toLocaleString() : '',
      type: p.platform || 'instagram',
      views: p.views || 0,
      reach: p.reach || 0,
      likes: p.likes || 0,
      er: p.er || '0.0',
      comments: p.comments || 0,
      shares: p.shares || 0,
      saves: p.saves || 0,
      thumbnail: p.media || "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=100&h=100&fit=crop"
    })) : [];

    if (contentPlatform !== "all") {
      list = list.filter((c) => c.type === contentPlatform);
    }

    list.sort((a, b) => {
      if (contentSort === "a-z") return a.title.localeCompare(b.title);
      if (contentSort === "z-a") return b.title.localeCompare(a.title);
      if (contentSort === "terbaru")
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      if (contentSort === "terlama")
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      return 0;
    });

    return list;
  }, [contentPlatform, contentSort]);

  const HeatmapMock = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto repeat(7, 1fr)",
        gap: 4,
        width: "100%",
      }}
    >
      <div />
      {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
        <div
          key={d}
          style={{
            textAlign: "center",
            fontSize: 11,
            fontWeight: 800,
            color: "rgba(44,32,22,0.5)",
          }}
        >
          {d}
        </div>
      ))}
      {[8, 10, 12, 14, 16, 18, 20].map((h) => (
        <React.Fragment key={h}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(44,32,22,0.5)",
              alignSelf: "center",
              paddingRight: 8,
              textAlign: "right",
            }}
          >
            {h}:00
          </div>
          {Array.from({ length: 7 }).map((_, i) => {
            const intensity = ((h * i * 3) % 100) / 100;
            return (
              <motion.div
                whileHover={{ scale: 1.1 }}
                key={i}
                style={{
                  height: 24,
                  borderRadius: 4,
                  cursor: "pointer",
                  background:
                    heatmapMetric === "views"
                      ? `rgba(255, 107, 0, ${0.1 + intensity * 0.9})`
                      : `rgba(45, 122, 94, ${0.1 + intensity * 0.9})`,
                }}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  const CalendarMock = () => {
    const days = Array.from({ length: 31 }).map((_, i) => i + 1);

    const realCalendarPosts = (content || []).map((c: any) => {
      let day = 1;
      if (c.publishDate) {
        const parts = c.publishDate.split("-");
        if (parts.length === 3) day = parseInt(parts[2], 10);
      }
      return {
        ...c,
        day,
        type: Array.isArray(c.platform) ? c.platform[0] : (c.platform || "ig"),
      };
    });
    const mergedPosts = [...calendarPosts, ...realCalendarPosts];

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 12,
          width: "100%",
          marginTop: 24,
        }}
      >
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontWeight: 800,
              fontSize: 13,
              color: "rgba(44,32,22,0.5)",
            }}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={"empty" + i}
            style={{
              padding: "20px",
              background: "rgba(44,32,22,0.02)",
              borderRadius: 12,
            }}
          />
        ))}
        {days.map((d) => {
          const posts = mergedPosts.filter((p: any) => p.day === d);
          return (
            <div
              key={d}
              style={{
                padding: "12px 12px 40px",
                background: "white",
                border: "1px solid rgba(44,32,22,0.1)",
                borderRadius: 12,
                minHeight: 100,
                position: "relative",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 14 }}>{d}</div>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {posts.map((p: any, i) => {
                  const pType = String(p.type || "").trim().toLowerCase();
                  let blockColor = "#2D5A86";
                  let blockBg = "#F0F4F8";
                  
                  if (pType === "ig" || pType === "instagram") {
                    blockColor = "#E1306C";
                    blockBg = "#FDF0F5";
                  } else if (pType === "fb" || pType === "facebook" || pType === "meta") {
                    blockColor = "#1877F2";
                    blockBg = "#EBF3FC";
                  } else if (pType === "tt" || pType === "tiktok") {
                    blockColor = "#000000";
                    blockBg = "#F1F1F1";
                  } else if (pType === "li" || pType === "linkedin") {
                    blockColor = "#0077B5";
                    blockBg = "#E6F0F8";
                  } else if (pType === "yt" || pType === "youtube") {
                    blockColor = "#FF0000";
                    blockBg = "#FFF0F0";
                  } else if (pType === "x" || pType === "twitter" || pType === "threads") {
                    blockColor = "#111111";
                    blockBg = "#F3F3F3";
                  }

                  return (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={i}
                      onClick={() => {
                        if (onOpenModal) {
                          onOpenModal(p);
                        } else {
                          setSelectedContent(p);
                        }
                      }}
                      style={{
                        background: blockBg,
                        color: blockColor,
                        padding: "6px 8px",
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                      }}
                    >
                      {getPlatformIcon(p.type, 12)}
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {p.title}
                      </div>
                      {p.time && (
                        <div style={{ fontSize: 9, opacity: 0.7, flexShrink: 0 }}>
                          {p.time}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const ContentModalMock = () => {
    if (!selectedContent) return null;
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(44,32,22,0.6)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: "white",
            borderRadius: 24,
            width: "100%",
            maxWidth: 800,
            display: "flex",
            overflow: "hidden",
            maxHeight: "90vh",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              minHeight: 400,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {selectedContent.thumbnail ? (
              <img
                src={selectedContent.thumbnail}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <PlayCircle size={48} opacity={0.5} />
            )}
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                background: "rgba(0,0,0,0.5)",
                padding: "6px 12px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {selectedContent.type.toUpperCase()} • {selectedContent.time}
            </div>
          </div>
          <div style={{ width: 400, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                padding: 20,
                borderBottom: "1px solid rgba(44,32,22,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  margin: 0,
                  wordBreak: "break-word",
                }}
              >
                {selectedContent.title}
              </h3>
              <button
                onClick={() => setSelectedContent(null)}
                className="hover-scale"
                style={{
                  background: "rgba(44,32,22,0.05)",
                  border: "none",
                  cursor: "pointer",
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2C2016",
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(44,32,22,0.6)",
                  lineHeight: 1.5,
                  marginBottom: 24,
                }}
              >
                "Caption panjang lebar bla bla bla #hashtag #viral #fyp"
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>
                Insight Detail
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {["Views", "Reach", "Likes", "Komen", "Share", "Save"].map(
                  (m, i) => (
                    <div
                      key={m}
                      style={{
                        background: "#FAFAFA",
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(44,32,22,0.5)",
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {m}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "#2C2016",
                        }}
                      >
                        {m === "Views"
                          ? (selectedContent as any).views || (i * 10) % 5000
                          : m === "Reach"
                            ? Math.floor(
                                ((selectedContent as any).views || 5000) * 0.8,
                              )
                            : m === "Likes"
                              ? Math.floor(
                                  ((selectedContent as any).views || 5000) *
                                    0.1,
                                )
                              : m === "Komen"
                                ? (selectedContent as any).comments ||
                                  (i * 20) % 5000
                                : m === "Share"
                                  ? (selectedContent as any).shares ||
                                    (i * 5) % 1000
                                  : (selectedContent as any).saves ||
                                    (i * 15) % 10000}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div
              style={{ padding: 20, borderTop: "1px solid rgba(44,32,22,0.1)" }}
            >
              <button
                className="hover-scale"
                style={{
                  width: "100%",
                  background: "var(--theme-primary)",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Buka di Platform Asli
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderSessionItem = (s: any) => {
    return (
      <div
        key={s.id}
        onClick={() => {
          setActiveSessionId(s.id);
          setChatHistory(s.messages || []);
          setIsSearchMode(false);
        }}
        className="hover-bg"
        style={{
          position: "relative",
          padding: "10px 12px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: activeSessionId === s.id ? 600 : 400,
          color: activeSessionId === s.id ? "#1B7FDC" : "rgba(25,53,70,0.7)",
          background:
            activeSessionId === s.id ? "rgba(27,127,220,0.1)" : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {editSessionId === s.id ? (
          <input
            autoFocus
            type="text"
            value={editSessionTitle}
            onChange={(e) => setEditSessionTitle(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                if (editSessionTitle.trim() !== "") {
                  await updateDoc(doc(db, "users", user.uid, "aiChats", s.id), {
                    title: editSessionTitle,
                  });
                }
                setEditSessionId(null);
              }
            }}
            style={{
              flex: 1,
              padding: "4px 8px",
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid rgba(27,127,220,0.3)",
              background: "white",
              outline: "none",
            }}
            onBlur={async () => {
              if (editSessionTitle.trim() !== "") {
                await updateDoc(doc(db, "users", user.uid, "aiChats", s.id), {
                  title: editSessionTitle,
                });
              }
              setEditSessionId(null);
            }}
          />
        ) : (
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
            }}
          >
            {s.title}
          </div>
        )}
        <div
          style={{ position: "relative" }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveHistoryMenuId(activeHistoryMenuId === s.id ? null : s.id);
          }}
        >
          <MoreHorizontal
            size={14}
            style={{ opacity: activeSessionId === s.id ? 1 : 0.4 }}
            className="hover-opacity"
          />
          <AnimatePresence>
            {activeHistoryMenuId === s.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHistoryMenuId(null);
                }}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 0,
                  background: "white",
                  padding: 6,
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 50,
                  minWidth: 140,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await updateDoc(
                      doc(db, "users", user.uid, "aiChats", s.id),
                      { pinned: !s.pinned },
                    );
                    setActiveHistoryMenuId(null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#193546",
                  }}
                  className="hover-bg-slate"
                >
                  <Pin size={12} /> {s.pinned ? "Unpin Chat" : "Pin Chat"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditSessionTitle(s.title);
                    setEditSessionId(s.id);
                    setActiveHistoryMenuId(null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#193546",
                  }}
                  className="hover-bg-slate"
                >
                  <Edit2 size={12} /> Edit Nama
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (
                      confirm("Yakin ingin menghapus histori percakapan ini?")
                    ) {
                      await deleteDoc(
                        doc(db, "users", user.uid, "aiChats", s.id),
                      );
                      if (activeSessionId === s.id) {
                        setActiveSessionId(null);
                        setChatHistory([
                          {
                            role: "assistant",
                            content:
                              "Halo! Saya HUB.AI, asisten khusus untuk content creator.",
                          },
                        ]);
                      }
                    }
                    setActiveHistoryMenuId(null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#E4405F",
                  }}
                  className="hover-bg-slate"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderEditorBlock = (pId: string | null, pInfo?: any) => {
    const caption = pId
      ? (platformOverrides[pId]?.caption ?? createPostCaption)
      : createPostCaption;
    const setCaption = (c: string) => {
      if (pId) {
        setPlatformOverrides((prev) => ({
          ...prev,
          [pId]: { ...prev[pId], caption: c },
        }));
        setCreatePostCaption(c);
      } else setCreatePostCaption(c);
    };

    const media = pId
      ? platformOverrides[pId]?.media !== undefined
        ? platformOverrides[pId]?.media
        : createPostMedia
      : createPostMedia;
    const setMedia = (newMedia: { url: string; type: "image" | "video" }[]) => {
      if (pId) {
        setPlatformOverrides((prev) => ({
          ...prev,
          [pId]: { ...prev[pId], media: newMedia },
        }));
        setCreatePostMedia(newMedia);
      } else setCreatePostMedia(newMedia);
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: pId ? 20 : 0,
        }}
      >
        {pId && pInfo?.contentTypes && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {pInfo.contentTypes.map((ct: any) => {
              const isActive =
                (createPostPlatformTypes[pId] || pInfo.contentTypes[0].id) ===
                ct.id;
              return (
                <div
                  key={ct.id}
                  onClick={() =>
                    setCreatePostPlatformTypes((prev) => ({
                      ...prev,
                      [pId]: ct.id,
                    }))
                  }
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 12,
                    background: isActive
                      ? "var(--theme-primary)"
                      : "rgba(44,32,22,0.04)",
                    color: isActive ? "white" : "rgba(44,32,22,0.6)",
                    cursor: "pointer",
                    border: isActive
                      ? "1px solid var(--theme-primary)"
                      : "1px solid transparent",
                  }}
                  className={isActive ? "" : "hover-bg"}
                >
                  {ct.label}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(44,32,22,0.5)",
                margin: 0,
                display: "block",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Caption
            </label>
            <button
              style={{
                background: "transparent",
                color: "var(--theme-primary)",
                border: "none",
                padding: 0,
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              className="hover-scale"
            >
              <Sparkles size={14} /> Generate AI
            </button>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            style={{
              width: "100%",
              minHeight: 120,
              borderRadius: 16,
              border: "none",
              background: "rgba(44,32,22,0.03)",
              padding: "16px",
              fontSize: 14,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: 1.6,
              color: "#2C2016",
              transition: "all 0.2s",
            }}
            onFocus={(e) => (e.target.style.background = "rgba(44,32,22,0.06)")}
            onBlur={(e) => (e.target.style.background = "rgba(44,32,22,0.03)")}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(44,32,22,0.5)",
              marginBottom: 12,
              display: "block",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Media
          </label>
          <div
            style={{
              width: "100%",
              minHeight: 140,
              borderRadius: 16,
              border: "2px dashed rgba(44,32,22,0.1)",
              background: "rgba(44,32,22,0.02)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: media && media.length > 0 ? "16px" : "0",
              cursor: "pointer",
              color: "rgba(44,32,22,0.5)",
              position: "relative",
              transition: "all 0.2s",
            }}
            className="hover-bg"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = (Array.from(e.dataTransfer.files) as File[]).filter(
                (f) =>
                  f.type.startsWith("image/") || f.type.startsWith("video/"),
              );
              if (files.length > 0) {
                const newMedia = files.map((file) => ({
                  url: URL.createObjectURL(file),
                  type: file.type.startsWith("video/")
                    ? ("video" as const)
                    : ("image" as const),
                }));
                setMedia([...(media || []), ...newMedia]);
              }
            }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*,video/*";
              input.multiple = true;
              input.onchange = (e: any) => {
                if (e.target.files?.length > 0) {
                  const files = Array.from(e.target.files) as File[];
                  const newMedia = files.map((file) => ({
                    url: URL.createObjectURL(file),
                    type: file.type.startsWith("video/")
                      ? ("video" as const)
                      : ("image" as const),
                  }));
                  setMedia([...(media || []), ...newMedia]);
                }
              };
              input.click();
            }}
          >
            {media && media.length > 0 ? (
              <div
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 12,
                }}
              >
                {media.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 12,
                      overflow: "hidden",
                      position: "relative",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {m.type === "video" ? (
                      <video
                        src={m.url}
                        autoPlay
                        loop
                        muted
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={m.url}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.5)",
                        color: "white",
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        backdropFilter: "blur(4px)",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newMedia = [...media];
                        newMedia.splice(idx, 1);
                        setMedia(newMedia);
                      }}
                      className="hover-scale"
                    >
                      <X size={12} />
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    aspectRatio: "1",
                    borderRadius: 12,
                    border: "2px dashed rgba(44,32,22,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(44,32,22,0.4)",
                    gap: 4,
                  }}
                >
                  <Upload size={16} />
                  <span style={{ fontSize: 11, fontWeight: 600 }}>Add</span>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: "rgba(44,32,22,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Upload size={20} color="rgba(44,32,22,0.5)" />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(44,32,22,0.4)",
                    pointerEvents: "none",
                  }}
                >
                  Drag & drop files or click to browse
                </div>
              </>
            )}
          </div>

          {(() => {
            if (!media || media.length === 0 || !pId) return null;
            const firstMediaType = media[0].type;
            const warnings: string[] = [];
            const typeId =
              createPostPlatformTypes[pId] || pInfo?.contentTypes?.[0]?.id;
            if (!typeId) return null;

            const typeLabel =
              pInfo?.contentTypes?.find((x: any) => x.id === typeId)?.label ||
              typeId;

            if (
              firstMediaType === "image" &&
              ["reel", "video"].includes(typeId)
            ) {
              warnings.push(
                `${pInfo.name} (${typeLabel}) membutuhkan format Video.`,
              );
            }
            if (
              firstMediaType === "video" &&
              ["photo_carousel"].includes(typeId)
            ) {
              warnings.push(
                `${pInfo.name} (${typeLabel}) membutuhkan format Gambar.`,
              );
            }

            if (warnings.length > 0) {
              return (
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: 12,
                    background: "rgba(239,68,68,0.1)",
                    borderRadius: 12,
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#EF4444",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    <AlertTriangle size={16} /> Format Tidak Sesuai
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#EF4444",
                      fontWeight: 500,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {warnings.map((w, i) => (
                      <span key={i}>• {w}</span>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: "#FAFAFA",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <ContentModalMock />
      <PlatformIntegrationModal
        isOpen={integrationModal.isOpen}
        platformId={integrationModal.platformId}
        onClose={() => setIntegrationModal({ isOpen: false, platformId: null })}
        workspaceId={workspaceId}
        onSuccess={handleIntegrationSuccess}
      />

      <AnimatePresence>
        {disconnectPrompt.isOpen && disconnectPrompt.platformId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FAFAFA] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">
                  Disconnect{" "}
                  {
                    PLATFORMS.find((p) => p.id === disconnectPrompt.platformId)
                      ?.name
                  }
                  ?
                </h3>
                {disconnectPrompt.platformId && connectedAccountsData[disconnectPrompt.platformId]?.accountName && (
                  <p className="text-sm font-semibold text-[#111827]/80 mb-2">
                    Account: {connectedAccountsData[disconnectPrompt.platformId].accountName}
                  </p>
                )}
                <p className="text-sm text-[#111827]/60 mb-6">
                  Are you sure you want to disconnect this platform? You will
                  need to re-authenticate to connect it again.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDisconnectPrompt({ isOpen: false, platformId: null })
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-[#111827]/70 bg-black/5 hover:bg-black/10 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!workspaceId) return;
                      try {
                        await deleteDoc(
                          doc(
                            db,
                            "workspaces",
                            workspaceId,
                            "connectedAccounts",
                            disconnectPrompt.platformId!,
                          ),
                        );
                        setDisconnectPrompt({
                          isOpen: false,
                          platformId: null,
                        });
                      } catch (e) {
                        console.error(e);
                        alert("Failed to disconnect.");
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {!showCreatePostPopup ? (
        <div
          className={
            tab === "social-hub-ai"
              ? "flex-1 min-h-0 flex flex-col overflow-hidden"
              : tab === "social-inbox"
                ? "flex-1 min-h-0 flex flex-col overflow-hidden p-2 sm:p-4"
                : "flex-1 min-h-0 flex flex-col overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10"
          }
        >
          {/* DASHBOARD OVERVIEW */}
          {tab === "social-dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl md:text-[28px] font-extrabold text-[#2C2016] m-0">
                  Home
                </h2>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <CustomDropdown
                    value={dashboardPlatform}
                    options={PLATFORMS}
                    onChange={setDashboardPlatform}
                    pill
                  />
                  <CustomDropdown
                    value={dashTimeRange}
                    options={DASHBOARD_TIME_RANGES}
                    onChange={setDashTimeRange}
                    pill
                  />
                  <button
                    className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    onClick={() => setShowCreatePostPopup(true)}
                    style={{
                      background: "var(--theme-primary)",
                      border: "none",
                      borderRadius: 9999,
                      padding: "10px 24px",
                      cursor: "pointer",
                      fontWeight: 800,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                    }}
                  >
                    <Plus size={18} strokeWidth={2.5} /> Create a Post
                  </button>
                </div>
              </div>

              {metaApiError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <div className="mt-0.5 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-red-800 text-sm">Meta API Error</span>
                    <span className="text-red-600 text-sm leading-relaxed">{metaApiError}</span>
                  </div>
                </div>
              )}

              {/* KONEKSI PLATFORM - Minimalist Pills */}
              <div className="flex flex-col gap-3 mb-8">
                <span className="text-xs font-bold text-[#111827]/40 uppercase tracking-wider">
                  Platform Integrations
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  {PLATFORMS.filter((p) => p.id !== "all").map((p) => {
                    const isConn = connectedPlatforms.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleConnection(p.id)}
                        className={`group relative flex items-center gap-3 p-1.5 pr-4 rounded-full cursor-pointer transition-all duration-300 ${
                          isConn
                            ? "bg-white border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-red-200 hover:shadow-md hover:bg-red-50/50"
                            : "bg-black/[0.02] border border-black/5 hover:bg-black/[0.04] hover:border-black/10"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                            isConn
                              ? "text-white group-hover:!bg-red-500 group-hover:text-white"
                              : "bg-white text-[#111827]/40 shadow-sm"
                          }`}
                          style={isConn ? { backgroundColor: p.color } : {}}
                        >
                          {isConn ? (
                            <>
                              <div className="group-hover:hidden flex items-center justify-center w-full h-full">
                                {typeof p.icon === "string" ? (
                                  <span className="text-[10px] font-extrabold">
                                    {p.icon}
                                  </span>
                                ) : (
                                  React.cloneElement(
                                    p.icon as React.ReactElement,
                                    { size: 14 },
                                  )
                                )}
                              </div>
                              <div className="hidden group-hover:flex items-center justify-center w-full h-full">
                                <X size={14} strokeWidth={3} />
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              {typeof p.icon === "string" ? (
                                <span className="text-[10px] font-extrabold">
                                  {p.icon}
                                </span>
                              ) : (
                                React.cloneElement(
                                  p.icon as React.ReactElement,
                                  { size: 14 },
                                )
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <span
                            className={`text-sm font-semibold transition-colors duration-300 ${
                              isConn
                                ? "text-[#111827] group-hover:text-red-600"
                                : "text-[#111827]/60 group-hover:text-[#111827]/90"
                            }`}
                          >
                            {isConn ? (connectedAccountsData[p.id]?.accountName || p.name) : `Connect ${p.name}`}
                          </span>
                          {isConn && connectedAccountsData[p.id]?.accountName && (
                            <span className="text-[10px] text-[#111827]/50 font-medium -mt-0.5 group-hover:text-red-400 transition-colors">
                              {p.name}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-8 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#111827] flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDiagnosing ? "animate-spin text-blue-600" : "text-blue-600"}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                      System Connection Diagnostic
                    </span>
                    <span className="text-xs text-[#111827]/60">Cek apakah token akses sosial media Anda masih valid atau sudah expired</span>
                  </div>
                  <button
                    onClick={runDiagnostic}
                    disabled={isDiagnosing}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isDiagnosing ? "Memeriksa..." : "Test Koneksi"}
                  </button>
                </div>
                
                {Object.keys(diagnosticResult).length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {Object.entries(diagnosticResult).map(([plat, res]: [string, any]) => (
                      <div key={plat} className={`text-xs p-3 rounded-lg border ${res.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <span className="font-bold capitalize">{plat === 'all' ? 'System' : plat}: </span>
                        <span>{res.message}</span>
                        {res.status === 'error' && res.message.includes('token') && (
                          <div className="mt-2 font-semibold text-red-900 bg-red-100/50 p-2 rounded-md">
                            💡 Solusi: Token otorisasi sudah kadaluarsa (expired) atau tidak valid. Silakan klik icon {plat} di atas untuk "Disconnect", lalu klik lagi untuk "Connect" ulang agar mendapatkan token yang baru.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ANALYTICS EXPERT */}
          {tab === "social-analytics" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#2C2016",
                      margin: 0,
                    }}
                  >
                    Analytics Expert
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(44,32,22,0.5)",
                      margin: "4px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    Data mendalam dengan AI Analysis.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <CustomDropdown
                    value={analyticsPlatform}
                    options={PLATFORMS}
                    onChange={setAnalyticsPlatform}
                    pill={true}
                  />
                  <CustomDropdown
                    value={analyticsTimeRange}
                    options={DASHBOARD_TIME_RANGES}
                    onChange={setAnalyticsTimeRange}
                    pill={true}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {[
                  {
                    lb: "Views",
                    v: "1,240,551",
                    gr: "+15.2%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Reach",
                    v: "980,123",
                    gr: "+10.1%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Total ER",
                    v: "5.2%",
                    gr: "+1.2%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Komentar",
                    v: "4,120",
                    gr: "-2.1%",
                    st: "#9C2B4E",
                    bg: "#F8EAF0",
                  },
                  {
                    lb: "Likes",
                    v: "88,312",
                    gr: "+40.5%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Share",
                    v: "10,204",
                    gr: "+5.0%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Repost",
                    v: "2,300",
                    gr: "-1.0%",
                    st: "#9C2B4E",
                    bg: "#F8EAF0",
                  },
                  {
                    lb: "Save",
                    v: "14,500",
                    gr: "+20.4%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="hover-scale"
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      borderRadius: 24,
                      padding: 24,
                      border: "1px solid rgba(0,0,0,0.03)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "rgba(44,32,22,0.5)",
                        marginBottom: 8,
                      }}
                    >
                      {s.lb}
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: "#2C2016",
                        }}
                      >
                        {s.v}
                      </div>
                      <div
                        style={{
                          background: s.bg,
                          color: s.st,
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {s.gr}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Chart Segment */}
              <div
                style={{
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: 32,
                  border: "1px solid rgba(0,0,0,0.03)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
                  padding: 32,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                    Grafik Tren{" "}
                    {
                      ANALYTICS_METRICS.find((m) => m.id === analyticsMetric)
                        ?.label
                    }
                  </h3>
                  <CustomDropdown
                    value={analyticsMetric}
                    options={ANALYTICS_METRICS}
                    onChange={setAnalyticsMetric}
                  />
                </div>
                <div style={{ height: 300, width: "100%" }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={MOCK_CHART_DATA}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(44,32,22,0.05)"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "rgba(44,32,22,0.5)",
                          fontWeight: 600,
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "rgba(44,32,22,0.5)",
                          fontWeight: 600,
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "none",
                          boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
                          fontWeight: 700,
                        }}
                      />
                      {analyticsMetric === "all" && (
                        <Legend
                          iconType="circle"
                          wrapperStyle={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#2C2016",
                          }}
                        />
                      )}
                      {analyticsMetric === "all" ? (
                        <>
                          <Line
                            type="monotone"
                            dataKey="views"
                            name="Views"
                            stroke="var(--theme-primary)"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="reach"
                            name="Reach"
                            stroke="#2D7A5E"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="likes"
                            name="Likes"
                            stroke="#9C2B4E"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="comments"
                            name="Komentar"
                            stroke="#1877F2"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="shares"
                            name="Share"
                            stroke="#000"
                            strokeWidth={2}
                            dot={false}
                          />
                        </>
                      ) : (
                        <Line
                          type="monotone"
                          dataKey={analyticsMetric}
                          name={
                            ANALYTICS_METRICS.find(
                              (m) => m.id === analyticsMetric,
                            )?.label
                          }
                          stroke="var(--theme-primary)"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Audience & AI */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: 20,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: 32,
                    padding: 32,
                    border: "1px solid rgba(0,0,0,0.03)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                      Data Audiens
                    </h3>
                    <CustomDropdown
                      value={audiencePlatform}
                      options={PLATFORMS}
                      onChange={setAudiencePlatform}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "rgba(44,32,22,0.5)",
                          marginBottom: 16,
                        }}
                      >
                        Demografi Geografis
                      </h4>
                      <div
                        style={{
                          height: 200,
                          width: "100%",
                          background: "#E5EDF8",
                          borderRadius: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            background:
                              "url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Indonesia_blank_map.svg') center center/contain no-repeat",
                            opacity: 0.5,
                          }}
                        />
                        <div
                          className="hover-scale"
                          style={{
                            position: "absolute",
                            top: "55%",
                            left: "30%",
                          }}
                        >
                          <MapPin
                            size={24}
                            color="var(--theme-primary)"
                            fill="white"
                          />
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: "white",
                              padding: "2px 4px",
                              borderRadius: 4,
                              color: "#2C2016",
                              position: "absolute",
                              top: 24,
                              left: -10,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Jakarta (45%)
                          </div>
                        </div>
                        <div
                          className="hover-scale"
                          style={{
                            position: "absolute",
                            top: "65%",
                            left: "45%",
                          }}
                        >
                          <MapPin
                            size={16}
                            color="var(--theme-primary)"
                            fill="white"
                          />
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: "white",
                              padding: "2px 4px",
                              borderRadius: 4,
                              color: "#2C2016",
                              position: "absolute",
                              top: 16,
                              left: -10,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Surabaya (15%)
                          </div>
                        </div>
                        <div
                          className="hover-scale"
                          style={{
                            position: "absolute",
                            top: "35%",
                            left: "15%",
                          }}
                        >
                          <MapPin
                            size={12}
                            color="var(--theme-primary)"
                            fill="white"
                          />
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: "white",
                              padding: "2px 4px",
                              borderRadius: 4,
                              color: "#2C2016",
                              position: "absolute",
                              top: 12,
                              left: -10,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Medan (10%)
                          </div>
                        </div>
                        <div
                          className="hover-scale"
                          style={{
                            position: "absolute",
                            top: "60%",
                            left: "75%",
                          }}
                        >
                          <MapPin
                            size={12}
                            color="var(--theme-primary)"
                            fill="white"
                          />
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: "white",
                              padding: "2px 4px",
                              borderRadius: 4,
                              color: "#2C2016",
                              position: "absolute",
                              top: 12,
                              left: -10,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Makassar (10%)
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "rgba(44,32,22,0.5)",
                          marginBottom: 16,
                        }}
                      >
                        Gender & Umur
                      </h4>
                      <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { age: "18-24", p: 40, l: 30 },
                              { age: "25-34", p: 35, l: 25 },
                              { age: "35-44", p: 15, l: 10 },
                            ]}
                            layout="vertical"
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              horizontal={false}
                              stroke="rgba(44,32,22,0.05)"
                            />
                            <XAxis type="number" hide />
                            <YAxis
                              dataKey="age"
                              type="category"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fontWeight: 800 }}
                              width={40}
                            />
                            <RechartsTooltip
                              cursor={{ fill: "transparent" }}
                              contentStyle={{
                                borderRadius: 8,
                                fontWeight: 700,
                                border: "none",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Bar
                              dataKey="p"
                              name="Perempuan"
                              fill="var(--theme-primary)"
                              radius={[0, 4, 4, 0]}
                              maxBarSize={16}
                            />
                            <Bar
                              dataKey="l"
                              name="Laki-laki"
                              fill="#2C2016"
                              radius={[0, 4, 4, 0]}
                              maxBarSize={16}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(var(--theme-primary-rgb), 0.05)",
                    borderRadius: 32,
                    padding: 32,
                    border: "1px solid rgba(var(--theme-primary-rgb), 0.1)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--theme-primary)",
                      }}
                    >
                      <Sparkles size={18} /> Gemini AI
                    </h3>
                  </div>
                  <button
                    className="hover-scale"
                    onClick={generateReport}
                    disabled={aiLoading}
                    style={{
                      background: "var(--theme-primary)",
                      color: "white",
                      border: "none",
                      padding: "12px 16px",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      width: "100%",
                      marginBottom: 20,
                      flexShrink: 0,
                    }}
                  >
                    {aiLoading
                      ? "Gemini sedang berpikir..."
                      : "Analisis Insight Saat Ini"}
                  </button>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {aiReport ? (
                      <div
                        className="markdown-body"
                        style={{
                          fontSize: 14,
                          color: "#2C2016",
                          lineHeight: 1.6,
                        }}
                      >
                        <Markdown>{aiReport}</Markdown>
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          color: "rgba(44,32,22,0.5)",
                          marginTop: 40,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        Klik tombol di atas untuk mendapatkan analisa pakar dari
                        Gemini.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 24,
                  border: "1px solid rgba(44,32,22,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                    Best Time to Post (Heatmap)
                  </h3>
                  <CustomDropdown
                    value={heatmapMetric}
                    options={[
                      { id: "views", label: "Berdasarkan Views" },
                      { id: "engagement", label: "Berdasarkan Engagement" },
                    ]}
                    onChange={setHeatmapMetric}
                  />
                </div>
                <HeatmapMock />
              </div>
            </motion.div>
          )}

          {/* CONTENT TAB */}
          {tab === "social-content" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    Content
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(44,32,22,0.6)",
                      margin: "4px 0 0",
                      fontWeight: 500,
                    }}
                  >
                    Schedule, publish and manage posts, reels and stories, and
                    more.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    className="hover-scale"
                    style={{
                      background: "white",
                      color: "#111827",
                      borderRadius: 8,
                      padding: "8px 16px",
                      border: "1px solid rgba(0,0,0,0.1)",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Download size={14} /> Export data <ChevronDown size={14} />
                  </button>
                  <button
                    className="hover-scale"
                    style={{
                      background: "white",
                      color: "#111827",
                      borderRadius: 8,
                      padding: "8px 16px",
                      border: "1px solid rgba(0,0,0,0.1)",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Video size={14} /> Create reel
                  </button>
                  <button
                    className="hover-scale"
                    style={{
                      background: "var(--theme-primary)",
                      color: "white",
                      borderRadius: 8,
                      padding: "8px 16px",
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Edit size={14} /> Create post <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 24,
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  marginBottom: 16,
                }}
              >
                {[
                  "Published",
                  "Scheduled",
                  "Drafts",
                  "Expiring",
                  "Expired",
                  "Ad Posts",
                ].map((t, idx) => (
                  <div
                    key={t}
                    style={{
                      paddingBottom: 12,
                      fontWeight: 600,
                      fontSize: 14,
                      color:
                        idx === 0
                          ? "var(--theme-primary)"
                          : "rgba(44,32,22,0.6)",
                      borderBottom:
                        idx === 0
                          ? "2px solid var(--theme-primary)"
                          : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <CustomDropdown
                    value={contentPlatform}
                    options={PLATFORMS}
                    onChange={setContentPlatform}
                  />
                  <CustomDropdown
                    value={"Post type"}
                    options={[{ id: "Post type", label: "Post type" }]}
                    onChange={() => {}}
                  />
                  <CustomDropdown
                    value={"Filter"}
                    options={[{ id: "Filter", label: "Filter" }]}
                    onChange={() => {}}
                  />
                  <div style={{ position: "relative" }}>
                    <Search
                      size={14}
                      color="gray"
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search by ID or caption"
                      style={{
                        padding: "8px 16px 8px 36px",
                        borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.1)",
                        fontSize: 13,
                        width: 220,
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    style={{
                      padding: "8px 16px",
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CalendarIcon size={14} /> Last 90 days: Mar 31, 2026 - Jun
                    28, 2026 <ChevronDown size={14} />
                  </button>
                  <button
                    style={{
                      padding: "8px 16px",
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Layout size={14} /> Columns <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  border: "1px solid rgba(44,32,22,0.05)",
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: 800,
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead
                    style={{
                      background: "#FAFAFA",
                      borderBottom: "1px solid rgba(44,32,22,0.1)",
                      color: "rgba(44,32,22,0.5)",
                    }}
                  >
                    <tr>
                      <th
                        style={{
                          padding: "16px",
                          width: 40,
                          textAlign: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{
                            cursor: "pointer",
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: "1px solid #ccc",
                          }}
                        />
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          textAlign: "left",
                          fontWeight: 700,
                          minWidth: 350,
                          color: "#111827",
                        }}
                      >
                        Title
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          Date published{" "}
                          <ArrowDown size={14} color="var(--theme-primary)" />
                        </div>
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          Views <Info size={14} color="gray" />{" "}
                          <ArrowUpDown size={12} color="gray" />
                        </div>
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          Reach <Info size={14} color="gray" />{" "}
                          <ArrowUpDown size={12} color="gray" />
                        </div>
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          Likes and
                          <br />
                          reactions <Info size={14} color="gray" />{" "}
                          <ArrowUpDown size={12} color="gray" />
                        </div>
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          Comments <Info size={14} color="gray" />{" "}
                          <ArrowUpDown size={12} color="gray" />
                        </div>
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          Shares <Info size={14} color="gray" />{" "}
                          <ArrowUpDown size={12} color="gray" />
                        </div>
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          Saves <Info size={14} color="gray" />{" "}
                          <ArrowUpDown size={12} color="gray" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DISPLAY_CONTENT.map((post, i) => (
                      <tr
                        key={i}
                        className="hover-fade"
                        style={{
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                          transition: "background 0.2s",
                          verticalAlign: "top",
                        }}
                      >
                        <td
                          style={{
                            padding: "16px",
                            textAlign: "center",
                            width: 40,
                            verticalAlign: "middle",
                          }}
                        >
                          <input
                            type="checkbox"
                            style={{
                              cursor: "pointer",
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              border: "1px solid #ccc",
                            }}
                          />
                        </td>
                        <td style={{ padding: "16px 8px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                                minWidth: 0,
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  width: 48,
                                  height: 48,
                                  flexShrink: 0,
                                  borderRadius: 8,
                                  overflow: "hidden",
                                  background: "#f0f0f0",
                                }}
                              >
                                <img
                                  src={post.thumbnail}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: -4,
                                    right: -4,
                                    background: "white",
                                    borderRadius: "50%",
                                    padding: 2,
                                  }}
                                >
                                  {post.type === "instagram" ? (
                                    <div
                                      style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background:
                                          "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Instagram size={10} color="white" />
                                    </div>
                                  ) : post.type === "meta" ? (
                                    <div
                                      style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#1877F2",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Facebook size={10} color="white" />
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "black",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: 8,
                                          color: "white",
                                          fontWeight: 800,
                                        }}
                                      >
                                        TT
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  minWidth: 0,
                                  gap: 4,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "#111827",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 200,
                                  }}
                                >
                                  {post.captionSnippet}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 12,
                                    color: "rgba(0,0,0,0.6)",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    {post.postTypeLabel === "Carousel" ? (
                                      <Layout size={12} />
                                    ) : post.postTypeLabel === "Reel" ? (
                                      <Video size={12} />
                                    ) : post.postTypeLabel === "Multi media" ? (
                                      <ImageIcon size={12} />
                                    ) : (
                                      <ImageIcon size={12} />
                                    )}
                                    {post.postTypeLabel}
                                  </div>
                                  <div
                                    style={{
                                      width: 3,
                                      height: 3,
                                      borderRadius: "50%",
                                      background: "currentColor",
                                    }}
                                  />
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: "50%",
                                        background: "#ccc",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                      }}
                                    >
                                      <User size={10} color="white" />
                                    </div>
                                    {post.accountName}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                                paddingRight: 16,
                              }}
                            >
                              <button
                                style={{
                                  background: "white",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  borderRadius: 6,
                                  padding: "4px 12px",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#111827",
                                  cursor: "pointer",
                                }}
                              >
                                Boost
                              </button>
                              <button
                                style={{
                                  background: "white",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  borderRadius: 6,
                                  padding: "4px 8px",
                                  color: "#111827",
                                  cursor: "pointer",
                                }}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px 8px",
                            verticalAlign: "middle",
                            fontSize: 13,
                            color: "#111827",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {post.time}
                        </td>
                        <td
                          style={{
                            padding: "16px 8px",
                            verticalAlign: "middle",
                            fontSize: 13,
                            color: "#111827",
                          }}
                        >
                          {post.views > 1000
                            ? (post.views / 1000).toFixed(1) + "K"
                            : post.views}
                        </td>
                        <td
                          style={{
                            padding: "16px 8px",
                            verticalAlign: "middle",
                            fontSize: 13,
                            color: "#111827",
                          }}
                        >
                          {post.reach
                            ? post.reach > 1000
                              ? (post.reach / 1000).toFixed(1) + "K"
                              : post.reach
                            : "--"}
                        </td>
                        <td
                          style={{
                            padding: "16px 8px",
                            verticalAlign: "middle",
                            fontSize: 13,
                            color: "#111827",
                          }}
                        >
                          {post.likes}
                        </td>
                        <td
                          style={{
                            padding: "16px 8px",
                            verticalAlign: "middle",
                            fontSize: 13,
                            color: "#111827",
                          }}
                        >
                          {post.comments}
                        </td>
                        <td
                          style={{
                            padding: "16px 8px",
                            verticalAlign: "middle",
                            fontSize: 13,
                            color: "#111827",
                          }}
                        >
                          {post.shares}
                        </td>
                        <td
                          style={{
                            padding: "16px 8px",
                            verticalAlign: "middle",
                            fontSize: 13,
                            color: "#111827",
                          }}
                        >
                          {post.saves}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* CALENDAR */}
          {tab === "social-calendar" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#2C2016",
                      margin: 0,
                    }}
                  >
                    Kalender Konten Sosial
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(44,32,22,0.5)",
                      margin: "4px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    Lihat semua postingan yang terpublikasi atau jadwalkan plan.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => {
                      alert(
                        "Fitur AI Calendar sedang menjalankan mockup auto-assign.",
                      );
                      setCalendarPosts([
                        ...calendarPosts,
                        {
                          day: Math.floor(Math.random() * 28 + 1),
                          type: "tt",
                          title: "Ide Konten AI 1",
                          time: "10:00",
                        },
                        {
                          day: Math.floor(Math.random() * 28 + 1),
                          type: "ig",
                          title: "Ide Konten AI 2",
                          time: "15:30",
                        },
                      ]);
                    }}
                    className="hover-scale"
                    style={{
                      background: "var(--theme-primary)",
                      color: "white",
                      padding: "0 16px",
                      borderRadius: 12,
                      fontWeight: 800,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkles size={16} /> Auto-Plan AI
                  </button>
                  <CustomDropdown
                    value={contentPlatform}
                    options={PLATFORMS}
                    onChange={setContentPlatform}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "white",
                      border: "1px solid rgba(44,32,22,0.1)",
                      borderRadius: 12,
                      padding: 4,
                    }}
                  >
                    <button
                      className="hover-scale"
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 6,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        padding: "0 12px",
                      }}
                    >
                      Agustus 2026
                    </div>
                    <button
                      className="hover-scale"
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 6,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <CalendarMock />
            </motion.div>
          )}

          {/* COMPETITOR ANALYSIS */}
          {tab === "social-competitor" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#2C2016",
                      margin: 0,
                    }}
                  >
                    Analisis Kompetitor
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(44,32,22,0.5)",
                      margin: "4px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    Bandingkan performa hingga 5 akun kompetitor secara
                    realtime.
                  </p>
                </div>
                <CustomDropdown
                  value={contentPlatform}
                  options={PLATFORMS}
                  onChange={setContentPlatform}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <input
                  placeholder="Ketik username kompetitor (contoh: @kompetitor)..."
                  value={compInput}
                  onChange={(e) => setCompInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCompetitor();
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(44,32,22,0.1)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                />
                <button
                  onClick={addCompetitor}
                  disabled={compLoading}
                  className="hover-scale"
                  style={{
                    background: compLoading ? "rgba(44,32,22,0.5)" : "#2C2016",
                    color: "white",
                    border: "none",
                    padding: "0 24px",
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: compLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {compLoading ? "Menganalisis..." : "Tambah Kompetitor"}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                {competitors.map((comp: any, idx: number) => (
                  <div
                    key={idx}
                    className="hover-scale"
                    style={{
                      background: "white",
                      borderRadius: 20,
                      padding: 24,
                      border: "1px solid rgba(44,32,22,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            background: "#FAFAFA",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <User size={20} color="rgba(44,32,22,0.3)" />
                        </div>
                        <h3
                          style={{ fontSize: 18, fontWeight: 800, margin: 0 }}
                        >
                          {comp.username}
                        </h3>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#2D7A5E",
                          background: "#E5F4EE",
                          padding: "6px 10px",
                          borderRadius: 8,
                        }}
                      >
                        ER: {comp.er}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "rgba(44,32,22,0.5)",
                        marginBottom: 16,
                        fontWeight: 600,
                      }}
                    >
                      Rata-rata posting:{" "}
                      <strong style={{ color: "#2C2016" }}>
                        {comp.postsPerMonth} per bulan
                      </strong>
                    </div>
                    <h4
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        marginBottom: 12,
                      }}
                    >
                      Top 3 Konten Mereka
                    </h4>
                    {comp.topContent.map((c: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 12,
                          marginBottom: 12,
                          paddingBottom: 12,
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 8,
                            background: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ImageIcon size={24} color="#ccc" />
                        </div>
                        <div style={{ alignSelf: "center" }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              marginBottom: 4,
                            }}
                          >
                            {c.title}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "rgba(44,32,22,0.5)",
                              fontWeight: 700,
                            }}
                          >
                            {c.views} Views • {c.likes} Likes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {competitors.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: 40,
                      background: "white",
                      borderRadius: 20,
                      border: "1px dashed rgba(44,32,22,0.2)",
                    }}
                  >
                    <Search
                      size={48}
                      style={{ opacity: 0.2, margin: "0 auto 16px" }}
                    />
                    <h3
                      style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}
                    >
                      Belum Ada Kompetitor
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "rgba(44,32,22,0.6)",
                        fontWeight: 500,
                      }}
                    >
                      Tambahkan link profile atau username kompetitor Anda untuk
                      dianalisis oleh AI Hubify.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* INBOX */}
          {tab === "social-inbox" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ flex: 1, minHeight: 0, display: "flex", gap: 12 }}
            >
              <div
                style={{
                  width: 320,
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: 32,
                  border: "1px solid rgba(0,0,0,0.03)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    padding: "16px 16px 12px",
                    borderBottom: "1px solid rgba(44,32,22,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                      Inbox
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        background: "rgba(44,32,22,0.04)",
                        padding: 4,
                        borderRadius: 12,
                      }}
                    >
                      <button
                        onClick={() => {
                          setInboxViewMode("dms");
                          setSelectedComment(null);
                        }}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          background:
                            inboxViewMode === "dms" ? "white" : "transparent",
                          color:
                            inboxViewMode === "dms"
                              ? "black"
                              : "rgba(44,32,22,0.6)",
                          boxShadow:
                            inboxViewMode === "dms"
                              ? "0 2px 8px rgba(0,0,0,0.05)"
                              : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        Messages
                      </button>
                      <button
                        onClick={() => {
                          setInboxViewMode("comments");
                          setSelectedInboxMsg(null);
                        }}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          background:
                            inboxViewMode === "comments"
                              ? "white"
                              : "transparent",
                          color:
                            inboxViewMode === "comments"
                              ? "black"
                              : "rgba(44,32,22,0.6)",
                          boxShadow:
                            inboxViewMode === "comments"
                              ? "0 2px 8px rgba(0,0,0,0.05)"
                              : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        Comments
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    <button
                      onClick={() => setInboxFilter("all")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${inboxFilter === "all" ? "bg-blue-50 text-blue-600" : "bg-transparent text-gray-600 hover:bg-gray-50"}`}
                    >
                      All messages
                    </button>
                    <button
                      onClick={() => setInboxFilter("instagram")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${inboxFilter === "instagram" ? "bg-blue-50 text-blue-600" : "bg-transparent text-gray-600 hover:bg-gray-50"}`}
                    >
                      Instagram
                    </button>
                    <button
                      onClick={() => setInboxFilter("tiktok")}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${inboxFilter === "tiktok" ? "bg-blue-50 text-blue-600" : "bg-transparent text-gray-600 hover:bg-gray-50"}`}
                    >
                      TikTok
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <Search
                        size={14}
                        color="rgba(44,32,22,0.4)"
                        style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      />
                      <input
                        placeholder="Search"
                        style={{
                          width: "100%",
                          padding: "6px 10px 6px 28px",
                          borderRadius: 6,
                          border: "1px solid rgba(44,32,22,0.15)",
                          fontSize: 12,
                          fontFamily: "inherit",
                          outline: "none",
                        }}
                      />
                    </div>
                    <button className="px-2 py-1 rounded-md border border-gray-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-50 text-gray-700">
                      <Settings size={12} /> Manage
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      borderBottom: "1px solid rgba(44,32,22,0.05)",
                      paddingBottom: 8,
                    }}
                  >
                    <span className="text-[11px] font-semibold text-gray-500 cursor-pointer hover:text-gray-800">
                      Unread
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 cursor-pointer hover:text-gray-800">
                      Priority
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 cursor-pointer hover:text-gray-800">
                      Ad replies
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 cursor-pointer hover:text-gray-800">
                      Follow up
                    </span>
                    <div style={{ flex: 1 }} />
                    <button className="text-gray-500 hover:bg-gray-100 p-0.5 rounded-md cursor-pointer">
                      <List size={12} />
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {inboxViewMode === "dms" ? (
                    <>
                      {inboxMessages.filter((m) =>
                        inboxFilter === "all"
                          ? true
                          : m.platform === inboxFilter ||
                            m.platform ===
                              (inboxFilter === "instagram" ? "meta" : ""),
                      ).length === 0 && (
                        <div className="p-6 text-center text-gray-400 text-sm font-semibold">
                          Belum ada pesan di kotak masuk ini.
                        </div>
                      )}
                      {inboxMessages
                        .filter((m) =>
                          inboxFilter === "all"
                            ? true
                            : m.platform === inboxFilter ||
                              m.platform ===
                                (inboxFilter === "instagram" ? "meta" : ""),
                        )
                        .map((msg, i) => (
                          <div
                            key={msg.id}
                            onClick={() => setSelectedInboxMsg(msg)}
                            className="hover-scale"
                            style={{
                              padding:
                                selectedInboxMsg?.id === msg.id
                                  ? "12px 16px 12px 12px"
                                  : "12px 16px",
                              borderBottom: "1px solid rgba(44,32,22,0.05)",
                              borderLeft:
                                selectedInboxMsg?.id === msg.id
                                  ? "4px solid var(--theme-primary)"
                                  : "4px solid transparent",
                              cursor: "pointer",
                              display: "flex",
                              gap: 12,
                              background:
                                selectedInboxMsg?.id === msg.id
                                  ? "rgba(44,32,22,0.03)"
                                  : "transparent",
                            }}
                          >
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
                              style={{
                                background:
                                  msg.platform === "meta" ||
                                  msg.platform === "instagram"
                                    ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                                    : "black",
                              }}
                            >
                              {(msg.senderName?.[0] || "U").toUpperCase()}
                            </div>
                            <div style={{ overflow: "hidden", flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 500,
                                  fontSize: 12,
                                  marginBottom: 4,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 6,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    overflow: "hidden",
                                  }}
                                >
                                  <span
                                    style={{
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {msg.senderName || `User ${msg.senderId}`}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 9,
                                      background:
                                        msg.platform === "meta" ||
                                        msg.platform === "instagram"
                                          ? "#F8EAF0"
                                          : "#f0f0f0",
                                      color:
                                        msg.platform === "meta" ||
                                        msg.platform === "instagram"
                                          ? "#E4405F"
                                          : "#000",
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      fontWeight: 800,
                                    }}
                                  >
                                    {msg.platform === "meta" ||
                                    msg.platform === "instagram"
                                      ? "IG"
                                      : "TT"}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "rgba(44,32,22,0.4)",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {msg.createdAt
                                    ? new Date(
                                        msg.createdAt,
                                      ).toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "2j"}
                                </div>
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color:
                                    selectedInboxMsg?.id === msg.id
                                      ? "#111827"
                                      : "rgba(44,32,22,0.6)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontWeight: 400,
                                }}
                              >
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        ))}
                    </>
                  ) : (
                    <>
                      {mergedComments.filter((m) =>
                        inboxFilter === "all"
                          ? true
                          : m.platform === inboxFilter ||
                            m.platform ===
                              (inboxFilter === "instagram" ? "meta" : ""),
                      ).length === 0 && (
                        <div className="p-6 text-center text-gray-400 text-sm font-semibold">
                          Belum ada komentar untuk saat ini.
                        </div>
                      )}
                      {mergedComments.filter((m) =>
                        inboxFilter === "all"
                          ? true
                          : m.platform === inboxFilter ||
                            m.platform ===
                              (inboxFilter === "instagram" ? "meta" : ""),
                      ).map((msg, i) => (
                        <div
                          key={msg.id}
                          onClick={() => setSelectedComment(msg)}
                          className="hover-scale"
                          style={{
                            padding:
                              selectedComment?.id === msg.id
                                ? "12px 16px 12px 12px"
                                : "12px 16px",
                            borderBottom: "1px solid rgba(44,32,22,0.05)",
                            borderLeft:
                              selectedComment?.id === msg.id
                                ? "4px solid var(--theme-primary)"
                                : "4px solid transparent",
                            cursor: "pointer",
                            display: "flex",
                            gap: 12,
                            background:
                              selectedComment?.id === msg.id
                                ? "rgba(44,32,22,0.03)"
                                : "transparent",
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative"
                            style={{
                              border: "1px solid rgba(44,32,22,0.05)",
                            }}
                          >
                            <img
                              src={msg.postThumbnail}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            {msg.platform === "instagram" && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: -2,
                                  right: -2,
                                  background: "white",
                                  borderRadius: "50%",
                                  padding: 2,
                                }}
                              >
                                <div
                                  style={{
                                    background:
                                      "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                                    borderRadius: "50%",
                                    padding: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                  }}
                                >
                                  <Instagram size={8} />
                                </div>
                              </div>
                            )}
                          </div>
                          <div style={{ overflow: "hidden", flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 12,
                                marginBottom: 4,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 6,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  overflow: "hidden",
                                }}
                              >
                                <span
                                  style={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    fontWeight: 700,
                                    fontSize: 13,
                                  }}
                                >
                                  {msg.postCaption}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "rgba(44,32,22,0.4)",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleTimeString(
                                      "id-ID",
                                      { hour: "2-digit", minute: "2-digit" },
                                    )
                                  : "2j"}
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color:
                                  selectedComment?.id === msg.id
                                    ? "#111827"
                                    : "rgba(44,32,22,0.6)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontWeight: 400,
                              }}
                            >
                              {msg.senderName} commented
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: 32,
                  border: "1px solid rgba(0,0,0,0.03)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {inboxViewMode === "dms" ? (
                  selectedInboxMsg ? (
                    <>
                      <div
                        style={{
                          padding: "16px 24px",
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{
                              background:
                                selectedInboxMsg.platform === "meta" ||
                                selectedInboxMsg.platform === "instagram"
                                  ? "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
                                  : "black",
                            }}
                          >
                            {(
                              selectedInboxMsg.senderName?.[0] || "U"
                            ).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 14,
                                color: "#111827",
                              }}
                            >
                              {selectedInboxMsg.senderName ||
                                `User ${selectedInboxMsg.senderId}`}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "rgba(44,32,22,0.6)",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                cursor: "pointer",
                              }}
                            >
                              Assign this conversation <ChevronDown size={12} />
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <AlertTriangle size={14} />
                          </button>
                          <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                          <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Star size={14} />
                          </button>
                          <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <MessageSquare size={14} />
                          </button>
                          <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors">
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                      <div
                        ref={inboxChatScrollRef}
                        style={{
                          flex: 1,
                          padding: 24,
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                          background: "#FAFAFA",
                        }}
                      >
                        <div style={{ textAlign: "center", marginBottom: 16 }}>
                          <span
                            style={{
                              background: "transparent",
                              fontSize: 12,
                              fontWeight: 500,
                              color: "rgba(44,32,22,0.5)",
                            }}
                          >
                            {selectedInboxMsg.createdAt
                              ? new Date(
                                  selectedInboxMsg.createdAt,
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "May 23, 2026, 1:20 PM"}
                          </span>
                        </div>
                        <div
                          style={{
                            background: "white",
                            border: "1px solid rgba(44,32,22,0.05)",
                            padding: "12px 16px",
                            borderRadius: "16px 16px 16px 4px",
                            maxWidth: "70%",
                            alignSelf: "flex-start",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 14,
                              lineHeight: 1.5,
                              color: "#111827",
                              fontWeight: 500,
                            }}
                          >
                            {selectedInboxMsg.content}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "rgba(44,32,22,0.4)",
                              fontWeight: 500,
                              marginTop: 4,
                              textAlign: "left",
                            }}
                          >
                            {selectedInboxMsg.createdAt
                              ? new Date(
                                  selectedInboxMsg.createdAt,
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "13.41"}
                          </div>
                        </div>
                        {selectedInboxMsg.replies &&
                          selectedInboxMsg.replies.map(
                            (reply: any, idx: number) => (
                              <div
                                key={idx}
                                style={{
                                  background: "#8b5cf6",
                                  color: "white",
                                  padding: "12px 16px",
                                  borderRadius: "16px 16px 4px 16px",
                                  maxWidth: "70%",
                                  alignSelf: "flex-end",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 14,
                                    lineHeight: 1.5,
                                    fontWeight: 500,
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {reply.content}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,0.7)",
                                    fontWeight: 500,
                                    marginTop: 4,
                                    textAlign: "right",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  {reply.createdAt
                                    ? new Date(
                                        reply.createdAt,
                                      ).toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "13.41"}
                                  <Check
                                    size={12}
                                    color="rgba(255,255,255,0.7)"
                                  />
                                </div>
                              </div>
                            ),
                          )}
                      </div>
                      <div
                        style={{
                          padding: 20,
                          borderTop: "1px solid rgba(44,32,22,0.05)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          background: "white",
                        }}
                      >
                        <div
                          style={{ display: "flex", gap: 8, overflowX: "auto" }}
                          className="no-scrollbar"
                        >
                          <button
                            onClick={() =>
                              setMsgContent(
                                "Terima kasih atas masukannya kak! Akan kami sampaikan ke tim terkait 🙏",
                              )
                            }
                            className="hover-scale"
                            style={{
                              background: "#FDF0EB",
                              color: "var(--theme-primary)",
                              padding: "8px 12px",
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Sparkles size={12} /> AI: Apresiasi Singkat
                          </button>
                          <button
                            onClick={() =>
                              setMsgContent(
                                `Hi ${selectedInboxMsg.senderName?.split(" ")[0] || "kak"}, maaf atas kendalanya. Boleh info nomor pesanannya agar bisa kami cek?`,
                              )
                            }
                            className="hover-scale"
                            style={{
                              background: "#FDF0EB",
                              color: "var(--theme-primary)",
                              padding: "8px 12px",
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Sparkles size={12} /> AI: Tanya Order ID
                          </button>
                          <button
                            onClick={() =>
                              setMsgContent(
                                `Hi ${selectedInboxMsg.senderName?.split(" ")[0] || "kak"}, sebagai permohonan maaf, ini voucher diskon 10% untuk pesanan berikutnya ya: MAAF10`,
                              )
                            }
                            className="hover-scale"
                            style={{
                              background: "#FDF0EB",
                              color: "var(--theme-primary)",
                              padding: "8px 12px",
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 700,
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Sparkles size={12} /> AI: Beri Diskon
                          </button>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                            background: "white",
                            border: "1px solid rgba(44,32,22,0.1)",
                            borderRadius: 24,
                            padding: "4px 4px 4px 16px",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                marginRight: 8,
                                color: "rgba(44,32,22,0.4)",
                              }}
                            >
                              {selectedInboxMsg.platform === "meta" ||
                              selectedInboxMsg.platform === "instagram" ? (
                                <Instagram size={18} />
                              ) : (
                                <MessageCircle size={18} />
                              )}
                            </div>
                            <input
                              placeholder={`Reply on ${selectedInboxMsg.platform === "tiktok" ? "TikTok" : "Instagram"}...`}
                              value={msgContent}
                              onChange={(e) => setMsgContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && msgContent.trim()) {
                                  sendDMMessage(msgContent);
                                  setMsgContent("");
                                }
                              }}
                              style={{
                                width: "100%",
                                padding: "10px 0",
                                border: "none",
                                fontSize: 14,
                                outline: "none",
                                fontFamily: "inherit",
                                fontWeight: 500,
                                background: "transparent",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              paddingRight: 8,
                              color: "rgba(44,32,22,0.5)",
                            }}
                          >
                            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                              <Paperclip size={18} />
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                              <MessageCircle size={18} />
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                              <Heart size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (!msgContent.trim()) return;
                                sendDMMessage(msgContent);
                                setMsgContent("");
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${msgContent.trim() ? "bg-[var(--theme-primary)] text-white" : "bg-gray-100 text-gray-400"}`}
                            >
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9CA3AF",
                      }}
                    >
                      <MessageSquare
                        size={48}
                        style={{ opacity: 0.2, marginBottom: 16 }}
                      />
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#4B5563",
                        }}
                      >
                        Pilih Pesan
                      </div>
                      <div style={{ fontSize: 14 }}>
                        Pilih pesan inbox dari Instagram/TikTok di sebelah kiri.
                      </div>
                    </div>
                  )
                ) : selectedComment ? (
                  <>
                    <div
                      style={{
                        padding: "16px 24px",
                        borderBottom: "1px solid rgba(44,32,22,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white overflow-hidden"
                          style={{
                            border: "1px solid rgba(44,32,22,0.05)",
                          }}
                        >
                          <img
                            src={selectedComment.postThumbnail}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              color: "#111827",
                            }}
                          >
                            {selectedComment.postCaption}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "rgba(44,32,22,0.6)",
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {selectedComment.postLikes} likes •{" "}
                            {selectedComment.postCommentCount} comments •{" "}
                            {selectedComment.postTime}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          style={{ fontSize: 13, fontWeight: 600 }}
                        >
                          Boost unavailable
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                    <div
                      ref={commentChatScrollRef}
                      style={{
                        flex: 1,
                        padding: 0,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        background: "white",
                      }}
                    >
                      <div
                        style={{
                          padding: "16px 24px",
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ display: "flex", gap: 12 }}>
                          <img
                            src={selectedComment.postThumbnail}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 14,
                                color: "#111827",
                                lineHeight: 1.5,
                              }}
                            >
                              <span style={{ fontWeight: 700, marginRight: 6 }}>
                                fadkhera_id
                              </span>
                              {selectedComment.postCaption}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginTop: 8,
                                fontSize: 13,
                                color: "gray",
                                fontWeight: 600,
                              }}
                            >
                              <span>{selectedComment.postTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedComment.postComments &&
                        selectedComment.postComments.map((pc: any) => (
                          <div
                            key={pc.id}
                            style={{
                              display: "flex",
                              gap: 12,
                              padding: "16px 24px",
                            }}
                          >
                            <img
                              src={pc.avatar}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: 14,
                                  color: "#111827",
                                  lineHeight: 1.5,
                                }}
                              >
                                <span
                                  style={{ fontWeight: 700, marginRight: 6 }}
                                >
                                  {pc.username}
                                </span>
                                {pc.text}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  marginTop: 8,
                                  fontSize: 13,
                                  color: "gray",
                                  fontWeight: 600,
                                }}
                              >
                                <span>{pc.time}</span>
                                <span
                                  onClick={() => {
                                    setReplyingTo(pc);
                                    setMsgContent(`@${pc.username} `);
                                  }}
                                  style={{
                                    cursor: "pointer",
                                    color: "rgba(44,32,22,0.6)",
                                  }}
                                >
                                  Reply
                                </span>
                                <span
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--theme-primary)",
                                  }}
                                >
                                  Send message
                                </span>
                                <MoreHorizontal
                                  size={14}
                                  style={{ cursor: "pointer" }}
                                />
                              </div>

                              {pc.replies &&
                                pc.replies.map((reply: any) => (
                                  <div
                                    key={reply.id}
                                    style={{
                                      display: "flex",
                                      gap: 12,
                                      marginTop: 16,
                                    }}
                                  >
                                    <img
                                      src={reply.avatar}
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                      }}
                                    />
                                    <div style={{ flex: 1 }}>
                                      <div
                                        style={{
                                          fontSize: 14,
                                          color: "#111827",
                                          lineHeight: 1.5,
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontWeight: 700,
                                            marginRight: 6,
                                          }}
                                        >
                                          {reply.username}
                                        </span>
                                        {reply.text}
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 12,
                                          marginTop: 8,
                                          fontSize: 13,
                                          color: "gray",
                                          fontWeight: 600,
                                        }}
                                      >
                                        <span>{reply.time}</span>
                                        <span
                                          onClick={() => {
                                            setReplyingTo(pc);
                                            setMsgContent(`@${reply.username} `);
                                          }}
                                          style={{
                                            cursor: "pointer",
                                            color: "rgba(44,32,22,0.6)",
                                          }}
                                        >
                                          Reply
                                        </span>
                                        <span
                                          style={{
                                            cursor: "pointer",
                                            color: "var(--theme-primary)",
                                          }}
                                        >
                                          Send message
                                        </span>
                                        <MoreHorizontal
                                          size={14}
                                          style={{ cursor: "pointer" }}
                                        />
                                      </div>
                                    </div>
                                    <button>
                                      <Heart size={14} color="gray" />
                                    </button>
                                  </div>
                                ))}
                            </div>
                            <button>
                              <Heart
                                size={16}
                                color={pc.isLiked ? "#E4405F" : "gray"}
                                fill={pc.isLiked ? "#E4405F" : "none"}
                              />
                            </button>
                          </div>
                        ))}
                    </div>
                    <div
                      style={{
                        padding: 20,
                        borderTop: "1px solid rgba(44,32,22,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        background: "white",
                      }}
                    >
                      <div
                        style={{ display: "flex", gap: 8, overflowX: "auto" }}
                        className="no-scrollbar"
                      >
                        <button
                          onClick={() =>
                            setMsgContent(
                              "Halo kak, terima kasih banyak atas responnya! 🙏",
                            )
                          }
                          className="hover-scale"
                          style={{
                            background: "#FDF0EB",
                            color: "var(--theme-primary)",
                            padding: "8px 12px",
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Sparkles size={12} /> AI: Balasan Ramah
                        </button>
                        <button
                          onClick={() =>
                            setMsgContent(
                              "Halo kak, boleh langsung cek link di bio kita ya untuk info lengkapnya! 😊",
                            )
                          }
                          className="hover-scale"
                          style={{
                            background: "#FDF0EB",
                            color: "var(--theme-primary)",
                            padding: "8px 12px",
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Sparkles size={12} /> AI: Arahkan ke Bio
                        </button>
                        <button
                          onClick={() =>
                            setMsgContent(
                              "Hi kak, untuk pertanyaan lebih lanjut bisa langsung DM kami ya, terima kasih!",
                            )
                          }
                          className="hover-scale"
                          style={{
                            background: "#FDF0EB",
                            color: "var(--theme-primary)",
                            padding: "8px 12px",
                            borderRadius: 16,
                            fontSize: 12,
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Sparkles size={12} /> AI: Arahkan ke DM
                        </button>
                      </div>
                      {replyingTo && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#F9FAFB",
                            padding: "8px 16px",
                            borderRadius: 16,
                            fontSize: 12,
                            color: "#4B5563",
                            border: "1px solid rgba(0,0,0,0.05)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--theme-primary)" }} />
                            <span>Membalas komentar <strong>@{replyingTo.username}</strong></span>
                          </div>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setMsgContent("");
                            }}
                            style={{
                              border: "none",
                              background: "none",
                              color: "#EF4444",
                              fontWeight: 700,
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          background: "white",
                          border: "1px solid rgba(44,32,22,0.1)",
                          borderRadius: 24,
                          padding: "4px 4px 4px 16px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              marginRight: 8,
                              color: "rgba(44,32,22,0.4)",
                            }}
                          >
                            {selectedComment.platform === "meta" ||
                            selectedComment.platform === "instagram" ? (
                              <Instagram size={18} />
                            ) : (
                              <MessageCircle size={18} />
                            )}
                          </div>
                          <input
                            placeholder={`Add a comment for ${selectedComment.senderName}...`}
                            value={msgContent}
                            onChange={(e) => setMsgContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && msgContent.trim()) {
                                sendCommentReply(msgContent);
                                setMsgContent("");
                              }
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 0",
                              border: "none",
                              fontSize: 14,
                              outline: "none",
                              fontFamily: "inherit",
                              fontWeight: 500,
                              background: "transparent",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            paddingRight: 8,
                            color: "rgba(44,32,22,0.5)",
                          }}
                        >
                          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Paperclip size={18} />
                          </button>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <MessageCircle size={18} />
                          </button>
                          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                            <Heart size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (!msgContent.trim()) return;
                              sendCommentReply(msgContent);
                              setMsgContent("");
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${msgContent.trim() ? "bg-[var(--theme-primary)] text-white" : "bg-gray-100 text-gray-400"}`}
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#9CA3AF",
                    }}
                  >
                    <MessageSquare
                      size={48}
                      style={{ opacity: 0.2, marginBottom: 16 }}
                    />
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#4B5563",
                      }}
                    >
                      Pilih Komentar
                    </div>
                    <div style={{ fontSize: 14 }}>
                      Pilih komentar dari Instagram/TikTok di sebelah kiri.
                    </div>
                  </div>
                )}
              </div>

              {/* Kolom 3: Customer Details (Kanan) */}
              {(selectedInboxMsg || selectedComment) && (
                <div
                  style={{
                    width: 280,
                    background: "white",
                    borderRadius: 20,
                    border: "1px solid rgba(44,32,22,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    overflowY: "auto",
                    flexShrink: 0,
                  }}
                >
                  {inboxViewMode === "comments" && selectedComment ? (
                    <div style={{ padding: 16 }}>
                      <div
                        style={{
                          width: "100%",
                          borderRadius: 16,
                          overflow: "hidden",
                          position: "relative",
                          border: "1px solid rgba(0,0,0,0.05)",
                          background: "black",
                        }}
                      >
                        <img
                          src={selectedComment.postMedia}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: 400,
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backdropFilter: "blur(4px)",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                width: 0,
                                height: 0,
                                borderTop: "8px solid transparent",
                                borderBottom: "8px solid transparent",
                                borderLeft: "12px solid white",
                                marginLeft: 4,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            margin: "0 0 4px",
                            color: "#111827",
                          }}
                        >
                          Contact details
                        </h3>
                        <p
                          style={{
                            fontSize: 12,
                            color: "rgba(44,32,22,0.5)",
                            margin: "0 0 12px",
                            fontWeight: 500,
                          }}
                        >
                          Add more details about this contact.
                        </p>
                        <button
                          style={{
                            padding: "6px 10px",
                            borderRadius: 12,
                            background: "white",
                            border: "1px solid rgba(44,32,22,0.15)",
                            color: "#111827",
                            fontWeight: 700,
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            width: "fit-content",
                          }}
                          className="hover-scale"
                        >
                          <Plus size={14} /> Add details
                        </button>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            margin: "0 0 12px",
                            color: "#111827",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          {inboxViewMode === "dms"
                            ? "Profile"
                            : "Instagram profile"}
                          <Info size={12} color="rgba(44,32,22,0.4)" />
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              color: "#9ca3af",
                            }}
                          >
                            {selectedInboxMsg?.platform === "meta" ||
                            selectedInboxMsg?.platform === "instagram" ||
                            selectedComment?.platform === "meta" ||
                            selectedComment?.platform === "instagram" ? (
                              <Instagram size={14} color="rgba(44,32,22,0.6)" />
                            ) : (
                              <MessageCircle
                                size={14}
                                color="rgba(44,32,22,0.6)"
                              />
                            )}
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 12,
                              color: "rgba(44,32,22,0.6)",
                            }}
                          >
                            @
                            {(
                              selectedInboxMsg?.senderName ||
                              selectedComment?.senderName ||
                              "user"
                            )
                              .toLowerCase()
                              .replace(/\s+/g, "")}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(44,32,22,0.6)",
                            fontWeight: 500,
                            lineHeight: 1.5,
                            marginBottom: 10,
                          }}
                        >
                          www.yogyagroup.com • FB Page: Belanja Hemat Ya Yogya •
                          Twitter & Line ID: @info_yogyagroup • TikTok:
                          yogyagroup #BelanjaHematYaYogya
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--theme-primary)",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginBottom: 10,
                          }}
                        >
                          YOGYA GROUP OFFICIAL
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--theme-primary)",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          https://linktr.ee/YogyaGroup
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            margin: 0,
                            color: "#111827",
                          }}
                        >
                          Activity
                        </h3>
                        <span
                          style={{
                            fontSize: 10,
                            background: "rgba(44,32,22,0.05)",
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontWeight: 600,
                            color: "rgba(44,32,22,0.6)",
                          }}
                        >
                          Recommended
                        </span>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            margin: "0 0 10px",
                            color: "#111827",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          Lead stage{" "}
                          <Info size={12} color="rgba(44,32,22,0.4)" />
                        </h3>
                        <button
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: 8,
                            background: "white",
                            border: "1px solid rgba(44,32,22,0.15)",
                            color: "#111827",
                            fontWeight: 600,
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          className="hover-scale"
                        >
                          Mark as lead
                        </button>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <h3
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              margin: 0,
                              color: "#111827",
                            }}
                          >
                            Order status
                          </h3>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--theme-primary)",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Clear status
                          </span>
                        </div>
                        <select
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "1px solid rgba(44,32,22,0.15)",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#111827",
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option>Select option</option>
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Completed</option>
                        </select>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <h3
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              margin: 0,
                              color: "#111827",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            Labels <Info size={12} color="rgba(44,32,22,0.4)" />
                          </h3>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--theme-primary)",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Manage labels
                          </span>
                        </div>
                        <input
                          placeholder="Add label"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "1px solid rgba(44,32,22,0.15)",
                            fontSize: 12,
                            outline: "none",
                            marginBottom: 12,
                          }}
                        />
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "rgba(44,32,22,0.6)",
                            marginBottom: 8,
                          }}
                        >
                          Suggested labels
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            <input
                              type="checkbox"
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: 4,
                                border: "1px solid rgba(44,32,22,0.2)",
                              }}
                            />
                            <span
                              style={{
                                background: "#dcfce7",
                                color: "#166534",
                                padding: "2px 8px",
                                borderRadius: 4,
                              }}
                            >
                              New customer
                            </span>
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            <input
                              type="checkbox"
                              style={{
                                width: 14,
                                height: 14,
                                borderRadius: 4,
                                border: "1px solid rgba(44,32,22,0.2)",
                              }}
                            />
                            <span
                              style={{
                                background: "#f3f4f6",
                                color: "#374151",
                                padding: "2px 8px",
                                borderRadius: 4,
                              }}
                            >
                              Today's date ({new Date().getMonth() + 1}/
                              {new Date().getDate()})
                            </span>
                          </label>
                        </div>
                      </div>

                      <div style={{ padding: "16px" }}>
                        <h3
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            margin: "0 0 8px",
                            color: "#111827",
                          }}
                        >
                          Notes
                        </h3>
                        <p
                          style={{
                            fontSize: 11,
                            color: "rgba(44,32,22,0.5)",
                            margin: "0 0 10px",
                            fontWeight: 500,
                          }}
                        >
                          Keep track of important customer interactions.
                        </p>
                        <textarea
                          placeholder="Add a note..."
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: "1px solid rgba(44,32,22,0.15)",
                            fontSize: 12,
                            outline: "none",
                            resize: "none",
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* HUB.AI */}
          {tab === "social-hub-ai" && (
            <div
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                display: "flex",
                background: "white",
                color: "#193546",
                overflow: "hidden",
              }}
            >
              {/* LEFT SIDEBAR (Chat History) */}
              <div
                style={{
                  width: 260,
                  display: "flex",
                  flexDirection: "column",
                  background: "#F4F7F9",
                  padding: "20px 16px",
                  borderRight: "1px solid rgba(6, 91, 152, 0.1)",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        background:
                          "linear-gradient(135deg, #0DB8D3 0%, #1B7FDC 100%)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(13, 184, 211, 0.3)",
                      }}
                    >
                      <Sparkles size={14} />
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#193546",
                        letterSpacing: "0.2px",
                      }}
                    >
                      HUB.AI
                    </div>
                  </div>
                  {/* Tool icons moved below */}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginBottom: 24,
                  }}
                >
                  <button
                    onClick={() => {
                      setActiveSessionId(null);
                      setChatHistory([
                        {
                          role: "assistant",
                          content:
                            "Halo! Saya HUB.AI, asisten khusus untuk content creator. Apa yang bisa saya bantu hari ini? Mau brainstorm ide konten atau buat draft caption?",
                        },
                      ]);
                      setIsSearchMode(false);
                    }}
                    className="hover-bg"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#193546",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <Edit3 size={16} /> Percakapan baru
                  </button>
                  <button
                    onClick={() => setIsSearchMode(true)}
                    className="hover-bg"
                    style={{
                      background: isSearchMode
                        ? "rgba(27,127,220,0.1)"
                        : "transparent",
                      border: "none",
                      color: isSearchMode ? "#1B7FDC" : "#193546",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <Search size={16} /> Telusuri percakapan
                  </button>
                  <button
                    onClick={handleToggleConfigPanel}
                    className="hover-bg"
                    style={{
                      background: showConfigPanel
                        ? "rgba(27,127,220,0.1)"
                        : "transparent",
                      border: "none",
                      color: showConfigPanel ? "#1B7FDC" : "#193546",
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <Settings size={16} /> Konfigurasi
                  </button>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                  className="no-scrollbar"
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    {chatSessions.some((s) => s.pinned) && (
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#065B98",
                            marginBottom: 12,
                            letterSpacing: "0.5px",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Pin size={12} /> PINNED
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          {chatSessions
                            .filter((s) => s.pinned)
                            .map((s) => renderSessionItem(s))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#065B98",
                          marginBottom: 12,
                          letterSpacing: "0.5px",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Clock size={12} /> HISTORY
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {chatSessions
                          .filter((s) => !s.pinned)
                          .map((s) => renderSessionItem(s))}
                        {chatSessions.length === 0 && (
                          <div
                            style={{
                              padding: "10px 12px",
                              fontSize: 12,
                              color: "rgba(25,53,70,0.4)",
                            }}
                          >
                            Belum ada histori.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(13,184,211,0.05)",
                    border: "1px solid rgba(13,184,211,0.2)",
                    borderRadius: 16,
                    padding: "16px",
                    marginTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "rgba(25,53,70,0.6)",
                      }}
                    >
                      HUB.AI Limit
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#193546",
                      }}
                    >
                      {(() => {
                        const isSuperAdmin =
                          profile?.role === "admin" ||
                          user?.email?.toLowerCase() ===
                            "nalendraputra71@gmail.com";
                        if (isSuperAdmin) return "Unlimited";
                        const maxReq =
                          profile?.plan === "pro" || profile?.plan === "vip"
                            ? 100
                            : 50;
                        const todayStr = new Date().toISOString().split("T")[0];
                        const usedReq =
                          profile?.lastAiRequestDate === todayStr
                            ? profile?.aiRequestsToday || 0
                            : 0;
                        return `${usedReq} / ${maxReq}`;
                      })()}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 6,
                      background: "rgba(6,91,152,0.1)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    {(() => {
                      const isSuperAdmin =
                        profile?.role === "admin" ||
                        user?.email?.toLowerCase() ===
                          "nalendraputra71@gmail.com";
                      if (isSuperAdmin)
                        return (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: "#0DB8D3",
                              borderRadius: 3,
                            }}
                          />
                        );
                      const maxReq =
                        profile?.plan === "pro" || profile?.plan === "vip"
                          ? 100
                          : 50;
                      const todayStr = new Date().toISOString().split("T")[0];
                      const usedReq =
                        profile?.lastAiRequestDate === todayStr
                          ? profile?.aiRequestsToday || 0
                          : 0;
                      const usedPercent = Math.min(
                        (usedReq / maxReq) * 100,
                        100,
                      );
                      return (
                        <div
                          style={{
                            width: `${usedPercent}%`,
                            height: "100%",
                            background: "#0DB8D3",
                            borderRadius: 3,
                          }}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* MAIN CHAT AREA */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  background: "white",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* MESSAGES OR EMPTY STATE */}
                <div
                  ref={chatScrollContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    paddingBottom: 24,
                    paddingTop: 16,
                  }}
                  className="no-scrollbar"
                >
                  {isSearchMode ? (
                    <div
                      style={{
                        flex: 1,
                        padding: "40px 60px",
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: 900,
                        margin: "0 auto",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 32,
                        }}
                      >
                        <button
                          onClick={() => setIsSearchMode(false)}
                          className="hover-bg"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                          }}
                        >
                          <ChevronLeft size={20} color="#193546" />
                        </button>
                        <h2
                          style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#193546",
                            margin: 0,
                          }}
                        >
                          Telusuri Percakapan
                        </h2>
                      </div>
                      <div style={{ position: "relative", marginBottom: 32 }}>
                        <Search
                          size={20}
                          color="rgba(25,53,70,0.4)"
                          style={{
                            position: "absolute",
                            left: 16,
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        />
                        <input
                          autoFocus
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari kata kunci atau judul percakapan..."
                          style={{
                            width: "100%",
                            padding: "16px 48px 16px 48px",
                            borderRadius: 16,
                            border: "1px solid rgba(6,91,152,0.2)",
                            fontSize: 16,
                            outline: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          }}
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            style={{
                              position: "absolute",
                              right: 16,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "rgba(25,53,70,0.4)",
                            }}
                          >
                            <X size={20} className="hover-opacity" />
                          </button>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {chatSessions
                          .filter((s) =>
                            searchQuery
                              ? s.title
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                (s.messages &&
                                  s.messages.some((m: any) =>
                                    m.content
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase()),
                                  ))
                              : true,
                          )
                          .sort((a, b) => {
                            // If there is a search query, prioritize matches in title
                            if (searchQuery) {
                              const aTitleMatch = a.title
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase());
                              const bTitleMatch = b.title
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase());
                              if (aTitleMatch && !bTitleMatch) return -1;
                              if (!aTitleMatch && bTitleMatch) return 1;
                            }
                            // Fallback to sorting by date
                            const dateA = a.updatedAt?.toDate
                              ? a.updatedAt.toDate().getTime()
                              : 0;
                            const dateB = b.updatedAt?.toDate
                              ? b.updatedAt.toDate().getTime()
                              : 0;
                            return dateB - dateA;
                          })
                          .map((s) => {
                            // Determine the best snippet to show
                            let bestSnippet = "Tidak ada pesan pengguna.";
                            if (s.messages && s.messages.length > 0) {
                              // If we have a search query, find the first matching message
                              if (searchQuery) {
                                const matchingMsg = s.messages.find((m: any) =>
                                  m.content
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()),
                                );
                                if (matchingMsg)
                                  bestSnippet = matchingMsg.content;
                                else
                                  bestSnippet =
                                    s.messages
                                      .filter((m: any) => m.role === "user")
                                      .pop()?.content || s.messages[0].content;
                              } else {
                                bestSnippet =
                                  s.messages
                                    .filter((m: any) => m.role === "user")
                                    .pop()?.content || s.messages[0].content;
                              }
                            }

                            return (
                              <div
                                key={s.id}
                                onClick={() => {
                                  setActiveSessionId(s.id);
                                  setChatHistory(s.messages || []);

                                  // Define the target highlight match
                                  if (searchQuery && s.messages) {
                                    const matchIdx = s.messages.findIndex(
                                      (m: any) =>
                                        m.content
                                          .toLowerCase()
                                          .includes(searchQuery.toLowerCase()),
                                    );
                                    if (matchIdx !== -1) {
                                      setTargetMessageIndex(matchIdx);
                                    }
                                  }

                                  setIsSearchMode(false);
                                  setSearchQuery("");
                                }}
                                className="hover-scale"
                                style={{
                                  padding: "16px 20px",
                                  borderRadius: 12,
                                  background: "white",
                                  border: "1px solid rgba(6,91,152,0.1)",
                                  cursor: "pointer",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 16,
                                      fontWeight: 600,
                                      color: "#193546",
                                    }}
                                  >
                                    {renderHighlightedText(
                                      s.title,
                                      searchQuery,
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 12,
                                      color: "rgba(25,53,70,0.5)",
                                    }}
                                  >
                                    {s.updatedAt?.toDate
                                      ? s.updatedAt
                                          .toDate()
                                          .toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          })
                                      : "-"}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: "rgba(25,53,70,0.7)",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {renderHighlightedText(
                                    bestSnippet,
                                    searchQuery,
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        {chatSessions.filter((s) =>
                          searchQuery
                            ? s.title
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                              JSON.stringify(s.messages)
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                            : true,
                        ).length === 0 && (
                          <div
                            style={{
                              textAlign: "center",
                              padding: "40px",
                              color: "rgba(25,53,70,0.4)",
                              fontSize: 14,
                            }}
                          >
                            Tidak ada percakapan yang cocok dengan pencarian.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : chatHistory.length === 1 ? (
                    // EMPTY STATE (GREETING & CARDS)
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "10px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: 400,
                          height: 400,
                          background:
                            "radial-gradient(circle, rgba(13,184,211,0.05) 0%, transparent 60%)",
                          pointerEvents: "none",
                        }}
                      />

                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          background:
                            "linear-gradient(135deg, #0DB8D3 0%, #1B7FDC 100%)",
                          boxShadow: "0 12px 32px rgba(27,127,220,0.3)",
                          marginBottom: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1,
                        }}
                      >
                        <Sparkles color="white" size={28} />
                      </div>
                      <h2
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: "#193546",
                          margin: "0 0 8px",
                          letterSpacing: "-0.5px",
                          zIndex: 1,
                        }}
                      >
                        Welcome to HUB.AI
                      </h2>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#065B98",
                          margin: 0,
                          fontWeight: 400,
                          zIndex: 1,
                        }}
                      >
                        Apa yang bisa saya temukan untuk kontenmu hari ini?
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          marginTop: 24,
                          flexWrap: "wrap",
                          justifyContent: "center",
                          maxWidth: 900,
                          zIndex: 1,
                        }}
                      >
                        {/* Prompt Generator Card */}
                        <div
                          onClick={() => {
                            setChatInput(PROMPT_IDEAS[currentPromptIndex]);
                            setTimeout(
                              () =>
                                handleChatSubmit(
                                  PROMPT_IDEAS[currentPromptIndex],
                                ),
                              100,
                            );
                          }}
                          className="hover-scale hover-glow"
                          style={{
                            background: "white",
                            border: "1px solid rgba(6,91,152,0.1)",
                            borderRadius: 16,
                            padding: 16,
                            width: 250,
                            height: 140,
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            boxShadow: "0 12px 24px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={currentPromptIndex}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "#193546",
                                  lineHeight: 1.4,
                                }}
                              >
                                "{PROMPT_IDEAS[currentPromptIndex]}"
                              </motion.div>
                            </AnimatePresence>
                            <MessageSquare
                              size={14}
                              color="#1B7FDC"
                              style={{
                                flexShrink: 0,
                                marginTop: 2,
                                marginLeft: 8,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: 16,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: "#1B7FDC",
                                fontWeight: 600,
                                letterSpacing: "0.5px",
                              }}
                            >
                              IDE KONTEN KREATIF
                            </div>
                            <div style={{ display: "flex", gap: 3 }}>
                              {PROMPT_IDEAS.map((_, i) => (
                                <div
                                  key={i}
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    background:
                                      i === currentPromptIndex
                                        ? "#1B7FDC"
                                        : "rgba(27,127,220,0.2)",
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Analysis Evaluasi Card */}
                        <div
                          onClick={() => {
                            setChatInput(ANALYSIS_IDEAS[currentAnalysisIndex]);
                            setTimeout(
                              () =>
                                handleChatSubmit(
                                  ANALYSIS_IDEAS[currentAnalysisIndex],
                                ),
                              100,
                            );
                          }}
                          className="hover-scale hover-glow"
                          style={{
                            background: "white",
                            border: "1px solid rgba(6,91,152,0.1)",
                            borderRadius: 16,
                            padding: 16,
                            width: 250,
                            height: 140,
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            boxShadow: "0 12px 24px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={currentAnalysisIndex}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "#193546",
                                  lineHeight: 1.4,
                                }}
                              >
                                "{ANALYSIS_IDEAS[currentAnalysisIndex]}"
                              </motion.div>
                            </AnimatePresence>
                            <BarChart3
                              size={14}
                              color="#0DB8D3"
                              style={{
                                flexShrink: 0,
                                marginTop: 2,
                                marginLeft: 8,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: 16,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: "#0DB8D3",
                                fontWeight: 600,
                                letterSpacing: "0.5px",
                              }}
                            >
                              ANALISIS & EVALUASI
                            </div>
                            <div style={{ display: "flex", gap: 3 }}>
                              {ANALYSIS_IDEAS.map((_, i) => (
                                <div
                                  key={i}
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    background:
                                      i === currentAnalysisIndex
                                        ? "#0DB8D3"
                                        : "rgba(13,184,211,0.2)",
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Tips & Trik Card */}
                        <div
                          className="hover-scale hover-glow"
                          style={{
                            background: "white",
                            border: "1px solid rgba(6,91,152,0.1)",
                            borderRadius: 16,
                            padding: 16,
                            width: 250,
                            height: 140,
                            textAlign: "left",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            boxShadow: "0 12px 24px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={currentTipIndex}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "#193546",
                                  lineHeight: 1.4,
                                }}
                              >
                                {HUBAI_TIPS[currentTipIndex]}
                              </motion.div>
                            </AnimatePresence>
                            <Lightbulb
                              size={14}
                              color="#F59E0B"
                              style={{
                                flexShrink: 0,
                                marginTop: 2,
                                marginLeft: 8,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: 16,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10,
                                color: "#F59E0B",
                                fontWeight: 600,
                                letterSpacing: "0.5px",
                              }}
                            >
                              TIPS & TRIK HUB.AI
                            </div>
                            <div style={{ display: "flex", gap: 3 }}>
                              {HUBAI_TIPS.map((_, i) => (
                                <div
                                  key={i}
                                  style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    background:
                                      i === currentTipIndex
                                        ? "#F59E0B"
                                        : "rgba(245,158,11,0.2)",
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pill Actions */}
                      <div
                        style={{
                          marginTop: 32,
                          marginBottom: -24,
                          textAlign: "center",
                          width: "100%",
                          maxWidth: 800,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 400,
                            color: "rgba(25,53,70,0.6)",
                          }}
                        >
                          Biar lebih kamu banget:
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 800,
                          marginTop: 32,
                          zIndex: 1,
                          overflow: "hidden",
                          position: "relative",
                          maskImage:
                            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                          WebkitMaskImage:
                            "-webkit-linear-gradient(left, transparent, black 10%, black 90%, transparent)",
                        }}
                      >
                        <motion.div
                          animate={{ x: ["0%", "-50%"] }}
                          transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 25,
                          }}
                          style={{
                            display: "flex",
                            width: "max-content",
                            padding: "4px 0",
                          }}
                        >
                          {[
                            {
                              icon: <User size={14} color="#0DB8D3" />,
                              text: "Atur Peran AI",
                            },
                            {
                              icon: <AlignLeft size={14} color="#1B7FDC" />,
                              text: "Set Pilar Konten",
                            },
                            {
                              icon: <FileText size={14} color="#10B981" />,
                              text: "Tambah Contoh",
                            },
                            {
                              icon: <Mic size={14} color="#F59E0B" />,
                              text: "Tone of Voice",
                            },
                            {
                              icon: <Users size={14} color="#8B5CF6" />,
                              text: "Target Audience",
                            },
                            {
                              icon: <Book size={14} color="#E83A59" />,
                              text: "Kamus Brand",
                            },
                            {
                              icon: <User size={14} color="#0DB8D3" />,
                              text: "Atur Peran AI",
                            },
                            {
                              icon: <AlignLeft size={14} color="#1B7FDC" />,
                              text: "Set Pilar Konten",
                            },
                            {
                              icon: <FileText size={14} color="#10B981" />,
                              text: "Tambah Contoh",
                            },
                            {
                              icon: <Mic size={14} color="#F59E0B" />,
                              text: "Tone of Voice",
                            },
                            {
                              icon: <Users size={14} color="#8B5CF6" />,
                              text: "Target Audience",
                            },
                            {
                              icon: <Book size={14} color="#E83A59" />,
                              text: "Kamus Brand",
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => setShowConfigPanel(true)}
                              className="hover-scale hover-glow"
                              style={{
                                marginRight: 16,
                                background: "white",
                                padding: "8px 18px",
                                borderRadius: 24,
                                border: "1px solid rgba(6,91,152,0.1)",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#193546",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                                flexShrink: 0,
                              }}
                            >
                              {item.icon} {item.text}
                            </div>
                          ))}
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "30px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                        maxWidth: 860,
                        margin: "0 auto",
                        width: "100%",
                      }}
                    >
                      {chatHistory.map((msg, idx) =>
                        idx === 0 ? null : (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx}
                            id={`chat-msg-${idx}`}
                            style={{
                              alignSelf:
                                msg.role === "user" ? "flex-end" : "flex-start",
                              maxWidth: "85%",
                            }}
                          >
                            {msg.role === "assistant" && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    background:
                                      "linear-gradient(135deg, #0DB8D3 0%, #1B7FDC 100%)",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow:
                                      "0 4px 12px rgba(27,127,220,0.3)",
                                  }}
                                >
                                  <Sparkles size={14} />
                                </div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#193546",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  HUB.AI
                                </div>
                              </div>
                            )}
                            <div
                              style={{
                                padding: "10px 14px",
                                borderRadius: 16,
                                borderTopRightRadius:
                                  msg.role === "user" ? 8 : 16,
                                borderTopLeftRadius:
                                  msg.role === "assistant" ? 8 : 16,
                                background:
                                  msg.role === "user"
                                    ? "rgba(13,184,211,0.08)"
                                    : "white",
                                color: "#193546",
                                border:
                                  msg.role === "user"
                                    ? "1px solid rgba(13,184,211,0.2)"
                                    : "1px solid rgba(6,91,152,0.1)",
                                fontSize: 12,
                                lineHeight: 1.5,
                                boxShadow:
                                  msg.role === "assistant"
                                    ? "0 12px 32px rgba(0,0,0,0.04)"
                                    : "none",
                              }}
                            >
                              {msg.role === "assistant" ? (
                                <div
                                  className="markdown-body text-[#193546] text-[12px]"
                                  style={{ fontWeight: 400 }}
                                >
                                  {animatingMessageIndex === idx ? (
                                    <SimulatedStreamMarkdown
                                      content={msg.content}
                                      onComplete={() =>
                                        setAnimatingMessageIndex(null)
                                      }
                                      scrollContainerRef={
                                        chatScrollContainerRef
                                      }
                                    />
                                  ) : (
                                    <Markdown>{msg.content}</Markdown>
                                  )}
                                </div>
                              ) : (
                                <div style={{ fontWeight: 400 }}>
                                  {msg.content}
                                </div>
                              )}
                            </div>
                            {msg.role === "assistant" && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 16,
                                  marginTop: 10,
                                  marginLeft: 8,
                                }}
                              >
                                <button
                                  className="hover-scale"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.content);
                                    alert("Response disalin ke clipboard.");
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#065B98",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <Copy size={14} /> Copy
                                </button>
                                <button
                                  className="hover-scale"
                                  onClick={() => {
                                    handleCreateDraftFromAI(msg.content);
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#0DB8D3",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <CopyPlus size={14} /> Jadikan Draft Konten
                                </button>
                              </div>
                            )}
                          </motion.div>
                        ),
                      )}
                      {chatLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            alignSelf: "flex-start",
                            marginLeft: 8,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.6, 0.1, 0.6],
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeInOut",
                              }}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background:
                                  "linear-gradient(135deg, #0DB8D3 0%, #1B7FDC 100%)",
                                borderRadius: "inherit",
                                filter: "blur(4px)",
                              }}
                            />
                            <motion.div
                              animate={{ scale: [0.9, 1.1, 0.9] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeInOut",
                              }}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background:
                                  "linear-gradient(135deg, #0DB8D3 0%, #1B7FDC 100%)",
                                borderRadius: "inherit",
                              }}
                            />
                            <Sparkles
                              size={16}
                              color="white"
                              style={{ position: "relative", zIndex: 2 }}
                            />
                          </div>
                        </motion.div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                {/* FLOATING TEXT INPUT */}
                {!isSearchMode && (
                  <div style={{ padding: "0 32px 24px 32px", flexShrink: 0 }}>
                    <div
                      style={{
                        margin: "0 auto",
                        width: "100%",
                        maxWidth: 860,
                        background: "white",
                        borderRadius: 20,
                        padding: "8px 12px",
                        border: "1px solid rgba(6,91,152,0.15)",
                        boxShadow:
                          "0 12px 30px rgba(0,0,0,0.06), 0 0 20px rgba(13,184,211,0.05) inset",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <textarea
                        placeholder="Tanya apapun ke HUB.AI..."
                        value={chatInput}
                        onChange={(e) => {
                          const target = e.target;
                          setChatInput(e.target.value);
                          window.requestAnimationFrame(() => {
                            target.style.height = "auto";
                            target.style.height =
                            Math.min(target.scrollHeight, 200) + "px";
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSubmit();
                            setTimeout(() => {
                              const el = e.target as HTMLTextAreaElement;
                              if (el) el.style.height = "auto";
                            }, 10);
                          }
                        }}
                        rows={1}
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          fontSize: 12,
                          background: "transparent",
                          color: "#193546",
                          fontWeight: 500,
                          padding: "2px 6px",
                          resize: "none",
                          maxHeight: 200,
                          overflowY: "auto",
                          minHeight: 20,
                          lineHeight: 1.4,
                          fontFamily: "inherit",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <div
                            ref={dataSourceDropdownRef}
                            style={{ position: "relative" }}
                          >
                            <div
                              onClick={() =>
                                setShowDataSourceDropdown(
                                  !showDataSourceDropdown,
                                )
                              }
                              className="hover-bg"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 10px",
                                background: "rgba(13,184,211,0.1)",
                                border: "1px solid rgba(13,184,211,0.2)",
                                borderRadius: 14,
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#065B98",
                                cursor: "pointer",
                              }}
                            >
                              {dataSource === "all"
                                ? "Semua Data"
                                : dataSource === "social_management"
                                  ? "Social Management"
                                  : "Social Studio"}{" "}
                              <ChevronDown size={12} />
                            </div>
                            <AnimatePresence>
                              {showDataSourceDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  style={{
                                    position: "absolute",
                                    bottom: "100%",
                                    left: 0,
                                    marginBottom: 8,
                                    background: "white",
                                    border: "1px solid rgba(6,91,152,0.1)",
                                    borderRadius: 12,
                                    padding: 6,
                                    boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    minWidth: 160,
                                    zIndex: 20,
                                  }}
                                >
                                  {[
                                    { id: "all", label: "Semua Data" },
                                    {
                                      id: "social_management",
                                      label: "Social Management",
                                    },
                                    {
                                      id: "social_studio",
                                      label: "Social Studio",
                                    },
                                  ].map((ds) => (
                                    <div
                                      key={ds.id}
                                      onClick={() => {
                                        setDataSource(ds.id);
                                        setShowDataSourceDropdown(false);
                                      }}
                                      className="hover-bg"
                                      style={{
                                        padding: "6px 10px",
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 500,
                                        color:
                                          dataSource === ds.id
                                            ? "#1B7FDC"
                                            : "#193546",
                                        background:
                                          dataSource === ds.id
                                            ? "rgba(27,127,220,0.1)"
                                            : "transparent",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {ds.label}
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div
                            ref={configDropdownRef}
                            style={{ position: "relative" }}
                          >
                            <div
                              onClick={() =>
                                setShowConfigDropdown(!showConfigDropdown)
                              }
                              className="hover-bg"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 10px",
                                background: "rgba(27,127,220,0.1)",
                                border: "1px solid rgba(27,127,220,0.2)",
                                borderRadius: 14,
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#1B7FDC",
                                cursor: "pointer",
                              }}
                            >
                              {hubaiConfigs.find((c) => c.id === activeConfigId)
                                ?.name || "Config"}{" "}
                              <ChevronDown size={12} />
                            </div>
                            <AnimatePresence>
                              {showConfigDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  style={{
                                    position: "absolute",
                                    bottom: "100%",
                                    left: 0,
                                    marginBottom: 8,
                                    background: "white",
                                    border: "1px solid rgba(6,91,152,0.1)",
                                    borderRadius: 12,
                                    padding: 6,
                                    boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    minWidth: 160,
                                    zIndex: 20,
                                  }}
                                >
                                  {hubaiConfigs.map((c, i) => (
                                    <div
                                      key={c.id}
                                      onClick={() => {
                                        setActiveConfigId(c.id);
                                        setShowConfigDropdown(false);
                                      }}
                                      className="hover-bg"
                                      style={{
                                        padding: "6px 10px",
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 500,
                                        color:
                                          activeConfigId === c.id
                                            ? "#1B7FDC"
                                            : "#193546",
                                        background:
                                          activeConfigId === c.id
                                            ? "rgba(27,127,220,0.1)"
                                            : "transparent",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {c.name}
                                    </div>
                                  ))}
                                  {hubaiConfigs.length < 6 && (
                                    <div
                                      onClick={() => {
                                        setShowConfigDropdown(false);
                                        setShowConfigPanel(true);
                                      }}
                                      className="hover-bg"
                                      style={{
                                        padding: "6px 10px",
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: "#0DB8D3",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        cursor: "pointer",
                                        borderTop:
                                          "1px solid rgba(6,91,152,0.1)",
                                        marginTop: 4,
                                        paddingTop: 6,
                                      }}
                                    >
                                      <Settings size={12} /> Atur Config
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <button
                            onClick={() =>
                              alert("Fitur Attach File akan segera hadir!")
                            }
                            className="hover-scale"
                            style={{
                              background: "transparent",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              color: "#065B98",
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            <Paperclip size={14} /> Attach
                          </button>
                          <button
                            onClick={() => handleChatSubmit()}
                            disabled={chatLoading || !chatInput.trim()}
                            className="hover-scale"
                            style={{
                              background:
                                chatLoading || !chatInput.trim()
                                  ? "rgba(25,53,70,0.1)"
                                  : "linear-gradient(135deg, #0DB8D3 0%, #1B7FDC 100%)",
                              color:
                                chatLoading || !chatInput.trim()
                                  ? "#065B98"
                                  : "white",
                              border: "none",
                              borderRadius: 16,
                              padding: "6px 14px",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor:
                                chatLoading || !chatInput.trim()
                                  ? "not-allowed"
                                  : "pointer",
                              boxShadow:
                                chatLoading || !chatInput.trim()
                                  ? "none"
                                  : "0 6px 16px rgba(27,127,220,0.3)",
                            }}
                          >
                            <ArrowUp size={14} /> Send
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(25,53,70,0.5)",
                          textAlign: "center",
                          marginTop: -2,
                          fontWeight: 500,
                        }}
                      >
                        HUB.AI may display inaccurate info.{" "}
                        <u style={{ cursor: "pointer", color: "#065B98" }}>
                          Verification Guide
                        </u>
                      </div>
                    </div>
                  </div>
                )}

                {/* SHOW CONFIG PANEL */}
                <AnimatePresence>
                  {showConfigPanel && (
                    <motion.div
                      ref={configPanelRef}
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 200,
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: 380,
                        background: "#F8FAFC",
                        borderLeft: "1px solid rgba(6,91,152,0.1)",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "-20px 0 60px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          padding: "24px",
                          borderBottom: "1px solid rgba(6,91,152,0.05)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          background: "white",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#193546",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              letterSpacing: "0.5px",
                            }}
                          >
                            <Settings size={18} color="#0DB8D3" /> KONFIGURASI
                            AI
                          </div>
                          <button
                            className="hover-bg"
                            onClick={handleCloseConfigPanel}
                            style={{
                              background: "rgba(6,91,152,0.05)",
                              border: "none",
                              cursor: "pointer",
                              color: "#193546",
                              padding: 8,
                              borderRadius: 20,
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            color: "#065B98",
                            lineHeight: 1.5,
                          }}
                        >
                          Atur profil, gaya bahasa, dan panduan brand. Anda
                          dapat membuat hingga 5 konfigurasi kustom untuk
                          berbagai brand atau audiens yang berbeda agar hasil AI
                          lebih personal.
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          overflowX: "auto",
                          padding: "16px 24px 0 24px",
                          gap: 8,
                          background: "white",
                        }}
                        className="no-scrollbar"
                      >
                        {hubaiConfigs
                          .filter((c) => c.id !== "general")
                          .map((c, i) => (
                            <div
                              key={c.id}
                              onClick={() => setEditingConfigId(c.id)}
                              style={{
                                padding: "8px 12px",
                                borderBottom:
                                  editingConfigId === c.id
                                    ? "2px solid #1B7FDC"
                                    : "2px solid transparent",
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                                color:
                                  editingConfigId === c.id
                                    ? "#1B7FDC"
                                    : "#193546",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {c.name || `Config ${i + 1}`}
                            </div>
                          ))}
                        {hubaiConfigs.length < 6 && (
                          <div
                            onClick={() => {
                              const newId = Date.now().toString();
                              const currentCustomCount = hubaiConfigs.filter(
                                (cc) => cc.id !== "general",
                              ).length;
                              setHubaiConfigs([
                                ...hubaiConfigs,
                                {
                                  ...DEFAULT_CONFIG_ITEM,
                                  id: newId,
                                  name: `Config ${currentCustomCount + 1}`,
                                },
                              ]);
                              setEditingConfigId(newId);
                            }}
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#0DB8D3",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Plus size={14} /> Tambah
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          overflowY: "auto",
                          padding: 24,
                          display: "flex",
                          flexDirection: "column",
                          gap: 24,
                        }}
                        className="no-scrollbar"
                      >
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Nama Konfigurasi
                          </label>
                          <input
                            placeholder="Contoh: Config Instagram Utama..."
                            value={editingConfig.name}
                            onChange={(e) =>
                              updateEditingConfig("name", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Posisi Pekerjaan
                          </label>
                          <input
                            placeholder="Contoh: Social Media Manager..."
                            value={editingConfig.jobRole}
                            onChange={(e) =>
                              updateEditingConfig("jobRole", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Gaya Bahasa (Tone of Voice)
                          </label>
                          <input
                            placeholder="Contoh: Santai, Gaul, dan Persuasif..."
                            value={editingConfig.toneOfVoice}
                            onChange={(e) =>
                              updateEditingConfig("toneOfVoice", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Nama Brand
                          </label>
                          <input
                            placeholder="Contoh: Kopi Senja..."
                            value={editingConfig.brandName}
                            onChange={(e) =>
                              updateEditingConfig("brandName", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Bidang / Industri
                          </label>
                          <input
                            placeholder="Contoh: F&B / Minuman..."
                            value={editingConfig.brandIndustry}
                            onChange={(e) =>
                              updateEditingConfig(
                                "brandIndustry",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Target Audience
                          </label>
                          <input
                            placeholder="Contoh: Gen Z, Mahasiswa, Pekerja Kantoran..."
                            value={editingConfig.targetAudience}
                            onChange={(e) =>
                              updateEditingConfig(
                                "targetAudience",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Unique Selling Proposition (USP)
                          </label>
                          <input
                            placeholder="Apa yang membedakan brand anda..."
                            value={editingConfig.usp}
                            onChange={(e) =>
                              updateEditingConfig("usp", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Tujuan Konten
                          </label>
                          <input
                            placeholder="Contoh: Awareness, Sales, Edukasi..."
                            value={editingConfig.contentGoals}
                            onChange={(e) =>
                              updateEditingConfig(
                                "contentGoals",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Pilar Konten (Topik Utama)
                          </label>
                          <input
                            placeholder="Contoh: Motivasi, Humor, Tips & Trik..."
                            value={editingConfig.contentPillars}
                            onChange={(e) =>
                              updateEditingConfig(
                                "contentPillars",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Kompetitor (Benchmarks)
                          </label>
                          <input
                            placeholder="Contoh: Kopi Janji Jiwa, Kopi Kenangan..."
                            value={editingConfig.competitors}
                            onChange={(e) =>
                              updateEditingConfig("competitors", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Info Tambahan
                          </label>
                          <textarea
                            placeholder="Target market adalah Gen Z, produk unggulan kopi susu karamel..."
                            value={editingConfig.additionalInfo}
                            onChange={(e) =>
                              updateEditingConfig(
                                "additionalInfo",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                              minHeight: 80,
                              resize: "vertical",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Kamus Brand (Glossary)
                          </label>
                          <textarea
                            placeholder="Tuliskan kata kunci, pantangan istilah, dan padanan kata yang spesifik ke brand anda. Contoh: Jangan pakai kata 'murah', gunakan 'hemat'..."
                            value={editingConfig.brandGlossary}
                            onChange={(e) =>
                              updateEditingConfig(
                                "brandGlossary",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                              minHeight: 80,
                              resize: "vertical",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#065B98",
                              margin: "0 0 8px",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Contoh Konten (Referensi)
                          </label>
                          <textarea
                            placeholder="Tuliskan format atau gaya draft konten yang pernah berhasil dan ingin HUB.AI ikuti polanya..."
                            value={editingConfig.contentExamples}
                            onChange={(e) =>
                              updateEditingConfig(
                                "contentExamples",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              border: "1px solid rgba(6,91,152,0.1)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              background: "white",
                              minHeight: 120,
                              resize: "vertical",
                            }}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "20px 24px",
                          borderTop: "1px solid rgba(6,91,152,0.05)",
                          background: "white",
                        }}
                      >
                        {(() => {
                          const isConfigComplete =
                            editingConfig &&
                            Object.values(editingConfig).every((val) =>
                              typeof val === "string"
                                ? val.trim() !== ""
                                : true,
                            );
                          return (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {!isConfigComplete && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#E02424",
                                    textAlign: "center",
                                    fontWeight: 500,
                                  }}
                                >
                                  * Harap isi seluruh kolom konfigurasi untuk
                                  menyimpan.
                                </div>
                              )}
                              <button
                                onClick={saveConfig}
                                disabled={savingConfig || !isConfigComplete}
                                style={{
                                  width: "100%",
                                  padding: "14px",
                                  borderRadius: 16,
                                  background:
                                    savingConfig || !isConfigComplete
                                      ? "#ccc"
                                      : "#1B7FDC",
                                  color: "white",
                                  border: "none",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  cursor:
                                    savingConfig || !isConfigComplete
                                      ? "not-allowed"
                                      : "pointer",
                                  transition: "all 0.3s ease",
                                }}
                              >
                                {savingConfig
                                  ? "Menyimpan..."
                                  : "Simpan Konfigurasi"}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* DISCARD MODAL */}
                <AnimatePresence>
                  {showDiscardModal && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        zIndex: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                          background: "white",
                          padding: 24,
                          borderRadius: 16,
                          width: "90%",
                          maxWidth: 360,
                          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                        }}
                      >
                        <h3
                          style={{
                            margin: "0 0 12px",
                            fontSize: 18,
                            color: "#193546",
                            fontWeight: 700,
                          }}
                        >
                          Konfigurasi Belum Lengkap
                        </h3>
                        <p
                          style={{
                            margin: "0 0 24px",
                            fontSize: 14,
                            color: "#065B98",
                            lineHeight: 1.5,
                          }}
                        >
                          Ada konfigurasi yang masih belum diisi lengkap. Apakah
                          Anda ingin melanjutkan menyunting atau menutup dan
                          menghapus konfigurasi yang belum lengkap?
                        </p>
                        <div style={{ display: "flex", gap: 12 }}>
                          <button
                            onClick={handleDiscardConfigs}
                            style={{
                              flex: 1,
                              padding: "12px",
                              borderRadius: 12,
                              background: "rgba(224,36,36,0.1)",
                              color: "#E02424",
                              border: "none",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            className="hover-bg-slate"
                          >
                            Tutup & Hapus
                          </button>
                          <button
                            onClick={() => setShowDiscardModal(false)}
                            style={{
                              flex: 1,
                              padding: "12px",
                              borderRadius: 12,
                              background: "#1B7FDC",
                              color: "white",
                              border: "none",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            className="hover-scale"
                          >
                            Lanjut Edit
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 28px",
              borderBottom: "1px solid rgba(44,32,22,0.05)",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: 0,
                color: "#2C2016",
              }}
            >
              Create a Post
            </h2>
            <button
              onClick={() => setShowCreatePostPopup(false)}
              style={{
                background: "transparent",
                border: "none",
                width: 28,
                height: 28,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(44,32,22,0.4)",
              }}
              className="hover-bg"
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 28,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 340px",
                gap: 40,
                alignItems: "start",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "rgba(44,32,22,0.5)",
                      marginBottom: 12,
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Platform
                  </label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {PLATFORMS.filter(
                      (p) =>
                        p.id !== "all" && connectedPlatforms.includes(p.id),
                    ).length === 0 ? (
                      <div
                        style={{ fontSize: 13, color: "rgba(44,32,22,0.5)" }}
                      >
                        Silakan hubungkan akun di pengaturan terlebih dahulu.
                      </div>
                    ) : (
                      PLATFORMS.filter(
                        (p) =>
                          p.id !== "all" && connectedPlatforms.includes(p.id),
                      ).map((p) => {
                        const isSelected = createPostPlatforms.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <div
                              onClick={() => {
                                if (isSelected) {
                                  setCreatePostPlatforms((prev) =>
                                    prev.filter((id) => id !== p.id),
                                  );
                                  setCreatePostPlatformTypes((prev) => {
                                    const next = { ...prev };
                                    delete next[p.id];
                                    return next;
                                  });
                                } else {
                                  setCreatePostPlatforms((prev) => [
                                    ...prev,
                                    p.id,
                                  ]);
                                  if (
                                    p.contentTypes &&
                                    p.contentTypes.length > 0
                                  ) {
                                    setCreatePostPlatformTypes((prev) => ({
                                      ...prev,
                                      [p.id]: p.contentTypes![0].id,
                                    }));
                                  }
                                }
                              }}
                              title={p.name}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 16px 6px 6px",
                                borderRadius: 20,
                                border: isSelected
                                  ? "none"
                                  : "1px solid rgba(44,32,22,0.08)",
                                background: isSelected
                                  ? p.color
                                  : "transparent",
                                color: isSelected
                                  ? "white"
                                  : "rgba(44,32,22,0.6)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontWeight: 600,
                                fontSize: 13,
                              }}
                              className={!isSelected ? "hover-bg" : ""}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  background: isSelected
                                    ? "rgba(255,255,255,0.2)"
                                    : "rgba(44,32,22,0.05)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {typeof p.icon === "string" ? (
                                  <span
                                    style={{ fontWeight: 800, fontSize: 12 }}
                                  >
                                    {p.icon}
                                  </span>
                                ) : (
                                  React.cloneElement(
                                    p.icon as React.ReactElement,
                                    { size: 14 },
                                  )
                                )}
                              </div>
                              <span>{p.name}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {createPostPlatforms.length === 0 ? (
                  renderEditorBlock(null, null)
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {createPostPlatforms.map((pId) => {
                      const p = PLATFORMS.find((x) => x.id === pId);
                      if (!p) return null;
                      const isExpanded = expandedEditPlatforms[pId] !== false;
                      return (
                        <div
                          key={pId}
                          style={{
                            border: "1px solid rgba(44,32,22,0.08)",
                            borderRadius: 16,
                            overflow: "hidden",
                            background: "white",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                          }}
                        >
                          <div
                            onClick={() =>
                              setExpandedEditPlatforms((prev) => ({
                                ...prev,
                                [pId]: prev[pId] === false ? true : false,
                              }))
                            }
                            style={{
                              padding: 16,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: isExpanded
                                ? "rgba(44,32,22,0.02)"
                                : "transparent",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            className="hover-bg"
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 12,
                                  background: p.color,
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {typeof p.icon === "string" ? (
                                  <span
                                    style={{ fontWeight: 800, fontSize: 10 }}
                                  >
                                    {p.icon}
                                  </span>
                                ) : (
                                  React.cloneElement(
                                    p.icon as React.ReactElement,
                                    { size: 12 },
                                  )
                                )}
                              </div>
                              <strong
                                style={{ fontSize: 14, color: "#2C2016" }}
                              >
                                {p.name} Edit
                              </strong>
                            </div>
                            <ChevronRight
                              size={16}
                              style={{
                                color: "rgba(44,32,22,0.4)",
                                transform: isExpanded
                                  ? "rotate(90deg)"
                                  : "none",
                                transition: "transform 0.2s",
                              }}
                            />
                          </div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: "hidden" }}
                              >
                                <div
                                  style={{
                                    borderTop: "1px solid rgba(44,32,22,0.04)",
                                  }}
                                >
                                  {renderEditorBlock(pId, p)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: createPostPlatforms.length > 1 ? 0 : 30,
                  }}
                >
                  {createPostPlatforms.length > 1 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 12,
                        overflowX: "auto",
                        paddingBottom: 4,
                      }}
                    >
                      {createPostPlatforms.map((pId) => {
                        const p = PLATFORMS.find((x) => x.id === pId);
                        if (!p) return null;
                        const isActive =
                          activePreviewPlatform &&
                          createPostPlatforms.includes(activePreviewPlatform)
                            ? activePreviewPlatform === pId
                            : createPostPlatforms[0] === pId;
                        return (
                          <div
                            key={`preview-tab-${pId}`}
                            onClick={() => setActivePreviewPlatform(pId)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              background: isActive
                                ? p.color
                                : "rgba(44,32,22,0.04)",
                              color: isActive ? "white" : "rgba(44,32,22,0.6)",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                            className={isActive ? "" : "hover-bg"}
                          >
                            {typeof p.icon === "string" ? (
                              <span>{p.icon}</span>
                            ) : (
                              React.cloneElement(p.icon as React.ReactElement, {
                                size: 12,
                              })
                            )}
                            {p.name}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(() => {
                    const pId =
                      createPostPlatforms.length > 0
                        ? activePreviewPlatform &&
                          createPostPlatforms.includes(activePreviewPlatform)
                          ? activePreviewPlatform
                          : createPostPlatforms[0]
                        : null;
                    const caption = pId
                      ? (platformOverrides[pId]?.caption ?? createPostCaption)
                      : createPostCaption;
                    const mediaList = pId
                      ? platformOverrides[pId]?.media !== undefined
                        ? platformOverrides[pId]?.media
                        : createPostMedia
                      : createPostMedia;

                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "10px 0",
                        }}
                      >
                        <PlatformPreview
                          platform={pId || "instagram"}
                          contentType={
                            createPostPlatformTypes[pId || ""] || "feed"
                          }
                          caption={caption}
                          mediaList={mediaList || []}
                          workspaceName={workspace?.name || "Workspace"}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 28px",
              borderTop: "1px solid rgba(44,32,22,0.05)",
              background: "white",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  background: "rgba(44,32,22,0.03)",
                  borderRadius: 10,
                  padding: 4,
                }}
              >
                <button
                  onClick={() => setCreatePostMode("now")}
                  style={{
                    background:
                      createPostMode === "now" ? "white" : "transparent",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      createPostMode === "now"
                        ? "#2C2016"
                        : "rgba(44,32,22,0.4)",
                    cursor: "pointer",
                    boxShadow:
                      createPostMode === "now"
                        ? "0 2px 8px rgba(0,0,0,0.04)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Post Sekarang
                </button>
                <button
                  onClick={() => setCreatePostMode("schedule")}
                  style={{
                    background:
                      createPostMode === "schedule" ? "white" : "transparent",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 700,
                    color:
                      createPostMode === "schedule"
                        ? "#2C2016"
                        : "rgba(44,32,22,0.4)",
                    cursor: "pointer",
                    boxShadow:
                      createPostMode === "schedule"
                        ? "0 2px 8px rgba(0,0,0,0.04)"
                        : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Jadwal Post
                </button>
              </div>

              {createPostMode === "schedule" && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="date"
                    value={createPostDate}
                    onChange={(e) => setCreatePostDate(e.target.value)}
                    style={{
                      borderRadius: 10,
                      border: "none",
                      background: "rgba(44,32,22,0.03)",
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "inherit",
                      color: "#2C2016",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) =>
                      (e.target.style.background = "rgba(44,32,22,0.06)")
                    }
                    onBlur={(e) =>
                      (e.target.style.background = "rgba(44,32,22,0.03)")
                    }
                  />
                  <input
                    type="time"
                    value={createPostTime}
                    onChange={(e) => setCreatePostTime(e.target.value)}
                    style={{
                      borderRadius: 10,
                      border: "none",
                      background: "rgba(44,32,22,0.03)",
                      padding: "8px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "inherit",
                      color: "#2C2016",
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) =>
                      (e.target.style.background = "rgba(44,32,22,0.06)")
                    }
                    onBlur={(e) =>
                      (e.target.style.background = "rgba(44,32,22,0.03)")
                    }
                  />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowCreatePostPopup(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "rgba(44,32,22,0.4)",
                  fontSize: 13,
                }}
                className="hover-bg"
              >
                Batal
              </button>
              <button
                onClick={handleCreatePost}
                style={{
                  background: "var(--theme-primary)",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 24px",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "white",
                  fontSize: 13,
                }}
                className="hover-scale hover-bg"
              >
                {createPostMode === "now" ? "Post Sekarang" : "Jadwalkan Post"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
