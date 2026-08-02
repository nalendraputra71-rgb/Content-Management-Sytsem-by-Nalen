import { Eye, Users, Heart, MessageCircle, Share2, Repeat, Bookmark, MousePointer, Target, User, Link2, UserPlus, MessageSquare, PlayCircle, DollarSign, Wallet, Clock, AlertCircle, FileText, Megaphone, PenTool, Sparkles, Music, ExternalLink, Hash } from "lucide-react";

import { HistoryChangeItem } from "../components/HistoryChangeItem";
import { HistoryView } from "../components/HistoryView";
import { Tooltip } from "../components/Tooltip";
import { useI18n } from "../i18n";
import { useState, useRef, useEffect } from "react";
import { auth, callAiWithQuota, db } from "../firebase";
import { usePlanLimits } from "../hooks/usePlanLimits";
import { doc, updateDoc, onSnapshot, collection, query, where, getDocs, limit, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import TextareaAutosize from "react-textarea-autosize";
import { RichTextEditor } from "../RichTextEditor";
import { MiniCalendar } from "../components/MiniCalendar";
import { HubifyRoleSelect } from "../components/HubifyRoleSelect";

export const GeminiIcon = ({ size = 18 }: { size?: number }) => (
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

export const LoadingDots = () => (
  <span>
    Menganalisis konten
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5}}>.</motion.span>
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.2}}>.</motion.span>
    <motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 1.5, delay: 0.4}}>.</motion.span>
  </span>
);

export const getMetricIcon = (k: string, color?: string, size = 14) => {
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

export const formatMetricKey = (k: string) => {
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

export const ADS_CATEGORIES = [
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

export const DEFAULT_FIELDS = [
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

export const getFieldIcon = (iconName: string, size = 14) => {
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

export const getFieldTranslation = (id: string, type: "label" | "placeholder", lang: string) => {
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


export const getAssetLinks = (data: any): string[] => {
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

export const getSosmedLinks = (data: any): string[] => {
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

export const getLinkHostLabel = (url: string, defaultType: string = "Link") => {
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
