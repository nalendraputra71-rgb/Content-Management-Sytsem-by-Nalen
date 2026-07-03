import { HeaderLogo, SharedFooter } from './SharedFooter';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Flame, ArrowLeft, Instagram, MapPin, Mail, Phone  , Heart } from 'lucide-react';
import { getFaqs, FAQItem } from './LandingPage';

export function PricingPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'en';
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLangChange = (l: 'id' | 'en') => {
    setLang(l);
    localStorage.setItem('hubify_locale', l);
  };

  const handlePlanSelect = (planType: 'monthly' | 'annual') => {
    navigate(`/checkout-preview?plan=${planType}`);
  };

  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen overflow-x-hidden flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <HeaderLogo />

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-sm font-semibold text-slate-500 hover:text-[#0B2A4A] transition-colors flex items-center gap-1">
              <ArrowLeft size={16} /> {lang === 'id' ? 'Kembali' : 'Back'}
            </button>
            <div className="bg-slate-100 rounded-full p-1 flex items-center border border-slate-200">
              <button 
                onClick={() => handleLangChange('id')} 
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${lang === 'id' ? 'bg-white shadow-sm text-[#0B2A4A]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ID
              </button>
              <button 
                onClick={() => handleLangChange('en')} 
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${lang === 'en' ? 'bg-white shadow-sm text-[#0B2A4A]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
            </div>
            <button onClick={() => navigate('/login', { state: { mode: 'login' }})} className="hidden sm:block text-sm font-bold text-[#1D4D7A] hover:text-[#0B2A4A] transition-colors">{lang === 'id' ? 'Masuk' : 'Login'}</button>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="pt-32 pb-24 px-6 bg-slate-50 flex-1">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B2A4A] mb-4">
              {lang === 'id' ? 'Pilih Paket Anda' : 'Choose Your Plan'}
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              {lang === 'id' ? 'Kami mematikan sementara free trial. Silakan pilih paket berlangganan normal di bawah ini.' : 'We have temporarily disabled free trials. Please select a standard subscription plan below.'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch mb-24">
            {/* Starter */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 hover:shadow-xl transition-shadow flex flex-col h-full">
              <div className="mb-8 mt-2">
                <div className="text-xl font-bold text-[#0B2A4A] mb-2">Monthly Starter</div>
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-sm font-semibold text-slate-400 line-through decoration-slate-300">Rp 149.000</span>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-[#0B2A4A]">Rp 69.000</span>
                    <span className="text-slate-500 pb-1 font-semibold">/bulan</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm">{lang === 'id' ? 'Sempurna untuk kreator solo yang ingin lebih fleksibel tanpa komitmen jangka panjang.' : 'Perfect for solo creators who want more flexibility without long-term commitment.'}</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {(lang === 'id' ? [
                  "Integrasi 5 Akun Sosmed", 
                  "Auto-Publishing Terjadwal", 
                  "100x Generate AI / Bulan", 
                  "Analitik & Multi-View Calendar", 
                  "1 GB Penyimpanan Aset",
                  "Manajemen Komentar & DM Basic",
                  "Template Caption Siap Pakai",
                  "Customer Support via Email"
                ] : [
                  "5 Social Accounts Integration", 
                  "Scheduled Auto-Publishing", 
                  "100x AI Generation / Month", 
                  "Analytics & Multi-View Calendar", 
                  "1 GB Asset Storage",
                  "Basic Comment & DM Management",
                  "Ready-to-use Caption Templates",
                  "Email Customer Support"
                ]).map((f, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 font-medium items-start">
                    <Check size={20} className="text-blue-500 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <button onClick={() => handlePlanSelect('monthly')} className="w-full py-4 rounded-xl font-bold bg-[#FAFAFA] text-[#0B2A4A] border border-black/10 hover:bg-slate-100 transition-colors mt-auto">
                {lang === 'id' ? 'Pilih Paket Monthly' : 'Select Monthly Plan'}
              </button>
            </div>

            {/* Premium */}
            <div className="bg-[#0B2A4A] rounded-3xl p-8 shadow-2xl border border-blue-900 flex flex-col relative h-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                {lang === 'id' ? 'Paling Laris' : 'Best Seller'}
              </div>
              <div className="mb-8 mt-2">
                <div className="text-xl font-bold text-white mb-2">Growth Master</div>
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-sm font-semibold text-blue-300/60 line-through decoration-blue-300/40">Rp 1.788.000</span>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">Rp 849.000</span>
                    <span className="text-blue-200 pb-1 font-semibold">{lang === 'id' ? '/tahun' : '/year'}</span>
                  </div>
                </div>
                <p className="text-blue-200 text-sm">{lang === 'id' ? 'Hemat lebih dari 20%. Solusi pro untuk agensi & korporat yang mengejar target agresif.' : 'Save over 20%. Pro solution for agencies & corporates chasing aggressive targets.'}</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {(lang === 'id' ? [
                  "Unlimited Akun Sosmed & Tim", 
                  "Kolaborasi & Alur Persetujuan", 
                  "Unlimited AI Generator", 
                  "White-label Export Report", 
                  "Manajemen Komentar & Auto-reply",
                  "Akses API Terbuka",
                  "Prioritas Dukungan 24/7"
                ] : [
                  "Unlimited Social Accounts & Team", 
                  "Collaboration & Approval Workflow", 
                  "Unlimited AI Generator", 
                  "White-label Report Export", 
                  "Comment & Auto-reply Management",
                  "Open API Access",
                  "24/7 Priority Support"
                ]).map((f, i) => (
                  <li key={i} className="flex gap-3 text-white font-medium items-start">
                    <Check size={20} className="text-blue-400 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <button onClick={() => handlePlanSelect('annual')} className="w-full py-4 rounded-xl font-bold bg-white text-[#0B2A4A] hover:bg-blue-50 transition-colors shadow-lg mt-auto">
                {lang === 'id' ? 'Ambil Paket Tahunan' : 'Get Annual Plan'}
              </button>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="max-w-4xl mx-auto mb-24">
            <h3 className="text-2xl font-bold text-center text-[#0B2A4A] mb-8">{lang === 'id' ? 'Perbandingan Fitur Lengkap' : 'Detailed Feature Comparison'}</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 font-semibold text-slate-500">{lang === 'id' ? 'Fitur' : 'Feature'}</th>
                    <th className="py-4 px-6 font-semibold text-[#0B2A4A] text-center">Monthly Starter</th>
                    <th className="py-4 px-6 font-bold text-blue-600 text-center bg-blue-50/50">Growth Master</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { id: 'Integrasi Akun Sosial', en: 'Social Account Integrations', starter: '5 Akun', master: 'Tanpa Batas (Unlimited)' },
                    { id: 'Anggota Tim', en: 'Team Members', starter: '1 (Solo)', master: 'Hingga 5 Anggota' },
                    { id: 'Penjadwalan Otomatis', en: 'Auto-Publishing', starter: true, master: true },
                    { id: 'Multi-View Calendar', en: 'Multi-View Calendar', starter: true, master: true },
                    { id: 'Batas Generate AI / Bulan', en: 'AI Generation Limit / Month', starter: '100 Prompts', master: 'Tanpa Batas (Unlimited)' },
                    { id: 'Penyimpanan Aset', en: 'Asset Storage', starter: '1 GB', master: 'Tanpa Batas (Unlimited)' },
                    { id: 'Analisis Performa', en: 'Performance Analytics', starter: 'Dasar (Basic)', master: 'Mendalam (Advanced)' },
                    { id: 'Export Laporan (PDF/CSV)', en: 'Export Reports (PDF/CSV)', starter: false, master: 'Ya (White-label)' },
                    { id: 'Alur Persetujuan Konten', en: 'Content Approval Workflow', starter: false, master: true },
                    { id: 'Manajemen Komentar', en: 'Comment Management', starter: 'Dasar (Basic)', master: 'Advanced + Auto-reply' },
                    { id: 'Akses API', en: 'API Access', starter: false, master: true },
                    { id: 'Dukungan Pelanggan', en: 'Customer Support', starter: 'Email (48 Jam)', master: 'Prioritas 24/7' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-700">{lang === 'id' ? row.id : row.en}</td>
                      <td className="py-4 px-6 text-center text-slate-600">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? <Check size={18} className="text-slate-400 mx-auto" /> : <span className="text-slate-300">-</span>
                        ) : (
                          row.starter
                        )}
                      </td>
                      <td className="py-4 px-6 text-center text-blue-700 bg-blue-50/20 font-semibold">
                        {typeof row.master === 'boolean' ? (
                          row.master ? <Check size={18} className="text-blue-500 mx-auto" /> : <span className="text-slate-300">-</span>
                        ) : (
                          row.master
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-[#0B2A4A] mb-8">{lang === 'id' ? 'Pertanyaan Seputar Harga' : 'Pricing FAQs'}</h3>
            <div className="space-y-4">
              {getFaqs(lang).map((faq, idx) => (
                <div key={idx}><FAQItem faq={faq} /></div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <SharedFooter lang={lang} setLang={setLang} />
    </div>
  );
}
