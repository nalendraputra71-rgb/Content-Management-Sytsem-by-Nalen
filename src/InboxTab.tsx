
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CopyPlus, MessageSquare, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, RefreshCw, Smartphone, MoreHorizontal, Layout, Type, HelpCircle, Lightbulb, PenTool, Hash, RefreshCcw, ArrowRight, Eye, Calendar, CalendarDays, Maximize2, MoreVertical, ThumbsUp, MessageCircle as CommentIcon, Share2, CornerDownRight, CheckCircle2, AlertTriangle, AlertCircle, Trash2, ArrowUpRight, Music, Zap, Clock4, Filter, Columns, Download, Layers, LayoutGrid, Check, Settings, Copy, MousePointerClick, History, FileText, ChevronRight, Video, File, Mic, Repeat
, ChevronLeft, Star, Heart, Paperclip, Plus, Info, List} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, Cell, PieChart as RechartsPieChart, Pie } from "recharts";

export function InboxTab({ ctx }: { ctx: any }) {
  const {
    inboxMessages,
    msgContent,
    setMsgContent,
    inboxFilter,
    setInboxFilter,
    inboxViewMode,
    setInboxViewMode,
    isMobileHubAi,
    mergedComments,
    replyingTo,
    setReplyingTo,
    ref,
    option,
    setSelectedInboxMsg,
    setSelectedComment,
    commentChatScrollRef,
    inboxChatScrollRef,
    selectedComment,
    selectedInboxMsg,
    sendCommentReply,
    sendDMMessage,
    input,
    target,
    p,
    lang
  } = ctx;
  
  return (
    
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: isMobileHubAi ? "column" : "row",
                gap: isMobileHubAi ? 0 : 12,
              }}
            >
              {(!isMobileHubAi || (!selectedInboxMsg && !selectedComment)) && (
                <div
                  style={{
                    width: isMobileHubAi ? "100%" : 320,
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: isMobileHubAi ? 16 : 32,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(0,0,0,0.03)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    flexShrink: 0,
                    flexGrow: isMobileHubAi ? 1 : 0,
                    height: "100%",
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
                            borderWidth: 0,
                            borderStyle: "none",
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
                            borderWidth: 0,
                            borderStyle: "none",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(44,32,22,0.15)",
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
                        {mergedComments
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
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                  borderColor: "rgba(44,32,22,0.05)",
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
              )}

              {(!isMobileHubAi || selectedInboxMsg || selectedComment) && (
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: isMobileHubAi ? 16 : 32,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(0,0,0,0.03)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    height: "100%",
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
                            {isMobileHubAi && (
                              <button
                                onClick={() => setSelectedInboxMsg(null)}
                                className="mr-1 p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                              >
                                <ChevronLeft size={20} />
                              </button>
                            )}
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
                                Assign this conversation{" "}
                                <ChevronDown size={12} />
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
                          <div
                            style={{ textAlign: "center", marginBottom: 16 }}
                          >
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(44,32,22,0.05)",
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
                            style={{
                              display: "flex",
                              gap: 8,
                              overflowX: "auto",
                            }}
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
                                borderWidth: 0,
                                borderStyle: "none",
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
                                borderWidth: 0,
                                borderStyle: "none",
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
                                borderWidth: 0,
                                borderStyle: "none",
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(44,32,22,0.1)",
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
                                  borderWidth: 0,
                                  borderStyle: "none",
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
                          Pilih pesan inbox dari Instagram/TikTok di sebelah
                          kiri.
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
                          {isMobileHubAi && (
                            <button
                              onClick={() => setSelectedComment(null)}
                              className="mr-1 p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <ChevronLeft size={20} />
                            </button>
                          )}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white overflow-hidden"
                            style={{
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(44,32,22,0.05)",
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
                                <span
                                  style={{ fontWeight: 700, marginRight: 6 }}
                                >
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
                                              setMsgContent(
                                                `@${reply.username} `,
                                              );
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
                                lang === "id"
                                  ? "Halo kak, terima kasih banyak atas responnya! 🙏"
                                  : "Hi, thank you so much for the response! 🙏",
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
                              borderWidth: 0,
                              borderStyle: "none",
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
                                lang === "id"
                                  ? "Halo kak, boleh langsung cek link di bio kita ya untuk info lengkapnya! 😊"
                                  : "Hi, you can check the link in our bio for full info! 😊",
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
                              borderWidth: 0,
                              borderStyle: "none",
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
                              borderWidth: 0,
                              borderStyle: "none",
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
                              borderWidth: "1px",
                              borderStyle: "solid",
                              borderColor: "rgba(0,0,0,0.05)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: "var(--theme-primary)",
                                }}
                              />
                              <span>
                                Membalas komentar{" "}
                                <strong>@{replyingTo.username}</strong>
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setMsgContent("");
                              }}
                              style={{
                                borderWidth: 0,
                                borderStyle: "none",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(44,32,22,0.1)",
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
                                borderWidth: 0,
                                borderStyle: "none",
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
              )}

              {/* Kolom 3: Customer Details (Kanan) */}
              {!isMobileHubAi && (selectedInboxMsg || selectedComment) && (
                <div
                  style={{
                    width: 280,
                    background: "white",
                    borderRadius: 20,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(44,32,22,0.05)",
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
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderColor: "rgba(0,0,0,0.05)",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(44,32,22,0.15)",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(44,32,22,0.15)",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(44,32,22,0.15)",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(44,32,22,0.15)",
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
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: "rgba(44,32,22,0.2)",
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
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: "rgba(44,32,22,0.2)",
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
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderColor: "rgba(44,32,22,0.15)",
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
          
  );
}
