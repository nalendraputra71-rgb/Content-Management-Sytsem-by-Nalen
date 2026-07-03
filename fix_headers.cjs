const fs = require('fs');

function replaceAllHeaders(filename) {
    let code = fs.readFileSync(filename, 'utf8');

    // Remove the old header blocks completely. We'll search for 'flex items-center gap-2 cursor-pointer'
    // or something similar, up to the end of that div.
    
    // In LandingPage.tsx
    code = code.replace(/<div className="flex items-center gap-2 cursor-pointer"[^>]*>[\s\S]*?<img src="\/icon.png"[\s\S]*?Hubify Social<\/span>\s*<\/div>/g, '<HeaderLogo />');
    
    // In TermsAndPrivacy.tsx
    code = code.replace(/<div className="flex items-center gap-2 cursor-pointer"[^>]*>[\s\S]*?<img src="\/icon.png"[\s\S]*?Hubify Social<\/div>\s*<\/div>/g, '<HeaderLogo />');

    // In PricingPage.tsx
    code = code.replace(/<div className="flex items-center gap-2 cursor-pointer"[^>]*>[\s\S]*?<img src="\/icon.png"[\s\S]*?Hubify Social<\/span>\s*<\/div>/g, '<HeaderLogo />');

    fs.writeFileSync(filename, code);
}

replaceAllHeaders('src/LandingPage.tsx');
replaceAllHeaders('src/TermsAndPrivacy.tsx');
replaceAllHeaders('src/PricingPage.tsx');

