const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  // It's really hard to parse.
  // Instead, I'll find all strings that look like they were broken
  code = code.replace(/"\n"/g, '"\\n"');
  code = code.replace(/"\.\nSilakan coba lagi\."/g, '".\\nSilakan coba lagi."');
  fs.writeFileSync(file, code);
}

fixFile('src/components/ContentModalMobileView.tsx');
fixFile('src/components/ContentModalDesktopView.tsx');
fixFile('src/ContentModal.tsx');
