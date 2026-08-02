const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find Dashboard function
const dashStart = content.indexOf('export function Dashboard({');
const publicViewStart = content.indexOf('function PublicView() {');

let dashContent = content.substring(dashStart, publicViewStart);
// Dashboard might need many imports, so we will just create a new file with all imports from App.tsx, then dashContent.
let imports = content.substring(0, content.indexOf('export default function App() {'));

fs.writeFileSync('src/layouts/MainLayout.tsx', imports + '\n' + dashContent);

// Remove Dashboard from App.tsx
content = content.substring(0, dashStart) + '\n' + content.substring(publicViewStart);
fs.writeFileSync('src/App.tsx', content);
