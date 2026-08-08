import React, { useState, useEffect } from 'react';
import { PublicHeader, PublicFooter } from './components/PublicShared';
import { useNavigate, Link } from 'react-router-dom';
import { Globe, Check, Calendar, MapPin, Phone, BarChart2, Zap, Sparkles, LayoutDashboard, Share2, TrendingUp, Users, Clock, Instagram, Twitter, Facebook, CloudRain, CheckCircle, StickyNote, Target, ChevronRight, ChevronDown, Flame, Activity, ArrowLeft, Bell, ChevronUp, PieChart, Search, MessageSquare, LogOut, Cloud, LayoutGrid, Edit2, Eye, Plus, FileText, Menu, Linkedin, Mail, Heart, Home, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TiktokIcon, ThreadsIcon } from './components/social-icons';

import { useI18n } from './i18n';

const analyticsData = [
  { name: 'Mon', views: 4000, engagement: 2400 },
  { name: 'Tue', views: 3000, engagement: 1398 },
  { name: 'Wed', views: 2000, engagement: 9800 },
  { name: 'Thu', views: 2780, engagement: 3908 },
  { name: 'Fri', views: 1890, engagement: 4800 },
  { name: 'Sat', views: 2390, engagement: 3800 },
  { name: 'Sun', views: 3490, engagement: 4300 },
];

export const getFaqs = (lang: string) => [
  {
    q: lang === 'id' ? "Apa itu Hubify Social?" : "What is Hubify Social?",
    a: lang === 'id' ? "Hubify Social adalah all-in-one platform untuk manajemen sosial media yang dilengkapi dengan AI untuk membantu kreator dan bisnis merencanakan, membuat, dan menganalisis konten secara lebih efektif." : "Hubify Social is an all-in-one platform for social media management equipped with AI to help creators and businesses plan, create, and analyze content more effectively."
  },
  {
    q: lang === 'id' ? "Apakah ada versi gratisnya?" : "Is there a free version?",
    a: lang === 'id' ? "Saat ini kami menawarkan masa percobaan (trial) gratis selama 30 hari untuk paket Starter, sehingga Anda dapat mengeksplorasi semua fitur dasar tanpa komitmen kartu kredit." : "We currently offer a 30-day free trial for the Starter plan, so you can explore all basic features with no credit card commitment."
  },
  {
    q: lang === 'id' ? "Apakah saya bisa menghubungkan banyak akun sosial media?" : "Can I connect multiple social media accounts?",
    a: lang === 'id' ? "Tentu! Paket Starter kami mendukung hingga 3 integrasi akun sosial media, dan Anda bisa menambahkannya lebih banyak jika mengupgrade ke paket Growth Master." : "Of course! Our Starter plan supports up to 3 social media account integrations, and you can add more by upgrading to the Growth Master plan."
  },
  {
    q: lang === 'id' ? "Bagaimana cara kerja AI Generator di Hubify?" : "How does the AI Generator work in Hubify?",
    a: lang === 'id' ? "AI Generator kami menggunakan teknologi AI yang dilatih khusus untuk menghasilkan caption, ide konten, hingga strategi pilar yang relevan dengan niche audiens Anda dalam hitungan detik." : "Our AI Generator uses AI technology specifically trained to generate captions, content ideas, and pillar strategies relevant to your audience niche in seconds."
  },
  {
    q: lang === 'id' ? "Apakah data saya aman?" : "Is my data secure?",
    a: lang === 'id' ? "Keamanan data Anda adalah prioritas utama kami. Kami menggunakan infrastruktur standar industri dengan enkripsi data dan secara rutin melakukan audit keamanan untuk memastikan privasi Anda terlindungi." : "Your data security is our top priority. We use industry-standard infrastructure with data encryption and regularly conduct security audits to ensure your privacy is protected."
  },
  {
    q: lang === 'id' ? "Bisakah saya membatalkan langganan kapan saja?" : "Can I cancel my subscription at any time?",
    a: lang === 'id' ? "Tentu saja. Anda dapat membatalkan langganan kapan saja melalui menu pengaturan akun Anda. Akses fitur berbayar akan tetap tersedia hingga akhir siklus penagihan Anda." : "Absolutely. You can cancel your subscription at any time through your account settings menu. Access to paid features will remain available until the end of your billing cycle."
  }
];

export function FAQItem({ faq }: { faq: { q: string, a: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all hover:border-blue-200">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
      >
        <span className="font-bold text-[#0B2A4A] text-lg">{faq.q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="text-blue-500 w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-5 text-slate-500">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MediaWithFallback({ src, alt, className, isVideo = false }: { src: string, alt: string, className?: string, isVideo?: boolean }) {
  const [hasError, setHasError] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHasError(false);
    setVideoFailed(false);
    setIsPlaying(false);
  }, [src, isVideo]);

  // Handle programmatic autoplay to bypass modern browser restrictions
  useEffect(() => {
    if (isVideo && !videoFailed && videoRef.current) {
      const video = videoRef.current;
      video.defaultMuted = true;
      video.muted = true;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.log("Autoplay was prevented by browser security/settings:", err);
            setIsPlaying(false);
          });
      }
    }
  }, [src, isVideo, videoFailed]);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (hasError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-[#FAFAFA] to-slate-50 flex flex-col items-center justify-center p-6 text-center border border-black/[0.05] rounded-xl min-h-[300px] ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-400 mb-4 animate-pulse">
          {isVideo ? <Video size={24} className="text-[#1D4D7A]" /> : <Sparkles size={24} className="text-[#1D4D7A]" />}
        </div>
        <p className="font-bold text-[#111827] text-sm mb-1.5">
          {isVideo ? 'Ganti / Unggah video di folder public!' : 'Ganti screenshot ini di folder public!'}
        </p>
        
        {isVideo ? (
          <div className="text-[11px] text-slate-500 max-w-sm leading-relaxed space-y-2 text-left bg-white/60 p-4 rounded-xl border border-black/[0.03]">
            <p className="font-semibold text-[#111827] text-center mb-1">Cara Unggah Video MP4:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Siapkan video Anda berasio <strong className="text-black">16:10</strong> (format <strong className="text-black">MP4</strong>).</li>
              <li>Buka file explorer di panel kiri AI Studio.</li>
              <li>Klik kanan pada folder <code className="bg-black/5 px-1.5 py-0.5 rounded font-mono font-bold text-red-500">public</code> dan pilih <strong className="text-black">Upload Files</strong>.</li>
              <li>Pilih video Anda lalu rename filenya menjadi <code className="bg-black/5 px-1.5 py-0.5 rounded font-mono font-bold text-red-500">calendar-month.mp4</code>.</li>
            </ol>
            <p className="text-red-500 font-medium text-center mt-2">Error: File video saat ini rusak atau format tidak didukung.</p>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
            Simpan file gambar Anda dengan nama <code className="bg-black/5 px-1.5 py-0.5 rounded text-red-500 font-mono font-bold">{src.split('/').pop()}</code> berasio <strong className="text-[#111827]">16:10</strong> di folder <code className="bg-black/5 px-1.5 py-0.5 rounded font-mono font-bold">public/</code>.
          </p>
        )}
      </div>
    );
  }

  if (isVideo && !videoFailed) {
    return (
      <div className="relative w-full h-full cursor-pointer group/video" onClick={handleVideoClick}>
        <video 
          ref={videoRef}
          src={src} 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setVideoFailed(true)}
          className={`${className} object-cover w-full h-full`}
        />
        
        {/* Play/Pause Overlay Indicator if blocked or paused */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[2px] transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-white/95 text-[#1D4D7A] flex items-center justify-center shadow-xl border border-black/5 transform transition-transform group-hover/video:scale-110">
                <Video size={24} className="ml-0.5 fill-[#1D4D7A]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <img 
      src={isVideo ? src.replace('.mp4', '.png') : src} 
      alt={alt} 
      onError={() => setHasError(true)}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  const [selectedFeatureTab, setSelectedFeatureTab] = useState<'calendar' | 'trends' | 'scheduler' | 'hubai' | 'heatmap'>('calendar');
  const [trendsPlatform, setTrendsPlatform] = useState<'tiktok' | 'instagram' | 'twitter'>('tiktok');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: 'user' | 'ai', text: string }>>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const { lang, setLang } = useI18n();

  useEffect(() => {
    document.title = lang === 'id' ? 'Hubify Social - Manajemen Media Sosial AI' : 'Hubify Social - AI Social Media Management';
  }, [lang]);

  useEffect(() => {
    // Reset AI Chat history when language changes
    setAiChatHistory([
      { sender: 'ai', text: lang === 'id' ? 'Halo Creator! Klik salah satu tombol asisten di atas untuk mencoba Hub.AI 🪄' : 'Hello Creator! Click any assistant action above to test Hub.AI 🪄' }
    ]);
  }, [lang]);

  const handleLangChange = (l: 'id' | 'en') => {
    setLang(l);
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#2C2016] overflow-hidden selection:bg-slate-200">
      
      {/* Navigation */}
      <PublicHeader currentLang={lang} onLangChange={handleLangChange} transparentOnTop={true} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 px-6 min-h-[95vh] flex flex-col items-center justify-center">
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

        {/* Animated Background Decorative Dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden md:block">
          {/* Small decorative dots/shapes */}
          <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-[15%] left-[10%] w-3 h-3 bg-yellow-400 rounded-full" />
          <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute top-[25%] right-[10%] w-4 h-4 bg-purple-400 rounded-full" />
          <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 3.5, repeat: Infinity, delay: 2 }} className="absolute bottom-[20%] left-[15%] w-2.5 h-2.5 bg-blue-400 rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center z-10 relative">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[38px] xs:text-[42px] sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold tracking-tight text-[#0B2A4A] leading-[1.12] sm:leading-[1.08] mb-6 flex flex-col items-center text-center w-full"
          >
            {lang === 'id' ? (
              <>
                <span className="block sm:hidden">Satu Dashboard.</span>
                <span className="block sm:hidden">Semua Konten.</span>
                <span className="block sm:hidden text-transparent bg-clip-text bg-gradient-to-r from-[#1D4D7A] to-blue-500 mt-1">Markas Besar</span>
                <span className="block sm:hidden text-transparent bg-clip-text bg-gradient-to-r from-[#1D4D7A] to-blue-500">Kreativitasmu.</span>

                <span className="hidden sm:block sm:whitespace-nowrap">Satu Dashboard. Semua Konten.</span>
                <span className="hidden sm:block text-transparent bg-clip-text bg-gradient-to-r from-[#1D4D7A] to-blue-500 mt-2 md:mt-4">Markas Besar Kreativitasmu.</span>
              </>
            ) : (
              <>
                <span className="block sm:hidden">One Dashboard.</span>
                <span className="block sm:hidden">All Content.</span>
                <span className="block sm:hidden text-transparent bg-clip-text bg-gradient-to-r from-[#1D4D7A] to-blue-500 mt-1">Your Creative</span>
                <span className="block sm:hidden text-transparent bg-clip-text bg-gradient-to-r from-[#1D4D7A] to-blue-500">Headquarters.</span>

                <span className="hidden sm:block sm:whitespace-nowrap">One Dashboard. All Content.</span>
                <span className="hidden sm:block text-transparent bg-clip-text bg-gradient-to-r from-[#1D4D7A] to-blue-500 mt-2 md:mt-4">Your Creative Headquarters.</span>
              </>
            )}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-base md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {lang === 'id' 
              ? 'Rancang, jadwalin, dan viralin kontenmu tanpa ribet. Hubify Social menggabungkan kalender cerdas, asisten AI, dan analitik mendalam untuk bantu kamu kuasai algoritma.' 
              : 'Design, schedule, and make your content go viral without the hassle. Hubify Social combines smart calendars, AI assistants, and deep analytics to help you master the algorithm.'}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-6 sm:px-4"
          >
            <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="bg-[#1D4D7A] text-white font-bold py-2.5 px-5 sm:py-4 sm:px-8 rounded-full text-xs sm:text-lg hover:bg-[#0B2A4A] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-[#1D4D7A]/20 flex items-center justify-center gap-1.5 sm:gap-2">
              {lang === 'id' ? 'Gas Sekarang! — Gratis 30 Hari' : 'Start Now! — 30 Days Free'} <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
            </button>
            <button onClick={() => { document.getElementById('dashboard-visual')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-white text-[#1D4D7A] font-bold py-2.5 px-5 sm:py-4 sm:px-8 rounded-full text-xs sm:text-lg border border-black/5 hover:border-black/10 hover:shadow-md transition-all flex items-center justify-center gap-1.5 sm:gap-2">
              <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> {lang === 'id' ? 'Lihat Interfacenya' : 'See the Interface'}
            </button>
          </motion.div>
        </div>

        {/* Hero Mockup */}
        <motion.div 
          id="dashboard-visual"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
          className="mt-12 sm:mt-20 w-full max-w-5xl mx-auto relative z-20 scroll-mt-24 px-4 sm:px-8 md:px-12 lg:px-16"
        >
          {/* Tooltip Keterangan Bikin Animate Banget - Fully Responsive */}
          <motion.div 
            initial={{opacity:0, scale:0.8}} 
            animate={{opacity:1, scale:1}} 
            transition={{delay:1.5}} 
            className="absolute -top-4 left-2 sm:left-4 md:left-2 lg:-left-10 xl:-left-20 bg-[#0B2A4A] text-white px-2 py-1 sm:px-3 sm:py-2 md:px-3.5 md:py-2.5 rounded-lg sm:rounded-xl md:rounded-2xl text-[8px] sm:text-xs font-bold shadow-xl md:shadow-2xl rotate-[-5deg] z-30 border border-white/10"
          >
            Cuaca & Jam Real-time! 🌦️
          </motion.div>
          <motion.div 
            initial={{opacity:0, scale:0.8}} 
            animate={{opacity:1, scale:1}} 
            transition={{delay:2}} 
            className="absolute -top-1 right-2 sm:right-4 md:right-2 lg:-right-10 xl:-right-20 bg-pink-500 text-white px-2 py-1 sm:px-3 sm:py-2 md:px-3.5 md:py-2.5 rounded-lg sm:rounded-xl md:rounded-2xl text-[8px] sm:text-xs font-bold shadow-xl md:shadow-2xl rotate-[5deg] z-30 border border-white/10"
          >
            Cek Progress Kerjaanmu ✨
          </motion.div>
          <motion.div 
            initial={{opacity:0, scale:0.8}} 
            animate={{opacity:1, scale:1}} 
            transition={{delay:2.5}} 
            className="absolute bottom-4 left-2 sm:left-8 md:left-6 lg:-left-4 xl:-left-14 bg-yellow-400 text-black px-2 py-1 sm:px-3 sm:py-2 md:px-3.5 md:py-2.5 rounded-lg sm:rounded-xl md:rounded-2xl text-[8px] sm:text-xs font-bold shadow-xl md:shadow-2xl rotate-[3deg] z-30 border border-black/5"
          >
            Sticky Notes Digital 📝
          </motion.div>

          {/* Premium Floating Social & Productivity Icons - Perfectly Anchored & Responsive */}
          {/* Instagram Icon (Pink/Orange Gradient with active badge) */}
          <motion.div 
            animate={{ y: [0, -6, 0], rotate: [-10, -6, -10] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 sm:-left-6 md:-left-12 lg:-left-20 xl:-left-32 top-[12%] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white p-1.5 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-white/20 items-center justify-center w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 z-30 flex"
          >
            <Instagram className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 sm:w-5 sm:h-5 flex items-center justify-center text-[7px] sm:text-[10px] font-bold border border-white shadow">3</span>
          </motion.div>

          {/* TikTok Icon (Sleek Black with Cyan active badge) */}
          <motion.div 
            animate={{ y: [0, 8, 0], rotate: [8, 12, 8] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-2 sm:-right-6 md:-right-12 lg:-right-20 xl:-right-32 top-[24%] bg-black text-white p-1.5 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-white/10 items-center justify-center w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 z-30 flex"
          >
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.589 6.686a4.793 4.793 0 01-3.975-4.685h-3.65v15.348c0 2.213-1.802 4.015-4.015 4.015-2.214 0-4.015-1.802-4.015-4.015 0-2.214 1.801-4.015 4.015-4.015a4.01 4.01 0 013.064 1.455v-3.79a7.664 7.664 0 00-3.064-.622c-4.226 0-7.665 3.44-7.665 7.665 0 4.226 3.439 7.665 7.665 7.665 4.225 0 7.664-3.439 7.664-7.665v-6.6a8.49 8.49 0 004.605 1.365V8.04c-1.637 0-3.136-.576-4.329-1.354z"/>
            </svg>
            <span className="absolute -top-1 -right-1 bg-cyan-400 text-black rounded-full w-3.5 h-3.5 sm:w-5 sm:h-5 flex items-center justify-center text-[7px] sm:text-[10px] font-bold border border-white shadow">8</span>
          </motion.div>

          {/* LinkedIn Icon (Professional Blue) */}
          <motion.div 
            animate={{ y: [0, -6, 0], x: [0, 4, 0], rotate: [-5, 0, -5] }} 
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -left-3 sm:-left-8 md:-left-16 lg:-left-24 xl:-left-36 bottom-[18%] bg-[#0A66C2] text-white p-1.5 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-white/20 items-center justify-center w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 z-30 flex"
          >
            <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
            </svg>
          </motion.div>

          {/* Sparkles Icon (Sleek White with Green Glow & animated badge) */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [8, 12, 8] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -right-3 sm:-right-8 md:-right-16 lg:-right-24 xl:-right-36 bottom-[8%] bg-white text-emerald-500 p-1.5 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-black/5 items-center justify-center w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 z-30 flex"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border border-white animate-ping" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border border-white" />
          </motion.div>

          <div className="max-w-[840px] mx-auto rounded-2xl border border-black/10 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col relative w-full">
            {/* Window Header */}
            <div className="h-11 bg-slate-50 border-b border-black/5 flex items-center px-4 gap-2 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="mx-auto px-4 py-0.5 bg-white rounded-md text-[10px] sm:text-xs font-semibold text-slate-400 border border-black/5 shadow-xs truncate max-w-[150px] sm:max-w-none">
                hubify.social
              </div>
            </div>
            
            {/* Image Container with 16:10 ratio */}
            <div className="w-full aspect-[16/10] bg-[#F4F6F8] relative overflow-hidden">
              <MediaWithFallback 
                src="/dashboard-screenshot.png" 
                alt="Hubify Dashboard Screenshot" 
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>
          </div>
        </motion.div>
      </section>
      <section id="fitur" className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-4">{lang === 'id' ? 'Senjata Rahasia' : "The Secret Weapon for"} <span className="text-[#1D4D7A]">Content Creator</span></h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">{lang === 'id' ? 'Dirancang bukan sekedar menyimpan ide, tapi untuk mengeksekusi tren lebih cepat, lebih cerdas.' : 'Designed not just to store ideas, but to execute trends faster and smarter.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dynamic Hubify Social Feature Showcase */}
          <div className="bg-white rounded-3xl p-6 md:p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-black/5 hover:border-[#1D4D7A]/15 transition-colors md:col-span-3 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 lg:items-stretch group min-h-[500px] lg:min-h-[600px]">
            {/* Left Content Side: Information & Tab Switcher (Width: 4/12) */}
            <div className="flex flex-col lg:col-span-4 justify-between z-10 w-full mb-8 lg:mb-0">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D4D7A] flex items-center justify-center mb-6 shadow-sm border border-[#1D4D7A]/10">
                  {selectedFeatureTab === 'calendar' && <Calendar size={24} />}
                  {selectedFeatureTab === 'trends' && <BarChart2 size={24} />}
                  {selectedFeatureTab === 'scheduler' && <Clock size={24} />}
                  {selectedFeatureTab === 'hubai' && <Sparkles size={24} className="text-[#1D4D7A]" />}
                  {selectedFeatureTab === 'heatmap' && <LayoutGrid size={24} />}
                </div>

                {/* Animated content switching based on selected tab */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedFeatureTab}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.25 }}
                    className="min-h-[140px] sm:min-h-[160px]"
                  >
                    {selectedFeatureTab === 'calendar' && (
                      <>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B2A4A] mb-4 tracking-tight">
                          {lang === 'id' ? 'Kalender Simple Drag & Drop' : 'Simple Drag & Drop Calendar'}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                          {lang === 'id' 
                            ? 'Rancang strategi besarmu secara visual. Jadwalkan konten semudah menggeser lego ke tanggal yang diinginkan.' 
                            : 'Visually plan your master strategy. Schedule posts as easily as snapping Lego bricks onto your desired dates.'}
                        </p>
                      </>
                    )}
                    {selectedFeatureTab === 'trends' && (
                      <>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B2A4A] mb-4 tracking-tight">
                          {lang === 'id' ? 'Trends & Predictive Analytics' : 'Trends & Predictive Analytics'}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                          {lang === 'id' 
                            ? 'Berhenti meraba-raba algoritma. Dapatkan data pertumbuhan engagement, retensi penonton, dan hashtag viral secara real-time di satu dasbor.' 
                            : 'Stop guessing the algorithm. Get real-time growth engagement, audience retention, and viral hashtag insights on a single screen.'}
                        </p>
                      </>
                    )}
                    {selectedFeatureTab === 'scheduler' && (
                      <>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B2A4A] mb-4 tracking-tight">
                          {lang === 'id' ? 'Omnichannel Post & Schedule' : 'Omnichannel Post & Schedule'}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                          {lang === 'id' 
                            ? 'Tulis satu kali, publish otomatis ke semua platform. Jadwalkan Reels, TikTok, hingga Threads di waktu paling prima dengan sekali klik.' 
                            : 'Write once, publish everywhere automatically. Schedule your Reels, TikTok, and Threads to drop right at peak engagement.'}
                        </p>
                      </>
                    )}
                    {selectedFeatureTab === 'hubai' && (
                      <>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B2A4A] mb-4 tracking-tight flex items-center gap-2">
                          {lang === 'id' ? 'Hub.AI Co-Pilot' : 'Hub.AI Co-Pilot'}
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                          {lang === 'id' 
                            ? 'Asisten pintar AI khusus kreator yang nempel di ruang kerja Anda. Racik hook video viral, tulis naskah Reels, hingga riset hashtag terpanas tanpa perlu buka tab lain.' 
                            : 'An intelligent, built-in AI companion. Craft high-CTR hooks, write full video scripts, and research popular trends without ever switching tabs.'}
                        </p>
                      </>
                    )}
                    {selectedFeatureTab === 'heatmap' && (
                      <>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B2A4A] mb-4 tracking-tight">
                          {lang === 'id' ? 'Audience Activity Heatmap' : 'Audience Activity Heatmap'}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                          {lang === 'id' 
                            ? 'Petakan jam-jam emas audiens Anda secara visual. Ketahui detik paling optimal untuk posting agar organic reach dan viralitas konten melesat maksimal.' 
                            : 'Visually map your audience\'s golden hours. Know exactly when to publish for maximum organic reach and instant virality.'}
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Responsive Container for Switcher with Arrow Indicators */}
              <div className="relative mt-6">
                {/* Mobile Scroll Hint & Navigation Arrows */}
                <div className="flex sm:hidden justify-between items-center px-1 mb-2">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    💡 {lang === 'id' ? 'Geser untuk fitur lain' : 'Swipe to explore features'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        const el = document.getElementById('feature-tab-scroller');
                        if (el) el.scrollBy({ left: -110, behavior: 'smooth' });
                      }}
                      className="w-6 h-6 rounded-full bg-white border border-black/10 shadow-sm flex items-center justify-center text-[#1D4D7A] hover:bg-slate-50 active:scale-90 transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold">↔️</span>
                    <button 
                      onClick={() => {
                        const el = document.getElementById('feature-tab-scroller');
                        if (el) el.scrollBy({ left: 110, behavior: 'smooth' });
                      }}
                      className="w-6 h-6 rounded-full bg-white border border-black/10 shadow-sm flex items-center justify-center text-[#1D4D7A] hover:bg-slate-50 active:scale-90 transition-all"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scroll on mobile, Vertical stack on desktop - Premium, Compact, Interactive */}
                <div 
                  id="feature-tab-scroller"
                  className="flex overflow-x-auto sm:flex-col gap-2 p-1.5 bg-slate-50/80 rounded-2xl border border-black/[0.03] scrollbar-none snap-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {(['calendar', 'trends', 'scheduler', 'hubai', 'heatmap'] as const).map((view) => {
                    const isActive = selectedFeatureTab === view;
                    return (
                      <button
                        key={view}
                        onClick={() => setSelectedFeatureTab(view)}
                        className={`flex-shrink-0 snap-center px-4 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-xs md:text-sm font-bold transition-all duration-200 flex items-center gap-2 sm:justify-between group/btn ${
                          isActive
                            ? 'bg-[#1D4D7A] text-white shadow-md'
                            : 'text-slate-600 hover:text-black hover:bg-black/[0.02]'
                        }`}
                      >
                        <span className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
                          {view === 'calendar' && <Calendar className="w-4 h-4 shrink-0" />}
                          {view === 'trends' && <BarChart2 className="w-4 h-4 shrink-0" />}
                          {view === 'scheduler' && <Clock className="w-4 h-4 shrink-0" />}
                          {view === 'hubai' && <Sparkles className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />}
                          {view === 'heatmap' && <LayoutGrid className="w-4 h-4 shrink-0" />}
                          
                          <span>
                            {view === 'calendar' && (lang === 'id' ? 'Kalender Simple' : 'Simple Calendar')}
                            {view === 'trends' && (lang === 'id' ? 'Trends & Analitik' : 'Trends & Analytics')}
                            {view === 'scheduler' && (lang === 'id' ? 'Post & Schedule' : 'Post & Schedule')}
                            {view === 'hubai' && 'Hub.AI Beta'}
                            {view === 'heatmap' && (lang === 'id' ? 'Activity Heatmap' : 'Activity Heatmap')}
                          </span>
                        </span>
                        
                        {view === 'scheduler' && (
                          <span className={`text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                          }`}>SOON</span>
                        )}
                        {view === 'hubai' && (
                          <span className={`text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive ? 'bg-amber-400 text-[#0B2A4A]' : 'bg-amber-100 text-amber-800'
                          }`}>BETA</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Visual Side: Edge-to-edge Premium Browser Mockup (Width: 8/12) */}
            <div className="lg:col-span-8 w-full flex items-center justify-center">
              <div className="w-full bg-[#FAFAFA] rounded-3xl border border-black/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col transition-all duration-300">
                {/* Minimalist Browser Header */}
                <div className="h-11 bg-white border-b border-black/[0.04] flex items-center px-4 justify-between text-xs font-medium text-slate-400 select-none shrink-0">
                  <div className="flex gap-2 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E1E1E1]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ECECEC]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F3F3F3]" />
                  </div>
                  <div className="bg-slate-50 px-4 sm:px-8 py-0.5 sm:py-1 rounded-full border border-black/[0.03] text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-wide truncate max-w-[150px] sm:max-w-none">
                    hubify.social/app/{selectedFeatureTab}
                  </div>
                  <div className="w-8" />
                </div>

                {/* Media Container - 100% Edge-to-Edge with 16:10 Ratio */}
                <div className="w-full aspect-[16/10] relative bg-[#FAFAFA] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedFeatureTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full"
                    >
                      <MediaWithFallback 
                        src={selectedFeatureTab === 'calendar' ? '/calendar-month.mp4' : `/calendar-${selectedFeatureTab}.png`} 
                        alt={`${selectedFeatureTab} View`} 
                        className="w-full h-full object-cover select-none"
                        isVideo={selectedFeatureTab === 'calendar'}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 : AI Copilot */}
          <div className="bg-[#0B2A4A] rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group md:col-span-1 flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-colors" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Copilot</h3>
              <p className="text-slate-300 mb-8 text-sm sm:text-base">{lang === 'id' ? 'Habis ide caption? Hubify Social AI siapkan naskah, hashtag, hingga visual ide dalam detik.' : 'Ran out of caption ideas? Hubify Social AI prepares scripts, hashtags, and visual ideas in seconds.'}</p>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 mt-auto">
                 <div className="flex gap-2 mb-3 items-end">
                   <div className="bg-white/20 p-2 rounded-lg rounded-bl-none text-xs w-[90%]">{lang === 'id' ? 'Ide konten makanan untuk 17an...' : 'Food content ideas for Independence Day...'}</div>
                 </div>
                 <div className="flex gap-2 items-start flex-row-reverse">
                   <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg rounded-br-none text-xs w-[95%] text-left shadow-lg">
                     <p className="font-bold mb-1">{lang === 'id' ? 'Ide 1: "Nasi Merdeka"' : 'Idea 1: "Merdeka Rice"'}</p>
                     <p className="text-[10px] text-white/80 leading-snug">{lang === 'id' ? 'Hook: Siapa bilang 17an cuma lomba balap karung?' : 'Hook: Who says Independence Day is only sack races?'}</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Card 3 : Integrasi */}
          <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-100 hover:border-indigo-300 transition-colors md:col-span-2 relative overflow-hidden flex flex-col sm:flex-row items-center gap-8">
             <div className="absolute top-4 right-6 bg-[#0B2A4A] text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow animate-bounce z-20">COMING SOON</div>
             <div className="flex-1 w-full">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                  <Share2 size={24} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0B2A4A] mb-4">{lang === 'id' ? 'Integrasi Tanpa Batas' : 'Limitless Integration'}</h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{lang === 'id' ? 'Hubungkan semua platform dalam satu ekosistem. Distribusi konten kini cuma butuh satu kali klik, sisanya biar sistem yang urus.' : 'Connect all platforms in one ecosystem. Content distribution now only takes one click, let the system handle the rest.'}</p>
             </div>
             
             {/* Visual Orbit/Nodes */}
             <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center opacity-80 mix-blend-multiply shrink-0 mx-auto">
               <div className="absolute w-full h-full border-2 border-indigo-200/50 rounded-full animate-[spin_20s_linear_infinite]" />
               <div className="absolute w-2/3 h-2/3 border-2 border-indigo-300/60 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
               
               {/* Center Node */}
               <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0B2A4A] rounded-2xl shadow-xl flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl z-10 relative">
                 <motion.div animate={{scale:[1, 1.1, 1]}} transition={{repeat:Infinity, duration:2}}>H.</motion.div>
               </div>
               
               {/* Orbiting Icons */}
               <motion.div animate={{y:[-6, 6, -6]}} transition={{repeat:Infinity, duration:3}} className="absolute top-1 left-[15%] w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-pink-500">
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5"/>
               </motion.div>
               <motion.div animate={{y:[6, -6, 6]}} transition={{repeat:Infinity, duration:4}} className="absolute bottom-1 right-[15%] w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-blue-600">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5"/>
               </motion.div>
               <motion.div animate={{x:[-6, 6, -6]}} transition={{repeat:Infinity, duration:3.5}} className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-xl shadow-md flex items-center justify-center text-white">
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5"/>
               </motion.div>
               <motion.div animate={{x:[6, -6, 6]}} transition={{repeat:Infinity, duration:2.5}} className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-blue-400">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5"/>
               </motion.div>
             </div>
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section id="analitik" className="py-16 md:py-24 px-6 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            
            <div className="w-full lg:w-2/5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-6">
                <TrendingUp size={16} /> {lang === 'id' ? 'Insight Mendalam' : 'Deep Insights'}
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-6 leading-tight">{lang === 'id' ? 'Berhenti Menebak,' : 'Stop Guessing,'}<br/>{lang === 'id' ? 'Mulai Menganalisa.' : 'Start Analyzing.'}</h2>
              <p className="text-base sm:text-lg text-slate-500 mb-8">{lang === 'id' ? 'Ketahui pasti kapan audiensmu aktif, konten mana yang paling mendatangkan cuan, dan optimasi jadwal postingmu berdasarkan data nyata.' : 'Know exactly when your audience is active, which content brings the most profit, and optimize your posting schedule based on real data.'}</p>
              
              <ul className="space-y-4">
                {(lang === 'id' ? [
                  "Pelajari Heatmap 'Best Time to Upload'",
                  "Bandingkan performa Multi-Platform dalam satu layar",
                  "Laporan otomatis 10 Konten Terbaik vs Terburuk"
                ] : [
                  "Study the 'Best Time to Upload' Heatmap",
                  "Compare Multi-Platform performance on one screen",
                  "Automated report of Top 10 Best vs Worst Content"
                ]).map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#0B2A4A] font-medium text-sm sm:text-base">
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
                <div className="bg-white rounded-3xl shadow-2xl border border-black/5 p-4 sm:p-6 md:col-span-2">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-400 mb-1">Total Engagement</div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#0B2A4A]">32,490</div>
                    </div>
                    <div className="bg-green-100 text-green-700 px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1">
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
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
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
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-orange-100 p-4 sm:p-5 overflow-hidden">
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
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-5 flex flex-col justify-center">
                  <div className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Activity size={16} /> 10 Top vs 10 Bad Content</div>
                  <div className="flex flex-col gap-3">
                    <motion.div whileHover={{x:5}} className="bg-green-50/50 p-2 rounded-lg border border-green-100/50 flex flex-col gap-1 cursor-default">
                      <div className="flex items-center justify-between text-xs font-bold text-green-800">
                        <span className="truncate pr-2">🏆 "POV SCBD Payday"</span> <span className="text-green-600 bg-green-100 px-1 rounded shrink-0">↑ 2.4k</span>
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

      {/* FAQ Section */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0B2A4A] mb-4">{lang === 'id' ? 'Pertanyaan yang Sering Diajukan' : 'Frequently Asked Questions'}</h2>
            <p className="text-base sm:text-lg text-slate-500">{lang === 'id' ? 'Temukan jawaban untuk pertanyaan umum tentang Hubify Social.' : 'Find answers to common questions about Hubify Social.'}</p>
          </div>
          <div className="space-y-4">
            {getFaqs(lang).map((faq, idx) => (
              <div key={idx}>
                <FAQItem faq={faq} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-16 md:py-24 px-6 bg-gradient-to-br from-[#0B2A4A] to-[#1D4D7A] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-6 px-4">{lang === 'id' ? 'Siap Jadikan Kontenmu Level Selanjutnya?' : 'Ready to Take Your Content to the Next Level?'}</h2>
          <p className="text-blue-100 text-sm sm:text-lg mb-8 sm:mb-10 px-4">{lang === 'id' ? 'Ribuan kreator sudah menghemat berjam-jam waktu mingguan mereka. Sekarang giliranmu.' : 'Thousands of creators have saved hours of their weekly time. Now it\'s your turn.'}</p>
          <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="bg-white text-[#0B2A4A] font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-base sm:text-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all">
            {lang === 'id' ? 'Mulai Bangun Markasmu 🚀' : 'Start Building Your HQ 🚀'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter currentLang={lang} onLangChange={handleLangChange} />

    </div>
  );
}

