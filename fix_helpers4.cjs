const fs = require('fs');
let code = fs.readFileSync('src/utils/contentModalHelpers.tsx', 'utf8');

const lucideImport = `import { Target, AlertCircle, FileText, Megaphone, PenTool, Users, Sparkles, Eye, Music, ExternalLink, Hash } from "lucide-react";\n`;

// Add imports
if (!code.includes("lucide-react")) {
    code = lucideImport + code;
}

fs.writeFileSync('src/utils/contentModalHelpers.tsx', code);
