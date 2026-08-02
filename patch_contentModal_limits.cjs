const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const importReplacement = `import { usePlanLimits } from "./hooks/usePlanLimits";`;
code = code.replace(/import \{ usePlanLimits \} from "\.\/hooks\/usePlanLimits";/g, ''); // Ensure no duplicate
code = code.replace(/import \{ useAuth \} from "\.\/contexts\/AuthContext";/, `import { useAuth } from "./contexts/AuthContext";\nimport { usePlanLimits } from "./hooks/usePlanLimits";`);

const customFieldReplacement = `
  const { aiTokenLimit, hasCapability } = usePlanLimits();

  const addCustomField = () => {
    if (!canEdit) return;
    if (!hasCapability('customColumn')) {
      alert(lang === 'id' ? 'Upgrade paket untuk menambah Kustom Kolom Brief.' : 'Upgrade plan to add Custom Brief Columns.');
      return;
    }
    isDirty.current = true;
`;

code = code.replace(/  const \{ aiTokenLimit \} = usePlanLimits\(\);\n/g, '');
code = code.replace(/  const addCustomField = \(\) => \{\n    if \(!canEdit\) return;\n    isDirty\.current = true;/g, customFieldReplacement);

fs.writeFileSync('src/ContentModal.tsx', code);
