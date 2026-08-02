const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

code = code.replace(/Batas Generate AI \/ Bulan:/, "Teks Limit Credit AI / Bulan (Pricing):");

fs.writeFileSync('src/AdminPanel.tsx', code);
