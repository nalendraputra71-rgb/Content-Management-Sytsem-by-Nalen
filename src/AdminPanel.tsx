import { useI18n } from "./i18n";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Shield, Settings, Server, TrendingUp, CheckCircle, Activity, 
  Search, Edit2, CreditCard, RefreshCw, AlertCircle, FileText, Globe, 
  Bell, LifeBuoy, ToggleLeft, ToggleRight, ArrowUpRight, ArrowDownRight, 
  BarChart2, X, Download, MessageSquare, ExternalLink, Calendar,
  DollarSign, Package, Tag, Clock, ChevronRight, UserPlus, Filter, Crown, Send, Layout,
  Trash2, Sparkles, HardDrive, Check, Percent
} from "lucide-react";
import { db, collection, getDocs, getDoc, doc, updateDoc, setDoc, deleteDoc, onSnapshot, query, where, addDoc, sendPasswordResetEmail, auth } from "./firebase";
import { fmt, B, CARD } from "./data";

export function AdminPanel({ userProfile, onLogout }: { userProfile: any, onLogout: () => void }) {
  const { lang } = useI18n();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [customAssignPlan, setCustomAssignPlan] = useState("vip");
  const [customAssignDuration, setCustomAssignDuration] = useState(30);
  const groupedPlans = React.useMemo(() => {
    const groups: { [key: string]: any } = {};
    plans.forEach(p => {
      const baseId = p.id.replace('-monthly', '').replace('-annual', '');
      const isAnnual = p.addMonths >= 12;
      if (!groups[baseId]) {
        groups[baseId] = {
          id: baseId,
          name: p.name.replace(/ \((Monthly|Annual)\)/i, ''),
          desc: p.desc,
          popular: p.popular || false,
          limits: p.limits || {},
          capabilities: p.capabilities || {},
          features: p.features || [],
          monthlyId: isAnnual ? null : p.id,
          monthlyPrice: isAnnual ? 0 : p.price,
          monthlyOriginalPrice: isAnnual ? 0 : p.originalPrice,
          annualId: isAnnual ? p.id : null,
          annualPrice: isAnnual ? p.price : 0,
          annualOriginalPrice: isAnnual ? p.originalPrice : 0,
        };
      } else {
        const g = groups[baseId];
        if (!isAnnual) {
          g.name = p.name.replace(/ \((Monthly|Annual)\)/i, '');
          g.desc = p.desc;
          g.popular = p.popular || g.popular;
          g.limits = p.limits || g.limits;
          g.capabilities = p.capabilities || g.capabilities;
          g.features = p.features || g.features;
          g.monthlyId = p.id;
          g.monthlyPrice = p.price;
          g.monthlyOriginalPrice = p.originalPrice;
        } else {
          g.annualId = p.id;
          g.annualPrice = p.price;
          g.annualOriginalPrice = p.originalPrice;
        }
      }
    });
    return Object.values(groups);
  }, [plans]);
  const [promosList, setPromosList] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [deletionReasons, setDeletionReasons] = useState<any[]>([]);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [modalPlanTab, setModalPlanTab] = useState<"general" | "pricing" | "limits" | "capabilities">("general");
  const [financeFilter, setFinanceFilter] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<any>(null);
  const [saveMsg, setSaveMsg] = useState("");

  const [modalPriceMonthly, setModalPriceMonthly] = useState<number>(0);
  const [modalOriginalPriceMonthly, setModalOriginalPriceMonthly] = useState<number>(0);
  const [modalPriceAnnual, setModalPriceAnnual] = useState<number>(0);
  const [modalOriginalPriceAnnual, setModalOriginalPriceAnnual] = useState<number>(0);

  useEffect(() => {
    if (editingPlan && showPlanModal) {
      setModalPriceMonthly(editingPlan.monthlyPrice ?? editingPlan.price ?? 0);
      setModalOriginalPriceMonthly(editingPlan.monthlyOriginalPrice ?? editingPlan.originalPrice ?? 0);
      setModalPriceAnnual(editingPlan.annualPrice ?? (editingPlan.price ? editingPlan.price * 12 : 0));
      setModalOriginalPriceAnnual(editingPlan.annualOriginalPrice ?? (editingPlan.originalPrice ? editingPlan.originalPrice * 12 : 0));
    } else {
      setModalPriceMonthly(0);
      setModalOriginalPriceMonthly(0);
      setModalPriceAnnual(0);
      setModalOriginalPriceAnnual(0);
    }
  }, [editingPlan, showPlanModal]);

  const [systemSettings, setSystemSettings] = useState<any>({
    maintenanceMode: false,
    allowRegistration: true,
    trialDays: 7
  });

  const [featureRows, setFeatureRows] = useState<any[]>([]);
  const [editableRows, setEditableRows] = useState<any[]>([]);

  useEffect(() => {
    if (featureRows.length > 0 && editableRows.length === 0) {
      setEditableRows(featureRows);
    }
  }, [featureRows]);

  const bannerActiveDraft = systemSettings?.bannerActiveDraft !== undefined ? systemSettings.bannerActiveDraft : (systemSettings?.bannerActive || false);
  const bannerMessageDraft = systemSettings?.bannerMessageDraft !== undefined ? systemSettings.bannerMessageDraft : (systemSettings?.bannerMessage || "");
  const bannerTypeDraft = systemSettings?.bannerTypeDraft !== undefined ? systemSettings.bannerTypeDraft : (systemSettings?.bannerType || "info");

  const hasUnpublishedBannerChanges = 
    bannerActiveDraft !== (systemSettings?.bannerActive || false) || 
    bannerMessageDraft !== (systemSettings?.bannerMessage || "") || 
    bannerTypeDraft !== (systemSettings?.bannerType || "info");

  const handlePublishBanner = async () => {
    try {
      await updateSystemConfig({
        bannerActive: bannerActiveDraft,
        bannerMessage: bannerMessageDraft,
        bannerType: bannerTypeDraft,
        bannerActiveDraft: bannerActiveDraft,
        bannerMessageDraft: bannerMessageDraft,
        bannerTypeDraft: bannerTypeDraft
      });
      setSaveMsg("Banner berhasil dipublikasikan!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e: any) {
      alert("Gagal memublikasikan banner: " + e.message);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setLoadingTickets(true);
    try {
      const [usersSnap, adminsSnap, plansSnap, promosSnap, transactionsSnap, ticketsSnap, configSnap, deletionSnap, featuresSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(query(collection(db, "users"), where("role", "==", "admin"))),
        getDocs(collection(db, "plans")),
        getDocs(collection(db, "promos")),
        getDocs(collection(db, "transactions")),
        getDocs(query(collection(db, "tickets"))),
        getDoc(doc(db, "config", "system")),
        getDocs(collection(db, "accountDeletionReasons")),
        getDoc(doc(db, "config", "pricing_features"))
      ]);

      const usersData = usersSnap.docs.map(d => ({id: d.id, ...d.data()}));
      setUsers(usersData as any[]);
      if (selectedUser) {
          const current = usersData.find((u: any) => u.id === selectedUser.id);
          if (current) setSelectedUser(current as any);
      }
      
      setAdmins(adminsSnap.docs.map(d => ({id: d.id, ...d.data()})));
      setPlans(plansSnap.docs.map(d => ({id: d.id, ...d.data()})));
      setPromosList(promosSnap.docs.map(d => ({id: d.id, ...d.data()})));
      setTransactions(transactionsSnap.docs.map(d => ({id: d.id, ...d.data()})));
      
      const ticketsData = ticketsSnap.docs.map(d => ({id: d.id, ...d.data()}));
      setTickets(ticketsData.sort((a:any, b:any) => new Date(b.updatedAt||0).getTime() - new Date(a.updatedAt||0).getTime()));
      if (selectedTicket) {
          const current = ticketsData.find((d: any) => d.id === selectedTicket.id);
          if (current) setSelectedTicket(current as any);
      }
      
      if (configSnap.exists()) setSystemSettings(configSnap.data());
      setDeletionReasons(deletionSnap.docs.map(d => ({id: d.id, ...d.data()})));
      if (featuresSnap.exists() && featuresSnap.data().rows) {
        setFeatureRows(featuresSnap.data().rows);
      }
    } catch (e) {
      console.error("Admin fetch error:", e);
    }
    setLoading(false);
    setLoadingTickets(false);
  };

  useEffect(() => {
    fetchAdminData();
  }, [selectedUser?.id, selectedTicket?.id]);

  const seedDefaultData = async () => {
    try {
      setSaveMsg("Seeding data paket & promo...");
      
      const defaultPlans = [
        {
          id: "free-monthly",
          name: "Free Starter (Monthly)",
          desc: "Cocok untuk mencoba fitur dasar Hubify.",
          price: 0,
          originalPrice: 0,
          addMonths: 1,
          popular: false,
          features: ["1 Workspace", "Hub.AI: 10x Generate AI / Bulan", "Analitik Dasar", "Kalender Konten"],
          limits: { workspaces: 1, socialAccounts: 3, teamMembers: 1, aiGenerationPerMonth: 10, storageMB: 100 },
          capabilities: { autoPublishing: false, analyticsLevel: 'basic', exportReports: 'none', contentApproval: false, commentManagement: false, supportLevel: 'community' }
        },
        {
          id: "free-annual",
          name: "Free Starter (Annual)",
          desc: "Cocok untuk mencoba fitur dasar Hubify.",
          price: 0,
          originalPrice: 0,
          addMonths: 12,
          popular: false,
          features: ["1 Workspace", "Hub.AI: 10x Generate AI / Bulan", "Analitik Dasar", "Kalender Konten"],
          limits: { workspaces: 1, socialAccounts: 3, teamMembers: 1, aiGenerationPerMonth: 10, storageMB: 100 },
          capabilities: { autoPublishing: false, analyticsLevel: 'basic', exportReports: 'none', contentApproval: false, commentManagement: false, supportLevel: 'community' }
        },
        {
          id: "plus-monthly",
          name: "Plus Plan (Monthly)",
          desc: "Sempurna untuk kreator konten & profesional.",
          price: 99000,
          originalPrice: 99000,
          addMonths: 1,
          popular: false,
          features: ["1 Workspace", "Hub.AI: 100x Generate AI / Bulan", "10 Akun Sosmed"],
          limits: { workspaces: 1, socialAccounts: 10, teamMembers: 1, aiGenerationPerMonth: 100, storageMB: 1000 },
          capabilities: { autoPublishing: true, analyticsLevel: 'advanced', exportReports: 'basic', contentApproval: false, commentManagement: true, supportLevel: 'email' }
        },
        {
          id: "plus-annual",
          name: "Plus Plan (Annual)",
          desc: "Sempurna untuk kreator konten & profesional.",
          price: 948000,
          originalPrice: 1188000,
          addMonths: 12,
          popular: false,
          features: ["1 Workspace", "Hub.AI: 100x Generate AI / Bulan", "10 Akun Sosmed"],
          limits: { workspaces: 1, socialAccounts: 10, teamMembers: 1, aiGenerationPerMonth: 100, storageMB: 1000 },
          capabilities: { autoPublishing: true, analyticsLevel: 'advanced', exportReports: 'basic', contentApproval: false, commentManagement: true, supportLevel: 'email' }
        },
        {
          id: "pro-monthly",
          name: "Pro Plan (Monthly)",
          desc: "Kolaborasi mulus untuk tim kecil & bisnis.",
          price: 299000,
          originalPrice: 299000,
          addMonths: 1,
          popular: true,
          features: ["3 Workspaces", "Hub.AI: 500x Generate AI / Bulan", "Kolaborasi 5 Anggota Tim"],
          limits: { workspaces: 3, socialAccounts: 30, teamMembers: 5, aiGenerationPerMonth: 500, storageMB: 10000 },
          capabilities: { autoPublishing: true, analyticsLevel: 'advanced', exportReports: 'custom', contentApproval: true, commentManagement: true, supportLevel: 'priority' }
        },
        {
          id: "pro-annual",
          name: "Pro Plan (Annual)",
          desc: "Kolaborasi mulus untuk tim kecil & bisnis.",
          price: 2868000,
          originalPrice: 3588000,
          addMonths: 12,
          popular: true,
          features: ["3 Workspaces", "Hub.AI: 500x Generate AI / Bulan", "Kolaborasi 5 Anggota Tim"],
          limits: { workspaces: 3, socialAccounts: 30, teamMembers: 5, aiGenerationPerMonth: 500, storageMB: 10000 },
          capabilities: { autoPublishing: true, analyticsLevel: 'advanced', exportReports: 'custom', contentApproval: true, commentManagement: true, supportLevel: 'priority' }
        },
        {
          id: "max-monthly",
          name: "Max Plan (Monthly)",
          desc: "Skalabilitas tanpa batas untuk agensi & enterprise.",
          price: 899000,
          originalPrice: 899000,
          addMonths: 1,
          popular: false,
          features: ["Unlimited Workspaces", "Hub.AI: Unlimited Generate AI", "Custom Analytics & Reporting", "White-label Export & Branding", "Prioritas Dukungan 24/7 VIP"],
          limits: { workspaces: -1, socialAccounts: -1, teamMembers: -1, aiGenerationPerMonth: -1, storageMB: -1 },
          capabilities: { autoPublishing: true, analyticsLevel: 'custom', exportReports: 'white-label', contentApproval: true, commentManagement: true, supportLevel: 'vip' }
        },
        {
          id: "agency-annual",
          name: "Agency (Annual)",
          desc: "Skalabilitas tanpa batas untuk agensi besar.",
          price: 8988000,
          originalPrice: 10788000,
          addMonths: 12,
          popular: false,
          features: ["Unlimited Workspaces", "Hub.AI: Unlimited Generate AI", "Custom Analytics & Reporting", "White-label Export & Branding", "Prioritas Dukungan 24/7 VIP"],
          limits: { workspaces: -1, socialAccounts: -1, teamMembers: -1, aiGenerationPerMonth: -1, storageMB: -1 },
          capabilities: { autoPublishing: true, analyticsLevel: 'custom', exportReports: 'white-label', contentApproval: true, commentManagement: true, supportLevel: 'vip' }
        }
      ];

      const defaultPromos = [
        {
          id: "DISKON77",
          code: "DISKON77",
          type: "percent",
          value: 77,
          isActive: true,
          terms: "Diskon spesial 77% untuk semua paket pilihan Anda.",
          targetType: "all",
          usageLimit: 100,
          usageCount: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: "2027-12-31"
        },
        {
          id: "GRATISPRO",
          code: "GRATISPRO",
          type: "percent",
          value: 100,
          isActive: true,
          terms: "Diskon 100% (Bypass pembayaran) untuk testing & perpanjangan gratis.",
          targetType: "all",
          usageLimit: 50,
          usageCount: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: "2027-12-31"
        }
      ];

      const defaultFeatureRows = [
        { key: 'workspaces', id: 'Workspaces', en: 'Workspaces', type: 'text', f: '1', s: '1', t: '3', a: 'Unlimited' },
        { key: 'socials', id: 'Integrasi Akun Sosial', en: 'Social Account Integrations', type: 'text', f: '3 Akun', s: '10 Akun', t: '30 Akun', a: 'Unlimited' },
        { key: 'members', id: 'Anggota Tim', en: 'Team Members', type: 'text', f: '1 (Solo)', s: '1 (Solo)', t: 'Hingga 3', a: 'Unlimited' },
        { key: 'publishing', id: 'Penjadwalan Otomatis', en: 'Auto-Publishing', type: 'boolean', f: false, s: true, t: true, a: true },
        { key: 'ai_limit', id: 'Batas Generate AI / Bulan', en: 'AI Generation / Month', type: 'text', f: '10 Prompts', s: '100 Prompts', t: '500 Prompts', a: 'Unlimited' },
        { key: 'storage', id: 'Penyimpanan Aset', en: 'Asset Storage', type: 'text', f: '100 MB', s: '1 GB', t: '5 GB', a: 'Unlimited' },
        { key: 'analytics', id: 'Analisis Performa', en: 'Performance Analytics', type: 'text', f: 'Dasar', s: 'Lanjutan', t: 'Lanjutan', a: 'Mendalam' },
        { key: 'export', id: 'Export Laporan', en: 'Export Reports', type: 'text', f: 'Tidak', s: 'Ya', t: 'Ya (Kustom)', a: 'Ya (White-label)' },
        { key: 'approval', id: 'Alur Persetujuan Konten', en: 'Content Approval Workflow', type: 'boolean', f: false, s: false, t: true, a: true },
        { key: 'comments', id: 'Manajemen Komentar', en: 'Comment Management', type: 'boolean', f: false, s: true, t: true, a: true },
        { key: 'support', id: 'Dukungan Pelanggan', en: 'Customer Support', type: 'text', f: 'Komunitas', s: 'Email', t: 'Email Prioritas', a: '24/7 Prioritas' },
      ];

      for (const plan of defaultPlans) {
        await setDoc(doc(db, "plans", plan.id), plan);
      }
      for (const promo of defaultPromos) {
        await setDoc(doc(db, "promos", promo.id), promo);
      }
      await setDoc(doc(db, "config", "pricing_features"), { rows: defaultFeatureRows });

      setSaveMsg("Seeding berhasil! Semua paket & promo default telah dimuat.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err: any) {
      console.error(err);
      alert("Gagal melakukan seeding data: " + err.message);
    }
  };

  const savePlan = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       const fd = new FormData(e.target as HTMLFormElement);
       const name = fd.get("name") as string;
       const desc = fd.get("desc") as string;
       const price_monthly = Number(fd.get("price_monthly"));
       const originalPrice_monthly = Number(fd.get("originalPrice_monthly")) || 0;
       const price_annual = Number(fd.get("price_annual"));
       const originalPrice_annual = Number(fd.get("originalPrice_annual")) || 0;
       const popular = fd.get("popular") === "on";

       const limits = {
          workspaces: Number(fd.get("workspaces")),
          socialAccounts: Number(fd.get("socialAccounts")),
          teamMembers: Number(fd.get("teamMembers")),
          aiGenerationPerMonth: Number(fd.get("aiGenerationPerMonth")),
          storageMB: Number(fd.get("storageMB"))
       };

       const capabilities = {
          autoPublishing: true,
          analyticsLevel: fd.get("analyticsLevel"),
          exportReports: "custom",
          contentApproval: true,
          commentManagement: true,
          supportLevel: fd.get("supportLevel")
       };

       const baseId = editingPlan?.id ? editingPlan.id : name.toLowerCase().trim().replace(/\s+/g, '-');

       // Monthly plan doc
       const monthlyId = `${baseId}-monthly`;
       const monthlyData = {
          id: monthlyId,
          name: `${name} (Monthly)`,
          desc,
          price: price_monthly,
          originalPrice: originalPrice_monthly,
          addMonths: 1,
          popular,
          features: [],
          limits,
          capabilities
       };

       // Annual plan doc
       const annualId = `${baseId}-annual`;
       const annualData = {
          id: annualId,
          name: `${name} (Annual)`,
          desc,
          price: price_annual,
          originalPrice: originalPrice_annual,
          addMonths: 12,
          popular,
          features: [],
          limits,
          capabilities
       };

       await setDoc(doc(db, "plans", monthlyId), monthlyData);
       await setDoc(doc(db, "plans", annualId), annualData);

       setShowPlanModal(false);
     } catch (e: any) { alert(e.message); }
  };

  const fmtRp = (n: number) => "Rp" + (n || 0).toLocaleString("id-ID");

  const savePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target as HTMLFormElement);
      const code = (fd.get("code") as string).toUpperCase();
      const data = {
        code,
        type: fd.get("type"),
        value: Number(fd.get("value")),
        isActive: true,
        terms: fd.get("terms"),
        targetType: fd.get("targetType"), // 'all' or 'first_timer'
        usageLimit: Number(fd.get("usageLimit")) || 0,
        usageCount: editingPromo?.usageCount || 0,
        startDate: fd.get("startDate") || null,
        endDate: fd.get("endDate") || null,
        createdAt: editingPromo?.createdAt || new Date().toISOString()
      };
      await setDoc(doc(db, "promos", code), { ...data, id: code });
      setShowPromoModal(false);
    } catch (e: any) { alert(e.message); }
  };

  const updateSystemConfig = async (updates: any) => {
    try {
      const expandedUpdates: any = {};
      for (const key of Object.keys(updates)) {
        if (key.includes(".")) {
          const parts = key.split(".");
          let current = expandedUpdates;
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) current[part] = {};
            current = current[part];
          }
          current[parts[parts.length - 1]] = updates[key];
        } else {
          expandedUpdates[key] = updates[key];
        }
      }

      const finalUpdates: any = { ...expandedUpdates };
      if (expandedUpdates.features && systemSettings?.features) {
        finalUpdates.features = {
          ...systemSettings.features,
          ...expandedUpdates.features
        };
      }

      await setDoc(doc(db, "config", "system"), finalUpdates, { merge: true });
    } catch (e: any) { alert(e.message); }
  };

  const handleUpdatePlan = async (uid: string, planName: string, daysToAdd: number = 30) => {
    setConfirmAction({
      title: "Konfirmasi Ubah Paket",
      msg: `Apakah Anda yakin ingin mengubah paket user ini menjadi ${planName.toUpperCase()}?`,
      onConfirm: async () => {
        try {
          const activeUntil = new Date();
          if (daysToAdd === 0) {
            activeUntil.setFullYear(2000); // Expired
          } else {
            activeUntil.setDate(activeUntil.getDate() + daysToAdd);
          }
          await updateDoc(doc(db, "users", uid), { 
            plan: planName.toLowerCase(), 
            activeUntil: activeUntil.toISOString() 
          });
          setSaveMsg("Paket berhasil diperbarui secara manual.");
          setTimeout(() => setSaveMsg(""), 3000);
        } catch (e) { alert("Gagal update paket"); }
      }
    });
  };

  const handleResetPassword = async (email: string) => {
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      setSaveMsg("Link reset password berhasil dikirim ke email user.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e: any) {
      alert("Gagal kirim reset email: " + e.message);
    }
  };

  const togglePromo = async (p: any) => {
    try {
       await updateDoc(doc(db, "promos", p.id), { isActive: !p.isActive });
    } catch(e:any) { alert(e.message); }
  };

  const handleReply = async () => {
     const el = (document.getElementById("ticket_reply") as HTMLTextAreaElement);
     const text = el.value;
     if(!text || !selectedTicket) return;
     try {
        await updateDoc(doc(db, "tickets", selectedTicket.id), {
           messages: [...(selectedTicket.messages||[]), { sender: "admin", text, timestamp: new Date().toISOString() }],
           status: "open",
           readByUser: false,
           updatedAt: new Date().toISOString()
        });
        el.value = "";
     } catch(e:any) { alert(e.message); }
  };

  const [bcTitle, setBcTitle] = useState("");
  const [bcDesc, setBcDesc] = useState("");
  const [bcTarget, setBcTarget] = useState("all");
  const [bcSending, setBcSending] = useState(false);

  const handleSendBroadcast = async () => {
    if(!bcTitle || !bcDesc) return alert("Title and Desc are required.");
    setBcSending(true);
    try {
      await addDoc(collection(db, "global_notifications"), {
        title: bcTitle,
        desc: bcDesc,
        target: bcTarget,
        createdAt: new Date().getTime(),
      });
      alert("Broadcast terkirim.");
      setBcTitle("");
      setBcDesc("");
    } catch(e:any) {
      alert(e.message);
    }
    setBcSending(false);
  };

  const isAdminUser = userProfile?.role === "admin" || userProfile?.email?.toLowerCase() === "nalendraputra71@gmail.com";
  if (!userProfile || !isAdminUser) {
    return <div style={{flex: 1, display:"flex", alignItems:"center", justifyContent:"center", color:"#9C2B4E", fontSize: 16, fontWeight: 700}}>Akses Ditolak.</div>;
  }

  const TABS = [
    { id: "dashboard", lb: "Dashboard", ic: <Activity size={18}/> },
    { id: "users", lb: "Manajemen User", ic: <Users size={18}/> },
    { id: "finance", lb: "Keuangan", ic: <DollarSign size={18}/> },
    { id: "admins", lb: "Super Admin", ic: <Shield size={18}/> },
    { id: "plans", lb: "Paket & Promo", ic: <Tag size={18}/> },
    { id: "support", lb: "Support & Tiket", ic: <LifeBuoy size={18}/> },
    { id: "deletion_feedback", lb: lang === "id" ? "Alasan Hapus Akun" : "Account Deletion Reasons", ic: <AlertCircle size={18}/> },
    { id: "broadcasts", lb: "Broadcasts", ic: <Send size={18}/> },
    { id: "settings", lb: "Pengaturan", ic: <Settings size={18}/> }
  ];

  const filteredUsers = users.filter((u:any) => (u.email || "").toLowerCase().includes(searchEmail.toLowerCase()));

  return (
    <div style={{flex:1, width:"100%", display:"flex", flexDirection:"column", minHeight:0, background:"#FAFAFA", overflow:"hidden"}}>
      {/* Header */}
      <div style={{background:"#FFFFFF", padding:"16px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(0,0,0,0.05)", zIndex:10}}>
        <div style={{display:"flex", alignItems:"center", gap: 12}}>
          <div style={{width:40, height:40, background:"rgba(59,130,246,0.08)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
            <Shield size={22} color="var(--theme-primary)" />
          </div>
          <div>
            <h1 style={{margin:0, fontSize:16, fontWeight:800, color:"#111827", letterSpacing:"-0.5px"}}>Admin Central</h1>
            <div style={{fontSize:11, color:"#6B7280", fontWeight:500}}>{userProfile?.email}</div>
          </div>
        </div>
        <div style={{display:"flex", gap:12}}>
          <div style={{display:"flex", alignItems:"center", gap:8, background:"rgba(16,185,129,0.08)", color:"#10B981", padding:"6px 14px", borderRadius:20, fontSize:11, fontWeight:700}}>
             <div style={{width:6, height:6, borderRadius:"50%", background:"#10B981", boxShadow:"0 0 8px #10B981"}} />
             Sistem Operasional Aktif
          </div>
          <button onClick={fetchAdminData} style={{display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, border:"1px solid rgba(0,0,0,0.1)", background:"white", cursor:"pointer", fontSize: 12, fontWeight: 600, color: "#4B5563"}} className="hover:bg-stone-50 transition-colors">
            {loading ? <span className="animate-spin text-stone-400"><RefreshCw size={14}/></span> : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>
      </div>

      <div style={{display:"flex", flex:1, overflow:"hidden"}}>
        {/* Sidebar Nav */}
        <div style={{width: 240, background:"#FFFFFF", borderRight:"1px solid rgba(0,0,0,0.05)", display:"flex", flexDirection:"column", padding: "24px 16px", gap: 6}}>
          {TABS.map(t => {
            const isSelected = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedUser(null); }} 
                style={{
                  display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", 
                  background: isSelected ? "rgba(59,130,246,0.05)" : "transparent", 
                  color: isSelected ? "var(--theme-primary)" : "#6B7280", 
                  border: "none", textAlign:"left", transition:"all 0.2s",
                  position: "relative"
                }}
                className="hover-bg-theme"
              >
                {isSelected && (
                  <div style={{position:"absolute", left: 0, top: 12, bottom: 12, width: 3, background:"var(--theme-primary)", borderRadius:"0 4px 4px 0"}} />
                )}
                <span style={{color: isSelected ? "var(--theme-primary)" : "#9CA3AF"}}>{t.ic}</span> 
                {t.lb}
              </button>
            );
          })}
          <div style={{marginTop:"auto", paddingTop:16, borderTop:"1px solid rgba(0,0,0,0.05)"}}>
             <button onClick={onLogout} style={{width:"100%", padding:"11px", borderRadius:12, border:"1px solid rgba(0,0,0,0.06)", background:"white", fontSize:12, fontWeight:700, cursor:"pointer", color:"#EF4444", transition:"all 0.2s"}} className="btn-hover">{lang === "id" ? "Keluar" : "Sign Out"}</button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{flex:1, padding: "32px 40px", overflowY:"auto", paddingBottom: 100}}>
          <AnimatePresence mode="wait">
            
            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div key="db" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{maxWidth:1000}}>
                 <div style={{marginBottom:32}}>
                   <h2 style={{fontSize:28, fontWeight:800, color:"#111827", margin:0, letterSpacing:"-1px"}}>{lang === "id" ? "Ringkasan Sistem" : "System Summary"}</h2>
                   <p style={{fontSize:14, color:"#6B7280", marginTop:4}}>{lang === "id" ? "Pantau pertumbuhan dan performa bisnis secara real-time." : "Monitor business growth and performance in real-time."}</p>
                 </div>

                 <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom:32}}>
                    <div style={{background:"#FFFFFF", borderRadius:20, padding:24, border:"1px solid rgba(0,0,0,0.04)", boxShadow:"0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02)"}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16}}>
                        <div style={{width:44, height:44, background:"rgba(16,185,129,0.08)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          <Users size={20} color="#10B981"/>
                        </div>
                        <div style={{fontSize:11, color:"#10B981", fontWeight:700, background:"rgba(16,185,129,0.08)", padding:"4px 8px", borderRadius:8}}>+12%</div>
                      </div>
                      <div style={{fontSize:12, color:"#6B7280", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px"}}>{lang === "id" ? "Total User Terdaftar" : "Total Registered Users"}</div>
                      <div style={{fontSize:32, fontWeight:800, color:"#111827", marginTop:6}}>{users.length}</div>
                    </div>
                    <div style={{background:"#FFFFFF", borderRadius:20, padding:24, border:"1px solid rgba(0,0,0,0.04)", boxShadow:"0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02)"}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16}}>
                        <div style={{width:44, height:44, background:"rgba(59,130,246,0.08)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          <Package size={20} color="var(--theme-primary)"/>
                        </div>
                      </div>
                      <div style={{fontSize:12, color:"#6B7280", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px"}}>{lang === "id" ? "User Premium (Pro)" : "Premium Users (Pro)"}</div>
                      <div style={{fontSize:32, fontWeight:800, color:"#111827", marginTop:6}}>{users.filter(u=>u.plan==="pro").length}</div>
                    </div>
                    <div style={{background:"#FFFFFF", borderRadius:20, padding:24, border:"1px solid rgba(0,0,0,0.04)", boxShadow:"0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02)"}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16}}>
                        <div style={{width:44, height:44, background:"rgba(59,130,246,0.08)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center"}}>
                          <DollarSign size={20} color="var(--theme-primary)"/>
                        </div>
                      </div>
                      <div style={{fontSize:12, color:"#6B7280", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px"}}>{lang === "id" ? "Total Revenue (Lifetime)" : "Total Revenue (Lifetime)"}</div>
                      <div style={{fontSize:32, fontWeight:800, color:"#111827", marginTop:6}}>{fmtRp(transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0))}</div>
                    </div>
                 </div>

                 <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:24}}>
                    <div style={{background:"#FFFFFF", borderRadius:20, padding:24, border:"1px solid rgba(0,0,0,0.04)", boxShadow:"0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02)"}}>
                       <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
                          <h3 style={{fontSize:16, fontWeight:800, color:"#111827", margin:0}}>{lang === "id" ? "Tiket Support Terbaru" : "Recent Support Tickets"}</h3>
                          <button onClick={()=>setActiveTab("support")} style={{fontSize:12, fontWeight:700, color:"var(--theme-primary)", background:"transparent", border:"none", cursor:"pointer"}}>{lang === "id" ? "Lihat Semua" : "View All"}</button>
                       </div>
                       <div style={{display:"flex", flexDirection:"column", gap:12}}>
                          {tickets.slice(0, 5).map(t => (
                            <div key={t.id} style={{display:"flex", alignItems:"center", gap:16, padding:"14px", border:"1px solid rgba(0,0,0,0.04)", background:"rgba(0,0,0,0.01)", borderRadius:14}}>
                               <div style={{width:36, height:36, borderRadius:10, background:"rgba(59,130,246,0.06)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--theme-primary)"}}>
                                  <MessageSquare size={16} />
                               </div>
                               <div style={{flex:1}}>
                                  <div style={{fontSize:13, fontWeight:700, color:"#111827"}}>{t.subject}</div>
                                  <div style={{fontSize:11, color:"#6B7280", marginTop:2}}>{t.userEmail}</div>
                               </div>
                               <div style={{fontSize:11, fontWeight:700, color:"var(--theme-primary)", background:"rgba(59,130,246,0.08)", padding:"4px 10px", borderRadius:8}}>{t.status}</div>
                            </div>
                          ))}
                          {tickets.length === 0 && (
                            <div style={{textAlign:"center", padding:"30px 0", color:"#9CA3AF", fontSize:13, fontWeight:500}}>{lang === "id" ? "Tidak ada tiket support baru." : "No new support tickets."}</div>
                          )}
                       </div>
                    </div>
                    <div style={{background:"#FFFFFF", borderRadius:20, padding:24, border:"1px solid rgba(0,0,0,0.04)", boxShadow:"0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02)"}}>
                       <h3 style={{fontSize:16, fontWeight:800, color:"#111827", margin:0, marginBottom:18}}>{lang === "id" ? "Aksi Cepat" : "Quick Actions"}</h3>
                       <div style={{display:"flex", flexDirection:"column", gap:16}}>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div style={{fontSize:13, fontWeight:700, color:"#374151"}}>{lang === "id" ? "Mode Perbaikan" : "Maintenance Mode"}</div>
                             <button onClick={()=>updateSystemConfig({maintenanceMode: !systemSettings.maintenanceMode})} style={{background:"transparent", border:"none", cursor:"pointer", color: systemSettings.maintenanceMode ? "#EF4444" : "#9CA3AF", padding:0}}>
                               {systemSettings.maintenanceMode ? <ToggleRight size={36}/> : <ToggleLeft size={36}/>}
                             </button>
                          </div>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div style={{fontSize:13, fontWeight:700, color:"#374151"}}>{lang === "id" ? "Pendaftaran Pengguna" : "User Registration"}</div>
                             <button onClick={()=>updateSystemConfig({allowRegistration: !systemSettings.allowRegistration})} style={{background:"transparent", border:"none", cursor:"pointer", color: systemSettings.allowRegistration ? "var(--theme-primary)" : "#9CA3AF", padding:0}}>
                               {systemSettings.allowRegistration ? <ToggleRight size={36}/> : <ToggleLeft size={36}/>}
                             </button>
                          </div>
                          
                          <div style={{borderTop:"1px solid rgba(0,0,0,0.05)", margin:"4px 0"}} />
                          
                          <div style={{display:"flex", flexDirection:"column", gap:12}}>
                            <div style={{display:"flex", gap:12}}>
                                <button onClick={() => alert("Data user berhasil diekspor ke format Excel (mock).")} style={{flex:1, background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.08)", color:"#374151", padding:"10px", borderRadius:12, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6}} className="btn-hover">
                                  <Download size={14} /> Export
                                </button>
                                <button onClick={() => alert("Sinkronisasi cache server berhasil (mock).")} style={{flex:1, background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.08)", color:"#374151", padding:"10px", borderRadius:12, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6}} className="btn-hover">
                                  <RefreshCw size={14} /> Sync Cache
                                </button>
                            </div>
                            <button onClick={() => {
                              const msg = window.prompt("Ketik pesan broadcast ke semua pengguna:");
                              if (msg) alert("Broadcast berhasil dikirim: " + msg);
                            }} style={{background:"var(--theme-primary)", color:"white", border:"none", padding:"12px", borderRadius:12, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6}} className="btn-hover">
                              <Send size={14} /> Broadcast Notifikasi
                            </button>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* USERS */}
            {activeTab === "users" && !selectedUser && (
              <motion.div key="users" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28}}>
                  <div>
                    <h2 style={{fontSize:28, fontWeight:800, color:"#111827", margin:0, letterSpacing:"-1px"}}>{lang === "id" ? "Manajemen User" : "User Management"}</h2>
                    <p style={{fontSize:14, color:"#6B7280", marginTop:4}}>{lang === "id" ? "Kelola akses, paket, dan data seluruh pengguna sistem." : "Manage access, plans, and data for all system users."}</p>
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:12}}>
                    <div style={{display:"flex", alignItems:"center", background:"#FFFFFF", padding:"10px 16px", borderRadius:12, border:"1px solid rgba(0,0,0,0.06)", width: 320, boxShadow:"0 1px 3px rgba(0,0,0,0.01)"}}>
                      <Search size={18} color="#9CA3AF" style={{marginRight:10}}/>
                      <input placeholder="Cari email user..." value={searchEmail} onChange={e=>setSearchEmail(e.target.value)} style={{border:"none", outline:"none", flex:1, fontSize:13, background:"transparent", color:"#111827", fontWeight:600}} />
                    </div>
                    <button onClick={() => alert(lang === "id" ? "Fitur Tambah User Manual akan segera tersedia." : "Manual Add User feature will be available soon.")} style={{background:"var(--theme-primary)", color:"white", border:"none", padding:"12px 20px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8}} className="btn-hover">
                      <UserPlus size={16} /> Tambah User
                    </button>
                  </div>
                </div>

                <div style={{background:"#FFFFFF", borderRadius:20, border:"1px solid rgba(0,0,0,0.04)", boxShadow:"0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02)", overflowX:"auto", padding:0}}>
                  <table style={{width:"100%", minWidth: 1000, borderCollapse:"collapse", fontSize:13}}>
                    <thead style={{background:"rgba(0,0,0,0.01)", borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                      <tr>
                        <th style={{padding:"18px 24px", textAlign:"left", color:"#4B5563", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", width:280}}>{lang === "id" ? "Email & Identitas" : "Email & Identity"}</th>
                        <th style={{padding:"18px 24px", textAlign:"center", color:"#4B5563", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", width:140}}>{lang === "id" ? "Email Terverifikasi" : "Email Verified"}</th>
                        <th style={{padding:"18px 24px", textAlign:"center", color:"#4B5563", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", width:120}}>{lang === "id" ? "Paket" : "Plan"}</th>
                        <th style={{padding:"18px 24px", textAlign:"center", color:"#4B5563", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", width:100}}>{lang === "id" ? "Peran" : "Role"}</th>
                        <th style={{padding:"18px 24px", textAlign:"center", color:"#4B5563", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.5px", width:120}}>{lang === "id" ? "Status" : "Status"}</th>
                        <th style={{padding:"18px 24px", textAlign:"right"}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u:any) => (
                        <tr key={u.id} style={{borderBottom:"1px solid rgba(0,0,0,0.04)", verticalAlign:"middle"}} className="hover-bg-light">
                          <td style={{padding:"16px 24px"}}>
                             <div style={{fontWeight:800, color:"#111827", fontSize:14}}>{u.email}</div>
                             <div style={{fontSize:10, color:"#9CA3AF", marginTop:4, fontFamily:"monospace"}}>UID: {u.id}</div>
                          </td>
                          <td style={{padding:"16px 24px", textAlign:"center"}}>
                             <div style={{display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, background: u.emailVerified ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)"}}>
                               <div style={{width:6, height:6, borderRadius:"50%", background: u.emailVerified ? "#10B981" : "#EF4444"}} />
                               <span style={{fontSize:11, fontWeight:800, color: u.emailVerified ? "#10B981" : "#EF4444"}}>{u.emailVerified ? "Verified" : "Unverified"}</span>
                             </div>
                          </td>
                          <td style={{padding:"16px 24px", textAlign:"center"}}>
                             <div style={{
                               display:"inline-flex", alignItems:"center", gap:4, 
                               background: u.plan==="vip" ? "rgba(245,158,11,0.08)" : (u.plan==="pro" ? "rgba(59,130,246,0.08)" : "rgba(107,114,128,0.08)"), 
                               color: u.plan==="vip" ? "#D97706" : (u.plan==="pro" ? "var(--theme-primary)" : "#4B5563"), 
                               padding:"4px 12px", borderRadius:10, fontWeight:900, fontSize:10, 
                               border: u.plan==="vip" ? "1px solid rgba(245,158,11,0.15)" : (u.plan==="pro" ? "1px solid rgba(59,130,246,0.15)" : "1px solid rgba(107,114,128,0.15)")
                             }}>
                               {u.plan==="vip" && <Crown size={12} />}
                               {u.plan ? u.plan.toUpperCase() : "FREE"}
                             </div>
                          </td>
                          <td style={{padding:"16px 24px", textAlign:"center"}}>
                             <span style={{fontSize:11, fontWeight:700, textTransform:"uppercase", color:"#4B5563"}}>{u.role || "user"}</span>
                          </td>
                          <td style={{padding:"16px 24px", textAlign:"center"}}>
                             <div style={{display:"inline-flex", alignItems:"center", gap:6}}>
                               <div style={{width:8, height:8, borderRadius:"50%", background: u.activeUntil && new Date(u.activeUntil) > new Date() ? "#10B981" : "#9CA3AF", border:"2px solid white", boxShadow: u.activeUntil && new Date(u.activeUntil) > new Date() ? "0 0 8px #10B981" : "none"}} />
                               <span style={{fontSize:12, fontWeight:600, color: u.activeUntil && new Date(u.activeUntil) > new Date() ? "#111827" : "#6B7280"}}>{u.activeUntil && new Date(u.activeUntil) > new Date() ? "Aktif" : "Expired"}</span>
                             </div>
                          </td>
                          <td style={{padding:"16px 24px", textAlign:"right"}}>
                             <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
                               <button onClick={() => setSelectedUser(u)} style={{background:"var(--theme-primary)", border:"none", padding:"8px 16px", borderRadius:10, fontSize:11, fontWeight:800, cursor:"pointer", color:"white"}} className="btn-hover">{lang === "id" ? "Kelola" : "Manage"}</button>
                               <button onClick={() => setDeletingItem({id: u.id, type:"users", name: u.email})} style={{background:"white", border:"1px solid rgba(239,68,68,0.15)", color:"#EF4444", borderRadius:10, padding:"8px 16px", fontSize:11, fontWeight:800, cursor:"pointer"}} className="btn-hover">{lang === "id" ? "Hapus" : "Delete"}</button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div style={{padding:60, textAlign:"center", color:"#9CA3AF", fontWeight:600}}>{lang === "id" ? "Tidak ada user ditemukan." : "No users found."}</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* USER DETAIL */}
            {activeTab === "users" && selectedUser && (
              <motion.div key="userDetail" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0}} style={{maxWidth:900}}>
                <button onClick={()=>setSelectedUser(null)} style={{background:"none", border:"none", display:"flex", alignItems:"center", gap:8, color:"var(--theme-primary)", fontWeight:800, cursor:"pointer", marginBottom:24}}>
                  <X size={18}/> Back to List
                </button>
                
                <div style={{display:"grid", gridTemplateColumns:"1fr 2fr", gap:24}}>
                   <div style={{background:"#FFFFFF", borderRadius:24, padding:24, border:"1px solid rgba(0,0,0,0.04)", boxShadow:"0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02)"}}>
                      <div style={{width:80, height:80, background:"rgba(59,130,246,0.08)", borderRadius:24, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px"}}>
                         <Users size={40} color="var(--theme-primary)"/>
                      </div>
                      <h3 style={{textAlign:"center", margin:0, fontSize:18, fontWeight:800, color:"#111827", wordBreak:"break-all"}}>{selectedUser.email}</h3>
                      <div style={{textAlign:"center", fontSize:12, color:"#6B7280", marginTop:4}}>{lang === "id" ? "Bergabung: " : "Joined: "}{new Date(selectedUser.createdAt||Date.now()).toLocaleDateString()}</div>
                      
                      <div style={{marginTop:24, paddingTop:24, borderTop:"1px solid rgba(0,0,0,0.05)"}}>
                         <div style={{fontSize:11, fontWeight:700, color:"#4B5563", textTransform:"uppercase", marginBottom:12}}>{lang === "id" ? "Status Berlangganan" : "Subscription Status"}</div>
                         <div style={{background:"rgba(0,0,0,0.01)", padding:14, borderRadius:12, border:"1px solid rgba(0,0,0,0.04)"}}>
                            <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                               <span style={{fontSize:12, fontWeight:600, color:"#4B5563"}}>{lang === "id" ? "Paket:" : "Plan:"}</span>
                               <span style={{fontSize:13, fontWeight:800, color:"var(--theme-primary)"}}>{selectedUser.plan || "Free"}</span>
                            </div>
                            <div style={{display:"flex", justifyContent:"space-between"}}>
                               <span style={{fontSize:12, fontWeight:600, color:"#4B5563"}}>{lang === "id" ? "Aktif Hingga:" : "Active Until:"}</span>
                               <span style={{fontSize:12, fontWeight:700, color:"#111827"}}>{selectedUser.activeUntil ? new Date(selectedUser.activeUntil).toLocaleDateString() : "-"}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div style={{marginTop:24, paddingTop:24, borderTop:"1px solid rgba(0,0,0,0.05)"}}>
                         <div style={{fontSize:11, fontWeight:700, color:"#4B5563", textTransform:"uppercase", marginBottom:12}}>{lang === "id" ? "Keamanan & Akses" : "Security & Access"}</div>
                         <button onClick={()=>handleResetPassword(selectedUser.email)} style={{background:"#FFFFFF", color:"#374151", border:"1px solid rgba(0,0,0,0.08)", padding:"12px", borderRadius:12, fontSize:12, fontWeight:700, cursor:"pointer", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8}} className="btn-hover">
                             <CheckCircle size={16} /> Kirim Link Reset Password
                         </button>
                      </div>
                   </div>

                   <div style={{display:"flex", flexDirection:"column", gap:24}}>
                      <div style={{background:"#FFFFFF", borderRadius:24, padding:24, border:"1px solid rgba(0,0,0,0.04)", boxShadow:"0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02)"}}>
                         <h3 style={{fontSize:16, fontWeight:800, color:"#111827", marginBottom:16}}>{lang === "id" ? "Ubah Paket Manual & Riset" : "Manual Plan & Testing"}</h3>
                         
                         <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                            <div>
                              <label style={{display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 6}}>{lang === "id" ? "Pilih Paket" : "Select Plan"}</label>
                              <select 
                                value={customAssignPlan} 
                                onChange={(e) => setCustomAssignPlan(e.target.value)}
                                style={{width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13, background: "#F9FAFB", cursor: "pointer"}}
                              >
                                <option value="free">Free / Gratis</option>
                                <option value="vip">VIP (Lifetime / Special)</option>
                                {plans.map(p => (
                                  <option key={p.id} value={p.id}>{p.name || p.id}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label style={{display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 6}}>{lang === "id" ? "Durasi Akses" : "Access Duration"}</label>
                              <select 
                                value={customAssignDuration} 
                                onChange={(e) => setCustomAssignDuration(Number(e.target.value))}
                                style={{width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 13, background: "#F9FAFB", cursor: "pointer"}}
                              >
                                <option value={0}>{lang === "id" ? "Cabut Akses (0 Hari)" : "Revoke Access (0 Days)"}</option>
                                <option value={30}>1 Bulan (30 Hari)</option>
                                <option value={90}>3 Bulan (90 Hari)</option>
                                <option value={180}>6 Bulan (180 Hari)</option>
                                <option value={365}>1 Tahun (365 Hari)</option>
                                <option value={3650}>10 Tahun (Lifetime)</option>
                              </select>
                            </div>

                            <button 
                              onClick={() => handleUpdatePlan(selectedUser.id, customAssignPlan, customAssignDuration)} 
                              style={{background: "var(--theme-primary)", color: "white", border: "none", padding: "12px", borderRadius: "12px", fontWeight: 700, cursor: "pointer", marginTop: "8px"}} 
                              className="btn-hover"
                            >
                              {lang === "id" ? "Berikan Akses Paket" : "Assign Plan Access"}
                            </button>
                         </div>
                      </div>

                      <div style={{background:"#FFFFFF", borderRadius:24, padding:24, border:"1px solid rgba(0,0,0,0.04)", boxShadow:"0 1px 3px rgba(0,0,0,0.01), 0 10px 30px rgba(0,0,0,0.02)"}}>
                         <h3 style={{fontSize:16, fontWeight:800, color:"#111827", marginBottom:16}}>Midtrans History</h3>
                         <div style={{display:"flex", flexDirection:"column", gap:10}}>
                            {/* In a real app, this would be a filtered list of transactions */}
                            <div style={{padding:20, border:"1px dashed rgba(0,0,0,0.08)", borderRadius:14, textAlign:"center", fontSize:12, color:"#9CA3AF", fontWeight:500}}>
                               Belum ada riwayat transaksi Midtrans untuk user ini.
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {/* FINANCE */}
            {activeTab === "finance" && (
              <motion.div key="finance" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                 <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32}}>
                   <div>
                     <h2 style={{fontSize:28, fontWeight:800, color:"#111827", margin:0, letterSpacing:"-1px"}}>Manajemen Keuangan</h2>
                     <p style={{fontSize:14, color:"#6B7280", marginTop:4}}>Pantau transaksi, revenue, dan pertumbuhan finansial SaaS.</p>
                   </div>
                   <div style={{display:"flex", gap:12}}>
                      <select 
                        value={financeFilter.month} 
                        onChange={e => setFinanceFilter(p => ({...p, month: Number(e.target.value)}))}
                        style={{padding:"10px 16px", borderRadius:12, border:"1px solid rgba(0,0,0,0.06)", background:"#FFFFFF", color:"#374151", fontSize:13, fontWeight:700, outline:"none", boxShadow:"0 1px 2px rgba(0,0,0,0.01)"}}
                      >
                        {Array.from({length:12}, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>{new Date(2000, m-1).toLocaleString('id-ID', {month:'long'})}</option>
                        ))}
                      </select>
                      <select 
                        value={financeFilter.year} 
                        onChange={e => setFinanceFilter(p => ({...p, year: Number(e.target.value)}))}
                        style={{padding:"10px 16px", borderRadius:12, border:"1px solid rgba(0,0,0,0.06)", background:"#FFFFFF", color:"#374151", fontSize:13, fontWeight:700, outline:"none", boxShadow:"0 1px 2px rgba(0,0,0,0.01)"}}
                      >
                        {[2024, 2025, 2026, 2027].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                   </div>
                 </div>

                 <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom:32}}>
                    <div style={CARD({padding:24, borderRadius:20})}>
                       <div style={{fontSize:12, color:"rgba(44,32,22,0.5)", fontWeight:700, textTransform:"uppercase"}}>Total Revenue</div>
                       <div style={{fontSize:32, fontWeight:800, color:"#111827", marginTop:8, letterSpacing:"-1px"}}>{fmtRp(transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0))}</div>
                       <div style={{fontSize:12, color:"#4CAF50", fontWeight:700, marginTop:8}}>Lifetime Earnings</div>
                    </div>
                    <div style={CARD({padding:24, borderRadius:20})}>
                       <div style={{fontSize:11, color:"#6B7280", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px"}}>MRR (Estimated)</div>
                       <div style={{fontSize:32, fontWeight:800, color:"#111827", marginTop:8, letterSpacing:"-1px"}}>{fmtRp(users.filter(u=>u.plan==="pro").length * 99000)}</div>
                       <div style={{fontSize:12, color:"#2196F3", fontWeight:700, marginTop:8}}>Monthly Recurring Revenue</div>
                    </div>
                    <div style={CARD({padding:24, borderRadius:20})}>
                       <div style={{fontSize:11, color:"#6B7280", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px"}}>Pendapatan Periode Filter</div>
                       <div style={{fontSize:32, fontWeight:800, color:"#111827", marginTop:8, letterSpacing:"-1px"}}>
                         {fmtRp(transactions.filter(t => {
                           const d = new Date(t.timestamp);
                           return d.getMonth() + 1 === financeFilter.month && d.getFullYear() === financeFilter.year;
                         }).reduce((acc, t) => acc + (Number(t.amount) || 0), 0))}
                       </div>
                       <div style={{fontSize:12, color:"#FF9800", fontWeight:700, marginTop:8}}>Bulan: {new Date(2000, financeFilter.month-1).toLocaleString('id-ID', { month: 'long' })} {financeFilter.year}</div>
                    </div>
                 </div>

                 <div style={CARD({borderRadius:20, overflow:"hidden", border:"1px solid #EEE"})}>
                    <div style={{padding:"20px 24px", borderBottom:"1px solid rgba(0,0,0,0.05)", background:"rgba(0,0,0,0.01)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                       <h3 style={{fontSize:16, fontWeight:800, margin:0}}>History Transaksi Berdasarkan Filter</h3>
                       <button onClick={() => {
                          const csv = "Date,Email,Plan,Amount,Voucher,Method\n" + transactions.map(t => `${t.timestamp},${t.userEmail},${t.planName},${t.amount},${t.voucherCode || '-'},${t.paymentMethod}`).join("\n");
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.setAttribute('hidden', '');
                          a.setAttribute('href', url);
                          a.setAttribute('download', 'transaksi.csv');
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                       }} style={{fontSize:12, fontWeight:700, color:"var(--theme-primary)", background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.08)", padding:"8px 16px", borderRadius:10, cursor:"pointer"}} className="btn-hover">Ekspor CSV</button>
                    </div>
                    <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                        <thead>
                          <tr style={{background:"rgba(0,0,0,0.01)", borderBottom:"1px solid rgba(0,0,0,0.05)", textAlign:"left"}}>
                             <th style={{padding:"18px 24px", fontSize:11, fontWeight:700, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.5px"}}>TANGGAL & JAM</th>
                             <th style={{padding:"18px 24px", fontSize:11, fontWeight:700, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.5px", minWidth:180}}>PENGGUNA</th>
                             <th style={{padding:"18px 24px", fontSize:11, fontWeight:700, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.5px"}}>PAKET</th>
                             <th style={{padding:"18px 24px", fontSize:11, fontWeight:700, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.5px"}}>VOUCHER</th>
                             <th style={{padding:"18px 24px", fontSize:11, fontWeight:700, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.5px"}}>NOMINAL</th>
                             <th style={{padding:"18px 24px", fontSize:11, fontWeight:700, color:"#4B5563", textTransform:"uppercase", letterSpacing:"0.5px"}}>METODE</th>
                          </tr>
                       </thead>
                       <tbody>
                          {transactions
                           .filter(t => {
                             const d = new Date(t.timestamp);
                             return d.getMonth() + 1 === financeFilter.month && d.getFullYear() === financeFilter.year;
                           })
                           .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                           .map(t => (
                            <tr key={t.id} style={{borderBottom:"1px solid rgba(0,0,0,0.04)", verticalAlign:"middle"}} className="hover-bg-light">
                               <td style={{padding:"18px 24px"}}>
                                  <div style={{fontWeight:700}}>{new Date(t.timestamp).toLocaleDateString("id-ID", {dateStyle:"medium"})}</div>
                                  <div style={{fontSize:10, color:"#999"}}>{new Date(t.timestamp).toLocaleTimeString("id-ID", {hour:"2-digit", minute:"2-digit"})}</div>
                               </td>
                               <td style={{padding:"18px 24px", fontWeight:700, color:"#111827", whiteSpace:"normal", wordBreak:"break-all", maxWidth:200}}>{t.userEmail}</td>
                               <td style={{padding:16}}>
                                  <span style={{fontSize:11, fontWeight:800, background:"rgba(59,130,246,0.08)", color:"var(--theme-primary)", border:"1px solid rgba(59,130,246,0.12)", padding:"4px 8px", borderRadius:6}}>{t.planName}</span>
                               </td>
                               <td style={{padding:"18px 24px", color: t.voucherCode ? "#10B981" : "#9CA3AF", fontWeight: t.voucherCode ? 800 : 400, fontSize: 12}}>{t.voucherCode || "-"}</td>
                               <td style={{padding:"18px 24px", fontWeight:800, color:"#10B981"}}>{fmtRp(t.amount)}</td>
                               <td style={{padding:"18px 24px", fontSize:12, color:"#4B5563"}}>{t.paymentMethod}</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                    {transactions.filter(t => {
                       const d = new Date(t.timestamp);
                       return d.getMonth() + 1 === financeFilter.month && d.getFullYear() === financeFilter.year;
                    }).length === 0 && (
                      <div style={{padding:60, textAlign:"center", color:"#9CA3AF", fontWeight:600}}>Tidak ada transaksi pada periode ini.</div>
                    )}
                 </div>
              </motion.div>
            )}

            {/* SUPER ADMINS */}
            {activeTab === "admins" && (
              <motion.div key="admins" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{maxWidth:800}}>
                 <h2 style={{fontSize:28, fontWeight:800, marginBottom:24, letterSpacing:"-1px"}}>Super Admin Access</h2>
                 <div style={CARD({padding:24, borderRadius:24})}>
                    <p style={{fontSize:14, color:"rgba(0,0,0,0.5)", marginBottom:20}}>Hanya user dengan role <b>admin</b> yang bisa mengakses Admin Central.</p>
                    <div style={{display:"flex", flexDirection:"column", gap:12}}>
                       {admins.map(a => (
                         <div key={a.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"#F9F9F9", borderRadius:16, border:"1px solid #EEE"}}>
                            <div style={{display:"flex", alignItems:"center", gap:12}}>
                               <div style={{width:32, height:32, background:"rgba(0,0,0,0.05)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center"}}>
                                  <Shield size={16} color="var(--theme-primary)"/>
                               </div>
                               <span style={{fontWeight:700, fontSize:14}}>{a.email}</span>
                            </div>
                            {a.email !== "nalendraputra71@gmail.com" && (
                              <button onClick={async () => {
                                if(window.confirm(`Revoke admin access for ${a.email}?`)) {
                                   await updateDoc(doc(db, "users", a.id), { role: "user" });
                                }
                              }} style={{background:"transparent", border:"none", color:"#9C2B4E", fontSize:12, fontWeight:700, cursor:"pointer"}}>Revoke Access</button>
                            )}
                         </div>
                       ))}
                    </div>
                    
                    <div style={{marginTop:32, background:"rgba(var(--theme-primary-rgb), 0.05)", padding:20, borderRadius:16, border:"1px dashed var(--theme-primary)"}}>
                       <h4 style={{margin:0, fontSize:13, fontWeight:800}}>Push New Admin</h4>
                       <div style={{display:"flex", gap:10, marginTop:12}}>
                          <input id="new_admin_email" placeholder="Email user..." style={{flex:1, padding:"10px 14px", borderRadius:10, border:"1px solid #DDD", fontSize:13}} />
                          <button onClick={async () => {
                            const email = (document.getElementById("new_admin_email") as HTMLInputElement).value;
                            const target = users.find(u=>u.email === email);
                            if (target) {
                               await updateDoc(doc(db, "users", target.id), { role: "admin" });
                               (document.getElementById("new_admin_email") as HTMLInputElement).value = "";
                            } else {
                               alert("User tidak ditemukan.");
                            }
                          }} style={{background:"var(--theme-primary)", color:"white", border:"none", padding:"10px 20px", borderRadius:10, fontWeight:700, cursor:"pointer"}}>Grant Admin</button>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* PLANS & PROMOS */}
            {activeTab === "plans" && (
              <motion.div key="plans" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{display: "flex", flexDirection: "column", gap: 24}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom: 16, borderBottom: "1px solid rgba(0,0,0,0.04)"}}>
                   <div>
                     <h2 style={{fontSize:24, fontWeight:800, color: "#111827", margin:0, letterSpacing:"-0.5px"}}>Paket & Promosi</h2>
                     <p style={{fontSize:13, color:"rgba(17,24,39,0.5)", marginTop:4}}>Konfigurasi skema pricing paket langganan dan kode diskon kupon marketing.</p>
                   </div>
                   <div style={{display:"flex", gap:10, flexWrap: "wrap"}}>
                     <button onClick={seedDefaultData} style={{background:"rgba(var(--theme-primary-rgb, 37,99,235), 0.06)", color:"var(--theme-primary, #2563EB)", border:"none", padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition: "all 0.2s"}} className="hover-scale">
                       <RefreshCw size={14}/> Muat Data Default
                     </button>
                     <button onClick={() => { setEditingPromo({}); setShowPromoModal(true); }} style={{background:"#FFFFFF", border:"1px solid rgba(0,0,0,0.08)", color: "#111827", padding:"10px 18px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition: "all 0.2s"}} className="hover-scale">
                       <Tag size={14}/> Voucher Baru
                     </button>
                     <button onClick={() => { setEditingPlan({}); setShowPlanModal(true); }} style={{background:"var(--theme-primary, #2563EB)", color:"white", border:"none", padding:"10px 20px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition: "all 0.2s"}} className="hover-scale">
                       <Package size={14}/> Paket Baru
                     </button>
                   </div>
                </div>

                <div style={{marginTop: 8}}>
                  <h3 style={{fontSize:16, fontWeight:800, color: "#111827", marginBottom:16, display: "flex", alignItems: "center", gap: 8}}>
                    <Package size={18} color="var(--theme-primary)" />
                    Subscription Plans (Paket Langganan)
                  </h3>
                  
                  <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:20, marginBottom:40}}>
                    {groupedPlans.map(p => {
                      const monthlyPrice = p.monthlyPrice || 0;
                      const monthlyOriginal = p.monthlyOriginalPrice || 0;
                      const monthlyDiscountPercent = (monthlyOriginal > monthlyPrice) ? Math.round(((monthlyOriginal - monthlyPrice) / monthlyOriginal) * 100) : 0;

                      const annualPrice = p.annualPrice || 0;
                      const annualOriginal = p.annualOriginalPrice || (monthlyPrice * 12);
                      const annualDiscountPercent = (annualOriginal > annualPrice) ? Math.round(((annualOriginal - annualPrice) / annualOriginal) * 100) : 0;
                      const annualSavings = annualOriginal - annualPrice;

                      return (
                        <div key={p.id} style={CARD({padding:24, borderRadius:24, background: "#FFFFFF", position: "relative", border:"1px solid rgba(0,0,0,0.04)", overflow: "hidden", display:"flex", flexDirection:"column", gap: 20, boxShadow:"0 10px 30px rgba(0,0,0,0.02)", transition: "all 0.2s"})} className="hover-scale">
                           {p.popular && (
                             <div style={{position: "absolute", top: 12, right: 12, background:"rgba(37,99,235,0.08)", color:"var(--theme-primary, #2563EB)", fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:30, textTransform:"uppercase", display: "flex", alignItems: "center", gap: 4}}>
                               <Sparkles size={10} /> Popular
                             </div>
                           )}
                           
                           <div>
                              <div style={{fontSize:18, fontWeight:800, color: "#111827"}}>{p.name}</div>
                              <div style={{fontSize:12, color:"rgba(17,24,39,0.5)", marginTop:4}}>{p.desc}</div>
                           </div>

                           {/* Comparative Pricing Layout */}
                           <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap:10}}>
                              <div style={{background:"rgba(0,0,0,0.015)", padding:12, borderRadius:16, border:"1px solid rgba(0,0,0,0.025)"}}>
                                 <div style={{fontSize:9, color:"rgba(17,24,39,0.4)", fontWeight:800, textTransform:"uppercase", marginBottom:4, letterSpacing: "0.5px"}}>Bulanan (Monthly)</div>
                                 <div style={{fontSize:16, fontWeight:800, color:"#111827"}}>Rp{monthlyPrice.toLocaleString("id-ID")}</div>
                                 {monthlyOriginal > monthlyPrice && (
                                    <div style={{display: "flex", flexDirection: "column", gap: 2, marginTop: 4}}>
                                      <div style={{fontSize:10, color:"rgba(17,24,39,0.4)", textDecoration:"line-through"}}>Rp{monthlyOriginal.toLocaleString("id-ID")}</div>
                                      <span style={{background: "rgba(16,185,129,0.1)", color: "#10B981", fontSize: 8, padding: "2px 4px", borderRadius: 4, fontWeight: 900, alignSelf: "flex-start"}}>SAVE {monthlyDiscountPercent}%</span>
                                    </div>
                                 )}
                              </div>
                              
                              <div style={{background:"rgba(16,185,129,0.03)", padding:12, borderRadius:16, border:"1px solid rgba(16,185,129,0.08)", position: "relative"}}>
                                 <div style={{fontSize:9, color:"#10B981", fontWeight:800, textTransform:"uppercase", marginBottom:4, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 3}}>
                                   Tahunan (Annual)
                                   {annualDiscountPercent > 0 && (
                                     <span style={{background: "#10B981", color: "#FFF", fontSize: 8, padding: "1px 4px", borderRadius: 4, fontWeight: 900}}>SAVE {annualDiscountPercent}%</span>
                                   )}
                                 </div>
                                 <div style={{fontSize:16, fontWeight:800, color:"#10B981"}}>Rp{annualPrice.toLocaleString("id-ID")}</div>
                                 <div style={{fontSize:9, color:"rgba(16,185,129,0.7)", fontWeight:600}}>(Setara Rp{Math.round(annualPrice / 12).toLocaleString("id-ID")}/bln)</div>
                                 {annualOriginal > annualPrice && (
                                    <div style={{display: "flex", flexDirection: "column", gap: 2, marginTop: 4}}>
                                      <div style={{fontSize:10, color:"rgba(17,24,39,0.3)", textDecoration:"line-through"}}>Rp{annualOriginal.toLocaleString("id-ID")}</div>
                                      <div style={{fontSize:8, color:"#10B981", fontWeight:800}}>Hemat Rp{annualSavings.toLocaleString("id-ID")}</div>
                                    </div>
                                 )}
                              </div>
                           </div>

                         {/* Usage Limits Section with clean Icons */}
                         <div style={{background: "rgba(0,0,0,0.01)", padding: 16, borderRadius: 16, display:"flex", flexDirection:"column", gap:10}}>
                            <div style={{fontSize: 11, fontWeight: 800, color: "rgba(17,24,39,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2}}>Batasan Penggunaan</div>
                            
                            <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap: 8}}>
                              <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#111827"}}>
                                <div style={{width: 24, height: 24, borderRadius: 8, background: "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                  <Layout size={12} color="#111827" />
                                </div>
                                <span>{p.limits?.workspaces === -1 ? "Unlimited" : p.limits?.workspaces} Workspace</span>
                              </div>
                              <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#111827"}}>
                                <div style={{width: 24, height: 24, borderRadius: 8, background: "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                  <Globe size={12} color="#111827" />
                                </div>
                                <span>{p.limits?.socialAccounts === -1 ? "Unlimited" : p.limits?.socialAccounts} Sosmed</span>
                              </div>
                              <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#111827"}}>
                                <div style={{width: 24, height: 24, borderRadius: 8, background: "rgba(37,99,235,0.05)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                  <Sparkles size={12} color="var(--theme-primary, #2563EB)" />
                                </div>
                                <span>{p.limits?.aiGenerationPerMonth === -1 ? "Unlimited" : p.limits?.aiGenerationPerMonth} AI /bln</span>
                              </div>
                              <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#111827"}}>
                                <div style={{width: 24, height: 24, borderRadius: 8, background: "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                  <Users size={12} color="#111827" />
                                </div>
                                <span>{p.limits?.teamMembers === -1 ? "Unlimited" : p.limits?.teamMembers || "0"} Member</span>
                              </div>
                            </div>
                         </div>

                         {/* Capabilities Checklist */}
                         <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                           <div style={{fontSize: 11, fontWeight: 800, color: "rgba(17,24,39,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2}}>Fitur & Layanan</div>
                           
                           <div style={{display: "flex", flexWrap: "wrap", gap: 6}}>
                             {p.capabilities?.autoPublishing && (
                               <span style={{fontSize: 10, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.06)", padding: "4px 10px", borderRadius: 30, display: "flex", alignItems: "center", gap: 4}}>
                                 <Check size={10} /> Auto-Publish
                               </span>
                             )}
                             {p.capabilities?.contentApproval && (
                               <span style={{fontSize: 10, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.06)", padding: "4px 10px", borderRadius: 30, display: "flex", alignItems: "center", gap: 4}}>
                                 <Check size={10} /> Approval Workflow
                               </span>
                             )}
                             {p.capabilities?.commentManagement && (
                               <span style={{fontSize: 10, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.06)", padding: "4px 10px", borderRadius: 30, display: "flex", alignItems: "center", gap: 4}}>
                                 <Check size={10} /> Comment Manager
                               </span>
                             )}
                             <span style={{fontSize: 10, fontWeight: 700, color: "var(--theme-primary, #2563EB)", background: "rgba(37,99,235,0.06)", padding: "4px 10px", borderRadius: 30}}>
                               📈 Analitik: {p.capabilities?.analyticsLevel === "custom" ? "Mendalam" : p.capabilities?.analyticsLevel === "advanced" ? "Lanjutan" : "Dasar"}
                             </span>
                             <span style={{fontSize: 10, fontWeight: 700, color: "var(--theme-primary, #2563EB)", background: "rgba(37,99,235,0.06)", padding: "4px 10px", borderRadius: 30}}>
                               💌 CS: {p.capabilities?.supportLevel === "vip" ? "24/7 VIP" : p.capabilities?.supportLevel === "priority" ? "Prioritas" : p.capabilities?.supportLevel === "email" ? "Email" : "Komunitas"}
                             </span>
                           </div>
                         </div>

                         {/* Action Buttons */}
                         <div style={{display:"flex", gap:10, marginTop: "auto", paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.03)"}}>
                            <button type="button" onClick={() => { setEditingPlan(p); setShowPlanModal(true); }} style={{flex:1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding:"10px", borderRadius:12, border:"1px solid rgba(0,0,0,0.05)", background:"#FFFFFF", fontWeight:700, color: "#111827", cursor:"pointer", fontSize:12, transition: "all 0.2s"}} className="hover-bg-light">
                              <Edit2 size={12} /> Edit Detail
                            </button>
                             {p.id !== 'free' ? (
                               <button type="button" onClick={() => setDeletingItem({id: p.monthlyId || p.annualId || p.id, type:"plans", name: p.name})} style={{background:"rgba(239,68,68,0.06)", color:"#EF4444", border:"none", padding:"10px 14px", borderRadius:12, fontWeight:700, cursor:"pointer", fontSize:12, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"}} className="hover-scale">
                                 <Trash2 size={12}/> Hapus
                               </button>
                             ) : (
                               <span style={{fontSize: 11, fontWeight: 700, color: "rgba(17,24,39,0.4)", padding: "10px 14px", background: "rgba(0,0,0,0.02)", borderRadius: 12, display: "flex", alignItems: "center", gap: 4}}>
                                 Sistem Default
                               </span>
                             )}
                         </div>
                      </div>
                    );
                    })}
                    
                    {plans.length === 0 && (
                      <div style={{gridColumn:"1/-1", padding:"60px 20px", textAlign:"center", background:"#FFFFFF", borderRadius:24, border:"1px dashed rgba(0,0,0,0.08)", color:"#111827", display:"flex", flexDirection:"column", alignItems:"center", gap:16}}>
                        <div style={{fontSize:14, fontWeight:600, color:"rgba(17,24,39,0.5)"}}>Belum ada data paket langganan di database.</div>
                        <button type="button" onClick={seedDefaultData} style={{background:"var(--theme-primary, #2563EB)", color:"white", border:"none", padding:"12px 24px", borderRadius:12, fontSize:13, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:8}}>
                          <RefreshCw size={16}/> Muat Semua Paket & Promo Default
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{marginTop: 16}}>
                  <h3 style={{fontSize:16, fontWeight:800, color: "#111827", marginBottom:16, display: "flex", alignItems: "center", gap: 8}}>
                    <Tag size={18} color="var(--theme-primary)" />
                    Coupon & Promo Codes (Kode Voucher)
                  </h3>

                  <div style={CARD({borderRadius:24, overflow:"hidden", border:"1px solid rgba(0,0,0,0.04)", padding: 0, boxShadow: "0 10px 30px rgba(0,0,0,0.01)"})}>
                     <table style={{width:"100%", borderCollapse:"collapse", fontSize:13}}>
                        <thead style={{background:"rgba(0,0,0,0.015)", borderBottom: "1px solid rgba(0,0,0,0.03)"}}>
                          <tr>
                            <th style={{padding:"16px 20px", textAlign:"left", fontSize:11, fontWeight:800, textTransform:"uppercase", color:"rgba(17,24,39,0.4)", letterSpacing: "0.5px", minWidth:140}}>Kode Promo</th>
                            <th style={{padding:"16px 20px", textAlign:"center", fontSize:11, fontWeight:800, textTransform:"uppercase", color:"rgba(17,24,39,0.4)", letterSpacing: "0.5px"}}>Diskon</th>
                            <th style={{padding:"16px 20px", textAlign:"center", fontSize:11, fontWeight:800, textTransform:"uppercase", color:"rgba(17,24,39,0.4)", letterSpacing: "0.5px"}}>Pemakaian</th>
                            <th style={{padding:"16px 20px", textAlign:"left", fontSize:11, fontWeight:800, textTransform:"uppercase", color:"rgba(17,24,39,0.4)", letterSpacing: "0.5px", minWidth:200}}>Masa Berlaku & Target</th>
                            <th style={{padding:"16px 20px", textAlign:"center", fontSize:11, fontWeight:800, textTransform:"uppercase", color:"rgba(17,24,39,0.4)", letterSpacing: "0.5px"}}>{lang === "id" ? "Status" : "Status"}</th>
                            <th style={{padding:"16px 20px", textAlign:"right"}}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {promosList.map(p => (
                            <tr key={p.id} style={{borderBottom:"1px solid rgba(0,0,0,0.02)", verticalAlign:"middle"}} className="hover-bg-light">
                               <td style={{padding:"16px 20px", fontWeight:800, color: "#111827", whiteSpace:"normal", wordBreak:"break-word"}}>
                                 <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                   <div style={{width: 8, height: 8, borderRadius: "50%", background: p.isActive ? "#10B981" : "rgba(17,24,39,0.15)"}} />
                                   <span style={{fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.5px", background: "rgba(0,0,0,0.03)", padding: "4px 8px", borderRadius: 8}}>{p.code}</span>
                                 </div>
                               </td>
                               <td style={{padding:"16px 20px", textAlign:"center"}}>
                                 <span style={{background:p.type === "percent" ? "rgba(16,185,129,0.08)" : "rgba(37,99,235,0.08)", color:p.type === "percent" ? "#10B981" : "var(--theme-primary, #2563EB)", padding:"6px 12px", borderRadius:30, fontWeight:800, fontSize:12, display:"inline-flex", alignItems: "center", gap: 4}}>
                                   {p.type === "percent" ? <Percent size={11} /> : "Rp"}
                                   {p.type === "percent" ? `${p.value}%` : p.value.toLocaleString("id-ID")}
                                 </span>
                               </td>
                               <td style={{padding:"16px 20px", textAlign:"center", fontWeight:700, color: "#111827"}}>
                                 <span style={{background: "rgba(0,0,0,0.02)", padding: "4px 10px", borderRadius: 10}}>{p.usageCount || 0}x dipakai</span>
                               </td>
                               <td style={{padding:"16px 20px", textAlign:"left", whiteSpace:"normal"}}>
                                  <div style={{display: "flex", flexDirection: "column", gap: 2}}>
                                    <div style={{fontSize:12, color:"#111827", fontWeight:600}}>
                                      {p.startDate ? `📅 ${p.startDate}` : "Immediate"} sd {p.endDate ? `🏁 ${p.endDate}` : "♾ No Expiry"}
                                    </div>
                                    <div style={{fontSize:10, color:"rgba(17,24,39,0.4)", fontWeight:700, textTransform: "uppercase"}}>
                                      Target: {p.targetType === "first_timer" ? "Hanya User Baru" : "Semua Pengguna"}
                                    </div>
                                  </div>
                               </td>
                               <td style={{padding:"16px 20px", textAlign:"center"}}>
                                  <button onClick={()=>togglePromo(p)} style={{background:"none", border:"none", cursor:"pointer", padding: 0, display: "inline-flex", alignItems: "center", transition: "all 0.2s"}}>
                                    {p.isActive ? <ToggleRight color="#10B981" size={28}/> : <ToggleLeft color="rgba(17,24,39,0.2)" size={28}/>}
                                  </button>
                               </td>
                               <td style={{padding:"16px 20px", textAlign:"right"}}>
                                  <div style={{display:"flex", gap:8, justifyContent:"flex-end"}}>
                                     <button onClick={() => { setEditingPromo(p); setShowPromoModal(true); }} style={{color:"var(--theme-primary, #2563EB)", background:"rgba(37,99,235,0.05)", border:"none", padding: "6px 12px", borderRadius: 10, fontWeight:800, cursor:"pointer", fontSize:11, display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s"}} className="hover-scale">
                                       <Edit2 size={10} /> Edit
                                     </button>
                                     <button onClick={() => setDeletingItem({id: p.id, type:"promos", name: p.code})} style={{color:"#EF4444", background:"rgba(239,68,68,0.05)", border:"none", padding: "6px 12px", borderRadius: 10, fontWeight:800, cursor:"pointer", fontSize:11, display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s"}} className="hover-scale">
                                       <Trash2 size={10} /> Hapus
                                     </button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                     {promosList.length === 0 && (
                       <div style={{padding:"40px 20px", textAlign:"center", color:"rgba(17,24,39,0.5)", display:"flex", flexDirection:"column", alignItems:"center", gap:12}}>
                         <div style={{fontSize:13, fontWeight:600}}>Belum ada kode voucher aktif.</div>
                         <button type="button" onClick={seedDefaultData} style={{background:"rgba(var(--theme-primary-rgb, 37,99,235), 0.06)", color:"var(--theme-primary, #2563EB)", border:"none", padding:"10px 20px", borderRadius:12, fontSize:12, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:6}}>
                           <RefreshCw size={14}/> Muat Voucher Default
                         </button>
                       </div>
                     )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUPPORT & TICKETS */}
            {activeTab === "support" && (
              <motion.div key="support" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{height:"calc(100vh - 220px)", display:"flex", flexDirection:"column"}}>
                 <div style={{marginBottom:24}}>
                    <h2 style={{fontSize:28, fontWeight:800, margin:0, letterSpacing:"-1px"}}>Support Central</h2>
                    <p style={{fontSize:14, color:"rgba(44,32,22,0.5)", marginTop:4}}>Tangani keluhan dan masukan pengguna melalui sistem tiket.</p>
                 </div>

                 <div style={{display:"flex", flex:1, gap:24, overflow:"hidden"}}>
                    <div style={{width:350, display:"flex", flexDirection:"column", gap:12, overflowY:"auto", paddingRight:4}}>
                       {tickets.map(t => (
                         <div key={t.id} onClick={()=>setSelectedTicket(t)} 
                           style={{
                             padding:16, background:"white", borderRadius:20, cursor:"pointer", transition:"all 0.2s",
                             border: selectedTicket?.id === t.id ? "2px solid var(--theme-primary)" : "1px solid #EEE",
                             boxShadow: selectedTicket?.id === t.id ? "0 4px 20px rgba(var(--theme-primary-rgb), 0.15)" : "none"
                           }}>
                            <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                               <div style={{fontSize:11, fontWeight:800, color:"rgba(0,0,0,0.3)"}}>#{t.id.slice(-6).toUpperCase()}</div>
                               <div style={{fontSize:10, fontWeight:700, background: t.status==="open"?"#E3F2FD":"#F5F5F5", color: t.status==="open"?"#2196F3":"#666", padding:"2px 8px", borderRadius:6, textTransform:"uppercase"}}>{t.status}</div>
                            </div>
                            <div style={{fontSize:14, fontWeight:800, marginBottom:4}}>{t.subject}</div>
                            <div style={{fontSize:12, color:"rgba(0,0,0,0.5)"}}>{t.userEmail}</div>
                            <div style={{fontSize:10, color:"#999", marginTop:12, display:"flex", alignItems:"center", gap:4}}>
                               <Clock size={10}/> {new Date(t.updatedAt||0).toLocaleString("id-ID", {dateStyle:"short", timeStyle:"short"})}
                            </div>
                         </div>
                       ))}
                       {tickets.length === 0 && (
                         <div style={{padding:40, textAlign:"center", background:"#FFF", borderRadius:20, border:"1px dashed #DDD", color:"#999"}}>No tickets found.</div>
                       )}
                    </div>

                    <div style={{flex:1, background:"white", borderRadius:24, border:"1px solid #EEE", display:"flex", flexDirection:"column", overflow:"hidden"}}>
                        {selectedTicket ? (
                          <div style={{display:"flex", flexDirection:"column", height:"100%"}}>
                             <div style={{padding:"20px 24px", borderBottom:"1px solid #F5F5F5", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                                <div>
                                   <div style={{fontSize:18, fontWeight:800}}>{selectedTicket.subject}</div>
                                   <div style={{fontSize:12, color:"#999"}}>{selectedTicket.userEmail}</div>
                                </div>
                                <div style={{display:"flex", gap:10}}>
                                   <button onClick={async () => {
                                      await updateDoc(doc(db, "tickets", selectedTicket.id), { status: selectedTicket.status === "closed" ? "open" : "closed" });
                                   }} style={{background:"none", border:"1px solid #EEE", padding:"8px 16px", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer"}}>{selectedTicket.status === "closed" ? "Reopen Ticket" : "Close Ticket"}</button>
                                </div>
                             </div>

                             <div style={{flex:1, padding:24, overflowY:"auto", display:"flex", flexDirection:"column", gap:16, background:"#FDFDFD"}}>
                                {(selectedTicket.messages || []).map((m: any, i: number) => (
                                  <div key={i} style={{alignSelf: m.sender === "admin" ? "flex-end" : "flex-start", maxWidth:"80%"}}>
                                     <div style={{fontSize:10, fontWeight:700, color:"#999", marginBottom:4, textAlign: m.sender==="admin" ? "right" : "left"}}>
                                        {m.sender === "admin" ? "Admin Response" : "User Message"} • {new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                     </div>
                                     <div style={{
                                        padding:"12px 16px", borderRadius:16, fontSize:13, lineHeight:1.5,
                                        background: m.sender === "admin" ? "var(--theme-primary)" : "white",
                                        color: m.sender === "admin" ? "white" : "black",
                                        border: m.sender === "admin" ? "none" : "1px solid #EEE",
                                        boxShadow: m.sender === "admin" ? "0 4px 12px rgba(var(--theme-primary-rgb), 0.2)" : "0 2px 4px rgba(0,0,0,0.02)"
                                     }}>
                                        {m.text}
                                     </div>
                                  </div>
                                ))}
                             </div>

                             <div style={{padding:20, background:"white", borderTop:"1px solid #F5F5F5"}}>
                                <div style={{display:"flex", gap:12}}>
                                   <textarea id="ticket_reply" placeholder="Tulis balasan support di sini..." 
                                      style={{flex:1, height:80, padding:16, border:"1px solid #EEE", borderRadius:16, fontSize:13, outline:"none", resize:"none"}} />
                                   <button onClick={handleReply} 
                                      style={{width:100, background:"var(--theme-primary)", color:"white", border:"none", borderRadius:16, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", fontWeight:800, cursor:"pointer"}}>
                                      KIRIM REPLY
                                   </button>
                                </div>
                             </div>
                          </div>
                        ) : (
                          <div style={{flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16, opacity:0.3}}>
                             <LifeBuoy size={64}/>
                             <div style={{fontWeight:800}}>{lang === "id" ? "Pilih tiket untuk membaca percakapan" : "Select a ticket to read the conversation"}</div>
                          </div>
                        )}
                    </div>
                 </div>
              </motion.div>
            )}

            {/* DELETION FEEDBACK */}
            {activeTab === "deletion_feedback" && (
              <motion.div key="deletion_feedback" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}}>
                <h2 style={{fontSize:28, fontWeight:800, marginBottom:24, letterSpacing:"-1px"}}>{lang === "id" ? "Alasan Hapus Akun" : "Account Deletion Reasons"}</h2>
                <div style={CARD({padding:24, borderRadius:24})}>
                  <div style={{display:"flex", flexDirection:"column", gap:16}}>
                    {deletionReasons.length === 0 ? (
                      <div style={{color:"rgba(44,32,22,0.4)", fontSize:14, textAlign:"center", padding:40, background:"#FAF7F2", borderRadius:16}}>Belum ada data.</div>
                    ) : (
                      deletionReasons.sort((a,b) => new Date(b.deletedAt||0).getTime() - new Date(a.deletedAt||0).getTime()).map(dr => (
                        <div key={dr.id} style={{padding:20, background:"#FDFBF7", borderRadius:16, border:"1px solid #F5F0E8"}}>
                           <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
                              <div style={{fontSize:16, fontWeight:800, color:"#9C2B4E"}}>Alasan: {dr.reason}</div>
                              <div style={{fontSize:12, color:"rgba(44,32,22,0.4)", fontWeight:600}}>{dr.deletedAt ? new Date(dr.deletedAt).toLocaleString() : ""}</div>
                           </div>
                           {dr.additionalContext && (
                              <div style={{fontSize:14, color:"rgba(44,32,22,0.7)", background:"white", padding:12, borderRadius:8, border:"1px solid #F5F0E8", marginTop:8}}>
                                "{dr.additionalContext}"
                              </div>
                           )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* BROADCASTS */}
            {activeTab === "broadcasts" && (
              <motion.div key="broadcasts" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{maxWidth:600}}>
                 <h2 style={{fontSize:28, fontWeight:800, marginBottom:24, letterSpacing:"-1px"}}>Kirim Broadcast Notification</h2>
                 
                 <div style={CARD({padding:24, borderRadius:24})}>
                    <div style={{display:"flex", flexDirection:"column", gap:16}}>
                       <div>
                          <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:8}}>Judul Notifikasi</label>
                          <input 
                            value={bcTitle} 
                            onChange={(e)=>setBcTitle(e.target.value)}
                            style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EEE", fontSize:14}} 
                            placeholder="Contoh: Fitur Baru: AI Generator"
                          />
                       </div>
                       <div>
                          <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:8}}>Isi Pesan</label>
                          <textarea 
                            value={bcDesc} 
                            onChange={(e)=>setBcDesc(e.target.value)}
                            style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EEE", fontSize:14, minHeight:80, fontFamily:"inherit"}} 
                            placeholder="Contoh: Kami baru saja merilis fitur AI Generator..."
                          />
                       </div>
                       <div>
                          <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:8}}>Target User</label>
                          <select 
                            value={bcTarget} 
                            onChange={(e)=>setBcTarget(e.target.value)}
                            style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EEE", fontSize:14, background:"white", outline:"none"}}
                          >
                            <option value="all">Semua User</option>
                            <option value="pro">Hanya User PRO</option>
                            <option value="expired">Hanya User Expired / Free</option>
                          </select>
                       </div>
                       
                       <button 
                         onClick={handleSendBroadcast} 
                         disabled={bcSending || !bcTitle || !bcDesc}
                         className="hover-scale btn-hover"
                         style={{...B(true), width:"100%", height:48, borderRadius:24, opacity: (bcSending || !bcTitle || !bcDesc) ? 0.5 : 1}}
                       >
                         {bcSending ? "Mengirim..." : "Kirim Notifikasi"}
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}

            {/* SETTINGS */}
            {activeTab === "settings" && (
              <motion.div key="settings" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} style={{maxWidth:600}}>
                 <h2 style={{fontSize:28, fontWeight:800, marginBottom:24, letterSpacing:"-1px"}}>System Settings</h2>
                 
                 <div style={{display:"flex", flexDirection:"column", gap:20}}>
                    <div style={CARD({padding:24, borderRadius:24})}>
                       <h3 style={{fontSize:16, fontWeight:800, marginBottom:20, display:"flex", alignItems:"center", gap:8}}><Globe size={18}/> App Toggles</h3>
                       <div style={{display:"flex", flexDirection:"column", gap:16}}>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div>
                                <div style={{fontSize:14, fontWeight:700}}>{lang === "id" ? "Mode Perbaikan" : "Maintenance Mode"}</div>
                                <div style={{fontSize:12, color:"#999"}}>Tampilkan halaman maintenance ke semua user.</div>
                             </div>
                             <button onClick={()=>updateSystemConfig({maintenanceMode: !systemSettings.maintenanceMode})} style={{background:"transparent", border:"none", cursor:"pointer"}}>
                                {systemSettings.maintenanceMode ? <ToggleRight size={32} color="#9C2B4E"/> : <ToggleLeft size={32} color="#CCC"/>}
                             </button>
                          </div>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div>
                                <div style={{fontSize:14, fontWeight:700}}>Registrasi Baru</div>
                                <div style={{fontSize:12, color:"#999"}}>Izinkan pengguna baru untuk mendaftar akun.</div>
                             </div>
                             <button onClick={()=>updateSystemConfig({allowRegistration: !systemSettings.allowRegistration})} style={{background:"transparent", border:"none", cursor:"pointer"}}>
                                {systemSettings.allowRegistration ? <ToggleRight size={32} color="#4CAF50"/> : <ToggleLeft size={32} color="#CCC"/>}
                             </button>
                          </div>
                       </div>
                    </div>

                    <div style={CARD({padding:24, borderRadius:24})}>
                       <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20}}>
                          <h3 style={{fontSize:16, fontWeight:800, display:"flex", alignItems:"center", gap:8, margin:0}}><AlertCircle size={18}/> Global Banner</h3>
                          {hasUnpublishedBannerChanges && (
                             <span style={{fontSize:11, background:"rgba(245,158,11,0.1)", color:"#D97706", padding:"4px 10px", borderRadius:20, fontWeight:700}}>
                                Draf (Belum Dipublikasikan)
                             </span>
                          )}
                       </div>
                       <div style={{display:"flex", flexDirection:"column", gap:16}}>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div>
                                <div style={{fontSize:14, fontWeight:700}}>Tampilkan Banner</div>
                                <div style={{fontSize:12, color:"#999"}}>Banner info/alert akan muncul di bagian paling atas aplikasi.</div>
                             </div>
                             <button onClick={()=>updateSystemConfig({bannerActiveDraft: !bannerActiveDraft})} style={{background:"transparent", border:"none", cursor:"pointer"}}>
                                {bannerActiveDraft ? <ToggleRight size={32} color="#4CAF50"/> : <ToggleLeft size={32} color="#CCC"/>}
                             </button>
                          </div>
                          {bannerActiveDraft && (
                            <>
                              <div>
                                 <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:8}}>Isi Pesan Banner</label>
                                 <textarea 
                                   value={bannerMessageDraft} 
                                   onChange={(e)=>setSystemSettings({...systemSettings, bannerMessageDraft: e.target.value})}
                                   onBlur={(e)=>updateSystemConfig({bannerMessageDraft: e.target.value})}
                                   style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EEE", fontSize:14, minHeight:60, fontFamily:"inherit"}} 
                                   placeholder="Contoh: Sedang ada pemeliharaan server pada 24 Juni 2026."
                                 />
                              </div>
                              <div>
                                 <label style={{display:"block", fontSize:12, fontWeight:700, marginBottom:8}}>Warna Banner</label>
                                 <select 
                                   value={bannerTypeDraft} 
                                   onChange={(e)=>updateSystemConfig({bannerTypeDraft: e.target.value})}
                                   style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EEE", fontSize:14, background:"white", outline:"none"}}
                                 >
                                   <option value="info">Info (Biru)</option>
                                   <option value="warning">Warning (Kuning)</option>
                                   <option value="alert">Alert (Merah)</option>
                                 </select>
                              </div>
                            </>
                          )}

                          <button 
                            onClick={handlePublishBanner}
                            className="hover-scale btn-hover"
                            style={{
                              ...B(true), 
                              width:"100%", 
                              height:44, 
                              borderRadius:22, 
                              marginTop: 10,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              background: hasUnpublishedBannerChanges ? "var(--theme-primary, #2C2016)" : "rgba(44,32,22,0.06)",
                              color: hasUnpublishedBannerChanges ? "white" : "rgba(44,32,22,0.4)",
                              cursor: hasUnpublishedBannerChanges ? "pointer" : "default"
                            }}
                            disabled={!hasUnpublishedBannerChanges}
                          >
                             <Send size={16} />
                             Publish Banner
                          </button>
                       </div>
                    </div>

                    <div style={CARD({padding:24, borderRadius:24})}>
                       <h3 style={{fontSize:16, fontWeight:800, marginBottom:20, display:"flex", alignItems:"center", gap:8}}><Layout size={18}/> Kendali Akses Fitur</h3>
                       <div style={{display:"flex", flexDirection:"column", gap:16}}>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div>
                                <div style={{fontSize:14, fontWeight:700}}>Menu Calendar</div>
                                <div style={{fontSize:12, color:"#999"}}>Tampilkan akses ke fitur perencanaan konten.</div>
                             </div>
                             <button onClick={()=>updateSystemConfig({ "features.contentPlanner": systemSettings?.features?.contentPlanner === false ? true : false })} style={{background:"transparent", border:"none", cursor:"pointer"}}>
                                {systemSettings?.features?.contentPlanner !== false ? <ToggleRight size={32} color="#4CAF50"/> : <ToggleLeft size={32} color="#CCC"/>}
                             </button>
                          </div>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div>
                                <div style={{fontSize:14, fontWeight:700}}>Menu Hub.ai (AI Generator)</div>
                                <div style={{fontSize:12, color:"#999"}}>Tampilkan akses ke fitur AI Generator.</div>
                             </div>
                             <button onClick={()=>updateSystemConfig({ "features.hubai": systemSettings?.features?.hubai === false ? true : false })} style={{background:"transparent", border:"none", cursor:"pointer"}}>
                                {systemSettings?.features?.hubai !== false ? <ToggleRight size={32} color="#4CAF50"/> : <ToggleLeft size={32} color="#CCC"/>}
                             </button>
                          </div>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div>
                                <div style={{fontSize:14, fontWeight:700}}>Menu SocHub (Komunitas)</div>
                                <div style={{fontSize:12, color:"#999"}}>Tampilkan akses ke fitur komunitas SocHub.</div>
                             </div>
                             <button onClick={()=>updateSystemConfig({ "features.sochub": systemSettings?.features?.sochub === false ? true : false })} style={{background:"transparent", border:"none", cursor:"pointer"}}>
                                {systemSettings?.features?.sochub !== false ? <ToggleRight size={32} color="#4CAF50"/> : <ToggleLeft size={32} color="#CCC"/>}
                             </button>
                          </div>
                          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                             <div>
                                <div style={{fontSize:14, fontWeight:700}}>Menu Social Studio</div>
                                <div style={{fontSize:12, color:"#999"}}>Tampilkan akses ke fitur analitik dan manajemen Social Studio.</div>
                             </div>
                             <button onClick={()=>updateSystemConfig({ "features.socialStudio": systemSettings?.features?.socialStudio === false ? true : false })} style={{background:"transparent", border:"none", cursor:"pointer"}}>
                                {systemSettings?.features?.socialStudio !== false ? <ToggleRight size={32} color="#4CAF50"/> : <ToggleLeft size={32} color="#CCC"/>}
                             </button>
                          </div>
                       </div>
                    </div>

                    <div style={CARD({padding:24, borderRadius:24})}>
                       <h3 style={{fontSize:16, fontWeight:800, marginBottom:20, display:"flex", alignItems:"center", gap:8}}><Calendar size={18}/> Billing Logic</h3>
                       <div style={{display:"flex", flexDirection:"column", gap:16}}>
                          <div>
                             <div style={{fontSize:13, fontWeight:700, marginBottom:8}}>Masa Uji Coba (Hari)</div>
                             <input type="number" defaultValue={systemSettings.trialDays} 
                               onBlur={(e)=>updateSystemConfig({trialDays: Number(e.target.value)})}
                               style={{width:"100%", padding:"12px", borderRadius:12, border:"1px solid #EEE", fontSize:14}} />
                             <div style={{fontSize:11, color:"#999", marginTop:6}}>Default jumlah hari user baru mendapatkan akses PRO gratis.</div>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Plan Modal */}
        {showPlanModal && editingPlan && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)", padding:20}}>
            <motion.form initial={{scale:0.97, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.97, opacity:0}} onSubmit={savePlan} style={{background:"#FFFFFF", borderRadius:24, width:780, maxWidth:"95vw", height: 560, maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow: "0 25px 70px rgba(0,0,0,0.15)"}}>
               
               {/* Modal Header */}
               <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.03)", flexShrink: 0}}>
                  <div style={{display: "flex", alignItems: "center", gap: 10}}>
                    <div style={{width: 32, height: 32, borderRadius: 10, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                      <Package size={16} color="var(--theme-primary, #2563EB)" />
                    </div>
                    <div>
                      <h3 style={{fontSize:16, fontWeight:800, color: "#111827", margin: 0}}>{editingPlan.id ? `Edit Pengaturan Paket: ${editingPlan.name || ''}` : "Buat Paket Langganan Baru"}</h3>
                      <p style={{fontSize: 11, color: "rgba(17,24,39,0.4)", margin: 0}}>Konfigurasi nama, harga, limit, dan fitur premium.</p>
                    </div>
                  </div>
                  <button type="button" onClick={()=>setShowPlanModal(false)} style={{background:"rgba(0,0,0,0.03)", border:"none", padding:8, borderRadius:12, cursor:"pointer", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"}} className="hover-scale">
                    <X size={16}/>
                  </button>
               </div>

               {/* Modal Main Body (Split Layout: Sidebar + Form Content) */}
               <div style={{display: "flex", flex: 1, overflow: "hidden"}}>
                 
                 {/* Left Column Sidebar */}
                 <div style={{width: 220, background: "rgba(0,0,0,0.01)", padding: "16px 12px", borderRight: "1px solid rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0}}>
                   <button type="button" onClick={() => setModalPlanTab("general")} style={{
                     display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left", transition: "all 0.2s",
                     fontWeight: modalPlanTab === "general" ? 700 : 500,
                     color: modalPlanTab === "general" ? "var(--theme-primary, #2563EB)" : "rgba(17,24,39,0.6)",
                     background: modalPlanTab === "general" ? "rgba(37,99,235,0.06)" : "transparent"
                   }}>
                     <FileText size={16} /> Informasi Umum
                   </button>
                   <button type="button" onClick={() => setModalPlanTab("pricing")} style={{
                     display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left", transition: "all 0.2s",
                     fontWeight: modalPlanTab === "pricing" ? 700 : 500,
                     color: modalPlanTab === "pricing" ? "var(--theme-primary, #2563EB)" : "rgba(17,24,39,0.6)",
                     background: modalPlanTab === "pricing" ? "rgba(37,99,235,0.06)" : "transparent"
                   }}>
                     <DollarSign size={16} /> Skema Harga
                   </button>
                   <button type="button" onClick={() => setModalPlanTab("limits")} style={{
                     display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left", transition: "all 0.2s",
                     fontWeight: modalPlanTab === "limits" ? 700 : 500,
                     color: modalPlanTab === "limits" ? "var(--theme-primary, #2563EB)" : "rgba(17,24,39,0.6)",
                     background: modalPlanTab === "limits" ? "rgba(37,99,235,0.06)" : "transparent"
                   }}>
                     <Shield size={16} /> Batasan Penggunaan
                   </button>
                   <button type="button" onClick={() => setModalPlanTab("capabilities")} style={{
                     display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, textAlign: "left", transition: "all 0.2s",
                     fontWeight: modalPlanTab === "capabilities" ? 700 : 500,
                     color: modalPlanTab === "capabilities" ? "var(--theme-primary, #2563EB)" : "rgba(17,24,39,0.6)",
                     background: modalPlanTab === "capabilities" ? "rgba(37,99,235,0.06)" : "transparent"
                   }}>
                     <Settings size={16} /> Layanan & Fitur
                   </button>
                 </div>

                 {/* Right Column Form Content */}
                 <div style={{flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column"}}>
                   
                   {/* 1. GENERAL INFO TAB */}
                   <div style={{display: modalPlanTab === "general" ? "flex" : "none", flexDirection: "column", gap: 16}}>
                      <div style={{marginBottom: 4}}>
                        <h4 style={{margin: 0, fontSize: 14, fontWeight: 800, color: "#111827"}}>Informasi Umum</h4>
                        <p style={{margin: "4px 0 0 0", fontSize: 12, color: "rgba(17,24,39,0.4)"}}>Beri nama dan deskripsi menarik untuk paket langganan ini.</p>
                      </div>

                      <div>
                        <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Nama Paket</label>
                        <input name="name" placeholder="Misal: Pro, Enterprise, Brand Builder" defaultValue={editingPlan.name} required style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14, color: "#111827", transition: "all 0.2s"}} />
                        <div style={{fontSize:11, color:"rgba(17,24,39,0.4)", marginTop:4}}>Akan diakhiri otomatis dengan (Monthly) / (Annual) di sistem database.</div>
                      </div>

                      <div>
                        <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Keterangan Singkat</label>
                        <input name="desc" placeholder="Misal: Cocok untuk agensi sosial media profesional" defaultValue={editingPlan.desc} required style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14, color: "#111827", transition: "all 0.2s"}} />
                        <div style={{fontSize:11, color:"rgba(17,24,39,0.4)", marginTop:4}}>Keterangan singkat yang muncul di card halaman pricing.</div>
                      </div>

                      <div style={{marginTop: 10, background: "rgba(0,0,0,0.01)", padding: 14, borderRadius: 16, border: "1px solid rgba(0,0,0,0.02)"}}>
                        <label style={{display:"flex", alignItems:"center", gap:10, cursor:"pointer"}}>
                          <input name="popular" type="checkbox" defaultChecked={editingPlan.popular} style={{width: 16, height: 16, accentColor: "var(--theme-primary)"}} />
                          <div>
                            <span style={{fontSize:13, fontWeight:700, color: "#111827", display: "block"}}>Rekomendasi Utama (Paket Populer)</span>
                            <span style={{fontSize:11, color: "rgba(17,24,39,0.4)", display: "block", marginTop: 2}}>Tampilkan tag "Popular" di bagian atas card pricing untuk memicu psikologi pembeli.</span>
                          </div>
                        </label>
                      </div>
                   </div>

                   {/* 2. PRICING SCHEMES TAB */}
                    <div style={{display: modalPlanTab === "pricing" ? "flex" : "none", flexDirection: "column", gap: 16}}>
                       <div style={{marginBottom: 4}}>
                         <h4 style={{margin: 0, fontSize: 14, fontWeight: 800, color: "#111827"}}>Skema Harga & Simulasi Diskon</h4>
                         <p style={{margin: "4px 0 0 0", fontSize: 12, color: "rgba(17,24,39,0.4)"}}>Atur harga bulanan dan tahunan. Lihat simulasi visual harga coret serta kalkulasi hemat pembeli secara real-time.</p>
                       </div>

                       {/* Monthly pricing group */}
                       <div style={{background: "rgba(37,99,235,0.01)", padding: 16, borderRadius: 18, border: "1px solid rgba(37,99,235,0.06)", display: "flex", flexDirection: "column", gap: 12}}>
                         <div style={{fontSize: 11, fontWeight: 800, color: "var(--theme-primary, #2563EB)", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6}}>
                           <div style={{width: 6, height: 6, borderRadius: "50%", background: "var(--theme-primary, #2563EB)"}} />
                           SKEMA BULANAN (MONTHLY SCHEME)
                         </div>
                         
                         <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
                           <div>
                             <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.5)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>
                               Harga Jual (Rp) <span style={{color: "#EF4444"}}>*</span>
                             </label>
                             <div style={{position: "relative"}}>
                               <span style={{position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: "rgba(17,24,39,0.3)"}}>Rp</span>
                               <input 
                                 name="price_monthly" 
                                 type="number" 
                                 placeholder="99000" 
                                 value={modalPriceMonthly || ""} 
                                 onChange={(e) => setModalPriceMonthly(Number(e.target.value))}
                                 required 
                                 style={{width:"100%", padding:"11px 14px 11px 34px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "#FFFFFF", fontSize:14, color: "#111827", fontWeight: 700}} 
                               />
                             </div>
                             <div style={{fontSize: 10, color: "rgba(17,24,39,0.4)", marginTop: 4}}>Harga bersih yang dibayarkan pelanggan tiap bulan.</div>
                           </div>
                           <div>
                             <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.5)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Harga Coret / Normal (Rp)</label>
                             <div style={{position: "relative"}}>
                               <span style={{position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: "rgba(17,24,39,0.3)"}}>Rp</span>
                               <input 
                                 name="originalPrice_monthly" 
                                 type="number" 
                                 placeholder="149000" 
                                 value={modalOriginalPriceMonthly || ""} 
                                 onChange={(e) => setModalOriginalPriceMonthly(Number(e.target.value))}
                                 style={{width:"100%", padding:"11px 14px 11px 34px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "#FFFFFF", fontSize:14, color: "rgba(17,24,39,0.5)", textDecoration: modalOriginalPriceMonthly > modalPriceMonthly ? "line-through" : "none"}} 
                               />
                             </div>
                             <div style={{fontSize: 10, color: "rgba(17,24,39,0.4)", marginTop: 4}}>Opsional. Nilai jangkar psikologi harga coret.</div>
                           </div>
                         </div>

                         {/* Monthly Visual Simulator */}
                         <div style={{background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.025)", padding: 12, borderRadius: 14, display: "flex", flexDirection: "column", gap: 6}}>
                           <div style={{fontSize: 10, fontWeight: 800, color: "rgba(17,24,39,0.3)", textTransform: "uppercase"}}>SIMULASI TAMPILAN BULANAN DI PRICING:</div>
                           <div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"}}>
                             <span style={{fontSize: 18, fontWeight: 800, color: "#0B2A4A"}}>Rp {modalPriceMonthly.toLocaleString("id-ID")}</span>
                             {modalOriginalPriceMonthly > modalPriceMonthly && (
                               <>
                                 <span style={{fontSize: 12, color: "rgba(17,24,39,0.4)", textDecoration: "line-through"}}>Rp {modalOriginalPriceMonthly.toLocaleString("id-ID")}</span>
                                 <span style={{background: "#EF4444", color: "#FFFFFF", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 30, display: "inline-flex", alignItems: "center", gap: 4}}>
                                   <Percent size={10} color="#FFFFFF" /> HEMAT {Math.round(((modalOriginalPriceMonthly - modalPriceMonthly) / modalOriginalPriceMonthly) * 100)}%
                                 </span>
                                 <span style={{fontSize: 11, color: "#10B981", fontWeight: 700}}>
                                   (Lebih Murah Rp {(modalOriginalPriceMonthly - modalPriceMonthly).toLocaleString("id-ID")})
                                 </span>
                               </>
                             )}
                           </div>
                         </div>
                       </div>

                       {/* Annual pricing group */}
                       <div style={{background: "rgba(16,185,129,0.01)", padding: 16, borderRadius: 18, border: "1px solid rgba(16,185,129,0.06)", display: "flex", flexDirection: "column", gap: 12}}>
                         <div style={{fontSize: 11, fontWeight: 800, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6}}>
                           <div style={{width: 6, height: 6, borderRadius: "50%", background: "#10B981"}} />
                           SKEMA TAHUNAN (ANNUAL SCHEME)
                         </div>

                         <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
                           <div>
                             <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.5)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>
                               Harga Jual Setahun (Rp) <span style={{color: "#EF4444"}}>*</span>
                             </label>
                             <div style={{position: "relative"}}>
                               <span style={{position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: "rgba(17,24,39,0.3)"}}>Rp</span>
                               <input 
                                 name="price_annual" 
                                 type="number" 
                                 placeholder="948000" 
                                 value={modalPriceAnnual || ""} 
                                 onChange={(e) => setModalPriceAnnual(Number(e.target.value))}
                                 required 
                                 style={{width:"100%", padding:"11px 14px 11px 34px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "#FFFFFF", fontSize:14, color: "#10B981", fontWeight: 700}} 
                               />
                             </div>
                             <div style={{fontSize: 10, color: "rgba(17,24,39,0.4)", marginTop: 4}}>
                               Setara <span style={{fontWeight: 700, color: "#111827"}}>Rp {Math.round(modalPriceAnnual / 12).toLocaleString("id-ID")}/bln</span>. Total tagihan dalam setahun.
                             </div>
                           </div>
                           <div>
                             <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.5)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Harga Coret Setahun (Rp)</label>
                             <div style={{position: "relative"}}>
                               <span style={{position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: "rgba(17,24,39,0.3)"}}>Rp</span>
                               <input 
                                 name="originalPrice_annual" 
                                 type="number" 
                                 placeholder="1788000" 
                                 value={modalOriginalPriceAnnual || ""} 
                                 onChange={(e) => setModalOriginalPriceAnnual(Number(e.target.value))}
                                 style={{width:"100%", padding:"11px 14px 11px 34px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "#FFFFFF", fontSize:14, color: "rgba(17,24,39,0.5)", textDecoration: modalOriginalPriceAnnual > modalPriceAnnual ? "line-through" : "none"}} 
                               />
                             </div>
                             <div style={{fontSize: 10, color: "rgba(17,24,39,0.4)", marginTop: 4}}>Opsional. Nilai jangkar psikologi harga coret tahunan.</div>
                           </div>
                         </div>

                         {/* Annual Visual Simulator */}
                         <div style={{background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.025)", padding: 12, borderRadius: 14, display: "flex", flexDirection: "column", gap: 6}}>
                           <div style={{fontSize: 10, fontWeight: 800, color: "rgba(17,24,39,0.3)", textTransform: "uppercase"}}>SIMULASI TAMPILAN TAHUNAN DI PRICING:</div>
                           <div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"}}>
                             <span style={{fontSize: 18, fontWeight: 800, color: "#10B981"}}>Rp {modalPriceAnnual.toLocaleString("id-ID")}</span>
                             {modalOriginalPriceAnnual > modalPriceAnnual && (
                               <>
                                 <span style={{fontSize: 12, color: "rgba(17,24,39,0.4)", textDecoration: "line-through"}}>Rp {modalOriginalPriceAnnual.toLocaleString("id-ID")}</span>
                                 <span style={{background: "#10B981", color: "#FFFFFF", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 30, display: "inline-flex", alignItems: "center", gap: 4}}>
                                   <Percent size={10} color="#FFFFFF" /> DISKON {Math.round(((modalOriginalPriceAnnual - modalPriceAnnual) / modalOriginalPriceAnnual) * 100)}%
                                 </span>
                                 <span style={{fontSize: 11, color: "#10B981", fontWeight: 700}}>
                                   (Hemat Rp {(modalOriginalPriceAnnual - modalPriceAnnual).toLocaleString("id-ID")} /tahun)
                                 </span>
                               </>
                             )}
                           </div>
                           
                           {/* Cross-billing savings check */}
                           {modalPriceMonthly > 0 && (modalPriceMonthly * 12) > modalPriceAnnual && (
                             <div style={{marginTop: 4, display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--theme-primary, #2563EB)", background: "rgba(37,99,235,0.04)", padding: "6px 12px", borderRadius: 10}}>
                               <Sparkles size={12} color="var(--theme-primary, #2563EB)" />
                               <span>
                                 Hemat tambahan Rp {((modalPriceMonthly * 12) - modalPriceAnnual).toLocaleString("id-ID")} ({Math.round((((modalPriceMonthly * 12) - modalPriceAnnual) / (modalPriceMonthly * 12)) * 100)}%) dibandingkan langganan bulanan terus-menerus!
                               </span>
                             </div>
                           )}
                         </div>
                       </div>
                    </div>
                    

                    {/* 3. USAGE LIMITS TAB */}
                   <div style={{display: modalPlanTab === "limits" ? "flex" : "none", flexDirection: "column", gap: 16}}>
                      <div style={{marginBottom: 4}}>
                        <h4 style={{margin: 0, fontSize: 14, fontWeight: 800, color: "#111827"}}>Batasan Penggunaan</h4>
                        <p style={{margin: "4px 0 0 0", fontSize: 12, color: "rgba(17,24,39,0.4)"}}>Definisikan batas limit setiap item. Isi dengan <b>-1</b> untuk tak terbatas (unlimited).</p>
                      </div>

                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
                        <div>
                          <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Jumlah Workspace</label>
                          <input name="workspaces" type="number" placeholder="3" defaultValue={editingPlan.limits?.workspaces ?? 1} required style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14}} />
                        </div>
                        <div>
                          <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Max Akun Sosial Media</label>
                          <input name="socialAccounts" type="number" placeholder="10" defaultValue={editingPlan.limits?.socialAccounts ?? 10} required style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14}} />
                        </div>
                      </div>

                      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12}}>
                        <div>
                          <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Akses AI (Kredit/Bulan)</label>
                          <input name="aiGenerationPerMonth" type="number" placeholder="100" defaultValue={editingPlan.limits?.aiGenerationPerMonth ?? 50} required style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14}} />
                        </div>
                        <div>
                          <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Batas Anggota Tim</label>
                          <input name="teamMembers" type="number" placeholder="3" defaultValue={editingPlan.limits?.teamMembers ?? 0} required style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14}} />
                        </div>
                        <div>
                          <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Penyimpanan (MB)</label>
                          <input name="storageMB" type="number" placeholder="5000" defaultValue={editingPlan.limits?.storageMB ?? 1000} required style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14}} />
                        </div>
                      </div>
                   </div>

                   {/* 4. CAPABILITIES TAB */}
                   <div style={{display: modalPlanTab === "capabilities" ? "flex" : "none", flexDirection: "column", gap: 16}}>
                      <div style={{marginBottom: 4}}>
                        <h4 style={{margin: 0, fontSize: 14, fontWeight: 800, color: "#111827"}}>Layanan & Fitur Premium</h4>
                        <p style={{margin: "4px 0 0 0", fontSize: 12, color: "rgba(17,24,39,0.4)"}}>Aktifkan atau pilih tingkat kapabilitas fitur yang disediakan paket ini.</p>
                      </div>

                      <div style={{display:"grid", gridTemplateColumns:"1fr", gap:16}}>
                        <div>
                          <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Level Modul Analitik</label>
                          <select name="analyticsLevel" defaultValue={editingPlan.capabilities?.analyticsLevel || 'basic'} style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", fontSize:13, background:"#FFFFFF", cursor: "pointer"}}>
                            <option value="basic">Analitik Dasar</option>
                            <option value="advanced">Analitik Lanjutan (Demografi & Grafik)</option>
                            <option value="custom">Mendalam & Laporan Kustom</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Tingkat Dukungan CS</label>
                        <select name="supportLevel" defaultValue={editingPlan.capabilities?.supportLevel || 'community'} style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", fontSize:13, background:"#FFFFFF", cursor: "pointer"}}>
                          <option value="community">Komunitas & Pusat Bantuan</option>
                          <option value="email">Email Reguler (Respon 48 Jam)</option>
                          <option value="priority">Email Prioritas (Respon &lt;12 Jam)</option>
                          <option value="vip">Dukungan VIP 24/7 (Live Chat & WA)</option>
                        </select>
                      </div>
                   </div>
                 </div>
               </div>

               {/* Modal Sticky Footer */}
               <div style={{display:"flex", justifyContent: "flex-end", gap:12, padding: "16px 24px", background: "rgba(0,0,0,0.015)", borderTop: "1px solid rgba(0,0,0,0.03)", flexShrink: 0}}>
                 <button type="button" onClick={()=>setShowPlanModal(false)} style={{background:"transparent", border:"1px solid rgba(0,0,0,0.08)", color: "#111827", padding:"10px 20px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0.2s"}} className="hover-bg-light">Batal</button>
                 <button type="submit" style={{background:"var(--theme-primary, #2563EB)", color:"white", border:"none", padding:"10px 24px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6}} className="hover-scale">
                   <Check size={14} /> {lang === "id" ? "Simpan Perubahan" : "Save Changes"}
                 </button>
               </div>

            </motion.form>
          </motion.div>
        )}

        {/* Promo Modal */}
        {showPromoModal && editingPromo && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)", padding:20}}>
            <motion.form initial={{scale:0.97, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.97, opacity:0}} onSubmit={savePromo} style={{background:"#FFFFFF", borderRadius:24, width:520, maxWidth:"95vw", maxHeight:"85vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow: "0 25px 70px rgba(0,0,0,0.15)"}}>
               
               {/* Modal Sticky Header */}
               <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.03)", flexShrink: 0}}>
                  <div style={{display: "flex", alignItems: "center", gap: 10}}>
                    <div style={{width: 32, height: 32, borderRadius: 10, background: "rgba(16,185,129,0.08)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                      <Percent size={16} color="#10B981" />
                    </div>
                    <div>
                      <h3 style={{fontSize:16, fontWeight:800, color: "#111827", margin: 0}}>{editingPromo.id ? "Edit Kode Promo" : "Generate Kode Promo Baru"}</h3>
                      <p style={{fontSize: 11, color: "rgba(17,24,39,0.4)", margin: 0}}>Buat voucher diskon atau potongan harga berlangganan.</p>
                    </div>
                  </div>
                  <button type="button" onClick={()=>setShowPromoModal(false)} style={{background:"rgba(0,0,0,0.03)", border:"none", padding:8, borderRadius:12, cursor:"pointer", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"}} className="hover-scale">
                    <X size={16}/>
                  </button>
               </div>

               {/* Scrollable Form Content */}
               <div style={{display:"flex", flexDirection:"column", gap:16, padding:24, overflowY:"auto", flex:1}}>
                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Kode Promo / Kupon</label>
                    <input name="code" placeholder="DISKON77" defaultValue={editingPromo.code} required style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:16, fontWeight:800, letterSpacing:1, textTransform: "uppercase", color: "#111827"}} />
                    <div style={{fontSize:11, color:"rgba(17,24,39,0.4)", marginTop:4}}>Gunakan huruf kapital dan tanpa spasi (misal: HUBIFYHEMAT).</div>
                  </div>

                  <div style={{display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16}}>
                    <div>
                      <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Tipe Diskon</label>
                      <select name="type" defaultValue={editingPromo.type || "percent"} style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", fontSize:13, background:"#FFFFFF", cursor: "pointer"}}>
                        <option value="percent">Persentase (%)</option>
                        <option value="fixed">Nominal Tetap (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Nilai Potongan</label>
                      <input name="value" type="number" placeholder="15" defaultValue={editingPromo.value} required style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14}} />
                    </div>
                  </div>

                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Target Pengguna</label>
                    <select name="targetType" defaultValue={editingPromo.targetType || "all"} style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", fontSize:13, background:"#FFFFFF", cursor: "pointer"}}>
                      <option value="all">Semua Pengguna</option>
                      <option value="first_timer">Hanya Pengguna Baru (Pertama Kali Berlangganan)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Batas Pemakaian (0 = Tanpa Batas)</label>
                    <input name="usageLimit" type="number" defaultValue={editingPromo.usageLimit || 0} style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:14}} />
                  </div>

                  <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                    <div>
                      <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Mulai Berlaku</label>
                      <input name="startDate" type="date" defaultValue={editingPromo.startDate} style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:13}} />
                    </div>
                    <div>
                      <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Berakhir Pada</label>
                      <input name="endDate" type="date" defaultValue={editingPromo.endDate} style={{width:"100%", padding:"11px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:13}} />
                    </div>
                  </div>

                  <div>
                    <label style={{display:"block", fontSize:11, fontWeight:800, color:"rgba(17,24,39,0.4)", textTransform:"uppercase", marginBottom:6, letterSpacing: "0.5px"}}>Syarat & Ketentuan (S&K)</label>
                    <textarea name="terms" placeholder="Contoh: Berlaku untuk minimal pembelian paket Pro setahun..." defaultValue={editingPromo.terms} style={{width:"100%", height:70, padding:"10px 14px", borderRadius:12, border:"1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)", fontSize:13, resize:"none", lineHeight: 1.5}} />
                  </div>
               </div>

               {/* Modal Sticky Footer */}
               <div style={{display:"flex", justifyContent: "flex-end", gap:12, padding: "16px 24px", background: "rgba(0,0,0,0.015)", borderTop: "1px solid rgba(0,0,0,0.03)", flexShrink: 0}}>
                 <button type="button" onClick={()=>setShowPromoModal(false)} style={{background:"transparent", border:"1px solid rgba(0,0,0,0.08)", color: "#111827", padding:"10px 20px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0.2s"}} className="hover-bg-light">Batal</button>
                 <button type="submit" style={{background:"var(--theme-primary, #2563EB)", color:"white", border:"none", padding:"10px 24px", borderRadius:12, fontSize:13, fontWeight:700, cursor:"pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6}} className="hover-scale">
                   <Check size={14} /> {lang === "id" ? "Aktifkan Promo" : "Activate Promo"}
                 </button>
               </div>

            </motion.form>
          </motion.div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingItem && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.7)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)"}}>
            <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} 
              style={{background:"white", borderRadius:32, padding:"40px", textAlign:"center", maxWidth:400, boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
              <div style={{width:80, height:80, background:"rgba(156,43,78,0.1)", borderRadius:30, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px"}}>
                <AlertCircle color="#9C2B4E" size={48} />
              </div>
              <h3 style={{fontSize:22, fontWeight:800, color:"#2C2016", margin:0, letterSpacing:"-0.5px"}}>{lang === "id" ? "Konfirmasi Hapus" : "Confirm Delete"}</h3>
              <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", margin:"16px 0 32px", lineHeight:1.6}}>
                Apakah Anda yakin ingin menghapus <b>{deletingItem.type}</b> dengan nama <br/>
                <span style={{color:"#9C2B4E", fontWeight:800}}>"{deletingItem.name}"</span>? <br/>
                Tindakan ini tidak bisa dibatalkan.
              </p>
              <div style={{display:"flex", gap:14}}>
                <button onClick={() => setDeletingItem(null)} 
                  style={{flex:1, padding:"16px", borderRadius:16, border:"1px solid #EEE", background:"white", fontWeight:800, fontSize:14, cursor:"pointer"}} 
                  className="hover-bg-light">{lang === "id" ? "Batal" : "Cancel"}</button>
                <button onClick={async () => {
                   try {
                     if (deletingItem.type === "plans") {
                       const baseId = deletingItem.id.replace('-monthly', '').replace('-annual', '');
                       await deleteDoc(doc(db, "plans", `${baseId}-monthly`));
                       await deleteDoc(doc(db, "plans", `${baseId}-annual`));
                     } else {
                       await deleteDoc(doc(db, deletingItem.type, deletingItem.id));
                     }
                     setDeletingItem(null);
                   } catch(e:any) { 
                     setDeletingItem(null);
                     alert("Gagal menghapus: " + e.message); 
                   }
                }} style={{flex:1, background:"#9C2B4E", color:"white", border:"none", padding:"16px", borderRadius:16, fontWeight:800, fontSize:14, cursor:"pointer", boxShadow:"0 8px 16px rgba(156,43,78,0.2)"}}>{lang === "id" ? "Hapus Permanen" : "Delete Permanently"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* CUSTOM CONFIRM ACTION MODAL */}
        {confirmAction && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.7)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)"}}>
            <motion.div initial={{scale:0.95, y:20}} animate={{scale:1, y:0}} exit={{scale:0.95, y:20}} 
              style={{background:"white", borderRadius:32, padding:"40px", textAlign:"center", maxWidth:400, boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
              <div style={{width:80, height:80, background:"rgba(59,130,246,0.1)", borderRadius:30, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px"}}>
                <AlertCircle color="var(--theme-primary)" size={48} />
              </div>
              <h3 style={{fontSize:22, fontWeight:800, color:"#2C2016", margin:0, letterSpacing:"-0.5px"}}>{confirmAction.title}</h3>
              <p style={{fontSize:14, color:"rgba(44,32,22,0.6)", margin:"16px 0 32px", lineHeight:1.6}}>
                {confirmAction.msg}
              </p>
              <div style={{display:"flex", gap:12}}>
                <button type="button" onClick={()=>setConfirmAction(null)} style={{flex:1, padding:"16px 0", borderRadius:20, border:"none", background:"#FAF7F2", color:"#2C2016", fontSize:14, fontWeight:800, cursor:"pointer"}}>{lang === "id" ? "Batal" : "Cancel"}</button>
                <button type="button" onClick={()=>{ confirmAction.onConfirm(); setConfirmAction(null); }} style={{flex:1, padding:"16px 0", borderRadius:20, border:"none", background:"var(--theme-primary)", color:"white", fontSize:14, fontWeight:800, cursor:"pointer"}}>Konfirmasi</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saveMsg && (
          <motion.div initial={{opacity:0, y:50}} animate={{opacity:1, y:0}} exit={{opacity:0, y:50}} 
            style={{position:"fixed", bottom:40, right:40, background:"#2D7A5E", color:"white", padding:"16px 24px", borderRadius:16, display:"flex", alignItems:"center", gap:12, boxShadow:"0 10px 30px rgba(45,122,94,0.3)", zIndex:3000, fontWeight:700}}>
            <CheckCircle color="white" size={20} />
            {saveMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
