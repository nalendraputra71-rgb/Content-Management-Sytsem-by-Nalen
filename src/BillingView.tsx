import React, { useState, useEffect } from "react";
import { doc, updateDoc, collection, getDocs, setDoc, increment, query, where, auth, signOut, getDoc } from "./firebase";
import { db } from "./firebase";
import { CARD, B, I } from "./data";
import { motion, AnimatePresence } from "motion/react";
import { getAuth } from "firebase/auth";
import { useSearchParams } from "react-router-dom";
import { Check, ArrowLeft, Zap, Ticket, X, CheckCircle, AlertTriangle, HelpCircle, LogOut } from "lucide-react";
import { generateBulletPoints, getCompareRows } from './PricingPage';
import { useI18n } from "./i18n";

export function BillingView({ userProfile, onUpdate }: { userProfile: any, activeWorkspace?: any, onUpdate: (data: any) => void }) {
  const { lang } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const [modal, setModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [promos, setPromos] = useState<any[]>([]);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [voucherError, setVoucherError] = useState("");

  useEffect(() => {
    document.title = lang === 'id' ? 'Billing & Upgrade - Hubify Social' : 'Billing & Upgrade - Hubify Social';
  }, [lang]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>(null);

  useEffect(() => {
    if (paymentStatus === "success") {
      setShowSuccessModal(true);
      const newParams = new URLSearchParams(window.location.search);
      newParams.delete("payment");
      setSearchParams(newParams, { replace: true });
    } else if (paymentStatus === "failure") {
      setShowFailureModal(true);
      const newParams = new URLSearchParams(window.location.search);
      newParams.delete("payment");
      setSearchParams(newParams, { replace: true });
    }
  }, [paymentStatus, setSearchParams]);

  useEffect(() => {
    const loadPromos = async () => {
      try {
        const promosSnap = await getDocs(collection(db, "promos"));
        setPromos(promosSnap.docs.map(d => ({ ...d.data(), id: d.id })));
      } catch (error) {
        console.error("Error loading promos:", error);
      }
    };
    const loadPlans = async () => {
      try {
        const snap = await getDocs(collection(db, "plans"));
        if (!snap.empty) {
          setDbPlans(snap.docs.map(d => ({ ...d.data(), id: d.id })));
        }
      } catch (error) {
        console.warn("Failed to load plans in BillingView:", error);
      }
    };
    const loadSystemConfig = async () => {
      try {
        const snap = await getDoc(doc(db, "config", "system"));
        if (snap.exists()) {
          setSystemConfig(snap.data());
        }
      } catch (error) {
        console.warn("Failed to load system config in BillingView:", error);
      }
    };
    loadPromos();
    loadPlans();
    loadSystemConfig();
  }, []);

  const getPlanPrice = (planSlug: string, isAnn: boolean, defaultPrice: number) => {
    const matched = dbPlans.find(p => {
      const nameLower = (p.name || '').toLowerCase();
      const matchesSlug = nameLower.includes(planSlug);
      const isAnnualPlan = isAnn ? p.addMonths >= 12 : p.addMonths < 12;
      return matchesSlug && isAnnualPlan;
    });
    return matched ? matched.price : defaultPrice;
  };

  const maxAnnualDiscount = (() => {
    let maxDisc = 0;
    const annualPlans = dbPlans.filter(p => p.addMonths >= 12 && !p.id.startsWith('free'));
    for (const plan of annualPlans) {
      const baseSlug = plan.id.replace('-monthly', '').replace('-annual', '');
      const monthlyPlan = dbPlans.find(mp => mp.id === `${baseSlug}-monthly`);
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
  })();

  const dbFreePlan = dbPlans.find(p => p.id === (isAnnual ? 'free-annual' : 'free-monthly'));
  const freePlan = {
    id: "free",
    name: dbFreePlan ? dbFreePlan.name.replace(/ \((Monthly|Annual)\)/i, '') : "Free Starter",
    desc: dbFreePlan?.desc || "Cocok untuk mencoba fitur dasar Hubify.",
    features: generateBulletPoints(dbFreePlan || { limits: { workspaces: 1, socialAccounts: 3, aiCreditsPerMonth: 100000 }, capabilities: { analyticsLevel: 'basic', autoPublishing: false } }, 'id'),
    priceMonthly: dbFreePlan?.price || 0,
    priceAnnual: dbFreePlan?.price || 0,
    priceAnnualTotal: dbFreePlan?.price || 0,
    popular: dbFreePlan?.popular || false,
    originalPrice: dbFreePlan?.originalPrice || 0,
    trialEnabled: false,
    trialDays: 0
  };

  const dynamicPlans = dbPlans.filter(p => (isAnnual ? p.addMonths >= 12 : p.addMonths < 12) && !p.id.startsWith('free')).sort((a,b) => a.price - b.price).map(p => {
    const baseSlug = p.id.replace('-monthly', '').replace('-annual', '');
    const monthlyPlanDoc = dbPlans.find(item => item.id === `${baseSlug}-monthly`);
    const annualPlanDoc = dbPlans.find(item => item.id === `${baseSlug}-annual`);
    
    const priceMonthly = monthlyPlanDoc ? monthlyPlanDoc.price : p.price;
    const priceAnnualTotal = annualPlanDoc ? annualPlanDoc.price : p.price;

    return {
      id: p.id,
      name: p.name.replace(/ \(.*\)/i, ''),
      desc: p.desc,
      features: generateBulletPoints(p, 'id'),
      priceMonthly,
      priceAnnual: Math.round(priceAnnualTotal / 12),
      priceAnnualTotal,
      popular: p.popular,
      originalPrice: p.originalPrice || 0,
      limits: p.limits,
      capabilities: p.capabilities,
      trialEnabled: p.trialEnabled || false,
      trialDays: p.trialDays || 0
    };
  });

  const resolvedPlans = [freePlan, ...dynamicPlans];

  const handleApplyVoucher = async (code: string) => {
    const promo = promos.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
    if (!promo) {
      setVoucherError("Kode voucher tidak valid atau sudah tidak aktif.");
      return;
    }

    const now = new Date();
    if (promo.startDate && new Date(promo.startDate) > now) {
      setVoucherError("Voucher ini belum masuk masa berlaku.");
      return;
    }
    if (promo.endDate && new Date(promo.endDate) < now) {
      setVoucherError("Voucher ini sudah kadaluarsa.");
      return;
    }

    if (promo.usageLimit > 0 && (promo.usageCount || 0) >= promo.usageLimit) {
      setVoucherError("Voucher ini sudah mencapai batas pemakaian.");
      return;
    }

    if (promo.targetType === "first_timer") {
      const auth = getAuth();
      if (auth.currentUser) {
         const transSnap = await getDocs(query(collection(db, 'transactions'), where('userId', '==', auth.currentUser.uid)));
         const hasPurchased = transSnap.docs.some(d => d.data().status === 'PAID');
         if (hasPurchased) {
            setVoucherError("Voucher ini hanya berlaku untuk pengguna yang pertama kali melakukan perpanjangan.");
            return;
         }
      }
    }

    setAppliedVoucher(promo);
    setVoucherCodeInput("");
    setVoucherError("");
    setShowVoucherList(false);
  };

  const calculateFinalPrice = (price: number) => {
    if (!appliedVoucher) return price;
    if (appliedVoucher.type === "percent") {
      return price - (price * (appliedVoucher.value / 100));
    } else {
      return Math.max(0, price - appliedVoucher.value);
    }
  };

  const handleSelectPlan = (plan: any) => {
    const isPlanAnnual = isAnnual;
    const computedPrice = isPlanAnnual ? (plan.priceAnnualTotal || plan.priceAnnual * 12) : plan.priceMonthly;
    
    let computedOriginalPrice = plan.originalPrice;
    if (isPlanAnnual) {
      if (!computedOriginalPrice || computedOriginalPrice === 0) {
        if (plan.priceMonthly * 12 > computedPrice) {
          computedOriginalPrice = plan.priceMonthly * 12;
        }
      }
    }

    const selectedPlan = {
      ...plan,
      price: computedPrice,
      originalPrice: computedOriginalPrice,
      addMonths: isPlanAnnual ? 12 : 1,
      displayName: plan.name + (isPlanAnnual ? " (Tahunan)" : " (Bulanan)")
    };
    setModal(selectedPlan);
    setVoucherError("");
  };

  const handleStartTrial = async (plan: any) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert(lang === "id" ? "Anda harus login terlebih dahulu." : "You must log in first.");
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const trialDurationDays = plan.trialDays || 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + trialDurationDays);

      const existingUsedPlans = userProfile?.usedTrialPlans || [];
      const updatedUsedPlans = existingUsedPlans.includes(plan.id) 
        ? existingUsedPlans 
        : [...existingUsedPlans, plan.id];

      const trialData = {
        plan: 'trial',
        trialPlanId: plan.id,
        activeUntil: expiryDate.toISOString(),
        subscriptionStatus: 'pro',
        trialStartedAt: new Date().toISOString(),
        hasUsedTrial: true,
        usedTrialPlans: updatedUsedPlans
      };

      await updateDoc(userRef, trialData);

      await setDoc(doc(collection(db, "transactions")), {
        userId: currentUser.uid,
        userEmail: userProfile?.email || currentUser.email || 'unknown',
        amount: 0,
        planName: `${plan.name} (Trial Gratis)`,
        paymentMethod: 'Free Trial',
        status: 'PAID',
        externalId: `trial_${plan.id}_${currentUser.uid}_${Date.now()}`,
        timestamp: new Date().toISOString()
      });

      if (onUpdate) {
        onUpdate(trialData);
      }

      alert(lang === "id" 
        ? `Selamat! Anda berhasil mengaktifkan uji coba gratis ${plan.name} selama ${trialDurationDays} hari.` 
        : `Success! You have activated a free trial for ${plan.name} for ${trialDurationDays} days.`
      );
      window.location.reload();
    } catch (e: any) {
      alert("Gagal mengaktifkan uji coba gratis: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      const finalPrice = calculateFinalPrice(modal.price);
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Anda belum login");
      
      if (finalPrice === 0) {
        // Direct activation for free promo
        const userRef = doc(db, 'users', currentUser.uid);
        let newActiveUntil = new Date();
        if (userProfile?.activeUntil) {
          const currentExpiry = new Date(userProfile.activeUntil);
          if (currentExpiry > newActiveUntil) {
            newActiveUntil = currentExpiry;
          }
        }
        newActiveUntil.setMonth(newActiveUntil.getMonth() + (modal.addMonths || 1));
        
        await updateDoc(userRef, {
          activeUntil: newActiveUntil.toISOString(),
          plan: modal.id,
          subscriptionStatus: 'pro',
          lastInvoiceId: `promo_free_${currentUser.uid}_${Date.now()}`,
          hasUsedPromo: true
        });

        if (appliedVoucher) {
          await updateDoc(doc(db, "promos", appliedVoucher.id), {
            usageCount: increment(1)
          });
        }

        await setDoc(doc(collection(db, "transactions")), {
          userId: currentUser.uid,
          userEmail: userProfile?.email || currentUser.email || 'unknown',
          amount: 0,
          planName: modal.id,
          paymentMethod: appliedVoucher ? `Voucher: ${appliedVoucher.id}` : 'Free',
          status: 'PAID',
          externalId: `promo_free_${currentUser.uid}_${Date.now()}`,
          timestamp: new Date().toISOString()
        });
        
        setModal(null);
        setAppliedVoucher(null);
        setShowSuccessModal(true);
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch('/api/xendit/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim().replace(/[\r\n\s]+/g, '')}`
        },
        body: JSON.stringify({
          amount: finalPrice,
          plan: modal.name,
          planId: modal.id,
          addMonths: modal.addMonths || 1,
          promoId: appliedVoucher ? appliedVoucher.id : "none",
          email: userProfile.email,
          description: `Pembelian Paket ${modal.name} di Hubify Social`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
         throw new Error(data.error || "Gagal membuat invoice");
      }

      if (data.checkoutUrl) {
         window.location.href = data.checkoutUrl;
      } else {
         throw new Error("Checkout URL tidak ditemukan dari Xendit");
      }

    } catch(e: any) {
      alert("Error memproses pembayaran: " + e.message);
      setLoading(false);
    }
  };

  const profileActiveUntil = new Date(userProfile.activeUntil || 0);
  const isRestricted = new Date() > profileActiveUntil;
  const sisaHari = Math.ceil((profileActiveUntil.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className="min-h-screen py-10 px-4 md:px-10 bg-slate-50 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button & Logout */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => window.location.href = "/?tab=settings"} 
            className="flex items-center gap-2 text-slate-500 hover:text-[#0B2A4A] transition-colors font-semibold text-sm focus:outline-none cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali ke Pengaturan Profil
          </button>
          <button
            onClick={async () => {
              try {
                await signOut(auth);
                window.location.href = "/login";
                window.location.reload();
              } catch(e) {
                console.error("Logout error:", e);
              }
            }}
            className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 transition-all bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            <LogOut size={14} />
            {lang === "id" ? "Keluar" : "Logout"}
          </button>
        </div>

        {/* Header Block */}
        <div className="text-center mb-10">
           <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B2A4A] tracking-tight mb-3">Langganan & Penagihan</h1>
           <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
             Pilih paket yang sesuai untuk merancang konten dengan maksimal. <br/>Dapatkan diskon eksklusif dengan menggunakan voucher promo.
           </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`font-medium text-sm md:text-base ${!isAnnual ? 'text-[#0B2A4A] font-bold' : 'text-slate-400'}`}>
            Bulanan
          </span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className={`w-14 h-7 rounded-full relative transition-colors focus:outline-none ${isAnnual ? 'bg-blue-600' : 'bg-[#0B2A4A]'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${isAnnual ? 'left-8' : 'left-1'}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm md:text-base ${isAnnual ? 'text-[#0B2A4A] font-bold' : 'text-slate-400'}`}>
              Tahunan
            </span>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              Hemat s/d {maxAnnualDiscount}%
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-12">
          {resolvedPlans.map(p => {
            const isFree = p.id === "free";
            const currentPlanActive = userProfile.plan === p.id || (p.id === "free" && userProfile.plan === "trial");
            
            const currentPrice = isFree ? 0 : (isAnnual ? (p.priceAnnualTotal || p.priceAnnual * 12) : p.priceMonthly);
            const currentOriginalPrice = isFree ? 0 : (isAnnual ? (p.originalPrice > 0 ? p.originalPrice : (p.priceMonthly * 12)) : p.originalPrice);
            
            const annualOriginalTotal = isFree ? 0 : (p.originalPrice > 0 ? p.originalPrice : (p.priceMonthly * 12));
            const annualPriceTotal = isFree ? 0 : (p.priceAnnualTotal || p.priceAnnual * 12);
            const annualSavingsTotal = annualOriginalTotal - annualPriceTotal;
            
            // Normalize to show clean monthly-equivalent rates
            const mainPrice = isFree ? 0 : (isAnnual ? Math.round(currentPrice / 12) : currentPrice);
            const mainOriginalPrice = isFree ? 0 : (isAnnual ? Math.round(currentOriginalPrice / 12) : currentOriginalPrice);
            const hasDiscount = !isFree && mainOriginalPrice > mainPrice;
            const discountPercent = hasDiscount ? Math.round(((mainOriginalPrice - mainPrice) / mainOriginalPrice) * 100) : 0;

            return (
              <div 
                key={p.id} 
                className={`rounded-3xl p-6 flex flex-col h-full relative transition-all duration-200 ${
                  p.popular 
                    ? "bg-[#0B2A4A] text-white shadow-xl border border-blue-900" 
                    : "bg-white text-slate-800 shadow-sm border border-slate-200 hover:shadow-md"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                    Paling Populer
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className={`text-lg font-bold ${p.popular ? "text-white" : "text-slate-700"}`}>{p.name}</div>
                  </div>
                  <div className="flex flex-col gap-1 mb-2">
                    {hasDiscount && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-semibold line-through decoration-slate-300 ${p.popular ? "text-blue-300/60" : "text-slate-400"}`}>
                          Rp {mainOriginalPrice.toLocaleString("id-ID")}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${p.popular ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                          Hemat {discountPercent}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-end gap-1">
                      <span className={`text-xl xs:text-2xl md:text-3xl lg:text-lg xl:text-2xl font-extrabold tracking-tight shrink-0 ${p.popular ? "text-white" : "text-[#0B2A4A]"}`}>
                        Rp {isFree ? "0" : mainPrice.toLocaleString("id-ID")}
                      </span>
                      {!isFree && (
                        <span className={`pb-1 font-semibold text-xs shrink-0 ${p.popular ? "text-blue-200" : "text-slate-500"}`}>
                          / bln
                        </span>
                      )}
                    </div>
                    {!isFree && isAnnual && annualSavingsTotal > 0 && (
                      <div className={`text-xs font-semibold mt-1 ${p.popular ? "text-emerald-300" : "text-emerald-600"}`}>
                        Hemat Rp {annualSavingsTotal.toLocaleString("id-ID")}/tahun
                      </div>
                    )}
                  </div>
                  <p className={`text-xs md:text-sm h-10 leading-normal ${p.popular ? "text-blue-200" : "text-slate-500"}`}>{p.desc}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-xs md:text-sm font-medium items-start">
                      <Check size={16} className={`shrink-0 mt-0.5 ${p.popular ? "text-blue-400" : "text-blue-500"}`} /> 
                      <span className={p.popular ? "text-white" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                {isFree ? (
                  <button 
                    disabled 
                    className="w-full py-3 rounded-xl font-bold text-center text-xs bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed mt-auto"
                  >
                    {currentPlanActive ? "Paket Saat Ini" : "Bawaan Akun"}
                  </button>
                ) : (
                  <div className="flex flex-col mt-auto w-full">
                    {(() => {
                      const hasUsedThisTrial = systemConfig?.trialLimitMode === "per_plan"
                        ? (userProfile?.usedTrialPlans || []).includes(p.id)
                        : !!userProfile?.hasUsedTrial;
                      return p.trialEnabled && !hasUsedThisTrial;
                    })() ? (
                      <button 
                        onClick={() => handleStartTrial(p)} 
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
                          p.popular 
                            ? "bg-white text-[#0B2A4A] hover:bg-slate-100 shadow-md" 
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        }`}
                      >
                        {loading ? "Memproses..." : `Mulai Trial ${p.trialDays} Hari`}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleSelectPlan(p)} 
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 ${
                          p.popular 
                            ? "bg-white text-[#0B2A4A] hover:bg-slate-100 shadow-md" 
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        {currentPlanActive ? "Perpanjang Paket" : "Pilih Paket"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Account Status Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status Akun Anda</div>
            <div className={`text-2xl font-extrabold ${isRestricted ? "text-red-600" : userProfile.plan === "trial" ? "text-blue-600" : "text-emerald-600"}`}>
              {isRestricted ? "Mode Terbatas (Restricted)" : userProfile.plan === "trial" ? "Masa Uji Coba (Free Trial)" : "Akun Pro Aktif"}
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isRestricted 
                ? "Masa aktif Anda telah berakhir. Perpanjang akses untuk menambah/edit konten." 
                : userProfile.plan === "trial" 
                ? `Akses penuh tersisa ${sisaHari} hari lagi.` 
                : `Akses Pro aktif hingga ${profileActiveUntil.toLocaleDateString("id-ID", {dateStyle: "long"})}.`}
            </p>
          </div>
          
          <button 
            onClick={() => setShowVoucherList(true)} 
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm transition-all hover:bg-blue-100 whitespace-nowrap"
          >
            <Ticket size={16} /> Lihat Voucher Aktif
          </button>
        </div>

        {/* Feature Comparison */}
        <div className="max-w-6xl mx-auto mb-20">
          <h3 className="text-2xl font-bold text-center text-[#0B2A4A] mb-8">Perbandingan Fitur Lengkap</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-x-auto lg:overflow-x-visible">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-20 shadow-sm">
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="py-4 px-6 font-bold text-slate-700 w-1/3 bg-slate-100">Fitur</th>
                  <th className="py-4 px-4 font-bold text-slate-700 text-center bg-slate-100">Free</th>
                  {dynamicPlans.map(plan => (
                    <th key={plan.id} className={`py-4 px-4 font-bold text-center ${plan.popular ? 'text-blue-700 bg-blue-50' : 'text-[#0B2A4A] bg-slate-100'}`}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                
                {(() => {
                  const dbFreePlan = dbPlans.find(p => p.id === (isAnnual ? 'free-annual' : 'free-monthly'));
                  const freeLimits = dbFreePlan?.limits || { workspaces: 1, socialAccounts: 1, teamMembers: 0, aiCreditsPerMonth: 10, storageMB: 150 };
                  const freeCaps = dbFreePlan?.capabilities || { 
                      publicLink: true, customColumn: false, organicPaid: true, csvImportExport: false, autoPublishing: false, 
                      platformAnalytics: false, heatmaps: false, aiSummary: false, topBadAnalysis: false, demographics: false, pdfExport: false,
                      aiAutoSave: false, aiModelText: "3.1 Flash", aiUsageText: "Terbatas", historyDays: 0, sharedBriefs: 20
                  };
                  return getCompareRows(lang, freeLimits, freeCaps);
                })().map((row, i, arr) => {
                  const prevRow = i > 0 ? arr[i - 1] : null;
                  const showCategoryHeader = !prevRow || prevRow.category !== row.category;
                  const valFree = row.free;

                  return (
                    <React.Fragment key={i}>
                      {showCategoryHeader && (
                        <tr className="bg-slate-50/90 border-t border-b border-slate-200">
                          <td colSpan={2 + dynamicPlans.length} className="py-2.5 px-6 font-extrabold text-xs text-[#0B2A4A] uppercase tracking-wider">
                            {row.category}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6 font-medium text-slate-700">{row.id}</td>
                        <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                          {typeof valFree === 'boolean' ? (valFree ? <Check size={18} className="text-slate-500 mx-auto" /> : <span className="text-slate-300">-</span>) : valFree}
                        </td>
                        {dynamicPlans.map(plan => {
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

      </div>

      <AnimatePresence>
        {/* Payment Checkout Modal */}
        {modal && (
          <motion.div 
            initial={{opacity:0}} 
            animate={{opacity:1}} 
            exit={{opacity:0}} 
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
             <motion.div 
               initial={{scale:0.95, y:20}} 
               animate={{scale:1, y:0}} 
               exit={{scale:0.95, y:20}} 
               className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
             >
               <button 
                 onClick={() => {setModal(null); setAppliedVoucher(null);}}
                 className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
               >
                 <X size={20} />
               </button>

               <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                 🛒
               </div>
               
               <h3 className="text-xl font-extrabold text-[#0B2A4A] text-center mb-1">Checkout Pembayaran</h3>
               <p className="text-sm text-slate-500 text-center mb-6">
                 Anda akan berlangganan paket <strong className="text-blue-600 font-bold">{modal.displayName || modal.name}</strong>.
               </p>
               
               {/* Voucher Promo Section */}
               <div className="mb-6 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mempunyai Kode Voucher?</label>
                    <button 
                      onClick={() => setShowVoucherList(true)} 
                      className="text-xs font-bold text-blue-600 hover:underline focus:outline-none"
                    >
                      Lihat Voucher Aktif
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      placeholder="Masukkan kode promo..." 
                      value={voucherCodeInput}
                      onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                    />
                    <button 
                      onClick={() => handleApplyVoucher(voucherCodeInput)} 
                      className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors hover:bg-slate-800"
                    >
                      Terapkan
                    </button>
                  </div>
                  {voucherError && <div className="text-xs text-red-600 font-semibold mt-2">* {voucherError}</div>}
               </div>

               {/* Pricing Summary */}
               <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left mb-6 space-y-3">
                 {modal.originalPrice > modal.price ? (
                   <>
                     <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Harga Awal</span> 
                       <span className="font-semibold text-slate-400 line-through">Rp {modal.originalPrice.toLocaleString("id-ID")}</span>
                     </div>
                     <div className="flex justify-between text-sm text-emerald-600">
                       <span className="font-medium">Potongan Paket</span> 
                       <span className="font-bold">- Rp {(modal.originalPrice - modal.price).toLocaleString("id-ID")}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Harga Paket</span> 
                       <span className="font-semibold text-slate-800">Rp {modal.price.toLocaleString("id-ID")}</span>
                     </div>
                   </>
                 ) : (
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500 font-medium">Harga Normal</span> 
                     <span className="font-semibold text-slate-800">Rp {modal.price.toLocaleString("id-ID")}</span>
                   </div>
                 )}
                 
                 {appliedVoucher && (
                   <div className="flex justify-between mb-3 text-sm text-emerald-600">
                     <span className="font-medium">Potongan Promo ({appliedVoucher.code})</span> 
                     <span className="font-extrabold">- Rp {(modal.price - calculateFinalPrice(modal.price)).toLocaleString("id-ID")}</span>
                   </div>
                 )}

                 <div className="border-t border-dashed border-slate-200 pt-3"/>
                 
                 <div className="flex justify-between items-center text-base font-extrabold text-slate-800">
                   <span>Total Bayar</span> 
                   <span className="text-xl text-[#0B2A4A]">Rp {calculateFinalPrice(modal.price).toLocaleString("id-ID")}</span>
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="flex gap-4">
                 <button 
                   onClick={()=>{setModal(null); setAppliedVoucher(null);}} 
                   className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors text-sm"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={handleSimulatePayment} 
                   disabled={loading} 
                   className="flex-1 bg-[#0B2A4A] hover:bg-blue-950 text-white font-bold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-70 disabled:cursor-wait"
                 >
                   {loading ? "Memproses..." : "Bayar Sekarang"}
                 </button>
               </div>
               
               {/* Applied Voucher Pill */}
               {appliedVoucher && (
                 <div className="mt-5 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-3">
                   <span className="text-lg">🎉</span>
                   <div className="text-left">
                     <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Voucher Berhasil Dipasang</div>
                     <div className="text-xs font-semibold text-slate-600">
                       {appliedVoucher.code} - Anda menghemat {appliedVoucher.type === 'percent' ? `${appliedVoucher.value}%` : fmt(appliedVoucher.value)}
                     </div>
                   </div>
                   <button 
                     onClick={()=>setAppliedVoucher(null)} 
                     className="ml-auto text-slate-400 hover:text-slate-600 font-bold text-lg"
                   >
                     ×
                   </button>
                 </div>
               )}
             </motion.div>
          </motion.div>
        )}

        {/* Voucher List Drawer/Modal */}
        {showVoucherList && (
          <motion.div 
            initial={{opacity:0}} 
            animate={{opacity:1}} 
            exit={{opacity:0}} 
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{scale:0.95, y:20}} 
              animate={{scale:1, y:0}} 
              exit={{scale:0.95, y:20}} 
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative max-h-[80vh] overflow-y-auto"
            >
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Voucher Tersedia</h3>
                  <button 
                    onClick={()=>setShowVoucherList(false)} 
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
               </div>
               
               <div className="flex flex-col gap-4">
                 {promos.filter(p => p.isActive).map(p => {
                    const now = new Date();
                    const isRestrictedForUser = p.targetType === 'first_timer' && (userProfile.hasUsedPromo || (userProfile.plan && userProfile.plan !== "free"));
                    const isLimitReached = p.usageLimit > 0 && (p.usageCount || 0) >= p.usageLimit;
                    const isNotStarted = p.startDate && new Date(p.startDate) > now;
                    const isExpired = p.endDate && new Date(p.endDate) < now;
                    const isDisabled = isRestrictedForUser || isLimitReached || isNotStarted || isExpired;

                    return (
                      <div 
                        key={p.id} 
                        className={`p-4 border-2 border-dashed rounded-2xl relative transition-colors ${
                          isDisabled 
                            ? "border-slate-200 bg-slate-50/50 opacity-60" 
                            : "border-blue-100 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div>
                            <div className="text-sm font-extrabold text-slate-800 tracking-wider uppercase">{p.code}</div>
                            <div className="text-xs font-bold text-blue-600 mt-0.5">
                              Diskon {p.type === 'percent' ? `${p.value}%` : `Rp ${p.value.toLocaleString()}`}
                            </div>
                          </div>
                          <button 
                            disabled={isDisabled}
                            onClick={() => {
                              handleApplyVoucher(p.code);
                              setShowVoucherList(false);
                            }} 
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isDisabled 
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isDisabled ? "Tidak Aktif" : "Gunakan"}
                          </button>
                        </div>
                        
                        {p.terms && (
                          <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-50 pt-2.5 mb-2">
                            <span className="font-bold text-slate-500 block mb-0.5">S&K:</span>
                            {p.terms}
                          </div>
                        )}

                        <div className="text-[9px] text-slate-400 font-semibold flex flex-wrap gap-x-2">
                           {p.startDate && <span>📅 Mulai: {p.startDate}</span>} 
                           {p.endDate && <span>🏁 Berakhir: {p.endDate}</span>}
                        </div>
                        
                        {isRestrictedForUser && <div className="text-[10px] text-red-600 font-bold mt-2">* Hanya untuk pembelian pertama.</div>}
                        {isLimitReached && <div className="text-[10px] text-red-600 font-bold mt-2">* Batas pemakaian voucher telah habis.</div>}
                        {isNotStarted && <div className="text-[10px] text-red-600 font-bold mt-2">* Voucher belum masa berlaku.</div>}
                        {isExpired && <div className="text-[10px] text-red-600 font-bold mt-2">* Voucher telah kadaluarsa.</div>}
                      </div>
                    )
                 })}
                 {promos.filter(p => p.isActive).length === 0 && (
                   <div className="py-8 text-center text-slate-400 font-medium text-sm">Belum ada voucher promo saat ini.</div>
                 )}
               </div>
            </motion.div>
          </motion.div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <motion.div 
            initial={{opacity:0}} 
            animate={{opacity:1}} 
            exit={{opacity:0}} 
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{scale:0.95, y:20}} 
              animate={{scale:1, y:0}} 
              exit={{scale:0.95, y:20}} 
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100"
            >
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <img 
                  src="/Assets/Huby/huby-dab.png" 
                  alt="Success Huby" 
                  className="w-full h-full object-contain drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-xl font-extrabold text-[#0B2A4A] mb-2">
                {lang === 'id' ? 'Pembayaran Berhasil!' : 'Payment Successful!'}
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {lang === 'id' 
                  ? 'Terima kasih telah berlangganan! Akun Anda telah berhasil diperpanjang/ditingkatkan ke paket premium. Sistem kami sedang menyinkronkan status akun Anda secara real-time.'
                  : 'Thank you for subscribing! Your account has been successfully renewed/upgraded to a premium plan. Our system is syncing your account status in real-time.'}
              </p>
              <button 
                onClick={()=>setShowSuccessModal(false)} 
                className="w-full bg-[#0B2A4A] hover:bg-blue-950 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                {lang === 'id' ? 'Mulai Eksplorasi' : 'Start Exploring'}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Failure Modal */}
        {showFailureModal && (
          <motion.div 
            initial={{opacity:0}} 
            animate={{opacity:1}} 
            exit={{opacity:0}} 
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{scale:0.95, y:20}} 
              animate={{scale:1, y:0}} 
              exit={{scale:0.95, y:20}} 
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100"
            >
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <img 
                  src="/Assets/Huby/huby-sad.png" 
                  alt="Failure Huby" 
                  className="w-full h-full object-contain drop-shadow-xl"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">❌</div>';
                  }}
                />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                {lang === 'id' ? 'Pembayaran Gagal' : 'Payment Failed'}
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {lang === 'id' 
                  ? 'Maaf, terjadi kendala saat memproses transaksi pembayaran Anda dengan Xendit. Silakan periksa kembali metode pembayaran Anda atau hubungi dukungan teknis kami jika masalah berlanjut.'
                  : 'Sorry, an error occurred while processing your payment transaction with Xendit. Please check your payment method or contact our technical support if the issue persists.'}
              </p>
              <button 
                onClick={()=>setShowFailureModal(false)} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                {lang === 'id' ? 'Tutup & Coba Lagi' : 'Close & Try Again'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function fmt(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}
