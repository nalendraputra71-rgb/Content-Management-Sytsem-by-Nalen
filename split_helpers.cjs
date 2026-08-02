const fs = require('fs');

const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');
const exportContentModalIdx = code.indexOf('export function ContentModal({');

const beforeComponent = code.substring(0, exportContentModalIdx);
const afterComponent = code.substring(exportContentModalIdx);

const imports = beforeComponent.match(/^import .*$/gm).join('\n');
const helpers = beforeComponent.replace(/^import .*$/gm, '').trim();

fs.writeFileSync('src/utils/contentModalHelpers.tsx', `
${imports}
import { doc, getDoc } from "firebase/firestore";

${helpers.replace(/const /g, 'export const ')}
`);

// Now modify ContentModal.tsx to import them
const helperNamesMatch = helpers.match(/^const ([a-zA-Z0-9_]+) /gm);
const helperNames = helperNamesMatch.map(m => m.replace('const ', '').trim());

let newCode = `${imports}\nimport { ${helperNames.join(', ')} } from "./utils/contentModalHelpers";\n\n${afterComponent}`;
fs.writeFileSync('src/ContentModal.tsx', newCode);

console.log("Helpers extracted:", helperNames.length);
