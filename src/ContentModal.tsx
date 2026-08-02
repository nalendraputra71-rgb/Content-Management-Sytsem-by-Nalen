import { usePlanLimits } from "./hooks/usePlanLimits";
import { ContentModalMobileView } from "./components/ContentModalMobileView";
import { ContentModalContext } from "./ContentModalContext";
import { ContentModalDesktopView } from "./components/ContentModalDesktopView";
import { HistoryChangeItem } from "./components/HistoryChangeItem";
import { HistoryView } from "./components/HistoryView";
import { Tooltip } from "./components/Tooltip";
import { useI18n } from "./i18n";
import { useState, useRef, useEffect } from "react";
import { auth, callAiWithQuota, db } from "./firebase";

import { doc, updateDoc, onSnapshot, collection, query, where, getDocs, limit, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import TextareaAutosize from "react-textarea-autosize";
import { RichTextEditor } from "./RichTextEditor";
import { MiniCalendar } from "./components/MiniCalendar";
import { HubifyRoleSelect } from "./components/HubifyRoleSelect";


import React from "react";
import { Trash, Send, Globe, Check, Link2, ExternalLink, Search, UserCheck, X, ChevronDown, AlertCircle, Megaphone, Eye, Users, Heart, MessageCircle, Bookmark, MousePointerClick, RefreshCw, Archive, Play, Link, Share2, Plus, GripVertical, FileText, Image as ImageIcon, CheckCircle, Video, Smartphone, Copy, Info, MoreVertical, Lock, Shield, AtSign, Settings, Settings2, Trash2 } from "lucide-react";
import { I, B, CARD, MK, MC, eng, gps, L, GRP, CustomDropdown, htmlToPlainText } from "./data";
import { MessageSquare, Layout, Leaf, Sparkles, ArrowUp, ArrowDown, AlertTriangle, Zap, Calendar, Clock, Flag, Paperclip, FolderOpen, BarChart2, DollarSign, RefreshCcw, Maximize2, PanelRight } from "lucide-react";
import { fmt } from "./data";
import { GeminiIcon, LoadingDots, getMetricIcon, formatMetricKey, ADS_CATEGORIES, DEFAULT_FIELDS, getFieldIcon, getFieldTranslation, getAssetLinks, getSosmedLinks, getLinkHostLabel } from "./utils/contentModalHelpers";

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
    if (!workspace?.id || !d.id || isRefreshing || modal.mode === "add") return;
    setIsRefreshing(true);
    try {
      const docRef = doc(db, "workspaces", workspace.id, "content", d.id);
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
  const [editingFieldLeft, setEditingFieldLeftState] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState<string | null>(null);
  const [editingFieldRight, setEditingFieldRightState] = useState<string | null>(null);
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
    if (!canComment) {
      showToast("Akses Ditolak: Peran Anda Pelihat (Read-Only) dan tidak dapat menambahkan komentar.", "error");
      return;
    }
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
    if (!canComment) {
      showToast("Akses Ditolak: Peran Anda Pelihat (Read-Only) dan tidak dapat mengubah komentar.", "error");
      return;
    }
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
    if (!canComment) {
      showToast("Akses Ditolak: Peran Anda Pelihat (Read-Only) dan tidak dapat mengubah komentar.", "error");
      return;
    }
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
    if (!showCommentUI) return null;
    const commentsList = d.comments || [];
    const count = commentsList.filter((c: any) => c.sectionId === sectionKey && !c.resolved).length;
    if (count === 0 && !canComment) return null;
    const isOpen = !!openSections[sectionKey];

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          padding: "6px",
          borderRadius: "6px",
          border: "none",
          background: count > 0 ? "rgba(217, 119, 6, 0.1)" : isOpen ? "rgba(37, 99, 235, 0.1)" : "rgba(0,0,0,0.03)",
          color: count > 0 ? "#D97706" : isOpen ? "#2563EB" : "#4B5563",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        title={`${count} komentar aktif.`}
      >
        <MessageSquare size={14} />
        {count > 0 && <span style={{ fontSize: "11px", fontWeight: 700 }}>{count}</span>}
      </button>
    );
  };

  const renderInlineCommentThread = (sectionKey: string) => {
    if (!showCommentUI) return null;
    const commentsList = d.comments || [];
    const sectionComments = commentsList.filter((c: any) => c.sectionId === sectionKey);
    if (sectionComments.length === 0 && !openSections[sectionKey]) return null;
    const unresolvedComments = sectionComments.filter((c: any) => !c.resolved);
    const resolvedComments = sectionComments.filter((c: any) => c.resolved);
    const isOpen = !!openSections[sectionKey];
    const showResolved = !!showResolvedInSection[sectionKey];

    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ marginTop: "14px", borderTop: "1px dashed rgba(0,0,0,0.06)", paddingTop: "12px" }}
      >
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
                <textarea disabled={!canComment}
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

    if (workspace && workspace.id === d.workspaceId && workspace.userRole) {
      if (workspace.userRole === "owner" || workspace.userRole === "admin") return "owner";
      if (workspace.userRole === "editor") return "editor";
      if (workspace.userRole === "commenter") return "commenter";
      if (workspace.userRole === "viewer") return "viewer";
    }
    // 1. Workspace owner/admin/editor OR document owner/creator
    const isWsOwnerOrAdmin = workspace && workspace.id === d.workspaceId && uid && (
      workspace.ownerId === uid || 
      workspace.createdBy === uid || 
      (Array.isArray(workspace.members) && workspace.members.some((m: any) => m.uid === uid && (m.role === "owner" || m.role === "admin")))
    );
    const isWsEditor = workspace && workspace.id === d.workspaceId && uid && (
      Array.isArray(workspace.members) && workspace.members.some((m: any) => m.uid === uid && m.role === "editor")
    );
    const isDocOwner = uid && (
      d.userId === uid || 
      d.createdBy === uid || 
      d.ownerId === uid
    );

    if (isWsOwnerOrAdmin || isDocOwner) {
      return "owner";
    }
    if (isWsEditor) {
      return "editor";
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
  const isSharedWithCommentAccess = 
    (d.isPublic && (d.publicRole === "editor" || d.publicRole === "commenter")) || 
    (d.sharedUsers && d.sharedUsers.some((u: any) => u.role === "editor" || u.role === "commenter"));
  
  const showCommentUI = isSharedWithCommentAccess || (d.comments && d.comments.length > 0) || userRole === "editor" || userRole === "commenter";

  const setEditingFieldLeft = (v: string | null) => {
    if (v !== null && !canEdit) {
      showToast("Akses Anda sebagai " + (userRole === "commenter" ? "Komentator" : "Pelihat") + " bersifat Read-Only", "error");
      return;
    }
    setEditingFieldLeftState(v);
  };

  const setEditingFieldRight = (v: string | null) => {
    if (v !== null && !canEdit) {
      showToast("Akses Anda sebagai " + (userRole === "commenter" ? "Komentator" : "Pelihat") + " bersifat Read-Only", "error");
      return;
    }
    setEditingFieldRightState(v);
  };

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
    if ((!d.isHubAiDraft || d.manuallySaved) && isDirty.current && canEdit) {
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
    const nextSharedUids = nextShared.map((u: any) => u.uid);
    const nextEditorUids = nextShared.filter((u: any) => u.role === "editor").map((u: any) => u.uid);
    const nextCommenterUids = nextShared.filter((u: any) => u.role === "commenter" || u.role === "editor").map((u: any) => u.uid);

    const next = { 
      ...dRef.current, 
      sharedUsers: nextShared,
      sharedUids: nextSharedUids,
      editorUids: nextEditorUids,
      commenterUids: nextCommenterUids,
      ownerEmail: auth.currentUser?.email || "",
      ownerName: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || ""
    };
    dRef.current = next;
    setD(next);
    setShareSearch("");
    setShareSearchSuccess(null);
    showToast(`Berhasil memberikan akses ${newUser.role === 'editor' ? 'Editor' : newUser.role === 'commenter' ? 'Komentator' : 'Pelihat'} ke ${newUser.fullName || newUser.email}`, "success");
  };

  const handleUpdateSharedUserRole = (uid: string, newRole: "viewer" | "commenter" | "editor") => {
    if (!canManageShare) return;
    isDirty.current = true;
    const currentShared = d.sharedUsers || [];
    const nextShared = currentShared.map((u: any) => 
      u.uid === uid ? { ...u, role: newRole } : u
    );
    const nextSharedUids = nextShared.map((u: any) => u.uid);
    const nextEditorUids = nextShared.filter((u: any) => u.role === "editor").map((u: any) => u.uid);
    const nextCommenterUids = nextShared.filter((u: any) => u.role === "commenter" || u.role === "editor").map((u: any) => u.uid);

    const next = { 
      ...dRef.current, 
      sharedUsers: nextShared,
      sharedUids: nextSharedUids,
      editorUids: nextEditorUids,
      commenterUids: nextCommenterUids
    };
    dRef.current = next;
    setD(next);
    showToast("Peran akses pengguna diperbarui", "info");
  };

  const handleRemoveSharedUser = (uid: string) => {
    if (!canManageShare) return;
    isDirty.current = true;
    const currentShared = d.sharedUsers || [];
    const nextShared = currentShared.filter((u: any) => u.uid !== uid);
    const nextSharedUids = nextShared.map((u: any) => u.uid);
    const nextEditorUids = nextShared.filter((u: any) => u.role === "editor").map((u: any) => u.uid);
    const nextCommenterUids = nextShared.filter((u: any) => u.role === "commenter" || u.role === "editor").map((u: any) => u.uid);

    const next = { 
      ...dRef.current, 
      sharedUsers: nextShared,
      sharedUids: nextSharedUids,
      editorUids: nextEditorUids,
      commenterUids: nextCommenterUids
    };
    dRef.current = next;
    setD(next);
    showToast("Akses pengguna telah dicabut", "info");
  };

  const handleUpdateLinkAccessRole = (newRole: "viewer" | "commenter" | "editor") => {
    if (!canManageShare) return;
    isDirty.current = true;
    const next = {
      ...dRef.current,
      linkAccessRole: newRole,
      publicRole: newRole
    };
    dRef.current = next;
    setD(next);
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
    if (canEdit) isDirty.current = true;
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
    if (d.isHubAiDraft && !d.manuallySaved && canEdit) {
       setShowExitConfirm(true);
       return;
    }
    
    if (isDirty.current && canEdit) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      try {
        await onSave(dRef.current, false);
      } catch (e) {
        console.error("Autosave failed on close:", e);
      }
    }
    onClose();
  };


  const { aiTokenLimit, hasCapability } = usePlanLimits(planDetails);

  const addCustomField = () => {
    if (!canEdit) return;
    if (!hasCapability('customColumn')) {
      alert(lang === 'id' ? 'Upgrade paket untuk menambah Kustom Kolom Brief.' : 'Upgrade plan to add Custom Brief Columns.');
      return;
    }
    isDirty.current = true;

    const next = {...dRef.current, customFields: [...dRef.current.customFields, {key:"", value:""}]};
    dRef.current = next;
    setD(next);
  };
  const updateCustomField = (index:number, k:string, v:any) => {
    if (!canEdit) return;
    isDirty.current = true;
    const arr = [...dRef.current.customFields];
    arr[index] = {...arr[index], [k]:v};
    const next = {...dRef.current, customFields: arr};
    dRef.current = next;
    setD(next);
  };
  const removeCustomField = (index:number) => {
    if (!canEdit) return;
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
        
        const data = await callAiWithQuota(auth.currentUser?.uid || 'anon', userProfile?.plan, { prompt, model: planDetails?.capabilities?.allowedModels?.[0] || "gemini-3.6-flash" }, aiTokenLimit);
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
        <div key={id} ref={activeFieldRef} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)", borderRadius: 16, padding: "16px 20px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)", display: "flex", flexDirection: "column", minWidth: 0, width: "100%", maxWidth: "100%", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
              {getFieldIcon(icon, 14)} {translatedLabel}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {renderAiButton()}
              {renderSectionCommentBadge(id)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", minHeight: id === "briefCopywriting" ? 120 : id === "caption" ? 150 : 80, minWidth: 0, width: "100%", maxWidth: "100%", overflow: "hidden" }}>
            <RichTextEditor 
              inputRef={id === "briefCopywriting" ? briefRef : id === "caption" ? captionRef : id === "objective" ? objectiveRef : undefined} 
              value={fieldValue} 
              onChange={(val) => set(id, val)} 
              minRows={id === "briefCopywriting" ? 6 : id === "caption" ? 8 : minRows} 
              placeholder={translatedPlaceholder} 
              readOnly={!canEdit}
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                   padding: "6px", 
                   borderRadius: 6, 
                   cursor: isCopied ? "default" : "pointer", 
                   display: "flex", 
                   alignItems: "center", 
                   justifyContent: "center",
                   transition: "all 0.2s ease"
                }}
                title={lang === "id" ? "Salin" : "Copy"}
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
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
        
        const data = await callAiWithQuota(auth.currentUser?.uid || 'anon', userProfile?.plan, { prompt, model: planDetails?.capabilities?.allowedModels?.[0] || "gemini-3.6-flash" }, aiTokenLimit);
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
  const canArchive = !d.archived && !isNew;
  const canDelete = !isNew;

  ;



const ctx = {
hasCapability,
  aiTokenLimit, lang, d, setD, aiResult, setAiResult, aiLoading, setAiLoading, captionLoading, setCaptionLoading, isSaving, setIsSaving, isRefreshing, setIsRefreshing, handleRefresh,    editorProfiles, setEditorProfiles,    showWarning, setShowWarning, isShaking, setIsShaking, showExitConfirm, setShowExitConfirm, hourError, setHourError, minuteError, setMinuteError, productionHourError, setProductionHourError, productionMinuteError, setProductionMinuteError, isReaderMode, setIsReaderMode, editingFieldLeft, setEditingFieldLeftState, calendarOpen, setCalendarOpen, editingFieldRight, setEditingFieldRightState, activeFieldRef, isMobile, setIsMobile, showHistory, setShowHistory,   openSections, setOpenSections, showResolvedInSection, setShowResolvedInSection,   handleAddSectionComment,   handleResolveComment, handleReopenComment, renderSectionCommentBadge,    renderInlineCommentThread,       isReady, setIsReady,  showShareDropdown, setShowShareDropdown, shareDropdownRef, handleShareClick, copiedBrief, setCopiedBrief, copiedCaption, setCopiedCaption, copiedSharedLink, setCopiedSharedLink, shareTab, setShareTab, shareSearch, setShareSearch, shareSearchLoading, setShareSearchLoading, shareSearchError, setShareSearchError, shareSearchSuccess, setShareSearchSuccess, selectedRoleForNewUser, setSelectedRoleForNewUser, currentUser, getUserContentRole,         userRole, canManageShare, canEdit, canComment, isSharedWithCommentAccess, showCommentUI, setEditingFieldLeft, setEditingFieldRight, layoutMode, setLayoutMode, activeTab, setActiveTab, copiedFields, setCopiedFields, showLayoutConfig, setShowLayoutConfig, layoutScope, setLayoutScope, localToast, setLocalToast, showToast, layoutFields, setLayoutFields,   dRef, CheckIcon, handleHourChange,     handleProductionHourChange, handleFormatChange,   handleMinuteChange, handleProductionMinuteChange, debounceRef,   activePillar, headerBg, getTranslucentColor, activePillarColor, activePlatformOption, name, activePlatformColor, activeContentTypeOption, activeContentTypeColor, activePicOption, activePicColor, activeStatusOption, activeStatusColor, handleShareSearch,      handleAddSharedUser,       handleUpdateSharedUserRole, handleRemoveSharedUser, handleUpdateLinkAccessRole, titleRef, objectiveRef, briefRef, captionRef, focusTarget, setFocusTarget, isDirty,  set, setM,  handleClose, addCustomField, updateCustomField,  removeCustomField, analyzeContent, prompt,  getInitialLayoutFields, saveLayoutSettings,   renderLayoutConfigPanel,       renderDynamicField,            generateCaption,  handleRefImg,   modalScrollRef, isRightScrolled, setIsRightScrolled, handleRightScroll, isNew, canArchive, canDelete, modal, workspace, userProfile, planDetails, onSave, onClose, onArchive, onRestore, onDelete, onDuplicate, pillars, platforms, contentTypes, pics, statuses, onSettingUpdate
};


  if (isMobile) {
    return <ContentModalContext.Provider value={ctx}><ContentModalMobileView /></ContentModalContext.Provider>;
  }

  return <ContentModalContext.Provider value={ctx}><ContentModalDesktopView /></ContentModalContext.Provider>;
}
