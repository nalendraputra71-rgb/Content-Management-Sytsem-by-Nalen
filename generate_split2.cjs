const fs = require('fs');

const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

// Boundaries
const exportContentModalIdx = code.indexOf('export function ContentModal({');
const renderMobileViewIdx = code.indexOf('  const renderMobileView = () => {');
const desktopViewIdx = code.indexOf('  if (isMobile) {');

const beforeComponent = code.substring(0, exportContentModalIdx);
const componentParams = code.substring(exportContentModalIdx, code.indexOf('{', exportContentModalIdx) + 1);

let logicStartIdx = code.indexOf(') {', exportContentModalIdx) + 3;
const logicCode = code.substring(logicStartIdx, renderMobileViewIdx);

const renderMobileViewCode = code.substring(renderMobileViewIdx, desktopViewIdx);

// For desktop view, it's everything from `return (` after `if (isMobile)` to the end.
const desktopReturnStart = code.indexOf('  return (', desktopViewIdx);
// Find the last closing brace for ContentModal function
const lastBraceIdx = code.lastIndexOf('}');
const desktopViewCode = code.substring(desktopReturnStart, lastBraceIdx);

// Get context keys
const regex = /^\s*const\s+(?:\[(.*?)\]|([a-zA-Z0-9_]+))\s*=/gm;
let match;
const exportedVars = [];
while ((match = regex.exec(logicCode)) !== null) {
  if (match[1]) {
    const vars = match[1].split(',').map(s => s.trim());
    exportedVars.push(...vars);
  } else if (match[2]) {
    exportedVars.push(match[2]);
  }
}
const uniqueVars = [...new Set(exportedVars)].filter(v => v !== "React" && v !== "" && !v.includes(" "));
// Ensure props are included
const propsList = ["modal", "workspace", "userProfile", "planDetails", "onSave","onClose","onArchive","onRestore","onDelete","onDuplicate","pillars","platforms","contentTypes","pics","statuses","onSettingUpdate"];
uniqueVars.push(...propsList);
const allCtxVars = [...new Set(uniqueVars)];

// GENERATE FILES

// 1. ContentModal/utils.tsx
fs.mkdirSync('src/ContentModal', { recursive: true });

const utilsContent = `
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, callAiWithQuota, db } from "../firebase";
import { doc, updateDoc, onSnapshot, collection, query, where, getDocs, limit, getDoc } from "firebase/firestore";
${beforeComponent.replace(/import .* from "\.\/.*/g, (m) => m.replace('"./', '"../'))}
`;
fs.writeFileSync('src/ContentModal/utils.tsx', utilsContent);


// 2. ContentModal/useContentModalLogic.tsx
const hookContent = `
import React, { useState, useRef, useEffect } from "react";
import { auth, callAiWithQuota, db } from "../firebase";
import { doc, updateDoc, onSnapshot, collection, query, where, getDocs, limit, getDoc } from "firebase/firestore";
import { useI18n } from "../i18n";
import { usePlanLimits } from "../hooks/usePlanLimits";
import { fmt, fmtD, getAssetLinks, getSosmedLinks, getLinkHostLabel, getMetricIcon, formatMetricKey, DEFAULT_FIELDS, ADS_CATEGORIES, getFieldIcon, getFieldTranslation } from "./utils";
import * as Utils from "./utils";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import TextareaAutosize from "react-textarea-autosize";
import { RichTextEditor } from "../RichTextEditor";
import { HistoryChangeItem } from "../components/HistoryChangeItem";
import { HistoryView } from "../components/HistoryView";
import { Tooltip } from "../components/Tooltip";
import { MiniCalendar } from "../components/MiniCalendar";
import { HubifyRoleSelect } from "../components/HubifyRoleSelect";
import { I, B, CARD, MK, MC, eng, gps, L, GRP, CustomDropdown, htmlToPlainText } from "../data";
import { ChevronDown, AlertCircle, Megaphone, Eye, Users, Heart, MessageCircle, Send, Bookmark, MousePointerClick, RefreshCw, Archive, Play, Link, Share2, Plus, GripVertical, FileText, Image as ImageIcon, CheckCircle, Video, Smartphone, Copy, Check, Info, MoreVertical, Search, Lock, Shield, AtSign, Settings, Settings2, Trash2 } from "lucide-react";


export function useContentModalLogic(props: any) {
  const { modal, workspace, userProfile, planDetails, onSave, onClose, onArchive, onRestore, onDelete, onDuplicate, pillars, platforms, contentTypes, pics, statuses, onSettingUpdate } = props;

${logicCode}

  return {
    ${allCtxVars.join(',\n    ')}
  };
}
`;
// Replace calls to helpers in logicCode? No, we just imported them.
fs.writeFileSync('src/ContentModal/useContentModalLogic.tsx', hookContent);

// 3. ContentModal/MobileView.tsx
const destructure = `  const { \n    ${allCtxVars.join(',\n    ')}\n  } = ctx;\n`;

const mobileContent = `
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip } from "../components/Tooltip";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import TextareaAutosize from "react-textarea-autosize";
import { RichTextEditor } from "../RichTextEditor";
import { HistoryChangeItem } from "../components/HistoryChangeItem";
import { HistoryView } from "../components/HistoryView";
import { MiniCalendar } from "../components/MiniCalendar";
import { HubifyRoleSelect } from "../components/HubifyRoleSelect";
import { I, B, CARD, MK, MC, eng, gps, L, GRP, CustomDropdown, htmlToPlainText } from "../data";
import { ChevronDown, AlertCircle, Megaphone, Eye, Users, Heart, MessageCircle, Send, Bookmark, MousePointerClick, RefreshCw, Archive, Play, Link, Share2, Plus, GripVertical, FileText, Image as ImageIcon, CheckCircle, Video, Smartphone, Copy, Check, Info, MoreVertical, Search, Lock, Shield, AtSign, Settings, Settings2, Trash2 } from "lucide-react";
import * as Utils from "./utils";

export function MobileView({ ctx }: { ctx: any }) {
${destructure}

${renderMobileViewCode.replace('const renderMobileView = () => {', '').slice(0, -1)}
}
`;
fs.writeFileSync('src/ContentModal/MobileView.tsx', mobileContent);

// 4. ContentModal/DesktopView.tsx
const desktopContent = `
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip } from "../components/Tooltip";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import TextareaAutosize from "react-textarea-autosize";
import { RichTextEditor } from "../RichTextEditor";
import { HistoryChangeItem } from "../components/HistoryChangeItem";
import { HistoryView } from "../components/HistoryView";
import { MiniCalendar } from "../components/MiniCalendar";
import { HubifyRoleSelect } from "../components/HubifyRoleSelect";
import { I, B, CARD, MK, MC, eng, gps, L, GRP, CustomDropdown, htmlToPlainText } from "../data";
import { ChevronDown, AlertCircle, Megaphone, Eye, Users, Heart, MessageCircle, Send, Bookmark, MousePointerClick, RefreshCw, Archive, Play, Link, Share2, Plus, GripVertical, FileText, Image as ImageIcon, CheckCircle, Video, Smartphone, Copy, Check, Info, MoreVertical, Search, Lock, Shield, AtSign, Settings, Settings2, Trash2 } from "lucide-react";
import * as Utils from "./utils";

export function DesktopView({ ctx }: { ctx: any }) {
${destructure}

${desktopViewCode}
}
`;
fs.writeFileSync('src/ContentModal/DesktopView.tsx', desktopContent);

// 5. ContentModal/index.tsx
const indexContent = `
import React from "react";
import { useContentModalLogic } from "./useContentModalLogic";
import { MobileView } from "./MobileView";
import { DesktopView } from "./DesktopView";

export function ContentModal(props: any) {
  const ctx = useContentModalLogic(props);
  if (ctx.isMobile) {
    return <MobileView ctx={ctx} />;
  }
  return <DesktopView ctx={ctx} />;
}
`;
fs.writeFileSync('src/ContentModal/index.tsx', indexContent);

console.log("Splitting generated 2.");
