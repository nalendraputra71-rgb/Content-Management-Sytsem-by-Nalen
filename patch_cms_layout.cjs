const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace('function CMSLayout({', 'export function CMSLayout({');
fs.writeFileSync('src/App.tsx', appContent);

let routesContent = fs.readFileSync('src/AppRoutes.tsx', 'utf8');
routesContent = routesContent.replace(/function CMSLayout\([\s\S]*?\}[\s\S]*?\}/, '');
routesContent = routesContent.replace('import { Dashboard } from "./App";', 'import { Dashboard, CMSLayout } from "./App";');
fs.writeFileSync('src/AppRoutes.tsx', routesContent);
