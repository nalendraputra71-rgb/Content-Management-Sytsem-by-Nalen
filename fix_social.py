import re

files = ["src/LandingPage.tsx", "src/PricingPage.tsx", "src/TermsAndPrivacy.tsx"]

clean_social = """<div className="flex items-center gap-4 text-slate-400 mt-4">
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
              </div>"""

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    content = re.sub(r'<div className="flex items-center gap-[45] text-slate-400.*?</div>', clean_social, content, flags=re.DOTALL)
    
    with open(f, 'w') as file:
        file.write(content)
