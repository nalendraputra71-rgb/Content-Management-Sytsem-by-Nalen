const fs = require('fs');
let content = fs.readFileSync('src/AnalyticsTab.tsx', 'utf8');
let social = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const declarations = new Set();
const stateMatches = [...social.matchAll(/const \[([a-zA-Z0-9_]+), ([a-zA-Z0-9_]+)\] = useState/g)];
stateMatches.forEach(m => { declarations.add(m[1]); declarations.add(m[2]); });

const otherMatches = [...social.matchAll(/const ([a-zA-Z0-9_]+) = /g)];
otherMatches.forEach(m => { declarations.add(m[1]); });

const functionMatches = [...social.matchAll(/function ([a-zA-Z0-9_]+)/g)];
functionMatches.forEach(m => { declarations.add(m[1]); });

const usedInTab = Array.from(declarations).filter(v => {
    // Only match whole words
    const regex = new RegExp(`\\b${v}\\b`);
    return regex.test(content);
});

// Remove some common ones that are imported
const toRemove = ['React', 'motion', 'AnimatePresence', 'useState', 'useEffect'];
const finalVars = usedInTab.filter(v => !toRemove.includes(v));

console.log("Used variables:");
console.log(finalVars.join(', '));
