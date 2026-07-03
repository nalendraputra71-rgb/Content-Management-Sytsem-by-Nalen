import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, MapPin, Mail, Phone, Heart, ArrowRight } from 'lucide-react';

export const HeaderLogo = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => window.location.href = '/'}>
      <div className="w-10 h-10 flex items-center justify-center">
         <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }} />
      </div>
      <span className="font-extrabold text-xl tracking-tight text-[#0B2A4A]">Hubify<span className="text-blue-600 font-bold">Social</span></span>
    </div>
  );
};

export const SharedFooter = ({ lang, setLang }: { lang: 'id' | 'en', setLang: (l: 'id' | 'en') => void }) => {
  const location = useLocation();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-100 mt-auto w-full relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
            <HeaderLogo />
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              {lang === 'id' 
                ? 'Platform manajemen media sosial cerdas yang membantu kreator dan bisnis berkembang lebih cepat.' 
                : 'Smart social media management platform helping creators and businesses grow faster.'}
            </p>

            <div className="flex flex-col gap-2.5 text-xs text-slate-500 mt-2">
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed max-w-xs">Hubify HQ, Nguter, Sukoharjo, Jawa Tengah 57571</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <a href="mailto:support@hubifysocial.com" className="hover:text-blue-600 transition-colors font-normal">support@hubifysocial.com</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <a href="tel:+6281330242230" className="hover:text-blue-600 transition-colors font-normal">+62 813-3024-2230</a>
              </div>
            </div>
            
            {/* Language Toggle */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 mt-2 bg-slate-50 w-fit p-1 rounded-full border border-slate-100">
                <button 
                  onClick={() => setLang('id')} 
                  className={`px-3 py-1 rounded-full transition-all ${lang === 'id' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-700'}`}
                >
                  ID
                </button>
                <button 
                  onClick={() => setLang('en')} 
                  className={`px-3 py-1 rounded-full transition-all ${lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-700'}`}
                >
                  EN
                </button>
            </div>
          </div>

          {/* Links Columns Container */}
          <div className="md:col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Product Links */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-slate-900 text-sm">{lang === 'id' ? 'Produk' : 'Product'}</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link to="/#fitur" onClick={handleLinkClick} className="text-slate-500 hover:text-[#1D4D7A] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all"><ArrowRight size={12} /></span>
                    {lang === 'id' ? 'Fitur Unggulan' : 'Features'}
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" onClick={handleLinkClick} className="text-slate-500 hover:text-[#1D4D7A] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all"><ArrowRight size={12} /></span>
                    {lang === 'id' ? 'Harga' : 'Pricing'}
                  </Link>
                </li>
                <li>
                  <Link to="/guides" onClick={handleLinkClick} className="text-slate-500 hover:text-[#1D4D7A] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all"><ArrowRight size={12} /></span>
                    {lang === 'id' ? 'Panduan' : 'Guides'}
                  </Link>
                </li>
                <li>
                  <Link to="/faq" onClick={handleLinkClick} className="text-slate-500 hover:text-[#1D4D7A] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all"><ArrowRight size={12} /></span>
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-slate-900 text-sm">{lang === 'id' ? 'Perusahaan' : 'Company'}</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link to="/about" onClick={handleLinkClick} className="text-slate-500 hover:text-[#1D4D7A] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all"><ArrowRight size={12} /></span>
                    {lang === 'id' ? 'Tentang Kami' : 'About Us'}
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@hubifysocial.com" className="text-slate-500 hover:text-[#1D4D7A] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all"><ArrowRight size={12} /></span>
                    {lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Legal */}
            <div className="flex flex-col gap-4 col-span-2 sm:col-span-1">
              <h4 className="font-semibold text-slate-900 text-sm">Legal</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link to="/privacy" onClick={handleLinkClick} className="text-slate-500 hover:text-[#1D4D7A] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all"><ArrowRight size={12} /></span>
                    {lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" onClick={handleLinkClick} className="text-slate-500 hover:text-[#1D4D7A] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all"><ArrowRight size={12} /></span>
                    {lang === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service'}
                  </Link>
                </li>
                <li>
                  <Link to="/refund" onClick={handleLinkClick} className="text-slate-500 hover:text-[#1D4D7A] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 overflow-hidden group-hover:w-3 transition-all"><ArrowRight size={12} /></span>
                    {lang === 'id' ? 'Kebijakan Pengembalian' : 'Refund Policy'}
                  </Link>
                </li>
              </ul>
              
              <div className="mt-2">
                 <a href="https://www.instagram.com/hubify.social/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#1D4D7A] hover:text-white transition-all border border-slate-200 hover:border-transparent">
                    <Instagram size={14} />
                 </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs font-medium">
            &copy; {new Date().getFullYear()} PT Harapan Untuk Bangsa. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-full">
            Made with <Heart size={12} className="text-red-500 fill-red-500" /> in Indonesia
          </div>
        </div>
      </div>
    </footer>
  );
};
