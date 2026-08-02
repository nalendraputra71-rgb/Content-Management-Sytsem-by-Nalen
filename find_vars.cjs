const fs = require('fs');
let content = fs.readFileSync('src/DashboardTab.tsx', 'utf8');

// Quick and dirty way to find missing variables:
// We can just dump a list of all variables declared in SocialStudioView
let social = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');
const declarations = [];
const stateMatches = [...social.matchAll(/const \[([a-zA-Z0-9_]+), ([a-zA-Z0-9_]+)\] = useState/g)];
stateMatches.forEach(m => { declarations.push(m[1]); declarations.push(m[2]); });

const otherMatches = [...social.matchAll(/const ([a-zA-Z0-9_]+) = /g)];
otherMatches.forEach(m => { declarations.push(m[1]); });

const functionMatches = [...social.matchAll(/function ([a-zA-Z0-9_]+)/g)];
functionMatches.forEach(m => { declarations.push(m[1]); });

const usedInDashboard = declarations.filter(v => content.includes(v));

console.log("Used variables:");
console.log(usedInDashboard.join(', '));
