
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CopyPlus, MessageSquare, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, RefreshCw, Smartphone, MoreHorizontal, Layout, Type, HelpCircle, Lightbulb, PenTool, Hash, RefreshCcw, ArrowRight, Eye, Calendar, CalendarDays, Maximize2, MoreVertical, ThumbsUp, MessageCircle as CommentIcon, Share2, CornerDownRight, CheckCircle2, AlertTriangle, AlertCircle, Trash2, ArrowUpRight, Music, Zap, Clock4, Filter, Columns, Download, Layers, LayoutGrid, Check, Settings, Copy, MousePointerClick, History, FileText, ChevronRight, Video, File, Mic, Repeat
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, Cell, PieChart as RechartsPieChart, Pie } from "recharts";

export function CompetitorTab({ ctx }: { ctx: any }) {
  const {
    isMobileHubAi,
    competitors,
    compInput,
    setCompInput,
    compLoading,
    contentPlatform,
    setContentPlatform,
    PLATFORMS,
    addCompetitor,
    removeCompetitor,
    input,
    target,
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
                      fontSize: isMobileHubAi ? 22 : 28,
                      fontWeight: 800,
                      color: "#2C2016",
                      margin: 0,
                    }}
                  >
                    Analisis Kompetitor
                  </h2>
                  <p
                    style={{
                      fontSize: isMobileHubAi ? 13 : 14,
                      color: "rgba(44,32,22,0.5)",
                      margin: "4px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    Bandingkan performa hingga 5 akun kompetitor secara
                    realtime.
                  </p>
                </div>
                <div
                  style={{
                    width: isMobileHubAi ? "100%" : "auto",
                    display: "flex",
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
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: isMobileHubAi ? "column" : "row",
                  gap: isMobileHubAi ? 8 : 12,
                  marginBottom: 24,
                }}
              >
                <input
                  placeholder={
                    isMobileHubAi
                      ? "Username kompetitor (contoh: @kompetitor)..."
                      : "Ketik username kompetitor (contoh: @kompetitor)..."
                  }
                  value={compInput}
                  onChange={(e) => setCompInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCompetitor();
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 12,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(44,32,22,0.1)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    fontWeight: 500,
                    outline: "none",
                  }}
                />
                <button
                  onClick={addCompetitor}
                  disabled={compLoading}
                  className="hover-scale"
                  style={{
                    background: compLoading ? "rgba(44,32,22,0.5)" : "#2C2016",
                    color: "white",
                    borderWidth: 0,
                    borderStyle: "none",
                    padding: isMobileHubAi ? "12px 24px" : "0 24px",
                    minHeight: 44,
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: compLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {compLoading
                    ? lang === "id"
                      ? "Menganalisis..."
                      : "Analyzing..."
                    : lang === "id"
                      ? "Tambah Kompetitor"
                      : "Add Competitor"}
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobileHubAi ? "1fr" : "1fr 1fr",
                  gap: isMobileHubAi ? 16 : 20,
                }}
              >
                {competitors.map((comp: any, idx: number) => (
                  <div
                    key={idx}
                    className="hover-scale"
                    style={{
                      background: "white",
                      borderRadius: 20,
                      padding: isMobileHubAi ? 16 : 24,
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "rgba(44,32,22,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: isMobileHubAi ? 12 : 20,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: isMobileHubAi ? 8 : 12,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: isMobileHubAi ? 32 : 40,
                            height: isMobileHubAi ? 32 : 40,
                            borderRadius: isMobileHubAi ? 16 : 20,
                            background: "#FAFAFA",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <User
                            size={isMobileHubAi ? 16 : 20}
                            color="rgba(44,32,22,0.3)"
                          />
                        </div>
                        <h3
                          style={{
                            fontSize: isMobileHubAi ? 15 : 18,
                            fontWeight: 800,
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={comp.username}
                        >
                          {comp.username}
                        </h3>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: isMobileHubAi ? 11 : 12,
                            fontWeight: 800,
                            color: "#2D7A5E",
                            background: "#E5F4EE",
                            padding: isMobileHubAi ? "4px 8px" : "6px 10px",
                            borderRadius: 8,
                          }}
                        >
                          ER: {comp.er}
                        </div>
                        <button
                          onClick={() => removeCompetitor(idx)}
                          style={{
                            background: "rgba(239, 68, 68, 0.05)",
                            border: "none",
                            padding: isMobileHubAi ? "6px" : "8px",
                            borderRadius: 8,
                            cursor: "pointer",
                            color: "#EF4444",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                          }}
                          title="Hapus Kompetitor"
                        >
                          <Trash2 size={isMobileHubAi ? 14 : 15} />
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: isMobileHubAi ? 12 : 13,
                        color: "rgba(44,32,22,0.5)",
                        marginBottom: isMobileHubAi ? 12 : 16,
                        fontWeight: 600,
                      }}
                    >
                      Rata-rata posting:{" "}
                      <strong style={{ color: "#2C2016" }}>
                        {comp.postsPerMonth} per bulan
                      </strong>
                    </div>
                    <h4
                      style={{
                        fontSize: isMobileHubAi ? 13 : 14,
                        fontWeight: 800,
                        marginBottom: isMobileHubAi ? 8 : 12,
                      }}
                    >
                      Top 3 Konten Mereka
                    </h4>
                    {comp.topContent.map((c: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: isMobileHubAi ? 8 : 12,
                          marginBottom: isMobileHubAi ? 10 : 12,
                          paddingBottom: isMobileHubAi ? 10 : 12,
                          borderBottom: "1px solid rgba(44,32,22,0.05)",
                        }}
                      >
                        <div
                          style={{
                            width: isMobileHubAi ? 50 : 60,
                            height: isMobileHubAi ? 50 : 60,
                            borderRadius: 8,
                            background: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <ImageIcon
                            size={isMobileHubAi ? 20 : 24}
                            color="#ccc"
                          />
                        </div>
                        <div
                          style={{ alignSelf: "center", minWidth: 0, flex: 1 }}
                        >
                          <div
                            style={{
                              fontSize: isMobileHubAi ? 12 : 13,
                              fontWeight: 800,
                              marginBottom: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={c.title}
                          >
                            {c.title}
                          </div>
                          <div
                            style={{
                              fontSize: isMobileHubAi ? 10 : 11,
                              color: "rgba(44,32,22,0.5)",
                              fontWeight: 700,
                            }}
                          >
                            {c.views} Views • {c.likes} Likes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {competitors.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: isMobileHubAi ? "32px 16px" : 40,
                      background: "white",
                      borderRadius: 20,
                      borderWidth: "1px",
                      borderStyle: "dashed",
                      borderColor: "rgba(44,32,22,0.2)",
                    }}
                  >
                    <Search
                      size={isMobileHubAi ? 36 : 48}
                      style={{ opacity: 0.2, margin: "0 auto 12px" }}
                    />
                    <h3
                      style={{
                        fontSize: isMobileHubAi ? 16 : 18,
                        fontWeight: 800,
                        marginBottom: 8,
                      }}
                    >
                      Belum Ada Kompetitor
                    </h3>
                    <p
                      style={{
                        fontSize: isMobileHubAi ? 12 : 14,
                        color: "rgba(44,32,22,0.6)",
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      Tambahkan link profile atau username kompetitor Anda untuk
                      dianalisis oleh AI Hubify.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          
  );
}
