const fs = require('fs');
let code = fs.readFileSync('src/utils/contentModalHelpers.tsx', 'utf8');

// Remove the garbage from line 43 to 110
code = code.replace(/    I, L, B, GRP, CustomDropdown, htmlToPlainText\n\} from "\.\/data";([\s\S]*?)\} from "lucide-react";\n/g, '');

code = code.replace(/export const props = /g, 'const props = ');

fs.writeFileSync('src/utils/contentModalHelpers.tsx', code);
