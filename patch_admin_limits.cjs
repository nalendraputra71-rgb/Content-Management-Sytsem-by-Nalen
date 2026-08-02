const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.tsx', 'utf8');

// Replace aiGenerationPerMonth with aiCreditsPerMonth
code = code.replace(/aiGenerationPerMonth: 10/g, 'aiCreditsPerMonth: 100000');
code = code.replace(/aiGenerationPerMonth: 100/g, 'aiCreditsPerMonth: 1000000');
code = code.replace(/aiGenerationPerMonth: 500/g, 'aiCreditsPerMonth: 5000000');
code = code.replace(/aiGenerationPerMonth: -1/g, 'aiCreditsPerMonth: -1');
code = code.replace(/aiGenerationPerMonth/g, 'aiCreditsPerMonth');
code = code.replace(/100 Prompts/g, '1M Credits');
code = code.replace(/500 Prompts/g, '5M Credits');
code = code.replace(/10 Prompts/g, '100K Credits');
code = code.replace(/Batas Generate AI \/ Bulan/g, 'Batas AI Credits / Bulan');
code = code.replace(/AI Generation \/ Month/g, 'AI Credits / Month');
code = code.replace(/AI \/bln/g, 'Credits/bln');
code = code.replace(/defaultValue=\{editingPlan\.limits\?\.aiCreditsPerMonth \?\? 50\}/g, 'defaultValue={editingPlan.limits?.aiCreditsPerMonth ?? 500000}');

fs.writeFileSync('src/AdminPanel.tsx', code);
console.log("Updated AdminPanel limits");
