
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CopyPlus, MessageSquare, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, RefreshCw, Smartphone, MoreHorizontal, Layout, Type, HelpCircle, Lightbulb, PenTool, Hash, RefreshCcw, ArrowRight, Eye, Calendar, CalendarDays, Maximize2, MoreVertical, ThumbsUp, MessageCircle as CommentIcon, Share2, CornerDownRight, CheckCircle2, AlertTriangle, AlertCircle, Trash2, ArrowUpRight, Music, Zap, Clock4, Filter, Columns, Download, Layers, LayoutGrid, Check, Settings, Copy, MousePointerClick, History, FileText, ChevronRight, Video, File, Mic, Repeat
, ChevronLeft} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, Cell, PieChart as RechartsPieChart, Pie } from "recharts";
import { CalendarBoard } from "./CalendarBoard";

export function CalendarTab({ ctx }: { ctx: any }) {
  const {
    isMobileHubAi,
    calendarPosts,
    setCalendarPosts,
    contentPlatform,
    setContentPlatform,
    PLATFORMS,
    posts,
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
                  flexDirection: isMobileHubAi ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobileHubAi ? "stretch" : "center",
                  gap: isMobileHubAi ? 16 : 24,
                  marginBottom: 24,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#2C2016",
                      margin: 0,
                    }}
                  >
                    {lang === "id"
                      ? "Kalender Konten Sosial"
                      : "Social Content Calendar"}
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(44,32,22,0.5)",
                      margin: "4px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {lang === "id"
                      ? "Lihat semua postingan yang terpublikasi atau jadwalkan plan."
                      : "View all published posts or schedule a plan."}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobileHubAi ? "column" : "row",
                    gap: isMobileHubAi ? 8 : 12,
                    width: isMobileHubAi ? "100%" : "auto",
                  }}
                >
                  <button
                    onClick={() => {
                      alert(
                        lang === "id"
                          ? "Fitur AI Calendar sedang menjalankan mockup auto-assign."
                          : "AI Calendar feature is running auto-assign mockup.",
                      );
                      setCalendarPosts([
                        ...calendarPosts,
                        {
                          day: Math.floor(Math.random() * 28 + 1),
                          type: "tt",
                          title:
                            lang === "id"
                              ? "Ide Konten AI 1"
                              : "AI Content Idea 1",
                          time: "10:00",
                        },
                        {
                          day: Math.floor(Math.random() * 28 + 1),
                          type: "ig",
                          title:
                            lang === "id"
                              ? "Ide Konten AI 2"
                              : "AI Content Idea 2",
                          time: "15:30",
                        },
                      ]);
                    }}
                    className="hover-scale"
                    style={{
                      background: "var(--theme-primary)",
                      color: "white",
                      padding: isMobileHubAi ? "12px 16px" : "0 16px",
                      borderRadius: 12,
                      fontWeight: 800,
                      borderWidth: 0,
                      borderStyle: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkles size={16} /> Auto-Plan AI
                  </button>
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "white",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "rgba(44,32,22,0.1)",
                      borderRadius: 12,
                      padding: isMobileHubAi ? "4px 8px" : 4,
                      justifyContent: "space-between",
                      width: isMobileHubAi ? "100%" : "auto",
                    }}
                  >
                    <button
                      className="hover-scale"
                      style={{
                        background: "transparent",
                        borderWidth: 0,
                        borderStyle: "none",
                        padding: 6,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        padding: "0 12px",
                        textAlign: "center",
                        flex: isMobileHubAi ? 1 : "none",
                      }}
                    >
                      {lang === "id" ? "Agustus 2026" : "August 2026"}
                    </div>
                    <button
                      className="hover-scale"
                      style={{
                        background: "transparent",
                        borderWidth: 0,
                        borderStyle: "none",
                        padding: 6,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <CalendarBoard ctx={ctx} />
            </motion.div>
          
  );
}
