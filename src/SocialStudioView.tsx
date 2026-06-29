import { PlatformPreview } from "./components/PlatformPreview";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { db, callAiWithQuota } from "./firebase";
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
  FileText,
  Pin,
  Edit2,
  Lightbulb,
  Heart,
  Upload,
  AlertTriangle,
  Info,
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

function CustomDropdown({
  value,
  options,
  onChange,
  renderOption,
  pill = false,
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
          borderRadius: pill ? 9999 : 12,
          border: "1px solid rgba(44,32,22,0.1)",
          background: "white",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          color: "#2C2016",
        }}
      >
        <span>{displayLabel}</span>
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
                    : typeof o === "string"
                      ? o
                      : o.label || o.name}
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
    icon: (
      <div
        style={{
          fontWeight: 800,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        TT
      </div>
    ),
    color: "#000000",
    contentTypes: [
      { id: "video", label: "Video" },
      { id: "photo_carousel", label: "Photo Carousel" },
    ],
  },
  {
    id: "threads",
    name: "Threads",
    icon: (
      <div
        style={{
          fontWeight: 800,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        @
      </div>
    ),
    color: "#000000",
    contentTypes: [{ id: "thread", label: "Thread" }],
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
  const [selectedInboxMsg, setSelectedInboxMsg] = useState<any>(null);
  const [msgContent, setMsgContent] = useState("");
  const [inboxFilter, setInboxFilter] = useState("all");
  const [inboxViewMode, setInboxViewMode] = useState<"dms" | "comments">("dms");
  const [selectedComment, setSelectedComment] = useState<any>(null);

  const MOCK_COMMENTS = [
    {
      id: "c1",
      platform: "instagram",
      senderName: "Budi Santoso",
      content: "Wah, desainnya bagus banget kak! Boleh spill tools nya?",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      postThumbnail:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
      postCaption: "Desain UI terbaru kita 🚀",
      replies: [],
    },
    {
      id: "c2",
      platform: "tiktok",
      senderName: "Siti Amelia",
      content: "Berapa harganya ini kak? Ada promo kah?",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      postThumbnail:
        "https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=100&h=100&fit=crop",
      postCaption: "Review produk andalan bulan ini ✨",
      replies: [
        {
          content:
            "Hai kak Siti, harganya Rp150.000 ya, lagi ada promo gratis ongkir!",
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          sender: "brand",
        },
      ],
    },
    {
      id: "c3",
      platform: "instagram",
      senderName: "John Doe",
      content: "Keren! Ditunggu konten selanjutnya.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      postThumbnail:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
      postCaption: "Desain UI terbaru kita 🚀",
      replies: [],
    },
  ];

  useEffect(() => {
    if (!workspaceId) return;
    const q = query(
      collection(db, "workspaces", workspaceId, "inbox"),
      orderBy("createdAt", "desc"),
    );
    const MOCK_INBOX_MESSAGES = [
      {
        id: "msg1",
        platform: "instagram",
        senderName: "Fadkhera",
        content:
          "Assalamualaikum\nHalo Kak, selamat Siang🙏\n\nPerkenalkan, kami dari Fadkhera dari brand fashion modern muslimwear.\n\nSaya sangat tertarik untuk menjalin kerjasama dengan Yogya Group dalam bentuk tenant atau konsinyasi produk fashion kami.\n\nBoleh saya tahu, kepada siapa dan melalui jalur mana kami bisa mengajukan proposal kerjasama ini? Apakah ada email, nomor WhatsApp, atau kontak PIC yang bisa dihubungi?\n\nTerima kasih banyak atas informasinya, kami sangat berharap bisa berdiskusi lebih lanjut",
        createdAt: "2026-05-23T13:20:00Z",
        replies: [],
      },
      {
        id: "msg2",
        platform: "instagram",
        senderName: "La Tansa Gontor Department Store",
        content: "You sent an attachment.",
        createdAt: "2026-05-23T13:41:00Z",
        replies: [],
      },
      {
        id: "msg3",
        platform: "instagram",
        senderName: "putri & 👸",
        content: "You: Assalamu'alaikum Kak, selamat ya! 🎉...",
        createdAt: "2026-05-23T13:35:00Z",
        replies: [],
      },
      {
        id: "msg4",
        platform: "instagram",
        senderName: "Hermira16",
        content: "Hermira16 sent an attachment.",
        createdAt: "2026-05-23T09:39:00Z",
        replies: [],
      },
      {
        id: "msg5",
        platform: "instagram",
        senderName: "YOGYA GROUP OFFICIAL",
        content: "You sent an attachment.",
        createdAt: "2026-05-23T08:41:00Z",
        replies: [],
      },
    ];

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setInboxMessages(MOCK_INBOX_MESSAGES);
        } else {
          setInboxMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      },
      (error) => {
        console.error("Error listening to inbox:", error);
      },
    );
    return unsub;
  }, [workspaceId]);

  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [showMultiAccountPopup, setShowMultiAccountPopup] = useState(false);
  const [integrationModal, setIntegrationModal] = useState<{
    isOpen: boolean;
    platformId: string | null;
  }>({
    isOpen: false,
    platformId: null,
  });
  const [disconnectPrompt, setDisconnectPrompt] = useState<{
    isOpen: boolean;
    platformId: string | null;
  }>({
    isOpen: false,
    platformId: null,
  });

  useEffect(() => {
    if (!workspaceId) return;
    const q = query(
      collection(db, "workspaces", workspaceId, "connectedAccounts"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setConnectedPlatforms(snap.docs.map((d) => d.id));
      },
      (error) => {
        console.error("Error listening to connectedAccounts:", error);
      },
    );
    return unsub;
  }, [workspaceId]);

  const [aiReport, setAiReport] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [dashTimeRange, setDashTimeRange] = useState("30 Hari Terakhir");
  const [showCreatePostPopup, setShowCreatePostPopup] = useState(false);
  const [createPostMode, setCreatePostMode] = useState<"now" | "schedule">(
    "now",
  );
  const [createPostCaption, setCreatePostCaption] = useState("");
  const [createPostMedia, setCreatePostMedia] = useState<
    { url: string; type: "image" | "video" }[]
  >([]);
  const [createPostPlatforms, setCreatePostPlatforms] = useState<string[]>([]);
  const [createPostPlatformTypes, setCreatePostPlatformTypes] = useState<
    Record<string, string>
  >({});
  const [platformOverrides, setPlatformOverrides] = useState<
    Record<
      string,
      { caption?: string; media?: { url: string; type: "image" | "video" }[] }
    >
  >({});
  const [expandedEditPlatforms, setExpandedEditPlatforms] = useState<
    Record<string, boolean>
  >({});
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<
    string | null
  >(null);
  const [analyticsMetric, setAnalyticsMetric] = useState("er");
  const [analyticsPlatform, setAnalyticsPlatform] = useState("all");
  const [analyticsTimeRange, setAnalyticsTimeRange] =
    useState("30 Hari Terakhir");
  const [contentPlatform, setContentPlatform] = useState("all");
  const [contentTimeRange, setContentTimeRange] = useState("30 Hari Terakhir");
  const [heatmapMetric, setHeatmapMetric] = useState("views");

  const [selectedContent, setSelectedContent] = useState<any>(null);

  useEffect(() => {
    // Popup restriction removed to allow all tabs
  }, [tab]);

  const [contentSort, setContentSort] = useState("terbaru");

  const [calendarPosts, setCalendarPosts] = useState([
    { day: 5, type: "ig", title: "Promo Baju", time: "12:00" },
    { day: 12, type: "tt", title: "Viral Tips", time: "19:00" },
    { day: 15, type: "fb", title: "Event Kemerdekaan", time: "14:30" },
  ]);

  const [compInput, setCompInput] = useState("");
  const [compLoading, setCompLoading] = useState(false);
  const [competitors, setCompetitors] = useState<any[]>([
    {
      username: "@brandsebelah",
      er: "4.2%",
      postsPerMonth: 14,
      topContent: [
        { title: "Review Produk Viral", views: "150K", likes: "12K" },
        { title: "Promo Tengah Malam", views: "85K", likes: "5K" },
        { title: "Q&A Audience", views: "60K", likes: "3K" },
      ],
    },
  ]);

  // --- HUB.AI States ---
  const HUBAI_TIPS = [
    "Gunakan fitur Konfigurasi AI untuk menyesuaikan gaya bahasa dan parameter brand kamu.",
    "Buka menu dropdown di bawah chat untuk mengganti sumber data analisismu.",
    "Pin chat yang penting dari history agar mudah dijadikan referensi di sesi berikutnya.",
    "Isi 'Kamus Brand' pada konfigurasi agar HUB.AI semakin spesifik meniru gaya bahasamu.",
    "Beri instruksi yang spesifik, misalnya tambahkan nada santai, target anak muda, atau call-to-action.",
  ];

  const PROMPT_IDEAS = [
    "Buatkan 3 ide konten TikTok tentang produktivitas kerja dengan hook menarik.",
    "Tuliskan caption Instagram persuasive untuk peluncuran produk baru beserta CTA.",
    "Berikan ide format Reels yang edukatif dan menambah trust followers.",
    "Bantu susun kalender konten IG 1 minggu untuk brand fashion lokal.",
    "Buatkan script YouTube Shorts 30 detik untuk tips menghemat uang.",
  ];

  const ANALYSIS_IDEAS = [
    "Analisis sentimen komentar di postingan terakhir, apa yang perlu diperbaiki?",
    "Bandingkan performa konten video Reels vs foto Carousel bulan lalu.",
    "Sebutkan kelemahan kompetitor di industri F&B yang bisa kita manfaatkan.",
    "Audit profil Instagram saya dan berikan saran optimasi bio.",
    "Berikan 5 hashtag yang spesifik dan belum terlalu ramai di industri saya.",
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);

  useEffect(() => {
    let t1: any, t2: any;
    const mainInterval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % PROMPT_IDEAS.length);
      t1 = setTimeout(() => {
        setCurrentAnalysisIndex((prev) => (prev + 1) % ANALYSIS_IDEAS.length);
      }, 300);
      t2 = setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % HUBAI_TIPS.length);
      }, 600);
    }, 6000);

    return () => {
      clearInterval(mainInterval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya HUB.AI, asisten khusus untuk content creator. Apa yang bisa saya bantu hari ini? Mau brainstorm ide konten atau buat draft caption?",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [targetMessageIndex, setTargetMessageIndex] = useState<number | null>(
    null,
  );
  const [animatingMessageIndex, setAnimatingMessageIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (targetMessageIndex !== null) {
      setTimeout(() => {
        const el = document.getElementById(`chat-msg-${targetMessageIndex}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });

          // Optional: Add a temporary background highlight effect
          const originalBoxShadow = el.style.boxShadow || "none";
          el.style.transition =
            "box-shadow 0.5s ease, background-color 0.5s ease";
          el.style.boxShadow = "0 0 0 8px rgba(27,127,220,0.1)";
          el.style.borderRadius = "20px";
          el.style.backgroundColor = "rgba(27,127,220,0.05)";
          setTimeout(() => {
            el.style.boxShadow = originalBoxShadow;
            el.style.backgroundColor = "transparent";
          }, 2000);
        }
        setTargetMessageIndex(null);
      }, 300); // 300ms delay to ensure rendering is complete
    }
  }, [targetMessageIndex, chatHistory]);

  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span
              key={i}
              style={{
                backgroundColor: "rgba(255, 213, 79, 0.5)",
                color: "#193546",
                fontWeight: "bold",
                padding: "0 2px",
                borderRadius: 4,
              }}
            >
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  const GENERAL_CONFIG_ITEM = {
    id: "general",
    name: "General",
    jobRole: "",
    toneOfVoice: "",
    brandIndustry: "",
    brandName: "",
    targetAudience: "",
    usp: "",
    contentGoals: "",
    contentPillars: "",
    competitors: "",
    additionalInfo: "",
    contentExamples: "",
    brandGlossary: "",
  };

  const DEFAULT_CONFIG_ITEM = {
    id: "default",
    name: "Config 1",
    jobRole: "",
    toneOfVoice: "",
    brandIndustry: "",
    brandName: "",
    targetAudience: "",
    usp: "",
    contentGoals: "",
    contentPillars: "",
    competitors: "",
    additionalInfo: "",
    contentExamples: "",
    brandGlossary: "",
  };

  const [hubaiConfigs, setHubaiConfigs] = useState<any[]>([
    GENERAL_CONFIG_ITEM,
    DEFAULT_CONFIG_ITEM,
  ]);
  const [activeConfigId, setActiveConfigId] = useState<string>("general");
  const [editingConfigId, setEditingConfigId] = useState<string>("default");

  const [savingConfig, setSavingConfig] = useState(false);
  const [savedHubaiConfigs, setSavedHubaiConfigs] = useState<any[]>([
    GENERAL_CONFIG_ITEM,
    DEFAULT_CONFIG_ITEM,
  ]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [dataSource, setDataSource] = useState("all");
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const [chatSessions, setChatSessions] = useState<any[]>([]);

  const updateEditingConfig = (field: string, value: string) => {
    setHubaiConfigs((prev) =>
      prev.map((c) =>
        c.id === editingConfigId ? { ...c, [field]: value } : c,
      ),
    );
  };
  const editingConfig =
    hubaiConfigs.find((c) => c.id === editingConfigId) ||
    hubaiConfigs.find((c) => c.id !== "general") ||
    DEFAULT_CONFIG_ITEM;

  const handleCloseConfigPanel = () => {
    const hasIncompleteConfig = hubaiConfigs.some(
      (c) =>
        c.id !== "general" &&
        !Object.values(c).every((val) =>
          typeof val === "string" ? val.trim() !== "" : true,
        ),
    );
    if (hasIncompleteConfig) {
      setShowDiscardModal(true);
    } else {
      setShowConfigPanel(false);
    }
  };

  const handleDiscardConfigs = () => {
    setHubaiConfigs(savedHubaiConfigs);
    setShowDiscardModal(false);
    setShowConfigPanel(false);
    if (!savedHubaiConfigs.find((c) => c.id === activeConfigId)) {
      setActiveConfigId("general");
    }
    if (!savedHubaiConfigs.find((c) => c.id === editingConfigId)) {
      setEditingConfigId(savedHubaiConfigs[0]?.id || "general");
    }
  };

  const handleToggleConfigPanel = () => {
    if (showConfigPanel) {
      handleCloseConfigPanel();
    } else {
      setShowConfigPanel(true);
    }
  };

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [editSessionId, setEditSessionId] = useState<string | null>(null);
  const [editSessionTitle, setEditSessionTitle] = useState("");
  const [activeHistoryMenuId, setActiveHistoryMenuId] = useState<string | null>(
    null,
  );
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const dataSourceDropdownRef = useRef<HTMLDivElement>(null);
  const configDropdownRef = useRef<HTMLDivElement>(null);
  const configPanelRef = useRef<HTMLDivElement>(null);
  const inboxChatScrollRef = useRef<HTMLDivElement>(null);
  const commentChatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inboxChatScrollRef.current) {
      inboxChatScrollRef.current.scrollTop =
        inboxChatScrollRef.current.scrollHeight;
    }
  }, [selectedInboxMsg]);

  useEffect(() => {
    if (commentChatScrollRef.current) {
      commentChatScrollRef.current.scrollTop =
        commentChatScrollRef.current.scrollHeight;
    }
  }, [selectedComment]);

  useEffect(() => {
    function handleClickOutsideDropdown(event: MouseEvent) {
      // Don't do anything if a modal is currently open inside the config panel context
      if (showDiscardModal) return;

      if (
        dataSourceDropdownRef.current &&
        !dataSourceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDataSourceDropdown(false);
      }
      if (
        configDropdownRef.current &&
        !configDropdownRef.current.contains(event.target as Node)
      ) {
        setShowConfigDropdown(false);
      }
      if (
        configPanelRef.current &&
        !configPanelRef.current.contains(event.target as Node)
      ) {
        if (showConfigPanel) {
          handleCloseConfigPanel();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, [hubaiConfigs, showConfigPanel, showDiscardModal]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveHistoryMenuId(null);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(
      doc(db, "users", user.uid, "hubaiConfig", "config"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.configs && Array.isArray(data.configs)) {
            const updatedConfigs = data.configs.map((c: any) => {
              if (c.id === "default" && c.name === "Config 1")
                return { ...c, name: "General", id: "general" };
              if (c.id === "default" && c.name === "General")
                return { ...c, id: "general" };
              return c;
            });
            if (!updatedConfigs.some((c: any) => c.id === "general")) {
              updatedConfigs.unshift(GENERAL_CONFIG_ITEM);
            }
            setHubaiConfigs(updatedConfigs);
          } else if (
            data &&
            typeof data === "object" &&
            Object.keys(data).length > 0
          ) {
            setHubaiConfigs([
              {
                ...GENERAL_CONFIG_ITEM,
                ...data,
                id: "general",
                name: "General",
              },
            ]);
          }
        }
      },
      (error) => {
        console.error("Error listening to hubaiConfig:", error);
      },
    );
    return unsub;
  }, [user?.uid, db]);

  const saveConfig = async () => {
    if (!user?.uid) return;
    setSavingConfig(true);
    try {
      await setDoc(doc(db, "users", user.uid, "hubaiConfig", "config"), {
        configs: hubaiConfigs,
      });
      alert("Konfigurasi HUB.AI berhasil disimpan!");
      setShowConfigPanel(false);
    } catch (e: any) {
      alert("Gagal menyimpan konfigurasi: " + e.message);
    }
    setSavingConfig(false);
  };

  useEffect(() => {
    if (targetMessageIndex !== null) return; // Prevent auto-scroll if we are scrolling to a specific message

    if (chatScrollContainerRef.current) {
      setTimeout(() => {
        if (chatScrollContainerRef.current) {
          chatScrollContainerRef.current.scrollTop =
            chatScrollContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [chatHistory, chatLoading, tab, activeSessionId, targetMessageIndex]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "users", user.uid, "aiChats"),
      orderBy("updatedAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setChatSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        console.error("Error listening to aiChats:", error);
      },
    );
    return unsub;
  }, [user?.uid, db]);

  const handleChatSubmit = async (overrideMsg?: string) => {
    const msgToUse = typeof overrideMsg === "string" ? overrideMsg : chatInput;
    if (!msgToUse.trim()) return;
    const userMsg = msgToUse;
    let currentSessionId = activeSessionId;
    let newHistory = [...chatHistory, { role: "user", content: userMsg }];

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
Data Source yang terbuka untuk Anda analisis saat ini adalah: ${dataSource === "all" ? "Semua Platform (Social Management & Social Studio)" : dataSource === "social_management" ? "Hanya Tab Social Management (Content Planner dsb)" : "Hanya Tab Social Studio (Real-time Analytics, Inbox, Kompetitor)"}.
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
    let list = Array.from({ length: 40 }).map((_, i) => {
      const month = 5 + (i % 4); // Bulan: 5 (May), 6 (June), 7 (July), 8 (August)
      const day = ((i * 7) % 28) + 1;
      return {
        id: i,
        title: `Judul Postingan ${i % 2 === 0 ? "Menarik" : "Viral"} ke-${i + 1}`,
        time: `2026-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")} 19:40`,
        type: i % 3 === 0 ? "meta" : i % 3 === 1 ? "instagram" : "tiktok",
        views: Math.floor(((i * 789) % 500000) + 1000),
        er: (((i * 2.3) % 5) + 1).toFixed(1),
        comments: Math.floor(((i * 456) % 5000) + 10),
        shares: Math.floor(((i * 123) % 1000) + 5),
        saves: Math.floor(((i * 890) % 10000) + 20),
      };
    });

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
          const posts = calendarPosts.filter((p: any) => p.day === d);
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
                {posts.map((p: any, i) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    key={i}
                    onClick={() => setSelectedContent(p)}
                    style={{
                      background:
                        p.type === "ig"
                          ? "#F8EAF0"
                          : p.type === "tt"
                            ? "#f0f0f0"
                            : "#EBF3FC",
                      color:
                        p.type === "ig"
                          ? "#E4405F"
                          : p.type === "tt"
                            ? "#000"
                            : "#1877F2",
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
                    {p.type === "ig" && <Instagram size={12} />}
                    {p.type === "fb" && <Facebook size={12} />}
                    {p.type === "tt" && (
                      <span style={{ fontSize: 10, fontWeight: 900 }}>TT</span>
                    )}
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
                ))}
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
            }}
          >
            <PlayCircle size={48} opacity={0.5} />
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
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
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
                        <span
                          className={`text-sm font-semibold transition-colors duration-300 ${
                            isConn
                              ? "text-[#111827] group-hover:text-red-600"
                              : "text-[#111827]/60 group-hover:text-[#111827]/90"
                          }`}
                        >
                          {isConn ? p.name : `Connect ${p.name}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
                {/* MAIN COLUMN */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 32 }}
                >
                  {/* 1. KEY METRICS */}
                  <div className="bg-white rounded-[24px] border border-[rgba(44,32,22,0.08)] p-6 lg:p-8 flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-start sm:items-center justify-between gap-6">
                    {[
                      {
                        lb: "Followers",
                        v: "1.2M",
                        i: <Users size={18} />,
                        trend: "+2.4%",
                      },
                      {
                        lb: "Reach",
                        v: "89.2K",
                        i: <TrendingUp size={18} />,
                        trend: "+12%",
                      },
                      {
                        lb: "Engagement",
                        v: "4.8%",
                        i: <BarChart3 size={18} />,
                        trend: "-0.5%",
                      },
                      {
                        lb: "Mentions",
                        v: "1,204",
                        i: <MessageCircle size={18} />,
                        trend: "+8%",
                      },
                    ].map((s, i) => {
                      const isPositive = s.trend.startsWith("+");
                      return (
                        <React.Fragment key={i}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 12,
                              flex: 1,
                              minWidth: "120px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                color: "rgba(44,32,22,0.4)",
                                fontSize: 12,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              {s.i}
                              {s.lb}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 12,
                                flexWrap: "wrap",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 32,
                                  fontWeight: 800,
                                  color: "#2C2016",
                                  letterSpacing: "-1px",
                                  lineHeight: 1,
                                }}
                              >
                                {s.v}
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: isPositive ? "#2D7A5E" : "#9C2B4E",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                {isPositive ? (
                                  <TrendingUp size={14} />
                                ) : (
                                  <TrendingDown size={14} />
                                )}
                                {s.trend}
                              </div>
                            </div>
                          </div>
                          {i < 3 && (
                            <div
                              className="hidden sm:block"
                              style={{
                                width: 1,
                                height: 48,
                                background: "rgba(44,32,22,0.08)",
                              }}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* 2. TREND INTERAKSI (CHART) */}
                  <div className="bg-white rounded-[24px] border border-[rgba(44,32,22,0.05)] p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          margin: 0,
                          color: "#2C2016",
                        }}
                      >
                        Trend Interaksi
                      </h3>
                      <CustomDropdown
                        value={analyticsPlatform}
                        options={PLATFORMS}
                        onChange={setAnalyticsPlatform}
                        renderOption={(o) => (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              fontWeight: 700,
                            }}
                          >
                            {o.icon} <span>{o.name}</span>
                          </div>
                        )}
                      />
                    </div>

                    <div style={{ height: 300, width: "100%" }}>
                      <ResponsiveContainer>
                        <AreaChart
                          data={MOCK_CHART_DATA}
                          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorViews"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="var(--theme-primary)"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--theme-primary)"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorReach"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#2D7A5E"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#2D7A5E"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorLikes"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#9C2B4E"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#9C2B4E"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
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
                              fill: "rgba(44,32,22,0.4)",
                              fontWeight: 700,
                            }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 12,
                              fill: "rgba(44,32,22,0.4)",
                              fontWeight: 700,
                            }}
                            dx={-10}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: 12,
                              border: "none",
                              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                              fontWeight: 700,
                              padding: "12px 16px",
                            }}
                            itemStyle={{ fontSize: 13, fontWeight: 700 }}
                            labelStyle={{
                              color: "rgba(44,32,22,0.4)",
                              marginBottom: 8,
                              fontSize: 12,
                              fontWeight: 800,
                            }}
                          />
                          <Legend
                            iconType="circle"
                            wrapperStyle={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#2C2016",
                              paddingTop: 20,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="views"
                            name="Views"
                            stroke="var(--theme-primary)"
                            fillOpacity={1}
                            fill="url(#colorViews)"
                            strokeWidth={3}
                            activeDot={{
                              r: 6,
                              strokeWidth: 0,
                              fill: "var(--theme-primary)",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="reach"
                            name="Reach"
                            stroke="#2D7A5E"
                            fillOpacity={1}
                            fill="url(#colorReach)"
                            strokeWidth={3}
                            activeDot={{
                              r: 6,
                              strokeWidth: 0,
                              fill: "#2D7A5E",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="likes"
                            name="Likes"
                            stroke="#9C2B4E"
                            fillOpacity={1}
                            fill="url(#colorLikes)"
                            strokeWidth={3}
                            activeDot={{
                              r: 6,
                              strokeWidth: 0,
                              fill: "#9C2B4E",
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 3. TOP PERFORMING POSTS */}
                  <div className="bg-white rounded-[24px] border border-[rgba(44,32,22,0.05)] p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          margin: 0,
                          color: "#2C2016",
                        }}
                      >
                        Top Performing Content
                      </h3>
                      <button
                        style={{
                          background: "rgba(44,32,22,0.03)",
                          border: "none",
                          color: "var(--theme-primary)",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                          padding: "8px 16px",
                          borderRadius: 16,
                        }}
                        className="hover-bg"
                      >
                        Lihat Semua
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {[
                        {
                          plat: "instagram",
                          icon: <Instagram size={14} />,
                          text: "Campaign Launch: Promo Akhir Tahun",
                          er: "8.2%",
                          likes: "12K",
                          img: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=150&auto=format&fit=crop",
                        },
                        {
                          plat: "tiktok",
                          icon: "TT",
                          text: "Behind The Scene Pembuatan Produk Baru",
                          er: "12.4%",
                          likes: "45K",
                          img: "https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=150&auto=format&fit=crop",
                        },
                        {
                          plat: "linkedin",
                          icon: <Linkedin size={14} />,
                          text: "Pencapaian Perusahaan Kuartal III",
                          er: "4.1%",
                          likes: "890",
                          img: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=150&auto=format&fit=crop",
                        },
                      ].map((post, i) => (
                        <div
                          key={i}
                          className="hover-bg"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            padding: "12px 16px",
                            borderRadius: 16,
                            background: "rgba(44,32,22,0.02)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <img
                              src={post.img}
                              alt="post"
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: 14,
                                objectFit: "cover",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: -6,
                                right: -6,
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                background:
                                  PLATFORMS.find((p) => p.id === post.plat)
                                    ?.color || "#2C2016",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                border: "2px solid white",
                              }}
                            >
                              {typeof post.icon === "string" ? (
                                <span style={{ fontWeight: 800, fontSize: 9 }}>
                                  {post.icon}
                                </span>
                              ) : (
                                React.cloneElement(
                                  post.icon as React.ReactElement,
                                  { size: 12 },
                                )
                              )}
                            </div>
                          </div>
                          <div
                            style={{ flex: 1, minWidth: 0, paddingRight: 16 }}
                          >
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#2C2016",
                                marginBottom: 6,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {post.text}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: 16,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "rgba(44,32,22,0.5)",
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <BarChart3 size={14} /> ER: {post.er}
                              </span>
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <Heart size={14} /> {post.likes}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              background: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            }}
                          >
                            <ChevronRight
                              size={16}
                              color="rgba(44,32,22,0.4)"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SIDEBAR */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 32 }}
                >
                  {/* B. UPCOMING SCHEDULE */}
                  <div className="bg-white rounded-[24px] border border-[rgba(44,32,22,0.05)] p-6 lg:p-8">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 24,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          margin: 0,
                          color: "#2C2016",
                        }}
                      >
                        Jadwal Post
                      </h3>
                      <div
                        style={{
                          padding: "8px",
                          background: "rgba(44,32,22,0.03)",
                          borderRadius: 12,
                        }}
                      >
                        <CalendarIcon size={18} color="var(--theme-primary)" />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                      }}
                    >
                      {[
                        {
                          time: "Hari ini, 15:00",
                          text: "Tips & Trik Produktivitas",
                          plat: "instagram",
                        },
                        {
                          time: "Besok, 09:00",
                          text: "Pengumuman Fitur Baru",
                          plat: "linkedin",
                        },
                        {
                          time: "Jumat, 19:00",
                          text: "Q&A Session",
                          plat: "threads",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 16,
                            position: "relative",
                          }}
                        >
                          {i !== 2 && (
                            <div
                              style={{
                                position: "absolute",
                                top: 28,
                                left: 13,
                                bottom: -24,
                                width: 2,
                                background: "rgba(44,32,22,0.05)",
                                borderRadius: 1,
                              }}
                            />
                          )}
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              background:
                                PLATFORMS.find((p) => p.id === item.plat)
                                  ?.color || "#2C2016",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              zIndex: 1,
                              border: "4px solid white",
                            }}
                          >
                            {typeof PLATFORMS.find((p) => p.id === item.plat)
                              ?.icon === "string" ? (
                              <span style={{ fontWeight: 800, fontSize: 10 }}>
                                TT
                              </span>
                            ) : (
                              React.cloneElement(
                                PLATFORMS.find((p) => p.id === item.plat)
                                  ?.icon as React.ReactElement,
                                { size: 12 },
                              )
                            )}
                          </div>
                          <div style={{ marginTop: 2 }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: "var(--theme-primary)",
                                marginBottom: 4,
                                letterSpacing: 0.5,
                              }}
                            >
                              {item.time}
                            </div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#2C2016",
                              }}
                            >
                              {item.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="hover-bg"
                      style={{
                        width: "100%",
                        marginTop: 32,
                        padding: 14,
                        borderRadius: 14,
                        border: "none",
                        background: "rgba(44,32,22,0.03)",
                        color: "#2C2016",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 13,
                        transition: "all 0.2s",
                      }}
                    >
                      Lihat Kalender Lengkap
                    </button>
                  </div>

                  {/* C. ACTION ITEMS / TASKS */}
                  <div
                    style={{
                      background: "white",
                      borderRadius: 20,
                      border: "1px solid rgba(44,32,22,0.05)",
                      padding: 24,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
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
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                        Action Items
                      </h3>
                      <div
                        style={{
                          background: "rgba(156,43,78,0.1)",
                          color: "#9C2B4E",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 12,
                        }}
                      >
                        2 Need Approval
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {[
                        {
                          text: "Approve draft: Campaign Year-End",
                          type: "approval",
                        },
                        {
                          text: "Balas 15 komentar di postingan IG",
                          type: "task",
                        },
                        {
                          text: "Review hasil A/B testing ad copy",
                          type: "task",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="hover-bg"
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "10px 12px",
                            borderRadius: 12,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ marginTop: 2 }}>
                            {item.type === "approval" ? (
                              <CheckSquare size={18} color="#9C2B4E" />
                            ) : (
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: 4,
                                  border: "2px solid rgba(44,32,22,0.2)",
                                }}
                              />
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color:
                                item.type === "approval"
                                  ? "#9C2B4E"
                                  : "#2C2016",
                              lineHeight: 1.4,
                            }}
                          >
                            {item.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                    renderOption={(o) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontWeight: 700,
                        }}
                      >
                        {o.icon} <span>{o.name}</span>
                      </div>
                    )}
                  />
                  <CustomDropdown
                    value={analyticsTimeRange}
                    options={DASHBOARD_TIME_RANGES}
                    onChange={setAnalyticsTimeRange}
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
                      background: "white",
                      borderRadius: 16,
                      padding: 20,
                      border: "1px solid rgba(44,32,22,0.05)",
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
                  background: "white",
                  borderRadius: 20,
                  border: "1px solid rgba(44,32,22,0.05)",
                  padding: 24,
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
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                      Data Audiens
                    </h3>
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
                              barSize={12}
                            />
                            <Bar
                              dataKey="l"
                              name="Laki-laki"
                              fill="#2C2016"
                              radius={[0, 4, 4, 0]}
                              barSize={12}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--theme-primary)11",
                    borderRadius: 20,
                    padding: 24,
                    border: "1px solid var(--theme-primary)22",
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
                  marginBottom: 24,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#2C2016",
                      margin: 0,
                    }}
                  >
                    Konten Dipublikasi
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(44,32,22,0.5)",
                      margin: "4px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    List 100% postingan yang ditarik secara otomatis.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <CustomDropdown
                    value={contentPlatform}
                    options={PLATFORMS}
                    onChange={setContentPlatform}
                    renderOption={(o) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontWeight: 700,
                        }}
                      >
                        {o.icon} <span>{o.name}</span>
                      </div>
                    )}
                  />
                  <CustomDropdown
                    value={contentSort}
                    options={SORT_OPTIONS}
                    onChange={setContentSort}
                  />
                  <CustomDropdown
                    value={contentTimeRange}
                    options={DASHBOARD_TIME_RANGES}
                    onChange={setContentTimeRange}
                  />
                  <button
                    className="hover-scale"
                    style={{
                      background: "#2C2016",
                      color: "white",
                      borderRadius: 12,
                      padding: "10px 16px",
                      border: "none",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Download size={14} /> Download CSV
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
                          padding: "16px 20px",
                          textAlign: "left",
                          fontWeight: 800,
                          minWidth: 250,
                        }}
                      >
                        Konten / Judul
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "left",
                          fontWeight: 800,
                        }}
                      >
                        Platform
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "right",
                          fontWeight: 800,
                        }}
                      >
                        Views
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "right",
                          fontWeight: 800,
                        }}
                      >
                        ER
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "right",
                          fontWeight: 800,
                        }}
                      >
                        Komen
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "right",
                          fontWeight: 800,
                        }}
                      >
                        Share
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "right",
                          fontWeight: 800,
                        }}
                      >
                        Save
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "center",
                          fontWeight: 800,
                        }}
                      >
                        Action
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
                        <td style={{ padding: "16px 20px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                background: "#f0f0f0",
                                flexShrink: 0,
                              }}
                            ></div>
                            <div style={{ maxWidth: 300 }}>
                              <div
                                style={{
                                  fontWeight: 800,
                                  color: "#2C2016",
                                  marginBottom: 4,
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  lineHeight: 1.4,
                                }}
                              >
                                {post.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "rgba(44,32,22,0.5)",
                                  fontWeight: 600,
                                }}
                              >
                                {post.time}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 20px" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              background:
                                post.type === "instagram"
                                  ? "#F8EAF0"
                                  : post.type === "meta"
                                    ? "#EBF3FC"
                                    : "#f0f0f0",
                              color:
                                post.type === "instagram"
                                  ? "#E4405F"
                                  : post.type === "meta"
                                    ? "#1877F2"
                                    : "#000",
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            {post.type === "instagram" ? (
                              <Instagram size={12} />
                            ) : post.type === "meta" ? (
                              <Facebook size={12} />
                            ) : (
                              <div style={{ fontSize: 10, fontWeight: 900 }}>
                                TT
                              </div>
                            )}
                            {post.type === "instagram"
                              ? "Instagram"
                              : post.type === "meta"
                                ? "Facebook"
                                : "TikTok"}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            textAlign: "right",
                            fontWeight: 800,
                          }}
                        >
                          {post.views > 1000
                            ? (post.views / 1000).toFixed(1) + "K"
                            : post.views}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            textAlign: "right",
                            fontWeight: 800,
                            color: "var(--theme-primary)",
                          }}
                        >
                          {post.er}%
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {post.comments}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {post.shares}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          {post.saves}
                        </td>
                        <td
                          style={{ padding: "16px 20px", textAlign: "center" }}
                        >
                          <button
                            onClick={() => setSelectedContent(post)}
                            className="hover-scale"
                            style={{
                              background: "transparent",
                              border: "1px solid rgba(44,32,22,0.2)",
                              borderRadius: 8,
                              padding: "6px 12px",
                              cursor: "pointer",
                              fontWeight: 800,
                              fontSize: 11,
                              color: "#2C2016",
                            }}
                          >
                            Detail
                          </button>
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
                        "Fitur AI Content Planner sedang menjalankan mockup auto-assign.",
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
                    renderOption={(o: any) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontWeight: 700,
                        }}
                      >
                        {o.icon} <span>{o.name}</span>
                      </div>
                    )}
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
                  options={[
                    { id: "ig", label: "Instagram" },
                    { id: "tt", label: "TikTok" },
                  ]}
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
                  width: 300,
                  background: "white",
                  borderRadius: 20,
                  border: "1px solid rgba(44,32,22,0.05)",
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
                      {MOCK_COMMENTS.filter((m) =>
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
                      {MOCK_COMMENTS.filter((m) =>
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
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
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
                                  {msg.senderName}
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
                                  ? new Date(msg.createdAt).toLocaleTimeString(
                                      "id-ID",
                                      { hour: "2-digit", minute: "2-digit" },
                                    )
                                  : "2j"}
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: 11,
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
                              {msg.content}
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
                  background: "white",
                  borderRadius: 20,
                  border: "1px solid rgba(44,32,22,0.05)",
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
                                  const updatedMsg = { ...selectedInboxMsg };
                                  if (!updatedMsg.replies)
                                    updatedMsg.replies = [];
                                  updatedMsg.replies.push({
                                    content: msgContent,
                                    createdAt: new Date().toISOString(),
                                  });
                                  setSelectedInboxMsg(updatedMsg);
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
                                const updatedMsg = { ...selectedInboxMsg };
                                if (!updatedMsg.replies)
                                  updatedMsg.replies = [];
                                updatedMsg.replies.push({
                                  content: msgContent,
                                  createdAt: new Date().toISOString(),
                                });
                                setSelectedInboxMsg(updatedMsg);
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
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white overflow-hidden"
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
                              fontWeight: 800,
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
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                    <div
                      ref={commentChatScrollRef}
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
                          {selectedComment.createdAt
                            ? new Date(
                                selectedComment.createdAt,
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
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#8b5cf6",
                            marginBottom: 4,
                          }}
                        >
                          {selectedComment.senderName}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            lineHeight: 1.5,
                            color: "#111827",
                            fontWeight: 500,
                          }}
                        >
                          {selectedComment.content}
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
                          {selectedComment.createdAt
                            ? new Date(
                                selectedComment.createdAt,
                              ).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "13.41"}
                        </div>
                      </div>
                      {selectedComment.replies &&
                        selectedComment.replies.map(
                          (reply: any, idx: number) => (
                            <div
                              key={idx}
                              style={{
                                background:
                                  reply.sender === "brand"
                                    ? "#8b5cf6"
                                    : "white",
                                color:
                                  reply.sender === "brand"
                                    ? "white"
                                    : "#111827",
                                border:
                                  reply.sender === "brand"
                                    ? "none"
                                    : "1px solid rgba(44,32,22,0.05)",
                                padding: "12px 16px",
                                borderRadius:
                                  reply.sender === "brand"
                                    ? "16px 16px 4px 16px"
                                    : "16px 16px 16px 4px",
                                maxWidth: "70%",
                                alignSelf:
                                  reply.sender === "brand"
                                    ? "flex-end"
                                    : "flex-start",
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
                                  color:
                                    reply.sender === "brand"
                                      ? "rgba(255,255,255,0.7)"
                                      : "rgba(44,32,22,0.4)",
                                  fontWeight: 500,
                                  marginTop: 4,
                                  textAlign:
                                    reply.sender === "brand" ? "right" : "left",
                                  display:
                                    reply.sender === "brand" ? "flex" : "block",
                                  alignItems:
                                    reply.sender === "brand"
                                      ? "center"
                                      : "initial",
                                  gap: reply.sender === "brand" ? 4 : 0,
                                  justifyContent:
                                    reply.sender === "brand"
                                      ? "flex-end"
                                      : "initial",
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
                                {reply.sender === "brand" && (
                                  <Check
                                    size={12}
                                    color="rgba(255,255,255,0.7)"
                                  />
                                )}
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
                            placeholder={`Reply on ${selectedComment.platform === "tiktok" ? "TikTok" : "Instagram"}...`}
                            value={msgContent}
                            onChange={(e) => setMsgContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && msgContent.trim()) {
                                const updatedMsg = { ...selectedComment };
                                if (!updatedMsg.replies)
                                  updatedMsg.replies = [];
                                updatedMsg.replies.push({
                                  content: msgContent,
                                  createdAt: new Date().toISOString(),
                                  sender: "brand",
                                });
                                setSelectedComment(updatedMsg);
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
                              const updatedMsg = { ...selectedComment };
                              if (!updatedMsg.replies) updatedMsg.replies = [];
                              updatedMsg.replies.push({
                                content: msgContent,
                                createdAt: new Date().toISOString(),
                                sender: "brand",
                              });
                              setSelectedComment(updatedMsg);
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
                          <MessageCircle size={14} color="rgba(44,32,22,0.6)" />
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
                      Twitter & Line ID: @info_yogyagroup • TikTok: yogyagroup
                      #BelanjaHematYaYogya
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
                      Lead stage <Info size={12} color="rgba(44,32,22,0.4)" />
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
                          setChatInput(e.target.value);
                          e.target.style.height = "auto";
                          e.target.style.height =
                            Math.min(e.target.scrollHeight, 200) + "px";
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
                onClick={() => {
                  setShowCreatePostPopup(false);
                  setCreatePostCaption("");
                  setCreatePostMedia([]);
                  setCreatePostPlatforms([]);
                }}
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
