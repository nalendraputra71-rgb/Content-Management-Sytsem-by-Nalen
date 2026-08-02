const fs = require('fs');

function replaceInFile(filename) {
  let code = fs.readFileSync(filename, 'utf8');

  // Replace shareSearch input
  code = code.replace(/<input type="text" value=\{shareSearch\} onChange=\{\(e\) => setShareSearch\(e\.target\.value\)\}/g, '<DebouncedInput type="text" value={shareSearch} onChange={(e) => setShareSearch(e.target.value)}');

  // Replace shareSearch input desktop
  code = code.replace(/<input type="text" placeholder="Cari by email\/username" value=\{shareSearch\} onChange=\{\(e\) => setShareSearch\(e\.target\.value\)\}/g, '<DebouncedInput type="text" placeholder="Cari by email/username" value={shareSearch} onChange={(e) => setShareSearch(e.target.value)}');

  fs.writeFileSync(filename, code);
  console.log("Patched search " + filename);
}

replaceInFile('src/components/ContentModalMobileView.tsx');
replaceInFile('src/components/ContentModalDesktopView.tsx');
