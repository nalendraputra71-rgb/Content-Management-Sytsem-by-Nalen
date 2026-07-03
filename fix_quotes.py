import re

files = ["src/LandingPage.tsx", "src/PricingPage.tsx", "src/TermsAndPrivacy.tsx"]

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Fix escaped quotes
    content = content.replace(r"\'", "'")

    with open(f, 'w') as file:
        file.write(content)

