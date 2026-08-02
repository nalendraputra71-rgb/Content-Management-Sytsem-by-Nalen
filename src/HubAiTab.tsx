import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import {
  AlignLeft,
  ArrowUp,
  BarChart3,
  Book,
  ChevronDown,
  ChevronLeft,
  Clock,
  Copy,
  CopyPlus,
  Edit3,
  FileText,
  Lightbulb,
  MessageSquare,
  Mic,
  Paperclip,
  Pin,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
  Users,
  X,
  Trash2
} from "lucide-react";

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
  }, [content, scrollContainerRef]);

  return <Markdown>{displayedContent}</Markdown>;
}

export function HubAiTab({ ctx }: { ctx: any }) {
  const {
    isMobileHubAi,
    mobileHubAiView,
    setMobileHubAiView,
    activeSessionId,
    setActiveSessionId,
    chatSessions,
    chatHistory,
    setChatHistory,
    isSearchMode,
    setIsSearchMode,
    searchQuery,
    setSearchQuery,
    chatInput,
    setChatInput,
    PROMPT_IDEAS,
    ANALYSIS_IDEAS,
    currentPromptIndex,
    setCurrentPromptIndex,
    currentAnalysisIndex,
    setCurrentAnalysisIndex,
    handleChatSubmit,
    animatingMessageIndex,
    setAnimatingMessageIndex,
    chatScrollContainerRef,
    handleCreateDraftFromAI,
    chatLoading,
    showDataSourceDropdown,
    setShowDataSourceDropdown,
    dataSource,
    setDataSource,
    configDropdownRef,
    showConfigDropdown,
    setShowConfigDropdown,
    hubaiConfigs,
    activeConfigId,
    setActiveConfigId,
    showConfigPanel,
    setShowConfigPanel,
    selectedAiModel,
    setSelectedAiModel,
    configPanelRef,
    editingConfig,
    updateEditingConfig,
    saveConfig,
    savingConfig,
    showDiscardModal,
    setShowDiscardModal,
    handleToggleConfigPanel,
    handleCloseConfigPanel,
    handleDiscardConfigs,
    lang,
    tab,
    setTab
  ,
    renderSessionItem,
    profile,
    user,
    planDetails,
    setTargetMessageIndex,
    renderHighlightedText,
    currentTipIndex,
    setCurrentTipIndex,
    HUBAI_TIPS,
    chatEndRef,
    dataSourceDropdownRef,
    setEditingConfigId,
    editingConfigId,
    setHubaiConfigs,
    DEFAULT_CONFIG_ITEM
  } = ctx;

  return (
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
                  width: isMobileHubAi ? "100%" : 260,
                  display: isMobileHubAi
                    ? mobileHubAiView === "history"
                      ? "flex"
                      : "none"
                    : "flex",
                  flexDirection: "column",
                  background: "#F4F7F9",
                  padding: isMobileHubAi ? "16px" : "20px 16px",
                  borderRight: isMobileHubAi
                    ? "none"
                    : "1px solid rgba(6, 91, 152, 0.1)",
                  zIndex: 10,
                }}
              >
                {isMobileHubAi ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    <button
                      onClick={() => setMobileHubAiView("chat")}
                      style={{
                        borderWidth: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        background: "rgba(0,0,0,0.05)",
                        color: "#193546",
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#193546",
                      }}
                    >
                      {lang === "id" ? "Riwayat Percakapan" : "Chat History"}
                    </div>
                  </div>
                ) : (
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
                  </div>
                )}

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
                            lang === "id"
                              ? "Halo! Saya HUB.AI, asisten khusus untuk content creator. Apa yang bisa saya bantu hari ini? Mau brainstorm ide konten atau buat draft caption?"
                              : "Hello! I am HUB.AI, a dedicated assistant for content creators. How can I help you today? Would you like to brainstorm content ideas or write a caption draft?",
                        },
                      ]);
                      setIsSearchMode(false);
                    }}
                    className="hover-bg"
                    style={{
                      background: "transparent",
                      borderWidth: 0,
                      borderStyle: "none",
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
                    <Edit3 size={16} />{" "}
                    {lang === "id" ? "Percakapan baru" : "New chat"}
                  </button>
                  <button
                    onClick={() => setIsSearchMode(true)}
                    className="hover-bg"
                    style={{
                      background: isSearchMode
                        ? "rgba(27,127,220,0.1)"
                        : "transparent",
                      borderWidth: 0,
                      borderStyle: "none",
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
                    <Search size={16} />{" "}
                    {lang === "id"
                      ? "Telusuri percakapan"
                      : "Search conversations"}
                  </button>
                  <button
                    onClick={handleToggleConfigPanel}
                    className="hover-bg"
                    style={{
                      background: showConfigPanel
                        ? "rgba(27,127,220,0.1)"
                        : "transparent",
                      borderWidth: 0,
                      borderStyle: "none",
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
                    <Settings size={16} />{" "}
                    {lang === "id" ? "Konfigurasi" : "Configuration"}
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
                        <Clock size={12} />{" "}
                        {lang === "id" ? "RIWAYAT" : "HISTORY"}
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
                            {lang === "id"
                              ? "Belum ada histori."
                              : "No history yet."}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(13,184,211,0.05)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(13,184,211,0.2)",
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
                      {lang === "id" ? "Batas HUB.AI" : "HUB.AI Limit"}
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
                        const maxReq = planDetails?.aiTokenLimit || 100000;
const currentMonth = new Date().toISOString().substring(0, 7);
const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
if (maxReq === -1) return `${usedReq.toLocaleString()} / ∞`;
return `${usedReq.toLocaleString()} / ${maxReq.toLocaleString()}`;
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
                      const maxReq = planDetails?.aiTokenLimit || 100000;
const currentMonth = new Date().toISOString().substring(0, 7);
const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);
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
                id="social-hub-ai-panel"
                style={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  background: "white",
                  display: isMobileHubAi
                    ? mobileHubAiView === "chat"
                      ? "flex"
                      : "none"
                    : "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {isMobileHubAi && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(6, 91, 152, 0.08)",
                      background: "white",
                      flexShrink: 0,
                      zIndex: 5,
                    }}
                  >
                    <button
                      onClick={() => setMobileHubAiView("history")}
                      style={{
                        borderWidth: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#193546",
                        padding: "6px 12px",
                        borderRadius: 12,
                        background: "rgba(0,0,0,0.03)",
                      }}
                    >
                      <Clock size={15} />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>
                        {lang === "id" ? "Riwayat" : "History"}
                      </span>
                    </button>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#193546",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          background:
                            "linear-gradient(135deg, #0DB8D3 0%, #1B7FDC 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 6px rgba(13, 184, 211, 0.3)",
                        }}
                      >
                        <Sparkles size={11} />
                      </div>
                      HUB.AI
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          setActiveSessionId(null);
                          setChatHistory([
                            {
                              role: "assistant",
                              content:
                                lang === "id"
                                  ? "Halo! Saya HUB.AI, asisten khusus untuk content creator. Apa yang bisa saya bantu hari ini? Mau brainstorm ide konten atau buat draft caption?"
                                  : "Hello! I am HUB.AI, a dedicated assistant for content creators. How can I help you today? Would you like to brainstorm content ideas or write a caption draft?",
                            },
                          ]);
                          setIsSearchMode(false);
                        }}
                        style={{
                          borderWidth: 0,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          background: "rgba(0,0,0,0.03)",
                          color: "#193546",
                        }}
                        title={lang === "id" ? "Percakapan baru" : "New chat"}
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={handleToggleConfigPanel}
                        style={{
                          borderWidth: 0,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          background: "rgba(0,0,0,0.03)",
                          color: "#193546",
                        }}
                        title={lang === "id" ? "Konfigurasi" : "Configuration"}
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>
                )}
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
                            borderWidth: 0,
                            borderStyle: "none",
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
                          {lang === "id"
                            ? "Telusuri Percakapan"
                            : "Search Conversations"}
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
                          placeholder={
                            lang === "id"
                              ? "Cari kata kunci atau judul percakapan..."
                              : "Search keywords or conversation titles..."
                          }
                          style={{
                            width: "100%",
                            padding: "16px 48px 16px 48px",
                            borderRadius: 16,
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(6,91,152,0.2)",
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
                              borderWidth: 0,
                              borderStyle: "none",
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
                            let bestSnippet =
                              lang === "id"
                                ? "Tidak ada pesan pengguna."
                                : "No user message.";
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
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                  borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Tidak ada percakapan yang cocok dengan pencarian."
                              : "No conversations match your search."}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : chatHistory.length === 0 ||
                    (chatHistory.length === 1 &&
                      chatHistory[0].role === "assistant") ? (
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
                        {lang === "id"
                          ? "Selamat Datang di HUB.AI"
                          : "Welcome to HUB.AI"}
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
                        {lang === "id"
                          ? "Apa yang bisa saya temukan untuk kontenmu hari ini?"
                          : "What can I find for your content today?"}
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(6,91,152,0.1)",
                            borderRadius: 16,
                            padding: 16,
                            width: isMobileHubAi ? "100%" : 250,
                            maxWidth: isMobileHubAi ? 340 : "none",
                            height: isMobileHubAi ? "auto" : 140,
                            minHeight: isMobileHubAi ? 120 : "none",
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
                              {lang === "id"
                                ? "IDE KONTEN KREATIF"
                                : "CREATIVE CONTENT IDEAS"}
                            </div>
                            <div style={{ display: "flex", gap: 3 }}>
                              {PROMPT_IDEAS.map((_, i) => (
                                <div
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPromptIndex(i);
                                  }}
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    cursor: "pointer",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(6,91,152,0.1)",
                            borderRadius: 16,
                            padding: 16,
                            width: isMobileHubAi ? "100%" : 250,
                            maxWidth: isMobileHubAi ? 340 : "none",
                            height: isMobileHubAi ? "auto" : 140,
                            minHeight: isMobileHubAi ? 120 : "none",
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
                              {lang === "id"
                                ? "ANALISIS & EVALUASI"
                                : "ANALYSIS & EVALUATION"}
                            </div>
                            <div style={{ display: "flex", gap: 3 }}>
                              {ANALYSIS_IDEAS.map((_, i) => (
                                <div
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentAnalysisIndex(i);
                                  }}
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    cursor: "pointer",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(6,91,152,0.1)",
                            borderRadius: 16,
                            padding: 16,
                            width: isMobileHubAi ? "100%" : 250,
                            maxWidth: isMobileHubAi ? 340 : "none",
                            height: isMobileHubAi ? "auto" : 140,
                            minHeight: isMobileHubAi ? 120 : "none",
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
                              {lang === "id"
                                ? "TIPS & TRIK HUB.AI"
                                : "HUB.AI TIPS & TRICKS"}
                            </div>
                            <div style={{ display: "flex", gap: 3 }}>
                              {HUBAI_TIPS.map((_, i) => (
                                <div
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentTipIndex(i);
                                  }}
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    cursor: "pointer",
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
                          {lang === "id"
                            ? "Biar lebih kamu banget:"
                            : "Personalize your AI:"}
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
                              text:
                                lang === "id"
                                  ? "Atur Peran AI"
                                  : "Set AI Persona",
                            },
                            {
                              icon: <AlignLeft size={14} color="#1B7FDC" />,
                              text:
                                lang === "id"
                                  ? "Set Pilar Konten"
                                  : "Set Content Pillars",
                            },
                            {
                              icon: <FileText size={14} color="#10B981" />,
                              text:
                                lang === "id" ? "Tambah Contoh" : "Add Example",
                            },
                            {
                              icon: <Mic size={14} color="#F59E0B" />,
                              text:
                                lang === "id" ? "Gaya Bahasa" : "Tone of Voice",
                            },
                            {
                              icon: <Users size={14} color="#8B5CF6" />,
                              text:
                                lang === "id"
                                  ? "Target Audiens"
                                  : "Target Audience",
                            },
                            {
                              icon: <Book size={14} color="#E83A59" />,
                              text:
                                lang === "id"
                                  ? "Kamus Brand"
                                  : "Brand Dictionary",
                            },
                            {
                              icon: <User size={14} color="#0DB8D3" />,
                              text:
                                lang === "id"
                                  ? "Atur Peran AI"
                                  : "Set AI Persona",
                            },
                            {
                              icon: <AlignLeft size={14} color="#1B7FDC" />,
                              text:
                                lang === "id"
                                  ? "Set Pilar Konten"
                                  : "Set Content Pillars",
                            },
                            {
                              icon: <FileText size={14} color="#10B981" />,
                              text:
                                lang === "id" ? "Tambah Contoh" : "Add Example",
                            },
                            {
                              icon: <Mic size={14} color="#F59E0B" />,
                              text:
                                lang === "id" ? "Gaya Bahasa" : "Tone of Voice",
                            },
                            {
                              icon: <Users size={14} color="#8B5CF6" />,
                              text:
                                lang === "id"
                                  ? "Target Audiens"
                                  : "Target Audience",
                            },
                            {
                              icon: <Book size={14} color="#E83A59" />,
                              text:
                                lang === "id"
                                  ? "Kamus Brand"
                                  : "Brand Dictionary",
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
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: "rgba(6,91,152,0.1)",
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
                        padding: isMobileHubAi ? "16px 12px" : "30px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                        maxWidth: 860,
                        margin: "0 auto",
                        width: "100%",
                      }}
                    >
                      {chatHistory.map((msg, idx) =>
                        idx === 0 &&
                        msg.role === "assistant" &&
                        msg.content.includes("HUB.AI") ? null : (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx}
                            id={`chat-msg-${idx}`}
                            style={{
                              alignSelf:
                                msg.role === "user" ? "flex-end" : "flex-start",
                              maxWidth: isMobileHubAi ? "92%" : "85%",
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
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor:
                                  msg.role === "user"
                                    ? "rgba(13,184,211,0.2)"
                                    : "rgba(6,91,152,0.1)",
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
                                        setAnimatingMessageIndex(-1)
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
                                  gap: isMobileHubAi ? 12 : 16,
                                  flexWrap: "wrap",
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
                                    borderWidth: 0,
                                    borderStyle: "none",
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
                                    borderWidth: 0,
                                    borderStyle: "none",
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
                  <div
                    style={{
                      padding: isMobileHubAi
                        ? "0 12px 12px 12px"
                        : "0 32px 24px 32px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        margin: "0 auto",
                        width: "100%",
                        maxWidth: 860,
                        background: "white",
                        borderRadius: 20,
                        padding: "8px 12px",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "rgba(6,91,152,0.15)",
                        boxShadow:
                          "0 12px 30px rgba(0,0,0,0.06), 0 0 20px rgba(13,184,211,0.05) inset",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <textarea
                        placeholder={
                          lang === "id"
                            ? "Tanya apapun ke HUB.AI..."
                            : "Ask HUB.AI anything..."
                        }
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
                          borderWidth: 0,
                          borderStyle: "none",
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
                          flexDirection: isMobileHubAi ? "column" : "row",
                          gap: isMobileHubAi ? 6 : 0,
                          justifyContent: "space-between",
                          alignItems: isMobileHubAi ? "stretch" : "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                            flexWrap: "wrap",
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
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: "rgba(13,184,211,0.2)",
                                borderRadius: 14,
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#065B98",
                                cursor: "pointer",
                              }}
                            >
                              {dataSource === "all"
                                ? lang === "id"
                                  ? "Semua Data"
                                  : "All Data"
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
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                    borderColor: "rgba(6,91,152,0.1)",
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
                                    {
                                      id: "all",
                                      label:
                                        lang === "id"
                                          ? "Semua Data"
                                          : "All Data",
                                    },
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
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: "rgba(27,127,220,0.2)",
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
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                    borderColor: "rgba(6,91,152,0.1)",
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
                                      <Settings size={12} />{" "}
                                      {lang === "id"
                                        ? "Atur Konfigurasi"
                                        : "Set up Config"}
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
                            justifyContent: isMobileHubAi
                              ? "space-between"
                              : "flex-end",
                            gap: 10,
                            marginTop: isMobileHubAi ? 6 : 0,
                            borderTop: isMobileHubAi
                              ? "1px solid rgba(6,91,152,0.06)"
                              : "none",
                            paddingTop: isMobileHubAi ? 8 : 0,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(17,24,39,0.6)", display: 'flex', justifyContent: 'space-between' }}>
      <span>Credits:</span>
      <span>{(ctx.profile?.aiTokensUsed || 0).toLocaleString()} / {ctx.planDetails?.aiTokenLimit === -1 ? "∞" : (ctx.planDetails?.aiTokenLimit || 100000).toLocaleString()}</span>
    </div>
    <div style={{ width: 120, height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ 
        width: ctx.planDetails?.aiTokenLimit === -1 ? "100%" : `${Math.min(100, ((ctx.profile?.aiTokensUsed || 0) / (ctx.planDetails?.aiTokenLimit || 100000)) * 100)}%`, 
        height: "100%", 
        background: (ctx.planDetails?.aiTokenLimit !== -1 && (ctx.profile?.aiTokensUsed || 0) >= (ctx.planDetails?.aiTokenLimit || 100000) * 0.9) ? "#EF4444" : "#1B7FDC",
        borderRadius: 2
      }} />
    </div>
  </div>
  <select
    value={selectedAiModel}
    onChange={(e) => setSelectedAiModel(e.target.value)}
    style={{
      background: "rgba(27,127,220,0.05)",
      border: "1px solid rgba(27,127,220,0.2)",
      borderRadius: 14,
      padding: "4px 8px",
      fontSize: 10,
      fontWeight: 600,
      color: "#1B7FDC",
      outline: "none",
      cursor: "pointer",
    }}
  >
    {(() => {
       const allModels = [
         { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite (1x)" },
         { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash (10x)" },
         { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview (25x)" }
       ];
       const allowedModels = (ctx.planDetails?.capabilities?.allowedModels || ["gemini-3.6-flash"]).map((m: string) => m === "gemini-3.5-flash" ? "gemini-3.6-flash" : m === "gemini-3.1-pro" ? "gemini-3.1-pro-preview" : m);
       const visibleModels = allModels.filter(m => allowedModels.includes(m.value));
       if (visibleModels.length === 0) visibleModels.push(allModels[1]);
       return visibleModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>);
    })()}
  </select>
</div>
                          <button
                            onClick={() =>
                              alert(
                                lang === "id"
                                  ? "Fitur Lampirkan Berkas akan segera hadir!"
                                  : "Attach File feature is coming soon!",
                              )
                            }
                            className="hover-scale"
                            style={{
                              background: "transparent",
                              borderWidth: 0,
                              borderStyle: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              color: "#065B98",
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            <Paperclip size={14} />{" "}
                            {lang === "id" ? "Lampirkan" : "Attach"}
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
                              borderWidth: 0,
                              borderStyle: "none",
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
                            <ArrowUp size={14} />{" "}
                            {lang === "id" ? "Kirim" : "Send"}
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
                        {lang === "id"
                          ? "HUB.AI dapat menampilkan info yang tidak akurat."
                          : "HUB.AI may display inaccurate info."}{" "}
                        <u style={{ cursor: "pointer", color: "#065B98" }}>
                          {lang === "id"
                            ? "Panduan Verifikasi"
                            : "Verification Guide"}
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
                        width: isMobileHubAi ? "100%" : 380,
                        background: "#F8FAFC",
                        borderLeft: isMobileHubAi
                          ? "none"
                          : "1px solid rgba(6,91,152,0.1)",
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
                            <Settings size={18} color="#0DB8D3" />{" "}
                            {lang === "id"
                              ? "KONFIGURASI AI"
                              : "AI CONFIGURATION"}
                          </div>
                          <button
                            className="hover-bg"
                            onClick={handleCloseConfigPanel}
                            style={{
                              background: "rgba(6,91,152,0.05)",
                              borderWidth: 0,
                              borderStyle: "none",
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
                          {lang === "id"
                            ? "Atur profil, gaya bahasa, dan panduan brand. Anda dapat membuat hingga 5 konfigurasi kustom untuk berbagai brand atau audiens yang berbeda agar hasil AI lebih personal."
                            : "Set up profiles, tone of voice, and brand guidelines. You can create up to 5 custom configurations for different brands or target audiences to make AI outputs more personalized."}
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
                            <Plus size={14} />{" "}
                            {lang === "id" ? "Tambah" : "Add"}
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
                            {lang === "id"
                              ? "Nama Konfigurasi"
                              : "Configuration Name"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Contoh: Config Instagram Utama..."
                                : "Example: Main Instagram Config..."
                            }
                            value={editingConfig.name}
                            onChange={(e) =>
                              updateEditingConfig("name", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Posisi Pekerjaan"
                              : "Job Role / Title"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Contoh: Social Media Manager..."
                                : "Example: Social Media Manager..."
                            }
                            value={editingConfig.jobRole}
                            onChange={(e) =>
                              updateEditingConfig("jobRole", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Gaya Bahasa (Tone of Voice)"
                              : "Tone of Voice"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Contoh: Santai, Gaul, dan Persuasif..."
                                : "Example: Casual, Friendly, and Persuasive..."
                            }
                            value={editingConfig.toneOfVoice}
                            onChange={(e) =>
                              updateEditingConfig("toneOfVoice", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id" ? "Nama Brand" : "Brand Name"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Contoh: Kopi Senja..."
                                : "Example: Sunset Coffee..."
                            }
                            value={editingConfig.brandName}
                            onChange={(e) =>
                              updateEditingConfig("brandName", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id" ? "Bidang / Industri" : "Industry"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Contoh: F&B / Minuman..."
                                : "Example: Food & Beverage..."
                            }
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Target Audiens"
                              : "Target Audience"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Contoh: Gen Z, Mahasiswa, Pekerja Kantoran..."
                                : "Example: Gen Z, Students, Office Workers..."
                            }
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Keunikan Brand (USP)"
                              : "Unique Selling Proposition (USP)"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Apa yang membedakan brand anda..."
                                : "What sets your brand apart..."
                            }
                            value={editingConfig.usp}
                            onChange={(e) =>
                              updateEditingConfig("usp", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id" ? "Tujuan Konten" : "Content Goals"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Contoh: Awareness, Sales, Edukasi..."
                                : "Example: Awareness, Sales, Education..."
                            }
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Pilar Konten (Topik Utama)"
                              : "Content Pillars (Main Topics)"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Contoh: Motivasi, Humor, Tips & Trik..."
                                : "Example: Motivation, Humor, Tips & Tricks..."
                            }
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Kompetitor (Benchmarks)"
                              : "Competitors (Benchmarks)"}
                          </label>
                          <input
                            placeholder={
                              lang === "id"
                                ? "Contoh: Kopi Janji Jiwa, Kopi Kenangan..."
                                : "Example: Sunset Coffee, Dawn Coffee..."
                            }
                            value={editingConfig.competitors}
                            onChange={(e) =>
                              updateEditingConfig("competitors", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "12px",
                              borderRadius: 12,
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Info Tambahan"
                              : "Additional Info"}
                          </label>
                          <textarea
                            placeholder={
                              lang === "id"
                                ? "Target market adalah Gen Z, produk unggulan kopi susu karamel..."
                                : "Target market is Gen Z, signature product is caramel latte..."
                            }
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Kamus Brand (Glossary)"
                              : "Brand Glossary"}
                          </label>
                          <textarea
                            placeholder={
                              lang === "id"
                                ? "Tuliskan kata kunci, pantangan istilah, dan padanan kata yang spesifik ke brand anda. Contoh: Jangan pakai kata 'murah', gunakan 'hemat'..."
                                : "Write down keywords, forbidden terms, and brand vocabulary. Example: Do not use the word 'cheap', use 'budget-friendly'..."
                            }
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                            {lang === "id"
                              ? "Contoh Konten (Referensi)"
                              : "Content Reference (Examples)"}
                          </label>
                          <textarea
                            placeholder={
                              lang === "id"
                                ? "Tuliskan format atau gaya draft konten yang pernah berhasil dan ingin HUB.AI ikuti polanya..."
                                : "Write down content drafts or styles that were successful and you want HUB.AI to replicate..."
                            }
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(6,91,152,0.1)",
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
                                  {lang === "id"
                                    ? "* Harap isi seluruh kolom konfigurasi untuk menyimpan."
                                    : "* Please fill in all configuration fields to save."}
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
                                  borderWidth: 0,
                                  borderStyle: "none",
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
                                  ? lang === "id"
                                    ? "Menyimpan..."
                                    : "Saving..."
                                  : lang === "id"
                                    ? "Simpan Konfigurasi"
                                    : "Save Configuration"}
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
                          {lang === "id"
                            ? "Konfigurasi Belum Lengkap"
                            : "Incomplete Configuration"}
                        </h3>
                        <p
                          style={{
                            margin: "0 0 24px",
                            fontSize: 14,
                            color: "#065B98",
                            lineHeight: 1.5,
                          }}
                        >
                          {lang === "id"
                            ? "Ada konfigurasi yang masih belum diisi lengkap. Apakah Anda ingin melanjutkan menyunting atau menutup dan menghapus konfigurasi yang belum lengkap?"
                            : "There is an incomplete configuration. Do you want to continue editing, or close and discard the incomplete configuration?"}
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
                              borderWidth: 0,
                              borderStyle: "none",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            className="hover-bg-slate"
                          >
                            {lang === "id"
                              ? "Tutup & Hapus"
                              : "Close & Discard"}
                          </button>
                          <button
                            onClick={() => setShowDiscardModal(false)}
                            style={{
                              flex: 1,
                              padding: "12px",
                              borderRadius: 12,
                              background: "#1B7FDC",
                              color: "white",
                              borderWidth: 0,
                              borderStyle: "none",
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            className="hover-scale"
                          >
                            {lang === "id" ? "Lanjut Edit" : "Continue Editing"}
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
  );
}
