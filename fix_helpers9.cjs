const fs = require('fs');

let code = fs.readFileSync('src/utils/contentModalHelpers.tsx', 'utf8');
// Fix imports
code = code.replace(/from "\.\/components/g, 'from "../components');
code = code.replace(/from "\.\/i18n/g, 'from "../i18n');
code = code.replace(/from "\.\/firebase/g, 'from "../firebase');
code = code.replace(/from "\.\/hooks/g, 'from "../hooks');
code = code.replace(/from "\.\/RichTextEditor/g, 'from "../RichTextEditor');
code = code.replace(/from "\.\/data/g, 'from "../data');

// Fix duplicate 'doc' and 'getDoc' imports.
// It says duplicate identifier 'doc'.
code = code.replace(/import \{ doc, getDoc \} from "firebase\/firestore";\n/, '');

// Fix 'modifiers cannot appear here' on line 89. Let's see what it is later.
fs.writeFileSync('src/utils/contentModalHelpers.tsx', code);

// In ContentModal.tsx, let's fix missing imports
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const additionalIcons = ["MessageSquare", "Layout", "Leaf", "Sparkles", "ArrowUp", "ArrowDown", "AlertTriangle", "Zap", "Calendar", "Clock", "Flag", "Paperclip", "FolderOpen", "BarChart2", "DollarSign", "RefreshCcw", "Maximize2", "PanelRight"];
const addLucide = `import { ${additionalIcons.join(', ')} } from "lucide-react";\n`;

content = content.replace(/import \{ GeminiIcon/, `${addLucide}import { fmt } from "./data";\nimport { GeminiIcon`);

fs.writeFileSync('src/ContentModal.tsx', content);

