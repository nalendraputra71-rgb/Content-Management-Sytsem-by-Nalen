
import React from "react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from 'motion/react';
import { 
  CopyPlus, MessageSquare, Clock, MessageCircle, BarChart3, Bell, CheckSquare, Facebook, Instagram, Twitter, Linkedin, Youtube, Link2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Image as ImageIcon, Send, Edit3, Sparkles, ChevronDown, Shield, User, Search, Activity, PieChart, Users, X, PlayCircle, RefreshCw, Smartphone, MoreHorizontal, Layout, Type, HelpCircle, Lightbulb, PenTool, Hash, RefreshCcw, ArrowRight, Eye, Calendar, CalendarDays, Maximize2, MoreVertical, ThumbsUp, MessageCircle as CommentIcon, Share2, CornerDownRight, CheckCircle2, AlertTriangle, AlertCircle, Trash2, ArrowUpRight, Music, Zap, Clock4, Filter, Columns, Download, Layers, LayoutGrid, Check, Settings, Copy, MousePointerClick, History, FileText, ChevronRight, MapPin
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, Cell, PieChart as RechartsPieChart, Pie } from "recharts";

export function AnalyticsTab({ ctx }: { ctx: any }) {
  const {
    isMobileHubAi,
    aiLoading,
    aiReport,
    analyticsMetric,
    setAnalyticsMetric,
    analyticsPlatform,
    setAnalyticsPlatform,
    audiencePlatform,
    setAudiencePlatform,
    analyticsTimeRange,
    setAnalyticsTimeRange,
    heatmapMetric,
    setHeatmapMetric,
    name,
    DASHBOARD_TIME_RANGES,
    ANALYTICS_METRICS,
    PLATFORMS,
    data,
    generateReport,
    MOCK_CHART_DATA,
    HeatmapMock,
    CustomDropdown,
    MobileStepper
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
                      fontSize: isMobileHubAi ? 24 : 28,
                      fontWeight: 800,
                      color: "#2C2016",
                      margin: 0,
                    }}
                  >
                    Analytics Expert
                  </h2>
                  <p
                    style={{
                      fontSize: isMobileHubAi ? 13 : 14,
                      color: "rgba(44,32,22,0.5)",
                      margin: "4px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    Data mendalam dengan AI Analysis.
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
                  {isMobileHubAi ? (
                    <>
                      <MobileStepper
                        value={analyticsPlatform}
                        options={PLATFORMS}
                        onChange={setAnalyticsPlatform}
                        prefix="Platform"
                      />
                      <MobileStepper
                        value={analyticsTimeRange}
                        options={DASHBOARD_TIME_RANGES}
                        onChange={setAnalyticsTimeRange}
                        prefix="Rentang"
                      />
                    </>
                  ) : (
                    <>
                      <CustomDropdown
                        value={analyticsPlatform}
                        options={PLATFORMS}
                        onChange={setAnalyticsPlatform}
                        pill={true}
                      />
                      <CustomDropdown
                        value={analyticsTimeRange}
                        options={DASHBOARD_TIME_RANGES}
                        onChange={setAnalyticsTimeRange}
                        pill={true}
                      />
                    </>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {[
                  {
                    lb: "Views",
                    v: "1,240,551",
                    gr: "+15.2%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Reach",
                    v: "980,123",
                    gr: "+10.1%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Total ER",
                    v: "5.2%",
                    gr: "+1.2%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Komentar",
                    v: "4,120",
                    gr: "-2.1%",
                    st: "#9C2B4E",
                    bg: "#F8EAF0",
                  },
                  {
                    lb: "Likes",
                    v: "88,312",
                    gr: "+40.5%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Share",
                    v: "10,204",
                    gr: "+5.0%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                  {
                    lb: "Repost",
                    v: "2,300",
                    gr: "-1.0%",
                    st: "#9C2B4E",
                    bg: "#F8EAF0",
                  },
                  {
                    lb: "Save",
                    v: "14,500",
                    gr: "+20.4%",
                    st: "#2D7A5E",
                    bg: "#E5F4EE",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="hover-scale"
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      borderRadius: 24,
                      padding: 24,
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: "rgba(0,0,0,0.03)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "rgba(44,32,22,0.5)",
                        marginBottom: 8,
                      }}
                    >
                      {s.lb}
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: "#2C2016",
                        }}
                      >
                        {s.v}
                      </div>
                      <div
                        style={{
                          background: s.bg,
                          color: s.st,
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {s.gr}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Chart Segment */}
              <div
                style={{
                  background: "rgba(255,255,255,0.8)",
                  borderRadius: isMobileHubAi ? 16 : 32,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "rgba(0,0,0,0.03)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
                  padding: isMobileHubAi ? 16 : 32,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobileHubAi ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobileHubAi ? "stretch" : "center",
                    gap: isMobileHubAi ? 12 : 24,
                    marginBottom: 24,
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                    Grafik Tren{" "}
                    {
                      ANALYTICS_METRICS.find((m) => m.id === analyticsMetric)
                        ?.label
                    }
                  </h3>
                  <div
                    style={{
                      width: isMobileHubAi ? "100%" : "auto",
                      display: "flex",
                    }}
                  >
                    {isMobileHubAi ? (
                      <MobileStepper
                        value={analyticsMetric}
                        options={ANALYTICS_METRICS}
                        onChange={setAnalyticsMetric}
                        prefix="Metrik"
                      />
                    ) : (
                      <CustomDropdown
                        value={analyticsMetric}
                        options={ANALYTICS_METRICS}
                        onChange={setAnalyticsMetric}
                      />
                    )}
                  </div>
                </div>
                <div style={{ height: 300, width: "100%" }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={MOCK_CHART_DATA}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(44,32,22,0.05)"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "rgba(44,32,22,0.5)",
                          fontWeight: 600,
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "rgba(44,32,22,0.5)",
                          fontWeight: 600,
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 12,
                          borderWidth: 0,
                          borderStyle: "none",
                          boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
                          fontWeight: 700,
                        }}
                      />
                      {analyticsMetric === "all" && (
                        <Legend
                          iconType="circle"
                          wrapperStyle={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#2C2016",
                          }}
                        />
                      )}
                      {analyticsMetric === "all" ? (
                        <>
                          <Line
                            type="monotone"
                            dataKey="views"
                            name="Views"
                            stroke="var(--theme-primary)"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="reach"
                            name="Reach"
                            stroke="#2D7A5E"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="likes"
                            name="Likes"
                            stroke="#9C2B4E"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="comments"
                            name="Komentar"
                            stroke="#1877F2"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="shares"
                            name="Share"
                            stroke="#000"
                            strokeWidth={2}
                            dot={false}
                          />
                        </>
                      ) : (
                        <Line
                          type="monotone"
                          dataKey={analyticsMetric}
                          name={
                            ANALYTICS_METRICS.find(
                              (m) => m.id === analyticsMetric,
                            )?.label
                          }
                          stroke="var(--theme-primary)"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Audience & AI */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobileHubAi ? "1fr" : "2fr 1fr",
                  gap: 20,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: isMobileHubAi ? 16 : 32,
                    padding: isMobileHubAi ? 16 : 32,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(0,0,0,0.03)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobileHubAi ? "column" : "row",
                      justifyContent: "space-between",
                      alignItems: isMobileHubAi ? "stretch" : "center",
                      gap: isMobileHubAi ? 12 : 20,
                      marginBottom: 20,
                    }}
                  >
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                      Data Audiens
                    </h3>
                    <div
                      style={{
                        width: isMobileHubAi ? "100%" : "auto",
                        display: "flex",
                      }}
                    >
                      {isMobileHubAi ? (
                        <MobileStepper
                          value={audiencePlatform}
                          options={PLATFORMS}
                          onChange={setAudiencePlatform}
                          prefix="Platform"
                        />
                      ) : (
                        <CustomDropdown
                          value={audiencePlatform}
                          options={PLATFORMS}
                          onChange={setAudiencePlatform}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "rgba(44,32,22,0.5)",
                          marginBottom: 16,
                        }}
                      >
                        Demografi Geografis
                      </h4>
                      <div
                        style={{
                          height: 200,
                          width: "100%",
                          background: "#E5EDF8",
                          borderRadius: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            background:
                              "url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Indonesia_blank_map.svg') center center/contain no-repeat",
                            opacity: 0.5,
                          }}
                        />
                        <div
                          className="hover-scale"
                          style={{
                            position: "absolute",
                            top: "55%",
                            left: "30%",
                          }}
                        >
                          <MapPin
                            size={24}
                            color="var(--theme-primary)"
                            fill="white"
                          />
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: "white",
                              padding: "2px 4px",
                              borderRadius: 4,
                              color: "#2C2016",
                              position: "absolute",
                              top: 24,
                              left: -10,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Jakarta (45%)
                          </div>
                        </div>
                        <div
                          className="hover-scale"
                          style={{
                            position: "absolute",
                            top: "65%",
                            left: "45%",
                          }}
                        >
                          <MapPin
                            size={16}
                            color="var(--theme-primary)"
                            fill="white"
                          />
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: "white",
                              padding: "2px 4px",
                              borderRadius: 4,
                              color: "#2C2016",
                              position: "absolute",
                              top: 16,
                              left: -10,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Surabaya (15%)
                          </div>
                        </div>
                        <div
                          className="hover-scale"
                          style={{
                            position: "absolute",
                            top: "35%",
                            left: "15%",
                          }}
                        >
                          <MapPin
                            size={12}
                            color="var(--theme-primary)"
                            fill="white"
                          />
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: "white",
                              padding: "2px 4px",
                              borderRadius: 4,
                              color: "#2C2016",
                              position: "absolute",
                              top: 12,
                              left: -10,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Medan (10%)
                          </div>
                        </div>
                        <div
                          className="hover-scale"
                          style={{
                            position: "absolute",
                            top: "60%",
                            left: "75%",
                          }}
                        >
                          <MapPin
                            size={12}
                            color="var(--theme-primary)"
                            fill="white"
                          />
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: "white",
                              padding: "2px 4px",
                              borderRadius: 4,
                              color: "#2C2016",
                              position: "absolute",
                              top: 12,
                              left: -10,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Makassar (10%)
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "rgba(44,32,22,0.5)",
                          marginBottom: 16,
                        }}
                      >
                        Gender & Umur
                      </h4>
                      <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { age: "18-24", p: 40, l: 30 },
                              { age: "25-34", p: 35, l: 25 },
                              { age: "35-44", p: 15, l: 10 },
                            ]}
                            layout="vertical"
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              horizontal={false}
                              stroke="rgba(44,32,22,0.05)"
                            />
                            <XAxis type="number" hide />
                            <YAxis
                              dataKey="age"
                              type="category"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fontWeight: 800 }}
                              width={40}
                            />
                            <RechartsTooltip
                              cursor={{ fill: "transparent" }}
                              contentStyle={{
                                borderRadius: 8,
                                fontWeight: 700,
                                borderWidth: 0,
                                borderStyle: "none",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Bar
                              dataKey="p"
                              name="Perempuan"
                              fill="var(--theme-primary)"
                              radius={[0, 4, 4, 0]}
                              maxBarSize={16}
                            />
                            <Bar
                              dataKey="l"
                              name="Laki-laki"
                              fill="#2C2016"
                              radius={[0, 4, 4, 0]}
                              maxBarSize={16}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(var(--theme-primary-rgb), 0.05)",
                    borderRadius: isMobileHubAi ? 16 : 32,
                    padding: isMobileHubAi ? 16 : 32,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "rgba(var(--theme-primary-rgb), 0.1)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "var(--theme-primary)",
                      }}
                    >
                      <Sparkles size={18} /> Gemini AI
                    </h3>
                  </div>
                  <button
                    className="hover-scale"
                    onClick={generateReport}
                    disabled={aiLoading}
                    style={{
                      background: "var(--theme-primary)",
                      color: "white",
                      borderWidth: 0,
                      borderStyle: "none",
                      padding: "12px 16px",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      width: "100%",
                      marginBottom: 20,
                      flexShrink: 0,
                    }}
                  >
                    {aiLoading
                      ? "Gemini sedang berpikir..."
                      : "Analisis Insight Saat Ini"}
                  </button>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {aiReport ? (
                      <div
                        className="markdown-body"
                        style={{
                          fontSize: 14,
                          color: "#2C2016",
                          lineHeight: 1.6,
                        }}
                      >
                        <Markdown>{aiReport}</Markdown>
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          color: "rgba(44,32,22,0.5)",
                          marginTop: 40,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        Klik tombol di atas untuk mendapatkan analisa pakar dari
                        Gemini.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 24,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "rgba(44,32,22,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobileHubAi ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobileHubAi ? "stretch" : "center",
                    gap: isMobileHubAi ? 12 : 24,
                    marginBottom: 24,
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                    Best Time to Post (Heatmap)
                  </h3>
                  <div
                    style={{
                      width: isMobileHubAi ? "100%" : "auto",
                      display: "flex",
                    }}
                  >
                    {isMobileHubAi ? (
                      <MobileStepper
                        value={heatmapMetric}
                        options={[
                          { id: "views", label: "Berdasarkan Views" },
                          { id: "engagement", label: "Berdasarkan Engagement" },
                        ]}
                        onChange={setHeatmapMetric}
                        prefix="Metrik"
                      />
                    ) : (
                      <CustomDropdown
                        value={heatmapMetric}
                        options={[
                          { id: "views", label: "Berdasarkan Views" },
                          { id: "engagement", label: "Berdasarkan Engagement" },
                        ]}
                        onChange={setHeatmapMetric}
                      />
                    )}
                  </div>
                </div>
                <HeatmapMock />
              </div>
            </motion.div>
          

          
  );
}
