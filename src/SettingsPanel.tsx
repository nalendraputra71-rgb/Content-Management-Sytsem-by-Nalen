import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "./i18n";
import { I, B, CARD, THEMES } from "./data";
import { ColorPickerSelect } from "./components/ColorPickerSelect";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  db,
  googleProvider,
  signOut,
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
  sendEmailVerification,
  doc,
  deleteDoc,
  updateDoc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  limit,
  increment,
} from "./firebase";
import {
  User,
  Shield,
  CreditCard,
  Save,
  ArrowLeft,
  Pencil,
  Crown,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  History,
  X,
  Trash2,
  LogOut,
  Palette,
  Layers,
  Smartphone,
  Users,
  ClipboardList,
  Settings,
  HardDrive,
  Globe,
  Plus,
  RefreshCw,
  Edit3,
  Check,
  Building2,
  CalendarDays,
  Tag,
  GripVertical,
  Bell,
  MessageCircle,
} from "lucide-react";
import { NotificationPanel, useNotifications } from "./NotificationSystem";
import { ChatSupportPanel } from "./Nav";

export const HOLIDAY_API_OPTIONS = [
  { id: "id-skb", name: "Indonesia (Libur Nasional & Cuti Bersama)", country: "ID", color: "#E11D48", isCustomApi: true },
  { id: "id-id-observances", name: "Indonesia (Hari Peringatan Nasional)", country: "ID", color: "#6366F1", isCustomApi: true },
  { id: "id-int-observances", name: "Internasional (Hari Peringatan Global)", country: "ID", color: "#4F46E5", isCustomApi: true },
  { id: "us", name: "United States (US Holidays)", country: "US", color: "#2563EB" },
  { id: "sg", name: "Singapore (SG Holidays)", country: "SG", color: "#059669" },
  { id: "my", name: "Malaysia (MY Holidays)", country: "MY", color: "#D97706" },
  { id: "jp", name: "Japan (JP Holidays)", country: "JP", color: "#7C3AED" },
  { id: "gb", name: "United Kingdom (UK Holidays)", country: "GB", color: "#0891B2" },
];

function formatIndonesiaDate(ymdString: string) {
  const parts = ymdString.split("-");
  if (parts.length !== 3) return ymdString;
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const y = parts[0];
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(m) || isNaN(d) || m < 1 || m > 12) return ymdString;
  return `${d} ${months[m - 1]} ${y}`;
}

type TabCategory =
  | "profile"
  | "billing"
  | "security"
  | "workspace"
  | "visual"
  | "pillars"
  | "contentTypes"
  | "pics"
  | "statuses"
  | "holidays"
  | "language"
  | "danger"
  | "notifications"
  | "support";

export function SettingsPanel({
  initialSettings,
  onSave,
  onSeed,
  isRestricted,
  profile,
  onUpdateProfile,
  onDirty,
  onLeave,
  onDelete,
  isOwner,
  planDetails,
  activeWorkspace,
  onBack,
}: any) {
  const navigate = useNavigate();
  const { lang, setLang } = useI18n();
  const [activeTab, setActiveTab] = useState<TabCategory>("profile");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const handleOpenTab = (e: any) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener("openSettingsTab", handleOpenTab);
    return () => window.removeEventListener("openSettingsTab", handleOpenTab);
  }, []);

  // Mobile layout check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ---------------- USER PROFILE STATE ----------------
  const [name, setName] = useState(profile?.fullName || "");
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [userName, setUserName] = useState(profile?.username || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Security
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [emailStatusMsg, setEmailStatusMsg] = useState("");

  // Billing & Invoices
  const [showTxModal, setShowTxModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Danger Zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [showDeleteWorkspaceConfirm, setShowDeleteWorkspaceConfirm] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthError, setReauthError] = useState("");

  const DELETE_REASONS = [
    "Terlalu mahal",
    "Fitur kurang lengkap",
    "Susah digunakan",
    "Hanya mencoba / tidak butuh lagi",
    "Lainnya",
  ];

  // ---------------- WORKSPACE CONFIGURATION STATE ----------------
  const transformInit = (arr: any[]) =>
    (arr || []).map((x: any) => {
      const isStr = typeof x === "string";
      return {
        name: isStr ? x : x.name,
        color: isStr ? "var(--theme-primary)" : x.color,
        light: isStr ? undefined : x.light,
        _originalName: isStr ? x : x.name,
      };
    });

  const [wsTitle, setWsTitle] = useState(activeWorkspace?.name || activeWorkspace?.settings?.title || "");
  const [wsTagline, setWsTagline] = useState(activeWorkspace?.settings?.tagline || "");

  const [localPillars, setLocalPillars] = useState(() => transformInit(initialSettings?.pillars));
  const [localPlatforms, setLocalPlatforms] = useState(() => transformInit(initialSettings?.platforms));
  const [localContentTypes, setLocalContentTypes] = useState(() => transformInit(initialSettings?.contentTypes));
  const [localPics, setLocalPics] = useState(() => transformInit(initialSettings?.pics));
  const [localStatuses, setLocalStatuses] = useState(() => transformInit(initialSettings?.statuses));
  const [localHolidays, setLocalHolidays] = useState(initialSettings?.holidays || {});
  const [localHolidayApis, setLocalHolidayApis] = useState(initialSettings?.holidayApis || []);
  const [localCustomEvents, setLocalCustomEvents] = useState(initialSettings?.customEvents || []);
  const [localShowHolidays, setLocalShowHolidays] = useState(initialSettings?.showHolidays ?? true);

  const [newVal, setNewVal] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [newHKey, setNewHKey] = useState("");
  const [newHVal, setNewHVal] = useState("");

  const [newEvName, setNewEvName] = useState("");
  const [newEvColor, setNewEvColor] = useState("#3B82F6");
  const [newEvStart, setNewEvStart] = useState("");
  const [newEvEnd, setNewEvEnd] = useState("");
  const [newEvMonthly, setNewEvMonthly] = useState(false);

  const [editingEvId, setEditingEvId] = useState<string | null>(null);
  const [editEvName, setEditEvName] = useState("");
  const [editEvColor, setEditEvColor] = useState("");
  const [editEvStart, setEditEvStart] = useState("");
  const [editEvEnd, setEditEvEnd] = useState("");
  const [editEvMonthly, setEditEvMonthly] = useState(false);

  const [savingWs, setSavingWs] = useState(false);
  const [saveWsSuccess, setSaveWsSuccess] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);

  // NOTIFICATIONS
  const {
    notifications,
    setNotifications,
    toast,
    setToast,
    deleteNotif,
    deleteAll,
    markAllRead,
    handleInviteAction,
  } = useNotifications(profile, activeTab === "notifications");

  const handleReadNotif = async (id: string) => {
    setNotifications((prev: any) =>
      prev.map((n: any) => (n.id === id ? { ...n, unread: false } : n)),
    );
    if (id.startsWith("ticket_")) {
      const dbId = id.replace("ticket_", "");
      try {
        await updateDoc(doc(db, "tickets", dbId), { readByUser: true });
        setActiveTab("support");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Sync profile state when profile prop changes
  useEffect(() => {
    if (profile) {
      setName(profile.fullName || "");
      setNickname(profile.nickname || "");
      setUserName(profile.username || "");
    }
  }, [profile]);

  // Sync workspace settings when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setLocalPillars(transformInit(initialSettings.pillars));
      setLocalPlatforms(transformInit(initialSettings.platforms));
      setLocalContentTypes(transformInit(initialSettings.contentTypes));
      setLocalPics(transformInit(initialSettings.pics));
      setLocalStatuses(transformInit(initialSettings.statuses));
      setLocalHolidays(initialSettings.holidays || {});
      setLocalHolidayApis(initialSettings.holidayApis || []);
      setLocalCustomEvents(initialSettings.customEvents || []);
      setLocalShowHolidays(initialSettings.showHolidays ?? true);
      setSaveWsSuccess(false);
    }
  }, [JSON.stringify(initialSettings)]);

  useEffect(() => {
    if (activeWorkspace) {
      setWsTitle(activeWorkspace.name || activeWorkspace.settings?.title || "");
      setWsTagline(activeWorkspace.settings?.tagline || "");
    }
  }, [activeWorkspace]);

  // Dirty check for workspace settings
  const isDirty =
    wsTitle !== (activeWorkspace?.name || activeWorkspace?.settings?.title || "") ||
    wsTagline !== (activeWorkspace?.settings?.tagline || "") ||
    JSON.stringify(localPillars) !== JSON.stringify(transformInit(initialSettings?.pillars)) ||
    JSON.stringify(localPlatforms) !== JSON.stringify(transformInit(initialSettings?.platforms)) ||
    JSON.stringify(localContentTypes) !== JSON.stringify(transformInit(initialSettings?.contentTypes)) ||
    JSON.stringify(localPics) !== JSON.stringify(transformInit(initialSettings?.pics)) ||
    JSON.stringify(localStatuses) !== JSON.stringify(transformInit(initialSettings?.statuses)) ||
    JSON.stringify(localHolidays) !== JSON.stringify(initialSettings?.holidays || {}) ||
    JSON.stringify(localHolidayApis) !== JSON.stringify(initialSettings?.holidayApis || []) ||
    JSON.stringify(localCustomEvents) !== JSON.stringify(initialSettings?.customEvents || []) ||
    localShowHolidays !== (initialSettings?.showHolidays ?? true);

  useEffect(() => {
    onDirty?.(isDirty);
  }, [isDirty, onDirty]);

  // ---------------- USER PROFILE HANDLERS ----------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
      window.location.reload();
    } catch (e: any) {
      console.error("Logout error:", e);
    }
  };

  const handleUpdateProfile = async () => {
    setLoadingProfile(true);
    try {
      const cleanUsername = userName.replace(/[^a-z0-9_]/g, "").toLowerCase();
      if (cleanUsername.length < 3 || cleanUsername.length > 20) {
        throw new Error("Username harus antara 3 - 20 karakter dan hanya boleh berisi huruf, angka, atau underscore.");
      }

      if (cleanUsername !== profile?.username) {
        await runTransaction(db, async (t) => {
          const ustrRef = doc(db, "usernames", cleanUsername);
          const ustrDoc = await t.get(ustrRef);
          if (ustrDoc.exists()) throw new Error("Username sudah dipakai, silakan gunakan username lain.");

          if (profile?.username) {
            const oldUstrRef = doc(db, "usernames", profile.username);
            t.delete(oldUstrRef);
          }

          t.set(ustrRef, { uid: profile.uid });
          t.update(doc(db, "users", profile.uid), {
            fullName: name,
            username: cleanUsername,
            nickname: nickname.trim(),
          });
        });
      } else {
        const uRef = doc(db, "users", profile.uid);
        await updateDoc(uRef, {
          fullName: name,
          username: cleanUsername,
          nickname: nickname.trim(),
        });
      }

      await onUpdateProfile({
        ...profile,
        fullName: name,
        username: cleanUsername,
        nickname: nickname.trim(),
      });
      setMessage({ text: "Profil berhasil diperbarui", type: "success" });
      setIsEditingProfile(false);
    } catch (e: any) {
      setMessage({ text: e.message, type: "error" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx?.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);

        const oldSize = profile.avatar ? (profile.avatar.length * 0.75) / (1024 * 1024) : 0;
        const newSize = (base64.length * 0.75) / (1024 * 1024);
        const storageDiffMB = newSize - oldSize;
        
        const currentStorage = profile.storageUsed || 0;
        const maxStorage = planDetails?.maxStorageMB || 100;

        if (storageDiffMB > 0 && currentStorage + storageDiffMB > maxStorage) {
            setMessage({ text: `Kapasitas penyimpanan penuh. Batas paket Anda adalah ${maxStorage} MB.`, type: "error" });
            return;
        }

        setLoadingProfile(true);
        try {
          const uRef = doc(db, "users", profile.uid);
          await updateDoc(uRef, { 
             avatar: base64,
             storageUsed: increment(storageDiffMB)
          });

          if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: base64 });
          await onUpdateProfile({ ...profile, avatar: base64 });
          setMessage({ text: "Foto profil berhasil diperbarui", type: "success" });
        } catch (e: any) {
          setMessage({ text: e.message, type: "error" });
        } finally {
          setLoadingProfile(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const hasPasswordProvider = auth.currentUser?.providerData?.some((p: any) => p.providerId === "password");

  const handleChangePassword = async () => {
    if (!newPass) return setMessage({ text: "Masukkan password baru", type: "error" });
    if (hasPasswordProvider && !oldPass) return setMessage({ text: "Masukkan password lama", type: "error" });
    setLoadingProfile(true);
    try {
      if (hasPasswordProvider && auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPass);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      if (auth.currentUser) await updatePassword(auth.currentUser, newPass);
      setMessage({ text: "Password berhasil disimpan", type: "success" });
      setOldPass("");
      setNewPass("");
    } catch (e: any) {
      if (e.code === "auth/requires-recent-login") {
        setMessage({
          text: lang === "id" ? "Sesi telah berakhir. Silakan logout dan login kembali untuk keamanan." : "Session expired. Please re-login.",
          type: "error",
        });
      } else {
        setMessage({ text: e.message, type: "error" });
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSendVerification = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      setLoadingProfile(true);
      try {
        await sendEmailVerification(auth.currentUser);
        setEmailStatusMsg(lang === "id" ? "Email verifikasi telah dikirim. Silakan cek inbox Anda." : "Verification email sent.");
      } catch (e: any) {
        setEmailStatusMsg(e.message);
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const executeAccountDeletion = async (userToAuth: any) => {
    const uid = userToAuth.uid;
    const finalReason = deleteReason === "Lainnya" ? customReason : deleteReason;

    // 1. Record deletion reason log
    try {
      await addDoc(collection(db, "accountDeletionReasons"), {
        reason: finalReason,
        uid: uid,
        email: userToAuth.email || "",
        deletedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Error logging deletion reason:", e);
    }

    // 2. Delete user's username document if set
    if (profile?.username) {
      try {
        await deleteDoc(doc(db, "usernames", profile.username));
      } catch (e) {
        console.warn("Error deleting username mapping doc:", e);
      }
    }

    // 3. Delete user subcollections (/users/{uid}/aiChats & /users/{uid}/hubaiConfig)
    try {
      const chatsSnap = await getDocs(collection(db, "users", uid, "aiChats"));
      for (const d of chatsSnap.docs) {
        await deleteDoc(doc(db, "users", uid, "aiChats", d.id));
      }
      const configSnap = await getDocs(collection(db, "users", uid, "hubaiConfig"));
      for (const d of configSnap.docs) {
        await deleteDoc(doc(db, "users", uid, "hubaiConfig", d.id));
      }
    } catch (e) {
      console.warn("Error deleting user subcollections:", e);
    }

    // 4. Delete user-owned workspaces
    try {
      const wsQuery = query(collection(db, "workspaces"), where("ownerId", "==", uid));
      const wsSnap = await getDocs(wsQuery);
      for (const d of wsSnap.docs) {
        await deleteDoc(doc(db, "workspaces", d.id));
      }
    } catch (e) {
      console.warn("Error deleting owned workspaces:", e);
    }

    // 5. Delete Firestore user document
    try {
      await deleteDoc(doc(db, "users", uid));
    } catch (e) {
      console.warn("Error deleting user doc:", e);
    }

    // 6. Delete Firebase Auth User
    await deleteUser(userToAuth);

    // 7. Sign out and redirect to login
    try { await signOut(auth); } catch (e) {}
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason) {
      setMessage({ text: "Harap pilih alasan menghapus akun.", type: "error" });
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setMessage({ text: "Tidak ada user aktif.", type: "error" });
      return;
    }

    setLoadingProfile(true);
    try {
      await executeAccountDeletion(currentUser);
    } catch (e: any) {
      if (e.code === "auth/requires-recent-login") {
        const isGoogleUser = currentUser.providerData.some(
          (p) => p.providerId === "google.com"
        );
        if (isGoogleUser) {
          try {
            await reauthenticateWithPopup(currentUser, googleProvider);
            await executeAccountDeletion(currentUser);
            return;
          } catch (reauthErr: any) {
            setMessage({
              text: "Gagal memverifikasi ulang akun Google: " + reauthErr.message,
              type: "error",
            });
            setShowDeleteConfirm(false);
            setLoadingProfile(false);
            return;
          }
        } else {
          setShowDeleteConfirm(false);
          setShowReauthModal(true);
          setLoadingProfile(false);
          return;
        }
      } else {
        setMessage({ text: "Gagal menghapus akun: " + e.message, type: "error" });
        setLoadingProfile(false);
      }
    }
  };

  const handlePasswordReauthAndDelete = async () => {
    if (!reauthPassword) {
      setReauthError("Masukkan kata sandi Anda.");
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) return;

    setLoadingProfile(true);
    setReauthError("");
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, reauthPassword);
      await reauthenticateWithCredential(currentUser, cred);
      setShowReauthModal(false);
      await executeAccountDeletion(currentUser);
    } catch (e: any) {
      setReauthError(
        e.code === "auth/wrong-password" || e.code === "auth/invalid-credential"
          ? "Kata sandi yang Anda masukkan salah."
          : e.message
      );
      setLoadingProfile(false);
    }
  };

  const loadTransactions = async () => {
    setShowTxModal(true);
    setLoadingTx(true);
    try {
      const q = query(collection(db, "transactions"), where("userId", "==", profile.uid), limit(50));
      const snap = await getDocs(q);
      const tMap = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTransactions(tMap);
    } catch (e: any) {
      console.error("Failed to load tx", e);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleDownloadInvoice = (tx: any) => {
    const invWindow = window.open("", "_blank");
    if (!invWindow) return;
    invWindow.document.write(`
       <html>
         <head><title>Invoice ${tx.id}</title>
         <style>
            body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; padding: 40px; color: #111827; background-color: #FAFAFA; }
            h1 { color: #3B82F6; margin: 0 0 10px 0; font-size: 28px; font-weight: 800; tracking: -0.025em; }
            p { margin: 4px 0; font-size: 14px; color: #4B5563; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 30px; }
            .details { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .details-col { display: flex; flex-direction: column; }
            .card { background: white; border: 1px solid #F3F4F6; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { padding: 12px; text-align: left; border-bottom: 2px solid #E5E7EB; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; font-weight: 700; }
            td { padding: 16px 12px; text-align: left; border-bottom: 1px solid #E5E7EB; font-size: 14px; color: #111827; }
            .total { font-size: 22px; font-weight: 800; text-align: right; margin-top: 30px; color: #111827; }
         </style>
         </head>
         <body>
           <div class="header">
             <div>
               <h1>INVOICE</h1>
               <p style="font-weight: 600; color: #1F2937;">No: ${tx.id.toUpperCase()}</p>
             </div>
             <div style="text-align:right">
               <strong style="font-size: 18px; font-weight: 800; color: #111827;">Hubify Social</strong>
               <p>support@hubify.social</p>
             </div>
           </div>
           <div class="details">
             <div class="card details-col">
               <p style="font-weight: 700; color: #111827; margin-bottom: 8px;">Ditagihkan kepada:</p>
               <p style="font-weight: 600; color: #111827;">${profile?.fullName || "User"}</p>
               <p>${profile?.email}</p>
             </div>
             <div class="card details-col">
               <p><strong>Tanggal:</strong> ${new Date(tx.timestamp).toLocaleString("id-ID")}</p>
               <p><strong>Metode Pembayaran:</strong> ${tx.paymentMethod?.toUpperCase() || "-"}</p>
               <p><strong>Status:</strong> <span style="color: #10B981; font-weight: 700;">${tx.status?.toUpperCase() || "SUCCESS"}</span></p>
             </div>
           </div>
           <table class="card">
             <thead><tr><th>Deskripsi</th><th style="text-align: right;">Jumlah</th></tr></thead>
             <tbody>
               <tr>
                 <td style="font-weight: 600;">${tx.planName || "Paket Pro"} (${tx.durationDays || "30"} Hari)</td>
                 <td style="text-align: right; font-weight: 700;">Rp ${tx.amount?.toLocaleString("id-ID")}</td>
               </tr>
             </tbody>
           </table>
           <div class="total">Total: Rp ${tx.amount?.toLocaleString("id-ID")}</div>
           <script>window.print();</script>
         </body>
       </html>
      `);
    invWindow.document.close();
  };

  // ---------------- WORKSPACE CONFIG HANDLERS ----------------
  const handleSaveTheme = async (themeId: string) => {
    setSavingTheme(true);
    try {
      await onUpdateProfile({ themeId });
      setMessage({ text: "Tema visual berhasil disimpan!", type: "success" });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingTheme(false);
    }
  };

  const handleSaveWorkspaceSettings = async () => {
    setSavingWs(true);
    setSaveWsSuccess(false);
    try {
      const cleanArray = (arr: any[]) =>
        arr.map((x) => {
          const { _originalName, ...rest } = x;
          Object.keys(rest).forEach((key) => rest[key] === undefined && delete rest[key]);
          return rest;
        });

      const deduplicate = (arr: any[]) => {
        const seen = new Set();
        return arr.filter((x) => {
          const name = typeof x === "string" ? x : x.name;
          const nameLower = String(name || "").trim().toLowerCase();
          if (!nameLower || seen.has(nameLower)) return false;
          seen.add(nameLower);
          return true;
        });
      };

      const computedRenames: any = { pillars: {}, platforms: {}, contentTypes: {}, pics: {}, statuses: {} };

      const trackRenames = (arr: any[], type: string) => {
        arr.forEach((x) => {
          if (x._originalName && x._originalName !== x.name) {
            computedRenames[type][x._originalName] = x.name;
          }
        });
      };

      trackRenames(localPillars, "pillars");
      trackRenames(localPlatforms, "platforms");
      trackRenames(localContentTypes, "contentTypes");
      trackRenames(localPics, "pics");
      trackRenames(localStatuses, "statuses");

      await onSave({
        title: wsTitle.trim(),
        tagline: wsTagline.trim(),
        pillars: deduplicate(cleanArray(localPillars)),
        platforms: deduplicate(cleanArray(localPlatforms)),
        contentTypes: deduplicate(cleanArray(localContentTypes)),
        pics: deduplicate(cleanArray(localPics)),
        statuses: deduplicate(cleanArray(localStatuses)),
        holidays: localHolidays,
        holidayApis: localHolidayApis,
        customEvents: localCustomEvents,
        showHolidays: localShowHolidays,
        renames: computedRenames,
      });

      setSaveWsSuccess(true);
      setMessage({ text: "Konfigurasi workspace berhasil disimpan!", type: "success" });
      setTimeout(() => setSaveWsSuccess(false), 3000);
    } catch (e: any) {
      console.error("Save settings error:", e);
      setMessage({ text: "Gagal menyimpan konfigurasi: " + e.message, type: "error" });
    } finally {
      setSavingWs(false);
    }
  };

  // Pillar CRUD
  const addPillar = () => {
    if (!newVal.trim()) return;
    setLocalPillars((p: any) => [...p, { name: newVal.trim(), color: newColor, light: newColor + "22" }]);
    setNewVal("");
    setNewColor("#3B82F6");
  };
  const editPillar = (i: number, name: string, color: string) =>
    setLocalPillars((p: any) => p.map((x: any, idx: number) => (idx === i ? { ...x, name, color, light: color + "22" } : x)));
  const delPillar = (i: number) => setLocalPillars((p: any) => p.filter((_: any, idx: number) => idx !== i));

  // Content Type CRUD
  const addContentType = () => {
    if (!newVal.trim()) return;
    setLocalContentTypes((p: any) => [...p, { name: newVal.trim(), color: newColor }]);
    setNewVal("");
  };
  const editContentType = (i: number, name: string, color: string) =>
    setLocalContentTypes((p: any) => p.map((x: any, idx: number) => (idx === i ? { ...x, name, color } : x)));
  const delContentType = (i: number) => setLocalContentTypes((p: any) => p.filter((_: any, idx: number) => idx !== i));

  // PIC CRUD
  const addPic = () => {
    if (!newVal.trim()) return;
    setLocalPics((p: any) => [...p, { name: newVal.trim(), color: newColor }]);
    setNewVal("");
  };
  const editPic = (i: number, name: string, color: string) =>
    setLocalPics((p: any) => p.map((x: any, idx: number) => (idx === i ? { ...x, name, color } : x)));
  const delPic = (i: number) => setLocalPics((p: any) => p.filter((_: any, idx: number) => idx !== i));

  // Status CRUD
  const addStatus = () => {
    if (!newVal.trim()) return;
    setLocalStatuses((s: any) => [...s, { name: newVal.trim(), color: newColor }]);
    setNewVal("");
  };
  const editStatus = (i: number, name: string, color: string) =>
    setLocalStatuses((p: any) => p.map((x: any, idx: number) => (idx === i ? { ...x, name, color } : x)));
  const delStatus = (i: number) => setLocalStatuses((s: any) => s.filter((_: any, idx: number) => idx !== i));

  // Drag and Drop Logic
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedType, setDraggedType] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number, type: string) => {
    setDraggedIndex(index);
    setDraggedType(type);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      // Firefox requires some data to be set to allow dragging
      e.dataTransfer.setData("text/plain", "");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number, type: string, list: any[], setter: any) => {
    e.preventDefault();
    if (draggedIndex === null || draggedType !== type || draggedIndex === index) return;
    
    const newList = [...list];
    const item = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, item);
    
    setter(newList);
    setDraggedIndex(null);
    setDraggedType(null);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedType(null);
  };

  // Holiday CRUD
  const addHoliday = () => {
    if (!newHKey || !newHVal.trim()) return;
    const parts = newHKey.split("-");
    if (parts.length === 3) {
      const y = parts[0];
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const cleanedKey = `${y}-${m}-${d}`;
      setLocalHolidays((h: any) => ({ ...h, [cleanedKey]: newHVal.trim() }));
      setNewHKey("");
      setNewHVal("");
    }
  };
  const delHoliday = (k: string) =>
    setLocalHolidays((h: any) => {
      const n = { ...h };
      delete n[k];
      return n;
    });

  // Custom Events CRUD
  const addCustomEvent = () => {
    if (!newEvName.trim() || !newEvStart || !newEvEnd) return;
    setLocalCustomEvents((prev: any) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newEvName.trim(),
        color: newEvColor,
        start: newEvStart,
        end: newEvEnd,
        monthly: newEvMonthly,
      },
    ]);
    setNewEvName("");
    setNewEvStart("");
    setNewEvEnd("");
    setNewEvMonthly(false);
  };
  const delCustomEvent = (id: string) => setLocalCustomEvents((prev: any) => prev.filter((ev: any) => ev.id !== id));

  const startEditCustomEvent = (ev: any) => {
    setEditingEvId(ev.id);
    setEditEvName(ev.name);
    setEditEvColor(ev.color || "#3B82F6");
    setEditEvStart(ev.start || "");
    setEditEvEnd(ev.end || "");
    setEditEvMonthly(ev.monthly || false);
  };

  const saveEditedCustomEvent = (id: string) => {
    if (!editEvName.trim() || !editEvStart || !editEvEnd) return;
    setLocalCustomEvents((prev: any) =>
      prev.map((ev: any) =>
        ev.id === id
          ? {
              ...ev,
              name: editEvName.trim(),
              color: editEvColor,
              start: editEvStart,
              end: editEvEnd,
              monthly: editEvMonthly,
            }
          : ev
      )
    );
    setEditingEvId(null);
  };

  // Nav categories config
  const navCategories = [
    {
      title: lang === "id" ? "Akun & Profil" : "Account & Profile",
      items: [
        { id: "profile" as TabCategory, label: lang === "id" ? "Profil & Penggunaan" : "Profile & Usage", icon: User },
        { id: "billing" as TabCategory, label: lang === "id" ? "Langganan & Tagihan" : "Subscription & Billing", icon: CreditCard },
        { id: "security" as TabCategory, label: lang === "id" ? "Keamanan & Sandi" : "Security & Password", icon: Shield },
      ],
    },
    {
      title: lang === "id" ? "Konfigurasi Workspace" : "Workspace Settings",
      items: [
        { id: "workspace" as TabCategory, label: lang === "id" ? "Info Workspace" : "Workspace Details", icon: Building },
        { id: "visual" as TabCategory, label: lang === "id" ? "Tema Visual" : "Visual Theme", icon: Palette },
        { id: "pillars" as TabCategory, label: lang === "id" ? "Pilar Konten" : "Content Pillars", icon: Layers },
        { id: "contentTypes" as TabCategory, label: lang === "id" ? "Tipe Konten" : "Content Types", icon: Tag },
        { id: "pics" as TabCategory, label: lang === "id" ? "Tim & PIC" : "Team / PIC", icon: Users },
        { id: "statuses" as TabCategory, label: lang === "id" ? "Status Workflow" : "Workflow Status", icon: ClipboardList },
        { id: "holidays" as TabCategory, label: lang === "id" ? "Hari Besar & Event" : "Holidays & Events", icon: Calendar },
      ],
    },
    {
      title: lang === "id" ? "Bantuan & Notifikasi" : "Help & Notifications",
      items: [
        { id: "notifications" as TabCategory, label: lang === "id" ? "Notifikasi" : "Notifications", icon: Bell },
        { id: "support" as TabCategory, label: lang === "id" ? "Bantuan & Saran" : "Support & Feedback", icon: MessageCircle },
      ],
    },
    {
      title: lang === "id" ? "Pengaturan Lainnya" : "Other Settings",
      items: [
        { id: "language" as TabCategory, label: lang === "id" ? "Bahasa" : "Language", icon: Globe },
        { id: "danger" as TabCategory, label: "Danger Zone", icon: AlertCircle },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[1120px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 font-sans text-neutral-900"
    >
      {/* Navigation Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-black/[0.03] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.01)] rounded-2xl p-3.5 md:p-4">
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              navigate("/");
              window.location.href = "/";
            }
          }}
          className="group flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-black transition-all bg-black/[0.03] hover:bg-black/[0.06] px-4 py-2.5 rounded-xl border border-transparent cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          {lang === "id" ? "Kembali ke Dashboard" : "Back to Dashboard"}
        </button>

        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              onClick={handleSaveWorkspaceSettings}
              disabled={savingWs}
              className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-all px-4 py-2.5 rounded-xl shadow-sm cursor-pointer"
            >
              <Save size={14} />
              {savingWs ? (lang === "id" ? "Menyimpan..." : "Saving...") : (lang === "id" ? "Simpan Workspace" : "Save Workspace")}
            </button>
          )}

          <div className="hidden md:block text-xs font-bold text-neutral-400 tracking-wider uppercase">
            Hubify Settings
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 transition-all bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <LogOut size={14} />
            {lang === "id" ? "Keluar" : "Logout"}
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-sm border ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200/50 text-emerald-800" : "bg-rose-50 border-rose-200/50 text-rose-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Main Settings Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Sidebar Navigation */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-5 bg-white border border-black/[0.03] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.01)] rounded-3xl p-5">
          {/* User & Workspace Summary Identity */}
          <div className="flex flex-col items-center text-center pb-5 border-b border-black/[0.03]">
            <label htmlFor="avatarUploadSettings" className="relative cursor-pointer group shrink-0 block mb-3">
              <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden border-2 border-white group-hover:scale-[1.02] transition-transform">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  profile?.fullName?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md group-hover:bg-blue-600 transition-colors">
                <Pencil size={10} />
              </div>
              <input type="file" id="avatarUploadSettings" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>

            <h3 className="text-sm font-black tracking-tight text-neutral-900 line-clamp-1 max-w-full px-2">
              {profile?.nickname || profile?.fullName || "Kreator Hubify"}
            </h3>
            <p className="text-[11px] font-bold text-blue-600 mb-2">@{profile?.username || "username"}</p>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  profile?.plan === "vip"
                    ? "bg-amber-50 border border-amber-200 text-amber-700"
                    : profile?.activeUntil && new Date(profile.activeUntil) > new Date()
                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                    : "bg-neutral-100 border border-neutral-200 text-neutral-700"
                }`}
              >
                {profile?.plan === "vip" && <Crown size={10} />}
                {planDetails?.name ? planDetails.name.replace(/\s*\(?(annual|monthly|tahunan|bulanan)\)?/gi, '').replace(/\s+plan/gi, '').trim().toUpperCase()
                  : profile?.plan ? profile.plan.toUpperCase() : "FREE"}
              </span>

              {activeWorkspace?.name && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-neutral-100 text-neutral-600 border border-neutral-200/60 max-w-[130px] truncate">
                  <Building size={9} />
                  {activeWorkspace.name}
                </span>
              )}
            </div>
          </div>

          {/* Grouped Nav Items */}
          <div className="flex flex-col gap-4">
            {navCategories.map((cat, cIdx) => (
              <div key={cIdx} className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1 mb-1">
                  {cat.title}
                </p>
                <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-none shrink-0">
                  {cat.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMessage({ text: "", type: "" });
                        }}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 md:w-full cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                            : "text-neutral-500 hover:text-black hover:bg-black/[0.02]"
                        }`}
                      >
                        <ItemIcon size={15} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Settings Content Panel */}
        <div className="md:col-span-8 lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(0,0,0,0.01)] rounded-3xl p-6 md:p-8"
            >
              
              {/* TAB 1: USER PROFILE & AI USAGE */}
              {activeTab === "profile" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Informasi Profil & Penggunaan" : "Profile & System Usage"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Kelola informasi dasar Anda serta kuota penggunaan asisten AI." : "Update your profile fields and review AI quota limits."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    {/* Form Controls */}
                    <div className="bg-[#FCFCFC] border border-neutral-200/60 p-6 rounded-3xl flex flex-col gap-5">
                      <div className="flex items-center gap-1.5 pb-3 border-b border-black/[0.03]">
                        <User className="text-blue-600" size={16} />
                        <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                          {lang === "id" ? "Detail Profil" : "Profile Details"}
                        </h4>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">
                            {lang === "id" ? "Nama Lengkap" : "Full Name"}
                          </label>
                          {!isEditingProfile ? (
                            <button
                              onClick={() => setIsEditingProfile(true)}
                              className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              {lang === "id" ? "Ubah" : "Edit"}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setIsEditingProfile(false);
                                setName(profile?.fullName || "");
                                setNickname(profile?.nickname || "");
                                setUserName(profile?.username || "");
                              }}
                              className="text-[10px] font-bold text-neutral-400 hover:text-black cursor-pointer"
                            >
                              {lang === "id" ? "Batal" : "Cancel"}
                            </button>
                          )}
                        </div>
                        <input
                          disabled={!isEditingProfile}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full text-xs font-bold rounded-xl px-4 py-3 outline-none transition-all ${
                            !isEditingProfile
                              ? "bg-black/[0.01] text-neutral-500 border border-transparent cursor-not-allowed"
                              : "bg-white border border-neutral-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 text-black shadow-sm"
                          }`}
                          placeholder="Full Name"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1.5">
                          {lang === "id" ? "Nama Panggilan" : "Nickname"}
                        </label>
                        <input
                          disabled={!isEditingProfile}
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className={`w-full text-xs font-bold rounded-xl px-4 py-3 outline-none transition-all ${
                            !isEditingProfile
                              ? "bg-black/[0.01] text-neutral-500 border border-transparent cursor-not-allowed"
                              : "bg-white border border-neutral-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 text-black shadow-sm"
                          }`}
                          placeholder="Your Nickname"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1.5">
                          Username
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">@</span>
                          <input
                            disabled={!isEditingProfile}
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className={`w-full text-xs font-bold rounded-xl pl-8 pr-4 py-3 outline-none transition-all ${
                              !isEditingProfile
                                ? "bg-black/[0.01] text-neutral-500 border border-transparent cursor-not-allowed"
                                : "bg-white border border-neutral-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 text-black shadow-sm"
                            }`}
                          />
                        </div>
                      </div>

                      {isEditingProfile && (
                        <button
                          onClick={handleUpdateProfile}
                          disabled={loadingProfile}
                          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold uppercase tracking-wider rounded-xl py-3 text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Save size={14} />
                          {loadingProfile ? (lang === "id" ? "Menyimpan..." : "Saving...") : (lang === "id" ? "Simpan Perubahan" : "Save Changes")}
                        </button>
                      )}
                    </div>

                    {/* Quota & Storage Stack */}
                    <div className="flex flex-col gap-6">
                      {/* Usage Limits Card */}
                      <div className="bg-[#FCFCFC] border border-neutral-200/60 p-6 rounded-3xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-black/[0.03]">
                            <Sparkles className="text-blue-600 animate-pulse" size={16} />
                            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                              {lang === "id" ? "Batas Penggunaan" : "Usage limits"}
                            </h4>
                            <span className="ml-auto px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[9px] font-black tracking-wider text-neutral-600 uppercase">
                              {planDetails?.name ? planDetails.name.replace(/\s*\(?(annual|monthly|tahunan|bulanan)\)?/gi, '').replace(/\s+plan/gi, '').trim().toUpperCase() : (lang === "id" ? "GRATIS" : "FREE")}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 font-medium mb-5 leading-relaxed">
                            {lang === "id"
                              ? "Batas paket Anda menentukan seberapa banyak Anda dapat menggunakan Hub.AI. Model dan fitur tingkat lanjut dapat menggunakan lebih banyak kuota."
                              : "Your plan's limits determine how much you can use Hub.AI over time. Advanced models and features can take up more usage."}
                          </p>
                      
                          <div className="flex flex-col gap-5">
                            {/* Daily Usage row */}
                            <div>
                              <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                                  {lang === "id" ? "Penggunaan Hari Ini" : "Current usage"}
                                </span>
                                <span className="text-xs font-black text-neutral-900">
                                  {(() => {
                                    const maxReq = planDetails?.aiTokenLimitDaily || 50;
                                    if (maxReq === -1) return `0% ${lang === "id" ? "digunakan" : "used"}`;
                                    const todayStr = new Date().toISOString().split("T")[0];
                                    const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                                    const usedPercent = Math.min((usedReq / maxReq) * 100, 100);
                                    return `${Math.round(usedPercent)}% ${lang === "id" ? "digunakan" : "used"}`;
                                  })()}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-black/[0.03] rounded-full overflow-hidden mb-2">
                                {(() => {
                                  const maxReq = planDetails?.aiTokenLimitDaily || 50;
                                  const now = new Date();
                                  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                                  const usedReq = profile?.lastAiRequestDate === todayStr ? (profile?.aiCreditsToday || profile?.aiRequestsToday || 0) : 0;
                                  const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);
                                  return <div className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]" style={{ width: `${usedPercent}%` }} />;
                                })()}
                              </div>
                              <div className="text-[9px] font-bold text-neutral-400">
                                {lang === "id" ? "Direset otomatis pada 00:00" : "Resets automatically at 12:00 AM"}
                              </div>
                            </div>
                      
                            {/* Monthly Limit row */}
                            <div>
                              <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                                  {lang === "id" ? "Batas Bulanan" : "Monthly limit"}
                                </span>
                                <span className="text-xs font-black text-neutral-900">
                                  {(() => {
                                    const maxReq = planDetails?.aiTokenLimit || 1000;
                                    if (maxReq === -1) return `0% ${lang === "id" ? "digunakan" : "used"}`;
                                    const now = new Date();
                                    let resetDay = 1;
                                    if (profile?.activeUntil) resetDay = new Date(profile.activeUntil).getDate();
                                    else if (profile?.createdAt) resetDay = new Date(profile.createdAt).getDate();
                                    let cycleStartMonth = now.getMonth();
                                    let cycleStartYear = now.getFullYear();
                                    if (now.getDate() < resetDay) {
                                        cycleStartMonth -= 1;
                                        if (cycleStartMonth < 0) { cycleStartMonth = 11; cycleStartYear -= 1; }
                                    }
                                    const actualResetDay = Math.min(resetDay, new Date(cycleStartYear, cycleStartMonth + 1, 0).getDate());
                                    const currentMonth = `${cycleStartYear}-${String(cycleStartMonth + 1).padStart(2, '0')}-${String(actualResetDay).padStart(2, '0')}`;
                                    const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
                                    const usedPercent = Math.min((usedReq / maxReq) * 100, 100);
                                    return `${Math.round(usedPercent)}% ${lang === "id" ? "digunakan" : "used"}`;
                                  })()}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-black/[0.03] rounded-full overflow-hidden mb-2">
                                {(() => {
                                  const maxReq = planDetails?.aiTokenLimit || 1000;
                                  const now = new Date();
                                  let resetDay = 1;
                                  if (profile?.activeUntil) resetDay = new Date(profile.activeUntil).getDate();
                                  else if (profile?.createdAt) resetDay = new Date(profile.createdAt).getDate();
                                  let cycleStartMonth = now.getMonth();
                                  let cycleStartYear = now.getFullYear();
                                  if (now.getDate() < resetDay) {
                                      cycleStartMonth -= 1;
                                      if (cycleStartMonth < 0) { cycleStartMonth = 11; cycleStartYear -= 1; }
                                  }
                                  const actualResetDay = Math.min(resetDay, new Date(cycleStartYear, cycleStartMonth + 1, 0).getDate());
                                  const currentMonth = `${cycleStartYear}-${String(cycleStartMonth + 1).padStart(2, '0')}-${String(actualResetDay).padStart(2, '0')}`;
                                  const usedReq = profile?.lastAiRequestMonth === currentMonth ? (profile?.aiTokensUsed || 0) : 0;
                                  const usedPercent = maxReq === -1 ? 0 : Math.min((usedReq / maxReq) * 100, 100);
                                  return <div className="h-full bg-indigo-600 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]" style={{ width: `${usedPercent}%` }} />;
                                })()}
                              </div>
                              <div className="text-[9px] font-bold text-neutral-400">
                                {(() => {
                                   const now = new Date();
                                   let resetDay = 1;
                                   if (profile?.activeUntil) resetDay = new Date(profile.activeUntil).getDate();
                                   else if (profile?.createdAt) resetDay = new Date(profile.createdAt).getDate();
                                   let nextResetMonth = now.getMonth();
                                   let nextResetYear = now.getFullYear();
                                   if (now.getDate() >= resetDay) {
                                       nextResetMonth += 1;
                                       if (nextResetMonth > 11) { nextResetMonth = 0; nextResetYear += 1; }
                                   }
                                   const maxDays = new Date(nextResetYear, nextResetMonth + 1, 0).getDate();
                                   const actualResetDay = Math.min(resetDay, maxDays);
                                   const nextMonth = new Date(nextResetYear, nextResetMonth, actualResetDay);
                                   return (lang === "id" ? "Direset pada tanggal " : "Resets on ") + nextMonth.toLocaleDateString(lang === "id" ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' });
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Asset Storage Card */}
                      <div className="bg-[#FCFCFC] border border-neutral-200/60 p-6 rounded-3xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 pb-3 mb-4 border-b border-black/[0.03]">
                            <HardDrive className="text-indigo-600" size={16} />
                            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                              {lang === "id" ? "Penyimpanan Media" : "Media Storage"}
                            </h4>
                          </div>
                          <p className="text-[11px] text-neutral-400 font-medium mb-5 leading-relaxed">
                            {lang === "id"
                              ? "Kapasitas penyimpanan gambar referensi konten dan avatar profil Anda."
                              : "Storage usage for content reference images and profile avatars."}
                          </p>

                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                              {lang === "id" ? "Kapasitas Terpakai" : "Storage Used"}
                            </span>
                            <span className="text-xs font-black text-neutral-900">
                              {(() => {
                                const usedMB = profile?.storageUsed || 0;
                                const maxMB = planDetails?.maxStorageMB || 100;
                                return `${usedMB.toFixed(2)} MB / ${maxMB} MB`;
                              })()}
                            </span>
                          </div>

                          <div className="w-full h-1.5 bg-black/[0.03] rounded-full overflow-hidden mb-2">
                            {(() => {
                              const usedMB = profile?.storageUsed || 0;
                              const maxMB = planDetails?.maxStorageMB || 100;
                              const usedPercent = Math.min((usedMB / maxMB) * 100, 100);
                              return <div className="h-full bg-violet-600 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(124,58,237,0.4)]" style={{ width: `${usedPercent}%` }} />;
                            })()}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-black/[0.03] flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                          <span>{lang === "id" ? "Status Penyimpanan" : "Storage Status"}</span>
                          {(() => {
                            const usedMB = profile?.storageUsed || 0;
                            const maxMB = planDetails?.maxStorageMB || 100;
                            const usedPercent = (usedMB / maxMB) * 100;
                            if (usedPercent >= 90) {
                              return <span className="text-red-600 font-bold">{lang === "id" ? "Hampir Penuh" : "Almost Full"}</span>;
                            } else if (usedPercent >= 75) {
                              return <span className="text-amber-600 font-bold">{lang === "id" ? "Peringatan" : "Warning"}</span>;
                            } else {
                              return <span className="text-emerald-600 font-bold">✓ {lang === "id" ? "Normal" : "Good"}</span>;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SUBSCRIPTION & BILLING */}
              {activeTab === "billing" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Langganan & Workspace" : "Subscription & Workspaces"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Lihat informasi paket langganan dan unduh riwayat pembayaran Anda." : "Review subscription status, invoice archives, and linked workspace."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    <div className="bg-black/[0.01] border border-black/[0.02] p-6 rounded-3xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
                          Active Plan Status
                        </span>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xl font-black text-neutral-900">
                            {planDetails?.name ? planDetails.name.replace(/\s*\(?(annual|monthly|tahunan|bulanan)\)?/gi, '').replace(/\s+plan/gi, '').trim().toUpperCase()
                              : profile?.plan ? profile.plan.toUpperCase() : "FREE"}
                          </h3>
                          {profile?.plan === "vip" && <Crown className="text-amber-500 shrink-0" size={18} />}
                        </div>

                        <p className="text-xs text-neutral-400 font-medium mb-5">
                          {profile?.plan === "vip"
                            ? lang === "id"
                              ? "Akses tak terbatas selamanya ke seluruh fitur analitis optimasi Hubify."
                              : "Unlimited lifetime access to all Hubify features."
                            : profile?.activeUntil && new Date(profile.activeUntil) > new Date()
                            ? lang === "id"
                              ? `Langganan aktif sampai dengan tanggal ${new Date(profile.activeUntil).toLocaleDateString("id-ID", { dateStyle: "medium" })}.`
                              : `Active subscription until ${new Date(profile.activeUntil).toLocaleDateString("en-US", { dateStyle: "medium" })}.`
                            : lang === "id"
                            ? "Anda saat ini berada pada skema Free Trial. Batasan fitur asisten AI aktif."
                            : "You are currently on a Free Trial plan. AI assistant feature limits apply."}
                        </p>
                      </div>

                      <button
                        onClick={() => navigate("/billing")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-wider text-[11px] py-3 rounded-xl transition-all text-center cursor-pointer"
                      >
                        {profile?.activeUntil && new Date(profile.activeUntil) > new Date() ? "Ubah Paket" : "Upgrade Plan Now"}
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="bg-neutral-50/50 border border-black/[0.02] p-5 rounded-3xl">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <Building size={14} />
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wide">Workspace Aktif</p>
                            <p className="text-xs font-bold text-neutral-900">{activeWorkspace?.name || "Personal Workspace"}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-normal font-medium mt-2">
                          Konten dan postingan Anda disimpan di workspace ini. Anda dapat mengelola workspace lainnya dari dashboard utama.
                        </p>
                      </div>

                      <div className="bg-neutral-50/50 border border-black/[0.02] p-5 rounded-3xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-neutral-900 mb-1">Riwayat Transaksi</p>
                          <p className="text-[11px] text-neutral-400 font-medium">Lihat dan cetak kuitansi / invoice.</p>
                        </div>
                        
                        <button
                          onClick={loadTransactions}
                          className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <History size={14} />
                          {lang === "id" ? "Buka Riwayat" : "Invoices"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY & PASSWORD */}
              {activeTab === "security" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Keamanan & Autentikasi" : "Security & Authentication"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Verifikasi alamat email Anda dan perbarui kata sandi secara berkala." : "Keep your credentials secure and verify your email."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 pt-2">
                    <div className="bg-black/[0.01] border border-black/[0.02] p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-black text-neutral-900 uppercase tracking-wider mb-1">
                          {lang === "id" ? "Status Verifikasi Email" : "Email Verification Status"}
                        </div>
                        <div className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                          <Mail size={13} className="text-blue-600" />
                          <span>{auth.currentUser?.email}</span>
                        </div>
                      </div>

                      {auth.currentUser?.emailVerified ? (
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 self-start sm:self-center uppercase tracking-wider">
                          ✓ {lang === "id" ? "Terverifikasi" : "Verified"}
                        </span>
                      ) : (
                        <div className="flex flex-col items-start sm:items-end gap-1.5">
                          <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                            {lang === "id" ? "Belum Verifikasi" : "Unverified"}
                          </span>
                          <button
                            onClick={handleSendVerification}
                            disabled={loadingProfile}
                            className="text-[10px] font-extrabold text-blue-600 hover:underline uppercase tracking-wide cursor-pointer"
                          >
                            {lang === "id" ? "Kirim Email Verifikasi" : "Send Verification Link"}
                          </button>
                          {emailStatusMsg && (
                            <p className="text-[10px] text-emerald-600 font-bold mt-1 max-w-[240px] text-left sm:text-right">
                              {emailStatusMsg}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-black/[0.03] pt-6 flex flex-col gap-5">
                      {hasPasswordProvider ? (
                        <div>
                          <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1.5">
                            {lang === "id" ? "Password Lama" : "Current Password"}
                          </label>
                          <div className="relative max-w-md">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"><Lock size={12} /></span>
                            <input
                              type="password"
                              value={oldPass}
                              onChange={(e) => setOldPass(e.target.value)}
                              placeholder="••••••••"
                              className="w-full text-xs font-bold bg-[#FAFAFA] border border-black/[0.03] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 rounded-xl pl-9 pr-4 py-3 outline-none transition-all text-black"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50/40 border border-blue-100/40 p-4 rounded-2xl text-[11px] text-blue-700 font-bold leading-relaxed max-w-md">
                          {lang === "id"
                            ? "Anda mendaftar lewat Google SSO. Masukkan kata sandi baru di bawah ini untuk mengaktifkan login password."
                            : "You signed in with Google. Define a password below to enable manual password access."}
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1.5">
                          {lang === "id" ? "Password Baru" : "New Password"}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"><Lock size={12} /></span>
                            <input
                              type="password"
                              value={newPass}
                              onChange={(e) => setNewPass(e.target.value)}
                              placeholder="••••••••"
                              className="w-full text-xs font-bold bg-[#FAFAFA] border border-black/[0.03] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 rounded-xl pl-9 pr-4 py-3 outline-none transition-all text-black"
                            />
                          </div>
                          
                          <button
                            onClick={handleChangePassword}
                            disabled={!newPass || (hasPasswordProvider && !oldPass) || loadingProfile}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-black/[0.02] disabled:text-neutral-400 text-white font-extrabold uppercase tracking-wider text-[10px] px-5 py-3 rounded-xl transition-all shrink-0 cursor-pointer"
                          >
                            {hasPasswordProvider ? (lang === "id" ? "Ganti" : "Change") : (lang === "id" ? "Simpan" : "Save")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WORKSPACE INFO & ACTIONS */}
              {activeTab === "workspace" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Informasi & Pengaturan Workspace" : "Workspace Configuration"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Atur nama, tagline, serta aksi data untuk workspace ini." : "Manage workspace label, tagline, and system reset actions."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-5 pt-2 max-w-xl">
                    <div>
                      <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1.5">
                        {lang === "id" ? "Nama Workspace" : "Workspace Name"}
                      </label>
                      <input
                        value={wsTitle}
                        onChange={(e) => setWsTitle(e.target.value)}
                        placeholder="Contoh: Social Marketing 2026"
                        className="w-full text-xs font-bold bg-[#FAFAFA] border border-black/[0.03] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 rounded-xl px-4 py-3 outline-none transition-all text-black"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1.5">
                        {lang === "id" ? "Tagline / Deskripsi" : "Workspace Tagline"}
                      </label>
                      <input
                        value={wsTagline}
                        onChange={(e) => setWsTagline(e.target.value)}
                        placeholder="Contoh: Manajemen konten digital resmi"
                        className="w-full text-xs font-bold bg-[#FAFAFA] border border-black/[0.03] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100/50 rounded-xl px-4 py-3 outline-none transition-all text-black"
                      />
                    </div>

                    <div className="pt-4 border-t border-black/[0.03] flex flex-col gap-3">
                      <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                        Aksi Data & Akses Workspace
                      </h4>

                      <div className="flex flex-wrap gap-3">
                        {onSeed && (
                          <button
                            onClick={onSeed}
                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <RefreshCw size={14} />
                            {lang === "id" ? "Isi Data Sample Konten" : "Seed Sample Data"}
                          </button>
                        )}

                        {onLeave && !isOwner && (
                          <button
                            onClick={onLeave}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <LogOut size={14} />
                            {lang === "id" ? "Tinggalkan Workspace Ini" : "Leave Workspace"}
                          </button>
                        )}

                        {onDelete && isOwner && (
                          <button
                            onClick={() => setShowDeleteWorkspaceConfirm(true)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            {lang === "id" ? "Hapus Workspace Ini" : "Delete Workspace"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: VISUAL THEME */}
              {activeTab === "visual" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Tema Visual Aplikasi" : "Visual Theme"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Pilih salah satu dari 10 tema warna profesional untuk antarmuka Anda." : "Select your active color palette theme."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                    {THEMES.map((t) => {
                      const isActive = profile?.themeId === t.id || (!profile?.themeId && t.id === "sunset");
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleSaveTheme(t.id)}
                          disabled={savingTheme}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 relative cursor-pointer text-left ${
                            isActive ? "border-blue-600 bg-blue-50/20 shadow-sm" : "border-black/[0.04] bg-white hover:border-neutral-300"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-sm">
                              ✓
                            </div>
                          )}
                          <div className="flex w-full h-6 rounded-lg overflow-hidden shadow-sm">
                            <div className="flex-1" style={{ background: t.primary }} />
                            <div className="flex-1" style={{ background: t.header }} />
                            <div className="flex-1" style={{ background: t.sidebar }} />
                          </div>
                          <span className={`text-xs font-black ${isActive ? "text-blue-700" : "text-neutral-900"}`}>{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: CONTENT PILLARS */}
              {activeTab === "pillars" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Pilar Konten" : "Content Pillars"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Pilar konten membantu mengategorikan topik strategi komunikasi Anda." : "Categorize your content strategy themes."}
                    </p>
                  </div>

                  {/* Add Row */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch bg-black/[0.01] p-3 rounded-2xl border border-black/[0.03]">
                    <ColorPickerSelect value={newColor} onChange={setNewColor} />
                    <input
                      value={newVal}
                      onChange={(e) => setNewVal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPillar()}
                      placeholder="Nama Pilar Baru (Mis: Edukasi, Promosi)..."
                      className="flex-1 text-xs font-bold bg-white border border-black/[0.04] rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 text-black"
                    />
                    <button
                      onClick={addPillar}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus size={14} />
                      {lang === "id" ? "Tambah" : "Add"}
                    </button>
                  </div>

                  {/* Pillars List */}
                  <div className="flex flex-col gap-2 pt-2">
                    {localPillars.map((p: any, i: number) => (
                      <div 
                        key={i} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, i, 'pillars')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, i, 'pillars', localPillars, setLocalPillars)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 bg-white border border-black/[0.03] rounded-2xl shadow-2xs ${draggedIndex === i && draggedType === 'pillars' ? 'opacity-50' : ''}`}>
                        <div className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500">
                          <GripVertical size={16} />
                        </div>
                        <ColorPickerSelect value={p.color} onChange={(val) => editPillar(i, p.name, val)} />
                        <input
                          value={p.name}
                          onChange={(e) => editPillar(i, e.target.value, p.color)}
                          className="flex-1 text-xs font-bold text-neutral-900 bg-transparent outline-none border-b border-transparent focus:border-blue-600 px-1 py-0.5"
                        />
                        <button
                          onClick={() => delPillar(i)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: CONTENT TYPES */}
              {activeTab === "contentTypes" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Tipe / Format Konten" : "Content Types"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Format penyampaian postingan seperti Reels, Carousel, Single Image, Video." : "Define posting formats like Carousel, Reels, Article."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch bg-black/[0.01] p-3 rounded-2xl border border-black/[0.03]">
                    <ColorPickerSelect value={newColor} onChange={setNewColor} />
                    <input
                      value={newVal}
                      onChange={(e) => setNewVal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addContentType()}
                      placeholder="Nama Tipe Konten (Mis: Carousel, Reels)..."
                      className="flex-1 text-xs font-bold bg-white border border-black/[0.04] rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 text-black"
                    />
                    <button
                      onClick={addContentType}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus size={14} />
                      {lang === "id" ? "Tambah" : "Add"}
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {localContentTypes.map((p: any, i: number) => (
                      <div 
                        key={i} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, i, 'contentTypes')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, i, 'contentTypes', localContentTypes, setLocalContentTypes)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 bg-white border border-black/[0.03] rounded-2xl shadow-2xs ${draggedIndex === i && draggedType === 'contentTypes' ? 'opacity-50' : ''}`}>
                        <div className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500">
                          <GripVertical size={16} />
                        </div>
                        <ColorPickerSelect value={p.color} onChange={(val) => editContentType(i, p.name, val)} />
                        <input
                          value={p.name}
                          onChange={(e) => editContentType(i, e.target.value, p.color)}
                          className="flex-1 text-xs font-bold text-neutral-900 bg-transparent outline-none border-b border-transparent focus:border-blue-600 px-1 py-0.5"
                        />
                        <button
                          onClick={() => delContentType(i)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: TEAM / PIC */}
              {activeTab === "pics" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Anggota Tim / PIC" : "Team Members / PIC"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Daftar penanggung jawab untuk setiap brief konten." : "Assignees responsible for content briefs."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch bg-black/[0.01] p-3 rounded-2xl border border-black/[0.03]">
                    <ColorPickerSelect value={newColor} onChange={setNewColor} />
                    <input
                      value={newVal}
                      onChange={(e) => setNewVal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPic()}
                      placeholder="Nama PIC (Mis: Alex, Sarah)..."
                      className="flex-1 text-xs font-bold bg-white border border-black/[0.04] rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 text-black"
                    />
                    <button
                      onClick={addPic}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus size={14} />
                      {lang === "id" ? "Tambah" : "Add"}
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {localPics.map((p: any, i: number) => (
                      <div 
                        key={i} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, i, 'pics')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, i, 'pics', localPics, setLocalPics)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 bg-white border border-black/[0.03] rounded-2xl shadow-2xs ${draggedIndex === i && draggedType === 'pics' ? 'opacity-50' : ''}`}>
                        <div className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500">
                          <GripVertical size={16} />
                        </div>
                        <ColorPickerSelect value={p.color} onChange={(val) => editPic(i, p.name, val)} />
                        <input
                          value={p.name}
                          onChange={(e) => editPic(i, e.target.value, p.color)}
                          className="flex-1 text-xs font-bold text-neutral-900 bg-transparent outline-none border-b border-transparent focus:border-blue-600 px-1 py-0.5"
                        />
                        <button
                          onClick={() => delPic(i)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: WORKFLOW STATUS */}
              {activeTab === "statuses" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Status Workflow Konten" : "Workflow Statuses"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Tahapan pengerjaan postingan dari Draft, Review, Approved, Scheduled, Published." : "Stages of content lifecycle."}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch bg-black/[0.01] p-3 rounded-2xl border border-black/[0.03]">
                    <ColorPickerSelect value={newColor} onChange={setNewColor} />
                    <input
                      value={newVal}
                      onChange={(e) => setNewVal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addStatus()}
                      placeholder="Nama Status (Mis: Review Client, Published)..."
                      className="flex-1 text-xs font-bold bg-white border border-black/[0.04] rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 text-black"
                    />
                    <button
                      onClick={addStatus}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus size={14} />
                      {lang === "id" ? "Tambah" : "Add"}
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {localStatuses.map((p: any, i: number) => (
                      <div 
                        key={i} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, i, 'statuses')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, i, 'statuses', localStatuses, setLocalStatuses)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 p-3 bg-white border border-black/[0.03] rounded-2xl shadow-2xs ${draggedIndex === i && draggedType === 'statuses' ? 'opacity-50' : ''}`}>
                        <div className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500">
                          <GripVertical size={16} />
                        </div>
                        <ColorPickerSelect value={p.color} onChange={(val) => editStatus(i, p.name, val)} />
                        <input
                          value={p.name}
                          onChange={(e) => editStatus(i, e.target.value, p.color)}
                          className="flex-1 text-xs font-bold text-neutral-900 bg-transparent outline-none border-b border-transparent focus:border-blue-600 px-1 py-0.5"
                        />
                        <button
                          onClick={() => delStatus(i)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 10: HOLIDAYS & CUSTOM EVENTS */}
              {activeTab === "holidays" && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Hari Besar & Event Kustom" : "Holidays & Custom Events"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Kelola kalender libur nasional dan event campaign promosi khusus." : "Manage holiday integrations and campaign schedule events."}
                    </p>
                  </div>

                  {/* Holiday API Toggles */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                      {lang === "id" ? "Sumber Kalender Hari Besar (API)" : "Holiday API Sources"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {HOLIDAY_API_OPTIONS.map((opt) => {
                        const isSelected = localHolidayApis.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              if (isSelected) setLocalHolidayApis((prev: string[]) => prev.filter((id) => id !== opt.id));
                              else setLocalHolidayApis((prev: string[]) => [...prev, opt.id]);
                            }}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected ? "border-blue-600 bg-blue-50/20" : "border-black/[0.04] bg-white hover:border-neutral-300"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: opt.color }} />
                              <span className="text-xs font-bold text-neutral-900">{opt.name}</span>
                            </div>
                            {isSelected && <Check size={16} className="text-blue-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Events Planner */}
                  <div className="border-t border-black/[0.03] pt-6 flex flex-col gap-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                      {lang === "id" ? "Event & Campaign Kustom" : "Custom Events"}
                    </h3>

                    {/* New Event Form */}
                    <div className="bg-black/[0.01] border border-black/[0.03] p-4 rounded-2xl flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          value={newEvName}
                          onChange={(e) => setNewEvName(e.target.value)}
                          placeholder="Nama Campaign / Event..."
                          className="flex-1 text-xs font-bold bg-white border border-black/[0.04] rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-600 text-black"
                        />
                        <ColorPickerSelect value={newEvColor} onChange={setNewEvColor} />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-neutral-400">Mulai:</span>
                          <input
                            type="date"
                            value={newEvStart}
                            onChange={(e) => setNewEvStart(e.target.value)}
                            className="text-xs font-bold bg-white border border-black/[0.04] rounded-xl px-3 py-2 outline-none text-black"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-neutral-400">Selesai:</span>
                          <input
                            type="date"
                            value={newEvEnd}
                            onChange={(e) => setNewEvEnd(e.target.value)}
                            className="text-xs font-bold bg-white border border-black/[0.04] rounded-xl px-3 py-2 outline-none text-black"
                          />
                        </div>

                        <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 cursor-pointer ml-auto">
                          <input
                            type="checkbox"
                            checked={newEvMonthly}
                            onChange={(e) => setNewEvMonthly(e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>{lang === "id" ? "Ulangi Tiap Bulan" : "Repeat Monthly"}</span>
                        </label>

                        <button
                          onClick={addCustomEvent}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          {lang === "id" ? "Tambah Event" : "Add Event"}
                        </button>
                      </div>
                    </div>

                    {/* Events List */}
                    <div className="flex flex-col gap-2.5">
                      {localCustomEvents.map((ev: any) => (
                        <div key={ev.id} className="p-3.5 bg-white border border-black/[0.03] rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: ev.color || "#3B82F6" }} />
                            <div>
                              <p className="text-xs font-bold text-neutral-900">{ev.name}</p>
                              <p className="text-[10px] text-neutral-400 font-medium">
                                {ev.start} s/d {ev.end} {ev.monthly && "• (Ulang Bulanan)"}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => delCustomEvent(ev.id)}
                            className="text-neutral-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: LANGUAGE */}
              {activeTab === "language" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-neutral-900">
                      {lang === "id" ? "Pengaturan Bahasa" : "Language Settings"}
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Pilih bahasa tampilan antarmuka sistem Hubify Social." : "Select system interface language."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div
                      onClick={() => setLang("id")}
                      className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        lang === "id" ? "border-blue-600 bg-blue-50/20" : "border-black/[0.04] bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇮🇩</span>
                        <div>
                          <p className="text-xs font-black text-neutral-900">Bahasa Indonesia</p>
                          <p className="text-[10px] text-neutral-400 font-medium">Bahasa sistem bawaan</p>
                        </div>
                      </div>
                      {lang === "id" && <CheckCircle2 size={18} className="text-blue-600" />}
                    </div>

                    <div
                      onClick={() => setLang("en")}
                      className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        lang === "en" ? "border-blue-600 bg-blue-50/20" : "border-black/[0.04] bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇺🇸</span>
                        <div>
                          <p className="text-xs font-black text-neutral-900">English</p>
                          <p className="text-[10px] text-neutral-400 font-medium">International system language</p>
                        </div>
                      </div>
                      {lang === "en" && <CheckCircle2 size={18} className="text-blue-600" />}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 12: DANGER ZONE */}
              {activeTab === "danger" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="text-base font-extrabold text-rose-700 flex items-center gap-1.5">
                      <AlertCircle size={18} />
                      Danger Zone Settings
                    </h2>
                    <p className="text-xs text-neutral-400 font-medium mt-0.5">
                      {lang === "id" ? "Operasi kritis dan penghapusan permanen akun atau workspace." : "Irreversible account or workspace deletions."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 pt-2">
                    {/* Delete Account Card */}
                    <div className="bg-rose-50/30 border border-rose-100 p-5 rounded-2xl max-w-2xl">
                      <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Trash2 size={13} />
                        {lang === "id" ? "Hapus Akun Permanen" : "Permanently Delete Account"}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed font-medium mb-4">
                        {lang === "id"
                          ? "Setelah akun dihapus, tidak ada cara untuk memulihkan postingan, workspace, atau riwayat tagihan Anda kembali. Seluruh data akan segera dimusnahkan secara permanen."
                          : "After your account is terminated, your metadata, workspace items, analytics metrics, and AI history are deleted forever."}
                      </p>

                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase tracking-wider text-[10px] px-5 py-3 rounded-xl transition-all cursor-pointer"
                      >
                        {lang === "id" ? "Hapus Akun Sekarang" : "Delete Account Instantly"}
                      </button>
                    </div>

                    {/* Delete Workspace Card */}
                    {onDelete && isOwner && (
                      <div className="bg-amber-50/40 border border-amber-200/60 p-5 rounded-2xl max-w-2xl">
                        <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Building size={13} />
                          {lang === "id" ? "Hapus Workspace Ini" : "Delete Workspace"}
                        </h3>
                        <p className="text-xs text-neutral-500 leading-relaxed font-medium mb-4">
                          {lang === "id"
                            ? "Menghapus workspace aktif ini beserta seluruh draft postingan dan kalender di dalamnya."
                            : "Deletes current active workspace and associated posts."}
                        </p>

                        <button
                          onClick={() => setShowDeleteWorkspaceConfirm(true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold uppercase tracking-wider text-[10px] px-5 py-3 rounded-xl transition-all cursor-pointer"
                        >
                          {lang === "id" ? "Hapus Workspace" : "Delete Workspace"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 13: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div className="flex flex-col gap-6" style={{ height: "calc(100vh - 120px)" }}>
                  <NotificationPanel
                    notifications={notifications}
                    onClose={() => {}}
                    onRead={handleReadNotif}
                    deleteNotif={deleteNotif}
                    deleteAll={deleteAll}
                    markAllRead={markAllRead}
                    onInviteAction={handleInviteAction}
                    onContactSupport={() => setActiveTab("support")}
                  />
                </div>
              )}

              {/* TAB 14: SUPPORT */}
              {activeTab === "support" && (
                <div className="flex flex-col gap-6" style={{ height: "calc(100vh - 120px)" }}>
                  <ChatSupportPanel
                    userId={profile?.uid || ""}
                    userEmail={profile?.email || ""}
                    userProfile={profile}
                    inline={true}
                  />
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* OVERLAY MODALS */}
      <AnimatePresence>
        {/* Delete Account Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 text-left border border-black/[0.04] shadow-2xl"
            >
              <h3 className="text-base font-bold text-rose-700 mb-2 flex items-center gap-1.5">
                <AlertCircle size={18} />
                {lang === "id" ? "Hapus Akun Permanen" : "Permanently Delete Account"}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-5 font-medium">
                {lang === "id"
                  ? "Tindakan ini tidak dapat dibatalkan. Semua data ruang kerja, postingan sosial, riwayat AI, dan transaksi Anda akan terhapus selamanya dari sistem Hubify."
                  : "This action is irreversible. All of your workspaces, social posts, AI history, and transaction data will be deleted forever."}
              </p>

              <div className="mb-6">
                <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-2">
                  {lang === "id" ? "Mengapa Anda ingin menghapus akun?" : "Why do you want to delete your account?"}
                </label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full text-xs font-bold bg-[#FAFAFA] border border-black/[0.03] focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-3 outline-none transition-all text-black mb-3.5"
                >
                  <option value="" disabled>
                    {lang === "id" ? "Pilih alasan..." : "Select reason..."}
                  </option>
                  {DELETE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {deleteReason === "Lainnya" && (
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder={lang === "id" ? "Ceritakan alasan Anda..." : "Tell us your reason..."}
                    className="w-full text-xs font-medium bg-[#FAFAFA] border border-black/[0.03] focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-3 outline-none transition-all text-black min-h-[90px] resize-none"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-black/[0.03]">
                <button
                  disabled={loadingProfile}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-extrabold uppercase tracking-wider py-3.5 text-[10px] rounded-xl transition-all border border-neutral-200/50 cursor-pointer"
                >
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  disabled={loadingProfile || !deleteReason}
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-extrabold uppercase tracking-wider py-3.5 text-[10px] rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {loadingProfile ? (lang === "id" ? "Memproses..." : "Processing...") : (lang === "id" ? "Hapus Akun" : "Delete Account")}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Workspace Confirmation Modal */}
        {showDeleteWorkspaceConfirm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 text-left border border-black/[0.04] shadow-2xl"
            >
              <h3 className="text-base font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                <Building size={18} />
                {lang === "id" ? "Hapus Workspace" : "Delete Workspace"}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6 font-medium">
                Apakah Anda yakin ingin menghapus workspace "{activeWorkspace?.name}"? Seluruh draft konten dan pengaturan di dalamnya akan hilang.
              </p>

              <div className="flex gap-3 pt-4 border-t border-black/[0.03]">
                <button
                  onClick={() => setShowDeleteWorkspaceConfirm(false)}
                  className="flex-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-extrabold uppercase tracking-wider py-3 text-[10px] rounded-xl border border-neutral-200/50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setShowDeleteWorkspaceConfirm(false);
                    onDelete?.();
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold uppercase tracking-wider py-3 text-[10px] rounded-xl cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Re-authenticate Password Modal */}
        {showReauthModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 text-left border border-black/[0.04] shadow-2xl"
            >
              <h3 className="text-base font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
                <Lock size={18} className="text-blue-600" />
                {lang === "id" ? "Konfirmasi Kata Sandi" : "Confirm Password"}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed mb-5 font-medium">
                {lang === "id"
                  ? "Sesi Anda memerlukan verifikasi ulang demi keamanan. Masukkan kata sandi Anda untuk menghapus akun secara permanen."
                  : "Your session requires re-authentication for security. Enter your password to permanently delete your account."}
              </p>

              {reauthError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{reauthError}</span>
                </div>
              )}

              <div className="mb-6">
                <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-2">
                  {lang === "id" ? "Kata Sandi" : "Password"}
                </label>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-bold bg-[#FAFAFA] border border-black/[0.03] focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-3 outline-none transition-all text-black"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-black/[0.03]">
                <button
                  disabled={loadingProfile}
                  onClick={() => {
                    setShowReauthModal(false);
                    setReauthPassword("");
                    setReauthError("");
                  }}
                  className="flex-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-extrabold uppercase tracking-wider py-3.5 text-[10px] rounded-xl transition-all border border-neutral-200/50 cursor-pointer"
                >
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  disabled={loadingProfile || !reauthPassword}
                  onClick={handlePasswordReauthAndDelete}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-extrabold uppercase tracking-wider py-3.5 text-[10px] rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {loadingProfile
                    ? lang === "id"
                      ? "Memproses..."
                      : "Processing..."
                    : lang === "id"
                    ? "Hapus Akun"
                    : "Delete Account"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Transactions History Modal */}
        {showTxModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 text-left border border-black/[0.04] shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center pb-4 border-b border-black/[0.03]">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
                    <History size={16} className="text-blue-600" />
                    {lang === "id" ? "Riwayat Transaksi" : "Billing History"}
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-medium">
                    {lang === "id" ? "Daftar invoice pembayaran Hubify Social" : "List of Hubify Social subscription payments"}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowTxModal(false)}
                  className="text-neutral-400 hover:text-black transition-colors w-8 h-8 flex items-center justify-center rounded-xl hover:bg-neutral-50 border border-transparent hover:border-black/[0.03] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 pr-1 flex flex-col gap-3">
                {loadingTx ? (
                  <div className="text-center py-12 text-xs text-neutral-400 font-semibold">
                    {lang === "id" ? "Memuat transaksi..." : "Loading transaction history..."}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 text-xs text-neutral-400 font-semibold">
                    {lang === "id" ? "Belum ada riwayat transaksi." : "No transactions found."}
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="border border-black/[0.03] rounded-2xl p-4 bg-black/[0.01] flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-neutral-900 mb-1">{tx.planName || "Paket"}</div>
                        <div className="text-[10px] text-neutral-400 mb-2 flex items-center gap-1.5 flex-wrap">
                          <span>{new Date(tx.timestamp).toLocaleString("id-ID")}</span>
                          <span>&bull;</span>
                          <span className="uppercase font-bold">{tx.paymentMethod || "-"}</span>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full inline-block border ${
                            tx.status === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                          }`}
                        >
                          {tx.status?.toUpperCase() || "SUCCESS"}
                        </span>
                      </div>
                      <div className="sm:text-right shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2">
                        <div className="text-sm font-black text-neutral-900">
                          Rp {tx.amount?.toLocaleString("id-ID")}
                        </div>
                        {tx.status === "success" && (
                          <button
                            onClick={() => handleDownloadInvoice(tx)}
                            className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                          >
                            Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
