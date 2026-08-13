
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
export function ContentModalDesktopView() {
const ctx = useContentModal();
const {
  aiTokenLimit, lang, d, setD, aiResult, setAiResult, aiLoading, setAiLoading, captionLoading, setCaptionLoading, isSaving, setIsSaving, isRefreshing, setIsRefreshing, handleRefresh, docRef, docSnap, freshData, editorProfiles, setEditorProfiles, fetchProfiles, next, missingIds, showWarning, setShowWarning, isShaking, setIsShaking, showExitConfirm, setShowExitConfirm, hourError, setHourError, minuteError, setMinuteError, productionHourError, setProductionHourError, productionMinuteError, setProductionMinuteError, isReaderMode, setIsReaderMode, editingFieldLeft, setEditingFieldLeftState, calendarOpen, setCalendarOpen, editingFieldRight, setEditingFieldRightState, activeFieldRef, isMobile, setIsMobile, showHistory, setShowHistory, handleResize, originalTitle, openSections, setOpenSections, showResolvedInSection, setShowResolvedInSection, unsubscribe, data, handleAddSectionComment, authorName, updatedComments, handleResolveComment, handleReopenComment, renderSectionCommentBadge, commentsList, count, isOpen, renderInlineCommentThread, sectionComments, unresolvedComments, resolvedComments, showResolved, val, txtEl, isReady, setIsReady, timer, showShareDropdown, setShowShareDropdown, shareDropdownRef, handleShareClick, copiedBrief, setCopiedBrief, copiedCaption, setCopiedCaption, copiedSharedLink, setCopiedSharedLink, shareTab, setShareTab, shareSearch, setShareSearch, shareSearchLoading, setShareSearchLoading, shareSearchError, setShareSearchError, shareSearchSuccess, setShareSearchSuccess, selectedRoleForNewUser, setSelectedRoleForNewUser, currentUser, getUserContentRole, uid, email, username, isWsOwnerOrAdmin, isWsEditor, isDocOwner, sharedUsers, matched, userRole, canManageShare, canEdit, canComment, isSharedWithCommentAccess, showCommentUI, setEditingFieldLeft, setEditingFieldRight, layoutMode, setLayoutMode, activeTab, setActiveTab, copiedFields, setCopiedFields, showLayoutConfig, setShowLayoutConfig, layoutScope, setLayoutScope, localToast, setLocalToast, showToast, layoutFields, setLayoutFields, savedFields, merged, dRef, CheckIcon, handleHourChange, valStr, timeFormat, minHour, maxHour, handleProductionHourChange, handleFormatChange, newFormat, oldFormat, handleMinuteChange, handleProductionMinuteChange, debounceRef, currentD, savedData, activePillar, headerBg, getTranslucentColor, activePillarColor, activePlatformOption, name, activePlatformColor, activeContentTypeOption, activeContentTypeColor, activePicOption, activePicColor, activeStatusOption, activeStatusColor, handleShareSearch, qStr, uRef, q, cleanUsername, found, handleAddSharedUser, currentShared, newUser, nextShared, nextSharedUids, nextEditorUids, nextCommenterUids, handleUpdateSharedUserRole, handleRemoveSharedUser, handleUpdateLinkAccessRole, titleRef, objectiveRef, briefRef, captionRef, focusTarget, setFocusTarget, isDirty, len, set, setM, ts, handleClose, addCustomField, updateCustomField, arr, removeCustomField, analyzeContent, prompt, errMsg, getInitialLayoutFields, saveLayoutSettings, updatedD, workspaceRef, renderLayoutConfigPanel, getFieldDescription, applyPreset, updated, isFieldVisible, temp, reloaded, renderDynamicField, id, label, icon, placeholder, translatedLabel, translatedPlaceholder, fieldValue, isEditing, handleCopy, isCopied, renderAiButton, generateCaption, hasFeature, handleRefImg, file, reader, modalScrollRef, isRightScrolled, setIsRightScrolled, handleRightScroll, isNew, canArchive, canDelete, modal, workspace, userProfile, planDetails, onSave, onClose, onArchive, onRestore, onDelete, onDuplicate, pillars, platforms, contentTypes, pics, statuses, onSettingUpdate
} = ctx;


  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.2, ease: "easeInOut" }} 
      onClick={handleClose} 
      style={{
        position:"fixed",inset:0,
        background:"rgba(0,0,0,0.5)",
        display:"flex",
        alignItems: layoutMode === "drawer" ? "stretch" : "center",
        justifyContent: layoutMode === "drawer" ? "flex-end" : "center",
        zIndex:99999,
        padding: layoutMode === "drawer" ? 0 : 16,
        willChange: "opacity"
      }}>
      <motion.div 
        id="content-brief-modal-card"
        initial={layoutMode === "drawer" ? { x: "100%", opacity: 0.85 } : { scale: 0.96, opacity: 0, y: 12 }} 
        animate={layoutMode === "drawer" ? { x: 0, opacity: 1 } : { scale: 1, opacity: 1, y: 0 }} 
        exit={layoutMode === "drawer" ? { x: "100%", opacity: 0.85 } : { scale: 0.96, opacity: 0, y: 12 }} 
        transition={layoutMode === "drawer" 
          ? { type: "spring", damping: 32, stiffness: 280, mass: 0.9 } 
          : { type: "spring", damping: 26, stiffness: 320, mass: 0.9 }
        }
        onClick={e=>e.stopPropagation()} 
        style={{
          background: "#ffffff", 
          borderTop: layoutMode === "drawer" ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
          borderRight: layoutMode === "drawer" ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
          borderBottom: layoutMode === "drawer" ? "1px solid transparent" : "1px solid rgba(0,0,0,0.08)",
          borderLeft: layoutMode === "drawer" ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(0,0,0,0.08)",
          borderRadius: layoutMode === "drawer" ? "24px 0 0 24px" : "24px",
          maxWidth: "1050px",
          width:"100%",
          height: layoutMode === "drawer" ? "100%" : "90vh",
          position:"relative",
          boxShadow: layoutMode === "drawer" ? "-10px 0 30px rgba(0,0,0,0.05)" : "0 12px 30px rgba(0,0,0,0.05)", 
          display: "flex", flexDirection: "column",
          willChange: "transform, opacity",
          transform: "translate3d(0,0,0)"
        }}
      >
        {showHistory ? <HistoryView isMobile={isMobile} setShowHistory={setShowHistory} lang={lang} d={d} onClose={onClose} workspaceId={workspace?.id} editorProfiles={editorProfiles} planDetails={planDetails} /> : (<>
        {/* Toast Notification */}
        <AnimatePresence>
          {localToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              style={{
                position: "absolute",
                top: 24,
                left: "50%",
                x: "-50%",
                background: localToast.type === "success" ? "#10B981" : localToast.type === "error" ? "#EF4444" : "#3B82F6",
                color: "#FFFFFF",
                padding: "10px 20px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 700,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                zIndex: 9999,
                pointerEvents: "none"
              }}
            >
              {localToast.type === "success" && <Check size={14} strokeWidth={3} />}
              {localToast.type === "error" && <AlertTriangle size={14} />}
              {localToast.type === "info" && <Sparkles size={14} />}
              {localToast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Controls */}
        <div style={{position: "absolute", top: 32, right: 32, display: "flex", alignItems: "center", gap: "8px", zIndex: 50}}>
          <button 
            onClick={(e) => { e.stopPropagation(); setLayoutMode(p => p === "center" ? "drawer" : "center"); }}
            title="Ubah Tampilan Mode (Popup / Drawer)"
            style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:14,color:"#444",display:"flex",alignItems:"center",justifyContent:"center", transition: "background 0.2s"}}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          >
            {layoutMode === "drawer" ? <Maximize2 size={14}/> : <PanelRight size={14}/>}
          </button>
          <button 
            className="hover-scale" 
            onClick={handleClose} 
            style={{background:"rgba(0,0,0,0.05)",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:20,fontWeight: 500, color:"#444",display:"flex",alignItems:"center",justifyContent:"center", transition: "background 0.2s"}}
            onMouseOver={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"}
            onMouseOut={(e: any) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
          >
            ×
          </button>
        </div>
        <div style={{display: "flex", flexDirection: "row", flex: 1, overflow: "hidden"}}>
            {/* LEFT COLUMN: IDENTITAS & SETTINGS */}
            <div style={{ 
              width: "380px", 
              padding: "32px 28px 250px 28px", 
              flexShrink: 0, 
              display: "flex", 
              flexDirection: "column", 
              gap: "16px", 
              background: "transparent",
              borderRight: "1px solid rgba(0,0,0,0.08)", 
              overflowY: "auto" 
            }}>
          
          
          {/* Title Area */}
          <div 
            style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", position: "relative" }}
          >
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8, width: "100%"}}>
                  <motion.div 
                    animate={isShaking && (!d.title || !String(d.title).trim()) ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }} 
                    transition={{ duration: 0.5 }}
                    style={{width: "100%"}}
                  >
                     <DebouncedTextarea disabled={!canEdit} 
                        ref={titleRef}
                        value={d.title} 
                        onChange={(e)=>set("title",e.target.value)} 
                        minRows={1}
                        style={{background:"transparent",border:"none",fontSize:40,fontWeight:900, letterSpacing:"-1.2px",color:"#111827",width:"100%",outline:"none",padding:0, resize: "none", overflow: "hidden", lineHeight: 1.1, wordBreak: "break-word", whiteSpace: "pre-wrap"}} 
                        placeholder={lang === "id" ? "Ketik Judul Konten..." : "Type Content Title..."}/>
                  </motion.div>
              </div>

              {/* PROPERTIES (NOTION STYLE) */}
              <div style={{display: "flex", flexDirection: "column", gap: 14, width: "100%", marginTop: 8}}>
                 
                 {/* Item: Status */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Zap size={14}/> Status
                    </div>
                    {editingFieldLeft === "status" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown alignRight={true} dark={false} value={d.status} options={statuses} prefix="" onChange={(v)=>{set("status", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({statuses: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { statuses: renames } } : {})})} 
                          style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, background: getTranslucentColor(activeStatusColor, "20"), color: activeStatusColor, border: "1px solid rgba(44,32,22,0.15)", boxShadow: "none", borderRadius: 6 }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => canEdit && setEditingFieldLeft("status")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 12, fontWeight: 700, color: activeStatusColor, background: getTranslucentColor(activeStatusColor, "20"), padding: "4px 10px", borderRadius: 6, display: "inline-block"}}>
                          {d.status || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Pilih Status..." : "Select Status..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: PIC / Assign */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Users size={14}/> PIC / Assign
                    </div>
                    {editingFieldLeft === "pic" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown alignRight={true} dark={false} multiple={true} value={d.pic} options={pics} prefix="" onChange={(v)=>{set("pic", Array.isArray(v) ? v.join(", ") : v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({pics: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { pics: renames } } : {})})} 
                          style={{ width: "100%", padding: "4px 8px", fontSize: 13, fontWeight: 600, background: "transparent", color: "#111827", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, boxShadow: "none" }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => canEdit && setEditingFieldLeft("pic")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer", 
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 13, fontWeight: 600, color: "#111827", display: "inline-block", maxWidth: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                          {d.pic || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Ketik atau pilih PIC..." : "Type or select PIC..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Jadwal Produksi */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Calendar size={14}/> {lang === "id" ? "Jadwal Produksi" : "Production Schedule"}
                    </div>
                    {editingFieldLeft === "productionDate" ? (
                      <div ref={activeFieldRef} style={{flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap"}}>
                        <div style={{display: "flex", alignItems: "center", gap: 4, background: "#FFF", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, padding: "4px 8px"}}>
                          <div style={{ position: "relative", zIndex: 99999 }}>
                            <button 
                              onClick={() => setCalendarOpen(prev => prev === "production2" ? null : "production2")}
                              style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", outline: "none", cursor: "pointer", padding: "2px 0", minWidth: 80, textAlign: "left" }}
                            >
                              {d.productionYear ? `${String(d.productionDay).padStart(2, '0')}/${String(d.productionMonth).padStart(2, '0')}/${d.productionYear}` : "Pilih..."}
                            </button>
                            <AnimatePresence>
                              {calendarOpen === "production2" && (
                                <MiniCalendar alignRight={true} 
                                  date={{ year: d.productionYear, month: d.productionMonth, day: d.productionDay }}
                                  onChange={(date: any) => { set("productionYear", date.year); set("productionMonth", date.month); set("productionDay", date.day); }}
                                  onClose={() => setCalendarOpen(null)}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                          <DebouncedInput disabled={!canEdit} type="number" min={d.timeFormat === '24H' ? 0 : 1} max={d.timeFormat === '24H' ? 23 : 12} value={d.productionHour !== undefined && d.productionHour !== null ? d.productionHour : ""} onChange={handleProductionHourChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                          <span style={{color:"#111827", fontWeight: 700, fontSize: 13}}>:</span>
                          <DebouncedInput disabled={!canEdit} type="number" min={0} max={59} step={5} value={d.productionMinute !== undefined && d.productionMinute !== null ? d.productionMinute : ""} onChange={handleProductionMinuteChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => canEdit && setEditingFieldLeft("productionDate")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 13, fontWeight: 500, color: (d.productionDay && d.productionMonth && d.productionYear) ? "#4b5563" : "rgba(44,32,22,0.4)"}}>
                          {d.productionDay && d.productionMonth && d.productionYear ? `${String(d.productionDay).padStart(2,'0')}/${String(d.productionMonth).padStart(2,'0')}/${d.productionYear} (${String(d.productionHour !== undefined && d.productionHour !== null ? d.productionHour : 0).padStart(2,'0')}:${String(d.productionMinute !== undefined && d.productionMinute !== null ? d.productionMinute : 0).padStart(2,'0')})` : <span style={{fontStyle: "italic"}}>{lang === "id" ? "Atur tanggal produksi..." : "Set production date..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Jadwal Upload */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Calendar size={14}/> {lang === "id" ? "Jadwal Upload" : "Publish Schedule"}
                    </div>
                    {editingFieldLeft === "uploadDate" ? (
                      <div ref={activeFieldRef} style={{flex: 1, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap"}}>
                        <div style={{display: "flex", alignItems: "center", gap: 4, background: "#FFF", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, padding: "4px 8px"}}>
                          <div style={{ position: "relative", zIndex: 99999 }}>
                            <button 
                              onClick={() => setCalendarOpen(prev => prev === "upload2" ? null : "upload2")}
                              style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", outline: "none", cursor: "pointer", padding: "2px 0", minWidth: 80, textAlign: "left" }}
                            >
                              {d.year ? `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}` : "Pilih..."}
                            </button>
                            <AnimatePresence>
                              {calendarOpen === "upload2" && (
                                <MiniCalendar alignRight={true} 
                                  date={{ year: d.year, month: d.month, day: d.day }}
                                  onChange={(date: any) => { set("year", date.year); set("month", date.month); set("day", date.day); }}
                                  onClose={() => setCalendarOpen(null)}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                          <DebouncedInput disabled={!canEdit} type="number" min={d.timeFormat === '24H' ? 0 : 1} max={d.timeFormat === '24H' ? 23 : 12} value={d.uploadHour !== undefined && d.uploadHour !== null ? d.uploadHour : ""} onChange={handleHourChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                          <span style={{color:"#111827", fontWeight: 700, fontSize: 13}}>:</span>
                          <DebouncedInput disabled={!canEdit} type="number" min={0} max={59} step={5} value={d.uploadMinute !== undefined && d.uploadMinute !== null ? d.uploadMinute : ""} onChange={handleMinuteChange} 
                            style={{ background: "rgba(0,0,0,0.04)", border: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: 28, textAlign: "center", outline: "none", padding: "2px 0", borderRadius: 4 }} placeholder="00" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => canEdit && setEditingFieldLeft("uploadDate")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 13, fontWeight: 500, color: (d.day && d.month && d.year) ? "#4b5563" : "rgba(44,32,22,0.4)"}}>
                          {d.day && d.month && d.year ? `${String(d.day).padStart(2,'0')}/${String(d.month).padStart(2,'0')}/${d.year} (${String(d.uploadHour !== undefined && d.uploadHour !== null ? d.uploadHour : 0).padStart(2,'0')}:${String(d.uploadMinute !== undefined && d.uploadMinute !== null ? d.uploadMinute : 0).padStart(2,'0')})` : <span style={{fontStyle: "italic"}}>{lang === "id" ? "Atur tanggal upload..." : "Set publish date..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Pillar */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Flag size={14}/> Pillar
                    </div>
                    {editingFieldLeft === "pillar" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown alignRight={true} dark={false} value={d.pillar} options={pillars} prefix="" onChange={(v)=>{set("pillar", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({pillars: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { pillars: renames } } : {})})} 
                          style={{ padding: "4px 8px", fontSize: 12, fontWeight: 600, background: "rgba(0,0,0,0.06)", color: "#4b5563", border: "1px solid rgba(44, 32, 22, 0.15)", borderRadius: 6, boxShadow: "none" }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => canEdit && setEditingFieldLeft("pillar")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 12, fontWeight: 600, color: "#4b5563", background: "rgba(0,0,0,0.06)", padding: "4px 10px", borderRadius: 6, display: "inline-block"}}>
                          {d.pillar || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Pilih pillar..." : "Select pillar..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Platform */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Paperclip size={14}/> Platform
                    </div>
                    {editingFieldLeft === "platform" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown alignRight={true} dark={false} value={d.platform} options={platforms} prefix="" onChange={(v)=>{set("platform", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({platforms: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { platforms: renames } } : {})})}
                          style={{ padding: "4px 8px", fontSize: 12, fontWeight: 600, background: "transparent", color: "#4b5563", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, boxShadow: "none" }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => canEdit && setEditingFieldLeft("platform")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 12, fontWeight: 600, color: "#4b5563", display: "inline-block"}}>
                          {d.platform || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Pilih platform..." : "Select platform..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Content Type / Type */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <FileText size={14}/> {lang === "id" ? "Tipe Konten" : "Content Type"}
                    </div>
                    {editingFieldLeft === "contentType" ? (
                      <div ref={activeFieldRef} style={{flex: 1}}>
                        <CustomDropdown alignRight={true} dark={false} value={d.contentType} options={contentTypes} prefix="" onChange={(v)=>{set("contentType", v);}} initiallyOpen={true} onClose={() => setEditingFieldLeft(null)} onUpdateOptions={(opts, renames) => onSettingUpdate && onSettingUpdate({contentTypes: opts, ...(renames && Object.keys(renames).length > 0 ? { renames: { contentTypes: renames } } : {})})} 
                          style={{ padding: "4px 10px", fontSize: 12, fontWeight: 600, background: getTranslucentColor(activeContentTypeColor, "20"), color: activeContentTypeColor, border: "1px solid rgba(44,32,22,0.15)", boxShadow: "none", borderRadius: 6 }} />
                      </div>
                    ) : (
                      <div 
                        onClick={() => canEdit && setEditingFieldLeft("contentType")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28
                        }}
                        className="hover:bg-black/5"
                      >
                        <span style={{fontSize: 12, fontWeight: 700, color: activeContentTypeColor, background: getTranslucentColor(activeContentTypeColor, "20"), padding: "4px 10px", borderRadius: 6, display: "inline-block"}}>
                          {d.contentType || <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontWeight: 400}}>{lang === "id" ? "Pilih tipe..." : "Select type..."}</span>}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Item: Referensi */}
                 <div style={{display: "flex", minHeight: 28, alignItems: "center"}}>
                    <div style={{width: 140, display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 500, flexShrink: 0}}>
                        <Link size={14}/> {lang === "id" ? "Referensi" : "Reference"}
                    </div>
                    {editingFieldLeft === "assetLink" ? (
                      <div ref={activeFieldRef} style={{flex: 1, display: "flex", alignItems: "center", gap: 6}}>
                        <DebouncedInput disabled={!canEdit} type="text" value={d.assetLink || ""} onChange={(e:any)=>set("assetLink", e.target.value)} placeholder={lang === "id" ? "Tautkan link referensi..." : "Link reference..."} style={{background: "#FFF", border: "1px solid rgba(44,32,22,0.15)", borderRadius: 6, outline: "none", fontSize: 13, fontWeight: 500, color: "#111827", width: "100%", padding: "4px 8px"}} autoFocus />
                      </div>
                    ) : (
                      <div 
                        onClick={() => canEdit && setEditingFieldLeft("assetLink")}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", cursor: "pointer",
                          padding: "4px 8px", borderRadius: 6, transition: "background 0.2s",
                          minHeight: 28, gap: 6
                        }}
                        className="hover:bg-black/5"
                      >
                        {d.assetLink ? (
                          <>
                            <span style={{fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "underline", display: "inline-block", maxWidth: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}}>
                              {lang === "id" ? "Link Referensi" : "Reference Link"}
                            </span>
                            <a href={d.assetLink} target="_blank" rel="noopener noreferrer" style={{color: "#2563eb", display: "flex", alignItems: "center"}} onClick={(e) => e.stopPropagation()}>
                              <ExternalLink size={14} />
                            </a>
                          </>
                        ) : (
                          <span style={{color: "rgba(44,32,22,0.4)", fontStyle: "italic", fontSize: 13}}>{lang === "id" ? "Tautkan referensi..." : "Link reference..."}</span>
                        )}
                      </div>
                    )}
                 </div>



              </div>
          </div>
          
{/* AI Analysis Result Section if exists */}
          {aiResult && (
            <div style={{background:"rgba(227, 242, 253, 0.4)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", border:"1px solid rgba(187, 222, 251, 0.6)", borderRadius:12, padding:16, boxShadow:"0 4px 12px rgba(30,136,229,0.08)", marginTop: aiResult ? 0 : 0}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                <span style={{fontSize:12, fontWeight:700, color:"#1E88E5", display:"flex", alignItems:"center", gap:6}}>
                    <GeminiIcon size={14} />
                    AI Content Analysis
                </span>
                <button onClick={()=>setAiResult("")} style={{border:"none", background:"transparent", fontSize:16, cursor:"pointer", color:"#1E88E5"}}>&times;</button>
              </div>
              <div style={{fontSize:12, lineHeight:1.6, color:"#2C3E50", whiteSpace:"pre-wrap"}}><Markdown>{aiResult}</Markdown></div>
            </div>
          )}
          
            </div>
            {/* RIGHT COLUMN: MAIN CONTENT */}
            <div ref={modalScrollRef} onScroll={handleRightScroll} style={{ 
              flex: 1, 
              padding: "0 32px 32px 32px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "16px", 
              background: "transparent", 
              overflowY: "scroll",
              position: "relative"
            }}>

          {/* Removed single mode banner transition flow to place mode switch in the footer */}

          <div style={{
            position: "sticky",
            top: 0,
            paddingTop: 32,
            paddingBottom: 16,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            pointerEvents: "none"
          }}>
            {/* APPLE-LIKE SEGMENTED CONTROL */}
            <div style={{ 
              display: "flex", background: "rgba(0,0,0,0.05)", padding: "2px", boxSizing: "border-box",
              borderRadius: "10px", width: "100%", maxWidth: "450px", marginTop: 0, marginBottom: 0, height: "32px", position: "relative",
              pointerEvents: "auto"
            }}>
            <motion.div
              layout
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              style={{
                position: "absolute",
                top: 2,
                bottom: 2,
                borderRadius: "8px",
                background: "#FFFFFF",
                boxShadow: isRightScrolled ? "0 8px 24px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)" : "0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04)",
                width: "calc((100% - 4px) / 3)",
                left: activeTab === "draft" ? 2 : activeTab === "refs" ? "calc(((100% - 4px) / 3) + 2px)" : "calc(((100% - 4px) / 3 * 2) + 2px)",
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
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "transparent",
                  color: activeTab === id ? "#000000" : "rgba(0,0,0,0.6)",
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
          </div>

          {!isReady ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", height: 504, opacity: 0.6 }} className="animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.06)", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(44,32,22,0.06)" }} />
                    <div style={{ width: 80, height: 12, borderRadius: 4, background: "rgba(44,32,22,0.06)" }} />
                  </div>
                  <div style={{ width: "100%", height: n === 2 ? 140 : 60, borderRadius: 10, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.06)" }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
              
              {/* TAB DRAFT (Objective, Brief, Caption, and customizable layout fields) */}
              {activeTab === "draft" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                  
                  {/* CONFIG BUTTON BAR */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {lang === "id" ? "Panduan & Salinan Konten" : "Guidelines & Copy"}
                    </span>
                    <button
                      onClick={() => setShowLayoutConfig(!showLayoutConfig)}
                      style={{
                        background: showLayoutConfig ? "rgba(166, 124, 28, 0.1)" : "rgba(44,32,22,0.04)",
                        border: showLayoutConfig ? "1px solid rgba(166, 124, 28, 0.2)" : "1px solid rgba(44,32,22,0.05)",
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: showLayoutConfig ? "#A67C1C" : "rgba(44,32,22,0.6)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <Settings size={12} />
                      {showLayoutConfig ? (lang === "id" ? "Tutup Pengaturan" : "Close Layout") : (lang === "id" ? "Atur Kolom" : "Configure Columns")}
                    </button>
                  </div>

                  {/* Render the config drawer */}
                  <AnimatePresence>
                    {showLayoutConfig && renderLayoutConfigPanel()}
                  </AnimatePresence>

                  {/* Render all visible fields according to the saved layout order */}
                  {layoutFields
                    .filter(f => f.visible !== false)
                    .map(field => renderDynamicField(field))}
                </div>
              )}

            {/* TAB REFS (Cloud Links & Resources) */}
            {activeTab === "refs" && (
              editingFieldRight === "refs" ? (
                <div ref={activeFieldRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Block 6: Asset Link & Social Media Link */}
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16
                  }}>
                    {/* Link Aset Final & Folder */}
                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <FolderOpen size={14} style={{ color: "#3B82F6" }} /> {lang === "id" ? "Link Aset" : "Asset Links"}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = getAssetLinks(dRef.current);
                            set("assetLinks", [...current, ""]);
                          }}
                          style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
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
                              style={{ ...I(), border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10, flex: 1 }}
                              placeholder="https://drive.google.com/..."
                            />
                            {lnk.trim() !== "" && (
                              <a
                                href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka link"
                                style={{ color: "#3B82F6", padding: "4px 6px", display: "flex", alignItems: "center" }}
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
                                style={{ background: "none", border: "none", color: "#9C2B4E", fontWeight: 700, padding: "0 6px", cursor: "pointer" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Link Upload / Postingan Sosmed */}
                    <div style={GRP}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(44,32,22,0.6)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                          <Link size={14} style={{ color: "#3B82F6" }} /> {lang === "id" ? "Link Postingan" : "Post Links"}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = getSosmedLinks(dRef.current);
                            set("sosmedLinks", [...current, ""]);
                          }}
                          style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
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
                              style={{ ...I(), border: "1px solid rgba(44,32,22,0.12)", borderRadius: 10, flex: 1 }}
                              placeholder="https://instagram.com/p/..."
                            />
                            {lnk.trim() !== "" && (
                              <a
                                href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka link"
                                style={{ color: "#3B82F6", padding: "4px 6px", display: "flex", alignItems: "center" }}
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
                                style={{ background: "none", border: "none", color: "#9C2B4E", fontWeight: 700, padding: "0 6px", cursor: "pointer" }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reference Section */}
                  <div style={{background:"rgba(44,32,22,0.03)",border:"1px solid rgba(44,32,22,0.08)",borderRadius:16,padding:"16px 20px",marginBottom:0}}>
                    <div style={{...L,marginBottom:8}}><Paperclip size={14} /> {lang === "id" ? "Referensi Konten" : "Content Reference"}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                      <div style={GRP}><label style={{...L,marginBottom:2}}>{lang === "id" ? "Catatan Referensi" : "Reference Notes"}</label><DebouncedTextarea disabled={!canEdit} value={d.referenceText} onChange={(e:any)=>set("referenceText",e.target.value)} style={I({resize:"vertical"})} minRows={3} placeholder={lang === "id" ? "Referensi, mood, arahan visual..." : "Reference, mood, visual direction..."}/></div>
                      <div style={GRP}>
                        <label style={{...L,marginBottom:2}}>{lang === "id" ? "Link Referensi" : "Reference Links"} <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks",[...(dRef.current.referenceLinks||[]),""]); }} style={{background:"none",border:"none",color:"#3B82F6",cursor:"pointer",fontSize:10}}>{lang === "id" ? "(+ Tambah)" : "(+ Add)"}</button></label>
                        {(d.referenceLinks||[]).map((lnk:string,i:number)=>(
                          <div key={i} style={{display:"flex",gap:4,marginBottom:4}}>
                            <DebouncedInput disabled={!canEdit} value={lnk} onChange={(e:any)=>set("referenceLinks", dRef.current.referenceLinks.map((l:any,idx:number)=>idx===i?e.target.value:l))} style={I()} placeholder="https://..."/>
                            <button onClick={(e)=>{ e.stopPropagation(); set("referenceLinks", dRef.current.referenceLinks.filter((_:any,idx:number)=>idx!==i)); }} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer"}}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={GRP}>
                      <label style={{...L,marginBottom:2}}>{lang === "id" ? "Upload Gambar Referensi" : "Upload Reference Image"}</label>
                      <input disabled={!canEdit} type="file" accept="image/*" onChange={handleRefImg} style={{fontSize:11,color:"rgba(44,32,22,0.5)"}}/>
                      {d.referenceImage&&<img src={d.referenceImage} alt="ref" style={{maxWidth:200,maxHeight:100,borderRadius:6,marginTop:6,border:"1px solid rgba(44,32,22,0.1)",objectFit:"contain"}}/>}
                    </div>
                  </div>
                </div>
              ) : (
                <div onClick={() => setEditingFieldRight("refs")} style={{ display: "flex", flexDirection: "column", gap: 16, cursor: "pointer" }} title="Klik di mana saja untuk mengedit Referensi">
                  <div style={{
                    background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                      <FolderOpen size={14} /> Tautan Aset
                    </div>

                    {(() => {
                      const validAsset = getAssetLinks(d).filter((l: string) => l.trim() !== "");
                      const validSosmed = getSosmedLinks(d).filter((l: string) => l.trim() !== "");
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {/* Asset Links Section */}
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(44,32,22,0.5)", marginBottom: 6, textTransform: "uppercase" }}>
                              Link Aset ({validAsset.length})
                            </div>
                            {validAsset.length > 0 ? (
                              <div style={{ display: "grid", gridTemplateColumns: validAsset.length > 1 ? "1fr 1fr" : "1fr", gap: 8 }}>
                                {validAsset.map((lnk: string, idx: number) => {
                                  const hostLabel = getLinkHostLabel(lnk, "Aset");
                                  return (
                                    <a
                                      key={idx}
                                      href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        textDecoration: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        background: "rgba(59,130,246,0.04)",
                                        border: "1px solid rgba(59,130,246,0.15)",
                                        borderRadius: 12,
                                        padding: "10px 14px",
                                        transition: "all 0.2s",
                                        minWidth: 0
                                      }}
                                    >
                                      <span style={{ fontSize: 16, color: "#3B82F6", flexShrink: 0, display: "flex", alignItems: "center" }}><FolderOpen size={16} /></span>
                                      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                          {hostLabel} {validAsset.length > 1 ? `#${idx + 1}` : ""}
                                        </div>
                                        <div style={{ fontSize: 10, color: "rgba(44,32,22,0.5)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                          {lnk}
                                        </div>
                                      </div>
                                      <ExternalLink size={12} style={{ color: "#3B82F6", flexShrink: 0 }} />
                                    </a>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 10, padding: "10px 14px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                                <FolderOpen size={14} style={{ flexShrink: 0 }} /> Link aset belum ditautkan.
                              </div>
                            )}
                          </div>

                          {/* Sosmed Links Section */}
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(44,32,22,0.5)", marginBottom: 6, textTransform: "uppercase" }}>
                              Link Postingan ({validSosmed.length})
                            </div>
                            {validSosmed.length > 0 ? (
                              <div style={{ display: "grid", gridTemplateColumns: validSosmed.length > 1 ? "1fr 1fr" : "1fr", gap: 8 }}>
                                {validSosmed.map((lnk: string, idx: number) => {
                                  const hostLabel = getLinkHostLabel(lnk, "Sosmed");
                                  return (
                                    <a
                                      key={idx}
                                      href={lnk.startsWith("http") ? lnk : `https://${lnk}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        textDecoration: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        background: "rgba(37,99,235,0.04)",
                                        border: "1px solid rgba(37,99,235,0.15)",
                                        borderRadius: 12,
                                        padding: "10px 14px",
                                        transition: "all 0.2s",
                                        minWidth: 0
                                      }}
                                    >
                                      <span style={{ fontSize: 16, color: "#2563EB", flexShrink: 0, display: "flex", alignItems: "center" }}><ExternalLink size={16} /></span>
                                      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                          {hostLabel} {validSosmed.length > 1 ? `#${idx + 1}` : ""}
                                        </div>
                                        <div style={{ fontSize: 10, color: "rgba(37,99,235,0.6)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                          {lnk}
                                        </div>
                                      </div>
                                      <ExternalLink size={12} style={{ color: "#2563EB", flexShrink: 0 }} />
                                    </a>
                                  );
                                })}
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 10, padding: "10px 14px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                                <ExternalLink size={14} style={{ flexShrink: 0 }} /> Belum live di sosmed.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {(d.referenceText || (d.referenceLinks && d.referenceLinks.filter((l:string)=>l.trim() !== "").length > 0) || d.referenceImage) ? (
                    <div style={{
                      background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                      borderRadius: 16,
                      padding: "16px 20px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                        <Paperclip size={14} /> Bahan Referensi Visual & Catatan
                      </div>
                      {d.referenceText && (
                        <div style={{ fontSize: 13, color: "#2C2016", lineHeight: 1.5, marginBottom: 8, padding: "12px 16px", background: "rgba(44,32,22,0.02)", borderRadius: 10 }}>
                          {d.referenceText}
                        </div>
                      )}
                      {d.referenceLinks && d.referenceLinks.filter((l:string)=>l.trim() !== "").length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: d.referenceImage ? 8 : 0 }}>
                          {d.referenceLinks.filter((l:string)=>l.trim() !== "").map((lnk:string, idx:number) => (
                            <a key={idx} href={lnk} target="_blank" rel="noreferrer" style={{ textDecoration: "none", fontSize: 11, color: "#3B82F6", background: "rgba(59,130,246,0.06)", padding: "4px 8px", borderRadius: 8, fontWeight: 600 }}>
                              <Link size={12} style={{marginRight: 4}}/> {lang === "id" ? `Link Referensi ${idx + 1}` : `Reference Link ${idx + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                      {d.referenceImage && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(44,32,22,0.5)" }}>{lang === "id" ? "Moodboard Inspirasi:" : "Inspiration Moodboard:"}</span>
                          <img src={d.referenceImage} alt="moodboard" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.7)", objectFit: "contain" }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(44,32,22,0.02)", border: "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: "12px 16px", color: "rgba(44,32,22,0.4)", fontSize: 11 }}>
                      <Paperclip size={14} style={{ flexShrink: 0 }} /> {lang === "id" ? "Belum ada data referensi. Klik untuk menambahkan..." : "No reference data yet. Click to add..."}
                    </div>
                  )}
                </div>
              )
            )}

            {/* TAB METRICS (Stats, Bento, ads) */}
            {activeTab === "metrics" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Item 7: Custom Fields Section */}
                <div style={{
                  background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"
                }}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}>
                      <Plus size={14} /> {lang === "id" ? "Bidang Kustom" : "Custom Fields"}
                    </div>
                    <button onClick={(e)=>{ e.stopPropagation(); set("customFields",[...(d.customFields||[]),{name: lang === "id" ? "Label Baru" : "New Field",value:""}]); setEditingFieldRight("customField_"+((d.customFields?.length||0))); }} style={{fontSize:10,padding:"4px 10px", borderRadius: 8, background: "rgba(44,32,22,0.05)", border: "none", color: "#2C2016", fontWeight: 600, cursor: "pointer"}}>{lang === "id" ? "+ Tambah Field" : "+ Add Field"}</button>
                  </div>
                  {(d.customFields||[]).length === 0 ? (
                    <div style={{ fontSize: 11, color: "rgba(44,32,22,0.4)", textAlign: "center", padding: "10px 0" }}>{lang === "id" ? "Belum ada custom fields." : "No custom fields yet."}</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {(d.customFields||[]).map((cf:any, idx:number)=>(
                        <div key={idx} onClick={() => setEditingFieldRight("customField_"+idx)} style={{ background: "rgba(44,32,22,0.02)", padding: "12px 16px", borderRadius: 10, position: "relative", cursor: "pointer" }}>
                          {editingFieldRight === "customField_"+idx ? (
                            <div ref={activeFieldRef} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <DebouncedInput disabled={!canEdit} autoFocus value={cf.name} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,name:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.5)", textTransform: "uppercase", width: "100%", padding: 0 }} placeholder={lang === "id" ? "Nama Field..." : "Field Name..."}/>
                                <button onClick={(e)=>{ e.stopPropagation(); set("customFields", d.customFields.filter((_:any,i:number)=>i!==idx)); setEditingFieldRight(null); }} style={{background:"none",border:"none",color:"#9C2B4E",cursor:"pointer", padding: "0 4px", fontSize: 14}}>✕</button>
                              </div>
                              <DebouncedTextarea disabled={!canEdit} value={cf.value} onChange={(e:any)=>set("customFields",d.customFields.map((f:any,i:number)=>i===idx?{...f,value:e.target.value}:f))} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#2C2016", width: "100%", padding: 0, resize: "none" }} minRows={1} placeholder={lang === "id" ? "Isi field..." : "Field value..."}/>
                            </div>
                          ) : (
                            <>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(44,32,22,0.5)", textTransform: "uppercase", marginBottom: 4 }}>{cf.name || (lang === "id" ? `Kolom ${idx+1}` : `Field ${idx+1}`)}</div>
                              <div style={{ fontSize: 13, color: "#2C2016", whiteSpace: "pre-wrap" }}>{cf.value || "-"}</div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Item 8: High Impact Stats (Bento Widget) */}
                <div style={{
                  background: "#ffffff", border: "1px solid rgba(44, 32, 22, 0.08)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(44,32,22,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6 }}><BarChart2 size={12} /> {lang === "id" ? "Laporan Statistik Performa" : "Performance Stats Report"}</span>
                    {d.metricsUpdatedAt && <span style={{ fontSize: 10, color: "rgba(44,32,22,0.4)" }}>{lang === "id" ? "Terakhir diupdate:" : "Last updated:"} {d.metricsUpdatedAt}</span>}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ background: "rgba(59,130,246,0.03)", border: "1px solid rgba(59,130,246,0.08)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Leaf size={14} style={{marginRight: 4}} /> {lang === "id" ? "Jangkauan Organik" : "Organic Reach"}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 8, marginBottom: 10 }}>
                          {MK.map((k:string) => (
                            <div onClick={() => setEditingFieldRight("metric_"+k)} key={k} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(44,32,22,0.02)", padding: "6px 10px", borderRadius: 8, cursor: "pointer", position: "relative" }}>
                              {getMetricIcon(k, MC[k]||"#3B82F6", 14)}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 9, color: "rgba(44,32,22,0.5)", textTransform: "capitalize", lineHeight: 1.1, marginBottom: 2 }}>{formatMetricKey(k)}</div>
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
                                    style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: 12, fontWeight: 805, color: "#2C2016", padding: 0 }}
                                  />
                                ) : (
                                  <div style={{ fontSize: 12, fontWeight: 805, color: "#2C2016" }}>{fmt(d.metrics[k] || 0)}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ borderTop: "1px dashed rgba(59,130,246,0.15)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                          <span>{lang === "id" ? "Total Interaksi:" : "Total Engagements:"}</span>
                          <strong style={{ color: "#3B82F6" }}>{fmt(eng(d.metrics))}</strong>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                          <span>Engagement Rate:</span>
                          <strong style={{ color: "#3B82F6" }}>{(d.metrics?.reach || 0) > 0 ? ((eng(d.metrics) / d.metrics.reach) * 100).toFixed(2) : 0}%</strong>
                        </div>
                      </div>
                    </div>
   
                    <div style={{ background: d.isAds ? "rgba(156,43,78,0.03)" : "rgba(44,32,22,0.01)", border: d.isAds ? "1px solid rgba(156,43,78,0.08)" : "1px dashed rgba(44,32,22,0.08)", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", justifyContent: d.isAds ? "space-between" : "center" }}>
                      {d.isAds ? (
                        <>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#9C2B4E", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={14} style={{marginRight: 4}} /> {lang === "id" ? "Hasil Kampanye Berbayar" : "Paid Campaign Results"}</div>
                              <button onClick={(e)=>{ e.stopPropagation(); set("isAds",!d.isAds); }} style={{width:32,height:18,borderRadius:9,border:"none",cursor:"pointer",background:d.isAds?"#9C2B4E":"rgba(44,32,22,0.15)",transition:"background .2s",position:"relative",flexShrink:0}}>
                                <div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:2,left:d.isAds?16:2,transition:"left .2s"}}/>
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 8 }}>
                              {ADS_CATEGORIES.map(cat => (
                                <div key={cat.title}>
                                  <div style={{fontSize: 12, fontWeight: 800, color: "#9C2B4E", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(156,43,78,0.15)", paddingBottom: 4}}>{lang === "id" ? (cat.title === "Overview" ? "Ringkasan" : cat.title === "Engagement" ? "Interaksi" : cat.title === "Profile Activity" ? "Aktivitas Profil" : cat.title === "Details" ? "Detail Iklan" : cat.title) : cat.title}</div>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 6 }}>
                                    {cat.keys.map(k => (
                                      <div onClick={() => setEditingFieldRight("adsMetric_"+k)} key={k} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(156,43,78,0.02)", padding: "5px 8px", borderRadius: 8, cursor: "pointer" }}>
                                        {getMetricIcon(k, k==="clicks"||k==="conversions"?"#9C2B4E":MC[k]||"#9C2B4E", 13)}
                                        <div style={{flex: 1, minWidth: 0}}>
                                          <div style={{ fontSize: 8, color: "rgba(44,32,22,0.5)", textTransform: "capitalize", lineHeight: 1.1, marginBottom: 2 }}>{formatMetricKey(k)}</div>
                                          {editingFieldRight === "adsMetric_"+k ? (
                                            <input disabled={!canEdit} 
                                              ref={activeFieldRef}
                                              autoFocus
                                              type={k === "audience" ? "text" : "number"} 
                                              min={k === "audience" ? undefined : 0} 
                                              placeholder={k === "audience" ? "..." : "0"} 
                                              value={d.adsMetrics?.[k] === 0 && k !== "audience" ? "" : (d.adsMetrics?.[k] !== undefined && d.adsMetrics?.[k] !== null ? d.adsMetrics[k] : "")} 
                                              onChange={(e:any)=>setM(k,e.target.value,true)} 
                                              onKeyDown={(e) => e.key === "Enter" && setEditingFieldRight(null)}
                                              style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: 11, fontWeight: 805, color: "#2C2016", padding: 0 }}
                                            />
                                          ) : (
                                            <div style={{ fontSize: 11, fontWeight: 805, color: "#2C2016", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={k === "audience" ? (d.adsMetrics?.[k] || "") : ""}>
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
                          </div>
                          <div style={{ borderTop: "1px dashed rgba(156,43,78,0.15)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                            <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                              <span>Clicks / Conversions:</span>
                              <strong style={{ color: "#9C2B4E" }}>{fmt(d.adsMetrics?.clicks || 0)} / {fmt(d.adsMetrics?.conversions || 0)}</strong>
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(44,32,22,0.7)", display: "flex", justifyContent: "space-between" }}>
                              <span>{lang === "id" ? "Total Interaksi Iklan:" : "Total Ad Engagements:"}</span>
                              <strong style={{ color: "#9C2B4E" }}>{fmt(eng(d.adsMetrics || {}))}</strong>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.5 }}>
                            <DollarSign size={14} />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{lang === "id" ? "Tidak ada kampanye berbayar" : "No paid campaigns"}</span>
                          </div>
                          <button onClick={(e)=>{ e.stopPropagation(); set("isAds",!d.isAds); }} style={{width:32,height:18,borderRadius:9,border:"none",cursor:"pointer",background:d.isAds?"#9C2B4E":"rgba(44,32,22,0.15)",transition:"background .2s",position:"relative",flexShrink:0}}>
                            <div style={{width:14,height:14,borderRadius:"50%",background:"white",position:"absolute",top:2,left:d.isAds?16:2,transition:"left .2s"}}/>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
          )}

        </div>
        </div>

</>)}

        <div style={{display:"flex", gap:10, justifyContent:"space-between", alignItems:"center", padding: "10px 20px", borderTop: "1px solid rgba(44,32,22,0.08)", background: "white", borderRadius: "0 0 24px 24px", zIndex: 10, flexShrink: 0}}>
          <div style={{display:"flex", gap:10, alignItems:"center"}}>
            {isSaving && (
              <span style={{ fontSize: 10, color: "#3B82F6", fontWeight: 700, display: "flex", alignItems: "center" }} className="animate-pulse">
                {lang === "id" ? "Menyimpan..." : "Saving..."}
              </span>
            )}
            {!isSaving && (d.lastEditedBy || (d.history && d.history.length > 0)) && (
              <span onClick={() => {
                const hDays = planDetails?.capabilities?.historyDays ?? 0;
                if (hDays === 0) {
                  alert(lang === 'id' ? 'Upgrade paket untuk melihat riwayat edit.' : 'Upgrade plan to view edit history.');
                  return;
                }
                setShowHistory(true);
              }} style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#3B82F6"} onMouseLeave={(e) => e.currentTarget.style.color = "#9CA3AF"}>
                {lang === "id" ? "diedit terakhir oleh" : "last edited by"} {d.lastEditorName || (d.history && d.history[0]?.editorName) || "User"} {lang === "id" ? "pada" : "at"} {new Date(d.lastEditedAt || (d.history && d.history[0]?.timestamp)).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit" })}, {new Date(d.lastEditedAt || (d.history && d.history[0]?.timestamp)).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
          <div style={{display:"flex", gap:8}}>
            <Tooltip text={lang === "id" ? "Muat Ulang" : "Refresh"} position="top">
              <button onClick={handleRefresh} disabled={isRefreshing} className="hover-scale" style={{...B(false), background:"rgba(44,32,22,0.05)", border:"1.5px solid rgba(44,32,22,0.1)", color:"#2C2016", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center", opacity: isRefreshing ? 0.5 : 1, cursor: isRefreshing ? "not-allowed" : "pointer"}}>
                <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </Tooltip>
            {onDuplicate && (
              <Tooltip text={lang === "id" ? "Duplikasi" : "Duplicate"} position="top"><button onClick={()=>onDuplicate(d)} className="hover-scale" style={{...B(false), background:"rgba(44,32,22,0.05)", border:"1.5px solid rgba(44,32,22,0.1)", color:"#2C2016", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><Copy size={14} /></button></Tooltip>
            )}
            {d.archived ? (
              <Tooltip text={lang === "id" ? "Tampilkan Lagi" : "Restore"} position="top"><button onClick={()=>onRestore(d.id)} className="hover-scale" style={{...B(false), background:"#E8F5E9", border:"1.5px solid #2E7D32", color:"#2E7D32", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><RefreshCcw size={14} /></button></Tooltip>
            ) : (
              canArchive && <Tooltip text={lang === "id" ? "Arsipkan" : "Archive"} position="top"><button onClick={()=>onArchive(d.id)} className="hover-scale" style={{...B(false), background:"rgba(255, 255, 255, 0.85)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)", border:"1px solid rgba(0,0,0,0.1)", color:"#666", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><Archive size={14} /></button></Tooltip>
            )}
            {canDelete && <Tooltip text={lang === "id" ? "Hapus" : "Delete"} position="top"><button onClick={()=>onDelete(d.id)} className="hover-scale" style={{...B(false), background:"#FDF5F8", border:"1.5px solid #9C2B4E", color:"#9C2B4E", padding:"6px", display: "flex", alignItems: "center", justifyContent: "center"}}><Trash size={14} /></button></Tooltip>}
            
            {/* Dropdown Container for Sharing (Google Docs style) */}
            <div ref={shareDropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={handleShareClick}
                className="hover-scale"
                style={{
                  ...B(false),
                  background: showShareDropdown ? "#2563eb" : "rgba(37, 99, 235, 0.08)",
                  border: "1px solid rgba(37, 99, 235, 0.2)",
                  color: showShareDropdown ? "#FFFFFF" : "#2563eb",
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <Send size={13} style={{ marginRight: 4 }} />
                {lang === "id" ? "Bagikan" : "Share"}
              </button>

              <AnimatePresence>
                {showShareDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      right: 0,
                      marginBottom: 10,
                      width: 340,
                      background: "#FFFFFF",
                      borderRadius: 20,
                      boxShadow: "0 20px 45px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      padding: 20,
                      zIndex: 150,
                      textAlign: "left"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#111827", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                      <Globe size={15} className="text-blue-600" /> {lang === "id" ? "Pengaturan Berbagi" : "Share Settings"}
                    </div>

                    {/* Segmented Tab Control */}
                    <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.04)", padding: 2, borderRadius: 8, marginBottom: 16 }}>
                      <button
                        type="button"

                        onClick={() => {
                          if (ctx.hasCapability && !ctx.hasCapability('publicLink')) {
                            alert(ctx.lang === 'id' ? 'Upgrade paket untuk membagikan Tautan Publik.' : 'Upgrade plan to share Public Links.');
                            return;
                          }
                          ctx.setShareTab("public");
                        }}

                        style={{
                          flex: 1,
                          padding: "6px 0",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: "none",
                          background: shareTab === "public" ? "#FFFFFF" : "transparent",
                          color: shareTab === "public" ? "#2563eb" : "#4b5563",
                          boxShadow: shareTab === "public" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        {lang === "id" ? "Tautan Publik" : "Public Link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareTab("users")}
                        style={{
                          flex: 1,
                          padding: "6px 0",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: "none",
                          background: shareTab === "users" ? "#FFFFFF" : "transparent",
                          color: shareTab === "users" ? "#2563eb" : "#4b5563",
                          boxShadow: shareTab === "users" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                          cursor: "pointer",
                          transition: "all 0.15s"
                        }}
                      >
                        {lang === "id" ? "Kirim ke Pengguna" : "Send to Users"}
                      </button>
                    </div>

                    {!d.id ? (
                      <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontStyle: "italic", lineHeight: 1.4 }}>
                        {lang === "id" ? "Simpan/ketik judul terlebih dahulu untuk mengonfigurasi pengaturan berbagi." : "Save/type title first to configure sharing settings."}
                      </div>
                    ) : shareTab === "public" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ display: "flex", gap: 10 }}>
                          <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none", background: "rgba(0,0,0,0.02)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.04)" }}>
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
                              style={{ width: 14, height: 14, accentColor: "#2563eb", cursor: "pointer", flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                              {lang === "id" ? "Aktifkan Link Publik" : "Enable Public Link"}
                            </span>
                          </label>

                          {d.isPublic && (
                            <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none", background: "rgba(0,0,0,0.02)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.04)" }}>
                              <input disabled={!canEdit}
                                type="checkbox"
                                checked={d.allowComments !== false}
                                onChange={(e) => set("allowComments", e.target.checked)}
                                style={{ width: 14, height: 14, accentColor: "#2563eb", cursor: "pointer", flexShrink: 0 }}
                              />
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                                {lang === "id" ? "Izinkan Komentar" : "Allow Comments"}
                              </span>
                            </label>
                          )}
                        </div>

                        {d.isPublic && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 4 }}>
                            <div style={{ display: "flex", gap: 4, alignItems: "center", background: "rgba(0,0,0,0.03)", padding: "4px 8px", borderRadius: 8 }}>
                              <input disabled={!canEdit}
                                type="text"
                                readOnly
                                value={`${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  outline: "none",
                                  fontSize: 10,
                                  color: "#6b7280",
                                  width: "100%",
                                  fontFamily: "monospace"
                                }}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                              />
                            </div>

                            <div style={{ display: "flex", gap: 6 }}>
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
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  background: "#2563eb",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "6px 8px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "background 0.2s"
                                }}
                              >
                                {copiedSharedLink ? (
                                  <>
                                    <Check size={12} /> {lang === "id" ? "Disalin!" : "Copied!"}
                                  </>
                                ) : (
                                  <>
                                    <Link2 size={12} /> {lang === "id" ? "Salin Link" : "Copy Link"}
                                  </>
                                )}
                              </button>

                              <a
                                href={`${window.location.origin}/shared-brief/${d.workspaceId || workspace?.id}/${d.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  background: "rgba(0,0,0,0.04)",
                                  color: "#4b5563",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "6px 8px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  textDecoration: "none",
                                  cursor: "pointer",
                                  transition: "background 0.2s"
                                }}
                              >
                                <ExternalLink size={12} /> {lang === "id" ? "Buka" : "Open"}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : canManageShare ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {/* Search field for Hubify Users */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 6 }}>
                            {lang === "id" ? "Masukkan username atau email" : "Enter username or email"}
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <div style={{ position: "relative", flex: 1 }}>
                              <Search size={12} style={{ position: "absolute", left: 10, top: 10, color: "rgba(0,0,0,0.3)" }} />
                              <input disabled={!canEdit}
                                type="text"
                                value={shareSearch}
                                onChange={(e) => setShareSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleShareSearch()}
                                placeholder={lang === "id" ? "username atau email" : "username or email"}
                                style={{
                                  width: "100%",
                                  background: "rgba(0,0,0,0.03)",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "6px 10px 6px 28px",
                                  fontSize: 12,
                                  outline: "none"
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleShareSearch}
                              disabled={shareSearchLoading || !shareSearch.trim()}
                              style={{
                                background: "#2563eb",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: 8,
                                padding: "0 12px",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                opacity: (!shareSearch.trim() || shareSearchLoading) ? 0.6 : 1
                              }}
                            >
                              {shareSearchLoading ? "..." : (lang === "id" ? "Cari" : "Search")}
                            </button>
                          </div>
                        </div>

                        {shareSearchError && (
                          <div style={{ fontSize: 11, color: "#e11d48", fontWeight: 500 }}>
                            {shareSearchError}
                          </div>
                        )}

                        {/* Search result user card */}
                        {shareSearchSuccess && (
                          <div style={{ background: "rgba(37, 99, 235, 0.04)", border: "1.5px dashed rgba(37, 99, 235, 0.2)", borderRadius: 12, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#2563eb", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                {String(shareSearchSuccess.fullName || shareSearchSuccess.nickname || shareSearchSuccess.email || "?").charAt(0).toUpperCase()}
                              </div>
                              <div style={{ overflow: "hidden", flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {shareSearchSuccess.fullName || shareSearchSuccess.nickname || shareSearchSuccess.email}
                                </div>
                                <div style={{ fontSize: 10, color: "rgba(0,0,0,0.4)" }}>
                                  @{shareSearchSuccess.username || "user"}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px dashed rgba(37, 99, 235, 0.15)", paddingTop: 6 }}>
                              <HubifyRoleSelect
                                value={selectedRoleForNewUser}
                                onChange={(role) => setSelectedRoleForNewUser(role)}
                                compact={true}
                                align="left"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddSharedUser(shareSearchSuccess)}
                                style={{
                                  background: "#2563eb",
                                  color: "#FFFFFF",
                                  border: "none",
                                  borderRadius: 6,
                                  padding: "4px 8px",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2
                                }}
                              >
                                <UserCheck size={10} /> {lang === "id" ? "Bagikan" : "Share"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* List of currently shared users */}
                        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 10, marginTop: 4 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.5)", marginBottom: 8 }}>
                            {lang === "id" ? `Memiliki Akses Khusus (${(d.sharedUsers || []).length})` : `Has Access (${(d.sharedUsers || []).length})`}
                          </div>
                          
                          {(!d.sharedUsers || d.sharedUsers.length === 0) ? (
                            <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
                              {lang === "id" ? "Belum ada pengguna Hubify Social yang ditambahkan." : "No users added yet."}
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 140, overflowY: "auto", paddingRight: 2 }}>
                              {(d.sharedUsers || []).map((u: any) => (
                                <div key={u.uid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.02)", borderRadius: 8, padding: "6px 8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#4b5563", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
                                      {String(u.fullName || u.email || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ overflow: "hidden" }}>
                                      <div style={{ fontSize: 10, fontWeight: 600, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {u.fullName || u.email}
                                      </div>
                                      {u.username && (
                                        <div style={{ fontSize: 8, color: "rgba(0,0,0,0.4)", marginTop: -2 }}>
                                          @{u.username}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    {canManageShare ? (
                                      <HubifyRoleSelect
                                        value={(u.role || "viewer") as any}
                                        onChange={(role) => handleUpdateSharedUserRole(u.uid, role)}
                                        compact={true}
                                        align="right"
                                      />
                                    ) : (
                                      <span style={{
                                        fontSize: 9,
                                        fontWeight: 700,
                                        padding: "2px 6px",
                                        borderRadius: 10,
                                        background: u.role === "editor" ? "#eff6ff" : u.role === "commenter" ? "#fefce8" : "rgba(0,0,0,0.04)",
                                        color: u.role === "editor" ? "#2563eb" : u.role === "commenter" ? "#ca8a04" : "#374151"
                                      }}>
                                        {u.role === "editor" ? "Editor" : u.role === "commenter" ? (lang === "id" ? "Komentator" : "Commenter") : (lang === "id" ? "Pelihat" : "Viewer")}
                                      </span>
                                    )}

                                    {canManageShare && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSharedUser(u.uid)}
                                        style={{
                                          background: "none",
                                          border: "none",
                                          color: "#e11d48",
                                          cursor: "pointer",
                                          padding: 2,
                                          display: "flex",
                                          alignItems: "center",
                                          opacity: 0.7
                                        }}
                                        title={lang === "id" ? "Hapus Akses" : "Remove Access"}
                                        onMouseOver={(e: any) => e.currentTarget.style.opacity = 1}
                                        onMouseOut={(e: any) => e.currentTarget.style.opacity = 0.7}
                                      >
                                        <X size={12} />
                                      </button>
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
            </div>

            {canEdit ? (
              <button onClick={async () => {
                isDirty.current = false;
                const newD = { ...dRef.current, manuallySaved: true };
                setD(newD);
                dRef.current = newD;
                await onSave(newD, true);
                onClose();
              }} className="hover-scale" style={{...B(false), background:"#3B82F6", border:"none", color:"white", padding:"5px 14px", fontSize:12, fontWeight:700}}>{lang === "id" ? "Simpan" : "Save"}</button>
            ) : (
              <button onClick={() => onClose()} className="hover-scale" style={{...B(false), background:"rgba(0,0,0,0.05)", border:"none", color:"#111827", padding:"5px 14px", fontSize:12, fontWeight:700}}>{lang === "id" ? "Tutup" : "Close"}</button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,borderRadius:24}} onClick={e=>e.stopPropagation()}>
             <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} style={{background:"#FFFFFF", border:"1px solid rgba(255,255,255,0.5)",padding:32,borderRadius:24,maxWidth:360,width:"100%",boxShadow:"0 12px 30px rgba(0,0,0,0.2)",textAlign:"center"}}>
                <h3 style={{margin:"0 0 16px",fontSize:20,color:"#2C2016", fontWeight:800}}>Keluar Murni?</h3>
                <p style={{margin:"0 0 24px",fontSize:14,color:"rgba(44,32,22,0.6)",lineHeight:1.5}}>
                   Konten dari HUB.AI ini belum Anda simpan. Yakin ingin menutupnya? Jika ditutup, draf ini akan hangus dan hilang sepenuhnya.
                </p>
                <div style={{display:"flex",gap:12}}>
                   <button onClick={async ()=>{
                     onClose();
                   }} style={{flex:1,padding:"12px 16px",background:"transparent",border:"1.5px solid rgba(44,32,22,0.2)",color:"#2C2016",borderRadius:24,fontWeight:700,cursor:"pointer"}}>
                      Hapus Draft
                   </button>
                   <button onClick={()=>{
                     setShowExitConfirm(false);
                   }} style={{flex:1,padding:"12px 16px",background:"#3B82F6",border:"none",color:"white",borderRadius:24,fontWeight:700,cursor:"pointer"}}>
                      Lanjutkan Edit
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

          </motion.div>
  );

}
