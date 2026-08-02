const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  // It says `.join("` then newline then `")`
  code = code.replace(/\.join\("\n"\)/g, '.join("\\n")');
  code = code.replace(/\.split\(\/\[\n,\]\+\/\)/g, '.split(/[\\n,]+/)');
  code = code.replace(/\.split\("\n"\)/g, '.split("\\n")');
  code = code.replace(/\\n/g, '\\n'); // not doing anything but just in case
  fs.writeFileSync(file, code);
}

fixFile('src/components/ContentModalMobileView.tsx');
fixFile('src/components/ContentModalDesktopView.tsx');
fixFile('src/ContentModal.tsx');

