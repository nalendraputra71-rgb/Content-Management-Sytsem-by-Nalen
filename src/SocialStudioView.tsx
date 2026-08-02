import { CustomDropdown } from "./components/CustomDropdown";
import { usePlanLimits } from "./hooks/usePlanLimits";
import { MobileStepper } from "./components/MobileStepper";
import { SimulatedStreamMarkdown } from "./components/SimulatedStreamMarkdown";
import { CreatePostModal } from "./components/SocialStudio/CreatePostModal";
import { ContentModal } from "./components/SocialStudio/ContentModal";
import { HubAiTab } from "./HubAiTab";
import { InboxTab } from "./InboxTab";
import { CompetitorTab } from "./CompetitorTab";
import { CalendarTab } from "./CalendarTab";
import { ContentTab } from "./ContentTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { DashboardTab } from "./DashboardTab";
import { useI18n } from "./i18n";
import { PlatformPreview } from "./components/SocialStudio/PlatformPreview";
import {
  db,
  callAiWithQuota,
  handleFirestoreError,
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
} from "./firebase";
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DynamicPlatformIcon } from "./components/DynamicPlatformIcon";
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
  Smartphone,
} from "lucide-react";
import Markdown from "react-markdown";
import { PlatformIntegrationModal } from "./components/SocialStudio/PlatformIntegrationModal";
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

function getPlatformIcon(platformIdentifier: string, size = 16) {
  const name = String(platformIdentifier || "")
    .trim()
    .toLowerCase();

  const exactMatches = ["ig", "tt", "fb", "meta", "x", "li", "yt"];
  const includesMatches = [
    "instagram",
    "tiktok",
    "facebook",
    "threads",
    "twitter",
    "linkedin",
    "youtube",
  ];
  const isKnown =
    exactMatches.includes(name) ||
    includesMatches.some((k) => name.includes(k));

  if (name.includes("semua") || name === "all" || name.includes("globe")) {
    return <Globe size={size} color="#888888" />;
  }

  if (isKnown) {
    return (
      <DynamicPlatformIcon platformName={platformIdentifier} size={size} />
    );
  }

  return null;
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
    icon: (
      <span style={{ fontWeight: 900, fontSize: 15, fontFamily: "sans-serif" }}>
        𝕏
      </span>
    ),
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
  planDetails,
  onOpenModal,
  setTab,
}: {
  tab: string;
  workspaceId?: string;
  content?: any[];
  workspace?: any;
  user?: any;
  profile?: any;
  planDetails?: any;
  onOpenModal?: (data: any) => void;
  setTab?: (tab: string) => void;
}) {
  const [inboxMessages, setInboxMessages] = useState<any[]>([
    {
      id: "inbox_1",
      platform: "instagram",
      senderName: "Budi Santoso",
      content: "Halo kak, apakah produk jaket Corduroy-nya masih ready stock?",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      replies: [
        {
          content:
            "Halo Budi! Masih ready stock ya untuk warna Hitam dan Navy. Silakan bisa langsung diorder melalui link di bio kami ya kak. 😊",
          createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        },
      ],
    },
    {
      id: "inbox_2",
      platform: "tiktok",
      senderName: "Siti Rahma",
      content:
        "Kak, saya mau tanya ukuran XL untuk hoodie cream LD-nya berapa ya?",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      replies: [],
    },
    {
      id: "inbox_3",
      platform: "instagram",
      senderName: "Andi Wijaya",
      content:
        "Pesanan saya dengan nomor #9482 belum sampai ya kak? Bisa tolong dicek?",
      createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      replies: [],
    },
  ]);
  const [rawSelectedInboxMsg, setRawSelectedInboxMsg] = useState<any>(null);
  const [msgContent, setMsgContent] = useState("");
  const [inboxFilter, setInboxFilter] = useState("all");
  const [inboxViewMode, setInboxViewMode] = useState<"dms" | "comments">("dms");
  const [rawSelectedComment, setRawSelectedComment] = useState<any>(null);

  const { lang } = useI18n();
  const setSelectedInboxMsg = setRawSelectedInboxMsg;
  const setSelectedComment = setRawSelectedComment;

  const MOCK_COMMENTS: any[] = [];

  const [activeTab, setActiveTab] = useState("social-dashboard");

  const [isMobileHubAi, setIsMobileHubAi] = useState(false);
  const [mobileHubAiView, setMobileHubAiView] = useState<"chat" | "history">(
    "chat",
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileHubAi(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya HUB.AI, asisten khusus untuk content creator. Apa yang bisa saya bantu hari ini?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const mappedDefaultModel = planDetails?.capabilities?.allowedModels?.[0] ? (planDetails.capabilities.allowedModels[0] === "gemini-3.5-flash" ? "gemini-3.6-flash" : planDetails.capabilities.allowedModels[0] === "gemini-3.1-pro" ? "gemini-3.1-pro-preview" : planDetails.capabilities.allowedModels[0]) : "gemini-3.6-flash";
  const [selectedAiModel, setSelectedAiModel] = useState(mappedDefaultModel);

  useEffect(() => {
    const allowed = (planDetails?.capabilities?.allowedModels || ['gemini-3.6-flash']).map((m: string) => m === "gemini-3.5-flash" ? "gemini-3.6-flash" : m === "gemini-3.1-pro" ? "gemini-3.1-pro-preview" : m);
    if (!allowed.includes(selectedAiModel)) {
      setSelectedAiModel(allowed[0] || 'gemini-3.6-flash');
    }
  }, [planDetails?.capabilities?.allowedModels, selectedAiModel]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [activeHistoryMenuId, setActiveHistoryMenuId] = useState<string | null>(
    null,
  );
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<
    string | null
  >(null);
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
  const [connectedAccountsData, setConnectedAccountsData] = useState<
    Record<string, any>
  >({});
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [contentPlatform, setContentPlatform] = useState("all");
  const [contentSort, setContentSort] = useState("newest");
  const [createPostCaption, setCreatePostCaption] = useState("");
  const [createPostDate, setCreatePostDate] = useState("");
  const [createPostMedia, setCreatePostMedia] = useState<any[]>([]);
  const [createPostMode, setCreatePostMode] = useState<"now" | "schedule">(
    "now",
  );
  const [createPostPlatforms, setCreatePostPlatforms] = useState<string[]>([]);
  const [createPostPlatformTypes, setCreatePostPlatformTypes] = useState<
    Record<string, string>
  >({});
  const [createPostTime, setCreatePostTime] = useState("");
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [dashTimeRange, setDashTimeRange] = useState("30d");
  const [dataSource, setDataSource] = useState("all");
  const dataSourceDropdownRef = useRef<HTMLDivElement>(null);
  const DEFAULT_CONFIG_ITEM = { id: "", title: "", prompt: "" };
  const [disconnectPrompt, setDisconnectPrompt] = useState<{
    open: boolean;
    platform: string | null;
  }>({ open: false, platform: null });
  const [editingConfig, setEditingConfig] = useState<any>({});
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [editSessionTitle, setEditSessionTitle] = useState("");
  const [expandedEditPlatforms, setExpandedEditPlatforms] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const handleOpen = () => setShowCreatePostPopup(true);
    window.addEventListener("open-social-studio-create-post", handleOpen);
    return () =>
      window.removeEventListener("open-social-studio-create-post", handleOpen);
  }, []);

  useEffect(() => {
    if (!workspaceId) return;

    // Auto-sync backend secrets to this workspace
    fetch("/api/meta/sync-secrets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    }).catch(console.error);

    const accountsRef = collection(
      db,
      "workspaces",
      workspaceId,
      "connectedAccounts",
    );
    const unsubscribe = onSnapshot(
      accountsRef,
      (snapshot) => {
        const accounts: Record<string, any> = {};
        const platforms: string[] = [];
        snapshot.forEach((doc) => {
          accounts[doc.id] = doc.data();
          platforms.push(doc.id);
        });
        setConnectedAccountsData(accounts);
        setConnectedPlatforms(platforms);
      },
      (err) => {
        console.error("Failed to subscribe to connectedAccounts", err);
      },
    );
    return () => unsubscribe();
  }, [workspaceId]);

  useEffect(() => {
    if (!user?.uid || !workspaceId) return;
    const q = query(
      collection(db, "users", user.uid, "aiChats"),
      where("workspaceId", "==", workspaceId),
      limit(20),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const sessions: any[] = [];
        snapshot.forEach((doc) => {
          sessions.push({ id: doc.id, ...doc.data() });
        });
        // Sort by updatedAt descending
        sessions.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return timeB - timeA;
        });
        setChatSessions(sessions);
      },
      (err) => {
        console.error("Failed to fetch chat sessions:", err);
      },
    );
    return () => unsub();
  }, [user?.uid, workspaceId]);

  useEffect(() => {
    if (!workspaceId || connectedPlatforms.length === 0) return;

    const fetchApiData = async () => {
      try {
        let allPosts: any[] = [];
        let allComments: any[] = [];
        let apiErrors: string[] = [];

        for (const platform of ["meta", "instagram"]) {
          if (connectedAccountsData[platform]) {
            try {
              const accToken = connectedAccountsData[platform].accessToken;
              const accId = connectedAccountsData[platform].accountId;

              const postsRes = await fetch(
                `/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=posts&clientAccessToken=${accToken}&clientAccountId=${accId}`,
              );
              const postsData = await postsRes.json().catch(() => ({}));
              if (postsRes.ok && !postsData.error) {
                if (postsData.data) {
                  const mappedPosts = postsData.data.map((p: any) => ({
                    id: p.id,
                    platform: platform,
                    content: p.message || p.caption || "No content",
                    date: new Date(
                      p.created_time || p.timestamp,
                    ).toLocaleDateString(),
                    status: "published",
                    likes: p.likes?.summary?.total_count || p.like_count || 0,
                    comments:
                      p.comments?.summary?.total_count || p.comments_count || 0,
                    media:
                      p.media_url ||
                      p.attachments?.data?.[0]?.media?.image?.src ||
                      "",
                    author:
                      connectedAccountsData[platform].accountName || platform,
                  }));
                  allPosts = [...allPosts, ...mappedPosts];
                }
              } else {
                apiErrors.push(
                  `${platform} (posts): ${postsData.error?.message || postsData.error || postsRes.statusText}`,
                );
              }
            } catch (err: any) {
              apiErrors.push(`${platform}: ${err.message || "Unknown error"}`);
            }
          }
        }

        if (apiErrors.length > 0) {
          setMetaApiError(apiErrors.join(" | "));
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

  const [diagnosticResult, setDiagnosticResult] = useState<Record<string, any>>(
    {},
  );
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const runDiagnostic = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult({});
    const results: Record<string, any> = {};

    if (connectedPlatforms.length === 0) {
      results["all"] = {
        status: "error",
        message: "Belum ada platform yang terkoneksi di Workspace ini.",
      };
      setDiagnosticResult(results);
      setIsDiagnosing(false);
      return;
    }

    for (const platform of connectedPlatforms) {
      try {
        const accToken = connectedAccountsData[platform]?.accessToken;
        const accId = connectedAccountsData[platform]?.accountId;

        if (!accToken || !accId) {
          results[platform] = {
            status: "error",
            message: "Akses Token atau Account ID tidak ditemukan di database.",
          };
          continue;
        }

        const res = await fetch(
          `/api/meta/data?workspaceId=${workspaceId}&platform=${platform}&type=posts&clientAccessToken=${accToken}&clientAccountId=${accId}`,
        );
        const data = await res.json().catch(() => ({}));

        if (res.ok && !data.error) {
          results[platform] = {
            status: "success",
            message: "Koneksi berhasil, token valid!",
          };
        } else {
          results[platform] = {
            status: "error",
            message: `Gagal: ${data.error?.message || data.error || res.statusText}`,
          };
        }
      } catch (err: any) {
        results[platform] = {
          status: "error",
          message: `Error jaringan/sistem: ${err.message}`,
        };
      }
    }

    setDiagnosticResult(results);
    setIsDiagnosing(false);
  };

  const handleChatSubmit = async (customMsg?: string) => {
    await handleSendMessage(customMsg);
  };

  const handleToggleConfigPanel = () => {
    setShowConfigPanel((prev) => !prev);
  };

  const handleCloseConfigPanel = () => {
    setShowConfigPanel(false);
  };

  const handleDiscardConfigs = () => {
    setShowDiscardModal(false);
    setShowConfigPanel(false);
  };

  const handleCreatePost = async () => {
    if (!workspaceId) return;

    try {
      let targetYear = new Date().getFullYear();
      let targetMonth = new Date().getMonth() + 1;
      let targetDay = new Date().getDate();
      let targetHour = 9;
      let targetMinute = 0;

      if (createPostMode === "schedule" && createPostDate) {
        const parts = createPostDate.split("-");
        if (parts.length === 3) {
          targetYear = parseInt(parts[0], 10);
          targetMonth = parseInt(parts[1], 10);
          targetDay = parseInt(parts[2], 10);
        }
        if (createPostTime) {
          const tParts = createPostTime.split(":");
          if (tParts.length >= 2) {
            targetHour = parseInt(tParts[0], 10);
            targetMinute = parseInt(tParts[1], 10);
          }
        }
      }

      const selectedPlatforms =
        createPostPlatforms.length > 0 ? createPostPlatforms : ["instagram"];

      for (const plat of selectedPlatforms) {
        const itemId = "post_" + Math.random().toString(36).substring(2, 11);
        const captionText =
          platformOverrides[plat]?.caption ?? createPostCaption;
        const mediaList = platformOverrides[plat]?.media ?? createPostMedia;

        const newItem = {
          id: itemId,
          year: targetYear,
          month: targetMonth,
          day: targetDay,
          uploadHour: targetHour,
          uploadMinute: targetMinute,
          pillar: "General",
          platform: plat,
          contentType: createPostPlatformTypes[plat] || "feed",
          pic: profile?.fullName || "HUB.AI",
          status: createPostMode === "schedule" ? "Scheduled" : "Publishing",
          title: "Created via HUB.AI",
          caption: captionText,
          briefCopywriting: "",
          objective: "Generated automatically by HUB.AI assistant",
          hook: "",
          cta: "",
          referenceText: "",
          referenceLinks: [],
          referenceImage: mediaList?.[0] || "",
          customFields: [],
          linkAsset: "",
          linkSosmed: "",
          isAds: false,
          archived: false,
          metricsUpdatedAt: null,
          metrics: {
            views: 0,
            reach: 0,
            likes: 0,
            comments: 0,
            reposts: 0,
            shares: 0,
            saves: 0,
            profileVisits: 0,
            bioLinkTaps: 0,
            follows: 0,
          },
          adsMetrics: {
            views: 0,
            reach: 0,
            likes: 0,
            comments: 0,
            reposts: 0,
            shares: 0,
            saves: 0,
            profileVisits: 0,
            bioLinkTaps: 0,
            follows: 0,
            clicks: 0,
            conversions: 0,
            msgConvStarted: 0,
            threeSecPlays: 0,
            spendBudget: 0,
            dailyBudget: 0,
            duration: 0,
            cprProfileVisit: 0,
            audience: "",
          },
        };

        await setDoc(
          doc(db, "workspaces", workspaceId, "content", itemId),
          newItem,
        );
      }

      setShowCreatePostPopup(false);
      if (tab === "social-studio" && setTab) {
        setTab("social-dashboard");
      }
      setCreatePostCaption("");
      setCreatePostMedia([]);
      setPlatformOverrides({});

      alert(
        lang === "id"
          ? "Konten berhasil disimpan/dijadwalkan!"
          : "Content successfully saved/scheduled!",
      );
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert("Error: " + error.message);
    }
  };

  const [heatmapMetric, setHeatmapMetric] = useState("engagement");
  const [hubaiConfigs, setHubaiConfigs] = useState<any[]>([]);
  const HUBAI_TIPS =
    lang === "id"
      ? [
          "Gunakan hook yang menarik di 3 detik pertama video Anda untuk meningkatkan retention rate secara signifikan.",
          "Konsistensi posting lebih penting daripada kuantitas. Buat jadwal yang realistis dan patuhi itu.",
          "Selalu sertakan Call to Action (CTA) yang jelas di setiap akhir postingan untuk mengarahkan audiens.",
        ]
      : [
          "Use an engaging hook in the first 3 seconds of your video to significantly increase retention rate.",
          "Consistency in posting is more important than quantity. Create a realistic schedule and stick to it.",
          "Always include a clear Call to Action (CTA) at the end of each post to guide your audience.",
        ];
  const inboxChatScrollRef = useRef<HTMLDivElement>(null);
  const [integrationModal, setIntegrationModal] = useState<{
    open: boolean;
    platform: string | null;
  }>({ open: false, platform: null });
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [mergedComments, setMergedComments] = useState<any[]>([
    {
      id: "comment_1",
      platform: "instagram",
      postThumbnail:
        "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=120&h=120&fit=crop",
      postMedia:
        "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=300&h=300&fit=crop",
      postCaption:
        "New Release: Corduroy Overcoat Series! Style modern, bahan premium yang super nyaman untuk daily wear.",
      postLikes: 1240,
      postCommentCount: 2,
      postTime: "2 hari yang lalu",
      senderName: "Agus Pratama",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      postComments: [
        {
          id: "pc_1",
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          username: "agus_pratama",
          text: "Bahannya tebal ga kak? Ada panduan ukurannya?",
          time: "15m",
          isLiked: true,
          replies: [
            {
              id: "pcr_1",
              avatar:
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
              username: "fadkhera_id",
              text: "Bahan corduroy premium tebal tapi tetap adem kak! Panduan ukuran lengkap ada di slide terakhir ya kak. 😊",
              time: "10m",
            },
          ],
        },
        {
          id: "pc_2",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
          username: "rudi_hermawan",
          text: "Keren banget overcoat-nya! 🔥 Langsung checkout satu warna sage green.",
          time: "1j",
          isLiked: false,
          replies: [],
        },
      ],
    },
    {
      id: "comment_2",
      platform: "tiktok",
      postThumbnail:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=120&h=120&fit=crop",
      postMedia:
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=300&fit=crop",
      postCaption:
        "OOTD Simple tapi tetap stylish buat nongkrong sore ini! Tap link di bio untuk catalog lengkap.",
      postLikes: 3500,
      postCommentCount: 1,
      postTime: "5 hari yang lalu",
      senderName: "Lia Kartika",
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      postComments: [
        {
          id: "pc_3",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
          username: "lia_kartika",
          text: "Spill celana kulot-nya dong kak beli di mana?",
          time: "1j",
          isLiked: false,
          replies: [],
        },
      ],
    },
  ]);
  const [metaApiError, setMetaApiError] = useState<string | null>(null);
  const [platformOverrides, setPlatformOverrides] = useState<
    Record<string, any>
  >({});
  const PROMPT_IDEAS =
    lang === "id"
      ? [
          "Buat rancangan konten Reels Instagram tentang cara jualan online untuk pemula agar langsung closing.",
          "Berikan 5 ide konten Carousel TikTok yang mengedukasi tentang personal branding.",
          "Tulis caption LinkedIn yang profesional dan persuasif untuk mempromosikan produk SaaS.",
        ]
      : [
          "Create an Instagram Reels content draft about how to sell online for beginners to close deals instantly.",
          "Give 5 educational TikTok Carousel content ideas about personal branding.",
          "Write a professional and persuasive LinkedIn caption to promote a SaaS product.",
        ];
  const [realInsights, setRealInsights] = useState<any>(null);
  const [realPosts, setRealPosts] = useState<any[]>([]);

  const renderHighlightedText = (text: string, query?: string) => <>{text}</>;
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const saveConfig = async (...args: any[]) => {};
  const [savingConfig, setSavingConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedComment = rawSelectedComment;
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const selectedInboxMsg = rawSelectedInboxMsg;
  const sendCommentReply = async (content: string) => {
    if (!content.trim() || !rawSelectedComment) return;

    const authorName = "fadkhera_id";
    const authorAvatar =
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop";

    if (replyingTo) {
      const newReply = {
        id: "pcr_" + Math.random().toString(36).substring(2, 9),
        avatar: authorAvatar,
        username: authorName,
        text: content.trim(),
        time: "Just now",
      };

      setMergedComments((prev) =>
        prev.map((post) => {
          if (post.id !== rawSelectedComment.id) return post;
          const updatedComments = post.postComments.map((pc: any) => {
            if (pc.id !== replyingTo.id) return pc;
            return {
              ...pc,
              replies: [...(pc.replies || []), newReply],
            };
          });
          return {
            ...post,
            postComments: updatedComments,
            postCommentCount: post.postCommentCount + 1,
          };
        }),
      );

      setRawSelectedComment((prev: any) => {
        if (!prev) return null;
        const updatedComments = prev.postComments.map((pc: any) => {
          if (pc.id !== replyingTo.id) return pc;
          return {
            ...pc,
            replies: [...(pc.replies || []), newReply],
          };
        });
        return {
          ...prev,
          postComments: updatedComments,
          postCommentCount: prev.postCommentCount + 1,
        };
      });

      setReplyingTo(null);
    } else {
      const newComment = {
        id: "pc_" + Math.random().toString(36).substring(2, 9),
        avatar: authorAvatar,
        username: authorName,
        text: content.trim(),
        time: "Just now",
        isLiked: false,
        replies: [],
      };

      setMergedComments((prev) =>
        prev.map((post) =>
          post.id === rawSelectedComment.id
            ? {
                ...post,
                postComments: [...(post.postComments || []), newComment],
                postCommentCount: post.postCommentCount + 1,
              }
            : post,
        ),
      );

      setRawSelectedComment((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          postComments: [...(prev.postComments || []), newComment],
          postCommentCount: prev.postCommentCount + 1,
        };
      });
    }
  };

  const sendDMMessage = async (content: string) => {
    if (!content.trim() || !rawSelectedInboxMsg) return;
    const newReply = {
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setInboxMessages((prev) =>
      prev.map((msg) =>
        msg.id === rawSelectedInboxMsg.id
          ? { ...msg, replies: [...(msg.replies || []), newReply] }
          : msg,
      ),
    );

    setRawSelectedInboxMsg((prev: any) => {
      if (!prev) return null;
      return { ...prev, replies: [...(prev.replies || []), newReply] };
    });
  };

  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showCreatePostPopup, setShowCreatePostPopup] = useState(false);
  const [createPostMobileTab, setCreatePostMobileTab] = useState<
    "editor" | "preview"
  >("editor");
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const updateEditingConfig = (key: string, value: any) =>
    setEditingConfig((prev: any) => ({ ...prev, [key]: value }));
  const [targetMessageIndex, setTargetMessageIndex] = useState(-1);
  const ANALYSIS_IDEAS =
    lang === "id"
      ? [
          "Analisis performa konten saya minggu lalu dan berikan rekomendasi peningkatan interaksi.",
          "Evaluasi strategi kompetitor di platform Instagram berdasarkan data terbaru.",
          "Rancang jadwal posting konten terbaik untuk audiens saya bulan ini.",
        ]
      : [
          "Analyze my content performance last week and provide recommendations to increase interaction.",
          "Evaluate competitor strategy on Instagram based on the latest data.",
          "Design the best content posting schedule for my audience this month.",
        ];

  const handleSendMessage = async (customMsg?: string) => {
    const msgToSend = customMsg || chatInput;
    if (!msgToSend.trim()) return;

    const userMsg = msgToSend;
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
              workspaceId: workspaceId,
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

      const msgLower = userMsg.toLowerCase();

      let filteredContent = [...(content || [])];
      let filteredContentPerf = DISPLAY_CONTENT;
      let filteredAnalytics = MOCK_CHART_DATA;

      // Deteksi niat pengguna untuk memfilter data berdasarkan bulan
      if (msgLower.includes("juni") || msgLower.includes("june")) {
        filteredContent = filteredContent.filter(
          (c) =>
            c.date?.includes("-06-") ||
            c.date?.includes("/6/") ||
            c.date?.includes("/06/") ||
            c.date?.toLowerCase().includes("jun"),
        );
        filteredContentPerf = DISPLAY_CONTENT.filter(
          (c) =>
            c.time?.toLowerCase().includes("jun") || c.time?.includes("/6/"),
        );
        filteredAnalytics = MOCK_CHART_DATA.filter(
          (c) =>
            c.date?.toLowerCase().includes("jun") || c.date?.includes("/6/"),
        );
      } else if (msgLower.includes("juli") || msgLower.includes("july")) {
        filteredContent = filteredContent.filter(
          (c) =>
            c.date?.includes("-07-") ||
            c.date?.includes("/7/") ||
            c.date?.includes("/07/") ||
            c.date?.toLowerCase().includes("jul"),
        );
        filteredContentPerf = DISPLAY_CONTENT.filter(
          (c) =>
            c.time?.toLowerCase().includes("jul") || c.time?.includes("/7/"),
        );
        filteredAnalytics = MOCK_CHART_DATA.filter(
          (c) =>
            c.date?.toLowerCase().includes("jul") || c.date?.includes("/7/"),
        );
      } else if (msgLower.includes("agustus") || msgLower.includes("august")) {
        filteredContent = filteredContent.filter(
          (c) =>
            c.date?.includes("-08-") ||
            c.date?.includes("/8/") ||
            c.date?.includes("/08/") ||
            c.date?.toLowerCase().includes("agu") ||
            c.date?.toLowerCase().includes("aug"),
        );
        filteredContentPerf = DISPLAY_CONTENT.filter(
          (c) =>
            c.time?.toLowerCase().includes("agu") ||
            c.time?.toLowerCase().includes("aug") ||
            c.time?.includes("/8/"),
        );
        filteredAnalytics = MOCK_CHART_DATA.filter(
          (c) =>
            c.date?.toLowerCase().includes("agu") ||
            c.date?.toLowerCase().includes("aug") ||
            c.date?.includes("/8/"),
        );
      } else if (msgLower.includes("mei") || msgLower.includes("may")) {
        filteredContent = filteredContent.filter(
          (c) =>
            c.date?.includes("-05-") ||
            c.date?.includes("/5/") ||
            c.date?.includes("/05/") ||
            c.date?.toLowerCase().includes("mei") ||
            c.date?.toLowerCase().includes("may"),
        );
        filteredContentPerf = DISPLAY_CONTENT.filter(
          (c) =>
            c.time?.toLowerCase().includes("mei") ||
            c.time?.toLowerCase().includes("may") ||
            c.time?.includes("/5/"),
        );
        filteredAnalytics = MOCK_CHART_DATA.filter(
          (c) =>
            c.date?.toLowerCase().includes("mei") ||
            c.date?.toLowerCase().includes("may") ||
            c.date?.includes("/5/"),
        );
      } else if (msgLower.includes("april")) {
        filteredContent = filteredContent.filter(
          (c) =>
            c.date?.includes("-04-") ||
            c.date?.includes("/4/") ||
            c.date?.includes("/04/") ||
            c.date?.toLowerCase().includes("apr"),
        );
        filteredContentPerf = DISPLAY_CONTENT.filter(
          (c) =>
            c.time?.toLowerCase().includes("apr") || c.time?.includes("/4/"),
        );
        filteredAnalytics = MOCK_CHART_DATA.filter(
          (c) =>
            c.date?.toLowerCase().includes("apr") || c.date?.includes("/4/"),
        );
      }

      const recentContent = filteredContent.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      // Jika user bertanya tentang performa tertinggi
      if (
        msgLower.includes("tertinggi") ||
        msgLower.includes("tinggi") ||
        msgLower.includes("top") ||
        msgLower.includes("terbaik") ||
        msgLower.includes("terbanyak")
      ) {
        filteredContentPerf = [...filteredContentPerf].sort(
          (a, b) => Number(b.er) - Number(a.er),
        );
      }

      const contextData: any = {
        workspaceName: workspace?.name,
        userName: profile?.name || user?.displayName || "Creator",
        companyName: profile?.companyName,
        industry: profile?.industry,
        platformConnections: connectedPlatforms,
      };

      const contentByPlatform = (content || []).reduce((acc: any, c: any) => {
        const platforms = Array.isArray(c.platform)
          ? c.platform
          : [c.platform || "unknown"];
        platforms.forEach((p: string) => {
          acc[p] = (acc[p] || 0) + 1;
        });
        return acc;
      }, {});

      if (dataSource === "all" || dataSource === "social_management") {
        contextData.socialManagement = {
          totalContentPlanned: (content || []).length,
          contentPlannedByPlatform: contentByPlatform,
          filteredContent: recentContent.map((c) => {
            const metrics = c.metrics || {};
            const adsMetrics = c.adsMetrics || {};
            const totalEng =
              (metrics.likes || 0) +
              (metrics.comments || 0) +
              (metrics.shares || 0) +
              (metrics.saves || 0) +
              (adsMetrics.likes || 0) +
              (adsMetrics.comments || 0) +
              (adsMetrics.shares || 0) +
              (adsMetrics.saves || 0);
            const totalReach = (metrics.reach || 0) + (adsMetrics.reach || 0);
            const totalViews = (metrics.views || 0) + (adsMetrics.views || 0);
            const er =
              totalReach > 0 ? ((totalEng / totalReach) * 100).toFixed(2) : 0;
            return {
              title: c.title,
              date: c.date,
              type: c.type,
              status: c.status,
              platform: Array.isArray(c.platform)
                ? c.platform.join(",")
                : c.platform || "",
              views: totalViews,
              reach: totalReach,
              engRate: er,
              likes: (metrics.likes || 0) + (adsMetrics.likes || 0),
              comments: (metrics.comments || 0) + (adsMetrics.comments || 0),
            };
          }),
          analyticsData: filteredAnalytics.map((d) => ({
            date: d.date,
            views: d.views,
            er: d.er,
          })),
          contentPerf: filteredContentPerf.map((c) => ({
            title: c.title,
            plat: c.type,
            views: c.views,
            er: c.er,
            date: c.time,
          })),
        };
      }

      if (dataSource === "all" || dataSource === "social_studio") {
        contextData.socialStudio = {
          competitors: competitors
            .slice(0, 3)
            .map((c) => ({ user: c.username, er: c.er })),
          inbox: inboxMessages.slice(0, 5).map((m) => ({
            from: m.senderName || `User ${m.senderId || "?"}`,
            msg: m.content,
            plat: m.platform,
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

        const configStr = `Profil Personalisasi HUB.AI:
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
- Contoh Konten (Reference): ${activeConfig.contentExamples || "Tidak disebutkan"}`;

        const sysPrompt = `Anda adalah HUB.AI, Expert Social Media Manager & Creative Director kelas dunia yang bekerja di dalam platform Hubify. Anda memiliki spesialisasi dalam merancang strategi media sosial yang berfokus pada retention rate, tingginya engagement, dan konversi audience.
Tanggal hari ini: ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

${configStr}

PENTING:
- Anda memiliki alat (Tools / Function Calling) bernama 'fetch_workspace_data' yang dapat dipanggil secara otomatis oleh sistem untuk mengambil data dari Workspace pengguna.
- Jika pengguna menanyakan data performa, jadwal, metrik analitik, atau konten spesifik (misal: "tolong buatkan analisis dari data bulan Januari 2025" atau "apa konten dengan likes terbanyak"), ANDA WAJIB memanggil tool tersebut dengan parameter yang sesuai.
- JANGAN PERNAH berasumsi data kosong, JANGAN menyuruh pengguna melihat dashboard sendiri.
- Gunakan gaya bahasa yang asik, cerdas, natural, layaknya manusia. JANGAN pernah menyebutkan format JSON, array, function calling, atau hal teknis programming lainnya. Berbicaralah layaknya manusia.
- Jika user meminta untuk membuat draf konten, WAJIB gunakan format tag berikut:
**[JUDUL]** (isi judul)
**[PLATFORM]** (isi platform)
**[TIPE KONTEN]** (isi tipe konten)
**[OBJECTIVE]** (isi objektif)
**[HOOK]** (isi hook copywriting)
**[CTA]** (isi call to action)
**[CAPTION]** (isi caption)
**[BRIEF]** (berikan instruksi visual dan audio)`;

        const data = await callAiWithQuota(
          user.uid,
          profile?.plan,
          {
            prompt: userMsg,
            history: optimizedHistory,
            system: sysPrompt,
            useSearchGrounding: false,
            model: selectedAiModel,
            workspaceId: workspaceId,
          },
          planDetails?.aiTokenLimit || 50,
        );

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

  const removeCompetitor = (index: number) => {
    setCompetitors((prev) => prev.filter((_, idx) => idx !== index));
  };

  const { checkCanAddSocialAccount, maxSocialAccounts } = usePlanLimits(planDetails);
  
  const toggleConnection = async (id: string) => {
    if (connectedPlatforms.includes(id)) {
      setDisconnectPrompt({ open: true, platform: id });
    } else {
      if (!checkCanAddSocialAccount(connectedPlatforms.length)) {
        alert(
          `Batas maksimal Akun Sosmed untuk paket Anda adalah ${maxSocialAccounts}. Silakan upgrade paket untuk menghubungkan lebih banyak akun.`,
        );
        return;
      }
      setIntegrationModal({ open: true, platform: id });
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
      const data = await callAiWithQuota(
        user.uid,
        profile?.plan,
        {
          prompt:
            "Anda adalah pakar Social Media Analytics. Berdasarkan data berikut, berikan ringkasan performa yang mudah dibaca (dalam 3 paragraf pendek) dan 3 poin 'Rekomendasi Langkah Selanjutnya'. Data: Views 1.2M (+15%), Reach 980K (+10%), ER 5.2% (+1.2%), Komentar 4.1K, Likes 88.3K, Share 10.2K.",
          system:
            "Output dalam Markdown yang bersih, profesional, dan to the point.",
        },
        planDetails?.aiTokenLimit || 50,
      );
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
      const dataToUse =
        realInsights[analyticsPlatform] ||
        realInsights["meta"] ||
        realInsights["instagram"];
      if (dataToUse) {
        // Typically insights have {name: 'page_impressions', values: [{value, end_time}]}
        // We'll extract the first metric's values for dates.
        const metric = dataToUse[0];
        if (metric && metric.values) {
          return metric.values.map((v: any, i: number) => ({
            date: new Date(v.end_time).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
            views: v.value || 0,
            reach: v.value || 0,
            likes: 0,
            comments: 0,
            shares: 0,
            er: 0,
            reposts: 0,
            saves: 0,
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

    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return {
        date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        views: Math.floor((((i * 678) % 5000) + 1000) * multiplier),
        reach: Math.floor((((i * 345) % 3000) + 500) * multiplier),
        likes: Math.floor((((i * 123) % 1000) + 100) * multiplier),
        comments: Math.floor((((i * 45) % 200) + 10) * multiplier),
        shares: Math.floor((((i * 89) % 100) + 5) * multiplier),
        er: Number((((i * 1.5) % 3) + 1 + multiplier * 0.5).toFixed(1)),
        reposts: Math.floor((((i * 12) % 50) + 1) * multiplier),
        saves: Math.floor((((i * 56) % 300) + 20) * multiplier),
      };
    });
  }, [analyticsPlatform]);

  const SORT_OPTIONS = [
    { id: "terbaru", label: "Terbaru" },
    { id: "terlama", label: "Terlama" },
    { id: "a-z", label: "A - Z" },
    { id: "z-a", label: "Z - A" },
  ];

  const DISPLAY_CONTENT = React.useMemo(() => {
    let list = realPosts
      ? realPosts.map((p: any) => ({
          id: p.id,
          title: p.content ? p.content.slice(0, 40) + "..." : "Post",
          captionSnippet: p.content ? p.content.slice(0, 60) + "..." : "",
          postTypeLabel: "Post",
          accountName: p.author || "Account",
          time: p.date ? new Date(p.date).toLocaleString() : "",
          type: p.platform || "instagram",
          views: p.views || 0,
          reach: p.reach || 0,
          likes: p.likes || 0,
          er: p.er || "0.0",
          comments: p.comments || 0,
          shares: p.shares || 0,
          saves: p.saves || 0,
          thumbnail:
            p.media ||
            "https://images.unsplash.com/photo-1515347619362-67396c01e523?w=100&h=100&fit=crop",
        }))
      : [];

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


  const renderSessionItem = (s: any) => {
    return (
      <div
        key={s.id}
        onClick={() => {
          setActiveSessionId(s.id);
          setChatHistory(s.messages || []);
          setIsSearchMode(false);
          setMobileHubAiView("chat");
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
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(27,127,220,0.3)",
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
                    borderWidth: 0,
                    borderStyle: "none",
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
                    borderWidth: 0,
                    borderStyle: "none",
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
                      confirm(
                        lang === "id"
                          ? "Yakin ingin menghapus histori percakapan ini?"
                          : "Are you sure you want to delete this conversation history?",
                      )
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
                              lang === "id"
                                ? "Halo! Saya HUB.AI, asisten khusus untuk content creator."
                                : "Hello! I am HUB.AI, a dedicated assistant for content creators.",
                          },
                        ]);
                      }
                    }
                    setActiveHistoryMenuId(null);
                  }}
                  style={{
                    background: "transparent",
                    borderWidth: 0,
                    borderStyle: "none",
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

    const ctx = {
    isMobileHubAi, mobileHubAiView, setMobileHubAiView, activeSessionId, setActiveSessionId, chatSessions, chatHistory, setChatHistory, isSearchMode, setIsSearchMode, searchQuery, setSearchQuery, chatInput, setChatInput, PROMPT_IDEAS, ANALYSIS_IDEAS, currentPromptIndex, setCurrentPromptIndex, currentAnalysisIndex, setCurrentAnalysisIndex, handleChatSubmit, animatingMessageIndex, setAnimatingMessageIndex, chatScrollContainerRef, handleCreateDraftFromAI, chatLoading, showDataSourceDropdown, setShowDataSourceDropdown, dataSource, setDataSource, configDropdownRef, showConfigDropdown, setShowConfigDropdown, hubaiConfigs, activeConfigId, setActiveConfigId, showConfigPanel, setShowConfigPanel, selectedAiModel, setSelectedAiModel, configPanelRef, editingConfig, updateEditingConfig, saveConfig, savingConfig, showDiscardModal, setShowDiscardModal, handleToggleConfigPanel, handleCloseConfigPanel, handleDiscardConfigs, tab, setTab, dashboardPlatform, PLATFORMS, setDashboardPlatform, dashTimeRange, DASHBOARD_TIME_RANGES, setDashTimeRange, setShowCreatePostPopup, metaApiError, lang, connectedPlatforms, toggleConnection, connectedAccountsData, isDiagnosing, runDiagnostic, diagnosticResult, MobileStepper, CustomDropdown, aiLoading, aiReport, analyticsMetric, setAnalyticsMetric, analyticsPlatform, setAnalyticsPlatform, audiencePlatform, setAudiencePlatform, analyticsTimeRange, setAnalyticsTimeRange, heatmapMetric, setHeatmapMetric, name, ANALYTICS_METRICS, generateReport, MOCK_CHART_DATA, HeatmapMock, contentPlatform, setContentPlatform, DISPLAY_CONTENT, calendarPosts, setCalendarPosts, competitors, compInput, setCompInput, compLoading, addCompetitor, removeCompetitor, inboxMessages, msgContent, setMsgContent, inboxFilter, setInboxFilter, inboxViewMode, setInboxViewMode, mergedComments, replyingTo, setReplyingTo, setSelectedInboxMsg, setSelectedComment, commentChatScrollRef, inboxChatScrollRef, selectedComment, selectedInboxMsg, sendCommentReply, sendDMMessage
  , renderSessionItem, profile, user, planDetails, setTargetMessageIndex, renderHighlightedText, currentTipIndex, setCurrentTipIndex, HUBAI_TIPS, chatEndRef, dataSourceDropdownRef, setEditingConfigId, editingConfigId, setHubaiConfigs, DEFAULT_CONFIG_ITEM, createPostMobileTab, setCreatePostMobileTab, createPostPlatforms, setCreatePostPlatforms, createPostPlatformTypes, setCreatePostPlatformTypes, expandedEditPlatforms, setExpandedEditPlatforms, activePreviewPlatform, setActivePreviewPlatform, platformOverrides, setPlatformOverrides, createPostCaption, setCreatePostCaption, createPostMedia, setCreatePostMedia, workspace, createPostMode, setCreatePostMode, createPostDate, setCreatePostDate, createPostTime, setCreatePostTime, handleCreatePost
  , content, workspaceId, onOpenModal, selectedContent, setSelectedContent};

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
      <ContentModal
        selectedContent={selectedContent}
        setSelectedContent={setSelectedContent}
        lang={lang}
      />
      <PlatformIntegrationModal
        isOpen={integrationModal.open}
        platformId={integrationModal.platform}
        onClose={() => setIntegrationModal({ open: false, platform: null })}
        workspaceId={workspaceId}
        onSuccess={handleIntegrationSuccess}
      />

      <AnimatePresence>
        {disconnectPrompt.open && disconnectPrompt.platform && (
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
                    PLATFORMS.find((p) => p.id === disconnectPrompt.platform)
                      ?.name
                  }
                  ?
                </h3>
                {disconnectPrompt.platform &&
                  connectedAccountsData[disconnectPrompt.platform]
                    ?.accountName && (
                    <p className="text-sm font-semibold text-[#111827]/80 mb-2">
                      Account:{" "}
                      {
                        connectedAccountsData[disconnectPrompt.platform]
                          .accountName
                      }
                    </p>
                  )}
                <p className="text-sm text-[#111827]/60 mb-6">
                  Are you sure you want to disconnect this platform? You will
                  need to re-authenticate to connect it again.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDisconnectPrompt({ open: false, platform: null })
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
                            disconnectPrompt.platform!,
                          ),
                        );
                        setDisconnectPrompt({
                          open: false,
                          platform: null,
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
      {!showCreatePostPopup && tab !== "social-studio" ? (
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
          {tab === "social-dashboard" && <DashboardTab ctx={ctx} />}
          {tab === "social-analytics" && <AnalyticsTab ctx={ctx} />}
          {tab === "social-content" && <ContentTab ctx={ctx} />}
          {tab === "social-calendar" && <CalendarTab ctx={ctx} />}
          {tab === "social-competitor" && <CompetitorTab ctx={ctx} />}
          {tab === "social-inbox" && <InboxTab ctx={ctx} />}
          {tab === "social-hub-ai" && <HubAiTab ctx={ctx} />}
        </div>
      ) : (
        <CreatePostModal ctx={ctx} />
      )}
    </div>
  );
}
