const fs = require('fs');
let code = fs.readFileSync('src/utils/contentModalHelpers.tsx', 'utf8');

code = code.replace(/import \{ import \{ import \{ doc, getDoc \} from "firebase\/firestore";/g, 'import { doc, getDoc } from "firebase/firestore";');

code = code.replace(/    I, L, B, GRP, CustomDropdown, htmlToPlainText\n\} from "\.\/data";\n  ChevronDown,([\s\S]*?)\} from "lucide-react";/g, '');

fs.writeFileSync('src/utils/contentModalHelpers.tsx', code);
