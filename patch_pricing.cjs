const fs = require('fs');

function patchFile(path) {
    if (!fs.existsSync(path)) return;
    let code = fs.readFileSync(path, 'utf8');
    
    code = code.replace(/aiGenerationPerMonth: 10/g, 'aiCreditsPerMonth: 100000');
    code = code.replace(/aiGenerationPerMonth/g, 'aiCreditsPerMonth');
    code = code.replace(/10 Prompts/g, '100K Credits');
    code = code.replace(/Prompts/g, 'Credits');
    code = code.replace(/x Generate AI \/ Bulan/g, 'AI Credits / Bulan');
    code = code.replace(/x AI Generation \/ Month/g, 'AI Credits / Month');
    code = code.replace(/maxAiGenerations/g, 'aiTokenLimit');
    
    fs.writeFileSync(path, code);
}

patchFile('src/PricingPage.tsx');
patchFile('src/BillingView.tsx');
patchFile('src/App.tsx');
patchFile('src/ContentModal.tsx');
patchFile('src/AnalyticsView.tsx');
patchFile('src/SocialStudioView.tsx');
patchFile('src/HubAiTab.tsx');

console.log("Patched limits everywhere");
