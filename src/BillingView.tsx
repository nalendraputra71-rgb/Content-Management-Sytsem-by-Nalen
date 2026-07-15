import { useState, useEffect } from "react";
import { doc, updateDoc, collection, getDocs, setDoc } from "./firebase";
import { db } from "./firebase";
import { CARD, B, I } from "./data";
import { motion, AnimatePresence } from "motion/react";
import { getAuth } from "firebase/auth";
import { useSearchParams } from "react-router-dom";
import { Check, ArrowLeft, Zap, Ticket, X, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

export function BillingView({ userProfile, onUpdate }: { userProfile: any, activeWorkspace?: any, onUpdate: (data: any) => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const [modal, setModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [promos, setPromos] = useState<any[]>([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);

  const defaultPlans = [
    {
      id: "free",
      name: "Free Starter",
      desc: "Cocok untuk mencoba fitur dasar Hubify.",
      features: [
        "1 Workspace", 
        "3 Akun Sosmed", 
        "10x Generate AI / Bulan",
        "Analitik Dasar"
      ],
      priceMonthly: 0,
      priceAnnual: 0,
      popular: false
    },
    {
      id: "solo",
      name: "Solo Creator",
      desc: "Sempurna untuk kreator konten solo.",
      features: [
        "1 Workspace", 
        "10 Akun Sosmed", 
        "100x Generate AI / Bulan",
        "Auto-Publishing",
        "Analitik Lanjutan"
      ],
      priceMonthly: 1000,
      priceAnnual: 1000,
      popular: false
    },
    {
      id: "team",
      name: "Team",
      desc: "Kolaborasi mulus untuk tim kecil & menengah.",
      features: [
        "3 Workspaces", 
        "30 Akun Sosmed", 
        "500x Generate AI / Bulan",
        "Alur Persetujuan Konten",
        "Kolaborasi 3 Anggota"
      ],
      priceMonthly: 299000,
      priceAnnual: 239000,
      popular: true
    },
    {
      id: "agency",
      name: "Agency",
      desc: "Skalabilitas tanpa batas untuk agensi besar.",
      features: [
        "Unlimited Workspaces", 
        "Unlimited Akun Sosmed", 
        "Unlimited Generate AI",
        "White-label Export",
        "Prioritas Dukungan 24/7"
      ],
      priceMonthly: 899000,
      priceAnnual: 749000,
      popular: false
    }
  ];

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
    loadPromos();
  }, []);

  const handleApplyVoucher = (code: string) => {
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
      if (userProfile.hasUsedPromo) {
        setVoucherError("Voucher ini hanya berlaku untuk pengguna yang pertama kali melakukan perpanjangan.");
        return;
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
    const computedPrice = isPlanAnnual ? plan.priceAnnual * 12 : plan.priceMonthly;
    const selectedPlan = {
      ...plan,
      price: computedPrice,
      addMonths: isPlanAnnual ? 12 : 1,
      displayName: plan.name + (isPlanAnnual ? " (Tahunan)" : " (Bulanan)")
    };
    setModal(selectedPlan);
    setVoucherError("");
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      const finalPrice = calculateFinalPrice(modal.price);
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Anda belum login");
      
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
        
        {/* Back Button */}
        <button 
          onClick={() => window.location.hash = "/profile"} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#0B2A4A] transition-colors mb-8 font-semibold text-sm focus:outline-none"
        >
          <ArrowLeft size={16} /> Kembali ke Pengaturan Profil
        </button>

        {/* Header Block */}
        <div className="text-center mb-10">
           <h1 className="text-3xl md:text-4xl font-extrabold text-[#0B2A4A] tracking-tight mb-3">Langganan & Penagihan</h1>
           <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
             Pilih paket yang sesuai untuk merancang konten dengan maksimal. <br/>Dapatkan diskon eksklusif dengan menggunakan voucher promo.
           </p>
        </div>

        {/* Account Status Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
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

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`font-medium text-sm md:text-base ${!isAnnual ? 'text-[#0B2A4A] font-bold' : 'text-slate-400'}`}>
            Bulanan
          </span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-7 rounded-full bg-[#0B2A4A] relative transition-colors focus:outline-none"
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${isAnnual ? 'left-8' : 'left-1'}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm md:text-base ${isAnnual ? 'text-[#0B2A4A] font-bold' : 'text-slate-400'}`}>
              Tahunan
            </span>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              Hemat s/d 20%
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-20">
          {defaultPlans.map(p => {
            const isFree = p.id === "free";
            const currentPlanActive = userProfile.plan === p.id || (p.id === "free" && userProfile.plan === "trial");

            return (
              <div 
                key={p.id} 
                className={`rounded-3xl p-6 flex flex-col h-full relative transition-all duration-200 ${
                  p.popular 
                    ? "bg-[#0B2A4A] text-white shadow-xl lg:-translate-y-2 border border-blue-900" 
                    : "bg-white text-slate-800 shadow-sm border border-slate-200 hover:shadow-md"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                    Paling Populer
                  </div>
                )}

                <div className="mb-6">
                  <div className={`text-lg font-bold mb-2 ${p.popular ? "text-white" : "text-slate-700"}`}>{p.name}</div>
                  <div className="flex flex-col gap-1 mb-2">
                    {isAnnual && !isFree && (
                      <span className={`text-xs font-semibold line-through decoration-slate-300 ${p.popular ? "text-blue-300/60" : "text-slate-400"}`}>
                        Rp {p.priceMonthly.toLocaleString("id-ID")}
                      </span>
                    )}
                    <div className="flex items-end gap-1">
                      <span className={`text-3xl md:text-4xl font-extrabold ${p.popular ? "text-white" : "text-[#0B2A4A]"}`}>
                        Rp {isFree ? "0" : (isAnnual ? p.priceAnnual.toLocaleString("id-ID") : p.priceMonthly.toLocaleString("id-ID"))}
                      </span>
                      {!isFree && (
                        <span className={`pb-1 font-semibold text-xs ${p.popular ? "text-blue-200" : "text-slate-500"}`}>
                          / bln
                        </span>
                      )}
                    </div>
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
                  <button 
                    onClick={() => handleSelectPlan(p)} 
                    className={`w-full py-3 rounded-xl font-bold text-xs md:text-sm transition-all duration-200 mt-auto ${
                      p.popular 
                        ? "bg-white text-[#0B2A4A] hover:bg-slate-100 shadow-md" 
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {currentPlanActive ? "Perpanjang Paket" : "Pilih Paket"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="max-w-6xl mx-auto mb-20 overflow-x-auto">
          <h3 className="text-2xl font-bold text-center text-[#0B2A4A] mb-8">Perbandingan Fitur Lengkap</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 min-w-[800px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 font-semibold text-slate-500 w-1/4">Fitur</th>
                  <th className="py-4 px-4 font-semibold text-slate-700 text-center">Free</th>
                  <th className="py-4 px-4 font-semibold text-[#0B2A4A] text-center">Solo</th>
                  <th className="py-4 px-4 font-bold text-blue-700 text-center bg-blue-50/50">Team</th>
                  <th className="py-4 px-4 font-semibold text-slate-900 text-center">Agency</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { id: 'Workspaces', f: '1', s: '1', t: '3', a: 'Unlimited' },
                  { id: 'Integrasi Akun Sosial', f: '3 Akun', s: '10 Akun', t: '30 Akun', a: 'Unlimited' },
                  { id: 'Anggota Tim', f: '1 (Solo)', s: '1 (Solo)', t: 'Hingga 3', a: 'Unlimited' },
                  { id: 'Penjadwalan Otomatis', f: false, s: true, t: true, a: true },
                  { id: 'Batas Generate AI / Bulan', f: '10 Prompts', s: '100 Prompts', t: '500 Prompts', a: 'Unlimited' },
                  { id: 'Penyimpanan Aset', f: '100 MB', s: '1 GB', t: '5 GB', a: 'Unlimited' },
                  { id: 'Analisis Performa', f: 'Dasar', s: 'Lanjutan', t: 'Lanjutan', a: 'Mendalam' },
                  { id: 'Export Laporan', f: false, s: true, t: 'Ya (Kustom)', a: 'Ya (White-label)' },
                  { id: 'Alur Persetujuan Konten', f: false, s: false, t: true, a: true },
                  { id: 'Manajemen Komentar', f: false, s: true, t: true, a: true },
                  { id: 'Dukungan Pelanggan', f: 'Komunitas', s: 'Email', t: 'Email Prioritas', a: '24/7 Prioritas' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-700">{row.id}</td>
                    
                    <td className="py-4 px-4 text-center text-slate-600">
                      {typeof row.f === 'boolean' ? (row.f ? <Check size={18} className="text-slate-400 mx-auto" /> : <span className="text-slate-300">-</span>) : row.f}
                    </td>
                    
                    <td className="py-4 px-4 text-center text-slate-700">
                      {typeof row.s === 'boolean' ? (row.s ? <Check size={18} className="text-blue-500 mx-auto" /> : <span className="text-slate-300">-</span>) : row.s}
                    </td>
                    
                    <td className="py-4 px-4 text-center text-blue-800 bg-blue-50/20 font-semibold">
                      {typeof row.t === 'boolean' ? (row.t ? <Check size={18} className="text-blue-600 mx-auto" /> : <span className="text-slate-300">-</span>) : row.t}
                    </td>

                    <td className="py-4 px-4 text-center text-slate-900 font-medium">
                      {typeof row.a === 'boolean' ? (row.a ? <Check size={18} className="text-slate-800 mx-auto" /> : <span className="text-slate-300">-</span>) : row.a}
                    </td>
                  </tr>
                ))}
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
               <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left mb-6">
                 <div className="flex justify-between mb-3 text-sm">
                   <span className="text-slate-500 font-medium">Harga Normal</span> 
                   <span className="font-semibold text-slate-800">Rp {modal.price.toLocaleString("id-ID")}</span>
                 </div>
                 
                 {appliedVoucher && (
                   <div className="flex justify-between mb-3 text-sm text-emerald-600">
                     <span className="font-medium">Potongan Promo ({appliedVoucher.code})</span> 
                     <span className="font-extrabold">- Rp {(modal.price - calculateFinalPrice(modal.price)).toLocaleString("id-ID")}</span>
                   </div>
                 )}

                 <div className="border-t border-dashed border-slate-200 my-3"/>
                 
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
                    const isRestrictedForUser = p.targetType === 'first_timer' && userProfile.hasUsedPromo;
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
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                🎉
              </div>
              <h3 className="text-xl font-extrabold text-[#0B2A4A] mb-2">Pembayaran Berhasil!</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Terima kasih telah berlangganan! Akun Anda telah berhasil diperpanjang/ditingkatkan ke paket premium. 
                Sistem kami sedang menyinkronkan status akun Anda secara real-time.
              </p>
              <button 
                onClick={()=>setShowSuccessModal(false)} 
                className="w-full bg-[#0B2A4A] hover:bg-blue-950 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                Mulai Eksplorasi
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
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ❌
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">Pembayaran Gagal</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Maaf, terjadi kendala saat memproses transaksi pembayaran Anda dengan Xendit. Silakan periksa kembali metode pembayaran Anda atau hubungi dukungan teknis kami jika masalah berlanjut.
              </p>
              <button 
                onClick={()=>setShowFailureModal(false)} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                Tutup & Coba Lagi
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
