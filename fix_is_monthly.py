import re
with open('src/OrderSummary.tsx', 'r') as f:
    content = f.read()

content = content.replace("isMonthly ?", "!isAnnual ?")

with open('src/OrderSummary.tsx', 'w') as f:
    f.write(content)
