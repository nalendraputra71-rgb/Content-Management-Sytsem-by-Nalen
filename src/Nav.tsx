import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Layout,
  List,
  Clock,
  PieChart,
  Settings,
  Sun,
  Cloud,
  Edit2,
  Search,
  Share2,
  Pencil,
  Image,
  LogOut,
  Menu,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bell,
  Columns,
  Shield,
  X,
  MessageCircle,
  Activity,
  BarChart2,
  MessageSquare,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { eng, fmt, YEARS, B, I, TAB, MONTHS, CustomDropdown } from "./data";
import {
  useNotifications,
  NotificationToast,
  NotificationPanel,
} from "./NotificationSystem";
import { MenuToggle } from "./MenuToggle";

export function Header({ profile }: any) {
  const [time, setTime] = useState(new Date());
  const [clockMenu, setClockMenu] = useState(false);
  const [clockSettings, setClockSettings] = useState(() => {
    const saved = localStorage.getItem("workspace_clock");
    return saved ? JSON.parse(saved) : { type: "analog", format: 24 };
  });

  useEffect(() => {
    localStorage.setItem("workspace_clock", JSON.stringify(clockSettings));
  }, [clockSettings]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour = time.getHours();
  let greeting = "Selamat Malam";
  if (hour < 11) greeting = "Selamat Pagi";
  else if (hour < 15) greeting = "Selamat Siang";
  else if (hour < 19) greeting = "Selamat Sore";

  return (
    <div
      style={{
        padding: "32px 40px 16px 40px",
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        zIndex: 100,
        borderBottom: "1px solid rgba(44,32,22,0.06)",
        background: "transparent",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: 1,
          maxWidth: 800,
        }}
      >
        <h1
          style={{
            fontSize: 27,
            fontWeight: 900,
            color: "#2C2016",
            letterSpacing: "-1px",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {greeting},<br />
          <span style={{ color: "var(--theme-primary)" }}>
            {profile?.nickname || profile?.fullName?.split(" ")[0] || "Kreator"}
            ! ✨
          </span>
        </h1>
      </motion.div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            position: "relative",
          }}
        >
          {clockSettings.type === "analog" ? (
            <div
              onClick={() => setClockMenu(!clockMenu)}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "white",
                border: "4px solid #2C2016",
                position: "relative",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 5,
                  height: 5,
                  background: "#FF6B00",
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                }}
              />
              {/* Hour Hand */}
              <div
                style={{
                  position: "absolute",
                  top: "25%",
                  left: "calc(50% - 2px)",
                  width: 4,
                  height: "25%",
                  background: "#2C2016",
                  borderRadius: 4,
                  transformOrigin: "bottom center",
                  transform: `rotate(${(time.getHours() % 12) * 30 + time.getMinutes() * 0.5}deg)`,
                }}
              />
              {/* Minute Hand */}
              <div
                style={{
                  position: "absolute",
                  top: "15%",
                  left: "calc(50% - 1.5px)",
                  width: 3,
                  height: "35%",
                  background: "#666",
                  borderRadius: 3,
                  transformOrigin: "bottom center",
                  transform: `rotate(${time.getMinutes() * 6}deg)`,
                }}
              />
              {/* Second Hand */}
              <div
                style={{
                  position: "absolute",
                  top: "10%",
                  left: "calc(50% - 1px)",
                  width: 2,
                  height: "40%",
                  background: "#FF6B00",
                  borderRadius: 2,
                  transformOrigin: "bottom center",
                  transform: `rotate(${time.getSeconds() * 6}deg)`,
                }}
              />
            </div>
          ) : (
            <div
              onClick={() => setClockMenu(!clockMenu)}
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: "#2C2016",
                letterSpacing: "-1px",
                fontVariantNumeric: "tabular-nums",
                display: "flex",
                alignItems: "baseline",
                gap: 4,
                cursor: "pointer",
              }}
            >
              {time
                .toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: clockSettings.format === 12,
                })
                .replace(/\s?[APap][mM]/, "")
                .replace("::", ":")}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.4)",
                }}
              >
                {clockSettings.format === 12
                  ? time.getHours() >= 12
                    ? " PM"
                    : " AM"
                  : time.getSeconds().toString().padStart(2, "0")}
              </span>
            </div>
          )}

          <AnimatePresence>
            {clockMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 12,
                  background: "white",
                  padding: 16,
                  borderRadius: 16,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  minWidth: 200,
                  zIndex: 100,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "rgba(0,0,0,0.4)",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Tampilan Jam
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <button
                    onClick={() => {
                      setClockSettings({ ...clockSettings, type: "digital" });
                      setClockMenu(false);
                    }}
                    style={{
                      ...B(
                        clockSettings.type === "digital",
                        "var(--theme-primary)",
                      ),
                      padding: "8px 12px",
                      fontSize: 13,
                      borderRadius: 8,
                    }}
                  >
                    Jam Digital
                  </button>
                  <button
                    onClick={() => {
                      setClockSettings({ ...clockSettings, type: "analog" });
                      setClockMenu(false);
                    }}
                    style={{
                      ...B(
                        clockSettings.type === "analog",
                        "var(--theme-primary)",
                      ),
                      padding: "8px 12px",
                      fontSize: 13,
                      borderRadius: 8,
                    }}
                  >
                    Jam Analog
                  </button>
                </div>
                {clockSettings.type === "digital" && (
                  <>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "rgba(0,0,0,0.4)",
                        textTransform: "uppercase",
                        margin: "16px 0 12px 0",
                      }}
                    >
                      Format Waktu
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => {
                          setClockSettings({ ...clockSettings, format: 24 });
                          setClockMenu(false);
                        }}
                        style={{
                          ...B(
                            clockSettings.format === 24,
                            "var(--theme-primary)",
                          ),
                          flex: 1,
                          padding: "8px 0",
                          fontSize: 13,
                          borderRadius: 8,
                        }}
                      >
                        24 Jam
                      </button>
                      <button
                        onClick={() => {
                          setClockSettings({ ...clockSettings, format: 12 });
                          setClockMenu(false);
                        }}
                        style={{
                          ...B(
                            clockSettings.format === 12,
                            "var(--theme-primary)",
                          ),
                          flex: 1,
                          padding: "8px 0",
                          fontSize: 13,
                          borderRadius: 8,
                        }}
                      >
                        AM/PM
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ChatSupportPanel({
  onClose,
  userId,
  userEmail,
  userProfile,
}: {
  onClose: () => void;
  userId: string;
  userEmail: string;
  userProfile: any;
}) {
  const [view, setView] = useState<"form" | "history" | "thread">("form");
  const [ticketSubject, setTicketSubject] = useState("Pertanyaan/Bantuan Umum");
  const [ticketMsg, setTicketMsg] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let unsub: any;
    import("./firebase").then(
      ({ db, collection, query, where, onSnapshot }) => {
        const q = query(
          collection(db, "tickets"),
          where("userId", "==", userId),
        );
        unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort(
            (a: any, b: any) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          );
          setAllTickets(list);
          setInitialLoading(false);

          // Sync selected ticket if it's updated in thread view
          if (selectedTicket) {
            const current = list.find((t) => t.id === selectedTicket.id);
            if (current) setSelectedTicket(current);
          }
        }, (err) => {
          console.warn("Tickets onSnapshot error:", err);
        });
      },
    );
    return () => {
      if (unsub) unsub();
    };
  }, [userId, selectedTicket?.id]);

  const handleSendReply = async () => {
    const el = document.getElementById("chat_input") as HTMLInputElement;
    const text = el.value;
    if (!text || !selectedTicket) return;
    try {
      const { doc, updateDoc, db } = await import("./firebase");
      await updateDoc(doc(db, "tickets", selectedTicket.id), {
        messages: [
          ...(selectedTicket.messages || []),
          { sender: "user", text, timestamp: new Date().toISOString() },
        ],
        updatedAt: new Date().toISOString(),
      });
      el.value = "";
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSendForm = async () => {
    if (!ticketMsg) return;
    setLoading(true);
    try {
      const { collection, addDoc, db } = await import("./firebase");
      await addDoc(collection(db, "tickets"), {
        userId,
        userEmail,
        username: userProfile?.username || "",
        subject: ticketSubject,
        messages: [
          {
            sender: "user",
            text: ticketMsg,
            timestamp: new Date().toISOString(),
          },
        ],
        status: "open",
        updatedAt: new Date().toISOString(),
      });
      setShowSuccess(true);
      setTicketMsg("");
      setTimeout(() => {
        setShowSuccess(false);
        setView("history");
      }, 2000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 380,
        background: "white",
        borderRadius: 24,
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        border: "1px solid rgba(44,32,22,0.1)",
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "#2C2016",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
            Hubungi Support
          </h4>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            Kendala & Saran Konten
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {view !== "form" && (
            <button
              onClick={() => setView("form")}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                padding: "6px 12px",
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 700,
                color: "white",
                cursor: "pointer",
              }}
            >
              Kirim Baru
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
            }}
            className="hover-scale"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #EEE" }}>
        <button
          onClick={() => setView("form")}
          style={{
            flex: 1,
            padding: 14,
            border: "none",
            borderBottom: `3px solid ${view === "form" ? "var(--theme-primary)" : "transparent"}`,
            background: "white",
            fontSize: 12,
            fontWeight: 800,
            color: view === "form" ? "var(--theme-primary)" : "#999",
            cursor: "pointer",
          }}
        >
          Formulir
        </button>
        <button
          onClick={() => setView("history")}
          style={{
            flex: 1,
            padding: 14,
            border: "none",
            borderBottom: `3px solid ${view === "history" ? "var(--theme-primary)" : "transparent"}`,
            background: "white",
            fontSize: 12,
            fontWeight: 800,
            color: view === "history" ? "var(--theme-primary)" : "#999",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          Histori{" "}
          {allTickets.length > 0 && (
            <span
              style={{
                fontSize: 9,
                background: "#F5F5F5",
                padding: "2px 6px",
                borderRadius: 10,
              }}
            >
              {allTickets.length}
            </span>
          )}
        </button>
      </div>

      <div style={{ height: 400, overflowY: "auto", background: "#FAFAFA" }}>
        {view === "form" && (
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {showSuccess ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "#E5F4EE",
                    color: "#2D7A5E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    margin: "0 auto 16px",
                  }}
                >
                  ✓
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  Berhasil Dikirim!
                </h3>
                <p style={{ fontSize: 13, color: "#666" }}>
                  Laporan Anda telah kami terima.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#999",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Pilih Kategori
                  </label>
                  <CustomDropdown
                    value={ticketSubject}
                    onChange={setTicketSubject}
                    options={[
                      "Pertanyaan/Bantuan Umum",
                      "Saran & Masukan (Feedback)",
                      "Laporan Bug/Eror",
                      "Laporan Pembayaran",
                    ]}
                    style={{ ...I({}) }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#999",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Detail Masukan / Kendala
                  </label>
                  <textarea
                    value={ticketMsg}
                    onChange={(e) => setTicketMsg(e.target.value)}
                    placeholder="Tuliskan di sini..."
                    style={{
                      ...I({
                        minHeight: 150,
                        resize: "none",
                        fontFamily: "inherit",
                      }),
                    }}
                  />
                </div>
                <button
                  onClick={handleSendForm}
                  disabled={loading || !ticketMsg}
                  style={{
                    ...B(true),
                    width: "100%",
                    height: 48,
                    marginTop: 8,
                  }}
                >
                  {loading ? "Mengirim..." : "Kirim Sekarang"}
                </button>
              </>
            )}
          </div>
        )}

        {view === "history" && (
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {allTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTicket(t);
                  setView("thread");
                }}
                style={{
                  background: "white",
                  padding: 16,
                  borderRadius: 16,
                  border: "1px solid #EEE",
                  cursor: "pointer",
                }}
                className="hover-scale"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#CCC" }}>
                    #{t.id.slice(-6).toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      background: t.status === "open" ? "#E3F2FD" : "#F5F5F5",
                      color: t.status === "open" ? "#2196F3" : "#666",
                      padding: "2px 8px",
                      borderRadius: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    {t.status}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#2C2016",
                    marginBottom: 4,
                  }}
                >
                  {t.subject}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Clock size={12} />{" "}
                  {new Date(t.updatedAt).toLocaleDateString("id-ID", {
                    dateStyle: "medium",
                  })}
                </div>
                {t.messages.some((m: any) => m.sender === "admin") && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "8px 12px",
                      background: "rgba(76,175,80,0.05)",
                      borderRadius: 10,
                      fontSize: 11,
                      color: "#2D7A5E",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <MessageCircle size={14} /> Ada balasan dari admin
                  </div>
                )}
              </div>
            ))}
            {allTickets.length === 0 && (
              <div
                style={{
                  padding: 60,
                  textAlign: "center",
                  color: "#BBB",
                  fontSize: 13,
                }}
              >
                Belum ada histori kendala.
              </div>
            )}
          </div>
        )}

        {view === "thread" && selectedTicket && (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div
              style={{
                padding: 12,
                background: "white",
                borderBottom: "1px solid #EEE",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <button
                onClick={() => setView("history")}
                style={{
                  background: "#F5F5F5",
                  border: "none",
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                {selectedTicket.subject}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: 16,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {(selectedTicket.messages || []).map((m: any, i: number) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <div
                    style={{
                      background:
                        m.sender === "user" ? "var(--theme-primary)" : "white",
                      color: m.sender === "user" ? "white" : "#333",
                      padding: "10px 14px",
                      borderRadius:
                        m.sender === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      fontSize: 13,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      border: m.sender === "user" ? "none" : "1px solid #EEE",
                    }}
                  >
                    {m.text}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#999",
                      marginTop: 4,
                      textAlign: m.sender === "user" ? "right" : "left",
                    }}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                padding: 16,
                background: "white",
                borderTop: "1px solid #EEE",
                display: "flex",
                gap: 10,
              }}
            >
              <input
                id="chat_input"
                placeholder="Tulis balasan..."
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                style={{
                  flex: 1,
                  border: "1px solid #EEE",
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={handleSendReply}
                style={{
                  background: "var(--theme-primary)",
                  color: "white",
                  border: "none",
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Sidebar({
  open,
  setOpen,
  tab,
  setTab,
  workspaces,
  activeWorkspace,
  onWorkspaceSelect,
  user,
  profile,
  onLogout,
  title,
  onOpenSidebar,
  onLeaveWorkspace,
  onRenameWorkspace,
  onTitleChange,
}: any) {
  const navigate = useNavigate();
  const [showViews, setShowViews] = useState(true);
  const [showWorkspaces, setShowWorkspaces] = useState(true);
  const [showSocial, setShowSocial] = useState(true);
  const [renamingWs, setRenamingWs] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const VIEWS = [
    { id: "month", ic: <Calendar size={18} />, lb: "Bulan" },
    { id: "board", ic: <Layout size={18} />, lb: "Board" },
    { id: "timeline", ic: <Clock size={18} />, lb: "Timeline" },
    { id: "table", ic: <List size={18} />, lb: "Tabel" },
    { id: "analytics", ic: <PieChart size={18} />, lb: "Analitik" },
  ];

  const SOCIAL_STUDIO = [
    {
      id: "social-dashboard",
      ic: <Activity size={18} />,
      lb: "Overview",
      soon: true,
    },
    {
      id: "social-analytics",
      ic: <BarChart2 size={18} />,
      lb: "Analytics Expert",
      soon: true,
    },
    {
      id: "social-competitor",
      ic: <Search size={18} />,
      lb: "Analisis Kompetitor",
      soon: true,
    },
    {
      id: "social-calendar",
      ic: <Calendar size={18} />,
      lb: "Kalender Konten",
      soon: true,
    },
    {
      id: "social-inbox",
      ic: <MessageSquare size={18} />,
      lb: "Inbox & Komen",
      soon: true,
    },
    {
      id: "social-content",
      ic: <Layout size={18} />,
      lb: "Konten",
      soon: true,
    },
  ];

  const isSuperAdmin =
    profile?.role === "admin" ||
    profile?.email?.toLowerCase() === "nalendraputra71@gmail.com" ||
    user?.email?.toLowerCase() === "nalendraputra71@gmail.com";
  const EXTRA = [
    { id: "settings", ic: <Settings size={18} />, lb: "Pengaturan" },
    ...(isSuperAdmin
      ? [
          {
            id: "admin",
            ic: <Shield size={18} />,
            lb: "Admin Panel",
            super: true,
          },
        ]
      : []),
  ];

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showChatSupport, setShowChatSupport] = useState(false);
  const { notifications, setNotifications, toast, setToast } =
    useNotifications(profile);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    if (id.startsWith("ticket_")) {
      const dbId = id.replace("ticket_", "");
      try {
        const { doc, updateDoc, db } = await import("./firebase");
        await updateDoc(doc(db, "tickets", dbId), { readByUser: true });
        // Also open chat support so they can reply
        setShowNotifPanel(false);
        setShowChatSupport(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const [leavingWs, setLeavingWs] = useState<any>(null);

  return (
    <>
      <NotificationToast
        toast={toast}
        onClose={() => setToast(null)}
        onClick={() => {
          setShowNotifPanel(true);
          setOpen(true);
        }}
      />
      <motion.div
        initial={false}
        animate={{ width: open ? 270 : 64 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          background: "var(--theme-sidebar)",
          color: "#FAFAFA",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          height: "100vh",
          position: "sticky",
          top: 0,
          zIndex: 200,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            minWidth: open ? 270 : 64,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            style={{
              padding: "24px 16px",
              borderBottom: open ? "1px solid rgba(255,255,255,0.05)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                justifyContent: "flex-start",
                width: "100%",
              }}
            >
              <div
                style={{ width: 32, display: "flex", justifyContent: "center" }}
              >
                <MenuToggle isOpen={open} toggle={() => setOpen(!open)} />
              </div>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                  >
                    {editingTitle ? (
                      <input
                        autoFocus
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        onBlur={() => {
                          setEditingTitle(false);
                          if (
                            titleValue.trim() &&
                            titleValue.trim() !== title &&
                            onTitleChange
                          ) {
                            onTitleChange(titleValue.trim());
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditingTitle(false);
                            if (
                              titleValue.trim() &&
                              titleValue.trim() !== title &&
                              onTitleChange
                            ) {
                              onTitleChange(titleValue.trim());
                            }
                          } else if (e.key === "Escape") {
                            setEditingTitle(false);
                          }
                        }}
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          letterSpacing: "-1px",
                          color: "#ffffff",
                          background: "rgba(255,255,255,0.1)",
                          border: "none",
                          outline: "none",
                          borderRadius: 4,
                          width: "100%",
                          padding: "0 4px",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          letterSpacing: "-1px",
                          color: "#ffffff",
                          cursor: "text",
                        }}
                        onClick={() => {
                          setTitleValue(title || "Hubify");
                          setEditingTitle(true);
                        }}
                      >
                        {title || "Hubify"}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {open && (
              <div style={{ position: "absolute", right: 20 }}>
                <button
                  onClick={() => setShowNotifPanel(!showNotifPanel)}
                  style={{
                    background: "none",
                    border: "none",
                    color: showNotifPanel
                      ? "var(--theme-primary)"
                      : "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    display: "flex",
                    position: "relative",
                  }}
                  className="hover-scale"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        background: "var(--theme-primary)",
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                      }}
                    />
                  )}
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto", flex: 1 }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  minHeight: 0,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    overflowX: "hidden",
                    transition: "opacity 0.2s ease",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {showNotifPanel ? (
                      <motion.div
                        key="notif"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          width: 270,
                        }}
                      >
                        <NotificationPanel
                          notifications={notifications}
                          onClose={() => setShowNotifPanel(false)}
                          onRead={handleRead}
                          onContactSupport={() => {
                            setShowNotifPanel(false);
                            setShowChatSupport(true);
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        style={{ padding: "20px 16px" }}
                      >
                        {/* Workspaces Section */}
                        <div style={{ marginBottom: 24 }}>
                          <div
                            onClick={() => setShowWorkspaces(!showWorkspaces)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              marginBottom: open ? 8 : 0,
                              padding: "0 8px",
                              opacity: open ? 1 : 0,
                              height: open ? "auto" : 0,
                              pointerEvents: open ? "auto" : "none",
                              overflow: "hidden",
                            }}
                          >
                            <label
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.3)",
                                textTransform: "uppercase",
                                letterSpacing: 1.5,
                                cursor: "pointer",
                              }}
                            >
                              Workspaces
                            </label>
                            {showWorkspaces ? (
                              <ChevronUp
                                size={14}
                                color="rgba(255,255,255,0.3)"
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                color="rgba(255,255,255,0.3)"
                              />
                            )}
                          </div>

                          <AnimatePresence>
                            {(showWorkspaces || !open) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 8,
                                  overflow: "hidden",
                                }}
                              >
                                {workspaces.map((ws: any) => {
                                  const isOwner =
                                    ws.ownerId === user?.uid ||
                                    ws.createdBy === user?.uid;
                                  return (
                                    <div
                                      key={ws.id}
                                      style={{ position: "relative" }}
                                      className="group"
                                    >
                                      <button
                                        className="hover-scale"
                                        onClick={() => {
                                          onWorkspaceSelect(ws);
                                          if (!open) setOpen(true);
                                        }}
                                        onDoubleClick={(e) => {
                                          if (isOwner && onRenameWorkspace) {
                                            e.stopPropagation();
                                            setRenamingWs(ws.id);
                                            setRenameValue(ws.name);
                                          }
                                        }}
                                        style={{
                                          width: "100%",
                                          textAlign: "left",
                                          background:
                                            activeWorkspace?.id === ws.id
                                              ? "var(--theme-gradient)"
                                              : "transparent",
                                          border: "none",
                                          borderRadius: 12,
                                          padding: open
                                            ? "10px 14px"
                                            : "10px 8px",
                                          color:
                                            activeWorkspace?.id === ws.id
                                              ? "white"
                                              : "#FAFAFA",
                                          fontSize: 13,
                                          fontWeight: 600,
                                          cursor: "pointer",
                                          transition: "all 0.3s ease",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 12,
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: 32,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexShrink: 0,
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: 24,
                                              height: 24,
                                              borderRadius: 6,
                                              background:
                                                activeWorkspace?.id === ws.id
                                                  ? "rgba(255,255,255,0.2)"
                                                  : "rgba(255,255,255,0.05)",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: 11,
                                              fontWeight: 800,
                                            }}
                                          >
                                            {ws.name.charAt(0).toUpperCase()}
                                          </div>
                                        </div>
                                        <AnimatePresence>
                                          {open && (
                                            <motion.div
                                              initial={{ opacity: 0, width: 0 }}
                                              animate={{
                                                opacity: 1,
                                                width: "auto",
                                              }}
                                              exit={{ opacity: 0, width: 0 }}
                                              style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                flex: 1,
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              {renamingWs === ws.id ? (
                                                <input
                                                  autoFocus
                                                  value={renameValue}
                                                  onChange={(e) =>
                                                    setRenameValue(
                                                      e.target.value,
                                                    )
                                                  }
                                                  onBlur={() => {
                                                    if (
                                                      onRenameWorkspace &&
                                                      renameValue.trim() &&
                                                      renameValue.trim() !==
                                                        ws.name
                                                    ) {
                                                      onRenameWorkspace(
                                                        ws.id,
                                                        renameValue.trim(),
                                                      );
                                                    }
                                                    setRenamingWs(null);
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                      if (
                                                        onRenameWorkspace &&
                                                        renameValue.trim() &&
                                                        renameValue.trim() !==
                                                          ws.name
                                                      ) {
                                                        onRenameWorkspace(
                                                          ws.id,
                                                          renameValue.trim(),
                                                        );
                                                      }
                                                      setRenamingWs(null);
                                                    } else if (
                                                      e.key === "Escape"
                                                    ) {
                                                      setRenamingWs(null);
                                                    }
                                                  }}
                                                  style={{
                                                    width: "100%",
                                                    background:
                                                      "rgba(255,255,255,0.2)",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: 4,
                                                    padding: "2px 6px",
                                                    outline: "none",
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                  }}
                                                />
                                              ) : (
                                                <>
                                                  <span
                                                    style={{
                                                      flex: 1,
                                                      overflow: "hidden",
                                                      textOverflow: "ellipsis",
                                                    }}
                                                  >
                                                    {ws.name}
                                                  </span>
                                                  {isOwner && (
                                                    <div
                                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setRenamingWs(ws.id);
                                                        setRenameValue(ws.name);
                                                      }}
                                                      style={{
                                                        padding: 4,
                                                        borderRadius: 4,
                                                        background:
                                                          "rgba(255,255,255,0.1)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                          "center",
                                                      }}
                                                    >
                                                      <Edit2 size={12} />
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </button>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Dashboard Section */}
                        <div style={{ marginBottom: 24 }}>
                          <button
                            className="hover-scale"
                            onClick={() => {
                              setTab("dashboard");
                              if (!open) setOpen(true);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              background:
                                tab === "dashboard"
                                  ? "var(--theme-gradient)"
                                  : "transparent",
                              border: "none",
                              padding: open ? "10px 14px" : "10px 8px",
                              color:
                                tab === "dashboard"
                                  ? "white"
                                  : "rgba(255,255,255,0.7)",
                              borderRadius: 12,
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Layout
                                size={18}
                                style={{ transform: "rotate(90deg)" }}
                              />
                            </div>
                            <AnimatePresence>
                              {open && (
                                <motion.span
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: "auto" }}
                                  exit={{ opacity: 0, width: 0 }}
                                  style={{
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    flex: 1,
                                  }}
                                >
                                  Dashboard
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>

                        {/* Content Planner Section */}
                        <div style={{ marginBottom: 24 }}>
                          <div
                            onClick={() => setShowViews(!showViews)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              marginBottom: open ? 8 : 0,
                              padding: "0 8px",
                              opacity: open ? 1 : 0,
                              height: open ? "auto" : 0,
                              pointerEvents: open ? "auto" : "none",
                              overflow: "hidden",
                            }}
                          >
                            <label
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.3)",
                                textTransform: "uppercase",
                                letterSpacing: 1.5,
                                cursor: "pointer",
                              }}
                            >
                              Content Planner
                            </label>
                            {showViews ? (
                              <ChevronUp
                                size={14}
                                color="rgba(255,255,255,0.3)"
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                color="rgba(255,255,255,0.3)"
                              />
                            )}
                          </div>

                          <AnimatePresence>
                            {(showViews || !open) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                  overflow: "hidden",
                                }}
                              >
                                {VIEWS.map((v) => (
                                  <button
                                    className="hover-scale"
                                    key={v.id}
                                    onClick={() => {
                                      setTab(v.id);
                                      if (!open) setOpen(true);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                      width: "100%",
                                      padding: open ? "10px 14px" : "10px 8px",
                                      background:
                                        tab === v.id
                                          ? "rgba(255,255,255,0.1)"
                                          : "transparent",
                                      border: "none",
                                      borderRadius: 12,
                                      color:
                                        tab === v.id
                                          ? "white"
                                          : "rgba(250,247,242,0.6)",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 32,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexShrink: 0,
                                        color:
                                          tab === v.id
                                            ? "var(--theme-primary)"
                                            : "currentColor",
                                      }}
                                    >
                                      {v.ic}
                                    </div>
                                    <AnimatePresence>
                                      {open && (
                                        <motion.span
                                          initial={{ opacity: 0, width: 0 }}
                                          animate={{
                                            opacity: 1,
                                            width: "auto",
                                          }}
                                          exit={{ opacity: 0, width: 0 }}
                                          style={{
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            flex: 1,
                                            textAlign: "left",
                                          }}
                                        >
                                          <span
                                            style={{
                                              fontSize: 13,
                                              fontWeight:
                                                tab === v.id ? 700 : 500,
                                            }}
                                          >
                                            {v.lb}
                                          </span>
                                        </motion.span>
                                      )}
                                    </AnimatePresence>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Social Studio Section */}
                        <div style={{ marginBottom: 24 }}>
                          <div
                            onClick={() => setShowSocial(!showSocial)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                              marginBottom: open ? 8 : 0,
                              padding: "0 8px",
                              opacity: open ? 1 : 0,
                              height: open ? "auto" : 0,
                              pointerEvents: open ? "auto" : "none",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <label
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: "rgba(255,255,255,0.3)",
                                  textTransform: "uppercase",
                                  letterSpacing: 1.5,
                                  cursor: "pointer",
                                }}
                              >
                                Social Studio
                              </label>
                            </div>
                            {showSocial ? (
                              <ChevronUp
                                size={14}
                                color="rgba(255,255,255,0.3)"
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                color="rgba(255,255,255,0.3)"
                              />
                            )}
                          </div>

                          <AnimatePresence>
                            {(showSocial || !open) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 2,
                                  overflow: "hidden",
                                }}
                              >
                                {SOCIAL_STUDIO.map((v: any) => (
                                  <button
                                    className="hover-scale"
                                    key={v.id}
                                    onClick={() => {
                                      setTab(v.id);
                                      if (!open) setOpen(true);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                      width: "100%",
                                      padding: open ? "10px 14px" : "10px 8px",
                                      background:
                                        tab === v.id
                                          ? "rgba(255,255,255,0.1)"
                                          : "transparent",
                                      border: "none",
                                      borderRadius: 12,
                                      color:
                                        tab === v.id
                                          ? "white"
                                          : "rgba(250,247,242,0.6)",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                      position: "relative",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 32,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexShrink: 0,
                                        color:
                                          tab === v.id
                                            ? "white"
                                            : "rgba(255,255,255,0.5)",
                                      }}
                                    >
                                      {v.ic}
                                    </div>
                                    <AnimatePresence>
                                      {open && (
                                        <>
                                          <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{
                                              opacity: 1,
                                              width: "auto",
                                            }}
                                            exit={{ opacity: 0, width: 0 }}
                                            style={{
                                              overflow: "hidden",
                                              whiteSpace: "nowrap",
                                              flex: 1,
                                              textAlign: "left",
                                            }}
                                          >
                                            <span
                                              style={{
                                                fontSize: 13,
                                                fontWeight:
                                                  tab === v.id ? 700 : 500,
                                              }}
                                            >
                                              {v.lb}
                                            </span>
                                          </motion.span>
                                          {v.soon && (
                                            <motion.span
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              exit={{ opacity: 0 }}
                                              style={{
                                                position: "absolute",
                                                right: 10,
                                                background:
                                                  "rgba(255,255,255,0.2)",
                                                color: "white",
                                                padding: "2px 6px",
                                                borderRadius: 4,
                                                fontSize: 8,
                                                fontWeight: 900,
                                                letterSpacing: 0.5,
                                              }}
                                            >
                                              SOON
                                            </motion.span>
                                          )}
                                        </>
                                      )}
                                    </AnimatePresence>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Extras Section (Analytics/Settings) */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          {EXTRA.map((v: any) => (
                            <button
                              className="hover-scale"
                              key={v.id}
                              onClick={() => {
                                setTab(v.id);
                                if (!open) setOpen(true);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                width: "100%",
                                padding: open ? "10px 14px" : "10px 8px",
                                background:
                                  tab === v.id
                                    ? "rgba(255,255,255,0.1)"
                                    : "transparent",
                                border: "none",
                                borderRadius: 12,
                                color:
                                  tab === v.id
                                    ? "white"
                                    : "rgba(250,247,242,0.6)",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  flexShrink: 0,
                                  color:
                                    tab === v.id
                                      ? "var(--theme-primary)"
                                      : "currentColor",
                                }}
                              >
                                {v.ic}
                              </div>
                              <AnimatePresence>
                                {open && (
                                  <>
                                    <motion.span
                                      initial={{ opacity: 0, width: 0 }}
                                      animate={{ opacity: 1, width: "auto" }}
                                      exit={{ opacity: 0, width: 0 }}
                                      style={{
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        flex: 1,
                                        textAlign: "left",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: 13,
                                          fontWeight: tab === v.id ? 700 : 500,
                                        }}
                                      >
                                        {v.lb}
                                      </span>
                                    </motion.span>
                                    {v.beta && (
                                      <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                          position: "absolute",
                                          right: 10,
                                          background: "#9C2B4E",
                                          color: "white",
                                          fontSize: 8,
                                          padding: "2px 6px",
                                          borderRadius: 4,
                                          fontWeight: 800,
                                          letterSpacing: 0.5,
                                        }}
                                      >
                                        BETA
                                      </motion.span>
                                    )}
                                    {v.super && (
                                      <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                          position: "absolute",
                                          right: 10,
                                          background: "#2D7A5E",
                                          color: "white",
                                          fontSize: 8,
                                          padding: "2px 6px",
                                          borderRadius: 4,
                                          fontWeight: 800,
                                          letterSpacing: 0.5,
                                        }}
                                      >
                                        SUPER
                                      </motion.span>
                                    )}
                                  </>
                                )}
                              </AnimatePresence>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  style={{
                    padding: "20px 16px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    onClick={() => {
                      navigate("/profile");
                    }}
                    className="hover-scale"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={
                          profile?.avatar ||
                          user?.photoURL ||
                          `https://ui-avatars.com/api/?name=${user?.displayName}`
                        }
                        alt="avatar"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 12,
                          border: "2px solid var(--theme-primary)",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <motion.div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "baseline",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "white",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {profile?.fullName || user?.displayName || "User"}
                        </span>
                        <span
                          style={{
                            background:
                              profile?.plan === "vip"
                                ? "#FBC02D"
                                : profile?.activeUntil &&
                                    new Date(profile.activeUntil) > new Date()
                                  ? "var(--theme-primary)"
                                  : "#9C2B4E",
                            color:
                              profile?.plan === "vip" ? "#2C2016" : "white",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 9,
                            fontWeight: 900,
                            flexShrink: 0,
                            lineHeight: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 2,
                          }}
                        >
                          {profile?.plan === "vip" && <Crown size={10} />}
                          {profile?.plan === "vip"
                            ? "VIP"
                            : profile?.activeUntil &&
                                new Date(profile.activeUntil) > new Date()
                              ? "PRO"
                              : "FREE"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.4)",
                          fontWeight: 600,
                          marginTop: 4,
                        }}
                      >
                        Pengaturan Profil
                      </div>
                    </motion.div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-hover hover-scale"
                    style={{
                      width: "100%",
                      background: "rgba(156, 43, 78, 0.1)",
                      border: "1.5px solid rgba(156, 43, 78, 0.2)",
                      borderRadius: 12,
                      padding: "10px",
                      color: "#E57373",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        width: "auto",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <LogOut size={14} />
                    </div>
                    <motion.span
                      style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                    >
                      LOG OUT / KELUAR
                    </motion.span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout Confirm Modal */}
          <AnimatePresence>
            {showLogoutConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(5px)",
                  zIndex: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  style={{
                    background: "white",
                    padding: 30,
                    borderRadius: 20,
                    width: 320,
                    textAlign: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#2C2016",
                      marginBottom: 12,
                      whiteSpace: "normal",
                    }}
                  >
                    Keluar dari sistem?
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(44,32,22,0.6)",
                      marginBottom: 24,
                      whiteSpace: "normal",
                    }}
                  >
                    Apakah Anda yakin ingin keluar dari akun Anda?
                  </p>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 12,
                        background: "#FAFAFA",
                        border: "1px solid rgba(44,32,22,0.1)",
                        fontWeight: 600,
                        color: "#2C2016",
                        cursor: "pointer",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmLogout}
                      style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 12,
                        background: "#9C2B4E",
                        border: "none",
                        fontWeight: 600,
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Keluar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Support Window Prototype */}
          <AnimatePresence>
            {showChatSupport && user?.uid && (
              <ChatSupportPanel
                onClose={() => setShowChatSupport(false)}
                userId={user.uid}
                userEmail={profile?.email}
                userProfile={profile}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

function ColsIcon({ size }: any) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid currentColor",
        borderRadius: 2,
        display: "flex",
      }}
    >
      <div style={{ flex: 1, borderRight: "1px solid currentColor" }} />
      <div style={{ flex: 1 }} />
    </div>
  );
}

export function NavBar({
  tab,
  setTab,
  year,
  setYear,
  month,
  setMonth,
  onOpenAdd,
  search,
  onSearch,
  onShare,
  sidebarOpen,
}: any) {
  const [localSearchOpen, setLocalSearchOpen] = useState(!sidebarOpen);

  useEffect(() => {
    setLocalSearchOpen(!sidebarOpen);
  }, [sidebarOpen]);

  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid rgba(44,32,22,0.06)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: "24px 24px 16px 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(0,0,0,0.4)",
              textTransform: "uppercase",
              paddingLeft: 4,
              marginTop: 4,
            }}
          >
            Tahun
          </label>
          <div style={{ width: 120 }}>
            <CustomDropdown
              value={String(year)}
              options={YEARS.map((y) => String(y))}
              onChange={(v: any) => setYear(+v)}
              style={{ padding: "10px 14px", borderRadius: 12 }}
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(0,0,0,0.4)",
              textTransform: "uppercase",
              paddingLeft: 4,
              marginTop: 4,
            }}
          >
            Bulan
          </label>
          <div style={{ width: 140 }}>
            <CustomDropdown
              value={String(month)}
              options={MONTHS.map((m, i) => ({ id: String(i + 1), name: m }))}
              onChange={(v: any) => setMonth(+v)}
              style={{ padding: "10px 14px", borderRadius: 12 }}
            />
          </div>
        </div>
        <button
          className="hover-scale btn-hover shadow-lg"
          onClick={onOpenAdd}
          style={{
            ...B(true, "var(--theme-primary)"),
            height: 44,
            padding: "0 24px",
            borderRadius: 22,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "none",
            color: "white",
            fontWeight: 700,
            marginLeft: 8,
            boxShadow: "0 6px 16px rgba(156,43,78,0.2)",
            flexShrink: 0,
            marginBottom: 2,
          }}
        >
          <Plus size={20} /> Konten Baru
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 2,
          marginLeft: 8,
        }}
      >
        <motion.div
          animate={{
            width: localSearchOpen ? 220 : 44,
            padding: localSearchOpen ? "10px 16px" : "10px",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "white",
            borderRadius: 22,
            border: "1px solid rgba(0,0,0,0.1)",
            overflow: "hidden",
            cursor: !localSearchOpen ? "pointer" : "text",
            flexShrink: 0,
            height: 44,
          }}
          onClick={() => {
            if (!localSearchOpen) setLocalSearchOpen(true);
          }}
        >
          <Search
            size={18}
            style={{
              opacity: 0.5,
              flexShrink: 0,
              color: "#2C2016",
              margin: !localSearchOpen ? "auto" : "0",
            }}
            onClick={(e) => {
              if (localSearchOpen && !search) {
                e.stopPropagation();
                setLocalSearchOpen(false);
              }
            }}
          />
          <AnimatePresence>
            {localSearchOpen && (
              <motion.input
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#2C2016",
                  fontSize: 13,
                }}
                className="focus-ring"
                value={search}
                onChange={(e: any) => onSearch && onSearch(e.target.value)}
                placeholder="Cari konten..."
                autoFocus
              />
            )}
          </AnimatePresence>
        </motion.div>
        <button
          className="hover-scale btn-hover shadow-sm"
          onClick={onShare}
          style={{
            background: "var(--theme-primary)",
            border: "none",
            borderRadius: 22,
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
          }}
          title="Bagikan Link Workspace"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}

export function FilterBar({
  filters,
  setFilters,
  pillars,
  platforms,
  pics,
  statuses,
  showHolidays,
  setShowHolidays,
  showArchived,
  setShowArchived,
  onImportClick,
}: any) {
  const set = (k: any, v: any) => setFilters((p: any) => ({ ...p, [k]: v }));
  return (
    <div
      style={{
        background: "#FAFAFA",
        borderBottom: "1px solid rgba(44,32,22,0.05)",
        padding: "16px 24px",
        display: "flex",
        gap: 24,
        alignItems: "flex-end",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {[
          ["Pillar", pillars, "pillar"],
          ["Platform", platforms, "platform"],
          ["PIC", pics, "pic"],
        ].map(([l, opt, key]) => (
          <div
            key={key as string}
            style={{
              width: 160,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(0,0,0,0.4)",
                textTransform: "uppercase",
                paddingLeft: 4,
              }}
            >
              {l as string}
            </label>
            <CustomDropdown
              value={filters[key as string]}
              options={[{ id: "All", name: `Semua ${l}` }, ...(opt as any[])]}
              onChange={(v) => set(key, v)}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                fontSize: 13,
                background: "white",
              }}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <button
          className="hover-scale"
          onClick={() => setShowHolidays((v: any) => !v)}
          style={{
            ...B(false, "#2C2016"),
            background: showHolidays ? "rgba(44,32,22,0.05)" : "transparent",
            borderColor: showHolidays
              ? "rgba(44,32,22,0.2)"
              : "rgba(44,32,22,0.1)",
            fontSize: 12,
            padding: "8px 16px",
            borderRadius: 20,
          }}
        >
          {showHolidays ? "Tampil" : "Sembunyi"} Hari Besar
        </button>
        <button
          className="hover-scale"
          onClick={() => setShowArchived((v: any) => !v)}
          style={{
            ...B(false, "var(--theme-primary)"),
            background: showArchived ? "var(--theme-primary)11" : "transparent",
            borderColor: showArchived
              ? "var(--theme-primary)44"
              : "rgba(44,32,22,0.1)",
            fontSize: 12,
            padding: "8px 16px",
            borderRadius: 20,
          }}
        >
          📦 Arsip
        </button>
      </div>
      <div style={{ flex: 1 }} />
      <button
        className="hover-scale btn-hover"
        onClick={onImportClick}
        style={{
          ...B(false, "#2C2016"),
          background: "white",
          border: "1px solid rgba(44,32,22,0.1)",
          height: 38,
          padding: "0 16px",
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 2,
        }}
      >
        <Plus size={16} style={{ opacity: 0.6 }} /> Import CSV
      </button>
    </div>
  );
}
