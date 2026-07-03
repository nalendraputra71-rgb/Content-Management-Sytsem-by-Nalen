const fs = require('fs');

function replaceHeaderFooter(filename, isTerms) {
  let code = fs.readFileSync(filename, 'utf8');

  if (!code.includes('import { HeaderLogo, SharedFooter } from')) {
    code = `import { HeaderLogo, SharedFooter } from './SharedFooter';\n` + code;
  }

  // Replace Header Logo
  const headerLogoRegex1 = /<div className="flex items-center gap-2 cursor-pointer" onClick=\{\(\) => window\.location\.href = '\/'\}>[\s\S]*?<span className="font-extrabold text-xl tracking-tight text-\[#0B2A4A\]">Hubify.*?<\/div>/;
  const headerLogoRegex2 = /<div className="flex items-center gap-2">\s*<div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center">[\s\S]*?<a href="#" className="font-extrabold text-xl tracking-tight text-\[#0B2A4A\]">Hubify Social<\/a>\s*<\/div>/;
  const headerLogoRegex3 = /<div className="flex items-center gap-2 cursor-pointer" onClick=\{\(\) => navigate\('\/'\)\}>[\s\S]*?<span className="font-extrabold text-xl tracking-tight text-\[#0B2A4A\]">Hubify.*?<\/span>\s*<\/div>/;
  const headerLogoRegex4 = /<div className="flex items-center gap-2 cursor-pointer" onClick=\{\(\) => navigate\('\/'\)\}>[\s\S]*?<div className="font-extrabold text-xl tracking-tight text-\[#0B2A4A\]">Hubify Social<\/div>\s*<\/div>/;

  code = code.replace(headerLogoRegex1, '<HeaderLogo />');
  code = code.replace(headerLogoRegex2, '<HeaderLogo />');
  code = code.replace(headerLogoRegex3, '<HeaderLogo />');
  code = code.replace(headerLogoRegex4, '<HeaderLogo />');

  // Replace Footer
  const footerRegex = /{\/\* Footer \*\/}s*<footer[\s\S]*?<\/footer>/;
  const footerRegex2 = /{\/\* Footer \*\/}\s*<footer[\s\S]*?<\/footer>/;
  const footerRegex3 = /<footer className="bg-white border-t border-slate-200 pt-20 pb-10 px-6">[\s\S]*?<\/footer>/;

  const footerComponent = isTerms ? `<SharedFooter lang={currentLang} setLang={setCurrentLang} />` : `<SharedFooter lang={lang} setLang={setLang} />`;

  if (footerRegex.test(code)) {
    code = code.replace(footerRegex, footerComponent);
  } else if (footerRegex2.test(code)) {
    code = code.replace(footerRegex2, footerComponent);
  } else if (footerRegex3.test(code)) {
    code = code.replace(footerRegex3, footerComponent);
  }

  fs.writeFileSync(filename, code);
}

replaceHeaderFooter('src/LandingPage.tsx', false);
replaceHeaderFooter('src/PricingPage.tsx', false);
replaceHeaderFooter('src/TermsAndPrivacy.tsx', true);

