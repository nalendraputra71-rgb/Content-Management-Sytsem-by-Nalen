import re

files = ["src/LandingPage.tsx", "src/PricingPage.tsx", "src/TermsAndPrivacy.tsx"]

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # 1. Change max-w-7xl to max-w-6xl in footer only
    content = re.sub(
        r'<footer className="bg-white border-t border-slate-200 pt-12 pb-10 px-6">\s*<div className="max-w-7xl mx-auto">',
        r'<footer className="bg-white border-t border-slate-200 pt-12 pb-10 px-6">\n        <div className="max-w-6xl mx-auto">',
        content
    )
    
    # 2. Change lg:grid-cols-5 to lg:grid-cols-4
    content = content.replace("lg:grid-cols-5", "lg:grid-cols-4")
    
    # 3. Change lg:col-span-2 to lg:col-span-1 for Brand & Social
    content = content.replace('<div className="col-span-1 lg:col-span-2 flex flex-col gap-8">', '<div className="col-span-1 flex flex-col gap-8">')
    
    with open(f, 'w') as file:
        file.write(content)

