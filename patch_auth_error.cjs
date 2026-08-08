const fs = require('fs');
let code = fs.readFileSync('src/AuthScreen.tsx', 'utf8');

const newCase = `        case 'auth/unauthorized-domain': return "Domain ini belum diizinkan di Firebase. Tambahkan hubifysocial.com ke Firebase Console > Authentication > Settings > Authorized domains.";\n        default: return "Oops: " + (e.message || e.code || "Unknown error");`;

code = code.replace(/default: return "Oops: " \+ \(e\.message \|\| e\.code \|\| "Unknown error"\);/g, newCase);

fs.writeFileSync('src/AuthScreen.tsx', code);
