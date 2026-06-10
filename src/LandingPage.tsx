import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Calendar, BarChart2, Zap, Sparkles, LayoutDashboard, Share2, TrendingUp, Users, Clock, Instagram, Twitter, Facebook, CloudRain, CheckCircle, StickyNote, Target, ChevronRight, Flame, Activity, ArrowLeft, Bell, ChevronUp, PieChart, Search, MessageSquare, LogOut, Cloud, LayoutGrid, Edit2, Eye, Plus, FileText, Menu } from 'lucide-react';
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
  const [dragOverDate, setDragOverDate] = useState<number | null>(null);

  const [calendarItems, setCalendarItems] = useState([
    { id: 'item-1', date: 1, label: 'Welcome June! ☀️', initial: 'IG', color: 'bg-blue-100 text-blue-700' },
    { id: 'item-2', date: 2, label: 'Promo Gajian', initial: 'TK', color: 'bg-orange-100 text-[#c25a0e]' },
    { id: 'item-3', date: 4, label: 'Review Produk A', initial: 'YT', color: 'bg-red-100 text-red-700' },
    { id: 'item-4', date: 4, label: 'Behind The Scene', initial: 'IG', color: 'bg-[#d8edd9] text-[#2c6530]' },
    { id: 'item-5', date: 6, label: 'Live TikTok 6.6', initial: 'TK', color: 'bg-[#e2e8f0] text-slate-700' },
    { id: 'item-6', date: 6, label: 'Highlight Produk', initial: 'IG', color: 'bg-blue-100 text-blue-700' },
    { id: 'item-7', date: 7, label: 'Q&A Session', initial: 'FB', color: 'bg-orange-100 text-[#c25a0e]' },
    { id: 'item-8', date: 9, label: 'Teaser Project X', initial: 'IG', color: 'bg-[#d8edd9] text-[#2c6530]' },
    { id: 'item-9', date: 12, label: 'Podcast Eps 4', initial: 'SP', color: 'bg-[#e2e8f0] text-slate-700' },
    { id: 'item-10', date: 15, label: 'Katalog Update', initial: 'WEB', color: 'bg-slate-200 text-slate-700' },
    { id: 'item-11', date: 16, label: 'Greeting Card', initial: 'ALL', color: 'bg-[#d8edd9] text-[#2c6530]' },
    { id: 'item-12', date: 18, label: 'Tips & Tricks #12', initial: 'IG', color: 'bg-blue-100 text-blue-700' },
    { id: 'item-13', date: 22, label: 'User Testimonial', initial: 'TK', color: 'bg-orange-100 text-[#c25a0e]' },
    { id: 'item-14', date: 25, label: 'Payday Announcement', initial: 'ALL', color: 'bg-[#e2e8f0] text-slate-700' },
    { id: 'item-15', date: 28, label: 'Vlog Setup Meja', initial: 'YT', color: 'bg-red-100 text-red-700' },
    { id: 'item-16', date: 30, label: 'Monthly Wrap Up', initial: 'IG', color: 'bg-blue-100 text-blue-700' },
  ]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    if (e.dataTransfer.setDragImage) {
      // Optional: setting drag image if needed, for now let default handle
    }
  };

  const handleDragOver = (e: React.DragEvent, dateTarget: number) => {
    e.preventDefault();
    if (dragOverDate !== dateTarget) {
      setDragOverDate(dateTarget);
    }
  };

  const handleDragEnter = (e: React.DragEvent, dateTarget: number) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent, dateTarget: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: number) => {
    e.preventDefault();
    setDragOverDate(null);
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      setCalendarItems(prev => prev.map(item => item.id === id ? { ...item, date: targetDate } : item));
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Disable auto-rotation so drag & drop works uninterrupted
    // const interval = setInterval(() => {
    //   setCalendarViewIdx(v => (v + 1) % 4);
    // }, 4000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#2C2016] overflow-hidden selection:bg-slate-200">
      
      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrollY > 20 ? 'bg-white/80 backdrop-blur-md border-b border-black/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; e.currentTarget.parentElement!.nextElementSibling!.style.display = 'flex' }} />
            </div>
            <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold">H</div>
            <a href="#" className="font-extrabold text-xl tracking-tight text-[#0B2A4A]">Hubify Social</a>
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
            Rancang, jadwalin, dan viralin kontenmu tanpa ribet. Hubify Social menggabungkan kalender cerdas, asisten AI, dan analitik mendalam untuk bantu kamu kuasai algoritma.
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

          <div className="rounded-2xl border border-black/10 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col h-[950px] relative">
            {/* Window Header */}
            <div className="h-12 bg-slate-50 border-b border-black/5 flex items-center px-4 gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="mx-auto px-10 py-1 bg-white rounded-md text-xs font-semibold text-slate-400 border border-black/5 shadow-sm">
                Hubify Social Personal Dashboard
              </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden bg-[#F4F6F8]">
              {/* Sidebar */}
              <div className="w-64 bg-[#1B293C] text-white hidden md:flex flex-col shrink-0 text-sm overflow-hidden h-full">
                {/* Logo area */}
                <div className="h-16 px-6 flex items-center border-b border-white/5 shrink-0 gap-4">
                  <ArrowLeft size={16} className="text-white/60"/>
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white"><img src="/icon.svg" alt="Hubify" className="w-full h-full object-cover scale-110"/></div>
                  <div className="font-extrabold text-xl tracking-tight flex-1">Hubify</div>
                  <Bell size={16} className="text-white/60"/>
                </div>
                <div className="flex-1 overflow-y-auto pt-6 px-4 pb-4 space-y-8 no-scrollbar scrollbar-hide">
                  
                  {/* WORKSPACES */}
                  <div>
                    <div className="text-[10px] font-bold text-white/40 mb-3 px-2 flex justify-between uppercase tracking-wider">
                      Workspaces <ChevronUp size={12}/>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 bg-[#2D5A86] rounded-xl font-bold">
                         <div className="w-6 h-6 rounded bg-black/20 flex items-center justify-center text-xs">A</div>
                         Alex's Space
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 font-semibold">
                         <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs text-white">C</div>
                         Client A
                      </div>
                    </div>
                  </div>
                  
                  {/* SOCIAL MANAGEMENT */}
                  <div>
                    <div className="text-[10px] font-bold text-white/40 mb-3 px-2 uppercase tracking-wider">Social Management</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 bg-[#2D5A86] rounded-xl font-bold">
                        <LayoutDashboard size={16}/> Dashboard
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-white/70">
                        <Calendar size={16}/> Content Planner
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-white/70">
                        <PieChart size={16}/> Analitik
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/10 font-bold mt-2 shadow-sm text-white/90">
                        <Users size={16}/> SocHub
                      </div>
                    </div>
                  </div>

                  {/* SOCIAL STUDIO */}
                  <div>
                    <div className="text-[10px] font-bold text-white/40 mb-3 px-2 flex items-center justify-between uppercase tracking-wider">
                      Social Studio <ChevronUp size={12}/>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-white/70">
                        <Activity size={16}/> Overview
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-white/70">
                        <BarChart2 size={16}/> Analytics Expert
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-white/70">
                        <Search size={16}/> Analisis Kompetitor
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-white/70">
                        <Calendar size={16}/> Kalender Konten
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-white/70">
                        <MessageSquare size={16}/> Inbox & Komen
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profile & Logout */}
                <div className="p-4 border-t border-white/5 space-y-4 shrink-0">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden"><img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover"/></div>
                    <div>
                      <div className="font-bold">Alex</div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">PRO</span>
                        <span className="text-[10px] text-white/50">Pengaturan Profil</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[#EF4444] font-bold p-3 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer text-xs">
                    <LogOut size={14}/> LOG OUT / KELUAR
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-8 h-full bg-[#F4F6F8]">
                {/* Greetings & Top Info */}
                <div className="flex justify-between items-start">
                   <div>
                     <h1 className="text-3xl md:text-5xl font-extrabold text-[#1B293C] leading-none mb-6">Selamat Pagi,<br/><span className="text-[#2D5A86]">Alex! ☀️</span></h1>
                     
                     <div className="inline-flex items-center gap-3 bg-[#EAF0F6] text-[#2D5A86] px-4 py-2 rounded-full font-bold text-sm">
                       <TrendingUp size={16}/> GOOGLE TRENDS NAIK: <span className="text-[#1B293C]">"Work From Anywhere"</span>
                     </div>
                   </div>

                   <div className="flex flex-col items-end gap-3 text-right">
                     <div className="flex items-center gap-6">
                       <div>
                         <div className="text-slate-500 font-bold tracking-widest text-[10px] uppercase mb-1">JAKARTA</div>
                         <div className="flex items-center justify-end gap-2 text-[#1B293C]">
                           <Cloud size={24} className="text-[#2D5A86]"/> 
                           <div className="text-3xl font-bold">28.5°C</div>
                         </div>
                         <div className="text-slate-500 font-medium text-sm mt-1">Cerah & Berawan</div>
                       </div>
                       
                       <div className="w-20 h-20 rounded-full border-4 border-[#1B293C] relative flex items-center justify-center bg-[#FAFAF8] shadow-sm">
                         <div className="w-0.5 h-8 bg-[#2D5A86] absolute bottom-1/2 left-1/2 -translate-x-1/2 transform rounded-full rotate-45 origin-[50%_100%]"/>
                         <div className="w-0.5 h-6 bg-[#1B293C] absolute bottom-1/2 left-1/2 -translate-x-1/2 transform rounded-full -rotate-12 origin-[50%_100%]"/>
                       </div>
                     </div>
                     <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-[#1B293C] shadow-sm mt-2">
                        <LayoutGrid size={14}/> Atur Widget
                     </button>
                   </div>
                </div>

                {/* Goal Metrics Tiap Bulannya */}
                <div className="bg-[#1C3A5A] rounded-[24px] p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-white font-extrabold tracking-wide uppercase text-sm">Goal Metrics Tiap Bulannya</h2>
                    <button className="flex items-center gap-2 bg-white/10 text-white hover:bg-white/20 px-4 py-2.5 rounded-full text-xs font-bold transition-colors">
                      <Edit2 size={12}/> Kustomisasi Goals
                    </button>
                  </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#2D4E75] rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-white/80 font-bold text-[10px] mb-3">
                        <Eye size={14}/> TOTAL VIEWS
                      </div>
                      <div className="text-lg font-extrabold text-white mb-2">
                        2,450 <span className="text-[10px] text-white/60 font-semibold">/ 10,000</span>
                      </div>
                      <div className="text-orange-300 font-bold text-[10px]">Kurang 7,550 lagi</div>
                    </div>

                    <div className="bg-[#2D4E75] rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-white/80 font-bold text-[10px] mb-3">
                        <Users size={14}/> TOTAL REACH
                      </div>
                      <div className="text-lg font-extrabold text-white mb-2">
                        420 <span className="text-[10px] text-white/60 font-semibold">/ 1,000</span>
                      </div>
                      <div className="text-orange-300 font-bold text-[10px]">Kurang 580 lagi</div>
                    </div>

                    <div className="bg-[#2D4E75] rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-white/80 font-bold text-[10px] mb-3">
                        <Zap size={14}/> TOTAL ENGAGEMENT
                      </div>
                      <div className="text-lg font-extrabold text-white mb-2">
                        2 <span className="text-[10px] text-white/60 font-semibold">/ 5</span>
                      </div>
                      <div className="text-orange-300 font-bold text-[10px]">Kurang 3 lagi</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Daily Progress */}
                  <div className="bg-white rounded-[24px] p-6 shadow-sm border border-black/5 flex flex-col items-center justify-center text-center relative">
                    <h3 className="text-slate-400 font-extrabold tracking-widest text-xs mb-8">DAILY PROGRESS</h3>
                    <div className="relative w-40 h-40 shrink-0 flex items-center justify-center mb-4">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 overflow-visible">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#arc-gradient)" strokeWidth="12" strokeDasharray="251.3" strokeDashoffset="125.6" strokeLinecap="round" />
                          <defs>
                            <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#22c55e" />
                              <stop offset="50%" stopColor="#eab308" />
                              <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                           <div className="text-4xl font-extrabold text-[#1B293C]">50%</div>
                           <div className="text-slate-500 font-bold text-sm">Selesai 1/2</div>
                        </div>
                    </div>
                    <div className="font-extrabold text-[#1B293C] mt-2">Terus semangat!</div>
                  </div>

                  {/* To Do List */}
                  <div className="bg-white rounded-[24px] p-0 shadow-sm border border-black/5 flex flex-col overflow-hidden relative">
                    <div className="flex justify-between items-center px-6 pt-6 pb-0 border-b border-slate-100">
                       <div className="flex gap-6">
                          <div className="font-extrabold text-[#1B293C] border-b-2 border-[#1B293C] pb-3 text-sm">To Do List</div>
                          <div className="font-bold text-slate-400 pb-3 text-sm">Riwayat</div>
                       </div>
                       <button className="w-8 h-8 rounded-full bg-[#1C3A5A] text-white flex items-center justify-center -mt-3 shadow-md">
                         <Plus size={18}/>
                       </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 relative no-scrollbar">
                       <div className="absolute right-4 top-6 bottom-6 w-1.5 bg-slate-100 rounded-full">
                          <div className="w-full h-1/3 bg-slate-300 rounded-full"></div>
                       </div>
                       
                       <div className="text-center font-extrabold text-[#9C2B4E] uppercase text-[10px] tracking-wider relative">
                          <div className="absolute border-b border-black/5 w-full top-1/2 z-0"></div>
                          <span className="bg-white px-3 relative z-10">LEWAT TENGGATWAKTU</span>
                       </div>
                       
                       <div className="flex items-start gap-4">
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5 bg-white z-10"></div>
                          <div className="bg-[#FAF9F7] rounded-xl p-2.5 flex-1 border border-black/5 mr-6 shadow-sm">
                             <div className="font-extrabold text-[#1B293C] text-[10px] mb-1.5 leading-tight">Review Konten Produk A</div>
                             <div className="flex items-center gap-2 text-[9px] font-bold">
                                <span className="bg-[#FBE5E9] text-[#9C2B4E] px-1.5 py-0.5 rounded text-[8px]">KONTEN</span>
                                <span className="text-slate-400">2026-06-06</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-start gap-4">
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5 bg-white z-10"></div>
                          <div className="bg-[#FAF9F7] rounded-xl p-2.5 flex-1 border border-black/5 mr-6 shadow-sm">
                             <div className="font-extrabold text-[#1B293C] text-[10px] mb-1.5 leading-tight">Meeting Brief Campaign</div>
                             <div className="flex items-center gap-2 text-[9px] font-bold">
                                <span className="bg-[#FBE5E9] text-[#9C2B4E] px-1.5 py-0.5 rounded text-[8px]">MEETING</span>
                                <span className="text-slate-400">2026-06-06</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="text-center font-extrabold text-slate-400 uppercase text-[9px] tracking-wider relative pt-2">
                          <div className="absolute border-b border-black/5 w-full top-[16px] z-0"></div>
                          <span className="bg-white px-2 relative z-10">HARI INI</span>
                       </div>

                       <div className="flex items-start gap-4 pb-2">
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5 bg-white z-10"></div>
                          <div className="bg-[#FAF9F7] rounded-xl p-2.5 flex-1 border border-black/5 mr-6 shadow-sm">
                             <div className="font-extrabold text-[#1B293C] text-[10px] leading-tight">Upload Edukasi Series AI</div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Sticky Notes */}
                  <div className="bg-white rounded-[24px] p-6 shadow-sm border border-black/5 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-extrabold tracking-wide text-[#1B293C] flex items-center gap-2 text-sm">
                          <FileText size={16}/> STICKY NOTES
                       </h3>
                       <button className="bg-[#EAF0F6] text-[#2D5A86] px-3 py-1.5 rounded-full text-[10px] font-bold">
                         Buka Semua (4)
                       </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 flex-1">
                      <div className="bg-[#FCF5BC] rounded-[10px] p-2.5 relative shadow-sm hover:-rotate-1 transition-transform">
                         <p className="font-bold text-[#6D6222] text-[9px] leading-snug">Ingat deadline laporan bulanan hari Jumat.</p>
                      </div>
                      <div className="bg-[#FCDCA5] rounded-[10px] p-2.5 relative shadow-sm hover:rotate-1 transition-transform">
                         <p className="font-bold text-[#8C5D20] text-[9px] leading-snug">Kirim invoice ke klien restoran.</p>
                      </div>
                      <div className="bg-[#FFB1AD] rounded-[10px] p-2.5 relative shadow-sm hover:-rotate-1 transition-transform">
                         <p className="font-bold text-[#9D3B36] text-[9px] leading-snug">Ide Konten: Edukasi produk skincare B</p>
                      </div>
                      <div className="bg-[#EDAED0] rounded-[10px] p-2.5 relative shadow-sm hover:rotate-1 transition-transform">
                         <p className="font-bold text-[#8D4468] text-[9px] leading-snug">Cek revisi desain dari tim kreatif.</p>
                      </div>
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
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 hover:border-[#1D4D7A]/30 transition-colors md:col-span-3 overflow-hidden flex flex-col group min-h-[700px]">
            <div className="relative z-10 w-full mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D4D7A] flex items-center justify-center mb-6">
                <Calendar size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#0B2A4A] mb-3">Multi-View Calendar</h3>
              <p className="text-slate-600">Atur strategi besarmu dengan Board, Timeline, Tabel, atau Calendar view. Geser dan jatuhkan idemu seolah sedang bermain Lego.</p>
            </div>
            {/* Visual stacked securely below text */}
            <div className="flex-1 w-full bg-[#f8f9fa] rounded-2xl border border-black/5 flex flex-row relative overflow-hidden min-h-[550px]">
              {/* Left Sidebar (App Navigation Mock) */}
              <div className="w-64 bg-[#11233A] flex flex-col pt-4 pb-4 shrink-0 z-10 hidden md:flex border-r border-[#1D4D7A]/20">
                {/* Header */}
                <div className="px-4 flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3 text-white">
                      <ArrowLeft className="w-5 h-5 cursor-pointer text-slate-300 hover:text-white transition-colors" />
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                               <div className="w-1.5 h-1.5 bg-white rounded-full translate-x-[-2px] translate-y-[-1px]"></div>
                               <div className="w-1.5 h-1.5 bg-white rounded-full translate-x-[2px] translate-y-[-1px]"></div>
                            </div>
                         </div>
                         <span className="font-extrabold text-xl tracking-tight">Hubify</span>
                      </div>
                   </div>
                   <Bell className="w-4 h-4 text-slate-300 cursor-pointer hover:text-white transition-colors" />
                </div>

                {/* Scroller Container */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden nice-scrollbar px-3 flex flex-col gap-6">
                  {/* WORKSPACES */}
                  <div>
                    <div className="flex items-center justify-between text-[#5b7a9e] text-[10px] font-extrabold tracking-wider mb-2 px-2 uppercase">
                      <span>Workspaces</span>
                      <ChevronUp className="w-3.5 h-3.5 cursor-pointer" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-300 hover:bg-white/5 cursor-pointer transition-colors group">
                        <div className="w-6 h-6 bg-slate-700/50 rounded flex items-center justify-center text-xs font-bold text-white group-hover:bg-slate-600 transition-colors">N</div>
                        <span className="text-sm font-semibold">Nalen's</span>
                      </div>
                      <div className="flex items-center gap-3 py-2 pr-2 bg-[#1b3b64] rounded-r-lg relative cursor-pointer text-white">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r-full" />
                        <div className="w-6 h-6 bg-slate-700/50 rounded flex items-center justify-center text-xs font-bold ml-2">F</div>
                        <span className="text-sm font-bold">Fadkhy's</span>
                      </div>
                    </div>
                  </div>

                  {/* SOCIAL MANAGEMENT */}
                  <div>
                    <div className="flex items-center justify-between text-[#5b7a9e] text-[10px] font-extrabold tracking-wider mb-2 px-2 uppercase">
                      <span>Social Management</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors">
                        <LayoutGrid className="w-4 h-4" />
                        <span className="text-sm font-semibold">Dashboard</span>
                      </div>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-white bg-white/10 cursor-pointer">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold">Content Planner</span>
                      </div>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors">
                        <PieChart className="w-4 h-4" />
                        <span className="text-sm font-semibold">Analitik</span>
                      </div>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-semibold">SocHub</span>
                      </div>
                    </div>
                  </div>

                  {/* SOCIAL STUDIO */}
                  <div>
                    <div className="flex items-center justify-between text-[#5b7a9e] text-[10px] font-extrabold tracking-wider mb-2 px-2 uppercase">
                      <span>Social Studio</span>
                      <ChevronUp className="w-3.5 h-3.5 cursor-pointer" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-semibold">Overview</span>
                      </div>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors">
                        <BarChart2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">Analytics Expert</span>
                      </div>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors">
                        <Search className="w-4 h-4" />
                        <span className="text-sm font-semibold">Analisis Kompetitor</span>
                      </div>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-semibold">Kalender Konten</span>
                      </div>
                      <div className="flex items-center gap-3 px-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-semibold">Inbox & Komen</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="px-4 mt-6">
                   <div className="flex items-center gap-3 px-2 py-2 mb-4 bg-black/20 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-slate-400 overflow-hidden shrink-0">
                         <div className="w-full h-full bg-gradient-to-tr from-orange-300 to-indigo-400" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                         <span className="text-sm font-bold text-white truncate">Nalendra Putra</span>
                         <div className="flex items-center gap-2">
                            <span className="text-[8px] font-extrabold bg-blue-500 text-white px-1.5 py-0.5 rounded">PRO</span>
                            <span className="text-[9px] text-slate-400 hover:text-slate-300 cursor-pointer truncate">Pengaturan Profil</span>
                         </div>
                      </div>
                   </div>
                   <button className="w-full flex items-center justify-center gap-2 bg-[#1b3b64] hover:bg-[#224675] text-[#f87171] py-2.5 rounded-lg text-xs font-bold transition-colors">
                      <LogOut className="w-4 h-4" /> LOG OUT / KELUAR
                   </button>
                </div>
              </div>
              
              {/* Main Workspace */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                 {/* Header (Greeting & Time) */}
                 <div className="flex justify-between items-end px-4 md:px-6 py-4 bg-[#fcfdfd] border-b border-black/5">
                   <div>
                     <h2 className="text-xl md:text-3xl font-extrabold text-[#11233A] leading-tight tracking-tight">Selamat Malam,<br/><span className="text-[#1f5f99]">Nalen!</span> 🌙</h2>
                   </div>
                   <div className="text-2xl md:text-4xl font-black text-[#11233A] tracking-tighter">07:41<span className="text-sm md:text-lg font-bold text-slate-500 ml-1 tracking-normal">PM</span></div>
                 </div>
                 
                 {/* Toolbar */}
                 <div className="flex flex-wrap items-center gap-3 px-4 md:px-6 py-3 border-b border-black/5 bg-white">
                    <div className="flex bg-slate-50/80 border border-slate-200/60 rounded-full p-1 shadow-sm">
                      <div className="px-3 md:px-5 py-1.5 bg-white text-blue-700 rounded-full text-xs font-bold shadow-sm border border-slate-200/50 cursor-pointer">Bulan</div>
                      <div className="px-3 md:px-5 py-1.5 text-slate-500 rounded-full text-xs font-bold hover:bg-slate-100/50 cursor-pointer transition-colors">Board</div>
                      <div className="px-3 md:px-5 py-1.5 text-slate-500 rounded-full text-xs font-bold hover:bg-slate-100/50 cursor-pointer transition-colors">Timeline</div>
                      <div className="px-3 md:px-5 py-1.5 text-slate-500 rounded-full text-xs font-bold hover:bg-slate-100/50 cursor-pointer transition-colors">Tabel</div>
                    </div>
                    <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden md:block" />
                    <div className="flex gap-2">
                       <select className="border border-slate-200 rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 bg-white outline-none cursor-pointer hover:border-slate-300 transition-colors"><option>Juni</option></select>
                       <select className="border border-slate-200 rounded-full px-4 py-1.5 text-xs font-bold text-slate-700 bg-white outline-none cursor-pointer hover:border-slate-300 transition-colors"><option>2026</option></select>
                    </div>
                    <div className="ml-auto flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                       <div className="relative flex-1 md:flex-none">
                          <Search className="absolute left-3 top-2 text-slate-400 w-3.5 h-3.5" />
                          <input placeholder="Cari konten..." className="w-full md:w-64 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-blue-400 transition-colors" />
                       </div>
                       <button className="bg-[#1f5f99] hover:bg-[#184a78] text-white px-4 md:px-5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors shrink-0">
                          <Plus className="w-3.5 h-3.5" /> Tambah Baru
                       </button>
                       <button className="bg-[#1f5f99] hover:bg-[#184a78] text-white p-2 md:p-2 rounded-full shadow-sm transition-colors shrink-0"><Share2 className="w-3.5 h-3.5" /></button>
                    </div>
                 </div>
            
                 {/* Filters */}
                 <div className="flex flex-nowrap items-end gap-3 px-4 md:px-6 py-3 border-b border-black/5 bg-[#fcfdfd] overflow-x-auto custom-scrollbar pb-3">
                    <div className="flex flex-col gap-1 min-w-[130px] shrink-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Pillar</span>
                      <select className="border border-slate-200 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-bold text-slate-700 outline-none hover:border-slate-300 transition-colors bg-white"><option>Semua</option></select>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[130px] shrink-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Platform</span>
                      <select className="border border-slate-200 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-bold text-slate-700 outline-none hover:border-slate-300 transition-colors bg-white"><option>Semua</option></select>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[130px] shrink-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Tipe Konten</span>
                      <select className="border border-slate-200 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-bold text-slate-700 outline-none hover:border-slate-300 transition-colors bg-white"><option>Semua</option></select>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[130px] shrink-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">PIC</span>
                      <select className="border border-slate-200 rounded-full px-3 py-1.5 text-[11px] md:text-xs font-bold text-slate-700 outline-none hover:border-slate-300 transition-colors bg-white"><option>Semua</option></select>
                    </div>
                    <div className="flex gap-2 shrink-0 h-[30px] md:h-[32px]">
                      <button className="border border-slate-200 bg-white rounded-full px-4 text-[11px] md:text-xs font-bold hover:bg-slate-50 text-slate-600 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap h-full"><span>📦</span> Arsip</button>
                    </div>
                    <div className="ml-auto flex gap-2 shrink-0 h-[30px] md:h-[32px]">
                      <button className="border border-green-200 text-green-700 bg-green-50 rounded-full px-4 text-[11px] md:text-xs font-bold flex items-center gap-1.5 hover:bg-green-100 transition-colors shadow-sm whitespace-nowrap h-full">
                        <ArrowLeft className="w-3.5 h-3.5 rotate-[90deg]" /> Export Excel
                      </button>
                      <button className="border border-slate-200 bg-white rounded-full px-4 text-[11px] md:text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 text-slate-600 transition-colors shadow-sm whitespace-nowrap h-full">
                        <Plus className="w-3.5 h-3.5 text-slate-400" /> Import CSV
                      </button>
                    </div>
                 </div>
                 
                 {/* Calendar Grid */}
                 <div className="flex-1 overflow-y-auto overflow-x-auto bg-[#F8FAFC] p-4 custom-scrollbar">
                    <div className="min-w-[1050px] h-full flex flex-col">
                        {/* Days Header */}
                        <div className="grid grid-cols-7 gap-3 mb-2 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
                           <div>MIN</div><div>SEN</div><div>SEL</div><div>RAB</div><div>KAM</div><div>JUM</div><div>SAB</div>
                        </div>
                        {/* Grid */}
                        <div className="grid grid-cols-7 flex-1 gap-3 content-start">
                           {Array.from({ length: 35 }).map((_, idx) => {
                             const date = idx; // idx 0 is MIN, idx 1 is SEN.
                             const empty = date < 1 || date > 30;
                             
                             // Mock items mimicking the full month screenshot but with random new content
                             let holiday = null;
                             // Example Data Generation
                             let eventBanner = null;
                             let eventBanner2 = null;

                             if (date === 1) { holiday = "Hari Lahir Pancasila"; }
                             if (date === 2) { eventBanner = "Flash Sale"; }
                             if (date === 6) { eventBanner = "6.6 BIG SALE"; }
                             if (date === 9) { eventBanner = "Campaign Baru"; }
                             if (date === 15) { eventBanner = "Mid Month"; }
                             if (date === 16) { holiday = "Tahun Baru Islam"; }
                             if (date === 25) { eventBanner = "Payday Promo"; }

                             const itemsForDate = calendarItems.filter(item => item.date === date);
                             const count = itemsForDate.length;
    
                             return (
                               <div key={idx} 
                                 onDragOver={(e) => handleDragOver(e, date)}
                                 onDragEnter={(e) => handleDragEnter(e, date)}
                                 onDragLeave={(e) => handleDragLeave(e, date)}
                                 onDrop={(e) => handleDrop(e, date)}
                                 className={`rounded-xl border ${empty ? 'bg-transparent border-transparent pointer-events-none' : dragOverDate === date ? 'bg-blue-50 border-blue-400 border-2 border-dashed' : date === 7 ? 'bg-blue-50/50 border-blue-400 border-2 text-inherit' : 'bg-white border-slate-200'} p-2.5 flex flex-col gap-1.5 shadow-sm hover:shadow-md transition-all duration-200 min-h-[140px] relative`}
                               >
                                 {!empty && (
                                   <>
                                     <div className="flex justify-between items-start mb-1">
                                        <div className="text-xl font-extrabold text-[#11233A] leading-none tracking-tight">{date}</div>
                                        {count > 0 && (
                                          <div className="flex gap-1">
                                             <div className="bg-[#11233A] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{count}</div>
                                             <div className="text-blue-500 hover:text-blue-600 cursor-pointer w-5 h-5 flex items-center justify-center font-bold text-lg leading-none">+</div>
                                          </div>
                                        )}
                                     </div>
                                     <div className="flex flex-col gap-0.5 mb-1.5">
                                        {holiday && <div className="text-[8.5px] font-extrabold text-[#d97706] leading-tight tracking-wide uppercase px-1">{holiday}</div>}
                                        {eventBanner && <div className="bg-[#fad4b4]/60 text-[#c25a0e] text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide inline-block self-start leading-tight">{eventBanner}</div>}
                                        {eventBanner2 && <div className="bg-[#fad4b4]/60 text-[#c25a0e] text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide inline-block self-start leading-tight mt-0.5">{eventBanner2}</div>}
                                     </div>
                                     <div className="flex flex-col gap-1.5 flex-1">
                                       <AnimatePresence>
                                         {itemsForDate.map((item, j) => (
                                           <motion.div 
                                             layout
                                             layoutId={item.id}
                                             initial={{ opacity: 0, scale: 0.8 }}
                                             animate={{ opacity: 1, scale: 1 }}
                                             exit={{ opacity: 0, scale: 0.8 }}
                                             transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                             key={item.id} 
                                             draggable
                                             onDragStart={(e: any) => handleDragStart(e, item.id)}
                                             onDragEnd={() => setDragOverDate(null)}
                                             className={`cursor-grab active:cursor-grabbing px-2 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 hover:opacity-80 ${item.color}`}
                                           >
                                             <div className="w-4 h-4 rounded-full bg-[#11233A] text-white flex items-center justify-center shrink-0 shadow-sm text-[8px] transform scale-90">{item.initial}</div>
                                             <span className="truncate flex-1 tracking-tight">{item.label}</span>
                                           </motion.div>
                                         ))}
                                       </AnimatePresence>
                                     </div>
                                   </>
                                 )}
                               </div>
                             );
                           })}
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Card 2 : AI Copilot */}
          <div className="bg-[#0B2A4A] rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group md:col-span-1 flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-colors" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Copilot</h3>
              <p className="text-slate-300 mb-8">Habis ide caption? Hubify Social AI siapkan naskah, hashtag, hingga visual ide dalam detik.</p>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 mt-auto">
                 <div className="flex gap-2 mb-3 items-end">
                   <div className="bg-white/20 p-2 rounded-lg rounded-bl-none text-xs w-[90%]">Ide konten makanan untuk 17an...</div>
                 </div>
                 <div className="flex gap-2 items-start flex-row-reverse">
                   <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg rounded-br-none text-xs w-[95%] text-left shadow-lg">
                     <p className="font-bold mb-1">Ide 1: "Nasi Merdeka"</p>
                     <p className="text-[10px] text-white/80 leading-snug">Hook: Siapa bilang 17an cuma lomba balap karung?</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Card 3 : Integrasi */}
          <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-100 hover:border-indigo-300 transition-colors md:col-span-2 relative overflow-hidden flex flex-col sm:flex-row items-center gap-8">
             <div className="absolute top-4 right-6 bg-[#0B2A4A] text-white px-3 py-1 rounded-full text-xs font-bold shadow animate-bounce">COMING SOON</div>
             <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                  <Share2 size={24} />
                </div>
                <h3 className="text-3xl font-bold text-[#0B2A4A] mb-4">Integrasi Tanpa Batas</h3>
                <p className="text-slate-600 text-lg">Hubungkan semua platform dalam satu ekosistem. Distribusi konten kini cuma butuh satu kali klik, sisanya biar sistem yang urus.</p>
             </div>
             
             {/* Visual Orbit/Nodes */}
             <div className="flex-1 relative w-full h-48 flex items-center justify-center opacity-80 mix-blend-multiply sm:min-w-[200px]">
               <div className="absolute w-full h-full border-2 border-indigo-200/50 rounded-full animate-[spin_20s_linear_infinite]" />
               <div className="absolute w-2/3 h-2/3 border-2 border-indigo-300/60 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
               
               {/* Center Node */}
               <div className="w-16 h-16 bg-[#0B2A4A] rounded-2xl shadow-xl flex items-center justify-center text-white font-extrabold text-2xl z-10 relative">
                 <motion.div animate={{scale:[1, 1.1, 1]}} transition={{repeat:Infinity, duration:2}}>H.</motion.div>
               </div>
               
               {/* Orbiting Icons */}
               <motion.div animate={{y:[-8, 8, -8]}} transition={{repeat:Infinity, duration:3}} className="absolute top-2 left-1/4 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-pink-500">
                  <Instagram size={20}/>
               </motion.div>
               <motion.div animate={{y:[8, -8, 8]}} transition={{repeat:Infinity, duration:4}} className="absolute bottom-2 right-1/4 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-600">
                  <Facebook size={20}/>
               </motion.div>
               <motion.div animate={{x:[-8, 8, -8]}} transition={{repeat:Infinity, duration:3.5}} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black rounded-xl shadow-lg flex items-center justify-center text-white">
                  <Twitter size={20}/>
               </motion.div>
               <motion.div animate={{x:[8, -8, 8]}} transition={{repeat:Infinity, duration:2.5}} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-400">
                  <Share2 size={20}/>
               </motion.div>
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
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Tanpa komitmen kartu kredit. Semua paket sudah termasuk akses ke fitur dasar Hubify Social.</p>
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
          <div className="font-extrabold text-xl tracking-tight">Hubify Social</div>
          <div className="text-slate-400">&copy; 2026 Hubify Social. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

