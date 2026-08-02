const fs = require('fs');

let social = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const declarations = new Set();
const stateMatches = [...social.matchAll(/const \[([a-zA-Z0-9_]+), ([a-zA-Z0-9_]+)\] = useState/g)];
stateMatches.forEach(m => { declarations.add(m[1]); declarations.add(m[2]); });

const otherMatches = [...social.matchAll(/const ([a-zA-Z0-9_]+) = /g)];
otherMatches.forEach(m => { declarations.add(m[1]); });

const functionMatches = [...social.matchAll(/function ([a-zA-Z0-9_]+)/g)];
functionMatches.forEach(m => { declarations.add(m[1]); });

function getVars(tabFile) {
    let content = fs.readFileSync(tabFile, 'utf8');
    const usedInTab = Array.from(declarations).filter(v => {
        const regex = new RegExp(`\\b${v}\\b`);
        return regex.test(content);
    });
    const toRemove = ['React', 'motion', 'AnimatePresence', 'useState', 'useEffect'];
    return usedInTab.filter(v => !toRemove.includes(v));
}

console.log("ContentTab:", getVars('src/ContentTab.tsx').join(', '));
console.log("CalendarTab:", getVars('src/CalendarTab.tsx').join(', '));
console.log("CompetitorTab:", getVars('src/CompetitorTab.tsx').join(', '));
console.log("InboxTab:", getVars('src/InboxTab.tsx').join(', '));
