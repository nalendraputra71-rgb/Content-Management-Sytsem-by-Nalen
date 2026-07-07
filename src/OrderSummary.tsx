import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { auth } from './firebase'; // Ensure you have access to auth if needed
import { updateProfile } from 'firebase/auth';

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAnnual = cycle === 'annual';

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
  } else if (plan === 'solo') {
    planName = 'Solo Creator';
    originalPrice = isAnnual ? 99000 * 12 : 99000;
    finalPrice = isAnnual ? 79000 * 12 : 99000;
    features = [
      "1 Workspace", 
      "10 Akun Sosmed", 
      "100x Generate AI / Bulan",
      "Auto-Publishing",
      "Analitik Lanjutan"
    ];
  } else if (plan === 'team') {
    planName = 'Team';
    originalPrice = isAnnual ? 299000 * 12 : 299000;
    finalPrice = isAnnual ? 239000 * 12 : 299000;
    features = [
      "3 Workspaces", 
      "30 Akun Sosmed", 
      "500x Generate AI / Bulan",
      "Alur Persetujuan Konten",
      "Kolaborasi 3 Anggota"
    ];
  } else if (plan === 'agency') {
    planName = 'Agency';
    originalPrice = isAnnual ? 899000 * 12 : 899000;
    finalPrice = isAnnual ? 749000 * 12 : 899000;
    features = [
      "Unlimited Workspaces", 
      "Unlimited Akun Sosmed", 
      "Unlimited Generate AI",
      "White-label Export",
      "Prioritas Dukungan 24/7"
    ];
  }

  const discount = originalPrice - finalPrice;

  const handleContinue = async () => {
    if (!user) {
      // Not logged in -> save intent & redirect to login
      localStorage.setItem('pending_checkout', plan);
      localStorage.setItem('pending_checkout_cycle', cycle);
      navigate('/login', { state: { mode: 'signup' } });
      return;
    }

    if (finalPrice === 0) {
      // Free plan - bypass payment
      setLoading(true);
      setTimeout(() => navigate('/'), 1000);
      return;
    }

    // Logged in -> Call Xendit API
    setLoading(true);
    setError('');
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/xendit/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: finalPrice,
          plan: planName,
          planId: plan,
          addMonths: isAnnual ? 12 : 1,
          promoId: "none",
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
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100">
                {error}
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
                    {discount > 0 && (
                      <>
                        <div className="flex justify-between text-slate-500">
                          <span>Harga Normal</span>
                          <span className="line-through">Rp {originalPrice.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-emerald-600">
                          <span>Diskon Spesial</span>
                          <span>- Rp {discount.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="h-px bg-slate-200 my-2"></div>
                      </>
                    )}
                    <div className="flex justify-between text-lg font-extrabold text-[#0B2A4A]">
                      <span>Total Tagihan</span>
                      <div className="text-right">
                        <div>Rp {finalPrice.toLocaleString('id-ID')}</div>
                        <div className="text-xs font-normal text-slate-500 mt-1">Sudah termasuk pajak</div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleContinue} 
                    disabled={loading}
                    className="w-full bg-[#1D4D7A] text-white font-bold py-4 px-4 rounded-xl hover:bg-[#0B2A4A] transition-all flex justify-center items-center gap-2 shadow-lg shadow-[#1D4D7A]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Memproses...' : (user ? 'Lanjut ke Pembayaran' : 'Daftar & Bayar')}
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
