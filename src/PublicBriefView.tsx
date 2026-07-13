import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db, auth, onAuthStateChanged } from "./firebase";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import {
  Globe,
  Copy,
  Check,
  MessageSquare,
  Plus,
  ExternalLink,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Bookmark,
  Share2,
  Calendar,
  User,
  Heart,
  Zap,
  Users,
  Flag,
  Paperclip,
  Target,
  BarChart2,
  Eye,
  TrendingUp,
  Award
} from "lucide-react";
import { PlatformPreview } from "./components/PlatformPreview";

// Platform colors & icons lookup
function getPlatformStyle(platform: string) {
  const p = String(platform || "").toLowerCase().trim();
  if (p.includes("instagram") || p === "ig") {
    return { bg: "rgba(225, 48, 108, 0.08)", text: "#E1306C", label: "Instagram" };
  }
  if (p.includes("tiktok") || p === "tt") {
    return { bg: "rgba(17, 17, 17, 0.08)", text: "#111111", label: "TikTok" };
  }
  if (p.includes("facebook") || p === "fb") {
    return { bg: "rgba(24, 119, 242, 0.08)", text: "#1877F2", label: "Facebook" };
  }
  if (p.includes("youtube") || p === "yt") {
    return { bg: "rgba(255, 0, 0, 0.08)", text: "#FF0000", label: "YouTube" };
  }
  if (p.includes("linkedin") || p === "li") {
    return { bg: "rgba(10, 102, 194, 0.08)", text: "#0A66C2", label: "LinkedIn" };
  }
  return { bg: "rgba(59, 130, 246, 0.08)", text: "#3B82F6", label: platform || "Media Sosial" };
}

function getStatusColor(statusName: string) {
  const s = String(statusName || "").toLowerCase().trim();
  if (s.includes("draft")) return "#6b7280"; // Gray
  if (s.includes("review") || s.includes("rev")) return "#d97706"; // Amber
  if (s.includes("done") || s.includes("selesai") || s.includes("approved")) return "#059669"; // Emerald
  if (s.includes("schedule") || s.includes("jadwal") || s.includes("upload")) return "#2563eb"; // Blue
  return "#A67C1C"; // Fallback amber/gold
}

function getContentTypeColor(typeName: string) {
  const t = String(typeName || "").toLowerCase().trim();
  if (t.includes("video") || t.includes("reel") || t.includes("shorts")) return "#7c3aed"; // Violet
  if (t.includes("carousel") || t.includes("slide")) return "#2563eb"; // Blue
  if (t.includes("single") || t.includes("photo") || t.includes("feed")) return "#059669"; // Emerald
  if (t.includes("story")) return "#db2777"; // Pink
  return "#2C2016"; // Dark brown/charcoal
}

function getTranslucentColor(hex: string, opacityPercent: string = "15") {
  if (!hex) return "rgba(0,0,0,0.05)";
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, 0.${opacityPercent})`;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.${opacityPercent})`;
  }
  return hex;
}

export function PublicBriefView() {
  const { workspaceId, contentId } = useParams<{ workspaceId: string; contentId: string }>();
  const [brief, setBrief] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState("Workspace");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [visitorName, setVisitorName] = useState(() => {
    return localStorage.getItem("hubify_visitor_name") || "";
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedInUser(true);
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setUserProfile(data);
            const nameToUse = data.username ? `@${data.username}` : (data.fullName || user.displayName || user.email?.split("@")[0] || "Hubify User");
            setVisitorName(nameToUse);
          } else {
            const nameToUse = user.displayName || user.email?.split("@")[0] || "Hubify User";
            setVisitorName(nameToUse);
          }
        } catch (err) {
          console.error("Error fetching logged in user profile for commenter:", err);
          const nameToUse = user.displayName || user.email?.split("@")[0] || "Hubify User";
          setVisitorName(nameToUse);
        }
      } else {
        setCurrentUser(null);
        setIsLoggedInUser(false);
        setUserProfile(null);
        const savedName = localStorage.getItem("hubify_visitor_name") || "";
        setVisitorName(savedName);
      }
    });

    return () => unsubscribe();
  }, []);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Inline Comment states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [showResolvedInSection, setShowResolvedInSection] = useState<Record<string, boolean>>({});

  // Copied states
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"draft" | "refs" | "metrics">("draft");

  const handleAddSectionComment = async (sectionId: string, commentText: string) => {
    if (!commentText.trim() || !visitorName.trim()) return;

    try {
      if (!isLoggedInUser) {
        localStorage.setItem("hubify_visitor_name", visitorName.trim());
      }
      
      const updatedComments = [
        ...comments,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: visitorName.trim(),
          content: commentText.trim(),
          createdAt: new Date().toISOString(),
          sectionId,
          resolved: false,
          userId: currentUser?.uid || null
        }
      ];

      const docRef = doc(db, "workspaces", workspaceId!, "content", contentId!);
      await updateDoc(docRef, { comments: updatedComments });
    } catch (err: any) {
      console.error("Failed to add section comment:", err);
      alert("Gagal menambahkan komentar: " + err.message);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const updatedComments = comments.map(c => 
        c.id === commentId ? { ...c, resolved: true } : c
      );

      const docRef = doc(db, "workspaces", workspaceId!, "content", contentId!);
      await updateDoc(docRef, { comments: updatedComments });
    } catch (err: any) {
      console.error("Failed to resolve comment:", err);
      alert("Gagal menyelesaikan komentar: " + err.message);
    }
  };

  const handleReopenComment = async (commentId: string) => {
    try {
      const updatedComments = comments.map(c => 
        c.id === commentId ? { ...c, resolved: false } : c
      );

      const docRef = doc(db, "workspaces", workspaceId!, "content", contentId!);
      await updateDoc(docRef, { comments: updatedComments });
    } catch (err: any) {
      console.error("Failed to reopen comment:", err);
      alert("Gagal membuka kembali komentar: " + err.message);
    }
  };

  const renderSectionCommentBadge = (sectionKey: string) => {
    const count = comments.filter(c => c.sectionId === sectionKey && !c.resolved).length;
    const isOpen = !!openSections[sectionKey];

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
        }}
        className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all duration-200 uppercase tracking-wider ${
          count > 0 
            ? "bg-amber-50 text-amber-600 border border-amber-100" 
            : isOpen
              ? "bg-blue-50 text-blue-600 border border-blue-100"
              : "bg-gray-50 text-gray-400 hover:text-gray-600 border border-gray-100/50"
        }`}
        title={`${count} komentar aktif. Klik untuk buka/tutup komentar.`}
      >
        <MessageSquare size={12} className={count > 0 ? "fill-amber-500/10" : ""} />
        <span>{count > 0 ? `${count} Masukan` : "Beri Komen"}</span>
      </button>
    );
  };

  const renderInlineCommentThread = (sectionKey: string) => {
    const sectionComments = comments.filter(c => c.sectionId === sectionKey);
    const unresolvedComments = sectionComments.filter(c => !c.resolved);
    const resolvedComments = sectionComments.filter(c => c.resolved);
    const isOpen = !!openSections[sectionKey];
    const showResolved = !!showResolvedInSection[sectionKey];

    return (
      <div className="mt-5 border-t border-gray-50 pt-4">
        {/* Comment Header toggle */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <MessageSquare size={13} className="text-blue-500" />
            Komentar Bagian Ini ({unresolvedComments.length})
          </span>
          <button
            type="button"
            onClick={() => setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}
            className="text-[11px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition uppercase tracking-wider"
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
              className="overflow-hidden flex flex-col gap-3"
            >
              {/* Unresolved Comments */}
              <div className="space-y-3">
                {unresolvedComments.length === 0 && resolvedComments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-100/80 text-center">
                    Belum ada komentar di bagian ini. Berikan masukan Anda untuk berkolaborasi!
                  </p>
                ) : (
                  unresolvedComments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-100/50 flex flex-col gap-1.5 group relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900">{comment.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleResolveComment(comment.id)}
                            className="p-1 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition opacity-0 group-hover:opacity-100"
                            title="Selesaikan Komentar (Resolve)"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Resolved Comments Collapsible Section */}
              {resolvedComments.length > 0 && (
                <div className="border-t border-gray-50 pt-2.5">
                  <button
                    type="button"
                    onClick={() => setShowResolvedInSection(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}
                    className="w-full text-left text-[10px] font-black text-gray-400 hover:text-gray-600 flex items-center gap-1 py-1 transition uppercase tracking-wider"
                  >
                    <span>{showResolved ? "Sembunyikan" : "Tampilkan"} {resolvedComments.length} komentar diselesaikan</span>
                  </button>

                  {showResolved && (
                    <div className="space-y-2 mt-2 pl-3 border-l-2 border-gray-100">
                      {resolvedComments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-xl bg-gray-50/40 border border-gray-50 flex flex-col gap-1 opacity-60 hover:opacity-100 transition">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-500 line-through">{comment.name}</span>
                            <button
                              type="button"
                              onClick={() => handleReopenComment(comment.id)}
                              className="text-[10px] font-black text-blue-500 hover:underline uppercase tracking-wide"
                            >
                              Buka Kembali
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap line-through">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add Comment Sub-Form */}
              <div className="bg-black/[0.015] p-3.5 rounded-2xl border border-black/[0.01] flex flex-col gap-2.5 mt-1">
                {isLoggedInUser ? (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-blue-50/50 border border-blue-100/30 rounded-xl">
                    <img 
                      src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(visitorName)}&background=2563EB&color=fff`}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover border border-blue-200"
                    />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Komentar sebagai</span>
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        {visitorName}
                        <span className="bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.2 rounded-full scale-90">Hubify</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="Nama Anda..."
                      className="bg-white border border-gray-100 outline-none focus:ring-1 focus:ring-blue-500/20 p-2.5 px-3.5 rounded-xl text-xs font-semibold transition flex-1 min-w-0"
                    />
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <textarea
                    rows={1}
                    required
                    placeholder="Tulis saran di bagian ini (Tekan Enter untuk kirim)..."
                    id={`textarea-${sectionKey}`}
                    className="bg-white border border-gray-100 outline-none focus:ring-1 focus:ring-blue-500/20 p-2.5 px-3.5 rounded-xl text-xs font-semibold transition flex-1 resize-none min-h-[36px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const val = (e.target as HTMLTextAreaElement).value;
                        if (val.trim() && visitorName.trim()) {
                          handleAddSectionComment(sectionKey, val);
                          (e.target as HTMLTextAreaElement).value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const txtEl = document.getElementById(`textarea-${sectionKey}`) as HTMLTextAreaElement;
                      if (txtEl && txtEl.value.trim() && visitorName.trim()) {
                        handleAddSectionComment(sectionKey, txtEl.value);
                        txtEl.value = "";
                      }
                    }}
                    className="p-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-100 transition duration-150 shrink-0"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  useEffect(() => {
    if (!workspaceId || !contentId) {
      setError("ID Link tidak valid.");
      setLoading(false);
      return;
    }

    // Fetch workspace details for brand metadata
    getDoc(doc(db, "workspaces", workspaceId))
      .then((snap) => {
        if (snap.exists()) {
          setWorkspaceName(snap.data()?.name || "Workspace");
        }
      })
      .catch((err) => {
        console.error("Error loading workspace name:", err);
      });

    const docRef = doc(db, "workspaces", workspaceId, "content", contentId);
    
    // Set up real-time snapshot listener so comments and updates stream instantly
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isPublic = !!data.isPublic;
        const sharedUsers = data.sharedUsers || [];
        
        // Access checks
        const isOwner = currentUser && (data.userId === currentUser.uid);
        const isSharedUser = currentUser && sharedUsers.some((u: any) => 
          u.uid === currentUser.uid || 
          u.email?.toLowerCase() === currentUser.email?.toLowerCase() || 
          (userProfile?.username && u.username?.toLowerCase() === userProfile.username?.toLowerCase())
        );

        if (isPublic || isOwner || isSharedUser) {
          setBrief({ ...data, id: docSnap.id });
          setComments(data.comments || []);
          setError(null);
        } else {
          setError("Akses Ditolak: Brief konten ini bersifat privat dan hanya dibagikan ke pengguna Hubify Social tertentu.");
        }
      } else {
        setError("Brief konten tidak ditemukan.");
      }
      setLoading(false);
    }, (err) => {
      console.error("Error loading public brief:", err);
      setError("Gagal memuat brief konten. Pastikan link sudah benar dan memiliki akses publik.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [workspaceId, contentId, currentUser, userProfile]);

  const handleCopyCaption = () => {
    if (!brief?.caption) return;
    navigator.clipboard.writeText(brief.caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyBriefLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !visitorName.trim()) return;

    setSubmittingComment(true);
    try {
      if (!isLoggedInUser) {
        localStorage.setItem("hubify_visitor_name", visitorName.trim());
      }
      
      const updatedComments = [
        ...comments,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: visitorName.trim(),
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
          userId: currentUser?.uid || null
        }
      ];

      const docRef = doc(db, "workspaces", workspaceId!, "content", contentId!);
      await updateDoc(docRef, { comments: updatedComments });
      
      setNewComment("");
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 2500);
    } catch (err: any) {
      console.error("Failed to add comment:", err);
      alert("Gagal menambahkan komentar: " + err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-500"
        />
        <p className="mt-4 text-sm font-medium text-gray-500 font-sans">Memuat brief konten...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 font-sans tracking-tight">Tidak Dapat Membuka Brief</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed font-sans">{error}</p>
          <div className="flex flex-col gap-3">
            <Link 
              to="/login"
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-sm transition shadow-lg shadow-blue-100 hover:shadow-blue-200"
            >
              Masuk ke Hubify Social
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const pStyle = getPlatformStyle(brief.platform);
  const statusColor = getStatusColor(brief.status);
  const typeColor = getContentTypeColor(brief.contentType);

  // Platform Preview Media Handler
  const previewMediaList = brief.referenceImage 
    ? [{ url: brief.referenceImage, type: "image" as const }] 
    : (brief.mediaList || []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-black/5">
              <img 
                src="/icon.png" 
                alt="Hubify Social" 
                className="w-full h-full object-cover scale-110" 
                onError={(e) => { 
                  e.currentTarget.parentElement!.style.display = 'none'; 
                  const nextSibling = e.currentTarget.parentElement!.nextElementSibling as HTMLElement;
                  if (nextSibling) nextSibling.style.display = 'flex'; 
                }} 
              />
            </div>
            <div className="hidden w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-extrabold text-lg shadow-sm">
              H
            </div>
            <div>
              <div className="text-sm font-black text-gray-900 leading-none">Hubify Social</div>
              <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mt-1">Shared Content Brief</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Globe size={11} /> Publik
            </span>
            <button
              onClick={handleCopyBriefLink}
              className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500 hover:text-gray-800"
              title="Salin Link Bagikan"
            >
              {copiedBrief ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
            </button>

            {isLoggedInUser && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
                <img 
                  src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(visitorName)}&background=2563EB&color=fff`}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-blue-100 shadow-sm"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[9px] font-extrabold text-gray-400 leading-none uppercase tracking-wider">Komentator</span>
                  <span className="text-xs font-bold text-blue-600 leading-normal mt-0.5">{visitorName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main split-pane content */}
      <main className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: Properties & Mobile Live Preview */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col gap-6">
            
            {/* Title Block */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight uppercase font-sans">
                {brief.title || "Untitled Content"}
              </h1>
              <div className="text-xs text-gray-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                Workspace: <span className="text-gray-700 normal-case">{workspaceName}</span>
              </div>
            </div>

            {/* Separator line */}
            <hr className="border-gray-50" />

            {/* Notion Style Properties */}
            <div className="flex flex-col gap-3.5">
              
              {/* Status */}
              <div className="flex items-center min-h-[28px]">
                <div className="w-36 flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                  <Zap size={14} /> Status
                </div>
                <div className="flex-1">
                  <span 
                    style={{ 
                      fontSize: 12, 
                      fontWeight: 700, 
                      color: statusColor, 
                      backgroundColor: getTranslucentColor(statusColor, "15") 
                    }} 
                    className="px-2.5 py-1 rounded-lg inline-block text-center uppercase"
                  >
                    {brief.status || "Draft"}
                  </span>
                </div>
              </div>

              {/* Assign / PIC */}
              <div className="flex items-center min-h-[28px]">
                <div className="w-36 flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                  <Users size={14} /> Assign
                </div>
                <div className="flex-1 text-[13px] font-bold text-gray-800 truncate">
                  {brief.pic || <span className="text-gray-300 italic font-medium">None</span>}
                </div>
              </div>

              {/* Jadwal Produksi */}
              <div className="flex items-center min-h-[28px]">
                <div className="w-36 flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                  <Calendar size={14} /> Jadwal Produksi
                </div>
                <div className="flex-1 text-[13px] font-bold text-gray-700">
                  {brief.productionDay && brief.productionMonth && brief.productionYear ? (
                    `${String(brief.productionDay).padStart(2, '0')}/${String(brief.productionMonth).padStart(2, '0')}/${brief.productionYear} (${String(brief.productionHour !== undefined && brief.productionHour !== null ? brief.productionHour : 0).padStart(2, '0')}:${String(brief.productionMinute !== undefined && brief.productionMinute !== null ? brief.productionMinute : 0).padStart(2, '0')})`
                  ) : (
                    <span className="text-gray-300 italic font-medium">Belum diatur</span>
                  )}
                </div>
              </div>

              {/* Jadwal Upload */}
              <div className="flex items-center min-h-[28px]">
                <div className="w-36 flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                  <Clock size={14} /> Jadwal Upload
                </div>
                <div className="flex-1 text-[13px] font-bold text-gray-700">
                  {brief.day && brief.month && brief.year ? (
                    `${String(brief.day).padStart(2, '0')}/${String(brief.month).padStart(2, '0')}/${brief.year} (${String(brief.uploadHour !== undefined && brief.uploadHour !== null ? brief.uploadHour : 0).padStart(2, '0')}:${String(brief.uploadMinute !== undefined && brief.uploadMinute !== null ? brief.uploadMinute : 0).padStart(2, '0')})`
                  ) : brief.dateStr ? (
                    brief.dateStr
                  ) : (
                    <span className="text-gray-300 italic font-medium">Belum diatur</span>
                  )}
                </div>
              </div>

              {/* Pillar */}
              <div className="flex items-center min-h-[28px]">
                <div className="w-36 flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                  <Flag size={14} /> Pillar
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-gray-600 bg-gray-100/80 px-2.5 py-1 rounded-lg inline-block">
                    {brief.pillar || <span className="text-gray-300 italic font-medium">None</span>}
                  </span>
                </div>
              </div>

              {/* Platform */}
              <div className="flex items-center min-h-[28px]">
                <div className="w-36 flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                  <Paperclip size={14} /> Platform
                </div>
                <div className="flex-1 text-[13px] font-bold text-gray-700 uppercase">
                  {brief.platform ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs" style={{ backgroundColor: pStyle.bg, color: pStyle.text }}>
                      {pStyle.label}
                    </span>
                  ) : (
                    <span className="text-gray-300 italic font-medium">None</span>
                  )}
                </div>
              </div>

              {/* Type */}
              <div className="flex items-center min-h-[28px]">
                <div className="w-36 flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                  <FileText size={14} /> Type
                </div>
                <div className="flex-1">
                  <span 
                    style={{ 
                      fontSize: 12, 
                      fontWeight: 700, 
                      color: typeColor, 
                      backgroundColor: getTranslucentColor(typeColor, "15") 
                    }} 
                    className="px-2.5 py-1 rounded-lg inline-block text-center"
                  >
                    {brief.contentType || "Unspecified"}
                  </span>
                </div>
              </div>

              {/* Referensi Link */}
              <div className="flex items-center min-h-[28px]">
                <div className="w-36 flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                  <ExternalLink size={14} /> Referensi
                </div>
                <div className="flex-1 truncate text-[13px] font-bold text-blue-600">
                  {brief.assetLink ? (
                    <a href={brief.assetLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700 inline-flex items-center gap-1">
                      Link Utama <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-gray-300 italic font-medium">None</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* REALISTIC MOBILE LIVE PREVIEW PANEL */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col gap-4">
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Eye size={14} className="text-gray-400" /> Live Interactive Preview
            </div>
            
            <div className="py-4 flex justify-center bg-gray-50/50 rounded-2xl border border-gray-100/50">
              <PlatformPreview
                platform={brief.platform || "instagram"}
                contentType={brief.contentType || "feed"}
                caption={brief.caption || ""}
                mediaList={previewMediaList}
                workspaceName={workspaceName}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tab Navigation and Beautiful Interactive Cards */}
        <div className="flex-1 w-full flex flex-col gap-6">
          
          {/* Apple-Style Segmented Tab Selection Bar */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <div className="relative flex bg-black/[0.04] p-1 rounded-xl h-11 w-full max-w-[480px]">
              
              {/* Sliding Highlight Indicator */}
              <motion.div
                layoutId="activeTabIndicator"
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm"
                style={{
                  width: "calc((100% - 8px) / 3)",
                  left: activeTab === "draft" ? 4 : activeTab === "refs" ? "calc(((100% - 8px) / 3) + 4px)" : "calc(((100% - 8px) / 3 * 2) + 4px)",
                  zIndex: 0
                }}
              />
              
              {[
                { id: "draft", label: "Brief & Konten" },
                { id: "refs", label: "Aset & Referensi" },
                { id: "metrics", label: "Metrik & Performa" }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex-1 text-[13px] font-bold z-10 rounded-lg transition-colors duration-200 ${
                    activeTab === id ? "text-gray-900" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB CONTENTS CONTAINER */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              
              {/* TAB 1: BRIEF & KONTEN */}
              {activeTab === "draft" && (
                <div className="flex flex-col gap-6">
                  
                  {/* Objective Card */}
                  <div className={`bg-white border rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] transition-all duration-300 ${openSections["objective"] ? "border-blue-200 ring-2 ring-blue-500/10 shadow-lg" : "border-gray-100"}`}>
                    <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Target size={14} className="text-gray-400" /> Objective / Tujuan Utama
                      {brief.allowComments && renderSectionCommentBadge("objective")}
                    </div>
                    {brief.objective ? (
                      <div className="bg-black/[0.015] p-5 rounded-2xl text-gray-800 font-medium text-sm leading-relaxed border border-black/[0.01]">
                        <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: brief.objective }} />
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm text-center py-4">Tidak ada spesifikasi objective khusus.</p>
                    )}
                    {brief.allowComments && renderInlineCommentThread("objective")}
                  </div>

                  {/* Hook Card */}
                  <div className={`bg-white border rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] transition-all duration-300 ${openSections["hook"] ? "border-blue-200 ring-2 ring-blue-500/10 shadow-lg" : "border-gray-100"}`}>
                    <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Sparkles size={14} className="text-gray-400" /> Hook Pembuka (3 Detik Pertama)
                      {brief.allowComments && renderSectionCommentBadge("hook")}
                    </div>
                    {brief.hook ? (
                      <div className="bg-black/[0.015] p-5 rounded-2xl text-gray-800 font-medium text-sm leading-relaxed border border-black/[0.01]">
                        <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: brief.hook }} />
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm text-center py-4">Skenario / teks hook belum ditentukan.</p>
                    )}
                    {brief.allowComments && renderInlineCommentThread("hook")}
                  </div>

                  {/* Brief Card */}
                  <div className={`bg-white border rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] transition-all duration-300 ${openSections["brief"] ? "border-blue-200 ring-2 ring-blue-500/10 shadow-lg" : "border-gray-100"}`}>
                    <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText size={14} className="text-gray-400" /> Arah & Detail Brief Konten
                      {brief.allowComments && renderSectionCommentBadge("brief")}
                    </div>
                    {brief.briefCopywriting ? (
                      <div className="bg-black/[0.015] p-5 rounded-2xl text-gray-800 font-medium text-sm leading-relaxed border border-black/[0.01]">
                        <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: brief.briefCopywriting }} />
                      </div>
                    ) : brief.brief ? (
                      <div className="prose max-w-none text-gray-800 leading-relaxed font-medium bg-black/[0.015] p-5 rounded-2xl border border-black/[0.01]">
                        <Markdown>{brief.brief}</Markdown>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm text-center py-6">Detail brief konten belum disediakan.</p>
                    )}
                    {brief.allowComments && renderInlineCommentThread("brief")}
                  </div>

                  {/* Call to Action (CTA) Card */}
                  <div className={`bg-white border rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] transition-all duration-300 ${openSections["cta"] ? "border-blue-200 ring-2 ring-blue-500/10 shadow-lg" : "border-gray-100"}`}>
                    <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Check size={14} className="text-gray-400" /> Call To Action (CTA)
                      {brief.allowComments && renderSectionCommentBadge("cta")}
                    </div>
                    {brief.cta ? (
                      <div className="bg-black/[0.015] p-5 rounded-2xl text-gray-800 font-medium text-sm leading-relaxed border border-black/[0.01]">
                        <div className="tiptap-prose" dangerouslySetInnerHTML={{ __html: brief.cta }} />
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm text-center py-4">Tindakan CTA belum ditentukan.</p>
                    )}
                    {brief.allowComments && renderInlineCommentThread("cta")}
                  </div>

                  {/* Copyable Caption Card */}
                  {brief.caption && (
                    <div className={`bg-white border rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] transition-all duration-300 ${openSections["caption"] ? "border-blue-200 ring-2 ring-blue-500/10 shadow-lg" : "border-gray-100"}`}>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2 flex-1 min-w-0">
                          <Sparkles size={14} className="text-gray-400" /> Copywriting / Caption Final Draft
                          {brief.allowComments && renderSectionCommentBadge("caption")}
                        </div>
                        <button
                          onClick={handleCopyCaption}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition duration-150 shrink-0 ml-2"
                        >
                          {copiedCaption ? (
                            <>
                              <Check size={13} className="text-emerald-500" /> Tersalin!
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Salin Caption
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-black/[0.015] p-5 rounded-2xl text-gray-800 font-medium text-sm leading-relaxed border border-black/[0.01] whitespace-pre-wrap">
                        {brief.caption}
                      </div>
                      {brief.allowComments && renderInlineCommentThread("caption")}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: ASET & REFERENSI */}
              {activeTab === "refs" && (
                <div className="flex flex-col gap-6">
                  
                  {/* Reference Image View if exists */}
                  {brief.referenceImage && (
                    <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                      <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">
                        Aset / Gambar Referensi Utama
                      </div>
                      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex justify-center aspect-video w-full max-h-[420px]">
                        <img 
                          src={brief.referenceImage} 
                          alt="Referensi Utama" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Custom Fields / Bento Box Information */}
                  {brief.customFields && brief.customFields.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                      <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">
                        Informasi Tambahan Workspace
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {brief.customFields.map((cf: any, idx: number) => (
                          <div key={idx} className="bg-[#FAFAFA] p-5 rounded-2xl border border-gray-100/80">
                            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                              {cf.name || cf.key || `Atribut ${idx + 1}`}
                            </div>
                            <div className="text-sm font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {cf.value || <span className="text-gray-300 font-medium italic">-</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reference Links & Attachments */}
                  <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                    <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">
                      Tautan Referensi & Dokumen Lampiran
                    </div>
                    {brief.referenceLinks && brief.referenceLinks.length > 0 ? (
                      <div className="flex flex-col gap-2.5">
                        {brief.referenceLinks.map((link: any, idx: number) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-black/[0.01] hover:bg-black/[0.02] border border-gray-50 rounded-2xl transition duration-150 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-gray-800 truncate">
                                  {link.title || "Tautan Referensi"}
                                </div>
                                <div className="text-[11px] text-gray-400 truncate">
                                  {link.url}
                                </div>
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 transition flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm text-center py-6 bg-gray-50/55 rounded-2xl border border-dashed border-gray-100">
                        Belum ada tautan eksternal yang ditambahkan.
                      </p>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 3: METRIK & ADS */}
              {activeTab === "metrics" && (
                <div className="flex flex-col gap-6">
                  
                  {/* Organic Metrics Card */}
                  <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                    <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <TrendingUp size={14} className="text-emerald-500" /> Performa Organik Postingan
                    </div>
                    
                    {brief.metrics && Object.values(brief.metrics).some(v => v !== 0 && v !== "") ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { key: "views", label: "Views / Tayangan", icon: <Eye size={14} /> },
                          { key: "reach", label: "Reach / Jangkauan", icon: <TrendingUp size={14} /> },
                          { key: "likes", label: "Likes / Suka", icon: <Heart size={14} /> },
                          { key: "comments", label: "Comments", icon: <MessageSquare size={14} /> },
                          { key: "reposts", label: "Reposts / Bagikan", icon: <Share2 size={14} /> },
                          { key: "saves", label: "Saves / Simpan", icon: <Bookmark size={14} /> },
                          { key: "profileVisits", label: "Kunjungan Profil", icon: <User size={14} /> },
                          { key: "bioLinkTaps", label: "Ketuk Link Bio", icon: <ExternalLink size={14} /> },
                          { key: "follows", label: "Followers Baru", icon: <Award size={14} /> }
                        ].map(({ key, label, icon }) => {
                          const val = brief.metrics?.[key];
                          if (val === undefined || val === null || val === "") return null;
                          return (
                            <div key={key} className="bg-black/[0.01] border border-gray-50 p-4 rounded-2xl flex flex-col gap-1">
                              <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5">
                                {icon} {label}
                              </span>
                              <span className="text-xl font-black text-gray-900">
                                {typeof val === 'number' ? val.toLocaleString("id-ID") : val}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                        <BarChart2 size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-400 text-sm italic font-medium">Metrik performa organik belum diisi.</p>
                      </div>
                    )}
                  </div>

                  {/* Paid / Ads Metrics Card */}
                  {brief.adsMetrics && Object.values(brief.adsMetrics).some(v => v !== 0 && v !== "") && (
                    <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                      <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp size={14} className="text-blue-500" /> Performa Kampanye Berbayar (Ads)
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { key: "views", label: "Views", icon: <Eye size={14} /> },
                          { key: "reach", label: "Reach", icon: <TrendingUp size={14} /> },
                          { key: "clicks", label: "Clicks / Klik Link", icon: <ExternalLink size={14} /> },
                          { key: "conversions", label: "Conversions / Konversi", icon: <Check size={14} /> },
                          { key: "spendBudget", label: "Pengeluaran (Spend)", icon: <Sparkles size={14} /> },
                          { key: "dailyBudget", label: "Anggaran Harian", icon: <Calendar size={14} /> },
                          { key: "duration", label: "Durasi Iklan", icon: <Clock size={14} /> },
                          { key: "audience", label: "Target Audience", icon: <User size={14} /> }
                        ].map(({ key, label, icon }) => {
                          const val = brief.adsMetrics?.[key];
                          if (val === undefined || val === null || val === "") return null;
                          return (
                            <div key={key} className="bg-black/[0.01] border border-gray-50 p-4 rounded-2xl flex flex-col gap-1">
                              <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5">
                                {icon} {label}
                              </span>
                              <span className="text-xl font-black text-gray-900">
                                {key.toLowerCase().includes("budget") || key === "spendBudget" ? (
                                  `Rp ${Number(val).toLocaleString("id-ID")}`
                                ) : typeof val === 'number' ? (
                                  val.toLocaleString("id-ID")
                                ) : (
                                  val
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Last updated metrics text */}
                  {brief.metricsUpdatedAt && (
                    <div className="text-right text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Terakhir diperbarui: {brief.metricsUpdatedAt}
                    </div>
                  )}

                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Comment Thread Card Section */}
          {brief.allowComments && (
            <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
                <MessageSquare size={18} className="text-blue-600" />
                Kolaborasi Komentar & Masukan ({comments.length})
              </h2>

              {/* Comment list */}
              <div className="space-y-4 mb-8">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 italic bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                    Belum ada masukan. Tulis masukan Anda di bawah untuk berkolaborasi!
                  </div>
                ) : (
                  comments.map((comment, idx) => (
                    <motion.div
                      key={comment.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border ${comment.resolved ? "bg-gray-50/50 border-gray-100 opacity-60" : "bg-[#FAFAFA] border-gray-100/50"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-extrabold text-gray-900 flex items-center gap-2 flex-wrap">
                          <span className={comment.resolved ? "line-through text-gray-500" : ""}>{comment.name}</span>
                          {comment.sectionId && (
                            <span className="bg-blue-50 text-blue-600 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                              {comment.sectionId === "brief" ? "arah brief" : comment.sectionId}
                            </span>
                          )}
                          {comment.resolved && (
                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Check size={10} /> Selesai
                            </span>
                          )}
                        </div>
                        {comment.createdAt && (
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        )}
                      </div>
                      <p className={`text-[13px] font-medium leading-relaxed whitespace-pre-wrap ${comment.resolved ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {comment.content}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="border-t border-gray-50 pt-6">
                <h3 className="text-sm font-black text-gray-800 mb-4 uppercase tracking-tight">
                  Tulis Komentar Baru
                </h3>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {isLoggedInUser ? (
                    <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100/30 rounded-2xl">
                      <img 
                        src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(visitorName)}&background=2563EB&color=fff`}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Komentar Terhubung Sebagai</span>
                        <span className="text-sm font-extrabold text-blue-600 flex items-center gap-1.5">
                          {visitorName}
                          <span className="bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full scale-95">Hubify Member</span>
                        </span>
                        <span className="text-xs text-gray-500 font-semibold">{userProfile?.fullName || currentUser?.email}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                        Nama Panggilan Anda
                      </label>
                      <input
                        type="text"
                        required
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="Masukkan nama Anda..."
                        className="w-full bg-black/[0.03] hover:bg-black/[0.04] outline-none focus:bg-black/[0.01] focus:ring-1 focus:ring-blue-500/20 p-3 px-4 rounded-xl text-sm font-semibold transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                      Pesan Masukan / Komentar
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tulis ide, saran, masukan visual, atau revisi copywriting..."
                      className="w-full bg-black/[0.03] hover:bg-black/[0.04] outline-none focus:bg-black/[0.01] focus:ring-1 focus:ring-blue-500/20 p-3 px-4 rounded-xl text-sm font-semibold transition resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim() || !visitorName.trim()}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-full text-xs shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all duration-150 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingComment ? "Mengirim..." : "Kirim Komentar"}
                  </button>
                </div>

                <AnimatePresence>
                  {commentSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-2 justify-center"
                    >
                      <Check size={14} /> Komentar Anda berhasil ditambahkan!
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
