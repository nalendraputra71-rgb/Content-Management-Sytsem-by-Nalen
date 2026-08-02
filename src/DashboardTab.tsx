
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CopyPlus, MessageSquare, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, RefreshCw, Smartphone, MoreHorizontal, Layout, Type, HelpCircle, Lightbulb, PenTool, Hash, RefreshCcw, ArrowRight, Eye, Calendar, CalendarDays, Maximize2, MoreVertical, ThumbsUp, MessageCircle as CommentIcon, Share2, CornerDownRight, CheckCircle2, AlertTriangle, AlertCircle, Trash2, ArrowUpRight, Music, Zap, Clock4, Filter, Columns, Download, Layers, LayoutGrid, Check, Settings, Copy, MousePointerClick, History, FileText, ChevronRight
} from "lucide-react";
import { Plus } from "lucide-react";

export function DashboardTab({ ctx }: { ctx: any }) {
  const {
    isMobileHubAi,
    dashboardPlatform,
    PLATFORMS,
    setDashboardPlatform,
    dashTimeRange,
    DASHBOARD_TIME_RANGES,
    setDashTimeRange,
    setShowCreatePostPopup,
    metaApiError,
    lang,
    connectedPlatforms,
    toggleConnection,
    connectedAccountsData,
    isDiagnosing,
    runDiagnostic,
    diagnosticResult,
    MobileStepper,
    CustomDropdown
  } = ctx;
  
  return (
              
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl md:text-[28px] font-extrabold text-[#2C2016] m-0">
                  Home
                </h2>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  {isMobileHubAi ? (
                    <>
                      <MobileStepper
                        value={dashboardPlatform}
                        options={PLATFORMS}
                        onChange={setDashboardPlatform}
                        prefix="Platform"
                      />
                      <MobileStepper
                        value={dashTimeRange}
                        options={DASHBOARD_TIME_RANGES}
                        onChange={setDashTimeRange}
                        prefix="Rentang"
                      />
                    </>
                  ) : (
                    <>
                      <CustomDropdown
                        value={dashboardPlatform}
                        options={PLATFORMS}
                        onChange={setDashboardPlatform}
                        pill
                      />
                      <CustomDropdown
                        value={dashTimeRange}
                        options={DASHBOARD_TIME_RANGES}
                        onChange={setDashTimeRange}
                        pill
                      />
                    </>
                  )}
                  <button
                    className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    onClick={() => setShowCreatePostPopup(true)}
                    style={{
                      background: "var(--theme-primary)",
                      borderWidth: 0,
                      borderStyle: "none",
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

              {metaApiError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                  <div className="mt-0.5 text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-red-800 text-sm">
                      Meta API Error
                    </span>
                    <span className="text-red-600 text-sm leading-relaxed">
                      {metaApiError}
                    </span>
                  </div>
                </div>
              )}

              {/* KONEKSI PLATFORM - Minimalist Pills */}
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]/40 uppercase tracking-wider">
                    {lang === "id"
                      ? "Integrasi Platform"
                      : "Platform Integrations"}
                  </span>
                  {isMobileHubAi && (
                    <span className="text-[10px] font-bold text-gray-400">
                      {connectedPlatforms.length} /{" "}
                      {PLATFORMS.filter((p) => p.id !== "all").length} Connected
                    </span>
                  )}
                </div>

                {isMobileHubAi ? (
                  /* BEAUTIFUL MOBILE GRID - 2 columns, clean, elegant cards with perfect touch height and clear connection states */
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS.filter((p) => p.id !== "all").map((p) => {
                      const isConn = connectedPlatforms.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleConnection(p.id)}
                          className={`relative flex flex-col justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 active:scale-95 select-none border min-h-[105px] ${
                            isConn
                              ? "bg-white border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.03)]"
                              : "bg-black/[0.02] border-black/[0.03]"
                          }`}
                        >
                          {/* Top row: Icon & Connection Status Dot */}
                          <div className="flex items-center justify-between w-full">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm"
                              style={{
                                backgroundColor: isConn
                                  ? p.color
                                  : "rgba(17,24,39,0.06)",
                              }}
                            >
                              <div className="flex items-center justify-center text-white">
                                {typeof p.icon === "string" ? (
                                  <span className="text-[10px] font-extrabold text-white">
                                    {p.icon}
                                  </span>
                                ) : (
                                  React.cloneElement(
                                    p.icon as React.ReactElement<any>,
                                    {
                                      size: 16,
                                      color: isConn ? "#FFFFFF" : "#4B5563",
                                    },
                                  )
                                )}
                              </div>
                            </div>

                            {/* Status indicator badge/dot */}
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                isConn
                                  ? "bg-green-50 text-green-600 border border-green-100/30"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {isConn
                                ? lang === "id"
                                  ? "Aktif"
                                  : "Connected"
                                : lang === "id"
                                  ? "Hubungkan"
                                  : "Connect"}
                            </span>
                          </div>

                          {/* Bottom part: Platform Name & Account Details */}
                          <div className="mt-3 min-w-0">
                            <div className="text-xs font-extrabold text-[#111827] truncate">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium mt-0.5 truncate leading-tight">
                              {isConn
                                ? connectedAccountsData[p.id]?.accountName ||
                                  "@" + p.id
                                : lang === "id"
                                  ? "Belum terhubung"
                                  : "Not integrated"}
                            </div>
                          </div>

                          {/* Action overlay text for disconnecting on tap if connected */}
                          {isConn && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100 opacity-0 active:opacity-100 transition-opacity">
                              <X size={10} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* DESKTOP VIEW - Kept exactly as original to satisfy strict constraints */
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
                                      p.icon as React.ReactElement<any>,
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
                                    p.icon as React.ReactElement<any>,
                                    { size: 14 },
                                  )
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col justify-center">
                            <span
                              className={`text-sm font-semibold transition-colors duration-300 ${
                                isConn
                                  ? "text-[#111827] group-hover:text-red-600"
                                  : "text-[#111827]/60 group-hover:text-[#111827]/90"
                              }`}
                            >
                              {isConn
                                ? connectedAccountsData[p.id]?.accountName ||
                                  p.name
                                : `Connect ${p.name}`}
                            </span>
                            {isConn &&
                              connectedAccountsData[p.id]?.accountName && (
                                <span className="text-[10px] text-[#111827]/50 font-medium -mt-0.5 group-hover:text-red-400 transition-colors">
                                  {p.name}
                                </span>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mb-8 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#111827] flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={
                          isDiagnosing
                            ? "animate-spin text-blue-600"
                            : "text-blue-600"
                        }
                      >
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 21v-5h5" />
                      </svg>
                      System Connection Diagnostic
                    </span>
                    <span className="text-xs text-[#111827]/60">
                      Cek apakah token akses sosial media Anda masih valid atau
                      sudah expired
                    </span>
                  </div>
                  <button
                    onClick={runDiagnostic}
                    disabled={isDiagnosing}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isDiagnosing ? "Memeriksa..." : "Test Koneksi"}
                  </button>
                </div>

                {Object.keys(diagnosticResult).length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {Object.entries(diagnosticResult).map(
                      ([plat, res]: [string, any]) => (
                        <div
                          key={plat}
                          className={`text-xs p-3 rounded-lg border ${res.status === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}
                        >
                          <span className="font-bold capitalize">
                            {plat === "all" ? "System" : plat}:{" "}
                          </span>
                          <span>{res.message}</span>
                          {res.status === "error" &&
                            res.message.includes("token") && (
                              <div className="mt-2 font-semibold text-red-900 bg-red-100/50 p-2 rounded-md">
                                {lang === "id"
                                  ? "💡 Solusi: Token otorisasi sudah kadaluarsa (expired) atau tidak valid. Silakan klik icon " +
                                    plat +
                                    ' di atas untuk "Disconnect", lalu klik lagi untuk "Connect" ulang agar mendapatkan token yang baru.'
                                  : "💡 Solution: Authorization token is expired or invalid. Please click the " +
                                    plat +
                                    ' icon above to "Disconnect", then click again to "Connect" to get a new token.'}
                              </div>
                            )}
                        </div>
                      ),
                    )}
                  </div>
                
)}
              </div>
            </motion.div>
  );
}
