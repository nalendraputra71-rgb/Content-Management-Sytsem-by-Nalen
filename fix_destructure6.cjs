const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

// replace actual newline inside the string
code = code.replace(/setAiResult\("Gagal menganalisis konten: " \+ errMsg \+ "\.\nSilakan coba lagi\."\);/g, 'setAiResult("Gagal menganalisis konten: " + errMsg + ".\\nSilakan coba lagi.");');

fs.writeFileSync('src/ContentModal.tsx', code);
