
import { HistoryChangeItem } from "./HistoryChangeItem";
import { HistoryView } from "./HistoryView";
import { Tooltip } from "./Tooltip";
import { DebouncedInput, DebouncedTextarea } from "./DebouncedInput";
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
import { MiniCalendar } from "./MiniCalendar";
import { HubifyRoleSelect } from "./HubifyRoleSelect";
import React from "react";
import { Trash, Send, Globe, Check, Link2, ExternalLink, Search, UserCheck, X, ChevronDown, AlertCircle, Megaphone, Eye, Users, Heart, MessageCircle, Bookmark, MousePointerClick, RefreshCw, Archive, Play, Link, Share2, Plus, GripVertical, FileText, Image as ImageIcon, CheckCircle, Video, Smartphone, Copy, Info, MoreVertical, Lock, Shield, AtSign, Settings, Settings2, Trash2 } from "lucide-react";
import { I, B, CARD, MK, MC, eng, gps, L, GRP, CustomDropdown, htmlToPlainText } from "../data";
import { MessageSquare, Layout, Leaf, Sparkles, ArrowUp, ArrowDown, AlertTriangle, Zap, Calendar, Clock, Flag, Paperclip, FolderOpen, BarChart2, DollarSign, RefreshCcw, Maximize2, PanelRight } from "lucide-react";
import { fmt } from "../data";
import { GeminiIcon, LoadingDots, getMetricIcon, formatMetricKey, ADS_CATEGORIES, DEFAULT_FIELDS, getFieldIcon, getFieldTranslation, getAssetLinks, getSosmedLinks, getLinkHostLabel } from "../utils/contentModalHelpers";

import { useContentModal } from "../ContentModalContext";
export function ContentModalMobileView() {
const ctx = useContentModal();
const {
  aiTokenLimit, lang, d, setD, aiResult, setAiResult, aiLoading, setAiLoading, captionLoading, setCaptionLoading, isSaving, setIsSaving, isRefreshing, setIsRefreshing, handleRefresh, docRef, docSnap, freshData, editorProfiles, setEditorProfiles, fetchProfiles, next, missingIds, showWarning, setShowWarning, isShaking, setIsShaking, showExitConfirm, setShowExitConfirm, hourError, setHourError, minuteError, setMinuteError, productionHourError, setProductionHourError, productionMinuteError, setProductionMinuteError, isReaderMode, setIsReaderMode, editingFieldLeft, setEditingFieldLeftState, calendarOpen, setCalendarOpen, editingFieldRight, setEditingFieldRightState, activeFieldRef, isMobile, setIsMobile, showHistory, setShowHistory, handleResize, originalTitle, openSections, setOpenSections, showResolvedInSection, setShowResolvedInSection, unsubscribe, data, handleAddSectionComment, authorName, updatedComments, handleResolveComment, handleReopenComment, renderSectionCommentBadge, commentsList, count, isOpen, renderInlineCommentThread, sectionComments, unresolvedComments, resolvedComments, showResolved, val, txtEl, isReady, setIsReady, timer, showShareDropdown, setShowShareDropdown, shareDropdownRef, handleShareClick, copiedBrief, setCopiedBrief, copiedCaption, setCopiedCaption, copiedSharedLink, setCopiedSharedLink, shareTab, setShareTab, shareSearch, setShareSearch, shareSearchLoading, setShareSearchLoading, shareSearchError, setShareSearchError, shareSearchSuccess, setShareSearchSuccess, selectedRoleForNewUser, setSelectedRoleForNewUser, currentUser, getUserContentRole, uid, email, username, isWsOwnerOrAdmin, isWsEditor, isDocOwner, sharedUsers, matched, userRole, canManageShare, canEdit, canComment, isSharedWithCommentAccess, showCommentUI, setEditingFieldLeft, setEditingFieldRight, layoutMode, setLayoutMode, activeTab, setActiveTab, copiedFields, setCopiedFields, showLayoutConfig, setShowLayoutConfig, layoutScope, setLayoutScope, localToast, setLocalToast, showToast, layoutFields, setLayoutFields, savedFields, merged, dRef, CheckIcon, handleHourChange, valStr, timeFormat, minHour, maxHour, handleProductionHourChange, handleFormatChange, newFormat, oldFormat, handleMinuteChange, handleProductionMinuteChange, debounceRef, currentD, savedData, activePillar, headerBg, getTranslucentColor, activePillarColor, activePlatformOption, name, activePlatformColor, activeContentTypeOption, activeContentTypeColor, activePicOption, activePicColor, activeStatusOption, activeStatusColor, handleShareSearch, qStr, uRef, q, cleanUsername, found, handleAddSharedUser, currentShared, newUser, nextShared, nextSharedUids, nextEditorUids, nextCommenterUids, handleUpdateSharedUserRole, handleRemoveSharedUser, handleUpdateLinkAccessRole, titleRef, objectiveRef, briefRef, captionRef, focusTarget, setFocusTarget, isDirty, len, set, setM, ts, handleClose, addCustomField, updateCustomField, arr, removeCustomField, analyzeContent, prompt, errMsg, getInitialLayoutFields, saveLayoutSettings, updatedD, workspaceRef, renderLayoutConfigPanel, getFieldDescription, applyPreset, updated, isFieldVisible, temp, reloaded, renderDynamicField, id, label, icon, placeholder, translatedLabel, translatedPlaceholder, fieldValue, isEditing, handleCopy, isCopied, renderAiButton, generateCaption, hasFeature, handleRefImg, file, reader, modalScrollRef, isRightScrolled, setIsRightScrolled, handleRightScroll, isNew, canArchive, canDelete, modal, workspace, userProfile, planDetails, onSave, onClose, onArchive, onRestore, onDelete, onDuplicate, pillars, platforms, contentTypes, pics, statuses, onSettingUpdate
} = ctx;


  
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        transition={{ duration: 0.2 }} 
        onClick={handleClose} 
        style={{
          position:"fixed",inset:0,
          background:"rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display:"flex",
          alignItems:"flex-end",
          justifyContent:"center",
          zIndex:99999,
          willChange: "opacity, filter"
        }}
      >
        <motion.div 
          id="content-brief-modal-card-mobile"
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }} 
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          onClick={e=>e.stopPropagation()} 
          style={{
            background: "#FAFAFA",
            backgroundColor: "#FAFAFA",
            borderRadius: "24px 24px 0 0",
            width:"100%",
            height: "92vh",
            position:"relative",
            boxShadow: "0 -10px 40px rgba(0,0,0,0.15)", 
            display: "flex", 
            flexDirection: "column",
            overflow: "hidden",
            opacity: 1
          }}
        >
          {showHistory ? <HistoryView isMobile={isMobile} setShowHistory={setShowHistory} lang={lang} d={d} onClose={onClose} workspaceId={workspace?.id} editorProfiles={editorProfiles} planDetails={planDetails} /> : (<>
          {/* Toast Notification */}
          <AnimatePresence>
            {localToast && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                style={{
                  position: "absolute",
                  top: 70,
                  left: "50%",
                  x: "-50%",
                  background: localToast.type === "success" ? "#10B981" : localToast.type === "error" ? "#EF4444" : "#3B82F6",
                  color: "#FFFFFF",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  zIndex: 9999,
                  pointerEvents: "none",
                  whiteSpace: "nowrap"
                }}
              >
                {localToast.type === "success" && <Check size={12} strokeWidth={3} />}
                {localToast.type === "error" && <AlertTriangle size={12} />}
                {localToast.type === "info" && <Sparkles size={12} />}
                {localToast.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "#FFFFFF",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            zIndex: 50
          }}>
            <button 
              onClick={handleClose} 
              style={{
                background: "rgba(0,0,0,0.03)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4B5563",
                cursor: "pointer"
              }}
            >
              <X size={18} />
            </button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#111827", letterSpacing: "-0.2px" }}>
                {d.isHubAiDraft ? "Draf Konten AI" : (isNew ? "Buat Konten" : "Brief Konten")}
              </span>
              {isSaving && (
                <span style={{ fontSize: 9, color: "#3B82F6", fontWeight: 700 }} className="animate-pulse">
                  {lang === "id" ? "Menyimpan otomatis..." : "Autosaving..."}
                </span>
              )}
            </div>
            <button 
              onClick={async () => {
                isDirty.current = false;
                const newD = { ...dRef.current, manuallySaved: true };
                setD(newD);
                dRef.current = newD;
                await onSave(newD, true);
                onClose();
              }} 
              style={{
                background: "#2563EB",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.2)"
              }}
            >
              {lang === "id" ? "Simpan" : "Save"}
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px 120px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            
            {/* Title Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
              <DebouncedTextarea disabled={!canEdit} 
                ref={titleRef}
                value={d.title} 
                onChange={(e)=>set("title",e.target.value)} 
                minRows={1}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "22px",
                  fontWeight: 800, 
                  letterSpacing: "-0.5px",
                  color: "#111827",
                  width: "100%",
                  outline: "none",
                  padding: 0, 
                  resize: "none", 
                  lineHeight: 1.25, 
                  wordBreak: "break-word"
                }} 
                placeholder={lang === "id" ? "Judul Konten..." : "Content Title..."}
              />
            </div>

            {/* Properties List (Notion Style, Beautifully integrated for mobile) */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: "18px",
              padding: "16px",
              border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Detail & Properti
              </span>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Zap size={14} style={{ color: "#D97706" }} />
                    Status
                  </div>
                  {editingFieldLeft === "status" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} value={d.status} options={statuses} prefix="" onChange={(v)=>{set("status", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({statuses: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { statuses: renames } } : {})})} 
                        style={{ padding: "4px 8px", fontSize: 11, fontWeight: 700, background: getTranslucentColor(activeStatusColor, "15"), color: activeStatusColor, borderRadius: 8, border: "none" }} />
                    </div>
                  ) : (
                    <div onClick={() => canEdit && setEditingFieldLeft("status")} style={{ background: getTranslucentColor(activeStatusColor, "15"), padding: "4px 10px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: activeStatusColor }}>
                        {d.status || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* PIC */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Users size={14} style={{ color: "#2563EB" }} />
                    PIC / Assign
                  </div>
                  {editingFieldLeft === "pic" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} multiple={true} value={d.pic} options={pics} prefix="" onChange={(v)=>{set("pic", Array.isArray(v) ? v.join(", ") : v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({pics: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { pics: renames } } : {})})} 
                        style={{ width: "100%", padding: "4px 8px", fontSize: 12, fontWeight: 600, background: "transparent", color: "#111827", borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div onClick={() => canEdit && setEditingFieldLeft("pic")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: d.pic ? "#111827" : "rgba(0,0,0,0.4)" }}>
                        {d.pic || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Jadwal Produksi */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Calendar size={14} style={{ color: "#10B981" }} />
                    Jadwal Produksi
                  </div>
                  {editingFieldLeft === "productionDate" ? (
                    <div ref={activeFieldRef} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.03)", borderRadius: 8, padding: "2px 6px" }}>
                      <div style={{ position: "relative", zIndex: 99999 }}>
                        <button 
                          onClick={() => setCalendarOpen(prev => prev === "production" ? null : "production")}
                          style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", outline: "none", cursor: "pointer", padding: "4px 0", minWidth: 70 }}
                        >
                          {d.productionYear ? `${String(d.productionDay).padStart(2, '0')}/${String(d.productionMonth).padStart(2, '0')}/${d.productionYear}` : "Pilih..."}
                        </button>
                        <AnimatePresence>
                          {calendarOpen === "production" && (
                            <MiniCalendar alignRight={true} 
                              date={{ year: d.productionYear, month: d.productionMonth, day: d.productionDay }}
                              onChange={(date: any) => { set("productionYear", date.year); set("productionMonth", date.month); set("productionDay", date.day); }}
                              onClose={() => setCalendarOpen(null)}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      <DebouncedInput disabled={!canEdit} type="number" min={d.timeFormat === '24H' ? 0 : 1} max={d.timeFormat === '24H' ? 23 : 12} value={d.productionHour !== undefined && d.productionHour !== null ? d.productionHour : ""} onChange={handleProductionHourChange} 
                        style={{ background: "rgba(0,0,0,0.05)", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", width: 20, textAlign: "center", outline: "none", padding: "1px 0", borderRadius: 4 }} placeholder="00" />
                      <span style={{color:"#111827", fontWeight: 700, fontSize: 11}}>:</span>
                      <DebouncedInput disabled={!canEdit} type="number" min={0} max={59} step={5} value={d.productionMinute !== undefined && d.productionMinute !== null ? d.productionMinute : ""} onChange={handleProductionMinuteChange} 
                        style={{ background: "rgba(0,0,0,0.05)", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", width: 20, textAlign: "center", outline: "none", padding: "1px 0", borderRadius: 4 }} placeholder="00" />
                    </div>
                  ) : (
                    <div onClick={() => canEdit && setEditingFieldLeft("productionDate")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: (d.productionDay && d.productionMonth && d.productionYear) ? "#4B5563" : "rgba(0,0,0,0.4)" }}>
                        {d.productionDay && d.productionMonth && d.productionYear ? `${String(d.productionDay).padStart(2,'0')}/${String(d.productionMonth).padStart(2,'0')} (${String(d.productionHour || 0).padStart(2,'0')}:${String(d.productionMinute || 0).padStart(2,'0')})` : (lang === "id" ? "Atur..." : "Set...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Jadwal Upload */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Clock size={14} style={{ color: "#3B82F6" }} />
                    Jadwal Upload
                  </div>
                  {editingFieldLeft === "uploadDate" ? (
                    <div ref={activeFieldRef} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.03)", borderRadius: 8, padding: "2px 6px" }}>
                      <div style={{ position: "relative", zIndex: 99999 }}>
                        <button 
                          onClick={() => setCalendarOpen(prev => prev === "upload" ? null : "upload")}
                          style={{ background: "transparent", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", outline: "none", cursor: "pointer", padding: "4px 0", minWidth: 70 }}
                        >
                          {d.year ? `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}` : "Pilih..."}
                        </button>
                        <AnimatePresence>
                          {calendarOpen === "upload" && (
                            <MiniCalendar alignRight={true} 
                              date={{ year: d.year, month: d.month, day: d.day }}
                              onChange={(date: any) => { set("year", date.year); set("month", date.month); set("day", date.day); }}
                              onClose={() => setCalendarOpen(null)}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      <DebouncedInput disabled={!canEdit} type="number" min={d.timeFormat === '24H' ? 0 : 1} max={d.timeFormat === '24H' ? 23 : 12} value={d.uploadHour !== undefined && d.uploadHour !== null ? d.uploadHour : ""} onChange={handleHourChange} 
                        style={{ background: "rgba(0,0,0,0.05)", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", width: 20, textAlign: "center", outline: "none", padding: "1px 0", borderRadius: 4 }} placeholder="00" />
                      <span style={{color:"#111827", fontWeight: 700, fontSize: 11}}>:</span>
                      <DebouncedInput disabled={!canEdit} type="number" min={0} max={59} step={5} value={d.uploadMinute !== undefined && d.uploadMinute !== null ? d.uploadMinute : ""} onChange={handleMinuteChange} 
                        style={{ background: "rgba(0,0,0,0.05)", border: "none", fontSize: 11, fontWeight: 600, color: "#111827", width: 20, textAlign: "center", outline: "none", padding: "1px 0", borderRadius: 4 }} placeholder="00" />
                    </div>
                  ) : (
                    <div onClick={() => canEdit && setEditingFieldLeft("uploadDate")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: (d.day && d.month && d.year) ? "#4B5563" : "rgba(0,0,0,0.4)" }}>
                        {d.day && d.month && d.year ? `${String(d.day).padStart(2,'0')}/${String(d.month).padStart(2,'0')} (${String(d.uploadHour || 0).padStart(2,'0')}:${String(d.uploadMinute || 0).padStart(2,'0')})` : (lang === "id" ? "Atur..." : "Set...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pillar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Flag size={14} style={{ color: activePillarColor }} />
                    Pillar
                  </div>
                  {editingFieldLeft === "pillar" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} value={d.pillar} options={pillars} prefix="" onChange={(v)=>{set("pillar", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({pillars: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { pillars: renames } } : {})})} 
                        style={{ padding: "4px 8px", fontSize: 11, fontWeight: 600, background: "rgba(0,0,0,0.04)", color: "#4b5563", borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div onClick={() => canEdit && setEditingFieldLeft("pillar")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>
                        {d.pillar || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Platform */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Paperclip size={14} style={{ color: "#EC4899" }} />
                    Platform
                  </div>
                  {editingFieldLeft === "platform" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} value={d.platform} options={platforms} prefix="" onChange={(v)=>{set("platform", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({platforms: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { platforms: renames } } : {})})}
                        style={{ padding: "4px 8px", fontSize: 11, fontWeight: 600, background: "transparent", color: "#4b5563", borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div onClick={() => canEdit && setEditingFieldLeft("platform")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>
                        {d.platform || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tipe Konten */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <FileText size={14} style={{ color: activeContentTypeColor }} />
                    Tipe Konten
                  </div>
                  {editingFieldLeft === "contentType" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <CustomDropdown alignRight={true} dark={false} value={d.contentType} options={contentTypes} prefix="" onChange={(v)=>{set("contentType", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({contentTypes: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { contentTypes: renames } } : {})})} 
                        style={{ padding: "4px 8px", fontSize: 11, fontWeight: 700, background: getTranslucentColor(activeContentTypeColor, "15"), color: activeContentTypeColor, borderRadius: 8 }} />
                    </div>
                  ) : (
                    <div onClick={() => canEdit && setEditingFieldLeft("contentType")} style={{ background: getTranslucentColor(activeContentTypeColor, "15"), padding: "4px 10px", borderRadius: "8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: activeContentTypeColor }}>
                        {d.contentType || (lang === "id" ? "Pilih..." : "Select...")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Referensi */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4B5563", fontSize: 12, fontWeight: 600 }}>
                    <Link size={14} style={{ color: "#3B82F6" }} />
                    Referensi
                  </div>
                  {editingFieldLeft === "assetLink" ? (
                    <div ref={activeFieldRef} style={{ width: "55%" }}>
                      <DebouncedInput disabled={!canEdit} type="text" value={d.assetLink || ""} onChange={(e:any)=>set("assetLink", e.target.value)} placeholder={lang === "id" ? "Tautkan..." : "Link..."} style={{ background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 500, color: "#111827", width: "100%", padding: "4px 8px" }} autoFocus />
                    </div>
                  ) : (
                    <div onClick={() => canEdit && setEditingFieldLeft("assetLink")} style={{ padding: "4px 10px", background: "rgba(0,0,0,0.03)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: d.assetLink ? "#2563EB" : "rgba(0,0,0,0.4)" }}>
                        {d.assetLink ? (lang === "id" ? "Buka Link" : "Open Link") : (lang === "id" ? "Tautkan..." : "Link...")}
                      </span>
                      {d.assetLink && <ExternalLink size={10} style={{ color: "#2563EB" }} />}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Analysis Result Panel (if exists) */}
            {aiResult && (
              <div style={{
                background: "rgba(227, 242, 253, 0.4)",
                border: "1px solid rgba(187, 222, 251, 0.6)",
                borderRadius: "18px",
                padding: "16px",
                boxShadow: "0 4px 12px rgba(30,136,229,0.04)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#1E88E5", display: "flex", alignItems: "center", gap: 6 }}>
                    <GeminiIcon size={14} />
                    AI Content Analysis
                  </span>
                  <button onClick={() => setAiResult("")} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer", color: "#1E88E5" }}>&times;</button>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: "#2C3E50", whiteSpace: "pre-wrap" }}><Markdown>{aiResult}</Markdown></div>
              </div>
            )}

            {/* Segmented Control Tab Selector (Apple style, 100% width) */}
            <div style={{ 
              display: "flex", background: "rgba(0,0,0,0.04)", padding: "3px", boxSizing: "border-box",
              borderRadius: "12px", width: "100%", height: "38px", position: "relative"
            }}>
              <motion.div
                layout
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                style={{
                  position: "absolute",
                  top: 3,
                  bottom: 3,
                  borderRadius: "10px",
                  background: "#FFFFFF",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  width: "calc((100% - 6px) / 3)",
                  left: activeTab === "draft" ? 3 : activeTab === "refs" ? "calc(((100% - 6px) / 3) + 3px)" : "calc(((100% - 6px) / 3 * 2) + 3px)",
                  zIndex: 0
                }}
              />
              {[
                { id: "draft", label: lang === "id" ? "Brief Konten" : "Brief Content" },
                { id: "refs", label: lang === "id" ? "Aset" : "Assets" },
                { id: "metrics", label: lang === "id" ? "Metrik" : "Metrics" }
              ].map(({ id, label }) => (
                <button 
                  key={id}
                  onClick={(e) => { e.preventDefault(); setActiveTab(id as any); }}
                  style={{
                    flex: 1,
                    padding: "0",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "transparent",
                    color: activeTab === id ? "#000000" : "rgba(0,0,0,0.5)",
                    boxShadow: "none",
                    transition: "color 0.2s",
                    position: "relative",
                    zIndex: 1
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab contents (Render the specific selected tab view) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* TAB 1: BRIEF & CONTENT */}
              {activeTab === "draft" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {lang === "id" ? "Panduan & Salinan Konten" : "Guidelines & Copy"}
                    </span>
                    <button
                      onClick={() => setShowLayoutConfig(!showLayoutConfig)}
                      style={{
                        background: showLayoutConfig ? "rgba(166, 124, 28, 0.08)" : "rgba(0,0,0,0.03)",
                        border: "none",
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 10,
                        fontWeight: 700,
                        color: showLayoutConfig ? "#A67C1C" : "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Settings size={12} />
                      {showLayoutConfig ? "Tutup" : "Kolom"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showLayoutConfig && renderLayoutConfigPanel()}
                  </AnimatePresence>

                  {layoutFields
                    .filter(f => f.visible !== false)
                    .map(field => renderDynamicField(field))}
                </div>
              )}

              {/* TAB 2: ASSETS & REFERENCES */}
              {activeTab === "refs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Tautan Aset
                    </span>
                    
                    {/* Link Aset Final & Folder */}
                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <FolderOpen size={13} style={{ color: "#2563EB" }} /> {lang === "id" ? "Link Aset" : "Asset Links"}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = getAssetLinks(dRef.current);
                            set("assetLinks", [...current, ""]);
                          }}
                          style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                        >
                          + Tambah Link
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {getAssetLinks(d).map((lnk: string, idx: number) => (
                          <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input disabled={!canEdit}
                              value={lnk}
                              onChange={(e: any) => {
                                const arr = [...getAssetLinks(dRef.current)];
                                arr[idx] = e.target.value;
                                set("assetLinks", arr);
                              }}
                              style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 13 }}
                              placeholder="https://drive.google.com/..."
                            />
                            {lnk.trim() !== "" && (
                              <a
                                href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka link"
                                style={{ color: "#2563EB", padding: "4px 6px", display: "flex", alignItems: "center" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            {getAssetLinks(d).length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const arr = getAssetLinks(dRef.current).filter((_: any, i: number) => i !== idx);
                                  set("assetLinks", arr.length ? arr : [""]);
                                }}
                                style={{ background: "none", border: "none", color: "#EF4444", fontWeight: 700, padding: "0 6px", cursor: "pointer" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Link Postingan Sosmed */}
                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <Link size={13} style={{ color: "#2563EB" }} /> {lang === "id" ? "Link Postingan" : "Post Links"}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = getSosmedLinks(dRef.current);
                            set("sosmedLinks", [...current, ""]);
                          }}
                          style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                        >
                          + Tambah Link
                        </button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {getSosmedLinks(d).map((lnk: string, idx: number) => (
                          <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input disabled={!canEdit}
                              value={lnk}
                              onChange={(e: any) => {
                                const arr = [...getSosmedLinks(dRef.current)];
                                arr[idx] = e.target.value;
                                set("sosmedLinks", arr);
                              }}
                              style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 13 }}
                              placeholder="https://instagram.com/p/..."
                            />
                            {lnk.trim() !== "" && (
                              <a
                                href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka link"
                                style={{ color: "#2563EB", padding: "4px 6px", display: "flex", alignItems: "center" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            {getSosmedLinks(d).length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const arr = getSosmedLinks(dRef.current).filter((_: any, i: number) => i !== idx);
                                  set("sosmedLinks", arr.length ? arr : [""]);
                                }}
                                style={{ background: "none", border: "none", color: "#EF4444", fontWeight: 700, padding: "0 6px", cursor: "pointer" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Bahan Referensi & Catatan
                    </span>

                    <div style={GRP}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 4, display: "block" }}>{lang === "id" ? "Catatan Referensi" : "Reference Notes"}</label>
                      <DebouncedTextarea disabled={!canEdit} value={d.referenceText} onChange={(e:any)=>set("referenceText",e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 13, minHeight: 80 } as any} minRows={3} placeholder={lang === "id" ? "Referensi, mood, visual..." : "Reference details..."}/>
                    </div>

                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", margin: 0 }}>{lang === "id" ? "Daftar Link Referensi" : "Reference Link List"}</label>
                        <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks",[...(dRef.current.referenceLinks||[]),""]); }} style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>+ Tambah</button>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(d.referenceLinks||[]).map((lnk:string, i:number)=>(
                          <div key={i} style={{ display: "flex", gap: 6 }}>
                            <DebouncedInput disabled={!canEdit} value={lnk} onChange={(e:any)=>set("referenceLinks", dRef.current.referenceLinks.map((l:any,idx:number)=>idx===i?e.target.value:l))} style={{ flex: 1, background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12 }} placeholder="https://..."/>
                            <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks", dRef.current.referenceLinks.filter((_:any,idx:number)=>idx!==i)); }} style={{ background: "none", border: "none", color: "#EF4444", fontWeight: 700, padding: "0 6px" }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={GRP}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 4, display: "block" }}>{lang === "id" ? "Gambar Referensi" : "Reference Image"}</label>
                      <input disabled={!canEdit} type="file" accept="image/*" onChange={handleRefImg} style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", width: "100%" }}/>
                      {d.referenceImage && (
                        <div style={{ marginTop: 10, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)" }}>
                          <img src={d.referenceImage} alt="ref" style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}/>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PERFORMANCE METRICS */}
              {activeTab === "metrics" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Custom Fields Card */}
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                        <Plus size={14} /> Field Kustom
                      </span>
                      <button onClick={(e)=>{ e.stopPropagation(); set("customFields",[...(d.customFields||[]),{name: lang === "id" ? "Label Baru" : "New Field",value:""}]); setEditingFieldRight("customField_"+((d.customFields?.length||0))); }} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 8, background: "rgba(0,0,0,0.03)", border: "none", color: "#111827", fontWeight: 700 }}>+ Field</button>
                    </div>

                    {(d.customFields||[]).length === 0 ? (
                      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", textAlign: "center", padding: "10px 0" }}>Belum ada custom fields.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(d.customFields||[]).map((cf:any, idx:number)=>(
                          <div key={idx} onClick={() => setEditingFieldRight("customField_"+idx)} style={{ background: "rgba(0,0,0,0.02)", padding: "12px", borderRadius: 12, position: "relative" }}>
                            {editingFieldRight === "customField_"+idx ? (
                              <div ref={activeFieldRef} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <DebouncedInput disabled={!canEdit} autoFocus value={cf.name} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,name:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", width: "100%", padding: 0 }} placeholder="Nama Field..."/>
                                  <button onClick={(e)=>{ e.stopPropagation(); set("customFields", d.customFields.filter((_:any,i:number)=>i!==idx)); setEditingFieldRight(null); }} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 14, fontWeight: 700, padding: "0 4px" }}>✕</button>
                                </div>
                                <DebouncedTextarea disabled={!canEdit} value={cf.value} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,value:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#111827", width: "100%", padding: 0, resize: "none" }} minRows={1} placeholder="Isi field..."/>
                              </div>
                            ) : (
                              <>
                                <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", marginBottom: 4 }}>{cf.name || `Kolom ${idx+1}`}</div>
                                <div style={{ fontSize: 13, color: "#111827", whiteSpace: "pre-wrap" }}>{cf.value || "-"}</div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Organic & Ads Report Card */}
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(0,0,0,0.04)",
                    borderRadius: 18,
                    padding: "16px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}><BarChart2 size={12} /> Metrik Performa</span>
                      {d.metricsUpdatedAt && <span style={{ fontSize: 9, color: "rgba(0,0,0,0.4)" }}>{d.metricsUpdatedAt}</span>}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {/* Organic reach */}
                      <div style={{ background: "rgba(59,130,246,0.03)", border: "1px solid rgba(59,130,246,0.06)", borderRadius: 14, padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", marginBottom: 8, display: "flex", alignItems: "center" }}><Leaf size={14} style={{ marginRight: 4 }} /> Organik</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                          {MK.map((k:string) => (
                            <div onClick={() => setEditingFieldRight("metric_"+k)} key={k} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.02)", padding: "6px 8px", borderRadius: 8 }}>
                              {getMetricIcon(k, MC[k]||"#3B82F6", 13)}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 8, color: "rgba(0,0,0,0.4)", textTransform: "capitalize", lineHeight: 1.1, marginBottom: 1 }}>{formatMetricKey(k)}</div>
                                {editingFieldRight === "metric_"+k ? (
                                  <input disabled={!canEdit} 
                                    ref={activeFieldRef}
                                    autoFocus
                                    type="number" 
                                    min={0} 
                                    placeholder="0" 
                                    value={d.metrics[k] === 0 ? "" : (d.metrics[k] !== undefined && d.metrics[k] !== null ? d.metrics[k] : "")} 
                                    onChange={(e:any)=>setM(k,e.target.value)} 
                                    onKeyDown={(e) => e.key === "Enter" && setEditingFieldRight(null)}
                                    style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: 12, fontWeight: 800, color: "#111827", padding: 0 }}
                                  />
                                ) : (
                                  <div style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>{fmt(d.metrics[k] || 0)}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: "1px dashed rgba(59,130,246,0.15)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "space-between" }}>
                            <span>Total Interaksi:</span>
                            <strong style={{ color: "#3B82F6" }}>{fmt(eng(d.metrics))}</strong>
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "space-between" }}>
                            <span>Engagement Rate:</span>
                            <strong style={{ color: "#3B82F6" }}>{(d.metrics?.reach || 0) > 0 ? ((eng(d.metrics) / d.metrics.reach) * 100).toFixed(2) : 0}%</strong>
                          </div>
                        </div>
                      </div>

                      {/* Paid Campaign Results */}
                      <div style={{ background: d.isAds ? "rgba(156,43,78,0.03)" : "rgba(0,0,0,0.01)", border: d.isAds ? "1px solid rgba(156,43,78,0.06)" : "1px dashed rgba(0,0,0,0.06)", borderRadius: 14, padding: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#9C2B4E", display: "flex", alignItems: "center" }}><DollarSign size={14} style={{ marginRight: 4 }} /> Iklan (Ads)</span>
                          <button onClick={(e)=>{ e.stopPropagation(); set("isAds",!d.isAds); }} style={{ width: 32, height: 18, borderRadius: 9, border: "none", cursor: "pointer", background: d.isAds ? "#9C2B4E" : "rgba(0,0,0,0.15)", position: "relative" }}>
                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: d.isAds ? 16 : 2, transition: "left .2s" }}/>
                          </button>
                        </div>

                        {d.isAds ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {ADS_CATEGORIES.map(cat => (
                              <div key={cat.title}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: "#9C2B4E", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{cat.title}</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                  {cat.keys.map(k => (
                                    <div onClick={() => setEditingFieldRight("adsMetric_"+k)} key={k} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(156,43,78,0.02)", padding: "5px 8px", borderRadius: 8 }}>
                                      {getMetricIcon(k, "#9C2B4E", 13)}
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 8, color: "rgba(0,0,0,0.4)", textTransform: "capitalize", lineHeight: 1.1, marginBottom: 1 }}>{formatMetricKey(k)}</div>
                                        {editingFieldRight === "adsMetric_"+k ? (
                                          <input disabled={!canEdit} 
                                            ref={activeFieldRef}
                                            autoFocus
                                            type={k === "audience" ? "text" : "number"} 
                                            min={k === "audience" ? undefined : 0} 
                                            value={d.adsMetrics?.[k] === 0 && k !== "audience" ? "" : (d.adsMetrics?.[k] !== undefined && d.adsMetrics?.[k] !== null ? d.adsMetrics[k] : "")} 
                                            onChange={(e:any)=>setM(k,e.target.value,true)} 
                                            onKeyDown={(e) => e.key === "Enter" && setEditingFieldRight(null)}
                                            style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: 11, fontWeight: 800, color: "#111827", padding: 0 }}
                                          />
                                        ) : (
                                          <div style={{ fontSize: 11, fontWeight: 800, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {k === "audience" ? (d.adsMetrics?.[k] || "-") : fmt((d.adsMetrics || {})[k] || 0)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>Kampanye berbayar dinonaktifkan.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Sharing Panel moved to Bottom Sheet format for visibility */}

          </div>

          {/* Sticky Mobile Footer Action Bar */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#FFFFFF",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            padding: "12px 16px 24px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 100
          }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {(d.lastEditedBy || (d.history && d.history.length > 0)) && (
                <span onClick={() => {
                const hDays = planDetails?.capabilities?.historyDays ?? 0;
                if (hDays === 0) {
                  alert(lang === 'id' ? 'Upgrade paket untuk melihat riwayat edit.' : 'Upgrade plan to view edit history.');
                  return;
                }
                setShowHistory(true);
              }} style={{ fontSize: 10, color: "#9CA3AF", fontStyle: "italic", cursor: "pointer", maxWidth: 140, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {lang === "id" ? "diedit terakhir oleh" : "last edited by"} {d.lastEditorName || (d.history && d.history[0]?.editorName) || "User"} {lang === "id" ? "pada" : "at"} {new Date(d.lastEditedAt || (d.history && d.history[0]?.timestamp)).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" })}, {new Date(d.lastEditedAt || (d.history && d.history[0]?.timestamp)).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              <Tooltip text={lang === "id" ? "Muat Ulang (Refresh)" : "Refresh"} position="top">
                <button onClick={handleRefresh} disabled={isRefreshing} style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.03)", border: "none", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", opacity: isRefreshing ? 0.5 : 1, cursor: isRefreshing ? "not-allowed" : "pointer" }}>
                  <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                </button>
              </Tooltip>
              {onDuplicate && (
                <Tooltip text="Duplikasi" position="top"><button onClick={()=>onDuplicate(d)}  style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.03)", border: "none", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center" }}><Copy size={16} /></button></Tooltip>
              )}
              {d.archived ? (
                <Tooltip text="Pulihkan" position="top"><button onClick={()=>onRestore(d.id)}  style={{ width: 40, height: 40, borderRadius: 12, background: "#E8F5E9", border: "none", color: "#2E7D32", display: "flex", alignItems: "center", justifyContent: "center" }}><RefreshCcw size={16} /></button></Tooltip>
              ) : (
                canArchive && (
                  <Tooltip text="Arsipkan" position="top"><button onClick={()=>onArchive(d.id)}  style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.03)", border: "none", color: "#4B5563", display: "flex", alignItems: "center", justifyContent: "center" }}><Archive size={16} /></button></Tooltip>
                )
              )}
              {canDelete && (
                <Tooltip text="Hapus" position="top"><button onClick={()=>onDelete(d.id)}  style={{ width: 40, height: 40, borderRadius: 12, background: "#FEF2F2", border: "none", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash size={16} /></button></Tooltip>
              )}
            </div>

            <button
              onClick={() => setShowShareDropdown(!showShareDropdown)}
              style={{
                background: showShareDropdown ? "#2563EB" : "rgba(37,99,235,0.08)",
                color: showShareDropdown ? "#FFFFFF" : "#2563EB",
                border: "none",
                borderRadius: "12px",
                padding: "10px 18px",
                fontSize: "12px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Send size={14} />
              {lang === "id" ? "Bagikan" : "Share"}
            </button>
          </div>

          {/* Confirm exit prompt for AI draft */}
          <AnimatePresence>
            {showExitConfirm && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding: 16}} onClick={e=>e.stopPropagation()}>
                 <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} style={{background:"#FFFFFF",padding:24,borderRadius:24,maxWidth:320,width:"100%",boxShadow:"0 12px 30px rgba(0,0,0,0.15)",textAlign:"center"}}>
                    <h3 style={{margin:"0 0 12px",fontSize:18,color:"#111827", fontWeight:800}}>Hapus Draf?</h3>
                    <p style={{margin:"0 0 20px",fontSize:13,color:"#4B5563",lineHeight:1.4}}>
                       Draf konten AI ini belum disimpan. Yakin ingin menutupnya? Draf ini akan hilang sepenuhnya.
                    </p>
                    <div style={{display:"flex",gap:10}}>
                       <button onClick={() => onClose()} style={{flex:1,padding:"10px 14px",background:"transparent",border:"1px solid rgba(0,0,0,0.1)",color:"#111827",borderRadius:12,fontWeight:700,fontSize:12}}>
                          Hapus
                       </button>
                       <button onClick={() => setShowExitConfirm(false)} style={{flex:1,padding:"10px 14px",background:"#2563EB",border:"none",color:"white",borderRadius:12,fontWeight:700,fontSize:12}}>
                          Lanjutkan
                       </button>
                    </div>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Backdrop for mobile share bottom sheet */}
          <AnimatePresence>
            {showShareDropdown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowShareDropdown(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(15, 23, 42, 0.4)",
                  zIndex: 209,
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)"
                }}
              />
            )}
          </AnimatePresence>

</>)}

          {/* Mobile Bottom Sheet Sharing Panel */}
          <AnimatePresence>
            {showShareDropdown && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "#FFFFFF",
                  borderTopLeftRadius: "28px",
                  borderTopRightRadius: "28px",
                  padding: "20px 20px calc(24px + env(safe-area-inset-bottom, 0px)) 20px",
                  boxShadow: "0 -10px 40px rgba(0,0,0,0.15)",
                  zIndex: 210,
                  maxHeight: "85vh",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                {/* Drag Handle Indicator */}
                <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.1)", borderRadius: 2, margin: "0 auto 16px auto", flexShrink: 0 }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontSize: 14, fontWeight: 800 }}>
                    <Globe size={16} style={{ color: "#2563EB" }} /> {lang === "id" ? "Pengaturan Berbagi" : "Share Settings"}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowShareDropdown(false)} 
                    style={{ 
                      border: "none", 
                      background: "rgba(0,0,0,0.03)", 
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16, 
                      fontWeight: 700, 
                      color: "#4B5563",
                      cursor: "pointer" 
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Segmented Tab Control */}
                <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.04)", padding: 2, borderRadius: 8, marginBottom: 16, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setShareTab("public")}
                    style={{
                      flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "none",
                      background: shareTab === "public" ? "#FFFFFF" : "transparent",
                      color: shareTab === "public" ? "#2563eb" : "#4b5563",
                      boxShadow: shareTab === "public" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {lang === "id" ? "Tautan Publik" : "Public Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareTab("users")}
                    style={{
                      flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "none",
                      background: shareTab === "users" ? "#FFFFFF" : "transparent",
                      color: shareTab === "users" ? "#2563eb" : "#4b5563",
                      boxShadow: shareTab === "users" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {lang === "id" ? "Kirim ke Pengguna" : "Send to Users"}
                  </button>
                </div>
                {shareTab === "public" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none", background: "rgba(0,0,0,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)" }}>
                        <input disabled={!canEdit}
                          type="checkbox"
                          checked={!!d.isPublic}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            set("isPublic", isChecked);
                            if (!isChecked) {
                              set("allowComments", false);
                            }
                          }}
                          style={{ width: 16, height: 16, accentColor: "#2563eb", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                          {lang === "id" ? "Aktifkan Link Publik" : "Enable Public Link"}
                        </span>
                      </label>

                      {d.isPublic && (
                        <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none", background: "rgba(0,0,0,0.02)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)" }}>
                          <input disabled={!canEdit}
                            type="checkbox"
                            checked={d.allowComments !== false}
                            onChange={(e) => set("allowComments", e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: "#2563eb", flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                            {lang === "id" ? "Izinkan Komentar" : "Allow Comments"}
                          </span>
                        </label>
                      )}
                    </div>

                    {d.isPublic && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", gap: 4, alignItems: "center", background: "rgba(0,0,0,0.03)", padding: "10px 14px", borderRadius: 12 }}>
                          <input disabled={!canEdit}
                            type="text"
                            readOnly
                            value={`${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`}
                            style={{ background: "transparent", border: "none", outline: "none", fontSize: 11, color: "#4B5563", width: "100%", fontFamily: "monospace" }}
                          />
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const shareUrl = `${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`;
                              navigator.clipboard.writeText(shareUrl);
                              setCopiedSharedLink(true);
                              setTimeout(() => setCopiedSharedLink(false), 2000);
                            }}
                            style={{
                              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              background: "#2563eb", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "12px", fontSize: "12px", fontWeight: 800, cursor: "pointer"
                            }}
                          >
                            {copiedSharedLink ? (
                              <>
                                <Check size={14} /> {lang === "id" ? "Disalin!" : "Copied!"}
                              </>
                            ) : (
                              <>
                                <Link2 size={14} /> {lang === "id" ? "Salin Link" : "Copy Link"}
                              </>
                            )}
                          </button>

                          <a
                            href={`${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              background: "rgba(0,0,0,0.04)", color: "#111827", border: "none", borderRadius: 12, padding: "12px", fontSize: "12px", fontWeight: 800, textDecoration: "none"
                            }}
                          >
                            <ExternalLink size={14} /> {lang === "id" ? "Buka" : "Open"}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : canManageShare ? (<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", letterSpacing: "0.2px" }}>{lang === "id" ? "Masukkan username atau email" : "Enter username or email"}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <Search size={14} style={{ position: "absolute", left: 12, top: 12, color: "rgba(0,0,0,0.4)" }} />
                        <input disabled={!canEdit}
                          type="text"
                          value={shareSearch}
                          onChange={(e) => setShareSearch(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleShareSearch()}
                          placeholder={lang === "id" ? "username atau email" : "username or email"}
                          style={{ width: "100%", background: "rgba(0,0,0,0.03)", border: "none", borderRadius: 12, padding: "10px 12px 10px 34px", fontSize: 13, fontWeight: 500, outline: "none" }}
                        />
                      </div>
                      <button type="button" onClick={handleShareSearch} disabled={shareSearchLoading || !shareSearch.trim()} style={{ background: "#2563eb", color: "#FFFFFF", border: "none", borderRadius: 12, padding: "0 16px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>{shareSearchLoading ? "..." : (lang === "id" ? "Cari" : "Search")}</button>
                    </div>

                    {shareSearchError && <div style={{ fontSize: 12, color: "#e11d48", fontWeight: 700 }}>{shareSearchError}</div>}

                    {shareSearchSuccess && (
                      <div style={{ background: "rgba(37, 99, 235, 0.04)", border: "1.5px dashed rgba(37, 99, 235, 0.2)", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563eb", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {String(shareSearchSuccess.fullName || shareSearchSuccess.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <div style={{ overflow: "hidden", flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#111827", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareSearchSuccess.fullName || shareSearchSuccess.email}</div>
                            <div style={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>@{shareSearchSuccess.username}</div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, borderTop: "1px dashed rgba(37, 99, 235, 0.15)", paddingTop: 8 }}>
                          <HubifyRoleSelect
                            value={selectedRoleForNewUser}
                            onChange={(role) => setSelectedRoleForNewUser(role)}
                            compact={true}
                            align="left"
                          />
                          <button type="button" onClick={() => handleAddSharedUser(shareSearchSuccess)} style={{ background: "#2563eb", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>{lang === "id" ? "Bagikan Akses" : "Share Access"}</button>
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 8, letterSpacing: "0.2px" }}>{lang === "id" ? `Memiliki Akses (${(d.sharedUsers || []).length})` : `Has Access (${(d.sharedUsers || []).length})`}</div>
                      {(!d.sharedUsers || d.sharedUsers.length === 0) ? (
                        <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>{lang === "id" ? "Belum ada pengguna." : "No users yet."}</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                          {(d.sharedUsers || []).map((u: any) => (
                            <div key={u.uid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.02)", borderRadius: 10, padding: "8px 12px" }}>
                              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{u.fullName || u.email}</span>
                                {u.username && <span style={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>@{u.username}</span>}
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {canManageShare ? (
                                  <HubifyRoleSelect
                                    value={(u.role || "viewer") as any}
                                    onChange={(role) => handleUpdateSharedUserRole(u.uid, role)}
                                    compact={true}
                                    align="right"
                                  />
                                ) : (
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    background: u.role === "editor" ? "#eff6ff" : u.role === "commenter" ? "#fefce8" : "rgba(0,0,0,0.04)",
                                    color: u.role === "editor" ? "#2563eb" : u.role === "commenter" ? "#ca8a04" : "#374151"
                                  }}>
                                    {u.role === "editor" ? "Editor" : u.role === "commenter" ? (lang === "id" ? "Komentator" : "Commenter") : (lang === "id" ? "Pelihat" : "Viewer")}
                                  </span>
                                )}

                                {canManageShare && (
                                  <button type="button" onClick={() => handleRemoveSharedUser(u.uid)} style={{ background: "none", border: "none", color: "#e11d48", display: "flex", alignItems: "center", cursor: "pointer" }}><X size={14}/></button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
}
