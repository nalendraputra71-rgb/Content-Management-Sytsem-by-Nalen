const fs = require('fs');

const missingLucideIcons = ["Trash", "Send", "Globe", "Check", "Link2", "ExternalLink", "Search", "UserCheck", "X", "ChevronDown", "AlertCircle", "Megaphone", "Eye", "Users", "Heart", "MessageCircle", "Bookmark", "MousePointerClick", "RefreshCw", "Archive", "Play", "Link", "Share2", "Plus", "GripVertical", "FileText", "Image as ImageIcon", "CheckCircle", "Video", "Smartphone", "Copy", "Info", "MoreVertical", "Lock", "Shield", "AtSign", "Settings", "Settings2", "Trash2"];
const missingDataImports = ["I", "B", "CARD", "MK", "MC", "eng", "gps", "L", "GRP", "CustomDropdown", "htmlToPlainText"];

let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const lucideImport = `import { ${[...new Set(missingLucideIcons)].join(', ')} } from "lucide-react";`;
const dataImport = `import { ${missingDataImports.join(', ')} } from "./data";`;
const reactImport = `import React from "react";`;

code = code.replace(/import \{ GeminiIcon/, `${reactImport}\n${lucideImport}\n${dataImport}\nimport { GeminiIcon`);

fs.writeFileSync('src/ContentModal.tsx', code);
