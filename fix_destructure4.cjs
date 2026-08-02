const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

// The string literal has a literal newline inside it because \n was replaced with literal newline
code = code.replace(/setAiResult\("Gagal menganalisis konten: " \+ errMsg \+ "\.\nSilakan coba lagi\."\);/g, 'setAiResult("Gagal menganalisis konten: " + errMsg + ".\\nSilakan coba lagi.");');

fs.writeFileSync('src/ContentModal.tsx', code);
