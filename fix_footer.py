import re

files = ["src/LandingPage.tsx", "src/PricingPage.tsx", "src/TermsAndPrivacy.tsx"]

for f in files:
    with open(f, 'r') as file:
        content = file.read()

    # 1. Update the grid layout
    content = re.sub(
        r'<div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">',
        r'<div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">',
        content
    )
    content = re.sub(
        r'<div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">',
        r'<div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">',
        content
    )
    
    # 2. Update Brand & Social column
    content = re.sub(
        r'<div className="md:col-span-5 flex flex-col gap-4">',
        r'<div className="col-span-1 lg:col-span-2 flex flex-col gap-8">',
        content
    )
    content = re.sub(
        r'<div className="md:col-span-5 flex flex-col gap-6">',
        r'<div className="col-span-1 lg:col-span-2 flex flex-col gap-8">',
        content
    )

    # 3. Update Link columns
    content = re.sub(
        r'<div className="md:col-span-2 flex flex-col gap-4">',
        r'<div className="col-span-1 flex flex-col gap-4">',
        content
    )

    # 4. Remove Address block completely
    content = re.sub(
        r'<div className="flex flex-col gap-3">\s*<div className="flex items-start gap-3 text-xs text-slate-500">.*?</div>\s*</div>\s*</div>\s*<div className="flex items-center gap-5 text-slate-400 mt-2">',
        r'<div className="flex items-center gap-4 text-slate-400">',
        content,
        flags=re.DOTALL
    )
    
    # Also if it's the other format:
    content = re.sub(
        r'<div className="flex flex-col gap-3">\s*<div className="flex items-start gap-3 text-xs text-slate-500">.*?</a>\s*</div>\s*</div>\s*<div className="flex items-center gap-5 text-slate-400 mt-2">',
        r'<div className="flex items-center gap-4 text-slate-400">',
        content,
        flags=re.DOTALL
    )

    # 5. Fix the social icons to remove backgrounds
    content = re.sub(
        r'<a href="([^"]+)" target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 hover:text-blue-600 transition-all">',
        r'<a href="\1" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">',
        content
    )
    content = re.sub(
        r'size={18}',
        r'size={20}',
        content
    )

    # 6. Make Language button like Notion
    if "TermsAndPrivacy.tsx" not in f:
        content = re.sub(
            r'<div className="flex bg-slate-50 p-1 rounded-full items-center border border-slate-200 w-fit mt-2">.*?</div>',
            r'''<div>
                <button 
                  onClick={() => handleLangChange(lang === 'id' ? 'en' : 'id')}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all w-fit"
                >
                  <Globe size={16} />
                  <span>{lang === 'id' ? 'Bahasa Indonesia' : 'English'}</span>
                  <ChevronDown size={14} className="ml-1 text-slate-400" />
                </button>
              </div>''',
            content,
            flags=re.DOTALL
        )
    else:
        # For TermsAndPrivacy, use currentLang and onLangChange
        content = re.sub(
            r'\{onLangChange && currentLang && \(\s*<div className="flex bg-slate-50 p-1 rounded-full items-center border border-slate-200 w-fit mt-2">.*?</div>\s*\)\}',
            r'''{onLangChange && currentLang && (
              <div>
                <button 
                  onClick={() => onLangChange(currentLang === 'id' ? 'en' : 'id')}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all w-fit"
                >
                  <Globe size={16} />
                  <span>{currentLang === 'id' ? 'Bahasa Indonesia' : 'English'}</span>
                  <ChevronDown size={14} className="ml-1 text-slate-400" />
                </button>
              </div>
            )}''',
            content,
            flags=re.DOTALL
        )

    # 7. Make Logo text black like Notion
    content = re.sub(
        r'<span className="font-extrabold text-2xl tracking-tight text-\[#0B2A4A\]">Hubify Social</span>',
        r'<span className="font-extrabold text-2xl tracking-tight text-slate-900">Hubify</span>',
        content
    )
    content = re.sub(
        r'<div className="font-extrabold text-2xl tracking-tight text-\[#0B2A4A\]">Hubify Social</div>',
        r'<div className="font-extrabold text-2xl tracking-tight text-slate-900">Hubify</div>',
        content
    )

    with open(f, 'w') as file:
        file.write(content)

