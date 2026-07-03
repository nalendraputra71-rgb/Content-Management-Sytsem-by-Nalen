const fs = require('fs');

const headerLogo = `          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; e.currentTarget.parentElement.nextElementSibling.style.display = 'flex' }} />
            </div>
            <div className="hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] items-center justify-center text-white font-bold">H</div>
            <span className="font-extrabold text-xl tracking-tight text-[#0B2A4A]">Hubify Social</span>
          </div>`;

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
                {lang === 'id' 
                  ? 'Platform manajemen media sosial pintar untuk kreator dan bisnis. Jadwalkan, analisis, dan kolaborasi dalam satu markas.' 
                  : 'Smart social media management platform for creators and businesses. Schedule, analyze, and collaborate in one smart hub.'}
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
                  onClick={() => handleLangChange('id')} 
                  className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${lang === 'id' ? 'bg-white text-[#0B2A4A] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-[#0B2A4A] bg-transparent'}\`}
                >
                  ID
                </button>
                <button 
                  onClick={() => handleLangChange('en')} 
                  className={\`px-4 py-1.5 rounded-full text-xs font-bold transition-all \${lang === 'en' ? 'bg-white text-[#0B2A4A] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-[#0B2A4A] bg-transparent'}\`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Links - Company */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <h4 className="font-bold text-[#0B2A4A] mb-2 uppercase tracking-wider text-xs">{lang === 'id' ? 'Produk' : 'Product'}</h4>
              <Link to="/#fitur" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm text-left">{lang === 'id' ? 'Fitur Unggulan' : 'Features'}</Link>
              <Link to="/pricing" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm text-left">{lang === 'id' ? 'Paket Harga' : 'Pricing'}</Link>
            </div>
            
            <div className="md:col-span-2 flex flex-col gap-4">
              <h4 className="font-bold text-[#0B2A4A] mb-2 uppercase tracking-wider text-xs">{lang === 'id' ? 'Perusahaan' : 'Company'}</h4>
              <Link to="/about" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">{lang === 'id' ? 'Tentang Kami' : 'About Us'}</Link>
              <Link to="/terms" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">{lang === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service'}</Link>
              <Link to="/privacy" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">{lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</Link>
            </div>
            
            {/* Links - Legal */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <h4 className="font-bold text-[#0B2A4A] mb-2 uppercase tracking-wider text-xs">{lang === 'id' ? 'Bantuan' : 'Support'}</h4>
              <Link to="/faq" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">FAQ</Link>
              <a href="mailto:support@hubifysocial.com" className="text-slate-500 hover:text-blue-600 transition-colors font-medium text-sm">{lang === 'id' ? 'Hubungi Kami' : 'Contact Us'}</a>
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

// Update LandingPage.tsx
let landingCode = fs.readFileSync('src/LandingPage.tsx', 'utf8');
const landingHeaderLogoRegex = /<div className="flex items-center gap-2">\s*<div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">[\s\S]*?<a href="#" className="font-extrabold text-xl tracking-tight text-\[#0B2A4A\]">Hubify Social<\/a>\s*<\/div>/;
landingCode = landingCode.replace(landingHeaderLogoRegex, headerLogo);

const landingFooterRegex = /{\/\* Footer \*\/}s*<footer[\s\S]*?<\/footer>/;
// Let's replace the whole footer
const landingFooterSplit = landingCode.split('{/* Footer */}');
if (landingFooterSplit.length > 1) {
  const beforeFooter = landingFooterSplit[0];
  const afterFooterPart = landingFooterSplit[1].substring(landingFooterSplit[1].indexOf('</footer>') + 9);
  landingCode = beforeFooter + footerContent + afterFooterPart;
}
if (!landingCode.includes('import { Link } from')) {
    if(!landingCode.includes('Link')) {
      landingCode = landingCode.replace("import { useNavigate", "import { useNavigate, Link");
    }
}
fs.writeFileSync('src/LandingPage.tsx', landingCode);

// Update PricingPage.tsx
let pricingCode = fs.readFileSync('src/PricingPage.tsx', 'utf8');
const pricingHeaderLogoRegex = /<div className="flex items-center gap-2 cursor-pointer" onClick=\{\(\) => navigate\('\/'\)\}>\s*<div className="w-9 h-9 bg-gradient-to-br[\s\S]*?<Flame size=\{20\} className="text-white" \/>\s*<\/div>\s*<span className="font-extrabold text-xl tracking-tight text-\[#0B2A4A\] hidden sm:block">Hubify<span className="text-blue-500">Social<\/span><\/span>\s*<\/div>/;
pricingCode = pricingCode.replace(pricingHeaderLogoRegex, headerLogo);

const pricingFooterSplit = pricingCode.split('{/* Footer */}');
if (pricingFooterSplit.length > 1) {
  const beforeFooter = pricingFooterSplit[0];
  const afterFooterPart = pricingFooterSplit[1].substring(pricingFooterSplit[1].indexOf('</footer>') + 9);
  pricingCode = beforeFooter + footerContent + afterFooterPart;
}
if (!pricingCode.includes('Heart')) {
    pricingCode = pricingCode.replace("import { Check, Flame, ArrowLeft, Instagram, MapPin, Mail, Phone } from 'lucide-react';", "import { Check, Flame, ArrowLeft, Instagram, MapPin, Mail, Phone, Heart } from 'lucide-react';");
}
fs.writeFileSync('src/PricingPage.tsx', pricingCode);

