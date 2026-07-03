import re

with open('src/PricingPage.tsx', 'r') as f:
    content = f.read()

# Replace button actions for pricing plans
content = re.sub(
    r'onClick=\{\(\) => navigate\(\'/login\', \{ state: \{ mode: \'signup\' \} \}\)\}([^>]*)>(\s*)\{lang === \'id\' \? \'Mulai Gratis\' : \'Start for Free\'\}',
    r'onClick={() => navigate(`/checkout-preview?plan=free&cycle=${isAnnual ? "annual" : "monthly"}`)}\1>\2{lang === "id" ? "Mulai Gratis" : "Start for Free"}',
    content
)

content = re.sub(
    r'onClick=\{\(\) => navigate\(\'/login\', \{ state: \{ mode: \'signup\' \} \}\)\}([^>]*)>(\s*)\{lang === \'id\' \? \'Pilih Solo\' : \'Choose Solo\'\}',
    r'onClick={() => navigate(`/checkout-preview?plan=solo&cycle=${isAnnual ? "annual" : "monthly"}`)}\1>\2{lang === "id" ? "Pilih Solo" : "Choose Solo"}',
    content
)

content = re.sub(
    r'onClick=\{\(\) => navigate\(\'/login\', \{ state: \{ mode: \'signup\' \} \}\)\}([^>]*)>(\s*)\{lang === \'id\' \? \'Mulai Tim\' : \'Start Team\'\}',
    r'onClick={() => navigate(`/checkout-preview?plan=team&cycle=${isAnnual ? "annual" : "monthly"}`)}\1>\2{lang === "id" ? "Mulai Tim" : "Start Team"}',
    content
)

content = re.sub(
    r'onClick=\{\(\) => navigate\(\'/login\', \{ state: \{ mode: \'signup\' \} \}\)\}([^>]*)>(\s*)\{lang === \'id\' \? \'Hubungi Sales\' : \'Contact Sales\'\}',
    r'onClick={() => navigate(`/checkout-preview?plan=agency&cycle=${isAnnual ? "annual" : "monthly"}`)}\1>\2{lang === "id" ? "Pilih Agency" : "Choose Agency"}',
    content
)

with open('src/PricingPage.tsx', 'w') as f:
    f.write(content)

