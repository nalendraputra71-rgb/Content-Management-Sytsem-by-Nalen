const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

code = code.replace(/setAiResult\("Gagal menganalisis konten: " \+ errMsg \+ "\.\nPastikan VITE_GEMINI_API_KEY sudah diset di Settings > Secrets\."\);/g, 'setAiResult("Gagal menganalisis konten: " + errMsg + ".\\nPastikan VITE_GEMINI_API_KEY sudah diset di Settings > Secrets.");');

fs.writeFileSync('src/ContentModal.tsx', code);
