const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/\\n/g, '\n');
  fs.writeFileSync(file, code);
}

fixFile('src/components/ContentModalMobileView.tsx');
fixFile('src/components/ContentModalDesktopView.tsx');
fixFile('src/ContentModal.tsx');

