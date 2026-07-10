const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const missingStates = `
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
  
  const handleChatSubmit = async () => {};
  const handleCloseConfigPanel = () => {};
  const handleCreatePost = async () => {};
  const handleDiscardConfigs = () => {};
  const handleToggleConfigPanel = () => {};
  
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
  
  const renderHighlightedText = (text: string) => <>{text}</>;
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const saveConfig = async () => {};
  const [savingConfig, setSavingConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedComment = null;
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const selectedInboxMsg = null;
  const sendCommentReply = async () => {};
  const sendDMMessage = async () => {};
  
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showCreatePostPopup, setShowCreatePostPopup] = useState(false);
  const [showDataSourceDropdown, setShowDataSourceDropdown] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  
  const updateEditingConfig = (key: string, value: any) => setEditingConfig((prev: any) => ({...prev, [key]: value}));
  const [targetMessageIndex, setTargetMessageIndex] = useState(-1);
  const ANALYSIS_IDEAS = ["Idea 1"];
`;

code = code.replace(
  `const MOCK_COMMENTS: any[] = [];`,
  `const MOCK_COMMENTS: any[] = [];\n${missingStates}`
);

fs.writeFileSync('src/SocialStudioView.tsx', code);
