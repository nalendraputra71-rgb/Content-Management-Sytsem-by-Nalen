import fs from 'fs';
let s = fs.readFileSync('src/SocHubView.tsx', 'utf8');

// The basic pattern is `const unsub = onSnapshot(..., (snap) => { ... });`
// Or `const unsub = onSnapshot(..., (docSnap) => { ... });`
s = s.replace(/onSnapshot\(([^,]+),\s*\((snap|docSnap)\)\s*=>\s*\{([\s\S]*?)\}\);/g, `onSnapshot($1, ($2) => {$3}, (error) => { console.error("Snapshot error on", "$1", error); });`);

fs.writeFileSync('src/SocHubView.tsx', s);
console.log("Done");
