import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap, Tag, Trash2, AlertCircle } from 'lucide-react';
import { db, doc, getDoc, getDocs, collection, updateDoc, addDoc, increment, query, where } from './firebase';
import { generateBulletPoints } from './PricingPage';

export function OrderSummary({ user, profile }: { user: any, profile: any }) {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'solo';
  const cycle = searchParams.get('cycle') || 'monthly';
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      localStorage.removeItem('pending_checkout');
      localStorage.removeItem('pending_checkout_cycle');
    }
  }, [user]);

  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemConfig, setSystemConfig] = useState<any>(null);

  // Promo / Coupon states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // T&C checkbox state
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isAnnual = cycle === 'annual';

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const snap = await getDocs(collection(db, 'plans'));
        if (!snap.empty) {
          setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.warn("Failed to fetch plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    const fetchSystemConfig = async () => {
      try {
        const snap = await getDoc(doc(db, "config", "system"));
        if (snap.exists()) {
          setSystemConfig(snap.data());
        }
      } catch (err) {
        console.warn("Failed to fetch system config:", err);
      }
    };
    fetchPlans();
    fetchSystemConfig();
  }, []);

  // Find matched plan from database or fallback to hardcoded
  let matchedPlan = plans.find(p => p.id === plan);
  if (!matchedPlan) {
    matchedPlan = plans.find(p => {
      const nameLower = (p.name || '').toLowerCase();
      const matchesSlug = nameLower.includes(plan.toLowerCase());
      const isAnnualPlan = isAnnual ? p.addMonths >= 12 : p.addMonths < 12;
      return matchesSlug && isAnnualPlan;
    });
  }

  const isTrialUrl = searchParams.get('trial') === 'true';
  const hasUsedThisTrial = systemConfig?.trialLimitMode === 'per_plan'
    ? (profile?.usedTrialPlans || []).includes(matchedPlan?.id)
    : !matchedPlan ? true : !!profile?.hasUsedTrial;
  const hasTrialAccess = isTrialUrl && matchedPlan?.trialEnabled && !hasUsedThisTrial;

  let planName = 'Free Starter';
  let originalPrice = 0;
  let finalPrice = 0;
  let features: string[] = [];

  if (plan === 'free') {
    planName = 'Free Starter';
    originalPrice = 0;
    finalPrice = 0;
    features = [
      "1 Workspace", 
      "3 Akun Sosmed", 
      "10x Generate AI / Bulan",
      "Analitik Dasar"
    ];
  } else if (matchedPlan) {
    planName = matchedPlan.name.replace(/ \((Monthly|Annual)\)/i, '');
    originalPrice = matchedPlan.originalPrice || matchedPlan.price;
    finalPrice = hasTrialAccess ? 0 : matchedPlan.price;
    features = generateBulletPoints(matchedPlan, 'id');
  } else if (plan === 'solo') {
    planName = 'Solo Creator';
    originalPrice = matchedPlan ? matchedPlan.originalPrice || matchedPlan.price : (isAnnual ? 1188000 : 99000);
    finalPrice = hasTrialAccess ? 0 : (matchedPlan ? matchedPlan.price : (isAnnual ? 948000 : 99000));
    features = matchedPlan?.features || [
      "1 Workspace", 
      "10 Akun Sosmed", 
      "100x Generate AI / Bulan"
    ];
  } else if (plan === 'team') {
    planName = 'Team';
    originalPrice = matchedPlan ? matchedPlan.originalPrice || matchedPlan.price : (isAnnual ? 3588000 : 299000);
    finalPrice = hasTrialAccess ? 0 : (matchedPlan ? matchedPlan.price : (isAnnual ? 2868000 : 299000));
    features = matchedPlan?.features || [
      "3 Workspaces", 
      "30 Akun Sosmed", 
      "500x Generate AI / Bulan",
      "Kolaborasi 3 Anggota"
    ];
  } else if (plan === 'agency') {
    planName = 'Agency';
    originalPrice = matchedPlan ? matchedPlan.originalPrice || matchedPlan.price : (isAnnual ? 10788000 : 899000);
    finalPrice = hasTrialAccess ? 0 : (matchedPlan ? matchedPlan.price : (isAnnual ? 8988000 : 899000));
    features = matchedPlan?.features || [
      "Unlimited Workspaces", 
      "Unlimited Akun Sosmed", 
      "Unlimited Generate AI",
      "White-label Export",
      "Prioritas Dukungan 24/7"
    ];
  }

  // Calculate Voucher Promo Discount
  let voucherDiscountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      voucherDiscountAmount = Math.floor(finalPrice * (appliedPromo.value / 100));
    } else if (appliedPromo.type === 'fixed') {
      voucherDiscountAmount = appliedPromo.value;
    }
  }

  const finalPriceAfterPromo = Math.max(0, finalPrice - voucherDiscountAmount);
  const packageDiscount = originalPrice - finalPrice;

  const handleApplyPromo = async () => {
    setPromoError('');
    setPromoSuccess('');
    if (!promoCodeInput.trim()) {
      setPromoError('Silakan masukkan kode voucher.');
      return;
    }

    try {
      const codeUpper = promoCodeInput.trim().toUpperCase();
      const promoDoc = await getDoc(doc(db, 'promos', codeUpper));
      
      if (!promoDoc.exists()) {
        setPromoError('Kode voucher tidak valid atau tidak ditemukan.');
        return;
      }

      const pData = promoDoc.data();
      
      // Validation 1: Is Active
      if (!pData.isActive) {
        setPromoError('Voucher ini sudah tidak aktif.');
        return;
      }

      // Validation 2: Usage Limit
      if (pData.usageLimit > 0 && pData.usageCount >= pData.usageLimit) {
        setPromoError('Kuota pemakaian voucher ini sudah habis.');
        return;
      }

      // Validation 3: Date Check
      const nowStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      if (pData.startDate && nowStr < pData.startDate) {
        setPromoError(`Voucher ini baru bisa digunakan mulai tanggal ${pData.startDate}.`);
        return;
      }
      if (pData.endDate && nowStr > pData.endDate) {
        setPromoError('Voucher ini sudah kedaluwarsa.');
        return;
      }

      // Validation 4: First Timer Check
      if (pData.targetType === 'first_timer') {
        if (user) {
          const transSnap = await getDocs(query(collection(db, 'transactions'), where('userId', '==', user.uid)));
          const hasPurchased = transSnap.docs.some(d => d.data().status === 'PAID');
          if (hasPurchased) {
            setPromoError('Voucher ini hanya berlaku untuk perpanjangan pertama kali.');
            return;
          }
        }
      }

      // Promo is valid! Apply it
      setAppliedPromo({ id: codeUpper, ...pData });
      setPromoSuccess(`Voucher "${codeUpper}" berhasil digunakan!`);
    } catch (err: any) {
      console.error("Promo validation error:", err);
      setPromoError('Gagal memverifikasi voucher. Silakan coba lagi.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoSuccess('');
    setPromoError('');
  };

  const handleContinue = async () => {
    if (!user) {
      // Not logged in -> save intent & redirect to login
      localStorage.setItem('pending_checkout', plan);
      localStorage.setItem('pending_checkout_cycle', cycle);
      navigate('/login', { state: { mode: 'signup' } });
      return;
    }

    if (!agreedToTerms) {
      setError('Anda harus menyetujui Syarat & Ketentuan sebelum melanjutkan.');
      return;
    }

    setLoading(true);
    setError('');

    if (hasTrialAccess) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const trialDurationDays = matchedPlan?.trialDays || 7;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + trialDurationDays);

        const existingUsedPlans = profile?.usedTrialPlans || [];
        const targetPlanId = matchedPlan?.id || 'plus-monthly';
        const updatedUsedPlans = existingUsedPlans.includes(targetPlanId)
          ? existingUsedPlans
          : [...existingUsedPlans, targetPlanId];

        const trialData = {
          plan: 'trial',
          trialPlanId: targetPlanId,
          activeUntil: expiryDate.toISOString(),
          subscriptionStatus: 'pro',
          trialStartedAt: new Date().toISOString(),
          hasUsedTrial: true,
          usedTrialPlans: updatedUsedPlans
        };

        await updateDoc(userRef, trialData);

        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          userEmail: profile?.email || user.email || 'unknown',
          amount: 0,
          planName: `${planName} (Trial Gratis)`,
          paymentMethod: 'Free Trial',
          status: 'PAID',
          externalId: `trial_${matchedPlan?.id || 'plus'}_${user.uid}_${Date.now()}`,
          timestamp: new Date().toISOString()
        });

        alert(`Selamat! Anda berhasil mengaktifkan uji coba gratis ${planName} selama ${trialDurationDays} hari.`);
        navigate('/billing?payment=success');
      } catch (err: any) {
        console.error("Direct trial activation error:", err);
        setError('Gagal mengaktifkan uji coba gratis: ' + (err.message || 'Terjadi kesalahan sistem.'));
        setLoading(false);
      }
      return;
    }

    // If final price after promo discount is Rp 0 (Free), bypass payment flow entirely
    if (finalPriceAfterPromo === 0) {
      try {
        const userRef = doc(db, "users", user.uid);
        const addMonths = isAnnual ? 12 : 1;
        let currentActive = new Date();
        
        if (profile?.activeUntil) {
          const existingDate = new Date(profile.activeUntil);
          if (existingDate > currentActive) {
            currentActive = existingDate;
          }
        }
        
        currentActive.setMonth(currentActive.getMonth() + addMonths);

        // Update user profile in Firestore
        await updateDoc(userRef, {
          activeUntil: currentActive.toISOString(),
          plan: plan,
          subscriptionStatus: "pro",
          lastInvoiceId: `promo_free_${user.uid}_${Date.now()}`,
          hasUsedPromo: true
        });

        // Increment usageCount of promo if applicable
        if (appliedPromo) {
          await updateDoc(doc(db, "promos", appliedPromo.id), {
            usageCount: increment(1)
          });
        }

        // Add transaction entry to Firestore
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          userEmail: profile?.email || user.email || "unknown",
          amount: 0,
          planName: plan,
          paymentMethod: appliedPromo ? `Voucher: ${appliedPromo.id}` : "Free",
          status: "PAID",
          externalId: `promo_free_${user.uid}_${Date.now()}`,
          timestamp: new Date().toISOString()
        });

        // Redirect to billing success page
        navigate('/billing?payment=success');
      } catch (err: any) {
        console.error("Direct activation error:", err);
        setError('Gagal mengaktifkan paket gratis: ' + (err.message || 'Terjadi kesalahan sistem.'));
        setLoading(false);
      }
      return;
    }

    // Logged in & paid -> Call Xendit API
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/xendit/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: finalPriceAfterPromo,
          plan: planName,
          planId: plan,
          addMonths: isAnnual ? 12 : 1,
          promoId: appliedPromo ? appliedPromo.id : "none",
          email: profile?.email || user.email,
          description: `Pembelian Paket ${planName} di Hubify Social`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat checkout, silakan coba lagi.");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("URL Checkout tidak ditemukan.");
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/pricing')} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#0B2A4A] transition-colors mb-8 font-semibold text-sm"
        >
          <ArrowLeft size={16} /> Kembali ke Harga
        </button>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="bg-[#0B2A4A] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap size={120} />
            </div>
            <h1 className="text-3xl font-extrabold mb-2 relative z-10">Ringkasan Pesanan</h1>
            <p className="text-blue-200 relative z-10">Selesaikan pembayaran untuk mulai menggunakan Hubify Social.</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100 flex gap-2 items-center">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
              {/* Plan Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Paket Pilihan</h3>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <div className="font-bold text-lg text-[#0B2A4A]">{planName}</div>
                      <div className="text-sm text-slate-500">Berlangganan {!isAnnual ? 'Bulanan' : 'Tahunan'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-[#0B2A4A]">Rp {finalPrice.toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                </div>

                {/* Promo Coupon Field */}
                {plan !== 'free' && (
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="text-sm font-bold text-[#0B2A4A] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Tag size={16} className="text-blue-500" /> Masukkan Voucher / Promo
                    </h3>
                    
                    {!appliedPromo ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Contoh: DISKON77" 
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0B2A4A] uppercase placeholder:normal-case focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                          <button 
                            type="button"
                            onClick={handleApplyPromo}
                            className="bg-[#1D4D7A] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0B2A4A] transition-colors"
                          >
                            Terapkan
                          </button>
                        </div>
                        {promoError && (
                          <div className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {promoError}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-100 px-4 py-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-600 text-white text-xs font-black px-2 py-1 rounded">
                              {appliedPromo.id}
                            </span>
                            <span className="text-xs text-emerald-800 font-semibold">
                              Voucher berhasil diterapkan!
                            </span>
                          </div>
                          <button 
                            type="button" 
                            onClick={handleRemovePromo}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Hapus Voucher"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {appliedPromo.terms && (
                          <div className="text-xs bg-slate-100/80 text-slate-500 p-3 rounded-lg border border-slate-200/50">
                            <span className="font-bold block text-slate-600 mb-1">Syarat & Ketentuan:</span>
                            <span className="whitespace-pre-line">{appliedPromo.terms}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Yang Anda Dapatkan</h3>
                  <ul className="space-y-3">
                    {features.map((f, i) => (
                      <li key={i} className="flex gap-3 text-slate-700 font-medium items-start text-sm">
                        <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" /> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Order Summary & Payment Action */}
              <div className="w-full md:w-80 flex flex-col gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detail Pembayaran</h3>
                  
                  <div className="space-y-3 text-sm font-medium mb-6">
                    <div className="flex justify-between text-slate-500">
                      <span>Harga Normal</span>
                      <span>Rp {originalPrice.toLocaleString('id-ID')}</span>
                    </div>

                    {packageDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>{hasTrialAccess ? `Trial Gratis ${matchedPlan?.trialDays || 7} Hari` : "Diskon Spesial"}</span>
                        <span>- Rp {packageDiscount.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    {appliedPromo && voucherDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Potongan Voucher</span>
                        <span>- Rp {voucherDiscountAmount.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    <div className="h-px bg-slate-200 my-2"></div>
                    
                    <div className="flex justify-between text-lg font-extrabold text-[#0B2A4A]">
                      <span>Total Tagihan</span>
                      <div className="text-right">
                        <div>Rp {finalPriceAfterPromo.toLocaleString('id-ID')}</div>
                        <div className="text-xs font-normal text-slate-500 mt-1">Sudah termasuk pajak</div>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="mb-5">
                    <label className="flex gap-2.5 items-start cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">
                        Saya menyetujui <span className="text-[#1D4D7A] font-bold hover:underline">Syarat & Ketentuan</span> serta <span className="text-[#1D4D7A] font-bold hover:underline">Kebijakan Layanan</span> Hubify.
                      </span>
                    </label>
                  </div>

                  <button 
                    onClick={handleContinue} 
                    disabled={loading}
                    className="w-full bg-[#1D4D7A] text-white font-bold py-4 px-4 rounded-xl hover:bg-[#0B2A4A] transition-all flex justify-center items-center gap-2 shadow-lg shadow-[#1D4D7A]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Memproses...' : (hasTrialAccess ? 'Mulai Uji Coba Gratis Sekarang' : (user ? (finalPriceAfterPromo === 0 ? 'Aktifkan Paket Sekarang' : 'Lanjut ke Pembayaran') : 'Daftar & Bayar'))}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                    <ShieldCheck size={14} /> Pembayaran Aman & Terenkripsi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
