import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Calendar, BarChart2, Zap, Sparkles, LayoutDashboard, Share2, TrendingUp, Users, Clock, Instagram, Twitter, Facebook, CloudRain, CheckCircle, StickyNote, Target, ChevronRight, Flame, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const analyticsData = [
  { name: 'Mon', views: 4000, engagement: 2400 },
  { name: 'Tue', views: 3000, engagement: 1398 },
  { name: 'Wed', views: 2000, engagement: 9800 },
  { name: 'Thu', views: 2780, engagement: 3908 },
  { name: 'Fri', views: 1890, engagement: 4800 },
  { name: 'Sat', views: 2390, engagement: 3800 },
  { name: 'Sun', views: 3490, engagement: 4300 },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [calendarViewIdx, setCalendarViewIdx] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCalendarViewIdx(v => (v + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#2C2016] overflow-hidden selection:bg-slate-200">
      
      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 20 ? 'bg-white/80 backdrop-blur-md border-b border-black/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/icon.png" alt="Hubify" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; e.currentTarget.parentElement!.nextElementSibling!.style.display = 'flex' }} />
            </div>
            <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold">H</div>
            <a href="#" className="font-extrabold text-xl tracking-tight text-[#0B2A4A]">Hubify</a>
          </div>
          
          <nav className="hidden md:flex gap-8 items-center font-semibold text-sm text-[#1D4D7A]">
            <a href="#fitur" className="hover:text-[#0B2A4A] transition-colors">Fitur</a>
            <a href="#analitik" className="hover:text-[#0B2A4A] transition-colors">Analitik</a>
            <a href="#harga" className="hover:text-[#0B2A4A] transition-colors">Harga</a>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login', { state: { mode: 'login' }})} className="hidden sm:block text-sm font-bold text-[#1D4D7A] hover:text-[#0B2A4A] transition-colors">Masuk</button>
            <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="bg-[#1D4D7A] text-white text-sm font-bold py-2.5 px-5 rounded-full hover:bg-[#0B2A4A] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#1D4D7A]/20">Mulai Gratis</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <motion.div 
            animate={{ y: scrollY * 0.2 }}
            className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-b from-[#1D4D7A]/5 to-transparent blur-3xl opacity-60"
          />
          <motion.div 
            animate={{ y: scrollY * 0.1 }}
            className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-t from-blue-100 to-transparent blur-3xl opacity-60"
          />
        </div>

        {/* Animated Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden md:block">
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [-12, -8, -12] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] left-[15%] bg-white text-pink-500 p-4 rounded-3xl shadow-xl border border-slate-100"
          >
            <Instagram size={32} strokeWidth={2.5} />
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [15, 20, 15] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[25%] right-[15%] bg-white text-black p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center w-[66px] h-[66px]"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.589 6.686a4.793 4.793 0 01-3.975-4.685h-3.65v15.348c0 2.213-1.802 4.015-4.015 4.015-2.214 0-4.015-1.802-4.015-4.015 0-2.214 1.801-4.015 4.015-4.015a4.01 4.01 0 013.064 1.455v-3.79a7.664 7.664 0 00-3.064-.622c-4.226 0-7.665 3.44-7.665 7.665 0 4.226 3.439 7.665 7.665 7.665 4.225 0 7.664-3.439 7.664-7.665v-6.6a8.49 8.49 0 004.605 1.365V8.04c-1.637 0-3.136-.576-4.329-1.354z"/>
            </svg>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -10, 0], x: [0, 10, 0], rotate: [-5, 0, -5] }} 
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[10%] left-[20%] bg-blue-600 text-white p-4 rounded-3xl shadow-xl border border-blue-500 flex items-center justify-center w-[66px] h-[66px]"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </motion.div>

          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [8, 12, 8] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[15%] right-[20%] bg-white text-green-500 p-4 rounded-3xl shadow-xl border border-slate-100"
          >
            <Sparkles size={32} strokeWidth={2.5} />
          </motion.div>
          
          {/* Small decorative dots/shapes */}
          <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-[30%] left-[30%] w-3 h-3 bg-yellow-400 rounded-full" />
          <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute top-[40%] right-[30%] w-4 h-4 bg-purple-400 rounded-full" />
          <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3.5, repeat: Infinity, delay: 2 }} className="absolute bottom-[25%] left-[45%] w-2.5 h-2.5 bg-blue-400 rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center z-10 relative">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[28px] sm:text-4xl md:text-5xl lg:text-[57px] font-extrabold tracking-tight text-[#0B2A4A] leading-[1.1] mb-6 flex flex-col items-center text-center w-full"
          >
            <span className="whitespace-nowrap">Satu Dashboard. Semua Konten.</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D4D7A] to-blue-500 mt-2 md:mt-4">Markas Besar Kreativitasmu.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Rancang, jadwalin, dan viralin kontenmu tanpa ribet. Hubify menggabungkan kalender cerdas, asisten AI, dan analitik mendalam untuk bantu kamu kuasai algoritma.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="bg-[#1D4D7A] text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-[#0B2A4A] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-[#1D4D7A]/20 flex items-center justify-center gap-2">
              Gas Sekarang! — Gratis 30 Hari <Zap size={20} className="text-yellow-400" />
            </button>
            <button onClick={() => { document.getElementById('dashboard-visual')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-white text-[#1D4D7A] font-bold py-4 px-8 rounded-full text-lg border border-black/5 hover:border-black/10 hover:shadow-md transition-all flex items-center justify-center gap-2">
              <LayoutDashboard size={20} /> Lihat Interfacenya
            </button>
          </motion.div>
        </div>

        {/* Hero Mockup */}
        <motion.div 
          id="dashboard-visual"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
          className="mt-20 w-full max-w-6xl mx-auto relative z-20 scroll-mt-24"
        >
          {/* Tooltip Keterangan Bikin Animate Banget */}
          <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:1.5}} className="absolute -left-12 top-[15%] bg-[#0B2A4A] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xl rotate-[-5deg] z-30">
            Cuaca & Jam Real-time! 🌦️
          </motion.div>
          <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:2}} className="absolute -right-6 top-[30%] bg-pink-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xl rotate-[5deg] z-30">
            Cek Progress Kerjaanmu ✨
          </motion.div>
          <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:2.5}} className="absolute -left-8 bottom-[25%] bg-yellow-400 text-black px-3 py-2 rounded-xl text-xs font-bold shadow-xl rotate-[3deg] z-30">
            Sticky Notes Digital 📝
          </motion.div>

          <div className="rounded-2xl border border-black/10 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col h-[650px] relative">
            {/* Window Header */}
            <div className="h-12 bg-slate-50 border-b border-black/5 flex items-center px-4 gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="mx-auto px-10 py-1 bg-white rounded-md text-xs font-semibold text-slate-400 border border-black/5 shadow-sm">
                Hubify Personal Dashboard
              </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden bg-[#FAFAF8]">
              {/* Sidebar */}
              <div className="w-64 border-r border-black/5 bg-white p-4 hidden md:flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2 mb-8 px-2">
                  <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
                    <img src="/icon.png" alt="Hubify" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; e.currentTarget.parentElement!.nextElementSibling!.style.display = 'flex' }} />
                  </div>
                  <div className="hidden w-8 h-8 rounded bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold">H</div>
                  <div className="font-extrabold text-xl text-[#0B2A4A] tracking-tight">Hubify</div>
                </div>
                <div className="h-10 rounded-md bg-[#1D4D7A]/10 text-[#1D4D7A] font-bold text-sm flex items-center px-3 mb-1"><LayoutDashboard size={16} className="mr-3" /> Dashboard</div>
                <div className="h-10 rounded-md bg-white hover:bg-slate-50 text-slate-500 font-bold text-sm flex items-center px-3 mb-1 transition-colors"><Calendar size={16} className="mr-3" /> Kalender</div>
                <div className="h-10 rounded-md bg-white hover:bg-slate-50 text-slate-500 font-bold text-sm flex items-center px-3 mb-1 transition-colors"><BarChart2 size={16} className="mr-3" /> Analitik</div>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-8 flex flex-col gap-6 overflow-y-auto">
                {/* Greetings & Info Context */}
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h2 className="text-3xl font-extrabold text-[#0B2A4A] mb-1">Halo, Raditya! 👋</h2>
                    <p className="text-slate-500 font-medium">Ini ringkasan amunisimu hari ini.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-black/5">
                      <CloudRain size={20} className="text-blue-400" />
                      <div className="text-sm font-bold text-[#0B2A4A]">Hujan Ringan, 28°C</div>
                    </div>
                    <div className="flex items-center gap-3 bg-[#0B2A4A] text-white px-5 py-2 rounded-xl shadow-md">
                      <Clock size={20} className="text-blue-200" />
                      <div className="text-sm font-bold">16:45 WIB</div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Widgets */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Progress Card */}
                  <div className="col-span-12 md:col-span-8 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-6 flex items-center gap-8 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
                    <div className="w-24 h-24 shrink-0 rounded-full border-[8px] border-green-500 flex items-center justify-center relative">
                      <span className="text-2xl font-extrabold text-[#0B2A4A]">75%</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#0B2A4A] mb-2">Kerjaan Hampir Beres! 🔥</h3>
                      <p className="text-slate-500 text-sm mb-4">Kamu udah nyelesaiin 3 dari 4 tugas hari ini. Tinggal 1 postingan TikTok lagi yang perlu direview sebelum jam 5 sore.</p>
                      <button className="bg-slate-100 text-[#0B2A4A] px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">Lihat Detail Tugas</button>
                    </div>
                  </div>

                  {/* Target Summary */}
                  <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-2 mb-6">
                      <Target size={20} className="text-blue-200" />
                      <h3 className="font-bold">Target Followers</h3>
                    </div>
                    <div className="text-4xl font-extrabold mb-1">8,450</div>
                    <div className="text-blue-200 text-sm font-medium mb-4">Dari target 10,000 bulan ini</div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-400 h-full w-[84%] rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                    </div>
                  </div>

                  {/* To-Do List */}
                  <div className="col-span-12 md:col-span-6 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-6">
                    <h3 className="text-lg font-bold text-[#0B2A4A] mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-[#1D4D7A]" /> To-Do List Hari Ini</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-black/5 opacity-50">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={12} /></div>
                        <div className="text-sm font-semibold line-through text-slate-500">Briefing campaign Kemerdekaan</div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-black/5 opacity-50">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={12} /></div>
                        <div className="text-sm font-semibold line-through text-slate-500">Approve desain carousel Instagram</div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 shadow-sm relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                        <div className="text-sm font-bold text-[#0B2A4A]">Review script video TikTok "Tips Hemat"</div>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Notes */}
                  <div className="col-span-12 md:col-span-6 rounded-2xl p-6 bg-[#FEF3C7] shadow-[2px_4px_16px_rgba(0,0,0,0.05)] border border-yellow-200 relative transform rotate-1 hover:rotate-0 transition-transform">
                    <div className="absolute top-3 right-4 text-yellow-500 opacity-50"><StickyNote size={80} /></div>
                    <div className="relative z-10">
                      <h3 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2"><Flame size={18} className="text-orange-500" /> Ide Dadakan (Jangan Lupa!)</h3>
                      <p className="text-yellow-800 font-medium text-sm leading-relaxed mb-4">
                        "Coba bikin konten POV orang kantoran pas gajian telat. Kayanya relate banget buat di TikTok minggu ini. Pakai sound yang lagi viral kemaren!"
                      </p>
                      <div className="text-xs text-yellow-600 font-bold">- Ditulis 2 jam lalu</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Bento Grid */}
      <section id="fitur" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-4">Senjata Rahasia <span className="text-[#1D4D7A]">Content Creator</span></h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Dirancang bukan sekedar menyimpan ide, tapi untuk mengeksekusi tren lebih cepat, lebih cerdas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 hover:border-[#1D4D7A]/30 transition-colors md:col-span-2 overflow-hidden flex flex-col group">
            <div className="relative z-10 w-full mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D4D7A] flex items-center justify-center mb-6">
                <Calendar size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#0B2A4A] mb-3">Multi-View Calendar</h3>
              <p className="text-slate-600">Atur strategi besarmu dengan Kanban board, List, atau Calendar view. Geser dan jatuhkan idemu seolah sedang bermain Lego.</p>
            </div>
            {/* Visual stacked securely below text */}
            <div className="flex-1 w-full bg-slate-50 rounded-2xl border border-black/5 p-4 flex flex-col relative overflow-hidden min-h-[280px]">
              <div className="flex justify-between items-center z-10 relative mb-4">
                <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg">
                  <div className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${calendarViewIdx === 0 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>30 Hari</div>
                  <div className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${calendarViewIdx === 1 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Board</div>
                  <div className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${calendarViewIdx === 2 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Table</div>
                </div>
              </div>
              <div className="relative flex-1">
                <AnimatePresence mode="wait">
                  {calendarViewIdx === 0 && (
                    <motion.div key="v0" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0 grid grid-cols-7 gap-1">
                      {[...Array(28)].map((_, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded flex flex-col p-1">
                          <div className="text-[8px] text-slate-400 text-right">{i+1}</div>
                          {i === 12 || i === 15 || i === 22 || i === 5 ? (
                            <div className={`w-full h-1 mt-1 rounded-full ${i === 12 ? 'bg-pink-400' : i === 15 ? 'bg-blue-400' : 'bg-green-400'}`} />
                          ) : null}
                          {i === 15 || i === 22 ? (
                            <div className="w-full h-1 mt-0.5 rounded-full bg-indigo-400" />
                          ) : null}
                        </div>
                      ))}
                    </motion.div>
                  )}
                  {calendarViewIdx === 1 && (
                    <motion.div key="v1" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0 grid grid-cols-3 gap-2">
                       <div className="flex flex-col gap-2">
                         <div className="text-[10px] font-bold text-slate-500">Draft</div>
                         <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                           <div className="h-2 w-3/4 bg-slate-200 rounded mb-2" />
                           <div className="h-1.5 w-1/2 bg-slate-100 rounded" />
                         </div>
                         <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                           <div className="h-2 w-5/6 bg-slate-200 rounded mb-2" />
                           <div className="h-1.5 w-2/3 bg-slate-100 rounded" />
                         </div>
                       </div>
                       <div className="flex flex-col gap-2">
                         <div className="text-[10px] font-bold text-slate-500">Scheduled</div>
                         <div className="bg-white p-3 border border-blue-100 rounded-xl shadow-[0_4px_12px_rgba(59,130,246,0.1)]">
                           <div className="h-2 w-3/4 bg-blue-200 rounded mb-2" />
                           <div className="h-1.5 w-1/2 bg-blue-100 rounded" />
                         </div>
                       </div>
                       <div className="flex flex-col gap-2">
                         <div className="text-[10px] font-bold text-slate-500">Published</div>
                         <div className="bg-white p-3 border border-green-100 rounded-xl shadow-sm">
                           <div className="h-2 w-3/4 bg-green-200 rounded mb-2" />
                           <div className="h-1.5 w-1/2 bg-green-100 rounded" />
                         </div>
                       </div>
                    </motion.div>
                  )}
                  {calendarViewIdx === 2 && (
                    <motion.div key="v2" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute inset-0 flex flex-col gap-2 pt-1">
                       <div className="flex items-center px-3 pb-2 border-b border-slate-200">
                         <div className="flex-1 text-[10px] font-bold text-slate-400">KONTEN</div>
                         <div className="w-20 text-[10px] font-bold text-slate-400 text-center">TANGGAL</div>
                         <div className="w-20 text-[10px] font-bold text-slate-400 text-right">STATUS</div>
                       </div>
                       {[
                         { status: 'DRAFT', color: 'yellow' },
                         { status: 'SCHEDULED', color: 'blue' },
                         { status: 'PUBLISHED', color: 'green' }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                           <div className="flex-1">
                             <div className="h-2 w-3/4 bg-slate-200 rounded mb-1.5" />
                             <div className="h-1.5 w-1/2 bg-slate-100 rounded" />
                           </div>
                           <div className="w-20 text-center">
                             <div className="h-2 w-12 bg-slate-200 rounded mx-auto" />
                           </div>
                           <div className="w-20 flex justify-end">
                             <div className={`px-2 py-1 rounded text-[8px] font-bold text-${item.color}-700 bg-${item.color}-100`}>{item.status}</div>
                           </div>
                         </div>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0B2A4A] rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Copilot</h3>
              <p className="text-slate-300 mb-8">Habis ide caption atau bingung mulai darimana? Hubify AI siapkan naskah, hashtag, hingga visual ide dalam detik.</p>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                 <div className="flex gap-2 mb-3 items-end">
                   <div className="bg-white/20 p-2 rounded-lg rounded-bl-none text-xs w-3/4">Buatkan ide konten makanan untuk 17an dong...</div>
                 </div>
                 <div className="flex gap-2 items-start flex-row-reverse">
                   <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg rounded-br-none text-xs w-4/5 text-left shadow-lg">
                     <p className="font-bold mb-1">Ide 1: "Nasi Goreng Merdeka"</p>
                     <p className="text-[10px] text-white/80">Hook: Siapa bilang 17an cuma lomba balap karung?</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-100 hover:border-indigo-300 transition-colors md:col-span-3 relative overflow-hidden">
             <div className="absolute top-4 right-6 bg-[#0B2A4A] text-white px-3 py-1 rounded-full text-xs font-bold shadow animate-bounce">COMING SOON</div>
             <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                    <Share2 size={24} />
                  </div>
                  <h3 className="text-3xl font-bold text-[#0B2A4A] mb-4">Integrasi Tanpa Batas</h3>
                  <p className="text-slate-600 text-lg mb-6">Hubungkan semua platform dalam satu ekosistem. Distribusi konten kini cuma butuh satu kali klik, sisanya biar sistem yang urus.</p>
               </div>
               
               {/* Visual Orbit/Nodes */}
               <div className="flex-1 relative w-full h-64 flex items-center justify-center opacity-80 mix-blend-multiply">
                 <div className="absolute w-full h-full border-2 border-indigo-200/50 rounded-full animate-[spin_20s_linear_infinite]" />
                 <div className="absolute w-2/3 h-2/3 border-2 border-indigo-300/60 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                 
                 {/* Center Node */}
                 <div className="w-20 h-20 bg-[#0B2A4A] rounded-2xl shadow-xl flex items-center justify-center text-white font-extrabold text-3xl z-10 relative">
                   <motion.div animate={{scale:[1, 1.1, 1]}} transition={{repeat:Infinity, duration:2}}>H.</motion.div>
                 </div>
                 
                 {/* Orbiting Icons */}
                 <motion.div animate={{y:[-10, 10, -10]}} transition={{repeat:Infinity, duration:3}} className="absolute top-4 left-1/4 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-pink-500">
                    <Instagram size={24}/>
                 </motion.div>
                 <motion.div animate={{y:[10, -10, 10]}} transition={{repeat:Infinity, duration:4}} className="absolute bottom-4 right-1/4 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-600">
                    <Facebook size={24}/>
                 </motion.div>
                 <motion.div animate={{x:[-10, 10, -10]}} transition={{repeat:Infinity, duration:3.5}} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-xl shadow-lg flex items-center justify-center text-white">
                    <Twitter size={24}/>
                 </motion.div>
                 <motion.div animate={{x:[10, -10, 10]}} transition={{repeat:Infinity, duration:2.5}} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-400">
                    <Share2 size={24}/>
                 </motion.div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section id="analitik" className="py-24 px-6 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <div className="w-full lg:w-2/5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-6">
                <TrendingUp size={16} /> Insight Mendalam
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-6 leading-tight">Berhenti Menebak,<br/>Mulai Menganalisa.</h2>
              <p className="text-lg text-slate-500 mb-8">Ketahui pasti kapan audiensmu aktif, konten mana yang paling mendatangkan cuan, dan optimasi jadwal postingmu berdasarkan data nyata.</p>
              
              <ul className="space-y-4">
                {[
                  "Pelajari Heatmap 'Best Time to Upload'",
                  "Bandingkan performa Multi-Platform dalam satu layar",
                  "Laporan otomatis 10 Konten Terbaik vs Terburuk"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#0B2A4A] font-medium">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check size={14} /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full lg:w-3/5 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent blur-3xl rounded-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {/* Main Graph (Spans 2 cols on md) */}
                <div className="bg-white rounded-3xl shadow-2xl border border-black/5 p-6 md:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="text-sm font-bold text-slate-400 mb-1">Total Engagement</div>
                      <div className="text-3xl font-extrabold text-[#0B2A4A]">32,490</div>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <TrendingUp size={14} /> 12.5%
                    </div>
                  </div>
                  
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData}>
                        <defs>
                          <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1D4D7A" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#1D4D7A" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                          cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area type="monotone" dataKey="engagement" stroke="#1D4D7A" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-orange-100 p-5 overflow-hidden">
                  <div className="text-sm font-bold text-orange-900 mb-4 flex items-center gap-2"><Clock size={16}/> Best Time to Upload</div>
                  <div className="grid grid-cols-7 gap-1">
                      {[...Array(28)].map((_,i) => (
                        <motion.div 
                          key={i} 
                          animate={{opacity:[0.6, 1, 0.6]}} 
                          transition={{duration:Math.random()*2+1, repeat:Infinity}} 
                          className={`h-6 rounded-sm ${[4,9,12,18,24,25].includes(i) ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : [2,5,10,14,20].includes(i) ? 'bg-orange-400' : 'bg-orange-200'}`} 
                        />
                      ))}
                  </div>
                </div>

                {/* Top vs Bad List */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-5 flex flex-col justify-center">
                  <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Activity size={16} /> 10 Top vs 10 Bad Content</div>
                  <div className="flex flex-col gap-3">
                    <motion.div whileHover={{x:5}} className="bg-green-50/50 p-2 rounded-lg border border-green-100/50 flex flex-col gap-1 cursor-default">
                      <div className="flex items-center justify-between text-xs font-bold text-green-800">
                        <span className="truncate pr-2">🏆 "POV Anak SCBD Payday"</span> <span className="text-green-600 bg-green-100 px-1 rounded shrink-0">↑ 2.4k</span>
                      </div>
                      <div className="text-[10px] text-green-600 font-medium pl-1">Iterasi ide ini (High Respon)</div>
                    </motion.div>
                    <motion.div whileHover={{x:5}} className="bg-red-50/50 p-2 rounded-lg border border-red-100/50 flex flex-col gap-1 cursor-default">
                      <div className="flex items-center justify-between text-xs font-bold text-red-800">
                        <span className="truncate pr-2">📉 "Promo Diskon 11.11"</span> <span className="text-red-600 bg-red-100 px-1 rounded shrink-0">↓ 420</span>
                      </div>
                      <div className="text-[10px] text-red-600 font-medium pl-1">Evaluasi hook / headline</div>
                    </motion.div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-4">Mulai Secara Gratis.<br/>Upgrade Saat Tumbuh.</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Tanpa komitmen kartu kredit. Semua paket sudah termasuk akses ke fitur dasar Hubify.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
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
                <p className="text-slate-500 text-sm">Sempurna untuk kreator solo yang ingin lebih fleksibel tanpa komitmen jangka panjang.</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {["Akses AI Generator", "Multi-View Calendar", "Integrasi 3 Akun Sosmed", "Analitik Dasar", "Email Support"].map((f, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 font-medium items-start">
                    <Check size={20} className="text-blue-500 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="w-full py-4 rounded-xl font-bold bg-[#FAFAFA] text-[#0B2A4A] border border-black/10 hover:bg-slate-100 transition-colors mt-auto">
                Mulai Trial 30 Hari
              </button>
            </div>

            {/* Premium */}
            <div className="bg-[#0B2A4A] rounded-3xl p-8 shadow-2xl border border-blue-900 flex flex-col relative h-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                Paling Laris
              </div>
              <div className="mb-8 mt-2">
                <div className="text-xl font-bold text-white mb-2">Growth Master</div>
                <div className="flex flex-col gap-1 mb-4">
                  <span className="text-sm font-semibold text-blue-300/60 line-through decoration-blue-300/40">Rp 1.788.000</span>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">Rp 849.000</span>
                    <span className="text-blue-200 pb-1 font-semibold">/tahun</span>
                  </div>
                </div>
                <p className="text-blue-200 text-sm">Hemat lebih dari 20%. Solusi pro untuk agensi & korporat yang mengejar target agresif.</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {["Semua fitur Monthly, PLUS:", "Priority Support 24/7", "Export Report PDF", "Unlimited AI Prompts", "Akses Beta Fitur Baru"].map((f, i) => (
                  <li key={i} className="flex gap-3 text-white font-medium items-start">
                    <Check size={20} className="text-blue-400 shrink-0 mt-0.5" /> <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="w-full py-4 rounded-xl font-bold bg-white text-[#0B2A4A] hover:bg-blue-50 transition-colors shadow-lg mt-auto">
                Ambil Paket Tahunan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0B2A4A] to-[#1D4D7A] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Siap Jadikan Kontenmu Level Selanjutnya?</h2>
          <p className="text-blue-100 text-lg mb-10">Ribuan kreator sudah menghemat berjam-jam waktu mingguan mereka. Sekarang giliranmu.</p>
          <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="bg-white text-[#0B2A4A] font-bold py-4 px-10 rounded-full text-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Mulai Bangun Markasmu 🚀
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-6 text-sm text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-extrabold text-xl tracking-tight">Hubify</div>
          <div className="text-slate-400">&copy; 2026 Hubify. All rights reserved.</div>
          <div className="flex gap-6">
            <button onClick={() => navigate('/privacy')} className="text-slate-400 hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('/terms')} className="text-slate-400 hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>

    </div>
  );
}

