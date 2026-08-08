import React, { useState, useEffect } from 'react';
import { PublicHeader, PublicFooter } from './components/PublicShared';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from './i18n';
import { Globe, Check, ChevronDown, Flame, ArrowLeft, Instagram, MapPin, Mail, Phone, Heart, Facebook, Linkedin, Twitter } from 'lucide-react';
import { getFaqs, FAQItem } from './LandingPage';
import { TiktokIcon, ThreadsIcon } from './components/social-icons';
import { db, collection, getDocs, doc, onSnapshot } from './firebase';

export const getPlanTier = (plan: any) => {
  const id = (plan?.id || '').toLowerCase();
  const name = (plan?.name || '').toLowerCase();
  if (id.startsWith('free') || name.includes('free')) return 'free';
  if (id.includes('plus') || id.includes('solo') || name.includes('plus') || name.includes('solo')) return 'plus';
  if (id.includes('pro') || id.includes('team') || name.includes('pro') || name.includes('team')) return 'pro';
  if (id.includes('max') || id.includes('agency') || name.includes('max') || name.includes('agency')) return 'max';
  return 'plus';
};

export const getCompareRows = (lang: 'id' | 'en' = 'id', freeLimits: any = {}, freeCaps: any = {}) => [
  // 1. Management & Limits
  {
    category: lang === 'id' ? 'Manajemen & Akses' : 'Management & Access',
    id: lang === 'id' ? 'Jumlah Workspace' : 'Workspaces',
    free: (freeLimits.workspaces === -1 || freeLimits.workspaces === '-1') ? 'Unlimited' : `${freeLimits.workspaces ?? 1}`,
    getVal: (p: any) => {
      const v = p.limits?.workspaces;
      return (v === -1 || v === '-1') ? 'Unlimited' : `${v ?? 1}`;
    }
  },
  {
    category: lang === 'id' ? 'Manajemen & Akses' : 'Management & Access',
    id: lang === 'id' ? 'Integrasi Akun Sosmed (Segera)' : 'Social Accounts (Soon)',
    free: (freeLimits.socialAccounts === -1 || freeLimits.socialAccounts === '-1') ? 'Unlimited' : `${freeLimits.socialAccounts ?? 1} Akun`,
    getVal: (p: any) => {
      const v = p.limits?.socialAccounts;
      return (v === -1 || v === '-1') ? 'Unlimited' : `${v ?? 1} Akun`;
    }
  },
  {
    category: lang === 'id' ? 'Manajemen & Akses' : 'Management & Access',
    id: lang === 'id' ? 'Anggota Tim & Kolaborasi' : 'Team Members',
    free: (() => {
      const v = freeLimits.teamMembers;
      if (v === -1 || v === '-1') return 'Unlimited';
      if (!v || v === 0) return '-';
      return `${v}`;
    })(),
    getVal: (p: any) => {
      const v = p.limits?.teamMembers;
      if (v === -1 || v === '-1') return 'Unlimited';
      if (!v || v === 0) return '-';
      return `${v}`;
    }
  },
  {
    category: lang === 'id' ? 'Manajemen & Akses' : 'Management & Access',
    id: lang === 'id' ? 'Penyimpanan Aset Media' : 'Asset Storage',
    free: (() => {
      const v = freeLimits.storageMB;
      if (v === -1 || v === '-1') return 'Unlimited';
      return `${v ?? 50} MB`;
    })(),
    getVal: (p: any) => {
      const v = p.limits?.storageMB;
      if (v === -1 || v === '-1') return 'Unlimited';
      return `${v ?? 50} MB`;
    }
  },
  // 2. Dashboard & Productivity
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'Tren Terkini & Insight' : 'Up-to-Date Trends',
    free: true,
    getVal: () => true
  },
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'To-Do List & Tugas' : 'To-Do List & Tasks',
    free: true,
    getVal: () => true
  },
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'Metrik Progres Harian' : 'Daily Progress Metrics',
    free: true,
    getVal: () => true
  },
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'Catatan Tempel (Sticky Notes)' : 'Sticky Notes',
    free: true,
    getVal: () => true
  },
  {
    category: lang === 'id' ? 'Dashboard & Produktivitas' : 'Dashboard & Productivity',
    id: lang === 'id' ? 'Brief Konten Bersama' : 'Shared Brief Content',
    free: (() => {
      const v = freeCaps.sharedBriefs;
      if (v === -1 || v === '-1') return 'Unlimited';
      return v ? `${v} Brief Konten` : '-';
    })(),
    getVal: (p: any) => {
      const v = p.capabilities?.sharedBriefs;
      if (v === -1 || v === '-1') return 'Unlimited';
      return v ? `${v} Brief Konten` : '-';
    }
  },
  // 3. Hub.AI Assistant
  {
    category: lang === 'id' ? 'Hub.AI Assistant' : 'Hub.AI Assistant',
    id: lang === 'id' ? 'Model AI Gemini' : 'Gemini AI Models',
    free: freeCaps.aiModelText || '3.1 Flash',
    getVal: (p: any) => p.capabilities?.aiModelText || '3.1 Flash'
  },
  {
    category: lang === 'id' ? 'Hub.AI Assistant' : 'Hub.AI Assistant',
    id: lang === 'id' ? 'Auto-Save Chat ke Brief' : 'Auto-Save Chat to Brief',
    free: freeCaps.aiAutoSave ? true : '-',
    getVal: (p: any) => p.capabilities?.aiAutoSave ? true : '-'
  },
  {
    category: lang === 'id' ? 'Hub.AI Assistant' : 'Hub.AI Assistant',
    id: lang === 'id' ? 'Batas Generate AI / Bulan' : 'AI Generation / Month',
    free: freeCaps.aiUsageText || 'Terbatas',
    getVal: (p: any) => p.capabilities?.aiUsageText || 'Terbatas'
  },
  // 4. Content Calendar & Brief
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Public / Shared Brief Link' : 'Public Shared Brief',
    free: freeCaps.publicLink ? true : '-',
    getVal: (p: any) => p.capabilities?.publicLink ? true : '-'
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Riwayat Edit Brief Konten' : 'Brief Edit History',
    free: (() => {
      const v = freeCaps.historyDays;
      if (!v || v === 0) return '-';
      if (v === -1) return 'Unlimited';
      return `${v} Hari`;
    })(),
    getVal: (p: any) => {
      const v = p.capabilities?.historyDays;
      if (!v || v === 0) return '-';
      if (v === -1) return 'Unlimited';
      return `${v} Hari`;
    }
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Kustom Kolom Brief' : 'Brief Column Customization',
    free: freeCaps.customColumn ? true : '-',
    getVal: (p: any) => p.capabilities?.customColumn ? true : '-'
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Pemisah Data Organik/Paid' : 'Organic vs Paid Split',
    free: freeCaps.organicPaid ? true : '-',
    getVal: (p: any) => p.capabilities?.organicPaid ? true : '-'
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Bulk Import & Export CSV/XLSX' : 'Bulk Import/Export',
    free: freeCaps.csvImportExport ? true : '-',
    getVal: (p: any) => p.capabilities?.csvImportExport ? true : '-'
  },
  {
    category: lang === 'id' ? 'Kalender & Brief Konten' : 'Content Calendar & Brief',
    id: lang === 'id' ? 'Penjadwalan Otomatis (Segera)' : 'Auto Publishing',
    free: freeCaps.autoPublishing ? true : '-',
    getVal: (p: any) => p.capabilities?.autoPublishing ? true : '-'
  },
  // 5. Analytics & Reports
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Analitik Per Platform' : 'Platform Analytics',
    free: freeCaps.platformAnalytics ? true : '-',
    getVal: (p: any) => p.capabilities?.platformAnalytics ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Grafik & Heatmap Aktivitas' : 'Charts & Heatmap',
    free: freeCaps.heatmaps ? true : '-',
    getVal: (p: any) => p.capabilities?.heatmaps ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Rangkuman AI Otomatis' : 'AI Performance Summary',
    free: freeCaps.aiSummary ? true : '-',
    getVal: (p: any) => p.capabilities?.aiSummary ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Analisis Top & Bad Content' : 'Top & Bad Content Analysis',
    free: freeCaps.topBadAnalysis ? true : '-',
    getVal: (p: any) => p.capabilities?.topBadAnalysis ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Data Demografi Per Platform' : 'Platform Demographics',
    free: freeCaps.demographics ? true : '-',
    getVal: (p: any) => p.capabilities?.demographics ? true : '-'
  },
  {
    category: lang === 'id' ? 'Analitik & Pelaporan' : 'Analytics & Reporting',
    id: lang === 'id' ? 'Export Laporan PDF' : 'PDF Report Export',
    free: freeCaps.pdfExport ? true : '-',
    getVal: (p: any) => p.capabilities?.pdfExport ? true : '-'
  }
];

export const generateBulletPoints = (plan: any, lang: 'id'|'en') => {
  if (plan?.features && plan.features.length > 0) {
    // If the plan has hardcoded features array (from the seeder), prefer using it for the card bullets
    return plan.features;
  }

  const limits = plan?.limits || {};
  const caps = plan?.capabilities || {};
  const bullets: string[] = [];

  // Workspaces
  if (limits.workspaces === -1 || limits.workspaces === '-1') {
    bullets.push("Unlimited Workspaces");
  } else {
    bullets.push(`${limits.workspaces || 1} Workspace${limits.workspaces > 1 ? 's' : ''}`);
  }

  // Social Accounts
  if (limits.socialAccounts === -1 || limits.socialAccounts === '-1') {
    bullets.push(lang === 'id' ? "Unlimited Akun Sosmed" : "Unlimited Social Accounts");
  } else if (limits.socialAccounts) {
    bullets.push(`${limits.socialAccounts} ${lang === 'id' ? 'Akun Sosmed' : 'Social Accounts'}`);
  }

  // AI Usage
  if (caps.aiModelText) {
    bullets.push(`Hub.AI: ${caps.aiModelText}`);
  } else if (limits.aiCreditsPerMonth) {
     bullets.push(`Hub.AI: ${limits.aiCreditsPerMonth} Credits`);
  }

  // Team Members
  if (limits.teamMembers === -1 || limits.teamMembers === '-1') {
    bullets.push(lang === 'id' ? "Anggota Tim Unlimited" : "Unlimited Team Members");
  } else if (limits.teamMembers > 1) {
    bullets.push(`${limits.teamMembers} ${lang === 'id' ? 'Anggota Tim' : 'Team Members'}`);
  } else if (limits.teamMembers === 1) {
    bullets.push(lang === 'id' ? "1 Anggota (Solo)" : "1 Member (Solo)");
  }
  
  return bullets;
};

export function PricingPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useI18n();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = lang === 'id' ? 'Harga Paket - Hubify Social' : 'Pricing Plans - Hubify Social';
  }, [lang]);

  const [isAnnual, setIsAnnual] = useState(false);

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureRows, setFeatureRows] = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'plans'))
      .then((snap) => {
        if (!snap.empty) {
          setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() as any })));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to fetch plans:", err);
        setLoading(false);
      });
  }, []);

  const formatLimit = (val: any) => {
    if (val === -1 || val === '-1' || val === 'unlimited') return 'Unlimited';
    return val;
  };

  const formatLevel = (val: string, lang: 'id'|'en') => {
    if (val === 'basic') return lang === 'id' ? 'Dasar' : 'Basic';
    if (val === 'advanced') return lang === 'id' ? 'Lanjutan' : 'Advanced';
    if (val === 'custom') return lang === 'id' ? 'Kustom' : 'Custom';
    if (val === 'white-label') return 'White-label';
    if (val === 'community') return lang === 'id' ? 'Komunitas' : 'Community';
    if (val === 'email') return 'Email';
    if (val === 'priority') return lang === 'id' ? 'Prioritas' : 'Priority';
    if (val === 'vip') return '24/7 VIP';
    if (val === 'none') return lang === 'id' ? 'Tidak Tersedia' : 'None';
    return val;
  };

  const maxAnnualDiscount = React.useMemo(() => {
    let maxDisc = 0;
    const annualPlans = plans.filter(p => p.addMonths >= 12 && !p.id.startsWith('free'));
    for (const plan of annualPlans) {
      const baseSlug = plan.id.replace('-monthly', '').replace('-annual', '');
      const monthlyPlan = plans.find(mp => mp.id === `${baseSlug}-monthly`);
      const priceMonthly = monthlyPlan ? monthlyPlan.price : Math.round(plan.price / 12);
      
      const mainPrice = Math.round(plan.price / 12);
      let mainOriginalPrice = 0;
      if (plan.originalPrice > 0) {
        mainOriginalPrice = Math.round(plan.originalPrice / 12);
      } else if (priceMonthly > 0 && priceMonthly > mainPrice) {
        mainOriginalPrice = priceMonthly;
      }
      
      if (mainOriginalPrice > mainPrice) {
        const discountPercent = Math.round(((mainOriginalPrice - mainPrice) / mainOriginalPrice) * 100);
        if (discountPercent > maxDisc) {
          maxDisc = discountPercent;
        }
      }
    }
    return maxDisc || 20; // fallback to 20 if none calculated
  }, [plans]);

  const activePlans = plans.filter(p => (isAnnual ? p.addMonths >= 12 : p.addMonths < 12) && !p.id.startsWith('free')).sort((a,b) => a.price - b.price);

  const dbFreePlan = plans.find(p => p.id === (isAnnual ? 'free-annual' : 'free-monthly'));
  const freeLimits = dbFreePlan?.limits || { workspaces: 1, socialAccounts: 1, teamMembers: 0, aiCreditsPerMonth: 10, storageMB: 150 };
  const freeCaps = dbFreePlan?.capabilities || { 
     publicLink: true, customColumn: false, organicPaid: true, csvImportExport: false, autoPublishing: false,
     platformAnalytics: false, heatmaps: false, aiSummary: false, topBadAnalysis: false, demographics: false, pdfExport: false,
     aiAutoSave: false, aiModelText: "3.1 Flash", aiUsageText: "Terbatas", historyDays: 0, sharedBriefs: 20
  };



  const handleLangChange = (l: 'id' | 'en') => {
    setLang(l);
  };

  const handlePlanSelect = (planType: 'monthly' | 'annual') => {
    navigate(`/checkout-preview?plan=${planType}`);
  };

  const getPlanPrice = (planSlug: string, isAnn: boolean, defaultPrice: number) => {
    const matched = plans.find(p => {
      const nameLower = (p.name || '').toLowerCase();
      const matchesSlug = nameLower.includes(planSlug);
      const isAnnualPlan = isAnn ? p.addMonths >= 12 : p.addMonths < 12;
      return matchesSlug && isAnnualPlan;
    });
    return matched ? matched.price : defaultPrice;
  };

  const getPlanOriginalPrice = (planSlug: string, isAnn: boolean, defaultPrice: number) => {
    const matched = plans.find(p => {
      const nameLower = (p.name || '').toLowerCase();
      const matchesSlug = nameLower.includes(planSlug);
      const isAnnualPlan = isAnn ? p.addMonths >= 12 : p.addMonths < 12;
      return matchesSlug && isAnnualPlan;
    });
    return matched ? matched.originalPrice : defaultPrice;
  };

  const displayPriceText = (planSlug: string, isAnn: boolean, defaultPrice: number) => {
    const price = getPlanPrice(planSlug, isAnn, defaultPrice);
    if (isAnn) {
      const monthlyEquivalent = Math.round(price / 12);
      if (monthlyEquivalent % 1000 === 0) {
        return `Rp ${(monthlyEquivalent / 1000).toLocaleString('id-ID')}k`;
      }
      return `Rp ${monthlyEquivalent.toLocaleString('id-ID')}`;
    } else {
      if (price % 1000 === 0) {
        return `Rp ${(price / 1000).toLocaleString('id-ID')}k`;
      }
      return `Rp ${price.toLocaleString('id-ID')}`;
    }
  };

  const displayOriginalPriceText = (planSlug: string, isAnn: boolean, defaultPrice: number) => {
    const origPrice = getPlanOriginalPrice(planSlug, isAnn, defaultPrice);
    if (!origPrice) return null;
    if (isAnn) {
      const monthlyEquivalent = Math.round(origPrice / 12);
      return `Rp ${monthlyEquivalent.toLocaleString('id-ID')}`;
    } else {
      return `Rp ${origPrice.toLocaleString('id-ID')}`;
    }
  };

  const getPlanDesc = (planSlug: string, isAnn: boolean, defaultDesc: string) => {
    const matched = plans.find(p => {
      const nameLower = (p.name || '').toLowerCase();
      const matchesSlug = nameLower.includes(planSlug);
      const isAnnualPlan = isAnn ? p.addMonths >= 12 : p.addMonths < 12;
      return matchesSlug && isAnnualPlan;
    });
    return matched?.desc || defaultDesc;
  };


  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen overflow-x-clip flex flex-col">
      {/* Navbar */}
      <PublicHeader currentLang={lang} onLangChange={handleLangChange} />

      {/* Pricing Section */}
      <section className="pt-32 pb-24 px-6 bg-slate-50 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B2A4A] mb-4">
              {lang === 'id' ? 'Pilih Paket Anda' : 'Choose Your Plan'}
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
              {lang === 'id' ? 'Mulai dari gratis, tingkatkan sesuai kebutuhan skala bisnis Anda.' : 'Start for free, scale as your business grows.'}
            </p>
            
            {/* Toggle Switch */}
            <div className="flex items-center justify-center gap-4">
              <span className={`font-medium ${!isAnnual ? 'text-[#0B2A4A]' : 'text-slate-400'}`}>
                {lang === 'id' ? 'Bulanan' : 'Monthly'}
              </span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className={`w-16 h-8 rounded-full relative transition-colors focus:outline-none ${isAnnual ? 'bg-blue-600' : 'bg-[#0B2A4A]'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${isAnnual ? 'left-9' : 'left-1'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isAnnual ? 'text-[#0B2A4A]' : 'text-slate-400'}`}>
                  {lang === 'id' ? 'Tahunan' : 'Annually'}
                </span>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {lang === 'id' ? `Hemat s/d ${maxAnnualDiscount}%` : `Save up to ${maxAnnualDiscount}%`}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-24">
            {/* Free Plan (Dynamic from DB) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="mb-6">
                <div className="text-lg font-bold text-slate-700 mb-2">{dbFreePlan ? dbFreePlan.name.replace(/ \((Monthly|Annual)\)/i, '') : "Free Starter"}</div>
                <div className="flex flex-col gap-1 mb-2">
                  {dbFreePlan && dbFreePlan.originalPrice > dbFreePlan.price && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold line-through text-slate-400 decoration-slate-300">
                        Rp {dbFreePlan.originalPrice.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {lang === 'id' ? 'Hemat' : 'Save'} {Math.round(((dbFreePlan.originalPrice - dbFreePlan.price) / dbFreePlan.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-end gap-1 overflow-hidden flex-nowrap whitespace-nowrap">
                    <span className="text-xl xs:text-2xl sm:text-3xl md:text-2xl lg:text-lg xl:text-2xl font-extrabold tracking-tight text-[#0B2A4A]">Rp {dbFreePlan ? dbFreePlan.price.toLocaleString('id-ID') : "0"}</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm h-10">{dbFreePlan?.desc || (lang === 'id' ? 'Cocok untuk mencoba fitur dasar Hubify.' : 'Perfect for trying out basic Hubify features.')}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {generateBulletPoints(dbFreePlan || { limits: freeLimits, capabilities: freeCaps }, lang).map((f, i) => (
                  <li key={i} className="flex gap-3 text-slate-600 text-sm font-medium items-start">
                    <Check size={18} className="text-slate-400 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/login', { state: { mode: 'signup' } })} className="w-full py-3 rounded-xl font-bold bg-[#FAFAFA] text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors mt-auto">
                {lang === 'id' ? 'Mulai Gratis' : 'Start for Free'}
              </button>
            </div>

            {/* Dynamic Plans from DB */}
            {plans.filter(p => (isAnnual ? p.addMonths >= 12 : p.addMonths < 12) && !p.id.startsWith('free')).sort((a,b) => a.price - b.price).map(plan => {
              const isPopular = plan.popular;
              
              // Find matching monthly plan to show original monthly price when annual is selected
              const baseSlug = plan.id.replace('-monthly', '').replace('-annual', '');
              const monthlyPlan = plans.find(p => p.id === `${baseSlug}-monthly`);
              const priceMonthly = monthlyPlan ? monthlyPlan.price : plan.price;
              
              const annualOriginalTotal = plan.originalPrice > 0 ? plan.originalPrice : (priceMonthly * 12);
              const annualSavingsTotal = annualOriginalTotal - plan.price;
              
              // Calculate equivalent values to show a clean layout
              const mainPrice = isAnnual ? Math.round(plan.price / 12) : plan.price;
              
              let mainOriginalPrice = 0;
              if (isAnnual) {
                if (plan.originalPrice > 0) {
                  mainOriginalPrice = Math.round(plan.originalPrice / 12);
                } else if (priceMonthly > 0 && priceMonthly > mainPrice) {
                  mainOriginalPrice = priceMonthly;
                }
              } else {
                if (plan.originalPrice > plan.price) {
                  mainOriginalPrice = plan.originalPrice;
                }
              }
              
              const hasDiscount = mainOriginalPrice > mainPrice;
              const discountPercent = hasDiscount ? Math.round(((mainOriginalPrice - mainPrice) / mainOriginalPrice) * 100) : 0;

              return (
                <div key={plan.id} className={`${isPopular ? 'bg-[#0B2A4A] shadow-2xl border-blue-900' : 'bg-white shadow-md border-slate-200 hover:shadow-xl'} rounded-3xl p-6 border transition-shadow flex flex-col h-full relative`}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                      {lang === 'id' ? 'Paling Populer' : 'Most Popular'}
                    </div>
                  )}
                  <div className="mb-6 mt-2">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className={`text-lg font-bold ${isPopular ? 'text-white' : 'text-[#0B2A4A]'}`}>{plan.name.replace(/ \((Monthly|Annual)\)/i, '')}</div>
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                      {hasDiscount && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-semibold line-through ${isPopular ? 'text-blue-300/60 decoration-blue-300/40' : 'text-slate-400 decoration-slate-300'}`}>
                            Rp {mainOriginalPrice.toLocaleString('id-ID')}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isPopular ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                            {lang === 'id' ? 'Hemat' : 'Save'} {discountPercent}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-end gap-1">
                        <span className={`text-xl xs:text-2xl sm:text-3xl md:text-2xl lg:text-lg xl:text-2xl font-extrabold tracking-tight shrink-0 ${isPopular ? 'text-white' : 'text-[#0B2A4A]'}`}>
                          Rp {mainPrice.toLocaleString('id-ID')}
                        </span>
                        <span className={`${isPopular ? 'text-blue-200' : 'text-slate-500'} pb-1 font-semibold text-xs shrink-0`}>
                          / {lang === 'id' ? 'bln' : 'mo'}
                        </span>
                      </div>
                      {isAnnual && annualSavingsTotal > 0 && (
                        <div className={`text-xs font-semibold mt-1 ${isPopular ? 'text-emerald-300' : 'text-emerald-600'}`}>
                          {lang === 'id' ? `Hemat Rp ${annualSavingsTotal.toLocaleString('id-ID')}/tahun` : `Save Rp ${annualSavingsTotal.toLocaleString('id-ID')}/year`}
                        </div>
                      )}
                    </div>
                    <p className={`${isPopular ? 'text-blue-200' : 'text-slate-500'} text-sm h-10`}>
                      {plan.desc}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {generateBulletPoints(plan, lang).map((f, i) => (
                      <li key={i} className={`flex gap-3 ${isPopular ? 'text-white' : 'text-slate-700'} text-sm font-medium items-start`}>
                        <Check size={18} className={`${isPopular ? 'text-blue-400' : 'text-blue-500'} shrink-0 mt-0.5`} /> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col mt-auto w-full">
                    {plan.trialEnabled ? (
                      <button 
                        onClick={() => navigate(`/checkout-preview?plan=${plan.id}&cycle=${isAnnual ? 'annual' : 'monthly'}&trial=true`)} 
                        className={`w-full py-3 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
                          isPopular 
                            ? "bg-white text-[#0B2A4A] hover:bg-slate-100 shadow-md" 
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        }`}
                      >
                        {lang === 'id' ? `Mulai Trial ${plan.trialDays} Hari` : `Start ${plan.trialDays}-Day Trial`}
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate(`/checkout-preview?plan=${plan.id}&cycle=${isAnnual ? 'annual' : 'monthly'}`)} 
                        className={`w-full py-3 rounded-xl font-bold transition-colors mt-auto ${isPopular ? 'bg-white text-[#0B2A4A] hover:bg-slate-100 shadow-lg' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                      >
                        {lang === 'id' ? `Pilih ${plan.name.split(' ')[0]}` : `Choose ${plan.name.split(' ')[0]}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison */}
          <div className="max-w-6xl mx-auto mb-24">
            <h3 className="text-2xl font-bold text-center text-[#0B2A4A] mb-8">{lang === 'id' ? 'Perbandingan Fitur Lengkap' : 'Detailed Feature Comparison'}</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto lg:overflow-x-visible">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-[76px] z-20 shadow-sm">
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="py-4 px-6 font-bold text-slate-700 w-1/3 bg-slate-100">{lang === 'id' ? 'Fitur' : 'Feature'}</th>
                    <th className="py-4 px-4 font-bold text-slate-700 text-center bg-slate-100">Free</th>
                    {activePlans.map(plan => (
                      <th key={plan.id} className={`py-4 px-4 font-bold text-center ${plan.popular ? 'text-blue-700 bg-blue-50' : 'text-[#0B2A4A] bg-slate-100'}`}>
                        {plan.name.replace(/ \((Monthly|Annual)\)/i, '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {getCompareRows(lang, freeLimits, freeCaps).map((row, i, arr) => {
                    const prevRow = i > 0 ? arr[i - 1] : null;
                    const showCategoryHeader = !prevRow || prevRow.category !== row.category;
                    const valFree = row.free;

                    return (
                      <React.Fragment key={i}>
                        {showCategoryHeader && (
                          <tr className="bg-slate-50/90 border-t border-b border-slate-200">
                            <td colSpan={2 + activePlans.length} className="py-2.5 px-6 font-extrabold text-xs text-[#0B2A4A] uppercase tracking-wider">
                              {row.category}
                            </td>
                          </tr>
                        )}
                        <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-6 font-medium text-slate-700">{row.id}</td>
                          
                          <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                            {typeof valFree === 'boolean' ? (valFree ? <Check size={18} className="text-slate-500 mx-auto" /> : <span className="text-slate-300">-</span>) : valFree}
                          </td>
                          
                          {activePlans.map(plan => {
                            const val = row.getVal(plan);
                            return (
                              <td key={plan.id} className={`py-3.5 px-4 text-center ${plan.popular ? 'text-blue-900 bg-blue-50/20 font-semibold' : 'text-slate-700 font-medium'}`}>
                                {typeof val === 'boolean' ? (val ? <Check size={18} className={`${plan.popular ? 'text-blue-600' : 'text-blue-500'} mx-auto`} /> : <span className="text-slate-300">-</span>) : val}
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-[#0B2A4A] mb-8">{lang === 'id' ? 'Pertanyaan Seputar Harga' : 'Pricing FAQs'}</h3>
            <div className="space-y-4">
              {getFaqs(lang).map((faq, idx) => (
                <div key={idx}>
                  <FAQItem faq={faq} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <PublicFooter currentLang={lang} onLangChange={handleLangChange} />
    </div>
  );
}
