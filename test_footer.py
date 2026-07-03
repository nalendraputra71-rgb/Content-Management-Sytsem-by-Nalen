import re

files = ["src/LandingPage.tsx", "src/PricingPage.tsx", "src/TermsAndPrivacy.tsx"]

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Replace grid with flex layout
    content = re.sub(
        r'<div className="max-w-6xl mx-auto">\s*<div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">',
        r'<div className="max-w-5xl mx-auto">\n          <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8 mb-16">',
        content
    )
    
    # Remove col-span classes from child elements
    content = re.sub(
        r'<div className="col-span-1 flex flex-col gap-8">',
        r'<div className="flex flex-col gap-8 lg:w-1/3">',
        content
    )
    content = re.sub(
        r'<div className="col-span-1 flex flex-col gap-4">',
        r'<div className="flex flex-col gap-4">',
        content
    )

    with open(f, 'w') as file:
        file.write(content)
