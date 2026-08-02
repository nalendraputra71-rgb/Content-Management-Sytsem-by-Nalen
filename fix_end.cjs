const fs = require('fs');
let code = fs.readFileSync('src/DashboardTab.tsx', 'utf8');

const match = code.indexOf('</motion.div>');
if (match !== -1) {
    const start = code.substring(0, match + '</motion.div>'.length);
    fs.writeFileSync('src/DashboardTab.tsx', start + '\n  );\n}\n');
}
