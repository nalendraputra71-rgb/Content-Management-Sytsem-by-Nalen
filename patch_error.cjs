const fs = require('fs');
let code = fs.readFileSync('src/AuthScreen.tsx', 'utf8');
code = code.replace(/default: return "Oops, something went wrong. Please try again soon.";/g, 'default: return "Oops: " + (e.message || e.code || "Unknown error");');
code = code.replace(/default: return "Oops, ada masalah sedikit nih. Coba lagi bentar ya.";/g, 'default: return "Oops: " + (e.message || e.code || "Unknown error");');
fs.writeFileSync('src/AuthScreen.tsx', code);
