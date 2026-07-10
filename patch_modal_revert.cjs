const fs = require('fs');
let code = fs.readFileSync('src/PlatformIntegrationModal.tsx', 'utf8');

// Remove manualToken state
code = code.replace(
  /const \[selectedAccount, setSelectedAccount\] = useState<string \| null>\(null\);\n  const \[manualToken, setManualToken\] = useState\(""\);/g,
  'const [selectedAccount, setSelectedAccount] = useState<string | null>(null);'
);

// Revert handleContinue logic
const targetHandleContinue = /if \(manualToken\) \{[\s\S]*?return;\n      \}\n      if \(platformId === "meta" \|\| platformId === "instagram"\) \{/g;
code = code.replace(targetHandleContinue, 'if (platformId === "meta" || platformId === "instagram") {');

// Remove manual input UI
const targetUI = /\{\(platformId === 'meta' \|\| platformId === 'instagram'\) && \([\s\S]*?<\/div>\n                    \)\}/g;
code = code.replace(targetUI, '');

fs.writeFileSync('src/PlatformIntegrationModal.tsx', code);
