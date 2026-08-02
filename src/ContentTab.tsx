
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentTableView } from './components/ContentTableView';
import { 
  CopyPlus, MessageSquare, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, RefreshCw, Smartphone, MoreHorizontal, Layout, Type, HelpCircle, Lightbulb, PenTool, Hash, RefreshCcw, ArrowRight, Eye, Calendar, CalendarDays, Maximize2, MoreVertical, ThumbsUp, MessageCircle as CommentIcon, Share2, CornerDownRight, CheckCircle2, AlertTriangle, AlertCircle, Trash2, ArrowUpRight, Music, Zap, Clock4, Filter, Columns, Download, Layers, LayoutGrid, Check, Settings, Copy, MousePointerClick, History, FileText, ChevronRight, Video, File, Mic, Repeat
, Edit, ArrowDown, Info, ArrowUpDown} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, Cell, PieChart as RechartsPieChart, Pie } from "recharts";

export function ContentTab({ ctx }: { ctx: any }) {
  const {
    isMobileHubAi,
    contentPlatform,
    setContentPlatform,
    PLATFORMS,
    data,
    DISPLAY_CONTENT,
    days,
    posts,
    caption,
    media,
    input,
    p,
    CustomDropdown,
    MobileStepper,
    lang
  } = ctx;
  
  return (
    
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    Content
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(44,32,22,0.6)",
                      margin: "4px 0 0",
                      fontWeight: 500,
                    }}
                  >
                    Schedule, publish and manage posts, reels and stories, and
                    more.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    className="hover-scale"
                    style={{
                      background: "white",
                      color: "#111827",
                      borderRadius: 8,
                      padding: "8px 16px",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "rgba(0,0,0,0.1)",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Download size={14} /> Export data <ChevronDown size={14} />
                  </button>
                  <button
                    className="hover-scale"
                    style={{
                      background: "white",
                      color: "#111827",
                      borderRadius: 8,
                      padding: "8px 16px",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "rgba(0,0,0,0.1)",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Video size={14} /> Create reel
                  </button>
                  <button
                    className="hover-scale"
                    style={{
                      background: "var(--theme-primary)",
                      color: "white",
                      borderRadius: 8,
                      padding: "8px 16px",
                      borderWidth: 0,
                      borderStyle: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Edit size={14} /> Create post <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 24,
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  marginBottom: 16,
                }}
              >
                {[
                  "Published",
                  "Scheduled",
                  "Drafts",
                  "Expiring",
                  "Expired",
                  "Ad Posts",
                ].map((t, idx) => (
                  <div
                    key={t}
                    style={{
                      paddingBottom: 12,
                      fontWeight: 600,
                      fontSize: 14,
                      color:
                        idx === 0
                          ? "var(--theme-primary)"
                          : "rgba(44,32,22,0.6)",
                      borderBottom:
                        idx === 0
                          ? "2px solid var(--theme-primary)"
                          : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobileHubAi ? "column" : "row",
                    gap: isMobileHubAi ? 8 : 12,
                    width: isMobileHubAi ? "100%" : "auto",
                  }}
                >
                  {isMobileHubAi ? (
                    <MobileStepper
                      value={contentPlatform}
                      options={PLATFORMS}
                      onChange={setContentPlatform}
                      prefix="Platform"
                    />
                  ) : (
                    <CustomDropdown
                      value={contentPlatform}
                      options={PLATFORMS}
                      onChange={setContentPlatform}
                    />
                  )}
                  {isMobileHubAi ? (
                    <MobileStepper
                      value={"Post type"}
                      options={[{ id: "Post type", label: "Post type" }]}
                      onChange={() => {}}
                      prefix="Tipe"
                    />
                  ) : (
                    <CustomDropdown
                      value={"Post type"}
                      options={[{ id: "Post type", label: "Post type" }]}
                      onChange={() => {}}
                    />
                  )}
                  {isMobileHubAi ? (
                    <MobileStepper
                      value={"Filter"}
                      options={[{ id: "Filter", label: "Filter" }]}
                      onChange={() => {}}
                      prefix="Filter"
                    />
                  ) : (
                    <CustomDropdown
                      value={"Filter"}
                      options={[{ id: "Filter", label: "Filter" }]}
                      onChange={() => {}}
                    />
                  )}
                  <div style={{ position: "relative" }}>
                    <Search
                      size={14}
                      color="gray"
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search by ID or caption"
                      style={{
                        padding: "8px 16px 8px 36px",
                        borderRadius: 8,
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "rgba(0,0,0,0.1)",
                        fontSize: 13,
                        width: 220,
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    style={{
                      padding: "8px 16px",
                      background: "white",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "rgba(0,0,0,0.1)",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CalendarIcon size={14} /> Last 90 days: Mar 31, 2026 - Jun
                    28, 2026 <ChevronDown size={14} />
                  </button>
                  <button
                    style={{
                      padding: "8px 16px",
                      background: "white",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "rgba(0,0,0,0.1)",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Layout size={14} /> Columns <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <ContentTableView ctx={ctx} />
            </motion.div>
          
  );
}
