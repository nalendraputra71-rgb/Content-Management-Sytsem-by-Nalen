import re

with open('src/TermsAndPrivacy.tsx', 'r') as f:
    content = f.read()

# Add import
if "import { PublicHeader, PublicFooter }" not in content:
    content = re.sub(r'(import .* from .*;)', r'\1\nimport { PublicHeader, PublicFooter } from \'./components/PublicShared\';', content, count=1)

# Remove old definitions
content = re.sub(r'const PublicHeader =.*?^};', '', content, flags=re.DOTALL | re.MULTILINE)
content = re.sub(r'const PublicFooter =.*?^};', '', content, flags=re.DOTALL | re.MULTILINE)

with open('src/TermsAndPrivacy.tsx', 'w') as f:
    f.write(content)

