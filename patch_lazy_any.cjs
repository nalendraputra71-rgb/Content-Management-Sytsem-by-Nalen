const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Replace lazy with regular imports, or cast them to any
content = content.replace(/const (\w+) = lazy\(\(\) => import\("([^"]+)"\)\.then\(m => \(\{(?: default:)? m\.\1 \}\)\)\);/g, 'const $1: any = lazy(() => import("$2").then(m => ({ default: m.$1 })));');

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
