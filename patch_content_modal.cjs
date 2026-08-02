const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

code = code.replace(/import \{ ContentModalMobileView \} from "\.\/components\/ContentModalMobileView";/m, `import { usePlanLimits } from "./hooks/usePlanLimits";\nimport { ContentModalMobileView } from "./components/ContentModalMobileView";`);

fs.writeFileSync('src/ContentModal.tsx', code);
console.log("Patched ContentModal");
