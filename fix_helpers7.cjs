const fs = require('fs');
let code = fs.readFileSync('src/utils/contentModalHelpers.tsx', 'utf8');

code = code.replace(/import \{\s*import \{\s*import \{\s*doc, getDoc\s*\} from "firebase\/firestore";/g, 'import { doc, getDoc } from "firebase/firestore";');

code = code.replace(/\s*I, L, B, GRP, CustomDropdown, htmlToPlainText\s*\} from "\.\/data";[\s\S]*?\} from "lucide-react";/g, '');

fs.writeFileSync('src/utils/contentModalHelpers.tsx', code);
