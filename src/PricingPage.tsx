import React, { useState, useEffect } from 'react';
import { PublicHeader, PublicFooter } from './components/PublicShared';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, Check, ChevronDown, Flame, ArrowLeft, Instagram, MapPin, Mail, Phone, Heart, Facebook, Linkedin, Twitter } from 'lucide-react';
import { getFaqs, FAQItem } from './LandingPage';
import { TiktokIcon, ThreadsIcon } from './components/social-icons';

export function PricingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isAnnual, setIsAnnual] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    return (localStorage.getItem('hubify_locale') as 'id' | 'en') || 'en';
  });

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
                className="w-16 h-8 rounded-full bg-[#0B2A4A] relative transition-colors focus:outline-none"
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${isAnnual ? 'left-9' : 'left-1'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isAnnual ? 'text-[#0B2A4A]' : 'text-slate-400'}`}>
                  {lang === 'id' ? 'Tahunan' : 'Annually'}
                </span>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {lang === 'id' ? 'Hemat s/d 20%' : 'Save up to 20%'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-24">
            {/* Free */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow flex flex-col h-full">
              <div className="mb-6">
                <div className="text-lg font-bold text-slate-700 mb-2">Free Starter</div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-[#0B2A4A]">Rp 0</span>
                </div>
                <p className="text-slate-500 text-sm h-10">{lang === 'id' ? 'Cocok untuk mencoba fitur dasar Hubify.' : 'Perfect for trying out basic Hubify features.'}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {(lang === 'id' ? [
                  "1 Workspace", 
                  "3 Akun Sosmed", 
                  "10x Generate AI / Bulan",
                  "Analitik Dasar"
                ] : [
                  "1 Workspace", 
                  "3 Social Accounts", 
                  "10x AI Generation / Mo",
                  "Basic Analytics"
                ]).map((f, i) => (
                  <li key={i} className="flex gap-3 text-slate-600 text-sm font-medium items-start">
                    <Check size={18} className="text-slate-400 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/login', { state: { mode: 'signup' } })} className="w-full py-3 rounded-xl font-bold bg-[#FAFAFA] text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors mt-auto">
                {lang === 'id' ? 'Mulai Gratis' : 'Start for Free'}
              </button>
            </div>

            {/* Solo */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-blue-100 hover:shadow-xl transition-shadow flex flex-col h-full relative">
              <div className="mb-6 mt-2">
                <div className="text-lg font-bold text-[#0B2A4A] mb-2">Solo Creator</div>
                <div className="flex flex-col gap-1 mb-2">
                  {isAnnual && <span className="text-xs font-semibold text-slate-400 line-through decoration-slate-300">Rp 99.000</span>}
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-[#0B2A4A]">{isAnnual ? 'Rp 79k' : 'Rp 99k'}</span>
                    <span className="text-slate-500 pb-1 font-semibold text-sm">/ {lang === 'id' ? 'bln' : 'mo'}</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm h-10">{lang === 'id' ? 'Sempurna untuk kreator konten solo.' : 'Perfect for solo content creators.'}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {(lang === 'id' ? [
                  "1 Workspace", 
                  "10 Akun Sosmed", 
                  "100x Generate AI / Bulan",
                  "Auto-Publishing",
                  "Analitik Lanjutan"
                ] : [
                  "1 Workspace", 
                  "10 Social Accounts", 
                  "100x AI Generation / Mo",
                  "Auto-Publishing",
                  "Advanced Analytics"
                ]).map((f, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 text-sm font-medium items-start">
                    <Check size={18} className="text-blue-500 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate(`/checkout-preview?plan=solo&cycle=${isAnnual ? 'annual' : 'monthly'}`)} className="w-full py-3 rounded-xl font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors mt-auto">
                {lang === 'id' ? 'Pilih Solo' : 'Choose Solo'}
              </button>
            </div>

            {/* Team */}
            <div className="bg-[#0B2A4A] rounded-3xl p-6 shadow-2xl border border-blue-900 flex flex-col relative h-full transform lg:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                {lang === 'id' ? 'Paling Populer' : 'Most Popular'}
              </div>
              <div className="mb-6 mt-4">
                <div className="text-lg font-bold text-white mb-2">Team</div>
                <div className="flex flex-col gap-1 mb-2">
                  {isAnnual && <span className="text-xs font-semibold text-blue-300/60 line-through decoration-blue-300/40">Rp 299.000</span>}
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">{isAnnual ? 'Rp 239k' : 'Rp 299k'}</span>
                    <span className="text-blue-200 pb-1 font-semibold text-sm">/ {lang === 'id' ? 'bln' : 'mo'}</span>
                  </div>
                </div>
                <p className="text-blue-200 text-sm h-10">{lang === 'id' ? 'Kolaborasi mulus untuk tim kecil & menengah.' : 'Seamless collaboration for small & medium teams.'}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {(lang === 'id' ? [
                  "3 Workspaces", 
                  "30 Akun Sosmed", 
                  "500x Generate AI / Bulan",
                  "Alur Persetujuan Konten",
                  "Kolaborasi 3 Anggota"
                ] : [
                  "3 Workspaces", 
                  "30 Social Accounts", 
                  "500x AI Generation / Mo",
                  "Content Approval Flow",
                  "3 Team Members"
                ]).map((f, i) => (
                  <li key={i} className="flex gap-3 text-white text-sm font-medium items-start">
                    <Check size={18} className="text-blue-400 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate(`/checkout-preview?plan=team&cycle=${isAnnual ? 'annual' : 'monthly'}`)} className="w-full py-3 rounded-xl font-bold bg-white text-[#0B2A4A] hover:bg-slate-100 transition-colors mt-auto shadow-lg">
                {lang === 'id' ? 'Mulai Tim' : 'Start Team'}
              </button>
            </div>

            {/* Agency */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition-shadow flex flex-col h-full">
              <div className="mb-6">
                <div className="text-lg font-bold text-slate-800 mb-2">Agency</div>
                <div className="flex flex-col gap-1 mb-2">
                  {isAnnual && <span className="text-xs font-semibold text-slate-400 line-through decoration-slate-300">Rp 899.000</span>}
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-[#0B2A4A]">{isAnnual ? 'Rp 749k' : 'Rp 899k'}</span>
                    <span className="text-slate-500 pb-1 font-semibold text-sm">/ {lang === 'id' ? 'bln' : 'mo'}</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm h-10">{lang === 'id' ? 'Skalabilitas tanpa batas untuk agensi besar.' : 'Infinite scalability for large agencies.'}</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {(lang === 'id' ? [
                  "Unlimited Workspaces", 
                  "Unlimited Akun Sosmed", 
                  "Unlimited Generate AI",
                  "White-label Export",
                  "Prioritas Dukungan 24/7"
                ] : [
                  "Unlimited Workspaces", 
                  "Unlimited Socials", 
                  "Unlimited AI Gen",
                  "White-label Export",
                  "24/7 Priority Support"
                ]).map((f, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 text-sm font-medium items-start">
                    <Check size={18} className="text-slate-800 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate(`/checkout-preview?plan=agency&cycle=${isAnnual ? 'annual' : 'monthly'}`)} className="w-full py-3 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors mt-auto">
                {lang === 'id' ? 'Pilih Agency' : 'Choose Agency'}
              </button>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="max-w-6xl mx-auto mb-24 overflow-x-auto">
            <h3 className="text-2xl font-bold text-center text-[#0B2A4A] mb-8">{lang === 'id' ? 'Perbandingan Fitur Lengkap' : 'Detailed Feature Comparison'}</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-w-[800px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 font-semibold text-slate-500 w-1/4">{lang === 'id' ? 'Fitur' : 'Feature'}</th>
                    <th className="py-4 px-4 font-semibold text-slate-700 text-center">Free</th>
                    <th className="py-4 px-4 font-semibold text-[#0B2A4A] text-center">Solo</th>
                    <th className="py-4 px-4 font-bold text-blue-700 text-center bg-blue-50/50">Team</th>
                    <th className="py-4 px-4 font-semibold text-slate-900 text-center">Agency</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { id: 'Workspaces', en: 'Workspaces', f: '1', s: '1', t: '3', a: 'Unlimited' },
                    { id: 'Integrasi Akun Sosial', en: 'Social Account Integrations', f: '3 Akun', s: '10 Akun', t: '30 Akun', a: 'Unlimited' },
                    { id: 'Anggota Tim', en: 'Team Members', f: '1 (Solo)', s: '1 (Solo)', t: 'Hingga 3', a: 'Unlimited' },
                    { id: 'Penjadwalan Otomatis', en: 'Auto-Publishing', f: false, s: true, t: true, a: true },
                    { id: 'Batas Generate AI / Bulan', en: 'AI Generation / Month', f: '10 Prompts', s: '100 Prompts', t: '500 Prompts', a: 'Unlimited' },
                    { id: 'Penyimpanan Aset', en: 'Asset Storage', f: '100 MB', s: '1 GB', t: '5 GB', a: 'Unlimited' },
                    { id: 'Analisis Performa', en: 'Performance Analytics', f: 'Dasar', s: 'Lanjutan', t: 'Lanjutan', a: 'Mendalam' },
                    { id: 'Export Laporan', en: 'Export Reports', f: false, s: true, t: 'Ya (Kustom)', a: 'Ya (White-label)' },
                    { id: 'Alur Persetujuan Konten', en: 'Content Approval Workflow', f: false, s: false, t: true, a: true },
                    { id: 'Manajemen Komentar', en: 'Comment Management', f: false, s: true, t: true, a: true },
                    { id: 'Dukungan Pelanggan', en: 'Customer Support', f: 'Komunitas', s: 'Email', t: 'Email Prioritas', a: '24/7 Prioritas' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-700">{lang === 'id' ? row.id : row.en}</td>
                      
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
