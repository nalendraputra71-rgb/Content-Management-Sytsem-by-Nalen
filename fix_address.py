import re

files = ["src/LandingPage.tsx", "src/PricingPage.tsx", "src/TermsAndPrivacy.tsx"]

address_block = """
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-start gap-3 text-sm text-slate-500">
                   <div className="mt-0.5 shrink-0">
                     <MapPin size={16} className="text-slate-400" />
                   </div>
                   <div>
                     <p className="font-medium text-slate-700 mb-0.5">Hubify HQ</p>
                     <p className="leading-relaxed">Gupit, Nguter<br/>Sukoharjo, Jawa Tengah 57571</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                   <div className="shrink-0">
                     <Mail size={16} className="text-slate-400" />
                   </div>
                   <a href="mailto:support@hubifysocial.com" className="hover:text-slate-900 transition-colors">support@hubifysocial.com</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                   <div className="shrink-0">
                     <Phone size={16} className="text-slate-400" />
                   </div>
                   <a href="tel:+6281330242230" className="hover:text-slate-900 transition-colors">+62 813-3024-2230</a>
                </div>
              </div>"""

address_block_terms = address_block.replace("lang === 'id'", "currentLang === 'id'")

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    if "TermsAndPrivacy.tsx" in f:
        content = re.sub(
            r'import { Instagram, ',
            r'import { MapPin, Phone, Instagram, ',
            content
        )

    # 1. Add Address Block after language dropdown
    if "TermsAndPrivacy.tsx" not in f:
        content = re.sub(
            r'(<div className="relative inline-block w-fit">.*?</div>)',
            r'\1' + address_block,
            content,
            flags=re.DOTALL
        )
    else:
        content = re.sub(
            r'(<div className="relative inline-block w-fit">.*?</div>\s*\)\})',
            r'\1' + address_block_terms,
            content,
            flags=re.DOTALL
        )

    # 2. Add Home to Product Links
    if "TermsAndPrivacy.tsx" not in f:
        content = re.sub(
            r'(<h4 className="font-bold text-\[#0B2A4A\] mb-2 uppercase tracking-wider text-xs">\{lang === \'id\' \? \'Produk\' : \'Product\'\}</h4>)',
            r'\1\n              <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm text-left">{lang === \'id\' ? \'Beranda\' : \'Home\'}</Link>',
            content
        )
    else:
        # Terms uses a different format, it actually does NOT have product links! Wait, let's check TermsAndPrivacy.tsx links.
        pass

    with open(f, 'w') as file:
        file.write(content)

