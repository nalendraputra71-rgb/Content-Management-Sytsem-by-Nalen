import re

def update_file(filename, import_stmt, is_landing=False):
    with open(filename, 'r') as f:
        content = f.read()

    # Add import
    if "import { PublicHeader, PublicFooter }" not in content:
        content = content.replace("import React", "import React", 1)
        content = re.sub(r'(import .* from .*;)', r'\1\n' + import_stmt, content, count=1)

    # Remove old header
    if is_landing:
        content = re.sub(
            r'<header.*?</header>', 
            r'<PublicHeader currentLang={lang} onLangChange={handleLangChange} transparentOnTop={true} />', 
            content, flags=re.DOTALL
        )
    else:
        # In TermsAndPrivacy, they might be using <PublicHeader ... />. We just replace that.
        # But wait, in PricingPage it's `<header...`
        content = re.sub(
            r'<header.*?</header>', 
            r'<PublicHeader currentLang={lang} onLangChange={handleLangChange} />', 
            content, flags=re.DOTALL
        )

    # Remove old footer
    content = re.sub(
        r'<footer.*?</footer>', 
        r'<PublicFooter currentLang={lang} onLangChange={handleLangChange} />', 
        content, flags=re.DOTALL
    )

    with open(filename, 'w') as f:
        f.write(content)

update_file('src/LandingPage.tsx', "import { PublicHeader, PublicFooter } from './components/PublicShared';", True)
update_file('src/PricingPage.tsx', "import { PublicHeader, PublicFooter } from './components/PublicShared';")
