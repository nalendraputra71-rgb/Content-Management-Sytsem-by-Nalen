const fs = require('fs');

let code = fs.readFileSync('src/TermsAndPrivacy.tsx', 'utf8');

const headerLogo = `        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
            <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; e.currentTarget.parentElement.nextElementSibling.style.display = 'flex' }} />
          </div>
          <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold">H</div>
          <span className="font-extrabold text-xl tracking-tight text-[#0B2A4A]">Hubify Social</span>
        </div>`;

const headerLogoRegex = /<div className="flex items-center gap-2 cursor-pointer" onClick=\{\(\) => navigate\('\/'\)\}>\s*<div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">[\s\S]*?<div className="font-extrabold text-xl tracking-tight text-\[#0B2A4A\]">Hubify Social<\/div>\s*<\/div>/g;

code = code.replace(headerLogoRegex, headerLogo);

const footerContent = `{/* Footer */}
    <footer className="bg-white border-t border-slate-200 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand & Social */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; e.currentTarget.parentElement.nextElementSibling.style.display = 'flex' }} />
              </div>
              <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold">H</div>
              <span className="font-extrabold text-2xl tracking-tight text-[#0B2A4A]">Hubify Social</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              {currentLang === 'en' 
                ? 'Smart social media management platform for creators and businesses. Schedule, analyze, and collaborate in one smart hub.'
                : 'Platform manajemen media sosial pintar untuk kreator dan bisnis. Jadwalkan, analisis, dan kolaborasi dalam satu markas.'}
            </p>
            
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
              <div className="flex items-start gap-4 text-sm text-slate-500">
                 <div className="mt-0.5 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                   <MapPin size={16} className="text-blue-600" />
                 </div>
                 <div>
                   <p className="font-bold text-[#0B2A4A] mb-1">Hubify HQ</p>
                   <p className="leading-relaxed">Gupit, Nguter<br/>Sukoharjo, Jawa Tengah 57571</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                 <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                   <Mail size={16} className="text-blue-600" />
                 </div>
                 <a href="mailto:support@hubifysocial.com" className="hover:text-blue-600 transition-colors font-medium">support@hubifysocial.com</a>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                 <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                   <Phone size={16} className="text-blue-600" />
                 </div>
                 <a href="tel:+6281330242230" className="hover:text-blue-600 transition-colors font-medium">+62 813-3024-2230</a>
              </div>
            </div>

            <div className="flex items-center gap-5 text-slate-400 mt-2">
              <a href="https://www.instagram.com/hubify.social/" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 hover:text-blue-600 transition-all">
                <Instagram size={18} />
              </a>
            </div>
            
            <div className="flex bg-slate-50 p-1 rounded-full items-center border border-slate-200 w-fit mt-2">
              <button 
                onClick={() => setCurrentLang('id')} 
                className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${currentLang === 'id' ? 'bg-white text-[#0B2A4A] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-[#0B2A4A] bg-transparent'}\`}
              >
                ID
              </button>
              <button 
                onClick={() => setCurrentLang('en')} 
                className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${currentLang === 'en' ? 'bg-white text-[#0B2A4A] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-[#0B2A4A] bg-transparent'}\`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Links - Company */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold text-[#0B2A4A] mb-2 uppercase tracking-wider text-xs">{currentLang === 'id' ? 'Produk' : 'Product'}</h4>
            <Link to="/#fitur" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm text-left">{currentLang === 'id' ? 'Fitur Unggulan' : 'Features'}</Link>
            <Link to="/pricing" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm text-left">{currentLang === 'id' ? 'Paket Harga' : 'Pricing'}</Link>
          </div>
          
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold text-[#0B2A4A] mb-2 uppercase tracking-wider text-xs">{currentLang === 'id' ? 'Perusahaan' : 'Company'}</h4>
            <Link to="/about" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Tentang Kami' : 'About Us'}</Link>
            <Link to="/terms" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service'}</Link>
            <Link to="/privacy" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</Link>
          </div>
          
          {/* Links - Legal */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold text-[#0B2A4A] mb-2 uppercase tracking-wider text-xs">{currentLang === 'id' ? 'Bantuan' : 'Support'}</h4>
            <Link to="/faq" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">FAQ</Link>
            <a href="mailto:support@hubifysocial.com" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">{currentLang === 'id' ? 'Hubungi Kami' : 'Contact Us'}</a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 font-medium text-xs">&copy; {new Date().getFullYear()} PT Harapan Untuk Bangsa. All rights reserved.</div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            Made with <Heart size={14} className="text-red-500" /> in Indonesia
          </div>
        </div>
      </div>
    </footer>`;

const footerRegex = /{\/\* Footer \*\/}s*<footer[\s\S]*?<\/footer>/g;
code = code.replace(footerRegex, footerContent);

if (!code.includes('MapPin')) {
    code = code.replace("import { ChevronDown, ArrowLeft, Heart, Mail, Phone, Instagram } from 'lucide-react';", "import { ChevronDown, ArrowLeft, Heart, Mail, Phone, Instagram, MapPin } from 'lucide-react';");
    code = code.replace("import { ArrowLeft, Mail, Phone, Instagram, Heart } from 'lucide-react';", "import { ArrowLeft, Mail, Phone, Instagram, Heart, MapPin } from 'lucide-react';");
}

fs.writeFileSync('src/TermsAndPrivacy.tsx', code);

