const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { useAuth }')) {
    content = content.replace('import { Header, NavBar, FilterBar, Sidebar, BottomBar }', 'import { useAuth } from "./contexts/AuthContext";\nimport { Header, NavBar, FilterBar, Sidebar, BottomBar }');
}

fs.writeFileSync('src/App.tsx', content);
