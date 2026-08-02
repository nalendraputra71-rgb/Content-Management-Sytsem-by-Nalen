const fs = require('fs');

const missingLucideIcons = [
    "Eye", "Users", "Heart", "MessageCircle", "Share2", "Repeat", "Bookmark", 
    "MousePointer", "Target", "User", "Link2", "UserPlus", "MessageSquare", 
    "PlayCircle", "DollarSign", "Wallet", "Clock", "AlertCircle", "FileText", 
    "Megaphone", "PenTool", "Sparkles", "Music", "ExternalLink", "Hash"
];

let code = fs.readFileSync('src/utils/contentModalHelpers.tsx', 'utf8');

const lucideImport = `import { ${[...new Set(missingLucideIcons)].join(', ')} } from "lucide-react";\n`;

code = lucideImport + code;

fs.writeFileSync('src/utils/contentModalHelpers.tsx', code);
