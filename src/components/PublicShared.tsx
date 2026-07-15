import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Instagram, Twitter, Facebook, Linkedin, MapPin, Mail, Globe, ChevronDown } from 'lucide-react';
import { TiktokIcon, ThreadsIcon } from './social-icons';

export const PublicHeader = ({ currentLang, onLangChange, transparentOnTop = false }: { currentLang: 'id' | 'en', onLangChange?: (l: 'id' | 'en') => void, transparentOnTop?: boolean }) => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollY > 20 || !transparentOnTop;

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-black/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
            <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; e.currentTarget.parentElement!.nextElementSibling!.setAttribute('style', 'display: flex'); }} />
          </div>
          <div className="hidden w-10 h-10 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold text-xl">H</div>
          <span className={`font-extrabold text-xl tracking-tight ${isScrolled ? 'text-[#0B2A4A]' : 'text-[#0B2A4A]'}`}>Hubify Social</span>
        </Link>
        
        <nav className="hidden md:flex gap-8 items-center font-semibold text-sm text-[#1D4D7A]">
          <Link to="/#fitur" className="hover:text-[#0B2A4A] transition-colors">{currentLang === 'id' ? 'Fitur' : 'Features'}</Link>
          <Link to="/#analitik" className="hover:text-[#0B2A4A] transition-colors">{currentLang === 'id' ? 'Analitik' : 'Analytics'}</Link>
          <Link to="/pricing" className="hover:text-[#0B2A4A] transition-colors">{currentLang === 'id' ? 'Harga' : 'Pricing'}</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/login', { state: { mode: 'login' }})} className="hidden sm:block text-sm font-bold text-[#1D4D7A] hover:text-[#0B2A4A] transition-colors">{currentLang === 'id' ? 'Masuk' : 'Login'}</button>
          <button onClick={() => navigate('/login', { state: { mode: 'signup' }})} className="bg-[#1D4D7A] text-white text-sm font-bold py-2.5 px-5 rounded-full hover:bg-[#0B2A4A] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#1D4D7A]/20">{currentLang === 'id' ? 'Mulai Sekarang' : 'Start Now'}</button>
        </div>
      </div>
    </header>
  );
};

export const PublicFooter = ({ currentLang, onLangChange }: { currentLang: 'id' | 'en', onLangChange?: (l: 'id' | 'en') => void }) => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-10 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8 mb-16">
          {/* Brand & Social */}
          <div className="flex flex-col gap-8 lg:w-1/3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; e.currentTarget.parentElement!.nextElementSibling!.setAttribute('style', 'display: flex'); }} />
              </div>
              <div className="hidden w-10 h-10 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold text-xl">H</div>
              <span className="font-extrabold text-3xl tracking-tight text-slate-900">Hubify Social</span>
            </Link>
            
            <div className="flex items-center gap-4 text-slate-400 mt-4">
              <a href="https://www.instagram.com/hubify.social/" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com/hubifysocial" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.facebook.com/hubifysocial" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.linkedin.com/company/hubifysocial" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://www.threads.net/@hubify.social" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                <ThreadsIcon size={20} />
              </a>
              <a href="https://www.tiktok.com/@hubify.social" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                <TiktokIcon size={20} />
              </a>
            </div>
            
            {onLangChange && (
              <div className="relative inline-block w-fit">
                <select
                  value={currentLang}
                  onChange={(e) => onLangChange(e.target.value as 'id' | 'en')}
                  className="appearance-none flex items-center gap-2 py-2 pl-9 pr-8 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all w-fit cursor-pointer outline-none focus:border-slate-300 bg-transparent relative z-20"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none z-30" />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-30" />
              </div>
            )}
            
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-start gap-3 text-sm text-slate-500">
                 <div className="mt-0.5 shrink-0">
                   <MapPin size={16} className="text-slate-400" />
                 </div>
                 <div>
                   <p className="font-medium text-slate-700 mb-0.5">Hubify HQ</p>
                   <p className="leading-relaxed">Central Java, Indonesia</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 relative z-20">
                 <div className="shrink-0">
                   <Mail size={16} className="text-slate-400" />
                 </div>
                 <a href="mailto:support@hubifysocial.com" className="hover:text-slate-900 transition-colors">support@hubifysocial.com</a>
              </div>
            </div>
          </div>
          
          {/* Links - Company */}
          <div className="flex flex-col gap-4 relative z-20">
            <h4 className="font-medium text-slate-400 mb-4 text-sm">{currentLang === 'id' ? 'Produk' : 'Product'}</h4>
            <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm text-left">{currentLang === 'id' ? 'Beranda' : 'Home'}</Link>
            <Link to="/#fitur" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm text-left">{currentLang === 'id' ? 'Fitur Unggulan' : 'Features'}</Link>
            <Link to="/pricing" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm text-left">{currentLang === 'id' ? 'Paket Harga' : 'Pricing'}</Link>
          </div>
          
          <div className="flex flex-col gap-4 relative z-20">
            <h4 className="font-medium text-slate-400 mb-4 text-sm">{currentLang === 'id' ? 'Perusahaan' : 'Company'}</h4>
            <Link to="/about" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Tentang Kami' : 'About Us'}</Link>
            <Link to="/terms" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service'}</Link>
            <Link to="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</Link>
            <Link to="/refund-policy" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Kebijakan Pengembalian' : 'Refund Policy'}</Link>
          </div>
          
          {/* Links - Legal */}
          <div className="flex flex-col gap-4 relative z-20">
            <h4 className="font-medium text-slate-400 mb-4 text-sm">{currentLang === 'id' ? 'Bantuan' : 'Support'}</h4>
            <Link to="/faq" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">FAQ</Link>
            <Link to="/guides" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Panduan' : 'Guides'}</Link>
            <a href="mailto:support@hubifysocial.com" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Hubungi Kami' : 'Contact Us'}</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
          <div className="text-slate-400 font-medium text-xs">&copy; {new Date().getFullYear()} PT Harapan Untuk Bangsa. All rights reserved.</div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            Made with <Heart size={14} className="text-red-500" /> in Indonesia
          </div>
        </div>
      </div>
    </footer>
  );
};
