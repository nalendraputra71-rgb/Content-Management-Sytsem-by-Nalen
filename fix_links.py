import re

files = ["src/LandingPage.tsx", "src/PricingPage.tsx", "src/TermsAndPrivacy.tsx"]

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Check if 'Refund Policy' already exists, if not, add it
    if "Refund Policy" not in content and "Kebijakan Pengembalian" not in content:
        if "TermsAndPrivacy" not in f:
            content = re.sub(
                r'(<Link to="/privacy".*?>.*?Privacy Policy.*?<\/Link>)',
                r'\1\n              <Link to="/refund" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{lang === \'id\' ? \'Kebijakan Pengembalian\' : \'Refund Policy\'}</Link>',
                content
            )
        else:
            content = re.sub(
                r'(<Link to="/privacy".*?>.*?Privacy Policy.*?<\/Link>)',
                r'\1\n            <Link to="/refund" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{currentLang === \'id\' ? \'Kebijakan Pengembalian\' : \'Refund Policy\'}</Link>',
                content
            )
    
    # Check if 'Guides' already exists, if not, add it
    if "Guides" not in content and "Panduan" not in content:
        if "TermsAndPrivacy" not in f:
            content = re.sub(
                r'(<Link to="/faq".*?>FAQ<\/Link>)',
                r'\1\n              <Link to="/guides" className="text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">{lang === \'id\' ? \'Panduan\' : \'Guides\'}</Link>',
                content
            )
        else:
            pass # We saw TermsAndPrivacy already had Guides

    # Also for TermsAndPrivacy, rename the heading "Legal" to "Support" to match others, and move the links around if needed
    
    with open(f, 'w') as file:
        file.write(content)

