const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

code = code.replace(/value=\{modalPriceMonthly \|\| ""\}/g, 'value={modalPriceMonthly === 0 ? 0 : (modalPriceMonthly || "")}');
code = code.replace(/value=\{modalOriginalPriceMonthly \|\| ""\}/g, 'value={modalOriginalPriceMonthly === 0 ? 0 : (modalOriginalPriceMonthly || "")}');
code = code.replace(/value=\{modalPriceAnnual \|\| ""\}/g, 'value={modalPriceAnnual === 0 ? 0 : (modalPriceAnnual || "")}');
code = code.replace(/value=\{modalOriginalPriceAnnual \|\| ""\}/g, 'value={modalOriginalPriceAnnual === 0 ? 0 : (modalOriginalPriceAnnual || "")}');

fs.writeFileSync('src/AdminPanel.tsx', code);
