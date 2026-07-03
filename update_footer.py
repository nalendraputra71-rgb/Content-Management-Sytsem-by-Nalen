import re

files = ["src/LandingPage.tsx", "src/PricingPage.tsx", "src/TermsAndPrivacy.tsx"]

for f in files:
    with open(f, 'r') as file:
        content = file.read()

    # 1. Update logo size and text
    content = re.sub(
        r'<div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">',
        r'<div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">',
        content
    )
    content = re.sub(
        r'<div className="hidden w-8 h-8 rounded-lg bg-gradient-to-tr from-\[#1D4D7A\] to-\[#0B2A4A\] items-center justify-center text-white font-bold">H</div>',
        r'<div className="hidden w-10 h-10 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] flex items-center justify-center text-white font-bold text-xl">H</div>',
        content
    )
    content = re.sub(
        r'<span className="font-extrabold text-2xl tracking-tight text-slate-900">Hubify</span>',
        r'<span className="font-extrabold text-3xl tracking-tight text-slate-900">Hubify Social</span>',
        content
    )
    content = re.sub(
        r'<div className="font-extrabold text-2xl tracking-tight text-slate-900">Hubify</div>',
        r'''<div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/icon.png" alt="Hubify Social" className="w-full h-full object-cover scale-110" onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; e.currentTarget.parentElement.nextElementSibling.style.display = 'flex' }} />
              </div>
              <div className="hidden w-10 h-10 rounded-lg bg-gradient-to-tr from-[#1D4D7A] to-[#0B2A4A] flex items-center justify-center text-white font-bold text-xl">H</div>
              <span className="font-extrabold text-3xl tracking-tight text-slate-900">Hubify Social</span>
            </div>''',
        content
    )

    # 2. Update language dropdown for LandingPage & PricingPage
    if "TermsAndPrivacy.tsx" not in f:
        content = re.sub(
            r'<div>\s*<button \s*onClick=\{.*?\}\s*className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all w-fit"\s*>\s*<Globe size=\{16\} />\s*<span>\{.*?\}</span>\s*<ChevronDown size=\{14\} className="ml-1 text-slate-400" />\s*</button>\s*</div>',
            r'''<div className="relative inline-block w-fit">
                <select
                  value={lang}
                  onChange={(e) => handleLangChange(e.target.value as 'id' | 'en')}
                  className="appearance-none flex items-center gap-2 py-2 pl-9 pr-8 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all w-fit cursor-pointer outline-none focus:border-slate-300 bg-transparent"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>''',
            content,
            flags=re.DOTALL
        )
    else:
        # For TermsAndPrivacy, use currentLang and onLangChange
        content = re.sub(
            r'\{onLangChange && currentLang && \(\s*<div>\s*<button \s*onClick=\{.*?\}\s*className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all w-fit"\s*>\s*<Globe size=\{16\} />\s*<span>\{.*?\}</span>\s*<ChevronDown size=\{14\} className="ml-1 text-slate-400" />\s*</button>\s*</div>\s*\)\}',
            r'''{onLangChange && currentLang && (
              <div className="relative inline-block w-fit">
                <select
                  value={currentLang}
                  onChange={(e) => onLangChange(e.target.value as 'id' | 'en')}
                  className="appearance-none flex items-center gap-2 py-2 pl-9 pr-8 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all w-fit cursor-pointer outline-none focus:border-slate-300 bg-transparent"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}''',
            content,
            flags=re.DOTALL
        )

    with open(f, 'w') as file:
        file.write(content)

